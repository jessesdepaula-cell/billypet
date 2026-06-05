import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { fmtMoney, fmtTime, fmtDate } from "@/lib/utils";
import { CalendarDays, Wallet, ShoppingCart, AlertTriangle, BedDouble, Syringe, PiggyBank, Receipt, FileText, PawPrint, CheckCircle2 } from "lucide-react";
import { RevenueLine, CategoriesBar, PaymentMixPie } from "@/components/charts/DashboardCharts";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { tab?: string } }) {
  const { tenantId } = await requireTenant();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);

  const unitFilter = { unit: { tenantId } };
  const tab = searchParams.tab === "lembretes" ? "lembretes" : "geral";

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
    pendingApplications,
    activeProtocols,
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
    // Novas queries para aba Lembretes
    prisma.protocolApplication.findMany({
      where: { protocol: { pet: { tutor: { tenantId } } }, status: "PENDENTE" },
      include: { protocol: { include: { pet: { include: { tutor: true } } } } },
      orderBy: { plannedDate: "asc" }, take: 25,
    }),
    prisma.protocol.findMany({
      where: { pet: { tutor: { tenantId } }, status: "ATIVO" },
      include: { pet: { include: { tutor: true } }, applications: true },
      orderBy: { createdAt: "desc" }, take: 25,
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

  return (
    <>
      <PageHeader title="Dashboard" description="Visao geral do negocio em tempo real" />

      <OnboardingChecklist tenantId={tenantId} />

      {/* Controle de Abas Customizado */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <Link
          href="/dashboard?tab=geral"
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 px-1 transition-colors",
            tab === "geral" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          Visão Geral
        </Link>
        <Link
          href="/dashboard?tab=lembretes"
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 px-1 transition-colors relative flex items-center gap-1.5",
            tab === "lembretes" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          Lembretes e Protocolos
          {pendingApplications.length > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white px-1">
              {pendingApplications.length}
            </span>
          )}
        </Link>
      </div>

      {tab === "geral" ? (
        /* ABA GERAL */
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
        /* ABA LEMBRETES E PROTOCOLOS */
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Doses/Aplicações de Protocolos Pendentes */}
            <div className="card card-pad">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Syringe className="h-5 w-5 text-brand-500" /> Aplicações de Protocolos Programadas
              </h2>
              {pendingApplications.length === 0 ? (
                <p className="text-sm text-slate-500 py-3">Nenhuma aplicação pendente ou atrasada.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="bp-table text-sm">
                    <thead>
                      <tr>
                        <th>Pet / Tutor</th>
                        <th>Protocolo</th>
                        <th>Dose</th>
                        <th>Data Programada</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApplications.map((app) => {
                        const isLate = new Date(app.plannedDate) < new Date();
                        return (
                          <tr key={app.id} className={isLate ? "bg-red-50/50" : ""}>
                            <td>
                              <div className="font-medium text-slate-800">
                                <Link href={`/pets/${app.protocol.petId}`} className="hover:underline text-brand-600">
                                  {app.protocol.pet.name}
                                </Link>
                              </div>
                              <div className="text-xs text-slate-500">{app.protocol.pet.tutor.name}</div>
                            </td>
                            <td>
                              <span className="font-medium">{app.protocol.name}</span>
                              <span className="text-xs text-slate-400 block">{app.protocol.type}</span>
                            </td>
                            <td>Dose {app.doseNumber}</td>
                            <td>
                              <span className={cn("font-medium", isLate ? "text-red-600" : "text-slate-700")}>
                                {fmtDate(app.plannedDate)}
                              </span>
                              {isLate && <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1 rounded ml-1.5">ATRASADO</span>}
                            </td>
                            <td>
                              <Link
                                href={`/atendimento?petId=${app.protocol.petId}`}
                                className="text-xs text-brand-600 hover:underline"
                              >
                                Ir para ficha
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Protocolos Ativos */}
            <div className="card card-pad">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Protocolos Ativos da Clínica
              </h2>
              {activeProtocols.length === 0 ? (
                <p className="text-sm text-slate-500 py-3">Nenhum protocolo ativo registrado atualmente.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeProtocols.map((pr) => {
                    const completedDoses = pr.applications.filter((a: any) => a.status === "APLICADO").length;
                    const totalDoses = pr.applications.length;
                    const progressPct = Math.round((completedDoses / totalDoses) * 100) || 0;
                    return (
                      <div key={pr.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-slate-800">{pr.name}</h3>
                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded uppercase">
                              {pr.type}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-600">
                            {completedDoses}/{totalDoses} doses
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          <b>Pet:</b> {pr.pet.name} (Tutor: {pr.pet.tutor.name})
                        </div>
                        <div className="text-xs text-slate-500">
                          <b>Início:</b> {fmtDate(pr.startDate)}
                        </div>
                        {/* Progresso */}
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                          <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {/* Vacinas Próximas */}
            <div className="card card-pad">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Syringe className="h-4 w-4 text-amber-500" /> Vacinas Próximas (30 dias)
              </h2>
              {upcomingVaccines.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma vacina próxima.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingVaccines.map((v) => (
                    <li key={v.id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                      <div>
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <PawPrint className="h-3 w-3 text-slate-400" /> {v.pet.name}
                        </div>
                        <div className="text-xs text-slate-500">{v.name} - {v.pet.tutor.name}</div>
                      </div>
                      <span className="badge-yellow">{v.nextDose?.toLocaleDateString("pt-BR")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Contas a Vencer Futuras */}
            <div className="card card-pad">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-brand-500" /> Contas e Tarefas Financeiras
              </h2>
              <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">A Pagar em Aberto</div>
              <ul className="text-sm space-y-1 mb-4">
                {payable.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex justify-between border-b border-slate-50 py-1 last:border-0">
                    <span className="truncate pr-2 text-slate-700">{p.description}</span>
                    <span className="text-red-600 font-medium shrink-0">{fmtMoney(p.amount)}</span>
                  </li>
                ))}
                {payable.length === 0 && <li className="text-slate-400 text-xs py-1">Sem contas a pagar em aberto.</li>}
              </ul>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">A Receber em Aberto</div>
              <ul className="text-sm space-y-1">
                {receivable.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex justify-between border-b border-slate-50 py-1 last:border-0">
                    <span className="truncate pr-2 text-slate-700">{r.description}</span>
                    <span className="text-emerald-600 font-medium shrink-0">{fmtMoney(r.amount)}</span>
                  </li>
                ))}
                {receivable.length === 0 && <li className="text-slate-400 text-xs py-1">Sem contas a receber.</li>}
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
