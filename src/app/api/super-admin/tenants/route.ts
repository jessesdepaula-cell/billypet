import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { asaasIsConfigured, createCustomer, createSubscription } from "@/lib/asaas";

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function digits(v?: string | null) { return (v || "").replace(/\D/g, ""); }

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!isSuperAdmin(s.role)) return NextResponse.json({ error: "Apenas SUPER_ADMIN" }, { status: 403 });

  const body = await req.json();
  if (!body.companyName || !body.email) {
    return NextResponse.json({ error: "companyName e email sao obrigatorios" }, { status: 400 });
  }

  const tenant = await prisma.tenant.create({
    data: {
      companyName: body.companyName,
      tradeName: body.tradeName || null,
      cnpj: body.cnpj || null,
      email: body.email,
      phone: body.phone || null,
      responsibleName: body.responsibleName || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zipCode: body.zipCode || null,
      status: "TRIAL",
    },
  });

  // Cria customer + subscription no Asaas se solicitado
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

      const value = Number(body.value || 197);
      const billingType = body.billingType || "UNDEFINED";

      const sub = await createSubscription({
        customer: customer.id,
        value,
        nextDueDate: tomorrowISO(),
        cycle: "MONTHLY",
        billingType,
        description: `BillyPet - Plano ${value === 197 ? "PRO" : "Custom"}`,
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
      return NextResponse.json({
        tenant,
        warning: `Cliente criado, mas falhou ao criar no Asaas: ${err.message}`,
      });
    }
  } else if (body.startNow && !asaasIsConfigured()) {
    return NextResponse.json({
      tenant,
      warning: "Cliente criado, mas ASAAS_API_KEY nao esta configurada - assinatura nao foi criada.",
    });
  }

  return NextResponse.json({ tenant });
}
