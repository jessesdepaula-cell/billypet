import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { asaasIsConfigured, getSubscription, listSubscriptionPayments } from "@/lib/asaas";

export async function POST() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!isSuperAdmin(s.role)) return NextResponse.json({ error: "Apenas SUPER_ADMIN" }, { status: 403 });
  if (!asaasIsConfigured()) return NextResponse.json({ error: "ASAAS_API_KEY nao configurada" }, { status: 400 });

  // Busca todas as assinaturas ativas, pendentes ou vencidas
  const subs = await prisma.subscription.findMany({
    where: {
      status: { in: ["ACTIVE", "PENDING", "OVERDUE"] },
    },
  });

  let synced = 0;
  for (const sub of subs) {
    if (!sub.asaasSubscriptionId) continue;
    try {
      const remote = await getSubscription(sub.asaasSubscriptionId);
      
      // Atualiza assinatura local
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

      // Busca e upserta faturas
      const { data } = await listSubscriptionPayments(sub.asaasSubscriptionId);
      for (const p of data) {
        await prisma.subscriptionPayment.upsert({
          where: { asaasPaymentId: p.id },
          create: {
            asaasPaymentId: p.id,
            tenantId: sub.tenantId,
            subscriptionId: sub.id,
            value: p.value,
            netValue: p.netValue,
            status: p.status.toUpperCase(),
            billingType: p.billingType,
            dueDate: new Date(p.dueDate),
            paidAt: p.paymentDate ? new Date(p.paymentDate) : null,
            invoiceUrl: p.invoiceUrl,
            bankSlipUrl: p.bankSlipUrl,
            description: p.description,
          },
          update: {
            status: p.status.toUpperCase(),
            paidAt: p.paymentDate ? new Date(p.paymentDate) : null,
            netValue: p.netValue,
            invoiceUrl: p.invoiceUrl,
            bankSlipUrl: p.bankSlipUrl,
          },
        });
      }

      // Reativa o status do tenant se a assinatura estiver ativa e não houver faturas vencidas
      const hasOverdue = await prisma.subscriptionPayment.count({
        where: { tenantId: sub.tenantId, status: "OVERDUE" },
      });
      if (remote.status === "ACTIVE" && hasOverdue === 0) {
        await prisma.tenant.update({
          where: { id: sub.tenantId },
          data: { status: "ACTIVE" },
        });
      } else if (hasOverdue > 0) {
        await prisma.tenant.update({
          where: { id: sub.tenantId },
          data: { status: "PAST_DUE" },
        });
      }

      synced++;
    } catch (err: any) {
      console.error(`Erro ao sincronizar assinatura ${sub.asaasSubscriptionId} via Painel Admin:`, err.message);
    }
  }

  return NextResponse.json({ ok: true, syncedSubscriptionsCount: synced });
}
