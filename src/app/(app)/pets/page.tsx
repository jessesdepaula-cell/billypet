import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { Plus, Search } from "lucide-react";
import { ageFromBirth } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PetsPage({ searchParams }: { searchParams: { q?: string } }) {
  const { tenantId } = await requireTenant();
  const q = (searchParams.q ?? "").trim();
  const pets = await prisma.pet.findMany({
    where: {
      tutor: { tenantId },
      isActive: true,
      ...(q ? { OR: [{ name: { contains: q } }, { breed: { contains: q } }, { species: { contains: q } }, { tutor: { name: { contains: q } } }] } : {}),
    },
    include: { tutor: true },
    orderBy: { name: "asc" }, take: 200,
  });

  return (
    <>
      <PageHeader
        title="Pets"
        description="Cadastro de animais"
        actions={<Link className="btn-primary" href="/pets/novo"><Plus className="h-4 w-4" /> Novo pet</Link>}
      />

      <form className="card card-pad mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" name="q" defaultValue={q} placeholder="Buscar por nome, raca, especie ou tutor" />
        </div>
        <button className="btn-outline">Buscar</button>
      </form>

      <div className="card overflow-hidden">
        <table className="bp-table">
          <thead><tr><th>Nome</th><th>Especie / Raca</th><th>Sexo</th><th>Idade</th><th>Peso</th><th>Tutor</th><th></th></tr></thead>
          <tbody>
            {pets.map((p) => (
              <tr key={p.id}>
                <td className="font-medium text-slate-800">{p.name}{p.medicalAlert && <span className="badge-red ml-2">alerta</span>}</td>
                <td>{p.species}{p.breed ? ` - ${p.breed}` : ""}</td>
                <td>{p.sex ?? "-"}</td>
                <td>{ageFromBirth(p.birthDate)}</td>
                <td>{p.weightKg ? `${p.weightKg} kg` : "-"}</td>
                <td><Link className="text-brand-600 hover:underline" href={`/tutores/${p.tutorId}`}>{p.tutor.name}</Link></td>
                <td className="text-right"><Link className="text-brand-600 hover:underline text-sm" href={`/pets/${p.id}`}>abrir</Link></td>
              </tr>
            ))}
            {pets.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-slate-500">Nenhum pet cadastrado ainda. Cadastre um tutor primeiro e depois adicione os pets dele.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
