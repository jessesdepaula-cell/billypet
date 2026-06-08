"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle2 } from "lucide-react";

export function SyncAllButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/super-admin/tenants/sync-all", {
        method: "POST",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha na sincronização.");

      setSuccess(true);
      router.refresh();
      
      // Reseta o estado de sucesso depois de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={loading}
        className={`btn text-xs font-semibold px-4 py-2 flex items-center gap-2 shadow-soft transition-all duration-300 ${
          success
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
        }`}
      >
        {success ? (
          <>
            <CheckCircle2 className="h-4 w-4 animate-bounce" />
            Concluído!
          </>
        ) : (
          <>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Sincronizando..." : "Sincronizar Todas"}
          </>
        )}
      </button>

      {error && (
        <span className="text-[10px] text-red-600 bg-red-50 border border-red-100 rounded px-2 py-0.5 mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
