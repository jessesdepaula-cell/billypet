import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const list = await prisma.supplier.findMany({ where: { tenantId: ctx.tenantId, isActive: true }, orderBy: { name: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
  const s = await prisma.supplier.create({
    data: {
      tenantId: ctx.tenantId,
      name: b.name,
      document: b.document || null,
      phone: b.phone || null,
      email: b.email || null,
      notes: b.notes || null,
    },
  });
  return NextResponse.json(s);
}
