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

type SimplePet = { id: string; name: string; tutorName: string };

export function ProtocolsManager({
  initial,
  pets = []
}: {
  initial: Protocol[];
  pets?: SimplePet[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Protocol[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Protocol> | null>(null);
  const [busy, setBusy] = useState(false);

  // Estados de Criação de Protocolo
  const [showForm, setShowForm] = useState(false);
  const [newPetId, setNewPetId] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("VACINA");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newNotes, setNewNotes] = useState("");

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
        setItems((prev) => prev.map((x) => (x.id === id ? { ...x, name: j.name, status: j.status, notes: j.notes } : x)));
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetId || !newName.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: newPetId,
          name: newName,
          type: newType,
          startDate: newStartDate,
          notes: newNotes,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const selectedPet = pets.find(p => p.id === newPetId);
        const newProtocol: Protocol = {
          id: created.id,
          name: created.name,
          type: created.type,
          startDate: created.startDate,
          status: created.status,
          notes: created.notes,
          pet: {
            id: newPetId,
            name: selectedPet?.name || "Desconhecido",
            tutor: {
              name: selectedPet?.tutorName || "Desconhecido"
            }
          }
        };
        setItems(prev => [newProtocol, ...prev]);
        setShowForm(false);
        setNewPetId("");
        setNewName("");
        setNewNotes("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Syringe className="h-5 w-5 text-brand-500" /> Protocolos Clínicos Cadastrados
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
          >
            Novo Protocolo
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Visualize, edite e gerencie o status de todos os protocolos ativos e históricos dos pets da clínica.
      </p>

      {/* Form de Criação */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Novo Protocolo Clínico</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="label text-[11px]">Paciente / Pet *</label>
              <select
                className="input text-xs"
                required
                value={newPetId}
                onChange={(e) => setNewPetId(e.target.value)}
              >
                <option value="">-- Selecione o Pet --</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Tutor: {p.tutorName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label text-[11px]">Título do Protocolo *</label>
              <input
                className="input text-xs"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Protocolo de Vermífugo Puppy"
              />
            </div>

            <div>
              <label className="label text-[11px]">Tipo de Protocolo</label>
              <select
                className="input text-xs"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="VACINA">Vacina</option>
                <option value="VERMIFUGO">Vermífugo</option>
                <option value="TRATAMENTO">Tratamento</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            <div>
              <label className="label text-[11px]">Data de Início *</label>
              <input
                className="input text-xs"
                type="date"
                required
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4">
              <label className="label text-[11px]">Observações</label>
              <textarea
                className="input text-xs"
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notas adicionais sobre o tratamento ou doses..."
              />
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <button className="btn-primary" disabled={busy}>
              {busy ? "Salvando..." : "Salvar e Gerar Doses"}
            </button>
            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

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
                      <div className="space-y-1">
                        <input
                          className="input text-xs py-1"
                          value={draft?.name || ""}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        />
                        <input
                          className="input text-[10px] py-0.5"
                          value={draft?.notes || ""}
                          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                          placeholder="Observações..."
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold">{p.name}</span>
                        {p.notes && <span className="text-[10px] text-slate-400 block">{p.notes}</span>}
                      </div>
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
