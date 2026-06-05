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
  if (b.statusId !== undefined) data.statusId = b.statusId;
  if (b.pipelineStage) { data.pipelineStage = b.pipelineStage; data.stageEnteredAt = new Date(); }
  if (b.scheduledAt) data.scheduledAt = new Date(b.scheduledAt);
  if (b.notes !== undefined) data.notes = b.notes;

  if (b.professionalIds !== undefined) {
    // Delete existing relations
    await prisma.appointmentProfessional.deleteMany({ where: { appointmentId: params.id } });
    if (b.professionalIds && b.professionalIds.length > 0) {
      await prisma.appointmentProfessional.createMany({
        data: b.professionalIds.map((userId: string) => ({
          appointmentId: params.id,
          userId,
        })),
      });
      data.vetId = b.professionalIds[0];
    } else {
      data.vetId = null;
    }
  } else if (b.vetId !== undefined) {
    data.vetId = b.vetId || null;
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
  
  // Realiza exclusão física
  await prisma.appointment.delete({ where: { id: params.id } });
  
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "DELETE", entity: "Appointment", entityId: params.id } });
  return NextResponse.json({ ok: true });
}
