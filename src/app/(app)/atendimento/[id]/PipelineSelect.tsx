"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STAGES = ["AGUARDANDO", "RECEPCAO", "TRIAGEM", "EM_CONSULTA", "EXAMES", "BANHO_TOSA", "INTERNACAO", "PAGAMENTO", "FINALIZADO"];
const STATUS = ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO", "FINALIZADO", "CANCELADO", "NAO_COMPARECEU"];

export function PipelineSelect({ id, status, stage }: { id: string; status: string; stage: string }) {
  const router = useRouter();
  const [st, setSt] = useState(status);
  const [stg, setStg] = useState(stage);

  async function update(field: "status" | "pipelineStage", value: string) {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-xs">
      <select className="input py-1" value={st} onChange={(e) => { setSt(e.target.value); update("status", e.target.value); }}>
        {STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
      </select>
      <select className="input py-1" value={stg} onChange={(e) => { setStg(e.target.value); update("pipelineStage", e.target.value); }}>
        {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
      </select>
    </div>
  );
}
