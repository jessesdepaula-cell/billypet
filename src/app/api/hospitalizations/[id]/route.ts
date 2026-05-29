import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const existing = await prisma.hospitalization.findFirst({ where: { id: params.id, unit: { tenantId: ctx.tenantId } } });
  if (!existing) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const b = await req.json();
  const data: any = {};
  if (b.status) { data.status = b.status; if (b.status !== "ATIVA") data.dischargedAt = new Date(); }
  if (b.bed !== undefined) data.bed = b.bed;
  if (b.reason !== undefined) data.reason = b.reason;
  if (b.notes !== undefined) data.notes = b.notes;
  const h = await prisma.hospitalization.update({ where: { id: params.id }, data });
  if (b.evolution) {
    await prisma.hospitalizationEvolution.create({
      data: { hospitalizationId: h.id, description: b.evolution.description ?? "", vitals: b.evolution.vitals, medications: b.evolution.medications },
    });
  }
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "UPDATE", entity: "Hospitalization", entityId: h.id } });
  return NextResponse.json(h);
}
