"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STAGES = [
  { key: "AGUARDANDO",  label: "Aguardando chegada" },
  { key: "RECEPCAO",    label: "Recepcao" },
  { key: "TRIAGEM",     label: "Triagem" },
  { key: "EM_CONSULTA", label: "Em consulta" },
  { key: "EXAMES",      label: "Exames" },
  { key: "BANHO_TOSA",  label: "Banho e tosa" },
  { key: "INTERNACAO",  label: "Internacao" },
  { key: "PAGAMENTO",   label: "Pagamento" },
  { key: "FINALIZADO",  label: "Finalizado" },
];

type Card = {
  id: string; scheduledAt: string | Date; type: string; pipelineStage: string;
  stageEnteredAt: string | Date; status: string;
  tutor: { name: string }; pet: { name: string } | null; vet: { name: string } | null;
  services: { service: { name: string } }[];
};

export function EsteiraBoard({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const [items, setItems] = useState(cards);

  function elapsed(d: string | Date) {
    const ms = Date.now() - new Date(d).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 60) return `${min}m`;
    return `${Math.floor(min / 60)}h${min % 60}m`;
  }

  async function move(id: string, to: string) {
    setItems((p) => p.map((c) => c.id === id ? { ...c, pipelineStage: to, stageEnteredAt: new Date() } : c));
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipelineStage: to, ...(to === "FINALIZADO" ? { status: "FINALIZADO" } : {}) }),
    });
    router.refresh();
  }

  function onDrop(e: React.DragEvent, to: string) { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, to); }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STAGES.map((stage) => {
        const list = items.filter((c) => c.pipelineStage === stage.key);
        return (
          <div key={stage.key} className="card card-pad min-w-[240px] w-72 flex-shrink-0"
               onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, stage.key)}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{stage.label}</h3>
              <span className="badge-gray">{list.length}</span>
            </div>
            <div className="space-y-2 min-h-[60px]">
              {list.map((c) => (
                <Link href={`/atendimento/${c.id}`} key={c.id}
                      draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                      className="block rounded-lg border border-slate-200 bg-white p-2 hover:border-brand-300">
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>{new Date(c.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="badge-yellow">{elapsed(c.stageEnteredAt)}</span>
                  </div>
                  <div className="font-medium text-sm mt-0.5">{c.pet?.name ?? "Sem pet"}</div>
                  <div className="text-xs text-slate-500">{c.tutor.name}</div>
                  <div className="text-xs text-brand-600 mt-1 truncate">{c.services.map((s) => s.service.name).join(", ") || c.type}</div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
