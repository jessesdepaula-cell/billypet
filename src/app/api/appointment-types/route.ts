import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const list = await prisma.appointmentType.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { name: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });
  
  const trimmedName = b.name.trim();
  const existing = await prisma.appointmentType.findFirst({
    where: { tenantId: ctx.tenantId, name: { equals: trimmedName } }
  });
  if (existing) {
    return NextResponse.json({ error: "Este tipo de atendimento ja existe" }, { status: 400 });
  }

  const c = await prisma.appointmentType.create({ data: { tenantId: ctx.tenantId, name: trimmedName } });
  return NextResponse.json(c);
}
