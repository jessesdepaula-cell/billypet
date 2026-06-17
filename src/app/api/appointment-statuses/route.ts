import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  let list = await prisma.appointmentStatus.findMany({
    where: { tenantId: ctx.tenantId },
    orderBy: { position: "asc" },
  });

  if (list.length === 0) {
    const defaults = [
      { tenantId: ctx.tenantId, name: "AGENDADO", color: "#3b82f6", position: 0 },
      { tenantId: ctx.tenantId, name: "CONFIRMADO", color: "#10b981", position: 1 },
      { tenantId: ctx.tenantId, name: "EM_ATENDIMENTO", color: "#f59e0b", position: 2 },
      { tenantId: ctx.tenantId, name: "FINALIZADO", color: "#22c55e", position: 3 },
      { tenantId: ctx.tenantId, name: "CANCELADO", color: "#ef4444", position: 4 },
      { tenantId: ctx.tenantId, name: "NAO_COMPARECEU", color: "#64748b", position: 5 },
    ];
    await prisma.appointmentStatus.createMany({ data: defaults });
    list = await prisma.appointmentStatus.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { position: "asc" },
    });
  }

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = await req.json();
  const name = String(b.name || "").trim().toUpperCase().replace(/\s+/g, "_");
  const color = String(b.color || "#cbd5e1").trim();
  if (!name) return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 400 });

  const count = await prisma.appointmentStatus.count({ where: { tenantId: ctx.tenantId } });

  const as = await prisma.appointmentStatus.create({
    data: {
      tenantId: ctx.tenantId,
      name,
      color,
      position: count,
      isActive: b.isActive !== false,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "CREATE",
      entity: "AppointmentStatus",
      entityId: as.id,
    },
  });

  return NextResponse.json(as);
}
