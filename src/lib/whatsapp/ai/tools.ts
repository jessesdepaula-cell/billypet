/**
 * Ferramentas (function-calling) que a IA usa para ALIMENTAR o sistema a partir
 * das mensagens do WhatsApp. O `tenantId` e SEMPRE fixado pelo servidor — a IA
 * nunca escolhe a assinatura, o que garante o isolamento entre assinantes.
 *
 * Dois conjuntos de ferramentas:
 *  - OPERATOR: numero cadastrado (dono/equipe). Alimenta o sistema.
 *  - CLIENT:   numero desconhecido (tutor do pet). Atendimento: consulta
 *              servicos/precos, se cadastra e agenda. Nunca escreve prontuario.
 */
import { prisma } from "@/lib/db";

import type { ToolDef } from "../openai";

export type ToolMode = "OPERATOR" | "CLIENT";

export type ToolContext = {
  tenantId: string;
  unitId: string;
  /** User responsavel pelos registros (vet). Resolvido a partir do contato. */
  responsibleUserId?: string | null;
  /** Telefone de quem esta falando (usado no modo CLIENT para se auto-cadastrar). */
  phone: string;
  /** Nome do perfil do WhatsApp, quando disponivel. */
  pushName?: string | null;
};

/** So digitos. */
function digits(raw: string): string {
  return (raw || "").replace(/\D/g, "");
}

/** Data ISO -> Date. Sem valor, usa agora. */
function parseDate(value?: unknown): Date {
  if (!value) return new Date();
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

const TIPOS_AGENDAMENTO = ["CONSULTA", "RETORNO", "BANHO_TOSA", "EXAME", "PROCEDIMENTO"];

// --------------------------------------------------------------------------
// Definicoes expostas ao modelo
// --------------------------------------------------------------------------
const FIND_TUTOR: ToolDef = {
  type: "function",
  function: {
    name: "find_tutor",
    description:
      "Busca tutores (clientes) desta clinica por nome, telefone ou CPF. Use SEMPRE para descobrir o id do tutor antes de cadastrar um pet ou agendar. Retorna uma lista com os pets de cada um.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Nome, telefone ou documento do tutor." },
      },
      required: ["query"],
    },
  },
};

const CREATE_TUTOR: ToolDef = {
  type: "function",
  function: {
    name: "create_tutor",
    description:
      "Cadastra um novo tutor (cliente). Use apenas depois de conferir com find_tutor que ele ainda nao existe.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nome completo do tutor." },
        phone: { type: "string", description: "Telefone/WhatsApp com DDD." },
        email: { type: "string" },
        document: { type: "string", description: "CPF/CNPJ." },
        address: { type: "string" },
        notes: { type: "string" },
      },
      required: ["name"],
    },
  },
};

const FIND_PET: ToolDef = {
  type: "function",
  function: {
    name: "find_pet",
    description:
      "Busca pets desta clinica por nome do pet, nome do tutor ou microchip. Use SEMPRE para descobrir o id do pet antes de registrar vacina, peso ou prontuario.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Nome do pet, do tutor ou microchip." },
      },
      required: ["query"],
    },
  },
};

const CREATE_PET: ToolDef = {
  type: "function",
  function: {
    name: "create_pet",
    description:
      "Cadastra um novo pet vinculado a um tutor existente. Use find_tutor antes para obter o tutorId.",
    parameters: {
      type: "object",
      properties: {
        tutorId: { type: "string", description: "id do tutor (use find_tutor antes)." },
        name: { type: "string" },
        species: {
          type: "string",
          description: "Especie: Cao, Gato, Ave, Roedor, Reptil ou Outro.",
        },
        breed: { type: "string", description: "Raca." },
        sex: { type: "string", enum: ["M", "F"] },
        birthDate: { type: "string", description: "Nascimento ISO (YYYY-MM-DD)." },
        weightKg: { type: "number" },
        color: { type: "string" },
        neutered: { type: "boolean", description: "Castrado?" },
        notes: { type: "string" },
        medicalAlert: {
          type: "string",
          description: "Alerta medico importante (alergia, condicao cronica).",
        },
      },
      required: ["tutorId", "name", "species"],
    },
  },
};

const LIST_SERVICES: ToolDef = {
  type: "function",
  function: {
    name: "list_services",
    description:
      "Lista os servicos ativos da clinica com preco e duracao. Use SEMPRE que precisar informar preco — nunca invente valores.",
    parameters: { type: "object", properties: {} },
  },
};

const CREATE_APPOINTMENT: ToolDef = {
  type: "function",
  function: {
    name: "create_appointment",
    description:
      "Agenda um atendimento. Precisa do tutorId (use find_tutor) e da data/hora. Informe petId quando souber qual pet.",
    parameters: {
      type: "object",
      properties: {
        tutorId: { type: "string" },
        petId: { type: "string" },
        scheduledAt: {
          type: "string",
          description: "Data e hora ISO com fuso de Brasilia, ex: 2026-07-20T15:00:00-03:00.",
        },
        type: {
          type: "string",
          enum: TIPOS_AGENDAMENTO,
          description: "Tipo do atendimento.",
        },
        notes: { type: "string" },
      },
      required: ["tutorId", "scheduledAt", "type"],
    },
  },
};

const LIST_APPOINTMENTS: ToolDef = {
  type: "function",
  function: {
    name: "list_appointments",
    description: "Lista os atendimentos agendados em um dia especifico da clinica.",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "Dia ISO (YYYY-MM-DD). Padrao hoje." },
      },
    },
  },
};

const APPLY_VACCINE: ToolDef = {
  type: "function",
  function: {
    name: "apply_vaccine",
    description: "Registra a aplicacao de uma vacina em um pet.",
    parameters: {
      type: "object",
      properties: {
        petId: { type: "string", description: "id do pet (use find_pet antes)." },
        name: { type: "string", description: "Nome da vacina (ex: V10, Antirrabica)." },
        appliedAt: { type: "string", description: "Data ISO da aplicacao. Padrao hoje." },
        nextDose: { type: "string", description: "Data ISO da proxima dose (opcional)." },
        batch: { type: "string", description: "Lote." },
        notes: { type: "string" },
      },
      required: ["petId", "name"],
    },
  },
};

const REGISTER_WEIGHT: ToolDef = {
  type: "function",
  function: {
    name: "register_weight",
    description: "Registra o peso de um pet e atualiza o peso atual do cadastro.",
    parameters: {
      type: "object",
      properties: {
        petId: { type: "string" },
        weightKg: { type: "number" },
        note: { type: "string" },
      },
      required: ["petId", "weightKg"],
    },
  },
};

const ADD_MEDICAL_RECORD: ToolDef = {
  type: "function",
  function: {
    name: "add_medical_record",
    description:
      "Registra um prontuario (ficha clinica) de um pet. Cria automaticamente o atendimento finalizado correspondente. Use quando o veterinario ditar o que foi feito na consulta.",
    parameters: {
      type: "object",
      properties: {
        petId: { type: "string", description: "id do pet (use find_pet antes)." },
        complaint: { type: "string", description: "Queixa principal." },
        anamnesis: { type: "string", description: "Anamnese / historico relatado." },
        physicalExam: { type: "string", description: "Exame fisico." },
        weightKg: { type: "number" },
        diagnosis: { type: "string" },
        conduct: { type: "string", description: "Conduta / tratamento indicado." },
        procedures: { type: "string", description: "Procedimentos realizados." },
        observations: { type: "string" },
        recommendReturn: { type: "string", description: "Data ISO do retorno recomendado." },
      },
      required: ["petId"],
    },
  },
};

/** Ferramentas por modo. */
export function toolsFor(mode: ToolMode): ToolDef[] {
  if (mode === "CLIENT") {
    // O cliente nunca escreve prontuario/vacina. Ele consulta, se cadastra e agenda.
    return [LIST_SERVICES, FIND_TUTOR, CREATE_TUTOR, CREATE_APPOINTMENT];
  }
  return [
    FIND_TUTOR,
    CREATE_TUTOR,
    FIND_PET,
    CREATE_PET,
    LIST_SERVICES,
    CREATE_APPOINTMENT,
    LIST_APPOINTMENTS,
    APPLY_VACCINE,
    REGISTER_WEIGHT,
    ADD_MEDICAL_RECORD,
  ];
}

// --------------------------------------------------------------------------
// Dispatch
// --------------------------------------------------------------------------
type Args = Record<string, unknown>;

/**
 * Resolve o User que assina os registros clinicos. Prefere o usuario vinculado
 * ao contato; senao, cai para um veterinario/admin ativo da assinatura.
 */
async function resolveVetUserId(ctx: ToolContext): Promise<string | null> {
  if (ctx.responsibleUserId) {
    const u = await prisma.user.findFirst({
      where: { id: ctx.responsibleUserId, tenantId: ctx.tenantId, isActive: true },
      select: { id: true },
    });
    if (u) return u.id;
  }
  const fallback = await prisma.user.findFirst({
    where: {
      tenantId: ctx.tenantId,
      isActive: true,
      role: { in: ["VETERINARIO", "ADMIN", "GESTOR"] },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  return fallback?.id ?? null;
}

/** Garante que o pet pertence a esta assinatura (isolamento). */
async function petOfTenant(tenantId: string, petId: string) {
  return prisma.pet.findFirst({
    where: { id: petId, tutor: { tenantId } },
    include: { tutor: { select: { id: true, name: true } } },
  });
}

export async function dispatchTool(
  name: string,
  args: Args,
  ctx: ToolContext,
  mode: ToolMode,
): Promise<unknown> {
  const { tenantId, unitId } = ctx;

  // Barreira dura: no modo CLIENT so as ferramentas de atendimento existem.
  const allowed = new Set(toolsFor(mode).map((t) => t.function.name));
  if (!allowed.has(name)) {
    return { ok: false, error: "Ferramenta nao disponivel neste contexto." };
  }

  switch (name) {
    case "find_tutor": {
      const q = String(args.query ?? "").trim();
      if (!q) return { ok: false, error: "Informe um termo de busca." };
      const rows = await prisma.tutor.findMany({
        where: {
          tenantId,
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: digits(q) || q } },
            { whatsapp: { contains: digits(q) || q } },
            { document: { contains: q } },
          ],
        },
        include: { pets: { where: { isActive: true }, select: { id: true, name: true, species: true } } },
        take: 8,
      });
      return rows.map((t) => ({
        id: t.id,
        nome: t.name,
        telefone: t.phone ?? t.whatsapp,
        pets: t.pets.map((p) => ({ id: p.id, nome: p.name, especie: p.species })),
      }));
    }

    case "create_tutor": {
      const nome = String(args.name ?? "").trim();
      if (!nome) return { ok: false, error: "Nome do tutor e obrigatorio." };
      // No modo CLIENT o telefone e sempre o de quem esta falando.
      const phone = mode === "CLIENT" ? ctx.phone : digits(String(args.phone ?? ""));
      const tutor = await prisma.tutor.create({
        data: {
          tenantId,
          name: nome,
          phone: phone || null,
          whatsapp: phone || null,
          email: args.email ? String(args.email) : null,
          document: args.document ? String(args.document) : null,
          address: args.address ? String(args.address) : null,
          notes: args.notes ? String(args.notes) : null,
        },
      });
      return { ok: true, id: tutor.id, nome: tutor.name };
    }

    case "find_pet": {
      const q = String(args.query ?? "").trim();
      if (!q) return { ok: false, error: "Informe um termo de busca." };
      const rows = await prisma.pet.findMany({
        where: {
          tutor: { tenantId },
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { microchip: { contains: q } },
            { tutor: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { tutor: { select: { id: true, name: true } } },
        take: 8,
      });
      return rows.map((p) => ({
        id: p.id,
        nome: p.name,
        especie: p.species,
        raca: p.breed,
        sexo: p.sex,
        pesoKg: p.weightKg,
        tutorId: p.tutor.id,
        tutor: p.tutor.name,
        alertaMedico: p.medicalAlert,
      }));
    }

    case "create_pet": {
      const tutorId = String(args.tutorId ?? "");
      const tutor = await prisma.tutor.findFirst({ where: { id: tutorId, tenantId } });
      if (!tutor) return { ok: false, error: "Tutor nao encontrado nesta clinica." };
      const pet = await prisma.pet.create({
        data: {
          tutorId,
          name: String(args.name ?? "").trim(),
          species: String(args.species ?? "Outro"),
          breed: args.breed ? String(args.breed) : null,
          sex: args.sex === "M" || args.sex === "F" ? String(args.sex) : null,
          birthDate: args.birthDate ? parseDate(args.birthDate) : null,
          weightKg: args.weightKg != null ? Number(args.weightKg) : null,
          color: args.color ? String(args.color) : null,
          neutered: typeof args.neutered === "boolean" ? args.neutered : null,
          notes: args.notes ? String(args.notes) : null,
          medicalAlert: args.medicalAlert ? String(args.medicalAlert) : null,
        },
      });
      return { ok: true, id: pet.id, nome: pet.name, tutor: tutor.name };
    }

    case "list_services": {
      const rows = await prisma.service.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: "asc" },
        take: 60,
      });
      return rows.map((s) => ({
        id: s.id,
        nome: s.name,
        categoria: s.category,
        preco: s.price,
        duracaoMin: s.durationMinutes,
      }));
    }

    case "create_appointment": {
      const tutorId = String(args.tutorId ?? "");
      const tutor = await prisma.tutor.findFirst({ where: { id: tutorId, tenantId } });
      if (!tutor) return { ok: false, error: "Tutor nao encontrado nesta clinica." };

      let petId: string | null = null;
      if (args.petId) {
        const pet = await petOfTenant(tenantId, String(args.petId));
        if (!pet) return { ok: false, error: "Pet nao encontrado nesta clinica." };
        if (pet.deceased) return { ok: false, error: "Este pet consta como obito no sistema." };
        petId = pet.id;
      }

      const tipo = TIPOS_AGENDAMENTO.includes(String(args.type))
        ? String(args.type)
        : "CONSULTA";

      const appt = await prisma.appointment.create({
        data: {
          unitId,
          tutorId,
          petId,
          scheduledAt: parseDate(args.scheduledAt),
          type: tipo,
          status: "AGENDADO",
          notes: args.notes ? String(args.notes) : null,
        },
      });
      return {
        ok: true,
        id: appt.id,
        quando: appt.scheduledAt.toISOString(),
        tipo: appt.type,
        tutor: tutor.name,
      };
    }

    case "list_appointments": {
      const base = args.date ? parseDate(args.date) : new Date();
      const start = new Date(base);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const rows = await prisma.appointment.findMany({
        where: {
          unit: { tenantId },
          scheduledAt: { gte: start, lt: end },
          status: { notIn: ["CANCELADO"] },
        },
        include: {
          tutor: { select: { name: true } },
          pet: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 60,
      });
      return rows.map((a) => ({
        id: a.id,
        hora: a.scheduledAt.toISOString(),
        tipo: a.type,
        status: a.status,
        tutor: a.tutor.name,
        pet: a.pet?.name ?? null,
      }));
    }

    case "apply_vaccine": {
      const pet = await petOfTenant(tenantId, String(args.petId ?? ""));
      if (!pet) return { ok: false, error: "Pet nao encontrado nesta clinica." };
      const vac = await prisma.vaccine.create({
        data: {
          petId: pet.id,
          name: String(args.name ?? "").trim(),
          appliedAt: parseDate(args.appliedAt),
          nextDose: args.nextDose ? parseDate(args.nextDose) : null,
          batch: args.batch ? String(args.batch) : null,
          notes: args.notes ? String(args.notes) : null,
        },
      });
      return { ok: true, id: vac.id, pet: pet.name, vacina: vac.name };
    }

    case "register_weight": {
      const pet = await petOfTenant(tenantId, String(args.petId ?? ""));
      if (!pet) return { ok: false, error: "Pet nao encontrado nesta clinica." };
      const peso = Number(args.weightKg);
      if (!Number.isFinite(peso) || peso <= 0) {
        return { ok: false, error: "Peso invalido." };
      }
      await prisma.weightRecord.create({
        data: {
          petId: pet.id,
          weightKg: peso,
          source: "MANUAL",
          note: args.note ? String(args.note) : null,
        },
      });
      await prisma.pet.update({ where: { id: pet.id }, data: { weightKg: peso } });
      return { ok: true, pet: pet.name, pesoKg: peso };
    }

    case "add_medical_record": {
      const pet = await petOfTenant(tenantId, String(args.petId ?? ""));
      if (!pet) return { ok: false, error: "Pet nao encontrado nesta clinica." };

      const vetId = await resolveVetUserId(ctx);
      if (!vetId) {
        return {
          ok: false,
          error:
            "Nenhum veterinario ativo cadastrado para assinar o prontuario. Cadastre um usuario veterinario no sistema.",
        };
      }

      // O prontuario pertence a um atendimento. Cria o atendimento ja finalizado.
      const appt = await prisma.appointment.create({
        data: {
          unitId,
          tutorId: pet.tutor.id,
          petId: pet.id,
          vetId,
          scheduledAt: new Date(),
          type: "CONSULTA",
          status: "FINALIZADO",
          pipelineStage: "FINALIZADO",
          notes: "Registrado via WhatsApp (IA)",
        },
      });

      const rec = await prisma.medicalRecord.create({
        data: {
          appointmentId: appt.id,
          petId: pet.id,
          vetId,
          complaint: args.complaint ? String(args.complaint) : null,
          anamnesis: args.anamnesis ? String(args.anamnesis) : null,
          physicalExam: args.physicalExam ? String(args.physicalExam) : null,
          weightKg: args.weightKg != null ? Number(args.weightKg) : null,
          diagnosis: args.diagnosis ? String(args.diagnosis) : null,
          conduct: args.conduct ? String(args.conduct) : null,
          procedures: args.procedures ? String(args.procedures) : null,
          observations: args.observations ? String(args.observations) : null,
          recommendReturn: args.recommendReturn ? parseDate(args.recommendReturn) : null,
        },
      });

      // Peso ditado no prontuario tambem alimenta o historico do pet.
      if (args.weightKg != null && Number.isFinite(Number(args.weightKg))) {
        const peso = Number(args.weightKg);
        await prisma.weightRecord.create({
          data: { petId: pet.id, weightKg: peso, source: "ATENDIMENTO", appointmentId: appt.id },
        });
        await prisma.pet.update({ where: { id: pet.id }, data: { weightKg: peso } });
      }

      return { ok: true, id: rec.id, pet: pet.name, atendimentoId: appt.id };
    }

    default:
      return { ok: false, error: `Ferramenta desconhecida: ${name}` };
  }
}
