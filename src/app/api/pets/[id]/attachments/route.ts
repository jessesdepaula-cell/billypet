import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, tutor: { tenantId: ctx.tenantId } },
  });
  if (!pet) return NextResponse.json({ error: "Pet nao encontrado" }, { status: 404 });

  const list = await prisma.petAttachment.findMany({
    where: { petId: params.id },
    select: { id: true, name: true, mimeType: true, sizeBytes: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(list);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, tutor: { tenantId: ctx.tenantId } },
  });
  if (!pet) return NextResponse.json({ error: "Pet nao encontrado" }, { status: 404 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const nameField = formData.get("name") as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Arquivo e obrigatorio" }, { status: 400 });
    }

    const name = (nameField || file.name || "arquivo").trim();
    const mimeType = file.type || "application/octet-stream";
    const sizeBytes = file.size;

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileData = buffer.toString("base64");

    const att = await prisma.petAttachment.create({
      data: {
        petId: params.id,
        name,
        mimeType,
        sizeBytes,
        fileData,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: ctx.tenantId,
        userId: ctx.session.id,
        action: "ATTACH_FILE",
        entity: "Pet",
        entityId: params.id,
        details: name,
      },
    });

    return NextResponse.json({ id: att.id, name: att.name });
  } catch (err: any) {
    console.error("Erro ao salvar anexo:", err);
    return NextResponse.json({ error: err.message || "Erro ao salvar anexo no banco de dados" }, { status: 500 });
  }
}
