import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const pet = await prisma.pet.findFirst({ where: { id: params.id, tutor: { tenantId: ctx.tenantId } } });
  if (!pet) return NextResponse.json({ error: "Pet nao encontrado" }, { status: 404 });

  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    if (!file) {
      return NextResponse.json({ error: "Arquivo nao fornecido" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filepath = join(uploadDir, uniqueFilename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${uniqueFilename}`;

    const attachment = await prisma.petAttachment.create({
      data: {
        petId: params.id,
        name: file.name,
        url,
        fileSize: file.size,
      },
    });

    return NextResponse.json(attachment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const pet = await prisma.pet.findFirst({ where: { id: params.id, tutor: { tenantId: ctx.tenantId } } });
  if (!pet) return NextResponse.json({ error: "Pet nao encontrado" }, { status: 404 });

  const list = await prisma.petAttachment.findMany({
    where: { petId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(list);
}
