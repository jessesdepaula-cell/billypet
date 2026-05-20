import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { EsteiraBoard } from "./EsteiraBoard";

export default async function EsteiraPage() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const cards = await prisma.appointment.findMany({
    where: { scheduledAt: { gte: start, lte: end } },
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
