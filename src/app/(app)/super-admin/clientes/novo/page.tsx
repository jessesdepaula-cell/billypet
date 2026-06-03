import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { NovoClienteForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NovoClientePage() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!isSuperAdmin(s.role)) redirect("/dashboard");

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Novo cliente BilyVet</h1>
        <p className="text-sm text-slate-500">
          Informe apenas o email - o cliente recebe um link para definir a senha e completar o cadastro. Opcionalmente, ja cria a assinatura mensal de R$ 197 no Asaas.
        </p>
      </div>
      <NovoClienteForm />
    </div>
  );
}
