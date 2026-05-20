import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET(req: Request) {
  await requireSession();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); const to = searchParams.get("to");
  const where: any = {};
  if (from || to) where.scheduledAt = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };
  const list = await prisma.appointment.findMany({
    where,
    include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
    orderBy: { scheduledAt: "asc" }, take: 500,
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  const a = await prisma.appointment.create({
    data: {
      unitId: b.unitId || s.unitId!,
      tutorId: b.tutorId, petId: b.petId || null, vetId: b.vetId || null,
      scheduledAt: new Date(b.scheduledAt), type: b.type || "CONSULTA",
      status: b.status || "AGENDADO", notes: b.notes || null,
      services: b.serviceIds?.length ? { create: b.serviceIds.map((id: string) => ({ serviceId: id, price: 0 })) } : undefined,
    },
  });
  // ajustar precos
  if (b.serviceIds?.length) {
    const services = await prisma.service.findMany({ where: { id: { in: b.serviceIds } } });
    for (const sv of services) {
      await prisma.appointmentService.updateMany({ where: { appointmentId: a.id, serviceId: sv.id }, data: { price: sv.price } });
    }
  }
  await prisma.auditLog.create({ data: { userId: s.id, action: "CREATE", entity: "Appointment", entityId: a.id } });
  return NextResponse.json(a);
}
