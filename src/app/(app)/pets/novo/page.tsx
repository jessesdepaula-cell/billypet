import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { PetForm } from "../PetForm";

export const dynamic = "force-dynamic";

export default async function NovoPetPage({ searchParams }: { searchParams: { tutorId?: string } }) {
  const { tenantId } = await requireTenant();
  const tutors = await prisma.tutor.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <PageHeader title="Novo pet" description="Cadastre um novo animal" />
      <PetForm initial={searchParams.tutorId ? { tutorId: searchParams.tutorId, species: "Cao" } : undefined} tutors={tutors} />
    </>
  );
}
