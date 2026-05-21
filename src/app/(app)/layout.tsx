import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import type { Role } from "@/lib/permissions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login");

  const unit = s.unitId ? await prisma.unit.findUnique({ where: { id: s.unitId } }) : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={s.role as Role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar name={s.name} role={s.role as Role} unit={unit?.name} />
        <main className="flex-1 p-5 lg:p-7 max-w-[1500px] w-full mx-auto">{children}</main>
        <footer className="px-5 py-3 text-xs text-slate-400 text-center">
          BilyVet (c) {new Date().getFullYear()} - Plataforma de gestao para clinicas, hospitais e pet shops
        </footer>
      </div>
    </div>
  );
}
