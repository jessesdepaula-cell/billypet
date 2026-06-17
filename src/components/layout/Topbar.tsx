"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Search, Bell, User as UserIcon, CreditCard, ChevronDown, Check, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROLE_LABEL, canAccess, type Role } from "@/lib/permissions";

type Props = {
  name: string;
  role: Role;
  unit?: string | null;
  permissions?: string[] | null;
  subscriptionStatus?: string | null;
};

type AppNotification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
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
  
  // Profile dropdown state
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Falha ao buscar notificacoes");
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) => prev.filter((x) => x.id !== id));
      router.refresh();
    } catch (err) {
      console.error("Erro ao marcar como lida");
    }
  }

  async function markAllAsRead() {
    try {
      await Promise.all(
        notifications.map((n) =>
          fetch(`/api/notifications/${n.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      setNotifications([]);
      router.refresh();
    } catch (err) {
      console.error("Erro ao marcar todas como lidas");
    }
  }

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
        {/* Notifications Sino */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="btn-ghost px-2 relative rounded-lg hover:bg-slate-50 py-1"
            aria-label="Notificacoes"
            aria-haspopup="menu"
            aria-expanded={notifOpen}
          >
            <Bell className="h-5 w-5 text-slate-500" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white font-bold text-[9px] grid place-items-center animate-pulse shadow-soft">
                {notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="h-4 w-4" /> Lembretes Pendentes
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-brand-300 hover:text-white font-semibold flex items-center gap-0.5"
                  >
                    <Check className="h-3 w-3" /> Limpar tudo
                  </button>
                )}
              </div>
              
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 flex flex-col gap-1 text-xs">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-semibold text-slate-800 leading-tight">{n.title}</span>
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-slate-400 hover:text-emerald-600 p-0.5 shrink-0"
                          title="Marcar como lida"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-600 leading-snug">{n.message}</p>
                      <div className="flex justify-between items-center mt-1 text-[9px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" /> {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => {
                              setNotifOpen(false);
                              markAsRead(n.id);
                            }}
                            className="text-brand-600 font-bold hover:underline"
                          >
                            Abrir Ficha
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">Tudo limpo por aqui! Nenhum lembrete pendente.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
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
            <div className="h-9 w-9 rounded-full bg-brand-100 grid place-items-center text-brand-700 font-bold">
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
