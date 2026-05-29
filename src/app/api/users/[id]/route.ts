import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

const ALLOWED_ROLES = ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO", "FINANCEIRO", "ESTOQUE", "BANHO_TOSA", "VENDEDOR"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  if (!["ADMIN", "GESTOR"].includes(ctx.session.role)) {
    return NextResponse.json({ error: "Apenas ADMIN/GESTOR podem editar usuarios" }, { status: 403 });
  }
  const owned = await prisma.user.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });

  const b = await req.json();
  const data: any = {};
  if (b.name !== undefined) data.name = String(b.name).trim();
  if (b.role !== undefined) {
    if (!ALLOWED_ROLES.includes(b.role)) return NextResponse.json({ error: "Perfil invalido" }, { status: 400 });
    data.role = b.role;
  }
  if (b.unitId !== undefined) {
    if (b.unitId) {
      const unit = await prisma.unit.findFirst({ where: { id: b.unitId, tenantId: ctx.tenantId } });
      if (!unit) return NextResponse.json({ error: "Unidade invalida" }, { status: 400 });
    }
    data.unitId = b.unitId || null;
  }
  if (b.isActive !== undefined) data.isActive = !!b.isActive;

  const u = await prisma.user.update({ where: { id: params.id }, data });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "UPDATE", entity: "User", entityId: u.id, details: u.email } });
  return NextResponse.json(u);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  if (!["ADMIN", "GESTOR"].includes(ctx.session.role)) {
    return NextResponse.json({ error: "Apenas ADMIN/GESTOR podem desativar usuarios" }, { status: 403 });
  }
  const owned = await prisma.user.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  if (owned.id === ctx.session.id) {
    return NextResponse.json({ error: "Voce nao pode desativar a si mesmo" }, { status: 400 });
  }
  const u = await prisma.user.update({ where: { id: params.id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "DEACTIVATE", entity: "User", entityId: u.id, details: u.email } });
  return NextResponse.json({ ok: true });
}
