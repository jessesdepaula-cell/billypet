"use client";

import { useEffect, useState } from "react";
import { QrCode, Wifi, WifiOff, RefreshCw, LogOut, CheckCircle2, AlertCircle, Settings, Save } from "lucide-react";

type ConnectionState = "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "LOADING";

export function WhatsAppConnect() {
  const [status, setStatus] = useState<ConnectionState>("LOADING");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Configuracao do servidor Evolution (Railway)
  const [showConfig, setShowConfig] = useState(false);
  const [evolutionUrl, setEvolutionUrl] = useState("");
  const [evolutionApiKey, setEvolutionApiKey] = useState("");
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  async function checkStatus() {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      if (res.ok) {
        if (data.status === "CONNECTED") {
          setStatus("CONNECTED");
          setConnectedNumber(data.number);
          setQrCode(null);
          setErrorMsg(null);
        } else if (data.status === "CONNECTING") {
          setStatus("CONNECTING");
          setErrorMsg(null);
        } else {
          setStatus("DISCONNECTED");
          setConnectedNumber(null);
          setErrorMsg(null);
        }
      } else if (data.error && data.error.includes("EVOLUTION_API_URL ausente")) {
        setErrorMsg("EVOLUTION_API_URL ausente. Informe a URL e chave da sua Railway abaixo.");
        setShowConfig(true);
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err);
    }
  }

  useEffect(() => {
    checkStatus();
  }, []);

  // Polling enquanto aguarda conexao ou leitura do QR Code
  useEffect(() => {
    if (status !== "CONNECTING" && !qrCode) return;
    const interval = setInterval(async () => {
      await checkStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [status, qrCode]);

  async function handleConnect() {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/whatsapp/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes("EVOLUTION_API_URL ausente")) {
          setShowConfig(true);
        }
        throw new Error(data.error || "Falha ao solicitar QR Code");
      }
      if (data.base64) {
        const formattedQr = data.base64.startsWith("data:")
          ? data.base64
          : `data:image/png;base64,${data.base64}`;
        setQrCode(formattedQr);
        setStatus("CONNECTING");
      } else {
        await checkStatus();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao conectar");
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Deseja realmente desconectar a conta de WhatsApp desta assinatura?")) return;
    setIsDisconnecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" });
      if (res.ok) {
        setStatus("DISCONNECTED");
        setQrCode(null);
        setConnectedNumber(null);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Erro ao desconectar");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao desconectar");
    } finally {
      setIsDisconnecting(false);
    }
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!evolutionUrl.trim() || !evolutionApiKey.trim()) return;

    setIsSavingConfig(true);
    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evolutionUrl, evolutionApiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowConfig(false);
        setErrorMsg(null);
        await handleConnect();
      } else {
        alert(data.error || "Erro ao salvar configuracoes");
      }
    } catch (err) {
      alert("Erro ao salvar configuracoes");
    } finally {
      setIsSavingConfig(false);
    }
  }

  return (
    <div className="card p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${status === "CONNECTED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
            {status === "CONNECTED" ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">Conexão do WhatsApp</h3>
            <p className="text-sm text-slate-500">
              Escaneie o QR Code com o número do WhatsApp da sua assinatura.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "CONNECTED" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Conectado {connectedNumber ? `(${connectedNumber})` : ""}
            </span>
          )}
          {status === "CONNECTING" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Aguardando Leitura
            </span>
          )}
          {status === "DISCONNECTED" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Desconectado
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-lg bg-red-50 text-red-700 text-sm flex items-center justify-between gap-3 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setShowConfig((v) => !v)}
            className="px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md shrink-0 transition-colors"
          >
            {showConfig ? "Ocultar Formulário" : "Configurar Servidor"}
          </button>
        </div>
      )}

      {/* FORMULARIO DE CONFIGURACAO DO SERVIDOR (APARECE SE TIVER SEM URL OU QUANDO CLICAR EM CONFIGURAR) */}
      {showConfig && (
        <form onSubmit={handleSaveConfig} className="mt-5 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Settings className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-slate-800 text-sm">Configuração do Servidor WhatsApp API</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                URL do Servidor WhatsApp (API)
              </label>
              <input
                type="url"
                placeholder="https://sua-api.com"
                value={evolutionUrl}
                onChange={(e) => setEvolutionUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Chave apikey do Servidor
              </label>
              <input
                type="password"
                placeholder="Sua AUTHENTICATION_API_KEY"
                value={evolutionApiKey}
                onChange={(e) => setEvolutionApiKey(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="btn-primary px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSavingConfig ? "Salvando..." : "Salvar e Conectar"}
            </button>
          </div>
        </form>
      )}

      {/* QR Code Container */}
      {qrCode && status !== "CONNECTED" && (
        <div className="mt-6 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
          <div className="p-3 bg-white rounded-lg shadow-md border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="QR Code WhatsApp" className="w-60 h-60 object-contain" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700 text-center">
            Abra o WhatsApp no seu celular &rarr; Aparelhos Conectados &rarr; Conectar um aparelho.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            O status será atualizado automaticamente assim que você escanear.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {status === "CONNECTED" ? (
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isDisconnecting ? "Desconectando..." : "Desconectar WhatsApp"}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            {isConnecting ? "Gerando QR Code..." : qrCode ? "Atualizar QR Code" : "Conectar WhatsApp / Gerar QR Code"}
          </button>
        )}

        <button
          onClick={checkStatus}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Atualizar Status
        </button>

        {!showConfig && (
          <button
            onClick={() => setShowConfig(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-lg transition-colors ml-auto"
          >
            <Settings className="w-3.5 h-3.5" /> Configurações do Servidor
          </button>
        )}
      </div>
    </div>
  );
}
