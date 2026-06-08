import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServicesManager } from "./ServicesManager";
import { SimpleManager } from "./SimpleManager";
import { SupplierManager } from "./SupplierManager";
import { StatusManager } from "./StatusManager";
import { CollaboratorsManager } from "./CollaboratorsManager";
import { ProtocolsManager } from "./ProtocolsManager";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const { tenantId } = await requireModule("configuracoes");
  
  let [
    services,
    methods,
    machines,
    categories,
    suppliers,
    statuses,
    users,
    userServices,
    protocols,
    pets
  ] = await Promise.all([
    prisma.service.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.paymentMethod.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.cardMachine.findMany({ where: { tenantId } }),
    prisma.productCategory.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.appointmentStatus.findMany({ where: { tenantId } }),
    prisma.user.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.userService.findMany({ where: { service: { tenantId } } }),
    prisma.protocol.findMany({
      where: { pet: { tutor: { tenantId } } },
      include: { pet: { include: { tutor: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.pet.findMany({
      where: { tutor: { tenantId }, isActive: true },
      include: { tutor: true },
      orderBy: { name: "asc" }
    }),
  ]);

  if (statuses.length === 0) {
    const defaultStatuses = [
      { name: "Agendado", color: "slate" },
      { name: "Confirmado", color: "blue" },
      { name: "Em Atendimento", color: "orange" },
      { name: "Finalizado", color: "green" },
      { name: "Cancelado", color: "red" },
      { name: "Nao Compareceu", color: "yellow" },
    ];
    await prisma.appointmentStatus.createMany({
      data: defaultStatuses.map(s => ({
        tenantId,
        name: s.name,
        color: s.color,
        isActive: true
      }))
    });
    statuses = await prisma.appointmentStatus.findMany({ where: { tenantId } });
  }

  return (
    <>
      <PageHeader
        title="Cadastros e configuracoes"
        description="Servicos, formas de pagamento, categorias, status, colaboradores, protocolos e fornecedores"
        tutorialSlug="configuracoes"
      />

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Serviços */}
        <div className="card card-pad lg:col-span-2">
          <ServicesManager
            initial={services.map((s) => ({
              id: s.id, name: s.name, category: s.category, durationMinutes: s.durationMinutes,
              price: s.price, commissionPct: s.commissionPct, isActive: s.isActive,
            }))}
          />
        </div>

        {/* Colaboradores */}
        <div className="card card-pad lg:col-span-2">
          <CollaboratorsManager
            users={users.map((u) => ({ id: u.id, name: u.name, role: u.role, email: u.email }))}
            services={services.filter((s) => s.isActive).map((s) => ({ id: s.id, name: s.name }))}
            initialLinks={userServices.map((us) => ({ userId: us.userId, serviceId: us.serviceId }))}
          />
        </div>

        {/* Protocolos Clínicos Globais */}
        <div className="card card-pad lg:col-span-2">
          <ProtocolsManager
            pets={pets.map((p) => ({
              id: p.id,
              name: p.name,
              tutorName: p.tutor.name
            }))}
            initial={protocols.map((p) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              startDate: p.startDate,
              status: p.status,
              pet: {
                id: p.pet.id,
                name: p.pet.name,
                tutor: {
                  name: p.pet.tutor.name
                }
              }
            }))}
          />
        </div>

        {/* Status Customizados */}
        <div className="card card-pad">
          <StatusManager
            initial={statuses.map((s) => ({
              id: s.id, name: s.name, color: s.color, isActive: s.isActive
            }))}
          />
        </div>


        {/* Categorias de Produtos */}
        <div className="card card-pad">
          <SimpleManager
            title="Categorias de produtos"
            endpoint="/api/categories"
            initial={categories.map((c) => ({ id: c.id, name: c.name }))}
            emptyMessage="Crie categorias para organizar produtos (Racao, Medicamento, etc)."
          />
        </div>

        {/* Fornecedores */}
        <div className="card card-pad">
          <SupplierManager
            initial={suppliers.map((s) => ({
              id: s.id, name: s.name, document: s.document, phone: s.phone, email: s.email,
            }))}
          />
        </div>

        {/* Formas de Pagamento */}
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

        {/* Máquinas de Cartão */}
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
