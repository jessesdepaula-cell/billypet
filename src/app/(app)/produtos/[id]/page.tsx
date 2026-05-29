import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "../ProductForm";
import { fmtDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProdutoDetailPage({ params }: { params: { id: string } }) {
  const { tenantId } = await requireTenant();
  const product = await prisma.product.findFirst({
    where: { id: params.id, tenantId },
    include: {
      stocks: { include: { unit: true } },
      movements: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
  if (!product) return notFound();
  const [categories, suppliers] = await Promise.all([
    prisma.productCategory.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title={product.name} description={`SKU: ${product.sku ?? "-"}`} />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><ProductForm initial={product as any} categories={categories} suppliers={suppliers} /></div>
        <div className="space-y-5">
          <div className="card card-pad">
            <h3 className="font-semibold mb-3">Estoque por unidade</h3>
            <ul className="space-y-1 text-sm">{product.stocks.map((s) => (
              <li key={s.id} className="flex justify-between"><span>{s.unit.name}</span><span className={s.quantity <= product.minStock ? "badge-red" : "badge-green"}>{s.quantity} {product.unit}</span></li>
            ))}</ul>
          </div>
          <div className="card card-pad">
            <h3 className="font-semibold mb-3">Movimentacoes recentes</h3>
            <ul className="space-y-1 text-sm">{product.movements.map((m) => (
              <li key={m.id} className="flex justify-between"><span className="text-xs text-slate-500">{fmtDateTime(m.createdAt)}</span><span>{m.type} {m.quantity > 0 ? "+" : ""}{m.quantity}</span></li>
            ))}{product.movements.length === 0 && <li className="text-slate-500">Sem movimentacoes.</li>}</ul>
          </div>
        </div>
      </div>
    </>
  );
}
