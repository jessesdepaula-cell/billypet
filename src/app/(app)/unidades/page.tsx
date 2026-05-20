import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function UnidadesPage() {
  const units = await prisma.unit.findMany({ include: { _count: { select: { users: true, appointments: true, sales: true, stocks: true } } } });
  return (
    <>
      <PageHeader title="Unidades" description="Multiunidades - matriz e filiais" />
      <div className="grid md:grid-cols-2 gap-4">
        {units.map((u) => (
          <div key={u.id} className="card card-pad">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{u.name}</h3>
              <span className={u.isActive ? "badge-green" : "badge-gray"}>{u.isActive ? "ativa" : "inativa"}</span>
            </div>
            <div className="text-sm text-slate-600">CNPJ: {u.cnpj ?? "-"}</div>
            <div className="text-sm text-slate-600">{u.address ?? "-"}</div>
            <div className="text-sm text-slate-600">{u.phone ?? "-"}</div>
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              <div className="card-pad bg-slate-50 rounded-lg p-2"><div className="text-xs text-slate-500">Usuarios</div><div className="font-bold">{u._count.users}</div></div>
              <div className="card-pad bg-slate-50 rounded-lg p-2"><div className="text-xs text-slate-500">Agend.</div><div className="font-bold">{u._count.appointments}</div></div>
              <div className="card-pad bg-slate-50 rounded-lg p-2"><div className="text-xs text-slate-500">Vendas</div><div className="font-bold">{u._count.sales}</div></div>
              <div className="card-pad bg-slate-50 rounded-lg p-2"><div className="text-xs text-slate-500">Estoque</div><div className="font-bold">{u._count.stocks}</div></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
