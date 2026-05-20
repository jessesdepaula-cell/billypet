import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { asaasIsConfigured, cancelSubscription } from "@/lib/asaas";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!isSuperAdmin(s.role)) return NextResponse.json({ error: "Apenas SUPER_ADMIN" }, { status: 403 });

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: { subscriptions: { where: { status: { in: ["ACTIVE", "PENDING", "OVERDUE"] } } } },
  });
  if (!tenant) return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });

  const errors: string[] = [];
  for (const sub of tenant.subscriptions) {
    if (sub.asaasSubscriptionId && asaasIsConfigured()) {
      try { await cancelSubscription(sub.asaasSubscriptionId); }
      catch (e: any) { errors.push(`${sub.id}: ${e.message}`); }
    }
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "CANCELED", canceledAt: new Date() },
    });
  }
  await prisma.tenant.update({ where: { id: tenant.id }, data: { status: "CANCELED" } });

  return NextResponse.json({ ok: true, warnings: errors });
}
