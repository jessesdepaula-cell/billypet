import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== "billydev123") {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const attachments = await prisma.petAttachment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        petId: true,
        name: true,
        mimeType: true,
        sizeBytes: true,
        url: true,
        createdAt: true,
      }
    });

    const pets = await prisma.pet.findMany({
      take: 5,
      select: { id: true, name: true }
    });

    return NextResponse.json({
      success: true,
      logsCount: logs.length,
      attachmentsCount: attachments.length,
      recentLogs: logs,
      recentAttachments: attachments,
      recentPets: pets,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro no debug" }, { status: 500 });
  }
}
