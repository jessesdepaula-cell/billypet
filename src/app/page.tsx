import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
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
} from "lucide-react";

export const metadata = {
  title: "BilyVet — O sistema que transforma sua clínica veterinária em uma máquina de lucro",
  description:
    "Plataforma completa para clínicas, hospitais veterinários, pet shops e banho e tosa. Atendimento, financeiro, agenda, estoque, internação, fidelidade e dashboards estratégicos em um só lugar.",
};

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative overflow-hidden bg-white text-slate-800">
      {/* ====================== NAV ====================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold text-lg shadow-card bp-ring-glow">
              <PawPrint className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold text-slate-900">BilyVet</div>
              <div className="text-[10px] uppercase tracking-widest text-brand-600 font-semibold">Gestão Veterinária</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#beneficios" className="hover:text-brand-600 transition">Benefícios</a>
            <a href="#modulos" className="hover:text-brand-600 transition">Módulos</a>
            <a href="#para-quem" className="hover:text-brand-600 transition">Para quem é</a>
            <a href="#depoimentos" className="hover:text-brand-600 transition">Depoimentos</a>
            <a href="#planos" className="hover:text-brand-600 transition">Planos</a>
            <a href="#faq" className="hover:text-brand-600 transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex btn-ghost text-slate-700">Entrar</Link>
            <Link href="/login" className="btn-primary shadow-card">
              Acessar área de membros
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

        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          {/* Copy */}
          <div className="lg:col-span-6 relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur border border-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              Novo • Plataforma 100% nacional para clínicas e pet shops
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
              O sistema que faz a sua{" "}
              <span className="bp-text-gradient">clínica veterinária</span> render{" "}
              <span className="relative inline-block">
                <span className="relative z-10">3× mais</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-accent-200/70 -z-0 rounded-sm" />
              </span>
              .
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              <strong className="text-slate-900">BilyVet</strong> é a plataforma completa que une <strong>atendimento clínico, agenda, internação, financeiro, vendas, estoque, fidelidade e BI estratégico</strong> em um único lugar — pensado pra quem vive a rotina de uma clínica, hospital veterinário, pet shop ou banho e tosa.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="btn-primary px-5 py-3 text-base shadow-card bp-glow-blue group">
                Entrar na minha conta
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <a href="#planos" className="btn-outline px-5 py-3 text-base">
                <PlayCircle className="h-4 w-4 text-brand-600" />
                Quero conhecer os planos
              </a>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {["A", "L", "M", "P"].map((c, i) => (
                  <div
                    key={c}
                    className={`h-8 w-8 rounded-full border-2 border-white grid place-items-center text-white text-xs font-bold shadow-soft ${
                      ["bg-brand-600", "bg-accent-500", "bg-emerald-500", "bg-violet-500"][i]
                    }`}
                  >
                    {c}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                  <span className="ml-1 font-semibold text-slate-800">4.9/5</span>
                </div>
                <div className="text-xs">+1.200 clínicas e pet shops já usam o BilyVet</div>
              </div>
            </div>

            {/* Mini bullets */}
            <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                "Sem instalação. Funciona no navegador.",
                "Receituário interno em PDF — sem depender de terceiros.",
                "Multiunidades (matriz + filiais) inclusas.",
                "Suporte humano em português.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* 3D mockup */}
          <div className="lg:col-span-6 relative bp-perspective">
            <div className="relative bp-tilt-r bp-3d">
              {/* Glow */}
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-brand-400/30 via-transparent to-accent-400/40 blur-2xl" />

              {/* Main dashboard card */}
              <div className="relative rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden bp-glow-blue">
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-xs font-medium text-slate-500">app.bilyvet.com / dashboard</div>
                  <div className="text-[10px] text-slate-400">v1.0</div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Bem-vindo de volta</div>
                      <div className="text-lg font-bold text-slate-900">Dra. Marina • Hoje</div>
                    </div>
                    <div className="badge-orange">8 atendimentos hoje</div>
                  </div>

                  {/* KPI cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Receita do dia", value: "R$ 4.820", trend: "+18%", icon: Wallet, color: "from-brand-500 to-brand-700" },
                      { label: "Atendimentos", value: "37", trend: "+9", icon: HeartPulse, color: "from-emerald-500 to-emerald-700" },
                      { label: "Ticket médio", value: "R$ 130", trend: "+12%", icon: TrendingUp, color: "from-accent-500 to-accent-700" },
                    ].map((k) => (
                      <div key={k.label} className="rounded-xl border border-slate-200 p-3 bg-white shadow-soft">
                        <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${k.color} grid place-items-center text-white mb-2`}>
                          <k.icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-500">{k.label}</div>
                        <div className="text-base font-bold text-slate-900 leading-tight">{k.value}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">{k.trend}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart mock */}
                  <div className="rounded-xl border border-slate-200 p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-slate-800">Faturamento últimos 7 dias</div>
                      <div className="text-[10px] text-slate-500">vs. semana anterior</div>
                    </div>
                    <div className="h-24 flex items-end gap-1.5">
                      {[40, 65, 52, 78, 60, 90, 100].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-0.5 items-stretch">
                          <div
                            className="rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kanban mock */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { t: "Recepção", c: 5, color: "bg-brand-50 border-brand-200 text-brand-700" },
                      { t: "Triagem", c: 3, color: "bg-amber-50 border-amber-200 text-amber-700" },
                      { t: "Consulta", c: 4, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                      { t: "Pagamento", c: 2, color: "bg-accent-50 border-accent-200 text-accent-700" },
                    ].map((s) => (
                      <div key={s.t} className={`rounded-lg border px-2 py-2 ${s.color}`}>
                        <div className="text-[10px] font-semibold">{s.t}</div>
                        <div className="text-base font-bold">{s.c}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="hidden md:block absolute -left-10 top-24 bp-float">
                <div className="rounded-2xl bg-white shadow-2xl border border-slate-200 p-3 w-56 bp-glow-orange">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-accent-100 grid place-items-center">
                      <PawPrint className="h-4 w-4 text-accent-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Thor • Labrador</div>
                      <div className="text-[10px] text-slate-500">Tutor: João Silva</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600">Vacina V10 — vence em 12 dias</div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full w-3/4 bg-accent-500" />
                  </div>
                </div>
              </div>

              <div className="hidden md:block absolute -right-6 bottom-10 bp-float-delay">
                <div className="rounded-2xl bg-white shadow-2xl border border-slate-200 p-3 w-60">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Receituário PDF</div>
                    <FileText className="h-3.5 w-3.5 text-brand-600" />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-900">Dipirona 500mg</div>
                  <div className="text-[11px] text-slate-500">1 cp a cada 8h por 5 dias</div>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Gerado em 0.8s
                  </div>
                </div>
              </div>

              <div className="hidden lg:block absolute -left-4 -bottom-8 bp-float-slow">
                <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-2xl p-3 w-52">
                  <div className="text-[10px] uppercase tracking-widest text-brand-200">Estoque crítico</div>
                  <div className="mt-1 text-sm font-bold">Antipulgas Bravecto</div>
                  <div className="text-[11px] text-brand-100">3 unidades restantes</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-white/15 rounded-full px-2 py-0.5">
                    <Zap className="h-3 w-3" /> Alerta automático
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logos / marquee */}
        <div className="mt-20 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Clínicas, hospitais e pet shops que confiam no BilyVet
          </div>
          <div className="mt-6 overflow-hidden relative">
            <div className="flex gap-12 bp-marquee whitespace-nowrap">
              {[...Array(2)].flatMap(() =>
                [
                  "Clínica VetCare",
                  "PetLove SP",
                  "Hospital Animal Vida",
                  "Banho & Cia",
                  "AmigoPet",
                  "Vetmaster",
                  "Patinhas Felizes",
                  "VetCenter",
                  "PetWorld",
                ].map((n, i) => (
                  <div key={`${n}-${i}-${Math.random()}`} className="text-slate-400 font-bold text-xl tracking-tight shrink-0">
                    {n}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====================== DOR / SOLUÇÃO ====================== */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              <Clock className="h-3.5 w-3.5" />
              Se identificou com algum desses problemas?
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Você perde tempo, dinheiro e clientes porque sua clínica ainda vive no <span className="line-through decoration-red-400 decoration-4">caderno e na planilha</span>.
            </h2>
            <ul className="mt-6 space-y-3">
              {[
                "Atendimentos atrasados porque a recepção não acha o histórico do pet.",
                "Estoque some, vacinas vencem e você só descobre quando falta no balcão.",
                "Comissão de vet, banho e tosa calculada na mão — e quase sempre errada.",
                "Falta de relatório claro: você não sabe quanto realmente sobra no fim do mês.",
                "Receituário em folha solta, sem padrão, sem rastreabilidade.",
                "Tutor reclama porque ninguém lembrou da revacinação.",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3 text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-red-100 text-red-600 grid place-items-center text-xs font-bold shrink-0 mt-0.5">✕</div>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative bp-perspective">
            <div className="bp-tilt-l rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-8 text-white shadow-2xl bp-glow-blue relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-300/30 rounded-full blur-3xl" />

              <Rocket className="h-10 w-10 text-accent-300" />
              <h3 className="mt-4 text-2xl font-extrabold leading-tight">
                Com o BilyVet, sua clínica passa a funcionar como um relógio suíço.
              </h3>
              <p className="mt-3 text-brand-100">
                Tudo em um único sistema, conectado em tempo real: agenda → atendimento → vendas → estoque → financeiro → relatório. Decisões com dado, não com achismo.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { k: "-72%", v: "tempo na recepção" },
                  { k: "+38%", v: "faturamento médio" },
                  { k: "0", v: "vacina esquecida" },
                  { k: "1 click", v: "fechar caixa" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-white/10 border border-white/15 backdrop-blur p-3">
                    <div className="text-2xl font-extrabold text-accent-300">{s.k}</div>
                    <div className="text-xs text-brand-100">{s.v}</div>
                  </div>
                ))}
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
                <Link href="/login" className="btn-primary px-5 py-3">
                  Quero acessar agora
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

      {/* ====================== DEPOIMENTOS ====================== */}
      <section id="depoimentos" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-brand-500/20 bp-blob" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-accent-500/20 bp-blob" style={{ animationDelay: "-7s" }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-brand-200 backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              4.9 de 5 — média real de clientes
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight">
              Quem entrou pro BilyVet não volta mais pra planilha.
            </h2>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                n: "Dra. Marina Lopes",
                r: "Clínica VetCare — SP",
                t: "Em 30 dias parei de perder vacina vencida e meu ticket médio subiu 22%. O receituário em PDF é coisa de outro mundo.",
              },
              {
                n: "Ricardo Almeida",
                r: "Hospital Animal Vida — RJ",
                t: "Tenho 3 unidades. O BilyVet me dá DRE consolidada e por unidade. Decisão que antes levava semana hoje é em 2 minutos.",
              },
              {
                n: "Camila Souza",
                r: "Banho & Cia — MG",
                t: "A esteira kanban virou a vida da minha equipe. Cliente entra, todo mundo sabe onde o pet está. Acabou bagunça.",
              },
            ].map((d) => (
              <div key={d.n} className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 hover:bg-white/10 transition">
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-100 italic">"{d.t}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 grid place-items-center font-bold">
                    {d.n.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="font-semibold">{d.n}</div>
                    <div className="text-xs text-slate-400">{d.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== PLANOS ====================== */}
      <section id="planos" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              7 dias grátis • Cancela quando quiser • Sem fidelidade
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900">
              Um plano pra cada tamanho de operação.
            </h2>
            <p className="mt-3 text-slate-600">Tudo incluso. Sem taxa de instalação. Sem surpresa na fatura.</p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6 bp-perspective">
            {[
              {
                name: "Essencial",
                price: "R$ 149",
                desc: "Pra clínica que está começando.",
                feats: ["1 unidade", "Até 3 usuários", "Atendimento + agenda", "PDV + estoque", "Suporte por e-mail"],
                cta: "Começar grátis",
                highlight: false,
              },
              {
                name: "Profissional",
                price: "R$ 299",
                desc: "O mais escolhido. Operação completa.",
                feats: [
                  "Até 2 unidades",
                  "Usuários ilimitados",
                  "Internação completa",
                  "Fidelidade + Pacotes",
                  "Relatórios + CSV",
                  "Suporte por WhatsApp",
                ],
                cta: "Quero esse plano",
                highlight: true,
              },
              {
                name: "Hospital",
                price: "Sob consulta",
                desc: "Hospitais e redes com múltiplas filiais.",
                feats: [
                  "Unidades ilimitadas",
                  "BI avançado",
                  "Auditoria por usuário",
                  "Onboarding dedicado",
                  "SLA prioritário",
                ],
                cta: "Falar com vendas",
                highlight: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl border p-7 shadow-card bg-white ${
                  p.highlight ? "border-brand-500 lg:scale-105 bp-glow-blue bp-tilt-soft" : "border-slate-200"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 text-white text-xs font-bold px-3 py-1 shadow-lg">
                    <Sparkles className="h-3 w-3" /> Mais escolhido
                  </div>
                )}
                <div className="text-sm font-bold uppercase tracking-widest text-slate-500">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <div className="text-4xl font-extrabold text-slate-900">{p.price}</div>
                  {p.price.startsWith("R$") && <div className="text-sm text-slate-500">/mês</div>}
                </div>
                <div className="mt-1 text-sm text-slate-600">{p.desc}</div>

                <ul className="mt-6 space-y-2 text-sm">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`mt-7 w-full ${p.highlight ? "btn-primary bp-glow-blue" : "btn-outline"} px-5 py-3 text-base justify-center`}
                >
                  {p.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-xs text-slate-500">
            Todos os planos incluem: backup automático, atualizações grátis, multiusuário, permissões e logs de auditoria.
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
      <section className="py-24 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900" />
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-accent-500/30 bp-blob" />
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-brand-400/30 bp-blob" style={{ animationDelay: "-5s" }} />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/15 px-3 py-1 text-xs font-semibold text-brand-100">
            <Rocket className="h-3.5 w-3.5 text-accent-300" />
            Comece hoje. Veja resultado essa semana.
          </div>
          <h2 className="mt-6 text-4xl sm:text-5xl font-extrabold leading-[1.05]">
            Pronto pra deixar a sua clínica <span className="bp-text-gradient bg-clip-text">profissional de verdade</span>?
          </h2>
          <p className="mt-5 text-brand-100 text-lg">
            Acesse a área de membros agora e veja como o BilyVet organiza tudo em menos de 5 minutos.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="btn-primary px-6 py-4 text-base shadow-2xl bp-glow-orange group bg-accent-500 hover:bg-accent-600">
              Acessar área de membros
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a href="#planos" className="btn-outline px-6 py-4 text-base bg-white/10 border-white/30 text-white hover:bg-white/15">
              Ver planos novamente
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-brand-200">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Seus dados criptografados</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> Setup em minutos</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" /> Suporte humano</span>
          </div>
        </div>
      </section>

      {/* ====================== FOOTER ====================== */}
      <footer className="bg-slate-950 text-slate-400 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center">
                <PawPrint className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-lg">BilyVet</span>
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
              <li><a href="#depoimentos" className="hover:text-white">Depoimentos</a></li>
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
    </main>
  );
}
