"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReceivableActions({ tutors }: { tutors: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ tutorId: "", description: "", amount: 0, dueDate: "", installment: "" });

  async function create() {
    if (!f.description || !f.dueDate) return alert("Preencha descricao e vencimento");
    await fetch("/api/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "receivable", ...f }) });
    setOpen(false); router.refresh();
  }

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="btn-primary">{open ? "Fechar" : "+ Nova conta a receber"}</button>
      {open && (
        <div className="card card-pad mt-2 grid sm:grid-cols-3 gap-2">
          <select className="input" value={f.tutorId} onChange={(e) => setF({ ...f, tutorId: e.target.value })}>
            <option value="">Tutor</option>{tutors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input className="input sm:col-span-2" placeholder="Descricao" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <input className="input" type="number" step="0.01" placeholder="Valor" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
          <input className="input" type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} />
          <input className="input" placeholder="Parcela (ex: 1/3)" value={f.installment} onChange={(e) => setF({ ...f, installment: e.target.value })} />
          <button onClick={create} className="btn-primary sm:col-span-3">Salvar</button>
        </div>
      )}
    </div>
  );
}
