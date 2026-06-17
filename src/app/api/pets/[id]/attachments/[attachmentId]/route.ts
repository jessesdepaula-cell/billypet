import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request, { params }: { params: { id: string; attachmentId: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const att = await prisma.petAttachment.findFirst({
    where: { id: params.attachmentId, petId: params.id },
  });
  if (!att) return NextResponse.json({ error: "Anexo nao encontrado" }, { status: 404 });

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
