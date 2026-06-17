import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtTime } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

function startOfWeek(d: Date) { const x = new Date(d); const day = x.getDay(); x.setHours(0,0,0,0); x.setDate(x.getDate() - day); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export default async function AgendaPage({ searchParams }: { searchParams: { date?: string; vet?: string; view?: "day" | "week" } }) {
  const { tenantId } = await requireModule("agenda");
  const view = searchParams.view === "day" ? "day" : "week";
  const baseDate = searchParams.date ? new Date(searchParams.date) : new Date();
  const start = view === "day" ? new Date(baseDate.setHours(0,0,0,0)) : startOfWeek(baseDate);
  const end = view === "day" ? new Date(new Date(start).setHours(23,59,59,999)) : addDays(start, 7);
  const vetId = searchParams.vet || undefined;

  const [appts, vets, statuses] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        unit: { tenantId },
        scheduledAt: { gte: start, lt: end },
        ...(vetId ? { vetId } : {}),
      },
      include: { tutor: true, pet: true, vet: true, services: { include: { service: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.user.findMany({ where: { tenantId, role: "VETERINARIO", isActive: true }, orderBy: { name: "asc" } }),
    prisma.appointmentStatus.findMany({ where: { tenantId } }),
  ]);

  const days = view === "day" ? [start] : Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const isoDate = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <>
      <PageHeader title="Agenda" description={`Visualizacao ${view === "day" ? "diaria" : "semanal"}`}
        tutorialSlug="agenda"
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
            <div key={d.toISOString()} className="card card-pad bg-slate-50 border border-slate-100">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">{d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}</div>
              {dayAppts.length === 0 ? <div className="text-xs text-slate-400">Sem agendamentos</div> : (
                <ul className="space-y-2">
                  {dayAppts.map((a) => {
                    const statusColor = statuses.find((s) => s.name === a.status)?.color ?? "#94a3b8";
                    return (
                      <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-300 cursor-pointer shadow-soft transition-all">
                        <Link href={`/atendimento/${a.id}`}>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-slate-800">{fmtTime(a.scheduledAt)}</span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] text-white font-bold uppercase shrink-0"
                              style={{ backgroundColor: statusColor }}
                            >
                              {a.status.replace(/_/g, " ").toLowerCase()}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-800">{a.pet?.name ?? "Sem pet"}</div>
                          <div className="text-[10px] text-slate-500">{a.tutor.name}</div>
                          <div className="text-[9px] text-brand-600 font-medium mt-1 truncate bg-brand-50/50 px-1 py-0.5 rounded border border-brand-100/35">
                            {a.services.map((s) => s.service.name).join(", ") || a.type}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
