import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const { tenantId } = await requireTenant();
  const products = await prisma.product.findMany({
    where: { tenantId, isActive: true },
    include: { stocks: { include: { unit: true } } },
    orderBy: { name: "asc" },
  });
  const valorTotal = products.reduce((s, p) => s + p.stocks.reduce((q, st) => q + st.quantity, 0) * p.costPrice, 0);
  return (
    <>
      <PageHeader title="Inventario" description="Posicao consolidada de estoque por produto e unidade" />
      <div className="card card-pad mb-4">
        <div className="text-xs text-slate-500">Valor total em estoque (custo)</div>
        <div className="text-3xl font-bold">{fmtMoney(valorTotal)}</div>
      </div>
      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Produto</th><th>SKU</th><th>Custo</th><th>Por unidade</th><th>Total</th><th>Valor em custo</th></tr></thead>
          <tbody>
            {products.map((p) => {
              const total = p.stocks.reduce((s, st) => s + st.quantity, 0);
              return (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td className="text-xs">{p.sku ?? "-"}</td>
                  <td className="text-xs">{fmtMoney(p.costPrice)}</td>
                  <td className="text-xs">{p.stocks.map((s) => `${s.unit.name}: ${s.quantity}`).join(" / ")}</td>
                  <td className={total <= p.minStock ? "badge-red" : "badge-green"}>{total} {p.unit}</td>
                  <td className="font-semibold">{fmtMoney(total * p.costPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
