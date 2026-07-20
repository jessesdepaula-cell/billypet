/**
 * Integracao com a Evolution API (WhatsApp) — reaproveita o servidor Evolution
 * que ja roda na Railway (o mesmo da Clara / Conecta+). Uma instancia isolada
 * por ASSINATURA (tenant): `bp-<tenantId>`. Sem SDK — apenas fetch.
 *
 * O servidor e a chave sao da PLATAFORMA. O assinante nao configura nada:
 * ele so escaneia o QR Code dentro do painel dele.
 *
 * Envs necessarias:
 *   EVOLUTION_API_URL        ex.: https://evolution-api-production-xxxx.up.railway.app
 *   EVOLUTION_API_KEY        AUTHENTICATION_API_KEY do servidor Evolution
 *   WHATSAPP_WEBHOOK_SECRET  segredo anexado como ?secret= na URL do webhook
 *   APP_URL                  URL publica desta app (para a Evolution alcancar o webhook)
 */

const EVENTS = ["MESSAGES_UPSERT", "CONNECTION_UPDATE"] as const;

function baseUrl() {
  const url = process.env.EVOLUTION_API_URL;
  if (!url) throw new Error("EVOLUTION_API_URL ausente");
  return url.replace(/\/$/, "");
}

function apiKey() {
  const key = process.env.EVOLUTION_API_KEY;
  if (!key) throw new Error("EVOLUTION_API_KEY ausente");
  return key;
}

/** Nome da instancia Evolution desta assinatura. Isolamento por tenant. */
export function instanceNameForTenant(tenantId: string) {
  return `bp-${tenantId}`;
}

/** URL publica do webhook desta app (a Evolution precisa alcancar em producao). */
export function webhookUrl() {
  if (process.env.WHATSAPP_WEBHOOK_URL) return process.env.WHATSAPP_WEBHOOK_URL;
  const appUrl = (
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
  ).replace(/\/$/, "");
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  const qs = secret ? `?secret=${encodeURIComponent(secret)}` : "";
  return `${appUrl}/api/whatsapp/webhook${qs}`;
}

type EvoResponse = { ok: boolean; status: number; data: unknown };

async function evoFetch(
  path: string,
  method: "GET" | "POST" | "DELETE" | "PUT" = "GET",
  body?: unknown,
): Promise<EvoResponse> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: { "Content-Type": "application/json", apikey: apiKey() },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { ok: res.ok, status: res.status, data };
}

/** Configura (ou reconfigura) o webhook da instancia apontando para esta app. */
export async function setWebhook(instance: string) {
  // Evolution v2.2+ espera { webhook: { ... } }; toleramos falha silenciosa.
  return evoFetch(`/webhook/set/${instance}`, "POST", {
    webhook: {
      enabled: true,
      url: webhookUrl(),
      byEvents: false,
      base64: true,
      events: EVENTS,
    },
  });
}

/**
 * Garante que a instancia existe. Se nao existir, cria (Baileys + QR) ja com o
 * webhook configurado. Idempotente: se ja existe, apenas reconfigura o webhook.
 */
export async function ensureInstance(instance: string) {
  const state = await getConnectionState(instance);
  if (state.exists) {
    await setWebhook(instance);
    return { created: false };
  }

  const created = await evoFetch("/instance/create", "POST", {
    instanceName: instance,
    integration: "WHATSAPP-BAILEYS",
    qrcode: true,
    webhook: {
      url: webhookUrl(),
      byEvents: false,
      base64: true,
      events: EVENTS,
    },
  });

  // Alguns builds ignoram o webhook no create — reforca via /webhook/set.
  await setWebhook(instance);

  if (!created.ok) {
    throw new Error(
      `Falha ao criar instancia Evolution (${created.status}): ${JSON.stringify(created.data)}`,
    );
  }
  return { created: true };
}

/** Retorna o QR (base64/pairingCode) para escanear. Cria a instancia se preciso. */
export async function connect(instance: string) {
  await ensureInstance(instance);
  const res = await evoFetch(`/instance/connect/${instance}`, "GET");
  const data = (res.data ?? {}) as Record<string, unknown>;
  // Normaliza os diferentes formatos de resposta do Evolution.
  const qrObj = (data.qrcode ?? data) as Record<string, unknown>;
  const base64 =
    (qrObj.base64 as string | undefined) ?? (data.base64 as string | undefined) ?? null;
  const code = (qrObj.code as string | undefined) ?? (data.code as string | undefined) ?? null;
  const pairingCode =
    (qrObj.pairingCode as string | undefined) ??
    (data.pairingCode as string | undefined) ??
    null;
  return { base64, code, pairingCode };
}

type ConnState = {
  exists: boolean;
  /** "open" (conectado), "connecting", "close", ou null se nao existe. */
  state: "open" | "connecting" | "close" | null;
  /** Numero conectado (quando a Evolution informa). */
  number: string | null;
};

export async function getConnectionState(instance: string): Promise<ConnState> {
  const res = await evoFetch(`/instance/connectionState/${instance}`, "GET");
  if (res.status === 404) return { exists: false, state: null, number: null };
  const data = (res.data ?? {}) as Record<string, unknown>;
  const inner = (data.instance ?? data) as Record<string, unknown>;
  const state = (inner.state as ConnState["state"]) ?? null;
  const owner = (inner.owner ?? inner.ownerJid ?? inner.number) as string | undefined;
  return {
    exists: res.ok,
    state,
    number: owner ? String(owner).split("@")[0] : null,
  };
}

/** Desconecta (logout) a instancia — mantem a instancia criada para reconectar. */
export async function logout(instance: string) {
  return evoFetch(`/instance/logout/${instance}`, "DELETE");
}

/** Remove a instancia por completo. */
export async function deleteInstance(instance: string) {
  return evoFetch(`/instance/delete/${instance}`, "DELETE");
}

/** Envia uma mensagem de texto. `number` = telefone com DDI (so digitos). */
export async function sendText(instance: string, number: string, text: string) {
  const digits = number.replace(/\D/g, "");
  return evoFetch(`/message/sendText/${instance}`, "POST", { number: digits, text });
}

/** Baixa o base64 de uma midia (ex.: audio) a partir da mensagem recebida. */
export async function getBase64FromMediaMessage(
  instance: string,
  message: unknown,
): Promise<string | null> {
  const res = await evoFetch(`/chat/getBase64FromMediaMessage/${instance}`, "POST", {
    message,
    convertToMp4: false,
  });
  const data = (res.data ?? {}) as Record<string, unknown>;
  return (data.base64 as string | undefined) ?? null;
}
