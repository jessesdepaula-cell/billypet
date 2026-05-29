import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const tutors = await prisma.tutor.findMany({
    where: {
      tenantId: ctx.tenantId,
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
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const t = await prisma.tutor.create({
    data: {
      tenantId: ctx.tenantId,
      name: b.name, document: b.document, phone: b.phone, whatsapp: b.whatsapp,
      email: b.email, address: b.address, notes: b.notes,
    },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Tutor", entityId: t.id, details: t.name } });
  return NextResponse.json(t);
}
