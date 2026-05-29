import Link from "next/link";
import { prisma } from "@/lib/db";
import { CheckCircle2, Circle, Sparkles, ArrowRight, GraduationCap } from "lucide-react";

type Item = {
  key: string;
  label: string;
  helper: string;
  href: string;
  cta: string;
  tutorialSlug?: string;
  done: boolean;
};

export async function OnboardingChecklist({ tenantId }: { tenantId: string }) {
  // Conta uma vez cada categoria para decidir o checkmark
  const [tutorCount, petCount, productCount, serviceCount, appointmentCount, saleCount] = await Promise.all([
    prisma.tutor.count({ where: { tenantId } }),
    prisma.pet.count({ where: { tutor: { tenantId } } }),
    prisma.product.count({ where: { tenantId } }),
    prisma.service.count({ where: { tenantId } }),
    prisma.appointment.count({ where: { unit: { tenantId } } }),
    prisma.sale.count({ where: { unit: { tenantId } } }),
  ]);

  const items: Item[] = [
    {
      key: "account",
      label: "Conta criada",
      helper: "Voce ja entrou no BilyVet - parabens",
      href: "/tutorial",
      cta: "Ver tutoriais",
      done: true,
    },
    {
      key: "tutor",
      label: "Cadastrar primeiro tutor",
      helper: "Tutor e o dono do pet. Tudo no sistema referencia ele.",
      href: "/tutores/novo",
      cta: "Cadastrar tutor",
      tutorialSlug: "tutores",
      done: tutorCount > 0,
    },
    {
      key: "pet",
      label: "Cadastrar primeiro pet",
      helper: "Vincule ao tutor. Cada vacina, ficha e exame fica no pet.",
      href: "/pets/novo",
      cta: "Cadastrar pet",
      tutorialSlug: "pets",
      done: petCount > 0,
    },
    {
      key: "product",
      label: "Cadastrar primeiro produto",
      helper: "Racao, medicamento, acessorio - tudo que voce vende ou usa.",
      href: "/produtos/novo",
      cta: "Cadastrar produto",
      tutorialSlug: "produtos",
      done: productCount > 0,
    },
    {
      key: "service",
      label: "Cadastrar primeiro servico",
      helper: "Consulta, banho, vacina. Sem servico voce nao agenda.",
      href: "/configuracoes",
      cta: "Abrir Cadastros",
      tutorialSlug: "servicos",
      done: serviceCount > 0,
    },
    {
      key: "appointment",
      label: "Criar primeiro agendamento",
      helper: "Marque um atendimento. Ele alimenta a esteira e o dashboard.",
      href: "/agenda/novo",
      cta: "Novo agendamento",
      tutorialSlug: "agenda",
      done: appointmentCount > 0,
    },
    {
      key: "sale",
      label: "Registrar primeira venda",
      helper: "Use o PDV para vender produtos e servicos com pagamento.",
      href: "/vendas/nova",
      cta: "Nova venda",
      done: saleCount > 0,
    },
  ];

  const total = items.length;
  const completed = items.filter((i) => i.done).length;
  if (completed === total) return null; // some quando 100%

  const percent = Math.round((completed / total) * 100);

  return (
    <div className="card mb-5 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-brand-50 via-white to-accent-50 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 text-white grid place-items-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 leading-tight">Comece por aqui</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {completed} de {total} passos concluidos - coloque sua clinica no ar em poucos minutos.
              </p>
            </div>
          </div>
          <Link href="/tutorial" className="text-xs text-brand-600 hover:underline whitespace-nowrap inline-flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" /> Tutoriais
          </Link>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {items.map((it) => (
          <li key={it.key} className="px-5 py-3 flex items-center gap-3">
            {it.done ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-slate-300 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${it.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{it.label}</div>
              {!it.done && <div className="text-xs text-slate-500">{it.helper}</div>}
            </div>
            {!it.done && (
              <div className="flex items-center gap-2 shrink-0">
                {it.tutorialSlug && (
                  <Link href={`/tutorial/${it.tutorialSlug}`} className="text-xs text-slate-500 hover:text-brand-600 hover:underline">
                    como faz?
                  </Link>
                )}
                <Link href={it.href} className="btn-primary text-xs inline-flex items-center gap-1">
                  {it.cta} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
