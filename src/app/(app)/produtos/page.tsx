import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtMoney } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

export default async function ProdutosPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }, { barcode: { contains: q } }, { brand: { contains: q } }] } : {}),
    },
    include: { category: true, supplier: true, stocks: true },
    orderBy: { name: "asc" }, take: 300,
  });
  return (
    <>
      <PageHeader title="Produtos" description="Cadastro de produtos comercializaveis e insumos"
        actions={<Link className="btn-primary" href="/produtos/novo"><Plus className="h-4 w-4" /> Novo produto</Link>} />
      <form className="card card-pad mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" name="q" defaultValue={q} placeholder="Buscar por nome, SKU, codigo de barras ou marca" />
        </div>
        <button className="btn-outline">Buscar</button>
      </form>
      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Nome</th><th>SKU</th><th>Categoria</th><th>Marca</th><th>Custo</th><th>Venda</th><th>Estoque</th><th>Min</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => {
              const total = p.stocks.reduce((s, x) => s + x.quantity, 0);
              const low = total <= p.minStock;
              return (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td className="text-xs">{p.sku ?? "-"}</td>
                  <td>{p.category?.name ?? "-"}</td>
                  <td>{p.brand ?? "-"}</td>
                  <td>{fmtMoney(p.costPrice)}</td>
                  <td className="font-medium">{fmtMoney(p.salePrice)}</td>
                  <td><span className={low ? "badge-red" : "badge-green"}>{total} {p.unit}</span></td>
                  <td className="text-slate-500">{p.minStock}</td>
                  <td className="text-right"><Link className="text-brand-600 text-sm hover:underline" href={`/produtos/${p.id}`}>abrir</Link></td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan={9} className="text-center py-6 text-slate-500">Nenhum produto.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
