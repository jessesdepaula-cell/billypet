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
    include: {
      tutor: true,
      pet: true,
      vet: true,
      statusRelation: true,
      professionals: { include: { user: true } },
      services: { include: { service: true } }
    },
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

  // valida se pet pertence ao tenant e se está ativo/falecido
  if (b.petId) {
    const pet = await prisma.pet.findFirst({ where: { id: b.petId, tutor: { tenantId: ctx.tenantId } } });
    if (!pet) return NextResponse.json({ error: "Pet invalido" }, { status: 400 });
    if (pet.deceased && !b.force) {
      return NextResponse.json({
        error: "PET_DECEASED",
        message: `O pet ${pet.name} está registrado como óbito. Tem certeza que deseja agendar?`
      }, { status: 422 });
    }
  }

  const firstVetId = b.professionalIds?.length ? b.professionalIds[0] : (b.vetId || null);

  const a = await prisma.appointment.create({
    data: {
      unitId: b.unitId || ctx.unitId,
      tutorId: b.tutorId,
      petId: b.petId || null,
      vetId: firstVetId,
      scheduledAt: new Date(b.scheduledAt),
      type: b.type || "CONSULTA",
      status: b.status || "AGENDADO",
      statusId: b.statusId || null,
      notes: b.notes || null,
      services: b.serviceIds?.length ? { create: b.serviceIds.map((id: string) => ({ serviceId: id, price: 0 })) } : undefined,
    },
  });

  if (b.professionalIds?.length) {
    await prisma.appointmentProfessional.createMany({
      data: b.professionalIds.map((userId: string) => ({
        appointmentId: a.id,
        userId,
      })),
    });
  }

  if (b.serviceIds?.length) {
    const services = await prisma.service.findMany({ where: { id: { in: b.serviceIds }, tenantId: ctx.tenantId } });
    for (const sv of services) {
      await prisma.appointmentService.updateMany({ where: { appointmentId: a.id, serviceId: sv.id }, data: { price: sv.price } });
    }
  }

  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Appointment", entityId: a.id } });
  return NextResponse.json(a);
}
