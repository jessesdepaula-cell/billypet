import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "./AppointmentForm";

export const dynamic = "force-dynamic";

export default async function NovoAgendamentoPage({ searchParams }: { searchParams: { date?: string } }) {
  const { tenantId } = await requireModule("agenda");
  let [tutors, pets, vets, services, statuses] = await Promise.all([
    prisma.tutor.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.pet.findMany({ where: { tutor: { tenantId } }, select: { id: true, name: true, tutorId: true } }), // Carrega todos os pets (mesmo inativos/óbitos para permitir busca com aviso)
    prisma.user.findMany({ where: { tenantId, isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, price: true } }),
    prisma.appointmentStatus.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (statuses.length === 0) {
    const defaultStatuses = [
      { name: "Agendado", color: "slate" },
      { name: "Confirmado", color: "blue" },
      { name: "Em Atendimento", color: "orange" },
      { name: "Finalizado", color: "green" },
      { name: "Cancelado", color: "red" },
      { name: "Nao Compareceu", color: "yellow" },
    ];
    await prisma.appointmentStatus.createMany({
      data: defaultStatuses.map(s => ({
        tenantId,
        name: s.name,
        color: s.color,
        isActive: true
      }))
    });
    statuses = await prisma.appointmentStatus.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } });
  }

  return (
    <>
      <PageHeader title="Novo agendamento" />
      <AppointmentForm
        tutors={tutors}
        pets={pets}
        vets={vets}
        services={services}
        statuses={statuses}
        initialDate={searchParams.date}
      />
    </>
  );
}
