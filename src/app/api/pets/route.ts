import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET(req: Request) {
  await requireSession();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const tutorId = searchParams.get("tutorId") || undefined;
  const pets = await prisma.pet.findMany({
    where: {
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
  const s = await requireSession();
  const b = await req.json();
  const p = await prisma.pet.create({
    data: {
      name: b.name, species: b.species, breed: b.breed, sex: b.sex,
      birthDate: b.birthDate ? new Date(b.birthDate) : null,
      weightKg: b.weightKg ? Number(b.weightKg) : null,
      color: b.color, notes: b.notes, medicalAlert: b.medicalAlert,
      tutorId: b.tutorId,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.id, action: "CREATE", entity: "Pet", entityId: p.id, details: p.name } });
  return NextResponse.json(p);
}
