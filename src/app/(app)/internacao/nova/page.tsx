import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { NovaInternacaoForm } from "./Form";

export const dynamic = "force-dynamic";

export default async function NovaInternacaoPage({ searchParams }: { searchParams: { petId?: string } }) {
  const { tenantId } = await requireModule("internacao");
  const [pets, vets] = await Promise.all([
    prisma.pet.findMany({ where: { tutor: { tenantId }, isActive: true }, include: { tutor: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { tenantId, role: "VETERINARIO", isActive: true } }),
  ]);
  return (
    <>
      <PageHeader title="Nova internacao" />
      <NovaInternacaoForm pets={pets.map((p) => ({ id: p.id, label: `${p.name} (${p.tutor.name})` }))} vets={vets} preselectedPetId={searchParams.petId} />
    </>
  );
}
