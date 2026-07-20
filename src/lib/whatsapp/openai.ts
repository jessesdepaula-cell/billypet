/**
 * Cliente OpenAI minimo via fetch (sem SDK): chat com function-calling e
 * transcricao de audio (Whisper). Usa OPENAI_API_KEY do ambiente.
 */

const OPENAI_BASE = "https://api.openai.com/v1";

export function chatModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

function apiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY ausente");
  return key;
}

export type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; content: string; tool_call_id: string };

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ToolDef = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

type ChatResult = {
  content: string | null;
  toolCalls: ToolCall[];
};

export async function chat(messages: ChatMessage[], tools?: ToolDef[]): Promise<ChatResult> {
  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: chatModel(),
      messages,
      ...(tools && tools.length ? { tools, tool_choice: "auto" } : {}),
      temperature: 0.2,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI chat falhou (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string | null; tool_calls?: ToolCall[] } }>;
  };
  const message = data.choices?.[0]?.message;
  return {
    content: message?.content ?? null,
    toolCalls: message?.tool_calls ?? [],
  };
}

/** Transcreve um audio (base64) via Whisper. Retorna o texto em pt-BR. */
export async function transcribeAudio(base64: string, mimeType = "audio/ogg"): Promise<string> {
  const bytes = Buffer.from(base64, "base64");
  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
  const form = new FormData();
  form.append("file", blob, "audio.ogg");
  form.append("model", "whisper-1");
  form.append("language", "pt");

  const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Whisper falhou (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}
