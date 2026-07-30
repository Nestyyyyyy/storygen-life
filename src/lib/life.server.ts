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
  if (res.status === 402) throw new Error("Yapay zekâ kredisi bitti. Çalışma alanına kredi ekleyince hikâye devam eder.");
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

const OPENING_DOMAINS = [
  "aşk ya da flört",
  "eski bir arkadaşlık",
  "aile içi bir mesele",
  "sağlıkla ilgili küçük bir uyarı",
  "para/borç sıkışıklığı",
  "komşuluk ilişkisi",
  "bir evcil hayvan",
  "beklenmedik bir tesadüf",
  "geçmişten gelen bir kayıp",
  "taşınma ya da yeni bir ev",
  "bir hobi ya da sanat uğraşı",
  "kısa bir yolculuk",
  "yabancı biriyle karşılaşma",
  "eski bir sırrın ortaya çıkması",
];

const OPENING_SCENES = [
  "sabahın erken saati, mutfakta",
  "gece yarısı, telefon ekranının ışığında",
  "yağmurlu bir akşamüstü, otobüs durağında",
  "pazar öğleden sonrası, apartman merdiveninde",
  "iş çıkışı, kalabalık bir caddede",
  "hafta sonu, bir kafenin arka masasında",
  "bayram sabahı, kalabalık bir evde",
  "gece treninde, cam kenarında",
];

const OPENING_TONES = [
  "sıcak ve tatlı-buruk",
  "gergin ve tedirgin",
  "komik ve utandırıcı",
  "sessiz ve melankolik",
  "aceleci ve kaotik",
  "şüpheli ve merak uyandırıcı",
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function openingSeed() {
  return {
    domain: pick(OPENING_DOMAINS),
    scene: pick(OPENING_SCENES),
    tone: pick(OPENING_TONES),
    nonce: Math.random().toString(36).slice(2, 10),
  };
}


// --- Yapay zekâ ulaşılamadığında yerel yedekler ---
const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  occupation: [
    "gece vardiyası hemşiresi",
    "taşra kütüphanecisi",
    "seyyar kahveci",
    "veteriner asistanı",
    "belgesel kurgucusu",
    "marangoz çırağı",
  ],
  personality: [
    "inatçı, sıcakkanlı, dağınık",
    "sakin, meraklı, alıngan",
    "cesur, sabırsız, dürüst",
    "utangaç, esprili, sadık",
  ],
  goal: [
    "Deniz kenarında küçük bir ev almak",
    "Ailemle aramı düzeltmek",
    "Kendi atölyemi açmak",
    "Korkmadan sevmeyi öğrenmek",
  ],
};

export function fallbackSuggestion(field: string) {
  return pick(FALLBACK_SUGGESTIONS[field] ?? FALLBACK_SUGGESTIONS.goal);
}
