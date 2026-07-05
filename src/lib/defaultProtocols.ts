import { prisma } from "@/lib/db";

/**
 * Modelos de protocolo de vacina mais comuns na rotina clinica de caes e gatos.
 * Sao pre-cadastrados por tenant para poupar o assinante de digitar o esquema
 * de doses do zero. O usuario continua livre para editar, excluir ou criar os
 * proprios modelos manualmente.
 *
 * "daysOffset" = dias apos a data de inicio em que a dose deve ser aplicada.
 * Esquemas baseados em protocolos usuais de vacinacao (filhote: 1a dose, reforcos
 * a cada ~21 dias, e revacinacao anual).
 */
export const DEFAULT_PROTOCOL_TEMPLATES: {
  name: string;
  type: string;
  notes: string;
  doses: { name: string; daysOffset: number }[];
}[] = [
  // ---------------- CAES ----------------
  {
    name: "V10 Canina (Dectupla)",
    type: "Vacina",
    notes: "Cao - poliv. (cinomose, parvovirose, hepatite, adenovirose, parainfluenza, leptospirose). Inicio a partir de 45 dias.",
    doses: [
      { name: "1a dose", daysOffset: 0 },
      { name: "2a dose", daysOffset: 21 },
      { name: "3a dose", daysOffset: 42 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  {
    name: "V8 Canina (Octupla)",
    type: "Vacina",
    notes: "Cao - polivalente (cinomose, parvovirose, hepatite, adenovirose, parainfluenza, leptospirose).",
    doses: [
      { name: "1a dose", daysOffset: 0 },
      { name: "2a dose", daysOffset: 21 },
      { name: "3a dose", daysOffset: 42 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  {
    name: "Antirrabica Canina",
    type: "Vacina",
    notes: "Cao - raiva. Dose unica a partir de 12 semanas, com reforco anual.",
    doses: [
      { name: "Dose unica", daysOffset: 0 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  {
    name: "Gripe Canina (Tosse dos Canis)",
    type: "Vacina",
    notes: "Cao - traqueobronquite infecciosa (Bordetella / parainfluenza).",
    doses: [
      { name: "1a dose", daysOffset: 0 },
      { name: "2a dose", daysOffset: 21 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  {
    name: "Giardia Canina",
    type: "Vacina",
    notes: "Cao - giardiase.",
    doses: [
      { name: "1a dose", daysOffset: 0 },
      { name: "2a dose", daysOffset: 21 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  {
    name: "Leishmaniose Canina",
    type: "Vacina",
    notes: "Cao - leishmaniose visceral. Exige teste sorologico negativo antes da 1a dose.",
    doses: [
      { name: "1a dose", daysOffset: 0 },
      { name: "2a dose", daysOffset: 21 },
      { name: "3a dose", daysOffset: 42 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  // ---------------- GATOS ----------------
  {
    name: "V4 Felina (Quadrupla)",
    type: "Vacina",
    notes: "Gato - rinotraqueite, calicivirose, panleucopenia e clamidiose. Inicio a partir de 8 semanas.",
    doses: [
      { name: "1a dose", daysOffset: 0 },
      { name: "2a dose", daysOffset: 21 },
      { name: "3a dose", daysOffset: 42 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  {
    name: "V5 Felina (Quintupla)",
    type: "Vacina",
    notes: "Gato - rinotraqueite, calicivirose, panleucopenia, clamidiose e leucemia felina (FeLV).",
    doses: [
      { name: "1a dose", daysOffset: 0 },
      { name: "2a dose", daysOffset: 21 },
      { name: "3a dose", daysOffset: 42 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  {
    name: "Antirrabica Felina",
    type: "Vacina",
    notes: "Gato - raiva. Dose unica a partir de 12 semanas, com reforco anual.",
    doses: [
      { name: "Dose unica", daysOffset: 0 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
  {
    name: "FeLV (Leucemia Felina)",
    type: "Vacina",
    notes: "Gato - leucemia felina. Recomenda-se teste negativo para FeLV antes da 1a dose.",
    doses: [
      { name: "1a dose", daysOffset: 0 },
      { name: "2a dose", daysOffset: 21 },
      { name: "Reforco anual", daysOffset: 365 },
    ],
  },
];

/**
 * Garante que o tenant tenha os modelos de protocolo de vacina padrao.
 * So cria quando o tenant ainda nao possui nenhum modelo cadastrado, evitando
 * duplicar ou reintroduzir modelos que o usuario tenha ajustado. Segue o mesmo
 * padrao de auto-seed usado para os status de agendamento.
 */
export async function ensureDefaultProtocolTemplates(tenantId: string): Promise<void> {
  const count = await prisma.protocolTemplate.count({ where: { tenantId } });
  if (count > 0) return;

  for (const t of DEFAULT_PROTOCOL_TEMPLATES) {
    await prisma.protocolTemplate.create({
      data: {
        tenantId,
        name: t.name,
        type: t.type,
        notes: t.notes,
        doses: { create: t.doses },
      },
    });
  }
}
