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
  { keys: ["insan", "kaçır", "rehin", "adam", "kişi"], crimes: ["bir iş insanını fidye için alıkoymak", "sahte iş vaadiyle insanları dolandıran şebekeye karışmak", "kayıp bir kişinin son görüldüğü yerde bulunmak", "bir tanığı susturmak için tehdit etmek"] },
  { keys: ["uyuşturucu", "hap", "madde", "torbacı"], crimes: ["şehirler arası uyuşturucu nakli yapmak", "gece kulübünde el altından satış yapmak"] },
  { keys: ["silah", "bıçak", "kurşun"], crimes: ["ruhsatsız silah ticaretine aracılık etmek", "bir kavgada silah çekmek"] },
  { keys: ["miras", "vasiyet", "tapu"], crimes: ["miras için sahte vasiyet düzenlemek", "yaşlı bir akrabanın tapusunu üzerine geçirmek"] },
  { keys: ["aşk", "sevgili", "kıskanç", "eş", "aldatma"], crimes: ["eski sevgilinin evine gizlice girmek", "kıskançlık kavgasında birini yaralamak", "sevgilisinin patronunun arabasını çizip lastiklerini kesmek"] },
  { keys: ["internet", "telefon", "sosyal", "hesap"], crimes: ["sahte hesaplarla insanları dolandırmak", "birinin telefonuna casus yazılım kurdurmak", "şantaj için özel fotoğraf ele geçirmek"] },
  { keys: ["hayvan", "kedi", "köpek", "at"], crimes: ["yarış atına doping verip yarış sonucunu değiştirmek", "değerli bir cins köpeği sahibinden kaçırmak"] },
];

// Yakın zamanda önerilen suçları hatırla: aynı öneri üst üste gelmesin.
let recentCrimes: string[] = [];
function freshCrime(poolArr: string[], avoid: string[] = []) {
  const banned = [...recentCrimes, ...avoid];
  const fresh = poolArr.filter((c) => !banned.includes(c));
  const v = pick(fresh.length ? fresh : poolArr);
  recentCrimes = [...recentCrimes, v].slice(-10);
  return v;
}

// Kısa anahtarlar kelime içinde yanlış eşleşmesin (örn. "satranç" ≠ "at").
const keyMatch = (text: string, k: string) =>
  k.length <= 3 ? new RegExp(`(^|[^a-zçğıöşüâî])${k}`, "u").test(text) : text.includes(k);

export function fallbackCrime(hint?: string, avoid: string[] = []) {
  if (hint && hint.trim().length > 1) {
    const low = hint.trim().toLocaleLowerCase("tr").replace(/\s+/g, " ").slice(0, 40);
    const topic = CRIME_TOPICS.find((t) => t.keys.some((k) => keyMatch(low, k)));
    if (topic) return freshCrime(topic.crimes, avoid);
    // İpucu hiçbir konuya uymadı: saçma kalıp üretme, havuzdan kaliteli bir suç ver.
    return freshCrime(CRIME_POOL, avoid);
  }
  return freshCrime(CRIME_POOL, avoid);
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
//  YEREL SORGU MOTORU v2 — yapay zekâ / API gerektirmez
// ============================================================

const REACTIONS: Record<"iyi" | "kötü" | "karışık", string[]> = {
  iyi: [
    "{name} bir an duraksıyor; kaleminin ucu kâğıdın üstünde asılı kalıyor. Cevabın beklediği gibi değildi — dosyaya bakıp tekrar sana bakıyor, sonra hiçbir şey yazmadan sayfayı çeviriyor.",
    "Gözlerini kısıyor, sandalyesine yaslanıp uzun bir nefes veriyor. \"İlginç,\" diyor sadece. Odadaki dengenin bir milim senden yana kaydığını ikiniz de hissediyorsunuz.",
    "{name} önündeki bardağı yavaşça kenara itiyor. İlk kez sesinde o keskin kenar yok: \"Bunu doğrulatacağım. Doğruysa... konuşuruz.\" Kalbinin sesi biraz olsun yavaşlıyor.",
    "Bir şey değişti: {name} artık sana değil, notlarına bakıyor. Parmağıyla masaya tempo tutuyor — sinirli değil, düşünceli. Hikâyen tutmuş olabilir.",
    "\"Hm.\" {name} bunu derken kaşları hafifçe kalkıyor. Yan odadaki aynanın arkasında birilerinin fısıldaştığını hayal ediyorsun; bu tur senin.",
  ],
  kötü: [
    "{name} dosyadan bir fotoğraf çıkarıp masaya vuruyor; ses odada yankılanıyor. \"Peki bunu nasıl açıklayacaksın?\" Fotoğraftaki ayrıntıyı görünce boğazın kuruyor.",
    "Dudağının kenarı alaycı bir gülümsemeyle kıvrılıyor. \"Az önce ne dedin, bir daha söyle?\" Kendi cümlenin altında kaldığını ikiniz de biliyorsunuz. Kalemi hızlı hızlı bir şeyler karalıyor.",
    "{name} sandalyesini gıcırdatarak öne eğiliyor; yüzü yüzüne bir karış. \"Sana bir tavsiye: bir daha yalan söyleyeceksen, önce eskilerini ezberle.\" Sırtından soğuk bir ter iniyor.",
    "Masaya bir kâğıt sürüyor: ifadenin dökümü, bir cümlenin altı kırmızıyla çizili. \"Burada öyle dememişsin.\" Odanın havası bir anda ağırlaşıyor; klima bile sustu sanki.",
    "{name} ayağa kalkıp arkandan dolaşıyor; onu göremiyorsun ama sesini ensende hissediyorsun: \"Sabrımı test ediyorsun. Bu, kaybedeceğin tek test değil.\"",
  ],
  karışık: [
    "{name} not alıyor; yüzünden hiçbir şey okunmuyor. Kalemin kâğıda sürtünme sesi, odadaki tek ses. Bekliyorsun; beklemek de sorgunun bir parçası.",
    "Kısa bir sessizlik. {name} bardağından bir yudum alıp seni tartıyor — ne inanmış ne inanmamış. \"Devam edelim,\" diyor sonunda.",
    "Cevabını duyunca başını hafifçe yana eğiyor; bir şey diyecek gibi oluyor, vazgeçiyor. Dosyada bir sayfa çevriliyor. Duvar saati bir tur daha atıyor.",
    "{name} cevabını sessizce karşılıyor ama gözleri 'bunu unutmayacağım' diyor. Ne kazandın ne kaybettin; ip hâlâ gergin.",
  ],
};

const QUESTIONS = [
  "O gece saat kaçta evdeydin? Komşun {witness2}, seni {time} apartmandan çıkarken gördüğünü söylüyor — ikinizden biri yanılıyor.",
  "Telefon kayıtlarını önüme koydular. {time} tam dört dakikalık bir görüşme yapmışsın. Kiminle ve neden?",
  "Olay yerinin iki sokak ötesindeki kameraya sana çok benzeyen biri takılmış. Yürüyüşü bile seninki. Ne diyeceksin?",
  "Hesabına geçen hafta {money} girmiş. Maaş günü değil, bayram değil. Bu para nereden geldi?",
  "{witness} seni olay yerinin yakınında gördüğünü söylüyor ve ifadesinden çok emin. Ona neden yalan söylesin?",
  "Aileni de çağıracağız, biliyorsun. Annenin yüzüne bakıp aynı hikâyeyi anlatabilecek misin?",
  "Ellerindeki o izleri görüyorum. Nasıl oldu? İstersen doktor raporu isteyelim, ama o zaman iş resmiyet kazanır.",
  "Ortağın az önce yan odada her şeyi anlattı. Her şeyi. Senin hâlâ susman kimi koruyor?",
  "Aracın o gece nerede park hâlindeydi? Plaka tanıma sistemi başka bir adres söylüyor.",
  "Bu işten eline ne geçecekti? Seni buna kim ikna etti — yoksa fikir baştan senin miydi?",
  "Olaydan iki gün önce internette ne aradığını biliyoruz. Açıklamak ister misin, ben mi okuyayım?",
  "Üstündeki kıyafet o gece giydiğinle aynı mı? Çünkü elimizde bir lif analizi var ve sonucu birazdan gelecek.",
  "Neden ilk ifadende {witness}'ten hiç bahsetmedin? İnsan, tanımadığı birini unutmaz — tanıdığını saklar.",
  "Şu ana kadar anlattıkların üç yerde birbirini tutmuyor. Sana son bir şans veriyorum: baştan, ağır ağır anlat.",
];

const OPTION_SETS: { label: string; kind: AnswerKind }[][] = [
  [
    { label: "O saatte çoktan uyumuştum; telefonum da sessizdeydi", kind: "yalan" },
    { label: "Tamam, oradaydım — ama olanlarla hiçbir ilgim yok", kind: "doğru" },
    { label: "Bu kadar güzel sorgulanacağımı bilsem daha önce gelirdim", kind: "flört" },
    { label: "Son aylarda neler yaşadığımı bilseniz beni anlardınız", kind: "duygu" },
  ],
  [
    { label: "Yanlış hatırlıyorlar; o gün şehirde bile değildim", kind: "yalan" },
    { label: "Size her şeyi baştan, dürüstçe anlatacağım", kind: "doğru" },
    { label: "Gözlerinizin içine bakıp gülümse ve sessizce bekle", kind: "flört" },
    { label: "Avukatım gelene kadar tek kelime etmeyeceğim", kind: "sessiz" },
  ],
  [
    { label: "Kameradaki kişi ben değilim; herkes bana benzer zaten", kind: "yalan" },
    { label: "Bir kısmı doğru... ama hikâyenin tamamını bilmiyorsunuz", kind: "doğru" },
    { label: "Borçlarımı, hasta annemi, uykusuz gecelerimi anlat", kind: "duygu" },
    { label: "Kollarını kavuştur ve duvardaki aynaya bak", kind: "sessiz" },
  ],
  [
    { label: "O para eski bir alacağımdı; belgesini bulabilirim", kind: "yalan" },
    { label: "Parayı kimden aldığımı söylersem beni korur musunuz?", kind: "doğru" },
    { label: "\"Bu saatte hâlâ bu kadar dinç olmanız etkileyici\" de", kind: "flört" },
    { label: "Sesin titreyerek çocukluğundan bahsetmeye başla", kind: "duygu" },
  ],
  [
    { label: "İfademi değiştirmiyorum; isterseniz yüz kere sorun", kind: "yalan" },
    { label: "Derin bir nefes al ve sakladığın ayrıntıyı itiraf et", kind: "doğru" },
    { label: "\"Kahve içmeye dışarıda da devam edebiliriz\" diye fısılda", kind: "flört" },
    { label: "Masaya bak ve tek kelime etmeden bekle", kind: "sessiz" },
  ],
];

const VERDICT_FREED = [
  "{name} dosyayı yavaşça kapatıyor ve uzun bir sessizlikten sonra kapıyı gösteriyor: \"Gidebilirsin. Şimdilik.\" Koridor boyunca sırtında bakışlarını hissediyorsun; çıkış kapısı açıldığında gün ışığı gözünü alıyor. Serbestsin — ama o dosyanın rafta seni beklediğini ikiniz de biliyorsunuz.",
  "Saatler sonra kapı açılıyor. \"Delil yetersiz,\" diyor {name}; sesinde saklayamadığı bir hayal kırıklığı var. Eşyalarını imza karşılığı geri alıyorsun: telefon, anahtarlar, bir parça gurur. Dışarıda hava kararmış; ciğerlerine çektiğin ilk nefes, hayatında aldığın en tatlı nefes.",
  "{name} son bir kez gözlerinin içine bakıyor: \"İçgüdülerim başka bir şey söylüyor ama kanıtlarım yok. Git — ve bir daha bu masaya oturma.\" Kalkarken sandalyenin gıcırtısı bile özgürlük şarkısı gibi geliyor. Kapıdan çıkarken arkana bakmıyorsun.",
];
const VERDICT_JAILED = [
  "{name} ağır ağır ayağa kalkıyor ve tek cümle söylüyor: \"Tutuklusun.\" Gerisi bir sis: okunan haklar, bileklerindeki soğuk metal, koridorun bitmeyen floresan ışığı. Demir kapı arkandan kapanırken, o masada söylediğin her cümleyi tek tek hatırlıyorsun — özellikle de söylememen gerekenleri.",
  "\"Yeterince dinledim.\" {name} dosyayı kapatıp aynanın arkasındakilere başıyla işaret ediyor. İtiraz etmeye çalışıyorsun ama kelimeler artık para etmiyor. Nezarethanenin ışığı gözünü alıyor; duvardaki çizikleri sayarak sabahı bekliyorsun. Bu gece uzun, önündeki geceler daha uzun.",
  "Son cevabınla birlikte odadaki hava değişiyor. {name} kalemi bırakıyor — bu, sorgunun bittiği anlamına geliyor ve bittiği yer senin lehine değil. \"Savcılık gerisini halleder,\" diyor. Götürülürken koridordaki panoda kendi fotoğrafını görüyorsun; kırmızı kalemle daire içine alınmış.",
];

// Tepki metinlerinde art arda tekrarı engelle.
const lastReaction: Record<string, string[]> = {};

// Cevap seçeneği setlerinde art arda tekrarı engelle.
let lastOptionSet = -1;
function pickOptionSet() {
  let i = Math.floor(Math.random() * OPTION_SETS.length);
  if (OPTION_SETS.length > 1 && i === lastOptionSet) i = (i + 1) % OPTION_SETS.length;
  lastOptionSet = i;
  return OPTION_SETS[i];
}

export function localInterrogationTurn(a: {
  interrogator: Interrogator;
  judgeResult: "iyi" | "kötü" | "karışık" | null; // null = ilk tur
  status: "ongoing" | "freed" | "jailed";
  turnNo: number;
  usedQuestions: string[];
}): { reaction: string; question: string; options: { label: string; kind: AnswerKind }[]; verdictText: string; facts: string[] } {
  const p = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const vars: Record<string, string> = {
    name: a.interrogator.name,
    time: p(["gece 23 sularında", "sabaha karşı üçte", "akşam dokuz civarı"]),
    money: p(["12 bin lira", "40 bin lira", "hatırı sayılır bir para"]),
    witness: p(["Görgü tanığı", "Karşı bakkalın sahibi", "Gece bekçisi", "Apartman yöneticisi"]),
    witness2: p(["Sabri Bey", "Nuran Hanım", "alt kattaki emekli öğretmen"]),
  };
  const f = (s: string) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

  const pickReaction = (kind: "iyi" | "kötü" | "karışık") => {
    const seen = lastReaction[kind] ?? [];
    const pool = REACTIONS[kind].filter((r) => !seen.includes(r));
    const v = p(pool.length ? pool : REACTIONS[kind]);
    lastReaction[kind] = [...seen, v].slice(-(REACTIONS[kind].length - 1));
    return f(v);
  };

  if (a.status !== "ongoing") {
    return {
      reaction: a.judgeResult ? pickReaction(a.judgeResult) : "",
      question: "",
      options: [],
      verdictText: f(p(a.status === "freed" ? VERDICT_FREED : VERDICT_JAILED)),
      facts: [],
    };
  }

  // Bu sorguda daha önce sorulmuş soruları ele: aynı soru bir daha gelmesin.
  // (İsim/saat dolguları değişse de şablonun en uzun sabit parçasıyla karşılaştırırız.)
  const staticChunk = (tpl: string) => {
    const parts = tpl.split(/\{\w+\}/).sort((x, y) => y.length - x.length);
    return (parts[0] ?? tpl).slice(0, 30);
  };
  const candidates = QUESTIONS.filter(
    (q) => !a.usedQuestions.some((u) => u.includes(staticChunk(q))),
  );
  const question = f(p(candidates.length ? candidates : QUESTIONS));

  return {
    reaction: a.judgeResult ? pickReaction(a.judgeResult) : "",
    question,
    options: pickOptionSet(),
    verdictText: "",
    facts: [],
  };
}
