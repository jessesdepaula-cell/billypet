import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const list = await prisma.notification.findMany({
    where: { tenantId: ctx.tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(list);
}

export async function PATCH(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = await req.json();
  const { id } = b;

  if (id) {
    await prisma.notification.updateMany({
      where: { id, tenantId: ctx.tenantId },
      data: { isRead: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { tenantId: ctx.tenantId, isRead: false },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ ok: true });
}
