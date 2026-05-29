import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { sortedTutorials } from "@/lib/tutorials";
import { GraduationCap, Clock, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function TutoriaisPage() {
  const tutorials = sortedTutorials();

  return (
    <>
      <PageHeader
        title="Tutoriais BilyVet"
        description="Aprenda a usar cada parte do sistema. Comece pelo topo - cada tutorial leva poucos minutos."
      />

      <div className="card card-pad mb-5 bg-gradient-to-br from-brand-50 to-accent-50 border-brand-100">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-600 text-white grid place-items-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Trilha de primeiros passos</h2>
            <p className="text-sm text-slate-600">
              Siga os 5 tutoriais abaixo na ordem e voce coloca sua clinica funcionando no BilyVet em aproximadamente 15 minutos.
              Cada passo libera o proximo no checklist do Dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {tutorials.map((t) => (
          <Link
            key={t.slug}
            href={`/tutorial/${t.slug}`}
            className="card card-pad hover:border-brand-300 transition group"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 grid place-items-center shrink-0 group-hover:bg-brand-50 group-hover:text-brand-700 transition">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                  <span className="font-mono">{String(t.order).padStart(2, "0")}</span>
                  <span className="text-slate-300">|</span>
                  <Clock className="h-3 w-3" />
                  <span>{t.minutes} min</span>
                </div>
                <h3 className="font-semibold text-slate-800 leading-tight">{t.title}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{t.summary}</p>
            <div className="flex items-center justify-end text-xs text-brand-600 group-hover:gap-2 gap-1 transition-all">
              Ler tutorial
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 card card-pad text-sm text-slate-500">
        <p className="font-semibold text-slate-700 mb-1">Em breve</p>
        <p>Mais tutoriais: Atendimento clinico e ficha, Internacao, Exames, Vendas / PDV, Caixa diario, Contas a pagar / receber, Estoque, Pacotes, Fidelidade, Relatorios, Usuarios e permissoes.</p>
      </div>
    </>
  );
}
