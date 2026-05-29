import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const qty = Number(b.quantity);

  // Validar todas as entidades pertencem ao tenant
  const [product, from, to] = await Promise.all([
    prisma.product.findFirst({ where: { id: b.productId, tenantId: ctx.tenantId } }),
    prisma.unit.findFirst({ where: { id: b.fromUnitId, tenantId: ctx.tenantId } }),
    prisma.unit.findFirst({ where: { id: b.toUnitId, tenantId: ctx.tenantId } }),
  ]);
  if (!product || !from || !to) return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });

  const origin = await prisma.stock.findFirst({ where: { productId: b.productId, unitId: b.fromUnitId } });
  if (!origin || origin.quantity < qty) return NextResponse.json({ error: "Estoque insuficiente" }, { status: 400 });
  await prisma.stock.update({ where: { id: origin.id }, data: { quantity: { decrement: qty } } });
  let target = await prisma.stock.findFirst({ where: { productId: b.productId, unitId: b.toUnitId } });
  if (!target) target = await prisma.stock.create({ data: { productId: b.productId, unitId: b.toUnitId, quantity: 0 } });
  await prisma.stock.update({ where: { id: target.id }, data: { quantity: { increment: qty } } });
  await prisma.stockMovement.create({ data: { productId: b.productId, unitId: b.fromUnitId, quantity: -qty, type: "TRANSFERENCIA", reason: `-> ${b.toUnitId}` } });
  await prisma.stockMovement.create({ data: { productId: b.productId, unitId: b.toUnitId, quantity: qty, type: "TRANSFERENCIA", reason: `<- ${b.fromUnitId}` } });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "TRANSFER", entity: "Stock", details: `${qty} unid` } });
  return NextResponse.json({ ok: true });
}
