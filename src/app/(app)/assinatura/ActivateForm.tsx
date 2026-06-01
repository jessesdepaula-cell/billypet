"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle2 } from "lucide-react";

type Props = {
  reactivation?: boolean;
  initialCnpj?: string | null;
  initialPhone?: string | null;
  initialZip?: string | null;
};

function maskCnpj(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    // CPF
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  return d.replace(/^(\d{2})(\d{5})(\d)/, "($1) $2-$3");
}
function maskZip(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

export function ActivateForm({ reactivation = false, initialCnpj, initialPhone, initialZip }: Props) {
  const router = useRouter();
  const [billingType, setBillingType] = useState("UNDEFINED");
  const [dueDay, setDueDay] = useState(1);
  const [cnpj, setCnpj] = useState(initialCnpj ? maskCnpj(initialCnpj) : "");
  const [phone, setPhone] = useState(initialPhone ? maskPhone(initialPhone) : "");
  const [zip, setZip] = useState(initialZip ? maskZip(initialZip) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const cnpjDigits = cnpj.replace(/\D/g, "");
  const cnpjValid = cnpjDigits.length === 11 || cnpjDigits.length === 14;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assinatura/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingType,
          dueDay,
          cnpj: cnpjDigits,
          phone: phone.replace(/\D/g, ""),
          zipCode: zip.replace(/\D/g, ""),
        }),
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
        <div className="sm:col-span-2">
          <label className="label">CPF ou CNPJ do titular <span className="text-red-600">*</span></label>
          <input
            className="input"
            value={cnpj}
            onChange={(e) => setCnpj(maskCnpj(e.target.value))}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">
            Obrigatorio pelo Asaas para emitir a cobranca. Pode ser CPF do responsavel ou CNPJ da clinica.
          </p>
        </div>
        <div>
          <label className="label">Telefone (recomendado)</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
            disabled={loading}
          />
        </div>
        <div>
          <label className="label">CEP (recomendado)</label>
          <input
            className="input"
            value={zip}
            onChange={(e) => setZip(maskZip(e.target.value))}
            placeholder="00000-000"
            inputMode="numeric"
            disabled={loading}
          />
        </div>
        <div>
          <label className="label">Forma de pagamento preferida</label>
          <select className="input" value={billingType} onChange={(e) => setBillingType(e.target.value)} disabled={loading}>
            <option value="UNDEFINED">Deixar o cliente escolher (PIX / Boleto / Cartao)</option>
            <option value="PIX">Apenas PIX</option>
            <option value="BOLETO">Apenas Boleto</option>
            <option value="CREDIT_CARD">Apenas Cartao de credito</option>
          </select>
        </div>
        <div>
          <label className="label">Dia de vencimento</label>
          <select className="input" value={dueDay} onChange={(e) => setDueDay(Number(e.target.value))} disabled={loading}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Todo dia {d}</option>
            ))}
          </select>
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

      {!cnpjValid && cnpj.length > 0 && (
        <div className="text-xs text-amber-700">CPF deve ter 11 digitos ou CNPJ 14 digitos.</div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={submit}
          disabled={loading || !confirm || !cnpjValid}
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "Ativando..." : reactivation ? "Reativar assinatura" : "Ativar assinatura agora"}
        </button>
      </div>
    </div>
  );
}
