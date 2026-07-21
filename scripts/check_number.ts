import { getEvolutionConfig } from "../src/lib/whatsapp/evolution";

async function checkNumber() {
  const cfg = await getEvolutionConfig();
  const instance = "bp-cmppxb85v00047xcs89wrh1wl";
  const phones = ["5521996526202", "552196526202", "5521997267809"];

  for (const phone of phones) {
    console.log(`\nChecking number on WhatsApp: ${phone}`);
    const res = await fetch(`${cfg.baseUrl}/chat/whatsappNumbers/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: cfg.apiKey },
      body: JSON.stringify({ numbers: [phone] })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Result:", text);
  }
}

checkNumber().catch(console.error);
