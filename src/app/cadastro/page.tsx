"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, PawPrint, CheckCircle2, ArrowRight, Building2, Mail, Lock, Phone, CreditCard, Landmark, Sparkles } from "lucide-react";

function maskCnpj(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  return d.replace(/^(\d{2})(\d{5})(\d)/, "($1) $2-$3");
}

function maskZip(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

export default function CadastroPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cnpjDigits = cnpj.replace(/\D/g, "");
  const cnpjValid = cnpjDigits.length === 11 || cnpjDigits.length === 14;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!cnpjValid) {
      setError("Por favor, informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          email,
          password,
          cnpj: cnpjDigits,
          phone: phone.replace(/\D/g, ""),
          zipCode: zip.replace(/\D/g, ""),
        }),
      });

      const j = await res.json();
      if (!res.ok) {
        throw new Error(j.error || "Falha ao realizar cadastro.");
      }

      if (j.invoiceUrl) {
        // Abre o link do Asaas em outra guia
        window.open(j.invoiceUrl, "_blank", "noopener,noreferrer");
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
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* PAINEL ESQUERDO (Aesthetics / Copy) */}
      <section className="relative overflow-hidden md:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950 text-white p-8 md:p-16 flex flex-col justify-between">
        <div aria-hidden className="absolute inset-0 -z-0">
          <div className="absolute inset-0 bp-grid-bg opacity-30" />
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-500/20 bp-blob" />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-accent-500/20 bp-blob" style={{ animationDelay: "-8s" }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold text-lg shadow-card">
              <PawPrint className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold text-white">BilyVet</div>
              <div className="text-[10px] uppercase tracking-widest text-brand-300 font-semibold">Gestão Veterinária</div>
            </div>
          </Link>

          <div className="mt-16 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/10 px-3 py-1 text-xs font-semibold text-brand-200">
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              Plano PRO - Teste grátis por 7 dias
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Tudo pronto para <span className="text-accent-400">profissionalizar</span> a sua clínica?
            </h1>
            <p className="mt-4 text-sm md:text-base text-brand-100/90 leading-relaxed">
              Crie sua conta em menos de 1 minuto. Nosso sistema vai estruturar sua recepção, atendimentos, internações, comissões e financeiro de forma imediata.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                "Prontuário clínico e receituário em PDF",
                "Esteira Kanban (esteira clínica integrada)",
                "Agendamentos diários/semanais inteligentes",
                "Caixa, contas a pagar/receber e DRE",
                "Controle de estoque por lote e validade",
                "Fidelidade por pontos e pacotes de banho"
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 text-sm text-brand-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-brand-300">
          <div>© {new Date().getFullYear()} BilyVet. Todos os direitos reservados.</div>
          <div className="flex gap-4">
            <Link href="#suporte" className="hover:text-white transition">Suporte</Link>
            <Link href="#privacidade" className="hover:text-white transition">Privacidade</Link>
          </div>
        </div>
      </section>

      {/* PAINEL DIREITO (Formulário) */}
      <section className="md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-6 md:hidden text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-xl bg-brand-600 grid place-items-center text-white font-bold text-lg">B</div>
              <span className="text-xl font-bold text-slate-800">BilyVet</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="card card-pad bg-white shadow-xl border border-slate-200/80 space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Crie sua conta</h2>
              <p className="text-xs text-slate-500 mt-1">
                Ao finalizar, você entra direto no dashboard e a primeira fatura (Plano PRO - R$ 197/mês) será aberta para liberação no Asaas.
              </p>
            </div>

            {/* Nome da Clinica */}
            <div>
              <label className="label">Nome da Clínica ou Pet Shop <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-9"
                  type="text"
                  required
                  placeholder="Ex: Clínica Veterinária VetLife"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">E-mail do Administrador <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-9"
                  type="email"
                  required
                  placeholder="Ex: administrativo@clinica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="label">Crie uma Senha de Acesso <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-9 pr-10"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* CPF / CNPJ */}
            <div>
              <label className="label">CPF ou CNPJ do Titular <span className="text-red-500">*</span></label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-9"
                  type="text"
                  required
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                  inputMode="numeric"
                  value={cnpj}
                  onChange={(e) => setCnpj(maskCnpj(e.target.value))}
                  disabled={loading}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Necessário pelo Banco Central/Asaas para a emissão das faturas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Telefone */}
              <div>
                <label className="label">Telefone celular</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="input pl-9"
                    type="text"
                    placeholder="(00) 00000-0000"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* CEP */}
              <div>
                <label className="label">CEP da clínica</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="input pl-9"
                    type="text"
                    placeholder="00000-000"
                    inputMode="numeric"
                    value={zip}
                    onChange={(e) => setZip(maskZip(e.target.value))}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 leading-relaxed">
                {error}
              </div>
            )}

            <button className="btn-primary w-full py-2.5 shadow-card bp-glow-blue flex items-center justify-center gap-2 group" disabled={loading}>
              {loading ? "Processando Cadastro..." : "Concluir Cadastro e Iniciar"}
              {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
            </button>

            <div className="text-center pt-2 text-xs text-slate-500">
              Já possui uma conta?{" "}
              <Link href="/login" className="text-brand-600 hover:underline font-semibold">
                Faça login
              </Link>
            </div>
          </form>
        </div>
      </section>

    </main>
  );
}
