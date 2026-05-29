import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const tutorId = searchParams.get("tutorId") || undefined;
  const pets = await prisma.pet.findMany({
    where: {
      tutor: { tenantId: ctx.tenantId },
      isActive: true,
      ...(tutorId ? { tutorId } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { breed: { contains: q } }, { species: { contains: q } }] } : {}),
    },
    include: { tutor: true },
    orderBy: { name: "asc" }, take: 200,
  });
  return NextResponse.json(pets);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  // valida que o tutor pertence ao tenant
  const tutor = await prisma.tutor.findFirst({ where: { id: b.tutorId, tenantId: ctx.tenantId } });
  if (!tutor) return NextResponse.json({ error: "Tutor invalido" }, { status: 400 });
  const p = await prisma.pet.create({
    data: {
      name: b.name, species: b.species, breed: b.breed, sex: b.sex,
      birthDate: b.birthDate ? new Date(b.birthDate) : null,
      weightKg: b.weightKg ? Number(b.weightKg) : null,
      color: b.color, notes: b.notes, medicalAlert: b.medicalAlert,
      tutorId: b.tutorId,
    },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Pet", entityId: p.id, details: p.name } });
  return NextResponse.json(p);
}
