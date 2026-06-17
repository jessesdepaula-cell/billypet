import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.notification.findFirst({
    where: { id: params.id, tenantId: ctx.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "Notificacao nao encontrada" }, { status: 404 });

  const b = await req.json();
  const n = await prisma.notification.update({
    where: { id: params.id },
    data: { read: !!b.read },
  });

  return NextResponse.json(n);
}
