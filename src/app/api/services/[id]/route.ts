import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await prisma.service.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const b = await req.json();
  const s = await prisma.service.update({
    where: { id: params.id },
    data: {
      name: b.name ?? owned.name,
      category: b.category ?? owned.category,
      durationMinutes: b.durationMinutes !== undefined ? Number(b.durationMinutes) : owned.durationMinutes,
      price: b.price !== undefined ? Number(b.price) : owned.price,
      commissionPct: b.commissionPct !== undefined ? Number(b.commissionPct) : owned.commissionPct,
      isActive: b.isActive !== undefined ? !!b.isActive : owned.isActive,
    },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "UPDATE", entity: "Service", entityId: s.id, details: s.name } });
  return NextResponse.json(s);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await prisma.service.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const s = await prisma.service.update({ where: { id: params.id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "DELETE_LOGIC", entity: "Service", entityId: s.id, details: s.name } });
  return NextResponse.json({ ok: true });
}
