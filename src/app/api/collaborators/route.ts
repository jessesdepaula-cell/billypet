import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { syncCollaborators } from "@/lib/collaborator-sync";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  // Sync users to collaborators first
  await syncCollaborators(ctx.tenantId);

  const list = await prisma.collaborator.findMany({
    where: { tenantId: ctx.tenantId },
    include: {
      services: {
        include: { service: true }
      }
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = await req.json();
  const name = String(b.name || "").trim();
  if (!name) return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 400 });

  const c = await prisma.collaborator.create({
    data: {
      tenantId: ctx.tenantId,
      name,
      role: b.role || null,
      phone: b.phone || null,
      email: b.email || null,
      isActive: b.isActive !== false,
      userId: b.userId || null,
    },
  });

  if (b.serviceLinks && Array.isArray(b.serviceLinks)) {
    await prisma.collaboratorService.createMany({
      data: b.serviceLinks.map((sl: any) => ({
        collaboratorId: c.id,
        serviceId: sl.serviceId,
        isResponsible: !!sl.isResponsible,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "CREATE",
      entity: "Collaborator",
      entityId: c.id,
    },
  });

  return NextResponse.json(c);
}
