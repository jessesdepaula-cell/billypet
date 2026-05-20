"use client";

import { useRouter } from "next/navigation";

export function ReceiveClient({ id, amount }: { id: string; amount: number }) {
  const router = useRouter();
  async function receive() {
    if (!confirm("Confirmar recebimento?")) return;
    await fetch("/api/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "receivable", id, amount }) });
    router.refresh();
  }
  return <button onClick={receive} className="text-emerald-600 hover:underline text-sm">receber</button>;
}
