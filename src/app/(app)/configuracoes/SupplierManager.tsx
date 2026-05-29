"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, X } from "lucide-react";

type Supplier = {
  id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
};

export function SupplierManager({ initial }: { initial: Supplier[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", document: "", phone: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!draft.name.trim()) { setError("Nome obrigatorio"); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha");
      setItems((arr) => [...arr, j].sort((a, b) => a.name.localeCompare(b.name)));
      setAdding(false);
      setDraft({ name: "", document: "", phone: "", email: "" });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Desativar fornecedor "${name}"?`)) return;
    const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((arr) => arr.filter((x) => x.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Fornecedores</h3>
        {!adding && (
          <button className="btn-primary text-xs" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" /> Novo
          </button>
        )}
      </div>

      {adding && (
        <div className="card card-pad bg-amber-50 border-amber-200 mb-3 space-y-2">
          <input className="input text-sm" placeholder="Nome do fornecedor *" autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input text-sm" placeholder="CNPJ" value={draft.document} onChange={(e) => setDraft({ ...draft, document: e.target.value })} />
            <input className="input text-sm" placeholder="Telefone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </div>
          <input className="input text-sm" type="email" placeholder="E-mail" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          {error && <div className="text-red-700 text-xs">{error}</div>}
          <div className="flex justify-end gap-2">
            <button onClick={() => { setAdding(false); setDraft({ name: "", document: "", phone: "", email: "" }); setError(null); }} className="btn-outline text-xs"><X className="h-3.5 w-3.5" /></button>
            <button onClick={create} disabled={busy} className="btn-primary text-xs"><Check className="h-3.5 w-3.5" /> Salvar</button>
          </div>
        </div>
      )}

      <ul className="space-y-2 text-sm">
        {items.map((s) => (
          <li key={s.id} className="flex justify-between items-start group">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-slate-500">{[s.document, s.phone, s.email].filter(Boolean).join(" - ") || "sem contato"}</div>
            </div>
            <button onClick={() => remove(s.id, s.name)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 transition">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-slate-500 italic text-xs py-2">Nenhum fornecedor. Cadastre antes de gerar contas a pagar com vinculo.</li>}
      </ul>
    </div>
  );
}
