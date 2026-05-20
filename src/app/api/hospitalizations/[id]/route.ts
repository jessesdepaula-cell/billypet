import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
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
  await prisma.auditLog.create({ data: { userId: s.id, action: "UPDATE", entity: "Hospitalization", entityId: h.id } });
  return NextResponse.json(h);
}
