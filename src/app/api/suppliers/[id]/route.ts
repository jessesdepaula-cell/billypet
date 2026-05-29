import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await prisma.supplier.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const b = await req.json();
  const s = await prisma.supplier.update({
    where: { id: params.id },
    data: {
      name: b.name ?? owned.name,
      document: b.document ?? owned.document,
      phone: b.phone ?? owned.phone,
      email: b.email ?? owned.email,
      notes: b.notes ?? owned.notes,
      isActive: b.isActive !== undefined ? !!b.isActive : owned.isActive,
    },
  });
  return NextResponse.json(s);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await prisma.supplier.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  await prisma.supplier.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
