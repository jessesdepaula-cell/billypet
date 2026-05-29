import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const t = await prisma.supportTicket.create({ data: { userId: ctx.session.id, subject: b.subject, body: b.body } });
  return NextResponse.json(t);
}

export async function PATCH(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const existing = await prisma.supportTicket.findFirst({ where: { id: b.id, user: { tenantId: ctx.tenantId } } });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const t = await prisma.supportTicket.update({ where: { id: b.id }, data: { status: b.status } });
  return NextResponse.json(t);
}
