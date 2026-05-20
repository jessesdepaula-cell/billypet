"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StockForm({ products, units }: { products: { id: string; name: string; unit: string }[]; units: { id: string; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ productId: "", type: "ENTRADA", quantity: 1, reason: "", unitId: units[0]?.id ?? "" });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.productId) return alert("Selecione um produto");
    setSaving(true);
    await fetch("/api/stock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setSaving(false);
    setF({ ...f, productId: "", quantity: 1, reason: "" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card card-pad space-y-3">
      <h3 className="font-semibold">Nova movimentacao</h3>
      <div><label className="label">Produto</label>
        <select className="input" value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
          <option value="">Selecione...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div><label className="label">Unidade</label>
        <select className="input" value={f.unitId} onChange={(e) => setF({ ...f, unitId: e.target.value })}>{units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
      </div>
      <div><label className="label">Tipo</label>
        <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          <option value="ENTRADA">Entrada manual</option>
          <option value="XML">Entrada por XML</option>
          <option value="SAIDA_USO">Saida (uso em atendimento)</option>
          <option value="PERDA">Perda</option>
          <option value="AJUSTE">Ajuste</option>
          <option value="DEVOLUCAO">Devolucao</option>
        </select>
      </div>
      <div><label className="label">Quantidade</label><input className="input" type="number" step="0.01" value={f.quantity} onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })} /></div>
      <div><label className="label">Motivo / observacao</label><input className="input" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></div>
      <button className="btn-primary w-full" disabled={saving}>{saving ? "Salvando..." : "Movimentar"}</button>
    </form>
  );
}
