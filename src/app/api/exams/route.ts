import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  const e = await prisma.exam.create({ data: { petId: b.petId, name: b.name, status: "SOLICITADO" } });
  await prisma.auditLog.create({ data: { userId: s.id, action: "CREATE", entity: "Exam", entityId: e.id, details: b.name } });
  return NextResponse.json(e);
}
