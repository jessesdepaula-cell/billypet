// Envio de email transacional via Resend.
// Se RESEND_API_KEY nao estiver setada, o envio vira no-op (apenas loga no console)
// e o link bruto e devolvido pelo caller para o super-admin entregar manualmente.

const FROM = process.env.RESEND_FROM || "BilyVet <no-reply@bilyvet.com.br>";
const API_KEY = process.env.RESEND_API_KEY;

export function emailIsConfigured() {
  return Boolean(API_KEY);
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!API_KEY) {
    console.log("[email] RESEND_API_KEY ausente. Email NAO enviado:", { to: input.to, subject: input.subject });
    return { ok: false, error: "RESEND_API_KEY nao configurada" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[email] Resend erro:", res.status, data);
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }
    return { ok: true, id: data?.id };
  } catch (err: any) {
    console.error("[email] Falha de rede:", err);
    return { ok: false, error: err.message };
  }
}

export function passwordResetEmail(opts: { link: string; isNewAccount?: boolean }) {
  const title = opts.isNewAccount ? "Bem-vindo a BilyVet" : "Recuperacao de senha";
  const intro = opts.isNewAccount
    ? "Sua conta na BilyVet foi criada. Para definir sua senha de acesso e completar o cadastro, clique no botao abaixo."
    : "Recebemos um pedido para redefinir a senha da sua conta BilyVet. Clique no botao abaixo para escolher uma nova senha.";
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:24px 28px;color:#fff;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.15);display:inline-block;text-align:center;line-height:36px;font-weight:700;">B</div>
        <span style="font-size:20px;font-weight:700;vertical-align:middle;">BilyVet</span>
      </div>
    </div>
    <div style="padding:28px;">
      <h1 style="font-size:20px;margin:0 0 12px;">${title}</h1>
      <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 20px;">${intro}</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${opts.link}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block;">
          Definir minha senha
        </a>
      </p>
      <p style="font-size:12px;color:#64748b;line-height:1.5;margin:16px 0 0;">
        Se o botao nao funcionar, copie e cole este link no navegador:<br/>
        <span style="word-break:break-all;color:#2563eb;">${opts.link}</span>
      </p>
      <p style="font-size:12px;color:#94a3b8;margin-top:24px;">
        Este link expira em 24 horas. Caso voce nao tenha solicitado, ignore este email.
      </p>
    </div>
    <div style="background:#f8fafc;padding:14px 28px;font-size:12px;color:#94a3b8;text-align:center;">
      BilyVet - Gestao veterinaria completa
    </div>
  </div>
</body></html>`;
  const text = `${title}\n\n${intro}\n\nAbra este link: ${opts.link}\n\nO link expira em 24h.`;
  return { html, text };
}
