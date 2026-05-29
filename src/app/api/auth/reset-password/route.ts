import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  const name = body.name ? String(body.name).trim() : undefined;

  if (!token || !password) {
    return NextResponse.json({ error: "Token e senha sao obrigatorios" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter ao menos 6 caracteres" }, { status: 400 });
  }

  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link invalido ou expirado" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: reset.email } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      ...(name ? { name } : {}),
    },
  });

  // Se o nome do tenant ainda for o placeholder (igual ao email), atualiza
  if (name && user.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (tenant && (tenant.companyName === user.email.split("@")[0] || tenant.companyName === user.email)) {
      await prisma.tenant.update({ where: { id: tenant.id }, data: { companyName: name } });
    }
  }

  await prisma.passwordResetToken.update({
    where: { id: reset.id },
    data: { usedAt: new Date() },
  });

  // Loga o usuario automaticamente
  const token2 = await signSession({
    id: user.id,
    name: name || user.name,
    email: user.email,
    role: user.role,
    unitId: user.unitId,
    tenantId: user.tenantId,
  });
  await setSessionCookie(token2);

  return NextResponse.json({ ok: true });
}
