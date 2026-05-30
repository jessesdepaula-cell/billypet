"use client";

import { MODULE_GROUPS, defaultPermissionsForRole, type Role } from "@/lib/permissions";

export function PermissionsMatrix({
  role,
  selected,
  onChange,
  disabled,
}: {
  role: Role | string;
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const isAdmin = role === "ADMIN";
  const defaults = defaultPermissionsForRole(role);

  function toggle(slug: string, on: boolean) {
    if (disabled || isAdmin) return;
    const set = new Set(selected);
    if (on) set.add(slug); else set.delete(slug);
    onChange(Array.from(set));
  }

  function resetToDefault() {
    if (disabled || isAdmin) return;
    onChange([...defaults]);
  }

  function selectAll() {
    if (disabled || isAdmin) return;
    onChange(MODULE_GROUPS.flatMap((g) => g.modules.map((m) => m.slug)));
  }

  function clearAll() {
    if (disabled || isAdmin) return;
    onChange([]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="font-semibold text-sm text-slate-800">Permissoes de acesso</h4>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? "Administrador tem acesso total a todos os modulos (exceto super-admin)."
              : "Marque os modulos que este usuario pode acessar. O perfil sugere uma base, mas voce pode customizar."}
          </p>
        </div>
        {!isAdmin && (
          <div className="flex gap-1 text-xs">
            <button type="button" onClick={resetToDefault} className="btn-outline">Padrao do perfil</button>
            <button type="button" onClick={selectAll} className="btn-outline">Marcar todos</button>
            <button type="button" onClick={clearAll} className="btn-outline">Limpar</button>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULE_GROUPS.map((g) => (
          <div key={g.group} className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{g.group}</div>
            <ul className="space-y-1.5">
              {g.modules.map((m) => {
                const checked = isAdmin ? true : selected.includes(m.slug);
                const isDefault = defaults.includes(m.slug);
                return (
                  <li key={m.slug}>
                    <label className={`flex items-center gap-2 text-sm ${isAdmin || disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isAdmin || disabled}
                        onChange={(e) => toggle(m.slug, e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      <span className="flex-1">{m.label}</span>
                      {!isAdmin && isDefault && (
                        <span className="text-[10px] uppercase text-slate-400" title="Padrao do perfil">padrao</span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
