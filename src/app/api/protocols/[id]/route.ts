import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.protocol.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Protocolo nao encontrado" }, { status: 404 });

  const b = await req.json();

  if (b.action === "update_dose" && b.doseId) {
    const data: any = {};
    if (b.appliedAt !== undefined) {
      data.appliedAt = b.appliedAt ? new Date(b.appliedAt) : null;
      data.status = b.appliedAt ? "APLICADO" : "PENDENTE";
    }
    if (b.notes !== undefined) data.notes = b.notes;
    if (b.status !== undefined) data.status = b.status;

    const dose = await prisma.protocolApplication.update({
      where: { id: b.doseId },
      data,
    });

    const pendingDoses = await prisma.protocolApplication.count({
      where: { protocolId: params.id, status: "PENDENTE" },
    });
    if (pendingDoses === 0) {
      await prisma.protocol.update({
        where: { id: params.id },
        data: { status: "CONCLUIDO" },
      });
    } else {
      await prisma.protocol.update({
        where: { id: params.id },
        data: { status: "ATIVO" },
      });
    }

    return NextResponse.json(dose);
  }

  const data: any = {};
  if (b.status !== undefined) data.status = b.status;
  if (b.notes !== undefined) data.notes = b.notes;
  if (b.name !== undefined) data.name = b.name;
  if (b.type !== undefined) data.type = b.type;

  const p = await prisma.protocol.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(p);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.protocol.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Protocolo nao encontrado" }, { status: 404 });

  await prisma.protocol.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ ok: true });
}
