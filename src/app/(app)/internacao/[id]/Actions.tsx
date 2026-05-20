"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InternacaoActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [ev, setEv] = useState({ description: "", vitals: "", medications: "" });
  const [saving, setSaving] = useState(false);

  async function addEvolution() {
    if (!ev.description.trim()) return;
    setSaving(true);
    await fetch(`/api/hospitalizations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ evolution: ev }) });
    setEv({ description: "", vitals: "", medications: "" });
    setSaving(false);
    router.refresh();
  }

  async function discharge(kind: "ALTA" | "OBITO") {
    if (!confirm(`Confirmar ${kind === "ALTA" ? "alta" : "obito"}?`)) return;
    await fetch(`/api/hospitalizations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: kind }) });
    router.refresh();
  }

  return (
    <div className="card card-pad space-y-3">
      <h3 className="font-semibold">Registrar evolucao</h3>
      <textarea className="input" rows={2} placeholder="Descricao da evolucao" value={ev.description} onChange={(e) => setEv({ ...ev, description: e.target.value })} />
      <div className="grid sm:grid-cols-2 gap-2">
        <input className="input" placeholder="Sinais vitais (FC, T, etc)" value={ev.vitals} onChange={(e) => setEv({ ...ev, vitals: e.target.value })} />
        <input className="input" placeholder="Medicacoes administradas" value={ev.medications} onChange={(e) => setEv({ ...ev, medications: e.target.value })} />
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={addEvolution} disabled={saving} className="btn-primary">{saving ? "Salvando..." : "Adicionar evolucao"}</button>
        {status === "ATIVA" && <>
          <button onClick={() => discharge("ALTA")} className="btn-outline">Dar alta</button>
          <button onClick={() => discharge("OBITO")} className="btn-danger ml-auto">Registrar obito</button>
        </>}
      </div>
    </div>
  );
}
