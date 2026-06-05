"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PetForm } from "../PetForm";
import {
  HeartCrack, Syringe, ClipboardList, Stethoscope, Paperclip,
  Trash2, Plus, Check, Calendar, Download, Eye, Award, BedDouble, AlertCircle, FileText, Settings
} from "lucide-react";
import { fmtDate, fmtDateTime, ageFromBirth } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  pet: any;
  tutors: any[];
};

const COLOR_CLASSES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
};

export function PetClinicalDashboard({ pet, tutors }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"cadastro" | "prontuario" | "protocolos" | "anexos" | "historico">("prontuario");

  // Estados locais para Anexos
  const [attachments, setAttachments] = useState<any[]>(pet.attachments || []);
  const [uploading, setUploading] = useState(false);

  // Estados locais para Protocolos
  const [protocols, setProtocols] = useState<any[]>(pet.protocols || []);
  const [showNewProtocol, setShowNewProtocol] = useState(false);
  const [protoName, setProtoName] = useState("");
  const [protoType, setProtoType] = useState("VACINA");
  const [protoDate, setProtoDate] = useState(new Date().toISOString().slice(0, 10));
  const [protoNotes, setProtoNotes] = useState("");
  const [savingProto, setSavingProto] = useState(false);

  // Registrar Óbito
  const [registeringDeceased, setRegisteringDeceased] = useState(false);
  const handleRegisterDeceased = async () => {
    if (!confirm(`Confirmar registro de Óbito para o pet "${pet.name}"?\nEsta ação desativa o pet e bloqueia novos agendamentos sem confirmação.`)) return;
    setRegisteringDeceased(true);
    try {
      const res = await fetch(`/api/pets/${pet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deceased: true }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegisteringDeceased(false);
    }
  };

  // Upload de Anexo
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/pets/${pet.id}/attachments`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const j = await res.json();
        setAttachments((prev) => [j, ...prev]);
        router.refresh();
      }
    } catch (err) {
      console.error("Erro no upload:", err);
    } finally {
      setUploading(false);
    }
  };

  // Deletar Anexo
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este anexo permanentemente?")) return;
    try {
      const res = await fetch(`/api/pets/${pet.id}/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  // Criar Protocolo
  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protoName.trim()) return;
    setSavingProto(true);
    try {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          name: protoName,
          type: protoType,
          startDate: protoDate,
          notes: protoNotes,
        }),
      });
      if (res.ok) {
        const j = await res.json();
        // recarregar lista de protocolos
        const listRes = await fetch(`/api/protocols?petId=${pet.id}`);
        if (listRes.ok) {
          const list = await listRes.json();
          setProtocols(list);
        }
        setShowNewProtocol(false);
        setProtoName("");
        setProtoNotes("");
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao criar protocolo:", err);
    } finally {
      setSavingProto(false);
    }
  };

  // Aplicar Dose/Dose Aplicada
  const handleApplyDose = async (protocolId: string, doseId: string) => {
    try {
      const res = await fetch(`/api/protocols/${protocolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applications: [{ id: doseId, status: "APLICADO" }],
        }),
      });
      if (res.ok) {
        // recarrega os protocolos
        const listRes = await fetch(`/api/protocols?petId=${pet.id}`);
        if (listRes.ok) {
          const list = await listRes.json();
          setProtocols(list);
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao aplicar dose:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Banner de Identificação do Pet e Alerta de Óbito */}
      <div className={cn(
        "card card-pad border flex flex-wrap gap-4 items-center justify-between shadow-soft",
        pet.deceased ? "bg-red-50/70 border-red-200" : "bg-white border-slate-200"
      )}>
        <div className="flex gap-3 items-center">
          <div className={cn(
            "h-12 w-12 rounded-full grid place-items-center font-bold text-lg border",
            pet.deceased ? "bg-red-100 text-red-700 border-red-200" : "bg-brand-100 text-brand-700 border-brand-200"
          )}>
            {pet.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{pet.name}</h1>
              {pet.deceased ? (
                <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <HeartCrack className="h-3 w-3" /> ÓBITO
                </span>
              ) : (
                <span className="badge-green">Ativo</span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {pet.species} {pet.breed ? ` - ${pet.breed}` : ""} | Tutor: <strong className="text-slate-700">{pet.tutor.name}</strong> | {ageFromBirth(pet.birthDate)}
            </div>
          </div>
        </div>

        {/* Ações Rápidas da Ficha */}
        <div className="flex gap-2">
          {!pet.deceased && (
            <button
              onClick={handleRegisterDeceased}
              disabled={registeringDeceased}
              className="btn bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <HeartCrack className="h-4 w-4" />
              Registrar Óbito
            </button>
          )}
          <Link href={`/agenda/novo?date=${new Date().toISOString().slice(0, 10)}`} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Novo Agendamento
          </Link>
        </div>
      </div>

      {/* Alerta Clínico Geral */}
      {pet.medicalAlert && (
        <div className="card bg-amber-50 border-amber-200 px-4 py-3 text-amber-800 text-sm flex gap-2 items-center">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <strong>Alerta Médico:</strong> {pet.medicalAlert}
          </div>
        </div>
      )}

      {/* Tabs Clínicas */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button onClick={() => setActiveTab("prontuario")} className={cn("pb-2.5 text-sm font-semibold border-b-2 px-1 transition-colors flex items-center gap-1.5", activeTab === "prontuario" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
          <ClipboardList className="h-4 w-4" /> Prontuário Clínico
        </button>
        <button onClick={() => setActiveTab("protocolos")} className={cn("pb-2.5 text-sm font-semibold border-b-2 px-1 transition-colors flex items-center gap-1.5", activeTab === "protocolos" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
          <Syringe className="h-4 w-4" /> Protocolos
        </button>
        <button onClick={() => setActiveTab("anexos")} className={cn("pb-2.5 text-sm font-semibold border-b-2 px-1 transition-colors flex items-center gap-1.5", activeTab === "anexos" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
          <Paperclip className="h-4 w-4" /> Anexos e Exames
        </button>
        <button onClick={() => setActiveTab("historico")} className={cn("pb-2.5 text-sm font-semibold border-b-2 px-1 transition-colors flex items-center gap-1.5", activeTab === "historico" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
          <Stethoscope className="h-4 w-4" /> Histórico Clínico
        </button>
        <button onClick={() => setActiveTab("cadastro")} className={cn("pb-2.5 text-sm font-semibold border-b-2 px-1 transition-colors flex items-center gap-1.5", activeTab === "cadastro" ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
          <Settings className="h-4 w-4" /> Dados Cadastrais
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="grid gap-5">
        {activeTab === "prontuario" && (
          /* ABA PRONTUÁRIO CLÍNICO */
          <div className="card card-pad space-y-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand-500" /> Histórico de Consultas e Fichas Clínicas
            </h2>
            {pet.medicalRecords.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center italic">Nenhum prontuário clínico registrado para este paciente.</p>
            ) : (
              <div className="space-y-4">
                {pet.medicalRecords.map((mr: any) => (
                  <div key={mr.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between text-xs text-slate-400 mb-2 border-b border-slate-100 pb-2">
                      <span><strong>Atendimento em:</strong> {fmtDateTime(mr.createdAt)}</span>
                      <span><strong>Profissional:</strong> {mr.vet?.name}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      {mr.complaint && <div className="sm:col-span-2"><b>Queixa Principal:</b> <span className="text-slate-700">{mr.complaint}</span></div>}
                      {mr.anamnesis && <div className="sm:col-span-2"><b>Anamnese:</b> <span className="text-slate-700">{mr.anamnesis}</span></div>}
                      {mr.physicalExam && <div className="sm:col-span-2"><b>Exame Físico:</b> <span className="text-slate-700">{mr.physicalExam}</span></div>}
                      {mr.diagnosis && <div><b>Diagnóstico:</b> <span className="text-slate-700">{mr.diagnosis}</span></div>}
                      {mr.conduct && <div><b>Conduta / Tratamento:</b> <span className="text-slate-700">{mr.conduct}</span></div>}
                      {mr.procedures && <div className="sm:col-span-2"><b>Procedimentos Realizados:</b> <span className="text-slate-700">{mr.procedures}</span></div>}
                      {mr.prescriptions && mr.prescriptions.length > 0 && (
                        <div className="sm:col-span-2 mt-2 bg-white border border-slate-200/60 rounded-lg p-2.5">
                          <b className="text-[11px] text-brand-600 block mb-1">Receituário Clínico:</b>
                          <ul className="list-disc pl-4 space-y-1">
                            {mr.prescriptions.map((pr: any) => (
                              <li key={pr.id}>
                                <strong>{pr.medication}</strong> - {pr.dosage} | {pr.frequency} ({pr.duration})
                                {pr.guidelines && <span className="block text-[10px] text-slate-400">Obs: {pr.guidelines}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "protocolos" && (
          /* ABA PROTOCOLOS CLÍNICOS */
          <div className="card card-pad space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Syringe className="h-5 w-5 text-brand-500" /> Protocolos Preventivos e de Saúde
              </h2>
              {!showNewProtocol && (
                <button onClick={() => setShowNewProtocol(true)} className="btn-primary text-xs px-3 py-1 flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Novo Protocolo
                </button>
              )}
            </div>

            {/* Form de Novo Protocolo */}
            {showNewProtocol && (
              <form onSubmit={handleCreateProtocol} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-sm text-slate-700 border-b border-slate-200 pb-1.5">Criar Novo Protocolo</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label text-[11px]">Nome do Protocolo *</label>
                    <input className="input text-xs" required value={protoName} onChange={(e) => setProtoName(e.target.value)} placeholder="Ex: Vermífugo Canino" />
                  </div>
                  <div>
                    <label className="label text-[11px]">Tipo de Protocolo</label>
                    <select className="input text-xs" value={protoType} onChange={(e) => setProtoType(e.target.value)}>
                      <option value="VACINA">Vacina</option>
                      <option value="VERMIFUGO">Vermífugo</option>
                      <option value="TRATAMENTO">Tratamento</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-[11px]">Data Inicial *</label>
                    <input className="input text-xs" type="date" required value={protoDate} onChange={(e) => setProtoDate(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2 md:col-span-4">
                    <label className="label text-[11px]">Observações</label>
                    <textarea className="input text-xs" rows={2} value={protoNotes} onChange={(e) => setProtoNotes(e.target.value)} placeholder="Observações do protocolo..." />
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <button className="btn-primary" disabled={savingProto}>{savingProto ? "Salvando..." : "Salvar e Gerar Lembretes"}</button>
                  <button type="button" className="btn-outline" onClick={() => setShowNewProtocol(false)}>Cancelar</button>
                </div>
              </form>
            )}

            {/* Listagem de Protocolos Ativos/Finalizados */}
            {protocols.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center italic">Nenhum protocolo cadastrado para este paciente.</p>
            ) : (
              <div className="space-y-4">
                {protocols.map((pr) => {
                  const completedDoses = pr.applications.filter((a: any) => a.status === "APLICADO").length;
                  const totalDoses = pr.applications.length;
                  const progressPct = Math.round((completedDoses / totalDoses) * 100) || 0;
                  return (
                    <div key={pr.id} className="border border-slate-100 rounded-xl p-4 bg-white hover:shadow-soft transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-sm">{pr.name}</h3>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border">
                              {pr.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Início: {fmtDate(pr.startDate)} {pr.notes ? `| Observações: ${pr.notes}` : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700">{completedDoses} / {totalDoses} doses aplicadas</span>
                          <div className="w-32 bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Grade de Aplicações de Dose */}
                      <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {pr.applications.map((app: any) => {
                          const isLate = app.status === "PENDENTE" && new Date(app.plannedDate) < new Date();
                          return (
                            <div
                              key={app.id}
                              className={cn(
                                "border rounded-lg p-2.5 text-center flex flex-col justify-between items-center transition-all",
                                app.status === "APLICADO"
                                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                                  : isLate
                                    ? "bg-red-50 border-red-200 text-red-800 animate-pulse"
                                    : "bg-slate-50/60 border-slate-200 text-slate-700"
                              )}
                            >
                              <div className="font-bold text-[10px] uppercase tracking-wider mb-1">Dose {app.doseNumber}</div>
                              <div className="text-xs font-semibold">{fmtDate(app.plannedDate)}</div>
                              {app.status === "APLICADO" ? (
                                <div className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full mt-2 flex items-center gap-0.5">
                                  <Check className="h-2.5 w-2.5" /> APLICADA
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleApplyDose(pr.id, app.id)}
                                  className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-2 border transition-all",
                                    isLate
                                      ? "bg-red-600 text-white hover:bg-red-700 border-red-600"
                                      : "bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-200"
                                  )}
                                >
                                  {isLate ? "ATRASADA - APLICAR" : "APLICAR DOSE"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "anexos" && (
          /* ABA ANEXOS E EXAMES */
          <div className="card card-pad space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-brand-500" /> Exames e Anexos Clínicos
              </h2>
              {/* Uploader */}
              <div>
                <label className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer">
                  <Plus className="h-3.5 w-3.5" /> Adicionar Arquivo
                  <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {uploading && (
              <div className="text-xs text-brand-600 text-center animate-pulse py-2">
                Fazendo upload do arquivo...
              </div>
            )}

            {attachments.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center italic">Nenhum anexo clínico (PDF, imagem, exame) cadastrado para este paciente.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {attachments.map((a) => {
                  const sizeMb = a.fileSize ? (a.fileSize / 1024 / 1024).toFixed(2) + " MB" : "Tamanho desconhecido";
                  return (
                    <div key={a.id} className="border border-slate-200 rounded-xl p-3 flex gap-3 items-center hover:shadow-soft transition-all bg-white relative group">
                      <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <div className="font-semibold text-xs text-slate-800 truncate" title={a.name}>
                          {a.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{sizeMb}</div>
                        <div className="text-[9px] text-slate-400">Adicionado: {fmtDate(a.createdAt)}</div>
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={a.url}
                          download={a.name}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                          title="Baixar arquivo"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteAttachment(a.id)}
                          className="p-1 rounded bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "historico" && (
          /* ABA HISTÓRICO GERAL */
          <div className="space-y-5">
            {/* Histórico de Agendamentos */}
            <div className="card card-pad">
              <h2 className="font-semibold text-slate-800 mb-3">Histórico de Atendimentos</h2>
              <table className="bp-table text-xs">
                <thead><tr><th>Data</th><th>Tipo</th><th>Serviços</th><th>Profissional</th><th>Status</th></tr></thead>
                <tbody>
                  {pet.appointments.map((a: any) => (
                    <tr key={a.id}>
                      <td>{fmtDateTime(a.scheduledAt)}</td>
                      <td>{a.type}</td>
                      <td>{a.services.map((s: any) => s.service.name).join(", ")}</td>
                      <td>{a.vet?.name ?? "-"}</td>
                      <td>
                        {a.statusRelation ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border",
                            COLOR_CLASSES[a.statusRelation.color] || "bg-slate-100 text-slate-800 border-slate-200"
                          )}>
                            {a.statusRelation.name}
                          </span>
                        ) : (
                          <span className="badge-gray">{a.status.replace(/_/g, " ").toLowerCase()}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pet.appointments.length === 0 && <tr><td colSpan={5} className="py-3 text-center text-slate-500">Nenhum atendimento registrado.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Vacinas Aplicadas (histórico simplificado) */}
            <div className="card card-pad">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Syringe className="h-4 w-4 text-brand-500" /> Vacinas Aplicadas</h3>
              {pet.vaccines.length === 0 ? <p className="text-sm text-slate-500">Sem vacinas cadastradas.</p> : (
                <ul className="space-y-1 text-xs">{pet.vaccines.map((v: any) => (
                  <li key={v.id} className="flex justify-between border-b border-slate-50 pb-1">
                    <span>{v.name}</span>
                    <span className="text-slate-400 font-medium">{fmtDate(v.appliedAt)} - próxima dose em: {fmtDate(v.nextDose)}</span>
                  </li>
                ))}</ul>
              )}
            </div>

            {/* Exames Solicitados */}
            <div className="card card-pad">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-brand-500" /> Exames Clínicos</h3>
              {pet.exams.length === 0 ? <p className="text-sm text-slate-500">Nenhum exame solicitado.</p> : (
                <ul className="space-y-1 text-xs">{pet.exams.map((e: any) => (
                  <li key={e.id} className="flex justify-between border-b border-slate-50 pb-1">
                    <span>{e.name}</span>
                    <span className="badge-gray">{e.status.toLowerCase()}</span>
                  </li>
                ))}</ul>
              )}
            </div>

            {/* Internações */}
            <div className="card card-pad">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><BedDouble className="h-4 w-4 text-emerald-500" /> Internações Realizadas</h3>
              {pet.hospitalizations.length === 0 ? <p className="text-sm text-slate-500">Nunca internado.</p> : (
                <ul className="space-y-1 text-xs">{pet.hospitalizations.map((h: any) => (
                  <li key={h.id} className="flex justify-between border-b border-slate-50 pb-1">
                    <span>{fmtDate(h.admittedAt)} - {h.reason}</span>
                    <span className="badge-gray">{h.status.toLowerCase()}</span>
                  </li>
                ))}</ul>
              )}
            </div>
          </div>
        )}

        {activeTab === "cadastro" && (
          /* ABA CADASTRO */
          <div className="card card-pad">
            <PetForm initial={{ ...pet, birthDate: pet.birthDate ?? null }} tutors={tutors} />
          </div>
        )}
      </div>
    </div>
  );
}
