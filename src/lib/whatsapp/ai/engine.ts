/**
 * Motor do agente de IA da assinatura. Recebe uma mensagem (ja transcrita, se
 * veio de audio) e decide o que fazer conforme QUEM esta falando:
 *
 *  - OPERATOR: numero cadastrado (dono/equipe). A IA ALIMENTA o sistema —
 *    cadastra tutor/pet, agenda, registra vacina, peso e prontuario.
 *  - CLIENT:   numero desconhecido (tutor do pet). A IA faz ATENDIMENTO —
 *    tira duvidas, informa precos, cadastra o cliente e agenda.
 *
 * Cada assinatura pode editar o prompt de cada modo.
 */
import { prisma } from "@/lib/db";

import { chat, type ChatMessage } from "../openai";
import { toolsFor, dispatchTool, type ToolContext, type ToolMode } from "./tools";

const MAX_TOOL_ROUNDS = 6;
const HISTORY_LIMIT = 10;

export type RunAgentParams = {
  mode: ToolMode;
  tenantId: string;
  unitId: string;
  clinicName: string;
  phone: string;
  /** Nome de quem fala: contato cadastrado (operador) ou perfil do WhatsApp. */
  speakerName?: string | null;
  /** Papel do contato cadastrado (OWNER/VET/WORKER), so no modo OPERATOR. */
  speakerRole?: string | null;
  responsibleUserId?: string | null;
  text: string;
  /** Prompt extra configurado pela assinatura para este modo. */
  extraPrompt?: string | null;
};

export type RunAgentResult = {
  reply: string;
  toolNames: string[];
};

/** Data de hoje no fuso de Brasilia (UTC-3) em texto pt-BR. */
function todayBrasilia(): string {
  const now = new Date();
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const iso = brt.toISOString().slice(0, 10);
  const hora = brt.toISOString().slice(11, 16);
  return `${dias[brt.getUTCDay()]}, ${iso}, ${hora} (America/Sao_Paulo)`;
}

function operatorPrompt(p: RunAgentParams): string {
  const papel =
    p.speakerRole === "OWNER"
      ? "dono(a) da clinica"
      : p.speakerRole === "VET"
        ? "veterinario(a)"
        : "funcionario(a)";

  return [
    `Voce e a assistente do sistema de gestao veterinaria da clinica "${p.clinicName}".`,
    `Sua funcao e ALIMENTAR o sistema a partir do que a equipe informa por WhatsApp — voce registra dados; voce nao e um chat generico.`,
    `Quem esta falando: ${p.speakerName ?? "equipe"} (${papel}).`,
    `Agora e ${todayBrasilia()}. Quando disserem "hoje/ontem/amanha", calcule a data correspondente. Datas nas ferramentas devem ser ISO; para data e hora use o fuso de Brasilia (ex: 2026-07-20T15:00:00-03:00).`,
    ``,
    `REGRAS:`,
    `- Registre SOMENTE o que foi informado claramente. NUNCA invente dados (peso, vacina, diagnostico, datas). Se faltar algo essencial, PERGUNTE de forma curta antes de registrar.`,
    `- Antes de registrar algo ligado a um pet, use find_pet para achar o id. Se houver mais de um parecido, liste as opcoes e peca confirmacao. Se nao achar, avise.`,
    `- Antes de cadastrar um pet ou agendar, use find_tutor para achar o tutor. So use create_tutor se ele realmente nao existir.`,
    `- Precos: use SEMPRE list_services. Nunca invente valor.`,
    `- Depois de registrar com sucesso, confirme em UMA linha curta comecando com um check, dizendo o que foi salvo (ex.: "Pronto! Vacina V10 registrada para o Thor em 18/07").`,
    `- Se uma ferramenta retornar erro, explique em linguagem simples o que faltou; nao tente de novo com dados inventados.`,
    `- Uma mensagem pode conter varios registros (ex.: pesou e vacinou). Faca todos.`,
    `- Responda sempre em portugues do Brasil, tom direto e objetivo, como no WhatsApp. Sem formalidades longas.`,
    p.extraPrompt ? `\nInstrucoes extras desta clinica:\n${p.extraPrompt}` : ``,
  ].join("\n");
}

function clientPrompt(p: RunAgentParams): string {
  return [
    `Voce e a atendente virtual da clinica veterinaria "${p.clinicName}", falando por WhatsApp com um CLIENTE (tutor de pet).`,
    p.speakerName ? `O cliente se identifica como "${p.speakerName}" no WhatsApp.` : ``,
    `Agora e ${todayBrasilia()}. Para agendar, use o fuso de Brasilia no formato ISO (ex: 2026-07-20T15:00:00-03:00).`,
    ``,
    `O QUE VOCE FAZ:`,
    `- Atende com simpatia, tira duvidas sobre servicos, horarios e precos.`,
    `- Precos e servicos: use SEMPRE list_services. NUNCA invente valores nem prometa preco que dependa de avaliacao.`,
    `- Para agendar: use find_tutor com o telefone do cliente. Se ele nao for cadastrado, pergunte o nome e use create_tutor. Depois use create_appointment.`,
    `- Confirme o agendamento em uma linha curta com data e hora.`,
    ``,
    `LIMITES IMPORTANTES:`,
    `- Voce NUNCA da orientacao clinica, diagnostico, dosagem ou medicacao. Se o cliente relatar sintoma, urgencia ou duvida clinica (dor, sangramento, vomito, intoxicacao, acidente, apatia), acolha com empatia, oriente a procurar a clinica e diga que vai encaminhar para a equipe. NAO tente resolver.`,
    `- Nao invente informacao sobre a clinica (endereco, horario) que voce nao tenha. Se nao souber, diga que a equipe confirma em seguida.`,
    `- Responda sempre em portugues do Brasil, curto e cordial, como no WhatsApp.`,
    p.extraPrompt ? `\nInstrucoes de atendimento desta clinica:\n${p.extraPrompt}` : ``,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Memoria curta da conversa com aquele telefone, dentro da assinatura. */
async function loadHistory(tenantId: string, phone: string): Promise<ChatMessage[]> {
  const rows = await prisma.whatsappMessage.findMany({
    where: { tenantId, phone, kind: { in: ["TEXT", "AUDIO"] } },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  return rows.reverse().map(
    (m): ChatMessage => ({
      role: m.direction === "IN" ? "user" : "assistant",
      content: m.content,
    }),
  );
}

export async function runAgent(params: RunAgentParams): Promise<RunAgentResult> {
  const ctx: ToolContext = {
    tenantId: params.tenantId,
    unitId: params.unitId,
    responsibleUserId: params.responsibleUserId ?? null,
    phone: params.phone,
    speakerName: params.speakerName ?? null,
  } as ToolContext;

  const system =
    params.mode === "OPERATOR" ? operatorPrompt(params) : clientPrompt(params);
  const tools = toolsFor(params.mode);
  const history = await loadHistory(params.tenantId, params.phone);

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: params.text },
  ];

  const toolNames: string[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const result = await chat(messages, tools);

    if (!result.toolCalls.length) {
      return {
        reply:
          result.content?.trim() ||
          (params.mode === "OPERATOR"
            ? "Recebi sua mensagem, mas nao entendi o que registrar. Pode detalhar?"
            : "Desculpe, nao entendi. Pode explicar de outro jeito?"),
        toolNames,
      };
    }

    // Registra a mensagem do assistente com os tool_calls antes das respostas.
    messages.push({
      role: "assistant",
      content: result.content ?? null,
      tool_calls: result.toolCalls,
    });

    for (const call of result.toolCalls) {
      toolNames.push(call.function.name);
      let parsed: Record<string, unknown> = {};
      try {
        parsed = call.function.arguments ? JSON.parse(call.function.arguments) : {};
      } catch {
        parsed = {};
      }

      let toolResult: unknown;
      try {
        toolResult = await dispatchTool(call.function.name, parsed, ctx, params.mode);
      } catch (err) {
        console.error("[whatsapp] tool falhou", call.function.name, err);
        toolResult = {
          ok: false,
          error: err instanceof Error ? err.message : "Falha ao registrar.",
        };
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(toolResult),
      });
    }
  }

  // Excedeu o numero de rodadas — pede a resposta final sem novas ferramentas.
  const finalResult = await chat(messages);
  return {
    reply:
      finalResult.content?.trim() ||
      "Consegui adiantar parte do que voce pediu. Pode confirmar o que faltou?",
    toolNames,
  };
}
