import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { canAccess } from "@/lib/permissions";
import { asaasIsConfigured, getSubscription, listSubscriptionPayments } from "@/lib/asaas";

export async function POST() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  if (!canAccess("assinatura", ctx.session.role, ctx.session.permissions ?? null)) {
    return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
  }
  if (!asaasIsConfigured()) {
    return NextResponse.json({ error: "Asaas nao configurado" }, { status: 400 });
  }

  const subs = await prisma.subscription.findMany({
    where: { tenantId: ctx.tenantId },
  });

  let synced = 0;
  for (const sub of subs) {
    if (!sub.asaasSubscriptionId) continue;
    try {
      const remote = await getSubscription(sub.asaasSubscriptionId);
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status:
            remote.status === "ACTIVE" ? "ACTIVE" :
            remote.status === "EXPIRED" ? "EXPIRED" :
            remote.status === "INACTIVE" ? "CANCELED" :
            sub.status,
          value: remote.value,
          nextDueDate: remote.nextDueDate ? new Date(remote.nextDueDate) : sub.nextDueDate,
          billingType: remote.billingType,
        },
      });
      const { data } = await listSubscriptionPayments(sub.asaasSubscriptionId);
      for (const p of data) {
        await prisma.subscriptionPayment.upsert({
          where: { asaasPaymentId: p.id },
          create: {
            asaasPaymentId: p.id,
            tenantId: ctx.tenantId,
            subscriptionId: sub.id,
            value: p.value,
            netValue: p.netValue,
            status: p.status,
            billingType: p.billingType,
            dueDate: new Date(p.dueDate),
            paidAt: p.paymentDate ? new Date(p.paymentDate) : null,
            invoiceUrl: p.invoiceUrl,
            bankSlipUrl: p.bankSlipUrl,
            description: p.description,
          },
          update: {
            status: p.status,
            paidAt: p.paymentDate ? new Date(p.paymentDate) : null,
            netValue: p.netValue,
            invoiceUrl: p.invoiceUrl,
            bankSlipUrl: p.bankSlipUrl,
          },
        });
      }
      synced++;
    } catch {
      // pula assinatura com erro e segue
    }
  }

  // Reativa tenant SUSPENDED automaticamente se tem subscription ACTIVE sem fatura em atraso
  const activeSub = await prisma.subscription.findFirst({
    where: { tenantId: ctx.tenantId, status: "ACTIVE" },
  });
  const hasOverdue = await prisma.subscriptionPayment.count({
    where: { tenantId: ctx.tenantId, status: "OVERDUE" },
  });
  if (activeSub && hasOverdue === 0) {
    await prisma.tenant.update({
      where: { id: ctx.tenantId },
      data: { status: "ACTIVE" },
    });
  }

  return NextResponse.json({ ok: true, synced });
}
