import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = await req.json();
  const { petId, name, type, startDate, notes } = b;

  if (!petId || !name || !type || !startDate) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: petId, tutor: { tenantId: ctx.tenantId } },
    include: { tutor: true },
  });
  if (!pet) return NextResponse.json({ error: "Pet nao encontrado" }, { status: 404 });

  const protocol = await prisma.protocol.create({
    data: {
      petId,
      name,
      type,
      startDate: new Date(startDate),
      notes: notes || null,
      status: "ATIVO",
    },
  });

  const applicationsData: { doseNumber: number; plannedDate: Date; status: string }[] = [];
  const start = new Date(startDate);

  if (type === "VACINA") {
    // 3 doses com intervalo de 30 dias
    for (let i = 1; i <= 3; i++) {
      const plannedDate = new Date(start);
      plannedDate.setDate(start.getDate() + (i - 1) * 30);
      applicationsData.push({
        doseNumber: i,
        plannedDate,
        status: "PENDENTE",
      });
    }
  } else if (type === "VERMIFUGO") {
    // 2 doses com intervalo de 15 dias
    for (let i = 1; i <= 2; i++) {
      const plannedDate = new Date(start);
      plannedDate.setDate(start.getDate() + (i - 1) * 15);
      applicationsData.push({
        doseNumber: i,
        plannedDate,
        status: "PENDENTE",
      });
    }
  } else if (type === "TRATAMENTO") {
    // 5 doses semanais
    for (let i = 1; i <= 5; i++) {
      const plannedDate = new Date(start);
      plannedDate.setDate(start.getDate() + (i - 1) * 7);
      applicationsData.push({
        doseNumber: i,
        plannedDate,
        status: "PENDENTE",
      });
    }
  } else {
    // OUTRO: 1 dose única no dia inicial
    applicationsData.push({
      doseNumber: 1,
      plannedDate: start,
      status: "PENDENTE",
    });
  }

  await prisma.protocolApplication.createMany({
    data: applicationsData.map((a) => ({
      protocolId: protocol.id,
      doseNumber: a.doseNumber,
      plannedDate: a.plannedDate,
      status: a.status,
    })),
  });

  // Criar notificação interna
  await prisma.notification.create({
    data: {
      tenantId: ctx.tenantId,
      title: "Novo Protocolo Ativo",
      message: `Protocolo "${name}" (${type}) iniciado para o pet ${pet.name}.`,
    },
  });

  // Enviar e-mail para o tutor se disponível
  if (pet.tutor.email) {
    const emailHtml = `
      <h2>Olá, ${pet.tutor.name}!</h2>
      <p>Um novo protocolo de saúde de tipo <strong>${type}</strong> foi iniciado para o seu pet <strong>${pet.name}</strong>.</p>
      <p><strong>Nome do Protocolo:</strong> ${name}</p>
      <p><strong>Total de Doses:</strong> ${applicationsData.length}</p>
      <p>Enviaremos lembretes nas datas de aplicação das próximas doses.</p>
      <p>Atenciosamente,<br/>Equipe BilyVet</p>
    `;
    await sendEmail({
      to: pet.tutor.email,
      subject: `Novo protocolo de saúde iniciado para ${pet.name} - BilyVet`,
      html: emailHtml,
    }).catch(err => console.error("Erro ao enviar email de protocolo:", err));
  }

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "CREATE",
      entity: "Protocol",
      entityId: protocol.id,
      details: name,
    },
  });

  return NextResponse.json(protocol);
}

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const { searchParams } = new URL(req.url);
  const petId = searchParams.get("petId");

  const where: any = { pet: { tutor: { tenantId: ctx.tenantId } } };
  if (petId) where.petId = petId;

  const list = await prisma.protocol.findMany({
    where,
    include: { pet: { include: { tutor: true } }, applications: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(list);
}
