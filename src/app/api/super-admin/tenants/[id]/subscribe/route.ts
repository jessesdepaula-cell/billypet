import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!isSuperAdmin(s.role)) return NextResponse.json({ error: "Apenas SUPER_ADMIN" }, { status: 403 });
  if (!asaasIsConfigured()) return NextResponse.json({ error: "ASAAS_API_KEY nao configurada" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { id: params.id } });
  if (!tenant) return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const value = Number(body.value || 197);
  const billingType = body.billingType || "UNDEFINED";
  const dueDay = Number(body.dueDay || 1);

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
      nextDueDate: nextDueDateISO(dueDay),
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
