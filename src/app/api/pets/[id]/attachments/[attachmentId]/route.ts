import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(req: Request, { params }: { params: { id: string; attachmentId: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const attachment = await prisma.petAttachment.findFirst({
    where: {
      id: params.attachmentId,
      pet: { id: params.id, tutor: { tenantId: ctx.tenantId } },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Anexo nao encontrado" }, { status: 404 });
  }

  try {
    const filename = attachment.url.replace("/uploads/", "");
    const filepath = join(process.cwd(), "public", "uploads", filename);
    await unlink(filepath);
  } catch (err) {
    console.warn("Nao foi possivel deletar o arquivo fisico:", err);
  }

  await prisma.petAttachment.delete({ where: { id: params.attachmentId } });
  return NextResponse.json({ ok: true });
}
