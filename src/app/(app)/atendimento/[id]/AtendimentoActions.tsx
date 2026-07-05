"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldAlert, PawPrint, Clock } from "lucide-react";
import { fmtDate } from "@/lib/utils";

type AtendimentoActionsProps = {
  appointmentId: string;
  currentScheduledAt: string;
  pet: any;
};

export function AtendimentoActions({ appointmentId, currentScheduledAt, pet }: AtendimentoActionsProps) {
  const router = useRouter();
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(currentScheduledAt.slice(0, 16));
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
                onClick={() => router.push(`/pets/${pet.id}`)}
                className="btn-primary bg-slate-800 hover:bg-slate-900 border-0 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-white mt-1 shadow-soft"
              >
                <PawPrint className="h-4 w-4" /> Ver Ficha Clinica Completa
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
