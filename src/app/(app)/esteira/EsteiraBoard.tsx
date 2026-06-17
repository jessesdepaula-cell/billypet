"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type StatusOpt = {
  id: string;
  name: string;
  color: string;
};

type Card = {
  id: string;
  scheduledAt: string | Date;
  type: string;
  pipelineStage: string;
  stageEnteredAt: string | Date;
  status: string;
  tutor: { name: string };
  pet: { name: string } | null;
  vet: { name: string } | null;
  services: { service: { name: string } }[];
};

export function EsteiraBoard({ cards, statuses }: { cards: Card[]; statuses: StatusOpt[] }) {
  const router = useRouter();
  const [items, setItems] = useState(cards);

  function elapsed(d: string | Date) {
    const ms = Date.now() - new Date(d).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 60) return `${min}m`;
    return `${Math.floor(min / 60)}h${min % 60}m`;
  }

  async function move(id: string, toStatus: string) {
    // Atualiza localmente
    setItems((p) =>
      p.map((c) => (c.id === id ? { ...c, status: toStatus, pipelineStage: toStatus, stageEnteredAt: new Date() } : c))
    );
    // Envia patch para atualizar tanto status quanto pipelineStage
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: toStatus, pipelineStage: toStatus }),
    });
    router.refresh();
  }

  function onDrop(e: React.DragEvent, to: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) move(id, to);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start">
      {statuses.map((stage) => {
        // Filtra appointments por status
        const list = items.filter((c) => c.status === stage.name || c.pipelineStage === stage.name);
        return (
          <div
            key={stage.id}
            className="card card-pad min-w-[260px] w-80 flex-shrink-0 bg-slate-50 border-t-4"
            style={{ borderTopColor: stage.color }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, stage.name)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {stage.name.replace(/_/g, " ").toLowerCase()}
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-soft"
                style={{ backgroundColor: stage.color }}
              >
                {list.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[150px] max-h-[60vh] overflow-y-auto pr-1">
              {list.map((c) => (
                <Link
                  href={`/atendimento/${c.id}`}
                  key={c.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                  className="block rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-300 transition-all hover:shadow-soft"
                >
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span className="font-semibold text-slate-700">
                      {new Date(c.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="bg-slate-100 px-1 rounded text-slate-600 font-medium text-[9px] scale-95 origin-right">
                      {elapsed(c.stageEnteredAt)}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-800 mt-1">{c.pet?.name ?? "Sem pet"}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{c.tutor.name}</div>
                  <div className="text-[10px] text-brand-600 font-medium mt-2 truncate bg-brand-50/50 px-1.5 py-0.5 rounded border border-brand-100/30">
                    {c.services.map((s) => s.service.name).join(", ") || c.type}
                  </div>
                </Link>
              ))}
              {list.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white">
                  Sem agendamentos
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
