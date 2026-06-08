import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  
  const owned = await prisma.appointmentType.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  
  const b = await req.json();
  const name = b.name?.trim();
  if (!name) return NextResponse.json({ error: "Nome obrigatorio" }, { status: 400 });

  if (name !== owned.name) {
    const existing = await prisma.appointmentType.findFirst({
      where: { tenantId: ctx.tenantId, name: { equals: name } }
    });
    if (existing) {
      return NextResponse.json({ error: "Este tipo de atendimento ja existe" }, { status: 400 });
    }
  }

  const c = await prisma.appointmentType.update({
    where: { id: params.id },
    data: { name }
  });
  return NextResponse.json(c);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  
  const owned = await prisma.appointmentType.findFirst({ where: { id: params.id, tenantId: ctx.tenantId } });
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  
  const inUse = await prisma.appointment.count({
    where: {
      type: owned.name,
      unit: { tenantId: ctx.tenantId }
    }
  });
  if (inUse > 0) {
    return NextResponse.json({ error: `Em uso por ${inUse} agendamento(s)` }, { status: 400 });
  }
  
  await prisma.appointmentType.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
