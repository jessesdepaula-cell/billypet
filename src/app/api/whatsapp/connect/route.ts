import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { connect, instanceNameForTenant } from "@/lib/whatsapp/evolution";

export async function POST() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { tenantId } = ctx;
  const instanceName = instanceNameForTenant(tenantId);

  try {
    // Busca ou cria o registro de conexao no banco
    let connection = await prisma.whatsappConnection.findUnique({
      where: { tenantId },
    });

    if (!connection) {
      connection = await prisma.whatsappConnection.create({
        data: {
          tenantId,
          instanceName,
          status: "CONNECTING",
        },
      });
    }

    // Chama a Evolution API para criar a instancia (se nao existir) e retornar o QR Code
    const { base64, pairingCode } = await connect(instanceName);

    await prisma.whatsappConnection.update({
      where: { tenantId },
      data: { status: "CONNECTING" },
    });

    return NextResponse.json({
      ok: true,
      instanceName,
      status: "CONNECTING",
      base64,
      pairingCode,
    });
  } catch (err) {
    console.error("[whatsapp/connect] erro:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar QR Code" },
      { status: 500 }
    );
  }
}
