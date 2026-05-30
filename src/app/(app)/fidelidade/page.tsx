import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FidelidadePage() {
  const { tenantId } = await requireModule("fidelidade");
  const [topTutors, recent] = await Promise.all([
    prisma.tutor.findMany({ where: { tenantId, isActive: true, loyaltyPoints: { gt: 0 } }, orderBy: { loyaltyPoints: "desc" }, take: 20 }),
    prisma.loyaltyTransaction.findMany({ where: { tutor: { tenantId } }, include: { tutor: true }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return (
    <>
      <PageHeader title="Programa de fidelidade" description="Regra padrao: 1 ponto a cada R$ 10 em compras / servicos" tutorialSlug="pacotes" />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card card-pad lg:col-span-2">
          <h3 className="font-semibold mb-3">Top tutores fidelidade</h3>
          <table className="bp-table">
            <thead><tr><th>Tutor</th><th>Telefone</th><th>Pontos</th></tr></thead>
            <tbody>
              {topTutors.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.name}</td>
                  <td className="text-slate-500">{t.phone ?? "-"}</td>
                  <td><span className="badge-orange">{t.loyaltyPoints}</span></td>
                </tr>
              ))}
              {topTutors.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-slate-500">Sem dados.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card card-pad">
          <h3 className="font-semibold mb-3">Movimentacoes recentes</h3>
          <ul className="space-y-2 text-sm">{recent.map((r) => (
            <li key={r.id} className="border-b border-slate-100 pb-2 last:border-0">
              <div className="flex justify-between">
                <span className="font-medium">{r.tutor.name}</span>
                <span className={r.points > 0 ? "text-emerald-600" : "text-red-600"}>{r.points > 0 ? "+" : ""}{r.points}</span>
              </div>
              <div className="text-xs text-slate-500">{r.reason} - {fmtDateTime(r.createdAt)}</div>
            </li>
          ))}</ul>
        </div>
      </div>
    </>
  );
}
