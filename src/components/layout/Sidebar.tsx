"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { canAccess, type Role } from "@/lib/permissions";
import {
  LayoutDashboard, Users, PawPrint, CalendarDays, Stethoscope, KanbanSquare, BedDouble,
  FlaskConical, ShoppingCart, PackageOpen, Wallet, ArrowRightLeft, ClipboardList,
  PiggyBank, FileText, Receipt, GiftIcon, Settings,
  Building2, UserCog, BarChart3, Boxes, Crown, GraduationCap, CreditCard,
  Pin, PinOff, LifeBuoy
} from "lucide-react";

type Item = { href: string; label: string; module: string; icon: React.ComponentType<{ className?: string }> };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: "Super Admin",
    items: [
      { href: "/super-admin",               label: "Painel BilyVet", module: "super-admin", icon: Crown },
      { href: "/super-admin/assinaturas",   label: "Assinaturas",     module: "super-admin", icon: Receipt },
      { href: "/super-admin/clientes",      label: "Clientes",        module: "super-admin", icon: Building2 },
    ],
  },
  {
    title: "Geral",
    items: [
      { href: "/dashboard",    label: "Dashboard",       module: "dashboard",  icon: LayoutDashboard },
      { href: "/tutorial",     label: "Tutoriais",       module: "tutorial",   icon: GraduationCap },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/tutores",  label: "Tutores",  module: "tutores",  icon: Users },
      { href: "/pets",     label: "Pets",     module: "pets",     icon: PawPrint },
      { href: "/produtos", label: "Produtos", module: "produtos", icon: Boxes },
    ],
  },
  {
    title: "Atendimento",
    items: [
      { href: "/agenda",      label: "Agenda",       module: "agenda",      icon: CalendarDays },
      { href: "/atendimento", label: "Atendimento",  module: "atendimento", icon: Stethoscope },
      { href: "/esteira",     label: "Esteira",      module: "esteira",     icon: KanbanSquare },
      { href: "/internacao",  label: "Internacao",   module: "internacao",  icon: BedDouble },
      { href: "/exames",      label: "Exames",       module: "exames",      icon: FlaskConical },
    ],
  },
  {
    title: "Comercial",
    items: [
      { href: "/vendas",     label: "Vendas",     module: "vendas",     icon: ShoppingCart },
      { href: "/pacotes",    label: "Pacotes",    module: "pacotes",    icon: PackageOpen },
      { href: "/fidelidade", label: "Fidelidade", module: "fidelidade", icon: GiftIcon },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { href: "/financeiro",     label: "Visao geral",      module: "financeiro",      icon: Wallet },
      { href: "/caixa",          label: "Caixa diario",     module: "caixa",           icon: PiggyBank },
      { href: "/contas-receber", label: "Contas a receber", module: "contas-receber",  icon: Receipt },
      { href: "/contas-pagar",   label: "Contas a pagar",   module: "contas-pagar",    icon: FileText },
    ],
  },
  {
    title: "Estoque",
    items: [
      { href: "/estoque",        label: "Movimentacoes",   module: "estoque",        icon: ArrowRightLeft },
      { href: "/transferencias", label: "Transferencias",  module: "transferencias", icon: ArrowRightLeft },
      { href: "/inventario",     label: "Inventario",      module: "inventario",     icon: ClipboardList },
    ],
  },
  {
    title: "Gestao",
    items: [
      { href: "/relatorios",    label: "Relatorios",  module: "relatorios",   icon: BarChart3 },
      { href: "/unidades",      label: "Unidades",    module: "unidades",     icon: Building2 },
      { href: "/usuarios",      label: "Usuarios",    module: "usuarios",     icon: UserCog },
      { href: "/configuracoes", label: "Cadastros",   module: "configuracoes", icon: Settings },
      { href: "/assinatura",    label: "Assinatura",  module: "assinatura",   icon: CreditCard },
      { href: "/suporte",       label: "Suporte",     module: "suporte",      icon: LifeBuoy },
    ],
  },
];

export function Sidebar({ role, permissions }: { role: Role; permissions?: string[] | null }) {
  const pathname = usePathname();
  const [pinnedHrefs, setPinnedHrefs] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("bilyvet:pinned-items");
    if (raw) {
      try {
        setPinnedHrefs(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const togglePin = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = pinnedHrefs.includes(href)
      ? pinnedHrefs.filter((h) => h !== href)
      : [...pinnedHrefs, href];
    setPinnedHrefs(next);
    localStorage.setItem("bilyvet:pinned-items", JSON.stringify(next));
  };

  const allItems = groups.flatMap((g) => g.items);
  const pinnedItems = allItems.filter(
    (it) => pinnedHrefs.includes(it.href) && canAccess(it.module, role, permissions)
  );

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-white border-r border-slate-200 min-h-screen">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-brand-600 grid place-items-center text-white font-bold shadow-soft">B</div>
        <div>
          <div className="text-base font-bold text-slate-800 leading-tight">BilyVet</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Gestao Veterinaria</div>
        </div>
      </div>
      <nav className="p-3 overflow-y-auto flex-1">
        {/* Favoritos / Fixados */}
        {pinnedItems.length > 0 && (
          <div className="mb-4 bg-brand-50/30 rounded-xl p-1.5 border border-brand-100/50">
            <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Pin className="h-3 w-3 rotate-45 fill-brand-600 text-brand-600" /> Fixados
            </div>
            <ul className="space-y-0.5">
              {pinnedItems.map((it) => {
                const active = pathname === it.href || pathname.startsWith(it.href + "/");
                const Icon = it.icon;
                return (
                  <li key={`pinned-${it.href}`} className="group relative">
                    <Link
                      href={it.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm",
                        active ? "bg-brand-100 text-brand-800 font-medium" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-brand-600" : "text-slate-500")} />
                      <span className="truncate pr-5">{it.label}</span>
                      <button
                        onClick={(e) => togglePin(it.href, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-red-500 transition-opacity"
                        title="Desafixar"
                      >
                        <PinOff className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Grupos Gerais */}
        {groups.map((g) => {
          const visibleItems = g.items.filter((it) => canAccess(it.module, role, permissions));
          if (visibleItems.length === 0) return null;
          return (
            <div key={g.title} className="mb-4">
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{g.title}</div>
              <ul className="space-y-0.5">
                {visibleItems.map((it) => {
                  const active = pathname === it.href || pathname.startsWith(it.href + "/");
                  const Icon = it.icon;
                  const isPinned = pinnedHrefs.includes(it.href);
                  return (
                    <li key={it.href} className="group/item relative">
                      <Link
                        href={it.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm",
                          active ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "text-brand-600" : "text-slate-500")} />
                        <span className="truncate pr-5">{it.label}</span>
                        <button
                          onClick={(e) => togglePin(it.href, e)}
                          className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-0.5 rounded transition-opacity",
                            isPinned ? "text-brand-600 text-brand-600 hover:text-red-500" : "text-slate-400 hover:text-brand-600"
                          )}
                          title={isPinned ? "Desafixar" : "Fixar no topo"}
                        >
                          <Pin className={cn("h-3.5 w-3.5", isPinned ? "rotate-45 fill-brand-600" : "")} />
                        </button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
