"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TutorOpt = { id: string; name: string };
type Pet = {
  id?: string; name?: string; species?: string; breed?: string | null;
  sex?: string | null; neutered?: boolean | null; birthDate?: string | Date | null; weightKg?: number | null;
  color?: string | null; notes?: string | null; medicalAlert?: string | null; tutorId?: string;
};

export function PetForm({ initial, tutors }: { initial?: Pet; tutors: TutorOpt[] }) {
  const router = useRouter();
  const [p, setP] = useState<Pet>(initial ?? { species: "Canina" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function u<K extends keyof Pet>(k: K, v: any) { setP((c) => ({ ...c, [k]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const body = { ...p, birthDate: p.birthDate ? new Date(p.birthDate).toISOString() : null };
      const res = await fetch(initial?.id ? `/api/pets/${initial.id}` : "/api/pets", {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      const j = await res.json();
      router.push(`/pets/${j.id}`); router.refresh();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm("Excluir pet (exclusao logica)?")) return;
    await fetch(`/api/pets/${initial.id}`, { method: "DELETE" });
    router.push("/pets"); router.refresh();
  }

  const birthIso = p.birthDate ? new Date(p.birthDate).toISOString().slice(0, 10) : "";

  return (
    <form onSubmit={save} className="card card-pad space-y-4 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">Nome *</label><input className="input" required value={p.name ?? ""} onChange={(e) => u("name", e.target.value)} /></div>
        <div>
          <label className="label">Tutor *</label>
          <select className="input" required value={p.tutorId ?? ""} onChange={(e) => u("tutorId", e.target.value)} disabled={!!initial?.id}>
            <option value="">Selecione...</option>
            {tutors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Especie *</label>
          <select className="input" value={p.species ?? "Canina"} onChange={(e) => u("species", e.target.value)}>
            <option>Avicola</option>
            <option>Bovinos</option>
            <option>Canina</option>
            <option>Cunicula</option>
            <option>Equina</option>
            <option>Exotico</option>
            <option>Felina</option>
            <option>Outras</option>
            <option>Primata</option>
            <option>Roedor</option>
          </select>
        </div>
        <div><label className="label">Raca</label><input className="input" value={p.breed ?? ""} onChange={(e) => u("breed", e.target.value)} /></div>
        <div>
          <label className="label">Sexo</label>
          <select className="input" value={p.sex ?? ""} onChange={(e) => u("sex", e.target.value)}>
            <option value="">-</option><option value="M">Macho</option><option value="F">Femea</option>
          </select>
        </div>
        <div>
          <label className="label">Reproducao</label>
          <select
            className="input"
            value={p.neutered === true ? "castrado" : p.neutered === false ? "fertil" : ""}
            onChange={(e) => {
              const v = e.target.value;
              u("neutered", v === "castrado" ? true : v === "fertil" ? false : null);
            }}
          >
            <option value="">Nao informado</option>
            <option value="castrado">Castrado</option>
            <option value="fertil">Fertil</option>
          </select>
        </div>
        <div><label className="label">Data de nascimento</label><input className="input" type="date" value={birthIso} onChange={(e) => u("birthDate", e.target.value)} /></div>
        <div><label className="label">Peso (kg)</label><input className="input" type="number" step="0.1" value={p.weightKg ?? ""} onChange={(e) => u("weightKg", e.target.value)} /></div>
        <div><label className="label">Cor</label><input className="input" value={p.color ?? ""} onChange={(e) => u("color", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Alerta medico</label><input className="input" value={p.medicalAlert ?? ""} onChange={(e) => u("medicalAlert", e.target.value)} placeholder="Alergias, condicoes, contraindicacoes..." /></div>
        <div className="sm:col-span-2"><label className="label">Observacoes</label><textarea className="input" rows={3} value={p.notes ?? ""} onChange={(e) => u("notes", e.target.value)} /></div>
      </div>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>Cancelar</button>
        {initial?.id && <button type="button" className="btn-danger ml-auto" onClick={remove}>Excluir</button>}
      </div>
    </form>
  );
}
