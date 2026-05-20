"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tutor = {
  id?: string;
  name?: string;
  document?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

export function TutorForm({ initial }: { initial?: Tutor }) {
  const router = useRouter();
  const [t, setT] = useState<Tutor>(initial ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Tutor>(k: K, v: any) { setT((p) => ({ ...p, [k]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch(initial?.id ? `/api/tutors/${initial.id}` : "/api/tutors", {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      const j = await res.json();
      router.push(`/tutores/${j.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm("Excluir tutor (exclusao logica)?")) return;
    await fetch(`/api/tutors/${initial.id}`, { method: "DELETE" });
    router.push("/tutores"); router.refresh();
  }

  return (
    <form onSubmit={save} className="card card-pad space-y-4 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">Nome *</label><input className="input" required value={t.name ?? ""} onChange={(e) => update("name", e.target.value)} /></div>
        <div><label className="label">CPF / CNPJ</label><input className="input" value={t.document ?? ""} onChange={(e) => update("document", e.target.value)} /></div>
        <div><label className="label">Telefone</label><input className="input" value={t.phone ?? ""} onChange={(e) => update("phone", e.target.value)} /></div>
        <div><label className="label">WhatsApp</label><input className="input" value={t.whatsapp ?? ""} onChange={(e) => update("whatsapp", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">E-mail</label><input className="input" type="email" value={t.email ?? ""} onChange={(e) => update("email", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Endereco</label><input className="input" value={t.address ?? ""} onChange={(e) => update("address", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Observacoes</label><textarea className="input" rows={3} value={t.notes ?? ""} onChange={(e) => update("notes", e.target.value)} /></div>
      </div>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="flex gap-2 pt-2">
        <button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>Cancelar</button>
        {initial?.id && <button type="button" className="btn-danger ml-auto" onClick={remove}>Excluir</button>}
      </div>
    </form>
  );
}
