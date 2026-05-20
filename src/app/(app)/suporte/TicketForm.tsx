"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TicketForm() {
  const router = useRouter();
  const [f, setF] = useState({ subject: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setSaving(false);
    if (res.ok) { setMsg("Chamado aberto!"); setF({ subject: "", body: "" }); router.refresh(); }
  }

  return (
    <form onSubmit={submit} className="card card-pad space-y-3">
      <h3 className="font-semibold">Abrir chamado interno</h3>
      <input className="input" placeholder="Assunto" required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
      <textarea className="input" rows={5} placeholder="Descreva sua duvida ou problema" required value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
      <button className="btn-primary w-full" disabled={saving}>{saving ? "Enviando..." : "Abrir chamado"}</button>
    </form>
  );
}
