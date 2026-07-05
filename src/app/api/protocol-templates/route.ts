import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { ensureDefaultProtocolTemplates } from "@/lib/defaultProtocols";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  await ensureDefaultProtocolTemplates(ctx.tenantId);

  const list = await prisma.protocolTemplate.findMany({
    where: { tenantId: ctx.tenantId, isActive: true },
    include: { doses: { orderBy: { daysOffset: "asc" } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = await req.json();
  const name = String(b.name || "").trim();
  const type = String(b.type || "").trim();
  if (!name || !type) return NextResponse.json({ error: "Nome e tipo sao obrigatorios" }, { status: 400 });

  const pt = await prisma.protocolTemplate.create({
    data: {
      tenantId: ctx.tenantId,
      name,
      type,
      notes: b.notes || null,
      isActive: b.isActive !== false,
    },
  });

  if (b.doses && Array.isArray(b.doses)) {
    await prisma.protocolTemplateDose.createMany({
      data: b.doses.map((d: any) => ({
        templateId: pt.id,
        name: String(d.name || "").trim(),
        daysOffset: Math.max(0, parseInt(d.daysOffset) || 0),
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "CREATE",
      entity: "ProtocolTemplate",
      entityId: pt.id,
    },
  });

  return NextResponse.json(pt);
}
