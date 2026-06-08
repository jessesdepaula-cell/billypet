import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { asaasIsConfigured, getSubscription, listSubscriptionPayments } from "@/lib/asaas";

export async function GET(req: Request) {
  // Executa com GET (Vercel crons envia GET por padrão)
  return handleSync(req);
}

export async function POST(req: Request) {
  // Permite POST também
  return handleSync(req);
}

async function handleSync(req: Request) {
  // Proteção de segurança do Vercel Cron
  const authHeader = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!cronSecret && !isVercelCron) {
    // Permitir chamada local em ambiente de desenvolvimento se não houver secret configurado
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!asaasIsConfigured()) {
    return NextResponse.json({ error: "Asaas nao configurado no servidor" }, { status: 500 });
  }

  // Busca todas as assinaturas que não estão canceladas ou expiradas
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
      
      // Atualiza a assinatura local
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

      // Busca e sincroniza faturas desta assinatura
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
        // Se tem fatura atrasada, marca como PAST_DUE
        await prisma.tenant.update({
          where: { id: sub.tenantId },
          data: { status: "PAST_DUE" },
        });
      }

      synced++;
    } catch (err: any) {
      console.error(`Erro ao sincronizar assinatura ${sub.asaasSubscriptionId}:`, err.message);
    }
  }

  return NextResponse.json({ ok: true, syncedSubscriptionsCount: synced });
}
