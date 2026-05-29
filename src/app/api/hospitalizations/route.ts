import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const pet = await prisma.pet.findFirst({ where: { id: b.petId, tutor: { tenantId: ctx.tenantId } } });
  if (!pet) return NextResponse.json({ error: "Pet invalido" }, { status: 400 });
  const h = await prisma.hospitalization.create({
    data: {
      unitId: b.unitId || ctx.unitId, petId: b.petId, vetId: b.vetId || ctx.session.id,
      bed: b.bed, reason: b.reason, expectedAt: b.expectedAt ? new Date(b.expectedAt) : null,
    },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Hospitalization", entityId: h.id } });
  return NextResponse.json(h);
}
