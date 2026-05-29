import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  if (b.kind === "payable") {
    const r = await prisma.accountPayable.create({
      data: {
        unitId: ctx.unitId, supplierId: b.supplierId || null, category: b.category, description: b.description,
        amount: Number(b.amount), dueDate: new Date(b.dueDate), recurring: !!b.recurring, costCenter: b.costCenter,
      },
    });
    return NextResponse.json(r);
  }
  if (b.kind === "receivable") {
    if (b.tutorId) {
      const t = await prisma.tutor.findFirst({ where: { id: b.tutorId, tenantId: ctx.tenantId } });
      if (!t) return NextResponse.json({ error: "Tutor invalido" }, { status: 400 });
    }
    const r = await prisma.accountReceivable.create({
      data: {
        unitId: ctx.unitId, tutorId: b.tutorId || null, description: b.description,
        amount: Number(b.amount), dueDate: new Date(b.dueDate), installment: b.installment,
      },
    });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  if (b.kind === "payable") {
    const existing = await prisma.accountPayable.findFirst({ where: { id: b.id, unit: { tenantId: ctx.tenantId } } });
    if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
    const r = await prisma.accountPayable.update({ where: { id: b.id }, data: { status: "PAGA", paidAt: new Date() } });
    return NextResponse.json(r);
  }
  if (b.kind === "receivable") {
    const existing = await prisma.accountReceivable.findFirst({ where: { id: b.id, unit: { tenantId: ctx.tenantId } } });
    if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
    const r = await prisma.accountReceivable.update({ where: { id: b.id }, data: { status: "PAGA", paidAt: new Date(), paidAmount: Number(b.amount ?? 0) || undefined } });
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
}
