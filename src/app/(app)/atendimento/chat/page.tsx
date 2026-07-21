import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChatInboxClient } from "./ChatInboxClient";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  await requireModule("atendimento");

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[520px]">
      <PageHeader
        title="Bate-papo WhatsApp"
        description="Converse em tempo real com clientes e acompanhe as respostas do Agente IA por dentro da plataforma."
      />

      <div className="flex-1 min-h-0">
        <ChatInboxClient />
      </div>
    </div>
  );
}
