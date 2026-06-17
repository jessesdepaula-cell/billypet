import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "./AppointmentForm";

export const dynamic = "force-dynamic";

export default async function NovoAgendamentoPage({ searchParams }: { searchParams: { date?: string } }) {
  const { tenantId } = await requireModule("agenda");
  
  const [tutors, pets, collaborators, services, initialStatuses] = await Promise.all([
    prisma.tutor.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.pet.findMany({
      where: { tutor: { tenantId }, isActive: true },
      select: { id: true, name: true, tutorId: true, deceased: true, tutor: { select: { name: true } } },
    }),
    prisma.collaborator.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, role: true } }),
    prisma.service.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, price: true } }),
    prisma.appointmentStatus.findMany({ where: { tenantId, isActive: true }, orderBy: { position: "asc" } }),
  ]);

  let statuses = initialStatuses;
  if (statuses.length === 0) {
    const defaults = [
      { tenantId, name: "AGENDADO", color: "#3b82f6", position: 0 },
      { tenantId, name: "CONFIRMADO", color: "#10b981", position: 1 },
      { tenantId, name: "EM_ATENDIMENTO", color: "#f59e0b", position: 2 },
      { tenantId, name: "FINALIZADO", color: "#22c55e", position: 3 },
      { tenantId, name: "CANCELADO", color: "#ef4444", position: 4 },
      { tenantId, name: "NAO_COMPARECEU", color: "#64748b", position: 5 },
    ];
    await prisma.appointmentStatus.createMany({ data: defaults });
    statuses = await prisma.appointmentStatus.findMany({
      where: { tenantId, isActive: true },
      orderBy: { position: "asc" },
    });
  }

  return (
    <>
      <PageHeader title="Novo agendamento" />
      <AppointmentForm
        tutors={tutors}
        pets={pets as any}
        collaborators={collaborators}
        services={services}
        statuses={statuses}
        initialDate={searchParams.date}
      />
    </>
  );
}
