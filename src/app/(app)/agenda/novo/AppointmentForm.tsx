"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Tutor = { id: string; name: string };
type Pet = { id: string; name: string; tutorId: string };
type Vet = { id: string; name: string };
type Service = { id: string; name: string; price: number };

export function AppointmentForm({ tutors, pets, vets, services, initialDate }: { tutors: Tutor[]; pets: Pet[]; vets: Vet[]; services: Service[]; initialDate?: string }) {
  const router = useRouter();
  const [tutorId, setTutorId] = useState("");
  const [petId, setPetId] = useState("");
  const [vetId, setVetId] = useState("");
  const [type, setType] = useState("CONSULTA");
  const [scheduledAt, setScheduledAt] = useState(initialDate ? `${initialDate}T09:00` : "");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tutorPets = useMemo(() => pets.filter((p) => p.tutorId === tutorId), [pets, tutorId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, petId: petId || null, vetId: vetId || null, type, scheduledAt, serviceIds, notes }),
      });
      if (!res.ok) throw new Error("Falha ao criar");
      router.push("/agenda"); router.refresh();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="card card-pad space-y-4 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">Tutor *</label>
          <select className="input" required value={tutorId} onChange={(e) => { setTutorId(e.target.value); setPetId(""); }}>
            <option value="">Selecione...</option>{tutors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div><label className="label">Pet</label>
          <select className="input" value={petId} onChange={(e) => setPetId(e.target.value)} disabled={!tutorId}>
            <option value="">{tutorId ? "Selecione..." : "Escolha o tutor"}</option>
            {tutorPets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label className="label">Data e hora *</label><input className="input" type="datetime-local" required value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} /></div>
        <div><label className="label">Tipo</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="CONSULTA">Consulta</option><option value="RETORNO">Retorno</option>
            <option value="BANHO_TOSA">Banho e Tosa</option><option value="EXAME">Exame</option><option value="PROCEDIMENTO">Procedimento</option>
          </select>
        </div>
        <div><label className="label">Veterinario</label>
          <select className="input" value={vetId} onChange={(e) => setVetId(e.target.value)}>
            <option value="">-</option>{vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Servicos</label>
          <div className="grid sm:grid-cols-2 gap-1 max-h-48 overflow-auto p-2 border border-slate-200 rounded-lg">
            {services.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={serviceIds.includes(s.id)} onChange={(e) => setServiceIds((p) => e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id))} />
                {s.name} <span className="text-xs text-slate-400 ml-auto">R$ {s.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2"><label className="label">Observacoes</label><textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </div>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={saving}>{saving ? "Salvando..." : "Criar agendamento"}</button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>Cancelar</button>
      </div>
    </form>
  );
}
