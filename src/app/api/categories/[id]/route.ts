import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await prisma.productCategory.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const b = await req.json();
  const c = await prisma.productCategory.update({ where: { id: params.id }, data: { name: b.name ?? owned.name } });
  return NextResponse.json(c);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await prisma.productCategory.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const inUse = await prisma.product.count({ where: { categoryId: params.id } });
  if (inUse > 0) return NextResponse.json({ error: `Em uso por ${inUse} produto(s)` }, { status: 400 });
  await prisma.productCategory.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
