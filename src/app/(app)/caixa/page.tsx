import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime, fmtMoney } from "@/lib/utils";
import { CashActions } from "./CashActions";

export const dynamic = "force-dynamic";

export default async function CaixaPage() {
  const { unitId } = await requireTenant();
  const open = await prisma.cashRegister.findFirst({
    where: { unitId, status: "ABERTO" },
    include: { transactions: { orderBy: { createdAt: "desc" } }, openedBy: true },
    orderBy: { openedAt: "desc" },
  });
  const closedToday = await prisma.cashRegister.findMany({
    where: { unitId, status: "FECHADO", closedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    orderBy: { closedAt: "desc" }, take: 7,
  });

  const entradas = open?.transactions.filter((t) => t.type === "ENTRADA" || t.type === "SUPRIMENTO").reduce((s, t) => s + t.amount, 0) ?? 0;
  const saidas = open?.transactions.filter((t) => t.type === "SAIDA" || t.type === "SANGRIA").reduce((s, t) => s + t.amount, 0) ?? 0;
  const saldo = (open?.openValue ?? 0) + entradas - saidas;

  return (
    <>
      <PageHeader title="Caixa diario" description="Abertura, fechamento, sangrias e suprimentos" />
      {!open ? (
        <CashActions mode="open" />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="card card-pad">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><div className="text-xs text-slate-500">Aberto em</div><div className="font-medium">{fmtDateTime(open.openedAt)}</div></div>
                <div><div className="text-xs text-slate-500">Por</div><div className="font-medium">{open.openedBy.name}</div></div>
                <div><div className="text-xs text-slate-500">Valor inicial</div><div className="font-medium">{fmtMoney(open.openValue)}</div></div>
                <div><div className="text-xs text-slate-500">Saldo atual</div><div className="text-lg font-bold text-emerald-600">{fmtMoney(saldo)}</div></div>
              </div>
            </div>
            <CashActions mode="manage" id={open.id} suggestedClose={saldo} />
            <div className="card card-pad">
              <h3 className="font-semibold mb-3">Lancamentos do caixa</h3>
              <table className="bp-table">
                <thead><tr><th>Quando</th><th>Tipo</th><th>Descricao</th><th>Valor</th></tr></thead>
                <tbody>
                  {open.transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="text-xs">{fmtDateTime(t.createdAt)}</td>
                      <td><span className="badge-gray">{t.type.toLowerCase()}</span></td>
                      <td>{t.description}</td>
                      <td className={t.type === "ENTRADA" || t.type === "SUPRIMENTO" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                        {t.type === "ENTRADA" || t.type === "SUPRIMENTO" ? "+" : "-"} {fmtMoney(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-5">
            <div className="card card-pad"><div className="text-xs text-slate-500">Entradas</div><div className="text-xl font-bold text-emerald-600">{fmtMoney(entradas)}</div></div>
            <div className="card card-pad"><div className="text-xs text-slate-500">Saidas + sangrias</div><div className="text-xl font-bold text-red-600">{fmtMoney(saidas)}</div></div>
            <div className="card card-pad">
              <h3 className="font-semibold mb-3">Caixas fechados recentes</h3>
              <ul className="space-y-1 text-sm">{closedToday.map((c) => (
                <li key={c.id} className="flex justify-between"><span>{fmtDateTime(c.closedAt)}</span><span>{fmtMoney(c.closeValue ?? 0)}</span></li>
              ))}{closedToday.length === 0 && <li className="text-slate-500">Nenhum.</li>}</ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
