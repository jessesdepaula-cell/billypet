import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhatsAppConnect } from "@/components/whatsapp/WhatsAppConnect";
import { WhatsAppSettingsClient } from "./WhatsAppSettingsClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppConfigPage() {
  await requireModule("configuracoes");

  return (
    <>
      <PageHeader
        title="Conexão WhatsApp & Agente IA"
        description="Conecte seu celular por QR Code e configure o Agente IA autônomo da sua assinatura."
      />

      <div className="space-y-6">
        {/* QR Code & Status */}
        <WhatsAppConnect />

        {/* Gerenciamento de Operadores e Instrucoes da IA */}
        <WhatsAppSettingsClient />
      </div>
    </>
  );
}
