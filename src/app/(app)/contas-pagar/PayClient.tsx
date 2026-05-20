"use client";

import { useRouter } from "next/navigation";

export function PayClient({ id, kind }: { id: string; kind: "payable" | "receivable" }) {
  const router = useRouter();
  async function pay() {
    if (!confirm("Confirmar pagamento?")) return;
    await fetch("/api/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id }) });
    router.refresh();
  }
  return <button onClick={pay} className="text-emerald-600 hover:underline text-sm">pagar</button>;
}
