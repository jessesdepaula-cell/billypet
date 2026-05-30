import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";
import { TransferForm } from "./TransferForm";

export const dynamic = "force-dynamic";

export default async function TransferenciasPage() {
  const { tenantId } = await requireModule("transferencias");
  const [products, units, transfers] = await Promise.all([
    prisma.product.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.unit.findMany({ where: { tenantId, isActive: true }, select: { id: true, name: true } }),
    prisma.stockMovement.findMany({ where: { product: { tenantId }, type: "TRANSFERENCIA" }, include: { product: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return (
    <>
      <PageHeader title="Transferencias entre estoques" tutorialSlug="estoque" />
      <div className="grid lg:grid-cols-3 gap-5">
        <TransferForm products={products} units={units} />
        <div className="lg:col-span-2 card overflow-hidden">
          <table className="bp-table">
            <thead><tr><th>Data</th><th>Produto</th><th>Quantidade</th><th>Movimento</th></tr></thead>
            <tbody>
              {transfers.map((m) => (
                <tr key={m.id}>
                  <td className="text-xs">{fmtDateTime(m.createdAt)}</td>
                  <td>{m.product.name}</td>
                  <td className={m.quantity >= 0 ? "text-emerald-600" : "text-red-600"}>{m.quantity >= 0 ? "+" : ""}{m.quantity}</td>
                  <td className="text-xs">{m.reason ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
