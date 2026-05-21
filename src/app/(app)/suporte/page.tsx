import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { fmtDateTime } from "@/lib/utils";
import { TicketForm } from "./TicketForm";

export default async function SuportePage() {
  const tickets = await prisma.supportTicket.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <>
      <PageHeader title="Central de ajuda e suporte" description="Tutoriais, FAQ e chamados internos" />

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="card card-pad lg:col-span-2">
          <h3 className="font-semibold mb-3">Tutoriais</h3>
          <ul className="space-y-2 text-sm">
            <li className="border-b border-slate-100 pb-2">▶ Primeiros passos: cadastrar tutores e pets</li>
            <li className="border-b border-slate-100 pb-2">▶ Como abrir e fechar o caixa diario</li>
            <li className="border-b border-slate-100 pb-2">▶ Criando um agendamento e movendo na esteira</li>
            <li className="border-b border-slate-100 pb-2">▶ Registrando ficha clinica e gerando receita</li>
            <li className="border-b border-slate-100 pb-2">▶ Vendendo pacotes de banho</li>
            <li className="border-b border-slate-100 pb-2">▶ Controle de internacao</li>
            <li>▶ Movimentacoes de estoque e transferencias entre unidades</li>
          </ul>
        </div>
        <div className="card card-pad">
          <h3 className="font-semibold mb-3">FAQ</h3>
          <details className="mb-2"><summary className="font-medium cursor-pointer">Como esqueci minha senha?</summary><p className="text-sm text-slate-600 mt-1">Contate o administrador da clinica para reset.</p></details>
          <details className="mb-2"><summary className="font-medium cursor-pointer">Posso ter mais de uma unidade?</summary><p className="text-sm text-slate-600 mt-1">Sim, o BilyVet ja vem com suporte multiunidades.</p></details>
          <details><summary className="font-medium cursor-pointer">O sistema integra com SEFAZ?</summary><p className="text-sm text-slate-600 mt-1">A estrutura esta preparada para integracao fiscal (NFe/NFSe).</p></details>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <TicketForm />
        <div className="lg:col-span-2 card overflow-hidden">
          <table className="bp-table">
            <thead><tr><th>Quando</th><th>Solicitante</th><th>Assunto</th><th>Status</th></tr></thead>
            <tbody>{tickets.map((t) => (
              <tr key={t.id}>
                <td className="text-xs">{fmtDateTime(t.createdAt)}</td>
                <td>{t.user.name}</td>
                <td>{t.subject}</td>
                <td><span className={t.status === "FECHADO" ? "badge-gray" : t.status === "RESOLVIDO" ? "badge-green" : "badge-yellow"}>{t.status.toLowerCase()}</span></td>
              </tr>
            ))}{tickets.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-500">Nenhum chamado.</td></tr>}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
