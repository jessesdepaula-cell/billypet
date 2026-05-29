import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDate, fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PacotesPage() {
  const { tenantId } = await requireTenant();
  const packages = await prisma.servicePackage.findMany({
    where: { tutor: { tenantId } },
    include: { tutor: true, pet: true, services: { include: { service: true } }, usages: { orderBy: { usedAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  const totalSold = packages.length;
  const totalActive = packages.filter((p) => p.isActive && (!p.validUntil || p.validUntil > new Date())).length;
  return (
    <>
      <PageHeader title="Pacotes de servicos" description="Pacotes de banho, tosa, consultas e outros" tutorialSlug="pacotes" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="card card-pad"><div className="text-xs text-slate-500">Total de pacotes</div><div className="text-2xl font-bold">{totalSold}</div></div>
        <div className="card card-pad"><div className="text-xs text-slate-500">Ativos</div><div className="text-2xl font-bold text-emerald-600">{totalActive}</div></div>
        <div className="card card-pad"><div className="text-xs text-slate-500">Servicos usados</div><div className="text-2xl font-bold">{packages.reduce((s, p) => s + p.usedQuantity, 0)}</div></div>
        <div className="card card-pad"><div className="text-xs text-slate-500">Saldo total</div><div className="text-2xl font-bold">{packages.reduce((s, p) => s + (p.totalQuantity - p.usedQuantity), 0)}</div></div>
      </div>
      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Pacote</th><th>Tutor / Pet</th><th>Servicos</th><th>Usado</th><th>Saldo</th><th>Validade</th><th>Valor</th></tr></thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.name}</td>
                <td>{p.tutor?.name ?? "-"}<div className="text-xs text-slate-500">{p.pet?.name ?? ""}</div></td>
                <td className="text-xs">{p.services.map((s) => s.service.name).join(", ")}</td>
                <td>{p.usedQuantity} / {p.totalQuantity}</td>
                <td><span className="badge-blue">{p.totalQuantity - p.usedQuantity}</span></td>
                <td>{fmtDate(p.validUntil)}</td>
                <td className="font-semibold">{fmtMoney(p.price)}</td>
              </tr>
            ))}
            {packages.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-500">Sem pacotes.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
