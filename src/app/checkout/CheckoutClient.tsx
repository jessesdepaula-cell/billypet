"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  CreditCard,
  FileText,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

function maskCpfCnpj(v: string) {
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

function maskCardNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function maskCardExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

export default function CheckoutClient() {
  const [companyName, setCompanyName] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [billingType, setBillingType] = useState<"PIX" | "CREDIT_CARD" | "BOLETO">("PIX");

  // Dados de cartão de crédito
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCcv, setCardCcv] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Resultado do pedido
  const [result, setResult] = useState<{
    ok: boolean;
    tenantId?: string;
    pix?: { encodedImage?: string; payload?: string } | null;
    bankSlipUrl?: string | null;
  } | null>(null);

  const cpfCnpjDigits = cpfCnpj.replace(/\D/g, "");
  const isValidCpfCnpj = cpfCnpjDigits.length === 11 || cpfCnpjDigits.length === 14;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        companyName: companyName || responsibleName,
        responsibleName,
        email,
        password,
        cpfCnpj: cpfCnpjDigits,
        phone,
        billingType,
      };

      if (billingType === "CREDIT_CARD") {
        const [expiryMonth, expiryYear] = cardExpiry.split("/");
        payload.creditCard = {
          holderName: cardHolder.trim().toUpperCase(),
          number: cardNumber.replace(/\s/g, ""),
          expiryMonth: expiryMonth || "",
          expiryYear: expiryYear ? `20${expiryYear}` : "",
          ccv: cardCcv.trim(),
        };
        payload.creditCardHolderInfo = {
          name: responsibleName,
          email,
          cpfCnpj: cpfCnpjDigits,
          phone,
        };
      }

      const res = await fetch("/api/checkout/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao processar assinatura");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyPix() {
    if (result?.pix?.payload) {
      navigator.clipboard.writeText(result.pix.payload);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BilyVet" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">
            <Lock className="h-3.5 w-3.5" />
            Pagamento 100% Seguro & Criptografado
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium mb-6">
          <ChevronLeft className="h-4 w-4" /> Voltar para o site
        </Link>

        {/* TELA DE SUCESSO (SE PAGAMENTO CRIADO) */}
        {result ? (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-card text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {billingType === "PIX" ? "Assinatura Iniciada! Faça o PIX abaixo" : "Assinatura realizada com sucesso!"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Seu acesso ao sistema BilyVet foi liberado. Acompanhe a confirmação do pagamento.
              </p>
            </div>

            {/* SE FOR PIX */}
            {billingType === "PIX" && result.pix && (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6 space-y-4 text-left">
                <div className="text-center font-bold text-slate-800 text-sm flex items-center justify-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-600" />
                  Escaneie o QR Code ou Use o Copia e Cola PIX
                </div>

                {result.pix.encodedImage && (
                  <div className="flex justify-center my-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${result.pix.encodedImage}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 border border-slate-200 rounded-xl bg-white p-2 shadow-sm"
                    />
                  </div>
                )}

                {result.pix.payload && (
                  <div>
                    <label className="label text-xs">Código PIX (Copia e Cola)</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={result.pix.payload}
                        className="input text-xs font-mono bg-white select-all"
                      />
                      <button
                        onClick={handleCopyPix}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 shrink-0 px-4 text-xs font-bold"
                      >
                        {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedPix ? "Copiado!" : "Copiar PIX"}
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-500 text-center">
                  Após efetuar o PIX no aplicativo do seu banco, o acesso é confirmado em poucos segundos!
                </p>
              </div>
            )}

            {/* SE FOR BOLETO */}
            {billingType === "BOLETO" && result.bankSlipUrl && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-800">Seu boleto foi gerado!</p>
                <a
                  href={result.bankSlipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary bg-brand-600 inline-flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Visualizar Boleto Bancário
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/dashboard"
                className="btn-primary w-full py-4 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white justify-center shadow-card"
              >
                Acessar meu painel BilyVet agora
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE CHECKOUT */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* LADO ESQUERDO: FORMULÁRIO */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Finalizar Assinatura BilyVet</h1>
                <p className="text-sm text-slate-600 mt-1">Preencha seus dados para criar sua conta e acessar imediatamente.</p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-4 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. DADOS DA CLÍNICA & TITULAR */}
                <div className="space-y-4">
                  <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                    1. Dados de Acesso e Titular
                  </h2>

                  <div>
                    <label className="label">Nome da Clínica / Empresa</label>
                    <input
                      required
                      className="input"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex.: Clínica VetCare ou PetShop Amigo"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nome Completo do Responsável <span className="text-red-500">*</span></label>
                      <input
                        required
                        className="input"
                        value={responsibleName}
                        onChange={(e) => setResponsibleName(e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="label">CPF ou CNPJ <span className="text-red-500">*</span></label>
                      <input
                        required
                        className="input"
                        value={cpfCnpj}
                        onChange={(e) => setCpfCnpj(maskCpfCnpj(e.target.value))}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">E-mail para Login <span className="text-red-500">*</span></label>
                      <input
                        required
                        type="email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@clinica.com.br"
                      />
                    </div>
                    <div>
                      <label className="label">Telefone / WhatsApp <span className="text-red-500">*</span></label>
                      <input
                        required
                        className="input"
                        value={phone}
                        onChange={(e) => setPhone(maskPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Crie sua Senha de Acesso ao Sistema <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                    <p className="text-xs text-slate-500 mt-1">Essa será sua senha para fazer login no BilyVet.</p>
                  </div>
                </div>

                {/* 2. FORMA DE PAGAMENTO */}
                <div className="space-y-4">
                  <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                    2. Forma de Pagamento
                  </h2>

                  {/* Seleção de método */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setBillingType("PIX")}
                      className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 ${
                        billingType === "PIX"
                          ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 font-medium"
                      }`}
                    >
                      <QrCode className="h-5 w-5 text-emerald-600" />
                      <span className="text-xs">PIX</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Aprovação Imediata
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingType("CREDIT_CARD")}
                      className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 ${
                        billingType === "CREDIT_CARD"
                          ? "border-brand-500 bg-brand-50/50 text-brand-900 font-bold shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 font-medium"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-brand-600" />
                      <span className="text-xs">Cartão de Crédito</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingType("BOLETO")}
                      className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 ${
                        billingType === "BOLETO"
                          ? "border-amber-500 bg-amber-50/50 text-amber-900 font-bold shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 font-medium"
                      }`}
                    >
                      <FileText className="h-5 w-5 text-amber-600" />
                      <span className="text-xs">Boleto</span>
                    </button>
                  </div>

                  {/* Campos do Cartão de Crédito */}
                  {billingType === "CREDIT_CARD" && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 mt-3">
                      <div>
                        <label className="label text-xs">Número do Cartão</label>
                        <input
                          required
                          className="input bg-white"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                          placeholder="0000 0000 0000 0000"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="label text-xs">Nome impresso no cartão</label>
                        <input
                          required
                          className="input bg-white uppercase"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="NOME COMO NO CARTÃO"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label text-xs">Validade (MM/AA)</label>
                          <input
                            required
                            className="input bg-white"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(maskCardExpiry(e.target.value))}
                            placeholder="MM/AA"
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <label className="label text-xs">CVV (Código de Segurança)</label>
                          <input
                            required
                            type="password"
                            maxLength={4}
                            className="input bg-white"
                            value={cardCcv}
                            onChange={(e) => setCardCcv(e.target.value.replace(/\D/g, ""))}
                            placeholder="123"
                            inputMode="numeric"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isValidCpfCnpj}
                  className="w-full btn-primary py-4 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white justify-center shadow-card bp-glow-blue"
                >
                  <Lock className="h-5 w-5" />
                  {loading ? "Processando..." : "Confirmar e Pagar R$ 197,00/mês"}
                </button>

                <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Sem fidelidade • Cancele quando quiser • Dados 100% protegidos
                </div>
              </form>
            </div>

            {/* LADO DIREITO: RESUMO DO PEDIDO */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-lg">Resumo da Assinatura</span>
                <span className="text-xs uppercase tracking-widest font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                  Plano PRO
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-800 text-base">BilyVet Gestão Veterinária</span>
                  <span className="text-2xl font-extrabold text-slate-900">R$ 197,00</span>
                </div>
                <div className="text-xs text-slate-500">Cobrança mensal por unidade • Tudo incluso</div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                {[
                  "Atendimento clínico + Receituário em PDF",
                  "Agenda inteligente & Esteira Kanban",
                  "Internação 24h completa",
                  "Financeiro, Caixa, DRE e Contas",
                  "Estoque, Vendas (POS) e Fidelidade",
                  "IA Atendente & Operacional no WhatsApp",
                  "Multiunidades & Permissões por perfil",
                  "Backup automático & Atualizações grátis",
                  "Suporte humano dedicado em português",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-slate-900 p-4 text-white space-y-2">
                <div className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Garantia BilyVet
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Ao assinar agora, você obtém acesso imediato a todas as ferramentas sem restrições.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
