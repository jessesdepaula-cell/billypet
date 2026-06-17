import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.protocolTemplate.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Modelo nao encontrado" }, { status: 404 });

  const b = await req.json();
  const data: any = {};
  if (b.name !== undefined) data.name = String(b.name || "").trim();
  if (b.type !== undefined) data.type = String(b.type || "").trim();
  if (b.notes !== undefined) data.notes = b.notes || null;
  if (b.isActive !== undefined) data.isActive = !!b.isActive;

  const pt = await prisma.protocolTemplate.update({
    where: { id: params.id },
    data,
  });

  if (b.doses && Array.isArray(b.doses)) {
    await prisma.protocolTemplateDose.deleteMany({
      where: { templateId: params.id },
    });
    await prisma.protocolTemplateDose.createMany({
      data: b.doses.map((d: any) => ({
        templateId: params.id,
        name: String(d.name || "").trim(),
        daysOffset: Math.max(0, parseInt(d.daysOffset) || 0),
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "UPDATE",
      entity: "ProtocolTemplate",
      entityId: pt.id,
    },
  });

  return NextResponse.json(pt);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.protocolTemplate.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Modelo nao encontrado" }, { status: 404 });

  const pt = await prisma.protocolTemplate.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "DEACTIVATE",
      entity: "ProtocolTemplate",
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}
