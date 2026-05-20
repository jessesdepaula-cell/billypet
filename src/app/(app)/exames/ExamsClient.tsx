"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Exam = { id: string; name: string; status: string; pet: string; tutor: string; requestedAt: string; result: string | null; resultAt: string | null };

const STATUSES = ["SOLICITADO", "COLETADO", "EM_ANALISE", "DISPONIVEL", "CANCELADO"];

export function ExamsClient({ exams, pets }: { exams: Exam[]; pets: { id: string; label: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [petId, setPetId] = useState("");
  const [editing, setEditing] = useState<{ id: string; result: string } | null>(null);

  async function create() {
    if (!name || !petId) return;
    await fetch("/api/exams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, petId }) });
    setName(""); setPetId(""); router.refresh();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/exams/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    router.refresh();
  }

  async function saveResult() {
    if (!editing) return;
    await fetch(`/api/exams/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ result: editing.result, status: "DISPONIVEL" }) });
    setEditing(null); router.refresh();
  }

  return (
    <>
      <div className="card card-pad mb-5">
        <h3 className="font-semibold mb-3">Solicitar exame</h3>
        <div className="flex flex-wrap gap-2">
          <select className="input flex-1 min-w-[200px]" value={petId} onChange={(e) => setPetId(e.target.value)}>
            <option value="">Pet...</option>{pets.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <input className="input flex-1 min-w-[200px]" placeholder="Nome do exame (ex: Hemograma)" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={create} className="btn-primary">Solicitar</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Solicitado em</th><th>Pet / Tutor</th><th>Exame</th><th>Status</th><th>Resultado</th><th></th></tr></thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id}>
                <td className="text-xs">{e.requestedAt}</td>
                <td><div className="font-medium">{e.pet}</div><div className="text-xs text-slate-500">{e.tutor}</div></td>
                <td>{e.name}</td>
                <td>
                  <select className="input py-1 text-xs" value={e.status} onChange={(ev) => setStatus(e.id, ev.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.toLowerCase().replace(/_/g, " ")}</option>)}
                  </select>
                </td>
                <td className="text-xs max-w-xs">{e.result ? <span title={e.result}>{e.result.slice(0, 60)}{e.result.length > 60 ? "..." : ""}</span> : "-"}</td>
                <td className="text-right"><button onClick={() => setEditing({ id: e.id, result: e.result ?? "" })} className="text-brand-600 text-sm hover:underline">{e.result ? "editar" : "+ resultado"}</button></td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-500">Nenhum exame.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4">
          <div className="card card-pad w-full max-w-lg space-y-3">
            <h3 className="font-semibold">Registrar resultado</h3>
            <textarea className="input" rows={6} value={editing.result} onChange={(e) => setEditing({ ...editing, result: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={saveResult} className="btn-primary">Salvar e disponibilizar</button>
              <button onClick={() => setEditing(null)} className="btn-outline">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
