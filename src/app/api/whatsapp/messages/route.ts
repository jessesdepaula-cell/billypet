import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { sendText, instanceNameForTenant } from "@/lib/whatsapp/evolution";

function normalizePhone(p: string): string {
  let digits = p.replace(/\D/g, "");
  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
    digits = `55${digits}`;
  }
  return digits;
}

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { tenantId } = ctx;
  const { searchParams } = new URL(req.url);
  const chatPhone = searchParams.get("phone");

  try {
    // Se foi passado um telefone especifico, retorna o historico de mensagens dessa conversa
    if (chatPhone) {
      const cleanPhone = normalizePhone(chatPhone);
      const messages = await prisma.whatsappMessage.findMany({
        where: { tenantId, phone: cleanPhone },
        orderBy: { createdAt: "asc" },
        take: 150,
      });

      // Marcar mensagens recebidas como lidas
      await prisma.whatsappMessage.updateMany({
        where: { tenantId, phone: cleanPhone, direction: "IN", readAt: null },
        data: { readAt: new Date() },
      });

      // Busca informacoes do contato ou tutor associado
      const [operatorContact, tutor] = await Promise.all([
        prisma.whatsappContact.findUnique({
          where: { tenantId_phone: { tenantId, phone: cleanPhone } },
        }),
        prisma.tutor.findFirst({
          where: { tenantId, OR: [{ phone: cleanPhone }, { whatsapp: cleanPhone }] },
          include: { pets: { select: { id: true, name: true, species: true } } },
        }),
      ]);

      return NextResponse.json({
        phone: cleanPhone,
        messages,
        contactInfo: {
          name: operatorContact?.name ?? tutor?.name ?? null,
          role: operatorContact?.role ?? (tutor ? "CLIENT" : "UNKNOWN"),
          pets: tutor?.pets ?? [],
          isOperator: Boolean(operatorContact?.active),
        },
      });
    }

    // Lista de conversas ativas (agrupadas por telefone)
    const recentMessages = await prisma.whatsappMessage.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const conversationMap = new Map<string, {
      phone: string;
      pushName: string | null;
      lastMessage: string;
      lastMessageAt: Date;
      direction: string;
      actor: string;
      unreadCount: number;
    }>();

    for (const msg of recentMessages) {
      if (!conversationMap.has(msg.phone)) {
        conversationMap.set(msg.phone, {
          phone: msg.phone,
          pushName: msg.pushName ?? null,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          direction: msg.direction,
          actor: msg.actor,
          unreadCount: 0,
        });
      }

      if (msg.direction === "IN" && !msg.readAt) {
        const item = conversationMap.get(msg.phone)!;
        item.unreadCount += 1;
      }
    }

    const conversationsList = Array.from(conversationMap.values());

    // Cruzar com os nomes cadastrados de tutores e operadores
    const phones = conversationsList.map((c) => c.phone);
    const [operatorContacts, tutors] = await Promise.all([
      prisma.whatsappContact.findMany({
        where: { tenantId, phone: { in: phones } },
      }),
      prisma.tutor.findMany({
        where: {
          tenantId,
          OR: [{ phone: { in: phones } }, { whatsapp: { in: phones } }],
        },
        select: { name: true, phone: true, whatsapp: true },
      }),
    ]);

    const opMap = new Map(operatorContacts.map((c) => [c.phone, c]));
    const tutorMap = new Map<string, string>();
    for (const t of tutors) {
      if (t.phone) tutorMap.set(t.phone.replace(/\D/g, ""), t.name);
      if (t.whatsapp) tutorMap.set(t.whatsapp.replace(/\D/g, ""), t.name);
    }

    const conversations = conversationsList.map((c) => {
      const op = opMap.get(c.phone);
      const tutorName = tutorMap.get(c.phone);
      const displayName = op?.name ?? tutorName ?? c.pushName ?? c.phone;
      const role = op ? `EQUIPE (${op.role})` : tutorName ? "CLIENTE" : "DESCONHECIDO";

      return {
        ...c,
        displayName,
        role,
        isOperator: Boolean(op),
      };
    });

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[whatsapp/messages] erro:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao carregar mensagens" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { tenantId } = ctx;
  const instanceName = instanceNameForTenant(tenantId);

  try {
    const body = await req.json();
    const { phone, text } = body;

    if (!phone || !text?.trim()) {
      return NextResponse.json({ error: "Telefone e mensagem sao obrigatorios" }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);

    // Envia a mensagem pelo WhatsApp
    const sendRes = await sendText(instanceName, cleanPhone, text.trim());

    if (!sendRes.ok) {
      return NextResponse.json(
        { error: `Falha ao enviar mensagem pelo WhatsApp (${sendRes.status})` },
        { status: 500 }
      );
    }

    // Registra a mensagem enviada pelo humano no banco
    const createdMsg = await prisma.whatsappMessage.create({
      data: {
        tenantId,
        phone: cleanPhone,
        direction: "OUT",
        actor: "HUMAN",
        kind: "TEXT",
        content: text.trim(),
      },
    });

    return NextResponse.json({ ok: true, message: createdMsg });
  } catch (err) {
    console.error("[whatsapp/messages POST] erro:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao enviar mensagem" },
      { status: 500 }
    );
  }
}
