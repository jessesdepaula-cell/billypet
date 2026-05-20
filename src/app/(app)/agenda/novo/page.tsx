import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "./AppointmentForm";

export default async function NovoAgendamentoPage({ searchParams }: { searchParams: { date?: string } }) {
  const [tutors, pets, vets, services] = await Promise.all([
    prisma.tutor.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.pet.findMany({ where: { isActive: true }, select: { id: true, name: true, tutorId: true } }),
    prisma.user.findMany({ where: { role: "VETERINARIO", isActive: true }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, price: true } }),
  ]);

  return (
    <>
      <PageHeader title="Novo agendamento" />
      <AppointmentForm tutors={tutors} pets={pets} vets={vets} services={services} initialDate={searchParams.date} />
    </>
  );
}
