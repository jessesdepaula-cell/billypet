"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, CalendarClock } from "lucide-react";

type BillingReminderPopupProps = {
  /** Data de vencimento em ISO (YYYY-MM-DD...) */
  dueDate: string;
  /** Dias ate o vencimento (0 = hoje, negativo = vencida) */
  daysUntil: number;
  value?: number | null;
  invoiceUrl?: string | null;
};

/**
 * Aviso exibido ao cliente quando a assinatura esta a 2 dias (ou menos) do
 * vencimento. Aparece uma vez por sessao de login (usa sessionStorage), para
 * lembrar de pagar sem incomodar a cada navegacao.
 */
export function BillingReminderPopup({ dueDate, daysUntil, value, invoiceUrl }: BillingReminderPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = `billingReminderSeen:${dueDate.slice(0, 10)}`;
    if (typeof window !== "undefined" && !window.sessionStorage.getItem(key)) {
      setOpen(true);
    }
  }, [dueDate]);

  function close() {
    try {
      window.sessionStorage.setItem(`billingReminderSeen:${dueDate.slice(0, 10)}`, "1");
    } catch {
      // ignora indisponibilidade de sessionStorage
    }
    setOpen(false);
  }

  if (!open) return null;

  const overdue = daysUntil < 0;
  const dateLabel = new Date(dueDate).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  const valueLabel =
    typeof value === "number" ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : null;

  let headline: string;
  if (overdue) headline = `Sua assinatura esta vencida ha ${Math.abs(daysUntil)} dia${Math.abs(daysUntil) > 1 ? "s" : ""}`;
  else if (daysUntil === 0) headline = "Sua assinatura vence hoje";
  else if (daysUntil === 1) headline = "Sua assinatura vence amanha";
  else headline = `Faltam ${daysUntil} dias para o vencimento da sua assinatura`;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={close}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={`px-6 py-4 flex items-center justify-between ${overdue ? "bg-red-600" : "bg-amber-500"} text-white`}>
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-5 w-5" />
            <span>Aviso de vencimento</span>
          </div>
          <button type="button" onClick={close} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${overdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{headline}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Vencimento em <strong className="text-slate-700">{dateLabel}</strong>
                {valueLabel ? <> — <strong className="text-slate-700">{valueLabel}</strong></> : null}.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            {overdue
              ? "Regularize o pagamento para manter o acesso a plataforma sem interrupcoes."
              : "Fique atento para garantir que o pagamento seja feito em dia e evitar bloqueio do acesso."}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            {invoiceUrl && (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="btn-primary flex-1 text-center"
              >
                Ver fatura / Pagar agora
              </a>
            )}
            <button type="button" onClick={close} className="btn-outline flex-1">
              {invoiceUrl ? "Depois" : "Entendi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
