"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
};

const COLOR_OPTIONS = [
  { value: "slate", label: "Cinza", bg: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "blue", label: "Azul", bg: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "orange", label: "Laranja", bg: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "green", label: "Verde", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "red", label: "Vermelho", bg: "bg-red-100 text-red-700 border-red-200" },
  { value: "yellow", label: "Amarelo", bg: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "purple", label: "Roxo", bg: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "pink", label: "Rosa", bg: "bg-pink-100 text-pink-700 border-pink-200" },
];

export function StatusManager({ initial }: { initial: Status[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Status[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Status> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setEditing("new");
    setDraft({ name: "", color: "slate", isActive: true });
  }

  function startEdit(s: Status) {
    setEditing(s.id);
    setDraft({ ...s });
  }

  function cancel() {
    setEditing(null);
    setDraft(null);
    setError(null);
  }

  async function save() {
    if (!draft?.name?.trim()) { setError("Nome obrigatório"); return; }
    setBusy(true); setError(null);
    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/statuses" : `/api/statuses/${editing}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha ao salvar");
      
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
    if (!confirm(`Desativar status "${name}"? Ele continuará nos agendamentos antigos mas será ocultado para novos.`)) return;
    const res = await fetch(`/api/statuses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((arr) => arr.map((x) => (x.id === id ? { ...x, isActive: false } : x)));
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">Status de Agendamento</h3>
        <button className="btn-primary text-xs" onClick={startCreate} disabled={!!editing}>
          <Plus className="h-3.5 w-3.5" /> Novo
        </button>
      </div>

      {error && editing === "new" && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 mb-2">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="bp-table text-xs">
          <thead>
            <tr>
              <th>Nome do Status</th>
              <th>Cor Visual</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {editing === "new" && draft && (
              <tr className="bg-amber-50">
                <td>
                  <input
                    className="input text-xs"
                    value={draft.name || ""}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Ex: Em Espera"
                  />
                </td>
                <td>
                  <select
                    className="input text-xs"
                    value={draft.color || "slate"}
                    onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </td>
                <td>Ativo</td>
                <td>
                  <button onClick={save} disabled={busy} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check className="h-4 w-4" /></button>
                  <button onClick={cancel} className="text-slate-500 hover:bg-slate-100 p-1 rounded"><X className="h-4 w-4" /></button>
                </td>
              </tr>
            )}
            {items.map((s) =>
              editing === s.id && draft ? (
                <tr key={s.id} className="bg-amber-50">
                  <td>
                    <input
                      className="input text-xs"
                      value={draft.name || ""}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      className="input text-xs"
                      value={draft.color || "slate"}
                      onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={draft.isActive !== false}
                        onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                      />
                      Ativo
                    </label>
                  </td>
                  <td>
                    <button onClick={save} disabled={busy} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check className="h-4 w-4" /></button>
                    <button onClick={cancel} className="text-slate-500 hover:bg-slate-100 p-1 rounded"><X className="h-4 w-4" /></button>
                  </td>
                </tr>
              ) : (
                <tr key={s.id} className={s.isActive ? "" : "opacity-50"}>
                  <td className="font-medium">{s.name}</td>
                  <td>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-semibold uppercase border",
                      COLOR_OPTIONS.find((c) => c.value === s.color)?.bg || "bg-slate-100 text-slate-800 border-slate-200"
                    )}>
                      {COLOR_OPTIONS.find((c) => c.value === s.color)?.label || s.color}
                    </span>
                  </td>
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
          </tbody>
        </table>
      </div>

      {editing && editing !== "new" && error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 mt-2">{error}</div>
      )}
    </div>
  );
}
