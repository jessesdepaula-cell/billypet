"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TransferForm({ products, units }: { products: { id: string; name: string }[]; units: { id: string; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ productId: "", fromUnitId: units[0]?.id ?? "", toUnitId: units[1]?.id ?? units[0]?.id ?? "", quantity: 1 });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.fromUnitId === f.toUnitId) return setErr("Origem e destino devem ser diferentes");
    setSaving(true); setErr(null);
    const res = await fetch("/api/stock/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setSaving(false);
    if (!res.ok) { const j = await res.json(); return setErr(j.error || "Erro"); }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card card-pad space-y-3">
      <h3 className="font-semibold">Nova transferencia</h3>
      <div><label className="label">Produto</label>
        <select className="input" value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
          <option value="">Selecione...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div><label className="label">De</label>
        <select className="input" value={f.fromUnitId} onChange={(e) => setF({ ...f, fromUnitId: e.target.value })}>{units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
      </div>
      <div><label className="label">Para</label>
        <select className="input" value={f.toUnitId} onChange={(e) => setF({ ...f, toUnitId: e.target.value })}>{units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
      </div>
      <div><label className="label">Quantidade</label><input className="input" type="number" step="0.01" value={f.quantity} onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })} /></div>
      {err && <div className="text-sm text-red-700">{err}</div>}
      <button className="btn-primary w-full" disabled={saving}>{saving ? "Salvando..." : "Transferir"}</button>
    </form>
  );
}
