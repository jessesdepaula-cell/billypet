import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!isSuperAdmin(s.role)) return NextResponse.json({ error: "Apenas SUPER_ADMIN" }, { status: 403 });

  await prisma.tenant.update({ where: { id: params.id }, data: { status: "ACTIVE" } });
  return NextResponse.json({ ok: true });
}
