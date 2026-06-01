// ENDPOINT TEMPORARIO DE DIAGNOSTICO - REMOVER APOS RESOLVER PROBLEMA
// Verifica se a env ASAAS_API_KEY chega intacta ao runtime da Vercel.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";

export async function GET() {
  const s = await getSession();
  if (!s || !isSuperAdmin(s.role)) {
    return NextResponse.json({ error: "Apenas SUPER_ADMIN" }, { status: 403 });
  }

  const raw = process.env.ASAAS_API_KEY || "";
  const rawUrl = process.env.ASAAS_API_URL || "";

  // Hex dump dos primeiros e ultimos 6 bytes pra detectar caracteres invisiveis
  function bytes(s: string, n: number, fromEnd = false) {
    const slice = fromEnd ? s.slice(-n) : s.slice(0, n);
    return Array.from(slice).map((c) => {
      const cp = c.codePointAt(0)!;
      return { char: cp >= 0x20 && cp <= 0x7e ? c : `\\u${cp.toString(16).padStart(4, "0")}`, code: cp };
    });
  }

  // Testa a chave direto contra Asaas
  let asaasTest: any = null;
  try {
    const url = (rawUrl || "https://api.asaas.com/v3").replace(/[^\x20-\x7E]/g, "");
    const key = raw.replace(/[^\x20-\x7E]/g, "").trim();
    const res = await fetch(`${url}/customers?limit=1`, {
      headers: { access_token: key, "Content-Type": "application/json" },
      cache: "no-store",
    });
    const body = await res.text();
    asaasTest = { status: res.status, bodySnippet: body.slice(0, 200) };
  } catch (e: any) {
    asaasTest = { error: e.message };
  }

  return NextResponse.json({
    keyLength: raw.length,
    keyHead: bytes(raw, 15),
    keyTail: bytes(raw, 15, true),
    urlLength: rawUrl.length,
    urlValue: rawUrl,
    asaasTest,
  });
}
