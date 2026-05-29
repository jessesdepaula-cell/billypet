// Permissoes por modulo e perfil.
// Cada modulo lista quais roles tem acesso. ADMIN sempre tem acesso total.

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

export function canAccess(module: string, role?: string | null) {
  if (!role) return false;
  if (role === "SUPER_ADMIN") return true;
  if (role === "ADMIN") return module !== "super-admin";
  const allowed = MODULE_PERMISSIONS[module];
  return !!allowed && (allowed as string[]).includes(role);
}

export function isSuperAdmin(role?: string | null) {
  return role === "SUPER_ADMIN";
}
