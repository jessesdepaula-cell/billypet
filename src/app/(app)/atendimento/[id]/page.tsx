import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";
import { MedicalRecordForm } from "./MedicalRecordForm";
import { PipelineSelect } from "./PipelineSelect";

export default async function AtendimentoDetailPage({ params }: { params: { id: string } }) {
  const a = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      tutor: true, pet: true, vet: true,
      services: { include: { service: true } },
      medicalRecord: { include: { prescriptions: true } },
    },
  });
  if (!a) return notFound();

  return (
    <>
      <PageHeader title={`Atendimento - ${a.pet?.name ?? "Sem pet"}`} description={`${fmtDateTime(a.scheduledAt)} - Tutor: ${a.tutor.name}`} />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-pad">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Resumo</h2>
              <PipelineSelect id={a.id} status={a.status} stage={a.pipelineStage} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Pet:</span> <b>{a.pet?.name ?? "-"}</b> ({a.pet?.species})</div>
              <div><span className="text-slate-500">Tutor:</span> <b>{a.tutor.name}</b></div>
              <div><span className="text-slate-500">Tipo:</span> {a.type}</div>
              <div><span className="text-slate-500">Veterinario:</span> {a.vet?.name ?? "-"}</div>
              <div className="sm:col-span-2"><span className="text-slate-500">Servicos:</span> {a.services.map((s) => s.service.name).join(", ") || "-"}</div>
              {a.notes && <div className="sm:col-span-2"><span className="text-slate-500">Observacoes:</span> {a.notes}</div>}
              {a.pet?.medicalAlert && <div className="sm:col-span-2 text-red-700"><b>Alerta medico:</b> {a.pet.medicalAlert}</div>}
            </div>
          </div>

          <MedicalRecordForm appointmentId={a.id} initial={a.medicalRecord ?? null} />
        </div>

        <div className="space-y-5">
          <div className="card card-pad">
            <h3 className="font-semibold mb-2">Acoes rapidas</h3>
            <ul className="text-sm space-y-1">
              <li><a className="text-brand-600 hover:underline" href={`/vendas/nova?tutorId=${a.tutorId}&petId=${a.petId ?? ""}&appointmentId=${a.id}`}>Gerar venda do atendimento</a></li>
              <li><a className="text-brand-600 hover:underline" href={`/exames?petId=${a.petId ?? ""}`}>Solicitar exames</a></li>
              <li><a className="text-brand-600 hover:underline" href={`/internacao/nova?petId=${a.petId ?? ""}`}>Internar pet</a></li>
            </ul>
          </div>
          <div className="card card-pad text-xs text-slate-500">
            <b>Esteira atual:</b> {a.pipelineStage.replace(/_/g, " ").toLowerCase()}<br />
            <b>Entrou na etapa em:</b> {fmtDateTime(a.stageEnteredAt)}
          </div>
        </div>
      </div>
    </>
  );
}
