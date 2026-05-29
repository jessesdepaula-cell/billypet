"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";

type Item = { id: string; name: string };

export function SimpleManager({
  title,
  initial,
  endpoint,
  emptyMessage,
}: {
  title: string;
  initial: Item[];
  endpoint: string; // ex: "/api/categories"
  emptyMessage?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!newName.trim()) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha");
      setItems((arr) => [...arr, j].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setAdding(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function update(id: string) {
    if (!editName.trim()) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha");
      setItems((arr) => arr.map((x) => (x.id === id ? { ...x, name: j.name } : x)).sort((a, b) => a.name.localeCompare(b.name)));
      setEditId(null);
      setEditName("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remover "${name}"?`)) return;
    setError(null);
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Falha ao remover");
      return;
    }
    setItems((arr) => arr.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {!adding && (
          <button className="btn-primary text-xs" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" /> Novo
          </button>
        )}
      </div>

      {adding && (
        <div className="flex gap-2 mb-3">
          <input
            className="input text-sm flex-1"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Nome do ${title.slice(0, -1).toLowerCase()}`}
            onKeyDown={(e) => { if (e.key === "Enter") create(); if (e.key === "Escape") { setAdding(false); setNewName(""); } }}
          />
          <button onClick={create} disabled={busy} className="btn-primary text-xs"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={() => { setAdding(false); setNewName(""); setError(null); }} className="btn-outline text-xs"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 mb-2">{error}</div>
      )}

      <ul className="space-y-1 text-sm">
        {items.map((it) => (
          <li key={it.id} className="flex justify-between items-center group">
            {editId === it.id ? (
              <>
                <input
                  className="input text-sm flex-1 mr-2"
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") update(it.id); if (e.key === "Escape") { setEditId(null); setEditName(""); } }}
                />
                <button onClick={() => update(it.id)} disabled={busy} className="text-emerald-600 p-1"><Check className="h-3.5 w-3.5" /></button>
                <button onClick={() => { setEditId(null); setEditName(""); }} className="text-slate-500 p-1"><X className="h-3.5 w-3.5" /></button>
              </>
            ) : (
              <>
                <span>{it.name}</span>
                <span className="opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => { setEditId(it.id); setEditName(it.name); }} className="text-slate-400 hover:text-brand-600 p-1"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(it.id, it.name)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </span>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="text-slate-500 italic text-xs py-2">{emptyMessage || "Nenhum cadastrado ainda."}</li>}
      </ul>
    </div>
  );
}
