export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// --- AI sağlayıcı yapılandırması ---
// Sağlayıcıdan bağımsız: OpenAI, Google Gemini (OpenAI uyumlu uç), OpenRouter
// ya da eski Lovable ağ geçidi. Hangisi tanımlıysa o kullanılır.
type AiConfig = { key: string; url: string; model: string; referer?: string; title?: string };

export function aiConfig(): AiConfig {
  // 1) Kendi sağlayıcın (öncelikli) — OpenAI uyumlu herhangi bir uç
  //    OpenAI:     AI_BASE_URL=https://api.openai.com/v1/chat/completions           AI_MODEL=gpt-4o-mini
  //    Gemini:     AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions  AI_MODEL=gemini-2.0-flash
  //    OpenRouter: AI_BASE_URL=https://openrouter.ai/api/v1/chat/completions        AI_MODEL=google/gemini-2.0-flash-exp
  const key =
    process.env.AI_API_KEY ??
    process.env.OPENAI_API_KEY ??
    process.env.OPENROUTER_API_KEY;
  if (key) {
    return {
      key,
      url: process.env.AI_BASE_URL ?? "https://api.openai.com/v1/chat/completions",
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
      referer: process.env.AI_REFERER, // OpenRouter için opsiyonel
      title: process.env.AI_TITLE, // OpenRouter için opsiyonel
    };
  }

  // 2) Eski Lovable ağ geçidi (geriye dönük uyumluluk)
  const lovable = process.env.LOVABLE_API_KEY;
  if (lovable) {
    return {
      key: lovable,
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      model: process.env.AI_MODEL ?? "google/gemini-3.1-pro-preview",
    };
  }

  throw new Error(
    "AI anahtarı tanımlı değil. AI_API_KEY (+ AI_BASE_URL, AI_MODEL) ya da LOVABLE_API_KEY ayarla.",
  );
}

// Geriye dönük uyumluluk için korunuyor.
export function aiKey() {
  return aiConfig().key;
}

export async function askAi(system: string, user: string, temperature = 1) {
  const cfg = aiConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.key}`,
  };
  // OpenRouter isteğe bağlı başlıkları (tanımlıysa)
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
];

function withHint(field: string, hint: string) {
  const h = hint.trim().replace(/\s+/g, " ").slice(0, 60);
  const low = h.toLocaleLowerCase("tr");
  const words = low.split(/[^\p{L}]+/u).filter(Boolean);

  if (field === "occupation") {
    // Önce ipucunun konusuna uyan gerçek meslekleri bul.
    const topic = HINT_TOPICS.find((t) =>
      t.keys.some((k) => low.includes(k) || words.some((w) => w.length > 3 && k.startsWith(w))),
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
    // Son çare: ipucunu meslek gibi yaz, "(ustası)" gibi parantez ekleme.
    return h.toLocaleLowerCase("tr").slice(0, 80);
  }

  const pool = FALLBACK_SUGGESTIONS[field] ?? [];
  const match = pool.find((p) => words.some((w) => w.length > 3 && p.toLocaleLowerCase("tr").includes(w)));
  if (match) return match;
  if (field === "personality") return `${h}, ${pick(["inatçı", "meraklı", "kırılgan", "esprili"])}`.slice(0, 80);
  return `${h.charAt(0).toLocaleUpperCase("tr")}${h.slice(1)}`.slice(0, 80);
}


export function fallbackSuggestion(field: string, hint?: string) {
  if (hint && hint.trim().length > 1) return withHint(field, hint);
  const pool = FALLBACK_SUGGESTIONS[field] ?? FALLBACK_SUGGESTIONS.goal;
  const seen = recent[field] ?? [];
  const fresh = pool.filter((p) => !seen.includes(p));
  const value = pick(fresh.length ? fresh : pool);
  recent[field] = [...seen, value].slice(-Math.max(1, Math.floor(pool.length / 2)));
  return value;
}

