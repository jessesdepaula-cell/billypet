import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const { searchParams } = new URL(req.url);
  const petId = searchParams.get("petId");
  if (!petId) return NextResponse.json({ error: "petId é obrigatório" }, { status: 400 });

  const pet = await prisma.pet.findFirst({
    where: { id: petId, tutor: { tenantId: ctx.tenantId } },
  });
  if (!pet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

  const list = await prisma.vaccine.findMany({
    where: { petId },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = await req.json();
  const petId = String(b.petId || "").trim();
  const name = String(b.name || "").trim();
  const appliedAtStr = b.appliedAt || new Date().toISOString();

  if (!petId || !name) {
    return NextResponse.json({ error: "Nome da vacina e Pet são obrigatórios" }, { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: petId, tutor: { tenantId: ctx.tenantId } },
  });
  if (!pet) return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });

  const vaccine = await prisma.vaccine.create({
    data: {
      petId,
      name,
      appliedAt: new Date(appliedAtStr),
      nextDose: b.nextDose ? new Date(b.nextDose) : null,
      batch: b.batch ? String(b.batch).trim() : null,
      laboratory: b.laboratory ? String(b.laboratory).trim() : null,
      notes: b.notes ? String(b.notes).trim() : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "CREATE_VACCINE",
      entity: "Vaccine",
      entityId: vaccine.id,
      details: `Vacina: ${name}, Lote: ${b.batch || "N/I"}, Laboratório: ${b.laboratory || "N/I"}`,
    },
  });

  return NextResponse.json(vaccine);
}

export async function DELETE(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const vaccine = await prisma.vaccine.findUnique({
    where: { id },
    include: { pet: { include: { tutor: true } } },
  });

  if (!vaccine || vaccine.pet.tutor.tenantId !== ctx.tenantId) {
    return NextResponse.json({ error: "Vacina não encontrada" }, { status: 404 });
  }

  await prisma.vaccine.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "DELETE_VACCINE",
      entity: "Vaccine",
      entityId: id,
      details: vaccine.name,
    },
  });

  return NextResponse.json({ ok: true });
}
