import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";
import { StockForm } from "./StockForm";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const { tenantId } = await requireTenant();
  const [products, units, movements] = await Promise.all([
    prisma.product.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, unit: true } }),
    prisma.unit.findMany({ where: { tenantId, isActive: true }, select: { id: true, name: true } }),
    prisma.stockMovement.findMany({ where: { product: { tenantId } }, include: { product: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return (
    <>
      <PageHeader title="Movimentacoes de estoque" description="Entradas, saidas, perdas, ajustes e devolucoes" tutorialSlug="estoque" />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1"><StockForm products={products} units={units} /></div>
        <div className="lg:col-span-2 card overflow-hidden">
          <table className="bp-table">
            <thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Motivo</th></tr></thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="text-xs">{fmtDateTime(m.createdAt)}</td>
                  <td>{m.product.name}</td>
                  <td><span className="badge-gray text-xs">{m.type.replace(/_/g, " ").toLowerCase()}</span></td>
                  <td className={m.quantity >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{m.quantity >= 0 ? "+" : ""}{m.quantity}</td>
                  <td className="text-xs text-slate-500">{m.reason ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
