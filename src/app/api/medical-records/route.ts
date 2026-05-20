import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await requireSession();
  const b = await req.json();
  const appt = await prisma.appointment.findUnique({ where: { id: b.appointmentId } });
  if (!appt || !appt.petId) return NextResponse.json({ error: "Atendimento invalido" }, { status: 400 });

  const existing = await prisma.medicalRecord.findUnique({ where: { appointmentId: b.appointmentId } });
  if (existing) {
    const upd = await prisma.medicalRecord.update({
      where: { id: existing.id },
      data: {
        complaint: b.complaint, anamnesis: b.anamnesis, physicalExam: b.physicalExam,
        diagnosis: b.diagnosis, conduct: b.conduct, procedures: b.procedures,
        observations: b.observations, recommendReturn: b.recommendReturn ? new Date(b.recommendReturn) : null,
      },
    });
    if (Array.isArray(b.prescriptions)) {
      await prisma.prescription.deleteMany({ where: { medicalRecordId: upd.id } });
      for (const p of b.prescriptions) if (p.medication) await prisma.prescription.create({ data: { medicalRecordId: upd.id, ...p } });
    }
    return NextResponse.json(upd);
  }
  const m = await prisma.medicalRecord.create({
    data: {
      appointmentId: b.appointmentId, petId: appt.petId, vetId: s.id,
      complaint: b.complaint, anamnesis: b.anamnesis, physicalExam: b.physicalExam,
      diagnosis: b.diagnosis, conduct: b.conduct, procedures: b.procedures,
      observations: b.observations, recommendReturn: b.recommendReturn ? new Date(b.recommendReturn) : null,
      prescriptions: { create: (b.prescriptions ?? []).filter((p: any) => p.medication) },
    },
  });
  await prisma.auditLog.create({ data: { userId: s.id, action: "CREATE", entity: "MedicalRecord", entityId: m.id } });
  return NextResponse.json(m);
}
