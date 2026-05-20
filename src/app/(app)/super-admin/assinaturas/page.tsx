import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function brl(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-amber-100 text-amber-700",
  CANCELED: "bg-slate-100 text-slate-500",
  EXPIRED: "bg-red-100 text-red-700",
};

export default async function AssinaturasPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!isSuperAdmin(s.role)) redirect("/dashboard");

  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { tenant: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const groups = {
    ACTIVE: subs.filter((x) => x.status === "ACTIVE"),
    OVERDUE: subs.filter((x) => x.status === "OVERDUE"),
    PENDING: subs.filter((x) => x.status === "PENDING"),
    CANCELED: subs.filter((x) => x.status === "CANCELED" || x.status === "EXPIRED"),
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Assinaturas</h1>
        <p className="text-sm text-slate-500">Todas as assinaturas registradas (vinculadas ao Asaas).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="card card-pad">
          <div className="text-xs uppercase tracking-wider text-slate-400">Ativas</div>
          <div className="text-2xl font-bold text-emerald-700">{groups.ACTIVE.length}</div>
        </div>
        <div className="card card-pad">
          <div className="text-xs uppercase tracking-wider text-slate-400">Em atraso</div>
          <div className="text-2xl font-bold text-amber-700">{groups.OVERDUE.length}</div>
        </div>
        <div className="card card-pad">
          <div className="text-xs uppercase tracking-wider text-slate-400">Pendentes</div>
          <div className="text-2xl font-bold text-slate-700">{groups.PENDING.length}</div>
        </div>
        <div className="card card-pad">
          <div className="text-xs uppercase tracking-wider text-slate-400">Canceladas</div>
          <div className="text-2xl font-bold text-slate-500">{groups.CANCELED.length}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Proximo venc.</th>
              <th className="px-4 py-3 font-medium">Ultimo pagamento</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Nenhuma assinatura registrada.</td></tr>
            )}
            {subs.map((sub) => {
              const last = sub.payments[0];
              return (
                <tr key={sub.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/super-admin/clientes/${sub.tenantId}`} className="text-brand-700 hover:underline">
                      {sub.tenant.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{sub.plan}</td>
                  <td className="px-4 py-3 font-medium">{brl(sub.value)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[sub.status] || "bg-slate-100"}`}>{sub.status}</span>
                  </td>
                  <td className="px-4 py-3">{sub.nextDueDate ? new Date(sub.nextDueDate).toLocaleDateString("pt-BR") : "-"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {last ? `${last.status} - ${brl(last.value)}` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
