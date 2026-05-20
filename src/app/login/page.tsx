"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@billypet.com");
  const [password, setPassword] = useState("admin123");
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
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 grid place-items-center text-white font-bold text-lg shadow-card">B</div>
            <span className="text-2xl font-bold text-slate-800">BillyPet</span>
          </div>
          <p className="text-slate-500 text-sm">Plataforma de gestao para clinicas, hospitais e pet shops</p>
        </div>

        <form onSubmit={onSubmit} className="card card-pad space-y-4">
          <h1 className="text-lg font-semibold text-slate-800">Acesse sua conta</h1>

          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="text-xs text-slate-500 border-t pt-3">
            <p className="font-semibold mb-1">Usuarios de exemplo (senha: 123456, admin: admin123):</p>
            <ul className="space-y-0.5">
              <li>admin@billypet.com - Administrador</li>
              <li>gestor@billypet.com - Gestor</li>
              <li>vet@billypet.com - Veterinario</li>
              <li>recepcao@billypet.com - Recepcao</li>
              <li>financeiro@billypet.com - Financeiro</li>
              <li>estoque@billypet.com - Estoque</li>
              <li>banhotosa@billypet.com - Banho e Tosa</li>
              <li>vendedor@billypet.com - Vendedor</li>
            </ul>
          </div>
        </form>
      </div>
    </main>
  );
}
