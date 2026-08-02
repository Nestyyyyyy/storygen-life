import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { askAi } from "./life.server";
import {
  clampMeter,
  fallbackCrime,
  judgeAnswer,
  localInterrogationTurn,
  makeInterrogator,
  type AnswerKind,
  type Interrogator,
  type Meters,
} from "./interrogation.server";

const MetersSchema = z.object({
  flirt: z.number(),
  suspicion: z.number(),
  empathy: z.number(),
});

const InterrogatorSchema = z.object({
  name: z.string(),
  gender: z.string(),
  rank: z.string(),
  style: z.string(),
  room: z.string(),
  attractedTo: z.array(z.string()),
  discipline: z.number(),
});

const TurnInput = z.object({
  crime: z.string().min(2),
  playerGender: z.string(),
  playerName: z.string().default(""),
  mature: z.boolean().default(false),
  interrogator: InterrogatorSchema.nullable().default(null),
  meters: MetersSchema.default({ flirt: 10, suspicion: 45, empathy: 15 }),
  turnNo: z.number().default(0),
  answer: z.string().optional(),
  answerKind: z
    .enum(["yalan", "doğru", "flört", "duygu", "sessiz", "serbest"])
    .default("serbest"),
  history: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),
  facts: z.array(z.string()).default([]),
});

export type InterrogationOption = { label: string; kind: AnswerKind };

export type InterrogationTurn = {
  interrogator: Interrogator;
  reaction: string;
  question: string;
  options: InterrogationOption[];
  meters: Meters;
  delta: Meters;
  status: "ongoing" | "freed" | "jailed";
  verdictText: string;
  facts: string[];
};

export const suggestCrime = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        hint: z.string().max(200).optional(),
        avoid: z.array(z.string()).max(10).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ value: string; source: "ai" | "local" }> => {
    const system = `Sen bir suç kurgu asistanısın. TÜRKÇE, kısa ve somut yaz.
Sadece şu JSON'u döndür: {"value": string}
"value": kurgusal bir polisiye hikâyede karakterin işlediği suçun kısa tanımı (max 8 kelime).
Gerçek kişileri/olayları kullanma; gerçek hayatta uygulanabilir teknik talimat verme, sadece olayı adlandır.
Klişe olmasın, her seferinde farklı bir suç üret.`;
    const user = `${
      data.hint
        ? `Kullanıcının isteği (ZORUNLU uy): "${data.hint}". Bu konunun içinden somut bir suç üret; ipucunu tekrar etme, parantez kullanma.`
        : "Serbest, sürpriz bir suç üret."
    }
${data.avoid.length ? `Şunları tekrar etme: ${data.avoid.join(" | ")}` : ""}`;

    try {
      const parsed = await askAi(system, user, 1.15);
      const value = String(parsed.value ?? "")
        .replace(/\s*\([^)]*\)/g, "")
        .trim()
        .slice(0, 90);
      if (value) return { value, source: "ai" };
      return { value: fallbackCrime(data.hint, data.avoid), source: "local" };
    } catch {
      return { value: fallbackCrime(data.hint, data.avoid), source: "local" };
    }
  });

export const interrogate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TurnInput.parse(input))
  .handler(async ({ data }): Promise<InterrogationTurn> => {
    const interrogator: Interrogator = data.interrogator ?? makeInterrogator();
    const first = !data.answer;

    let meters: Meters = { ...data.meters };
    let judgeNote = "";
    let judgeResult: "iyi" | "kötü" | "karışık" | null = null;
    let delta: Meters = { flirt: 0, suspicion: 0, empathy: 0 };

    if (!first) {
      const j = judgeAnswer(data.answerKind, meters, interrogator, data.playerGender);
      judgeNote = j.note;
      judgeResult = j.result;
      const next: Meters = {
        flirt: clampMeter(meters.flirt + j.delta.flirt),
        suspicion: clampMeter(meters.suspicion + j.delta.suspicion),
        empathy: clampMeter(meters.empathy + j.delta.empathy),
      };
      delta = {
        flirt: next.flirt - meters.flirt,
        suspicion: next.suspicion - meters.suspicion,
        empathy: next.empathy - meters.empathy,
      };
      meters = next;
    }

    // --- Karar: sunucu belirler, model sadece anlatır ---
    const turnNo = data.turnNo + 1;
    let status: InterrogationTurn["status"] = "ongoing";
    if (!first) {
      if (meters.suspicion >= 100) status = "jailed";
      else if (turnNo >= 6 && meters.suspicion <= 22) status = "freed";
      else if (turnNo >= 5 && meters.flirt >= 75 && meters.suspicion < 45) {
        // Etkilemek yeter demek değil: profesyonellik son anda üstün gelebilir.
        status = Math.random() < 0.3 + interrogator.discipline / 250 ? "jailed" : "freed";
      } else if (turnNo >= 10) {
        status = meters.suspicion <= 55 ? "freed" : "jailed";
      }
    }

    const matureRule = data.mature
      ? `YETİŞKİN MODU AÇIK (18+): dil sert olabilir, tehdit, alkol, şiddet ve ağır suç imaları serbest; ara sıra küfür geçebilir. Cinsellik yalnızca ima düzeyinde kalır — grafik/pornografik tasvir, reşit olmayanların cinselleştirilmesi ve nefret söylemi YASAK.`
      : `YETİŞKİN MODU KAPALI: küfür ve grafik şiddetten uzak dur, gerilim dille kurulsun.`;

    const system = `Sen bir polisiye kurgu anlatıcısısın. Bir sorgu odası sahnesi yazıyorsun.
TÜRKÇE, ikinci tekil şahıs ("sen"), gergin ve sinematik; max 70 kelime. Klişe yok.
Bu KURGUSAL bir oyundur: suçun nasıl işlendiğine dair gerçek hayatta uygulanabilir teknik talimat, tarif veya yöntem ASLA verme; sadece dramayı ve sorguyu yaz.
Sorgucu: ${interrogator.name}, ${interrogator.gender.toLowerCase()}, ${interrogator.rank}, tarzı: ${interrogator.style}. Mekân: ${interrogator.room}.
${matureRule}
Sadece şu JSON'u döndür:
{"reaction":string,"question":string,"options":[{"label":string,"kind":"yalan"|"doğru"|"flört"|"duygu"|"sessiz"}],"facts":string[],"verdictText":string}
"reaction": oyuncunun az önceki cevabına sorgucunun tepkisi (ilk turda boş string).
"question": sorgucunun şimdi sorduğu TEK soru; her tur farklı bir açıdan sıkıştır (alibi, tanık, kamera, telefon kaydı, para izi, aile).
"options": tam 4 cevap seçeneği (max 10 kelime), kind'lar farklı olsun: bir yalan, bir doğru, bir flört, bir duygu/anlayış (gerekirse sessiz).
"facts": bu sahnede ilk kez ortaya çıkan kalıcı ayrıntılar (isim, saat, mekân, kanıt). Yoksa boş dizi.
"verdictText": sadece sorgu bittiyse dolu olsun; bitmediyse boş string.`;

    const factLine = data.facts.length
      ? `KALICI GERÇEKLER (asla değiştirme): ${data.facts.slice(-30).join(" | ")}`
      : "KALICI GERÇEKLER: henüz yok.";

    const statusRule =
      status === "jailed"
        ? `SORGU BİTTİ — HAPİS: şüphe tavan yaptı. "reaction" son çöküşü anlatsın, "question" boş string, "options" boş dizi, "verdictText" tutuklanışını ve gideceğin yeri 2 cümleyle anlat.`
        : status === "freed"
          ? `SORGU BİTTİ — SERBEST: yeterince temiz çıktın. "reaction" son anı anlatsın, "question" boş string, "options" boş dizi, "verdictText" serbest bırakılışını, arkanda kalan pürüzü 2 cümleyle anlat.`
          : `SORGU DEVAM EDİYOR: "verdictText" boş string, tam 4 seçenek ver.`;

    const user = first
      ? `Oyuncu: ${data.playerName || "isimsiz bir şüpheli"}, ${data.playerGender}.
İddia edilen suç: "${data.crime}".
${factLine}
Sahneyi aç: oyuncu sorgu odasına oturtuldu, ${interrogator.name} karşısına geçti ve ilk soruyu sordu.
"reaction" boş string, "verdictText" boş string, tam 4 seçenek ver.`
      : `Oyuncu: ${data.playerName || "isimsiz bir şüpheli"}, ${data.playerGender}. İddia edilen suç: "${data.crime}".
${factLine}
Sorgu geçmişi: ${data.history
          .slice(-12)
          .map((h, i) => `${i + 1}) S: ${h.question} / C: ${h.answer}`)
          .join(" | ")}
Az önce şöyle cevap verdi: "${data.answer}".
GİZLİ HAKEM KARARI (buna göre yaz, kararı değiştirme): ${judgeNote}
Barlar şimdi: flört ${meters.flirt}, şüphe ${meters.suspicion}, anlayış ${meters.empathy}.
${statusRule}`;

    let parsed: Record<string, unknown> = {};
    try {
      parsed = await askAi(system, user, 1.05);
    } catch {
      // Yapay zekâya ulaşılamadı (anahtar/kota/ağ): yerel sorgu motoru devralır.
      parsed = localInterrogationTurn({
        interrogator,
        judgeResult,
        status,
        turnNo,
        usedQuestions: data.history.map((h) => h.question),
      }) as unknown as Record<string, unknown>;
    }

    const rawOptions = Array.isArray(parsed.options) ? parsed.options : [];
    const options: InterrogationOption[] =
      status === "ongoing"
        ? rawOptions.slice(0, 4).map((o) => {
            const v = o as { label?: string; kind?: string };
            const allowed = ["yalan", "doğru", "flört", "duygu", "sessiz"];
            const kind: AnswerKind = allowed.includes(String(v.kind))
              ? (v.kind as AnswerKind)
              : "serbest";
            return { label: String(v.label ?? "Sessiz kal"), kind };
          })

        : [];

    if (status === "ongoing" && options.length < 4) {
      const filler: InterrogationOption[] = [
        { label: "Hiçbir şey bilmediğini söyle", kind: "yalan" },
        { label: "Kısmen doğruyu anlat", kind: "doğru" },
        { label: "Gözlerine bakıp gülümse", kind: "flört" },
        { label: "Neden bu hâle geldiğini anlat", kind: "duygu" },
      ];
      for (const f of filler) {
        if (options.length >= 4) break;
        if (!options.some((o) => o.kind === f.kind)) options.push(f);
      }
    }

    const facts = Array.isArray(parsed.facts)
      ? (parsed.facts as unknown[])
          .map((f) => String(f).trim())
          .filter((f) => f.length > 1 && f.length < 160)
          .slice(0, 5)
      : [];

    return {
      interrogator,
      reaction: String(parsed.reaction ?? ""),
      question: String(parsed.question ?? ""),
      options,
      meters,
      delta,
      status,
      verdictText: status === "ongoing" ? "" : String(parsed.verdictText ?? ""),
      facts,
    };
  });
