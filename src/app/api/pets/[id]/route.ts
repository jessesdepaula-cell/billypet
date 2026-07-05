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

  // Só mexe no peso quando ele vier no payload; evita zerar o peso em updates que nao o incluem (ex.: obito).
  let nextWeight: number | null | undefined = undefined;
  if (b.weightKg !== undefined) {
    nextWeight = b.weightKg === "" || b.weightKg === null ? null : Number(b.weightKg);
    if (nextWeight !== null && Number.isNaN(nextWeight)) nextWeight = null;
  }
  const weightChanged = nextWeight !== undefined && nextWeight !== null && nextWeight > 0 && nextWeight !== owned.weightKg;

  const p = await prisma.pet.update({
    where: { id: params.id },
    data: {
      name: b.name, species: b.species, breed: b.breed, sex: b.sex,
      neutered: typeof b.neutered === "boolean" ? b.neutered : null,
      birthDate: b.birthDate ? new Date(b.birthDate) : null,
      weightKg: nextWeight,
      color: b.color, microchip: b.microchip, notes: b.notes, medicalAlert: b.medicalAlert,
      deceased: b.deceased !== undefined ? !!b.deceased : undefined,
      deceasedAt: b.deceasedAt !== undefined ? (b.deceasedAt ? new Date(b.deceasedAt) : null) : undefined,
    },
  });
  if (weightChanged) {
    await prisma.weightRecord.create({ data: { petId: p.id, weightKg: nextWeight as number, source: "MANUAL" } });
  }
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
