"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type StatusOpt = {
  id: string;
  name: string;
  color: string;
};

export function PipelineSelect({
  id,
  currentStatus,
  statuses,
}: {
  id: string;
  currentStatus: string;
  statuses: StatusOpt[];
}) {
  const router = useRouter();
  const [st, setSt] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const selectedStatusColor = statuses.find((x) => x.name === st)?.color ?? "#cbd5e1";

  async function update(value: string) {
    setLoading(true);
    // Unifica o status atualizando tanto status quanto pipelineStage para o mesmo valor
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value, pipelineStage: value }),
    });
    if (res.ok) {
      setSt(value);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="h-3 w-3 rounded-full shrink-0 shadow-soft" style={{ backgroundColor: selectedStatusColor }} />
      <select
        className="input py-1 font-semibold text-slate-800"
        value={st}
        disabled={loading}
        onChange={(e) => update(e.target.value)}
        style={{ borderColor: selectedStatusColor }}
      >
        {statuses.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name.replace(/_/g, " ").toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
