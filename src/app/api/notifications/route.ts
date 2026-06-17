import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  try {
    const upcomingDoses = await prisma.protocolApplication.findMany({
      where: {
        status: "PENDENTE",
        dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        protocol: { tenantId: ctx.tenantId },
      },
      include: { protocol: { include: { pet: { include: { tutor: true } } } } },
    });

    for (const dose of upcomingDoses) {
      const link = `/pets/${dose.protocol.petId}`;
      const title = `Lembrete: ${dose.protocol.name}`;
      const message = `A aplicacao "${dose.notes || "dose"}" para o pet ${dose.protocol.pet.name} esta agendada para ${dose.dueDate.toLocaleDateString("pt-BR")}.`;
      
      const existing = await prisma.notification.findFirst({
        where: {
          tenantId: ctx.tenantId,
          link,
          title,
          dueDate: dose.dueDate,
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            tenantId: ctx.tenantId,
            title,
            message,
            link,
            dueDate: dose.dueDate,
            type: "PROTOCOL_REMINDER",
          },
        });

        if (dose.protocol.pet.tutor.email) {
          const emailSubject = `BillyPet Lembrete: ${dose.protocol.name} para o pet ${dose.protocol.pet.name}`;
          const emailHtml = `
            <h2>Ola, ${dose.protocol.pet.tutor.name}!</h2>
            <p>Lembramos que a aplicacao da dose <strong>${dose.notes || "prevista"}</strong> do protocolo <strong>${dose.protocol.name}</strong> para o seu pet <strong>${dose.protocol.pet.name}</strong> esta agendada para <strong>${dose.dueDate.toLocaleDateString("pt-BR")}</strong>.</p>
            <p>Por favor, entre em contato para agendar o atendimento.</p>
            <br/>
            <p>Equipe BillyPet</p>
          `;
          await sendEmail({
            to: dose.protocol.pet.tutor.email,
            subject: emailSubject,
            html: emailHtml,
          });
        }
      }
    }
  } catch (err) {
    console.error("Erro na auto-verificacao de lembretes:", err);
  }

  const list = await prisma.notification.findMany({
    where: { tenantId: ctx.tenantId, read: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(list);
}
