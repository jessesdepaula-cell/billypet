import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDate, fmtMoney } from "@/lib/utils";
import { PayableActions } from "./Actions";
import { PayClient } from "./PayClient";

export default async function ContasPagarPage() {
  const [list, suppliers] = await Promise.all([
    prisma.accountPayable.findMany({ include: { supplier: true }, orderBy: { dueDate: "asc" }, take: 200 }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const total = list.filter((a) => a.status !== "PAGA").reduce((s, a) => s + a.amount, 0);
  const vencidas = list.filter((a) => a.status === "VENCIDA").reduce((s, a) => s + a.amount, 0);
  return (
    <>
      <PageHeader title="Contas a pagar" description="Fornecedores, despesas fixas e variaveis" />
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="card card-pad"><div className="text-xs text-slate-500">Total em aberto</div><div className="text-2xl font-bold text-red-600">{fmtMoney(total)}</div></div>
        <div className="card card-pad"><div className="text-xs text-slate-500">Vencidas</div><div className="text-2xl font-bold text-red-600">{fmtMoney(vencidas)}</div></div>
        <div className="card card-pad"><div className="text-xs text-slate-500">Quantidade</div><div className="text-2xl font-bold">{list.filter((a) => a.status !== "PAGA").length}</div></div>
      </div>
      <PayableActions suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} />
      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Vencimento</th><th>Fornecedor / Categoria</th><th>Descricao</th><th>Centro</th><th>Valor</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td>{fmtDate(a.dueDate)}</td>
                <td>{a.supplier?.name ?? a.category ?? "-"}</td>
                <td>{a.description}</td>
                <td className="text-xs">{a.costCenter ?? "-"}</td>
                <td className="font-semibold">{fmtMoney(a.amount)}</td>
                <td><StatusBadge value={a.status} /></td>
                <td className="text-right">{a.status !== "PAGA" && <PayClient id={a.id} kind="payable" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusBadge({ value }: { value: string }) {
  const m: Record<string, string> = { ABERTA: "badge-blue", PAGA: "badge-green", VENCIDA: "badge-red", CANCELADA: "badge-gray", PARCIAL: "badge-yellow" };
  return <span className={m[value] ?? "badge-gray"}>{value.toLowerCase()}</span>;
}
