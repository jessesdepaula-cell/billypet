import { NextResponse } from "next/server";
import { del as blobDel } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { id: string; attachmentId: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const att = await prisma.petAttachment.findFirst({
    where: { id: params.attachmentId, petId: params.id },
  });
  if (!att) return NextResponse.json({ error: "Anexo nao encontrado" }, { status: 404 });

  // Novo fluxo: anexo no Vercel Blob -> redireciona pra URL publica
  if (att.url) {
    return NextResponse.redirect(att.url);
  }

  // Legado: arquivo armazenado em base64 no Postgres
  if (!att.fileData) {
    return NextResponse.json({ error: "Anexo sem conteudo" }, { status: 410 });
  }
  const buffer = Buffer.from(att.fileData, "base64");
  return new Response(buffer, {
    headers: {
      "Content-Type": att.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(att.name)}"`,
    },
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string; attachmentId: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const existing = await prisma.petAttachment.findFirst({
    where: { id: params.attachmentId, petId: params.id },
  });
  if (!existing) return NextResponse.json({ error: "Anexo nao encontrado" }, { status: 404 });

  // Se for anexo no Vercel Blob, tenta remover do storage (best-effort)
  if (existing.url && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await blobDel(existing.url);
    } catch (e) {
      console.warn("Falha ao remover blob do Vercel Blob:", e);
    }
  }

  await prisma.petAttachment.delete({
    where: { id: params.attachmentId },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "DELETE_FILE",
      entity: "Pet",
      entityId: params.id,
      details: existing.name,
    },
  });

  return NextResponse.json({ ok: true });
}
