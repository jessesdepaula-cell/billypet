import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { parsePermissions } from "@/lib/permissions";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Informe e-mail e senha" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 401 });
  }
  const ok = bcrypt.compareSync(String(password), user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });

  const token = await signSession({
    id: user.id, name: user.name, email: user.email, role: user.role,
    unitId: user.unitId, tenantId: user.tenantId,
    permissions: parsePermissions(user.permissions),
  });
  await setSessionCookie(token);
  await prisma.auditLog.create({ data: { userId: user.id, action: "LOGIN", entity: "User", details: "Login realizado" } });
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
}
