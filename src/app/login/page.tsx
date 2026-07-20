"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Falha no login");
      }
      router.push("/dashboard");
      router.refresh();
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
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity" title="Ir para a página de vendas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BilyVet Gestão Veterinária" className="h-16 w-auto mx-auto object-contain" />
          </Link>
          <p className="text-slate-500 text-sm mt-3">Plataforma de gestão para clínicas, hospitais e pet shops</p>
        </div>

        <form onSubmit={onSubmit} className="card card-pad space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">Acesse sua conta</h1>

          <div>
            <label className="label text-xs font-medium text-slate-700 block mb-1">E-mail</label>
            <input className="input w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="label text-xs font-medium text-slate-700 block mb-1">Senha</label>
            <div className="relative">
              <input
                className="input w-full px-3 py-2 text-sm border border-slate-300 rounded-lg pr-10 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

          <button className="btn-primary w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-sm transition-all" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="text-center pt-1">
            <Link href="/recuperar-senha" className="text-xs text-brand-600 hover:underline">
              Esqueci minha senha
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
