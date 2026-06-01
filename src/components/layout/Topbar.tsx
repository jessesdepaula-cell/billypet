"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Search, Bell, User as UserIcon, CreditCard, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROLE_LABEL, canAccess, type Role } from "@/lib/permissions";

type Props = {
  name: string;
  role: Role;
  unit?: string | null;
  permissions?: string[] | null;
  subscriptionStatus?: string | null; // status do Tenant
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  TRIAL: "bg-blue-100 text-blue-700",
  PAST_DUE: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-700",
  CANCELED: "bg-slate-100 text-slate-600",
};

export function Topbar({ name, role, unit, permissions = null, subscriptionStatus = null }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const canSeeAssinatura = canAccess("assinatura", role, permissions ?? null);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar tutor, pet, produto..." />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-ghost px-2" aria-label="Notificacoes"><Bell className="h-5 w-5 text-slate-500" /></button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg hover:bg-slate-50 px-2 py-1"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-sm font-medium text-slate-800">{name}</span>
              <span className="text-[11px] text-slate-500">{ROLE_LABEL[role]}{unit ? ` - ${unit}` : ""}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-100 grid place-items-center text-brand-700">
              <UserIcon className="h-5 w-5" />
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-800">{name}</div>
                <div className="text-xs text-slate-500">{ROLE_LABEL[role]}{unit ? ` - ${unit}` : ""}</div>
                {subscriptionStatus && (
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${STATUS_COLOR[subscriptionStatus] || "bg-slate-100"}`}>
                      Plano: {subscriptionStatus}
                    </span>
                  </div>
                )}
              </div>
              <div className="py-1">
                {canSeeAssinatura && (
                  <Link
                    href="/assinatura"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <CreditCard className="h-4 w-4 text-brand-600" />
                    Minha assinatura
                  </Link>
                )}
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4 text-slate-500" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
