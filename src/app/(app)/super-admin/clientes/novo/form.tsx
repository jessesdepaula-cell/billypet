"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateResult = {
  tenant: { id: string };
  invite?: { link?: string; emailSent: boolean; emailError?: string };
  warning?: string;
};

export function NovoClienteForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    companyName: "",
    value: 247,
    billingType: "UNDEFINED" as "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED",
    dueDay: 1,
    startNow: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha ao criar cliente");
      setResult(j);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const link = result.invite?.link;
    const sent = result.invite?.emailSent;
    return (
      <div className="card card-pad space-y-4">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-3 py-2">
          Cliente criado com sucesso.
        </div>

        {sent ? (
          <p className="text-sm text-slate-700">
            Enviamos um email para <b>{form.email}</b> com o link para o cliente definir a senha e finalizar o cadastro.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-700">
              O email automatico nao pode ser enviado{result.invite?.emailError ? ` (${result.invite.emailError})` : ""}.
              Copie o link abaixo e envie manualmente para <b>{form.email}</b>:
            </p>
            {link && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono break-all">
                {link}
              </div>
            )}
            {link && (
              <button
                type="button"
                className="btn-outline text-xs"
                onClick={() => navigator.clipboard.writeText(link)}
              >
                Copiar link
              </button>
            )}
          </div>
        )}

        {result.warning && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2">
            {result.warning}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              setResult(null);
              setForm({ email: "", companyName: "", value: 247, billingType: "UNDEFINED", dueDay: 1, startNow: true });
            }}
          >
            Cadastrar outro
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push(`/super-admin/clientes/${result.tenant.id}`)}
          >
            Abrir cliente
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card card-pad space-y-5">
      <div className="space-y-4">
        <div>
          <label className="label">E-mail do cliente *</label>
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="cliente@minhaclinica.com.br"
          />
          <p className="text-xs text-slate-500 mt-1">
            O cliente recebera por email um link para definir a senha e completar o cadastro (razao social, CNPJ, telefone, endereco, etc.).
          </p>
        </div>
        <div>
          <label className="label">Nome da clinica (opcional)</label>
          <input
            className="input"
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            placeholder="Pode deixar em branco - o cliente preenche depois"
          />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Valor mensal (R$)</label>
              <input className="input" type="number" min={0} step="0.01" value={form.value} onChange={(e) => set("value", Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Dia de vencimento</label>
              <input className="input" type="number" min={1} max={28} value={form.dueDay} onChange={(e) => set("dueDay", Number(e.target.value))} />
              <p className="text-xs text-slate-500 mt-1">A 1a cobranca cai no proximo dia {form.dueDay}; recorre todo mes nesse dia.</p>
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
          {loading ? "Criando..." : "Criar cliente e enviar convite"}
        </button>
      </div>
    </form>
  );
}
