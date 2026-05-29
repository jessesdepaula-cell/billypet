import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

async function fetchOwned(id: string, tenantId: string) {
  return prisma.pet.findFirst({ where: { id, tutor: { tenantId } } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await fetchOwned(params.id, ctx.tenantId);
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const b = await req.json();
  const p = await prisma.pet.update({
    where: { id: params.id },
    data: {
      name: b.name, species: b.species, breed: b.breed, sex: b.sex,
      birthDate: b.birthDate ? new Date(b.birthDate) : null,
      weightKg: b.weightKg !== undefined && b.weightKg !== "" ? Number(b.weightKg) : null,
      color: b.color, notes: b.notes, medicalAlert: b.medicalAlert,
    },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "UPDATE", entity: "Pet", entityId: p.id, details: p.name } });
  return NextResponse.json(p);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await fetchOwned(params.id, ctx.tenantId);
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const p = await prisma.pet.update({ where: { id: params.id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "DELETE_LOGIC", entity: "Pet", entityId: p.id, details: p.name } });
  return NextResponse.json({ ok: true });
}
