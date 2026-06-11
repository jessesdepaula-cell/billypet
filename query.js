const { PrismaClient } = require("./node_modules/@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { contains: "vetz" } },
    include: { tenant: { include: { subscriptions: { include: { payments: true } } } } }
  });

  if (!user) {
    console.log("User not found");
    const tenant = await prisma.tenant.findFirst({
      where: { email: { contains: "vetz" } },
      include: { subscriptions: { include: { payments: true } } }
    });
    console.log("Tenant search:", JSON.stringify(tenant, null, 2));
  } else {
    console.log("User found:", user.email);
    console.log("Tenant:", JSON.stringify(user.tenant, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
