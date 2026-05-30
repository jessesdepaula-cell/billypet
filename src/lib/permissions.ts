// Permissoes por modulo e perfil.
// Cada modulo lista quais roles tem acesso por PADRAO. ADMIN sempre tem acesso total.
// User pode ter campo permissions (JSON array) que SOBRESCREVE o padrao do role.

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "GESTOR"
  | "VETERINARIO"
  | "RECEPCAO"
  | "FINANCEIRO"
  | "ESTOQUE"
  | "BANHO_TOSA"
  | "VENDEDOR";

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Administrador (Dono BilyVet)",
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  VETERINARIO: "Veterinario",
  RECEPCAO: "Recepcao/Atendimento",
  FINANCEIRO: "Financeiro",
  ESTOQUE: "Estoque",
  BANHO_TOSA: "Banho e Tosa",
  VENDEDOR: "Vendedor",
};

export const MODULE_PERMISSIONS: Record<string, Role[]> = {
  dashboard:       ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO", "FINANCEIRO", "ESTOQUE", "BANHO_TOSA", "VENDEDOR"],
  tutores:         ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO", "VENDEDOR", "BANHO_TOSA"],
  pets:            ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO", "VENDEDOR", "BANHO_TOSA"],
  agenda:          ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO", "BANHO_TOSA"],
  atendimento:     ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO"],
  esteira:         ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO", "BANHO_TOSA"],
  internacao:      ["ADMIN", "GESTOR", "VETERINARIO"],
  exames:          ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO"],
  vendas:          ["ADMIN", "GESTOR", "VENDEDOR", "RECEPCAO"],
  pacotes:         ["ADMIN", "GESTOR", "RECEPCAO", "VENDEDOR", "BANHO_TOSA"],
  fidelidade:      ["ADMIN", "GESTOR", "RECEPCAO", "VENDEDOR"],
  financeiro:      ["ADMIN", "GESTOR", "FINANCEIRO"],
  caixa:           ["ADMIN", "GESTOR", "FINANCEIRO", "RECEPCAO"],
  "contas-pagar":  ["ADMIN", "GESTOR", "FINANCEIRO"],
  "contas-receber":["ADMIN", "GESTOR", "FINANCEIRO"],
  estoque:         ["ADMIN", "GESTOR", "ESTOQUE"],
  produtos:        ["ADMIN", "GESTOR", "ESTOQUE"],
  transferencias:  ["ADMIN", "GESTOR", "ESTOQUE"],
  inventario:      ["ADMIN", "GESTOR", "ESTOQUE"],
  relatorios:      ["ADMIN", "GESTOR", "FINANCEIRO"],
  usuarios:        ["ADMIN"],
  unidades:        ["ADMIN", "GESTOR"],
  configuracoes:   ["ADMIN", "GESTOR"],
  suporte:         ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO", "FINANCEIRO", "ESTOQUE", "BANHO_TOSA", "VENDEDOR"],
  tutorial:        ["ADMIN", "GESTOR", "VETERINARIO", "RECEPCAO", "FINANCEIRO", "ESTOQUE", "BANHO_TOSA", "VENDEDOR"],
  "super-admin":   ["SUPER_ADMIN"],
};

// Modulos agrupados para apresentacao na UI de permissoes
export const MODULE_GROUPS: { group: string; modules: { slug: string; label: string }[] }[] = [
  { group: "Geral", modules: [
    { slug: "dashboard", label: "Dashboard" },
    { slug: "tutorial", label: "Tutoriais" },
  ]},
  { group: "Cadastros", modules: [
    { slug: "tutores", label: "Tutores" },
    { slug: "pets", label: "Pets" },
    { slug: "produtos", label: "Produtos" },
  ]},
  { group: "Atendimento", modules: [
    { slug: "agenda", label: "Agenda" },
    { slug: "atendimento", label: "Atendimento" },
    { slug: "esteira", label: "Esteira" },
    { slug: "internacao", label: "Internacao" },
    { slug: "exames", label: "Exames" },
  ]},
  { group: "Comercial", modules: [
    { slug: "vendas", label: "Vendas / PDV" },
    { slug: "pacotes", label: "Pacotes" },
    { slug: "fidelidade", label: "Fidelidade" },
  ]},
  { group: "Financeiro", modules: [
    { slug: "financeiro", label: "Visao geral" },
    { slug: "caixa", label: "Caixa diario" },
    { slug: "contas-receber", label: "Contas a receber" },
    { slug: "contas-pagar", label: "Contas a pagar" },
  ]},
  { group: "Estoque", modules: [
    { slug: "estoque", label: "Movimentacoes" },
    { slug: "transferencias", label: "Transferencias" },
    { slug: "inventario", label: "Inventario" },
  ]},
  { group: "Gestao", modules: [
    { slug: "relatorios", label: "Relatorios" },
    { slug: "unidades", label: "Unidades" },
    { slug: "usuarios", label: "Usuarios e permissoes" },
    { slug: "configuracoes", label: "Cadastros" },
    { slug: "suporte", label: "Suporte" },
  ]},
];

export const ALL_MODULE_SLUGS: string[] = MODULE_GROUPS.flatMap((g) => g.modules.map((m) => m.slug));

// Parse seguro do campo permissions (vem do banco como string JSON ou da session como string[])
export function parsePermissions(raw: unknown): string[] | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((x: any): x is string => typeof x === "string");
    } catch {
      return null;
    }
  }
  return null;
}

// Modulos liberados por padrao para um role (ADMIN tem tudo exceto super-admin)
export function defaultPermissionsForRole(role: string): string[] {
  if (role === "SUPER_ADMIN") return ["super-admin"];
  return ALL_MODULE_SLUGS.filter((slug) => {
    if (role === "ADMIN") return slug !== "super-admin";
    const allowed = MODULE_PERMISSIONS[slug];
    return !!allowed && (allowed as string[]).includes(role);
  });
}

// Resolve permissoes efetivas: se user tem permissions custom usa, senao usa o padrao do role
export function effectivePermissions(role: string, customPermissions?: string[] | null): string[] {
  if (customPermissions && customPermissions.length > 0) {
    // ADMIN nao pode ter custom (sempre tem tudo). SUPER_ADMIN tambem nao.
    if (role === "ADMIN") return defaultPermissionsForRole(role);
    if (role === "SUPER_ADMIN") return defaultPermissionsForRole(role);
    return customPermissions;
  }
  return defaultPermissionsForRole(role);
}

// Checa acesso a um modulo. Aceita permissions custom opcionais.
export function canAccess(module: string, role?: string | null, customPermissions?: string[] | null) {
  if (!role) return false;
  if (role === "SUPER_ADMIN") return true;
  if (role === "ADMIN") return module !== "super-admin";
  const effective = effectivePermissions(role, customPermissions);
  return effective.includes(module);
}

export function isSuperAdmin(role?: string | null) {
  return role === "SUPER_ADMIN";
}
