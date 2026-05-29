import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const pet = await prisma.pet.findFirst({ where: { id: b.petId, tutor: { tenantId: ctx.tenantId } } });
  if (!pet) return NextResponse.json({ error: "Pet invalido" }, { status: 400 });
  const e = await prisma.exam.create({ data: { petId: b.petId, name: b.name, status: "SOLICITADO" } });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Exam", entityId: e.id, details: b.name } });
  return NextResponse.json(e);
}
