import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const list = await prisma.appointmentStatus.findMany({
    where: { tenantId: ctx.tenantId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = await req.json();
  const { name, color } = b;
  if (!name || !color) {
    return NextResponse.json({ error: "Nome e cor sao obrigatorios" }, { status: 400 });
  }

  const status = await prisma.appointmentStatus.create({
    data: {
      tenantId: ctx.tenantId,
      name,
      color,
      isActive: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "CREATE",
      entity: "AppointmentStatus",
      entityId: status.id,
      details: name,
    },
  });

  return NextResponse.json(status);
}
