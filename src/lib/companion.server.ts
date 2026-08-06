// Karakter modu — yol arkadaşı sohbeti ve macera motoru.
// Yapay zekâ her zaman önce denenir (companion.functions.ts), buradaki
// kombinasyonel yerel motor yalnızca AI'ya ulaşılamadığında devralır.

import {
  GENRES,
  type Companion,
  type CompanionEvent,
  type CompanionMeters,
  type CompanionScene,
  type Genre,
} from "./companion-types";
import { tune, type Difficulty } from "./difficulty";

export { GENRES };
export type { Companion, CompanionEvent, CompanionMeters, CompanionScene, Genre };

const pick = <T,>(arr: T[], not: string[] = []): T => {
  const fresh = arr.filter((a) => !not.includes(String(a)));
  const pool = fresh.length ? fresh : arr;
  return pool[Math.floor(Math.random() * pool.length)];
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// --- Karakter havuzları ---
const NAMES: Record<Genre, string[]> = {
  fantastik: ["Serin", "Kavas", "Ilgın", "Devrim", "Aysu", "Bora", "Nergis", "Yaman", "Sedef", "Alaz"],
  bilimkurgu: ["Vega", "Ares-9", "Neva", "Kuzey", "Orhun", "Lyra", "Tuna", "Sancar", "Peri", "Deniz"],
  dram: ["Elif", "Mert", "Zeynep", "Cihan", "Bahar", "Kerem", "Naz", "Umut", "Sena", "Tarık"],
  gizem: ["Hulki", "Cemre", "Rüzgâr", "Firuze", "Kadir", "Selin", "Vahit", "Melis", "Sarp", "Nilay"],
};

const TITLES: Record<Genre, string[]> = {
  fantastik: ["kül ustası", "sürgün büyücü", "ejder izcisi", "kâhin çırağı", "yeminli kılıç"],
  bilimkurgu: ["kaçak pilot", "sinir-ağı teknisyeni", "yasak arşivci", "siborg paralı asker", "istasyon hekimi"],
  dram: ["gece taksicisi", "sahne ışıkçısı", "mahalle fırıncısı", "kütüphaneci", "hastane gönüllüsü"],
  gizem: ["emekli komiser", "kasaba muhabiri", "morg görevlisi", "kayıp eşya memuru", "kilise zangocu"],
};

const PERSONAS = [
  "alaycı ama sadık, korktuğunda şaka yapar",
  "sessiz, gözlemci; sevgisini iş yaparak gösterir",
  "kibirli, yetenekli, kırılınca susar",
  "sıcakkanlı, geveze, sırrını kötü saklar",
  "soğukkanlı, hesaplı, borcunu asla unutmaz",
  "kırılgan ama inatçı; kimseye yük olmak istemez",
];

const VOICES = [
  "kısa cümleler, keskin espriler",
  "ağır, tartılmış sözler",
  "hızlı konuşur, sözünü yutar",
  "kibar ama iğneleyici",
  "argo ve sokak dili",
];

const WORLDS: Record<Genre, string[]> = {
  fantastik: [
    "Kül Diyarı: yanmış ormanların altında uyuyan eski bir tanrı var",
    "Yedi Kule: büyü vergiye bağlanmış, kaçak büyücüler damgalanıyor",
    "Boğaz'ın altında suya gömülü, kapıları açılmaya başlamış bir şehir",
  ],
  bilimkurgu: [
    "Halka-4 istasyonu: hava kotayla satılıyor, kayıtlar siliniyor",
    "Yeraltı Ankara: yapay zekâ valilik yapıyor, insan işi lüks",
    "Mars kolonisi Sıfır: dönüş gemisi iki yıl gecikmeli",
  ],
  dram: [
    "kirası her ay artan bir sahil kasabası",
    "vardiyaların hayatı böldüğü büyük bir şehir",
    "herkesin herkesi tanıdığı küçük bir ilçe",
  ],
  gizem: [
    "sisin üç gündür kalkmadığı Karabük yakınlarında bir kasaba",
    "dosyaların kaybolduğu bir eski adliye binası",
    "her gece bir ışığın söndüğü liman mahallesi",
  ],
};

const QUESTS: Record<Genre, string[]> = {
  fantastik: [
    "kanındaki gücü kontrol etmeyi öğrenmek",
    "kardeşini pazarlıkla aldığı yeminden kurtarmak",
    "yedi kuleden birini içeriden yıkmak",
  ],
  bilimkurgu: [
    "silinmiş kimliğini geri almak",
    "istasyonun gerçek kayıtlarını dışarı sızdırmak",
    "kaçak bir gemiye yer açtırmak",
  ],
  dram: ["bir daha kaçmadan kalmayı denemek", "aileni geri kazanmak", "kendi işini kurmak"],
  gizem: ["kapanmamış dosyayı çözmek", "kasabanın sustuğu geceyi öğrenmek", "kaybolan kişiyi bulmak"],
};

export function makeCompanion(genre: Genre, seedName?: string): Companion {
  return {
    name: seedName?.trim() || pick(NAMES[genre]),
    title: pick(TITLES[genre]),
    persona: pick(PERSONAS),
    voice: pick(VOICES),
    genre,
    world: pick(WORLDS[genre]),
    quest: pick(QUESTS[genre]),
  };
}

// --- Yerel sahne üretimi ---
const OPENERS: Record<Genre, string[]> = {
  fantastik: [
    "Avucunu açtı; parmak uçlarında kül gibi bir ışık dönüyordu.",
    "Kılıcının kabzasına vurdu, ses taşlarda tuhaf biçimde yankılandı.",
    "Gökyüzü tersine akıyordu ve o buna hiç şaşırmamış görünüyordu.",
  ],
  bilimkurgu: [
    "Kolundaki ekran kırmızıya döndü, üstünü eliyle kapattı.",
    "Havalandırma tekledi; ikiniz de aynı anda nefesinizi tuttunuz.",
    "Kapı kodunu üçüncü kez yanlış girdi, sonra küfretti.",
  ],
  dram: [
    "Çayı iki kere karıştırdı, hiç içmedi.",
    "Pencereden aşağıya baktı, sesi bir tonda düştü.",
    "Ceketini iskemleye astı, oturmadan konuşmaya başladı.",
  ],
  gizem: [
    "Dosyayı masaya bıraktı, üstünde senin adın vardı.",
    "Sokak lambası söndü; o gülümsedi, çünkü bekliyordu.",
    "Kaseti geri sardı ve aynı üç saniyeyi tekrar dinletti.",
  ],
};

const MIDS = [
  "Sana bakışı değişti — ölçüyor, hâlâ karar vermiş değil.",
  "Sesini alçalttı, sanki duvarların kulağı varmış gibi.",
  "Bir adım yaklaştı; mesafeyi kapatmak onun için risk demek.",
  "Bir şey söylemekten vazgeçti, sonra yine de söyledi.",
  "Elleri titriyordu ama tonu dümdüzdü.",
];

const CLOSERS = [
  "\"Şimdi sıra sende,\" dedi. \"Ve yanlış cevap verirsen ikimiz de ödeyeceğiz.\"",
  "\"Bana bir sebep ver,\" dedi, \"kalmak için.\"",
  "\"Buradan sonrası dönüşü yok,\" dedi. \"Kararını söyle.\"",
  "\"Sana güvenmek istiyorum,\" dedi. \"İstemek yetmiyor ama.\"",
  "\"Konuş,\" dedi. \"Zaman satın alamıyoruz.\"",
];

const EVENTS: Record<Genre, CompanionEvent[]> = {
  fantastik: [
    { kind: "savaş", label: "Kül Muhafızı", text: "Duvardan bir gölge ayrıldı ve isimlerinizi tek tek saydı. Kavga üç nefes sürdü; ikinizin de kanı yerdeydi." },
    { kind: "güç", label: "Yeni yetenek: Kül Nefesi", text: "İçindeki sıcaklık ellerine yürüdü; dokunduğun demir kızardı. Gücü buldun ama o da seni buldu." },
    { kind: "sır", label: "Yeminin bedeli", text: "Yanındakinin boynundaki damgayı gördün: o yemini senin adına vermişti." },
  ],
  bilimkurgu: [
    { kind: "savaş", label: "Devriye dronu", text: "Dron koridoru taradı. Bir sandığın arkasına çekildiniz, ateş metali yardı, omzun yandı." },
    { kind: "güç", label: "Yeni implant: Sinir Hızlandırıcı", text: "Ense soketine taktığı çip saniyeyi uzattı. Dünya yavaşladı, başın ağrıdı." },
    { kind: "sır", label: "Silinmiş kayıt", text: "Kendi ölüm kaydını okudun. Tarih üç ay önceydi." },
  ],
  dram: [
    { kind: "yol", label: "Gece yolculuğu", text: "Son otobüse yetiştiniz; şehri terk ederken kimse konuşmadı." },
    { kind: "sır", label: "Söylenmemiş cümle", text: "Yıllardır sakladığı şeyi söyledi ve ardından uzun bir sessizlik oldu." },
    { kind: "savaş", label: "Kapıda kavga", text: "Bağırışlar apartmanı ayağa kaldırdı. Kimse yumruk atmadı ama bir şey kırıldı." },
  ],
  gizem: [
    { kind: "sır", label: "Dosyadaki isim", text: "Kayıp listesinde senin doğum tarihin vardı, adın yoktu." },
    { kind: "savaş", label: "Bodrumdaki şey", text: "Merdivenin dibinde bir şey vardı ve nefes almıyordu. Elinde kalan sadece feneriydi." },
    { kind: "yol", label: "Kasabadan çıkış", text: "Tabelaya vardınız; yazı okunmuyordu, yol geri dönmüştü." },
  ],
};

const SUGGESTIONS: Record<Genre, string[]> = {
  fantastik: [
    "Gücümü ona açıkça göstermek istiyorum.",
    "Yemin hakkında bildiklerini anlatmasını istiyorum.",
    "Kavgayı ben başlatıyorum, arkasını kolluyorum.",
    "Geri çekilip sabaha kadar bekleyelim diyorum.",
  ],
  bilimkurgu: [
    "Kayıtları şimdi sızdırmayı öneriyorum.",
    "İmplantı kabul ediyorum, sonuçlarına razıyım.",
    "Dronu tuzağa çekmek için plan kuruyorum.",
    "Ona gerçek adımı söylüyorum.",
  ],
  dram: [
    "Kalmasını açıkça istiyorum.",
    "Sakladığım şeyi anlatıyorum.",
    "Konuyu değiştirip onu güldürmeye çalışıyorum.",
    "Bu gece bir karar vermeyi erteliyorum.",
  ],
  gizem: [
    "Dosyayı birlikte açmayı öneriyorum.",
    "Bodruma inelim diyorum, fener bende.",
    "Kasabalılardan birini sıkıştırmak istiyorum.",
    "Ona neden beni tanıdığını soruyorum.",
  ],
};

export type LocalTurnArgs = {
  companion: Companion;
  action?: string;
  difficulty: Difficulty;
  mature: boolean;
  meters: CompanionMeters;
  usedOpeners: string[];
  turn: number;
};

export function localCompanionTurn(args: LocalTurnArgs): CompanionScene {
  const { companion, action, difficulty, meters, usedOpeners, turn } = args;
  const t = tune(difficulty);
  const g = companion.genre;

  const opener = pick(OPENERS[g], usedOpeners);
  const mid = pick(MIDS);
  const closer = pick(CLOSERS);

  const warm = /sev|güven|kal|anlat|yardım|teşekkür|sarıl|birlikte|özür/i.test(action ?? "");
  const bold = /savaş|saldır|vur|kaç|gir|in |aç |sızdır|başlat|risk/i.test(action ?? "");
  const cold = /yalan|sakla|reddet|bırak|git|sus|kandır/i.test(action ?? "");

  const gain = (n: number) => Math.round(n * t.gain);
  const loss = (n: number) => -Math.round(n * t.loss);

  const delta: CompanionMeters = {
    bond: warm ? gain(9) : cold ? loss(8) : gain(3),
    trust: warm ? gain(7) : cold ? loss(10) : bold ? gain(2) : gain(2),
    power: bold ? gain(8) : gain(2),
    danger: bold ? Math.round(9 * t.loss) : cold ? Math.round(5 * t.loss) : -Math.round(3 * t.gain),
  };
  delta.danger += t.pressure;

  // Her üç turda bir sahne bir olaya dönüşsün.
  const wantsEvent = turn > 0 && turn % 3 === 0;
  const event = wantsEvent ? pick(EVENTS[g]) : undefined;
  if (event) {
    if (event.kind === "savaş") {
      delta.danger += Math.round(10 * t.loss);
      delta.power += gain(6);
    }
    if (event.kind === "güç") delta.power += gain(14);
    if (event.kind === "sır") delta.trust += gain(5);
    if (event.kind === "yol") delta.danger += loss(6);
  }

  const spice = args.mature
    ? " Aradaki mesafe bir anlık kapandı; gerisini kapanan kapı anlattı."
    : "";

  const actionEcho = action
    ? `“${action.trim().replace(/\s+/g, " ").slice(0, 160)}” dedin. `
    : "";

  const reply = `${actionEcho}${opener} ${companion.name}, ${companion.title} olmanın verdiği alışkanlıkla önce çevreyi kontrol etti. ${mid}${spice} ${event ? `${event.text} ` : ""}${closer}`;

  return {
    reply,
    action: event ? `${event.kind === "savaş" ? "Çatışma" : event.kind === "güç" ? "Güç" : event.kind === "sır" ? "Sır" : "Yol"}: ${event.label}` : "Sahne devam ediyor",
    suggestions: [...SUGGESTIONS[g]].sort(() => Math.random() - 0.5).slice(0, 3),
    delta,
    ...(event ? { event } : {}),
    engine: "local",
  };
}

export function applyMeters(m: CompanionMeters, d: CompanionMeters): CompanionMeters {
  return {
    bond: clamp(m.bond + d.bond),
    trust: clamp(m.trust + d.trust),
    power: clamp(m.power + d.power),
    danger: clamp(m.danger + d.danger),
  };
}
