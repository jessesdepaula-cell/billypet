import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { ensureDefaultProtocolTemplates } from "@/lib/defaultProtocols";
import { PetProfileClient } from "./PetProfileClient";

export const dynamic = "force-dynamic";

export default async function PetDetailPage({ params }: { params: { id: string } }) {
  const { tenantId } = await requireModule("pets");

  await ensureDefaultProtocolTemplates(tenantId);

  const p = await prisma.pet.findFirst({
    where: { id: params.id, tutor: { tenantId } },
    include: {
      tutor: true,
      vaccines: { orderBy: { appliedAt: "desc" } },
      exams: { orderBy: { requestedAt: "desc" } },
      hospitalizations: { orderBy: { admittedAt: "desc" }, include: { vet: true } },
      medicalRecords: { orderBy: { createdAt: "desc" }, include: { vet: true, prescriptions: true } },
      appointments: { orderBy: { scheduledAt: "desc" }, take: 50, include: { services: { include: { service: true } }, vet: true } },
      protocols: { orderBy: { createdAt: "desc" }, include: { doses: { orderBy: { dueDate: "asc" } } } },
      attachments: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, mimeType: true, sizeBytes: true, createdAt: true } },
      weightRecords: { orderBy: { createdAt: "desc" } },
    },
  });
  
  if (!p) return notFound();
  
  const [tutors, protocolTemplates, initialStatuses, auditLogs] = await Promise.all([
    prisma.tutor.findMany({ where: { tenantId, isActive: true }, select: { id: true, name: true } }),
    prisma.protocolTemplate.findMany({
      where: { tenantId, isActive: true },
      include: { doses: { orderBy: { daysOffset: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.appointmentStatus.findMany({ where: { tenantId }, orderBy: { position: "asc" } }),
    // Alteracoes na ficha do animal (cadastro/edicoes) para o historico
    prisma.auditLog.findMany({
      where: { tenantId, entity: "Pet", entityId: p.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true } } },
    }),
  ]);

  let statuses = initialStatuses;
  if (statuses.length === 0) {
    const defaults = [
      { tenantId, name: "AGENDADO", color: "#3b82f6", position: 0 },
      { tenantId, name: "CONFIRMADO", color: "#10b981", position: 1 },
      { tenantId, name: "EM_ATENDIMENTO", color: "#f59e0b", position: 2 },
      { tenantId, name: "FINALIZADO", color: "#22c55e", position: 3 },
      { tenantId, name: "CANCELADO", color: "#ef4444", position: 4 },
      { tenantId, name: "NAO_COMPARECEU", color: "#64748b", position: 5 },
    ];
    await prisma.appointmentStatus.createMany({ data: defaults });
    statuses = await prisma.appointmentStatus.findMany({
      where: { tenantId },
      orderBy: { position: "asc" },
    });
  }

  return (
    <PetProfileClient
      pet={p}
      tutors={tutors}
      protocolTemplates={protocolTemplates as any}
      statuses={statuses}
      auditLogs={auditLogs as any}
      isBlobConfigured={!!process.env.BLOB_READ_WRITE_TOKEN}
    />
  );
}
