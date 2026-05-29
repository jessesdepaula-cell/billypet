import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); const to = searchParams.get("to");
  const where: any = { unit: { tenantId: ctx.tenantId } };
  if (from || to) where.scheduledAt = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };
  const list = await prisma.appointment.findMany({
    where,
    include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
    orderBy: { scheduledAt: "asc" }, take: 500,
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  // valida tutor pertence ao tenant
  const tutor = await prisma.tutor.findFirst({ where: { id: b.tutorId, tenantId: ctx.tenantId } });
  if (!tutor) return NextResponse.json({ error: "Tutor invalido" }, { status: 400 });
  const a = await prisma.appointment.create({
    data: {
      unitId: b.unitId || ctx.unitId,
      tutorId: b.tutorId, petId: b.petId || null, vetId: b.vetId || null,
      scheduledAt: new Date(b.scheduledAt), type: b.type || "CONSULTA",
      status: b.status || "AGENDADO", notes: b.notes || null,
      services: b.serviceIds?.length ? { create: b.serviceIds.map((id: string) => ({ serviceId: id, price: 0 })) } : undefined,
    },
  });
  if (b.serviceIds?.length) {
    const services = await prisma.service.findMany({ where: { id: { in: b.serviceIds }, tenantId: ctx.tenantId } });
    for (const sv of services) {
      await prisma.appointmentService.updateMany({ where: { appointmentId: a.id, serviceId: sv.id }, data: { price: sv.price } });
    }
  }
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Appointment", entityId: a.id } });
  return NextResponse.json(a);
}
