import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { PetForm } from "../PetForm";
import { fmtDate, fmtDateTime, ageFromBirth } from "@/lib/utils";
import { Syringe, FlaskConical, BedDouble, Stethoscope } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PetDetailPage({ params }: { params: { id: string } }) {
  const { tenantId } = await requireTenant();
  const p = await prisma.pet.findFirst({
    where: { id: params.id, tutor: { tenantId } },
    include: {
      tutor: true,
      vaccines: { orderBy: { appliedAt: "desc" } },
      exams: { orderBy: { requestedAt: "desc" } },
      hospitalizations: { orderBy: { admittedAt: "desc" }, include: { vet: true } },
      medicalRecords: { orderBy: { createdAt: "desc" }, include: { vet: true, prescriptions: true } },
      appointments: { orderBy: { scheduledAt: "desc" }, take: 20, include: { services: { include: { service: true } }, vet: true } },
    },
  });
  if (!p) return notFound();
  const tutors = await prisma.tutor.findMany({ where: { tenantId, isActive: true }, select: { id: true, name: true } });

  return (
    <>
      <PageHeader title={`${p.name}`} description={`${p.species}${p.breed ? " - " + p.breed : ""} - Tutor: ${p.tutor.name} - ${ageFromBirth(p.birthDate)}`} />

      {p.medicalAlert && (
        <div className="card bg-red-50 border-red-200 px-4 py-3 mb-4 text-red-700 text-sm">
          <b>Alerta medico:</b> {p.medicalAlert}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <PetForm initial={{ ...p, birthDate: p.birthDate ?? null } as any} tutors={tutors} />

          <div className="card card-pad">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-brand-500" /> Historico clinico</h2>
            {p.medicalRecords.length === 0 ? <p className="text-sm text-slate-500">Sem fichas clinicas registradas.</p> : (
              <ul className="space-y-3">{p.medicalRecords.map((m) => (
                <li key={m.id} className="border-l-2 border-brand-300 pl-3">
                  <div className="text-xs text-slate-500">{fmtDateTime(m.createdAt)} - {m.vet.name}</div>
                  {m.diagnosis && <div><b>Diagnostico:</b> {m.diagnosis}</div>}
                  {m.conduct && <div><b>Conduta:</b> {m.conduct}</div>}
                  {m.prescriptions.length > 0 && (
                    <div className="text-xs mt-1"><b>Receita:</b> {m.prescriptions.map((r) => `${r.medication} ${r.dosage} ${r.frequency}`).join("; ")}</div>
                  )}
                </li>
              ))}</ul>
            )}
          </div>

          <div className="card card-pad">
            <h2 className="font-semibold mb-3">Historico de atendimentos</h2>
            <table className="bp-table">
              <thead><tr><th>Data</th><th>Tipo</th><th>Servicos</th><th>Vet</th><th>Status</th></tr></thead>
              <tbody>
                {p.appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{fmtDateTime(a.scheduledAt)}</td>
                    <td>{a.type}</td>
                    <td>{a.services.map((s) => s.service.name).join(", ")}</td>
                    <td>{a.vet?.name ?? "-"}</td>
                    <td><span className="badge-gray">{a.status.replace(/_/g, " ").toLowerCase()}</span></td>
                  </tr>
                ))}
                {p.appointments.length === 0 && <tr><td colSpan={5} className="py-3 text-center text-slate-500">Sem registros.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card card-pad">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Syringe className="h-4 w-4 text-accent-500" /> Vacinas</h3>
            {p.vaccines.length === 0 ? <p className="text-sm text-slate-500">Sem vacinas.</p> : (
              <ul className="space-y-1 text-sm">{p.vaccines.map((v) => (
                <li key={v.id} className="flex justify-between"><span>{v.name}</span><span className="text-xs text-slate-500">{fmtDate(v.appliedAt)} - prox. {fmtDate(v.nextDose)}</span></li>
              ))}</ul>
            )}
          </div>
          <div className="card card-pad">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><FlaskConical className="h-4 w-4 text-brand-500" /> Exames</h3>
            {p.exams.length === 0 ? <p className="text-sm text-slate-500">Sem exames.</p> : (
              <ul className="space-y-1 text-sm">{p.exams.map((e) => (
                <li key={e.id} className="flex justify-between"><span>{e.name}</span><span className="badge-gray">{e.status.toLowerCase()}</span></li>
              ))}</ul>
            )}
          </div>
          <div className="card card-pad">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><BedDouble className="h-4 w-4 text-emerald-500" /> Internacoes</h3>
            {p.hospitalizations.length === 0 ? <p className="text-sm text-slate-500">Nunca internado.</p> : (
              <ul className="space-y-1 text-sm">{p.hospitalizations.map((h) => (
                <li key={h.id} className="flex justify-between"><span>{fmtDate(h.admittedAt)} - {h.reason}</span><span className="badge-gray">{h.status.toLowerCase()}</span></li>
              ))}</ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
