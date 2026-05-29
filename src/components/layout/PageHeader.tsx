import Link from "next/link";
import { HelpCircle } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
  tutorialSlug,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tutorialSlug?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
          {tutorialSlug && (
            <Link
              href={`/tutorial/${tutorialSlug}`}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 px-2 py-1 rounded-md hover:bg-slate-100"
              title="Ver tutorial desta tela"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Como usar
            </Link>
          )}
        </div>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
