import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.appointmentStatus.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Status nao encontrado" }, { status: 404 });

  const b = await req.json();
  const data: any = {};
  if (b.name !== undefined) data.name = String(b.name || "").trim().toUpperCase().replace(/\s+/g, "_");
  if (b.color !== undefined) data.color = String(b.color || "#cbd5e1").trim();
  if (b.position !== undefined) data.position = parseInt(b.position) || 0;
  if (b.isActive !== undefined) data.isActive = !!b.isActive;

  const as = await prisma.appointmentStatus.update({
    where: { id: params.id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "UPDATE",
      entity: "AppointmentStatus",
      entityId: as.id,
    },
  });

  return NextResponse.json(as);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.appointmentStatus.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Status nao encontrado" }, { status: 404 });

  const as = await prisma.appointmentStatus.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "DEACTIVATE",
      entity: "AppointmentStatus",
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}
