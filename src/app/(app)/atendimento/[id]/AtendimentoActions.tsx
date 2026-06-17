"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Trash2, ShieldAlert, PawPrint, FileText, Syringe, FlaskConical, BedDouble, Stethoscope, Clock, Check, X } from "lucide-react";
import { fmtDate, fmtDateTime, fmtTime, ageFromBirth } from "@/lib/utils";

type AtendimentoActionsProps = {
  appointmentId: string;
  currentScheduledAt: string;
  pet: any;
};

export function AtendimentoActions({ appointmentId, currentScheduledAt, pet }: AtendimentoActionsProps) {
  const router = useRouter();
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(currentScheduledAt.slice(0, 16));
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReschedule() {
    if (!newDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newDate }),
      });
      if (res.ok) {
        setRescheduling(false);
        router.refresh();
      } else {
        alert("Erro ao reagendar");
      }
    } catch (err) {
      alert("Erro de conexao ao reagendar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("ATENCAO: Excluir este agendamento permanentemente? Se houver prontuario ou receitas vinculadas, elas tambem serao deletadas. Esta acao nao pode ser desfeita.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/agenda");
        router.refresh();
      } else {
        alert("Erro ao excluir agendamento");
      }
    } catch (err) {
      alert("Erro ao conectar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Active Protocols Alert */}
      {pet?.protocols && pet.protocols.length > 0 && (
        <div className="card bg-amber-50 border-amber-200 p-4 rounded-xl text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <span>Protocolo(s) Ativo(s) Detectado(s)</span>
          </div>
          <p className="text-xs">Este animal possui protocolos de saude em andamento:</p>
          <ul className="text-xs list-disc list-inside space-y-1 pl-1 font-medium">
            {pet.protocols.map((pr: any) => {
              const pendingDoses = pr.doses.filter((d: any) => d.status === "PENDENTE");
              const nextDose = pendingDoses[0];
              return (
                <li key={pr.id}>
                  {pr.name} ({pr.type})
                  {nextDose && (
                    <span className="text-amber-700 font-semibold block pl-4">
                      Proxima aplicacao prevista para: {fmtDate(nextDose.dueDate)} ({nextDose.notes || "Sem notas"})
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Quick Actions Panel */}
      <div className="card card-pad bg-white">
        <h3 className="font-semibold mb-3 text-slate-800">Acoes do Agendamento</h3>
        
        {rescheduling ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3 mb-3">
            <label className="label text-xs">Nova Data e Hora</label>
            <input
              type="datetime-local"
              className="input text-xs"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReschedule}
                disabled={loading}
                className="btn-primary py-1 px-3 text-xs"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setRescheduling(false)}
                className="btn-outline py-1 px-3 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setRescheduling(true)}
              className="btn-outline border-brand-200 text-brand-700 hover:bg-brand-50 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold"
            >
              <Clock className="h-4 w-4" /> Reagendar Atendimento
            </button>
            
            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn-outline border-red-200 text-red-700 hover:bg-red-50 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold"
            >
              <Trash2 className="h-4 w-4" /> Excluir Agendamento
            </button>
            
            {pet && (
              <button
                onClick={() => setShowDrawer(true)}
                className="btn-primary bg-slate-800 hover:bg-slate-900 border-0 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-white mt-1 shadow-soft"
              >
                <PawPrint className="h-4 w-4" /> Ver Ficha Clinica Completa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sliding Drawer for Pet's Full Clinical File */}
      {showDrawer && pet && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDrawer(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-2xl bg-white shadow-xl flex flex-col min-h-screen">
              {/* Drawer Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Ficha Clinica: {pet.name}</h2>
                  <p className="text-xs text-slate-400">
                    {pet.species} {pet.breed ? ` - ${pet.breed}` : ""} • {ageFromBirth(pet.birthDate)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* General data summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500">Sexo:</span> <strong className="text-slate-700">{pet.sex || "-"}</strong></div>
                  <div><span className="text-slate-500">Peso:</span> <strong className="text-slate-700">{pet.weightKg ? `${pet.weightKg} kg` : "-"}</strong></div>
                  <div><span className="text-slate-500">Reproducao:</span> <strong className="text-slate-700">{pet.neutered === true ? "Castrado" : pet.neutered === false ? "Fertil" : "-"}</strong></div>
                  <div><span className="text-slate-500">Cor:</span> <strong className="text-slate-700">{pet.color || "-"}</strong></div>
                  <div className="col-span-2"><span className="text-slate-500">Microchip:</span> <strong className="text-slate-700">{pet.microchip || "-"}</strong></div>
                  {pet.medicalAlert && (
                    <div className="col-span-2 text-red-700 font-semibold bg-red-50 p-2 rounded border border-red-100 flex items-center gap-1.5 mt-1">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Alerta Medico: {pet.medicalAlert}</span>
                    </div>
                  )}
                </div>

                {/* Prontuario & Timeline of Clinical Records */}
                <div>
                  <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5 border-b pb-1">
                    <Stethoscope className="h-4 w-4 text-brand-500" /> Prontuario & Historico de Consultas
                  </h3>
                  {pet.medicalRecords?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">Sem consultas registradas.</p>
                  ) : (
                    <div className="border-l border-slate-200 pl-3 ml-1 space-y-4">
                      {pet.medicalRecords?.map((m: any) => (
                        <div key={m.id} className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1">
                          <div className="text-[10px] text-slate-400 font-semibold flex justify-between">
                            <span>{fmtDateTime(m.createdAt)}</span>
                            <span>Vet: {m.vet?.name}</span>
                          </div>
                          {m.diagnosis && <div><b>Diagnostico:</b> {m.diagnosis}</div>}
                          {m.conduct && <div><b>Conduta:</b> {m.conduct}</div>}
                          {m.prescriptions?.length > 0 && (
                            <div className="text-[10px] bg-brand-50/50 p-1.5 rounded border border-brand-100 mt-1">
                              <b>Receita:</b> {m.prescriptions.map((r: any) => `${r.medication} (${r.dosage})`).join("; ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vaccines List */}
                <div>
                  <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5 border-b pb-1">
                    <Syringe className="h-4 w-4 text-accent-500" /> Vacinas Aplicadas
                  </h3>
                  {pet.vaccines?.length === 0 ? (
                    <p className="text-xs text-slate-500">Nenhuma vacina registrada.</p>
                  ) : (
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b"><th className="py-1 font-semibold">Vacina</th><th className="py-1 font-semibold">Data</th><th className="py-1 font-semibold text-right">Proxima Dose</th></tr>
                      </thead>
                      <tbody>
                        {pet.vaccines?.map((v: any) => (
                          <tr key={v.id} className="border-b border-slate-100">
                            <td className="py-1.5 font-medium text-slate-800">{v.name}</td>
                            <td className="py-1.5 text-slate-500">{fmtDate(v.appliedAt)}</td>
                            <td className="py-1.5 text-right font-medium text-brand-600">{v.nextDose ? fmtDate(v.nextDose) : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Exams List */}
                <div>
                  <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5 border-b pb-1">
                    <FlaskConical className="h-4 w-4 text-brand-500" /> Exames Laboratoriais
                  </h3>
                  {pet.exams?.length === 0 ? (
                    <p className="text-xs text-slate-500">Sem exames registrados.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {pet.exams?.map((e: any) => (
                        <li key={e.id} className="flex justify-between border-b border-slate-100 pb-1">
                          <div>
                            <span className="font-medium text-slate-800">{e.name}</span>
                            {e.result && <span className="text-[10px] text-slate-500 block">Resultado: {e.result}</span>}
                          </div>
                          <span className="badge-gray text-[10px] self-start">{e.status.toLowerCase()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Hospitalizations */}
                <div>
                  <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5 border-b pb-1">
                    <BedDouble className="h-4 w-4 text-emerald-500" /> Internacoes
                  </h3>
                  {pet.hospitalizations?.length === 0 ? (
                    <p className="text-xs text-slate-500">Sem historico de internacao.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {pet.hospitalizations?.map((h: any) => (
                        <li key={h.id} className="flex justify-between border-b border-slate-100 pb-1">
                          <span>{fmtDate(h.admittedAt)} - {h.reason}</span>
                          <span className="badge-gray text-[10px]">{h.status.toLowerCase()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowDrawer(false)}
                  className="btn-outline px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Fechar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
