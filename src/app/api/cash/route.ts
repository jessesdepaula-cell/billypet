import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  if (b.action === "open") {
    const c = await prisma.cashRegister.create({ data: { unitId: ctx.unitId, openedById: ctx.session.id, openValue: Number(b.openValue ?? 0) } });
    return NextResponse.json(c);
  }
  if (b.action === "close") {
    const existing = await prisma.cashRegister.findFirst({ where: { id: b.id, unit: { tenantId: ctx.tenantId } } });
    if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
    const c = await prisma.cashRegister.update({ where: { id: b.id }, data: { closedAt: new Date(), status: "FECHADO", closeValue: Number(b.closeValue ?? 0) } });
    return NextResponse.json(c);
  }
  if (b.action === "transaction") {
    const cash = await prisma.cashRegister.findFirst({ where: { id: b.cashRegisterId, unit: { tenantId: ctx.tenantId } } });
    if (!cash) return NextResponse.json({ error: "Caixa invalido" }, { status: 400 });
    const t = await prisma.financialTransaction.create({
      data: { cashRegisterId: b.cashRegisterId, type: b.type, category: b.category, description: b.description, amount: Number(b.amount) },
    });
    return NextResponse.json(t);
  }
  return NextResponse.json({ error: "Acao desconhecida" }, { status: 400 });
}
