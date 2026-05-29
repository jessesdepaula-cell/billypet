import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { asaasIsConfigured, createCustomer, createSubscription } from "@/lib/asaas";
import { sendEmail, passwordResetEmail } from "@/lib/email";

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

function getAppUrl(req: Request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!isSuperAdmin(s.role)) return NextResponse.json({ error: "Apenas SUPER_ADMIN" }, { status: 403 });

  const body = await req.json();
  const rawEmail = String(body.email || "").trim().toLowerCase();
  if (!rawEmail) {
    return NextResponse.json({ error: "Email e obrigatorio" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: rawEmail } });
  if (existingUser) {
    return NextResponse.json({ error: "Ja existe um usuario com este email" }, { status: 409 });
  }

  const companyName = String(body.companyName || "").trim() || rawEmail.split("@")[0];

  const tenant = await prisma.tenant.create({
    data: {
      companyName,
      email: rawEmail,
      tradeName: body.tradeName || null,
      cnpj: body.cnpj || null,
      phone: body.phone || null,
      responsibleName: body.responsibleName || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zipCode: body.zipCode || null,
      status: "TRIAL",
    },
  });

  // Unit Matriz default para o tenant
  const matriz = await prisma.unit.create({
    data: { tenantId: tenant.id, name: "Matriz" },
  });

  // Formas de pagamento padrao
  await prisma.paymentMethod.createMany({
    data: [
      { tenantId: tenant.id, name: "Dinheiro", type: "DINHEIRO" },
      { tenantId: tenant.id, name: "Pix", type: "PIX" },
      { tenantId: tenant.id, name: "Cartao Credito", type: "CREDITO" },
      { tenantId: tenant.id, name: "Cartao Debito", type: "DEBITO" },
    ],
  });

  // Categorias de produto padrao
  await prisma.productCategory.createMany({
    data: [
      { tenantId: tenant.id, name: "Racao" },
      { tenantId: tenant.id, name: "Medicamento" },
      { tenantId: tenant.id, name: "Acessorio" },
      { tenantId: tenant.id, name: "Higiene" },
    ],
  });

  // Cria usuario ADMIN com senha aleatoria (precisa definir via link de reset)
  const placeholderHash = bcrypt.hashSync(randomBytes(32).toString("hex"), 10);
  await prisma.user.create({
    data: {
      name: companyName,
      email: rawEmail,
      passwordHash: placeholderHash,
      role: "ADMIN",
      tenantId: tenant.id,
      unitId: matriz.id,
      isActive: true,
    },
  });

  // Gera token de definicao de senha (24h)
  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      email: rawEmail,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  const link = `${getAppUrl(req)}/redefinir-senha?token=${token}`;

  const { html, text } = passwordResetEmail({ link, isNewAccount: true });
  const sendResult = await sendEmail({
    to: rawEmail,
    subject: "Bem-vindo a BilyVet - defina sua senha",
    html,
    text,
  });

  // Cria customer + subscription no Asaas se solicitado
  let asaasWarning: string | undefined;
  if (body.startNow && asaasIsConfigured()) {
    try {
      const customer = await createCustomer({
        name: tenant.companyName,
        email: tenant.email,
        cpfCnpj: digits(tenant.cnpj),
        phone: digits(tenant.phone),
        mobilePhone: digits(tenant.phone),
        address: tenant.address || undefined,
        postalCode: digits(tenant.zipCode),
        externalReference: tenant.id,
      });
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { asaasCustomerId: customer.id },
      });

      const value = Number(body.value || 247);
      const billingType = body.billingType || "UNDEFINED";
      const dueDay = Number(body.dueDay || 1);

      const sub = await createSubscription({
        customer: customer.id,
        value,
        nextDueDate: nextDueDateISO(dueDay),
        cycle: "MONTHLY",
        billingType,
        description: `BilyVet - Plano ${value === 247 ? "PRO" : "Custom"}`,
        externalReference: tenant.id,
      });

      await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          asaasSubscriptionId: sub.id,
          plan: "PRO",
          value,
          cycle: "MONTHLY",
          billingType,
          status: "PENDING",
          nextDueDate: new Date(sub.nextDueDate),
        },
      });

      await prisma.tenant.update({ where: { id: tenant.id }, data: { status: "ACTIVE" } });
    } catch (err: any) {
      asaasWarning = `Cliente criado, mas falhou ao criar assinatura no Asaas: ${err.message}`;
    }
  } else if (body.startNow && !asaasIsConfigured()) {
    asaasWarning = "Cliente criado, mas ASAAS_API_KEY nao esta configurada - assinatura nao foi criada.";
  }

  return NextResponse.json({
    tenant,
    invite: {
      link, // sempre devolve para o super-admin copiar caso o email falhe
      emailSent: sendResult.ok,
      emailError: sendResult.ok ? undefined : sendResult.error,
    },
    warning: asaasWarning,
  });
}
