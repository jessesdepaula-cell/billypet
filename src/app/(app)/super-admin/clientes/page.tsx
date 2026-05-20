import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  TRIAL: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAST_DUE: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  CANCELED: "bg-slate-100 text-slate-600",
};

export default async function ClientesPage() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!isSuperAdmin(s.role)) redirect("/dashboard");

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes BillyPet</h1>
          <p className="text-sm text-slate-500">Clinicas / pet shops que assinam a plataforma.</p>
        </div>
        <Link href="/super-admin/clientes/novo" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo cliente
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">CNPJ</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assinatura</th>
              <th className="px-4 py-3 font-medium">Criado em</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Nenhum cliente cadastrado ainda.</td></tr>
            )}
            {tenants.map((t) => {
              const sub = t.subscriptions[0];
              return (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <div>{t.companyName}</div>
                    {t.tradeName && <div className="text-xs text-slate-500">{t.tradeName}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.cnpj || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{t.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[t.status] || "bg-slate-100 text-slate-600"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sub ? `${sub.plan} - ${sub.status}` : <span className="text-slate-400">sem assinatura</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/super-admin/clientes/${t.id}`} className="text-brand-600 hover:underline text-xs">Abrir</Link>
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
