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

    // --- Kader zarı: sonucu model değil, sunucu belirler ---
    const luck = (stats.happiness + stats.wealth + stats.career - stats.stress * 1.4) / 400; // ~ -0.35..0.75
    const roll = Math.random() + luck * 0.25;
    let outcome: LifeTurn["outcome"] = "neutral";
    if (action) {
      if (roll < 0.34) outcome = "failure";
      else if (roll < 0.68) outcome = "partial";
      else outcome = "success";
    }
    const forced = Boolean(action) && Math.random() < 0.25;

    const outcomeRule =
      outcome === "failure"
        ? `SONUÇ: BAŞARISIZLIK. Seçim ters tepsin: plan tutmasın, karşı taraf reddetsin, bir şey kırılsın/kaybedilsin. Acı gerçekçi olsun, melodram olmasın. Toplam etki NET NEGATİF olmalı (en az bir stat -6..-22, stress artabilir).`
        : outcome === "partial"
          ? `SONUÇ: YARIM BAŞARI. İstediğinin bir kısmını al ama bedel öde. Bazı statlar artsın, en az biri düşsün.`
          : outcome === "success"
            ? `SONUÇ: BAŞARI. İşe yarasın ama ucuz olmasın; küçük bir pürüz kalsın. Net etki pozitif.`
            : `İlk olay: tüm effects 0.`;

    const shapeRule = forced
      ? `BU OLAYDA SEÇİM HAKKI YOK ("kind":"forced"): hayat kararı senin yerine verir (hastalık, kaza, biri seni terk eder, işten çıkarılırsın, beklenmedik haber, bürokratik zorunluluk). Okuyucuya soru sorma. "choices" tek elemanlı olsun: [{"label":"<duruma özel kısa devam etiketi, örn. 'Sabahı bekle'>","recommended":true}].`
      : `"kind":"choice" ve tam 3 seçenek ver.`;

    const system = `Sen usta bir hayat simülasyonu anlatıcısısın: keskin gözlemci, ironik, bazen acımasız, bazen şefkatli bir romancı gibi yazarsın.
TÜM metinleri doğal, akıcı, idiomatik TÜRKÇE yaz. İkinci tekil şahısla ("sen"); somut detaylar (isimler, mekânlar, saatler, replikler). Klişe yok. Max 85 kelime.
ÇEŞİTLİLİK ZORUNLU: sadece iş/kariyer olmasın. Alanlar arasında dolaş, arka arkaya aynı alanı tekrarlama: aşk, ayrılık, arkadaşlık ve ihanet, aile, sağlık, para ve borç, taşınma, hobi ve sanat, inanç, komşuluk, evcil hayvan, tesadüf, kayıp ve yas, küçük gündelik anlar, seyahat, teknoloji, hukuki sürprizler.
HAYAT ADİL DEĞİL: hikâye sürekli yükselmesin. Sık sık geri tepme, pişmanlık, kayıp ve tökezleme olsun. "İyi seçim" bile bazen kötü sonuçlansın.
Geçmiş seçimler birikmeli sonuç doğursun; eski kişiler geri dönsün.
Sadece şu JSON'u döndür:
{"title":string,"narrative":string,"outcomeText":string,"kind":"choice"|"forced","choices":[{"label":string,"recommended":boolean}],"effects":{"happiness":number,"wealth":number,"career":number,"stress":number},"ageDelta":number}
"outcomeText": az önceki seçimin sonucunu anlatan TEK cümle (ilk olayda boş string).
"narrative": sonuçtan SONRA gelen yeni sahne.
Seçenek etiketleri kısa ve eyleme dönük (max 9 kelime), biri riskli / biri güvenli / biri beklenmedik; tam olarak biri recommended=true (ama "önerilen" garanti değildir).
"effects" AZ ÖNCEKİ seçimin DELTA'larıdır (-25..25); ilk olayda hepsi 0. Küçük olaylarda -5..5.
ageDelta: ilk olayda 0; sonra ÇOĞUNLUKLA 0, gerekiyorsa 1, çok nadiren 2.`;

    const userMsg = action
      ? `Karakter: ${character.age} yaşında ${character.occupation}, kişilik: ${character.personality}, nihai hedef: ${character.goal}.
Güncel durum: ${JSON.stringify(stats)}.
Hayat geçmişi (eskiden yeniye): ${history
          .slice(-12)
          .map((h, i) => `${i + 1}) ${h.event} -> ${h.choice}`)
          .join(" | ")}
Az önce şunu seçti: "${action}".
${outcomeRule}
${shapeRule}
Son olayların alanını tekrarlama; farklı bir hayat alanına geç.`
      : `Şu karakter için açılış olayını yaz: ${character.age} yaşında ${character.occupation}, kişilik: ${character.personality}, nihai hedef: ${character.goal}. Kariyerle değil, kişisel/duygusal bir anla başla. outcomeText boş, tüm effects 0, ageDelta 0, kind "choice".`;

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

    const kind: LifeTurn["kind"] = forced ? "forced" : "choice";
    const limit = forced ? 1 : 3;
    const choicesRaw = Array.isArray(parsed.choices) ? parsed.choices.slice(0, limit) : [];
    const choices = choicesRaw.map((c) => {
      const o = c as { label?: string; recommended?: boolean };
      return { label: String(o.label ?? "Devam et"), recommended: Boolean(o.recommended) };
    });
    while (choices.length < limit)
      choices.push({ label: forced ? "Devam et" : "Ne olacağını bekle ve gör", recommended: false });
    if (!choices.some((c) => c.recommended)) choices[0].recommended = true;

    const e = (parsed.effects ?? {}) as Record<string, number>;
    let eff = {
      happiness: Number(e.happiness ?? 0) || 0,
      wealth: Number(e.wealth ?? 0) || 0,
      career: Number(e.career ?? 0) || 0,
      stress: Number(e.stress ?? 0) || 0,
    };

    // Model iyimserlik yapıp zarı yok sayarsa sonucu zorla
    const net = eff.happiness + eff.wealth + eff.career - eff.stress;
    if (outcome === "failure" && net >= 0) {
      eff = {
        happiness: -Math.abs(eff.happiness || 8) - 4,
        wealth: -Math.abs(eff.wealth || 5),
        career: -Math.abs(eff.career || 5),
        stress: Math.abs(eff.stress || 6) + 4,
      };
    } else if (outcome === "success" && net <= 0) {
      eff = {
        happiness: Math.abs(eff.happiness || 6),
        wealth: Math.abs(eff.wealth || 4),
        career: Math.abs(eff.career || 4),
        stress: -Math.abs(eff.stress || 3),
      };
    }

    const ageDelta = action ? Math.max(0, Math.min(2, Number(parsed.ageDelta ?? 0) || 0)) : 0;

    return {
      age: character.age + ageDelta,
      title: String(parsed.title ?? "Yeni bir bölüm"),
      narrative: String(parsed.narrative ?? ""),
      outcomeText: String(parsed.outcomeText ?? ""),
      outcome,
      kind,
      choices,
      effects: {
        happiness: clamp(stats.happiness + eff.happiness),
        wealth: clamp(stats.wealth + eff.wealth),
        career: clamp(stats.career + eff.career),
        stress: clamp(stats.stress + eff.stress),
      },
    };
  });

