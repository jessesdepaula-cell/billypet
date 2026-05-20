import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  const h = await prisma.hospitalization.create({
    data: {
      unitId: b.unitId || s.unitId!, petId: b.petId, vetId: b.vetId || s.id,
      bed: b.bed, reason: b.reason, expectedAt: b.expectedAt ? new Date(b.expectedAt) : null,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.id, action: "CREATE", entity: "Hospitalization", entityId: h.id } });
  return NextResponse.json(h);
}
