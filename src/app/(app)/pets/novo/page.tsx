import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { PetForm } from "../PetForm";

export default async function NovoPetPage({ searchParams }: { searchParams: { tutorId?: string } }) {
  const tutors = await prisma.tutor.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <PageHeader title="Novo pet" description="Cadastre um novo animal" />
      <PetForm initial={searchParams.tutorId ? { tutorId: searchParams.tutorId, species: "Cao" } : undefined} tutors={tutors} />
    </>
  );
}
