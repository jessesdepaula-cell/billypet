"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, PawPrint, CheckSquare, Square, AlertTriangle } from "lucide-react";

type Tutor = { id: string; name: string };
type Pet = { id: string; name: string; tutorId: string; deceased: boolean; tutor: { name: string } };
type Collaborator = { id: string; name: string; role: string | null };
type Service = { id: string; name: string; price: number };

type StatusOpt = { id: string; name: string; color: string };

export function AppointmentForm({
  tutors,
  pets,
  collaborators,
  services,
  statuses,
  initialDate,
}: {
  tutors: Tutor[];
  pets: Pet[];
  collaborators: Collaborator[];
  services: Service[];
  statuses: StatusOpt[];
  initialDate?: string;
}) {
  const router = useRouter();
  
  // Selection States
  const [tutorId, setTutorId] = useState("");
  const [petId, setPetId] = useState("");
  const [selectedCollabIds, setSelectedCollabIds] = useState<string[]>([]);
  const [type, setType] = useState("CONSULTA");
  const [status, setStatus] = useState(statuses[0]?.name || "AGENDADO");
  const [scheduledAt, setScheduledAt] = useState(initialDate ? `${initialDate}T09:00` : "");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Autocomplete States
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmDeceased, setConfirmDeceased] = useState(false);

  // Filter tutors and pets based on query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedPets = pets
      .filter((p) => p.name.toLowerCase().includes(q) || p.tutor.name.toLowerCase().includes(q))
      .slice(0, 10)
      .map((p) => ({
        type: "pet" as const,
        id: p.id,
        name: p.name,
        tutorId: p.tutorId,
        tutorName: p.tutor.name,
        deceased: p.deceased,
        label: `Pet: ${p.name} (Tutor: ${p.tutor.name})`,
      }));

    const matchedTutors = tutors
      .filter((t) => t.name.toLowerCase().includes(q) && !matchedPets.some((p) => p.tutorId === t.id))
      .slice(0, 5)
      .map((t) => ({
        type: "tutor" as const,
        id: t.id,
        name: t.name,
        tutorId: t.id,
        tutorName: t.name,
        deceased: false,
        label: `Tutor: ${t.name}`,
      }));

    return [...matchedPets, ...matchedTutors];
  }, [searchQuery, pets, tutors]);

  const selectedPet = useMemo(() => pets.find((p) => p.id === petId), [petId, pets]);
  const selectedTutor = useMemo(() => tutors.find((t) => t.id === tutorId), [tutorId, tutors]);

  function selectOption(opt: any) {
    if (opt.type === "pet") {
      setPetId(opt.id);
      setTutorId(opt.tutorId);
      setSearchQuery(`${opt.name} (${opt.tutorName})`);
      setConfirmDeceased(false);
    } else {
      setPetId("");
      setTutorId(opt.id);
      setSearchQuery(opt.name);
      setConfirmDeceased(false);
    }
    setShowDropdown(false);
  }

  function handleToggleCollab(id: string) {
    setSelectedCollabIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!tutorId) {
      setError("Por favor, selecione um Tutor ou Pet usando a busca.");
      return;
    }
    if (selectedPet?.deceased && !confirmDeceased) {
      setError("Este pet esta registrado como OBITO. Voce precisa marcar a caixa de confirmacao para prosseguir.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          petId: petId || null,
          collaboratorIds: selectedCollabIds,
          type,
          status,
          scheduledAt,
          serviceIds,
          notes,
          confirmDeceased,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao criar");

      router.push("/agenda");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card card-pad space-y-4 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        
        {/* Autocomplete Search input */}
        <div className="sm:col-span-2 relative">
          <label className="label">Buscar por Tutor ou Pet *</label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Digite o nome do tutor ou do pet..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) {
                  setPetId("");
                  setTutorId("");
                }
              }}
              onFocus={() => setShowDropdown(true)}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                searchResults.map((opt) => (
                  <button
                    key={`${opt.type}-${opt.id}`}
                    type="button"
                    onClick={() => selectOption(opt)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 last:border-0 text-xs"
                  >
                    {opt.type === "pet" ? (
                      <PawPrint className={`h-4 w-4 shrink-0 ${opt.deceased ? "text-red-500" : "text-brand-500"}`} />
                    ) : (
                      <User className="h-4 w-4 shrink-0 text-slate-500" />
                    )}
                    <span className="flex-1 font-medium">{opt.label}</span>
                    {opt.deceased && (
                      <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase">
                        Obito
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-slate-500 text-center">Nenhum resultado encontrado.</div>
              )}
            </div>
          )}

          {/* Selection indicator */}
          {(selectedTutor || selectedPet) && (
            <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-wrap gap-4 items-center">
              {selectedTutor && (
                <div>
                  <span className="text-slate-500">Tutor:</span> <strong>{selectedTutor.name}</strong>
                </div>
              )}
              {selectedPet && (
                <div>
                  <span className="text-slate-500">Pet:</span> <strong>{selectedPet.name}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Deceased Confirmation */}
        {selectedPet?.deceased && (
          <div className="sm:col-span-2 border border-red-200 bg-red-50/50 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-700 text-sm font-semibold">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
              <span>Animal com obito registrado</span>
            </div>
            <p className="text-xs text-slate-600">
              O pet <strong>{selectedPet.name}</strong> esta registrado como Óbito no sistema. Para poder realizar um agendamento para ele, voce precisa declarar confirmacao explícita.
            </p>
            <label className="flex items-center gap-2 text-xs font-semibold text-red-700 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={confirmDeceased}
                onChange={(e) => setConfirmDeceased(e.target.checked)}
              />
              <span>Sim, confirmo e desejo agendar para este animal mesmo sob registro de obito</span>
            </label>
          </div>
        )}

        <div>
          <label className="label">Data e hora *</label>
          <input
            className="input"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="CONSULTA">Consulta</option>
            <option value="RETORNO">Retorno</option>
            <option value="BANHO_TOSA">Banho e Tosa</option>
            <option value="EXAME">Exame</option>
            <option value="PROCEDIMENTO">Procedimento</option>
          </select>
        </div>

        <div>
          <label className="label">Status</label>
          <select className="input font-semibold text-slate-800" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name.replace(/_/g, " ").toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Collaborators (multiple selection) */}
        <div className="sm:col-span-2">
          <label className="label">Profissionais Responsaveis *</label>
          <div className="grid sm:grid-cols-3 gap-2 max-h-40 overflow-auto p-3 border border-slate-200 rounded-lg">
            {collaborators.map((c) => {
              const isChecked = selectedCollabIds.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => handleToggleCollab(c.id)}
                  className={`flex items-center gap-2 p-2 border rounded-lg text-left transition-colors text-xs ${
                    isChecked
                      ? "border-brand-500 bg-brand-50/20 text-brand-900 font-semibold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {isChecked ? <CheckSquare className="h-4 w-4 text-brand-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-400 shrink-0" />}
                  <div className="truncate">
                    <div>{c.name}</div>
                    <div className="text-[9px] text-slate-400 font-normal">{c.role || "Colaborador"}</div>
                  </div>
                </button>
              );
            })}
            {collaborators.length === 0 && <p className="text-xs text-slate-400 py-2 col-span-3 text-center">Nenhum colaborador cadastrado.</p>}
          </div>
        </div>

        {/* Services checklist */}
        <div className="sm:col-span-2">
          <label className="label">Servicos</label>
          <div className="grid sm:grid-cols-2 gap-1.5 max-h-48 overflow-auto p-2 border border-slate-200 rounded-lg">
            {services.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-xs p-1 hover:bg-slate-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={serviceIds.includes(s.id)}
                  onChange={(e) =>
                    setServiceIds((p) =>
                      e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id)
                    )
                  }
                />
                <span className="font-medium text-slate-700">{s.name}</span>
                <span className="text-slate-400 ml-auto font-semibold">R$ {s.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Observacoes</label>
          <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}
      
      <div className="flex gap-2">
        <button
          className="btn-primary"
          disabled={saving || (selectedPet?.deceased && !confirmDeceased)}
        >
          {saving ? "Salvando..." : "Criar agendamento"}
        </button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
