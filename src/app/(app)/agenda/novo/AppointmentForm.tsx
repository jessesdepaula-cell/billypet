"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Syringe, ClipboardList, Stethoscope, AlertOctagon, HeartCrack } from "lucide-react";
import { cn } from "@/lib/utils";

type Tutor = { id: string; name: string };
type Pet = { id: string; name: string; tutorId: string };
type Vet = { id: string; name: string };
type Service = { id: string; name: string; price: number };
type Status = { id: string; name: string; color: string };

export function AppointmentForm({
  tutors,
  pets,
  vets,
  services,
  statuses,
  initialDate,
}: {
  tutors: Tutor[];
  pets: Pet[];
  vets: Vet[];
  services: Service[];
  statuses: Status[];
  initialDate?: string;
}) {
  const router = useRouter();
  const [tutorId, setTutorId] = useState("");
  const [petId, setPetId] = useState("");
  const [professionalIds, setProfessionalIds] = useState<string[]>([]);
  const [statusId, setStatusId] = useState(statuses[0]?.id || "");
  const [type, setType] = useState("CONSULTA");
  const [scheduledAt, setScheduledAt] = useState(initialDate ? `${initialDate}T09:00` : "");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de busca
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Estado da Ficha Clínica (Carregada dinamicamente)
  const [petDetails, setPetDetails] = useState<any>(null);
  const [loadingPet, setLoadingPet] = useState(false);

  // Busca Inteligente: Tutor e Pet
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();

    const matchedPets = pets.filter((p) => p.name.toLowerCase().includes(term));
    const matchedTutors = tutors.filter((t) => t.name.toLowerCase().includes(term));

    const results: { type: "pet" | "tutor"; id: string; name: string; tutorId: string; tutorName: string; petName?: string }[] = [];

    matchedPets.forEach((p) => {
      const t = tutors.find((x) => x.id === p.tutorId);
      results.push({
        type: "pet",
        id: p.id,
        name: `${p.name} (Pet) - Tutor: ${t?.name ?? "Desconhecido"}`,
        tutorId: p.tutorId,
        tutorName: t?.name ?? "Desconhecido",
        petName: p.name,
      });
    });

    matchedTutors.forEach((t) => {
      // Evita duplicados de tutor se já apareceu no pet
      results.push({
        type: "tutor",
        id: t.id,
        name: `${t.name} (Tutor)`,
        tutorId: t.id,
        tutorName: t.name,
      });
    });

    return results.slice(0, 10);
  }, [searchTerm, tutors, pets]);

  // Carregar ficha clínica completa do pet quando petId mudar
  useEffect(() => {
    if (!petId) {
      setPetDetails(null);
      return;
    }
    setLoadingPet(true);
    fetch(`/api/pets/${petId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ficha do pet não carregada");
        return res.json();
      })
      .then((data) => {
        setPetDetails(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingPet(false));
  }, [petId]);

  const selectResult = (res: any) => {
    if (res.type === "pet") {
      setTutorId(res.tutorId);
      setPetId(res.id);
      setSearchTerm(`${res.petName} (${res.tutorName})`);
    } else {
      setTutorId(res.tutorId);
      setPetId("");
      setSearchTerm(res.tutorName);
    }
    setSearchFocused(false);
  };

  const clearSelection = () => {
    setTutorId("");
    setPetId("");
    setSearchTerm("");
    setPetDetails(null);
  };

  async function save(e: React.FormEvent, force = false) {
    e.preventDefault();
    if (!tutorId) { setError("Tutor/Pet obrigatório"); return; }
    
    // Validação de óbito impeditiva com confirmação
    if (petDetails?.deceased && !force) {
      const confirmDeceased = confirm(
        `ATENÇÃO: O pet ${petDetails.name} está registrado como ÓBITO!\n\nTem certeza de que deseja criar um agendamento para este pet?`
      );
      if (!confirmDeceased) return;
    }

    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          petId: petId || null,
          professionalIds,
          statusId,
          type,
          scheduledAt,
          serviceIds,
          notes,
          force: true // se confirmou ou não é óbito, manda force true
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Falha ao criar agendamento");
      router.push("/agenda"); router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Filtragem de pets para preenchimento manual (opcional, caso não use a busca)
  const tutorPets = useMemo(() => pets.filter((p) => p.tutorId === tutorId), [pets, tutorId]);

  const selectedTutorName = tutors.find(t => t.id === tutorId)?.name;
  const selectedPetName = pets.find(p => p.id === petId)?.name;

  return (
    <div className="grid lg:grid-cols-3 gap-6 max-w-7xl">
      {/* Formulário Principal */}
      <form onSubmit={(e) => save(e)} className="lg:col-span-2 card card-pad space-y-4">
        {/* Busca Tutor / Pet */}
        <div className="relative">
          <label className="label">Buscar Tutor ou Pet *</label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Digite o nome do pet ou do tutor..."
              disabled={!!tutorId}
            />
            {tutorId && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchFocused && searchResults.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((res) => (
                <li
                  key={`${res.type}-${res.id}`}
                  onClick={() => selectResult(res)}
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 flex justify-between"
                >
                  <span>{res.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Informações de Seleção Atual (fallback visual se selecionado) */}
        {tutorId && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm flex justify-between items-center">
              <div>
                <span className="text-slate-500">Tutor:</span> <strong className="text-slate-800">{selectedTutorName}</strong>
                {petId && (
                  <span className="ml-3">
                    <span className="text-slate-500">Pet:</span> <strong className="text-slate-800">{selectedPetName}</strong>
                  </span>
                )}
              </div>
              <button type="button" onClick={clearSelection} className="text-xs text-red-600 hover:underline">Alterar Tutor/Busca</button>
            </div>

            {/* Seleção do Pet quando apenas Tutor foi buscado/selecionado ou para trocar de pet */}
            {tutorPets.length > 0 ? (
              <div className="bg-brand-50/40 border border-brand-100/50 rounded-lg p-3 text-sm space-y-1.5">
                <label className="label text-brand-900 font-semibold">Selecione o Pet deste Tutor *</label>
                <select
                  className="input text-xs"
                  required
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                >
                  <option value="">-- Escolha um Pet --</option>
                  {tutorPets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
                Este tutor não possui pets cadastrados. Cadastre um pet para este tutor para poder agendar atendimentos clínicos.
              </div>
            )}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Data e hora *</label>
            <input className="input" type="datetime-local" required value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>

          <div>
            <label className="label">Tipo de Atendimento</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="CONSULTA">Consulta</option>
              <option value="RETORNO">Retorno</option>
              <option value="BANHO_TOSA">Banho e Tosa</option>
              <option value="EXAME">Exame</option>
              <option value="PROCEDIMENTO">Procedimento</option>
            </select>
          </div>

          <div>
            <label className="label">Status Inicial</label>
            <select className="input" value={statusId} onChange={(e) => setStatusId(e.target.value)}>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Selecionar múltiplos Profissionais responsáveis */}
          <div className="sm:col-span-2">
            <label className="label">Profissionais Responsáveis (Selecione um ou mais)</label>
            <div className="grid sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2.5 border border-slate-200 rounded-lg bg-white">
              {vets.map((v) => (
                <label key={v.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={professionalIds.includes(v.id)}
                    onChange={(e) => setProfessionalIds(p => e.target.checked ? [...p, v.id] : p.filter(x => x !== v.id))}
                  />
                  {v.name}
                </label>
              ))}
              {vets.length === 0 && <span className="text-xs text-slate-400 italic">Nenhum profissional disponível.</span>}
            </div>
          </div>



          <div className="sm:col-span-2">
            <label className="label">Observações</label>
            <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detalhes adicionais..." />
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

        <div className="flex gap-2">
          <button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Criar agendamento"}</button>
          <button type="button" className="btn-outline" onClick={() => router.back()}>Cancelar</button>
        </div>
      </form>

      {/* Barra Lateral da Ficha do Pet */}
      <div className="space-y-4">
        <div className="card card-pad bg-white min-h-64 flex flex-col">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-3">
            Ficha do Paciente
          </h3>

          {!petId ? (
            <div className="text-slate-400 text-xs italic my-auto text-center">
              Selecione um Pet para visualizar a ficha clínica completa e prontuário integrado aqui.
            </div>
          ) : loadingPet ? (
            <div className="text-slate-500 text-xs my-auto text-center animate-pulse">
              Carregando histórico do paciente...
            </div>
          ) : petDetails ? (
            <div className="space-y-4 text-xs">
              {/* Alerta de Óbito */}
              {petDetails.deceased && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 flex gap-2 items-center">
                  <HeartCrack className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <div className="font-bold uppercase text-[10px]">Paciente Falecido</div>
                    <div className="text-[11px] mt-0.5">Óbito registrado em: {new Date(petDetails.deceasedAt).toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
              )}

              {/* Alerta de Protocolos Ativos */}
              {petDetails.protocols && petDetails.protocols.filter((pr: any) => pr.status === "ATIVO").length > 0 && (
                <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-brand-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Syringe className="h-4.5 w-4.5 text-brand-600" /> Protocolos Ativos
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {petDetails.protocols.filter((pr: any) => pr.status === "ATIVO").map((pr: any) => {
                      const completed = pr.applications.filter((a: any) => a.status === "APLICADO").length;
                      const nextApp = pr.applications.find((a: any) => a.status === "PENDENTE");
                      return (
                        <li key={pr.id}>
                          <strong>{pr.name}</strong> ({pr.type}): {completed}/{pr.applications.length} doses.
                          {nextApp && <span className="block text-[10px] text-slate-500">Próxima: {new Date(nextApp.plannedDate).toLocaleDateString("pt-BR")}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Detalhes Físicos */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div><span className="text-slate-400">Espécie:</span> <b>{petDetails.species}</b></div>
                <div><span className="text-slate-400">Raça:</span> <b>{petDetails.breed || "-"}</b></div>
                <div><span className="text-slate-400">Sexo:</span> <b>{petDetails.sex === "M" ? "Macho" : "Fêmea"}</b></div>
                <div><span className="text-slate-400">Peso:</span> <b>{petDetails.weightKg ? `${petDetails.weightKg} kg` : "-"}</b></div>
                {petDetails.medicalAlert && (
                  <div className="col-span-2 text-red-700 font-semibold border-t border-slate-200/50 pt-1.5 mt-1">
                    ⚠️ Alerta Clínico: {petDetails.medicalAlert}
                  </div>
                )}
              </div>

              {/* Prontuário Clínico Integrado */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1 border-b border-slate-100 pb-1">
                  <ClipboardList className="h-3.5 w-3.5" /> Prontuário / Fichas Clínicas
                </h4>
                {petDetails.medicalRecords && petDetails.medicalRecords.length === 0 ? (
                  <span className="text-slate-400 italic">Sem registros clínicos anteriores.</span>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
                    {petDetails.medicalRecords.map((m: any) => (
                      <div key={m.id} className="pt-2 first:pt-0">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{new Date(m.createdAt).toLocaleDateString("pt-BR")}</span>
                          <span>Dr(a). {m.vet?.name}</span>
                        </div>
                        {m.diagnosis && <div className="mt-0.5"><b>Diagnóstico:</b> {m.diagnosis}</div>}
                        {m.conduct && <div className="text-slate-600"><b>Conduta:</b> {m.conduct}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vacinas Aplicadas */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1 border-b border-slate-100 pb-1">
                  <Stethoscope className="h-3.5 w-3.5" /> Vacinas Aplicadas
                </h4>
                {petDetails.vaccines && petDetails.vaccines.length === 0 ? (
                  <span className="text-slate-400 italic">Nenhuma vacina aplicada.</span>
                ) : (
                  <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {petDetails.vaccines.map((v: any) => (
                      <li key={v.id} className="flex justify-between border-b border-slate-50 pb-0.5">
                        <span>{v.name}</span>
                        <span className="text-slate-400">{new Date(v.appliedAt).toLocaleDateString("pt-BR")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-500 text-xs italic my-auto text-center">
              Falha ao carregar dados do paciente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
