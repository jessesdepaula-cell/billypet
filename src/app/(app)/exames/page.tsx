import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";
import { ExamsClient } from "./ExamsClient";

export const dynamic = "force-dynamic";

export default async function ExamesPage() {
  const { tenantId } = await requireModule("exames");
  const [exams, pets] = await Promise.all([
    prisma.exam.findMany({ where: { pet: { tutor: { tenantId } } }, include: { pet: { include: { tutor: true } } }, orderBy: { requestedAt: "desc" }, take: 200 }),
    prisma.pet.findMany({ where: { tutor: { tenantId }, isActive: true }, include: { tutor: true }, orderBy: { name: "asc" } }),
  ]);
  const petOpts = pets.map((p) => ({ id: p.id, label: `${p.name} (${p.tutor.name})` }));
  return (
    <>
      <PageHeader title="Exames" description="Solicitar, acompanhar e registrar resultados" tutorialSlug="exames" />
      <ExamsClient
        exams={exams.map((e) => ({ id: e.id, name: e.name, status: e.status, pet: e.pet.name, tutor: e.pet.tutor.name, requestedAt: fmtDateTime(e.requestedAt), result: e.result, resultAt: e.resultAt ? fmtDateTime(e.resultAt) : null }))}
        pets={petOpts}
      />
    </>
  );
}
