import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(d: number) {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x;
}
function daysAhead(d: number) {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x;
}
function todayAt(h: number, m = 0) {
  const x = new Date();
  x.setHours(h, m, 0, 0);
  return x;
}

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0 && process.env.FORCE_SEED !== "1") {
    console.log(`Banco ja possui ${existingUsers} usuarios. Pulando seed. Use FORCE_SEED=1 para forcar.`);
    return;
  }
  console.log("Limpando dados antigos...");
  // Order matters for FK
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
  await prisma.user.deleteMany();
  await prisma.unit.deleteMany();

  console.log("Criando unidades...");
  const unitMatriz = await prisma.unit.create({
    data: {
      name: "BillyPet Matriz",
      cnpj: "12.345.678/0001-90",
      phone: "(11) 4000-1000",
      address: "Av. Paulista, 1000 - Sao Paulo, SP",
    },
  });
  const unitFilial = await prisma.unit.create({
    data: {
      name: "BillyPet Filial Zona Sul",
      cnpj: "12.345.678/0002-71",
      phone: "(11) 4000-2000",
      address: "Av. Santo Amaro, 2500 - Sao Paulo, SP",
    },
  });

  console.log("Criando usuarios...");
  const hash = (p: string) => bcrypt.hashSync(p, 10);
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Administrador", email: "admin@billypet.com", passwordHash: hash("admin123"), role: "ADMIN", unitId: unitMatriz.id } }),
    prisma.user.create({ data: { name: "Carla Gestora", email: "gestor@billypet.com", passwordHash: hash("123456"), role: "GESTOR", unitId: unitMatriz.id } }),
    prisma.user.create({ data: { name: "Dr. Marcos Vet", email: "vet@billypet.com", passwordHash: hash("123456"), role: "VETERINARIO", unitId: unitMatriz.id } }),
    prisma.user.create({ data: { name: "Dra. Ana Vet", email: "ana@billypet.com", passwordHash: hash("123456"), role: "VETERINARIO", unitId: unitFilial.id } }),
    prisma.user.create({ data: { name: "Joana Recepcao", email: "recepcao@billypet.com", passwordHash: hash("123456"), role: "RECEPCAO", unitId: unitMatriz.id } }),
    prisma.user.create({ data: { name: "Paulo Financeiro", email: "financeiro@billypet.com", passwordHash: hash("123456"), role: "FINANCEIRO", unitId: unitMatriz.id } }),
    prisma.user.create({ data: { name: "Bruna Estoque", email: "estoque@billypet.com", passwordHash: hash("123456"), role: "ESTOQUE", unitId: unitMatriz.id } }),
    prisma.user.create({ data: { name: "Tiago Tosador", email: "banhotosa@billypet.com", passwordHash: hash("123456"), role: "BANHO_TOSA", unitId: unitMatriz.id } }),
    prisma.user.create({ data: { name: "Renata Vendedora", email: "vendedor@billypet.com", passwordHash: hash("123456"), role: "VENDEDOR", unitId: unitMatriz.id } }),
  ]);
  const vetMarcos = users[2];
  const seller = users[8];

  console.log("Criando tutores e pets...");
  const tutorsData = [
    { name: "Maria Silva", document: "111.222.333-44", phone: "(11) 98765-4321", whatsapp: "(11) 98765-4321", email: "maria@email.com", address: "R. das Flores, 100", points: 250 },
    { name: "Joao Souza", document: "222.333.444-55", phone: "(11) 97654-3210", whatsapp: "(11) 97654-3210", email: "joao@email.com", address: "R. dos Pinhais, 55", points: 80 },
    { name: "Ana Pereira", document: "333.444.555-66", phone: "(11) 96543-2109", whatsapp: "(11) 96543-2109", email: "ana.p@email.com", address: "Av. Brasil, 1200", points: 410 },
    { name: "Carlos Lima", document: "444.555.666-77", phone: "(11) 95432-1098", whatsapp: "(11) 95432-1098", email: "carlos@email.com", address: "R. Santa Rita, 80", points: 30 },
    { name: "Beatriz Costa", document: "555.666.777-88", phone: "(11) 94321-0987", whatsapp: "(11) 94321-0987", email: "bia@email.com", address: "R. Verbena, 14", points: 180 },
    { name: "Roberto Alves", document: "666.777.888-99", phone: "(11) 93210-9876", whatsapp: "(11) 93210-9876", email: "roberto@email.com", address: "Av. Sao Joao, 900", points: 0 },
  ];
  const tutors = [];
  for (const t of tutorsData) {
    tutors.push(await prisma.tutor.create({
      data: {
        name: t.name, document: t.document, phone: t.phone, whatsapp: t.whatsapp,
        email: t.email, address: t.address, loyaltyPoints: t.points,
      },
    }));
  }

  const petsData = [
    { tutorIdx: 0, name: "Thor", species: "Cao", breed: "Labrador", sex: "M", weightKg: 28, color: "Caramelo", birthDate: daysAgo(365 * 3) },
    { tutorIdx: 0, name: "Mia", species: "Gato", breed: "SRD", sex: "F", weightKg: 4.2, color: "Preta", birthDate: daysAgo(365 * 5) },
    { tutorIdx: 1, name: "Bidu", species: "Cao", breed: "Poodle", sex: "M", weightKg: 8, color: "Branco", birthDate: daysAgo(365 * 6) },
    { tutorIdx: 2, name: "Luna", species: "Cao", breed: "Golden Retriever", sex: "F", weightKg: 32, color: "Dourado", birthDate: daysAgo(365 * 2) },
    { tutorIdx: 2, name: "Nina", species: "Gato", breed: "Persa", sex: "F", weightKg: 3.8, color: "Cinza", birthDate: daysAgo(365 * 4) },
    { tutorIdx: 3, name: "Rex", species: "Cao", breed: "Pastor Alemao", sex: "M", weightKg: 35, color: "Preto e marrom", birthDate: daysAgo(365 * 7) },
    { tutorIdx: 4, name: "Belinha", species: "Cao", breed: "Shih Tzu", sex: "F", weightKg: 6, color: "Bege", birthDate: daysAgo(365 * 1) },
    { tutorIdx: 5, name: "Frajola", species: "Gato", breed: "SRD", sex: "M", weightKg: 5.1, color: "Preto e branco", birthDate: daysAgo(365 * 8) },
  ];
  const pets = [];
  for (const p of petsData) {
    const { tutorIdx, ...petFields } = p;
    pets.push(await prisma.pet.create({
      data: { ...petFields, tutorId: tutors[tutorIdx].id, medicalAlert: p.name === "Rex" ? "Alergico a dipirona" : undefined },
    }));
  }

  console.log("Criando categorias, fornecedores e produtos...");
  const catRacao = await prisma.productCategory.create({ data: { name: "Racao" } });
  const catMed = await prisma.productCategory.create({ data: { name: "Medicamento" } });
  const catAcess = await prisma.productCategory.create({ data: { name: "Acessorio" } });
  const catHig = await prisma.productCategory.create({ data: { name: "Higiene" } });

  const supRoyal = await prisma.supplier.create({ data: { name: "Royal Pet Distribuidora", document: "12.345.678/0001-00", phone: "(11) 3000-1000" } });
  const supVet = await prisma.supplier.create({ data: { name: "VetPharma S/A", document: "98.765.432/0001-00", phone: "(11) 3000-2000" } });
  const supBrinq = await prisma.supplier.create({ data: { name: "PetBrinq Comercio", document: "55.444.333/0001-00", phone: "(11) 3000-3000" } });

  const products = await Promise.all([
    prisma.product.create({ data: { name: "Racao Premium Caes Adultos 15kg", sku: "RAC-001", barcode: "7891234567890", brand: "Royal", categoryId: catRacao.id, supplierId: supRoyal.id, costPrice: 180, salePrice: 289.9, minStock: 10, unit: "UN" } }),
    prisma.product.create({ data: { name: "Racao Filhotes Caes 3kg", sku: "RAC-002", brand: "Royal", categoryId: catRacao.id, supplierId: supRoyal.id, costPrice: 60, salePrice: 99.9, minStock: 8, unit: "UN" } }),
    prisma.product.create({ data: { name: "Racao Gatos Castrados 1.5kg", sku: "RAC-003", brand: "Royal", categoryId: catRacao.id, supplierId: supRoyal.id, costPrice: 38, salePrice: 69.9, minStock: 12, unit: "UN" } }),
    prisma.product.create({ data: { name: "Anti-pulgas Spot On Caes M", sku: "MED-001", brand: "VetCare", categoryId: catMed.id, supplierId: supVet.id, costPrice: 32, salePrice: 79.9, minStock: 15, unit: "UN", controlByLot: true } }),
    prisma.product.create({ data: { name: "Vermifugo Multi 4 comprimidos", sku: "MED-002", brand: "VetCare", categoryId: catMed.id, supplierId: supVet.id, costPrice: 22, salePrice: 49.9, minStock: 20, unit: "CX", controlByLot: true } }),
    prisma.product.create({ data: { name: "Shampoo Neutro 500ml", sku: "HIG-001", brand: "PetClean", categoryId: catHig.id, supplierId: supBrinq.id, costPrice: 12, salePrice: 29.9, minStock: 10, unit: "UN" } }),
    prisma.product.create({ data: { name: "Coleira Antipulgas P", sku: "ACE-001", brand: "PetSafe", categoryId: catAcess.id, supplierId: supBrinq.id, costPrice: 28, salePrice: 69.9, minStock: 5, unit: "UN" } }),
    prisma.product.create({ data: { name: "Brinquedo Mordedor", sku: "ACE-002", brand: "PetSafe", categoryId: catAcess.id, supplierId: supBrinq.id, costPrice: 8, salePrice: 24.9, minStock: 4, unit: "UN" } }),
  ]);

  console.log("Criando estoque inicial...");
  for (const p of products) {
    await prisma.stock.create({ data: { productId: p.id, unitId: unitMatriz.id, quantity: Math.max(2, Math.floor(Math.random() * 30)) } });
    await prisma.stock.create({ data: { productId: p.id, unitId: unitFilial.id, quantity: Math.max(0, Math.floor(Math.random() * 20)) } });
  }
  // produto com estoque baixo proposital
  await prisma.stock.update({
    where: { productId_unitId_lot: { productId: products[3].id, unitId: unitMatriz.id, lot: null as any } },
    data: { quantity: 3, expiresAt: daysAhead(20) },
  }).catch(() => {});
  await prisma.stock.update({
    where: { productId_unitId_lot: { productId: products[4].id, unitId: unitMatriz.id, lot: null as any } },
    data: { quantity: 6, expiresAt: daysAhead(45) },
  }).catch(() => {});

  console.log("Criando servicos...");
  const services = await Promise.all([
    prisma.service.create({ data: { name: "Consulta Clinica Geral", category: "Consulta", durationMinutes: 30, price: 150, commissionPct: 30 } }),
    prisma.service.create({ data: { name: "Consulta de Retorno", category: "Consulta", durationMinutes: 20, price: 80, commissionPct: 25 } }),
    prisma.service.create({ data: { name: "Vacina V8/V10", category: "Vacina", durationMinutes: 15, price: 95, commissionPct: 15 } }),
    prisma.service.create({ data: { name: "Vacina Antirrabica", category: "Vacina", durationMinutes: 15, price: 75, commissionPct: 15 } }),
    prisma.service.create({ data: { name: "Banho Porte P", category: "Banho", durationMinutes: 45, price: 60, commissionPct: 30 } }),
    prisma.service.create({ data: { name: "Banho Porte M", category: "Banho", durationMinutes: 60, price: 80, commissionPct: 30 } }),
    prisma.service.create({ data: { name: "Banho Porte G", category: "Banho", durationMinutes: 75, price: 110, commissionPct: 30 } }),
    prisma.service.create({ data: { name: "Tosa Higienica", category: "Tosa", durationMinutes: 30, price: 50, commissionPct: 30 } }),
    prisma.service.create({ data: { name: "Tosa Completa", category: "Tosa", durationMinutes: 90, price: 120, commissionPct: 30 } }),
    prisma.service.create({ data: { name: "Hemograma Completo", category: "Exame", durationMinutes: 30, price: 95, commissionPct: 10 } }),
    prisma.service.create({ data: { name: "Cirurgia de Castracao", category: "Cirurgia", durationMinutes: 120, price: 650, commissionPct: 40 } }),
  ]);

  console.log("Criando formas de pagamento e maquinas...");
  await prisma.paymentMethod.createMany({
    data: [
      { name: "Dinheiro", type: "DINHEIRO" },
      { name: "Pix", type: "PIX" },
      { name: "Cartao Credito", type: "CREDITO" },
      { name: "Cartao Debito", type: "DEBITO" },
      { name: "Convenio Pet", type: "CONVENIO" },
      { name: "Pagamento Antecipado", type: "ANTECIPADO" },
    ],
  });
  await prisma.cardMachine.createMany({
    data: [
      { name: "Stone 01", operator: "Stone", debitFee: 1.5, creditFee: 3.2, receivingDays: 30 },
      { name: "Cielo 01", operator: "Cielo", debitFee: 1.6, creditFee: 3.5, receivingDays: 30 },
    ],
  });

  console.log("Criando agenda do dia e proximos...");
  // hoje
  await prisma.appointment.create({
    data: {
      unitId: unitMatriz.id, tutorId: tutors[0].id, petId: pets[0].id, vetId: vetMarcos.id,
      scheduledAt: todayAt(9, 0), type: "CONSULTA", status: "CONFIRMADO", pipelineStage: "RECEPCAO",
      services: { create: [{ serviceId: services[0].id, price: services[0].price }] },
    },
  });
  await prisma.appointment.create({
    data: {
      unitId: unitMatriz.id, tutorId: tutors[2].id, petId: pets[3].id, vetId: vetMarcos.id,
      scheduledAt: todayAt(10, 30), type: "CONSULTA", status: "EM_ATENDIMENTO", pipelineStage: "EM_CONSULTA",
      services: { create: [{ serviceId: services[0].id, price: services[0].price }] },
    },
  });
  await prisma.appointment.create({
    data: {
      unitId: unitMatriz.id, tutorId: tutors[4].id, petId: pets[6].id,
      scheduledAt: todayAt(11, 0), type: "BANHO_TOSA", status: "AGENDADO", pipelineStage: "AGUARDANDO",
      services: { create: [{ serviceId: services[5].id, price: services[5].price }, { serviceId: services[7].id, price: services[7].price }] },
    },
  });
  await prisma.appointment.create({
    data: {
      unitId: unitMatriz.id, tutorId: tutors[1].id, petId: pets[2].id, vetId: vetMarcos.id,
      scheduledAt: todayAt(14, 0), type: "RETORNO", status: "AGENDADO", pipelineStage: "AGUARDANDO",
      services: { create: [{ serviceId: services[1].id, price: services[1].price }] },
    },
  });
  await prisma.appointment.create({
    data: {
      unitId: unitMatriz.id, tutorId: tutors[5].id, petId: pets[7].id,
      scheduledAt: todayAt(15, 30), type: "BANHO_TOSA", status: "FINALIZADO", pipelineStage: "FINALIZADO",
      services: { create: [{ serviceId: services[4].id, price: services[4].price }] },
    },
  });
  // proximos dias
  for (let i = 1; i <= 6; i++) {
    await prisma.appointment.create({
      data: {
        unitId: unitMatriz.id, tutorId: tutors[i % tutors.length].id, petId: pets[i % pets.length].id, vetId: vetMarcos.id,
        scheduledAt: daysAhead(i), type: i % 2 === 0 ? "CONSULTA" : "BANHO_TOSA", status: "AGENDADO", pipelineStage: "AGUARDANDO",
        services: { create: [{ serviceId: services[(i + 4) % services.length].id, price: services[(i + 4) % services.length].price }] },
      },
    });
  }

  console.log("Criando vacinas e exames...");
  await prisma.vaccine.create({ data: { petId: pets[0].id, name: "V10", appliedAt: daysAgo(330), nextDose: daysAhead(35) } });
  await prisma.vaccine.create({ data: { petId: pets[0].id, name: "Antirrabica", appliedAt: daysAgo(330), nextDose: daysAhead(35) } });
  await prisma.vaccine.create({ data: { petId: pets[3].id, name: "V10", appliedAt: daysAgo(340), nextDose: daysAhead(25) } });
  await prisma.vaccine.create({ data: { petId: pets[6].id, name: "V8 filhote 1a dose", appliedAt: daysAgo(60), nextDose: daysAhead(10) } });
  await prisma.exam.create({ data: { petId: pets[0].id, name: "Hemograma Completo", status: "DISPONIVEL", resultAt: daysAgo(2), result: "Resultados dentro da normalidade." } });
  await prisma.exam.create({ data: { petId: pets[3].id, name: "Raio-X Toracico", status: "EM_ANALISE" } });
  await prisma.exam.create({ data: { petId: pets[5].id, name: "Ultrassom Abdominal", status: "SOLICITADO" } });

  console.log("Criando internacao ativa...");
  const internacao = await prisma.hospitalization.create({
    data: {
      unitId: unitMatriz.id, petId: pets[5].id, vetId: vetMarcos.id,
      bed: "Baia 03", reason: "Pos-operatorio castracao", status: "ATIVA",
      admittedAt: daysAgo(1), expectedAt: daysAhead(1),
    },
  });
  await prisma.hospitalizationEvolution.createMany({
    data: [
      { hospitalizationId: internacao.id, description: "Animal estavel, alimentando-se bem", vitals: "FC 100, T 38.5", medications: "Dipirona 25mg/kg" },
      { hospitalizationId: internacao.id, description: "Curativo trocado, sem secrecao", vitals: "FC 95, T 38.2", medications: "Dipirona 25mg/kg" },
    ],
  });

  console.log("Criando caixa, vendas e pagamentos...");
  const methodPix = await prisma.paymentMethod.findUnique({ where: { name: "Pix" } });
  const methodCredito = await prisma.paymentMethod.findUnique({ where: { name: "Cartao Credito" } });
  const methodDinheiro = await prisma.paymentMethod.findUnique({ where: { name: "Dinheiro" } });

  const caixa = await prisma.cashRegister.create({
    data: { unitId: unitMatriz.id, openedById: users[4].id, openValue: 200, status: "ABERTO" },
  });

  // 3 vendas de hoje
  const venda1 = await prisma.sale.create({
    data: {
      unitId: unitMatriz.id, tutorId: tutors[0].id, sellerId: seller.id, total: 379.8, status: "FINALIZADA",
      items: {
        create: [
          { productId: products[0].id, description: products[0].name, quantity: 1, unitPrice: 289.9, total: 289.9 },
          { productId: products[5].id, description: products[5].name, quantity: 3, unitPrice: 29.9, total: 89.7 },
        ],
      },
      payments: { create: [{ paymentMethodId: methodPix!.id, amount: 379.8 }] },
    },
  });
  const venda2 = await prisma.sale.create({
    data: {
      unitId: unitMatriz.id, tutorId: tutors[2].id, sellerId: seller.id, total: 149.8, status: "FINALIZADA",
      items: { create: [{ productId: products[3].id, description: products[3].name, quantity: 1, unitPrice: 79.9, total: 79.9 }, { productId: products[4].id, description: products[4].name, quantity: 1, unitPrice: 49.9, total: 49.9 }, { productId: products[7].id, description: products[7].name, quantity: 1, unitPrice: 24.9, total: 24.9 }] },
      payments: { create: [{ paymentMethodId: methodCredito!.id, amount: 149.8, installments: 2 }] },
    },
  });
  const venda3 = await prisma.sale.create({
    data: {
      unitId: unitMatriz.id, tutorId: tutors[4].id, sellerId: seller.id, total: 200, status: "FINALIZADA",
      items: { create: [{ serviceId: services[5].id, description: services[5].name, quantity: 1, unitPrice: 80, total: 80 }, { serviceId: services[8].id, description: services[8].name, quantity: 1, unitPrice: 120, total: 120 }] },
      payments: { create: [{ paymentMethodId: methodDinheiro!.id, amount: 200 }] },
    },
  });

  await prisma.financialTransaction.createMany({
    data: [
      { cashRegisterId: caixa.id, type: "ENTRADA", category: "Venda", description: `Venda #${venda1.id.slice(-6)}`, amount: 379.8 },
      { cashRegisterId: caixa.id, type: "ENTRADA", category: "Venda", description: `Venda #${venda2.id.slice(-6)}`, amount: 149.8 },
      { cashRegisterId: caixa.id, type: "ENTRADA", category: "Venda", description: `Venda #${venda3.id.slice(-6)}`, amount: 200 },
      { cashRegisterId: caixa.id, type: "SAIDA", category: "Despesa", description: "Compra de cafe", amount: 18 },
      { cashRegisterId: caixa.id, type: "SANGRIA", category: "Sangria", description: "Sangria para banco", amount: 300 },
    ],
  });

  console.log("Criando contas a pagar e receber...");
  await prisma.accountReceivable.createMany({
    data: [
      { unitId: unitMatriz.id, tutorId: tutors[1].id, description: "Mensalidade convenio pet", amount: 159.9, dueDate: daysAhead(5), status: "ABERTA" },
      { unitId: unitMatriz.id, tutorId: tutors[3].id, description: "Cirurgia parcela 2/3", amount: 216.7, dueDate: daysAhead(20), status: "ABERTA", installment: "2/3" },
      { unitId: unitMatriz.id, tutorId: tutors[5].id, description: "Atendimento em aberto", amount: 380, dueDate: daysAgo(3), status: "VENCIDA" },
      { unitId: unitMatriz.id, tutorId: tutors[2].id, description: "Pacote banho 10x", amount: 540, dueDate: daysAgo(10), paidAt: daysAgo(10), paidAmount: 540, status: "PAGA" },
    ],
  });
  await prisma.accountPayable.createMany({
    data: [
      { unitId: unitMatriz.id, supplierId: supRoyal.id, category: "Compras", description: "Pedido racoes Royal", amount: 4520, dueDate: daysAhead(7), status: "ABERTA" },
      { unitId: unitMatriz.id, supplierId: supVet.id, category: "Compras", description: "Pedido medicamentos VetPharma", amount: 1280, dueDate: daysAhead(15), status: "ABERTA" },
      { unitId: unitMatriz.id, category: "Aluguel", description: "Aluguel matriz", amount: 8500, dueDate: daysAhead(2), status: "ABERTA", recurring: true, costCenter: "Matriz" },
      { unitId: unitMatriz.id, category: "Energia", description: "Energia eletrica", amount: 1620, dueDate: daysAgo(2), status: "VENCIDA" },
      { unitId: unitMatriz.id, category: "Folha", description: "Folha mensal funcionarios", amount: 32000, dueDate: daysAhead(10), status: "ABERTA", recurring: true },
    ],
  });

  console.log("Criando pacotes de banho...");
  const pacote = await prisma.servicePackage.create({
    data: {
      name: "Pacote 10 banhos Porte M", tutorId: tutors[2].id, petId: pets[3].id,
      totalQuantity: 10, usedQuantity: 3, price: 540, validUntil: daysAhead(120),
      services: { create: [{ serviceId: services[5].id, quantity: 10 }] },
    },
  });
  await prisma.packageUsage.createMany({
    data: [
      { packageId: pacote.id, serviceName: "Banho Porte M", usedAt: daysAgo(20) },
      { packageId: pacote.id, serviceName: "Banho Porte M", usedAt: daysAgo(13) },
      { packageId: pacote.id, serviceName: "Banho Porte M", usedAt: daysAgo(6) },
    ],
  });

  console.log("Criando fidelidade e auditoria...");
  await prisma.loyaltyTransaction.createMany({
    data: [
      { tutorId: tutors[0].id, points: 100, reason: "Compra de racao" },
      { tutorId: tutors[0].id, points: 150, reason: "Pacote de banho" },
      { tutorId: tutors[2].id, points: 200, reason: "Pacote de banho" },
      { tutorId: tutors[2].id, points: 210, reason: "Compras diversas" },
    ],
  });
  await prisma.auditLog.createMany({
    data: [
      { userId: users[0].id, action: "LOGIN", entity: "User", details: "Login do administrador" },
      { userId: users[2].id, action: "CREATE", entity: "MedicalRecord", details: "Ficha criada para Luna" },
      { userId: users[5].id, action: "PAY", entity: "AccountPayable", details: "Pagamento de fornecedor" },
    ],
  });
  await prisma.supportTicket.create({
    data: { userId: users[1].id, subject: "Como configurar tabela 24h?", body: "Preciso definir valores diferentes a noite.", status: "ABERTO" },
  });

  console.log("Seed concluido com sucesso!");
  console.log("\nUsuarios criados (senha: 123456, admin: admin123):");
  console.log("  admin@billypet.com           ADMIN");
  console.log("  gestor@billypet.com          GESTOR");
  console.log("  vet@billypet.com             VETERINARIO");
  console.log("  recepcao@billypet.com        RECEPCAO");
  console.log("  financeiro@billypet.com      FINANCEIRO");
  console.log("  estoque@billypet.com         ESTOQUE");
  console.log("  banhotosa@billypet.com       BANHO_TOSA");
  console.log("  vendedor@billypet.com        VENDEDOR");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
