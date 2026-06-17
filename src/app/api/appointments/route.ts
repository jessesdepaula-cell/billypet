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
      services: { include: { service: true } },
      collaborators: { include: { collaborator: true } },
    },
    orderBy: { scheduledAt: "asc" }, take: 500,
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  
  const tutor = await prisma.tutor.findFirst({ where: { id: b.tutorId, tenantId: ctx.tenantId } });
  if (!tutor) return NextResponse.json({ error: "Tutor invalido" }, { status: 400 });

  // Se houver petId, verifica se o pet tem óbito registrado
  if (b.petId) {
    const pet = await prisma.pet.findUnique({ where: { id: b.petId } });
    if (pet?.deceased && !b.confirmDeceased) {
      return NextResponse.json({ error: "O pet esta registrado como OBITO. Requer confirmacao explicita para agendar." }, { status: 400 });
    }
  }

  // Define um vetId principal (primeiro colaborador selecionado, se houver conta vinculada) para manter retrocompatibilidade
  let primaryVetId = b.vetId || null;
  if (b.collaboratorIds?.length && !primaryVetId) {
    const firstCollab = await prisma.collaborator.findUnique({
      where: { id: b.collaboratorIds[0] },
      select: { userId: true }
    });
    if (firstCollab?.userId) primaryVetId = firstCollab.userId;
  }

  const a = await prisma.appointment.create({
    data: {
      unitId: b.unitId || ctx.unitId,
      tutorId: b.tutorId,
      petId: b.petId || null,
      vetId: primaryVetId,
      scheduledAt: new Date(b.scheduledAt),
      type: b.type || "CONSULTA",
      status: b.status || "AGENDADO",
      notes: b.notes || null,
      services: b.serviceIds?.length ? { create: b.serviceIds.map((id: string) => ({ serviceId: id, price: 0 })) } : undefined,
      collaborators: b.collaboratorIds?.length ? {
        create: b.collaboratorIds.map((cid: string) => ({ collaboratorId: cid }))
      } : undefined,
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
