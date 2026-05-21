import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { asaasIsConfigured, createCustomer, createSubscription } from "@/lib/asaas";

function tomorrowISO() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function digits(v?: string | null) { return (v || "").replace(/\D/g, ""); }

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!isSuperAdmin(s.role)) return NextResponse.json({ error: "Apenas SUPER_ADMIN" }, { status: 403 });
  if (!asaasIsConfigured()) return NextResponse.json({ error: "ASAAS_API_KEY nao configurada" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { id: params.id } });
  if (!tenant) return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const value = Number(body.value || 247);
  const billingType = body.billingType || "UNDEFINED";

  let customerId = tenant.asaasCustomerId;
  if (!customerId) {
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
    await prisma.tenant.update({ where: { id: tenant.id }, data: { asaasCustomerId: customerId } });
  }

  try {
    const sub = await createSubscription({
      customer: customerId,
      value,
      nextDueDate: tomorrowISO(),
      cycle: "MONTHLY",
      billingType,
      description: `BilyVet - Mensalidade ${tenant.companyName}`,
      externalReference: tenant.id,
    });
    const subscription = await prisma.subscription.create({
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
    return NextResponse.json({ ok: true, subscription });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
