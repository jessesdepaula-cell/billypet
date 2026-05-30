import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { Plus, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TutoresPage({ searchParams }: { searchParams: { q?: string } }) {
  const { tenantId } = await requireModule("tutores");
  const q = (searchParams.q ?? "").trim();
  const tutors = await prisma.tutor.findMany({
    where: {
      tenantId,
      isActive: true,
      ...(q ? { OR: [{ name: { contains: q } }, { document: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] } : {}),
    },
    include: { _count: { select: { pets: true } } },
    orderBy: { name: "asc" }, take: 200,
  });

  return (
    <>
      <PageHeader
        title="Tutores"
        description="Cadastro de clientes / tutores responsaveis pelos pets"
        tutorialSlug="tutores"
        actions={<Link className="btn-primary" href="/tutores/novo"><Plus className="h-4 w-4" /> Novo tutor</Link>}
      />

      <form className="card card-pad mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" name="q" defaultValue={q} placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone" />
        </div>
        <button className="btn-outline">Buscar</button>
      </form>

      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Nome</th><th>Documento</th><th>Telefone</th><th>E-mail</th><th>Pets</th><th>Pontos</th><th></th></tr></thead>
          <tbody>
            {tutors.map((t) => (
              <tr key={t.id}>
                <td className="font-medium text-slate-800">{t.name}</td>
                <td className="text-slate-600">{t.document ?? "-"}</td>
                <td className="text-slate-600">{t.phone ?? "-"}</td>
                <td className="text-slate-600">{t.email ?? "-"}</td>
                <td><span className="badge-gray">{t._count.pets}</span></td>
                <td><span className="badge-orange">{t.loyaltyPoints}</span></td>
                <td className="text-right"><Link className="text-brand-600 hover:underline text-sm" href={`/tutores/${t.id}`}>abrir</Link></td>
              </tr>
            ))}
            {tutors.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-slate-500">Nenhum tutor cadastrado ainda. Use o botao "Novo tutor" para comecar.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
