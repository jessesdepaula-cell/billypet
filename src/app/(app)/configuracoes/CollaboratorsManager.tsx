"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check, Users as StaffIcon, Briefcase } from "lucide-react";

type ServiceOpt = { id: string; name: string };
type UserOpt = { id: string; name: string; email: string };

type Collaborator = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  userId: string | null;
  services: { serviceId: string; isResponsible: boolean; service: { name: string } }[];
};

export function CollaboratorsManager({ services }: { services: ServiceOpt[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Collaborator[]>([]);
  const [users, setUsers] = useState<UserOpt[]>([]);
  const [editing, setEditing] = useState<Collaborator | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedServices, setSelectedServices] = useState<{ serviceId: string; isResponsible: boolean }[]>([]);

  useEffect(() => {
    fetchCollaborators();
    fetchUsers();
  }, []);

  async function fetchCollaborators() {
    const res = await fetch("/api/collaborators");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
  }

  async function fetchUsers() {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  }

  function startCreate() {
    setEditing("new");
    setName("");
    setRole("");
    setPhone("");
    setEmail("");
    setUserId("");
    setSelectedServices([]);
    setError(null);
  }

  function startEdit(c: Collaborator) {
    setEditing(c);
    setName(c.name);
    setRole(c.role ?? "");
    setPhone(c.phone ?? "");
    setEmail(c.email ?? "");
    setUserId(c.userId ?? "");
    setSelectedServices(
      c.services.map((s) => ({ serviceId: s.serviceId, isResponsible: s.isResponsible }))
    );
    setError(null);
  }

  function toggleService(serviceId: string) {
    setSelectedServices((prev) => {
      const exists = prev.find((x) => x.serviceId === serviceId);
      if (exists) {
        return prev.filter((x) => x.serviceId !== serviceId);
      } else {
        return [...prev, { serviceId, isResponsible: false }];
      }
    });
  }

  function toggleResponsible(serviceId: string) {
    setSelectedServices((prev) =>
      prev.map((x) => (x.serviceId === serviceId ? { ...x, isResponsible: !x.isResponsible } : x))
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome e obrigatorio");
      return;
    }
    setBusy(true);
    setError(null);

    const body = {
      name,
      role: role || null,
      phone: phone || null,
      email: email || null,
      userId: userId || null,
      serviceLinks: selectedServices,
    };

    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/collaborators" : `/api/collaborators/${(editing as Collaborator).id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erro ao salvar");

      setEditing(null);
      fetchCollaborators();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Desativar colaborador "${name}"? Ele continuara no historico de agendamentos.`)) return;
    const res = await fetch(`/api/collaborators/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCollaborators();
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <StaffIcon className="h-4 w-4 text-brand-600" /> Colaboradores e Profissionais
        </h3>
        <button className="btn-primary text-xs" onClick={startCreate} disabled={!!editing}>
          <Plus className="h-3.5 w-3.5" /> Novo Colaborador
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="card bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4 mb-4">
          <h4 className="font-medium text-sm text-slate-700">
            {editing === "new" ? "Novo Colaborador" : `Editar: ${name}`}
          </h4>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Nome *</label>
              <input className="input text-xs" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <label className="label text-xs">Cargo / Especialidade</label>
              <input className="input text-xs" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Veterinario, Tosador, Recepcionista" />
            </div>
            <div>
              <label className="label text-xs">Telefone</label>
              <input className="input text-xs" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp" />
            </div>
            <div>
              <label className="label text-xs">Email</label>
              <input className="input text-xs" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@clinica.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="label text-xs">Vincular a Conta de Usuario (opcional)</label>
              <select className="input text-xs" value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">Nao vincular a nenhum usuario</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Vincula o colaborador a sua conta de login para relatorios e comissoes.</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <label className="label text-xs font-semibold mb-2">Servicos Realizados e Responsabilidades</label>
            <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border border-slate-200 rounded-lg bg-white">
              {services.map((s) => {
                const link = selectedServices.find((x) => x.serviceId === s.id);
                const isChecked = !!link;
                const isResp = link?.isResponsible ?? false;
                return (
                  <div key={s.id} className="flex items-center justify-between text-xs p-1 hover:bg-slate-50 rounded">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input type="checkbox" checked={isChecked} onChange={() => toggleService(s.id)} />
                      <span>{s.name}</span>
                    </label>
                    {isChecked && (
                      <label className="flex items-center gap-1 cursor-pointer text-brand-600 font-medium ml-2">
                        <input type="checkbox" checked={isResp} onChange={() => toggleResponsible(s.id)} />
                        <span>Responsavel</span>
                      </label>
                    )}
                  </div>
                );
              })}
              {services.length === 0 && <p className="text-xs text-slate-400 p-2">Nenhum servico cadastrado.</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary text-xs" disabled={busy}>
              {busy ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="btn-outline text-xs" onClick={() => setEditing(null)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto">
        <table className="bp-table text-xs">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo / Especialidade</th>
              <th>Contato</th>
              <th>Servicos Vinculados</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className={c.isActive ? "" : "opacity-50"}>
                <td className="font-medium text-slate-800">{c.name}</td>
                <td>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-slate-400" />
                    {c.role || "-"}
                  </span>
                </td>
                <td>
                  <div>{c.email || "-"}</div>
                  <div className="text-[10px] text-slate-500">{c.phone || ""}</div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {c.services.map((sl) => (
                      <span
                        key={sl.serviceId}
                        className={`px-1.5 py-0.5 rounded text-[9px] ${
                          sl.isResponsible ? "bg-brand-100 text-brand-800 border border-brand-200" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {sl.service.name} {sl.isResponsible ? "★" : ""}
                      </span>
                    ))}
                    {c.services.length === 0 && <span className="text-slate-400">-</span>}
                  </div>
                </td>
                <td>
                  {c.isActive ? <span className="badge-green">ativo</span> : <span className="badge-gray">inativo</span>}
                </td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => startEdit(c)} className="text-slate-500 hover:text-brand-600 p-1" title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {c.isActive && (
                    <button onClick={() => remove(c.id, c.name)} className="text-slate-500 hover:text-red-600 p-1" title="Desativar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && !editing && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-slate-500">
                  Nenhum colaborador cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
