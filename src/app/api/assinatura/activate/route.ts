import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { canAccess } from "@/lib/permissions";
import { asaasIsConfigured, createCustomer, createSubscription } from "@/lib/asaas";

const DEFAULT_VALUE = 247;

function nextDueDateISO(dueDay: number) {
  const day = Math.min(Math.max(Math.floor(dueDay) || 1, 1), 28);
  const today = new Date();
  const candidate = new Date(today.getFullYear(), today.getMonth(), day);
  // Se o dia ja passou neste mes, joga para o proximo
  if (candidate <= today) candidate.setMonth(candidate.getMonth() + 1);
  const y = candidate.getFullYear();
  const m = String(candidate.getMonth() + 1).padStart(2, "0");
  const d = String(candidate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function digits(v?: string | null) { return (v || "").replace(/\D/g, ""); }

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  if (!canAccess("assinatura", ctx.session.role, ctx.session.permissions ?? null)) {
    return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
  }
  if (!asaasIsConfigured()) {
    return NextResponse.json({ error: "Integracao Asaas nao esta configurada" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as any));
  const billingType = String(body.billingType || "UNDEFINED").toUpperCase();
  const dueDay = Math.min(Math.max(Number(body.dueDay) || 1, 1), 28);
  const incomingCnpj = digits(body.cnpj);
  const incomingPhone = digits(body.phone);
  const incomingZip = digits(body.zipCode);

  if (!["BOLETO", "CREDIT_CARD", "PIX", "UNDEFINED"].includes(billingType)) {
    return NextResponse.json({ error: "Forma de pagamento invalida" }, { status: 400 });
  }

  if (!incomingCnpj || (incomingCnpj.length !== 11 && incomingCnpj.length !== 14)) {
    return NextResponse.json(
      { error: "CPF ou CNPJ obrigatorio (11 ou 14 digitos)." },
      { status: 400 }
    );
  }

  let tenant = await prisma.tenant.findUnique({
    where: { id: ctx.tenantId },
    include: { subscriptions: { orderBy: { createdAt: "desc" } } },
  });
  if (!tenant) return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 404 });

  // Bloqueia se ja tem assinatura ativa/pendente
  const existing = tenant.subscriptions.find(
    (s) => s.status === "ACTIVE" || s.status === "PENDING" || s.status === "OVERDUE"
  );
  if (existing) {
    return NextResponse.json({ error: "Voce ja possui uma assinatura ativa" }, { status: 409 });
  }

  // Atualiza dados do tenant com o que foi informado no formulario
  try {
    tenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        cnpj: incomingCnpj,
        ...(incomingPhone ? { phone: incomingPhone } : {}),
        ...(incomingZip ? { zipCode: incomingZip } : {}),
      },
      include: { subscriptions: { orderBy: { createdAt: "desc" } } },
    });
  } catch (err: any) {
    // Pode falhar se outro tenant ja tem esse CNPJ (constraint @unique)
    if (String(err.code) === "P2002") {
      return NextResponse.json(
        { error: "Este CPF/CNPJ ja esta cadastrado em outra conta." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: `Falha ao atualizar cadastro: ${err.message}` }, { status: 500 });
  }

  // Cria (ou reaproveita) customer no Asaas
  let customerId = tenant.asaasCustomerId;
  if (!customerId) {
    try {
      const c = await createCustomer({
        name: tenant.companyName,
        email: tenant.email,
        cpfCnpj: digits(tenant.cnpj),
        phone: digits(tenant.phone),
        mobilePhone: digits(tenant.phone),
        address: tenant.address || undefined,
        postalCode: digits(tenant.zipCode),
        externalReference: tenant.id,
      });
      customerId = c.id;
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { asaasCustomerId: customerId },
      });
    } catch (err: any) {
      return NextResponse.json({ error: `Falha ao criar cliente Asaas: ${err.message}` }, { status: 500 });
    }
  }

  // Cria subscription
  try {
    const sub = await createSubscription({
      customer: customerId,
      value: DEFAULT_VALUE,
      nextDueDate: nextDueDateISO(dueDay),
      cycle: "MONTHLY",
      billingType: billingType as any,
      description: `BilyVet - Mensalidade ${tenant.companyName}`,
      externalReference: tenant.id,
    });

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        asaasSubscriptionId: sub.id,
        plan: "PRO",
        value: DEFAULT_VALUE,
        cycle: "MONTHLY",
        billingType,
        status: "PENDING",
        nextDueDate: new Date(sub.nextDueDate),
      },
    });

    // Marca tenant como ACTIVE (vai virar PAST_DUE se a fatura vencer sem pagamento)
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: "ACTIVE" },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: ctx.session.id,
        action: "CREATE",
        entity: "Subscription",
        entityId: subscription.id,
        details: `Auto-ativacao pelo cliente - ${billingType} - venc. dia ${dueDay}`,
      },
    });

    return NextResponse.json({ ok: true, subscription });
  } catch (err: any) {
    return NextResponse.json({ error: `Falha ao criar assinatura Asaas: ${err.message}` }, { status: 500 });
  }
}
