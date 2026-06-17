import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { EsteiraBoard } from "./EsteiraBoard";

export const dynamic = "force-dynamic";

export default async function EsteiraPage() {
  const { tenantId } = await requireModule("esteira");
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  
  const [cards, statuses] = await Promise.all([
    prisma.appointment.findMany({
      where: { unit: { tenantId }, scheduledAt: { gte: start, lte: end } },
      include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.appointmentStatus.findMany({
      where: { tenantId, isActive: true },
      orderBy: { position: "asc" },
    }),
  ]);

  // Se o tenant não possuir status, semeia
  let activeStatuses = statuses;
  if (activeStatuses.length === 0) {
    const defaults = [
      { tenantId, name: "AGENDADO", color: "#3b82f6", position: 0 },
      { tenantId, name: "CONFIRMADO", color: "#10b981", position: 1 },
      { tenantId, name: "EM_ATENDIMENTO", color: "#f59e0b", position: 2 },
      { tenantId, name: "FINALIZADO", color: "#22c55e", position: 3 },
      { tenantId, name: "CANCELADO", color: "#ef4444", position: 4 },
      { tenantId, name: "NAO_COMPARECEU", color: "#64748b", position: 5 },
    ];
    await prisma.appointmentStatus.createMany({ data: defaults });
    activeStatuses = await prisma.appointmentStatus.findMany({
      where: { tenantId, isActive: true },
      orderBy: { position: "asc" },
    });
  }

  return (
    <>
      <PageHeader title="Esteira de atendimento" description="Acompanhe o fluxo do dia em kanban" tutorialSlug="esteira" />
      <EsteiraBoard cards={cards as any} statuses={activeStatuses} />
    </>
  );
}
