import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET(req: Request) {
  await requireSession();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const tutors = await prisma.tutor.findMany({
    where: {
      isActive: true,
      ...(q ? { OR: [{ name: { contains: q } }, { document: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] } : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { pets: true } } },
    take: 200,
  });
  return NextResponse.json(tutors);
}

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  const t = await prisma.tutor.create({
    data: {
      name: b.name, document: b.document, phone: b.phone, whatsapp: b.whatsapp,
      email: b.email, address: b.address, notes: b.notes,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.id, action: "CREATE", entity: "Tutor", entityId: t.id, details: t.name } });
  return NextResponse.json(t);
}
