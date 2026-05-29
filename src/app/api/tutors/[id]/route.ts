import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const t = await prisma.tutor.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
    include: { pets: true, loyaltyTransactions: { orderBy: { createdAt: "desc" } } },
  });
  if (!t) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const existing = await prisma.tutor.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const t = await prisma.tutor.update({
    where: { id: params.id },
    data: {
      name: b.name, document: b.document, phone: b.phone, whatsapp: b.whatsapp,
      email: b.email, address: b.address, notes: b.notes,
    },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "UPDATE", entity: "Tutor", entityId: t.id, details: t.name } });
  return NextResponse.json(t);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const existing = await prisma.tutor.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const t = await prisma.tutor.update({ where: { id: params.id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "DELETE_LOGIC", entity: "Tutor", entityId: t.id, details: t.name } });
  return NextResponse.json({ ok: true });
}
