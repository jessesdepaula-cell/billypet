import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const existing = await prisma.appointment.findFirst({ where: { id: params.id, unit: { tenantId: ctx.tenantId } } });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  
  const b = await req.json();
  const data: any = {};
  if (b.status) data.status = b.status;
  if (b.pipelineStage) { data.pipelineStage = b.pipelineStage; data.stageEnteredAt = new Date(); }
  if (b.scheduledAt) data.scheduledAt = new Date(b.scheduledAt);
  if (b.notes !== undefined) data.notes = b.notes;
  if (b.type !== undefined) data.type = b.type;

  // vetId/tutorId/petId: valida que pertencem ao tenant antes de vincular (evita cross-tenant)
  if (b.vetId !== undefined) {
    if (b.vetId) {
      const vet = await prisma.user.findFirst({ where: { id: b.vetId, tenantId: ctx.tenantId } });
      if (!vet) return NextResponse.json({ error: "Veterinario invalido" }, { status: 400 });
      data.vetId = b.vetId;
    } else {
      data.vetId = null;
    }
  }
  if (b.tutorId !== undefined) {
    const tutor = await prisma.tutor.findFirst({ where: { id: b.tutorId, tenantId: ctx.tenantId } });
    if (!tutor) return NextResponse.json({ error: "Tutor invalido" }, { status: 400 });
    data.tutorId = b.tutorId;
  }
  if (b.petId !== undefined) {
    if (b.petId) {
      const pet = await prisma.pet.findFirst({ where: { id: b.petId, tutor: { tenantId: ctx.tenantId } } });
      if (!pet) return NextResponse.json({ error: "Pet invalido" }, { status: 400 });
      data.petId = b.petId;
    } else {
      data.petId = null;
    }
  }

  if (b.collaboratorIds && Array.isArray(b.collaboratorIds)) {
    // Só considera colaboradores do proprio tenant
    const validCollaborators = b.collaboratorIds.length > 0
      ? await prisma.collaborator.findMany({ where: { id: { in: b.collaboratorIds }, tenantId: ctx.tenantId }, select: { id: true, userId: true } })
      : [];
    await prisma.appointmentCollaborator.deleteMany({ where: { appointmentId: params.id } });
    if (validCollaborators.length > 0) {
      await prisma.appointmentCollaborator.createMany({
        data: validCollaborators.map((c) => ({ appointmentId: params.id, collaboratorId: c.id }))
      });
      if (validCollaborators[0]?.userId) data.vetId = validCollaborators[0].userId;
    }
  }

  // Se houver serviceIds novos, atualiza
  if (b.serviceIds && Array.isArray(b.serviceIds)) {
    const services = b.serviceIds.length > 0
      ? await prisma.service.findMany({ where: { id: { in: b.serviceIds }, tenantId: ctx.tenantId } })
      : [];
    await prisma.appointmentService.deleteMany({ where: { appointmentId: params.id } });
    if (services.length > 0) {
      await prisma.appointmentService.createMany({
        data: services.map((sv) => ({ appointmentId: params.id, serviceId: sv.id, price: sv.price }))
      });
    }
  }

  const a = await prisma.appointment.update({ where: { id: params.id }, data });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "UPDATE", entity: "Appointment", entityId: a.id, details: JSON.stringify(b) } });
  return NextResponse.json(a);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const existing = await prisma.appointment.findFirst({ where: { id: params.id, unit: { tenantId: ctx.tenantId } } });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  
  // Para exclusão física total, deleta as dependências primeiro
  await prisma.appointmentCollaborator.deleteMany({ where: { appointmentId: params.id } });
  await prisma.appointmentService.deleteMany({ where: { appointmentId: params.id } });
  
  // Verifica se há prontuário e deleta receitas vinculadas a ele primeiro
  const mr = await prisma.medicalRecord.findUnique({ where: { appointmentId: params.id } });
  if (mr) {
    await prisma.prescription.deleteMany({ where: { medicalRecordId: mr.id } });
    await prisma.medicalRecord.delete({ where: { id: mr.id } });
  }

  await prisma.appointment.delete({ where: { id: params.id } });
  
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "DELETE", entity: "Appointment", entityId: params.id } });
  return NextResponse.json({ ok: true });
}
