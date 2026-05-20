import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  if (b.action === "open") {
    const c = await prisma.cashRegister.create({ data: { unitId: s.unitId!, openedById: s.id, openValue: Number(b.openValue ?? 0) } });
    return NextResponse.json(c);
  }
  if (b.action === "close") {
    const c = await prisma.cashRegister.update({ where: { id: b.id }, data: { closedAt: new Date(), status: "FECHADO", closeValue: Number(b.closeValue ?? 0) } });
    return NextResponse.json(c);
  }
  if (b.action === "transaction") {
    const t = await prisma.financialTransaction.create({
      data: { cashRegisterId: b.cashRegisterId, type: b.type, category: b.category, description: b.description, amount: Number(b.amount) },
    });
    return NextResponse.json(t);
  }
  return NextResponse.json({ error: "Acao desconhecida" }, { status: 400 });
}
