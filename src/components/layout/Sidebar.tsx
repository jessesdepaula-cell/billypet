"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { canAccess, type Role } from "@/lib/permissions";
import {
  LayoutDashboard, Users, PawPrint, CalendarDays, Stethoscope, KanbanSquare, BedDouble,
  FlaskConical, ShoppingCart, PackageOpen, Wallet, ArrowRightLeft, ClipboardList,
  PiggyBank, FileText, Receipt, ListChecks, GiftIcon, ScrollText, LifeBuoy, Settings,
  Building2, UserCog, BarChart3, Boxes, Crown, GraduationCap, CreditCard, MessageSquare, Bot,
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
      { href: "/agenda",                 label: "Agenda",               module: "agenda",      icon: CalendarDays },
      { href: "/atendimento",            label: "Atendimento",          module: "atendimento", icon: Stethoscope },
      { href: "/atendimento/chat",       label: "Bate-papo WhatsApp",    module: "atendimento", icon: MessageSquare },
      { href: "/configuracoes/whatsapp", label: "Conexão WhatsApp & IA", module: "atendimento", icon: Bot },
      { href: "/esteira",                label: "Esteira",              module: "esteira",     icon: KanbanSquare },
      { href: "/internacao",             label: "Internacao",           module: "internacao",  icon: BedDouble },
      { href: "/exames",                 label: "Exames",               module: "exames",      icon: FlaskConical },
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
      { href: "/relatorios",    label: "Relatorios", module: "relatorios",    icon: BarChart3 },
      { href: "/unidades",      label: "Unidades",   module: "unidades",      icon: Building2 },
      { href: "/usuarios",      label: "Usuarios",   module: "usuarios",      icon: UserCog },
      { href: "/configuracoes", label: "Cadastros",  module: "configuracoes", icon: Settings },
      { href: "/assinatura",    label: "Assinatura", module: "assinatura",    icon: CreditCard },
      { href: "/suporte",       label: "Suporte",    module: "suporte",       icon: LifeBuoy },
    ],
  },
];

export function Sidebar({ role, permissions }: { role: Role; permissions?: string[] | null }) {
  const pathname = usePathname();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("billypet_favs");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error("Erro ao carregar favoritos");
      }
    }
  }, []);

  function toggleFavorite(href: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(href) ? prev.filter((x) => x !== href) : [...prev, href];
      localStorage.setItem("billypet_favs", JSON.stringify(next));
      return next;
    });
  }

  // Filtra itens fixados e válidos para o usuário
  const allItems = groups.flatMap((g) => g.items);
  const visibleFavs = allItems.filter(
    (it) => favorites.includes(it.href) && canAccess(it.module, role, permissions)
  );

  function isItemActive(itemHref: string) {
    if (pathname === itemHref) return true;
    if (!pathname.startsWith(itemHref + "/")) return false;
    const hasMoreSpecificMatch = allItems.some(
      (other) =>
        other.href !== itemHref &&
        other.href.startsWith(itemHref + "/") &&
        (pathname === other.href || pathname.startsWith(other.href + "/"))
    );
    return !hasMoreSpecificMatch;
  }

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col bg-white border-r border-slate-200 h-screen overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="BilyVet" className="h-9 w-auto" />
      </div>
      <nav className="p-3 overflow-y-auto flex-1">
        {/* Seção de favoritos / itens fixados no topo */}
        {visibleFavs.length > 0 && (
          <div className="mb-4 bg-slate-50/50 p-2 rounded-xl border border-slate-150">
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-650 flex items-center gap-1">
              <span>★ Atalhos Fixados</span>
            </div>
            <ul className="space-y-0.5">
              {visibleFavs.map((it) => {
                const active = isItemActive(it.href);
                const Icon = it.icon;
                return (
                  <li key={it.href} className="group/item relative">
                    <Link
                      href={it.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors pr-8",
                        active ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-700 hover:bg-slate-150"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-600" : "text-slate-500")} />
                      <span className="truncate">{it.label}</span>
                    </Link>
                    <button
                      onClick={(e) => toggleFavorite(it.href, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 p-1 opacity-80 hover:opacity-100 text-[10px]"
                      title="Desafixar atalho"
                    >
                      ★
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Grupos de navegação padrão */}
        {groups.map((g) => {
          const visibleItems = g.items.filter((it) => canAccess(it.module, role, permissions));
          if (visibleItems.length === 0) return null;
          return (
            <div key={g.title} className="mb-4">
              <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{g.title}</div>
              <ul className="space-y-0.5">
                {visibleItems.map((it) => {
                  const active = isItemActive(it.href);
                  const Icon = it.icon;
                  const isFav = favorites.includes(it.href);
                  return (
                    <li key={it.href} className="group/item relative">
                      <Link
                        href={it.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors pr-8",
                          active ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-600" : "text-slate-500")} />
                        <span className="truncate">{it.label}</span>
                      </Link>
                      <button
                        onClick={(e) => toggleFavorite(it.href, e)}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 transition-all p-1 text-[10px]",
                          isFav
                            ? "text-amber-550 opacity-100"
                            : "text-slate-350 hover:text-amber-400 opacity-0 group-hover/item:opacity-100"
                        )}
                        title={isFav ? "Desafixar atalho" : "Fixar atalho no topo"}
                      >
                        ★
                      </button>
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
