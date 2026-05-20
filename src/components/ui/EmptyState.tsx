import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Nada por aqui",
  description,
  action,
  icon,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card card-pad flex flex-col items-center justify-center text-center py-10">
      <div className="h-12 w-12 rounded-full bg-slate-100 grid place-items-center text-slate-400 mb-3">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div className="font-medium text-slate-700">{title}</div>
      {description && <div className="text-sm text-slate-500 mt-1 max-w-md">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
