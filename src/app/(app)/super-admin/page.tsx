import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";
import { asaasIsConfigured, asaasEnvironment } from "@/lib/asaas";
import { Building2, Receipt, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function SuperAdminHome() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!isSuperAdmin(s.role)) redirect("/dashboard");

  const [tenants, subscriptions, paymentsThisMonth, overdueCount] = await Promise.all([
    prisma.tenant.count(),
    prisma.subscription.findMany({ include: { tenant: true } }),
    prisma.subscriptionPayment.findMany({
      where: {
        status: { in: ["RECEIVED", "CONFIRMED"] },
        paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.subscriptionPayment.count({ where: { status: "OVERDUE" } }),
  ]);

  const mrr = subscriptions.filter((x) => x.status === "ACTIVE").reduce((acc, s) => acc + s.value, 0);
  const receivedThisMonth = paymentsThisMonth.reduce((a, p) => a + p.value, 0);
  const activeCount = subscriptions.filter((x) => x.status === "ACTIVE").length;

  const cards = [
    { label: "Clientes (tenants)", value: tenants.toString(), icon: Building2, color: "bg-blue-50 text-blue-700" },
    { label: "Assinaturas ativas", value: activeCount.toString(), icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
    { label: "MRR (mensal recorrente)", value: brl(mrr), icon: TrendingUp, color: "bg-violet-50 text-violet-700" },
    { label: "Recebido neste mes", value: brl(receivedThisMonth), icon: Receipt, color: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel BilyVet</h1>
        <p className="text-sm text-slate-500">Visao geral das assinaturas e clientes da plataforma.</p>
      </div>

      {!asaasIsConfigured() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Asaas nao configurado</p>
            <p>Defina a variavel <code className="bg-amber-100 px-1 rounded">ASAAS_API_KEY</code> no Vercel/env para habilitar criacao de cobrancas e webhooks.</p>
          </div>
        </div>
      )}
      {asaasIsConfigured() && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Asaas conectado - ambiente <strong>{asaasEnvironment()}</strong>. Webhook em <code className="bg-emerald-100 px-1 rounded">/api/asaas/webhook</code>.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card card-pad">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-slate-400">{c.label}</span>
                <span className={`h-9 w-9 rounded-lg grid place-items-center ${c.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{c.value}</div>
            </div>
          );
        })}
      </div>

      {overdueCount > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <strong>{overdueCount}</strong> pagamento(s) em atraso. Veja a aba <Link href="/super-admin/assinaturas" className="underline">Assinaturas</Link>.
        </div>
      )}

      <div className="card card-pad">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Atalhos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/super-admin/clientes" className="rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40">
            <div className="font-semibold text-slate-800">Clientes</div>
            <p className="text-xs text-slate-500 mt-1">Listar, criar nova clinica/cliente.</p>
          </Link>
          <Link href="/super-admin/assinaturas" className="rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40">
            <div className="font-semibold text-slate-800">Assinaturas</div>
            <p className="text-xs text-slate-500 mt-1">Criar e gerenciar assinaturas no Asaas.</p>
          </Link>
          <Link href="/super-admin/clientes/novo" className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 hover:bg-brand-50">
            <div className="font-semibold text-brand-700">+ Nova clinica/cliente</div>
            <p className="text-xs text-slate-500 mt-1">Cadastrar e iniciar cobranca de R$ 247/mes.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
