import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "blue" | "orange" | "green" | "red" | "gray" | "yellow";
};

const TONE: Record<string, string> = {
  blue:   "bg-brand-50 text-brand-700",
  orange: "bg-accent-50 text-accent-700",
  green:  "bg-emerald-50 text-emerald-700",
  red:    "bg-red-50 text-red-700",
  gray:   "bg-slate-100 text-slate-700",
  yellow: "bg-amber-50 text-amber-700",
};

export function StatCard({ title, value, hint, icon, tone = "blue" }: Props) {
  return (
    <div className="card card-pad flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">{title}</div>
        <div className="mt-1 text-2xl font-bold text-slate-800 truncate">{value}</div>
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
      </div>
      {icon && <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", TONE[tone])}>{icon}</div>}
    </div>
  );
}
