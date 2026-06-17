import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PetProfileClient } from "./PetProfileClient";

export const dynamic = "force-dynamic";

export default async function PetDetailPage({ params }: { params: { id: string } }) {
  const { tenantId } = await requireModule("pets");
  
  const p = await prisma.pet.findFirst({
    where: { id: params.id, tutor: { tenantId } },
    include: {
      tutor: true,
      vaccines: { orderBy: { appliedAt: "desc" } },
      exams: { orderBy: { requestedAt: "desc" } },
      hospitalizations: { orderBy: { admittedAt: "desc" }, include: { vet: true } },
      medicalRecords: { orderBy: { createdAt: "desc" }, include: { vet: true, prescriptions: true } },
      appointments: { orderBy: { scheduledAt: "desc" }, take: 20, include: { services: { include: { service: true } }, vet: true } },
      protocols: { orderBy: { createdAt: "desc" }, include: { doses: { orderBy: { dueDate: "asc" } } } },
      attachments: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, mimeType: true, sizeBytes: true, createdAt: true } },
    },
  });
  
  if (!p) return notFound();
  
  const [tutors, protocolTemplates] = await Promise.all([
    prisma.tutor.findMany({ where: { tenantId, isActive: true }, select: { id: true, name: true } }),
    prisma.protocolTemplate.findMany({
      where: { tenantId, isActive: true },
      include: { doses: { orderBy: { daysOffset: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PetProfileClient pet={p} tutors={tutors} protocolTemplates={protocolTemplates as any} />
  );
}
