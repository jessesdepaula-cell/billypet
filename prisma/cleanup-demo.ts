// Script de emergencia: limpa todos os dados demo do banco
// Preserva: SUPER_ADMIN, Tenants criados, Users com tenantId, Subscriptions, Payments de assinatura
// Roda 1x via: npx tsx prisma/cleanup-demo.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("== Limpeza de dados demo ==");

  // FK order matters
  console.log("Apagando dependencias operacionais...");
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.document.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.commissionRule.deleteMany();
  await prisma.packageUsage.deleteMany();
  await prisma.servicePackageItem.deleteMany();
  await prisma.servicePackage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.cashRegister.deleteMany();
  await prisma.accountPayable.deleteMany();
  await prisma.accountReceivable.deleteMany();
  await prisma.hospitalizationEvolution.deleteMany();
  await prisma.hospitalization.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.vaccine.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.kitItem.deleteMany();
  await prisma.kit.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.service.deleteMany();
  await prisma.cardMachine.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.tutor.deleteMany();

  console.log("Apagando usuarios demo (sem tenantId e nao SUPER_ADMIN)...");
  const demoUsers = await prisma.user.deleteMany({
    where: { role: { not: "SUPER_ADMIN" }, tenantId: null },
  });
  console.log(`  ${demoUsers.count} usuarios demo apagados`);

  console.log("Apagando unidades demo (sem nenhum tenant atrelado)...");
  // Como Unit nao tem tenantId ainda, apaga todas - serao recriadas por tenant
  await prisma.unit.deleteMany();

  const ten = await prisma.tenant.count();
  const usr = await prisma.user.count();
  console.log(`\nResumo: ${ten} tenants, ${usr} usuarios preservados.`);
  console.log("Limpeza concluida.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
