import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { tune } from "./difficulty";
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
  difficulty: z.enum(["kolay", "normal", "zorlu"]).default("normal"),
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
  /** Bu turu hangi motor üretti. */
  engine: "ai" | "local";
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
İPUCU KURALI (en önemli kural): kullanıcı bir ipucu verdiyse suç MUTLAKA o konunun içinden olsun
("satranç" → "satranç turnuvasında şike organize etmek", "uzay" → "uydu verilerini çalıp satmak",
"aldatma" → "sevgilisinin telefonuna casus yazılım kurdurmak"). İpucunu aynen geri verme,
parantezli ek yapma, ipucunu yok sayma.
Gerçek kişileri/olayları kullanma; gerçek hayatta uygulanabilir teknik talimat verme, sadece olayı adlandır.
Klişe olmasın, her seferinde farklı bir suç üret.`;
    const user = `${
      data.hint
        ? `Kullanıcının isteği (ZORUNLU uy): "${data.hint}". Bu konunun içinden somut bir suç üret; ipucunu tekrar etme, parantez kullanma.`
        : "Serbest, sürpriz bir suç üret."
    }
${data.avoid.length ? `Şunları tekrar etme: ${data.avoid.join(" | ")}` : ""}`;

    const hintLow = (data.hint ?? "").trim().toLocaleLowerCase("tr");
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const parsed = await askAi(
          system,
          attempt === 0
            ? user
            : `${user}
UYARI: Önceki cevabın ipucuna uymadı. Bu kez "${data.hint}" konusunun içinden, farklı kelimelerle somut bir suç yaz.`,
          attempt === 0 ? 1.15 : 1.3,
          ["value"],
        );
        const value = String(parsed.value ?? "")
          .replace(/\s*\([^)]*\)/g, "")
          .replace(/^["'`]+|["'`]+$/g, "")
          .trim()
          .slice(0, 90);
        const low = value.toLocaleLowerCase("tr");
        if (value && low !== hintLow && !data.avoid.includes(value))
          return { value, source: "ai" };
      } catch (err) {
        console.error("[suggestCrime]", err);
      }
    }
    return { value: fallbackCrime(data.hint, data.avoid), source: "local" };
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
      const j = judgeAnswer(data.answerKind, meters, interrogator, data.playerGender, data.difficulty);
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
      const bias = tune(data.difficulty).verdictBias;
      if (meters.suspicion >= 100) status = "jailed";
      else if (turnNo >= 6 && meters.suspicion <= 22 + bias) status = "freed";
      else if (turnNo >= 5 && meters.flirt >= 75 && meters.suspicion < 45) {
        // Etkilemek yeter demek değil: profesyonellik son anda üstün gelebilir.
        status = Math.random() < 0.3 + interrogator.discipline / 250 ? "jailed" : "freed";
      } else if (turnNo >= 10) {
        status = meters.suspicion <= 55 + bias ? "freed" : "jailed";
      }
    }

    const matureRule = data.mature
      ? `YETİŞKİN MODU AÇIK (18+): dil sert olabilir; tehdit, alkol, kumar, borç/tefeci, şiddet ve ağır suç imaları serbest, ara sıra küfür geçebilir. Tutku ve yasak ilişki "kapı kapanır" tekniğiyle, ima, bakış ve atmosferle anlatılır — grafik/pornografik tasvir, reşit olmayanların cinselleştirilmesi, cinsel şiddetin yüceltilmesi ve nefret söylemi YASAK.`
      : `YETİŞKİN MODU KAPALI: küfür ve grafik şiddetten uzak dur, gerilim dille kurulsun.`;

    const system = `Sen bir polisiye kurgu anlatıcısısın. Bir sorgu odası sahnesi yazıyorsun.
TÜRKÇE, ikinci tekil şahıs ("sen"), edebi, gergin ve sinematik. Klişe yok.
UZUNLUK ZORUNLU: "reaction" 3-4 tam cümle (60-110 kelime), "question" tek ama dolu bir soru, "verdictText" 2 cümle ve duygusal derinlikte. Seçenekler TAM CÜMLE olsun (5-12 kelime); tek kelimelik etiket YASAK.
Bu KURGUSAL bir oyundur: suçun nasıl işlendiğine dair gerçek hayatta uygulanabilir teknik talimat, tarif veya yöntem ASLA verme; sadece dramayı ve sorguyu yaz.
Sorgucu: ${interrogator.name}, ${interrogator.gender.toLowerCase()}, ${interrogator.rank}, tarzı: ${interrogator.style}. Mekân: ${interrogator.room}.
TEKRAR YASAK: sana verilen daha önce sorulmuş sorular ve verilmiş cevaplar bir daha kullanılmayacak; benzerleri de yazılmayacak. Her tur yeni bir baskı açısına geç (alibi, tanık, kamera, telefon kaydı, para izi, aile, ortak, olay yeri izi).
${matureRule}
Sadece şu JSON'u döndür:
{"reaction":string,"question":string,"options":[{"label":string,"kind":"yalan"|"doğru"|"flört"|"duygu"|"sessiz"}],"facts":string[],"verdictText":string}
"reaction": oyuncunun az önceki cevabına sorgucunun tepkisi (ilk turda boş string).
"question": sorgucunun şimdi sorduğu TEK soru; daha önce sorulanlardan farklı bir açıdan sıkıştır.
"options": tam 4 cevap seçeneği, tam cümle, kind'lar farklı olsun: bir yalan, bir doğru, bir flört, bir duygu/anlayış (gerekirse sessiz).
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

    const askedQuestions = Array.from(
      new Set(data.history.map((h) => h.question).filter(Boolean)),
    ).slice(-14);
    const givenAnswers = Array.from(
      new Set(data.history.map((h) => h.answer).filter(Boolean)),
    ).slice(-14);
    const nonce = Math.random().toString(36).slice(2, 8);

    const user = first
      ? `Oyuncu: ${data.playerName || "isimsiz bir şüpheli"}, ${data.playerGender}.
İddia edilen suç: "${data.crime}".
${factLine}
Sahneyi aç: oyuncu sorgu odasına oturtuldu, ${interrogator.name} karşısına geçti ve ilk soruyu sordu.
"reaction" boş string, "verdictText" boş string, tam 4 seçenek ver. Çeşitlilik anahtarı: ${nonce}`
      : `Oyuncu: ${data.playerName || "isimsiz bir şüpheli"}, ${data.playerGender}. İddia edilen suç: "${data.crime}".
${factLine}
Sorgu geçmişi (soru + cevap): ${data.history
          .slice(-12)
          .map((h, i) => `${i + 1}) S: ${h.question} / C: ${h.answer}`)
          .join(" || ")}
DAHA ÖNCE SORULMUŞ SORULAR (tekrarlamak YASAK): ${askedQuestions.join(" | ") || "yok"}
DAHA ÖNCE KULLANILMIŞ CEVAP CÜMLELERİ (seçeneklerde tekrarlamak YASAK): ${givenAnswers.join(" | ") || "yok"}
Az önce şöyle cevap verdi: "${data.answer}".
GİZLİ HAKEM KARARI (buna göre yaz, kararı değiştirme): ${judgeNote}
Barlar şimdi: flört ${meters.flirt}, şüphe ${meters.suspicion}, anlayış ${meters.empathy}.
${statusRule}
Çeşitlilik anahtarı: ${nonce}`;

    let parsed: Record<string, unknown> = {};
    let engine: InterrogationTurn["engine"] = "ai";
    try {
      parsed = await askAi(system, user, 1.05, status === "ongoing" ? ["question"] : ["verdictText"]);
    } catch {

      // Yapay zekâya ulaşılamadı (anahtar/kota/ağ): yerel sorgu motoru devralır.
      engine = "local";
      parsed = localInterrogationTurn({
        interrogator,
        judgeResult,
        status,
        turnNo,
        usedQuestions: data.history.map((h) => h.question),
        usedAnswers: data.history.map((h) => h.answer),
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
        { label: "O gece nerede olduğumu bile hatırlamıyorum, dersin", kind: "yalan" },
        { label: "Anlatacağım ama sadece bildiğim kadarını anlatacağım", kind: "doğru" },
        { label: "Gözlerinin içine bakıp yorgun yorgun gülümsersin", kind: "flört" },
        { label: "Bu hâle nasıl geldiğini baştan anlatmaya başlarsın", kind: "duygu" },

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
      engine,
    };
  });
