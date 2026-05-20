import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const b = await req.json();
  const data: any = {};
  if (b.status) data.status = b.status;
  if (b.result !== undefined) { data.result = b.result; data.resultAt = new Date(); }
  const e = await prisma.exam.update({ where: { id: params.id }, data });
  await prisma.auditLog.create({ data: { userId: s.id, action: "UPDATE", entity: "Exam", entityId: e.id } });
  return NextResponse.json(e);
}
