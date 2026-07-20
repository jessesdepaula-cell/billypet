"use client";

import { useEffect, useState } from "react";
import { UserPlus, Trash2, Bot, Shield, Save, Check, MessageSquare, PhoneCall } from "lucide-react";

type OperatorContact = {
  id: string;
  name: string;
  phone: string;
  role: string;
  active: boolean;
};

export function WhatsAppSettingsClient() {
  // Contatos de operadores
  const [contacts, setContacts] = useState<OperatorContact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("WORKER");
  const [isAdding, setIsAdding] = useState(false);

  // Configuracoes de IA
  const [aiClientEnabled, setAiClientEnabled] = useState(true);
  const [aiOperatorEnabled, setAiOperatorEnabled] = useState(true);
  const [operatorPrompt, setOperatorPrompt] = useState("");
  const [clientPrompt, setClientPrompt] = useState("");
  const [aiTestMode, setAiTestMode] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadContacts();
    loadAiSettings();
  }, []);

  async function loadContacts() {
    try {
      const res = await fetch("/api/whatsapp/contacts");
      const data = await res.json();
      if (res.ok) setContacts(data.contacts || []);
    } catch (e) {
      console.error("Erro ao carregar contatos:", e);
    }
  }

  async function loadAiSettings() {
    try {
      const res = await fetch("/api/whatsapp/settings");
      const data = await res.json();
      if (res.ok) {
        setAiClientEnabled(data.aiClientEnabled ?? true);
        setAiOperatorEnabled(data.aiOperatorEnabled ?? true);
        setOperatorPrompt(data.operatorPrompt ?? "");
        setClientPrompt(data.clientPrompt ?? "");
        setAiTestMode(data.aiTestMode ?? false);
        setTestPhone(data.testPhone ?? "");
      }
    } catch (e) {
      console.error("Erro ao carregar IA settings:", e);
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/whatsapp/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, role }),
      });
      if (res.ok) {
        setName("");
        setPhone("");
        setRole("WORKER");
        await loadContacts();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao adicionar operador");
      }
    } catch (e) {
      alert("Erro de conexao");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveContact(id: string) {
    if (!confirm("Remover este operador autorizados?")) return;
    try {
      const res = await fetch(`/api/whatsapp/contacts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadContacts();
      }
    } catch (e) {
      alert("Erro ao remover operador");
    }
  }

  async function handleSaveAiSettings(e: React.FormEvent) {
    e.preventDefault();
    if (aiTestMode && !testPhone.trim()) {
      alert("Por favor, informe o número de WhatsApp de teste.");
      return;
    }

    setIsSavingAi(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/whatsapp/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiClientEnabled,
          aiOperatorEnabled,
          operatorPrompt,
          clientPrompt,
          aiTestMode,
          testPhone,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      alert("Erro ao salvar configuracoes de IA");
    } finally {
      setIsSavingAi(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* SECAO: NUMEROS DE OPERADORES AUTORIZADOS (MODO ALIMENTADOR DE SISTEMA) */}
      <div className="card p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">Números de Operadores (Equipe / Donos)</h3>
            <p className="text-sm text-slate-500">
              Números cadastrados aqui autorizam a IA a **alimentar o sistema** (cadastrar tutores, animais, vacinas, pesos, consultas e agendamentos por áudio ou texto).
            </p>
          </div>
        </div>

        {/* Form para adicionar operador */}
        <form onSubmit={handleAddContact} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-700 mb-1">Nome do Operador</label>
            <input
              type="text"
              placeholder="ex: Dr. Carlos / João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-700 mb-1">WhatsApp (com DDI + DDD)</label>
            <input
              type="text"
              placeholder="5511999998888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="w-[140px]">
            <label className="block text-xs font-medium text-slate-700 mb-1">Função</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="OWNER">Proprietário</option>
              <option value="VET">Veterinário</option>
              <option value="WORKER">Equipe</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="btn-primary px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-1.5 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {isAdding ? "Adicionando..." : "Adicionar Operador"}
          </button>
        </form>

        {/* Lista de operadores */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Operadores Cadastrados ({contacts.length})
          </h4>
          {contacts.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-3">
              Nenhum número de operador cadastrado. Adicione um número acima para permitir que a IA receba registros e comandos por áudio.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {contacts.map((c) => (
                <div key={c.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="font-medium text-slate-800 text-sm">{c.name}</span>
                    <span className="text-slate-400 text-xs ml-2">&middot; +{c.phone}</span>
                    <span className="ml-3 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 uppercase">
                      {c.role}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveContact(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    title="Remover operador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECAO: CONFIGURACOES E PROMPTS DA IA (ESTILO CLARA) */}
      <form onSubmit={handleSaveAiSettings} className="card p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">Personalização do Agente de IA</h3>
            <p className="text-sm text-slate-500">
              Configure as instruções de comportamento, limite de número de testes e ative/desative a IA.
            </p>
          </div>
        </div>

        {/* Toggles e Modo de Testes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-800 text-sm block">IA para Operadores (Equipe)</span>
              <span className="text-xs text-slate-500">Permite que a IA processe comandos de áudio e texto da equipe para registrar dados no sistema.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiOperatorEnabled}
                onChange={(e) => setAiOperatorEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-800 text-sm block">IA para Atendimento ao Cliente</span>
              <span className="text-xs text-slate-500">Permite que a IA atenda tutores/clientes tirando dúvidas e agendando horários automaticamente.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiClientEnabled}
                onChange={(e) => setAiClientEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* MODO DE TESTES RESTRITO */}
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 flex flex-col justify-between gap-3 md:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-amber-900 text-sm flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  Modo de Testes Restrito (Permitir Múltiplos Números de Teste)
                </span>
                <span className="text-xs text-amber-700 mt-0.5 block">
                  Quando ativado, a IA responderá **SOMENTE aos números de WhatsApp autorizados** abaixo. Todas as outras conversas ignoram a IA, ideal para você e a equipe testarem com segurança antes de abrir ao público.
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={aiTestMode}
                  onChange={(e) => setAiTestMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {aiTestMode && (
              <div className="mt-2 pt-3 border-t border-amber-200/80">
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Números Autorizados para Testes (separados por vírgula ou linha)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: 5521997267809, 5521982788508"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
                <p className="text-[11px] text-amber-800 mt-1">
                  💡 Insira o DDI + DDD + Número para cada pessoa autorizada a testar (ex: 55 + 21 + 997267809).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Prompts Editaveis */}
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Instruções Extras para o Modo Operador (Equipe / Fazendeiros)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Adicione regras específicas de como a IA deve registrar informações da sua clínica/fazenda.
            </p>
            <textarea
              rows={3}
              placeholder="ex: Sempre que o veterinário disser 'dose padrão', considere 2ml de V10. Em caso de agendamento de retorno, defina o intervalo de 14 dias."
              value={operatorPrompt}
              onChange={(e) => setOperatorPrompt(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">
              Instruções de Atendimento ao Cliente (Tutores / Fazendeiros)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Defina o tom de voz, regras de agendamento, horário de funcionamento e recados para clientes.
            </p>
            <textarea
              rows={3}
              placeholder="ex: O horário de atendimento presencial é das 08h às 18h de segunda a sábado. Informar aos clientes que exames de sangue necessitam de jejum de 8 horas."
              value={clientPrompt}
              onChange={(e) => setClientPrompt(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Configurações salvas com sucesso!
            </span>
          )}

          <button
            type="submit"
            disabled={isSavingAi}
            className="btn-primary px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSavingAi ? "Salvando..." : "Salvar Instruções da IA"}
          </button>
        </div>
      </form>
    </div>
  );
}
