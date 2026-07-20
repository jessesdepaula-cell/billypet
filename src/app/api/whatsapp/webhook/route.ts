import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBase64FromMediaMessage, sendText } from "@/lib/whatsapp/evolution";
import { transcribeAudio } from "@/lib/whatsapp/openai";
import { runAgent } from "@/lib/whatsapp/ai/engine";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (process.env.WHATSAPP_WEBHOOK_SECRET && secret !== process.env.WHATSAPP_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Secret invalido" }, { status: 401 });
    }

    const payload = await req.json();
    const event = payload.event || payload.type;
    const instanceName: string = payload.instance || payload.instanceName || "";

    if (!instanceName) {
      return NextResponse.json({ ok: true, ignored: "Sem instancia" });
    }

    // Busca a conexao e o tenant associados a esta instancia
    const connection = await prisma.whatsappConnection.findFirst({
      where: { instanceName },
      include: { tenant: true },
    });

    if (!connection) {
      return NextResponse.json({ ok: true, ignored: "Instancia nao encontrada" });
    }

    const tenantId = connection.tenantId;

    // 1. Atualizacao de estado da conexao (CONNECTION_UPDATE)
    if (event === "CONNECTION_UPDATE") {
      const state = payload.data?.state || payload.state;
      let newStatus = connection.status;
      if (state === "open") newStatus = "CONNECTED";
      else if (state === "close") newStatus = "DISCONNECTED";
      else if (state === "connecting") newStatus = "CONNECTING";

      await prisma.whatsappConnection.update({
        where: { id: connection.id },
        data: {
          status: newStatus,
          ...(newStatus === "CONNECTED" ? { lastConnectedAt: new Date() } : {}),
        },
      });

      return NextResponse.json({ ok: true, event });
    }

    // 2. Recebimento de mensagens (MESSAGES_UPSERT)
    if (event === "MESSAGES_UPSERT") {
      const data = payload.data || payload;
      const key = data.key || {};
      const fromMe = Boolean(key.fromMe);

      // Se a mensagem foi enviada pelo proprio celular do WhatsApp conectado
      if (fromMe) {
        return NextResponse.json({ ok: true, ignored: "fromMe" });
      }

      const remoteJid: string = key.remoteJid || "";
      if (!remoteJid || remoteJid.includes("@g.us")) {
        // Ignorar grupos ou JID em branco
        return NextResponse.json({ ok: true, ignored: "grupo_ou_vazio" });
      }

      const fromPhone = remoteJid.split("@")[0].replace(/\D/g, "");
      if (!fromPhone) {
        return NextResponse.json({ ok: true, ignored: "telefone_invalido" });
      }

      const pushName: string | undefined = data.pushName || payload.pushName;
      const message = data.message || {};

      let textContent: string | null =
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        null;

      let isAudio = Boolean(message.audioMessage);

      // Transcricao de audio se recebido
      if (isAudio && process.env.OPENAI_API_KEY) {
        try {
          const base64Audio = await getBase64FromMediaMessage(instanceName, message);
          if (base64Audio) {
            const transcribed = await transcribeAudio(base64Audio, message.audioMessage?.mimetype || "audio/ogg");
            if (transcribed) {
              textContent = `[Audio transcrito]: ${transcribed}`;
            }
          }
        } catch (err) {
          console.error("[webhook] erro ao transcrever audio:", err);
        }
      }

      if (!textContent) {
        return NextResponse.json({ ok: true, ignored: "sem_texto" });
      }

      // Verifica se o numero e de um operador cadastrado
      const operatorContact = await prisma.whatsappContact.findFirst({
        where: { tenantId, phone: fromPhone, active: true },
      });

      const mode = operatorContact ? "OPERATOR" : "CLIENT";
      const speakerName = operatorContact?.name ?? pushName ?? null;
      const speakerRole = operatorContact?.role ?? null;
      const responsibleUserId = operatorContact?.userId ?? null;

      // Registra a mensagem recebida no banco
      const incomingMsg = await prisma.whatsappMessage.create({
        data: {
          tenantId,
          contactId: operatorContact?.id ?? null,
          phone: fromPhone,
          pushName: pushName ?? null,
          direction: "IN",
          actor: "CONTACT",
          kind: isAudio ? "AUDIO" : "TEXT",
          content: textContent,
        },
      });

      // Checa se a IA esta ativada para este modo
      const isAiEnabled =
        mode === "OPERATOR" ? connection.aiOperatorEnabled : connection.aiClientEnabled;

      if (!isAiEnabled || !process.env.OPENAI_API_KEY) {
        return NextResponse.json({ ok: true, aiStatus: "disabled", msgId: incomingMsg.id });
      }

      // Busca a unidade principal do tenant para contexto
      const unit = await prisma.unit.findFirst({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: "asc" },
      });

      if (!unit) {
        return NextResponse.json({ ok: true, error: "Unidade nao encontrada" });
      }

      const clinicName = connection.tenant.tradeName || connection.tenant.companyName || "Nossa Clinica";
      const extraPrompt = mode === "OPERATOR" ? connection.operatorPrompt : connection.clientPrompt;

      // Executa o agente de IA
      const agentRes = await runAgent({
        mode,
        tenantId,
        unitId: unit.id,
        clinicName,
        phone: fromPhone,
        speakerName,
        speakerRole,
        responsibleUserId,
        text: textContent,
        extraPrompt,
      });

      if (agentRes.reply) {
        // Registra a resposta da IA no banco
        await prisma.whatsappMessage.create({
          data: {
            tenantId,
            contactId: operatorContact?.id ?? null,
            phone: fromPhone,
            pushName: pushName ?? null,
            direction: "OUT",
            actor: "AI",
            kind: "TEXT",
            content: agentRes.reply,
            toolCalls: agentRes.toolNames,
          },
        });

        // Envia resposta via WhatsApp
        await sendText(instanceName, fromPhone, agentRes.reply);
      }

      return NextResponse.json({ ok: true, processed: true, reply: agentRes.reply });
    }

    return NextResponse.json({ ok: true, unhandledEvent: event });
  } catch (err) {
    console.error("[whatsapp/webhook] erro:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro no webhook" },
      { status: 500 }
    );
  }
}
