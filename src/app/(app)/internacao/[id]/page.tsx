import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";
import { InternacaoActions } from "./Actions";

export default async function InternacaoDetailPage({ params }: { params: { id: string } }) {
  const h = await prisma.hospitalization.findUnique({
    where: { id: params.id },
    include: { pet: { include: { tutor: true } }, vet: true, evolutions: { orderBy: { createdAt: "desc" } } },
  });
  if (!h) return notFound();

  return (
    <>
      <PageHeader title={`Internacao - ${h.pet.name}`} description={`${h.pet.species}${h.pet.breed ? " - " + h.pet.breed : ""} - Tutor: ${h.pet.tutor.name}`} />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-pad">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Leito:</span> <b>{h.bed ?? "-"}</b></div>
              <div><span className="text-slate-500">Status:</span> <span className="badge-green">{h.status}</span></div>
              <div><span className="text-slate-500">Entrada:</span> {fmtDateTime(h.admittedAt)}</div>
              <div><span className="text-slate-500">Prev. alta:</span> {fmtDateTime(h.expectedAt)}</div>
              <div className="sm:col-span-2"><span className="text-slate-500">Motivo:</span> {h.reason ?? "-"}</div>
              <div><span className="text-slate-500">Veterinario:</span> {h.vet.name}</div>
            </div>
          </div>
          <InternacaoActions id={h.id} status={h.status} />
          <div className="card card-pad">
            <h3 className="font-semibold mb-3">Evolucoes</h3>
            <ul className="space-y-3">{h.evolutions.map((e) => (
              <li key={e.id} className="border-l-2 border-emerald-300 pl-3">
                <div className="text-xs text-slate-500">{fmtDateTime(e.createdAt)}</div>
                <div className="text-sm">{e.description}</div>
                {e.vitals && <div className="text-xs text-slate-600 mt-1"><b>Sinais:</b> {e.vitals}</div>}
                {e.medications && <div className="text-xs text-slate-600"><b>Medicacoes:</b> {e.medications}</div>}
              </li>
            ))}{h.evolutions.length === 0 && <li className="text-slate-500 text-sm">Sem evolucoes ainda.</li>}</ul>
          </div>
        </div>
        <div className="card card-pad text-xs text-slate-500">
          <p className="font-semibold mb-2 text-slate-700">Termo de internacao</p>
          O tutor declara estar ciente das condicoes clinicas do paciente e autoriza
          a equipe a realizar procedimentos necessarios durante a internacao. Aceite
          digital registrado por: {h.pet.tutor.name} em {fmtDateTime(h.admittedAt)}.
        </div>
      </div>
    </>
  );
}
