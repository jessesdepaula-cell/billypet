import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { logout, deleteInstance, instanceNameForTenant } from "@/lib/whatsapp/evolution";

export async function POST() {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { tenantId } = ctx;
  const instanceName = instanceNameForTenant(tenantId);

  try {
    // Tenta deslogar e excluir da Evolution API
    try {
      await logout(instanceName);
      await deleteInstance(instanceName);
    } catch (e) {
      console.warn("[whatsapp/disconnect] aviso ao deslogar evolution:", e);
    }

    await prisma.whatsappConnection.updateMany({
      where: { tenantId },
      data: {
        status: "DISCONNECTED",
        connectedNumber: null,
      },
    });

    return NextResponse.json({ ok: true, status: "DISCONNECTED" });
  } catch (err) {
    console.error("[whatsapp/disconnect] erro:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao desconectar WhatsApp" },
      { status: 500 }
    );
  }
}
