import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { id: "global" },
    });

    const evolutionUrl = process.env.EVOLUTION_API_URL || setting?.evolutionUrl || "";
    const hasKey = Boolean(process.env.EVOLUTION_API_KEY || setting?.evolutionApiKey);

    return NextResponse.json({
      evolutionUrl,
      hasKey,
      isConfigured: Boolean(evolutionUrl && hasKey),
      isSuperAdmin: ctx.session.role === "SUPER_ADMIN",
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

  try {
    const body = await req.json();
    const { evolutionUrl, evolutionApiKey } = body;

    if (!evolutionUrl || !evolutionApiKey) {
      return NextResponse.json({ error: "URL e Chave API da Railway sao obrigatorias" }, { status: 400 });
    }

    const updated = await prisma.systemSetting.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        evolutionUrl: String(evolutionUrl).trim(),
        evolutionApiKey: String(evolutionApiKey).trim(),
      },
      update: {
        evolutionUrl: String(evolutionUrl).trim(),
        evolutionApiKey: String(evolutionApiKey).trim(),
      },
    });

    return NextResponse.json({ ok: true, setting: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao salvar configuracoes" },
      { status: 500 }
    );
  }
}
