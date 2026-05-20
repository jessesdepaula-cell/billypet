"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fmtMoney } from "@/lib/utils";

type Tutor = { id: string; name: string };
type Product = { id: string; name: string; salePrice: number };
type Service = { id: string; name: string; price: number };
type Method = { id: string; name: string };

type Item = { kind: "product" | "service"; id: string; description: string; quantity: number; unitPrice: number };

export function POS({ tutors, products, services, methods, initialTutorId }: { tutors: Tutor[]; products: Product[]; services: Service[]; methods: Method[]; initialTutorId?: string }) {
  const router = useRouter();
  const [tutorId, setTutorId] = useState(initialTutorId ?? "");
  const [items, setItems] = useState<Item[]>([]);
  const [pays, setPays] = useState<{ paymentMethodId: string; amount: number; installments: number }[]>([{ paymentMethodId: methods[0]?.id ?? "", amount: 0, installments: 1 }]);
  const [discount, setDiscount] = useState(0);
  const [surcharge, setSurcharge] = useState(0);
  const [saving, setSaving] = useState(false);

  function addProduct(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setItems((cur) => [...cur, { kind: "product", id: p.id, description: p.name, quantity: 1, unitPrice: p.salePrice }]);
  }
  function addService(id: string) {
    const s = services.find((x) => x.id === id);
    if (!s) return;
    setItems((cur) => [...cur, { kind: "service", id: s.id, description: s.name, quantity: 1, unitPrice: s.price }]);
  }
  function updateItem(i: number, k: keyof Item, v: any) {
    setItems((cur) => cur.map((it, idx) => idx === i ? { ...it, [k]: k === "quantity" || k === "unitPrice" ? Number(v) : v } : it));
  }
  function removeItem(i: number) { setItems((cur) => cur.filter((_, idx) => idx !== i)); }

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.quantity * it.unitPrice, 0), [items]);
  const total = useMemo(() => Math.max(0, subtotal - Number(discount) + Number(surcharge)), [subtotal, discount, surcharge]);
  const paid = useMemo(() => pays.reduce((s, p) => s + Number(p.amount || 0), 0), [pays]);
  const remaining = total - paid;

  async function finalize() {
    if (items.length === 0) return alert("Adicione itens");
    if (Math.abs(remaining) > 0.01) return alert("Valor pago diferente do total");
    setSaving(true);
    const body = {
      tutorId: tutorId || null, discount, surcharge, total,
      items: items.map((it) => ({
        productId: it.kind === "product" ? it.id : null,
        serviceId: it.kind === "service" ? it.id : null,
        description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, total: it.quantity * it.unitPrice,
      })),
      payments: pays.filter((p) => p.amount > 0 && p.paymentMethodId),
    };
    const res = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (!res.ok) return alert("Falha ao finalizar venda");
    router.push("/vendas"); router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="card card-pad">
          <label className="label">Tutor (opcional)</label>
          <select className="input" value={tutorId} onChange={(e) => setTutorId(e.target.value)}>
            <option value="">Venda avulsa</option>
            {tutors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="card card-pad space-y-3">
          <div className="flex flex-wrap gap-2">
            <select className="input flex-1 min-w-[200px]" onChange={(e) => { if (e.target.value) { addProduct(e.target.value); e.target.value = ""; } }} defaultValue="">
              <option value="">+ adicionar produto</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} - {fmtMoney(p.salePrice)}</option>)}
            </select>
            <select className="input flex-1 min-w-[200px]" onChange={(e) => { if (e.target.value) { addService(e.target.value); e.target.value = ""; } }} defaultValue="">
              <option value="">+ adicionar servico</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name} - {fmtMoney(s.price)}</option>)}
            </select>
          </div>
          <table className="bp-table">
            <thead><tr><th>Item</th><th>Qtd</th><th>Unit.</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>{it.description}</td>
                  <td><input className="input py-1 w-20" type="number" min="0.01" step="0.01" value={it.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} /></td>
                  <td><input className="input py-1 w-24" type="number" step="0.01" value={it.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} /></td>
                  <td className="font-medium">{fmtMoney(it.quantity * it.unitPrice)}</td>
                  <td><button className="text-red-600 text-sm" onClick={() => removeItem(i)}>x</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-slate-500">Nenhum item</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card card-pad">
          <h3 className="font-semibold mb-3">Pagamento</h3>
          {pays.map((p, i) => (
            <div key={i} className="grid sm:grid-cols-4 gap-2 mb-2">
              <select className="input" value={p.paymentMethodId} onChange={(e) => setPays((cur) => cur.map((x, idx) => idx === i ? { ...x, paymentMethodId: e.target.value } : x))}>
                {methods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input className="input" type="number" step="0.01" placeholder="Valor" value={p.amount} onChange={(e) => setPays((cur) => cur.map((x, idx) => idx === i ? { ...x, amount: Number(e.target.value) } : x))} />
              <input className="input" type="number" min="1" placeholder="Parcelas" value={p.installments} onChange={(e) => setPays((cur) => cur.map((x, idx) => idx === i ? { ...x, installments: Number(e.target.value) } : x))} />
              <button className="btn-outline" onClick={() => setPays((cur) => cur.filter((_, idx) => idx !== i))}>remover</button>
            </div>
          ))}
          <button onClick={() => setPays((p) => [...p, { paymentMethodId: methods[0]?.id ?? "", amount: 0, installments: 1 }])} className="btn-outline text-xs">+ adicionar forma de pagamento</button>
        </div>
      </div>

      <div className="card card-pad h-fit sticky top-4 space-y-3">
        <h3 className="font-semibold">Resumo</h3>
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
        <div className="flex justify-between text-sm items-center">
          <span>Desconto</span><input className="input py-1 w-24 text-right" type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </div>
        <div className="flex justify-between text-sm items-center">
          <span>Acrescimo</span><input className="input py-1 w-24 text-right" type="number" step="0.01" value={surcharge} onChange={(e) => setSurcharge(Number(e.target.value))} />
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>{fmtMoney(total)}</span></div>
        <div className="flex justify-between text-sm"><span>Pago</span><span className="font-semibold">{fmtMoney(paid)}</span></div>
        <div className="flex justify-between text-sm"><span>Restante</span><span className={Math.abs(remaining) > 0.01 ? "text-red-600 font-semibold" : "text-emerald-600 font-semibold"}>{fmtMoney(remaining)}</span></div>
        <button onClick={finalize} disabled={saving || items.length === 0} className="btn-primary w-full">{saving ? "Salvando..." : "Finalizar venda"}</button>
      </div>
    </div>
  );
}
