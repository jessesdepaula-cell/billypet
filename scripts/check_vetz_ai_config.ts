import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkVetzAi() {
  const tenantId = "cmppxb85v00047xcs89wrh1wl"; // VETZ
  const conn = await prisma.whatsappConnection.findFirst({
    where: { tenantId }
  });

  console.log("VETZ Connection Settings:", JSON.stringify(conn, null, 2));
}

checkVetzAi().catch(console.error).finally(() => prisma.$disconnect());
