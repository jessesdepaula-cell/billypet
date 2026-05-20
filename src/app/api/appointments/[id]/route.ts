import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const b = await req.json();
  const data: any = {};
  if (b.status) data.status = b.status;
  if (b.pipelineStage) { data.pipelineStage = b.pipelineStage; data.stageEnteredAt = new Date(); }
  if (b.scheduledAt) data.scheduledAt = new Date(b.scheduledAt);
  if (b.vetId !== undefined) data.vetId = b.vetId || null;
  if (b.notes !== undefined) data.notes = b.notes;
  const a = await prisma.appointment.update({ where: { id: params.id }, data });
  await prisma.auditLog.create({ data: { userId: s.id, action: "UPDATE", entity: "Appointment", entityId: a.id, details: JSON.stringify(b) } });
  return NextResponse.json(a);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const a = await prisma.appointment.update({ where: { id: params.id }, data: { status: "CANCELADO" } });
  await prisma.auditLog.create({ data: { userId: s.id, action: "CANCEL", entity: "Appointment", entityId: a.id } });
  return NextResponse.json({ ok: true });
}
