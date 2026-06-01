"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assinatura/sync", { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha ao sincronizar");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button onClick={run} disabled={loading} className="btn-outline inline-flex items-center gap-2">
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Atualizando..." : "Atualizar status"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
