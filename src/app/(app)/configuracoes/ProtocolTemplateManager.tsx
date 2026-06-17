"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, ClipboardList, Calendar } from "lucide-react";

type DoseTemplate = {
  name: string;
  daysOffset: number;
};

type ProtocolTemplate = {
  id: string;
  name: string;
  type: string;
  notes: string | null;
  isActive: boolean;
  doses: { id: string; name: string; daysOffset: number }[];
};

const PROTOCOL_TYPES = ["Vacina", "Vermifugo", "Antiparasitario", "Tratamento Continuo", "Exame Periodico", "Outro"];

export function ProtocolTemplateManager() {
  const router = useRouter();
  const [items, setItems] = useState<ProtocolTemplate[]>([]);
  const [editing, setEditing] = useState<ProtocolTemplate | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("Vacina");
  const [notes, setNotes] = useState("");
  const [doses, setDoses] = useState<DoseTemplate[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const res = await fetch("/api/protocol-templates");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
  }

  function startCreate() {
    setEditing("new");
    setName("");
    setType("Vacina");
    setNotes("");
    setDoses([{ name: "Dose 1", daysOffset: 0 }]);
    setError(null);
  }

  function startEdit(pt: ProtocolTemplate) {
    setEditing(pt);
    setName(pt.name);
    setType(pt.type);
    setNotes(pt.notes ?? "");
    setDoses(pt.doses.map((d) => ({ name: d.name, daysOffset: d.daysOffset })));
    setError(null);
  }

  function addDose() {
    setDoses((prev) => [...prev, { name: `Dose ${prev.length + 1}`, daysOffset: prev.length * 30 }]);
  }

  function removeDose(index: number) {
    setDoses((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDose(index: number, key: keyof DoseTemplate, val: any) {
    setDoses((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [key]: key === "daysOffset" ? parseInt(val) || 0 : val } : d))
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
      type,
      notes: notes || null,
      doses,
    };

    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/protocol-templates" : `/api/protocol-templates/${(editing as ProtocolTemplate).id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erro ao salvar");

      setEditing(null);
      fetchTemplates();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remover modelo de protocolo "${name}"?`)) return;
    const res = await fetch(`/api/protocol-templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchTemplates();
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-brand-600" /> Modelos de Protocolos
        </h3>
        <button className="btn-primary text-xs" onClick={startCreate} disabled={!!editing}>
          <Plus className="h-3.5 w-3.5" /> Novo Modelo
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="card bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4 mb-4">
          <h4 className="font-medium text-sm text-slate-700">
            {editing === "new" ? "Novo Modelo de Protocolo" : `Editar: ${name}`}
          </h4>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Nome do Protocolo *</label>
              <input className="input text-xs" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Protocolo Vacina V10" />
            </div>
            <div>
              <label className="label text-xs">Tipo de Protocolo *</label>
              <select className="input text-xs" value={type} onChange={(e) => setType(e.target.value)}>
                {PROTOCOL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label text-xs">Observacoes Gerais</label>
              <textarea className="input text-xs" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instrucoes ou notas gerais do protocolo" />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="label text-xs font-semibold">Cronograma de Doses / Aplicacoes</label>
              <button type="button" onClick={addDose} className="text-brand-600 text-xs font-medium flex items-center gap-1 hover:underline">
                <Plus className="h-3 w-3" /> Adicionar dose
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-auto p-2 border border-slate-200 rounded-lg bg-white">
              {doses.map((d, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-xs text-slate-400 font-medium w-6">{index + 1}</span>
                  <input className="input text-xs flex-1" required value={d.name} onChange={(e) => updateDose(index, "name", e.target.value)} placeholder="Nome da dose (ex: Dose 1, Reforço)" />
                  <div className="flex items-center gap-1 w-36">
                    <input className="input text-xs w-16" type="number" min={0} required value={d.daysOffset} onChange={(e) => updateDose(index, "daysOffset", e.target.value)} />
                    <span className="text-xs text-slate-500">dias</span>
                  </div>
                  <button type="button" onClick={() => removeDose(index)} className="text-slate-400 hover:text-red-500 p-1" title="Remover dose">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {doses.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Defina pelo menos uma dose para o protocolo.</p>}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">O campo "dias" indica a quantidade de dias apos a data inicial que a dose deve ser aplicada.</p>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary text-xs" disabled={busy || doses.length === 0}>
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
              <th>Tipo</th>
              <th>Doses Cadastradas</th>
              <th>Observacoes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((pt) => (
              <tr key={pt.id}>
                <td className="font-medium text-slate-800">{pt.name}</td>
                <td>{pt.type}</td>
                <td>
                  <div className="flex flex-col gap-0.5 max-h-24 overflow-y-auto pr-1">
                    {pt.doses.map((d, i) => (
                      <span key={d.id} className="text-[10px] text-slate-600 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 text-slate-400" />
                        {d.name}: <strong className="text-slate-700">+{d.daysOffset}d</strong>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="max-w-xs truncate text-slate-500" title={pt.notes ?? ""}>
                  {pt.notes || "-"}
                </td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => startEdit(pt)} className="text-slate-500 hover:text-brand-600 p-1" title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(pt.id, pt.name)} className="text-slate-500 hover:text-red-600 p-1" title="Excluir">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !editing && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-slate-500">
                  Nenhum modelo de protocolo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
