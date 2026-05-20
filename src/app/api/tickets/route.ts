import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  const t = await prisma.supportTicket.create({ data: { userId: s.id, subject: b.subject, body: b.body } });
  return NextResponse.json(t);
}

export async function PATCH(req: Request) {
  await requireSession();
  const b = await req.json();
  const t = await prisma.supportTicket.update({ where: { id: b.id }, data: { status: b.status } });
  return NextResponse.json(t);
}
