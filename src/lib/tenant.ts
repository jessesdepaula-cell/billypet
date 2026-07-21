import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./auth";
import { prisma } from "./db";
import { canAccess } from "./permissions";

export type TenantContext = {
  session: SessionUser;
  tenantId: string;
  unitId: string; // primeira unit ativa - usado como default em criacoes/queries
};

/** Garante ou cria o tenant exclusivo do Super Admin caso nao esteja definido */
async function resolveAdminTenant(userId: string): Promise<string> {
  let adminTenant = await prisma.tenant.findFirst({
    where: { companyName: "BilyVet Admin & Plataforma" },
    select: { id: true },
  });

  if (!adminTenant) {
    adminTenant = await prisma.tenant.create({
      data: {
        companyName: "BilyVet Admin & Plataforma",
        tradeName: "BilyVet Matriz",
        email: "admin@bilyvet.com.br",
        status: "ACTIVE",
      },
      select: { id: true },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { tenantId: adminTenant.id },
  }).catch(() => {});

  return adminTenant.id;
}

// Para uso em paginas/server actions (executa redirect se nao tiver tenant)
export async function requireTenant(): Promise<TenantContext> {
  const session = await getSession();
  if (!session) redirect("/login");

  let tenantId = session.tenantId;

  // Se o SUPER_ADMIN nao tiver tenantId na sessao, garante o tenant exclusivo da plataforma BilyVet
  if (!tenantId && session.role === "SUPER_ADMIN") {
    tenantId = await resolveAdminTenant(session.id);
  }

  if (!tenantId) {
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

  let tenantId = session.tenantId;

  if (!tenantId && session.role === "SUPER_ADMIN") {
    tenantId = await resolveAdminTenant(session.id);
  }

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
const BLOCK_BYPASS_MODULES = new Set(["assinatura", "suporte", "tutorial"]);

// Combina requireTenant + checagem de modulo + bloqueio por inadimplencia.
export async function requireModule(moduleSlug: string): Promise<TenantContext> {
  const ctx = await requireTenant();
  if (!canAccess(moduleSlug, ctx.session.role, ctx.session.permissions ?? null)) {
    redirect("/dashboard");
  }
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
