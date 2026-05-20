"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NovoClienteForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    tradeName: "",
    cnpj: "",
    email: "",
    phone: "",
    responsibleName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    value: 197,
    billingType: "UNDEFINED" as "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED",
    startNow: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha ao criar cliente");
      router.push(`/super-admin/clientes/${j.tenant.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card card-pad space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Razao social / Nome da clinica *</label>
          <input className="input" required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
        </div>
        <div>
          <label className="label">Nome fantasia</label>
          <input className="input" value={form.tradeName} onChange={(e) => set("tradeName", e.target.value)} />
        </div>
        <div>
          <label className="label">CNPJ</label>
          <input className="input" value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
        </div>
        <div>
          <label className="label">E-mail de cobranca *</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Telefone</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">Responsavel</label>
          <input className="input" value={form.responsibleName} onChange={(e) => set("responsibleName", e.target.value)} />
        </div>
        <div>
          <label className="label">CEP</label>
          <input className="input" value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Endereco</label>
          <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <label className="label">Cidade</label>
          <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className="label">UF</label>
          <input className="input" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} />
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center gap-2">
          <input id="startNow" type="checkbox" checked={form.startNow} onChange={(e) => set("startNow", e.target.checked)} />
          <label htmlFor="startNow" className="text-sm text-slate-700 font-medium">
            Criar assinatura no Asaas agora (cobranca mensal recorrente)
          </label>
        </div>
        {form.startNow && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Valor mensal (R$)</label>
              <input className="input" type="number" min={0} step="0.01" value={form.value} onChange={(e) => set("value", Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Forma de pagamento</label>
              <select className="input" value={form.billingType} onChange={(e) => set("billingType", e.target.value as any)}>
                <option value="UNDEFINED">Cliente escolhe (boleto, pix ou cartao)</option>
                <option value="BOLETO">Boleto</option>
                <option value="PIX">Pix</option>
                <option value="CREDIT_CARD">Cartao de credito</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-outline" onClick={() => history.back()}>Cancelar</button>
        <button className="btn-primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar e criar assinatura"}
        </button>
      </div>
    </form>
  );
}
