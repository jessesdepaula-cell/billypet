import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./auth";
import { prisma } from "./db";
import { canAccess } from "./permissions";

export type TenantContext = {
  session: SessionUser;
  tenantId: string;
  unitId: string; // primeira unit ativa - usado como default em criacoes/queries
};

// Para uso em paginas/server actions (executa redirect se nao tiver tenant)
export async function requireTenant(): Promise<TenantContext> {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "SUPER_ADMIN") {
    // SUPER_ADMIN nao tem dados operacionais proprios - vai pro painel super-admin
    redirect("/super-admin");
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    // Usuario sem tenant - desloga
    redirect("/login");
  }

  // Pega primeira unit ativa do tenant (cria uma "Matriz" caso nao exista)
  let unit = await prisma.unit.findFirst({
    where: { tenantId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!unit) {
    unit = await prisma.unit.create({
      data: { tenantId, name: "Matriz" },
    });
  }

  return { session, tenantId, unitId: unit.id };
}

// Para uso em API routes (lanca erro tratavel)
export async function requireTenantApi(): Promise<TenantContext | { error: string; status: number }> {
  const session = await getSession();
  if (!session) return { error: "Nao autenticado", status: 401 };
  if (session.role === "SUPER_ADMIN") return { error: "Acao indisponivel para SUPER_ADMIN", status: 403 };
  const tenantId = session.tenantId;
  if (!tenantId) return { error: "Usuario sem tenant", status: 403 };

  let unit = await prisma.unit.findFirst({
    where: { tenantId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!unit) {
    unit = await prisma.unit.create({ data: { tenantId, name: "Matriz" } });
  }
  return { session, tenantId, unitId: unit.id };
}

export function isTenantError(x: any): x is { error: string; status: number } {
  return x && typeof x === "object" && "error" in x && "status" in x;
}

// Modulos sempre liberados mesmo quando o tenant esta suspenso/cancelado
// (precisa permitir o cliente pagar/contatar suporte para reativar)
const BLOCK_BYPASS_MODULES = new Set(["assinatura", "suporte", "tutorial"]);

// Combina requireTenant + checagem de modulo + bloqueio por inadimplencia.
export async function requireModule(moduleSlug: string): Promise<TenantContext> {
  const ctx = await requireTenant();
  if (!canAccess(moduleSlug, ctx.session.role, ctx.session.permissions ?? null)) {
    redirect("/dashboard");
  }
  // Bloqueio por status do tenant: SUSPENDED ou CANCELED so podem acessar
  // assinatura / suporte / tutorial. ADMIN tambem e bloqueado (precisa pagar).
  if (!BLOCK_BYPASS_MODULES.has(moduleSlug)) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: { status: true },
    });
    if (tenant && (tenant.status === "SUSPENDED" || tenant.status === "CANCELED")) {
      redirect("/assinatura?bloqueado=1");
    }
  }
  return ctx;
}
