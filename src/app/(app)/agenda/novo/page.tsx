import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "./AppointmentForm";

export const dynamic = "force-dynamic";

export default async function NovoAgendamentoPage({ searchParams }: { searchParams: { date?: string } }) {
  const { tenantId } = await requireModule("agenda");
  const [tutors, pets, vets, services, statuses] = await Promise.all([
    prisma.tutor.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.pet.findMany({ where: { tutor: { tenantId } }, select: { id: true, name: true, tutorId: true } }), // Carrega todos os pets (mesmo inativos/óbitos para permitir busca com aviso)
    prisma.user.findMany({ where: { tenantId, role: "VETERINARIO", isActive: true }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, price: true } }),
    prisma.appointmentStatus.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
  ]);

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
