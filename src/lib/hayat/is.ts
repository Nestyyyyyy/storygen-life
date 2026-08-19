/* Hayat Simülatörü — meslek sözlüğü ve iş sahnesi üreteci

   Sorun şuydu: meslek sadece "etiket" olarak işleniyordu; sahne metinlerine
   hiç girmiyordu. Oyuncu "yetişkin film üreticisi" yazdığında da "kasap"
   yazdığında da aynı sahneler geliyordu.

   Çözüm: her mesleğin bir sözlüğü var — yer, kişi, iş, nesne, sorun, kazanç.
   İş sahneleri sabit metin değil; kalıp + bu sözlükten çekilen kelimelerle
   kuruluyor ve mesleğin ADI sahnenin içinde geçiyor. */

import type { Alan, Etiket, Etki, Evre, Olay, Ozellik, Secenek, StatAnahtar } from "./tipler";

export type IsSozlugu = {
  /** "sette", "acil serviste" — bulunma hâliyle. */
  yer: string[];
  /** "yapımcı", "hasta yakını" — yalın hâlde. */
  kisi: string[];
  /** "çekim", "nöbet" — yalın hâlde. */
  is: string[];
  /** "senaryo", "tahlil sonucu". */
  nesne: string[];
  /** Tam cümle: "bütçe ortasında kesildi". */
  sorun: string[];
  /** Tam cümle: "yaptığın iş beğenildi". */
  kazanc: string[];
};

const GENEL: IsSozlugu = {
  yer: ["iş yerinde", "mesai sırasında", "çalıştığın yerde", "masanın başında"],
  kisi: ["bir iş arkadaşın", "müdürün", "müşteri", "yeni gelen biri"],
  is: ["iş", "görev", "mesai", "teslim"],
  nesne: ["dosya", "liste", "hesap", "not defteri"],
  sorun: [
    "işler bir anda birikti",
    "beklenmedik bir talep geldi",
    "bir hata ortaya çıktı",
    "söz verilen şey yetişmedi",
  ],
  kazanc: ["yaptığın iş fark edildi", "işin zamanında bitti", "kimse sorun çıkarmadı"],
};

/** Etiket → meslek sözlüğü. Serbest metin hangi gruba düşerse o sözlük kullanılır. */
const SOZLUKLER: Partial<Record<Etiket, IsSozlugu>> = {
  tip: {
    yer: [
      "acil serviste",
      "nöbet odasında",
      "poliklinikte",
      "ameliyathane kapısında",
      "koğuş koridorunda",
    ],
    kisi: [
      "bir hasta yakını",
      "başhekim",
      "nöbetçi asistan",
      "yaşlı bir hasta",
      "hemşire arkadaşın",
    ],
    is: ["nöbet", "vizit", "ameliyat", "sevk", "reçete"],
    nesne: ["tahlil sonucu", "hasta dosyası", "serum", "ilaç kutusu", "monitör"],
    sorun: [
      "iki hasta aynı anda kötüleşti",
      "gece nöbetinde ekip yarıya düştü",
      "bir yakın bağırarak üstüne yürüdü",
      "ilaç stoğu tükendi",
      "yanlış bir kayıt fark edildi",
    ],
    kazanc: [
      "bir hastayı tam zamanında yakaladın",
      "zor bir vakayı doğru okudun",
      "bir yakın çıkarken elini sıktı",
    ],
  },
  sanat: {
    yer: ["sette", "kurgu odasında", "provada", "kuliste", "stüdyoda", "gösterim salonunda"],
    kisi: ["yapımcı", "oyuncu", "teknik ekipten biri", "eleştirmen", "menajerin", "dağıtımcı"],
    is: ["çekim", "montaj", "prova", "gösterim", "kayıt", "seçme"],
    nesne: ["senaryo", "kamera", "ışık planı", "afiş", "kaba kurgu", "sözleşme"],
    sorun: [
      "bütçe işin ortasında kesildi",
      "oyuncu sete gelmedi",
      "yapımcı işi beğenmedi",
      "gösterim son anda iptal oldu",
      "telif meselesi çıktı",
      "ekip ödemesini alamadı",
    ],
    kazanc: [
      "iş beklenmedik biçimde beğenildi",
      "seçkiye alındın",
      "salon doldu",
      "bir dağıtımcı ilgilendi",
    ],
  },
  teknik: {
    yer: ["şantiyede", "atölyede", "makine dairesinde", "ekranların başında", "sahada"],
    kisi: ["usta başı", "müşteri", "proje sorumlusu", "çırağın", "kontrol mühendisi"],
    is: ["montaj", "bakım", "kurulum", "hesap", "test"],
    nesne: ["plan", "yedek parça", "ölçüm cihazı", "arıza kaydı", "şema"],
    sorun: [
      "sistem gece yarısı çöktü",
      "parça yanlış geldi",
      "hesap bir yerde tutmadı",
      "teslim tarihi öne çekildi",
      "eski kurulum tamamen bozuldu",
    ],
    kazanc: [
      "kimsenin bulamadığı arızayı sen buldun",
      "kurulum sorunsuz geçti",
      "çözümün standart oldu",
    ],
  },
  ticaret: {
    yer: ["dükkânda", "depoda", "pazarda", "toplantı odasında", "tezgâhın başında"],
    kisi: ["müşteri", "tedarikçi", "muhasebeci", "rakip esnaf", "ortağın"],
    is: ["sayım", "pazarlık", "teslimat", "kampanya", "tahsilat"],
    nesne: ["fatura", "sipariş defteri", "kasa", "stok listesi", "çek"],
    sorun: [
      "ay sonu kasa açık verdi",
      "tedarikçi habersiz zam yaptı",
      "müşteri parayı ödemedi",
      "karşıdaki dükkân fiyat kırdı",
      "mal geldi ama yeri yok",
    ],
    kazanc: [
      "beklemediğin bir sipariş geldi",
      "pazarlıktan kârlı çıktın",
      "sadık bir müşteri kazandın",
    ],
  },
  spor: {
    yer: ["antrenmanda", "sahada", "soyunma odasında", "kampta", "salonda"],
    kisi: ["antrenör", "takım arkadaşın", "menajer", "genç bir sporcu", "rakibin"],
    is: ["idman", "müsabaka", "kamp", "seçme"],
    nesne: ["form", "sakatlık raporu", "kronometre", "sözleşme"],
    sorun: [
      "eski sakatlık nüksetti",
      "kadro dışı bırakıldın",
      "tempo seni aştı",
      "başka bir kulüp teklif getirdi",
      "ölçümler geriye gitti",
    ],
    kazanc: ["derece yaptın", "kadroya yeniden girdin", "genç sporcular seni örnek aldı"],
  },
  kesif: {
    yer: ["yolda", "limanda", "terminalde", "araçta", "kamp yerinde"],
    kisi: ["yol arkadaşın", "yerel bir rehber", "yolcu", "dispeçer"],
    is: ["sefer", "rota", "teslimat", "keşif"],
    nesne: ["harita", "yol belgesi", "yakıt", "depo kaydı"],
    sorun: [
      "hava bir anda bozdu",
      "yol kapandı",
      "araç yolda kaldı",
      "program tamamen aksadı",
      "izin belgesi çıkmadı",
    ],
    kazanc: ["kimse geçemezken sen geçtin", "zamanında vardın", "yeni bir yol buldun"],
  },
  yardim: {
    yer: ["sınıfta", "koridorda", "dernekte", "ziyaret saatinde", "toplantı salonunda"],
    kisi: ["bir veli", "öğrenci", "gönüllü arkadaşın", "müdür", "yardım isteyen biri"],
    is: ["ders", "toplantı", "kayıt", "ziyaret"],
    nesne: ["not defteri", "başvuru formu", "yardım kolisi", "liste"],
    sorun: [
      "bir çocuk günlerdir gelmiyor",
      "bütçe kesildi",
      "veli şikâyet etti",
      "gönüllüler birer birer ayrıldı",
    ],
    kazanc: ["bir öğrencinin yolu değişti", "bağış toplandı", "kimse yokken sen kaldın"],
  },
  durustluk: {
    yer: ["adliyede", "karakolda", "duruşma salonunda", "nöbet noktasında"],
    kisi: ["müvekkil", "amirin", "tanık", "meslektaşın"],
    is: ["dosya", "ifade", "duruşma", "devriye"],
    nesne: ["tutanak", "dilekçe", "kanıt torbası", "kayıt"],
    sorun: [
      "dosyada bir şey eksikti",
      "üstün açıkça baskı yaptı",
      "tanık ifadesini değiştirdi",
      "süre doldu ve evrak yetişmedi",
    ],
    kazanc: ["dosyayı kazandın", "bir haksızlığı önledin", "doğru olan tutanağa geçti"],
  },
  calisma: {
    yer: ["vardiyada", "fabrikada", "depoda", "ofiste", "tezgâhın başında"],
    kisi: ["vardiya amiri", "iş arkadaşın", "sendika temsilcisi", "yeni işçi"],
    is: ["vardiya", "üretim", "sayım", "teslim"],
    nesne: ["puantaj", "üretim çizelgesi", "makine", "eldiven"],
    sorun: [
      "vardiya bir kişi eksik başladı",
      "hedef ikiye katlandı",
      "ödeme geciktirildi",
      "makine tam da bugün durdu",
    ],
    kazanc: ["hedefi tutturdunuz", "ekip seni dinledi", "işin kalitesi konuşuldu"],
  },
};

/** Mesleğin sözlüğü — etiketinden bulunur, hiçbiri tutmazsa genel sözlük. */
export function meslekSozlugu(meslek: Ozellik): IsSozlugu {
  const etiketler = Object.keys(meslek.etkiler ?? {}) as Etiket[];
  for (const e of etiketler) {
    if (SOZLUKLER[e]) return SOZLUKLER[e]!;
  }
  return GENEL;
}

/** Meslek belirtilmemişse iş sahnesi kurulmaz. */
export function meslekVarMi(meslek: Ozellik) {
  return !!meslek?.ad && !/^(belirsiz|bilmiyorum|yok|karars)/i.test(meslek.ad.trim());
}

/* ---------- İş sahnesi üreteci ----------
   Sahne, kalıp + meslek sözlüğü + mesleğin adıyla kuruluyor. Aynı kalıp
   her mesleğe göre bambaşka bir sahneye dönüşüyor. */

type Aralik = [number, number];
type EtkiAraligi = Partial<Record<StatAnahtar, Aralik>>;

type IsSecenegi = {
  t: string[];
  etiketler: Etiket[];
  fx: EtkiAraligi;
  para?: Aralik;
  sonuc: string[];
  riskli?: number;
  kotu?: { fx: EtkiAraligi; para?: Aralik; sonuc: string[] };
};

type IsKalibi = {
  id: string;
  alan: Alan;
  emoji: string[];
  baslik: string[];
  durum: string[];
  secenekler: IsSecenegi[];
  /** Bu kalıbın çıkabileceği yaş bantları. */
  evreler?: Evre[];
};

const ZAMANLAR = [
  "sabahın köründe",
  "öğle molasında",
  "gün biterken",
  "gece yarısına doğru",
  "hafta sonu",
  "ay sonuna üç gün kala",
  "yağmurlu bir salı",
];

const IS_KALIPLARI: IsKalibi[] = [
  {
    id: "is-sorun",
    alan: "kariyer",
    emoji: ["🧯", "⚠️", "🧩"],
    baslik: ["Beklenmedik Sorun", "Aksama", "Bir Terslik"],
    durum: [
      "{yer} {sorun}. {meslek} olarak çözümü senden bekliyorlar.",
      "{zaman} {yer} {sorun}. {meslek} olarak bu senin masanda.",
      "{sorun} ve {yer} herkes sana bakıyor.",
    ],
    secenekler: [
      {
        t: ["Üstlen, çöz", "Ben hallederim de"],
        etiketler: ["calisma", "cesaret"],
        fx: { kariyer: [5, 11], saglik: [-7, -2], mutluluk: [-3, 3] },
        para: [0, 5000],
        sonuc: [
          "Kolları sıvadın ve {is} yeniden yürüdü. {kazanc}; kimse alkışlamadı ama herkes bunu gördü.",
          "Gece yarısına kadar uğraştın ve çözdün. Ertesi gün {kisi} tek kelime etmedi, gerek de yoktu.",
        ],
      },
      {
        t: ["Sorumluyu bul", "Bu benim işim değil"],
        etiketler: ["bencil", "kacinma"],
        fx: { kariyer: [-4, 3], arkadaslik: [-8, -2], mutluluk: [-4, 2] },
        sonuc: [
          "Sorunun kimden çıktığını gösterdin ve konu senden uzaklaştı. {kisi} bunu unutmadı.",
          "Elini taşın altına koymadın. {is} bir şekilde halloldu ama ekipte adın bir yere yazıldı.",
        ],
      },
      {
        t: ["Kökten çöz, tekrarlamasın", "Sistemi değiştir"],
        etiketler: ["teknik", "calisma"],
        fx: { kariyer: [6, 12], saglik: [-8, -3], mutluluk: [0, 5] },
        sonuc: [
          "Bugünü kurtarmak yerine nedenini buldun. {nesne} baştan düzenlendi ve aynı sorun bir daha çıkmadı.",
          "Yamayla geçiştirmedin. Bir hafta fazladan uğraştın; sonraki yıllar bunu sen bile fark etmeden kolaylaştı.",
        ],
      },
    ],
  },
  {
    id: "is-mesai",
    alan: "kariyer",
    emoji: ["🕙", "🔦", "☕"],
    baslik: ["Uzayan Gün", "Bitmeyen Vardiya", "Geç Saat"],
    durum: [
      "{zaman} {yer} {is} hâlâ bitmedi ve dışarısı çoktan karardı.",
      "{yer} herkes gitti; {meslek} olmanın bu saatlerini kimse görmüyor, {nesne} hâlâ önünde duruyor.",
      "{meslek} olmanın bu tarafını kimse anlatmıyor: {zaman} hâlâ buradasın.",
    ],
    secenekler: [
      {
        t: ["Bitirmeden çıkma", "Sonuna kadar kal"],
        etiketler: ["calisma"],
        fx: { kariyer: [4, 9], saglik: [-9, -4], mutluluk: [-5, 1], arkadaslik: [-4, 0] },
        para: [500, 6000],
        sonuc: [
          "Işıkları sen kapattın. {is} bitti; telefonunda üç cevapsız arama, sırtında bir tutulma vardı.",
          "Bitirdin ve eve vardığında yemek yemeden uyudun. {kazanc} ama bunu kutlayacak enerjin kalmadı.",
        ],
      },
      {
        t: ["Yarına bırak", "Paydos"],
        etiketler: ["guvenli", "tembellik"],
        fx: { saglik: [4, 10], mutluluk: [3, 8], kariyer: [-6, -1] },
        sonuc: [
          "Ceketini aldın ve çıktın. Arkanda yarım kalan {is} vardı ama akşam yemeğine yetiştin.",
          "Bugünlük bu kadar dedin. Sabah geldiğinde iş hâlâ oradaydı ve hiçbir şey yıkılmamıştı.",
        ],
      },
      {
        t: ["Yardım çağır", "Ekibi topla"],
        etiketler: ["sosyal", "teknik"],
        fx: { kariyer: [3, 8], arkadaslik: [5, 10], saglik: [-4, 1] },
        sonuc: [
          "Tek başına boğulmak yerine {kisi} ile birkaç kişiyi çağırdın. Üçte bir sürede bittiğinde hep birlikte bir şeyler yediniz.",
          "Yükü paylaştın. Kimse itiraz etmedi; zaten hepiniz aynı gemideydiniz.",
        ],
      },
    ],
  },
  {
    id: "is-para",
    alan: "para",
    emoji: ["💰", "📉", "🧾"],
    baslik: ["Para Meselesi", "Hesap", "Bütçe"],
    durum: [
      "{yer} para konuşuluyor: {sorun}. {meslek} olmak bu ay pahalıya geldi.",
      "{zaman} {nesne} önüne kondu ve rakamlar tutmuyor: {sorun}.",
      "{meslek} olarak kazandığın, bu ay giderleri karşılamıyor. {sorun}.",
    ],
    secenekler: [
      {
        t: ["Hakkını iste, rakamı konuş", "Pazarlık et"],
        etiketler: ["cesaret", "ticaret"],
        fx: { kariyer: [2, 7], mutluluk: [0, 5], saglik: [-4, 0] },
        para: [4000, 22000],
        riskli: 0.3,
        kotu: {
          fx: { kariyer: [-6, -1], mutluluk: [-8, -3], arkadaslik: [-4, 0] },
          sonuc: [
            'Rakamı söyleyince oda sessizleşti. "Şu an mümkün değil" dediler ve o günden sonra sana biraz mesafeli davrandılar.',
            "İstediğini alamadın, üstüne fazla istemiş gibi hissettirildin. {yer} her şey aynı kaldı, sen değişmedin sadece küçüldün.",
          ],
        },
        sonuc: [
          "Rakamı söyledin ve sustun; asıl zor olan o sessizlikti. Sonunda kabul edildi ve {kazanc}.",
          "Pazarlığı sen yönettin. {kisi} önce direndi, sonra kalem oynattı.",
        ],
      },
      {
        t: ["İdare et, kıs", "Sesini çıkarma"],
        etiketler: ["guvenli", "kacinma"],
        fx: { mutluluk: [-6, 0], saglik: [-3, 1] },
        para: [-2000, 2500],
        sonuc: [
          "Listeden bir sürü şey çıkardın ve ayı zar zor kapattın. Kimseye anlatmadın.",
          "Sesini çıkarmadın; {yer} kimse fark etmedi. Ay sonu yine aynı yerdeydin.",
        ],
      },
      {
        t: ["Ek iş al", "Fazladan çalış"],
        etiketler: ["calisma", "ticaret"],
        fx: { kariyer: [3, 8], saglik: [-9, -3], mutluluk: [-5, 2], arkadaslik: [-5, 0] },
        para: [6000, 20000],
        sonuc: [
          "Mesai dışında da {is} almaya başladın. Cebin doldu, günlerin kısaldı.",
          "İki işi birden yürüttün. Rakamlar düzeldi; aynada yüzün yorgun görünmeye başladı.",
        ],
      },
    ],
  },
  {
    id: "is-etik",
    alan: "kariyer",
    emoji: ["⚖️", "🤐", "🕶️"],
    baslik: ["Kimsenin Görmediği Aralık", "Küçük Bir Dokunuş"],
    durum: [
      "{yer} {nesne} üzerinde küçük bir değişiklik her şeyi kolaylaştırır ve kimse anlamaz.",
      "{kisi} senden usulüne uymayan bir şey istiyor; karşılığında işler epey rahatlayacak.",
      "{meslek} olarak bunu yapabileceğini biliyorsun. Sorun yapıp yapmaman.",
    ],
    secenekler: [
      {
        t: ["Yapma, kurala uy", "Reddet"],
        etiketler: ["durustluk"],
        fx: { mutluluk: [4, 9], arkadaslik: [-3, 4], kariyer: [-5, 2] },
        sonuc: [
          '"Bu şekilde olmaz" dedin. {is} zorlaştı, bazıları sana kızdı; aynaya bakarken sorun yaşamadın.',
          "Kısa yolu görmene rağmen uzun yoldan gittin. Kimse teşekkür etmedi ama bir yerin temiz kaldı.",
        ],
      },
      {
        t: ["Yap, kimse anlamaz", "Kısa yoldan hallet"],
        etiketler: ["hile", "risk"],
        fx: { kariyer: [3, 9], mutluluk: [-8, 2] },
        para: [2000, 25000],
        riskli: 0.35,
        kotu: {
          fx: { kariyer: [-12, -5], arkadaslik: [-10, -3], mutluluk: [-12, -5] },
          para: [-25000, -5000],
          sonuc: [
            "Aylar sonra ortaya çıktı. {yer} kimse yüzüne bakmadı; savunman kimseyi ikna etmedi.",
            "Yakalandın. En kötüsü ceza değil, {kisi} bakışındaki o değişimdi.",
          ],
        },
        sonuc: [
          "Yaptın ve gerçekten kimse anlamadı. {is} kolaylaştı; içindeki ses birkaç hafta konuştu, sonra o da sustu.",
          "Kısa yol tuttu. Bir daha yapmayacağını söyledin kendine ve bunu her seferinde söyleyeceksin.",
        ],
      },
      {
        t: ["Üste bildir", "Kayda geçir"],
        etiketler: ["durustluk", "cesaret"],
        fx: { kariyer: [-6, 5], arkadaslik: [-9, 3], mutluluk: [2, 7] },
        sonuc: [
          "Konuyu yazılı olarak ilettin. {kisi} bir daha seninle aynı masada rahat oturamadı ama iş düzeldi.",
          'Bildirdin. Bazıları "gereği yoktu" dedi; sen gereğini yaptın.',
        ],
      },
    ],
  },
  {
    id: "is-firsat",
    alan: "kariyer",
    emoji: ["🚀", "🪜", "📈"],
    baslik: ["Büyük Teklif", "Sıçrama", "Kapı Açıldı"],
    durum: [
      "{kisi} sana çok daha büyük bir sorumluluk teklif etti. {meslek} olarak bu bir sıçrama olabilir.",
      "{zaman} {yer} adın geçti: seni daha büyük bir işin başına almak istiyorlar.",
      "{meslek} olarak bugüne kadar yaptığın en büyük iş masada duruyor ve karar senin.",
    ],
    secenekler: [
      {
        t: ["Kabul et", "Altına gir"],
        etiketler: ["cesaret", "calisma", "risk"],
        fx: { kariyer: [7, 14], saglik: [-8, -2], mutluluk: [-4, 6], arkadaslik: [-5, 2] },
        para: [8000, 45000],
        riskli: 0.3,
        kotu: {
          fx: { kariyer: [-10, -3], mutluluk: [-12, -4], saglik: [-8, -3] },
          sonuc: [
            "İşin boyu seni aştı. {sorun} ve altından kalkamadın; toparlanman aylar sürdü.",
            "Kabul ettiğine pişman olduğun günler oldu. Bitti ama seni de bitirdi.",
          ],
        },
        sonuc: [
          "Evet dedin ve altından kalktın. {kazanc}; artık {meslek} denince akla gelen birkaç isimden birisin.",
          "Büyük işin altına girdin. Zorlandın, öğrendin ve çıktığında aynı kişi değildin.",
        ],
      },
      {
        t: ["Reddet, bildiğin işi yap", "Şimdilik olmaz"],
        etiketler: ["guvenli", "kacinma"],
        fx: { kariyer: [-6, 0], saglik: [3, 8], mutluluk: [-4, 5] },
        sonuc: [
          '"Hazır değilim" dedin. İş başkasına gitti ve iyi de yürüdü; bunu izlemek tuhaftı.',
          "Kendi ölçünde kalmayı seçtin. Huzurlu ama bir yerinde 'acaba' kaldı.",
        ],
      },
      {
        t: ["Şartları pazarlık et", "Kabul, ama koşullarla"],
        etiketler: ["ticaret", "teknik"],
        fx: { kariyer: [5, 10], mutluluk: [2, 7], saglik: [-4, 0] },
        para: [5000, 30000],
        sonuc: [
          "Kabul ettin ama kendi şartlarınla: süre, ekip ve bütçe yazıya geçti. İş de sen de ayakta kaldınız.",
          "Pazarlık ettin ve daha iyi bir yerden başladın. {kisi} seni bir daha hafife almadı.",
        ],
      },
    ],
  },
  {
    id: "is-catisma",
    alan: "kariyer",
    emoji: ["💢", "🗯️", "🤝"],
    baslik: ["Sert Tartışma", "Anlaşmazlık"],
    durum: [
      "{yer} {kisi} ile {is} yüzünden sesler yükseldi; {meslek} olarak geri adım atman bekleniyor.",
      "{kisi} senin işini herkesin önünde eleştirdi; {yer} ortam buz kesti.",
      "{meslek} olarak yaptığın işi savunman gerekiyor ve karşındaki geri adım atmıyor.",
    ],
    secenekler: [
      {
        t: ["Savun, geri adım atma", "Haklısın, göster"],
        etiketler: ["cesaret", "durustluk"],
        fx: { kariyer: [2, 8], arkadaslik: [-6, 4], mutluluk: [0, 6], saglik: [-4, 0] },
        sonuc: [
          "Sesini yükseltmeden ama net konuştun. {nesne} üstünden gösterdiğinde tartışma bitti.",
          "Arkasında durdun. Ortam gerildi, sonra düzeldi; kimse bir daha aynı şeyi söylemedi.",
        ],
      },
      {
        t: ["Sus, geç", "Tartışmaya girme"],
        etiketler: ["kacinma"],
        fx: { mutluluk: [-7, -1], arkadaslik: [-3, 3], saglik: [1, 4] },
        sonuc: [
          "Cevap vermedin. Ortam yatıştı ama o cümle akşam eve giderken hâlâ aklındaydı.",
          "Yutkundun ve işine döndün. Kolayı seçtin; kolay olan hep ucuz değil.",
        ],
      },
      {
        t: ["Sonra baş başa konuş", "Ortamı büyütme"],
        etiketler: ["sosyal", "guvenli"],
        fx: { arkadaslik: [4, 10], mutluluk: [2, 7], kariyer: [0, 4] },
        sonuc: [
          "Kalabalıkta cevap vermedin; sonra {kisi} ile baş başa konuştun. İkiniz de neyin ne olduğunu anladınız.",
          "Meseleyi seyirci önünde çözmedin. Bu, ikinizin de itibarını korudu.",
        ],
      },
    ],
  },
  {
    id: "is-cirak",
    alan: "kariyer",
    emoji: ["🧑‍🏫", "🪶", "🌱"],
    baslik: ["Yeni Gelen", "Çırak"],
    durum: [
      "{yer} yeni biri var ve {meslek} olmanın ne demek olduğunu senden öğrenmek istiyor.",
      '{kisi} sana bir genci emanet etti: "Sen yetiştir, {meslek} olmayı senden öğrensin."',
      "{zaman} biri yanına gelip {is} nasıl yapılır diye sordu; senin ilk günlerine benziyor.",
    ],
    secenekler: [
      {
        t: ["Öğret, kanadının altına al", "Bildiğini aktar"],
        etiketler: ["yardim", "sosyal"],
        fx: { kariyer: [3, 8], arkadaslik: [6, 12], mutluluk: [5, 10], saglik: [-3, 0] },
        sonuc: [
          "Bildiğin her şeyi anlattın, hatalarını da sakladığın yerden çıkarıp gösterdin. Bir yıl sonra senin göremediğin bir çözümü buldu ve ilk sana koştu.",
          "Vaktini ayırdın. {kazanc} demek değil belki ama o çocuk seni ömür boyu anacak.",
        ],
      },
      {
        t: ["Mesafeni koru", "Kendi işine bak"],
        etiketler: ["bencil", "yalniz"],
        fx: { kariyer: [1, 5], arkadaslik: [-8, -2], mutluluk: [-5, 0] },
        sonuc: [
          "Kısa cevaplar verdin, {nesne} paylaşmadın. Yerin sağlam kaldı, etrafına ince bir duvar örüldü.",
          "Öğretmedin. Vazgeçilmez olmak istedin ve bir süre öyle oldun; sonra yalnız oldun.",
        ],
      },
    ],
  },
  {
    id: "is-itibar",
    alan: "hayat",
    emoji: ["🎭", "🫥", "💬"],
    baslik: ["Ne İş Yapıyorsun?", "Masadaki Soru"],
    durum: [
      '{zaman} tanımadığın bir kalabalıkta biri sordu: "Ne iş yapıyorsun?" {meslek} olduğunu söylediğinde ortam bir an değişti.',
      "Bir aile toplantısında mesleğin konu oldu; {meslek} olmanı kimse tam olarak anlamıyor.",
      "Yeni tanıştığın biri {meslek} olduğunu öğrenince yüz ifadesi değişti ve sorular başladı.",
    ],
    secenekler: [
      {
        t: ["Olduğu gibi anlat", "Savunmaya geçme, anlat"],
        etiketler: ["durustluk", "sosyal"],
        fx: { mutluluk: [4, 10], arkadaslik: [2, 8], kariyer: [0, 4] },
        sonuc: [
          'Süslemeden anlattın: ne yaptığını, neden yaptığını. Birkaç kişi fikrini değiştirdi, biri "hiç böyle düşünmemiştim" dedi.',
          "Utanmadan konuştun ve merak samimi bir sohbete döndü. İşinden utanmamayı o akşam öğrendin.",
        ],
      },
      {
        t: ["Geçiştir, konuyu değiştir", "Muğlak bırak"],
        etiketler: ["kacinma", "hile"],
        fx: { mutluluk: [-8, -1], arkadaslik: [-2, 3] },
        sonuc: [
          '"İşte, bir şeyler" deyip geçtin. Kimse üstelemedi; sen de o akşam kendinle pek konuşmadın.',
          "Konuyu değiştirdin ve rahatladın. Ama {meslek} olmak bir sonraki masada da sorulacak.",
        ],
      },
      {
        t: ["Sert karşılık ver", "Hesap sorma sırası sende"],
        etiketler: ["cesaret", "bencil"],
        fx: { mutluluk: [1, 7], arkadaslik: [-8, 0], saglik: [-3, 0] },
        sonuc: [
          "Soruyu soranı köşeye sıkıştırdın. Masa sustu; haklıydın ama kimse bunu keyifle hatırlamadı.",
          "Sert cevap verdin ve tartışma büyüdü. O gece kimse mesleğini bir daha sormadı.",
        ],
      },
    ],
  },
  {
    id: "is-yontem",
    alan: "kariyer",
    emoji: ["🔄", "📚", "🧠"],
    baslik: ["Değişen Düzen", "Eskiyen Yöntem"],
    durum: [
      "{yer} işin yapılış biçimi değişiyor; {meslek} olarak bildiğin yöntem eskiyor.",
      "{kisi} yeni bir usul getirdi ve {meslek} olarak öğrendiğin her şeyi yeniden düşünmen gerekiyor.",
      "{zaman}, {is} artık başka türlü yapılıyor ve sen hâlâ eski yoldan gidiyorsun.",
    ],
    secenekler: [
      {
        t: ["Öğren, uyum sağla", "Sıfırdan başla"],
        etiketler: ["kesif", "calisma", "teknik"],
        fx: { kariyer: [5, 11], mutluluk: [1, 6], saglik: [-5, -1] },
        para: [-8000, -500],
        sonuc: [
          "Bu yaşta yeniden öğrenci olmak gururunu okşamadı ama altı ay sonra yaptığın {is} kimseninkine benzemiyordu.",
          "Yeni usulü söktün. {kazanc} ve seni eskimiş sayanlar sustu.",
        ],
      },
      {
        t: ["Diren, bildiğin gibi yap", "Eski usul daha iyi"],
        etiketler: ["guvenli", "tembellik"],
        fx: { kariyer: [-8, -2], mutluluk: [-4, 3], saglik: [1, 4] },
        sonuc: [
          "Kendi yönteminde kaldın. Bir süre işe yaradı; sonra işler sensiz akmaya başladı.",
          "Değişmedin. Ustalığın yerinde duruyor ama artık kimse o ustalığı istemiyor.",
        ],
      },
    ],
  },
  {
    id: "is-birakma",
    alan: "kariyer",
    emoji: ["🚪", "🌫️", "🧭"],
    baslik: ["Bırakma Düşüncesi", "Yorgunluk"],
    evreler: ["gencYetiskin", "yetiskin", "orta"],
    durum: [
      "{zaman} {meslek} olmaktan yorulduğunu fark ettin. {yer} artık nefes almak zor.",
      'Sabah {yer} gelirken içinden "başka bir şey yapsam" diye geçirdin ve bu ilk değil.',
      "{sorun} ve bu sefer içinden kavga etmek bile gelmedi.",
    ],
    secenekler: [
      {
        t: ["Devam et, geçer", "Dişini sık"],
        etiketler: ["calisma", "kacinma"],
        fx: { kariyer: [2, 6], mutluluk: [-8, -2], saglik: [-6, -1] },
        sonuc: [
          "Sustun ve devam ettin. Aylar geçti; yorgunluk gitmedi, sadece alıştın.",
          "Devam etmeyi seçtin. İşin yürüdü, içindeki o ses arada bir yine konuştu.",
        ],
      },
      {
        t: ["Ara ver, nefeslen", "İzin al"],
        etiketler: ["guvenli", "kesif"],
        fx: { saglik: [6, 12], mutluluk: [6, 12], kariyer: [-5, -1] },
        para: [-15000, -2000],
        sonuc: [
          "Bir süre uzaklaştın. Döndüğünde {meslek} olmak yine ağırdı ama artık taşınabilir bir ağırlıktı.",
          "Mola verdin ve dünya yıkılmadı. Bunu daha önce yapmadığına şaşırdın.",
        ],
      },
      {
        t: ["Bırak, başka bir yol dene", "İstifa et"],
        etiketler: ["risk", "cesaret"],
        fx: { kariyer: [-10, 4], mutluluk: [3, 12], saglik: [-4, 4] },
        para: [-25000, 5000],
        riskli: 0.4,
        kotu: {
          fx: { kariyer: [-14, -6], mutluluk: [-10, -3], saglik: [-6, -1] },
          para: [-30000, -8000],
          sonuc: [
            "Bıraktın ve yeni yol açılmadı. Aylarca ne eski işin ne yeni bir şey vardı; geri dönmek için çaldığın kapılar kapalıydı.",
            "Karar erken alınmıştı. {meslek} olmayı özlediğini ancak bıraktıktan sonra anladın.",
          ],
        },
        sonuc: [
          "Bıraktın. İlk aylar sarsıcıydı, sonra yerine oturdu; sabahları alarmdan önce uyanmaya başladın.",
          "Çıktın ve arkana bakmadın. Kazancın düştü, günlerin genişledi.",
        ],
      },
    ],
  },
];

const rast = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const arasi = ([lo, hi]: Aralik) => lo + Math.floor(Math.random() * (hi - lo + 1));

function etkiCoz(ar: EtkiAraligi): Etki {
  const fx: Etki = {};
  (Object.keys(ar) as StatAnahtar[]).forEach((k) => {
    fx[k] = arasi(ar[k]!);
  });
  return fx;
}

const TR_BUYUK: Record<string, string> = { i: "İ", ı: "I", ş: "Ş", ğ: "Ğ", ü: "Ü", ö: "Ö", ç: "Ç" };
const buyukHarf = (m: string) => (m ? (TR_BUYUK[m[0]] ?? m[0].toUpperCase()) + m.slice(1) : m);

/** Sahne başına yuvalar bir kez seçilir ki metin kendi içinde tutarlı olsun. */
function yuvaSeti(meslekAdi: string, s: IsSozlugu) {
  return {
    meslek: meslekAdi,
    yer: rast(s.yer),
    kisi: rast(s.kisi),
    is: rast(s.is),
    nesne: rast(s.nesne),
    sorun: rast(s.sorun),
    kazanc: rast(s.kazanc),
    zaman: rast(ZAMANLAR),
  };
}

function doldur(metin: string, yuva: Record<string, string>, bastaBuyuk = false) {
  let sonuc = metin.replace(/\{(\w+)\}/g, (tam, ad: string) => yuva[ad] ?? tam);
  // Yuvalar cümle ortasında da başında da kullanılıyor; nokta sonrası büyük harf.
  sonuc = sonuc.replace(
    /([.!?:]\s+)(\p{Ll})/gu,
    (_t, ayrac: string, harf: string) => ayrac + buyukHarf(harf),
  );
  return bastaBuyuk ? buyukHarf(sonuc) : sonuc;
}

let sayac = 0;

/**
 * Mesleğe özel bir iş sahnesi üretir. Meslek adı ve sözlüğü sahnenin
 * içine girer; aynı kalıp her meslekte farklı bir sahneye dönüşür.
 */
export function isSahnesiUret(meslek: Ozellik, evre: Evre, kacinilan: string[] = []): Olay | null {
  if (!meslekVarMi(meslek)) return null;
  const uygun = IS_KALIPLARI.filter((k) => !k.evreler || k.evreler.includes(evre));
  if (!uygun.length) return null;

  // Son kullanılan kalıpları ele; hepsi elenirse havuzun tamamına dön.
  const taze = uygun.filter((k) => !kacinilan.includes(`is-${k.id}`));
  const kalip = rast(taze.length ? taze : uygun);
  const sozluk = meslekSozlugu(meslek);
  const yuva = yuvaSeti(meslek.ad, sozluk);
  sayac += 1;

  const secenekler: Secenek[] = kalip.secenekler.map((sk) => {
    const s: Secenek = {
      t: doldur(rast(sk.t), yuva),
      etiketler: sk.etiketler,
      fx: etkiCoz(sk.fx),
      sonuc: doldur(rast(sk.sonuc), yuva),
    };
    if (sk.para) s.para = arasi(sk.para);
    if (sk.riskli) {
      s.riskli = sk.riskli;
      if (sk.kotu) {
        s.kotu = {
          fx: etkiCoz(sk.kotu.fx),
          sonuc: doldur(rast(sk.kotu.sonuc), yuva),
          ...(sk.kotu.para ? { para: arasi(sk.kotu.para) } : {}),
        };
      }
    }
    return s;
  });

  return {
    id: `is-${kalip.id}-${sayac}`,
    evreler: [evre],
    alan: kalip.alan,
    emoji: rast(kalip.emoji),
    baslik: `${rast(kalip.baslik)} · ${meslek.ad}`.slice(0, 60),
    metin: doldur(rast(kalip.durum), yuva, true),
    secenekler,
    uretilmis: true,
  };
}

/** İş sahnesinin hangi kalıptan geldiği — tekrar kontrolü için. */
export function isKalipId(olay: Olay): string | null {
  if (!olay.id.startsWith("is-")) return null;
  const p = olay.id.split("-");
  return p.length >= 3 ? `${p[0]}-${p[1]}-${p[2]}` : null;
}
