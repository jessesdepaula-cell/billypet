import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  // produto e unit precisam pertencer ao tenant
  const product = await prisma.product.findFirst({ where: { id: b.productId, tenantId: ctx.tenantId } });
  if (!product) return NextResponse.json({ error: "Produto invalido" }, { status: 400 });
  const unitId = b.unitId || ctx.unitId;
  const unit = await prisma.unit.findFirst({ where: { id: unitId, tenantId: ctx.tenantId } });
  if (!unit) return NextResponse.json({ error: "Unidade invalida" }, { status: 400 });

  const qty = Number(b.quantity);
  let stock = await prisma.stock.findFirst({ where: { productId: b.productId, unitId } });
  if (!stock) stock = await prisma.stock.create({ data: { productId: b.productId, unitId, quantity: 0 } });
  const delta = ["ENTRADA", "AJUSTE_POS", "DEVOLUCAO", "XML"].includes(b.type) ? qty : -qty;
  await prisma.stock.update({ where: { id: stock.id }, data: { quantity: { increment: delta } } });
  const mv = await prisma.stockMovement.create({
    data: { productId: b.productId, unitId, quantity: delta, type: b.type, reason: b.reason ?? null },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "STOCK_MOVE", entity: "StockMovement", entityId: mv.id, details: `${b.type} ${delta}` } });
  return NextResponse.json(mv);
}
