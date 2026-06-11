import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentCard } from "./AppointmentCard";

export const dynamic = "force-dynamic";

function getTodayInBrazilString() {
  const now = new Date();
  const options = { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" } as const;
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === "year")!.value;
  const month = parts.find(p => p.type === "month")!.value;
  const day = parts.find(p => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

function getUTCBounds(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, 3, 0, 0, 0));
  return { start, end };
}

function getBrazilDateString(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const options = { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" } as const;
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(d);
  const year = parts.find(p => p.type === "year")!.value;
  const month = parts.find(p => p.type === "month")!.value;
  const day = parts.find(p => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

function startOfWeekUTC(d: Date) {
  const x = new Date(d.getTime());
  const day = x.getUTCDay();
  x.setUTCDate(x.getUTCDate() - day);
  return x;
}

function addDaysUTC(d: Date, n: number) {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export default async function AgendaPage({ searchParams }: { searchParams: { date?: string; vet?: string; view?: "day" | "week" } }) {
  const { tenantId } = await requireModule("agenda");
  const view = searchParams.view === "day" ? "day" : "week";
  const dateStr = searchParams.date || getTodayInBrazilString();
  const { start: dayStart, end: dayEnd } = getUTCBounds(dateStr);

  const start = view === "day" ? dayStart : startOfWeekUTC(dayStart);
  const end = view === "day" ? dayEnd : addDaysUTC(start, 7);
  const vetId = searchParams.vet || undefined;

  const [appts, vets] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        unit: { tenantId },
        scheduledAt: { gte: start, lt: end },
        ...(vetId ? { vetId } : {}),
      },
      include: { tutor: true, pet: true, vet: true, statusRelation: true, services: { include: { service: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.user.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const days = view === "day" ? [start] : Array.from({ length: 7 }, (_, i) => addDaysUTC(start, i));
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
          <Link className="btn-outline" href={`/agenda?view=${view}&vet=${vetId ?? ""}&date=${isoDate(addDaysUTC(start, view === "day" ? -1 : -7))}`}><ChevronLeft className="h-4 w-4" /></Link>
          <Link className="btn-outline" href={`/agenda?view=${view}&vet=${vetId ?? ""}&date=${isoDate(addDaysUTC(start, view === "day" ? 1 : 7))}`}><ChevronRight className="h-4 w-4" /></Link>
        </div>
      </form>

      <div className={view === "day" ? "" : "grid grid-cols-1 md:grid-cols-7 gap-3"}>
        {days.map((d) => {
          const dayAppts = appts.filter((a) => getBrazilDateString(a.scheduledAt) === getBrazilDateString(d));
          return (
            <div key={d.toISOString()} className="card card-pad">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                {d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit", month: "2-digit" })}
              </div>
              {dayAppts.length === 0 ? <div className="text-xs text-slate-400">Sem agendamentos</div> : (
                <ul className="space-y-2">
                  {dayAppts.map((a) => (
                    <AppointmentCard key={a.id} appointment={a} />
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
