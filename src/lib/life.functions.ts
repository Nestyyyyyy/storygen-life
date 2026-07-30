import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { askAi, clamp, FIELD_TR, openingSeed } from "./life.server";

const StatsSchema = z.object({
  happiness: z.number(),
  wealth: z.number(),
  career: z.number(),
  stress: z.number(),
});

const CharacterSchema = z.object({
  age: z.number(),
  gender: z.string(),
  occupation: z.string(),
  personality: z.string(),
  goal: z.string(),
});

const InputSchema = z.object({
  character: CharacterSchema,
  stats: StatsSchema,
  history: z
    .array(
      z.object({
        event: z.string(),
        choice: z.string(),
        detail: z.string().optional(),
      }),
    )
    .default([]),
  facts: z.array(z.string()).default([]),
  action: z.string().optional(),
});


const SuggestSchema = z.object({
  field: z.enum(["occupation", "personality", "goal"]),
  hint: z.string().max(200).optional(),
  context: z
    .object({
      age: z.number().optional(),
      gender: z.string().optional(),
      occupation: z.string().optional(),
      personality: z.string().optional(),
      goal: z.string().optional(),
    })
    .optional(),
});

export type LifeStats = z.infer<typeof StatsSchema>;
export type Character = z.infer<typeof CharacterSchema>;

export type LifeTurn = {
  age: number;
  title: string;
  narrative: string;
  choices: { label: string; recommended: boolean }[];
  effects: LifeStats;
  delta: LifeStats;
  outcome: "success" | "partial" | "failure" | "neutral";
  outcomeText: string;
  kind: "choice" | "forced";
  facts: string[];
};

export type FieldIssues = Partial<Record<"occupation" | "personality" | "goal", string>>;

export const suggestField = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SuggestSchema.parse(input))
  .handler(async ({ data }): Promise<{ value: string }> => {
    const { field, hint, context } = data;
    const system = `Sen bir karakter yaratma asistanısın. TÜRKÇE, kısa ve somut yaz.
Sadece şu JSON'u döndür: {"value": string}
- occupation: gerçek bir meslek/uğraş (max 4 kelime). Örn: "gece vardiyası hemşiresi".
- personality: 3 sıfat, virgülle (max 5 kelime).
- goal: tek cümlelik samimi bir hayat hedefi (max 9 kelime).
Klişe olmasın, her seferinde farklı ve yaratıcı bir şey üret.`;
    const user = `İstenen alan: ${FIELD_TR[field]}.
Karakter bilgisi: yaş ${context?.age ?? "?"}, cinsiyet ${context?.gender ?? "?"}, meslek ${context?.occupation || "?"}, kişilik ${context?.personality || "?"}, hedef ${context?.goal || "?"}.
${hint ? `Kullanıcının isteği: "${hint}". Buna uygun bir öneri üret.` : "Serbest, sürpriz bir öneri üret."}`;

    try {
      const parsed = await askAi(system, user, 1.15);
      const value = String(parsed.value ?? "").trim().slice(0, 80);
      return { value: value || fallbackSuggestion(field) };
    } catch {
      // Kredi/ağ sorununda uygulama çökmesin: yerel öneri döndür.
      return { value: fallbackSuggestion(field) };
    }
  });


export const validateCharacter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        occupation: z.string(),
        personality: z.string(),
        goal: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; issues: FieldIssues }> => {
    const issues: FieldIssues = {};
    const gibberish = (s: string) =>
      s.length < 2 ||
      /^(.)\1+$/i.test(s.replace(/\s/g, "")) ||
      !/[a-zçğıöşü]/i.test(s) ||
      !/[aeıioöuüAEIİOÖUÜ]/.test(s);

    (["occupation", "personality", "goal"] as const).forEach((f) => {
      const v = data[f].trim();
      if (!v) issues[f] = "Bu alanı doldur.";
      else if (gibberish(v)) issues[f] = "Bu anlamlı bir şey değil, gerçek bir şey yaz.";
    });
    if (Object.keys(issues).length) return { ok: false, issues };

    const system = `Sen bir giriş doğrulayıcısısın. Kullanıcının karakter alanlarını kontrol et.
Bir alan anlamsız (klavye karalaması, rastgele harfler, saçma tekrar, alanla alakasız) ise reddet.
Yaratıcı ama anlamlı girdileri KABUL ET. Küfür/nefret içerenleri reddet.
Sadece şu JSON'u döndür: {"occupation":{"ok":boolean,"reason":string},"personality":{"ok":boolean,"reason":string},"goal":{"ok":boolean,"reason":string}}
reason: ok=false ise kısa, nazik, TÜRKÇE bir açıklama; ok=true ise boş string.`;
    const user = `meslek: "${data.occupation}"
kişilik: "${data.personality}"
nihai hedef: "${data.goal}"`;

    const parsed = await askAi(system, user, 0);
    (["occupation", "personality", "goal"] as const).forEach((f) => {
      const r = parsed[f] as { ok?: boolean; reason?: string } | undefined;
      if (r && r.ok === false) issues[f] = String(r.reason || "Bu geçerli bir cevap değil.");
    });

    return { ok: Object.keys(issues).length === 0, issues };
  });

export const generateLifeEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<LifeTurn> => {
    const { character, stats, history, action, facts } = data;


    // --- Kader zarı: sonucu model değil, sunucu belirler ---
    const luck = (stats.happiness + stats.wealth + stats.career - stats.stress * 1.4) / 400;
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

    const factLine = facts.length
      ? `KALICI GERÇEKLER (asla değiştirme, isimleri aynen kullan): ${facts.slice(-30).join(" | ")}`
      : "KALICI GERÇEKLER: henüz yok.";

    const system = `Sen usta bir hayat simülasyonu anlatıcısısın: keskin gözlemci, ironik, bazen acımasız, bazen şefkatli bir romancı gibi yazarsın.
TÜM metinleri doğal, akıcı, idiomatik TÜRKÇE yaz. İkinci tekil şahısla ("sen"); somut detaylar (isimler, mekânlar, saatler, replikler). Klişe yok. Max 85 kelime.
Karakterin cinsiyetine uygun hitap, ilişki ve toplumsal detaylar kur.
SÜREKLİLİK ZORUNLU: Sana verilen "KALICI GERÇEKLER" listesindeki kişi, hayvan, mekân ve iş isimlerini ASLA değiştirme. Yeni bir isim uydurmadan önce listeyi kontrol et; aynı varlık için farklı isim kullanmak yasak. Yeni kalıcı bir isim/ilişki/mekân ortaya çıkarsa onu "facts" dizisine kısa bir cümleyle ekle (örn. "Köpeğinin adı Şila").
ÇEŞİTLİLİK ZORUNLU: sadece iş/kariyer olmasın. Alanlar arasında dolaş, arka arkaya aynı alanı tekrarlama: aşk, ayrılık, arkadaşlık ve ihanet, aile, sağlık, para ve borç, taşınma, hobi ve sanat, inanç, komşuluk, evcil hayvan, tesadüf, kayıp ve yas, küçük gündelik anlar, seyahat, teknoloji, hukuki sürprizler.
HAYAT ADİL DEĞİL: hikâye sürekli yükselmesin. Sık sık geri tepme, pişmanlık, kayıp ve tökezleme olsun. "İyi seçim" bile bazen kötü sonuçlansın.
Geçmiş seçimler birikmeli sonuç doğursun; eski kişiler geri dönsün.
Sadece şu JSON'u döndür:
{"title":string,"narrative":string,"outcomeText":string,"kind":"choice"|"forced","choices":[{"label":string,"recommended":boolean}],"effects":{"happiness":number,"wealth":number,"career":number,"stress":number},"ageDelta":number,"facts":string[]}
"facts": SADECE bu sahnede ilk kez ortaya çıkan kalıcı bilgiler (isimler, ilişkiler, mekânlar). Yoksa boş dizi.
"outcomeText": az önceki seçimin sonucunu anlatan TEK cümle (ilk olayda boş string).
"narrative": sonuçtan SONRA gelen yeni sahne.
Seçenek etiketleri kısa ve eyleme dönük (max 9 kelime), biri riskli / biri güvenli / biri beklenmedik; tam olarak biri recommended=true (ama "önerilen" garanti değildir).
"effects" AZ ÖNCEKİ seçimin DELTA'larıdır (-25..25); ilk olayda hepsi 0. Küçük olaylarda -5..5.
ageDelta: ilk olayda 0; sonra ÇOĞUNLUKLA 0, gerekiyorsa 1, çok nadiren 2.`;

    const who = `${character.age} yaşında ${character.gender} ${character.occupation}, kişilik: ${character.personality}, nihai hedef: ${character.goal}`;

    const seed = openingSeed();

    const userMsg = action
      ? `Karakter: ${who}.
${factLine}
Güncel durum: ${JSON.stringify(stats)}.
Hayat geçmişi (eskiden yeniye): ${history
          .slice(-24)
          .map(
            (h, i) =>
              `${i + 1}) ${h.event}${h.detail ? ` — ${h.detail.slice(0, 160)}` : ""} -> ${h.choice}`,
          )
          .join(" | ")}
Az önce şunu seçti: "${action}".
${outcomeRule}
${shapeRule}
Son olayların alanını tekrarlama; farklı bir hayat alanına geç.`
      : `Şu karakter için açılış olayını yaz: ${who}.
Bu açılış ŞU tohuma göre kurulsun (birebir kopyalama, ilham al):
- hayat alanı: ${seed.domain}
- sahne: ${seed.scene}
- ton: ${seed.tone}
- çeşitlilik anahtarı: ${seed.nonce}
Kariyerle başlama; kişisel/duygusal bir anla başla. Daha önce yazdığın hiçbir açılışa benzemesin.
outcomeText boş, tüm effects 0, ageDelta 0, kind "choice".`;

    const parsed = await askAi(system, userMsg, action ? 1 : 1.2);


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

    const newFacts = Array.isArray(parsed.facts)
      ? (parsed.facts as unknown[])
          .map((f) => String(f).trim())
          .filter((f) => f.length > 1 && f.length < 160)
          .slice(0, 5)
      : [];

    const effects: LifeStats = {
      happiness: clamp(stats.happiness + eff.happiness),
      wealth: clamp(stats.wealth + eff.wealth),
      career: clamp(stats.career + eff.career),
      stress: clamp(stats.stress + eff.stress),
    };

    return {
      age: character.age + ageDelta,
      title: String(parsed.title ?? "Yeni bir bölüm"),
      narrative: String(parsed.narrative ?? ""),
      outcomeText: String(parsed.outcomeText ?? ""),
      outcome,
      kind,
      choices,
      facts: newFacts,

      effects,
      delta: {
        happiness: effects.happiness - stats.happiness,
        wealth: effects.wealth - stats.wealth,
        career: effects.career - stats.career,
        stress: effects.stress - stats.stress,
      },
    };
  });
