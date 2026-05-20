import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  const unitId = b.unitId || s.unitId!;
  const qty = Number(b.quantity);
  // Ajusta stock
  let stock = await prisma.stock.findFirst({ where: { productId: b.productId, unitId } });
  if (!stock) stock = await prisma.stock.create({ data: { productId: b.productId, unitId, quantity: 0 } });
  const delta = ["ENTRADA", "AJUSTE_POS", "DEVOLUCAO", "XML"].includes(b.type) ? qty : -qty;
  await prisma.stock.update({ where: { id: stock.id }, data: { quantity: { increment: delta } } });
  const mv = await prisma.stockMovement.create({
    data: { productId: b.productId, unitId, quantity: delta, type: b.type, reason: b.reason ?? null },
  });
  await prisma.auditLog.create({ data: { userId: s.id, action: "STOCK_MOVE", entity: "StockMovement", entityId: mv.id, details: `${b.type} ${delta}` } });
  return NextResponse.json(mv);
}
