import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServicesManager } from "./ServicesManager";
import { SimpleManager } from "./SimpleManager";
import { SupplierManager } from "./SupplierManager";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const { tenantId } = await requireModule("configuracoes");
  const [services, methods, machines, categories, suppliers] = await Promise.all([
    prisma.service.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.cardMachine.findMany({ where: { tenantId } }),
    prisma.productCategory.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Cadastros e configuracoes"
        description="Servicos, formas de pagamento, categorias e fornecedores"
        tutorialSlug="configuracoes"
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card card-pad lg:col-span-2">
          <ServicesManager
            initial={services.map((s) => ({
              id: s.id, name: s.name, category: s.category, durationMinutes: s.durationMinutes,
              price: s.price, commissionPct: s.commissionPct, isActive: s.isActive,
            }))}
          />
        </div>

        <div className="card card-pad">
          <SimpleManager
            title="Categorias de produtos"
            endpoint="/api/categories"
            initial={categories.map((c) => ({ id: c.id, name: c.name }))}
            emptyMessage="Crie categorias para organizar produtos (Racao, Medicamento, etc)."
          />
        </div>

        <div className="card card-pad">
          <SupplierManager
            initial={suppliers.map((s) => ({
              id: s.id, name: s.name, document: s.document, phone: s.phone, email: s.email,
            }))}
          />
        </div>

        <div className="card card-pad">
          <h3 className="font-semibold mb-3">Formas de pagamento</h3>
          <ul className="space-y-1 text-sm">{methods.map((m) => (
            <li key={m.id} className="flex justify-between">
              <span>{m.name}</span>
              <span className="badge-gray">{m.type}</span>
            </li>
          ))}</ul>
          <p className="text-xs text-slate-500 mt-3">Em breve: gerenciar formas customizadas (convenio, vale, etc).</p>
        </div>

        <div className="card card-pad">
          <h3 className="font-semibold mb-3">Maquinas de cartao</h3>
          {machines.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma maquina cadastrada. <span className="text-xs">Em breve: cadastro com taxas e prazo de recebimento.</span></p>
          ) : (
            <table className="bp-table text-sm">
              <thead><tr><th>Nome</th><th>Operadora</th><th>Debito</th><th>Credito</th><th>Recebimento</th></tr></thead>
              <tbody>{machines.map((m) => (
                <tr key={m.id}><td>{m.name}</td><td>{m.operator}</td><td>{m.debitFee}%</td><td>{m.creditFee}%</td><td>{m.receivingDays}d</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
