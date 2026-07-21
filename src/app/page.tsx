import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import {
  Stethoscope,
  CalendarDays,
  ClipboardList,
  PawPrint,
  Wallet,
  BarChart3,
  Package,
  ShoppingCart,
  HeartPulse,
  FileText,
  Users,
  Building2,
  Sparkles,
  ShieldCheck,
  Rocket,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  Phone,
  Award,
  PlayCircle,
  Bot,
  MessageSquare,
  Mic,
} from "lucide-react";

export const metadata = {
  title: "BilyVet — O sistema que transforma sua clínica veterinária em uma máquina de lucro",
  description:
    "Plataforma completa para clínicas, hospitais veterinários, pet shops e banho e tosa. Atendimento, financeiro, agenda, estoque, internação, fidelidade e dashboards estratégicos em um só lugar.",
};

function PawMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <linearGradient id="bvpaw" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#bvpaw)" />
      <g fill="#fff">
        <ellipse cx="41" cy="52" rx="7.5" ry="10" transform="rotate(-20 41 52)" />
        <ellipse cx="54" cy="43" rx="8" ry="11.5" />
        <ellipse cx="69" cy="43" rx="8" ry="11.5" />
        <ellipse cx="82" cy="52" rx="7.5" ry="10" transform="rotate(20 82 52)" />
        <path d="M61 59 C44 59 34 72 39 85 C43 96 55 98 61 92 C67 98 79 96 83 85 C88 72 78 59 61 59 Z" />
      </g>
      <path d="M39 80 H50 l4 -9 l6 18 l5 -12 l3 3 H83" fill="none" stroke="#F97316" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative overflow-hidden bg-white text-slate-800">
      {/* ====================== NAV ====================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BilyVet Gestão Veterinária" className="h-11 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#beneficios" className="hover:text-brand-600 transition">Benefícios</a>
            <a href="#ia" className="hover:text-brand-600 transition">Assistente IA</a>
            <a href="#modulos" className="hover:text-brand-600 transition">Módulos</a>
            <a href="#para-quem" className="hover:text-brand-600 transition">Para quem é</a>
            <a href="#planos" className="hover:text-brand-600 transition">Planos</a>
            <a href="#faq" className="hover:text-brand-600 transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex btn-ghost text-slate-700 font-semibold">Entrar</Link>
            <Link href="/checkout" className="btn-primary shadow-card bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-none">
              Assinar agora — R$ 197/mês
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ====================== HERO ====================== */}
      <section className="relative isolate pt-14 pb-24 sm:pt-20 sm:pb-32">
        {/* Background blobs */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bp-grid-bg" />
          <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-brand-300/40 bp-blob" />
          <div className="absolute top-40 -right-32 w-[480px] h-[480px] rounded-full bg-accent-300/40 bp-blob" style={{ animationDelay: "-6s" }} />
          <div className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full bg-brand-200/40 bp-blob" style={{ animationDelay: "-12s" }} />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center relative">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto">
            O sistema que faz a sua{" "}
            <span className="bp-text-gradient">clínica veterinária</span> render{" "}
            <span className="relative inline-block">
              <span className="relative z-10">3× mais</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-accent-200/70 -z-0 rounded-sm" />
            </span>
            .
          </h1>

          {/* Subheadline abaixo da Headline */}
          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            <strong className="text-slate-900">BilyVet</strong> é a plataforma completa que une <strong>atendimento clínico, agenda, internação, financeiro, vendas, estoque, fidelidade e BI estratégico</strong> em um único lugar — pensado pra quem vive a rotina de uma clínica, hospital veterinário, pet shop ou banho e tosa.
          </p>

          {/* Vídeo de vendas no meio */}
          <div className="mt-10 relative max-w-3xl mx-auto">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-brand-400/30 via-transparent to-accent-400/40 blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-900 bp-glow-blue">
              <video
                className="w-full aspect-video"
                src="/video-vendas.mp4"
                poster="/video-vendas-poster.jpg"
                controls
                playsInline
                preload="metadata"
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
              <PlayCircle className="h-4 w-4 text-brand-600" />
              Veja a BilyVet em 1 minuto
            </div>
          </div>

          {/* Botões abaixo do vídeo */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/checkout"
              className="btn-primary px-8 py-4 text-base font-bold shadow-card bp-glow-blue group bg-emerald-600 hover:bg-emerald-700 text-white border-none"
            >
              Assinar agora — R$ 197/mês
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="btn-outline px-6 py-4 text-base font-semibold">
              Entrar na minha conta
            </Link>
          </div>

          {/* Diferenciais abaixo dos botões */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-700 font-medium">
              {[
                "Sem instalação. Funciona no navegador.",
                "Receituário interno em PDF.",
                "Suporte a multiunidades.",
                "Suporte humano em português.",
              ].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ====================== ASSISTENTE DE IA & ASSESSORIA ====================== */}
      <section id="ia" className="py-24 bg-gradient-to-b from-slate-900 via-brand-950 to-slate-900 text-white relative overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-500/20 bp-blob" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent-500/20 bp-blob" style={{ animationDelay: "-8s" }} />
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-4 py-1.5 text-xs font-bold text-brand-300 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              Inteligência Artificial Nativa no WhatsApp
            </div>
            <h2 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Sua clínica no piloto automático com a <span className="bp-text-gradient bg-clip-text">IA e Assessoria BilyVet</span>
            </h2>
            <p className="mt-4 text-lg text-slate-300 leading-relaxed">
              Esqueça cadastros manuais demorados. Nossa Inteligência Artificial atende tutores 24h no WhatsApp, transcreve áudios e permite que a equipe alimente todo o sistema apenas mandando áudios ou textos.
            </p>
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-10 items-center">
            {/* Benefícios da IA */}
            <div className="space-y-6">
              {[
                {
                  icon: Bot,
                  title: "Atendente Virtual 24 horas no WhatsApp",
                  desc: "A IA responde dúvidas de tutores, realiza agendamentos na agenda da clínica e envia lembretes automáticos de retorno sem sobrecarregar a recepcionista.",
                  badge: "Atendimento Automático",
                },
                {
                  icon: Mic,
                  title: "Alimentação do Sistema por Áudio e Texto",
                  desc: "Veterinários e operadores registram consultas, exames, estoques e vendas apenas gravando um áudio no WhatsApp. A IA transcreve e estrutura os dados instantaneamente.",
                  badge: "Voz para Dado",
                },
                {
                  icon: MessageSquare,
                  title: "Transcrição Inteligente de Mensagens",
                  desc: "Receba áudios de clientes e converta-os em texto automaticamente no bate-papo integrado, garantindo agilidade no atendimento sem precisar ouvir áudios longos.",
                  badge: "Transcrição Nativa",
                },
                {
                  icon: TrendingUp,
                  title: "Assessoria Estratégica de Negócio",
                  desc: "A IA analisa dados da sua clínica para indicar vacinas vencendo, tutores ausentes e oportunidades de aumento de faturamento mês a mês.",
                  badge: "Lucro & Retenção",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur hover:bg-white/10 transition group">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center text-white shadow-lg shrink-0 group-hover:scale-105 transition">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-white">{item.title}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/20">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulação visual do WhatsApp com IA */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-500 to-accent-500 rounded-3xl opacity-20 blur-2xl" />
              <div className="relative rounded-3xl border border-white/15 bg-slate-950 p-6 shadow-2xl space-y-4 font-sans text-xs">
                {/* Header da conversa */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-600 to-accent-500 grid place-items-center font-bold text-white">
                        IA
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        Assistente Virtual BilyVet
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <div className="text-emerald-400 text-[11px]">Online no WhatsApp 24h</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px]">WhatsApp API</span>
                </div>

                {/* Mensagens de exemplo */}
                <div className="space-y-3 pt-2">
                  {/* Tutor */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-slate-800 text-slate-200 p-3 shadow">
                      <div className="text-[10px] text-slate-400 font-semibold mb-0.5">Tutor (Mariana)</div>
                      Olá! Gostaria de agendar uma consulta para o Thor amanhã às 14h.
                    </div>
                  </div>

                  {/* Resposta da IA */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-brand-600 text-white p-3 shadow">
                      <div className="text-[10px] text-brand-200 font-semibold mb-0.5">IA BilyVet (Automático)</div>
                      Olá Mariana! 🐾 Verifiquei a agenda e a Dra. Marina está disponível amanhã às 14:00. Agendamento pré-confirmado com sucesso! Te enviamos um lembrete no WhatsApp 1h antes.
                    </div>
                  </div>

                  {/* Veterinário por áudio */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-slate-800 text-slate-200 p-3 shadow">
                      <div className="text-[10px] text-amber-400 font-semibold mb-1 flex items-center gap-1">
                        <Mic className="h-3 w-3" /> Dr. Lucas (Veterinário - Áudio)
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg text-slate-300">
                        <span className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 grid place-items-center">▶</span>
                        <span>[Áudio de 12s]: "Consulta do Thor concluída. Peso 14.2kg, prescrever V10 para dia 15."</span>
                      </div>
                    </div>
                  </div>

                  {/* IA alimentando o sistema */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-emerald-700 text-white p-3 shadow">
                      <div className="text-[10px] text-emerald-200 font-semibold mb-0.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Sistema Atualizado
                      </div>
                      Registro efetuado: Peso de Thor atualizado para 14.2kg e lembrete da Vacina V10 programado no sistema para 15/08!
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-900">
                  ⚡ Tudo registrado no prontuário e no financeiro em tempo real.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== BENEFÍCIOS (cards 3D) ====================== */}
      <section id="beneficios" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              Por que o BilyVet
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900">
              Feito por quem entende a rotina veterinária — não por programador genérico.
            </h2>
            <p className="mt-3 text-slate-600">
              Cada tela foi desenhada com gestores, veterinários, atendentes de banho e tosa e financeiro. Você abre e já sabe o que fazer.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 bp-perspective">
            {[
              {
                icon: HeartPulse,
                title: "Atendimento clínico completo",
                desc: "Ficha com queixa, anamnese, exame físico, diagnóstico, conduta e procedimentos. Receituário em PDF gerado em segundos.",
                color: "from-brand-500 to-brand-700",
              },
              {
                icon: CalendarDays,
                title: "Agenda inteligente",
                desc: "Visualização diária e semanal, filtros, profissionais por unidade e bloqueio de horário com 1 clique.",
                color: "from-emerald-500 to-emerald-700",
              },
              {
                icon: ClipboardList,
                title: "Esteira (kanban) clínica",
                desc: "Aguardando → Triagem → Consulta → Exames → Banho/Tosa → Internação → Pagamento. Drag & drop e tempo na etapa.",
                color: "from-violet-500 to-violet-700",
              },
              {
                icon: Wallet,
                title: "Financeiro que sobra dinheiro",
                desc: "Caixa diário, sangrias, contas a pagar e receber, fluxo, DRE simplificada e mix de formas de pagamento.",
                color: "from-accent-500 to-accent-700",
              },
              {
                icon: Package,
                title: "Estoque sob controle",
                desc: "Múltiplas unidades, validade, mínimo, transferências, inventário valorizado e alertas automáticos.",
                color: "from-cyan-500 to-cyan-700",
              },
              {
                icon: ShoppingCart,
                title: "Vendas (POS) ágeis",
                desc: "Produtos e serviços no mesmo carrinho, múltiplas formas de pagamento, descontos, baixa de estoque e pontos.",
                color: "from-pink-500 to-pink-700",
              },
              {
                icon: HeartPulse,
                title: "Internação profissional",
                desc: "Leitos, evoluções clínicas, sinais vitais, medicações programadas e alta com termo automático.",
                color: "from-rose-500 to-rose-700",
              },
              {
                icon: BarChart3,
                title: "BI estratégico nativo",
                desc: "Curva ABC de clientes, top itens, estoque baixo, validade, receita por unidade — tudo exportável em CSV.",
                color: "from-indigo-500 to-indigo-700",
              },
              {
                icon: Award,
                title: "Fidelidade que retém",
                desc: "1 ponto a cada R$10. Pacotes de banho/serviço com saldo, validade e histórico de uso.",
                color: "from-amber-500 to-amber-700",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="bp-card-3d group rounded-2xl border border-slate-200 bg-white p-6 shadow-soft hover:shadow-card relative overflow-hidden"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${b.color} grid place-items-center text-white shadow-lg`}>
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{b.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-brand-50 opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== PARA QUEM É ====================== */}
      <section id="para-quem" className="py-24 bg-gradient-to-b from-white via-brand-50/40 to-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Não importa o tamanho. O BilyVet cresce com você.
            </h2>
            <p className="mt-3 text-slate-600">Uma única plataforma para todos os modelos de negócio do mercado pet.</p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, t: "Clínicas Veterinárias", d: "1, 2 ou 30 consultórios. Vet, recepção e gestor com permissões próprias." },
              { icon: HeartPulse, t: "Hospitais Veterinários", d: "Internação 24h, leitos, plantonista, evolução e medicação programada." },
              { icon: ShoppingCart, t: "Pet Shops", d: "PDV ágil, produtos, validade, fornecedor, comissão de vendedor automática." },
              { icon: PawPrint, t: "Banho e Tosa", d: "Agenda por banhista, pacotes com saldo, fidelidade e WhatsApp do tutor." },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-soft hover:shadow-card hover:-translate-y-1 transition">
                <div className="h-12 w-12 rounded-xl bg-brand-100 grid place-items-center text-brand-600">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== MÓDULOS ====================== */}
      <section id="modulos" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 border border-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
                <Sparkles className="h-3.5 w-3.5" />
                18 módulos integrados
              </div>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Tudo que sua operação precisa. Em um <span className="bp-text-gradient">único login</span>.
              </h2>
              <p className="mt-4 text-slate-600">
                Nada de juntar 5 sistemas, 3 planilhas e 1 grupo de WhatsApp. Do agendamento à DRE do mês, tudo conversa em tempo real.
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  "Dashboard com KPIs",
                  "Cadastros completos",
                  "Atendimento + receituário",
                  "Agenda diária/semanal",
                  "Esteira kanban",
                  "Internação",
                  "Vendas (POS)",
                  "Caixa & sangria",
                  "Contas a pagar",
                  "Contas a receber",
                  "Estoque & validade",
                  "Transferências",
                  "Inventário valorizado",
                  "Relatórios + CSV",
                  "Pacotes de banho",
                  "Fidelidade por pontos",
                  "Exames e resultados",
                  "Multiunidades",
                  "Permissões por perfil",
                  "Logs de auditoria",
                ].map((m) => (
                  <li key={m} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex gap-3">
                <Link href="/checkout" className="btn-primary px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-none">
                  Assinar agora — R$ 197/mês
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#planos" className="btn-outline px-5 py-3">Ver planos</a>
              </div>
            </div>

            {/* Stack 3D */}
            <div className="relative bp-perspective">
              <div className="bp-tilt-soft space-y-4">
                {[
                  { icon: Stethoscope, t: "Atendimento Clínico", c: "from-brand-500 to-brand-700", z: 0 },
                  { icon: CalendarDays, t: "Agenda Inteligente", c: "from-emerald-500 to-emerald-700", z: 30 },
                  { icon: Wallet, t: "Financeiro & DRE", c: "from-accent-500 to-accent-700", z: 60 },
                  { icon: BarChart3, t: "Dashboards Estratégicos", c: "from-violet-500 to-violet-700", z: 90 },
                  { icon: Building2, t: "Multiunidades", c: "from-pink-500 to-pink-700", z: 120 },
                ].map((m, i) => (
                  <div
                    key={m.t}
                    className="relative rounded-2xl border border-slate-200 bg-white shadow-card p-5 flex items-center gap-4"
                    style={{ transform: `translateZ(${m.z}px) translateX(${i * 10}px)` }}
                  >
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${m.c} grid place-items-center text-white shadow-lg`}>
                      <m.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{m.t}</div>
                      <div className="text-xs text-slate-500">Integrado em tempo real</div>
                    </div>
                    <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ====================== PLANOS ====================== */}
      <section id="planos" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sem taxa de instalação • Sem fidelidade • Cancela quando quiser
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900">
              Um plano. Um preço. Tudo incluso.
            </h2>
            <p className="mt-3 text-slate-600">Sem taxa de instalação. Sem fidelidade. Sem surpresa na fatura.</p>
          </div>

          <div className="mt-14 flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl border border-brand-500 p-8 shadow-card bg-white bp-glow-blue">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 text-white text-xs font-bold px-3 py-1 shadow-lg">
                <Sparkles className="h-3 w-3" /> Tudo incluso
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-slate-500">BilyVet</div>
              <div className="mt-2 flex items-baseline gap-1">
                <div className="text-5xl font-extrabold text-slate-900">R$ 197</div>
                <div className="text-sm text-slate-500">/mês por unidade</div>
              </div>
              <div className="mt-1 text-sm text-slate-600">Preço por unidade — matriz e cada filial pelo mesmo valor. Toda a plataforma inclusa.</div>

              <ul className="mt-6 grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  "Logs de auditoria",
                  "Usuários por perfil",
                  "Atendimento + receituário PDF",
                  "Agenda + esteira kanban",
                  "Internação completa",
                  "Financeiro + DRE",
                  "Estoque + PDV + fidelidade",
                  "BI + relatórios (CSV)",
                  "Backup + atualizações grátis",
                  "Suporte humano em português",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/checkout"
                className="mt-7 w-full btn-primary bp-glow-blue px-5 py-3 text-base justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Assinar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-3 text-center text-xs text-slate-500">Sem fidelidade • Cancela quando quiser</div>
            </div>
          </div>

          <div className="mt-10 text-center text-xs text-slate-500">
            O plano inclui: backup automático, atualizações grátis, multiusuário, permissões e logs de auditoria.
          </div>
        </div>
      </section>

      {/* ====================== FAQ ====================== */}
      <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Perguntas que todo mundo faz.</h2>
            <p className="mt-3 text-slate-600">Se restar dúvida, é só falar com a gente.</p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              {
                q: "Preciso instalar alguma coisa?",
                a: "Não. O BilyVet roda 100% no navegador. Funciona em Windows, Mac, Linux, tablet — qualquer lugar com internet.",
              },
              {
                q: "O sistema integra com o Vet Smart?",
                a: "Não. O receituário é interno e gerado pelo próprio BilyVet em PDF, com seu cabeçalho e padrão.",
              },
              {
                q: "Tenho 3 unidades. Funciona pra rede?",
                a: "Funciona muito bem. Multiunidades (matriz + filiais) é nativo: estoque, agenda, financeiro e relatórios por unidade ou consolidados.",
              },
              {
                q: "Meus dados ficam seguros?",
                a: "Sim. Autenticação JWT, cookies HTTP-only, permissões por perfil, exclusão lógica e logs de auditoria em toda ação sensível.",
              },
              {
                q: "Como faço pra começar?",
                a: "Clica em 'Acessar área de membros' aqui em cima. Em 60 segundos você está dentro do dashboard testando.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft open:shadow-card"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-slate-900">
                  {item.q}
                  <span className="ml-4 h-7 w-7 rounded-full bg-brand-50 text-brand-700 grid place-items-center font-bold transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== CTA FINAL ====================== */}
      <section className="py-24 relative overflow-hidden bg-slate-950 text-white border-t border-slate-800">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-3.5 py-1 text-xs font-semibold text-brand-300">
            <Rocket className="h-4 w-4 text-amber-400" />
            Comece hoje. Veja resultado essa semana.
          </div>
          <h2 className="mt-6 text-4xl sm:text-5xl font-extrabold leading-[1.08] text-white">
            Pronto pra deixar a sua clínica <span className="text-amber-400">profissional de verdade</span>?
          </h2>
          <p className="mt-4 text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Assine o BilyVet por apenas R$ 197/mês com todas as funcionalidades inclusas, IA no WhatsApp e liberação imediata.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/checkout"
              className="btn-primary px-8 py-4 text-base font-bold shadow-card bg-emerald-600 hover:bg-emerald-700 text-white border-none group justify-center"
            >
              Assinar agora — R$ 197/mês
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <a href="#planos" className="btn-outline px-6 py-4 text-base bg-white/10 border-white/20 text-slate-200 hover:bg-white/15 justify-center">
              Ver detalhes do plano
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Seus dados criptografados</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-emerald-400" /> Setup em minutos</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4 text-emerald-400" /> Suporte humano</span>
          </div>
        </div>
      </section>

      {/* ====================== FOOTER ====================== */}
      <footer className="bg-slate-950 text-slate-400 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="BilyVet" className="h-10 w-auto bg-white/10 p-1.5 rounded-lg" />
            </div>
            <p className="mt-3 text-xs">
              Plataforma de gestão para clínicas, hospitais veterinários, pet shops e banho e tosa.
            </p>
          </div>

          <div>
            <div className="font-semibold text-white mb-3">Produto</div>
            <ul className="space-y-2">
              <li><a href="#beneficios" className="hover:text-white">Benefícios</a></li>
              <li><a href="#modulos" className="hover:text-white">Módulos</a></li>
              <li><a href="#planos" className="hover:text-white">Planos</a></li>
              <li><Link href="/login" className="hover:text-white">Entrar</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-3">Empresa</div>
            <ul className="space-y-2">
              <li><a href="#ia" className="hover:text-white">Assistente IA</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Política de privacidade</a></li>
              <li><a href="#" className="hover:text-white">Termos de uso</a></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-3">Fale com a gente</div>
            <ul className="space-y-2">
              <li className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> (11) 9 9999-0000</li>
              <li>contato@bilyvet.com</li>
              <li className="text-xs">Atendimento Seg-Sex, 9h-18h</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-6 text-center text-xs">
          © {new Date().getFullYear()} BilyVet — Todos os direitos reservados.
        </div>
      </footer>

      <WhatsAppFloat />
    </main>
  );
}
