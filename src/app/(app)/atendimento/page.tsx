import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AtendimentoPage() {
  const { tenantId } = await requireModule("atendimento");

  const [list, statuses] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        unit: { tenantId },
        status: { notIn: ["FINALIZADO", "CANCELADO", "NAO_COMPARECEU"] },
      },
      include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
      orderBy: { scheduledAt: "asc" }, take: 100,
    }),
    prisma.appointmentStatus.findMany({ where: { tenantId } }),
  ]);

  return (
    <>
      <PageHeader title="Atendimentos" description="Atendimentos em andamento e proximos"
        tutorialSlug="atendimento"
        actions={<Link className="btn-outline" href="/esteira">Ver esteira</Link>} />
      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Quando</th><th>Pet / Tutor</th><th>Tipo / Servicos</th><th>Veterinario</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((a) => {
              const statusColor = statuses.find((s) => s.name === a.status)?.color ?? "#94a3b8";
              return (
                <tr key={a.id}>
                  <td>{fmtDateTime(a.scheduledAt)}</td>
                  <td><div className="font-medium text-slate-800">{a.pet?.name ?? "-"}</div><div className="text-xs text-slate-500">{a.tutor.name}</div></td>
                  <td>{a.services.map((s) => s.service.name).join(", ") || a.type}</td>
                  <td>{a.vet?.name ?? "-"}</td>
                  <td>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase shrink-0"
                      style={{ backgroundColor: statusColor }}
                    >
                      {a.status.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </td>
                  <td className="text-right"><Link href={`/atendimento/${a.id}`} className="text-brand-600 text-sm hover:underline">abrir</Link></td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-slate-500">Nenhum atendimento ativo.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
