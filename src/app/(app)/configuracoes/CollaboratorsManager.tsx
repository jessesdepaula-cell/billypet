"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Check, X } from "lucide-react";

type User = {
  id: string;
  name: string;
  role: string;
  email: string;
};

type Service = {
  id: string;
  name: string;
};

type UserServiceLink = {
  userId: string;
  serviceId: string;
};

export function CollaboratorsManager({
  users,
  services,
  initialLinks,
}: {
  users: User[];
  services: Service[];
  initialLinks: UserServiceLink[];
}) {
  const router = useRouter();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [links, setLinks] = useState<UserServiceLink[]>(initialLinks);
  const [busy, setBusy] = useState(false);

  const startEdit = (userId: string) => {
    setEditingUserId(userId);
    setSelectedServiceIds(links.filter((l) => l.userId === userId).map((l) => l.serviceId));
  };

  const cancel = () => {
    setEditingUserId(null);
    setSelectedServiceIds([]);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const save = async (userId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${userId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceIds: selectedServiceIds }),
      });
      if (res.ok) {
        setLinks((prev) => [
          ...prev.filter((l) => l.userId !== userId),
          ...selectedServiceIds.map((serviceId) => ({ userId, serviceId })),
        ]);
        cancel();
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao salvar vinculos:", err);
    } finally {
      setBusy(false);
    }
  };

  const collaborators = users.filter((u) => u.role !== "SUPER_ADMIN");

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <UserCog className="h-5 w-5 text-brand-500" /> Colaboradores e Serviços
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Defina um ou mais responsáveis por cada serviço associando os colaboradores autorizados.
      </p>

      <div className="overflow-x-auto">
        <table className="bp-table text-xs">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Perfil</th>
              <th>Serviços Realizados</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {collaborators.map((u) => {
              const userLinks = links.filter((l) => l.userId === u.id);
              const linkedServices = services.filter((s) => userLinks.some((ul) => ul.serviceId === s.id));
              const isEditing = editingUserId === u.id;

              return (
                <tr key={u.id} className={isEditing ? "bg-amber-50" : ""}>
                  <td className="font-medium">
                    {u.name}
                    <span className="text-[10px] text-slate-400 block">{u.email}</span>
                  </td>
                  <td>
                    <span className="badge-gray">{u.role.replace(/_/g, " ").toLowerCase()}</span>
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-slate-200 rounded p-2 bg-white">
                        {services.map((s) => (
                          <label key={s.id} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedServiceIds.includes(s.id)}
                              onChange={() => toggleService(s.id)}
                            />
                            <span className="text-[11px] truncate">{s.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : linkedServices.length === 0 ? (
                      <span className="text-slate-400 italic">Nenhum serviço vinculado</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {linkedServices.map((s) => (
                          <span key={s.id} className="bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => save(u.id)}
                          disabled={busy}
                          className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                          title="Salvar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancel}
                          className="text-slate-500 hover:bg-slate-100 p-1 rounded"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(u.id)}
                        className="text-brand-600 hover:underline font-semibold"
                      >
                        Vincular Serviços
                      </button>
                    )}
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
