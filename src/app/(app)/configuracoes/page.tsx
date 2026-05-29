import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const { tenantId } = await requireTenant();
  const [services, methods, machines, categories, suppliers, commissionRules] = await Promise.all([
    prisma.service.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.cardMachine.findMany({ where: { tenantId } }),
    prisma.productCategory.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.commissionRule.findMany({ where: { isActive: true, userId: { in: (await prisma.user.findMany({ where: { tenantId }, select: { id: true } })).map((u) => u.id) } } }),
  ]);

  return (
    <>
      <PageHeader title="Cadastros e configuracoes" description="Servicos, formas de pagamento, maquinas de cartao, comissoes e auxiliares" tutorialSlug="configuracoes" />
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Servicos">
          <table className="bp-table"><thead><tr><th>Nome</th><th>Categoria</th><th>Tempo</th><th>Preco</th><th>Comissao</th></tr></thead>
            <tbody>{services.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.category}</td><td>{s.durationMinutes}min</td><td>{fmtMoney(s.price)}</td><td>{s.commissionPct}%</td></tr>)}</tbody>
          </table>
        </Card>

        <Card title="Formas de pagamento">
          <ul className="space-y-1 text-sm">{methods.map((m) => <li key={m.id} className="flex justify-between"><span>{m.name}</span><span className="badge-gray">{m.type}</span></li>)}</ul>
        </Card>

        <Card title="Maquinas de cartao">
          <table className="bp-table"><thead><tr><th>Nome</th><th>Operadora</th><th>Debito</th><th>Credito</th><th>Recebimento</th></tr></thead>
            <tbody>{machines.map((m) => <tr key={m.id}><td>{m.name}</td><td>{m.operator}</td><td>{m.debitFee}%</td><td>{m.creditFee}%</td><td>{m.receivingDays}d</td></tr>)}</tbody>
          </table>
        </Card>

        <Card title="Categorias de produtos">
          <ul className="space-y-1 text-sm">{categories.map((c) => <li key={c.id}>{c.name}</li>)}</ul>
        </Card>

        <Card title="Fornecedores">
          <ul className="space-y-1 text-sm">{suppliers.map((s) => <li key={s.id} className="flex justify-between"><span>{s.name}</span><span className="text-xs text-slate-500">{s.phone ?? ""}</span></li>)}</ul>
        </Card>

        <Card title="Regras de comissao">
          {commissionRules.length === 0 ? <p className="text-sm text-slate-500">Comissoes calculadas pelo percentual padrao do servico.</p> :
            <ul className="space-y-1 text-sm">{commissionRules.map((r) => <li key={r.id}>{r.percent}% / R$ {r.fixedValue}</li>)}</ul>}
        </Card>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card card-pad">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
