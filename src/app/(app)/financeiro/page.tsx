import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { fmtMoney } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Receipt } from "lucide-react";
import { RevenueLine, PaymentMixPie } from "@/components/charts/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const { tenantId } = await requireModule("financeiro");
  const start30 = new Date(Date.now() - 30 * 86400000);
  const [sales30, payable, receivable, payments] = await Promise.all([
    prisma.sale.findMany({ where: { unit: { tenantId }, createdAt: { gte: start30 }, status: "FINALIZADA" } }),
    prisma.accountPayable.findMany({ where: { unit: { tenantId }, status: { in: ["ABERTA", "VENCIDA"] } } }),
    prisma.accountReceivable.findMany({ where: { unit: { tenantId }, status: { in: ["ABERTA", "VENCIDA", "PARCIAL"] } } }),
    prisma.payment.findMany({ where: { sale: { unit: { tenantId } }, paidAt: { gte: start30 } }, include: { paymentMethod: true } }),
  ]);
  const revenue = sales30.reduce((s, x) => s + x.total, 0);
  const totalPayable = payable.reduce((s, x) => s + x.amount, 0);
  const totalReceivable = receivable.reduce((s, x) => s + x.amount, 0);

  // mix de pagamentos
  const mixMap = new Map<string, number>();
  for (const p of payments) mixMap.set(p.paymentMethod.name, (mixMap.get(p.paymentMethod.name) ?? 0) + p.amount);
  const mix = Array.from(mixMap.entries()).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

  // linha por dia (30d)
  const days: { day: string; total: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const n = new Date(d); n.setDate(d.getDate() + 1);
    const t = sales30.filter((s) => s.createdAt >= d && s.createdAt < n).reduce((s, x) => s + x.total, 0);
    days.push({ day: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), total: Number(t.toFixed(2)) });
  }

  // DRE simplificado
  const totalCustos = payable.reduce((s, x) => s + x.amount, 0);
  const resultado = revenue - totalCustos;

  return (
    <>
      <PageHeader title="Financeiro" description="Visao geral consolidada dos ultimos 30 dias" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard title="Receita 30d" value={fmtMoney(revenue)} icon={<TrendingUp className="h-5 w-5" />} tone="green" />
        <StatCard title="A receber" value={fmtMoney(totalReceivable)} icon={<Receipt className="h-5 w-5" />} tone="blue" />
        <StatCard title="A pagar" value={fmtMoney(totalPayable)} icon={<TrendingDown className="h-5 w-5" />} tone="red" />
        <StatCard title="Caixa estimado" value={fmtMoney(resultado)} icon={<Wallet className="h-5 w-5" />} tone={resultado >= 0 ? "blue" : "red"} />
      </div>
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="card card-pad lg:col-span-2">
          <h3 className="font-semibold mb-3">Receita 30 dias</h3>
          <RevenueLine data={days} />
        </div>
        <div className="card card-pad">
          <h3 className="font-semibold mb-3">Mix de pagamentos</h3>
          {mix.length > 0 ? <PaymentMixPie data={mix} /> : <p className="text-sm text-slate-500">Sem dados</p>}
        </div>
      </div>
      <div className="card card-pad">
        <h3 className="font-semibold mb-3">DRE simplificado</h3>
        <ul className="text-sm space-y-1">
          <li className="flex justify-between"><span>(+) Receita bruta</span><span className="font-medium">{fmtMoney(revenue)}</span></li>
          <li className="flex justify-between"><span>(-) Custos e despesas (contas a pagar abertas)</span><span className="font-medium">{fmtMoney(totalCustos)}</span></li>
          <li className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold">Resultado liquido estimado</span><span className={resultado >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>{fmtMoney(resultado)}</span></li>
        </ul>
      </div>
    </>
  );
}
