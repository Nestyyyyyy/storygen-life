import { generateScene, type SceneArgs } from "./story-engine.server";
import type { QualityAudit } from "./quality-types";

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// --- AI sağlayıcı yapılandırması ---
// Sağlayıcıdan bağımsız: OpenAI, Google Gemini (OpenAI uyumlu uç), OpenRouter
// ya da eski Lovable ağ geçidi. Hangisi tanımlıysa o kullanılır.
type AiConfig = { key: string; url: string; model: string; referer?: string; title?: string };

// Tanımlı TÜM sağlayıcıları sırayla döndür: önce kendi anahtarın, sonra Lovable.
// askAi bunları zincirleme dener; biri çalışırsa gerçek AI devrededir.
export function aiConfigs(): AiConfig[] {
  const list: AiConfig[] = [];
  const key =
    process.env.AI_API_KEY ??
    process.env.OPENAI_API_KEY ??
    process.env.OPENROUTER_API_KEY;
  if (key) {
    list.push({
      key,
      url: process.env.AI_BASE_URL ?? "https://api.openai.com/v1/chat/completions",
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
      referer: process.env.AI_REFERER, // OpenRouter için opsiyonel
      title: process.env.AI_TITLE, // OpenRouter için opsiyonel
    });
  }
  const lovable = process.env.LOVABLE_API_KEY;
  if (lovable) {
    // Önce zengin anlatım için güçlü model, o olmazsa hızlı model.
    // Yerel şablonlara ancak ikisi de başarısız olursa düşülür.
    const primary = process.env.LOVABLE_MODEL ?? "google/gemini-3.1-pro-preview";
    for (const model of [primary, "google/gemini-3.6-flash", "google/gemini-2.5-flash"]) {
      if (list.some((c) => c.model === model)) continue;
      list.push({ key: lovable, url: "https://ai.gateway.lovable.dev/v1/chat/completions", model });
    }
  }
  return list;
}


// Geriye dönük uyumluluk.
export function aiConfig(): AiConfig {
  const cfgs = aiConfigs();
  if (!cfgs.length)
    throw new Error(
      "AI anahtarı tanımlı değil. AI_API_KEY (+ AI_BASE_URL, AI_MODEL) ya da LOVABLE_API_KEY ayarla.",
    );
  return cfgs[0];
}

export function aiKey() {
  return aiConfig().key;
}

async function askOne(cfg: AiConfig, system: string, user: string, temperature: number) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.key}`,
  };
  if (cfg.referer) headers["HTTP-Referer"] = cfg.referer;
  if (cfg.title) headers["X-Title"] = cfg.title;

  const res = await fetch(cfg.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: cfg.model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Çok hızlı gittik, biraz sonra tekrar dene.");
  if (res.status === 401 || res.status === 403)
    throw new Error("AI anahtarı geçersiz ya da yetkisiz. Anahtarını kontrol et.");
  if (res.status === 402) throw new Error("Yapay zekâ kredisi bitti. Hesabına kredi ekleyince hikâye devam eder.");
  if (!res.ok) throw new Error(`Yapay zekâ isteği başarısız (${res.status})`);

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = (json.choices?.[0]?.message?.content ?? "").trim();
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(slice) as Record<string, unknown>;
  } catch {
    throw new Error("Yapay zekâ geçerli bir yanıt döndürmedi.");
  }
  if (!parsed || typeof parsed !== "object" || !Object.keys(parsed).length)
    throw new Error("Yapay zekâ boş yanıt döndürdü.");
  return parsed;
}

// Yapay zekâ HER ZAMAN önce denenir: tanımlı tüm sağlayıcı/model kombinasyonları
// sırayla, her biri iki deneme hakkıyla çağrılır. Yerel şablonlar sadece
// buradan hata fırlarsa devreye girer.
export async function askAi(
  system: string,
  user: string,
  temperature = 1,
  requiredKeys: string[] = [],
) {
  const cfgs = aiConfigs();
  if (!cfgs.length)
    throw new Error(
      "AI anahtarı tanımlı değil. AI_API_KEY (+ AI_BASE_URL, AI_MODEL) ya da LOVABLE_API_KEY ayarla.",
    );
  let lastErr: unknown;
  for (const cfg of cfgs) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const out = await askOne(cfg, system, user, temperature);
        const missing = requiredKeys.filter((k) => {
          const v = out[k];
          return v === undefined || v === null || (typeof v === "string" && !v.trim());
        });
        if (missing.length) throw new Error(`Eksik alanlar: ${missing.join(", ")}`);
        return out;
      } catch (e) {
        lastErr = e;
        console.error(
          `[askAi] ${cfg.model} deneme ${attempt + 1} başarısız: ${e instanceof Error ? e.message : e}`,
        );
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Yapay zekâya ulaşılamadı.");
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
    "liman vinç operatörü",
    "mahalle fırıncısı",
    "yolcu otobüsü şoförü",
    "tiyatro ışıkçısı",
    "arı yetiştiricisi",
    "adli tıp fotoğrafçısı",
    "okul rehber öğretmeni",
    "saat tamircisi",
    "dalgıç eğitmeni",
    "radyo gece programcısı",
    "seracı",
    "itfaiye eri",
    "matbaa mürettibi",
    "köy postacısı",
    "hayvan barınağı gönüllüsü",
    "kargo kuryesi",
    "balıkçı teknesi çırağı",
    "müze bekçisi",
  ],
  personality: [
    "inatçı, sıcakkanlı, dağınık",
    "sakin, meraklı, alıngan",
    "cesur, sabırsız, dürüst",
    "utangaç, esprili, sadık",
    "hesaplı, mesafeli, çalışkan",
    "duygusal, gözü pek, savurgan",
    "titiz, kuşkucu, fedakâr",
    "geveze, iyimser, unutkan",
    "sessiz, gözlemci, kırılgan",
    "asi, hırslı, kıskanç",
    "şefkatli, tembel, barışçıl",
    "alaycı, zeki, güvensiz",
  ],
  goal: [
    "Deniz kenarında küçük bir ev almak",
    "Ailemle aramı düzeltmek",
    "Kendi atölyemi açmak",
    "Korkmadan sevmeyi öğrenmek",
    "Bir kitabımı bastırmak",
    "Borçsuz bir hayata geçmek",
    "Babamın memleketine dönmek",
    "Bir çocuğu büyütebilmek",
    "Sahnede bir kez çalmak",
    "Kendi adıma bir bağ dikmek",
    "Eski dostumu bulmak",
    "Yalnız kalmadan huzur bulmak",
  ],
};

// Aynı öneriyi üst üste vermemek için alan başına son verilenleri hatırla.
const recent: Record<string, string[]> = {};

// Havuzdan, yakın zamanda verilmemiş taze bir öneri seç.
function freshPick(field: string) {
  const pool = FALLBACK_SUGGESTIONS[field] ?? FALLBACK_SUGGESTIONS.goal;
  const seen = recent[field] ?? [];
  const fresh = pool.filter((p) => !seen.includes(p));
  const value = pick(fresh.length ? fresh : pool);
  recent[field] = [...seen, value].slice(-Math.max(1, Math.floor(pool.length / 2)));
  return value;
}

// İpucundaki konuyu gerçek meslek/uğraşlara bağlayan sözlük.
// "doktor" → hekimlik dalları, "kundak" → yangın/suç dünyası vb.
const HINT_TOPICS: { keys: string[]; jobs: string[] }[] = [
  { keys: ["doktor", "hekim", "tıp", "hastane", "sağlık", "cerrah"], jobs: ["acil servis doktoru", "kırsalda aile hekimi", "çocuk cerrahı", "adli tabip", "ambulans hekimi", "onkoloji doktoru"] },
  { keys: ["hemşire", "bakım"], jobs: ["yoğun bakım hemşiresi", "evde bakım hemşiresi", "gece vardiyası hemşiresi"] },
  { keys: ["kundak", "yangın", "ateş", "suç", "hırsız", "soygun", "mafya", "çete"], jobs: ["kasa hırsızı", "kundakçı", "araba çalan tamirci", "sahte evrak ustası", "sokak dolandırıcısı", "kaçakçı teknesi kaptanı"] },
  { keys: ["polis", "dedektif", "adalet", "hukuk", "avukat", "mahkeme"], jobs: ["cinayet masası dedektifi", "ceza avukatı", "adliye kâtibi", "narkotik polisi"] },
  { keys: ["deniz", "balık", "gemi", "liman", "dalgıç"], jobs: ["balıkçı teknesi kaptanı", "liman vinç operatörü", "dalgıç eğitmeni", "gemi makinisti"] },
  { keys: ["müzik", "şarkı", "gitar", "piyano", "sahne", "orkestra"], jobs: ["bar piyanisti", "stüdyo ses mühendisi", "sokak müzikçisi", "orkestra kemancısı"] },
  { keys: ["yazı", "kitap", "gazete", "haber", "edebiyat", "şiir"], jobs: ["taşra gazetecisi", "hayalet yazar", "yayınevi editörü", "savaş muhabiri"] },
  { keys: ["hayvan", "veteriner", "köpek", "kedi", "at"], jobs: ["kırsal veteriner", "hayvan barınağı sorumlusu", "at bakıcısı", "kuş rehabilitasyon uzmanı"] },
  { keys: ["yemek", "aşçı", "mutfak", "fırın", "pasta", "kahve"], jobs: ["otel aşçıbaşı", "mahalle fırıncısı", "pastane şefi", "seyyar kahveci"] },
  { keys: ["bilgisayar", "yazılım", "kod", "teknoloji", "oyun", "siber"], jobs: ["oyun programcısı", "siber güvenlik uzmanı", "veri analisti", "gömülü yazılım geliştiricisi"] },
  { keys: ["öğretmen", "okul", "eğitim", "çocuk", "üniversite"], jobs: ["köy öğretmeni", "okul rehber öğretmeni", "anaokulu öğretmeni", "tarih doçenti"] },
  { keys: ["uzay", "bilim", "araştırma", "laboratuvar", "fizik", "kimya"], jobs: ["gökbilimci", "laboratuvar teknisyeni", "deprem araştırmacısı", "aşı geliştirme biyoloğu"] },
  { keys: ["asker", "savaş", "ordu", "pilot", "uçak"], jobs: ["helikopter pilotu", "arama kurtarma askeri", "mayın temizleme uzmanı", "kargo uçağı pilotu"] },
  { keys: ["sanat", "resim", "heykel", "tasarım", "moda", "fotoğraf"], jobs: ["duvar resmi sanatçısı", "kostüm tasarımcısı", "belgesel fotoğrafçısı", "seramik ustası"] },
  { keys: ["spor", "futbol", "boks", "koş", "antren"], jobs: ["boks antrenörü", "amatör küme futbolcusu", "fizyoterapist", "dağ rehberi"] },
  { keys: ["toprak", "çiftlik", "tarım", "bağ", "arı", "orman"], jobs: ["arı yetiştiricisi", "bağ işletmecisi", "orman muhafaza memuru", "seracı"] },
  { keys: ["para", "banka", "borsa", "ticaret", "patron", "şirket"], jobs: ["borsa aracısı", "banka kredi uzmanı", "küçük esnaf", "icra takip memuru"] },
  { keys: ["yol", "şoför", "kamyon", "taksi", "kurye"], jobs: ["uzun yol kamyoncusu", "gece taksicisi", "motokurye", "yolcu otobüsü şoförü"] },
  { keys: ["insan", "psikolog", "sosyal", "toplum", "yardım"], jobs: ["insan kaynakları uzmanı", "sosyal hizmet görevlisi", "psikolojik danışman", "mahalle muhtarı", "afet gönüllüsü koordinatörü", "yaşlı bakım evi sorumlusu"] },
  { keys: ["çocuk", "bebek", "anaokul"], jobs: ["anaokulu öğretmeni", "çocuk gelişim uzmanı", "oyuncak tamircisi", "çocuk kitabı çizeri"] },
  { keys: ["gez", "seyahat", "tur", "otel", "dünya"], jobs: ["tur rehberi", "seyahat yazarı", "butik otel işletmecisi", "gezici belgeselci"] },
  { keys: ["çiçek", "bahçe", "bitki", "doğa"], jobs: ["peyzaj bahçıvanı", "çiçekçi dükkânı sahibi", "botanik bahçesi bakıcısı", "doğa koruma görevlisi"] },
  { keys: ["ölüm", "cenaze", "mezar"], jobs: ["cenaze levazımatçısı", "mezarlık bekçisi", "adli tıp fotoğrafçısı"] },
  { keys: ["din", "cami", "kilise", "inanç"], jobs: ["köy imamı", "ilahiyat öğretmeni", "vakıf gönüllüsü"] },
  { keys: ["ev", "temizlik", "tamir", "usta"], jobs: ["ev tadilat ustası", "kombi servisçisi", "çilingir", "ikinci el eşya dükkâncısı"] },
];

// Kısa anahtarlar ("at", "ev"...) kelime içinde yanlış eşleşmesin (örn. "satranç" ≠ "at").
export const keyMatch = (text: string, k: string) =>
  k.length <= 3 ? new RegExp(`(^|[^a-zçğıöşüâî])${k}`, "u").test(text) : text.includes(k);

function withHint(field: string, hint: string) {
  const h = hint.trim().replace(/\s+/g, " ").slice(0, 60);
  const low = h.toLocaleLowerCase("tr");
  const words = low.split(/[^\p{L}]+/u).filter(Boolean);

  if (field === "occupation") {
    // Önce ipucunun konusuna uyan gerçek meslekleri bul.
    const topic = HINT_TOPICS.find((t) =>
      t.keys.some((k) => keyMatch(low, k) || words.some((w) => w.length > 3 && k.startsWith(w))),
    );
    if (topic) {
      const seenKey = `occupation:${topic.keys[0]}`;
      const seen = recent[seenKey] ?? [];
      const fresh = topic.jobs.filter((j) => !seen.includes(j));
      const value = pick(fresh.length ? fresh : topic.jobs);
      recent[seenKey] = [...seen, value].slice(-Math.max(1, topic.jobs.length - 1));
      return value;
    }
    // Konu sözlükte yoksa havuzdan anlamlı bir eşleşme dene.
    const pool = FALLBACK_SUGGESTIONS.occupation ?? [];
    const match = pool.find((p) => words.some((w) => w.length > 3 && p.toLocaleLowerCase("tr").includes(w)));
    if (match) return match;
    // İpucu hiçbir konuya uymadı: saçma kalıp üretme, havuzdan kaliteli bir öneri ver.
    return freshPick("occupation");
  }

  const pool = FALLBACK_SUGGESTIONS[field] ?? [];
  const match = pool.find((p) => words.some((w) => w.length > 3 && p.toLocaleLowerCase("tr").includes(w)));
  if (match) return match;
  if (field === "personality") return `${h}, ${pick(["inatçı", "meraklı", "kırılgan", "esprili"])}`.slice(0, 80);
  return freshPick(field);
}


export function fallbackSuggestion(field: string, hint?: string, avoid: string[] = []) {
  // avoid: bu oturumda daha önce verilenler — aynıyı tekrarlama.
  for (let i = 0; i < 6; i++) {
    const value = hint && hint.trim().length > 1 ? withHint(field, hint) : freshPick(field);
    if (!avoid.includes(value)) return value;
  }
  return freshPick(field);
}


// ============================================================
//  YEREL HİKÂYE MOTORU — kombinasyonel motora devrediyor
//  (src/lib/story-engine.server.ts)
// ============================================================

export type LocalParsed = {
  title: string;
  narrative: string;
  outcomeText: string;
  choices: { label: string; recommended: boolean }[];
  effects: { happiness: number; wealth: number; career: number; stress: number };
  ageDelta: number;
  facts: string[];
  domain?: string;
  /** Kredisiz motorun aday/puan raporu. */
  quality?: QualityAudit;
};

export function localLifeEvent(a: SceneArgs): LocalParsed {
  return generateScene(a);
}
