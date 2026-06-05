import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const user = await prisma.user.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!user) return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });

  const { serviceIds } = await req.json();
  if (!Array.isArray(serviceIds)) {
    return NextResponse.json({ error: "Array de serviceIds invalido" }, { status: 400 });
  }

  // Deleta vinculações antigas
  await prisma.userService.deleteMany({
    where: { userId: params.id },
  });

  // Salva novas vinculações
  if (serviceIds.length > 0) {
    await prisma.userService.createMany({
      data: serviceIds.map((serviceId: string) => ({
        userId: params.id,
        serviceId,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "UPDATE_USER_SERVICES",
      entity: "User",
      entityId: user.id,
      details: `Serviços vinculados alterados: ${serviceIds.join(", ")}`,
    },
  });

  return NextResponse.json({ ok: true });
}
