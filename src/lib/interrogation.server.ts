// Sorgu (dedektif modu) için sunucu yardımcıları.
export const clampMeter = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const CRIME_POOL = [
  "kuyumcu soygunu",
  "bir kasanın içini boşaltmak",
  "şirketin parasını zimmetine geçirmek",
  "sahte tablo satmak",
  "kayıp bir kişinin son görüldüğü yerde bulunmak",
  "kaçak sigara ve alkol nakli",
  "bir apartmanı kundaklamak",
  "banka hesaplarına sızmak",
  "lüks araba çalıp parçalamak",
  "birinin kimliğiyle kredi çekmek",
  "gece kulübünde çıkan kavgada birini ağır yaralamak",
  "müzeden küçük bir eser kaçırmak",
  "bir milletvekilinin evine girmek",
  "rakip firmanın belgelerini sızdırmak",
  "gizli bir kumar salonu işletmek",
  "sahte diploma ve evrak çetesine ortak olmak",
];

const CRIME_TOPICS: { keys: string[]; crimes: string[] }[] = [
  { keys: ["para", "banka", "zimmet", "dolandır", "kredi"], crimes: ["şirketin parasını zimmetine geçirmek", "birinin kimliğiyle kredi çekmek", "banka hesaplarına sızmak", "piramit dolandırıcılığı kurmak"] },
  { keys: ["soygun", "hırsız", "kasa", "kuyumcu"], crimes: ["kuyumcu soygunu", "bir kasanın içini boşaltmak", "gece bekçisini bağlayıp depo boşaltmak"] },
  { keys: ["cinayet", "ölüm", "kayıp", "ceset"], crimes: ["kayıp bir kişinin son görüldüğü yerde bulunmak", "bir tartışmanın ölümle bitmesi", "bir cesedin taşınmasına yardım etmek"] },
  { keys: ["yangın", "kundak", "patla"], crimes: ["bir apartmanı kundaklamak", "deposunu sigorta için yakmak"] },
  { keys: ["sanat", "müze", "tablo", "eser"], crimes: ["sahte tablo satmak", "müzeden küçük bir eser kaçırmak", "kaçak kazıdan çıkan sikkeleri satmak"] },
  { keys: ["bilgisayar", "siber", "hack", "veri"], crimes: ["banka hesaplarına sızmak", "bir kurumun verilerini fidye için kilitlemek", "rakip firmanın belgelerini sızdırmak"] },
  { keys: ["araba", "araç", "yol", "kaza"], crimes: ["lüks araba çalıp parçalamak", "kaçarken bir kazaya sebep olup olay yerinden ayrılmak"] },
  { keys: ["kaçak", "sınır", "mal", "tekne"], crimes: ["kaçak sigara ve alkol nakli", "sınırdan kaçak mal geçirmek"] },
  { keys: ["kumar", "bahis"], crimes: ["gizli bir kumar salonu işletmek", "şike bahsi organize etmek"] },
];

export function fallbackCrime(hint?: string) {
  if (hint && hint.trim().length > 1) {
    const low = hint.toLocaleLowerCase("tr");
    const topic = CRIME_TOPICS.find((t) => t.keys.some((k) => low.includes(k)));
    if (topic) return pick(topic.crimes);
    return hint.trim().toLocaleLowerCase("tr").slice(0, 80);
  }
  return pick(CRIME_POOL);
}

const RANKS = [
  "başkomiser",
  "cinayet masası dedektifi",
  "narkotik komiseri",
  "mali suçlar müfettişi",
  "emniyet amiri",
  "savcı yardımcısı",
];

const STYLES = [
  "buz gibi sakin, hiç sesini yükseltmiyor",
  "sinirli ve sabırsız, masaya vuruyor",
  "aşırı kibar, gülümseyerek tuzak kuruyor",
  "yorgun ve umursamaz görünüyor ama her kelimeyi not alıyor",
  "sizinle arkadaş olmaya çalışıyor",
  "alaycı, her cevabınızla dalga geçiyor",
];

const ROOMS = [
  "penceresiz bir sorgu odası, masada soğumuş bir çay",
  "flüoresan ışıklı bir oda, duvarda tek yönlü ayna",
  "gece yarısı, kapının dışında koridor sesleri",
  "klimanın buz gibi üflediği küçük bir oda",
];

export function makeInterrogator() {
  const gender = pick(["Kadın", "Erkek"]);
  const names =
    gender === "Kadın"
      ? ["Selma Aydın", "Nurgül Erdem", "Deniz Kavaklı", "Yasemin Tuna", "Berrin Acar"]
      : ["Cemil Karataş", "Orhan Bilir", "Levent Uçar", "Serkan Doğu", "Kadir Yalın"];

  // Kime karşı zaafı olduğu rastgele; flört her zaman işe yaramaz.
  const attractedTo = pick([["Kadın"], ["Erkek"], ["Kadın", "Erkek"], []]);
  return {
    name: pick(names),
    gender,
    rank: pick(RANKS),
    style: pick(STYLES),
    room: pick(ROOMS),
    attractedTo,
    // Profesyonellik: yüksekse flört ve duygu sömürüsü kolay geri teper.
    discipline: 35 + Math.floor(Math.random() * 55),
  };
}

export type Interrogator = ReturnType<typeof makeInterrogator>;

export type AnswerKind = "yalan" | "doğru" | "flört" | "duygu" | "sessiz" | "serbest";

export type Meters = { flirt: number; suspicion: number; empathy: number };

export type Judgement = {
  result: "iyi" | "kötü" | "karışık";
  delta: Meters;
  note: string;
};

export function judgeAnswer(
  kind: AnswerKind,
  meters: Meters,
  interrogator: Interrogator,
  playerGender: string,
): Judgement {
  const luck = (meters.empathy + meters.flirt) / 400 - meters.suspicion / 250;
  const roll = Math.random() + luck;
  const pro = interrogator.discipline / 100;
  const d: Meters = { flirt: 0, suspicion: 2, empathy: 0 }; // her tur baskı artar

  let result: Judgement["result"] = "karışık";
  let note = "";

  switch (kind) {
    case "flört": {
      const match = interrogator.attractedTo.includes(playerGender);
      if (!match) {
        result = "kötü";
        d.suspicion += 10 + Math.round(pro * 8);
        d.flirt -= 4;
        note = `FLÖRT TUTMADI: ${interrogator.name} bu yaklaşımdan hiç etkilenmiyor, hatta rahatsız oldu ve seni oyalamakla suçluyor.`;
      } else if (roll > 0.45 + pro * 0.35) {
        result = "iyi";
        d.flirt += 12;
        d.suspicion -= 7;
        d.empathy += 3;
        note = `FLÖRT TUTTU: ${interrogator.name} bir an savunmasını düşürdü, ama bunu kendine bile itiraf etmiyor.`;
      } else {
        result = "kötü";
        d.flirt += 3;
        d.suspicion += 9 + Math.round(pro * 6);
        note = `FLÖRT GERİ TEPTİ: ${interrogator.name} oyunu fark etti, bunu üstüne yürümek için kullanıyor ("beni etkilemeye çalışmayı bırak").`;
      }
      break;
    }
    case "yalan": {
      if (roll > 0.5 + pro * 0.3) {
        result = "iyi";
        d.suspicion -= 9;
        note = "YALAN TUTTU: anlattığın hikâye şimdilik tutarlı göründü.";
      } else {
        result = "kötü";
        d.suspicion += 15;
        note = "YALAN AÇIĞA ÇIKTI: dosyadaki bir ayrıntı ifadeyle çelişiyor; bunu yüzüne vuruyor.";
      }
      break;
    }
    case "doğru": {
      result = "karışık";
      d.suspicion += 5;
      d.empathy += 9;
      note = "DÜRÜSTLÜK: samimiyetin karşı tarafta yumuşama yarattı ama eline yeni bir koz verdi.";
      break;
    }
    case "duygu": {
      if (roll > 0.45 + pro * 0.25) {
        result = "iyi";
        d.empathy += 11;
        d.suspicion -= 5;
        note = "ANLAYIŞ KAZANDIN: hikâyen ona kendi hayatından bir şey hatırlattı.";
      } else {
        result = "kötü";
        d.empathy -= 3;
        d.suspicion += 8;
        note = "DUYGU SÖMÜRÜSÜ SAYILDI: acındırmaya çalıştığını düşünüyor.";
      }
      break;
    }
    case "sessiz": {
      result = "karışık";
      d.suspicion += 7;
      d.empathy -= 4;
      note = "SESSİZLİK: hiçbir şey vermedin ama sessizlik burada suçlu gibi duruyor.";
      break;
    }
    default: {
      if (roll > 0.55) {
        result = "iyi";
        d.suspicion -= 6;
        d.empathy += 4;
        note = "BEKLENMEDİK HAMLE İŞE YARADI: dengesini bozdun.";
      } else if (roll < 0.3) {
        result = "kötü";
        d.suspicion += 12;
        note = "HAMLE TERS GİTTİ: söylediğin şey aleyhine yeni bir soru açtı.";
      } else {
        d.suspicion += 3;
        note = "CEVABIN NÖTR KALDI: ne kazandın ne kaybettin.";
      }
    }
  }

  return { result, delta: d, note };
}


// ============================================================
//  YEREL SORGU MOTORU — yapay zekâ / API gerektirmez
// ============================================================

const REACTIONS: Record<"iyi" | "kötü" | "karışık", string[]> = {
  iyi: [
    "{name} bir an duraksıyor; kaleminin ucu kâğıtta bekliyor. Cevabın işine gelmemiş gibi.",
    "Gözlerini kısıyor, sonra dosyayı kapatıp sandalyesine yaslanıyor. Puan aldın ama belli etmiyor.",
    "{name} kısa bir 'hmm' çekiyor. İlk kez tereddüt ettiğini görüyorsun.",
  ],
  kötü: [
    "{name} dosyadan bir fotoğraf çıkarıp masaya vuruyor: \"Bunu nasıl açıklayacaksın?\"",
    "Dudağının kenarı alaycı bir gülümsemeyle kıvrılıyor. \"İşte şimdi yakaladım seni.\"",
    "{name} sandalyesini gıcırdatarak öne eğiliyor; sesi bıçak gibi: \"Bir daha dene.\"",
  ],
  karışık: [
    "{name} not alıyor, yüzünden hiçbir şey okunmuyor.",
    "Kısa bir sessizlik. Duvar saatinin sesi odayı dolduruyor.",
    "{name} çayından bir yudum alıp seni süzüyor. Ne düşündüğü belli değil.",
  ],
};

const QUESTIONS = [
  "O gece saat kaçta evdeydin? Komşun seni {time} dışarıda gördüğünü söylüyor.",
  "Telefon kayıtlarına baktık. {time} kimi aradın?",
  "Olay yerindeki kamera görüntülerinde sana çok benzeyen biri var. Ne diyeceksin?",
  "Banka hesabına geçen hafta giren o para nereden geldi?",
  "{witness} seni olay yerinin yakınında gördüğünü söylüyor. Yalan mı söylüyor?",
  "Ailene bu durumu nasıl açıklayacaksın? Onlar da ifade verecek, biliyorsun.",
  "Elindeki o izler nasıl oldu? Doktor raporu istememi ister misin?",
  "Ortağın her şeyi anlattı bile. Sen hâlâ neden susuyorsun?",
  "Aracın o gece nerede park halindeydi? Plaka kayıtları bizde.",
  "Bu işten kazancın ne olacaktı? Kim seni buna ikna etti?",
];

const OPTION_SETS: { label: string; kind: AnswerKind }[][] = [
  [
    { label: "O gece evdeydim, kimse görmedi", kind: "yalan" },
    { label: "Doğruyu söyle: oradaydın", kind: "doğru" },
    { label: "Gülümseyip gözlerine bak", kind: "flört" },
    { label: "Zor bir dönemden geçtiğini anlat", kind: "duygu" },
  ],
  [
    { label: "Bir arkadaşımı aradım, alakası yok", kind: "yalan" },
    { label: "Her şeyi baştan anlat", kind: "doğru" },
    { label: "\"Sesiniz çok sakinleştirici\" de", kind: "flört" },
    { label: "Sessiz kalma hakkını kullan", kind: "sessiz" },
  ],
  [
    { label: "Kameradaki kişi ben değilim", kind: "yalan" },
    { label: "Kısmen doğruyu kabul et", kind: "doğru" },
    { label: "Ailenden ve borçlarından bahset", kind: "duygu" },
    { label: "Tek kelime etme, bekle", kind: "sessiz" },
  ],
];

const VERDICT_FREED = [
  "{name} dosyayı kapatıp kapıyı gösteriyor: \"Gidebilirsin... şimdilik.\" Koridorda attığın her adımda sırtında bakışlarını hissediyorsun. Serbestsin ama bu dosya rafta seni bekliyor.",
  "Saatler sonra kapı açılıyor. \"Delil yetersiz\" diyor {name}, sesinde hayal kırıklığı var. Dışarıda gün yeni doğuyor; ciğerlerine çektiğin hava hiç bu kadar tatlı gelmemişti.",
];
const VERDICT_JAILED = [
  "{name} ayağa kalkıp tek cümle söylüyor: \"Tutuklusun.\" Bileklerindeki soğuk metal, duyduğun son net his oluyor. Seni koridorun sonundaki demir kapıya doğru götürüyorlar.",
  "\"Yeterince dinledim\" diyor {name} ve dosyayı kapatıyor. İtiraz edecek gücün kalmıyor; nezarethanenin ışığı gözünü alıyor. Bu gece uzun olacak.",
];

export function localInterrogationTurn(a: {
  interrogator: Interrogator;
  judgeResult: "iyi" | "kötü" | "karışık" | null; // null = ilk tur
  status: "ongoing" | "freed" | "jailed";
  turnNo: number;
}): { reaction: string; question: string; options: { label: string; kind: AnswerKind }[]; verdictText: string; facts: string[] } {
  const p = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const vars: Record<string, string> = {
    name: a.interrogator.name,
    time: p(["gece 23 sularında", "sabaha karşı", "akşam saatlerinde"]),
    witness: p(["Bir görgü tanığı", "Karşı bakkalın sahibi", "Gece bekçisi"]),
  };
  const f = (s: string) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

  if (a.status !== "ongoing") {
    return {
      reaction: f(p(REACTIONS[a.judgeResult ?? "karışık"])),
      question: "",
      options: [],
      verdictText: f(p(a.status === "freed" ? VERDICT_FREED : VERDICT_JAILED)),
      facts: [],
    };
  }

  return {
    reaction: a.judgeResult ? f(p(REACTIONS[a.judgeResult])) : "",
    question: f(QUESTIONS[(a.turnNo + Math.floor(Math.random() * 3)) % QUESTIONS.length]),
    options: p(OPTION_SETS),
    verdictText: "",
    facts: [],
  };
}
