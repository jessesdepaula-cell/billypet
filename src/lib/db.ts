import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["error", "warn"] });

// Reutiliza a mesma instancia entre invocacoes (inclusive em serverless/prod) para
// nao esgotar as conexoes do Postgres/Supabase sob carga.
globalForPrisma.prisma = prisma;
