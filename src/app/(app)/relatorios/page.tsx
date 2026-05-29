import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtMoney } from "@/lib/utils";
import { CategoriesBar, RevenueLine } from "@/components/charts/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const { tenantId } = await requireTenant();
  const start30 = new Date(Date.now() - 30 * 86400000);
  const [salesByDay, topItems, topClients, lowStock, expiringSoon] = await Promise.all([
    prisma.sale.findMany({ where: { unit: { tenantId }, createdAt: { gte: start30 }, status: "FINALIZADA" } }),
    prisma.saleItem.groupBy({ by: ["description"], where: { sale: { unit: { tenantId } } }, _sum: { total: true, quantity: true }, orderBy: { _sum: { total: "desc" } }, take: 10 }),
    prisma.sale.groupBy({ by: ["tutorId"], where: { unit: { tenantId } }, _sum: { total: true }, _count: true, orderBy: { _sum: { total: "desc" } }, take: 10 }),
    prisma.stock.findMany({ where: { unit: { tenantId }, product: { isActive: true } }, include: { product: true, unit: true } }),
    prisma.stock.findMany({ where: { unit: { tenantId }, expiresAt: { lte: new Date(Date.now() + 60 * 86400000), gte: new Date() } }, include: { product: true, unit: true } }),
  ]);

  const tutorIds = topClients.map((t) => t.tutorId).filter(Boolean) as string[];
  const tutorsMap = new Map((await prisma.tutor.findMany({ where: { tenantId, id: { in: tutorIds } } })).map((t) => [t.id, t.name]));

  const days: { day: string; total: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const n = new Date(d); n.setDate(d.getDate() + 1);
    const t = salesByDay.filter((s) => s.createdAt >= d && s.createdAt < n).reduce((s, x) => s + x.total, 0);
    days.push({ day: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), total: Number(t.toFixed(2)) });
  }
  const cats = topItems.slice(0, 8).map((g) => ({ name: g.description.slice(0, 16), total: Number((g._sum.total ?? 0).toFixed(2)) }));

  function exportCsvLink(rows: any[][], filename: string) {
    const data = rows.map((r) => r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const href = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
    return <a download={filename} href={href} className="btn-outline text-xs">Exportar CSV</a>;
  }

  return (
    <>
      <PageHeader title="Relatorios" description="Visao consolidada com filtro padrao dos ultimos 30 dias" tutorialSlug="relatorios" />

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="card card-pad lg:col-span-2">
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Receita 30 dias</h3>
            {exportCsvLink([["Data", "Total"], ...days.map((d) => [d.day, d.total])], "receita-30d.csv")}
          </div>
          <RevenueLine data={days} />
        </div>
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Top itens vendidos</h3>
            {exportCsvLink([["Item", "Qtd", "Total"], ...topItems.map((g) => [g.description, g._sum.quantity ?? 0, g._sum.total ?? 0])], "top-itens.csv")}
          </div>
          <CategoriesBar data={cats} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Curva ABC de clientes (top 10)</h3>
            {exportCsvLink([["Tutor", "Compras", "Total"], ...topClients.map((c) => [tutorsMap.get(c.tutorId!) ?? "-", c._count, c._sum.total ?? 0])], "abc-clientes.csv")}
          </div>
          <table className="bp-table"><thead><tr><th>Tutor</th><th>Compras</th><th>Total</th></tr></thead>
            <tbody>{topClients.map((c) => (
              <tr key={c.tutorId}><td>{tutorsMap.get(c.tutorId!) ?? "Avulso"}</td><td>{c._count}</td><td className="font-medium">{fmtMoney(c._sum.total ?? 0)}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Estoque baixo</h3>
            {exportCsvLink([["Produto", "Unidade", "Quantidade", "Minimo"], ...lowStock.filter((s) => s.quantity <= s.product.minStock).map((s) => [s.product.name, s.unit.name, s.quantity, s.product.minStock])], "estoque-baixo.csv")}
          </div>
          <table className="bp-table"><thead><tr><th>Produto</th><th>Unidade</th><th>Qtd</th><th>Min</th></tr></thead>
            <tbody>{lowStock.filter((s) => s.quantity <= s.product.minStock).slice(0, 20).map((s) => (
              <tr key={s.id}><td>{s.product.name}</td><td>{s.unit.name}</td><td><span className="badge-red">{s.quantity}</span></td><td>{s.product.minStock}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="card card-pad mb-5">
        <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Produtos proximos do vencimento (60 dias)</h3>
          {exportCsvLink([["Produto", "Unidade", "Validade", "Quantidade"], ...expiringSoon.map((s) => [s.product.name, s.unit.name, s.expiresAt?.toISOString().slice(0, 10) ?? "-", s.quantity])], "validade.csv")}
        </div>
        <table className="bp-table"><thead><tr><th>Produto</th><th>Unidade</th><th>Validade</th><th>Quantidade</th></tr></thead>
          <tbody>{expiringSoon.map((s) => (
            <tr key={s.id}><td>{s.product.name}</td><td>{s.unit.name}</td><td>{s.expiresAt?.toLocaleDateString("pt-BR")}</td><td>{s.quantity}</td></tr>
          ))}{expiringSoon.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-slate-500">Nenhum produto no periodo.</td></tr>}</tbody>
        </table>
      </div>

      <div className="card card-pad text-sm text-slate-500">
        Outros relatorios disponiveis: contas pagas, contas recebidas, fluxo de caixa, vendas, comissoes, pacotes,
        vacinas, internacoes, producao por setor, agenda, resumo de atendimentos e auditoria de preco. Use os
        filtros de periodo, unidade e profissional. Exportacao em CSV (acima) e PDF via impressao do navegador.
      </div>
    </>
  );
}
