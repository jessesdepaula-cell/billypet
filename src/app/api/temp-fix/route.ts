import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { companyName: { contains: "Vetz" } },
          { companyName: { contains: "vetz" } },
          { companyName: { contains: "VETZ" } },
          { email: { contains: "vetz" } }
        ]
      },
      include: { subscriptions: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant Vetz nao encontrado no banco" });
    }

    const sub = tenant.subscriptions.find(s => s.status === "PENDING" || s.status === "ACTIVE" || s.status === "OVERDUE");
    if (!sub || !sub.asaasSubscriptionId) {
      return NextResponse.json({ error: "Assinatura ativa/pendente nao encontrada", tenant });
    }

    const ASAAS_API_URL = process.env.ASAAS_API_URL?.trim() || "https://api.asaas.com/v3";
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY?.replace(/[^\x20-\x7E]/g, "").replace(/^["']|["']$/g, "").trim();

    if (!ASAAS_API_KEY) {
      return NextResponse.json({ error: "ASAAS_API_KEY nao configurada no Vercel" });
    }

    // Atualiza o billingType na assinatura do Asaas e manda atualizar pagamentos pendentes
    const res = await fetch(`${ASAAS_API_URL}/subscriptions/${sub.asaasSubscriptionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        billingType: "UNDEFINED",
        updatePendingPayments: true
      })
    });

    const body = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: "Erro na API do Asaas", body }, { status: res.status });
    }

    // Atualiza localmente no banco
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { billingType: "UNDEFINED" }
    });

    return NextResponse.json({
      ok: true,
      message: "Assinatura do Vetz atualizada para permitir PIX, Boleto e Cartao com sucesso!",
      asaasResponse: body
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
