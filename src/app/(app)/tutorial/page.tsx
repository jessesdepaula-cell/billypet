import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { tutorialsByCategory } from "@/lib/tutorials";
import { GraduationCap, Clock, ArrowRight, Sparkles, Stethoscope, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_META = {
  trilha: {
    title: "Trilha de primeiros passos",
    description: "Comece por aqui. 5 tutoriais que colocam sua clinica funcionando em ~15 minutos.",
    icon: Sparkles,
    accent: "from-brand-50 to-accent-50 border-brand-100",
  },
  operacao: {
    title: "Operacao do dia a dia",
    description: "O que voce faz toda hora: atendimento, vendas, caixa, contas, estoque, pacotes.",
    icon: Stethoscope,
    accent: "from-emerald-50 to-cyan-50 border-emerald-100",
  },
  gestao: {
    title: "Gestao e configuracao",
    description: "Relatorios, usuarios, perfis e ajustes finos do sistema.",
    icon: BarChart3,
    accent: "from-amber-50 to-orange-50 border-amber-100",
  },
} as const;

export default function TutoriaisPage() {
  const groups = tutorialsByCategory();

  return (
    <>
      <PageHeader
        title="Tutoriais BilyVet"
        description="Aprenda a usar cada parte do sistema. Leituras curtas, direto ao ponto."
      />

      {(["trilha", "operacao", "gestao"] as const).map((key) => {
        const meta = CATEGORY_META[key];
        const list = groups[key];
        if (list.length === 0) return null;
        const Icon = meta.icon;
        return (
          <section key={key} className="mb-6">
            <div className={`card card-pad mb-3 bg-gradient-to-br ${meta.accent}`}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/70 text-slate-800 grid place-items-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">{meta.title}</h2>
                  <p className="text-sm text-slate-600">{meta.description}</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tutorial/${t.slug}`}
                  className="card card-pad hover:border-brand-300 transition group"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 grid place-items-center shrink-0 group-hover:bg-brand-50 group-hover:text-brand-700 transition">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                        <span className="font-mono">{String(t.order).padStart(2, "0")}</span>
                        <span className="text-slate-300">|</span>
                        <Clock className="h-3 w-3" />
                        <span>{t.minutes} min</span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm leading-tight">{t.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{t.summary}</p>
                  <div className="flex items-center justify-end text-xs text-brand-600 group-hover:gap-2 gap-1 transition-all">
                    Ler
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
