"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayableActions({ suppliers }: { suppliers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ supplierId: "", category: "", description: "", amount: 0, dueDate: "", recurring: false, costCenter: "" });

  async function create() {
    if (!f.description || !f.dueDate) return alert("Preencha descricao e vencimento");
    await fetch("/api/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "payable", ...f }) });
    setOpen(false); router.refresh();
  }

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="btn-primary">{open ? "Fechar" : "+ Nova conta a pagar"}</button>
      {open && (
        <div className="card card-pad mt-2 grid sm:grid-cols-3 gap-2">
          <select className="input" value={f.supplierId} onChange={(e) => setF({ ...f, supplierId: e.target.value })}>
            <option value="">Fornecedor (opcional)</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="input" placeholder="Categoria" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
          <input className="input" placeholder="Centro de custo" value={f.costCenter} onChange={(e) => setF({ ...f, costCenter: e.target.value })} />
          <input className="input sm:col-span-2" placeholder="Descricao" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <input className="input" type="number" step="0.01" placeholder="Valor" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
          <input className="input" type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.recurring} onChange={(e) => setF({ ...f, recurring: e.target.checked })} /> Recorrente</label>
          <button onClick={create} className="btn-primary sm:col-span-3">Salvar</button>
        </div>
      )}
    </div>
  );
}
