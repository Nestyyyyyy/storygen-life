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
//  YEREL HİKÂYE MOTORU v2 — yapay zekâ / API gerektirmez
//  Zengin şablonlar + rastgele dolgu ile detaylı sahneler üretir.
// ============================================================

export type LocalParsed = {
  title: string;
  narrative: string;
  outcomeText: string;
  choices: { label: string; recommended: boolean }[];
  effects: { happiness: number; wealth: number; career: number; stress: number };
  ageDelta: number;
  facts: string[];
};

const rnd = (n: number) => Math.floor(Math.random() * n);
const one = <T,>(a: T[]): T => a[rnd(a.length)];
const between = (lo: number, hi: number) => lo + rnd(hi - lo + 1);

const NAMES_F = ["Elif", "Zeynep", "Selin", "Aslı", "Nur", "Ece", "Melis", "Derya", "Yasemin", "Ceren", "Pınar", "İrem", "Sude", "Berrin", "Hande", "Feride", "Nazlı"];
const NAMES_M = ["Emre", "Can", "Mert", "Kaan", "Barış", "Onur", "Serkan", "Tolga", "Umut", "Kerem", "Burak", "Efe", "Cenk", "Levent", "Tarık", "Halil", "Yusuf"];
const PETS = ["Şila", "Tarçın", "Boncuk", "Duman", "Zeytin", "Karamel", "Paşa", "Fındık", "Mırnav", "Leblebi"];
const PLACES = [
  "eski apartmanın gıcırdayan merdiveninde",
  "yağmurun camları dövdüğü bir sokakta",
  "köşedeki kafenin loş arka masasında",
  "kalabalık ve gürültülü otobüs durağında",
  "rüzgârın saçlarını dağıttığı sahil yolunda",
  "tezgâhların kurulduğu pazar yerinde",
  "dezenfektan kokan hastane koridorunda",
  "şehir dışına giden gece treninde",
  "mahalle bakkalının önündeki tahta bankta",
  "çınarın gölgesindeki çay bahçesinde",
  "asansörü yine bozuk olan iş hanında",
  "eski defterlerin durduğu tozlu balkonda",
];
const TIMES = ["sabahın köründe", "öğle sıcağında", "gün batarken", "gece yarısına doğru", "cumartesi sabahı", "bayram arifesinde", "yağmurlu bir salı akşamı"];
const MONEY = ["3.500 lira", "8.200 lira", "15 bin lira", "27 bin lira", "birkaç bin lira", "aylık maaşın kadar bir para"];

const aName = () => (Math.random() < 0.5 ? one(NAMES_F) : one(NAMES_M));
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

type Scene = {
  t: string;
  n: string;
  c: [string, string, string];
  rec: number;
  bias: "happiness" | "wealth" | "career";
  fact?: string;
  mature?: boolean;
};

// Normal sahneler (her modda kullanılır)
const NORMAL_SCENES: Scene[] = [
  {
    t: "Beklenmedik bir mesaj",
    n: "{time} telefonun art arda titriyor. Ekranda yıllardır konuşmadığın {name} yazıyor: \"Seni görmem lazım, yüz yüze. Telefonda olmaz.\" Son karşılaşmanız hiç iyi bitmemişti; yine de mesajı silemiyorsun. Parmağın cevap kutusunun üstünde, kalbin eski bir borç gibi ağır.",
    c: ["Her şeyi bırak, bu akşam onunla buluş", "Önce ne istediğini yazıp öğrenmeye çalış", "Mesajı görmezden gel; geçmiş geçmişte kalsın"],
    rec: 1, bias: "happiness", fact: "{name} yıllar sonra yeniden hayatına girdi.",
  },
  {
    t: "Kapındaki komşu",
    n: "Kapı zili {time} çalıyor. Yeni komşun {name}, kucağında mırıldanan {pet} adında bir kediyle kapında: acil şehir dışına çıkması gerekiyormuş, bir hafta kediye bakacak kimsesi yokmuş. Gözlerindeki telaş gerçek; kedi ise çoktan senin koridorunu koklamaya başladı bile.",
    c: ["Kediyi al, bir haftalık misafirin olsun", "Sadece bu seferlik, bir daha yok de ve kabul et", "Kibarca reddet; kendi düzenin zaten pamuk ipliğinde"],
    rec: 0, bias: "happiness", fact: "Komşu {name}'in kedisi {pet} ile tanıştın.",
  },
  {
    t: "Masadaki teklif",
    n: "{job} olarak verdiğin emek sonunda birinin gözüne takıldı. Bugün seni odaya çağırıp masaya bir teklif koydular: daha büyük sorumluluk, daha çok para, ama iki katı yük ve hiç garantisi olmayan bir sonuç. \"Yarına kadar düşün\" dediler. Düşünmek mi, yoksa içindeki sese uymak mı?",
    c: ["Riski göze al ve teklifi hemen kabul et", "Masaya otur, şartları kendi lehine pazarlık et", "Teşekkür edip reddet; şimdilik güvenli liman iyi"],
    rec: 1, bias: "career",
  },
  {
    t: "Cüzdandaki delik",
    n: "Ay bitmeden para bitti; hesap ekranına bakarken içinin sıkıştığını hissediyorsun. Tam o akşam {name} arıyor: \"Ufak bir yatırım var, {money} koyarsan üç ayda ikiye katlarsın.\" Sesi her zamanki gibi kendinden emin. Ama böyle konuşan kaç kişinin battığını sen de biliyorsun.",
    c: ["Küçük bir miktarla şansını dene", "Bir gece düşün, araştır, öyle karar ver", "Teşekkür et ve uzak dur; kolay para diye bir şey yok"],
    rec: 2, bias: "wealth",
  },
  {
    t: "Vücudun konuşuyor",
    n: "Haftalardır süren yorgunluk bugün {place} sesini yükseltti: nefesin daraldı, gözlerin karardı, bir an duvara tutunmak zorunda kaldın. Etraftakiler fark etmedi ama sen fark ettin. İçinden bir ses \"bir şeyin yok\" diyor; öbürü \"artık doktora görün\" diye fısıldıyor.",
    c: ["Yarın ilk iş doktordan randevu al", "Bir hafta dinlen, geçmezse gidersin", "Üstüne su iç, kimseye söyleme"],
    rec: 0, bias: "happiness",
  },
  {
    t: "Eski bir dost, eski bir yara",
    n: "{time} {place} burun buruna geliyorsunuz: {name}. Bir zamanlar kardeşten ileriydiniz; sonra tek bir kavga her şeyi bitirdi. Şimdi karşında duruyor, elinde poşetler, yüzünde senin de tanıdığın o pişman ifade. İkiniz de ilk adımı bekliyorsunuz.",
    c: ["Gülümse ve yıllardır içinde biriken her şeyi konuş", "Kısa bir merhaba de, kartları kapalı tut", "Görmemiş gibi yap ve yoluna devam et"],
    rec: 0, bias: "happiness", fact: "Eski dostun {name} ile aynı şehirde olduğunu öğrendin.",
  },
  {
    t: "Hedefe giden dar kapı",
    n: "\"{goal}\" — bu hayali kaç kişiye anlattın, kaçı güldü geçti. Bugün ise gerçek bir kapı aralandı: tanıdık bir tanıdık, tam da bu konuda sana bir fırsat ayarlayabileceğini söylüyor. Tek şartı var: bu hafta karar vermen ve elindeki düzeni biraz bozmayı göze alman.",
    c: ["Kapıdan gir; böyle fırsat bir daha gelmez", "Bir plan yap, ayaklarını sağlam basarak ilerle", "Henüz hazır değilim de, kapıyı nazikçe kapat"],
    rec: 1, bias: "career",
  },
  {
    t: "Kaçış bileti",
    n: "İş çıkışı {place} otururken telefonuna bir bildirim düşüyor: yarın kalkan otobüsle iki günlük bir kıyı kasabası kaçamağı, yarı fiyatına. Yorgunluğun kemiklerinde; ama bu ay bütçe zaten kıl payı. Deniz kokusunu hayal etmen bile bir karar gibi.",
    c: ["Bileti al, çantanı topla, kaç bu şehirden", "Bütçeni önce hesapla, uyarsa git", "Bu sefer kal; deniz kaçmıyor ya"],
    rec: 0, bias: "happiness",
  },
  {
    t: "Tozlu kutudaki çağrı",
    n: "Dolabı düzenlerken eski bir kutu düşüyor önüne. İçinden yıllar önce yarım bıraktığın bir uğraşın kalıntıları çıkıyor; ellerin kendiliğinden uzanıyor. O yıllarda bunun için 'bir gün' derdin. Bugün, o günlerden biri olabilir mi?",
    c: ["Yeniden başla; geç kalmış sayılmazsın", "Hafta sonu ufak bir deneme yap, bak bakalım", "Kutuyu kapat; nostalji güzel ama vakit yok"],
    rec: 0, bias: "happiness",
  },
  {
    t: "Aile masasında fırtına",
    n: "Pazar yemeğinde, tam çaylar gelirken, yıllardır konuşulmayan o mesele yeniden açılıyor. {name} sesini yükseltiyor, bir başkası masayı terk etmekle tehdit ediyor ve bütün gözler sana dönüyor: \"Sen ne düşünüyorsun?\" Kaşığı bırakıyorsun. Söyleyeceğin cümle bu evde uzun süre unutulmayacak.",
    c: ["Doğru bildiğini açık açık söyle, kim kırılırsa kırılsın", "İki tarafı da yatıştırıp ortak bir yol bul", "\"Ben karışmam\" de ve çayını iç"],
    rec: 1, bias: "happiness",
  },
  {
    t: "Yerdeki cüzdan",
    n: "{time} {place} ayağına bir şey takılıyor: kabarık bir cüzdan. İçinde {money}, birkaç kart ve bir kimlik var: {name}. Etrafta kimse yok. Cüzdanın ağırlığı elinde; vicdanın ve kiran aynı anda konuşuyor.",
    c: ["Kimlikteki adrese git, cüzdanı sahibine teslim et", "En yakın karakola bırak, gerisine karışma", "Parayı al, cüzdanı çöpe at; kimse görmedi"],
    rec: 0, bias: "wealth", fact: "Cüzdanını bulduğun {name} sana borçlu hissediyor.",
  },
  {
    t: "Üst kattaki hayat",
    n: "Üç gecedir üst kattan sesler geliyor: bir taşınma gürültüsü, sonra bir müzik, sonra bağırışlar. Bu sabah kapında {name} duruyor; mahcup bir gülümsemeyle elinde bir tabak börek: \"Kusura bakmayın, zor bir dönemden geçiyorum.\" Gözlerinin altındaki morluklar uykusuzluktan mı, başka bir şeyden mi, bilmiyorsun.",
    c: ["Böreği al, içeri davet et, derdini dinle", "Teşekkür et ama sınırını da nazikçe çiz", "Bir daha olursa yönetime şikâyet edeceğini söyle"],
    rec: 0, bias: "happiness", fact: "Üst kat komşun {name} zor bir dönemden geçiyor.",
  },
  {
    t: "Sahnedeki boşluk",
    n: "Mahallenin dayanışma gecesinde sunucu aniden anons ediyor: programda boşluk var, gönüllü bir performans aranıyor. Arkadaşların gülerek seni işaret ediyor; salon alkışlamaya başlıyor bile. Sahne ışığı gözünü alıyor. Ya şimdi ya hiç.",
    c: ["Sahneye çık ve elinden geleni yap", "Espriyle topu başkasına at", "Kıpkırmızı olup yerinde küçül"],
    rec: 0, bias: "happiness",
  },
  {
    t: "İki iş bir ömür",
    n: "Ek gelir için baktığın ilan gerçek çıktı: hafta sonları {money} kazandıran bir ek iş. Ama bu, iki aydır planladığın her şeyin — dinlenmenin, görüşmelerin, \"{goal}\" için ayırdığın saatlerin — rafa kalkması demek. Para mı, zaman mı; asıl zenginlik hangisi?",
    c: ["Ek işi kap; para her kapıyı açar", "Sadece bir aylığına dene, sonra karar ver", "Reddet; zamanın pazarlığı olmaz"],
    rec: 1, bias: "wealth",
  },
];

// Yetişkin modu sahneleri (18+) — sert dil, ima ve atmosfer; grafik tasvir yok
const MATURE_SCENES: Scene[] = [
  {
    t: "Gece yarısı itirafı",
    n: "Gece {place} yalnız kalınca {name} sesini alçaltıyor: \"Aylardır her gün seni düşünerek uyanıyorum.\" Aranızdaki gerilim aylardır havada asılıydı; şimdi masaya kondu. Bardağındaki içki yarım, kalbin dörtnala. Bu kapı bir kez açılırsa, bir daha eskisi gibi kapanmaz.",
    c: ["Elini uzat; gerisini gece bilsin", "\"Ben de\" de ama yavaş gitmeyi iste", "Geri çekil; bu ateş ikinizi de yakar"],
    rec: 1, bias: "happiness", mature: true, fact: "{name} ile aranızda bir şey başladı.",
  },
  {
    t: "Yasak bölge",
    n: "O bakışmalar, o 'yanlışlıkla' değen eller... {name} ile aranızdaki şey artık masumiyet sınırını çoktan geçti — ve ikinizin de başkasına sözü var. Bu akşam \"konuşmamız lazım\" diye mesaj attı; buluşma yeri şehrin öbür ucunda, tanıdıkların uğramadığı bir yer. Gitmek bir karar; gitmemek de.",
    c: ["Git; olacaksa olsun, yalan bitsin", "Git ama her şeyi bitirmek için git", "Gitme ve mesajları sil; bu yangını büyütme"],
    rec: 1, bias: "happiness", mature: true,
  },
  {
    t: "Son kadeh kimin?",
    n: "Zor bir haftanın sonunda kendini yine aynı barda buluyorsun. \"Tek kadeh\" diye başlayan gece üçüncü şişeye uzanıyor; barmen artık adını biliyor. Aynadaki yüzüne bakıyorsun: gözler kızarık, gülüş yorgun. Bu gece eve nasıl döneceğin değil mesele — yarın akşam yine burada olup olmayacağın.",
    c: ["Hesabı iste, dışarı çık, yürüyerek ayıl", "Son bir kadeh iç ama yarın için söz ver", "Gecenin akışına bırak kendini"],
    rec: 0, bias: "happiness", mature: true,
  },
  {
    t: "Tefecinin gölgesi",
    n: "Borç {money} oldu ve faiz her hafta büyüyor. Bu akşam kapına dayanan {name}, 'tatlı dilli' konuşuyor ama gözleri gülmüyor: \"Cuma günü. Tamamı. Yoksa seni ararken kapı komşularınla da tanışırız.\" Kapı kapanınca sırtını duvara veriyorsun; ellerin titriyor.",
    c: ["Ailene açıl, yardım iste, yükü paylaş", "Bir kısmını denkleştirip zaman satın al", "Şehri terk etmeyi ciddi ciddi düşün"],
    rec: 0, bias: "wealth", mature: true, fact: "Tefeci {name} ile aranda kapanmamış bir hesap var.",
  },
  {
    t: "Kirli para, temiz eller",
    n: "Eski tanıdığın {name}, gece yarısı arayıp buluşma istiyor. Konu: 'ufak bir taşıma işi', tek sefer, {money} nakit. \"Sorma, bilme, sadece taşı\" diyor. Sesindeki rahatlık ürkütücü. Para gerçek, iş kirli; ve senin bugünlerde ikisine de itiraz edecek hâlin yok.",
    c: ["Reddet ve numarasını engelle", "Ne taşındığını öğrenmeden asla deme", "Bir seferlik gözünü kapat, parayı al"],
    rec: 0, bias: "wealth", mature: true,
  },
  {
    t: "Telefondaki hayalet",
    n: "Sevdiğin insan duşta; telefonu masada yüzüstü duruyor ve art arda titriyor. Ekran bir an yanıyor: kayıtsız bir numara, mesajın ilk kelimeleri okunuyor: \"Dün gece...\" Kalbin göğsünden çıkacak gibi. Bir dokunuş her şeyi öğrenmene yeter; ama öğrendiğin şeyle yaşamak da senin görevin olur.",
    c: ["Telefona dokunma; akşam yüzüne bakıp sor", "Mesajı oku, sonrasını sonra düşün", "Hiç görmemiş gibi yap, şüpheyi içine göm"],
    rec: 0, bias: "happiness", mature: true,
  },
  {
    t: "Kumarhane aritmetiği",
    n: "\"Şansımı bir döneyim\" diye girdiğin o yerde üçüncü saatini dolduruyorsun. Önündeki fişler eridi; cebinde son {money} kaldı. Masadaki adam gülümsüyor: \"Talih dönmek üzere, hissediyorum.\" Sen de hissediyorsun — ama neyi hissettiğinden emin değilsin: talihi mi, uçurumu mu?",
    c: ["Kalk ve kalan parayla evine git", "Son bir el oyna, sonra kesin kalk", "Hepsini ortaya koy; ya hep ya hiç"],
    rec: 0, bias: "wealth", mature: true,
  },
  {
    t: "Gece vardiyası sonrası",
    n: "Vardiyadan çıktığında şehir bomboş; bir tek köşedeki büfe açık. Orada, sigarasını yakmaya çalışan {name} ile göz göze geliyorsun. Yarım saat sonra hâlâ konuşuyorsunuz; espriler keskin, bakışlar daha keskin. \"Bende kahve var\" diyor, gözlerini kaçırmadan. Şehir uyuyor; siz uyanıksınız.",
    c: ["Kahve davetini kabul et; kapı kapansın", "Numarasını al, acele etme", "Gülümse, 'iyi geceler' de ve yürü"],
    rec: 0, bias: "happiness", mature: true,
  },
];

// Kaderin belirlediği (seçimsiz) sahneler
const FORCED_SCENES: { t: string; n: string; go: string; bias: "happiness" | "wealth" | "career"; mature?: boolean }[] = [
  {
    t: "Gece yarısı telefonu",
    n: "Telefon {time} çalıyor; bu saatte gelen telefon hiç iyi haber vermemiştir. Arayan {name}; sesi titriyor. Dinlerken oturduğun yerden kalkıp pencereye yürüyorsun, çünkü bazı haberler ayakta dinlenir. Kapattığında şehir aynı şehir, ama sen aynı sen değilsin.",
    go: "Sabahı bekle ve ilk otobüse bin", bias: "happiness",
  },
  {
    t: "Bir metrelik mesafe",
    n: "{time} {place} her şey bir saniyede oluyor: bir korna, bir fren sesi, savrulan bir gölge. Kenara çekilmesen o gölge sen olabilirdin. Kalabalık toplanıyor, sen ise titreyen ellerine bakıyorsun. Bugün şanslıydın; ama şans, ders çalışmayanın öğretmenidir.",
    go: "Derin bir nefes al ve toparlan", bias: "happiness",
  },
  {
    t: "Beyaz zarf",
    n: "Mesai bitimine on dakika kala masana bir zarf bırakılıyor. İçindekini okumana gerek yok aslında; ofisteki sessizlik her şeyi anlatıyor. 'Küçülme' diyorlar, 'seninle ilgili değil' diyorlar. Kutuya eşyalarını koyarken yıllarını da katlayıp yanına koyuyorsun.",
    go: "Kutunu al ve yeni bir sayfa aç", bias: "career",
  },
  {
    t: "Duvardaki çatlak",
    n: "Sabah kombiden gelen sesle uyanıyorsun; öğlen musluklardan su akmıyor, akşam ustanın yüzü her şeyi söylüyor: \"Bu iş {money} tutar, daha azına kimse dokunmaz.\" Ev senin evin, ama bu ay bütçen çoktan başkalarına söz vermişti.",
    go: "Hesap defterini aç ve yeniden başla", bias: "wealth",
  },
  {
    t: "Damgasız evrak",
    n: "Aylardır beklediğin işlem tek bir eksik imza yüzünden iade edildi. Gişedeki görevli omuz silkiyor: \"Sistem böyle, yapacak bir şey yok.\" İtiraz süresi üç hafta, senin sabrın üç dakika. Devlet dairesinin floresan ışığı altında derin bir nefes alıyorsun.",
    go: "Sıra numarası al ve bekle", bias: "career",
  },
  {
    t: "Ateşli günler",
    n: "Önce hafif bir üşüme dedin, sonra dünya döndü. Üç gündür yataktasın; termometre inatla aynı sayıyı gösteriyor. Telefonundaki mesajlar birikiyor, planların birer birer deviriliyor. Vücudun sana yıllardır söyleyemediğini nihayet zorla söyletiyor: dur.",
    go: "İyileşene kadar dinlen", bias: "happiness",
  },
  {
    t: "Kapanan kepenk",
    n: "Her sabah selamlaştığın esnaf bugün kepengi yarı kapalı karşılıyor: \"Biz kapatıyoruz, evlat.\" O tezgâhın başında büyüdün sen; şimdi 'devren kiralık' yazısı asılıyor. Şehir değişiyor ve kimse sana sormuyor.",
    go: "Son kez içeri gir, vedalaş", bias: "happiness",
  },
  {
    t: "Ayrılık masası",
    n: "\"Konuşmamız lazım\" mesajının ardından geldiğin masada karşındaki gözlerine bakamıyor. Cümleler ezberlenmiş, kahveler soğuk. \"Sen değilsin, benim...\" diye başlıyor ve sen gerisini duymuyorsun. Kalbin, garsonun topladığı fincanlar gibi: boş ve az kırık.",
    go: "Hesabı öde ve yürümeye başla", bias: "happiness", mature: true,
  },
];

const OUTCOME_TEXT: Record<"success" | "partial" | "failure", string[]> = {
  success: [
    "Cesaretinin karşılığını aldın: işler tam da umduğun gibi gitti ve çevrendekiler bunu fark etti. Aynada kendine bakarken uzun zamandır ilk kez omuzların dik.",
    "Attığın adım tuttu; küçük bir pürüz çıktıysa da sonuç yüzünü güldürdü. O gece yastığa başını koyduğunda içinde tatlı bir yorgunluk vardı.",
    "Doğru anda doğru hamleyi yaptın ve hayat, nadiren yaptığı şeyi yapıp seni ödüllendirdi. Bunu kutlamayı hak ettin.",
    "Plan işledi. Hem de öyle böyle değil; günün sonunda telefonuna düşen o mesaj her şeye değerdi. İçindeki ses haklı çıktı.",
    "Kazandın — ama asıl kazancın özgüvenin oldu. Artık bir dahaki sefere elini daha da güçlü uzatacaksın.",
    "Her şey yerine oturdu: zamanlama, insanlar, şans. Bir süre kimse senden bunu alamayacak.",
  ],
  partial: [
    "İstediğinin bir kısmını aldın; gerisi parmaklarının arasından kayıp gitti. Yine de eve dönerken 'hiç yoktan iyidir' diye mırıldandın.",
    "Yarım bir zafer bu: kapı açıldı ama ardına kadar değil. Kazandığını cebine, kaybettiğini deneyim hanene yazdın.",
    "Ne tam oldu ne tam bozuldu. Bedel ödedin, karşılığında bir şeyler aldın; hesap başa baş kapandı ama içinde ufak bir burukluk kaldı.",
    "İşler yürüdü ama gıcırdayarak. Herkes memnun görünüyor; sen ise gece yatağında 'daha iyisi olabilirdi' diye düşünmekten kendini alamıyorsun.",
    "Sonuç fena değil, ama beklediğin o değildi. Hayat sana bir kez daha 'her şeyi alamazsın' dedi; sen de bir kez daha 'göreceğiz' dedin.",
    "Kısmen tuttu. Kaybettiklerine üzülecekken kazandıklarını saydın ve toplamda öndesin — şimdilik.",
  ],
  failure: [
    "Olmadı. Hem de hiç olmadı: plan daha ilk adımda tökezledi ve sen enkazı tek başına topladın. Bu gece uyku kolay gelmeyecek.",
    "Umduğun kapı yüzüne kapandı; sesi hâlâ kulaklarında. Canın yanıyor ama bir yerlerde bir ders saklı — sadece şu an görecek hâlin yok.",
    "Ters gitti. İnsanlar yanlış anladı, zamanlama şaştı, şans başka kapıya gitti. Cebindeki kayıp kadar gururundaki çizik de acıyor.",
    "Geri tepti; hem de sertçe. Günler sonra bile o an aklına geldikçe içinden bir 'keşke' geçecek. Ama keşkeler kira ödemiyor — toparlanman gerek.",
    "Bu eli kaybettin. Telefonu kapatırken ellerinin titrediğini fark ettin; sonra derin bir nefes alıp pencereyi açtın. Hayat devam ediyor, sen de edeceksin.",
    "Yanlış ata oynadın ve bedelini ödedin. Şimdi herkes bir şey söylüyor; en zoru da hepsinin biraz haklı olması.",
  ],
};

const FLAVOR = [
  "İçinde bir his, bunun sıradan bir gün olarak kalmayacağını söylüyor.",
  "Sonradan bu anı çok düşüneceksin; şimdilik sadece yaşıyorsun.",
  "Rüzgâr değişiyor; hangi yöne, henüz belli değil.",
  "Kararlar küçük görünür — sonuçları büyüyene kadar.",
  "Bir yol ayrımındasın ve yollar geri dönüşsüz.",
];

const FORCED_CONTINUE = ["Devam et", "Derin bir nefes al ve yürü", "Sabahı bekle", "Toparlan; hayat sürüyor"];

// Sonuç metinlerini sırayla döndür: aynı metin art arda gelmesin.
const lastOutcome: Record<string, string[]> = {};
function pickOutcomeText(kind: "success" | "partial" | "failure") {
  const seen = lastOutcome[kind] ?? [];
  const pool = OUTCOME_TEXT[kind].filter((t) => !seen.includes(t));
  const v = one(pool.length ? pool : OUTCOME_TEXT[kind]);
  lastOutcome[kind] = [...seen, v].slice(-(OUTCOME_TEXT[kind].length - 1));
  return v;
}

function makeEffects(
  outcome: "success" | "partial" | "failure" | "neutral",
  bias: "happiness" | "wealth" | "career",
) {
  const e = { happiness: 0, wealth: 0, career: 0, stress: 0 };
  if (outcome === "neutral") return e;
  if (outcome === "success") {
    e[bias] += between(7, 16);
    e.happiness += between(2, 6);
    e.stress -= between(3, 8);
  } else if (outcome === "partial") {
    e[bias] += between(3, 9);
    e.wealth -= between(0, 5);
    e.stress += between(2, 6);
  } else {
    e[bias] -= between(6, 14);
    e.happiness -= between(3, 9);
    e.stress += between(6, 13);
  }
  return e;
}

export function localLifeEvent(a: {
  occupation: string;
  goal: string;
  action?: string;
  outcome: "success" | "partial" | "failure" | "neutral";
  forced: boolean;
  mature: boolean;
  usedFacts: string[];
  usedTitles: string[];
}): LocalParsed {
  const vars: Record<string, string> = {
    name: aName(),
    pet: one(PETS),
    place: one(PLACES),
    time: one(TIMES),
    money: one(MONEY),
    job: a.occupation || "işini arayan biri",
    goal: a.goal || "bir hayali",
  };
  const opening = !a.action;
  const effOutcome = a.outcome === "neutral" ? "partial" : a.outcome;
  // Bu oynayışta zaten yaşanan sahneleri ele: tekrar yok (havuz bitene kadar).
  const used = a.usedTitles.map((t) => t.replace(/^18\+\s*/, ""));

  if (a.forced) {
    const fPool = a.mature ? FORCED_SCENES : FORCED_SCENES.filter((x) => !x.mature);
    const fFresh = fPool.filter((x) => !used.includes(x.t));
    const s = one(fFresh.length ? fFresh : fPool);
    return {
      title: (s.mature && a.mature ? "18+ " : "") + fill(s.t, vars),
      narrative: fill(s.n, vars),
      outcomeText: opening ? "" : pickOutcomeText(effOutcome),
      choices: [{ label: fill(s.go || one(FORCED_CONTINUE), vars), recommended: true }],
      effects: makeEffects(a.outcome === "neutral" ? "failure" : a.outcome, s.bias),
      ageDelta: Math.random() < 0.5 ? 1 : 0,
      facts: [],
    };
  }

  const pool = a.mature ? [...NORMAL_SCENES, ...MATURE_SCENES] : NORMAL_SCENES;
  const nFresh = pool.filter((x) => !used.includes(x.t));
  const s = one(nFresh.length ? nFresh : pool);
  const facts: string[] = [];
  if (s.fact) {
    const f = fill(s.fact, vars);
    if (!a.usedFacts.includes(f)) facts.push(f);
  }
  const choices = s.c.map((label, i) => ({ label: fill(label, vars), recommended: i === s.rec }));
  const narrative = fill(s.n, vars) + (Math.random() < 0.45 ? " " + one(FLAVOR) : "");

  return {
    title: (s.mature ? "18+ " : "") + fill(s.t, vars),
    narrative,
    outcomeText: opening ? "" : fill(pickOutcomeText(effOutcome), vars),
    choices,
    effects: opening ? makeEffects("neutral", s.bias) : makeEffects(a.outcome, s.bias),
    ageDelta: opening ? 0 : Math.random() < 0.7 ? 0 : 1,
    facts,
  };
}
