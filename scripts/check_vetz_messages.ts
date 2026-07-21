import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkMessages() {
  const tenantId = "cmppxb85v00047xcs89wrh1wl"; // VETZ
  console.log(`Checking all WhatsApp messages for VETZ tenant (${tenantId})...`);

  const msgs = await prisma.whatsappMessage.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });

  console.log(`Total messages in VETZ: ${msgs.length}`);
  for (const m of msgs) {
    console.log(`[${m.direction}] (${m.actor}) Phone: ${m.phone} | Content: ${m.content} | At: ${m.createdAt.toISOString()}`);
  }
}

checkMessages().catch(console.error).finally(() => prisma.$disconnect());
