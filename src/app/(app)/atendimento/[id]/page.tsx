import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime, ageFromBirth } from "@/lib/utils";
import { MedicalRecordForm } from "./MedicalRecordForm";
import { PipelineSelect } from "./PipelineSelect";
import { Syringe, ClipboardList, Stethoscope, BedDouble, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AtendimentoDetailPage({ params }: { params: { id: string } }) {
  const { tenantId } = await requireModule("atendimento");
  
  const a = await prisma.appointment.findFirst({
    where: { id: params.id, unit: { tenantId } },
    include: {
      tutor: true,
      pet: {
        include: {
          vaccines: { orderBy: { appliedAt: "desc" } },
          exams: { orderBy: { requestedAt: "desc" } },
          medicalRecords: { orderBy: { createdAt: "desc" }, include: { vet: true } },
          protocols: { include: { applications: true } },
        }
      },
      vet: true,
      services: { include: { service: true } },
      medicalRecord: { include: { prescriptions: true } },
    },
  });
  
  if (!a) return notFound();

  const activeProtocols = a.pet?.protocols?.filter((p: any) => p.status === "ATIVO") || [];

  return (
    <>
      <PageHeader title={`Atendimento - ${a.pet?.name ?? "Sem pet"}`} description={`${fmtDateTime(a.scheduledAt)} - Tutor: ${a.tutor.name}`} />

      {/* Alerta de Protocolos Ativos */}
      {activeProtocols.length > 0 && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-brand-900 mb-5 flex items-start gap-3 shadow-soft">
          <Syringe className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Protocolos de Saúde Ativos</h4>
            <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
              {activeProtocols.map((pr: any) => {
                const completed = pr.applications.filter((d: any) => d.status === "APLICADO").length;
                const next = pr.applications.find((d: any) => d.status === "PENDENTE");
                return (
                  <li key={pr.id}>
                    <strong>{pr.name}</strong> ({pr.type}): {completed}/{pr.applications.length} doses aplicadas.
                    {next && <span className="text-[10px] text-slate-500 ml-1.5">(Próxima dose em: {new Date(next.plannedDate).toLocaleDateString("pt-BR")})</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Alerta de Óbito */}
      {a.pet?.deceased && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 mb-5 flex items-start gap-3 shadow-soft">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Atenção: Paciente Falecido</h4>
            <p className="text-xs mt-0.5">Óbito registrado para este pet. Descarte procedimentos clínicos se necessário.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-pad">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Resumo do Agendamento</h2>
              <PipelineSelect id={a.id} status={a.status} stage={a.pipelineStage} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Pet:</span> <b>{a.pet?.name ?? "-"}</b> ({a.pet?.species})</div>
              <div><span className="text-slate-500">Tutor:</span> <b>{a.tutor.name}</b></div>
              <div><span className="text-slate-500">Tipo:</span> {a.type}</div>
              <div><span className="text-slate-500">Profissional:</span> {a.vet?.name ?? "-"}</div>
              <div className="sm:col-span-2"><span className="text-slate-500">Servicos:</span> {a.services.map((s) => s.service.name).join(", ") || "-"}</div>
              {a.notes && <div className="sm:col-span-2"><span className="text-slate-500">Observacoes:</span> {a.notes}</div>}
              {a.pet?.medicalAlert && <div className="sm:col-span-2 text-red-700"><b>Alerta medico:</b> {a.pet.medicalAlert}</div>}
            </div>
          </div>

          <MedicalRecordForm appointmentId={a.id} initial={a.medicalRecord ?? null} />
        </div>

        {/* Barra Lateral com Informações do Paciente */}
        <div className="space-y-5">
          {/* Ficha Clínica do Paciente Integrada */}
          {a.pet && (
            <div className="card card-pad">
              <h3 className="font-semibold mb-3 flex items-center gap-1.5 text-slate-800 border-b border-slate-100 pb-2">
                <ClipboardList className="h-4.5 w-4.5 text-brand-500" /> Ficha do Paciente
              </h3>
              <div className="text-xs space-y-3">
                <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div><span className="text-slate-400">Espécie:</span> <b>{a.pet.species}</b></div>
                  <div><span className="text-slate-400">Raça:</span> <b>{a.pet.breed || "-"}</b></div>
                  <div className="col-span-2"><span className="text-slate-400">Idade:</span> <b>{ageFromBirth(a.pet.birthDate)}</b></div>
                </div>
                
                {/* Consultas Anteriores */}
                <div>
                  <div className="font-bold text-slate-700 border-b border-slate-100 pb-1 mb-1.5 flex items-center gap-1">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-400" /> Consultas Anteriores
                  </div>
                  {a.pet.medicalRecords.filter((m: any) => m.id !== a.medicalRecord?.id).length === 0 ? (
                    <span className="text-slate-400 italic">Nenhuma consulta anterior.</span>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {a.pet.medicalRecords.filter((m: any) => m.id !== a.medicalRecord?.id).map((m: any) => (
                        <div key={m.id} className="border-b border-slate-50 pb-1.5 last:border-0">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{new Date(m.createdAt).toLocaleDateString("pt-BR")}</span>
                            <span>Dr(a). {m.vet?.name}</span>
                          </div>
                          {m.diagnosis && <div className="font-semibold mt-0.5">{m.diagnosis}</div>}
                          {m.conduct && <div className="text-slate-500">{m.conduct}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Vacinas */}
                <div>
                  <div className="font-bold text-slate-700 border-b border-slate-100 pb-1 mb-1.5">Vacinas</div>
                  {a.pet.vaccines.length === 0 ? (
                    <span className="text-slate-400 italic">Nenhuma vacina aplicada.</span>
                  ) : (
                    <ul className="space-y-1 max-h-28 overflow-y-auto">
                      {a.pet.vaccines.slice(0, 5).map((v: any) => (
                        <li key={v.id} className="flex justify-between text-[11px] text-slate-600 border-b border-slate-50/50 pb-0.5">
                          <span>{v.name}</span>
                          <span className="text-slate-400">{new Date(v.appliedAt).toLocaleDateString("pt-BR")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="card card-pad">
            <h3 className="font-semibold mb-2">Acoes rapidas</h3>
            <ul className="text-sm space-y-1">
              <li><Link className="text-brand-600 hover:underline" href={`/vendas/nova?tutorId=${a.tutorId}&petId=${a.petId ?? ""}&appointmentId=${a.id}`}>Gerar venda do atendimento</Link></li>
              <li><Link className="text-brand-600 hover:underline" href={`/exames?petId=${a.petId ?? ""}`}>Solicitar exames</Link></li>
              <li><Link className="text-brand-600 hover:underline" href={`/internacao/nova?petId=${a.petId ?? ""}`}>Internar pet</Link></li>
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
