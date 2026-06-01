"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle2 } from "lucide-react";

type Props = {
  reactivation?: boolean;
};

export function ActivateForm({ reactivation = false }: Props) {
  const router = useRouter();
  const [billingType, setBillingType] = useState("UNDEFINED");
  const [dueDay, setDueDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assinatura/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingType, dueDay }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha ao ativar");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-pad border-2 border-brand-200 bg-brand-50/30 space-y-4">
      <div className="flex items-start gap-3">
        <span className="h-10 w-10 rounded-lg bg-brand-600 grid place-items-center text-white shrink-0">
          <CreditCard className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-800 text-lg">
            {reactivation ? "Reativar minha assinatura" : "Ativar minha assinatura"}
          </h2>
          <p className="text-sm text-slate-600">
            Plano <b>PRO - R$ 247,00/mes</b>. Apos a ativacao voce recebera a primeira fatura no Asaas com PIX, boleto ou link de cartao.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Forma de pagamento preferida</label>
          <select className="input" value={billingType} onChange={(e) => setBillingType(e.target.value)} disabled={loading}>
            <option value="UNDEFINED">Deixar o cliente escolher (PIX / Boleto / Cartao)</option>
            <option value="PIX">Apenas PIX</option>
            <option value="BOLETO">Apenas Boleto</option>
            <option value="CREDIT_CARD">Apenas Cartao de credito</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Em &quot;deixar o cliente escolher&quot;, o Asaas mostra todas as opcoes no link de pagamento.
          </p>
        </div>
        <div>
          <label className="label">Dia de vencimento</label>
          <select className="input" value={dueDay} onChange={(e) => setDueDay(Number(e.target.value))} disabled={loading}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Todo dia {d}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">A primeira fatura sera gerada para o proximo dia {dueDay}.</p>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-1"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
          disabled={loading}
        />
        <span>
          Confirmo que quero contratar o plano <b>PRO - R$ 247/mes</b> da BilyVet e estou ciente que o pagamento sera cobrado mensalmente via Asaas.
        </span>
      </label>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={submit}
          disabled={loading || !confirm}
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "Ativando..." : reactivation ? "Reativar assinatura" : "Ativar assinatura agora"}
        </button>
      </div>
    </div>
  );
}
