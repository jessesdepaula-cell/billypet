"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check, Paintbrush } from "lucide-react";

type AppointmentStatus = {
  id: string;
  name: string;
  color: string;
  position: number;
  isActive: boolean;
};

export function AppointmentStatusManager() {
  const router = useRouter();
  const [items, setItems] = useState<AppointmentStatus[]>([]);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState("#cbd5e1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  async function fetchStatuses() {
    const res = await fetch("/api/appointment-statuses");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
  }

  function startCreate() {
    setEditingId("new");
    setDraftName("");
    setDraftColor("#3b82f6");
    setError(null);
  }

  function startEdit(status: AppointmentStatus) {
    setEditingId(status.id);
    setDraftName(status.name);
    setDraftColor(status.color);
    setError(null);
  }

  async function save() {
    if (!draftName.trim()) {
      setError("Nome e obrigatorio");
      return;
    }
    setBusy(true);
    setError(null);

    const body = {
      name: draftName,
      color: draftColor,
    };

    try {
      const isNew = editingId === "new";
      const res = await fetch(isNew ? "/api/appointment-statuses" : `/api/appointment-statuses/${editingId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erro ao salvar");

      setEditingId(null);
      fetchStatuses();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Desativar status "${name}"? Agendamentos existentes nao serao alterados.`)) return;
    const res = await fetch(`/api/appointment-statuses/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchStatuses();
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-brand-600" /> Cores e Status de Agendamento
        </h3>
        <button className="btn-primary text-xs" onClick={startCreate} disabled={!!editingId}>
          <Plus className="h-3.5 w-3.5" /> Novo Status
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 mb-2">{error}</div>}

      <div className="overflow-x-auto">
        <table className="bp-table text-xs">
          <thead>
            <tr>
              <th>Status</th>
              <th>Cor (Hexadecimal)</th>
              <th>Pre-visualizacao</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {editingId === "new" && (
              <tr className="bg-amber-50">
                <td>
                  <input className="input text-xs uppercase" value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="EX: AGENDADO" />
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <input type="color" className="w-6 h-6 border-0 rounded cursor-pointer" value={draftColor} onChange={(e) => setDraftColor(e.target.value)} />
                    <input className="input text-xs w-20" value={draftColor} onChange={(e) => setDraftColor(e.target.value)} />
                  </div>
                </td>
                <td>
                  <span className="px-2 py-0.5 rounded text-[10px] text-white font-medium" style={{ backgroundColor: draftColor }}>
                    {draftName || "EXEMPLO"}
                  </span>
                </td>
                <td>-</td>
                <td className="whitespace-nowrap">
                  <button onClick={save} disabled={busy} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded" title="Salvar">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-slate-500 hover:bg-slate-100 p-1 rounded" title="Cancelar">
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )}

            {items.map((s) =>
              editingId === s.id ? (
                <tr key={s.id} className="bg-amber-50">
                  <td>
                    <input className="input text-xs uppercase" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <input type="color" className="w-6 h-6 border-0 rounded cursor-pointer" value={draftColor} onChange={(e) => setDraftColor(e.target.value)} />
                      <input className="input text-xs w-20" value={draftColor} onChange={(e) => setDraftColor(e.target.value)} />
                    </div>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] text-white font-medium" style={{ backgroundColor: draftColor }}>
                      {draftName}
                    </span>
                  </td>
                  <td>-</td>
                  <td className="whitespace-nowrap">
                    <button onClick={save} disabled={busy} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded" title="Salvar">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-slate-500 hover:bg-slate-100 p-1 rounded" title="Cancelar">
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={s.id} className={s.isActive ? "" : "opacity-50"}>
                  <td className="font-semibold text-slate-800">{s.name}</td>
                  <td><code>{s.color}</code></td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] text-white font-medium" style={{ backgroundColor: s.color }}>
                      {s.name.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>{s.isActive ? <span className="badge-green">ativo</span> : <span className="badge-gray">inativo</span>}</td>
                  <td className="text-right whitespace-nowrap">
                    <button onClick={() => startEdit(s)} className="text-slate-500 hover:text-brand-600 p-1" title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {s.isActive && (
                      <button onClick={() => remove(s.id, s.name)} className="text-slate-500 hover:text-red-600 p-1" title="Desativar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
