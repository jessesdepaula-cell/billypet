import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { EsteiraBoard } from "./EsteiraBoard";

export const dynamic = "force-dynamic";

export default async function EsteiraPage() {
  const { tenantId } = await requireTenant();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const cards = await prisma.appointment.findMany({
    where: { unit: { tenantId }, scheduledAt: { gte: start, lte: end } },
    include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
    orderBy: { scheduledAt: "asc" },
  });
  return (
    <>
      <PageHeader title="Esteira de atendimento" description="Acompanhe o fluxo do dia em kanban" />
      <EsteiraBoard cards={cards as any} />
    </>
  );
}
