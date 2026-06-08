import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { parsePermissions } from "@/lib/permissions";
import { asaasIsConfigured, createCustomer, createSubscription } from "@/lib/asaas";

function nextDueDateISO(dueDay: number) {
  const day = Math.min(Math.max(Math.floor(dueDay) || 1, 1), 28);
  const today = new Date();
  const candidate = new Date(today.getFullYear(), today.getMonth(), day);
  if (candidate <= today) candidate.setMonth(candidate.getMonth() + 1);
  const y = candidate.getFullYear();
  const m = String(candidate.getMonth() + 1).padStart(2, "0");
  const d = String(candidate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function digits(v?: string | null) { return (v || "").replace(/\D/g, ""); }

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const companyName = String(body.companyName || "").trim();
    const cnpj = digits(body.cnpj);
    const phone = digits(body.phone);
    const zipCode = digits(body.zipCode);

    if (!rawEmail || !password || !companyName || !cnpj) {
      return NextResponse.json({ error: "E-mail, senha, nome da clínica e CPF/CNPJ são obrigatórios." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter ao menos 6 caracteres." }, { status: 400 });
    }

    if (cnpj.length !== 11 && cnpj.length !== 14) {
      return NextResponse.json({ error: "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos." }, { status: 400 });
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email: rawEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Já existe um usuário cadastrado com este e-mail." }, { status: 409 });
    }

    // Cria o Tenant (TRIAL por padrão, passa para ACTIVE se Asaas for configurado)
    const tenant = await prisma.tenant.create({
      data: {
        companyName,
        email: rawEmail,
        cnpj,
        phone: phone || null,
        zipCode: zipCode || null,
        status: "TRIAL",
      },
    });

    // Cria unidade padrão "Matriz"
    const matriz = await prisma.unit.create({
      data: { tenantId: tenant.id, name: "Matriz" },
    });

    // Cria formas de pagamento padrão
    await prisma.paymentMethod.createMany({
      data: [
        { tenantId: tenant.id, name: "Dinheiro", type: "DINHEIRO" },
        { tenantId: tenant.id, name: "Pix", type: "PIX" },
        { tenantId: tenant.id, name: "Cartão Crédito", type: "CREDITO" },
        { tenantId: tenant.id, name: "Cartão Débito", type: "DEBITO" },
      ],
    });

    // Cria categorias padrão
    await prisma.productCategory.createMany({
      data: [
        { tenantId: tenant.id, name: "Ração" },
        { tenantId: tenant.id, name: "Medicamento" },
        { tenantId: tenant.id, name: "Acessório" },
        { tenantId: tenant.id, name: "Higiene" },
      ],
    });

    // Cria status de agendamento padrão
    await prisma.appointmentStatus.createMany({
      data: [
        { tenantId: tenant.id, name: "Agendado", color: "slate" },
        { tenantId: tenant.id, name: "Confirmado", color: "blue" },
        { tenantId: tenant.id, name: "Em Atendimento", color: "orange" },
        { tenantId: tenant.id, name: "Finalizado", color: "green" },
        { tenantId: tenant.id, name: "Cancelado", color: "red" },
        { tenantId: tenant.id, name: "Não Compareceu", color: "yellow" },
      ],
    });

    // Cria o usuário administrador
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        name: companyName,
        email: rawEmail,
        passwordHash,
        role: "ADMIN",
        tenantId: tenant.id,
        unitId: matriz.id,
        isActive: true,
      },
    });

    // Efetua login automático
    const sessionToken = await signSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      unitId: user.unitId,
      tenantId: user.tenantId,
      permissions: parsePermissions(user.permissions),
    });
    await setSessionCookie(sessionToken);

    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        action: "CREATE",
        entity: "User",
        entityId: user.id,
        details: `Auto-cadastro de cliente: ${rawEmail}`,
      },
    });

    // Criação de checkout no Asaas se a integração estiver ativa
    let invoiceUrl: string | null = null;
    if (asaasIsConfigured()) {
      try {
        const customer = await createCustomer({
          name: tenant.companyName,
          email: tenant.email,
          cpfCnpj: digits(tenant.cnpj),
          phone: digits(tenant.phone),
          mobilePhone: digits(tenant.phone),
          postalCode: digits(tenant.zipCode),
          externalReference: tenant.id,
        });

        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { asaasCustomerId: customer.id },
        });

        const defaultDueDay = 5;
        const subValue = 197;

        const sub = await createSubscription({
          customer: customer.id,
          value: subValue,
          nextDueDate: nextDueDateISO(defaultDueDay),
          cycle: "MONTHLY",
          billingType: "UNDEFINED",
          description: `BilyVet - Plano Mensal PRO`,
          externalReference: tenant.id,
        });

        const subscription = await prisma.subscription.create({
          data: {
            tenantId: tenant.id,
            asaasSubscriptionId: sub.id,
            plan: "PRO",
            value: subValue,
            cycle: "MONTHLY",
            billingType: "UNDEFINED",
            status: "PENDING",
            nextDueDate: new Date(sub.nextDueDate),
          },
        });

        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { status: "ACTIVE" },
        });

        // Tenta buscar a primeira cobrança da assinatura criada para retornar o link de pagamento
        try {
          const paymentsResponse = await prisma.$queryRaw<any[]>`
            SELECT "id" FROM "SubscriptionPayment" LIMIT 1
          `; // Apenas para inicializar. Usamos a API do Asaas para listar os pagamentos.
          const { data } = await import("@/lib/asaas").then(m => m.listSubscriptionPayments(sub.id));
          const first = data?.[0];
          if (first) {
            invoiceUrl = first.invoiceUrl || null;
            await prisma.subscriptionPayment.create({
              data: {
                asaasPaymentId: first.id,
                tenantId: tenant.id,
                subscriptionId: subscription.id,
                value: first.value,
                netValue: first.netValue,
                status: (first.status || "PENDING").toUpperCase(),
                billingType: first.billingType,
                dueDate: new Date(first.dueDate),
                invoiceUrl: first.invoiceUrl,
                bankSlipUrl: first.bankSlipUrl,
                description: first.description,
              },
            });
          }
        } catch {
          // webhook Asaas cuidará disso se falhar a busca imediata
        }
      } catch (err: any) {
        console.error("Falha ao integrar com Asaas no auto-cadastro:", err.message);
      }
    }

    return NextResponse.json({ ok: true, invoiceUrl });
  } catch (err: any) {
    console.error("Erro interno no registro de usuário:", err);
    return NextResponse.json({ error: "Erro interno no servidor ao realizar o cadastro." }, { status: 500 });
  }
}
