export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function aiKey() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key;
}

export async function askAi(system: string, user: string, temperature = 1) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey()}` },
    body: JSON.stringify({
      model: "google/gemini-3.1-pro-preview",
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Çok hızlı gittik, biraz sonra tekrar dene.");
  if (res.status === 402) throw new Error("Yapay zekâ kredisi bitti.");
  if (!res.ok) throw new Error(`Yapay zekâ isteği başarısız (${res.status})`);

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw.replace(/^```json\s*|```$/g, "")) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

export const FIELD_TR: Record<string, string> = {
  occupation: "meslek",
  personality: "kişilik",
  goal: "nihai hayat hedefi",
};
