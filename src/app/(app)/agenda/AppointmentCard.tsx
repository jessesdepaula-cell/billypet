"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Trash2, X, Check, Clock, FileText } from "lucide-react";
import { fmtTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const COLOR_CLASSES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
};

export function AppointmentCard({ appointment: a }: { appointment: any }) {
  const router = useRouter();
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [busy, setBusy] = useState(false);

  const formatForInput = (d: string) => {
    const date = new Date(d);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleOpenReschedule = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewDate(formatForInput(a.scheduledAt));
    setRescheduling(true);
  };

  const handleSaveReschedule = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newDate) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/appointments/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(newDate).toISOString() }),
      });
      if (res.ok) {
        setRescheduling(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao reagendar:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Excluir agendamento de ${a.pet?.name ?? "Sem pet"} permanentemente?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/appointments/${a.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao excluir agendamento:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 p-2.5 hover:border-brand-300 hover:shadow-sm bg-white transition-all relative group overflow-hidden">
      <Link href={`/atendimento/${a.id}`} className="block">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-sm text-slate-800 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" /> {fmtTime(a.scheduledAt)}
          </span>
          {/* Badge Colorido Customizado */}
          {a.statusRelation ? (
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border tracking-wider whitespace-nowrap shrink-0",
              COLOR_CLASSES[a.statusRelation.color] || "bg-slate-100 text-slate-800 border-slate-200"
            )}>
              {a.statusRelation.name}
            </span>
          ) : (
            <span className="badge-gray text-[9px] font-semibold uppercase whitespace-nowrap shrink-0">
              {a.status.replace(/_/g, " ").toLowerCase()}
            </span>
          )}
        </div>
        <div className="text-sm font-bold text-slate-800 mt-1.5">{a.pet?.name ?? "Sem pet"}</div>
        {a.vet?.name && (
          <div className="text-xs text-slate-500 font-medium">{a.vet.name}</div>
        )}
        <div className="text-xs text-brand-600 font-semibold mt-1">
          {a.services.map((s: any) => s.service.name).join(", ") || a.type}
        </div>
      </Link>

      {/* Botão para abrir ficha completa do animal */}
      {a.pet?.id && (
        <Link
          href={`/pets/${a.pet.id}`}
          className="mt-2 flex items-center justify-center gap-1.5 w-full text-[10px] font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-md py-1 px-2 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="h-3 w-3" /> Ver Ficha do Animal
        </Link>
      )}

      {/* Botões de Ação Rápida */}
      <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleOpenReschedule}
          className="p-1 rounded bg-slate-100 hover:bg-brand-50 text-slate-500 hover:text-brand-600 border border-slate-200"
          title="Reagendar data/hora"
          disabled={busy}
        >
          <Calendar className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200"
          title="Excluir agendamento"
          disabled={busy}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Modal de Reagendamento Inline */}
      {rescheduling && (
        <div className="absolute inset-0 bg-white/95 rounded-lg flex flex-col justify-center p-2 z-10 border border-brand-300 shadow-lg">
          <span className="text-[10px] font-bold text-slate-600 mb-1">Escolha nova data:</span>
          <div className="flex gap-1 items-center">
            <input
              type="datetime-local"
              className="input text-xs py-1 px-1.5 flex-1"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <button
              onClick={handleSaveReschedule}
              className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200"
              title="Confirmar"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRescheduling(false); }}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              title="Cancelar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
