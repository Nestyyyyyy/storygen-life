import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const StatsSchema = z.object({
  happiness: z.number(),
  wealth: z.number(),
  career: z.number(),
  stress: z.number(),
});

const CharacterSchema = z.object({
  age: z.number(),
  occupation: z.string(),
  personality: z.string(),
  goal: z.string(),
});

const InputSchema = z.object({
  character: CharacterSchema,
  stats: StatsSchema,
  history: z.array(z.object({ event: z.string(), choice: z.string() })).default([]),
  action: z.string().optional(),
});

export type LifeStats = z.infer<typeof StatsSchema>;
export type Character = z.infer<typeof CharacterSchema>;

export type LifeTurn = {
  age: number;
  title: string;
  narrative: string;
  choices: { label: string; recommended: boolean }[];
  effects: LifeStats;
  outcome: "success" | "partial" | "failure" | "neutral";
  outcomeText: string;
  kind: "choice" | "forced";
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));


export const generateLifeEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<LifeTurn> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { character, stats, history, action } = data;

    const system = `Sen usta bir hayat simülasyonu anlatıcısısın: keskin gözlemci, ironik, bazen acımasız, bazen şefkatli bir romancı gibi yazarsın.
TÜM metinleri (title, narrative, choice labels) doğal, akıcı, idiomatik TÜRKÇE yaz. Çeviri kokmasın.
İkinci tekil şahısla ("sen") yaz; somut detaylar kullan (isimler, mekânlar, saatler, kokular, replikler). Klişelerden kaçın. Max 80 kelime.
ÇEŞİTLİLİK ZORUNLU: olaylar sadece iş/kariyer/teklif olmasın. Şu alanlar arasında dolaş ve arka arkaya aynı alanı tekrarlama:
aşk ve flört, ayrılık, arkadaşlık ve ihanet, aile ve ebeveynler, sağlık ve beden, para ve borç, taşınma/şehir değiştirme, hobi ve sanat, inanç ve anlam arayışı, komşuluk, evcil hayvan, tesadüf ve şans, kayıp ve yas, küçük gündelik anlar, macera ve seyahat, teknoloji, hukuki/bürokratik sürprizler.
Küçük gündelik sahnelerle büyük dönüm noktalarını dengele; her olay hayat değiştiren olmasın.
Karakterin kişiliği, hedefi ve geçmiş seçimleri sonuçları GERÇEKTEN etkilesin: geçmişteki seçimler ilerleyen olaylarda geri dönsün (kişiler tekrar belirsin, sonuçlar birikmeli olsun). Seçimlerin bedeli olsun; her şey iyi bitmesin.
Sadece şu JSON'u döndür:
{"title":string,"narrative":string,"choices":[{"label":string,"recommended":boolean}],"effects":{"happiness":number,"wealth":number,"career":number,"stress":number},"ageDelta":number}
Kurallar: tam 3 seçenek, birbirinden gerçekten farklı (biri riskli, biri güvenli, biri beklenmedik/duygusal), kısa ve eyleme dönük Türkçe etiketler (max 9 kelime), tam olarak biri recommended=true (hedefe göre en bilgece olan).
"effects" AZ ÖNCE yapılan seçimin DELTA'larıdır (-25..25); ilk olayda hepsi 0. Küçük olaylarda küçük deltalar (-5..5) kullan.
ageDelta: ilk olayda 0. Sonrasında ÇOĞUNLUKLA 0 olsun (aynı yıl içinde günler/haftalar geçer); olay gerçekten uzun bir zaman atlamayı gerektiriyorsa 1, çok nadiren 2. Her olayda yaş artırma.`;



    const userMsg = action
      ? `Karakter: ${character.age} yaşında ${character.occupation}, kişilik: ${character.personality}, nihai hedef: ${character.goal}.
Güncel durum: ${JSON.stringify(stats)}.
Hayat geçmişi (eskiden yeniye): ${history
          .slice(-12)
          .map((h, i) => `${i + 1}) ${h.event} -> ${h.choice}`)
          .join(" | ")}
Az önce şunu seçti: "${action}".
Bu seçimin sonuçlarını inandırıcı biçimde işle ve SIRADAKİ olayı yaz. Geçmişte geçen kişileri/konuları hatırla ve gerektiğinde geri getir. Son olayların alanını tekrarlama; farklı bir hayat alanına geç (aşk, arkadaşlık, aile, sağlık, para, tesadüf...).`
      : `Şu karakter için açılış olayını yaz: ${character.age} yaşında ${character.occupation}, kişilik: ${character.personality}, nihai hedef: ${character.goal}. Kariyerle değil, kişisel/duygusal bir anla başla. Tüm effects 0, ageDelta 0.`;


    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-pro-preview",
        temperature: 1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),

    });

    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
    if (!res.ok) throw new Error(`AI request failed (${res.status})`);

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "")) as Record<string, unknown>;

    const choicesRaw = Array.isArray(parsed.choices) ? parsed.choices.slice(0, 3) : [];
    const choices = choicesRaw.map((c) => {
      const o = c as { label?: string; recommended?: boolean };
      return { label: String(o.label ?? "Beklemeye devam et"), recommended: Boolean(o.recommended) };
    });
    while (choices.length < 3) choices.push({ label: "Ne olacağını bekle ve gör", recommended: false });
    if (!choices.some((c) => c.recommended)) choices[0].recommended = true;

    const e = (parsed.effects ?? {}) as Record<string, number>;
    const eff = {
      happiness: Number(e.happiness ?? 0) || 0,
      wealth: Number(e.wealth ?? 0) || 0,
      career: Number(e.career ?? 0) || 0,
      stress: Number(e.stress ?? 0) || 0,
    };

    const ageDelta = action ? Math.max(0, Math.min(2, Number(parsed.ageDelta ?? 0) || 0)) : 0;

    return {
      age: character.age + ageDelta,
      title: String(parsed.title ?? "Yeni bir bölüm"),
      narrative: String(parsed.narrative ?? ""),
      choices,
      effects: {
        happiness: clamp(stats.happiness + eff.happiness),
        wealth: clamp(stats.wealth + eff.wealth),
        career: clamp(stats.career + eff.career),
        stress: clamp(stats.stress + eff.stress),
      },
    };
  });
