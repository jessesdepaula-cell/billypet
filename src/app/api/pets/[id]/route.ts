import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
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
  await prisma.auditLog.create({ data: { userId: s.id, action: "UPDATE", entity: "Pet", entityId: p.id, details: p.name } });
  return NextResponse.json(p);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const p = await prisma.pet.update({ where: { id: params.id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { userId: s.id, action: "DELETE_LOGIC", entity: "Pet", entityId: p.id, details: p.name } });
  return NextResponse.json({ ok: true });
}
