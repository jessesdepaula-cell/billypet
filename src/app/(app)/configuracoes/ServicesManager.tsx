"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

type Service = {
  id: string;
  name: string;
  category: string | null;
  durationMinutes: number;
  price: number;
  commissionPct: number;
  isActive: boolean;
};

const CATEGORIES = ["Consulta", "Banho", "Tosa", "Vacina", "Exame", "Cirurgia", "Procedimento", "Outro"];

export function ServicesManager({ initial }: { initial: Service[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Service[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Service> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing("new");
    setDraft({ name: "", category: "Consulta", durationMinutes: 30, price: 0, commissionPct: 0, isActive: true });
  }
  function startEdit(s: Service) {
    setEditing(s.id);
    setDraft({ ...s });
  }
  function cancel() {
    setEditing(null);
    setDraft(null);
    setError(null);
  }

  async function save() {
    if (!draft?.name?.trim()) { setError("Nome obrigatorio"); return; }
    setBusy(true); setError(null);
    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/services" : `/api/services/${editing}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha");
      if (isNew) setItems((arr) => [...arr, j].sort((a, b) => a.name.localeCompare(b.name)));
      else setItems((arr) => arr.map((x) => (x.id === editing ? j : x)));
      cancel();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Desativar servico "${name}"? Ele some das listas mas o historico fica preservado.`)) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((arr) => arr.map((x) => (x.id === id ? { ...x, isActive: false } : x)));
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Servicos</h3>
        <button className="btn-primary text-xs" onClick={startCreate} disabled={!!editing}>
          <Plus className="h-3.5 w-3.5" /> Novo
        </button>
      </div>

      {error && editing === "new" && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 mb-2">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="bp-table text-xs">
          <thead><tr><th>Nome</th><th>Categoria</th><th>Tempo</th><th>Preco</th><th>Comissao</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {editing === "new" && draft && (
              <RowForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} busy={busy} />
            )}
            {items.map((s) =>
              editing === s.id && draft ? (
                <tr key={s.id} className="bg-amber-50">
                  <RowFormCells draft={draft} setDraft={setDraft} />
                  <td>
                    <button onClick={save} disabled={busy} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded" title="Salvar"><Check className="h-4 w-4" /></button>
                    <button onClick={cancel} className="text-slate-500 hover:bg-slate-100 p-1 rounded" title="Cancelar"><X className="h-4 w-4" /></button>
                  </td>
                </tr>
              ) : (
                <tr key={s.id} className={s.isActive ? "" : "opacity-50"}>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.category || "-"}</td>
                  <td>{s.durationMinutes}min</td>
                  <td>R$ {s.price.toFixed(2)}</td>
                  <td>{s.commissionPct}%</td>
                  <td>{s.isActive ? <span className="badge-green">ativo</span> : <span className="badge-gray">inativo</span>}</td>
                  <td className="text-right whitespace-nowrap">
                    <button onClick={() => startEdit(s)} className="text-slate-500 hover:text-brand-600 p-1" title="Editar"><Pencil className="h-3.5 w-3.5" /></button>
                    {s.isActive && (
                      <button onClick={() => remove(s.id, s.name)} className="text-slate-500 hover:text-red-600 p-1" title="Desativar"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </td>
                </tr>
              )
            )}
            {items.length === 0 && editing !== "new" && (
              <tr><td colSpan={7} className="text-center py-4 text-slate-500">Nenhum servico cadastrado. Use Novo para comecar.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && editing !== "new" && error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 mt-2">{error}</div>
      )}
    </div>
  );

  function RowForm({ draft, setDraft, onSave, onCancel, busy }: any) {
    return (
      <tr className="bg-amber-50">
        <RowFormCells draft={draft} setDraft={setDraft} />
        <td>
          <button onClick={onSave} disabled={busy} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded" title="Salvar"><Check className="h-4 w-4" /></button>
          <button onClick={onCancel} className="text-slate-500 hover:bg-slate-100 p-1 rounded" title="Cancelar"><X className="h-4 w-4" /></button>
        </td>
      </tr>
    );
  }
  function RowFormCells({ draft, setDraft }: any) {
    return (
      <>
        <td><input className="input text-xs" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex: Consulta clinica" /></td>
        <td>
          <select className="input text-xs" value={draft.category ?? ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </td>
        <td><input className="input text-xs w-20" type="number" min={5} value={draft.durationMinutes ?? 30} onChange={(e) => setDraft({ ...draft, durationMinutes: Number(e.target.value) })} /></td>
        <td><input className="input text-xs w-24" type="number" step="0.01" value={draft.price ?? 0} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></td>
        <td><input className="input text-xs w-16" type="number" step="1" min={0} max={100} value={draft.commissionPct ?? 0} onChange={(e) => setDraft({ ...draft, commissionPct: Number(e.target.value) })} /></td>
        <td>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={draft.isActive !== false} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
            Ativo
          </label>
        </td>
      </>
    );
  }
}
