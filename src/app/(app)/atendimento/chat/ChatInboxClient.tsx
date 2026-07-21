"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Search, Bot, User, Phone, CheckCheck, RefreshCw, MessageSquare, Volume2, Plus, X } from "lucide-react";

type Conversation = {
  phone: string;
  displayName: string;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  direction: string;
  actor: string;
  isOperator: boolean;
};

type Message = {
  id: string;
  phone: string;
  direction: "IN" | "OUT";
  actor: "CONTACT" | "AI" | "HUMAN" | "SYSTEM";
  kind: "TEXT" | "AUDIO" | "SYSTEM";
  content: string;
  pushName?: string | null;
  createdAt: string;
};

type ContactInfo = {
  name: string | null;
  role: string;
  pets: Array<{ id: string; name: string; species: string }>;
  isOperator: boolean;
};

export function ChatInboxClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carrega a lista de conversas
  async function fetchConversations() {
    try {
      const res = await fetch("/api/whatsapp/messages");
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
      }
    } catch (e) {
      console.error("Erro ao carregar conversas:", e);
    } finally {
      setIsLoadingConversations(false);
    }
  }

  // Carrega a conversa selecionada
  async function fetchMessageThread(phone: string) {
    setIsLoadingThread(true);
    try {
      const res = await fetch(`/api/whatsapp/messages?phone=${phone}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        setContactInfo(data.contactInfo || null);
      }
    } catch (e) {
      console.error("Erro ao carregar historico:", e);
    } finally {
      setIsLoadingThread(false);
    }
  }

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      fetchMessageThread(selectedPhone);
      const interval = setInterval(() => {
        fetchMessageThread(selectedPhone);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPhone || !inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistic UI insert
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      phone: selectedPhone,
      direction: "OUT",
      actor: "HUMAN",
      kind: "TEXT",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: selectedPhone, text: textToSend }),
      });

      if (res.ok) {
        await fetchMessageThread(selectedPhone);
        await fetchConversations();
      } else {
        const data = await res.json();
        alert(data.error || "Falha ao enviar mensagem");
      }
    } catch (e) {
      alert("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  }

  function handleStartNewChat(e: React.FormEvent) {
    e.preventDefault();
    let digits = newPhoneInput.replace(/\D/g, "");
    if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
      digits = `55${digits}`;
    }
    if (digits.length < 10) {
      alert("Informe um número de telefone com DDD válido.");
      return;
    }
    setSelectedPhone(digits);
    setIsNewChatOpen(false);
    setNewPhoneInput("");
  }

  const filteredConversations = conversations.filter((c) =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const selectedConv = conversations.find((c) => c.phone === selectedPhone);

  return (
    <div className="card bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex">
      {/* PAINEL ESQUERDO: LISTA DE CONVERSAS */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
        <div className="p-3.5 border-b border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => setIsNewChatOpen(!isNewChatOpen)}
              className="btn-primary p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shrink-0 text-xs font-bold flex items-center gap-1"
              title="Iniciar nova conversa por número"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          </div>

          {/* Modal / caixa para nova conversa por numero */}
          {isNewChatOpen && (
            <form onSubmit={handleStartNewChat} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Nova Conversa WhatsApp</span>
                <button type="button" onClick={() => setIsNewChatOpen(false)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Telefone (ex.: 21 99726-7809)"
                value={newPhoneInput}
                onChange={(e) => setNewPhoneInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="w-full btn-primary py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg justify-center"
              >
                Iniciar Chat
              </button>
            </form>
          )}
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingConversations ? (
            <div className="p-6 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Carregando conversas...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.phone === selectedPhone;
              const dateStr = new Date(c.lastMessageAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <button
                  key={c.phone}
                  onClick={() => setSelectedPhone(c.phone)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                    isSelected ? "bg-emerald-50/80 border-l-4 border-emerald-600" : "hover:bg-white"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm ${
                    c.isOperator ? "bg-purple-600" : "bg-emerald-600"
                  }`}>
                    {c.displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {c.displayName}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0">{dateStr}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 truncate">
                        {c.actor === "AI" && <span className="font-semibold text-purple-600">IA: </span>}
                        {c.actor === "HUMAN" && <span className="font-semibold text-emerald-600">Você: </span>}
                        {c.lastMessage}
                      </p>

                      {c.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* PAINEL DIREITO: JANELA DE CHAT */}
      <div className="flex-1 flex flex-col bg-slate-100/50">
        {selectedPhone ? (
          <>
            {/* Header da conversa */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                  selectedConv?.isOperator ? "bg-purple-600" : "bg-emerald-600"
                }`}>
                  {(selectedConv?.displayName || selectedPhone).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
                    {selectedConv?.displayName || selectedPhone}
                    <span className="text-xs px-2 py-0.5 font-bold rounded bg-slate-100 text-slate-600">
                      {selectedConv?.role || "CLIENTE"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> +{selectedPhone}
                    {contactInfo?.pets && contactInfo.pets.length > 0 && (
                      <span className="ml-2 font-medium text-emerald-700">
                        &middot; Pets: {contactInfo.pets.map((p) => p.name).join(", ")}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Historico de mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingThread && messages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Carregando mensagens...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">
                  Nenhuma mensagem registrada nesta conversa.
                </div>
              ) : (
                messages.map((m) => {
                  const isIncoming = m.direction === "IN";
                  const isAi = m.actor === "AI";
                  const isHuman = m.actor === "HUMAN";
                  const timeStr = new Date(m.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isIncoming ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          isIncoming
                            ? "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                            : isAi
                            ? "bg-purple-600 text-white rounded-tr-none"
                            : "bg-emerald-600 text-white rounded-tr-none"
                        }`}
                      >
                        {/* Tag do remetente */}
                        <div className="text-[10px] font-bold opacity-85 mb-1 flex items-center gap-1">
                          {isIncoming ? (
                            <>
                              <User className="w-3 h-3" />
                              {m.pushName || "Cliente"}
                            </>
                          ) : isAi ? (
                            <>
                              <Bot className="w-3 h-3" />
                              Agente IA
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3" />
                              Atendente Humano
                            </>
                          )}
                        </div>

                        {/* Conteudo de Audio vs Texto */}
                        {m.kind === "AUDIO" || m.content.startsWith("[Áudio") ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-medium text-xs opacity-90 py-0.5">
                              <Volume2 className="w-4 h-4 shrink-0 animate-pulse" />
                              <span>Mensagem de Áudio</span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed text-sm bg-black/10 p-2 rounded-lg italic">
                              {m.content.replace(/^\[Áudio transcrito\]:\s*/i, "")}
                            </p>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        )}

                        <div className="text-[10px] opacity-75 text-right mt-1">
                          {timeStr}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de envio de mensagem manual */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Digite sua resposta humana para o cliente..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="btn-primary p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <MessageSquare className="w-12 h-12 stroke-[1.5] mb-3 text-slate-300" />
            <p className="text-base font-medium text-slate-600">Selecione uma conversa ao lado</p>
            <p className="text-xs text-slate-400 mt-1 text-center max-w-sm">
              Você poderá visualizar o histórico de interações do cliente, ler as respostas do Agente IA e conversar diretamente pelo WhatsApp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
