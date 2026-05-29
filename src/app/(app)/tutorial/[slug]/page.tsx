import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTutorial, sortedTutorials } from "@/lib/tutorials";
import { ChevronLeft, ChevronRight, Clock, ExternalLink, Lightbulb, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function TutorialDetalhePage({ params }: { params: { slug: string } }) {
  const tutorial = getTutorial(params.slug);
  if (!tutorial) notFound();

  const all = sortedTutorials();
  const idx = all.findIndex((t) => t.slug === tutorial.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <>
      <div className="mb-3 text-sm">
        <Link href="/tutorial" className="text-slate-500 hover:text-brand-600">&larr; Voltar para tutoriais</Link>
      </div>

      <PageHeader title={tutorial.title} description={tutorial.summary} />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-pad">
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Leitura de {tutorial.minutes} min</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono">Passo {tutorial.order} de {all.length}</span>
            </div>

            <h3 className="font-semibold text-slate-800 mb-2">Quando usar</h3>
            <p className="text-sm text-slate-600">{tutorial.whenToUse}</p>
          </div>

          {tutorial.sections.map((sec, i) => (
            <div key={i} className="card card-pad space-y-3">
              <h2 className="text-lg font-bold text-slate-800">{sec.heading}</h2>

              {sec.steps && (
                <ol className="space-y-3">
                  {sec.steps.map((s, j) => (
                    <li key={j} className="flex gap-3">
                      <div className="h-7 w-7 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-sm font-semibold shrink-0">
                        {j + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-sm">{s.title}</div>
                        <p className="text-sm text-slate-600 mt-0.5">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {sec.paragraphs && (
                <ul className="space-y-2 text-sm text-slate-700">
                  {sec.paragraphs.map((p, j) => (
                    <li key={j} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}

              {sec.tip && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2 items-start">
                  <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900"><b>Dica:</b> {sec.tip}</div>
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between gap-3 pt-2">
            {prev ? (
              <Link href={`/tutorial/${prev.slug}`} className="btn-outline">
                <ChevronLeft className="h-4 w-4" /> {prev.title}
              </Link>
            ) : <div />}
            {next ? (
              <Link href={`/tutorial/${next.slug}`} className="btn-primary">
                Proximo: {next.title} <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/tutorial" className="btn-primary">
                Voltar ao indice <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card card-pad bg-brand-50 border-brand-100">
            <h3 className="font-semibold text-slate-800 mb-2">Pratique agora</h3>
            <p className="text-sm text-slate-600 mb-3">Abra a tela e siga o passo a passo em paralelo.</p>
            <Link href={tutorial.moduleHref} className="btn-primary w-full justify-center">
              {tutorial.moduleLabel} <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="card card-pad">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Todos os tutoriais</h3>
            <ul className="space-y-1.5">
              {all.map((t) => {
                const active = t.slug === tutorial.slug;
                return (
                  <li key={t.slug}>
                    <Link
                      href={`/tutorial/${t.slug}`}
                      className={`flex items-start gap-2 text-sm rounded-md px-2 py-1.5 ${
                        active ? "bg-brand-100 text-brand-800 font-semibold" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-mono text-xs text-slate-400 mt-0.5">{String(t.order).padStart(2, "0")}</span>
                      <span className="flex-1">{t.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
