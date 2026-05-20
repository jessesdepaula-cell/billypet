import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await requireSession();
  const t = await prisma.tutor.findUnique({
    where: { id: params.id },
    include: { pets: true, loyaltyTransactions: { orderBy: { createdAt: "desc" } } },
  });
  if (!t) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const b = await req.json();
  const t = await prisma.tutor.update({
    where: { id: params.id },
    data: {
      name: b.name, document: b.document, phone: b.phone, whatsapp: b.whatsapp,
      email: b.email, address: b.address, notes: b.notes,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.id, action: "UPDATE", entity: "Tutor", entityId: t.id, details: t.name } });
  return NextResponse.json(t);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const t = await prisma.tutor.update({ where: { id: params.id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { userId: s.id, action: "DELETE_LOGIC", entity: "Tutor", entityId: t.id, details: t.name } });
  return NextResponse.json({ ok: true });
}
