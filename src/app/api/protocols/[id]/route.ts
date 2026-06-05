import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const protocol = await prisma.protocol.findFirst({
    where: { id: params.id, pet: { tutor: { tenantId: ctx.tenantId } } },
  });
  if (!protocol) return NextResponse.json({ error: "Protocolo nao encontrado" }, { status: 404 });

  const b = await req.json();
  const data: any = {};
  if (b.name) data.name = b.name;
  if (b.notes !== undefined) data.notes = b.notes;
  if (b.status) data.status = b.status;

  const updated = await prisma.protocol.update({
    where: { id: params.id },
    data,
  });

  // Atualizar doses/aplicações se fornecido
  if (b.applications && Array.isArray(b.applications)) {
    for (const app of b.applications) {
      const appData: any = {};
      if (app.status) appData.status = app.status;
      if (app.status === "APLICADO") {
        appData.appliedAt = app.appliedAt ? new Date(app.appliedAt) : new Date();
      } else if (app.status === "PENDENTE") {
        appData.appliedAt = null;
      }
      
      await prisma.protocolApplication.update({
        where: { id: app.id, protocolId: params.id },
        data: appData,
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "UPDATE",
      entity: "Protocol",
      entityId: updated.id,
      details: JSON.stringify(b),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const protocol = await prisma.protocol.findFirst({
    where: { id: params.id, pet: { tutor: { tenantId: ctx.tenantId } } },
  });
  if (!protocol) return NextResponse.json({ error: "Protocolo nao encontrado" }, { status: 404 });

  await prisma.protocol.delete({ where: { id: params.id } });
  
  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "DELETE",
      entity: "Protocol",
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}
