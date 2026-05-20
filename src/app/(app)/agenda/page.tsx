import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtTime, fmtDate } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

function startOfWeek(d: Date) { const x = new Date(d); const day = x.getDay(); x.setHours(0,0,0,0); x.setDate(x.getDate() - day); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export default async function AgendaPage({ searchParams }: { searchParams: { date?: string; vet?: string; view?: "day" | "week" } }) {
  const view = searchParams.view === "day" ? "day" : "week";
  const baseDate = searchParams.date ? new Date(searchParams.date) : new Date();
  const start = view === "day" ? new Date(baseDate.setHours(0,0,0,0)) : startOfWeek(baseDate);
  const end = view === "day" ? new Date(new Date(start).setHours(23,59,59,999)) : addDays(start, 7);
  const vetId = searchParams.vet || undefined;

  const [appts, vets] = await Promise.all([
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: start, lt: end }, ...(vetId ? { vetId } : {}) },
      include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.user.findMany({ where: { role: "VETERINARIO", isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const days = view === "day" ? [start] : Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const isoDate = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <>
      <PageHeader title="Agenda" description={`Visualizacao ${view === "day" ? "diaria" : "semanal"}`}
        actions={<Link className="btn-primary" href={`/agenda/novo?date=${isoDate(start)}`}><Plus className="h-4 w-4" /> Novo agendamento</Link>} />

      <form className="card card-pad mb-4 flex flex-wrap gap-2 items-end">
        <div><label className="label">Data</label><input className="input" type="date" name="date" defaultValue={isoDate(start)} /></div>
        <div><label className="label">Profissional</label>
          <select className="input" name="vet" defaultValue={vetId ?? ""}>
            <option value="">Todos</option>
            {vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div><label className="label">Visualizacao</label>
          <select className="input" name="view" defaultValue={view}><option value="day">Diaria</option><option value="week">Semanal</option></select>
        </div>
        <button className="btn-outline">Filtrar</button>
        <div className="ml-auto flex gap-1">
          <Link className="btn-outline" href={`/agenda?view=${view}&vet=${vetId ?? ""}&date=${isoDate(addDays(start, view === "day" ? -1 : -7))}`}><ChevronLeft className="h-4 w-4" /></Link>
          <Link className="btn-outline" href={`/agenda?view=${view}&vet=${vetId ?? ""}&date=${isoDate(addDays(start, view === "day" ? 1 : 7))}`}><ChevronRight className="h-4 w-4" /></Link>
        </div>
      </form>

      <div className={view === "day" ? "" : "grid grid-cols-1 md:grid-cols-7 gap-3"}>
        {days.map((d) => {
          const dayAppts = appts.filter((a) => new Date(a.scheduledAt).toDateString() === d.toDateString());
          return (
            <div key={d.toISOString()} className="card card-pad">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">{d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}</div>
              {dayAppts.length === 0 ? <div className="text-xs text-slate-400">Sem agendamentos</div> : (
                <ul className="space-y-2">
                  {dayAppts.map((a) => (
                    <li key={a.id} className="rounded-lg border border-slate-200 p-2 hover:border-brand-300 cursor-pointer">
                      <Link href={`/atendimento/${a.id}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{fmtTime(a.scheduledAt)}</span>
                          <span className="badge-gray text-[10px]">{a.status.replace(/_/g, " ").toLowerCase()}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-800 mt-0.5">{a.pet?.name ?? "Sem pet"}</div>
                        <div className="text-xs text-slate-500">{a.tutor.name}</div>
                        <div className="text-xs text-brand-600 mt-1">{a.services.map((s) => s.service.name).join(", ") || a.type}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
