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


// ============================================================
//  YEREL HİKÂYE MOTORU — yapay zekâ / API gerektirmez
//  Şablon + rastgele doldurma ile hikâye sahnesi üretir.
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

const NAMES_F = ["Elif", "Zeynep", "Selin", "Aslı", "Nur", "Ece", "Melis", "Derya", "Yasemin", "Ceren", "Pınar", "İrem", "Sude", "Berrin", "Hande"];
const NAMES_M = ["Emre", "Can", "Mert", "Kaan", "Barış", "Onur", "Serkan", "Tolga", "Umut", "Kerem", "Burak", "Efe", "Cenk", "Levent", "Tarık"];
const PETS = ["Şila", "Tarçın", "Boncuk", "Duman", "Zeytin", "Karamel", "Paşa", "Fındık"];
const PLACES = [
  "eski bir apartmanın merdiveninde",
  "yağmurlu bir sokakta",
  "küçük bir kafenin köşesinde",
  "kalabalık bir otobüs durağında",
  "sahil kenarında",
  "hareketli bir pazar yerinde",
  "loş bir hastane koridorunda",
  "şehir dışına giden trende",
  "mahalle bakkalının önünde",
  "tanıdık bir çay bahçesinde",
];
const TIMES = ["sabahın erken saatinde", "öğle vakti", "akşamüstü", "gece yarısına doğru", "bir hafta sonu", "bayram sabahı"];

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
  { t: "Beklenmedik bir mesaj", n: "{time} telefonun titriyor: yıllardır konuşmadığın {name} yazmış. \"Seni görmem lazım\" diyor, başka bir şey demiyor.", c: ["Hemen buluşmayı kabul et", "Önce ne istediğini sor", "Görmezden gel, sonra bakarsın"], rec: 1, bias: "happiness", fact: "{name} ile yıllar sonra yeniden bağ kuruldu." },
  { t: "Kapındaki komşu", n: "Yeni komşun {name}, {place} sana rastlıyor ve bir iyilik istiyor: birkaç günlüğüne {pet} adlı kedisine bakabilir misin?", c: ["Seve seve kabul et", "Sadece bu seferlik derim", "Kibarca reddet"], rec: 0, bias: "happiness", fact: "Komşu {name}'in kedisi {pet}." },
  { t: "İşte bir fırsat", n: "{job} olarak emeğin nihayet görülüyor; sana daha büyük ama riskli bir sorumluluk öneriyorlar. Kabul edersen her şey değişebilir.", c: ["Riski göze al, kabul et", "Şartları pazarlık et", "Şimdilik güvende kal"], rec: 1, bias: "career" },
  { t: "Cüzdandaki delik", n: "Ay sonu yaklaşırken hesaplar tutmuyor. Bir arkadaşın kısa vadeli, cazip ama tuhaf bir 'yatırım' öneriyor.", c: ["Küçük bir miktarla dene", "Detaylıca araştır önce", "Uzak dur bu işten"], rec: 2, bias: "wealth" },
  { t: "Sağlık uyarısı", n: "Son günlerde sürekli yorgunsun. {place} nefesin daralıyor. İçinden bir ses 'bir doktora görün' diyor.", c: ["Hemen randevu al", "Biraz dinlenip beklerim", "Görmezden gel, geçer"], rec: 0, bias: "happiness" },
  { t: "Eski bir dost", n: "{time} {name} ile karşılaşıyorsun. Bir zamanlar çok yakındınız; şimdi araya mesafe girmiş. Gözlerinde bir pişmanlık var.", c: ["İlk adımı sen at", "Nazikçe selam verip geç", "Soğuk davran"], rec: 0, bias: "happiness", fact: "Eski dost {name} yeniden hayatında." },
  { t: "Hedefe bir adım", n: "\"{goal}\" hayaline yaklaşmak için küçük ama korkutucu bir fırsat çıkıyor karşına. İlk adımı atmak sana kalmış.", c: ["Cesurca ilk adımı at", "Bir plan yapıp öyle başla", "Henüz hazır değilim de"], rec: 1, bias: "career" },
  { t: "Küçük bir kaçamak", n: "İş çıkışı {place} kendini yorgun buluyorsun. Bir hafta sonu kaçamağı için son dakika ucuz bir bilet var.", c: ["Çantanı topla ve git", "Bütçeni hesapla önce", "Bu sefer kal, sonra"], rec: 0, bias: "happiness" },
  { t: "Bir hobinin çağrısı", n: "Yıllar önce bıraktığın bir uğraş bugün {place} yeniden karşına çıkıyor. Parmakların kaşınıyor.", c: ["Yeniden başla, geç değil", "Ufak bir deneme yap", "Nostaljiyle geç, bırak"], rec: 0, bias: "happiness" },
  { t: "Aile masası", n: "Aile yemeğinde eski bir mesele yeniden açılıyor. {name} senden taraf tutmanı bekliyor, masa geriliyor.", c: ["Açık açık fikrini söyle", "Ortayı bulmaya çalış", "Sessiz kal, karışma"], rec: 1, bias: "happiness" },
  { t: "Sokakta bir tesadüf", n: "{time} {place} yerde bir cüzdan buluyorsun. İçinde epey para ve bir kimlik var: {name}.", c: ["Sahibini bulup teslim et", "Karakola bırak", "Kimse görmedi, cebe at"], rec: 0, bias: "wealth", fact: "Cüzdanını bulduğun {name} ile tanışıldı." },
  { t: "Komşu apartmanın gürültüsü", n: "Gecenin bir yarısı üst kattan sesler geliyor. Ertesi gün {name} özür dilemek için kapını çalıyor.", c: ["Anlayışla karşıla", "Sınırları nazikçe çiz", "Şikâyet edeceğini söyle"], rec: 0, bias: "happiness" },
];

// Yetişkin modu sahneleri (18+) — sert dille, grafik tasvir yok
const MATURE_SCENES: Scene[] = [
  { t: "Gece yarısı bir teklif", n: "{time} {name} sana açılıyor; aranızdaki gerilim uzun süredir belliydi. Kalbin de aklın da farklı şeyler söylüyor.", c: ["Duygularının peşinden git", "Önce dürüstçe konuş", "Geri çekil, karmaşık bu"], rec: 1, bias: "happiness", mature: true, fact: "{name} ile ilişki yeni bir evreye girdi." },
  { t: "Son kadeh", n: "Zor bir haftanın ardından içki masasında kendini kaptırıyorsun. Bir kadeh daha, bir tane daha derken sabah yaklaşıyor.", c: ["Kendine dur de, kalk", "Son bir tane, sonra ev", "Bırak sürüklensin gece"], rec: 0, bias: "happiness", mature: true },
  { t: "Tefecinin gölgesi", n: "Borçlar birikti; kapıya dayanan {name} 'tatlı dille' parasını istiyor. Sesindeki tehdit gizli değil.", c: ["Zaman iste, plan yap", "Bir kısmını hemen öde", "Kaç, yüzleşme"], rec: 1, bias: "wealth", mature: true },
  { t: "Kolay para", n: "Tanıdık biri, karanlık ama iyi para getiren bir işe seni ortak etmek istiyor. Yasadışı olduğu ortada.", c: ["Reddet, bulaşma", "Sadece bir kere dene", "İçini didikleyip düşün"], rec: 0, bias: "wealth", mature: true },
  { t: "Kıskançlık krizi", n: "Sevdiğin kişinin telefonunda bir mesaj görüyorsun. İçini kemiren şüphe büyüyor, elin ekranın üstünde duruyor.", c: ["Açıkça konuş, sor", "Görmezden gelmeye çalış", "Sessizce takibe geç"], rec: 0, bias: "happiness", mature: true },
];

// Kaderin belirlediği (seçimsiz) sahneler
const FORCED_SCENES: { t: string; n: string; go: string; bias: "happiness" | "wealth" | "career"; mature?: boolean }[] = [
  { t: "Beklenmedik haber", n: "Telefon çalıyor; {name}'den kötü bir haber geliyor. Bir anda her şey ağırlaşıyor, ama hayat durmuyor.", go: "Sabahı bekle", bias: "happiness" },
  { t: "Kaza", n: "{time} {place} küçük bir kaza atlatıyorsun. Ucuz kurtuldun ama sarsıldın.", go: "Toparlanmaya çalış", bias: "happiness" },
  { t: "Kapı dışarı", n: "Beklemediğin bir anda işine son veriliyor. \"Küçülme\" diyorlar; sen ne diyeceğini bilemiyorsun.", go: "Yeni bir yol ara", bias: "career" },
  { t: "Zorunlu masraf", n: "Evde bir şey bozuluyor ve tamiri hiç ucuz değil. Bütçen bu ay iyice zorlanıyor.", go: "Hesapları yeniden yap", bias: "wealth" },
  { t: "Bürokrasi duvarı", n: "Bir evrak eksikliği yüzünden işlerin haftalarca sürüncemede kalacak. Elinden bir şey gelmiyor.", go: "Sıranı beklemeye başla", bias: "career" },
  { t: "Ani hastalık", n: "Gece ateşin çıkıyor; birkaç gün yatmak zorunda kalıyorsun. Planların ertelenmek zorunda.", go: "İyileşmeyi bekle", bias: "happiness", mature: true },
];

const OUTCOME_TEXT: Record<"success" | "partial" | "failure", string[]> = {
  success: [
    "Denedin ve bu kez şans senden yanaydı.",
    "Beklediğinden iyi gitti; küçük bir pürüz kalsa da kazançlı çıktın.",
    "İşe yaradı — emeğinin karşılığını aldın.",
    "Doğru anda doğru adımı attın, sonuç yüzünü güldürdü.",
  ],
  partial: [
    "İstediğinin bir kısmını aldın, gerisi elinden kayıp gitti.",
    "Yarım bir zafer: bir şey kazandın, bir şey kaybettin.",
    "Ne tam oldu ne de tam bozuldu; bedelini ödeyerek ilerledin.",
    "Kısmen yürüdü ama arkasında bir soru işareti bıraktı.",
  ],
  failure: [
    "Bu sefer işler ters gitti.",
    "Umduğun olmadı; geriye buruk bir tat kaldı.",
    "Plan tutmadı, canın epey yandı.",
    "Geri tepti — bir süre bunun ağırlığını taşıyacaksın.",
  ],
};

const FORCED_CONTINUE = ["Devam et", "Sabahı bekle", "Toparlan ve yürü", "Ne olacağını gör"];

function makeEffects(
  outcome: "success" | "partial" | "failure" | "neutral",
  bias: "happiness" | "wealth" | "career",
) {
  const e = { happiness: 0, wealth: 0, career: 0, stress: 0 };
  if (outcome === "neutral") return e;
  if (outcome === "success") {
    e[bias] += between(6, 14);
    e.happiness += between(1, 5);
    e.stress -= between(2, 7);
  } else if (outcome === "partial") {
    e[bias] += between(3, 8);
    e.wealth -= between(0, 4);
    e.stress += between(2, 6);
  } else {
    e[bias] -= between(5, 12);
    e.happiness -= between(3, 8);
    e.stress += between(5, 11);
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
}): LocalParsed {
  const vars: Record<string, string> = {
    name: aName(),
    pet: one(PETS),
    place: one(PLACES),
    time: one(TIMES),
    job: a.occupation || "işini arayan biri",
    goal: a.goal || "bir hayali",
  };
  const opening = !a.action;

  if (a.forced) {
    const s = one(a.mature ? FORCED_SCENES : FORCED_SCENES.filter((x) => !x.mature));
    return {
      title: (s.mature && a.mature ? "18+ " : "") + fill(s.t, vars),
      narrative: fill(s.n, vars),
      outcomeText: opening ? "" : one(OUTCOME_TEXT[a.outcome === "neutral" ? "partial" : a.outcome]),
      choices: [{ label: fill(one(FORCED_CONTINUE), vars), recommended: true }],
      effects: makeEffects(a.outcome === "neutral" ? "failure" : a.outcome, s.bias),
      ageDelta: Math.random() < 0.5 ? 1 : 0,
      facts: [],
    };
  }

  const pool = a.mature ? [...NORMAL_SCENES, ...MATURE_SCENES] : NORMAL_SCENES;
  const s = one(pool);
  const facts: string[] = [];
  if (s.fact) {
    const f = fill(s.fact, vars);
    if (!a.usedFacts.includes(f)) facts.push(f);
  }
  const choices = s.c.map((label, i) => ({ label: fill(label, vars), recommended: i === s.rec }));

  return {
    title: (s.mature ? "18+ " : "") + fill(s.t, vars),
    narrative: fill(s.n, vars),
    outcomeText: opening ? "" : one(OUTCOME_TEXT[a.outcome === "neutral" ? "partial" : a.outcome]),
    choices,
    effects: opening ? makeEffects("neutral", s.bias) : makeEffects(a.outcome, s.bias),
    ageDelta: opening ? 0 : Math.random() < 0.75 ? 0 : 1,
    facts,
  };
}

