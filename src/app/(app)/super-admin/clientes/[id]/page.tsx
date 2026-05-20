import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";
import { TenantActions } from "./actions";

export const dynamic = "force-dynamic";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_BADGE: Record<string, string> = {
  TRIAL: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAST_DUE: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  CANCELED: "bg-slate-100 text-slate-600",
  PENDING: "bg-slate-100 text-slate-600",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-amber-100 text-amber-700",
};

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!isSuperAdmin(s.role)) redirect("/dashboard");

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { dueDate: "desc" }, take: 30 },
    },
  });
  if (!tenant) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/super-admin/clientes" className="text-sm text-slate-500 hover:underline">&larr; Clientes</Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">{tenant.companyName}</h1>
          <p className="text-sm text-slate-500">
            {tenant.tradeName ? `${tenant.tradeName} - ` : ""}{tenant.email} - {tenant.cnpj || "sem CNPJ"}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs ${STATUS_BADGE[tenant.status] || "bg-slate-100"}`}>{tenant.status}</span>
      </div>

      <TenantActions tenant={tenant as any} />

      <div className="card card-pad">
        <h2 className="font-semibold text-slate-800 mb-3">Assinaturas</h2>
        {tenant.subscriptions.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma assinatura. Use o botao acima para criar uma no Asaas.</p>
        )}
        {tenant.subscriptions.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Plano</th><th>Valor</th><th>Ciclo</th><th>Status</th><th>Proximo vencimento</th><th>Asaas ID</th>
              </tr>
            </thead>
            <tbody>
              {tenant.subscriptions.map((sub) => (
                <tr key={sub.id} className="border-t border-slate-100">
                  <td className="py-2">{sub.plan}</td>
                  <td>{brl(sub.value)}</td>
                  <td>{sub.cycle}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[sub.status] || "bg-slate-100"}`}>{sub.status}</span>
                  </td>
                  <td>{sub.nextDueDate ? new Date(sub.nextDueDate).toLocaleDateString("pt-BR") : "-"}</td>
                  <td className="text-xs text-slate-500 font-mono">{sub.asaasSubscriptionId || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card card-pad">
        <h2 className="font-semibold text-slate-800 mb-3">Pagamentos</h2>
        {tenant.payments.length === 0 && <p className="text-sm text-slate-500">Sem pagamentos registrados.</p>}
        {tenant.payments.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Vencimento</th><th>Valor</th><th>Status</th><th>Pago em</th><th>Forma</th><th />
              </tr>
            </thead>
            <tbody>
              {tenant.payments.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2">{new Date(p.dueDate).toLocaleDateString("pt-BR")}</td>
                  <td>{brl(p.value)}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[p.status] || "bg-slate-100"}`}>{p.status}</span>
                  </td>
                  <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString("pt-BR") : "-"}</td>
                  <td>{p.billingType || "-"}</td>
                  <td className="text-right">
                    {p.invoiceUrl && <a className="text-brand-600 hover:underline text-xs" href={p.invoiceUrl} target="_blank">fatura</a>}
                    {p.bankSlipUrl && <a className="text-brand-600 hover:underline text-xs ml-2" href={p.bankSlipUrl} target="_blank">boleto</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
