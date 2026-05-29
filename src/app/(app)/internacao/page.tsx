import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InternacaoPage() {
  const { tenantId } = await requireTenant();
  const list = await prisma.hospitalization.findMany({
    where: { unit: { tenantId }, status: "ATIVA" },
    include: { pet: { include: { tutor: true } }, vet: true, evolutions: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { admittedAt: "desc" },
  });
  return (
    <>
      <PageHeader title="Internacoes ativas"
        tutorialSlug="internacao"
        actions={<Link href="/internacao/nova" className="btn-primary"><Plus className="h-4 w-4" /> Nova internacao</Link>} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((h) => (
          <Link key={h.id} href={`/internacao/${h.id}`} className="card card-pad hover:border-brand-300 transition">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{h.pet.name}</span>
              <span className="badge-green">{h.bed ?? "-"}</span>
            </div>
            <div className="text-xs text-slate-500">{h.pet.tutor.name}</div>
            <div className="text-sm mt-2"><b>Motivo:</b> {h.reason ?? "-"}</div>
            <div className="text-xs text-slate-500 mt-1">Entrada: {fmtDateTime(h.admittedAt)}</div>
            <div className="text-xs text-slate-500">Vet: {h.vet.name}</div>
            {h.evolutions[0] && <div className="text-xs mt-2 text-brand-700">Ultima evolucao: {h.evolutions[0].description.slice(0, 80)}</div>}
          </Link>
        ))}
        {list.length === 0 && <div className="card card-pad text-slate-500 text-sm col-span-full">Nenhuma internacao ativa.</div>}
      </div>
    </>
  );
}
