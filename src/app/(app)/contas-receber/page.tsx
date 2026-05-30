import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDate, fmtMoney } from "@/lib/utils";
import { ReceivableActions } from "./Actions";
import { ReceiveClient } from "./ReceiveClient";

export const dynamic = "force-dynamic";

export default async function ContasReceberPage() {
  const { tenantId } = await requireModule("contas-receber");
  const [list, tutors] = await Promise.all([
    prisma.accountReceivable.findMany({ where: { unit: { tenantId } }, include: { tutor: true }, orderBy: { dueDate: "asc" }, take: 200 }),
    prisma.tutor.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const total = list.filter((a) => a.status !== "PAGA").reduce((s, a) => s + a.amount, 0);
  const vencidas = list.filter((a) => a.status === "VENCIDA").reduce((s, a) => s + a.amount, 0);
  return (
    <>
      <PageHeader title="Contas a receber" description="Mensalidades, parcelamentos e atendimentos em aberto" tutorialSlug="contas-receber" />
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="card card-pad"><div className="text-xs text-slate-500">Total em aberto</div><div className="text-2xl font-bold text-emerald-600">{fmtMoney(total)}</div></div>
        <div className="card card-pad"><div className="text-xs text-slate-500">Vencidas (inadimplencia)</div><div className="text-2xl font-bold text-red-600">{fmtMoney(vencidas)}</div></div>
        <div className="card card-pad"><div className="text-xs text-slate-500">Quantidade</div><div className="text-2xl font-bold">{list.filter((a) => a.status !== "PAGA").length}</div></div>
      </div>
      <ReceivableActions tutors={tutors.map((t) => ({ id: t.id, name: t.name }))} />
      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Vencimento</th><th>Cliente</th><th>Descricao</th><th>Parcela</th><th>Valor</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td>{fmtDate(a.dueDate)}</td>
                <td>{a.tutor?.name ?? "-"}</td>
                <td>{a.description}</td>
                <td className="text-xs">{a.installment ?? "-"}</td>
                <td className="font-semibold">{fmtMoney(a.amount)}</td>
                <td><StatusBadge value={a.status} /></td>
                <td className="text-right">{a.status !== "PAGA" && <ReceiveClient id={a.id} amount={a.amount} />}</td>
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
