import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.appointmentStatus.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });

  const b = await req.json();
  const data: any = {};
  if (b.name) data.name = b.name;
  if (b.color) data.color = b.color;
  if (b.isActive !== undefined) data.isActive = !!b.isActive;

  const status = await prisma.appointmentStatus.update({
    where: { id: params.id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "UPDATE",
      entity: "AppointmentStatus",
      entityId: status.id,
      details: JSON.stringify(b),
    },
  });

  return NextResponse.json(status);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.appointmentStatus.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });

  const status = await prisma.appointmentStatus.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "DELETE_LOGIC",
      entity: "AppointmentStatus",
      entityId: status.id,
      details: status.name,
    },
  });

  return NextResponse.json({ ok: true });
}
