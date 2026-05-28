"use client";

import Link from "next/link";
import { useState } from "react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Falha ao enviar link");
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 grid place-items-center text-white font-bold text-lg shadow-card">B</div>
            <span className="text-2xl font-bold text-slate-800">BilyVet</span>
          </div>
          <p className="text-slate-500 text-sm">Recupere o acesso a sua conta</p>
        </div>

        {done ? (
          <div className="card card-pad space-y-4 text-center">
            <h1 className="text-lg font-semibold text-slate-800">Verifique seu email</h1>
            <p className="text-sm text-slate-600">
              Se houver uma conta associada a <b>{email}</b>, voce recebera em instantes um link para redefinir a senha.
            </p>
            <Link href="/login" className="btn-outline inline-block">Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card card-pad space-y-4">
            <h1 className="text-lg font-semibold text-slate-800">Esqueci minha senha</h1>
            <p className="text-sm text-slate-500">
              Informe o email cadastrado e enviaremos um link para voce escolher uma nova senha.
            </p>

            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de recuperacao"}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-xs text-slate-500 hover:underline">Voltar ao login</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
