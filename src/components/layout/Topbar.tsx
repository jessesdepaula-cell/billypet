"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Search, Bell, User as UserIcon, CreditCard, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROLE_LABEL, canAccess, type Role } from "@/lib/permissions";
import { cn } from "@/lib/utils";

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

  // Estados de notificações
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Erro ao buscar notificacoes:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    fetchNotifications();
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotifications();
  };

  const canSeeAssinatura = canAccess("assinatura", role, permissions ?? null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar tutor, pet, produto..." />
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Sino de Notificacoes */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="btn-ghost px-2 relative"
            aria-label="Notificacoes"
          >
            <Bell className="h-5 w-5 text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-white animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-semibold text-sm text-slate-800">Notificações ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-600 hover:underline font-medium"
                  >
                    Ler todas
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-slate-400">
                    Nenhuma notificação recente.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "px-4 py-3 text-xs flex gap-2 justify-between items-start transition-colors",
                        n.isRead ? "text-slate-500 bg-white" : "text-slate-800 bg-brand-50/20 font-medium"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{n.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 break-words">{n.message}</div>
                        <div className="text-[9px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString("pt-BR")}
                        </div>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-[10px] text-brand-600 hover:text-brand-800 font-medium self-center shrink-0 ml-2 bg-brand-50 hover:bg-brand-100 px-1.5 py-0.5 rounded"
                          title="Marcar como lida"
                        >
                          Lido
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
