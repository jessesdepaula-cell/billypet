import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { tenantId } = ctx;

  try {
    const conn = await prisma.whatsappConnection.findUnique({
      where: { tenantId },
    });

    return NextResponse.json({
      aiClientEnabled: conn?.aiClientEnabled ?? true,
      aiOperatorEnabled: conn?.aiOperatorEnabled ?? true,
      operatorPrompt: conn?.operatorPrompt ?? "",
      clientPrompt: conn?.clientPrompt ?? "",
      aiTestMode: conn?.aiTestMode ?? false,
      testPhone: conn?.testPhone ?? "",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao carregar configuracoes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { tenantId } = ctx;

  try {
    const body = await req.json();
    const { aiClientEnabled, aiOperatorEnabled, operatorPrompt, clientPrompt, aiTestMode, testPhone } = body;

    // Normaliza multiplos numeros separados por virgula, espaco ou nova linha
    let formattedTestPhones: string | null = null;
    if (typeof testPhone === "string" && testPhone.trim()) {
      const phones = testPhone
        .split(/[\n,;\s]+/)
        .map((p) => p.replace(/\D/g, ""))
        .filter((p) => p.length >= 10);

      formattedTestPhones = Array.from(new Set(phones)).join(",");
    }

    const updated = await prisma.whatsappConnection.upsert({
      where: { tenantId },
      create: {
        tenantId,
        instanceName: `bp-${tenantId}`,
        aiClientEnabled: Boolean(aiClientEnabled),
        aiOperatorEnabled: Boolean(aiOperatorEnabled),
        operatorPrompt: typeof operatorPrompt === "string" ? operatorPrompt : null,
        clientPrompt: typeof clientPrompt === "string" ? clientPrompt : null,
        aiTestMode: Boolean(aiTestMode),
        testPhone: formattedTestPhones,
      },
      update: {
        ...(typeof aiClientEnabled === "boolean" ? { aiClientEnabled } : {}),
        ...(typeof aiOperatorEnabled === "boolean" ? { aiOperatorEnabled } : {}),
        ...(typeof operatorPrompt === "string" ? { operatorPrompt } : {}),
        ...(typeof clientPrompt === "string" ? { clientPrompt } : {}),
        ...(typeof aiTestMode === "boolean" ? { aiTestMode } : {}),
        testPhone: formattedTestPhones,
      },
    });

    return NextResponse.json({ ok: true, connection: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao salvar configuracoes" },
      { status: 500 }
    );
  }
}
