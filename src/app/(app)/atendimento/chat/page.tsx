import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChatInboxClient } from "./ChatInboxClient";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  await requireModule("atendimento");

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden space-y-3">
      <PageHeader
        title="Bate-papo WhatsApp"
        description="Converse em tempo real com clientes e acompanhe as respostas do Agente IA por dentro da plataforma."
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatInboxClient />
      </div>
    </div>
  );
}
