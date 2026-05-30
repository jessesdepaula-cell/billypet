import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime, fmtMoney } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VendasPage() {
  const { tenantId } = await requireModule("vendas");
  const sales = await prisma.sale.findMany({
    where: { unit: { tenantId } },
    include: { tutor: true, seller: true, items: true, payments: { include: { paymentMethod: true } } },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return (
    <>
      <PageHeader title="Vendas"
        tutorialSlug="vendas-pdv"
        actions={<Link href="/vendas/nova" className="btn-primary"><Plus className="h-4 w-4" /> Nova venda</Link>} />
      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Data</th><th>Tutor</th><th>Vendedor</th><th>Itens</th><th>Pagamento</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td>{fmtDateTime(s.createdAt)}</td>
                <td>{s.tutor?.name ?? "Avulso"}</td>
                <td>{s.seller?.name ?? "-"}</td>
                <td className="text-xs">{s.items.length} item(ns)</td>
                <td className="text-xs">{s.payments.map((p) => p.paymentMethod.name).join(", ")}</td>
                <td className="font-semibold">{fmtMoney(s.total)}</td>
                <td><span className={s.status === "FINALIZADA" ? "badge-green" : s.status === "CANCELADA" ? "badge-red" : "badge-yellow"}>{s.status.toLowerCase()}</span></td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-500">Nenhuma venda registrada ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
