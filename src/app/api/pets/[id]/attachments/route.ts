import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, tutor: { tenantId: ctx.tenantId } },
  });
  if (!pet) return NextResponse.json({ error: "Pet nao encontrado" }, { status: 404 });

  const list = await prisma.petAttachment.findMany({
    where: { petId: params.id },
    select: { id: true, name: true, mimeType: true, sizeBytes: true, createdAt: true, url: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(list);
}

// Suporta dois fluxos:
// 1. JSON com HandleUploadBody  -> fluxo direto Vercel Blob (arquivos grandes, ate 50MB)
// 2. multipart/form-data        -> fallback legado em base64 no Postgres (ate ~4MB)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const contentType = req.headers.get("content-type") || "";

  // ===== Fluxo Vercel Blob (client upload direto, bypassa limite 4.5MB da Vercel) =====
  if (contentType.includes("application/json")) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Vercel Blob nao configurado. Adicione BLOB_READ_WRITE_TOKEN no painel Vercel." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as HandleUploadBody;

    try {
      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (_pathname, clientPayload) => {
          // A geracao do token e solicitada pelo cliente autenticado (contem cookies de sessao)
          const ctx = await requireTenantApi();
          if (isTenantError(ctx)) {
            throw new Error("Nao autenticado");
          }

          const pet = await prisma.pet.findFirst({
            where: { id: params.id, tutor: { tenantId: ctx.tenantId } },
          });
          if (!pet) {
            throw new Error("Pet nao encontrado");
          }

          const meta = clientPayload ? JSON.parse(clientPayload) : {};
          return {
            allowedContentTypes: [
              "application/pdf",
              "image/jpeg",
              "image/png",
              "image/webp",
              "image/gif",
            ],
            maximumSizeInBytes: 50 * 1024 * 1024,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({
              petId: params.id,
              tenantId: ctx.tenantId,
              userId: ctx.session.id,
              name: meta.name || _pathname,
              mimeType: meta.mimeType || "application/octet-stream",
              sizeBytes: meta.sizeBytes || 0,
            }),
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          // O webhook e chamado pela Vercel (sincronizacao em segundo plano, sem cookies de sessao)
          // Usamos os metadados validados do tokenPayload
          const meta = tokenPayload ? JSON.parse(tokenPayload) : {};
          await prisma.petAttachment.create({
            data: {
              petId: meta.petId,
              name: meta.name || blob.pathname,
              mimeType: meta.mimeType || blob.contentType || "application/octet-stream",
              sizeBytes: meta.sizeBytes || 0,
              url: blob.url,
            },
          });
          await prisma.auditLog.create({
            data: {
              tenantId: meta.tenantId,
              userId: meta.userId,
              action: "ATTACH_FILE",
              entity: "Pet",
              entityId: meta.petId,
              details: meta.name || blob.pathname,
            },
          });
        },
      });
      return NextResponse.json(jsonResponse);
    } catch (err: any) {
      console.error("Erro no upload Vercel Blob:", err);
      return NextResponse.json({ error: err.message || "Erro ao processar upload" }, { status: 400 });
    }
  }

  // ===== Fallback FormData legado =====
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
