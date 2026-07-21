import { sendText, getConnectionState } from "../src/lib/whatsapp/evolution";

async function testSend() {
  const instance = "bp-cmppxb85v00047xcs89wrh1wl"; // VETZ instance
  const testPhone = "5521997267809"; // Jesse's phone in VETZ test phones

  console.log(`Checking connection state for ${instance}...`);
  const state = await getConnectionState(instance);
  console.log("Connection State:", state);

  console.log(`Sending test text to ${testPhone}...`);
  const res = await sendText(instance, testPhone, "Olá! Teste de envio por dentro do sistema BilyVet.");
  console.log("Send Result status:", res.status);
  console.log("Send Result data:", JSON.stringify(res.data, null, 2));
}

testSend().catch(console.error);
