import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "./AppointmentForm";

export const dynamic = "force-dynamic";

export default async function NovoAgendamentoPage({ searchParams }: { searchParams: { date?: string } }) {
  const { tenantId } = await requireModule("agenda");
  const [tutors, pets, vets, services] = await Promise.all([
    prisma.tutor.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.pet.findMany({ where: { tutor: { tenantId }, isActive: true }, select: { id: true, name: true, tutorId: true } }),
    prisma.user.findMany({ where: { tenantId, role: "VETERINARIO", isActive: true }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, price: true } }),
  ]);

  return (
    <>
      <PageHeader title="Novo agendamento" />
      <AppointmentForm tutors={tutors} pets={pets} vets={vets} services={services} initialDate={searchParams.date} />
    </>
  );
}
