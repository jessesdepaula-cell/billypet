import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { TutorForm } from "../TutorForm";
import { fmtDateTime, fmtMoney, ageFromBirth } from "@/lib/utils";
import { PawPrint, ShoppingCart, Stethoscope, Gift } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TutorDetailPage({ params }: { params: { id: string } }) {
  const { tenantId } = await requireModule("tutores");
  const [t, initialStatuses] = await Promise.all([
    prisma.tutor.findFirst({
      where: { id: params.id, tenantId },
      include: {
        pets: { orderBy: { name: "asc" } },
        loyaltyTransactions: { orderBy: { createdAt: "desc" } },
        sales: { orderBy: { createdAt: "desc" }, take: 10, include: { items: true } },
        appointments: { orderBy: { scheduledAt: "desc" }, take: 10, include: { pet: true, services: { include: { service: true } } } },
        accountsReceivable: { orderBy: { dueDate: "desc" }, take: 10 },
      },
    }),
    prisma.appointmentStatus.findMany({ where: { tenantId }, orderBy: { position: "asc" } }),
  ]);
  if (!t) return notFound();

  let statuses = initialStatuses;
  if (statuses.length === 0) {
    const defaults = [
      { tenantId, name: "AGENDADO", color: "#3b82f6", position: 0 },
      { tenantId, name: "CONFIRMADO", color: "#10b981", position: 1 },
      { tenantId, name: "EM_ATENDIMENTO", color: "#f59e0b", position: 2 },
      { tenantId, name: "FINALIZADO", color: "#22c55e", position: 3 },
      { tenantId, name: "CANCELADO", color: "#ef4444", position: 4 },
      { tenantId, name: "NAO_COMPARECEU", color: "#64748b", position: 5 },
    ];
    await prisma.appointmentStatus.createMany({ data: defaults });
    statuses = await prisma.appointmentStatus.findMany({
      where: { tenantId },
      orderBy: { position: "asc" },
    });
  }

  const totalGasto = t.sales.reduce((s, x) => s + x.total, 0);

  return (
    <>
      <PageHeader title={t.name} description={`Cadastrado em ${fmtDateTime(t.createdAt)}`} />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <TutorForm initial={t} />

          <div className="card card-pad">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><PawPrint className="h-4 w-4 text-brand-500" /> Pets ({t.pets.length})</h2>
            {t.pets.length === 0 ? <p className="text-sm text-slate-500">Sem pets cadastrados.</p> : (
              <table className="bp-table">
                <thead><tr><th>Nome</th><th>Especie</th><th>Raca</th><th>Idade</th><th></th></tr></thead>
                <tbody>{t.pets.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.species}</td>
                    <td>{p.breed ?? "-"}</td>
                    <td>{ageFromBirth(p.birthDate)}</td>
                    <td className="text-right"><Link className="text-brand-600 text-sm hover:underline" href={`/pets/${p.id}`}>abrir</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            <div className="mt-3"><Link className="btn-outline" href={`/pets/novo?tutorId=${t.id}`}>+ Novo pet</Link></div>
          </div>

          <div className="card card-pad">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-brand-500" /> Historico de atendimentos</h2>
            {t.appointments.length === 0 ? <p className="text-sm text-slate-500">Sem atendimentos.</p> : (
              <ul className="space-y-2">{t.appointments.map((a) => (
                <li key={a.id} className="text-sm flex justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span>{fmtDateTime(a.scheduledAt)} - <b>{a.pet?.name}</b> - {a.services.map((s) => s.service.name).join(", ") || a.type}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase shrink-0"
                    style={{ backgroundColor: statuses.find((s) => s.name === a.status)?.color ?? "#94a3b8" }}
                  >
                    {a.status.toLowerCase().replace(/_/g, " ")}
                  </span>
                </li>
              ))}</ul>
            )}
          </div>

          <div className="card card-pad">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-brand-500" /> Historico de compras</h2>
            {t.sales.length === 0 ? <p className="text-sm text-slate-500">Sem vendas.</p> : (
              <ul className="space-y-2">{t.sales.map((s) => (
                <li key={s.id} className="text-sm flex justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span>{fmtDateTime(s.createdAt)} - {s.items.length} item(ns)</span>
                  <span className="font-medium">{fmtMoney(s.total)}</span>
                </li>
              ))}</ul>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card card-pad">
            <div className="text-xs uppercase text-slate-500">Total gasto (10 ult.)</div>
            <div className="text-2xl font-bold mt-1">{fmtMoney(totalGasto)}</div>
          </div>
          <div className="card card-pad">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Gift className="h-4 w-4 text-accent-500" /> Pontos de fidelidade</h3>
            <div className="text-3xl font-bold mb-2">{t.loyaltyPoints}</div>
            <ul className="space-y-1 text-sm">
              {t.loyaltyTransactions.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="text-slate-600">{p.reason}</span>
                  <span className={p.points > 0 ? "text-emerald-600" : "text-red-600"}>{p.points > 0 ? "+" : ""}{p.points}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card card-pad">
            <h3 className="font-semibold mb-3">Contas a receber em aberto</h3>
            {t.accountsReceivable.filter((r) => r.status !== "PAGA").length === 0
              ? <p className="text-sm text-slate-500">Sem pendencias.</p>
              : <ul className="space-y-1 text-sm">{t.accountsReceivable.filter((r) => r.status !== "PAGA").map((r) => (
                <li key={r.id} className="flex justify-between"><span className="truncate pr-2">{r.description}</span><span className="font-medium">{fmtMoney(r.amount)}</span></li>
              ))}</ul>}
          </div>
        </div>
      </div>
    </>
  );
}
