// Seed minimo: garante apenas o SUPER_ADMIN.
// Cada tenant criado em /super-admin/clientes/novo recebe Unit + PaymentMethods + Categorias default.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureSuperAdmin() {
  const email = "jessesdepaula@gmail.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = bcrypt.hashSync("je98871688", 10);
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: "SUPER_ADMIN", isActive: true, name: existing.name || "Jesse de Paula" },
    });
    console.log("Super admin atualizado:", email);
  } else {
    await prisma.user.create({
      data: { name: "Jesse de Paula", email, passwordHash, role: "SUPER_ADMIN", isActive: true },
    });
    console.log("Super admin criado:", email);
  }
}

async function main() {
  await ensureSuperAdmin();
  console.log("Seed concluido (apenas SUPER_ADMIN).");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
