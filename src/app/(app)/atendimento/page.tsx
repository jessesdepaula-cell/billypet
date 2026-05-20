import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";

export default async function AtendimentoPage() {
  const list = await prisma.appointment.findMany({
    where: { status: { in: ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO"] } },
    include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
    orderBy: { scheduledAt: "asc" }, take: 100,
  });
  return (
    <>
      <PageHeader title="Atendimentos" description="Atendimentos em andamento e proximos"
        actions={<Link className="btn-outline" href="/esteira">Ver esteira</Link>} />
      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Quando</th><th>Pet / Tutor</th><th>Tipo / Servicos</th><th>Veterinario</th><th>Status</th><th>Etapa</th><th></th></tr></thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td>{fmtDateTime(a.scheduledAt)}</td>
                <td><div className="font-medium">{a.pet?.name ?? "-"}</div><div className="text-xs text-slate-500">{a.tutor.name}</div></td>
                <td>{a.services.map((s) => s.service.name).join(", ") || a.type}</td>
                <td>{a.vet?.name ?? "-"}</td>
                <td><span className="badge-gray">{a.status.replace(/_/g, " ").toLowerCase()}</span></td>
                <td><span className="badge-blue">{a.pipelineStage.replace(/_/g, " ").toLowerCase()}</span></td>
                <td className="text-right"><Link href={`/atendimento/${a.id}`} className="text-brand-600 text-sm hover:underline">abrir</Link></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-500">Nenhum atendimento ativo.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
