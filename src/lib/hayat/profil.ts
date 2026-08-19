/* Hayat Simülatörü — serbest metin çözümleyici

   Oyuncu meslek ve kişiliği kendi kelimeleriyle yazıyor. Motorun çalışması
   için bu metnin oyun karşılığına çevrilmesi gerekiyor: hangi davranış
   etiketlerinde avantaj, hangilerinde dezavantaj yaratıyor.

   Buradaki çözümleyici tamamen yereldir ve internet gerektirmez. Yapay zekâ
   varsa (hayat.server.ts) daha isabetli bir profil çıkarır; yoksa oyun bu
   sözlükle sorunsuz çalışmaya devam eder. */

import { KISILIKLER, KISILIK_ETKI, MESLEKLER, MESLEK_ETKI } from "./veri";
import type { Etiket, Etki, Ozellik } from "./tipler";

const kucuk = (s: string) => s.trim().toLocaleLowerCase("tr");

/** Bir etiketin "ödül" şekli: o davranışı seçtiğinde ne kazanırsın. */
const ETIKET_TABAN: Record<Etiket, { fx: Etki; paraCarpan?: number }> = {
  cesaret: { fx: { saglik: 5, arkadaslik: 4, mutluluk: 3 } },
  kacinma: { fx: { mutluluk: 4, saglik: 2 } },
  risk: { fx: { kariyer: 4, mutluluk: 3 }, paraCarpan: 1.2 },
  guvenli: { fx: { saglik: 3, mutluluk: 3 } },
  sosyal: { fx: { arkadaslik: 6, mutluluk: 3 } },
  yalniz: { fx: { mutluluk: 5, saglik: 3 } },
  romantik: { fx: { ask: 6, mutluluk: 3 } },
  sadakat: { fx: { ask: 5, arkadaslik: 6 } },
  calisma: { fx: { kariyer: 7, mutluluk: 2 } },
  tembellik: { fx: { mutluluk: 6, saglik: 3 } },
  yardim: { fx: { mutluluk: 7, arkadaslik: 5 } },
  bencil: { fx: { kariyer: 4, arkadaslik: -2 } },
  durustluk: { fx: { arkadaslik: 6, mutluluk: 5 } },
  hile: { fx: { kariyer: 5, mutluluk: 2 }, paraCarpan: 1.3 },
  tip: { fx: { kariyer: 8, saglik: 4, mutluluk: 3 } },
  sanat: { fx: { kariyer: 8, mutluluk: 7 } },
  teknik: { fx: { kariyer: 8, mutluluk: 4 }, paraCarpan: 1.2 },
  ticaret: { fx: { kariyer: 7, mutluluk: 3 }, paraCarpan: 1.4 },
  spor: { fx: { saglik: 8, kariyer: 6, mutluluk: 4 } },
  kesif: { fx: { mutluluk: 6, kariyer: 4 } },
};

/** Kişilik profilleri için etiket başına anlatı cümlesi. {ad} = özelliğin adı. */
const NOT_KISILIK: Partial<Record<Etiket, string[]>> = {
  cesaret: [
    "{ad} tarafın öne çıktı; geri adım atmayı düşünmedin bile.",
    "{ad} olmak burada işe yaradı, sesin hiç titremedi.",
  ],
  kacinma: [
    "{ad} yanın devreye girdi; çatışmadan uzak durmayı seçtin.",
    "{ad} olduğun için üstüne gitmedin, geri çekilmek sana daha kolay geldi.",
  ],
  risk: [
    "{ad} tarafın seni ileri itti; sonucunu düşünmeden atladın.",
    "{ad} olmak riski bir tehdit değil, bir fiyat gibi görmeni sağladı.",
  ],
  guvenli: [
    "{ad} yanın önce zemini yokladı; acele etmedin.",
    "{ad} olduğun için garanti olanı seçtin ve pişman olmadın.",
  ],
  sosyal: [
    "{ad} tarafın insanları yanına çekti; kimse yabancılık hissetmedi.",
    "{ad} olmak ortamı senin lehine çevirdi.",
  ],
  yalniz: [
    "{ad} yanın kalabalıktan uzaklaştırdı; kendi köşen sana iyi geldi.",
    "{ad} olduğun için sessizlik ceza değil, dinlenme oldu.",
  ],
  romantik: [
    "{ad} tarafın sevmeyi yarım bırakmana izin vermedi.",
    "{ad} olmak bu anı olduğundan daha büyük hissettirdi.",
  ],
  sadakat: [
    "{ad} yanın sözünü tutturdu; arkasında durmak sana zor gelmedi.",
    "{ad} olduğun için kimseyi yolda bırakmadın.",
  ],
  calisma: [
    "{ad} tarafın masaya oturttu; yorulmak seni durdurmadı.",
    "{ad} olmak emeği bir yük değil, bir yol gibi gösterdi.",
  ],
  tembellik: [
    "{ad} yanın 'boş ver' dedi ve gerçekten de dert etmedin.",
    "{ad} olduğun için hiçbir şey yapmamak sana dokunmadı.",
  ],
  yardim: [
    "{ad} tarafın karşılık beklemeden uzandı.",
    "{ad} olmak başkasının derdini senin derdin yaptı.",
  ],
  bencil: [
    "{ad} yanın kendini öne aldı ve bunu sorgulamadın.",
    "{ad} olduğun için önce kendi payını düşündün.",
  ],
  durustluk: [
    "{ad} tarafın doğruyu söyletti; başka türlüsünü beceremedin.",
    "{ad} olmak yalanı senin için pahalı hale getiriyor.",
  ],
  hile: [
    "{ad} yanın kimsenin görmediği aralığı buldu.",
    "{ad} olduğun için kestirmeyi sen keşfettin.",
  ],
  kesif: [
    "{ad} tarafın merakına yenildi; bilmediğin şey seni çekti.",
    "{ad} olmak yeni olanı korkutucu değil, davetkâr yaptı.",
  ],
  sanat: [
    "{ad} yanın söyleyemediğini işe döktü.",
    "{ad} olmak bu anda sana bambaşka bir dil verdi.",
  ],
  spor: [
    "{ad} tarafın bedenine güvendi; düşünmene bile gerek kalmadı.",
    "{ad} olmak fizik olarak seni ayakta tuttu.",
  ],
  teknik: ["{ad} yanın problemi parçalarına ayırdı.", "{ad} olduğun için karmaşa seni ürkütmedi."],
  ticaret: ["{ad} tarafın fırsatın kokusunu aldı.", "{ad} olmak pazarlığı senin lehine çevirdi."],
  tip: ["{ad} yanın bedeni ve acıyı okumayı biliyor.", "{ad} olmak burada tam karşılığını buldu."],
};

/** Meslek profilleri için etiket başına anlatı cümlesi. */
const NOT_MESLEK: Partial<Record<Etiket, string[]>> = {
  tip: [
    "{ad} eğilimin tam da burada işe yaradı.",
    "{ad} olmak istemen bu anda somut bir avantaja döndü.",
  ],
  sanat: ["{ad} eğilimin bu anı senin lehine çevirdi.", "{ad} tarafın burada konuştu."],
  teknik: [
    "{ad} eğilimin problemi çözülebilir bir şeye dönüştürdü.",
    "{ad} olmak istemen sana burada bir yol gösterdi.",
  ],
  ticaret: [
    "{ad} eğilimin fırsatı herkesten önce gördü.",
    "{ad} olmak istemen pazarlığı kolaylaştırdı.",
  ],
  spor: [
    "{ad} eğilimin bedenini hazır tuttu.",
    "{ad} olmak istemen burada fiziksel bir üstünlük verdi.",
  ],
  kesif: [
    "{ad} eğilimin bilinmeyene karşı seni cesaretlendirdi.",
    "{ad} olmak istemen yeni olanı çekici kıldı.",
  ],
  calisma: [
    "{ad} eğilimin uzun mesaiye alışkın bir doğa vermiş.",
    "{ad} olmak istemen çalışmayı katlanılır kıldı.",
  ],
  yardim: [
    "{ad} eğilimin insana dokunan işlerde seni besliyor.",
    "{ad} olmak istemen burada karşılığını buldu.",
  ],
  durustluk: [
    "{ad} eğilimin açık olmayı gerektiriyor, sen de öyle yaptın.",
    "{ad} olmak istemen dürüstlüğü zorunlu kılıyor.",
  ],
  cesaret: [
    "{ad} eğilimin seni tereddüt etmemeye alıştırmış.",
    "{ad} olmak istemen korkuyu bastırdı.",
  ],
  risk: [
    "{ad} eğilimin belirsizliği normalleştirmiş.",
    "{ad} olmak istemen riski kabullenmeni kolaylaştırdı.",
  ],
  guvenli: [
    "{ad} eğilimin ölçüp biçmeyi öğretmiş.",
    "{ad} olmak istemen aceleci davranmanı engelledi.",
  ],
  sosyal: [
    "{ad} eğilimin insanlarla çalışmayı gerektiriyor, bu sana kolay geliyor.",
    "{ad} olmak istemen ortamı yumuşattı.",
  ],
};

/* ---------- İşin geçtiği yerler ----------
   Kariyer ve para sahneleri oyuncunun mesleğine göre burada kuruluyor:
   hemşireysen hastane koridorunda, tezgâhtarsan kepengin önünde. */
const ORTAMLAR: Partial<Record<Etiket, string[]>> = {
  tip: [
    "hastanenin acil koridorunda",
    "nöbet odasının loş ışığında",
    "poliklinik kapısının önünde",
    "ambulansın arkasında",
  ],
  sanat: [
    "provanın bittiği boş sahnede",
    "atölyenin boya kokan köşesinde",
    "kulisin aynalı duvarının önünde",
    "kayıt odasının camının ardında",
  ],
  teknik: [
    "şantiyenin konteyner ofisinde",
    "atölyenin yağ kokan tezgâhında",
    "ekranların mavi ışığında",
    "makine dairesinin gürültüsünde",
  ],
  ticaret: [
    "dükkânın kepenginin önünde",
    "pazarın en kalabalık saatinde",
    "toplantı odasının uzun masasında",
    "deponun sayım gecesinde",
  ],
  spor: [
    "antrenman salonunun terli havasında",
    "sahanın kenarında, ısınma sırasında",
    "soyunma odasının sessizliğinde",
    "müsabaka öncesi tünelde",
  ],
  kesif: [
    "yolun ortasında, mola verilen bir dinlenme tesisinde",
    "limanda, kalkışa yakın",
    "terminalin bekleme salonunda",
    "haritanın bittiği yerde",
  ],
  yardim: [
    "boşalmış bir sınıfın koridorunda",
    "derneğin kalabalık kayıt masasında",
    "ziyaret saatinin bittiği koğuşta",
  ],
  durustluk: [
    "adliyenin uzun koridorunda",
    "karakolun bekleme sırasında",
    "tutanak masasının başında",
  ],
  calisma: [
    "mesai bitiminde boşalan ofiste",
    "vardiya değişiminde",
    "iş çıkışı asansör kuyruğunda",
  ],
};

const VARSAYILAN_ORTAM = ["iş yerinde", "mesai biterken", "çalıştığın yerde"];

/** Mesleğin geçtiği yerler — önce profilin kendi listesi, yoksa etiketten türetilir. */
export function ozellikOrtami(meslek: Ozellik): string[] {
  if (meslek.ortam?.length) return meslek.ortam;
  const etiketler = Object.keys(meslek.etkiler ?? {}) as Etiket[];
  for (const e of etiketler) {
    if (ORTAMLAR[e]?.length) return ORTAMLAR[e]!;
  }
  return VARSAYILAN_ORTAM;
}

type SozlukGirdi = { anahtarlar: string[]; guclu: Etiket[]; zayif?: Etiket[] };

/** Meslek sözlüğü: anahtar kelimeden etiket eğilimine. */
const MESLEK_SOZLUK: SozlukGirdi[] = [
  {
    anahtarlar: [
      "doktor",
      "hekim",
      "hemşire",
      "cerrah",
      "veteriner",
      "eczacı",
      "diş",
      "sağlık",
      "paramedik",
      "ebe",
      "psikolog",
      "terapist",
      "fizyoterapist",
      "acil",
    ],
    guclu: ["tip", "yardim"],
    zayif: ["hile"],
  },
  {
    anahtarlar: [
      "ressam",
      "müzisyen",
      "yazar",
      "şair",
      "oyuncu",
      "tiyatro",
      "sinema",
      "dansçı",
      "fotoğraf",
      "tasarım",
      "heykel",
      "sanat",
      "gitarist",
      "film",
      "kurgu",
      "besteci",
      "illüstratör",
      "seslendirme",
    ],
    guclu: ["sanat", "kesif"],
    zayif: ["calisma"],
  },
  {
    anahtarlar: [
      "mühendis",
      "yazılım",
      "programcı",
      "teknisyen",
      "tamirci",
      "makinist",
      "elektrik",
      "inşaat",
      "marangoz",
      "usta",
      "kaynakçı",
      "mekanik",
      "bilgisayar",
      "veri",
      "mimar",
      "saatçi",
      "matbaa",
      "operatör",
    ],
    guclu: ["teknik", "calisma"],
    zayif: ["risk"],
  },
  {
    anahtarlar: [
      "tüccar",
      "satış",
      "pazarlama",
      "girişimci",
      "esnaf",
      "bakkal",
      "dükkan",
      "işletme",
      "borsa",
      "emlak",
      "kasap",
      "fırıncı",
      "kuyumcu",
      "muhasebe",
      "kahveci",
      "lokanta",
      "ticaret",
      "seyyar",
    ],
    guclu: ["ticaret", "risk"],
    zayif: ["guvenli"],
  },
  {
    anahtarlar: [
      "sporcu",
      "futbolcu",
      "antrenör",
      "boksör",
      "koşucu",
      "dağcı",
      "yüzücü",
      "dalgıç",
      "itfaiye",
      "asker",
      "jimnastik",
      "güreş",
      "hakem",
      "kondisyon",
    ],
    guclu: ["spor", "cesaret"],
    zayif: ["tembellik"],
  },
  {
    anahtarlar: [
      "polis",
      "avukat",
      "hakim",
      "savcı",
      "müfettiş",
      "denetçi",
      "noter",
      "gazeteci",
      "muhabir",
    ],
    guclu: ["durustluk", "cesaret"],
    zayif: ["hile"],
  },
  {
    anahtarlar: [
      "arkeolog",
      "pilot",
      "kaptan",
      "gemici",
      "rehber",
      "kâşif",
      "seyahat",
      "denizci",
      "kurye",
      "şoför",
      "postacı",
      "biyolog",
      "araştırmacı",
      "jeolog",
    ],
    guclu: ["kesif", "cesaret"],
    zayif: ["guvenli"],
  },
  {
    anahtarlar: [
      "öğretmen",
      "akademisyen",
      "eğitmen",
      "kütüphaneci",
      "sosyal",
      "gönüllü",
      "bakıcı",
      "imam",
      "rehber öğretmen",
      "çocuk",
    ],
    guclu: ["yardim", "sosyal"],
    zayif: ["bencil"],
  },
  {
    anahtarlar: ["çiftçi", "arıcı", "seracı", "bahçıvan", "balıkçı", "çoban", "bağcı", "zeytinci"],
    guclu: ["calisma", "kesif"],
    zayif: ["tembellik"],
  },
];

/** Kişilik sözlüğü. */
const KISILIK_SOZLUK: SozlukGirdi[] = [
  {
    anahtarlar: ["cesur", "atılgan", "gözü pek", "gözüpek", "korkusuz", "yürekli", "cesaretli"],
    guclu: ["cesaret"],
    zayif: ["kacinma"],
  },
  {
    anahtarlar: ["utangaç", "çekingen", "içine kapanık", "sıkılgan", "mahcup", "sessiz"],
    guclu: ["kacinma", "yalniz"],
    zayif: ["cesaret", "sosyal"],
  },
  {
    anahtarlar: ["hırslı", "azimli", "inatçı", "çalışkan", "kararlı", "disiplinli", "gayretli"],
    guclu: ["calisma"],
    zayif: ["tembellik"],
  },
  {
    anahtarlar: ["sadık", "vefalı", "güvenilir", "bağlı", "sözünün eri"],
    guclu: ["sadakat", "romantik"],
    zayif: ["hile"],
  },
  {
    anahtarlar: [
      "umursamaz",
      "tembel",
      "rahat",
      "vurdumduymaz",
      "keyfine düşkün",
      "gamsız",
      "savruk",
    ],
    guclu: ["tembellik", "risk"],
    zayif: ["calisma"],
  },
  {
    anahtarlar: [
      "merhametli",
      "şefkatli",
      "iyi kalpli",
      "fedakâr",
      "fedakar",
      "yardımsever",
      "vicdanlı",
      "duyarlı",
    ],
    guclu: ["yardim", "sosyal"],
    zayif: ["bencil"],
  },
  {
    anahtarlar: ["kurnaz", "açıkgöz", "hesaplı", "işbilir", "uyanık", "sinsi"],
    guclu: ["hile", "risk"],
    zayif: ["durustluk"],
  },
  {
    anahtarlar: ["dürüst", "açık sözlü", "samimi", "doğru", "içten", "şeffaf"],
    guclu: ["durustluk", "sadakat"],
    zayif: ["hile"],
  },
  {
    anahtarlar: [
      "sosyal",
      "geveze",
      "cana yakın",
      "dışa dönük",
      "girişken",
      "sıcakkanlı",
      "konuşkan",
    ],
    guclu: ["sosyal"],
    zayif: ["yalniz"],
  },
  {
    anahtarlar: ["yalnız", "mesafeli", "soğuk", "içedönük", "asosyal", "münzevi"],
    guclu: ["yalniz"],
    zayif: ["sosyal"],
  },
  {
    anahtarlar: ["romantik", "duygusal", "âşık", "aşık", "hassas", "kırılgan", "hüzünlü"],
    guclu: ["romantik"],
    zayif: ["bencil"],
  },
  {
    anahtarlar: [
      "meraklı",
      "hayalperest",
      "maceracı",
      "araştırmacı",
      "keşifçi",
      "gezgin",
      "yaratıcı",
    ],
    guclu: ["kesif", "sanat"],
    zayif: ["guvenli"],
  },
  {
    anahtarlar: ["bencil", "kibirli", "egoist", "çıkarcı", "kıskanç", "menfaatçi"],
    guclu: ["bencil"],
    zayif: ["yardim"],
  },
  {
    anahtarlar: ["sabırlı", "sakin", "soğukkanlı", "temkinli", "ölçülü", "ağırbaşlı"],
    guclu: ["guvenli"],
    zayif: ["risk"],
  },
  {
    anahtarlar: [
      "deli dolu",
      "pervasız",
      "fevri",
      "aceleci",
      "delişmen",
      "asi",
      "isyankâr",
      "isyankar",
    ],
    guclu: ["risk", "cesaret"],
    zayif: ["guvenli"],
  },
  {
    anahtarlar: ["titiz", "düzenli", "planlı", "detaycı", "mükemmeliyetçi", "sistemli"],
    guclu: ["teknik", "calisma"],
    zayif: ["tembellik"],
  },
  {
    anahtarlar: ["sanatsever", "duyarlı ruhlu", "şair ruhlu", "bohem", "estetik"],
    guclu: ["sanat"],
    zayif: ["ticaret"],
  },
  {
    anahtarlar: ["atletik", "enerjik", "hareketli", "dinamik", "güçlü"],
    guclu: ["spor"],
    zayif: ["tembellik"],
  },
  {
    anahtarlar: ["iyimser", "neşeli", "espri", "esprili", "şakacı", "güler yüzlü"],
    guclu: ["sosyal", "kesif"],
  },
  {
    anahtarlar: ["karamsar", "kaygılı", "endişeli", "vesveseli", "alıngan", "güvensiz"],
    guclu: ["guvenli", "yalniz"],
    zayif: ["cesaret"],
  },
  {
    anahtarlar: ["cimri", "tutumlu", "hesabını bilen"],
    guclu: ["guvenli", "ticaret"],
    zayif: ["yardim"],
  },
  {
    anahtarlar: ["cömert", "eli açık", "paylaşımcı"],
    guclu: ["yardim", "sosyal"],
    zayif: ["bencil"],
  },
];

const rast = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

function notUret(etiket: Etiket, ad: string, tur: "kisilik" | "meslek") {
  const banka = tur === "meslek" ? NOT_MESLEK[etiket] : NOT_KISILIK[etiket];
  const kalip = banka
    ? rast(banka)
    : tur === "meslek"
      ? "{ad} eğilimin burada işine yaradı."
      : "{ad} tarafın bu seçimde kendini gösterdi.";
  return kalip.replace("{ad}", ad);
}

function olcekle(fx: Etki, carpan: number): Etki {
  const yeni: Etki = {};
  (Object.keys(fx) as (keyof Etki)[]).forEach((k) => {
    const d = Math.round((fx[k] ?? 0) * carpan);
    if (d !== 0) yeni[k] = d;
  });
  return yeni;
}

/**
 * Profili sabit etki tablosundan kurar. Etiket seçimini kim yaparsa yapsın
 * (sözlük ya da yapay zekâ) sayılar hep buradan gelir — denge oyunun elinde kalır.
 */
export function profilKur(
  ad: string,
  guclu: Etiket[],
  zayif: Etiket[] = [],
  notlar: Partial<Record<Etiket, string>> = {},
  tur: "kisilik" | "meslek" = "kisilik",
  kaynak: "yerel" | "ai" = "yerel",
  ortam?: string[],
): Ozellik {
  const temiz = ad.trim().slice(0, 40);
  const gecerliGuclu = guclu.filter((e) => ETIKET_TABAN[e]).slice(0, 3);
  const gecerliZayif = zayif
    .filter((e) => ETIKET_TABAN[e] && !gecerliGuclu.includes(e))
    .slice(0, 2);
  const etkiler: Ozellik["etkiler"] = {};

  gecerliGuclu.forEach((e) => {
    const taban = ETIKET_TABAN[e];
    etkiler[e] = {
      fx: { ...taban.fx },
      not: (notlar[e] ?? notUret(e, temiz, tur)).slice(0, 160),
      ...(taban.paraCarpan ? { paraCarpan: taban.paraCarpan } : {}),
    };
  });
  gecerliZayif.forEach((e) => {
    etkiler[e] = {
      fx: olcekle(ETIKET_TABAN[e].fx, -0.8),
      not: (
        notlar[e] ??
        (tur === "meslek"
          ? `${temiz} eğilimin bu tarafta seni zorluyor.`
          : `${temiz} yanın burada işini zorlaştırdı.`)
      ).slice(0, 160),
    };
  });

  const baslangic: Etki = {};
  gecerliGuclu.forEach((e) => {
    const o = olcekle(ETIKET_TABAN[e].fx, 0.4);
    (Object.keys(o) as (keyof Etki)[]).forEach((k) => {
      baslangic[k] = Math.max(-8, Math.min(8, (baslangic[k] ?? 0) + (o[k] ?? 0)));
    });
  });

  return { ad: temiz, etkiler, fx: baslangic, kaynak, ...(ortam?.length ? { ortam } : {}) };
}

/** Yapay zekânın seçebileceği etiketler. */
export const ETIKET_LISTESI = Object.keys(ETIKET_TABAN) as Etiket[];

function sozluktenProfil(ad: string, girdi: SozlukGirdi, tur: "kisilik" | "meslek"): Ozellik {
  const etkiler: Ozellik["etkiler"] = {};
  girdi.guclu.forEach((e) => {
    const taban = ETIKET_TABAN[e];
    etkiler[e] = {
      fx: { ...taban.fx },
      not: notUret(e, ad, tur),
      ...(taban.paraCarpan ? { paraCarpan: taban.paraCarpan } : {}),
    };
  });
  (girdi.zayif ?? []).forEach((e) => {
    if (etkiler[e]) return;
    const taban = ETIKET_TABAN[e];
    etkiler[e] = {
      fx: olcekle(taban.fx, -0.8),
      not:
        tur === "meslek"
          ? `${ad} eğilimin bu tarafta seni zorluyor.`
          : `${ad} yanın burada işini zorlaştırdı.`,
    };
  });
  // Başlangıç etkisi: güçlü etiketlerin hafif bir yansıması.
  const baslangic: Etki = {};
  girdi.guclu.forEach((e) => {
    const o = olcekle(ETIKET_TABAN[e].fx, 0.4);
    (Object.keys(o) as (keyof Etki)[]).forEach((k) => {
      baslangic[k] = Math.max(-8, Math.min(8, (baslangic[k] ?? 0) + (o[k] ?? 0)));
    });
  });
  return { ad, etkiler, fx: baslangic, kaynak: "yerel" };
}

/** Hazır listedeki kişilik/mesleklerin elle yazılmış tablolarını kullan. */
function hazirProfil(ad: string, tur: "kisilik" | "meslek"): Ozellik | null {
  const liste = tur === "meslek" ? MESLEKLER : KISILIKLER;
  const tablo = tur === "meslek" ? MESLEK_ETKI : KISILIK_ETKI;
  const n = kucuk(ad);
  const bulunan = liste.find((x) => kucuk(x.ad) === n || x.key === n);
  if (!bulunan) return null;
  const kaynak = tablo[bulunan.key];
  if (!kaynak) return null;
  const etkiler: Ozellik["etkiler"] = {};
  (Object.keys(kaynak) as Etiket[]).forEach((e) => {
    const v = kaynak[e]!;
    etkiler[e] = {
      fx: { ...v.fx },
      not: v.not,
      ...(v.paraCarpan ? { paraCarpan: v.paraCarpan } : {}),
    };
  });
  return { ad: bulunan.ad, etkiler, fx: { ...bulunan.fx }, kaynak: "yerel" };
}

/**
 * Serbest metni oyun profiline çevirir.
 * Önce hazır listeye, sonra anahtar kelime sözlüğüne bakar; hiçbiri tutmazsa
 * merak/keşif ağırlıklı yumuşak bir profil verir (oyun yine de çalışır).
 */
export function yerelOzellik(ad: string, tur: "kisilik" | "meslek"): Ozellik {
  const temiz = ad.trim().slice(0, 40) || (tur === "meslek" ? "Belirsiz" : "Kendine özgü");
  const hazir = hazirProfil(temiz, tur);
  if (hazir) return hazir;

  const n = kucuk(temiz);
  const sozluk = tur === "meslek" ? MESLEK_SOZLUK : KISILIK_SOZLUK;
  const eslesen = sozluk.find((g) => g.anahtarlar.some((a) => n.includes(a)));
  if (eslesen) return sozluktenProfil(temiz, eslesen, tur);

  return sozluktenProfil(temiz, { anahtarlar: [], guclu: ["kesif"], zayif: ["guvenli"] }, tur);
}

/* ---------- Çevrimdışı öneri havuzları ----------
   Yapay zekâ yokken "Öner" düğmesi bunlardan seçer. */

export const ONERI_MESLEKLER = [
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
  "gemi makinisti",
  "hayvan barınağı gönüllüsü",
  "kargo kuryesi",
  "balıkçı teknesi çırağı",
  "müze bekçisi",
  "cenaze evi görevlisi",
  "orman muhafaza memuru",
  "kuyumcu kalfası",
  "sokak müzisyeni",
];

export const ONERI_KISILIKLER = [
  "inatçı",
  "sıcakkanlı",
  "dağınık",
  "sakin",
  "meraklı",
  "alıngan",
  "cesur",
  "sabırsız",
  "dürüst",
  "utangaç",
  "esprili",
  "sadık",
  "hesaplı",
  "mesafeli",
  "çalışkan",
  "duygusal",
  "gözü pek",
  "savurgan",
  "titiz",
  "kuşkucu",
  "fedakâr",
  "geveze",
  "iyimser",
  "unutkan",
  "gözlemci",
  "kırılgan",
  "asi",
  "hırslı",
  "kıskanç",
  "şefkatli",
  "tembel",
  "barışçıl",
  "alaycı",
  "zeki",
  "güvensiz",
  "cömert",
  "pervasız",
  "temkinli",
  "hayalperest",
];

/** İpucu verilmişse havuzdan o kelimeye en yakın öneriyi bul. */
export function yerelOneri(tur: "meslek" | "kisilik", ipucu?: string, kacinilan: string[] = []) {
  const havuz = tur === "meslek" ? ONERI_MESLEKLER : ONERI_KISILIKLER;
  const taze = havuz.filter((x) => !kacinilan.some((k) => kucuk(k) === kucuk(x)));
  const liste = taze.length ? taze : havuz;
  const ip = kucuk(ipucu ?? "");
  if (ip) {
    const yakin = liste.filter((x) => kucuk(x).includes(ip));
    if (yakin.length) return rast(yakin);
    // İpucu bir alan olabilir: sözlükte hangi gruba düşüyorsa oradan bir meslek seç.
    if (tur === "meslek") {
      const grup = MESLEK_SOZLUK.find((g) =>
        g.anahtarlar.some((a) => ip.includes(a) || a.includes(ip)),
      );
      if (grup) {
        const uyan = liste.filter((x) => grup.anahtarlar.some((a) => kucuk(x).includes(a)));
        if (uyan.length) return rast(uyan);
      }
    }
  }
  return rast(liste);
}
