import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROLE_LABEL, type Role, MODULE_PERMISSIONS } from "@/lib/permissions";
import { fmtDateTime } from "@/lib/utils";

export default async function UsuariosPage() {
  const users = await prisma.user.findMany({ include: { unit: true }, orderBy: { name: "asc" } });
  return (
    <>
      <PageHeader title="Usuarios e permissoes" description="Gerencie acessos ao sistema" />
      <div className="card overflow-hidden mb-5">
        <table className="bp-table">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Unidade</th><th>Criado em</th><th>Status</th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id}>
              <td className="font-medium">{u.name}</td>
              <td className="text-slate-600">{u.email}</td>
              <td><span className="badge-blue">{ROLE_LABEL[u.role as Role] ?? u.role}</span></td>
              <td>{u.unit?.name ?? "-"}</td>
              <td className="text-xs">{fmtDateTime(u.createdAt)}</td>
              <td>{u.isActive ? <span className="badge-green">ativo</span> : <span className="badge-gray">inativo</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="card card-pad">
        <h3 className="font-semibold mb-3">Matriz de permissoes</h3>
        <div className="overflow-x-auto">
          <table className="bp-table text-xs">
            <thead><tr><th>Modulo</th>{Object.keys(ROLE_LABEL).map((r) => <th key={r}>{r}</th>)}</tr></thead>
            <tbody>{Object.entries(MODULE_PERMISSIONS).map(([m, roles]) => (
              <tr key={m}>
                <td className="font-medium">{m}</td>
                {Object.keys(ROLE_LABEL).map((r) => (
                  <td key={r} className="text-center">{r === "ADMIN" || roles.includes(r as Role) ? <span className="text-emerald-600">✓</span> : <span className="text-slate-300">-</span>}</td>
                ))}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
