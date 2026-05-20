"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NovaInternacaoForm({ pets, vets, preselectedPetId }: { pets: { id: string; label: string }[]; vets: { id: string; name: string }[]; preselectedPetId?: string }) {
  const router = useRouter();
  const [f, setF] = useState({ petId: preselectedPetId ?? "", vetId: "", bed: "", reason: "", expectedAt: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const res = await fetch("/api/hospitalizations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (!res.ok) throw new Error("Falha ao criar");
      const j = await res.json();
      router.push(`/internacao/${j.id}`); router.refresh();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="card card-pad space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">Pet *</label>
          <select required className="input" value={f.petId} onChange={(e) => setF({ ...f, petId: e.target.value })}>
            <option value="">Selecione...</option>{pets.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div><label className="label">Veterinario responsavel *</label>
          <select required className="input" value={f.vetId} onChange={(e) => setF({ ...f, vetId: e.target.value })}>
            <option value="">Selecione...</option>{vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div><label className="label">Leito / Baia</label><input className="input" value={f.bed} onChange={(e) => setF({ ...f, bed: e.target.value })} /></div>
        <div><label className="label">Previsao de alta</label><input className="input" type="datetime-local" value={f.expectedAt} onChange={(e) => setF({ ...f, expectedAt: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className="label">Motivo</label><textarea className="input" rows={3} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></div>
      </div>
      {err && <div className="text-sm text-red-700">{err}</div>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Internar"}</button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>Cancelar</button>
      </div>
    </form>
  );
}
