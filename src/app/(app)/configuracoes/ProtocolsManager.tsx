"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Syringe, Pencil, Trash2, X, Check } from "lucide-react";
import { fmtDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Protocol = {
  id: string;
  name: string;
  type: string;
  startDate: string | Date;
  status: string;
  notes?: string | null;
  pet: {
    id: string;
    name: string;
    tutor: {
      name: string;
    };
  };
};

export function ProtocolsManager({ initial }: { initial: Protocol[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Protocol[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Protocol> | null>(null);
  const [busy, setBusy] = useState(false);

  const startEdit = (p: Protocol) => {
    setEditingId(p.id);
    setDraft({ ...p });
  };

  const cancel = () => {
    setEditingId(null);
    setDraft(null);
  };

  const save = async (id: string) => {
    if (!draft?.name?.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/protocols/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          status: draft.status,
          notes: draft.notes,
        }),
      });
      if (res.ok) {
        const j = await res.json();
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, name: j.name, status: j.status } : x)));
        cancel();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Excluir o protocolo "${name}" permanentemente? Todas as doses programadas serão removidas.`)) return;
    const res = await fetch(`/api/protocols/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      router.refresh();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Syringe className="h-5 w-5 text-brand-500" /> Protocolos Clínicos Cadastrados
        </h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Visualize, edite e gerencie o status de todos os protocolos ativos e históricos dos pets da clínica.
      </p>

      <div className="overflow-x-auto">
        <table className="bp-table text-xs">
          <thead>
            <tr>
              <th>Paciente / Tutor</th>
              <th>Protocolo</th>
              <th>Tipo</th>
              <th>Início</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const isEditing = editingId === p.id;
              return (
                <tr key={p.id} className={isEditing ? "bg-amber-50" : ""}>
                  <td className="font-medium">
                    {p.pet.name}
                    <span className="text-[10px] text-slate-400 block">{p.pet.tutor.name}</span>
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className="input text-xs py-1"
                        value={draft?.name || ""}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      />
                    ) : (
                      <span className="font-semibold">{p.name}</span>
                    )}
                  </td>
                  <td>
                    <span className="badge-gray uppercase text-[10px] font-bold">{p.type}</span>
                  </td>
                  <td>{fmtDate(p.startDate)}</td>
                  <td>
                    {isEditing ? (
                      <select
                        className="input text-xs py-1"
                        value={draft?.status || "ATIVO"}
                        onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                      >
                        <option value="ATIVO">Ativo</option>
                        <option value="CONCLUIDO">Concluído</option>
                        <option value="SUSPENSO">Suspenso</option>
                      </select>
                    ) : (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                        p.status === "ATIVO" ? "bg-emerald-100 text-emerald-700" :
                        p.status === "CONCLUIDO" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {p.status.toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => save(p.id)}
                          disabled={busy}
                          className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={cancel} className="text-slate-500 hover:bg-slate-100 p-1 rounded">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-slate-500 hover:text-brand-600"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(p.id, p.name)}
                          className="text-slate-500 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-slate-400 italic">
                  Nenhum protocolo cadastrado na clínica.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
