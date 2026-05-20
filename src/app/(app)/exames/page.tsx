import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";
import { ExamsClient } from "./ExamsClient";

export default async function ExamesPage() {
  const [exams, pets] = await Promise.all([
    prisma.exam.findMany({ include: { pet: { include: { tutor: true } } }, orderBy: { requestedAt: "desc" }, take: 200 }),
    prisma.pet.findMany({ where: { isActive: true }, include: { tutor: true }, orderBy: { name: "asc" } }),
  ]);
  const petOpts = pets.map((p) => ({ id: p.id, label: `${p.name} (${p.tutor.name})` }));
  return (
    <>
      <PageHeader title="Exames" description="Solicitar, acompanhar e registrar resultados" />
      <ExamsClient
        exams={exams.map((e) => ({ id: e.id, name: e.name, status: e.status, pet: e.pet.name, tutor: e.pet.tutor.name, requestedAt: fmtDateTime(e.requestedAt), result: e.result, resultAt: e.resultAt ? fmtDateTime(e.resultAt) : null }))}
        pets={petOpts}
      />
    </>
  );
}
