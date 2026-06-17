import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { fmtMoney, fmtTime, fmtDate } from "@/lib/utils";
import { CalendarDays, Wallet, ShoppingCart, AlertTriangle, BedDouble, Syringe, PiggyBank, Receipt, FileText, PawPrint, ClipboardList, CheckCircle } from "lucide-react";
import { RevenueLine, CategoriesBar, PaymentMixPie } from "@/components/charts/DashboardCharts";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { tab?: string } }) {
  const { tenantId } = await requireTenant();
  const activeTab = searchParams.tab || "indicadores";
  
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);

  const unitFilter = { unit: { tenantId } };

  // Queries para ambas as abas
  const [
    todayAppointments,
    inProgress,
    todaySales,
    payable,
    receivable,
    activeHosp,
    lowStock,
    upcomingVaccines,
    last7days,
    paymentMix,
    topServices,
    protocolDoses, // Nova query para lembretes de protocolos
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...unitFilter, scheduledAt: { gte: start, lte: end } },
      include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.appointment.count({ where: { ...unitFilter, status: "EM_ATENDIMENTO" } }),
    prisma.sale.findMany({
      where: { ...unitFilter, createdAt: { gte: start, lte: end }, status: "FINALIZADA" },
      include: { payments: { include: { paymentMethod: true } } },
    }),
    prisma.accountPayable.findMany({ where: { ...unitFilter, status: { in: ["ABERTA", "VENCIDA"] } }, orderBy: { dueDate: "asc" }, take: 10 }),
    prisma.accountReceivable.findMany({ where: { ...unitFilter, status: { in: ["ABERTA", "VENCIDA", "PARCIAL"] } }, orderBy: { dueDate: "asc" }, take: 10 }),
    prisma.hospitalization.findMany({ where: { ...unitFilter, status: "ATIVA" }, include: { pet: { include: { tutor: true } }, vet: true } }),
    prisma.stock.findMany({
      include: { product: true, unit: true },
      where: { unit: { tenantId }, product: { isActive: true } },
    }),
    prisma.vaccine.findMany({
      where: {
        pet: { tutor: { tenantId } },
        nextDose: { gte: new Date(), lte: new Date(Date.now() + 30 * 86400000) },
      },
      include: { pet: { include: { tutor: true } } },
      orderBy: { nextDose: "asc" }, take: 8,
    }),
    prisma.sale.findMany({
      where: { ...unitFilter, createdAt: { gte: new Date(Date.now() - 6 * 86400000) }, status: "FINALIZADA" },
    }),
    prisma.payment.findMany({
      where: { sale: { ...unitFilter }, paidAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      include: { paymentMethod: true },
    }),
    prisma.saleItem.groupBy({
      by: ["description"],
      where: { sale: { ...unitFilter } },
      _sum: { total: true }, orderBy: { _sum: { total: "desc" } }, take: 5,
    }),
    prisma.protocolApplication.findMany({
      where: { status: "PENDENTE", protocol: { tenantId } },
      include: { protocol: { include: { pet: { include: { tutor: true } } } } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const totalSalesToday = todaySales.reduce((s, x) => s + x.total, 0);
  const totalPayable = payable.reduce((s, x) => s + x.amount, 0);
  const totalReceivable = receivable.reduce((s, x) => s + x.amount, 0);

  const lowStockList = lowStock.filter((s) => s.quantity <= s.product.minStock).slice(0, 6);

  // Receita ultimos 7 dias
  const dayKey = (d: Date) => d.toLocaleDateString("pt-BR", { weekday: "short" });
  const days: { day: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const t = last7days.filter((s) => s.createdAt >= d && s.createdAt < next).reduce((sum, s) => sum + s.total, 0);
    days.push({ day: dayKey(d), total: Number(t.toFixed(2)) });
  }

  const mixMap = new Map<string, number>();
  for (const p of paymentMix) mixMap.set(p.paymentMethod.name, (mixMap.get(p.paymentMethod.name) ?? 0) + p.amount);
  const mixData = Array.from(mixMap.entries()).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

  const catData = topServices.map((g) => ({ name: g.description.slice(0, 16), total: Number((g._sum.total ?? 0).toFixed(2)) }));

  // Filtros para aba de lembretes
  const nowTime = new Date().getTime();
  const lateProtocols = protocolDoses.filter((d) => new Date(d.dueDate).getTime() < nowTime);
  const upcomingProtocols = protocolDoses.filter((d) => new Date(d.dueDate).getTime() >= nowTime);

  return (
    <>
      <PageHeader title="Dashboard" description="Visao geral do negocio em tempo real" />

      <OnboardingChecklist tenantId={tenantId} />

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-1">
        <Link
          href="/dashboard?tab=indicadores"
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "indicadores"
              ? "border-b-2 border-brand-600 text-brand-600 bg-brand-50/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          Indicadores e Metricas
        </Link>
        <Link
          href="/dashboard?tab=lembretes"
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "lembretes"
              ? "border-b-2 border-brand-600 text-brand-600 bg-brand-50/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Lembretes e Tarefas
          {protocolDoses.length > 0 && (
            <span className="ml-1 bg-red-500 text-white rounded-full text-[9px] px-1.5 py-0.5 font-bold">
              {protocolDoses.length}
            </span>
          )}
        </Link>
      </div>

      {activeTab === "indicadores" ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatCard title="Vendas hoje" value={fmtMoney(totalSalesToday)} hint={`${todaySales.length} vendas finalizadas`} icon={<ShoppingCart className="h-5 w-5" />} tone="orange" />
            <StatCard title="Atendimentos hoje" value={todayAppointments.length} hint={`${inProgress} em andamento`} icon={<CalendarDays className="h-5 w-5" />} tone="blue" />
            <StatCard title="Internacoes ativas" value={activeHosp.length} hint="Pets internados agora" icon={<BedDouble className="h-5 w-5" />} tone="green" />
            <StatCard title="Estoque baixo" value={lowStockList.length} hint="Produtos abaixo do minimo" icon={<AlertTriangle className="h-5 w-5" />} tone={lowStockList.length > 0 ? "red" : "gray"} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard title="Contas a receber" value={fmtMoney(totalReceivable)} hint={`${receivable.length} em aberto`} icon={<Receipt className="h-5 w-5" />} tone="green" />
            <StatCard title="Contas a pagar" value={fmtMoney(totalPayable)} hint={`${payable.length} em aberto`} icon={<FileText className="h-5 w-5" />} tone="red" />
            <StatCard title="Vacinas proximas" value={upcomingVaccines.length} hint="Vencem em 30 dias" icon={<Syringe className="h-5 w-5" />} tone="yellow" />
            <StatCard title="Caixa do dia" value={fmtMoney(totalSalesToday)} hint="Receita confirmada" icon={<PiggyBank className="h-5 w-5" />} tone="blue" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            <div className="card card-pad lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-800">Receita - ultimos 7 dias</h2>
                <span className="badge-blue">{fmtMoney(days.reduce((s, d) => s + d.total, 0))}</span>
              </div>
              <RevenueLine data={days} />
            </div>
            <div className="card card-pad">
              <h2 className="font-semibold text-slate-800 mb-3">Mix de pagamentos (30d)</h2>
              {mixData.length > 0 ? <PaymentMixPie data={mixData} /> : <p className="text-sm text-slate-500">Sem dados.</p>}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            <div className="card card-pad lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-800">Agenda de hoje</h2>
                <Link href="/agenda" className="text-xs text-brand-600 hover:underline">Ver agenda completa</Link>
              </div>
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">Sem agendamentos para hoje.</p>
              ) : (
                <table className="bp-table">
                  <thead><tr><th>Hora</th><th>Pet / Tutor</th><th>Servico</th><th>Profissional</th><th>Status</th></tr></thead>
                  <tbody>
                    {todayAppointments.map((a) => (
                      <tr key={a.id}>
                        <td className="font-medium">{fmtTime(a.scheduledAt)}</td>
                        <td>
                          <div className="font-medium text-slate-800">{a.pet?.name ?? "-"}</div>
                          <div className="text-xs text-slate-500">{a.tutor.name}</div>
                        </td>
                        <td>{a.services.map((s) => s.service.name).join(", ") || a.type}</td>
                        <td>{a.vet?.name ?? "-"}</td>
                        <td><StatusBadge value={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card card-pad">
              <h2 className="font-semibold text-slate-800 mb-3">Top itens vendidos (30d)</h2>
              {catData.length > 0 ? <CategoriesBar data={catData} /> : <p className="text-sm text-slate-500">Sem vendas no periodo.</p>}
            </div>
          </div>
        </>
      ) : (
        /* Nova aba exclusiva de lembretes e tarefas */
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Protocolos pendentes/atrasados */}
            <div className="card card-pad bg-white">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5 text-red-500" /> Protocolos Pendentes e Atrasados
              </h2>
              {lateProtocols.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-lg">Nenhuma aplicacao em atraso.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="bp-table text-xs">
                    <thead>
                      <tr>
                        <th>Vencido em</th>
                        <th>Pet / Tutor</th>
                        <th>Protocolo / Dose</th>
                        <th>Acao</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lateProtocols.map((dose) => (
                        <tr key={dose.id} className="bg-red-50/20">
                          <td className="font-bold text-red-600">{fmtDate(dose.dueDate)}</td>
                          <td>
                            <div className="font-medium text-slate-800">{dose.protocol.pet.name}</div>
                            <div className="text-[10px] text-slate-500">{dose.protocol.pet.tutor.name}</div>
                          </td>
                          <td>
                            <div className="font-medium">{dose.protocol.name}</div>
                            <div className="text-[10px] text-slate-400">{dose.notes || "Dose"}</div>
                          </td>
                          <td>
                            <Link
                              href={`/pets/${dose.protocol.petId}?tab=protocolos`}
                              className="text-brand-600 font-bold hover:underline"
                            >
                              Aplicar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Aplicações programadas (futuras) */}
            <div className="card card-pad bg-white">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-brand-700">
                <CalendarDays className="h-5 w-5 text-brand-500" /> Aplicacoes Programadas (Futuras)
              </h2>
              {upcomingProtocols.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-lg">Nenhuma aplicacao futura programada.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="bp-table text-xs">
                    <thead>
                      <tr>
                        <th>Programado para</th>
                        <th>Pet / Tutor</th>
                        <th>Protocolo / Dose</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingProtocols.map((dose) => (
                        <tr key={dose.id}>
                          <td className="font-semibold text-slate-700">{fmtDate(dose.dueDate)}</td>
                          <td>
                            <div className="font-medium text-slate-800">{dose.protocol.pet.name}</div>
                            <div className="text-[10px] text-slate-500">{dose.protocol.pet.tutor.name}</div>
                          </td>
                          <td>
                            <div className="font-medium">{dose.protocol.name}</div>
                            <div className="text-[10px] text-slate-400">{dose.notes || "Dose"}</div>
                          </td>
                          <td>
                            <span className="badge-gray">pendente</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Vencimentos e Tarefas Futuras */}
          <div className="space-y-5">
            <div className="card card-pad bg-white">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Syringe className="h-4 w-4 text-amber-500" /> Vacinas a Vencer (30d)
              </h2>
              {upcomingVaccines.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">Nenhuma vacina proxima.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {upcomingVaccines.map((v) => (
                    <li key={v.id} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
                      <div>
                        <div className="font-medium text-slate-850 flex items-center gap-1">
                          <PawPrint className="h-3 w-3 text-slate-400" /> {v.pet.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {v.name} • Tutor: {v.pet.tutor.name}
                        </div>
                      </div>
                      <span className="font-semibold text-amber-600">{v.nextDose?.toLocaleDateString("pt-BR")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card card-pad bg-white">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-brand-500" /> Contas a Pagar / Receber
              </h2>
              <div className="text-[10px] uppercase font-bold text-red-500 mb-2">Pagar Pendentes</div>
              <ul className="text-xs space-y-2 mb-4">
                {payable.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0">
                    <div className="truncate max-w-[150px] font-medium text-slate-700" title={p.description}>
                      {p.description}
                    </div>
                    <span className="text-red-600 font-bold">{fmtMoney(p.amount)}</span>
                  </li>
                ))}
                {payable.length === 0 && <li className="text-slate-400 text-xs">Nada a pagar</li>}
              </ul>

              <div className="text-[10px] uppercase font-bold text-emerald-600 mb-2">Receber Pendentes</div>
              <ul className="text-xs space-y-2">
                {receivable.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0">
                    <div className="truncate max-w-[150px] font-medium text-slate-700" title={r.description}>
                      {r.description}
                    </div>
                    <span className="text-emerald-600 font-bold">{fmtMoney(r.amount)}</span>
                  </li>
                ))}
                {receivable.length === 0 && <li className="text-slate-400 text-xs">Nada a receber</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    AGENDADO: "badge-gray",
    CONFIRMADO: "badge-blue",
    EM_ATENDIMENTO: "badge-orange",
    FINALIZADO: "badge-green",
    CANCELADO: "badge-red",
    NAO_COMPARECEU: "badge-yellow",
  };
  return <span className={map[value] ?? "badge-gray"}>{value.replace(/_/g, " ").toLowerCase()}</span>;
}
