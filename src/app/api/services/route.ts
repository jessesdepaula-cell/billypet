import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const list = await prisma.service.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { name: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
  const s = await prisma.service.create({
    data: {
      tenantId: ctx.tenantId,
      name: b.name,
      category: b.category || null,
      durationMinutes: Number(b.durationMinutes ?? 30),
      price: Number(b.price ?? 0),
      commissionPct: Number(b.commissionPct ?? 0),
    },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Service", entityId: s.id, details: s.name } });
  return NextResponse.json(s);
}
