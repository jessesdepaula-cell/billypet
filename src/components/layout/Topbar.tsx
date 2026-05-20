"use client";

import { LogOut, Search, Bell, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROLE_LABEL, type Role } from "@/lib/permissions";

export function Topbar({ name, role, unit }: { name: string; role: Role; unit?: string | null }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar tutor, pet, produto..." />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-ghost px-2"><Bell className="h-5 w-5 text-slate-500" /></button>
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="text-sm font-medium text-slate-800">{name}</span>
          <span className="text-[11px] text-slate-500">{ROLE_LABEL[role]}{unit ? ` - ${unit}` : ""}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-brand-100 grid place-items-center text-brand-700">
          <UserIcon className="h-5 w-5" />
        </div>
        <button onClick={logout} className="btn-outline" title="Sair">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </header>
  );
}
