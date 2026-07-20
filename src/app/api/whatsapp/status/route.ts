import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { getConnectionState, instanceNameForTenant } from "@/lib/whatsapp/evolution";

export async function GET() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { tenantId } = ctx;
  const instanceName = instanceNameForTenant(tenantId);

  try {
    const conn = await prisma.whatsappConnection.findUnique({
      where: { tenantId },
    });

    if (!conn) {
      return NextResponse.json({
        state: "DISCONNECTED",
        exists: false,
        number: null,
      });
    }

    const state = await getConnectionState(instanceName);

    let mappedStatus = conn.status;
    if (state.state === "open") {
      mappedStatus = "CONNECTED";
    } else if (state.state === "connecting") {
      mappedStatus = "CONNECTING";
    } else if (state.state === "close" || !state.exists) {
      mappedStatus = "DISCONNECTED";
    }

    if (mappedStatus !== conn.status || (state.number && state.number !== conn.connectedNumber)) {
      await prisma.whatsappConnection.update({
        where: { tenantId },
        data: {
          status: mappedStatus,
          connectedNumber: state.number ?? conn.connectedNumber,
          ...(mappedStatus === "CONNECTED" ? { lastConnectedAt: new Date() } : {}),
        },
      });
    }

    return NextResponse.json({
      state: mappedStatus === "CONNECTED" ? "open" : mappedStatus.toLowerCase(),
      status: mappedStatus,
      exists: state.exists,
      number: state.number ?? conn.connectedNumber,
      connection: {
        id: conn.id,
        instanceName: conn.instanceName,
        aiClientEnabled: conn.aiClientEnabled,
        aiOperatorEnabled: conn.aiOperatorEnabled,
        operatorPrompt: conn.operatorPrompt,
        clientPrompt: conn.clientPrompt,
      },
    });
  } catch (err) {
    console.error("[whatsapp/status] erro:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao checar status" },
      { status: 500 }
    );
  }
}
