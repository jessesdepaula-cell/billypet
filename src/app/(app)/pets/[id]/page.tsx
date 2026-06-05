import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PetClinicalDashboard } from "./PetClinicalDashboard";

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
      appointments: { orderBy: { scheduledAt: "desc" }, take: 20, include: { statusRelation: true, services: { include: { service: true } }, vet: true } },
      protocols: { include: { applications: true } },
      attachments: true,
    },
  });

  if (!p) return notFound();
  
  const tutors = await prisma.tutor.findMany({ 
    where: { tenantId, isActive: true }, 
    select: { id: true, name: true } 
  });

  return (
    <PetClinicalDashboard 
      pet={p} 
      tutors={tutors} 
    />
  );
}
