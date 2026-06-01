import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { asaasIsConfigured } from "@/lib/asaas";
import { CreditCard, FileText, QrCode, AlertTriangle, CheckCircle2, Clock, XCircle, Receipt } from "lucide-react";
import { SyncButton } from "./SyncButton";
import { ActivateForm } from "./ActivateForm";

export const dynamic = "force-dynamic";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR");
}

const SUB_BADGE: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-amber-100 text-amber-700",
  CANCELED: "bg-slate-100 text-slate-500",
  EXPIRED: "bg-red-100 text-red-700",
};
const SUB_LABEL: Record<string, string> = {
  PENDING: "Aguardando primeiro pagamento",
  ACTIVE: "Ativa",
  OVERDUE: "Em atraso",
  CANCELED: "Cancelada",
  EXPIRED: "Expirada",
};
const PAY_BADGE: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-amber-100 text-amber-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  CANCELED: "bg-slate-100 text-slate-500",
};

export default async function AssinaturaPage({ searchParams }: { searchParams: { bloqueado?: string } }) {
  const ctx = await requireModule("assinatura");
  const tenant = await prisma.tenant.findUnique({
    where: { id: ctx.tenantId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { dueDate: "desc" }, take: 24 },
    },
  });
  if (!tenant) redirect("/dashboard");

  const sub = tenant.subscriptions[0];
  const openPayment = tenant.payments.find((p) => p.status === "PENDING" || p.status === "OVERDUE");
  const isBlocked = searchParams?.bloqueado === "1";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Minha Assinatura"
        description={`Plano BilyVet de ${tenant.companyName}. Aqui voce acompanha o status, fatura em aberto e historico de pagamentos.`}
      />

      {isBlocked && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-900">
            <p className="font-semibold mb-1">Acesso suspenso por falta de pagamento</p>
            <p>Para liberar novamente o sistema, quite a fatura em aberto abaixo. Apos a confirmacao do pagamento, o acesso volta automaticamente.</p>
          </div>
        </div>
      )}

      {/* Cards de status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-slate-400">Status</span>
            <span className="h-9 w-9 rounded-lg bg-brand-50 grid place-items-center text-brand-700">
              {sub?.status === "ACTIVE" ? <CheckCircle2 className="h-4 w-4" />
                : sub?.status === "OVERDUE" ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                : sub?.status === "CANCELED" || sub?.status === "EXPIRED" ? <XCircle className="h-4 w-4 text-red-600" />
                : <Clock className="h-4 w-4" />}
            </span>
          </div>
          {sub ? (
            <>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${SUB_BADGE[sub.status] || "bg-slate-100"}`}>
                {SUB_LABEL[sub.status] || sub.status}
              </span>
              <div className="text-xs text-slate-500 mt-2">Status do tenant: <b>{tenant.status}</b></div>
            </>
          ) : (
            <div className="text-sm text-slate-600">Sem assinatura ativa</div>
          )}
        </div>

        <div className="card card-pad">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-slate-400">Plano</span>
            <span className="h-9 w-9 rounded-lg bg-violet-50 grid place-items-center text-violet-700">
              <Receipt className="h-4 w-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-slate-800">{sub?.plan || "-"}</div>
          <div className="text-xs text-slate-500 mt-1">{sub ? `${sub.cycle === "MONTHLY" ? "Mensal" : sub.cycle} - ${sub.billingType}` : "Sem plano contratado"}</div>
        </div>

        <div className="card card-pad">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-slate-400">Valor</span>
            <span className="h-9 w-9 rounded-lg bg-emerald-50 grid place-items-center text-emerald-700">
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{sub ? brl(sub.value) : "-"}</div>
          <div className="text-xs text-slate-500 mt-1">por {sub?.cycle === "MONTHLY" ? "mes" : "ciclo"}</div>
        </div>

        <div className="card card-pad">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-slate-400">Proximo vencimento</span>
            <span className="h-9 w-9 rounded-lg bg-amber-50 grid place-items-center text-amber-700">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-slate-800">{fmtDate(sub?.nextDueDate)}</div>
          <div className="text-xs text-slate-500 mt-1">{sub?.nextDueDate && new Date(sub.nextDueDate) < new Date() ? "Em atraso" : "No prazo"}</div>
        </div>
      </div>

      {/* Fatura em aberto */}
      {openPayment ? (
        <div className={`card card-pad border-2 ${openPayment.status === "OVERDUE" ? "border-amber-300 bg-amber-50/30" : "border-brand-200 bg-brand-50/30"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">
                {openPayment.status === "OVERDUE" ? "Fatura em atraso" : "Fatura em aberto"}
              </h2>
              <p className="text-sm text-slate-600">
                Vencimento <b>{fmtDate(openPayment.dueDate)}</b> - Valor <b>{brl(openPayment.value)}</b>
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs ${PAY_BADGE[openPayment.status] || "bg-slate-100"}`}>{openPayment.status}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {openPayment.invoiceUrl && (
              <a href={openPayment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Pagar agora
              </a>
            )}
            {openPayment.bankSlipUrl && (
              <a href={openPayment.bankSlipUrl} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-2">
                <FileText className="h-4 w-4" /> Boleto
              </a>
            )}
            {openPayment.pixPayload && (
              <a href={openPayment.invoiceUrl || "#"} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-2">
                <QrCode className="h-4 w-4" /> PIX
              </a>
            )}
            <SyncButton />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Depois de pagar, a confirmacao pode levar alguns minutos. Use <b>Atualizar status</b> para forcar a sincronizacao com o Asaas.
          </p>
        </div>
      ) : sub && sub.status === "ACTIVE" ? (
        <div className="card card-pad border-2 border-emerald-200 bg-emerald-50/30 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <h2 className="font-semibold text-slate-800">Tudo em dia</h2>
            <p className="text-sm text-slate-600">Sua assinatura esta ativa. A proxima cobranca sera gerada em {fmtDate(sub.nextDueDate)}.</p>
            <div className="mt-3"><SyncButton /></div>
          </div>
        </div>
      ) : !sub ? (
        asaasIsConfigured() ? (
          <ActivateForm initialCnpj={tenant.cnpj} initialPhone={tenant.phone} initialZip={tenant.zipCode} />
        ) : (
          <div className="card card-pad border-2 border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">Sem assinatura ativa</h2>
            <p className="text-sm text-slate-600">
              A integracao Asaas nao esta ativa neste ambiente. Entre em contato pelo Suporte.
            </p>
          </div>
        )
      ) : sub.status === "CANCELED" || sub.status === "EXPIRED" ? (
        asaasIsConfigured() ? (
          <ActivateForm reactivation initialCnpj={tenant.cnpj} initialPhone={tenant.phone} initialZip={tenant.zipCode} />
        ) : (
          <div className="card card-pad border-2 border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">Assinatura {SUB_LABEL[sub.status]}</h2>
            <p className="text-sm text-slate-600">Entre em contato pelo Suporte para reativar.</p>
          </div>
        )
      ) : (
        <div className="card card-pad border-2 border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-1">Sem fatura em aberto no momento</h2>
          <p className="text-sm text-slate-600">Status atual da assinatura: <b>{SUB_LABEL[sub.status] || sub.status}</b>.</p>
          <div className="mt-3"><SyncButton /></div>
        </div>
      )}

      {/* Historico */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Historico de pagamentos</h2>
          <span className="text-xs text-slate-500">{tenant.payments.length} registro(s)</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">Vencimento</th>
              <th className="px-4 py-2 font-medium">Pago em</th>
              <th className="px-4 py-2 font-medium">Valor</th>
              <th className="px-4 py-2 font-medium">Forma</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Fatura</th>
            </tr>
          </thead>
          <tbody>
            {tenant.payments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Sem pagamentos registrados.</td></tr>
            )}
            {tenant.payments.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{fmtDate(p.dueDate)}</td>
                <td className="px-4 py-2 text-slate-600">{p.paidAt ? fmtDate(p.paidAt) : "-"}</td>
                <td className="px-4 py-2 font-medium">{brl(p.value)}</td>
                <td className="px-4 py-2 text-slate-600">{p.billingType || "-"}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${PAY_BADGE[p.status] || "bg-slate-100"}`}>{p.status}</span>
                </td>
                <td className="px-4 py-2">
                  {p.invoiceUrl ? (
                    <a href={p.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline text-xs">
                      Abrir
                    </a>
                  ) : <span className="text-slate-300">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!asaasIsConfigured() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Atencao: integracao Asaas nao esta ativa neste ambiente.
        </div>
      )}
    </div>
  );
}
