"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fmtMoney } from "@/lib/utils";

export function CashActions({ mode, id, suggestedClose }: { mode: "open" | "manage"; id?: string; suggestedClose?: number }) {
  const router = useRouter();
  const [openVal, setOpenVal] = useState(0);
  const [closeVal, setCloseVal] = useState(suggestedClose ?? 0);
  const [tx, setTx] = useState({ type: "ENTRADA", category: "", description: "", amount: 0 });

  async function openCash() {
    await fetch("/api/cash", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "open", openValue: openVal }) });
    router.refresh();
  }
  async function closeCash() {
    if (!confirm(`Fechar caixa com ${fmtMoney(closeVal)}?`)) return;
    await fetch("/api/cash", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "close", id, closeValue: closeVal }) });
    router.refresh();
  }
  async function addTx() {
    if (!tx.description || !tx.amount) return;
    await fetch("/api/cash", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "transaction", cashRegisterId: id, ...tx }) });
    setTx({ type: "ENTRADA", category: "", description: "", amount: 0 });
    router.refresh();
  }

  if (mode === "open") {
    return (
      <div className="card card-pad max-w-md">
        <h3 className="font-semibold mb-3">Abrir caixa</h3>
        <label className="label">Valor de abertura</label>
        <input className="input mb-3" type="number" step="0.01" value={openVal} onChange={(e) => setOpenVal(Number(e.target.value))} />
        <button onClick={openCash} className="btn-primary">Abrir caixa</button>
      </div>
    );
  }

  return (
    <div className="card card-pad space-y-4">
      <h3 className="font-semibold">Novo lancamento</h3>
      <div className="grid sm:grid-cols-4 gap-2">
        <select className="input" value={tx.type} onChange={(e) => setTx({ ...tx, type: e.target.value })}>
          <option value="ENTRADA">Entrada</option><option value="SAIDA">Saida</option>
          <option value="SANGRIA">Sangria</option><option value="SUPRIMENTO">Suprimento</option>
        </select>
        <input className="input" placeholder="Categoria" value={tx.category} onChange={(e) => setTx({ ...tx, category: e.target.value })} />
        <input className="input sm:col-span-2" placeholder="Descricao" value={tx.description} onChange={(e) => setTx({ ...tx, description: e.target.value })} />
        <input className="input" type="number" step="0.01" placeholder="Valor" value={tx.amount} onChange={(e) => setTx({ ...tx, amount: Number(e.target.value) })} />
        <button onClick={addTx} className="btn-primary sm:col-span-3">Lancar</button>
      </div>
      <div className="border-t pt-3">
        <h3 className="font-semibold mb-2">Fechar caixa</h3>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><label className="label">Valor de fechamento</label><input className="input" type="number" step="0.01" value={closeVal} onChange={(e) => setCloseVal(Number(e.target.value))} /></div>
          <button onClick={closeCash} className="btn-danger">Fechar caixa</button>
        </div>
      </div>
    </div>
  );
}
