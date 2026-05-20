"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opt = { id: string; name: string };
type Product = {
  id?: string; name?: string; sku?: string | null; barcode?: string | null; brand?: string | null;
  categoryId?: string | null; supplierId?: string | null;
  costPrice?: number; salePrice?: number; minStock?: number; unit?: string; controlByLot?: boolean;
};

export function ProductForm({ initial, categories, suppliers }: { initial?: Product; categories: Opt[]; suppliers: Opt[] }) {
  const router = useRouter();
  const [p, setP] = useState<Product>(initial ?? { unit: "UN", costPrice: 0, salePrice: 0, minStock: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function u<K extends keyof Product>(k: K, v: any) { setP((c) => ({ ...c, [k]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch(initial?.id ? `/api/products/${initial.id}` : "/api/products", {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      const j = await res.json();
      router.push(`/produtos/${j.id}`); router.refresh();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  }

  async function remove() {
    if (!initial?.id || !confirm("Excluir produto?")) return;
    await fetch(`/api/products/${initial.id}`, { method: "DELETE" });
    router.push("/produtos"); router.refresh();
  }

  return (
    <form onSubmit={save} className="card card-pad space-y-4 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="label">Nome *</label><input className="input" required value={p.name ?? ""} onChange={(e) => u("name", e.target.value)} /></div>
        <div><label className="label">SKU</label><input className="input" value={p.sku ?? ""} onChange={(e) => u("sku", e.target.value)} /></div>
        <div><label className="label">Codigo de barras</label><input className="input" value={p.barcode ?? ""} onChange={(e) => u("barcode", e.target.value)} /></div>
        <div><label className="label">Marca</label><input className="input" value={p.brand ?? ""} onChange={(e) => u("brand", e.target.value)} /></div>
        <div><label className="label">Categoria</label>
          <select className="input" value={p.categoryId ?? ""} onChange={(e) => u("categoryId", e.target.value || null)}>
            <option value="">-</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="label">Fornecedor</label>
          <select className="input" value={p.supplierId ?? ""} onChange={(e) => u("supplierId", e.target.value || null)}>
            <option value="">-</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div><label className="label">Unidade</label>
          <select className="input" value={p.unit ?? "UN"} onChange={(e) => u("unit", e.target.value)}>
            <option>UN</option><option>KG</option><option>L</option><option>ML</option><option>CX</option>
          </select>
        </div>
        <div><label className="label">Preco custo</label><input className="input" type="number" step="0.01" value={p.costPrice ?? 0} onChange={(e) => u("costPrice", e.target.value)} /></div>
        <div><label className="label">Preco venda</label><input className="input" type="number" step="0.01" value={p.salePrice ?? 0} onChange={(e) => u("salePrice", e.target.value)} /></div>
        <div><label className="label">Estoque minimo</label><input className="input" type="number" value={p.minStock ?? 0} onChange={(e) => u("minStock", e.target.value)} /></div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!p.controlByLot} onChange={(e) => u("controlByLot", e.target.checked)} /> Controlar por lote / validade</label></div>
      </div>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>Cancelar</button>
        {initial?.id && <button type="button" className="btn-danger ml-auto" onClick={remove}>Excluir</button>}
      </div>
    </form>
  );
}
