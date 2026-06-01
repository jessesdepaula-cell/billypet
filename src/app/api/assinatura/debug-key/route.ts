// DIAGNOSTICO TEMPORARIO
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Login obrigatorio" }, { status: 401 });

  const raw = process.env.ASAAS_API_KEY || "";
  const rawUrl = process.env.ASAAS_API_URL || "";
  const key = raw.replace(/[^\x20-\x7E]/g, "").trim();
  const url = (rawUrl.replace(/[^\x20-\x7E]/g, "") || "https://api.asaas.com/v3");

  let outboundIp = "unknown";
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    outboundIp = (await ipRes.json()).ip;
  } catch {}

  let asaasGet: any = null;
  try {
    const r = await fetch(`${url}/customers?limit=1`, {
      headers: { access_token: key, "Content-Type": "application/json" },
      cache: "no-store",
    });
    asaasGet = { status: r.status, body: (await r.text()).slice(0, 300) };
  } catch (e: any) {
    asaasGet = { error: e.message };
  }

  return NextResponse.json({
    deployCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "?",
    deployUrl: process.env.VERCEL_URL || "?",
    storedKeyLength: raw.length,
    sanitizedKeyLength: key.length,
    keyHead: key.slice(0, 15),
    keyTail: key.slice(-15),
    urlValue: url,
    vercelEgressIp: outboundIp,
    asaasResponse: asaasGet,
  });
}
