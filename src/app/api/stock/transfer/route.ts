import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  const qty = Number(b.quantity);
  // saida unidade origem
  const origin = await prisma.stock.findFirst({ where: { productId: b.productId, unitId: b.fromUnitId } });
  if (!origin || origin.quantity < qty) return NextResponse.json({ error: "Estoque insuficiente" }, { status: 400 });
  await prisma.stock.update({ where: { id: origin.id }, data: { quantity: { decrement: qty } } });
  // entrada destino
  let target = await prisma.stock.findFirst({ where: { productId: b.productId, unitId: b.toUnitId } });
  if (!target) target = await prisma.stock.create({ data: { productId: b.productId, unitId: b.toUnitId, quantity: 0 } });
  await prisma.stock.update({ where: { id: target.id }, data: { quantity: { increment: qty } } });
  await prisma.stockMovement.create({ data: { productId: b.productId, unitId: b.fromUnitId, quantity: -qty, type: "TRANSFERENCIA", reason: `-> ${b.toUnitId}` } });
  await prisma.stockMovement.create({ data: { productId: b.productId, unitId: b.toUnitId, quantity: qty, type: "TRANSFERENCIA", reason: `<- ${b.fromUnitId}` } });
  await prisma.auditLog.create({ data: { userId: s.id, action: "TRANSFER", entity: "Stock", details: `${qty} unid` } });
  return NextResponse.json({ ok: true });
}
