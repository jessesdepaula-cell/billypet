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
  if (b.vetId !== undefined) data.vetId = b.vetId || null;
  if (b.notes !== undefined) data.notes = b.notes;
  if (b.type !== undefined) data.type = b.type;
  if (b.tutorId !== undefined) data.tutorId = b.tutorId;
  if (b.petId !== undefined) data.petId = b.petId || null;

  if (b.collaboratorIds && Array.isArray(b.collaboratorIds)) {
    await prisma.appointmentCollaborator.deleteMany({ where: { appointmentId: params.id } });
    if (b.collaboratorIds.length > 0) {
      await prisma.appointmentCollaborator.createMany({
        data: b.collaboratorIds.map((cid: string) => ({ collaboratorId: cid }))
      });
      const firstCollab = await prisma.collaborator.findFirst({
        where: { id: b.collaboratorIds[0] },
        select: { userId: true }
      });
      if (firstCollab?.userId) data.vetId = firstCollab.userId;
    }
  }

  // Se houver serviceIds novos, atualiza
  if (b.serviceIds && Array.isArray(b.serviceIds)) {
    await prisma.appointmentService.deleteMany({ where: { appointmentId: params.id } });
    if (b.serviceIds.length > 0) {
      await prisma.appointmentService.createMany({
        data: b.serviceIds.map((sid: string) => ({ serviceId: sid, price: 0 }))
      });
      const services = await prisma.service.findMany({ where: { id: { in: b.serviceIds }, tenantId: ctx.tenantId } });
      for (const sv of services) {
        await prisma.appointmentService.updateMany({ where: { appointmentId: params.id, serviceId: sv.id }, data: { price: sv.price } });
      }
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
