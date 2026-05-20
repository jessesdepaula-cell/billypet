"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Subscription = { id: string; status: string; value: number; asaasSubscriptionId?: string | null };
type Tenant = {
  id: string;
  status: string;
  asaasCustomerId?: string | null;
  subscriptions: Subscription[];
};

export function TenantActions({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeSub = tenant.subscriptions.find((s) => s.status === "ACTIVE" || s.status === "PENDING" || s.status === "OVERDUE");

  async function call(action: string, body?: any) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenant.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erro");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card card-pad space-y-3">
      <div className="flex flex-wrap gap-2">
        {!activeSub && (
          <button className="btn-primary" disabled={!!loading} onClick={() => call("subscribe", { value: 247, billingType: "UNDEFINED" })}>
            {loading === "subscribe" ? "Criando..." : "Criar assinatura R$ 247/mes"}
          </button>
        )}
        {activeSub && (
          <button className="btn-outline" disabled={!!loading} onClick={() => call("cancel")}>
            {loading === "cancel" ? "Cancelando..." : "Cancelar assinatura"}
          </button>
        )}
        <button className="btn-outline" disabled={!!loading} onClick={() => call("sync")}>
          {loading === "sync" ? "Sincronizando..." : "Sincronizar com Asaas"}
        </button>
        <button className="btn-outline" disabled={!!loading} onClick={() => call("suspend")}>
          Suspender acesso
        </button>
        <button className="btn-outline" disabled={!!loading} onClick={() => call("activate")}>
          Reativar
        </button>
      </div>
      {tenant.asaasCustomerId && (
        <div className="text-xs text-slate-500">
          Asaas Customer ID: <span className="font-mono">{tenant.asaasCustomerId}</span>
        </div>
      )}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}
    </div>
  );
}
