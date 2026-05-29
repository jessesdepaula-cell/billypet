import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const existing = await prisma.exam.findFirst({ where: { id: params.id, pet: { tutor: { tenantId: ctx.tenantId } } } });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const b = await req.json();
  const data: any = {};
  if (b.status) data.status = b.status;
  if (b.result !== undefined) { data.result = b.result; data.resultAt = new Date(); }
  const e = await prisma.exam.update({ where: { id: params.id }, data });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "UPDATE", entity: "Exam", entityId: e.id } });
  return NextResponse.json(e);
}
