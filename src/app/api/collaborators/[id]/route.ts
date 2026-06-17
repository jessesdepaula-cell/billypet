import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.collaborator.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Colaborador nao encontrado" }, { status: 404 });

  const b = await req.json();
  const data: any = {};
  if (b.name !== undefined) data.name = String(b.name || "").trim();
  if (b.role !== undefined) data.role = b.role || null;
  if (b.phone !== undefined) data.phone = b.phone || null;
  if (b.email !== undefined) data.email = b.email || null;
  if (b.isActive !== undefined) data.isActive = !!b.isActive;
  if (b.userId !== undefined) data.userId = b.userId || null;

  const c = await prisma.collaborator.update({
    where: { id: params.id },
    data,
  });

  if (b.serviceLinks && Array.isArray(b.serviceLinks)) {
    await prisma.collaboratorService.deleteMany({
      where: { collaboratorId: params.id },
    });
    await prisma.collaboratorService.createMany({
      data: b.serviceLinks.map((sl: any) => ({
        collaboratorId: params.id,
        serviceId: sl.serviceId,
        isResponsible: !!sl.isResponsible,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "UPDATE",
      entity: "Collaborator",
      entityId: c.id,
    },
  });

  return NextResponse.json(c);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.collaborator.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Colaborador nao encontrado" }, { status: 404 });

  const c = await prisma.collaborator.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "DEACTIVATE",
      entity: "Collaborator",
      entityId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}
