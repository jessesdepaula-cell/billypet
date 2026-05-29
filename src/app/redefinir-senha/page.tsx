"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

function RedefinirSenhaInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("As senhas nao conferem");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name: name || undefined }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha ao redefinir senha");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="card card-pad max-w-md w-full space-y-3 text-center">
        <h1 className="text-lg font-semibold text-slate-800">Link invalido</h1>
        <p className="text-sm text-slate-500">Este link de redefinicao de senha esta incompleto. Solicite um novo.</p>
        <Link href="/recuperar-senha" className="btn-primary inline-block">Solicitar novo link</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="h-10 w-10 rounded-xl bg-brand-600 grid place-items-center text-white font-bold text-lg shadow-card">B</div>
          <span className="text-2xl font-bold text-slate-800">BilyVet</span>
        </div>
        <p className="text-slate-500 text-sm">Defina sua senha de acesso</p>
      </div>

      <form onSubmit={onSubmit} className="card card-pad space-y-4">
        <h1 className="text-lg font-semibold text-slate-800">Definir nova senha</h1>

        <div>
          <label className="label">Nome da clinica ou responsavel (opcional)</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Clinica Pet Feliz" />
          <p className="text-xs text-slate-500 mt-1">Se for o primeiro acesso, voce pode aproveitar para preencher o nome agora.</p>
        </div>

        <div>
          <label className="label">Nova senha *</label>
          <div className="relative">
            <input
              className="input pr-10"
              type={showPwd ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Confirmar senha *</label>
          <div className="relative">
            <input
              className="input pr-10"
              type={showConfirm ? "text" : "password"}
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Salvando..." : "Salvar e entrar"}
        </button>
      </form>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 px-4">
      <Suspense fallback={<div className="text-sm text-slate-500">Carregando...</div>}>
        <RedefinirSenhaInner />
      </Suspense>
    </main>
  );
}
