import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const service = await prisma.service.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!service) return NextResponse.json({ error: "Servico nao encontrado" }, { status: 404 });

  const links = await prisma.userService.findMany({
    where: { serviceId: params.id },
    include: { user: true },
  });

  return NextResponse.json(links.map((l) => l.user));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const service = await prisma.service.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!service) return NextResponse.json({ error: "Servico nao encontrado" }, { status: 404 });

  const { userIds } = await req.json();
  if (!Array.isArray(userIds)) {
    return NextResponse.json({ error: "Array de userIds invalido" }, { status: 400 });
  }

  // Deleta associações anteriores
  await prisma.userService.deleteMany({
    where: { serviceId: params.id },
  });

  // Salva novas associações
  if (userIds.length > 0) {
    await prisma.userService.createMany({
      data: userIds.map((userId: string) => ({
        serviceId: params.id,
        userId,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "UPDATE_RESPONSIBLES",
      entity: "Service",
      entityId: service.id,
      details: `Responsáveis alterados: ${userIds.join(", ")}`,
    },
  });

  return NextResponse.json({ ok: true });
}
