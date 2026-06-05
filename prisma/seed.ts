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
      data: { passwordHash, role: "SUPER_ADMIN", isActive: true, name: "Jesse de Paula" },
    });
    console.log("Super admin atualizado:", email);
  } else {
    await prisma.user.create({
      data: { name: "Jesse de Paula", email, passwordHash, role: "SUPER_ADMIN", isActive: true },
    });
    console.log("Super admin criado:", email);
  }
}

async function ensureDemoData() {
  // 1. Criar ou Obter o Tenant Demo
  const tenantEmail = "demo@bilyvet.com";
  let tenant = await prisma.tenant.findFirst({ where: { email: tenantEmail } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        companyName: "Clinica BilyVet Demo",
        tradeName: "BilyVet Clinica & Petshop",
        email: tenantEmail,
        status: "ACTIVE",
      },
    });
    console.log("Tenant Demo criado.");
  }

  // 2. Criar ou Obter a Unidade Matriz
  let unit = await prisma.unit.findFirst({ where: { tenantId: tenant.id, name: "Matriz" } });
  if (!unit) {
    unit = await prisma.unit.create({
      data: { tenantId: tenant.id, name: "Matriz" },
    });
    console.log("Unidade Matriz criada.");
  }

  // 3. Formas de Pagamento Padrao
  const existingPaymentMethods = await prisma.paymentMethod.findMany({ where: { tenantId: tenant.id } });
  if (existingPaymentMethods.length === 0) {
    await prisma.paymentMethod.createMany({
      data: [
        { tenantId: tenant.id, name: "Dinheiro", type: "DINHEIRO" },
        { tenantId: tenant.id, name: "Pix", type: "PIX" },
        { tenantId: tenant.id, name: "Cartao Credito", type: "CREDITO" },
        { tenantId: tenant.id, name: "Cartao Debito", type: "DEBITO" },
      ],
    });
    console.log("Formas de pagamento padrao criadas.");
  }

  // 4. Categorias de Produto Padrao
  const existingCategories = await prisma.productCategory.findMany({ where: { tenantId: tenant.id } });
  if (existingCategories.length === 0) {
    await prisma.productCategory.createMany({
      data: [
        { tenantId: tenant.id, name: "Racao" },
        { tenantId: tenant.id, name: "Medicamento" },
        { tenantId: tenant.id, name: "Acessorio" },
        { tenantId: tenant.id, name: "Higiene" },
      ],
    });
    console.log("Categorias de produto padrao criadas.");
  }

  // 5. Status de Agendamento Customizados (Com cores)
  const existingStatuses = await prisma.appointmentStatus.findMany({ where: { tenantId: tenant.id } });
  let statusAgendadoId = "";
  if (existingStatuses.length === 0) {
    const statusesToCreate = [
      { name: "Agendado", color: "slate" },
      { name: "Confirmado", color: "blue" },
      { name: "Em Atendimento", color: "orange" },
      { name: "Finalizado", color: "green" },
      { name: "Cancelado", color: "red" },
      { name: "Nao Compareceu", color: "yellow" },
    ];
    for (const st of statusesToCreate) {
      const dbStatus = await prisma.appointmentStatus.create({
        data: { tenantId: tenant.id, name: st.name, color: st.color },
      });
      if (st.name === "Agendado") statusAgendadoId = dbStatus.id;
    }
    console.log("Status de agendamento coloridos criados.");
  } else {
    statusAgendadoId = existingStatuses.find(s => s.name === "Agendado")?.id || "";
  }

  // 6. Servicos Padrao
  const existingServices = await prisma.service.findMany({ where: { tenantId: tenant.id } });
  let serviceConsultaId = "";
  let serviceBanhoId = "";
  if (existingServices.length === 0) {
    const s1 = await prisma.service.create({
      data: { tenantId: tenant.id, name: "Consulta Geral", category: "Consulta", durationMinutes: 30, price: 120.0, commissionPct: 20 },
    });
    serviceConsultaId = s1.id;
    const s2 = await prisma.service.create({
      data: { tenantId: tenant.id, name: "Banho", category: "Banho", durationMinutes: 45, price: 50.0, commissionPct: 10 },
    });
    serviceBanhoId = s2.id;
    await prisma.service.create({
      data: { tenantId: tenant.id, name: "Tosa", category: "Tosa", durationMinutes: 60, price: 70.0, commissionPct: 15 },
    });
    await prisma.service.create({
      data: { tenantId: tenant.id, name: "Vacina V10", category: "Vacina", durationMinutes: 15, price: 90.0, commissionPct: 0 },
    });
    console.log("Servicos padrao criados.");
  } else {
    serviceConsultaId = existingServices.find(s => s.name === "Consulta Geral")?.id || "";
    serviceBanhoId = existingServices.find(s => s.name === "Banho")?.id || "";
  }

  // 7. Usuarios Demo do README
  const demoUsers = [
    { email: "admin@bilyvet.com", name: "Administrador Demo", role: "ADMIN", pass: "admin123" },
    { email: "gestor@bilyvet.com", name: "Gestor Demo", role: "GESTOR", pass: "123456" },
    { email: "vet@bilyvet.com", name: "Veterinario Demo", role: "VETERINARIO", pass: "123456" },
    { email: "recepcao@bilyvet.com", name: "Recepcao Demo", role: "RECEPCAO", pass: "123456" },
    { email: "financeiro@bilyvet.com", name: "Financeiro Demo", role: "FINANCEIRO", pass: "123456" },
    { email: "estoque@bilyvet.com", name: "Estoque Demo", role: "ESTOQUE", pass: "123456" },
    { email: "banhotosa@bilyvet.com", name: "Banho Tosa Demo", role: "BANHO_TOSA", pass: "123456" },
    { email: "vendedor@bilyvet.com", name: "Vendedor Demo", role: "VENDEDOR", pass: "123456" },
  ];

  let vetUserId = "";
  let banhoGroomerId = "";

  for (const u of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    const passwordHash = bcrypt.hashSync(u.pass, 10);
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
          tenantId: tenant.id,
          unitId: unit.id,
          isActive: true,
        },
      });
      if (u.role === "VETERINARIO") vetUserId = created.id;
      if (u.role === "BANHO_TOSA") banhoGroomerId = created.id;
      console.log(`Usuario demo criado: ${u.email}`);
    } else {
      if (u.role === "VETERINARIO") vetUserId = existing.id;
      if (u.role === "BANHO_TOSA") banhoGroomerId = existing.id;
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, isActive: true },
      });
    }
  }

  // 8. Vincular Colaboradores aos Servicos (UserService)
  if (vetUserId && serviceConsultaId) {
    const existingUS = await prisma.userService.findUnique({
      where: { userId_serviceId: { userId: vetUserId, serviceId: serviceConsultaId } }
    });
    if (!existingUS) {
      await prisma.userService.create({
        data: { userId: vetUserId, serviceId: serviceConsultaId }
      });
      console.log("Vinculo Veterinario -> Consulta Geral criado.");
    }
  }
  if (banhoGroomerId && serviceBanhoId) {
    const existingUS = await prisma.userService.findUnique({
      where: { userId_serviceId: { userId: banhoGroomerId, serviceId: serviceBanhoId } }
    });
    if (!existingUS) {
      await prisma.userService.create({
        data: { userId: banhoGroomerId, serviceId: serviceBanhoId }
      });
      console.log("Vinculo Banho/Tosa -> Servico Banho criado.");
    }
  }

  // 9. Tutor e Pet para testes
  let tutor = await prisma.tutor.findFirst({ where: { tenantId: tenant.id, name: "Carlos Henrique" } });
  if (!tutor) {
    tutor = await prisma.tutor.create({
      data: {
        tenantId: tenant.id,
        name: "Carlos Henrique",
        email: "carlos@tutor.com",
        phone: "(11) 99999-8888",
        isActive: true,
      },
    });
    console.log("Tutor Carlos Henrique criado.");
  }

  let pet = await prisma.pet.findFirst({ where: { tutorId: tutor.id, name: "Rex" } });
  if (!pet) {
    pet = await prisma.pet.create({
      data: {
        tutorId: tutor.id,
        name: "Rex",
        species: "Cao",
        breed: "Golden Retriever",
        sex: "M",
        neutered: true,
        birthDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000), // 3 anos
        weightKg: 32.5,
        color: "Dourado",
        isActive: true,
      },
    });
    console.log("Pet Rex criado.");
  }

  // 10. Agendamento inicial para demonstração
  const existingAppts = await prisma.appointment.findMany({ where: { petId: pet.id } });
  if (existingAppts.length === 0) {
    const apptDate = new Date();
    apptDate.setHours(10, 0, 0, 0); // hoje as 10h
    await prisma.appointment.create({
      data: {
        unitId: unit.id,
        tutorId: tutor.id,
        petId: pet.id,
        vetId: vetUserId || null,
        scheduledAt: apptDate,
        type: "CONSULTA",
        status: "AGENDADO",
        statusId: statusAgendadoId || null,
        notes: "Exame de rotina anual.",
      },
    });
    console.log("Agendamento demonstrativo criado para hoje as 10h.");
  }
}

async function main() {
  await ensureSuperAdmin();
  await ensureDemoData();
  console.log("Seed concluido com sucesso.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
