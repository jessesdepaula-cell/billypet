import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { sendEmail, passwordResetEmail } from "@/lib/email";

function getAppUrl(req: Request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email obrigatorio" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  // Resposta generica para evitar enumeracao de emails
  const generic = NextResponse.json({ ok: true, message: "Se o email existir, enviamos um link para redefinir a senha." });

  if (!user || !user.isActive) return generic;

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const link = `${getAppUrl(req)}/redefinir-senha?token=${token}`;
  const { html, text } = passwordResetEmail({ link, isNewAccount: false });
  await sendEmail({
    to: email,
    subject: "BilyVet - redefinicao de senha",
    html,
    text,
  });

  return generic;
}
