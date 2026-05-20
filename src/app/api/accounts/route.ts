import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  if (b.kind === "payable") {
    const r = await prisma.accountPayable.create({
      data: {
        unitId: s.unitId!, supplierId: b.supplierId || null, category: b.category, description: b.description,
        amount: Number(b.amount), dueDate: new Date(b.dueDate), recurring: !!b.recurring, costCenter: b.costCenter,
      },
    });
    return NextResponse.json(r);
  }
  if (b.kind === "receivable") {
    const r = await prisma.accountReceivable.create({
      data: {
        unitId: s.unitId!, tutorId: b.tutorId || null, description: b.description,
        amount: Number(b.amount), dueDate: new Date(b.dueDate), installment: b.installment,
      },
    });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
}

export async function PATCH(req: Request) {
  await requireSession();
  const b = await req.json();
  if (b.kind === "payable") {
    const r = await prisma.accountPayable.update({ where: { id: b.id }, data: { status: "PAGA", paidAt: new Date() } });
    return NextResponse.json(r);
  }
  if (b.kind === "receivable") {
    const r = await prisma.accountReceivable.update({ where: { id: b.id }, data: { status: "PAGA", paidAt: new Date(), paidAmount: Number(b.amount ?? 0) || undefined } });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
}
