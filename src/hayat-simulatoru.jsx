import React, { useState } from "react";
import {
  Heart,
  Users,
  Briefcase,
  Activity,
  Smile,
  Coins,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

/* ---------- Renkler & Fontlar ---------- */
const C = {
  bg1: "#17122a",
  bg2: "#241a3d",
  card: "#2b2146",
  cardEdge: "#3a2e5c",
  cream: "#ece7f5",
  muted: "#9a8fb5",
  gold: "#f5b942",
  rose: "#f2739d",
  teal: "#4fd1c5",
  green: "#6ee7a0",
  sky: "#7da8ff",
};
const serif = "Georgia, 'Times New Roman', serif";
const sans = "system-ui, -apple-system, sans-serif";

/* ---------- Statlar ---------- */
const STATS = [
  { key: "saglik", label: "Sağlık", color: C.green, Icon: Activity },
  { key: "mutluluk", label: "Mutluluk", color: C.gold, Icon: Smile },
  { key: "ask", label: "Aşk", color: C.rose, Icon: Heart },
  { key: "arkadaslik", label: "Arkadaşlık", color: C.teal, Icon: Users },
  { key: "kariyer", label: "Kariyer", color: C.sky, Icon: Briefcase },
];

/* ---------- Modlar ---------- */
const MODES = [
  {
    key: "normal",
    ad: "Normal Hayat",
    emoji: "🌱",
    aciklama: "Dengeli bir başlangıç. Klasik bir hayat yolculuğu.",
    start: { saglik: 75, mutluluk: 70, ask: 20, arkadaslik: 60, kariyer: 20 },
    para: 2000,
  },
  {
    key: "zengin",
    ad: "Altın Kaşık",
    emoji: "💰",
    aciklama: "Zengin doğdun. Cebin dolu ama sevgi başka mesele.",
    start: { saglik: 80, mutluluk: 65, ask: 25, arkadaslik: 40, kariyer: 35 },
    para: 250000,
  },
  {
    key: "fakir",
    ad: "Zor Yol",
    emoji: "🥔",
    aciklama: "Elinde hiçbir şey yok. Her şeyi sen kazanacaksın.",
    start: { saglik: 60, mutluluk: 45, ask: 15, arkadaslik: 55, kariyer: 10 },
    para: 50,
  },
  {
    key: "romantik",
    ad: "Kalp Yolu",
    emoji: "💘",
    aciklama: "Aşk her köşede. Duygusal, çalkantılı bir hayat.",
    start: { saglik: 70, mutluluk: 70, ask: 45, arkadaslik: 65, kariyer: 20 },
    para: 3000,
  },
  {
    key: "kaos",
    ad: "Kaos Modu",
    emoji: "🌪️",
    aciklama: "Hiçbir kural yok. Her an her şey olabilir.",
    start: { saglik: 65, mutluluk: 60, ask: 30, arkadaslik: 50, kariyer: 25 },
    para: 5000,
  },
];

/* ---------- Karakter oluşturma seçenekleri ---------- */
const CINSIYETLER = [
  { key: "kadin", ad: "Kadın", emoji: "♀" },
  { key: "erkek", ad: "Erkek", emoji: "♂" },
  { key: "belirsiz", ad: "Belirtmek istemiyorum", emoji: "✦" },
];

const BASLANGICLAR = [
  {
    key: "bebek",
    ad: "Bebeklikten",
    yas: 0,
    emoji: "🍼",
    aciklama: "Her şeyi en baştan yaşa. Uzun ve dolambaçlı bir yolculuk.",
    fx: { saglik: 4, mutluluk: 3 },
  },
  {
    key: "cocuk",
    ad: "Çocukluktan",
    yas: 7,
    emoji: "🎒",
    aciklama: "İlk zil, ilk arkadaşlık, ilk kırgınlık.",
    fx: { arkadaslik: 3 },
  },
  {
    key: "genc",
    ad: "Gençlikten",
    yas: 16,
    emoji: "🛹",
    aciklama: "Kalbin hızlı atıyor, sınavlar kapıda, hayat aceleci.",
    fx: { kariyer: 6, arkadaslik: 5, mutluluk: -3 },
  },
];

const KOKENLER = [
  {
    key: "varlikli",
    ad: "Varlıklı aile",
    emoji: "🏛️",
    aciklama: "Kapılar senin için zaten aralık. Ama sevgi ayrı bir para birimi.",
    paraCarpan: 10,
    paraEk: 40000,
    fx: { kariyer: 10, saglik: 5, mutluluk: -4, arkadaslik: -6 },
    hikaye: "geniş ama sessiz bir evde",
  },
  {
    key: "orta",
    ad: "Orta halli",
    emoji: "🏡",
    aciklama: "Ne çok var ne çok yok. Ay sonu biraz sıkışık, gerisi yolunda.",
    paraCarpan: 1,
    paraEk: 0,
    fx: { mutluluk: 4, arkadaslik: 4 },
    hikaye: "kalabalık bir apartman dairesinde",
  },
  {
    key: "zor",
    ad: "Zor şartlar",
    emoji: "🔧",
    aciklama: "Her şeyi kendin kazanacaksın. Bu seni erken büyütür.",
    paraCarpan: 0.2,
    paraEk: 0,
    fx: { saglik: -6, mutluluk: -7, kariyer: -3, arkadaslik: 7 },
    hikaye: "sobayla ısınan iki odalı bir evde",
  },
  {
    key: "kimsesiz",
    ad: "Kimsesiz",
    emoji: "🕯️",
    aciklama: "Kimse yok. Sadece sen ve çok kalabalık bir dünya.",
    paraCarpan: 0.05,
    paraEk: 0,
    fx: { saglik: -8, mutluluk: -11, ask: -5, arkadaslik: -8, kariyer: 5 },
    hikaye: "yatakhanesi hep soğuk olan bir yurtta",
  },
];

const MESLEKLER = [
  {
    key: "doktor",
    ad: "Doktor",
    emoji: "🩺",
    aciklama: "İyileştirmek istiyorsun.",
    fx: { saglik: 5, kariyer: 4 },
  },
  {
    key: "sanatci",
    ad: "Sanatçı",
    emoji: "🎭",
    aciklama: "Anlatmadan duramıyorsun.",
    fx: { mutluluk: 6, kariyer: -2 },
  },
  {
    key: "muhendis",
    ad: "Mühendis",
    emoji: "📐",
    aciklama: "Her şeyi söküp takıyorsun.",
    fx: { kariyer: 6 },
  },
  {
    key: "girisimci",
    ad: "Girişimci",
    emoji: "🚀",
    aciklama: "Fırsat kokusu alıyorsun.",
    fx: { kariyer: 3, mutluluk: 2 },
  },
  {
    key: "sporcu",
    ad: "Sporcu",
    emoji: "🏅",
    aciklama: "Bedenin en iyi aletin.",
    fx: { saglik: 9, kariyer: 2 },
  },
  {
    key: "belirsiz",
    ad: "Belirsiz",
    emoji: "🌫️",
    aciklama: "Henüz karar vermedin. Belki de hiç vermezsin.",
    fx: { mutluluk: 3 },
  },
];

const KISILIKLER = [
  {
    key: "cesur",
    ad: "Cesur",
    emoji: "🦁",
    aciklama: "Korkuyu bilirsin ama durmazsın.",
    fx: { saglik: 3 },
  },
  {
    key: "utangac",
    ad: "Utangaç",
    emoji: "🌙",
    aciklama: "Kalabalıkta sesin kısılır.",
    fx: { arkadaslik: -5, mutluluk: 3 },
  },
  {
    key: "hirsli",
    ad: "Hırslı",
    emoji: "🔥",
    aciklama: "Yeterli diye bir şey yok.",
    fx: { kariyer: 6, mutluluk: -3 },
  },
  {
    key: "sadik",
    ad: "Sadık",
    emoji: "🪢",
    aciklama: "Verdiğin sözü taşırsın.",
    fx: { ask: 5, arkadaslik: 4 },
  },
  {
    key: "umursamaz",
    ad: "Umursamaz",
    emoji: "🫠",
    aciklama: "Omuz silkmek bir yetenektir.",
    fx: { mutluluk: 5, kariyer: -4 },
  },
  {
    key: "merhametli",
    ad: "Merhametli",
    emoji: "🤍",
    aciklama: "Başkasının derdi sende kalır.",
    fx: { arkadaslik: 6, mutluluk: 2 },
  },
  {
    key: "kurnaz",
    ad: "Kurnaz",
    emoji: "🦊",
    aciklama: "Kısa yolu hep sen bulursun.",
    fx: { kariyer: 4, arkadaslik: -3 },
  },
  {
    key: "durust",
    ad: "Dürüst",
    emoji: "⚖️",
    aciklama: "Yalan söylemek sana pahalıya gelir.",
    fx: { arkadaslik: 5, kariyer: -2 },
  },
];

/* ---------- İlişkiler için isim havuzları ---------- */
const ISIMLER = {
  kadin: [
    "Elif",
    "Deniz",
    "Zeynep",
    "Nur",
    "Selin",
    "Aslı",
    "Ceren",
    "Melis",
    "Bilge",
    "İrem",
    "Yasemin",
    "Duru",
  ],
  erkek: [
    "Kaan",
    "Mert",
    "Emre",
    "Tolga",
    "Barış",
    "Sinan",
    "Cem",
    "Onur",
    "Kerem",
    "Umut",
    "Arda",
    "Ediz",
  ],
};

/* ---------------------------------------------------------------
   ETİKET SİSTEMİ
   Her seçeneğe `etiketler` verilir. Kişilik ve meslek tabloları bu
   etiketlere bakarak ek stat/para etkisi ve ek anlatı cümlesi ekler.
   Yeni bir kişilik ya da meslek eklemek için sadece bu tablolara
   satır eklemek yeterli — olaylara dokunmaya gerek yok.

   Genel etiketler : cesaret, kacinma, risk, guvenli, sosyal, yalniz,
                     romantik, sadakat, calisma, tembellik, yardim,
                     bencil, durustluk, hile
   Meslek etiketleri: tip, sanat, teknik, ticaret, spor, kesif
----------------------------------------------------------------*/

const KISILIK_ETKI = {
  cesur: {
    cesaret: {
      fx: { saglik: 6, arkadaslik: 5, mutluluk: 4 },
      not: "Cesaretin işini kolaylaştırdı; sesin hiç titremedi.",
    },
    kacinma: {
      fx: { mutluluk: -6 },
      not: "Geri adım atmak sana hiç yakışmadı, o akşam kendine kızdın.",
    },
    risk: { fx: { mutluluk: 4 }, not: "Riskin verdiği o elektrik hoşuna gitti." },
    spor: { fx: { saglik: 3 }, not: "Bedenini zorlamak seni hiç korkutmadı." },
  },
  utangac: {
    cesaret: {
      fx: { saglik: -6, mutluluk: -4, arkadaslik: -3 },
      not: "Sesin çıkana kadar avuçların terledi; bedeli ağır oldu.",
    },
    sosyal: {
      fx: { arkadaslik: -4, mutluluk: -3 },
      not: "Kalabalığın ortasında kendini bir anda çok görünür hissettin.",
    },
    yalniz: {
      fx: { mutluluk: 6, saglik: 3 },
      not: "Kendi köşene çekilmek sana iyi geldi; sessizlik seni dinlendirdi.",
    },
    kacinma: { fx: { mutluluk: 4 }, not: "Kaçmak bu sefer utanç değil, rahatlama getirdi." },
    sanat: { fx: { mutluluk: 5 }, not: "Söyleyemediğin her şeyi işine döktün." },
  },
  hirsli: {
    calisma: {
      fx: { kariyer: 8, mutluluk: 3, saglik: -3 },
      not: "Çalışmak sana yorgunluk değil, tatmin veriyor.",
    },
    tembellik: {
      fx: { mutluluk: -7, kariyer: -3 },
      not: "Boş geçen her saat içinde bir suçluluk bıraktı.",
    },
    risk: {
      fx: { kariyer: 5 },
      paraCarpan: 1.25,
      not: "Hırsın seni tam zamanında masaya oturttu.",
    },
    bencil: { fx: { kariyer: 4, arkadaslik: -2 }, not: "Kendini önceye almakta hiç zorlanmadın." },
  },
  sadik: {
    sadakat: {
      fx: { ask: 8, arkadaslik: 7, mutluluk: 4 },
      not: "Sözünü tutmak sana her zamanki gibi kolay geldi.",
    },
    romantik: { fx: { ask: 6, mutluluk: 3 }, not: "Sevmeyi yarım yamalak yapmayı hiç bilmedin." },
    hile: {
      fx: { mutluluk: -8, ask: -5 },
      not: "Kendi kurallarını çiğnedin; aynaya bakmak günlerce zor geldi.",
    },
    yalniz: { fx: { mutluluk: -4 }, not: "Yalnız kalmak senin gibi biri için ceza gibiydi." },
  },
  umursamaz: {
    tembellik: {
      fx: { mutluluk: 8, saglik: 3 },
      not: "Hiçbir şey yapmamak sana hiç dokunmadı, aksine.",
    },
    calisma: { fx: { kariyer: -4, mutluluk: -3 }, not: "Bu kadar ciddiye almak seni bunalttı." },
    risk: {
      fx: { mutluluk: 5, saglik: -3 },
      not: "Sonucunu düşünmeden atladın; zaten hep öyle yaparsın.",
    },
    yardim: {
      fx: { arkadaslik: -4 },
      not: "Yardım ettin ama içten içe 'bana ne' diyen bir ses vardı.",
    },
  },
  merhametli: {
    yardim: {
      fx: { mutluluk: 9, arkadaslik: 7 },
      not: "Birine dokunmak seni her seferinde onarıyor.",
    },
    bencil: { fx: { mutluluk: -8 }, not: "Kendini öne almak sana günlerce ağırlık yaptı." },
    sosyal: {
      fx: { arkadaslik: 5, mutluluk: 3 },
      not: "İnsanlar yanında rahat ediyor, bunu sen de hissediyorsun.",
    },
    romantik: { fx: { ask: 5 }, not: "Sevgiyi vermekten hiç korkmadın." },
  },
  kurnaz: {
    hile: {
      fx: { kariyer: 6, mutluluk: 3 },
      paraCarpan: 1.35,
      not: "Kimsenin göremediği aralığı sen gördün.",
    },
    durustluk: {
      fx: { kariyer: -3, mutluluk: -2 },
      not: "Dürüst oynamak sana pahalıya patladı, farkındasın.",
    },
    risk: {
      fx: { kariyer: 3 },
      paraCarpan: 1.2,
      not: "Kaçış planını daha ilk adımda hazırlamıştın.",
    },
    bencil: {
      fx: { kariyer: 4, arkadaslik: -3 },
      not: "Kimse fark etmedi; sen zaten buna güveniyordun.",
    },
  },
  durust: {
    durustluk: {
      fx: { arkadaslik: 8, mutluluk: 6 },
      not: "Doğruyu söylemek seni her zamanki gibi hafifletti.",
    },
    hile: {
      fx: { mutluluk: -9, arkadaslik: -4 },
      not: "Yalan söylerken sesin bile sana yabancı geldi.",
    },
    sadakat: {
      fx: { arkadaslik: 5, ask: 3 },
      not: "Arkasında durdun, çünkü başka türlüsünü beceremezsin.",
    },
    yardim: {
      fx: { mutluluk: 4, arkadaslik: 3 },
      not: "Karşılık beklemeden yaptın; zaten hep öyle yapıyorsun.",
    },
  },
};

const MESLEK_ETKI = {
  doktor: {
    tip: {
      fx: { kariyer: 10, saglik: 4, mutluluk: 4 },
      not: "Tıbba olan eğilimin tam da burada işe yaradı.",
    },
    calisma: { fx: { kariyer: 4, saglik: -2 }, not: "Uzun nöbetlere yatkın bir doğan var." },
    yardim: { fx: { mutluluk: 4, kariyer: 3 }, not: "İnsana dokunan işler seni besliyor." },
  },
  sanatci: {
    sanat: {
      fx: { kariyer: 10, mutluluk: 8 },
      not: "Yaratma isteğin bu anı senin lehine çevirdi.",
    },
    risk: { fx: { mutluluk: 4 }, not: "Belirsizlikle yaşamaya zaten alışkınsın." },
    calisma: {
      fx: { kariyer: -2, mutluluk: -3 },
      not: "Düzenli mesai senin ruhunu hep biraz eziyor.",
    },
  },
  muhendis: {
    teknik: {
      fx: { kariyer: 10, mutluluk: 5 },
      paraCarpan: 1.2,
      not: "Problemi parçalarına ayırdın ve çözdün.",
    },
    calisma: { fx: { kariyer: 5 }, not: "Sistemli çalışmak senin doğal hızın." },
    risk: { fx: { kariyer: -2 }, not: "Hesaplanamayan şeyler seni huzursuz ediyor." },
  },
  girisimci: {
    ticaret: {
      fx: { kariyer: 8, mutluluk: 4 },
      paraCarpan: 1.5,
      not: "Fırsatın kokusunu herkesten önce aldın.",
    },
    risk: {
      fx: { kariyer: 5 },
      paraCarpan: 1.3,
      not: "Riski bir tehdit değil, bir fiyat olarak görüyorsun.",
    },
    guvenli: { fx: { mutluluk: -4 }, not: "Garanti olan her şey sana biraz dar geliyor." },
  },
  sporcu: {
    spor: {
      fx: { saglik: 10, kariyer: 8, mutluluk: 5 },
      not: "Bedenin ne yapacağını biliyordu, düşünmene gerek kalmadı.",
    },
    cesaret: { fx: { saglik: 5, arkadaslik: 3 }, not: "Fiziğin seni bu anda korudu." },
    tembellik: {
      fx: { saglik: -5 },
      not: "Antrenmansız geçen günler hemen bedeninde hissediliyor.",
    },
  },
  belirsiz: {
    kesif: {
      fx: { mutluluk: 7, kariyer: 4 },
      not: "Ne olacağını bilmediğin şeyler seni hâlâ heyecanlandırıyor.",
    },
    guvenli: { fx: { mutluluk: -3 }, not: "Yolun belli olması sana huzurdan çok sıkıntı veriyor." },
  },
};

/* Mesleğin "imza" etiketleri: bir seçenekte birden çok meslek etkisi
   tetiklenirse anlatıda önce bunlar anılır. */
const MESLEK_IMZA_ETIKETLERI = ["tip", "sanat", "teknik", "ticaret", "spor", "kesif"];

/* ---------- Kritik stat seviyeleri: anlatı tonu ----------
   Stat dibe vurduğunda ya da tavana yaklaştığında anlatının tonu değişir.
   Aynı cümle sürekli tekrarlanmasın diye her kural için birkaç varyant var. */
const TON_KURALLARI = [
  {
    test: (s) => s.saglik <= 18,
    cumleler: [
      "Bedenin bu günlerde her şeye itiraz ediyor; en küçük çaba bile pahalıya geliyor.",
      "Ayağa kalkarken tutunacak bir yer aramaya başladın ve bunu kimseye söylemedin.",
      "Nefesin eskisi kadar yetmiyor; her şeyi biraz daha yavaş yapıyorsun.",
    ],
  },
  {
    test: (s) => s.mutluluk <= 18,
    cumleler: [
      "Her şey kalın bir camın ardından oluyor gibi; sevinç bile sana uzaktan el sallıyor.",
      "Bu aralar sabahları yataktan çıkmak, günün geri kalanından daha zor.",
      "İçindeki ağırlık her şeyi gölgeliyor; güzel şeyler bile sana geç ulaşıyor.",
    ],
  },
  {
    test: (s) => s.arkadaslik <= 15,
    cumleler: [
      "Telefonun günlerdir sessiz. Ne arayan var, ne arayacağın.",
      "Bunu anlatabileceğin birini düşündün ve listede kimse çıkmadı.",
    ],
  },
  {
    test: (s) => s.ask <= 12,
    cumleler: [
      "Yatağın bir yanı hep soğuk kalıyor ve buna alıştığını fark etmek daha da ağır.",
      "Eve döndüğünde ışığı açan kimse olmuyor; bunu artık düşünmemeye çalışıyorsun.",
    ],
  },
  {
    test: (s) => s.mutluluk >= 88,
    cumleler: [
      "Bu aralar içinde bir hafiflik var; en sıradan gün bile sana bir şey bırakıyor.",
      "Uzun zamandır kendini bu kadar yerinde hissetmemiştin.",
      "Bugünlerde gülmek için pek sebep aramıyorsun, kendiliğinden geliyor.",
    ],
  },
];

/* ---------------------------------------------------------------
   OLAYLAR
   cat      : ask | arkadaslik | kariyer | para | saglik | hayat
   stages   : bebek | cocuk | genc | gencYetiskin | yetiskin | orta | yasli | hepsi
   gerek    : { bayrak: [...], yokBayrak: [...], iliski: "sevgili", yokIliski: "es" }
   tekSefer : bir kez görülür (zincir olayları için)
   Metinlerde {sevgili} {es} {partner} {arkadas} {rakip} {cocuk} {kopek}
   {ilkAsk} {isim} {birlikteYil} yer tutucuları kullanılabilir.
----------------------------------------------------------------*/
const EVENTS = [
  /* ================= BEBEKLİK ================= */
  {
    id: "b1",
    stages: ["bebek"],
    cat: "hayat",
    emoji: "🍼",
    baslik: "İlk Kelime",
    metin: "Herkes seni izliyor. Ağzından çıkacak ilk kelimeyi bekliyorlar.",
    secenekler: [
      {
        t: "Anneni çağır",
        etiketler: ["sosyal", "romantik"],
        fx: { mutluluk: 10, arkadaslik: 6 },
        sonuc:
          "İki heceyi birden söyledin ve odadaki herkes bir anda susup sana döndü. Annen elindeki bardağı bırakıp yanına çöktü, gözleri doldu. O gün evde kimse başka bir şey konuşmadı.",
        onemli: true,
      },
      {
        t: "Anlamsız bir ses çıkar",
        etiketler: ["kesif"],
        fx: { mutluluk: 6, kariyer: 3 },
        sonuc:
          "Kimsenin anlamadığı, uzun ve kararlı bir ses çıkardın. Herkes güldü ama sen ciddiydin — sanki söylemek istediğin çok daha karmaşık bir şey vardı. Bu inatçı ifade tarzı seninle kalacak.",
      },
      {
        t: "Sus, izlemeye devam et",
        etiketler: ["yalniz", "kacinma"],
        fx: { mutluluk: 2, kariyer: 4 },
        sonuc:
          "Konuşmadın. Bunun yerine herkesin yüzünü tek tek inceledin. Sessizliğin ailede bir espri konusu oldu ama gözlemci tarafın işte o gün başladı.",
      },
    ],
  },
  {
    id: "b2",
    stages: ["bebek"],
    cat: "saglik",
    emoji: "🌡️",
    baslik: "Gece Ateşi",
    metin: "Gecenin bir yarısı ateşin çıktı. Evde telaş var.",
    secenekler: [
      {
        t: "Hastaneye götürülürsün",
        etiketler: ["guvenli", "tip"],
        fx: { saglik: 8, mutluluk: -3 },
        para: -1500,
        sonuc:
          "Acil servisin beyaz ışığı altında saatlerce beklendi. Sabaha karşı ateşin düştü ve doktorun 'geçti' demesiyle odadaki herkes aynı anda nefes verdi. O geceyi hatırlamayacaksın ama sana yıllarca anlatacaklar.",
      },
      {
        t: "Evde ıslak bezle geçirilir",
        etiketler: ["risk", "kacinma"],
        fx: { saglik: -8, mutluluk: 3 },
        sonuc:
          "Sabaha kadar alnında ıslak bir bez, yanında uyumayan biri. Ateş sabah düştü ama vücudunda küçük bir yorgunluk kaldı — yıllar sonra bile kışları çabuk hastalanacaksın.",
      },
    ],
  },
  {
    id: "b3",
    stages: ["bebek"],
    cat: "arkadaslik",
    emoji: "🧸",
    baslik: "Oyuncak Kavgası",
    metin: "Parkta bir çocuk elindeki ayıyı çekiştiriyor. İkiniz de bırakmıyorsunuz.",
    secenekler: [
      {
        t: "Bırakma, çek",
        etiketler: ["cesaret", "bencil"],
        fx: { arkadaslik: -4, mutluluk: 5, saglik: -2 },
        sonuc:
          "Ayıyı kaptığın gibi göğsüne bastırdın. Diğer çocuk ağladı, anneler birbirine mahcup gülümsedi. Kazandın ama parkta bir süre kimse yanına gelmedi.",
      },
      {
        t: "Ver gitsin",
        etiketler: ["yardim"],
        fx: { arkadaslik: 8, mutluluk: 3 },
        sonuc:
          "Elini açtın ve ayı öbür tarafa geçti. Çocuk şaşkınlıkla sana baktı, sonra yanına oturup kumdan bir şey yapmaya başladınız. O öğleden sonra ilk kez birlikte oynamayı öğrendin.",
      },
    ],
  },
  {
    id: "b4",
    stages: ["bebek"],
    cat: "hayat",
    emoji: "👣",
    baslik: "İlk Adım",
    metin: "Sehpaya tutunmuş, karşıda seni bekleyen kollara bakıyorsun. Arada üç adım var.",
    secenekler: [
      {
        t: "Bırak ve yürü",
        etiketler: ["cesaret", "spor"],
        fx: { saglik: 6, mutluluk: 10, kariyer: 3 },
        sonuc:
          "Elini bıraktın. İki adım attın, üçüncüde düştün ama yere değmeden yakalandın. Evde o gün alkış vardı; ilk kez bir şeye kendi başına doğru gittin.",
        onemli: true,
      },
      {
        t: "Emekleyerek git",
        etiketler: ["guvenli"],
        fx: { saglik: 3, mutluluk: 4 },
        sonuc:
          "Yürümek yerine bildiğin yolu seçtin ve saniyeler içinde karşıya vardın. Kimse üzülmedi, herkes güldü. Acele etmeyen bir çocuk oldun.",
      },
    ],
  },

  /* ================= ÇOCUKLUK ================= */
  {
    id: "c1",
    stages: ["cocuk"],
    cat: "arkadaslik",
    emoji: "🎒",
    baslik: "İlk Gün",
    metin: "Okulda tek başına oturuyorsun. Yan masadaki çocuk sana gülümsüyor.",
    secenekler: [
      {
        t: "Selam ver, arkadaş ol",
        etiketler: ["sosyal", "cesaret"],
        fx: { arkadaslik: 12, mutluluk: 8 },
        sonuc:
          "Adını söyledin, o da söyledi ve daha teneffüs bitmeden sıraları birleştirmiştiniz. {arkadas} o günden sonra çantasında hep senin için de bir şeyler taşıdı. Yıllar sonra bile o ilk 'selam'ı hatırlayacaksın.",
        iliski: { tur: "arkadas" },
        onemli: true,
      },
      {
        t: "Utanıp başını çevir",
        etiketler: ["kacinma", "yalniz"],
        fx: { arkadaslik: -5, mutluluk: -4 },
        sonuc:
          "Defterine bakıyormuş gibi yaptın ve o gülümseme kayboldu. Öğle arasında herkesin bir masası vardı, senin yoktu. O yıl teneffüsler çok uzun geçti.",
      },
    ],
  },
  {
    id: "c2",
    stages: ["cocuk"],
    cat: "hayat",
    emoji: "🐶",
    baslik: "Sokak Köpeği",
    metin: "Yağmurda titreyen bir yavru köpek buldun. Gözleri sana bakıyor.",
    secenekler: [
      {
        t: "Eve götür, sahiplen",
        etiketler: ["yardim", "cesaret"],
        fx: { mutluluk: 15, saglik: -3, arkadaslik: 4 },
        para: -500,
        sonuc:
          "Montunun içine sakladın, çamurlu ayak izleriyle eve girdin. Annen önce kızdı, sonra bir havlu getirdi. {kopek} o geceden itibaren senin yatağının ayak ucunda uyudu ve çocukluğunun en sadık tanığı oldu.",
        iliski: { tur: "kopek" },
        bayrak: ["kopekVar"],
        onemli: true,
      },
      {
        t: "Mamanı ver, bırak",
        etiketler: ["yardim", "guvenli"],
        fx: { mutluluk: 4, arkadaslik: 3 },
        sonuc:
          "Çantandaki sandviçi parçalayıp önüne koydun ve yağmur altında yemesini izledin. Sonra kalkıp yürüdün, arkana bakmamak için kendini zorladın. İçin rahat ama kalbin biraz buruk kaldı.",
      },
    ],
  },
  {
    id: "c3",
    stages: ["cocuk"],
    cat: "kariyer",
    emoji: "🎨",
    baslik: "Gizli Yetenek",
    metin: "Öğretmen çizdiğin resmi tüm sınıfa gösterdi: 'Bu çocukta iş var!'",
    secenekler: [
      {
        t: "Sanata sarıl",
        etiketler: ["sanat", "kesif"],
        fx: { mutluluk: 10, kariyer: 8 },
        sonuc:
          "O günden sonra defterlerinin arkası boş kalmadı. Kimse istemeden çizdin, kimse görmeden yırttın, sonra yeniden çizdin. İçindeki o kıvılcım yıllarca peşini bırakmayacak.",
        bayrak: ["sanatKivilcimi"],
        onemli: true,
      },
      {
        t: "Utan, saklan",
        etiketler: ["kacinma", "yalniz"],
        fx: { mutluluk: -2, kariyer: 2 },
        sonuc:
          "Kulaklarına kadar kızardın ve resmi öğretmenin elinden alıp çantana tıktın. Ama o akşam eve gidince aynı resmi bir kez daha çizdin. Övgüden kaçtın, işten kaçamadın.",
      },
    ],
  },
  {
    id: "c4",
    stages: ["cocuk"],
    cat: "saglik",
    emoji: "😠",
    baslik: "Zorba",
    metin: "Sınıfın kabadayısı harçlığını istiyor. Koridorda herkes izliyor.",
    secenekler: [
      {
        t: "Karşı dur",
        etiketler: ["cesaret", "spor"],
        fx: { saglik: -8, mutluluk: 6, arkadaslik: 8 },
        sonuc:
          "Dimdik durdun ve 'hayır' dedin. Bir yumruk yedin, dudağın patladı ama o gün bir daha kimse harçlık istemedi.",
        sonucKisilik: {
          cesur:
            "Sen daha o 'hayır' derken herkes sonunu tahmin etmişti. Bir tokat yedin ama gözünü bile kırpmadın; koridordaki çocuklar o günü yıllarca anlattı. Bir daha kimse sana bulaşmaya cesaret edemedi.",
          utangac:
            "Sesin çıkana kadar avuçların terledi, kelimeler boğazında düğümlendi. Sonunda 'hayır' dediğinde sesin çatladı ama söylemiştin işte. Yediğin darbe canını yaktı, yine de o gün kendinle ilgili yeni bir şey öğrendin.",
          kurnaz:
            "'Hayır' derken bir yandan da gözünle koridorun ucundaki nöbetçi öğretmeni arıyordun. Zamanlaman kusursuzdu; olay büyümeden bitti ve kahraman sen oldun.",
        },
        iliski: { tur: "rakip" },
        bayrak: ["rakipVar"],
        onemli: true,
      },
      {
        t: "Harçlığı ver",
        etiketler: ["kacinma", "guvenli"],
        fx: { mutluluk: -8, arkadaslik: -3 },
        para: -20,
        sonuc:
          "Cebindeki buruşuk parayı çıkarıp uzattın, gözlerini yerden kaldırmadın. O gün öğle yemeği yemedin ve kimseye anlatmadın. İçindeki o küçük çatlak uzun süre kapanmadı.",
      },
      {
        t: "Öğretmene söyle",
        etiketler: ["durustluk"],
        fx: { arkadaslik: -4, mutluluk: 4 },
        sonuc:
          "Ders bitiminde öğretmenin masasına gidip her şeyi anlattın. Mesele iki günde çözüldü, harçlığın da geri geldi. Ama bazı çocuklar arkandan 'ispiyoncu' dedi ve bu etiket bir yıl üstünde kaldı.",
      },
    ],
  },
  {
    id: "c5",
    stages: ["cocuk"],
    cat: "para",
    emoji: "🪙",
    baslik: "Kumbara",
    metin: "Aylardır biriktirdiğin kumbara doldu. Camekânda bir bisiklet var.",
    secenekler: [
      {
        t: "Bisikleti al",
        etiketler: ["kesif", "spor"],
        fx: { mutluluk: 12, saglik: 6, arkadaslik: 4 },
        para: -900,
        sonuc:
          "Kumbarayı bozup bozuk paraları tezgâha döktün; kasiyer sayarken sabırla bekledin. O yaz mahalledeki her sokağı, her kestirmeyi öğrendin. Özgürlüğün iki tekerlek olduğunu ilk kez anladın.",
      },
      {
        t: "Biriktirmeye devam et",
        etiketler: ["guvenli", "calisma"],
        fx: { kariyer: 6, mutluluk: -3 },
        para: 600,
        sonuc:
          "Kumbarayı rafa geri koydun ve içine bir madeni para daha attın. Arkadaşların bisikletle geçerken sen pencereden izledin. Sabretmeyi öğrendin ama o yazı hep eksik hatırlayacaksın.",
      },
    ],
  },
  {
    id: "c6",
    stages: ["cocuk"],
    cat: "hayat",
    emoji: "🪟",
    baslik: "Kırılan Cam",
    metin: "Attığın top komşunun camını indirdi. Kimse görmedi.",
    secenekler: [
      {
        t: "Kapıyı çal, itiraf et",
        etiketler: ["durustluk", "cesaret"],
        fx: { mutluluk: 6, arkadaslik: 6, kariyer: 2 },
        para: -300,
        sonuc:
          "Kapıyı çaldın ve titrek bir sesle 'ben yaptım' dedin. Komşu önce kaşlarını çattı, sonra omzuna vurup içeri çay içmeye çağırdı. Camın parası harçlığından kesildi ama o gün mahallede adın temiz kaldı.",
      },
      {
        t: "Kaç ve sus",
        etiketler: ["hile", "kacinma"],
        fx: { mutluluk: -5, arkadaslik: -2 },
        sonuc:
          "Topu kaptığın gibi eve koştun ve akşama kadar pencereden dışarı bakmadın. Kimse seni bulmadı, kimse bir şey sormadı. Ama o camın önünden her geçişinde adımların hızlandı.",
      },
    ],
  },

  /* ================= GENÇLİK ================= */
  {
    id: "g1",
    stages: ["genc"],
    cat: "ask",
    emoji: "💌",
    baslik: "İlk Aşk",
    metin: "Kalbin sınıftaki birine kayıyor. Bugün koridorda yalnız yakaladın.",
    secenekler: [
      {
        t: "İtiraf et",
        etiketler: ["cesaret", "romantik"],
        fx: { ask: 18, mutluluk: 10, saglik: -2 },
        sonuc:
          "Kelimeler ağzından döküldüğünde kulaklarında kendi kalbini duyuyordun. {sevgili} birkaç saniye sustu — o saniyeler bir ömür gibiydi — sonra gülümsedi. O gün okuldan çıkarken yerden yürümüyordun.",
        sonucKisilik: {
          utangac:
            "Cümlenin yarısında sesin kaçtı, kalanını neredeyse fısıldadın. {sevgili} eğilip 'ne dedin?' diye sorunca her şeyi baştan söylemek zorunda kaldın — ve işte o ikinci sefer gerçekten cesaretti. Karşılık aldığında bacakların titriyordu.",
          cesur:
            "Hiç dolandırmadan söyledin, gözünü de kaçırmadın. {sevgili} bu kadar net bir şeye hazırlıklı değildi ve gülmeye başladı — iyi anlamda. O günden sonra herkes sizi birlikte görmeye alıştı.",
        },
        iliski: { tur: "sevgili", ilkAsk: true },
        bayrak: ["ilkAskYasandi"],
        onemli: true,
      },
      {
        t: "Not yaz, gizli bırak",
        etiketler: ["romantik", "kacinma", "sanat"],
        fx: { ask: 8, mutluluk: 4 },
        sonuc:
          "Defterinden kopardığın kâğıda üç cümle yazdın, sonra ikisini karaladın. Not haftalarca sınıfta konuşuldu, herkes birbirinden şüphelendi. Kimse senden şüphelenmedi ve bu hem rahatlattı hem de acıttı.",
        bayrak: ["gizliNot"],
      },
      {
        t: "Cesaret edemedin",
        etiketler: ["kacinma", "yalniz"],
        fx: { ask: -3, mutluluk: -6 },
        sonuc:
          "Ağzını açtın ve 'zil çalmak üzere' dedin. Sonra dönüp yürüdün, koridorun sonuna kadar arkana bakmadın. O cümleyi yıllarca kafanda tekrar tekrar düzelttin.",
        bayrak: ["kacirilanAsk"],
      },
    ],
  },
  {
    id: "g2",
    stages: ["genc"],
    cat: "kariyer",
    emoji: "📚",
    baslik: "Sınav Baskısı",
    metin: "Üniversite sınavına aylar var. Ailen sürekli 'çalış' diyor, sen sürekli yoruluyorsun.",
    secenekler: [
      {
        t: "Gece gündüz çalış",
        etiketler: ["calisma", "teknik"],
        fx: { kariyer: 15, saglik: -10, mutluluk: -6 },
        sonuc:
          "Masanın üstündeki lamba her gece üçe kadar yandı. Gözlerin sulandı, omzun tutuldu, sabahları zor kalktın. Sonuç geldiğinde ailen ağladı — sen ise sadece uyumak istedin.",
        onemli: true,
      },
      {
        t: "Dengeli git",
        etiketler: ["guvenli"],
        fx: { kariyer: 8, mutluluk: 5, saglik: 2 },
        sonuc:
          "Bir program yaptın ve büyük ölçüde uydun. Hafta sonları kendine birkaç saat ayırdın, bu da seni ayakta tuttu. Ne muhteşem ne kötü bir sonuç aldın ama kimseye borçlu kalmadın.",
      },
      {
        t: "Boş ver, takıl",
        etiketler: ["tembellik", "sosyal"],
        fx: { kariyer: -8, mutluluk: 9, arkadaslik: 7 },
        sonuc:
          "Kitapları kapattın ve o yazı sokakta geçirdin. Sahilde geç saatlere kadar konuşulan geceler, ucuz dondurmalar, sonu gelmeyen kahkahalar. Sınav kâğıdın yarım kaldı ama o anılar hiç eskimedi.",
      },
    ],
  },
  {
    id: "g3",
    stages: ["genc"],
    cat: "arkadaslik",
    emoji: "🎉",
    baslik: "Gece Partisi",
    metin: "Arkadaşların gizlice partiye çağırdı. Ailen duysa asla izin vermez.",
    secenekler: [
      {
        t: "Gizlice git",
        etiketler: ["risk", "sosyal", "hile"],
        fx: { arkadaslik: 12, mutluluk: 10, saglik: -4 },
        sonuc:
          "Pencereden çıktın, saat dörtte aynı pencereden girdin. O gece çalan şarkıyı yıllar sonra duyduğunda hâlâ aynı yere gideceksin. Yakalanmadın — bu sefer.",
      },
      {
        t: "Evde kal",
        etiketler: ["guvenli", "yalniz"],
        fx: { arkadaslik: -5, kariyer: 5, mutluluk: -2 },
        sonuc:
          "Telefonu sessize aldın ve odanda kaldın. Sabah gruba düşen fotoğraflarda herkes vardı, sen yoktun. Doğru olanı yaptığını biliyorsun ama bu bilgi o sabah pek işe yaramadı.",
      },
    ],
  },
  {
    id: "g4",
    stages: ["genc"],
    cat: "para",
    emoji: "📱",
    baslik: "Viral Oldun",
    metin: "Paylaştığın bir video bir gecede patladı. Sabah uyandığında binlerce bildirim var.",
    secenekler: [
      {
        t: "İçerik üretmeye başla",
        etiketler: ["ticaret", "sanat", "risk"],
        fx: { kariyer: 10, mutluluk: 8, saglik: -3 },
        para: 4000,
        sonuc:
          "Telefonu elinden bırakmadığın üç ay geçti. İlk reklam teklifi geldiğinde ne yapacağını bilemedin, sonra kabul ettin. Odanın köşesi bir stüdyoya dönüştü ve hayatının merkezi kaymaya başladı.",
        bayrak: ["icerikUretici"],
        onemli: true,
      },
      {
        t: "Hesabı kapat",
        etiketler: ["kacinma", "yalniz"],
        fx: { mutluluk: 5, saglik: 4, kariyer: -3 },
        sonuc:
          "Yorumları okumak bir noktadan sonra dayanılmaz oldu ve hesabı sildin. İlk hafta elin boşluğa gitti, ikinci hafta rahatladın. Sadeliği seçtin, ama 'ya devam etseydim' sorusu ara ara ziyarete geliyor.",
      },
    ],
  },
  {
    id: "g5",
    stages: ["genc"],
    cat: "arkadaslik",
    emoji: "🗡️",
    baslik: "İhanet",
    metin: "En yakın arkadaşın, sadece ona anlattığın şeyi herkese anlatmış.",
    secenekler: [
      {
        t: "Yüzleş",
        etiketler: ["cesaret", "durustluk"],
        fx: { arkadaslik: -6, mutluluk: 5 },
        sonuc:
          "Okulun arka bahçesinde konuştunuz, sonra bağırdınız. Söylenmemesi gereken birkaç şey de söylendi. Arkadaşlığınız o gün çatladı ama en azından ikiniz de neyin ne olduğunu biliyordunuz.",
      },
      {
        t: "Affet",
        etiketler: ["yardim", "sadakat"],
        fx: { arkadaslik: 7, mutluluk: -4 },
        sonuc:
          "'Boş ver' dedin ve konuyu kapattın. {arkadas} rahatladı, sen rahatlamadın. Aranızdaki şey devam etti ama sen artık ona her şeyi anlatmıyorsun.",
      },
      {
        t: "Sessizce uzaklaş",
        etiketler: ["yalniz", "kacinma"],
        fx: { arkadaslik: -8, mutluluk: 2, kariyer: 4 },
        sonuc:
          "Hiçbir şey demedin. Mesajlara geç dönmeye, çıkışta beklememeye başladın. Birkaç ay içinde ortadan sessizce silindin ve kimse tam olarak ne olduğunu anlamadı.",
      },
    ],
  },
  {
    id: "g6",
    stages: ["genc"],
    cat: "kariyer",
    emoji: "🥇",
    baslik: "Yarışma",
    metin: "Okullar arası yarışmada finaldesin. Karşındaki, sana yıllardır rakip biri.",
    secenekler: [
      {
        t: "Sonuna kadar yarış",
        etiketler: ["cesaret", "calisma", "spor"],
        fx: { kariyer: 12, saglik: -4, mutluluk: 6 },
        sonuc:
          "Son ana kadar bırakmadın; nefesin bitti ama sen bitmedin. Kürsüde {rakip} ile yan yana durdunuz ve el sıkışırken ikiniz de gülümsemediniz. O günden sonra birbirinizi hep izlediniz.",
        iliski: { tur: "rakip" },
        bayrak: ["rakipVar"],
        onemli: true,
      },
      {
        t: "Kurallarla oyna",
        etiketler: ["hile", "bencil"],
        fx: { kariyer: 9, arkadaslik: -8, mutluluk: 2 },
        para: 1500,
        sonuc:
          "Kimsenin okumadığı bir maddeyi sen okudun ve itiraz ettin. Kupa senin oldu, alkış biraz cılızdı. Kazanmanın tadı beklediğin gibi çıkmadı ama kazandın işte.",
        iliski: { tur: "rakip" },
        bayrak: ["rakipVar"],
      },
      {
        t: "Çekil, sahne onun olsun",
        etiketler: ["kacinma", "yardim"],
        fx: { kariyer: -6, arkadaslik: 8, mutluluk: 3 },
        sonuc:
          "Sıra sana gelmeden adını geri çektin. Kimse nedenini anlamadı, sen de açıklamadın. Kürsüdeki alkışı izlerken içinde hem huzur hem küçük bir sızı vardı.",
      },
    ],
  },
  {
    id: "g7",
    stages: ["genc"],
    cat: "saglik",
    emoji: "🚬",
    baslik: "Merak",
    metin:
      "Bahçenin arkasında kalabalık bir grup var. Biri sana bir şey uzatıyor: 'Sadece bir kere.'",
    secenekler: [
      {
        t: "Dene",
        etiketler: ["risk", "sosyal"],
        fx: { saglik: -10, arkadaslik: 6, mutluluk: 3 },
        sonuc:
          "Öksürdün, gözlerin sulandı, herkes güldü ve sen de güldün. O gün gruba dahil oldun. Bir kerelik olan şey birkaç yıl sürdü ve ciğerlerin bunu unutmadı.",
        bayrak: ["kotuAliskanlik"],
      },
      {
        t: "Reddet",
        etiketler: ["durustluk", "guvenli", "spor"],
        fx: { saglik: 6, arkadaslik: -4, mutluluk: 2 },
        sonuc:
          "'İstemem' deyip geri çekildin. Birkaç kişi kaşını kaldırdı, biri arkandan bir şey söyledi. Duvarın öbür tarafında yalnız kaldın ama nefesin temiz kaldı.",
      },
    ],
  },
  {
    id: "g8",
    stages: ["genc"],
    cat: "hayat",
    emoji: "🎒",
    baslik: "Şehirden Ayrılmak",
    metin: "Okul için başka bir şehre gitme ihtimali var. Herkesin bir fikri var, seninki hariç.",
    secenekler: [
      {
        t: "Git, yeni bir şehir kur",
        etiketler: ["kesif", "cesaret", "risk"],
        fx: { kariyer: 10, arkadaslik: -6, mutluluk: 6 },
        para: -3000,
        sonuc:
          "Otobüs kalkarken pencereden el salladın ve gözyaşını kimseye göstermedin. İlk aylar zor geçti — yemek yabancı, oda soğuk, telefon sürekli sessizdi. Ama o şehirde kendi kararlarını verebilen biri oldun.",
        bayrak: ["sehirDegistirdi"],
        onemli: true,
      },
      {
        t: "Kal, tanıdık olanı seç",
        etiketler: ["guvenli", "sadakat"],
        fx: { arkadaslik: 8, mutluluk: 4, kariyer: -5 },
        sonuc:
          "Formu doldurmadın ve kimseye söylemeden konuyu kapattın. Aynı sokaklar, aynı yüzler, aynı çay bahçesi. Huzurluydun ama bazen otobüs terminalinin önünden geçerken içinde bir şey kımıldadı.",
      },
    ],
  },

  /* ================= GENÇ YETİŞKİNLİK ================= */
  {
    id: "y1",
    stages: ["gencYetiskin"],
    cat: "kariyer",
    emoji: "💼",
    baslik: "İş Teklifi",
    metin: "Elinde iki zarf var: güvenli bir maaş, ya da riskli ama tutkulu bir iş.",
    secenekler: [
      {
        t: "Güvenli yolu seç",
        etiketler: ["guvenli", "calisma"],
        fx: { kariyer: 10, mutluluk: -3, saglik: 2 },
        para: 25000,
        sonuc:
          "Sözleşmeyi imzaladın, maaş her ayın beşinde yattı. Hayatın öngörülebilir, faturaların ödenmiş, hafta sonların boş. Bazı akşamlar bunun tam olarak istediğin şey olup olmadığını düşünüyorsun.",
      },
      {
        t: "Tutkunun peşinden git",
        etiketler: ["risk", "kesif", "sanat"],
        fx: { kariyer: 6, mutluluk: 13, saglik: -4 },
        para: 5000,
        sonuc:
          "Az para, uzun saatler, belirsiz bir gelecek. Ama sabahları alarmdan önce uyanıyorsun ve bu yıllardır olmuyordu. Ailen endişeli, sen değilsin — henüz.",
        onemli: true,
      },
    ],
  },
  {
    id: "y2",
    stages: ["gencYetiskin"],
    cat: "ask",
    emoji: "💫",
    baslik: "Bir Tanışma",
    metin: "Kafede biriyle göz göze geldin. Gülümsüyor ve bakışını kaçırmıyor.",
    gerek: { yokIliski: "sevgili" },
    secenekler: [
      {
        t: "Yanına git, konuş",
        etiketler: ["cesaret", "sosyal", "romantik"],
        fx: { ask: 16, mutluluk: 8 },
        sonuc:
          "İki saat konuştunuz; kahveler soğudu, garson iki kez uğradı. {sevgili} kalkarken telefonunu uzattı ve 'yaz bakalım' dedi. O akşam eve giderken yürüyüşünün değiştiğini fark ettin.",
        iliski: { tur: "sevgili" },
        onemli: true,
      },
      {
        t: "Kahveni al, çık",
        etiketler: ["kacinma", "yalniz"],
        fx: { ask: -3, mutluluk: -2 },
        sonuc:
          "Bardağı kaptığın gibi kapıya yürüdün. Kaldırımda durup bir saniye düşündün, sonra geri döndün — ama masa boştu. O 'acaba' yıllarca aklında kaldı.",
      },
    ],
  },
  {
    id: "y3",
    stages: ["gencYetiskin", "yetiskin"],
    cat: "para",
    emoji: "📈",
    baslik: "Kripto Fırsatı",
    metin:
      "Bir arkadaşın 'kesin katlanacak' dediği bir coin'e para koymanı istiyor. Grafiği gösterirken elleri titriyor.",
    secenekler: [
      {
        t: "Tüm birikimini bas",
        etiketler: ["risk", "ticaret"],
        fx: { mutluluk: -6, saglik: -5 },
        para: 45000,
        riskli: 0.45,
        kotu: {
          fx: { mutluluk: -14, saglik: -8, arkadaslik: -5 },
          para: -35000,
          sonuc:
            "Üç gün içinde grafik dipe vurdu ve bir daha kalkmadı. Ekrana bakarken midende bir boşluk açıldı; parayı değil, kendine olan güvenini kaybetmiştin. Aylarca kimseye anlatamadın.",
        },
        sonuc:
          "Şansın yaver gitti; iki ayda katladı ve tam zamanında çıktın. Ama o iki ay boyunca uyandığın her gece ilk iş telefona baktın. Kazandın, ama sinir sistemin de bir bedel ödedi.",
        bayrak: ["kumarTadi"],
      },
      {
        t: "Azıcık dene",
        etiketler: ["guvenli", "ticaret"],
        fx: { mutluluk: 3 },
        para: 3000,
        sonuc:
          "Kaybetmeyi göze alabileceğin kadarını koydun ve orada bıraktın. Küçük bir kâr çıktı, kimseye hava atacak kadar değil. Uykuların bölünmedi, bu da bir kazanç.",
      },
      {
        t: "Uzak dur",
        etiketler: ["guvenli", "durustluk"],
        fx: { mutluluk: 4, kariyer: 2 },
        sonuc:
          "'Anlamadığım şeye para koymam' dedin ve konu kapandı. Aylar sonra o coin sıfırlandığında arkadaşın seni aradı, sesi çok yorgundu. Sen sadece dinledin, 'demiştim' demedin.",
      },
    ],
  },
  {
    id: "y4",
    stages: ["gencYetiskin", "yetiskin"],
    cat: "ask",
    emoji: "💍",
    baslik: "Büyük Soru",
    metin:
      "{sevgili} ile {birlikteYil} yıldır berabersiniz. Artık masada başka bir konu var: evlilik.",
    gerek: { iliski: "sevgili", yokBayrak: ["evli"] },
    tekSefer: true,
    agirlik: 3,
    secenekler: [
      {
        t: "Evet de",
        etiketler: ["sadakat", "romantik", "cesaret"],
        fx: { ask: 15, mutluluk: 12, arkadaslik: 5 },
        para: -30000,
        sonuc:
          "Kalabalık bir salon, yanlış çalan bir şarkı ve annenin bir türlü kurumayan gözleri. {sevgili} ile ilk dansta ikiniz de adımları şaşırdınız ve güldünüz. O gece bambaşka bir hayatın ilk sayfasıydı.",
        iliskiYukselt: { eski: "sevgili", yeni: "es" },
        bayrak: ["evli"],
        onemli: true,
      },
      {
        t: "Biraz daha bekleyelim",
        etiketler: ["kacinma", "guvenli"],
        fx: { ask: -6, mutluluk: -3 },
        sonuc:
          "'Acelemiz ne?' dedin ve konuyu ustalıkla değiştirdin. {sevgili} anlayışla başını salladı ama o akşam yemekte pek konuşmadı. Aranıza ince, görünmez bir soğukluk yerleşti.",
        bayrak: ["ertelenmisEvlilik"],
      },
      {
        t: "Ayrılalım",
        etiketler: ["durustluk", "yalniz"],
        fx: { ask: -18, mutluluk: -10, arkadaslik: -3 },
        sonuc:
          "Söylemesi zordu ama söyledin: aynı şeyi istemiyordunuz. {sevgili} ağlamadı, sadece uzun uzun sana baktı ve çantasını aldı. Boş kalan evde ilk hafta duvarlara konuştun.",
        iliskiBitir: "sevgili",
        bayrak: ["ayrilikYasadi"],
        onemli: true,
      },
    ],
  },
  {
    id: "y5",
    stages: ["gencYetiskin", "yetiskin"],
    cat: "saglik",
    emoji: "😰",
    baslik: "Tükenmişlik",
    metin: "Haftalardır az uyuyup çok çalışıyorsun. Bugün ayağa kalkarken oda döndü.",
    secenekler: [
      {
        t: "Tatile çık",
        etiketler: ["kesif", "guvenli"],
        fx: { saglik: 13, mutluluk: 11, kariyer: -4 },
        para: -8000,
        sonuc:
          "Telefonu uçak moduna aldın ve dört gün açmadın. Denize karşı hiçbir şey yapmadan oturmak ilk gün huzursuz etti, ikinci gün iyileştirdi. Döndüğünde iş yerinde dünya yıkılmamıştı.",
      },
      {
        t: "Kafeinle devam",
        etiketler: ["calisma", "risk"],
        fx: { saglik: -13, kariyer: 7, mutluluk: -4 },
        sonuc:
          "Üçüncü kahveden sonra ellerin titriyordu ama iş bitti. Patronun 'harikasın' dedi ve yeni bir dosya uzattı. Vücudun faturayı hemen kesmedi — taksitlendirdi.",
        bayrak: ["yipranma"],
      },
    ],
  },
  {
    id: "y6",
    stages: ["gencYetiskin", "yetiskin"],
    cat: "para",
    emoji: "🧾",
    baslik: "Sıkışan Ay",
    metin: "Kira, fatura, borç... Bu ay hiçbiri denk gelmiyor. Bir tanıdık 'ben ayarlarım' diyor.",
    secenekler: [
      {
        t: "Tefeciden borç al",
        etiketler: ["risk", "hile"],
        fx: { mutluluk: 4, saglik: -4 },
        para: 30000,
        sonuc:
          "Sayılan paraları cebe koyarken adamın gözlerine bakmamaya çalıştın. O ay her şey ödendi, nefes aldın. Ama defterin bir yerinde artık senin adın yazıyor ve bu düşünce geceleri uyanmana sebep oluyor.",
        bayrak: ["borc"],
        onemli: true,
      },
      {
        t: "İkinci işe gir",
        etiketler: ["calisma", "durustluk"],
        fx: { kariyer: 6, saglik: -8, mutluluk: -4, arkadaslik: -3 },
        para: 12000,
        sonuc:
          "Akşamları da çalışmaya başladın; günün on altı saati ayaktasın. Borcunu kendi elinle kapattın ve bunu kimseye anlatmadın. Sırtın ağrıyor ama başın dik.",
      },
      {
        t: "Sevdiklerinden iste",
        etiketler: ["sosyal", "kacinma"],
        fx: { arkadaslik: -6, mutluluk: -3, ask: -2 },
        para: 15000,
        sonuc:
          "Telefonda sesin çıkmadı, sonunda mesaj attın. Para geldi, hem de hiç soru sorulmadan. Ama bir sonraki buluşmada masada oturuş şeklin bile değişmişti.",
      },
    ],
  },
  {
    id: "y7",
    stages: ["gencYetiskin"],
    cat: "arkadaslik",
    emoji: "🏠",
    baslik: "Ev Arkadaşı",
    metin: "Kirayı bölüşmek için birinin taşınması gerekiyor. İlan verdin, kapıda biri duruyor.",
    gerek: { yokIliski: "es" },
    secenekler: [
      {
        t: "Kabul et",
        etiketler: ["sosyal", "kesif"],
        fx: { arkadaslik: 11, mutluluk: 6, saglik: -2 },
        para: 6000,
        sonuc:
          "Mutfak paylaşımı ilk ay felaketti, sonra bir ritim oturdu. {arkadas} ile gece yarısı yapılan sohbetler, dolapta biten süt kavgaları, ortak alışveriş listeleri. Yalnızlığın ne kadar pahalı olduğunu ancak biterken anladın.",
        iliski: { tur: "arkadas" },
      },
      {
        t: "Yalnız yaşamayı seç",
        etiketler: ["yalniz", "guvenli"],
        fx: { mutluluk: 4, arkadaslik: -6, kariyer: 3 },
        para: -6000,
        sonuc:
          "Kapıyı kapattın ve evin sessizliği bir anda çok belirgin oldu. Her şey senin bıraktığın yerde duruyor, kimse sana soru sormuyor. Bazı akşamlar bu mükemmel, bazı akşamlar dayanılmaz.",
      },
    ],
  },
  {
    id: "y8",
    stages: ["gencYetiskin", "yetiskin"],
    cat: "kariyer",
    emoji: "🧪",
    baslik: "Kendi İşin",
    metin: "Aklındaki fikri artık uykunda bile görüyorsun. Ama kurmak için işi bırakmak gerek.",
    secenekler: [
      {
        t: "İstifa et, kur",
        etiketler: ["risk", "ticaret", "cesaret"],
        fx: { kariyer: 10, mutluluk: 8, saglik: -6 },
        para: -20000,
        riskli: 0.4,
        kotu: {
          fx: { kariyer: -10, mutluluk: -12, saglik: -6 },
          para: -30000,
          sonuc:
            "On bir ay sonra kepenk indi. Elinde ödenmemiş faturalar, geri dönülmeyen mesajlar ve bir sürü 'keşke' kaldı. En zoru, herkese tek tek anlatmak oldu.",
        },
        sonuc:
          "İlk altı ay ofis dediğin şey mutfak masasıydı. Sonra ilk gerçek müşteri geldi, sonra bir tane daha. Kendi kurduğun şeyin ayakta durduğunu görmek, hayatında hissettiğin en tuhaf gururdu.",
        bayrak: ["kendiIsi"],
        onemli: true,
      },
      {
        t: "Hafta sonları geliştir",
        etiketler: ["calisma", "guvenli", "teknik"],
        fx: { kariyer: 6, saglik: -4, mutluluk: 2 },
        para: 4000,
        sonuc:
          "Cumartesileri fikre, pazarları uykuya ayırdın. İki yılda yavaş ama sağlam bir şey çıktı ortaya. Kimse patlama demedi ama kimse de battın demedi.",
      },
      {
        t: "Fikri rafa kaldır",
        etiketler: ["kacinma", "guvenli"],
        fx: { kariyer: -3, mutluluk: -6 },
        sonuc:
          "Defteri çekmeceye koydun ve anahtarı çevirdin. Yıllar sonra aynı fikri bir başkasının reklamında gördüğünde kanalı değiştirdin. 'Ben de düşünmüştüm' cümlesi kimseyi ısıtmıyor.",
      },
    ],
  },

  /* ================= YETİŞKİNLİK ================= */
  {
    id: "a1",
    stages: ["yetiskin"],
    cat: "kariyer",
    emoji: "🏆",
    baslik: "Terfi mi, Aile mi?",
    metin: "Hayalindeki terfi geldi ama başka şehirde. Sevdiklerin burada.",
    secenekler: [
      {
        t: "Terfiyi al, taşın",
        etiketler: ["bencil", "calisma", "kesif"],
        fx: { kariyer: 16, ask: -9, arkadaslik: -7 },
        para: 30000,
        sonuc:
          "Yeni şehirde ofisin camdan, evin boş. Unvanın büyüdü, telefon defterin küçüldü. Akşamları menüye bakarken kendine 'buna değdi mi' diye sormayı alışkanlık haline getirdin.",
        onemli: true,
      },
      {
        t: "Kal, sevdiklerini seç",
        etiketler: ["sadakat", "yardim"],
        fx: { kariyer: -5, ask: 9, mutluluk: 9, arkadaslik: 7 },
        sonuc:
          "'Teşekkür ederim ama hayır' demek beklediğinden kolay oldu. Aynı masa, aynı yüzler, aynı akşam yemekleri devam etti. Kariyerin bir basamak eksik kaldı, sofran bir kişi fazla.",
        onemli: true,
      },
    ],
  },
  {
    id: "a2",
    stages: ["yetiskin"],
    cat: "hayat",
    emoji: "🎸",
    baslik: "Orta Yaş",
    metin: "Bir sabah aynada kendine baktın ve içinden geçti: 'Bu hayatı ben mi seçtim?'",
    secenekler: [
      {
        t: "Her şeyi değiştir",
        etiketler: ["risk", "kesif", "cesaret"],
        fx: { mutluluk: 12, kariyer: -7, saglik: 4 },
        para: -15000,
        sonuc:
          "Bir motosiklet, bir gitar kursu ve kimsenin anlamadığı yeni bir saç kesimi. Çevrendekiler önce endişelendi, sonra alıştı. Çılgın görünüyorsun ama uzun zamandır bu kadar canlı hissetmemiştin.",
      },
      {
        t: "Terapiye başla",
        etiketler: ["durustluk", "yardim"],
        fx: { mutluluk: 9, saglik: 7 },
        para: -6000,
        sonuc:
          "İlk seans boyunca çoğunlukla sustun. Üçüncü seansta hiç beklemediğin bir cümle ağzından döküldü ve odada uzun bir sessizlik oldu. Değişim gürültüsüz başladı ama başladı.",
        bayrak: ["terapi"],
      },
      {
        t: "Görmezden gel",
        etiketler: ["kacinma", "tembellik"],
        fx: { mutluluk: -7 },
        sonuc:
          "Aynadan uzaklaştın ve her zamanki gibi işe gittin. Gün normal geçti, hafta normal geçti. Ama o soru geceleri, herkes uyuduktan sonra hep geri geldi.",
      },
    ],
  },
  {
    id: "a3",
    stages: ["yetiskin", "orta"],
    cat: "para",
    emoji: "🏠",
    baslik: "Yatırım",
    metin: "Bir emlak fırsatı çıktı. Tüm birikimini ve biraz da cesaret istiyor.",
    secenekler: [
      {
        t: "Al gözünü kapa",
        etiketler: ["risk", "ticaret"],
        fx: { mutluluk: 4, saglik: -4 },
        para: 70000,
        riskli: 0.35,
        kotu: {
          fx: { mutluluk: -12, saglik: -6, kariyer: -4 },
          para: -45000,
          sonuc:
            "Proje yarım kaldı, müteahhit ortadan kayboldu ve elinde bir kâğıt yığını kaldı. Avukat masrafları da cabası. O binanın önünden geçmemek için yolunu değiştirdin.",
        },
        sonuc:
          "İmzayı atarken ellerin terliyordu. Üç yıl sonra bölgeye metro geldi ve değer ikiye katlandı. Kazandın ama o üç yılın her taksitinde saçların biraz daha ağardı.",
      },
      {
        t: "Kirada kal, biriktir",
        etiketler: ["guvenli", "calisma"],
        fx: { mutluluk: 2, saglik: 2 },
        para: 9000,
        sonuc:
          "Riske girmedin, mevduatta beklemeyi seçtin. Fiyatlar uçarken biraz canın sıkıldı ama gece uykun hiç bölünmedi. Yavaş, güvenli ve biraz da sıkıcı bir ilerleme.",
      },
    ],
  },
  {
    id: "a4",
    stages: ["yetiskin", "orta"],
    cat: "arkadaslik",
    emoji: "📞",
    baslik: "Eski Dost",
    metin: "Yıllar sonra çocukluk arkadaşın arıyor: 'Zor durumdayım, borç lazım.'",
    secenekler: [
      {
        t: "Yardım et",
        etiketler: ["yardim", "sadakat"],
        fx: { arkadaslik: 12, mutluluk: 7 },
        para: -20000,
        sonuc:
          "Hiç soru sormadan gönderdin ve 'ne zaman olursa' dedin. Telefonun öbür ucunda uzun bir sessizlik ve titreyen bir teşekkür vardı. Para belki geri gelmez ama o ses aklında kaldı.",
      },
      {
        t: "Nazikçe reddet",
        etiketler: ["bencil", "guvenli"],
        fx: { arkadaslik: -9, mutluluk: -4 },
        sonuc:
          "Bütçeni anlattın, gerçekten anlattın. Karşı taraf 'tabii, anlıyorum' dedi ve telefonu kapattı. Bir daha aramadı ve sen de arayamadın.",
      },
      {
        t: "İş bul, para verme",
        etiketler: ["hile", "yardim"],
        fx: { arkadaslik: 5, kariyer: 3, mutluluk: 3 },
        sonuc:
          "Para yerine iki telefon açtın ve bir görüşme ayarladın. İşe girdi, birkaç ay sonra ilk maaşıyla sana yemek ısmarladı. Bazı yardımlar cepten değil, defterden çıkıyor.",
      },
    ],
  },
  {
    id: "a5",
    stages: ["yetiskin"],
    cat: "ask",
    emoji: "🌧️",
    baslik: "Soğuyan Ev",
    metin: "{es} ile aynı evde yaşıyorsunuz ama son aylarda konuşmalar iki cümleyi geçmiyor.",
    gerek: { iliski: "es" },
    agirlik: 3,
    secenekler: [
      {
        t: "Konuş, üstüne git",
        etiketler: ["durustluk", "romantik", "cesaret"],
        fx: { ask: 12, mutluluk: 8, arkadaslik: 2 },
        sonuc:
          "Televizyonu kapattın ve 'böyle devam edemeyiz' dedin. O gece mutfakta sabaha kadar konuştunuz; ikiniz de birkaç kez ağladınız. Ertesi sabah kahve iki fincanla yapıldı ve bu küçük şey her şeyi anlatıyordu.",
      },
      {
        t: "Görmezden gel",
        etiketler: ["kacinma", "tembellik"],
        fx: { ask: -12, mutluluk: -8 },
        sonuc:
          "Konuyu açmadın, o da açmadı. Aynı evde iki ayrı hayat kurmayı öğrendiniz; buzdolabında bile iki ayrı raf var artık. Sessizlik en gürültülü şey haline geldi.",
        bayrak: ["evdeCatlak"],
      },
      {
        t: "Başka bir kapıyı arala",
        etiketler: ["hile", "bencil", "romantik"],
        fx: { ask: -6, mutluluk: 4, arkadaslik: -5 },
        sonuc:
          "İş yerinden biriyle mesajlaşmalar uzadı, sonra bir kahve oldu. Kendini haklı çıkarmak için içinden uzun cümleler kurdun. {es} bir şey sormadı ama bakışları değişti.",
        bayrak: ["ihanet"],
        onemli: true,
      },
    ],
  },
  {
    id: "a6",
    stages: ["yetiskin", "orta"],
    cat: "saglik",
    emoji: "🫀",
    baslik: "Uyarı",
    metin: "Göğsünde birkaç saniye süren bir sıkışma oldu. Geçti ama seni korkuttu.",
    secenekler: [
      {
        t: "Hemen doktora git",
        etiketler: ["tip", "guvenli", "durustluk"],
        fx: { saglik: 12, mutluluk: -3 },
        para: -5000,
        sonuc:
          "Tahliller, bir sürü kablo ve beklenen bir cümle: 'Ciddi bir şey yok ama bu bir uyarı.' Sigara, tuz ve uykusuzluk listeden çıktı. Korkun sana iyi geldi.",
      },
      {
        t: "Yorgunluktur de",
        etiketler: ["kacinma", "risk"],
        fx: { saglik: -14, mutluluk: 2 },
        sonuc:
          "Bir bardak su içtin ve işine döndün. Birkaç hafta boyunca aynı sıkışma iki kez daha oldu, her seferinde biraz daha uzun sürdü. Bedenin sana konuşuyor ama sen kulaklıkla geziyorsun.",
        bayrak: ["kalpUyarisi"],
      },
    ],
  },

  /* ================= ORTA YAŞ ================= */
  {
    id: "o1",
    stages: ["orta"],
    cat: "saglik",
    emoji: "🩺",
    baslik: "Kontrol",
    metin: "Doktor tahlil kâğıdını uzatıyor: 'Yaşam tarzını değiştirmen lazım.'",
    secenekler: [
      {
        t: "Spora ve diyete başla",
        etiketler: ["spor", "calisma", "tip"],
        fx: { saglik: 16, mutluluk: 5, kariyer: -2 },
        para: -3000,
        sonuc:
          "İlk hafta her yerin ağrıdı ve iki kez vazgeçmeyi düşündün. Üçüncü ayda merdivenleri nefesin kesilmeden çıktığını fark ettin ve durup gülümsedin. Bedenini geri kazanmak yıllarını geri kazanmak gibiydi.",
      },
      {
        t: "Yarın başlarım de",
        etiketler: ["tembellik", "kacinma"],
        fx: { saglik: -13, mutluluk: -2 },
        sonuc:
          "Kâğıdı buzdolabının üstüne astın, sonra bir dosyanın altında kayboldu. O 'yarın' hiç gelmedi. Vücudun artık eskisi kadar affetmiyor ve bunu her sabah hatırlatıyor.",
      },
    ],
  },
  {
    id: "o2",
    stages: ["orta", "yasli"],
    cat: "hayat",
    emoji: "✈️",
    baslik: "Yapılacaklar Listesi",
    metin: "Hep 'bir gün' dediğin o uzun yolculuk hâlâ listenin başında duruyor.",
    secenekler: [
      {
        t: "Bavulu topla, git",
        etiketler: ["kesif", "cesaret"],
        fx: { mutluluk: 17, saglik: 5, ask: 4 },
        para: -20000,
        sonuc:
          "Adını doğru telaffuz edemediğin şehirlerde kayboldun, yanlış trene bindin, yabancılarla masa paylaştın. Döndüğünde valizin ağırlığı aynıydı ama sen değildin. 'Pişmanlıksız yaşamak' dedikleri şey buymuş.",
        onemli: true,
      },
      {
        t: "Sonraya bırak",
        etiketler: ["kacinma", "guvenli"],
        fx: { mutluluk: -7 },
        sonuc:
          "'Şartlar uygun değil' dedin ve listeyi çekmeceye koydun. Şartlar hiçbir zaman tam olarak uygun olmadı. Takvim yaprakları sen fark etmeden hızlandı.",
      },
    ],
  },
  {
    id: "o3",
    stages: ["orta"],
    cat: "arkadaslik",
    emoji: "🕰️",
    baslik: "Vedanın Zamanı",
    metin: "Çocukluğundan beri tanıdığın birinin cenazesindesin. Kalabalık dağılıyor.",
    secenekler: [
      {
        t: "Herkese ulaş, bir araya getir",
        etiketler: ["sosyal", "yardim"],
        fx: { arkadaslik: 12, mutluluk: -3, saglik: -2 },
        sonuc:
          "Cenazeden sonra herkesi bir çay bahçesine topladın. Yıllardır konuşmayan insanlar aynı masada eski hikâyeleri anlattı, bir noktada gülündü. Kaybın acısı azalmadı ama yalnız kalmadın.",
      },
      {
        t: "Sessizce eve dön",
        etiketler: ["yalniz", "kacinma"],
        fx: { mutluluk: -8, saglik: -3, arkadaslik: -4 },
        sonuc:
          "Kimseyle konuşmadan arabaya bindin ve eve kadar radyoyu açmadın. Kapıyı kapattığında ev hiç bu kadar büyük görünmemişti. O gece uzun bir liste yaptın: hâlâ arayabileceğin kişiler.",
      },
    ],
  },
  {
    id: "o4",
    stages: ["orta"],
    cat: "kariyer",
    emoji: "🧭",
    baslik: "Genç Meslektaş",
    metin:
      "İşe yeni giren biri tam da senin yıllar önceki halin gibi: hevesli, acemi ve çok hızlı.",
    secenekler: [
      {
        t: "Kanadının altına al",
        etiketler: ["yardim", "calisma"],
        fx: { kariyer: 8, mutluluk: 9, arkadaslik: 7 },
        sonuc:
          "Bildiğin her şeyi anlattın, hatalarını da sakladığın yerden çıkarıp gösterdin. Bir yıl sonra o kişi senin bile göremediğin bir çözümü buldu ve ilk sana koştu. Öğretmenin gururu bambaşkaymış.",
      },
      {
        t: "Mesafeni koru",
        etiketler: ["bencil", "yalniz"],
        fx: { kariyer: 3, arkadaslik: -6, mutluluk: -4 },
        sonuc:
          "Sorularına kısa cevaplar verdin, projelerini paylaşmadın. Koltuğun sağlam kaldı ama ofiste etrafına ince bir duvar örüldü. Öğle yemeklerini artık çoğunlukla masanda yiyorsun.",
      },
    ],
  },
  {
    id: "o5",
    stages: ["orta", "yasli"],
    cat: "para",
    emoji: "🧿",
    baslik: "Miras Kavgası",
    metin:
      "Aileden kalan eski bir ev var. Herkesin farklı bir planı, herkesin farklı bir hikâyesi.",
    secenekler: [
      {
        t: "Payını al, çekil",
        etiketler: ["guvenli", "bencil"],
        fx: { arkadaslik: -6, mutluluk: -2 },
        para: 45000,
        sonuc:
          "Noterde imzayı attın ve payını aldın. Cebin doldu, bayram sofrasında iki sandalye boş kaldı. Bazı akrabalarınla bir daha ancak cenazelerde karşılaştın.",
      },
      {
        t: "Evi ortak tut",
        etiketler: ["sadakat", "yardim"],
        fx: { arkadaslik: 10, mutluluk: 8 },
        para: -5000,
        sonuc:
          "'Satmayalım' diyen tek sendin ve ısrar ettin. Çatı aktardığında masrafı sen üstlendin ama her yaz o bahçede kalabalık bir sofra kuruldu. Bazı şeylerin fiyatı var, değeri başka.",
      },
    ],
  },

  /* ================= YAŞLILIK ================= */
  {
    id: "z1",
    stages: ["yasli"],
    cat: "kariyer",
    emoji: "🌇",
    baslik: "Emeklilik",
    metin: "Uzun bir çalışma hayatının son gününde masanı topluyorsun. Şimdi ne olacak?",
    secenekler: [
      {
        t: "Torunlara, bahçeye vakit ayır",
        etiketler: ["yardim", "sosyal"],
        fx: { mutluluk: 15, saglik: 7, arkadaslik: 7 },
        sonuc:
          "Sabahları kuş sesiyle uyanıyor, akşamüstü domates fidelerini suluyorsun. Telaş diye bir şey kalmadı, yerine tuhaf bir doluluk geldi. Hayatında ilk kez saate bakmadan yaşıyorsun.",
      },
      {
        t: "Danışmanlık yapmaya devam",
        etiketler: ["calisma", "hirsli", "teknik"],
        fx: { kariyer: 7, mutluluk: 3, saglik: -6 },
        para: 12000,
        sonuc:
          "Durmayı hiç beceremedin; iki hafta sonra ilk toplantıya oturmuştun bile. Aklın hâlâ keskin, tavsiyelerin hâlâ değerli. Ama akşamları koltuktan kalkman biraz daha uzun sürüyor.",
      },
    ],
  },
  {
    id: "z2",
    stages: ["yasli"],
    cat: "hayat",
    emoji: "📖",
    baslik: "Miras",
    metin: "Geriye bir şey bırakmak istiyorsun. Ama ne?",
    secenekler: [
      {
        t: "Anılarını yaz",
        etiketler: ["sanat", "yalniz"],
        fx: { mutluluk: 13, kariyer: 5 },
        sonuc:
          "Her sabah iki saat, eski bir defter ve yavaşlayan bir el yazısı. Bazı sayfalarda uzun süre duraksadın, bazılarını yırtıp yeniden yazdın. Torunların o defteri yıllar sonra bulup ağlayarak okuyacak.",
        onemli: true,
      },
      {
        t: "Birikimini bağışla",
        etiketler: ["yardim", "durustluk"],
        fx: { mutluluk: 15, arkadaslik: 5 },
        para: -30000,
        sonuc:
          "Bir okulun kütüphanesine bağışladın ve adının yazılmasını istemedin. Yine de yazdılar. Oradan geçen çocuklar o ismi okumadan içeri girecek ama kitaplar duracak.",
        onemli: true,
      },
      {
        t: "Her şeyi olduğu gibi bırak",
        etiketler: ["tembellik", "guvenli"],
        fx: { mutluluk: -4, saglik: 2 },
        sonuc:
          "'Onlar halleder' dedin ve konuyu kapattın. Eşyalar, kâğıtlar, yarım kalmış bir sürü şey olduğu yerde kaldı. Sadelik mi, kayıtsızlık mı, buna sen bile karar veremedin.",
      },
    ],
  },
  {
    id: "z3",
    stages: ["yasli"],
    cat: "saglik",
    emoji: "🦯",
    baslik: "Yavaşlayan Adımlar",
    metin: "Merdivenler eskisi gibi değil. Bir çocuğun kolunu uzatıyor.",
    secenekler: [
      {
        t: "Kolu tut, kabullen",
        etiketler: ["durustluk", "sosyal"],
        fx: { saglik: 6, mutluluk: 7, arkadaslik: 5 },
        sonuc:
          "Uzanan kola tutundun ve teşekkür ettin. Gurur denen şeyin ne kadar ağır bir bavul olduğunu o an anladın. Yardım kabul etmek de bir olgunluk çeşidiymiş.",
      },
      {
        t: "Kendi başına çık",
        etiketler: ["cesaret", "yalniz"],
        fx: { saglik: -8, mutluluk: 5 },
        sonuc:
          "'Sağ ol evladım' deyip tırabzana tutundun ve yavaş yavaş çıktın. En üstte durup nefeslendin, kimse görmedi. Bağımsızlığın canını acıttı ama sen buna razısın.",
      },
    ],
  },
  {
    id: "z4",
    stages: ["yasli"],
    cat: "ask",
    emoji: "🪑",
    baslik: "İki Koltuk",
    metin: "Balkonda iki koltuk var. Biri seninki, diğeri yıllardır aynı kişinin.",
    gerek: { iliski: "es" },
    secenekler: [
      {
        t: "Elini tut, hiçbir şey söyleme",
        etiketler: ["romantik", "sadakat"],
        fx: { ask: 14, mutluluk: 12, saglik: 3 },
        sonuc:
          "{es} ile {birlikteYil} yıl sonra konuşmaya gerek kalmıyor artık. Elini tuttun, o da sıktı ve ikiniz de akşamüstü ışığına baktınız. Bir ömür bu sessizliği hak etmek için geçmiş.",
      },
      {
        t: "Eski kavgayı kapat",
        etiketler: ["durustluk", "yardim"],
        fx: { ask: 10, mutluluk: 10, arkadaslik: 3 },
        sonuc:
          "Yıllardır kimsenin adını koymadığı o eski meseleyi sen açtın ve özür diledin. {es} önce şaşırdı, sonra güldü ve 'ben unutmuştum' dedi — ama unutmamıştı. O akşam ikiniz de daha hafif uyudunuz.",
      },
    ],
  },

  /* ================= ZİNCİRLEME OLAYLAR =================
     Bunlar ancak geçmişte belirli bir seçim yapıldıysa açılır. */
  {
    id: "zn1",
    stages: ["yetiskin", "orta"],
    cat: "ask",
    emoji: "🌹",
    baslik: "Geçmişten Biri",
    metin:
      "Bir kalabalığın içinde {ilkAsk} ile göz göze geldin. Aradan onlarca yıl geçmiş, ikiniz de değişmişsiniz.",
    gerek: { bayrak: ["ilkAskYasandi"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Bir kahve iç, konuş",
        etiketler: ["romantik", "sosyal"],
        fx: { ask: 9, mutluluk: 10 },
        sonuc:
          "İki saat boyunca o yılları, o koridoru, o kaçamak bakışları konuştunuz. {ilkAsk} 'ben de senden hoşlanıyordum, biliyor muydun?' dediğinde ikiniz de güldünüz. Kapanmamış bir sayfa nihayet huzurla kapandı.",
        onemli: true,
      },
      {
        t: "Bir daha dene",
        etiketler: ["risk", "romantik", "cesaret"],
        fx: { ask: 14, mutluluk: 8, arkadaslik: -5 },
        riskli: 0.5,
        kotu: {
          fx: { ask: -12, mutluluk: -12 },
          sonuc:
            "İki ay sonra ikiniz de aynı şeyi fark ettiniz: aşık olduğunuz kişiler artık yoktu, sadece anıları vardı. Ayrılık bu sefer daha sessiz oldu ama daha çok acıttı.",
        },
        sonuc:
          "Nereden kaldıysanız oradan devam ettiniz ve şaşırtıcı biçimde tuttu. {ilkAsk} ile geçen ikinci bahar, ilkinden çok daha sakin ama çok daha derindi. Bazen zamanlama gerçekten her şeymiş.",
        iliski: { tur: "sevgili" },
        onemli: true,
      },
      {
        t: "Geçmişte bırak",
        etiketler: ["guvenli", "sadakat"],
        fx: { mutluluk: 5, saglik: 3 },
        sonuc:
          "Uzaktan başınla selam verdin ve yürümeye devam ettin. Arkana bakmadın, çünkü bakarsan duracağını biliyordun. Bazı şeyler anı olarak daha güzel.",
      },
    ],
  },
  {
    id: "zn2",
    stages: ["gencYetiskin"],
    cat: "ask",
    emoji: "📬",
    baslik: "Söylenmemiş Cümle",
    metin: "Yıllar önce cesaret edemediğin o kişiden bir mesaj geldi: 'Bir şey soracaktım.'",
    gerek: { bayrak: ["kacirilanAsk"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Bu sefer söyle",
        etiketler: ["cesaret", "romantik", "durustluk"],
        fx: { ask: 15, mutluluk: 12 },
        sonuc:
          "Telefonda o eski cümleyi kurdun, hem de tek seferde. Karşı taraf uzun bir sessizlikten sonra 'ben o gün bekledim' dedi. On yıl geç kaldın ama sonunda söyledin ve {sevgili} bu sefer yanında kaldı.",
        iliski: { tur: "sevgili" },
        onemli: true,
      },
      {
        t: "Şakaya vur",
        etiketler: ["kacinma", "hile"],
        fx: { ask: -6, mutluluk: -7 },
        sonuc:
          "Konuyu bir espriyle geçiştirdin, ikiniz de güldünüz ve telefon kapandı. Bir daha aramadı. Aynı hatayı ikinci kez yapmak, ilkinden çok daha ağır bir şeymiş.",
      },
    ],
  },
  {
    id: "zn3",
    stages: ["gencYetiskin", "yetiskin", "orta"],
    cat: "para",
    emoji: "🚪",
    baslik: "Kapıdaki Adam",
    metin: "Yıllar önce aldığın borcun faizi katlanmış. Bu sabah kapıda iki kişi bekliyor.",
    gerek: { bayrak: ["borc"], yokBayrak: ["borcOdendi"] },
    tekSefer: true,
    agirlik: 5,
    secenekler: [
      {
        t: "Ne pahasına olursa olsun kapat",
        etiketler: ["durustluk", "cesaret"],
        fx: { mutluluk: 10, saglik: -4 },
        para: -60000,
        sonuc:
          "Arabayı sattın, birikimini boşalttın, birkaç kapıyı da çalmak zorunda kaldın. Son taksiti verdiğin gün elin titriyordu ama içinde yıllardır olmayan bir hafiflik vardı. Bir daha o defterlere adını yazdırmayacaksın.",
        bayrak: ["borcOdendi"],
        onemli: true,
      },
      {
        t: "Kaç, şehir değiştir",
        etiketler: ["kacinma", "hile", "risk"],
        fx: { mutluluk: -10, arkadaslik: -12, saglik: -6, kariyer: -6 },
        sonuc:
          "Bir gecede toplandın ve kimseye haber vermeden çıktın. Yeni şehirde kapı her çaldığında kalbin duruyor, telefonunu bilinmeyen numaralara kapatıyorsun. Borçtan kaçtın ama korkuyu yanında götürdün.",
        bayrak: ["kacak"],
        onemli: true,
      },
      {
        t: "Pazarlık et",
        etiketler: ["hile", "ticaret"],
        fx: { mutluluk: -3, kariyer: 3, saglik: -3 },
        para: -25000,
        sonuc:
          "İki saat konuştun, rakamı üçte birine indirdin ve taksite bağladın. Adamlar çıkarken biri omzuna vurup 'sen iyi konuşuyorsun' dedi. Ucuz atlattın ama o sabahı hiç unutmayacaksın.",
        bayrak: ["borcOdendi"],
      },
    ],
  },
  {
    id: "zn4",
    stages: ["yetiskin", "orta"],
    cat: "kariyer",
    emoji: "♟️",
    baslik: "Aynı Masa",
    metin:
      "Büyük bir iş görüşmesinde masanın karşı tarafında {rakip} oturuyor. Yıllar geçmiş ama bakışı hiç değişmemiş.",
    gerek: { bayrak: ["rakipVar"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Ortak ol",
        etiketler: ["ticaret", "sosyal", "cesaret"],
        fx: { kariyer: 14, arkadaslik: 9, mutluluk: 8 },
        para: 40000,
        sonuc:
          "'Birbirimizi yenmeye çalışarak yirmi yıl kaybettik' dedin ve elini uzattın. {rakip} bir süre baktı, sonra sıktı. Kurduğunuz şey ikinizin de tek başına yapabileceğinden büyük oldu.",
        onemli: true,
      },
      {
        t: "Ez geç",
        etiketler: ["hile", "bencil", "hirsli"],
        fx: { kariyer: 12, arkadaslik: -10, mutluluk: -4 },
        para: 25000,
        sonuc:
          "Zayıf noktasını biliyordun ve tam oradan vurdun. İhale senin oldu, {rakip} salondan tek kelime etmeden çıktı. Kazanmanın tadı, kutlama biter bitmez kayboldu.",
      },
      {
        t: "Çekil, ona bırak",
        etiketler: ["yardim", "kacinma"],
        fx: { kariyer: -6, mutluluk: 6, arkadaslik: 7 },
        sonuc:
          "Teklifini geri çektin ve nedenini kimseye açıklamadın. Bir hafta sonra {rakip} aradı; sesi tuhaftı, 'neden' diye sordu. 'Artık yorucu geliyor' dedin ve ilk kez gerçekten konuştunuz.",
      },
    ],
  },
  {
    id: "zn5",
    stages: ["gencYetiskin", "yetiskin"],
    cat: "hayat",
    emoji: "👶",
    baslik: "Bir Kişi Daha",
    metin: "{es} ile mutfakta uzun bir konuşma: çocuk sahibi olmak.",
    gerek: { bayrak: ["evli"], yokBayrak: ["cocukVar"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Evet, hazırız",
        etiketler: ["romantik", "sadakat", "cesaret"],
        fx: { mutluluk: 14, ask: 8, saglik: -5, kariyer: -5 },
        para: -25000,
        sonuc:
          "Hastane koridorunda geçen o uzun gecenin sonunda kollarına küçücük bir insan verdiler. {cocuk} ilk kez ağladığında bacakların tutmadı ve duvara yaslandın. Hayatının merkezi o saniyede kalıcı olarak değişti.",
        iliski: { tur: "cocuk" },
        bayrak: ["cocukVar"],
        onemli: true,
      },
      {
        t: "Biz ikimize bakalım",
        etiketler: ["guvenli", "durustluk"],
        fx: { ask: 6, mutluluk: 5, kariyer: 6 },
        para: 10000,
        sonuc:
          "İkiniz de aynı şeyi düşünüyormuşsunuz ama söylemekten çekiniyormuşsunuz. Konuştukça rahatladınız; hayatınızı başkasının beklentisine göre kurmayacaktınız. Hafta sonları uzun, evler sessiz, kararınız sizin.",
        bayrak: ["cocuksuzKarar"],
      },
    ],
  },
  {
    id: "zn6",
    stages: ["orta", "yasli"],
    cat: "hayat",
    emoji: "🎓",
    baslik: "Kanatlanan",
    metin: "{cocuk} büyüdü ve kendi yolunu çizmek istiyor. Senin planladığın yol değil.",
    gerek: { bayrak: ["cocukVar"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Destekle, arkasında dur",
        etiketler: ["yardim", "sadakat"],
        fx: { mutluluk: 14, arkadaslik: 6, ask: 4 },
        para: -15000,
        sonuc:
          "İçinden geçen bütün itirazları yuttun ve 'git' dedin. Havaalanında sarıldığınızda {cocuk} ağladı, sen arabaya binene kadar dayandın. Bir yıl sonra gönderdiği ilk fotoğrafta gözlerindeki ışığı gördün ve haklı olduğunu anladın.",
        onemli: true,
      },
      {
        t: "Karşı çık",
        etiketler: ["bencil", "guvenli"],
        fx: { mutluluk: -10, arkadaslik: -6, kariyer: 2 },
        sonuc:
          "Sesini yükselttin, 'ben senin iyiliğini istiyorum' dedin. {cocuk} kapıyı çarpıp gitti ve üç ay aramadı. Haklı olduğuna hâlâ inanıyorsun ama o üç ayı hiçbir haklılık geri getirmiyor.",
        bayrak: ["cocuklaKuslar"],
      },
    ],
  },
  {
    id: "zn7",
    stages: ["gencYetiskin", "yetiskin"],
    cat: "kariyer",
    emoji: "🔔",
    baslik: "Kalabalığın Sesi",
    metin:
      "İçerik ürettiğin hesap büyüdü. Artık her cümlen tartışılıyor, her sessizliğin sorgulanıyor.",
    gerek: { bayrak: ["icerikUretici"] },
    tekSefer: true,
    agirlik: 3,
    secenekler: [
      {
        t: "Büyüt, ekip kur",
        etiketler: ["ticaret", "risk", "calisma"],
        fx: { kariyer: 13, mutluluk: -4, saglik: -7 },
        para: 60000,
        sonuc:
          "Bir ofis tuttun, üç kişi işe aldın ve takvimi altı ay öncesinden doldurdun. Rakamlar hayat değiştirecek boyuta geldi. Ama eskiden zevk için yaptığın şey artık her sabah çalan bir alarm.",
      },
      {
        t: "Küçült, kendine dön",
        etiketler: ["yalniz", "durustluk", "sanat"],
        fx: { mutluluk: 12, saglik: 6, kariyer: -6 },
        para: -5000,
        sonuc:
          "Bir video çekip 'bir süre yokum' dedin ve gerçekten kayboldun. Takipçilerin yarısı gitti, kalanlar bekledi. Geri döndüğünde daha az izlenen ama gerçekten senin olan şeyler yaptın.",
      },
    ],
  },
  {
    id: "zn8",
    stages: ["genc", "gencYetiskin"],
    cat: "hayat",
    emoji: "🐾",
    baslik: "Vefa",
    metin: "{kopek} artık çok yaşlı. Bu sabah merdivenleri çıkamadı ve sana baktı.",
    gerek: { bayrak: ["kopekVar"], yokBayrak: ["kopekGitti"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Son güne kadar yanında ol",
        etiketler: ["sadakat", "yardim"],
        fx: { mutluluk: -6, ask: 4, arkadaslik: 5, saglik: -2 },
        para: -6000,
        sonuc:
          "Onu kucağına aldın ve son haftalarını sevdiği battaniyenin üstünde, güneş gören pencerenin önünde geçirdi. Gittiği gün ağladığın kadar yıllardır ağlamamıştın. Bahçeye bir ağaç diktin ve adını verdin.",
        bayrak: ["kopekGitti"],
        onemli: true,
      },
      {
        t: "Bakamayacağını kabul et",
        etiketler: ["kacinma", "durustluk"],
        fx: { mutluluk: -12, arkadaslik: -3 },
        sonuc:
          "Ona daha iyi bakacak birini buldun ve teslim ederken arkana bakmadın. Doğru olanı yaptığını söyleyip durdun kendine. Ama uzun süre kapıyı açtığında ayak sesi aradın.",
        bayrak: ["kopekGitti"],
      },
    ],
  },
  {
    id: "zn9",
    stages: ["yetiskin", "orta"],
    cat: "para",
    emoji: "📉",
    baslik: "Grafiklerin Esiri",
    metin:
      "O ilk büyük kazançtan sonra hiçbir şey aynı tadı vermedi. Bu gece yine ekranın karşısındasın.",
    gerek: { bayrak: ["kumarTadi"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Dur, hepsini kapat",
        etiketler: ["durustluk", "cesaret", "guvenli"],
        fx: { mutluluk: 9, saglik: 8, kariyer: 3 },
        para: -8000,
        sonuc:
          "Bütün uygulamaları sildin ve birine anlattın — bu ikincisi daha zordu. İlk ay elin sürekli boş telefona gitti. Altıncı ayda bir akşam fark ettin: fiyatın ne olduğunu bilmiyorsun ve umurunda da değil.",
        onemli: true,
      },
      {
        t: "Bir kere daha büyük oyna",
        etiketler: ["risk", "hirsli"],
        fx: { saglik: -8, mutluluk: -6 },
        para: 20000,
        riskli: 0.65,
        kotu: {
          fx: { saglik: -12, mutluluk: -18, arkadaslik: -8, ask: -6 },
          para: -80000,
          sonuc:
            "Bu sefer dip gerçekten dipti. Ev sattın, borç aldın, yalan söyledin. Sabaha karşı ekranın ışığında kendi yüzünü gördün ve tanıyamadın.",
        },
        sonuc:
          "İnanılmaz ama tuttu; hesabına bakarken kendi kendine güldün. Kimseye söylemedin, çünkü kimse bir daha bunu yapmana izin vermezdi. Ve sen bir daha yapacağını biliyorsun.",
      },
    ],
  },
  {
    id: "zn10",
    stages: ["gencYetiskin", "yetiskin", "orta"],
    cat: "kariyer",
    emoji: "🖼️",
    baslik: "İlk Sergi",
    metin:
      "Çocukken başlayan o çizim merakı bir teklife dönüştü: küçük bir galeride tek kişilik sergi.",
    gerek: { bayrak: ["sanatKivilcimi"] },
    tekSefer: true,
    agirlik: 3,
    secenekler: [
      {
        t: "Kabul et, hepsini as",
        etiketler: ["sanat", "cesaret", "kesif"],
        fx: { kariyer: 11, mutluluk: 14, saglik: -3 },
        para: 9000,
        sonuc:
          "Açılış gecesi ellerin buz gibiydi ve kimse gelmeyecek sandın. Salon doldu; birisi bir işin önünde uzun süre durup ağladı. O an, çocukken öğretmenin resmini havaya kaldırdığı ana bağlandı.",
        onemli: true,
      },
      {
        t: "Hazır değilim de",
        etiketler: ["kacinma", "yalniz"],
        fx: { mutluluk: -8, kariyer: -4 },
        sonuc:
          "'Biraz daha çalışayım' dedin ve tarihi erteledin, sonra galeri başkasını buldu. Klasörlerin dolmaya devam etti ama kimse görmedi. Hazır olmak diye bir şey yokmuş, bunu çok sonra anladın.",
      },
    ],
  },
  {
    id: "zn11",
    stages: ["yetiskin", "orta"],
    cat: "saglik",
    emoji: "🫁",
    baslik: "Fatura",
    metin: "Gençlikte 'bir kerelik' dediğin şey yıllara yayıldı. Bugün doktor filmi ışığa tuttu.",
    gerek: { bayrak: ["kotuAliskanlik"] },
    tekSefer: true,
    agirlik: 4,
    secenekler: [
      {
        t: "Bugün bırak",
        etiketler: ["cesaret", "tip", "durustluk"],
        fx: { saglik: 14, mutluluk: -4 },
        para: -2000,
        sonuc:
          "Paketi çöpe attığın gün dünyanın en uzun günüydü. İkinci hafta sinirlerin herkesi yordu, birinci ayda merdivenleri fark ettin. Bir yıl sonra o filmi tekrar çektirdiğinde doktorun kaşları kalktı.",
        bayrak: ["birakti"],
        onemli: true,
      },
      {
        t: "Azaltırım de",
        etiketler: ["kacinma", "tembellik"],
        fx: { saglik: -11, mutluluk: 2 },
        sonuc:
          "'Yarıya indireceğim' dedin ve iki hafta gerçekten indirdin. Sonra yoğun bir dönem geldi ve her şey eskisi gibi oldu. Öksürüğün artık sabahları seni uyandırıyor.",
      },
    ],
  },
  {
    id: "zn12",
    stages: ["yetiskin", "orta"],
    cat: "ask",
    emoji: "💔",
    baslik: "Açığa Çıkan",
    metin: "{es} elinde telefonunla salonda oturuyor. Hiçbir şey söylemiyor, sadece bakıyor.",
    gerek: { bayrak: ["ihanet"], yokBayrak: ["bosandi"] },
    tekSefer: true,
    agirlik: 5,
    secenekler: [
      {
        t: "Her şeyi itiraf et",
        etiketler: ["durustluk", "cesaret"],
        fx: { ask: -8, mutluluk: 4, arkadaslik: -3 },
        sonuc:
          "Yalan söylemeyi denemedin bile; hepsini anlattın, hiçbir şeyi yumuşatmadın. {es} ağladı, bağırdı, sonra çok uzun bir süre sustu. Aylar süren zor bir onarım başladı ve ilk defa gerçekten aynı odadaydınız.",
        bayrak: ["itirafEtti"],
        onemli: true,
      },
      {
        t: "İnkâr et",
        etiketler: ["hile", "kacinma"],
        fx: { ask: -14, mutluluk: -10, arkadaslik: -4 },
        sonuc:
          "'Yanlış anladın' dedin ve inandırıcı bile oldun. {es} konuyu bir daha açmadı ama gözlerindeki o şey geri gelmedi. Aynı evde iki yabancı gibi yaşamayı öğrendiniz.",
      },
      {
        t: "Ayrılığı sen söyle",
        etiketler: ["bencil", "durustluk"],
        fx: { ask: -20, mutluluk: -8, arkadaslik: -6 },
        para: -40000,
        sonuc:
          "'Bitti' kelimesini sen kurdun ve odadaki hava değişti. Avukatlar, kutulanan eşyalar, ikiye bölünen bir fotoğraf albümü. Özgürlüğün ilk haftası bayram, ikinci ayı çok sessizdi.",
        iliskiBitir: "es",
        bayrak: ["bosandi"],
        onemli: true,
      },
    ],
  },
  {
    id: "zn13",
    stages: ["yetiskin", "orta"],
    cat: "hayat",
    emoji: "🚏",
    baslik: "Eski Sokak",
    metin: "Yıllar önce arkanda bıraktığın şehre bir işin düştü. Otobüs terminali hiç değişmemiş.",
    gerek: { bayrak: ["sehirDegistirdi"] },
    tekSefer: true,
    agirlik: 3,
    secenekler: [
      {
        t: "Eski sokağa git",
        etiketler: ["kesif", "sosyal"],
        fx: { mutluluk: 10, arkadaslik: 8, ask: 3 },
        sonuc:
          "Aynı bakkal, aynı çınar, çok daha küçük görünen bir apartman. Bakkalın oğlu seni ismiyle hatırladı ve çay ısmarladı. Gitmekle kaybettiğin şeyleri o öğleden sonra bir bir saydın, sonra bıraktın.",
      },
      {
        t: "İşini bitir, dön",
        etiketler: ["kacinma", "calisma"],
        fx: { kariyer: 5, mutluluk: -6 },
        para: 5000,
        sonuc:
          "Toplantıyı bitirdin ve akşam otobüsüne bindin. Pencereden geçerken o sokağın tabelasını gördün ve bir saniye baktın. Sonra gözlerini kapatıp uyumaya çalıştın.",
      },
    ],
  },

  /* ================= HER YAŞ / ŞANS ================= */
  {
    id: "h1",
    stages: ["hepsi"],
    cat: "para",
    emoji: "🍀",
    baslik: "Beklenmedik Şans",
    metin: "Yolda katlanmış bir zarf buldun. İçinde hatırı sayılır bir para var.",
    secenekler: [
      {
        t: "Sahibini ara",
        etiketler: ["durustluk", "yardim"],
        fx: { mutluluk: 9, arkadaslik: 7 },
        sonuc:
          "Zarfın içindeki bir kartvizitten sahibini buldun ve elden teslim ettin. Adam bir süre konuşamadı, sonra 'bu param değil, torunumun ameliyatıydı' dedi. Eve dönerken adımların yerden kesiliyordu.",
      },
      {
        t: "Cebe at",
        etiketler: ["bencil", "hile"],
        fx: { mutluluk: 3 },
        para: 3500,
        sonuc:
          "Etrafına bakındın, kimse yoktu ve zarf cebine girdi. O ay biraz rahat ettin. Ama o sokaktan her geçişinde gözlerin yerde bir şey arıyor gibi oldu.",
      },
    ],
  },
  {
    id: "h2",
    stages: ["hepsi"],
    cat: "hayat",
    emoji: "🤝",
    baslik: "Küçük İyilik",
    metin: "Yağmurda ıslanan yaşlı biri çantasını taşıyamıyor, kimse durmuyor.",
    secenekler: [
      {
        t: "Yardım et",
        etiketler: ["yardim", "sosyal"],
        fx: { mutluluk: 8, arkadaslik: 5, saglik: 2 },
        sonuc:
          "Çantayı aldın ve şemsiyeni onun üstüne tuttun, kendi omzun ıslandı. Kapıya vardığınızda ısrarla içeri çağırdı, sen kibarca reddettin. Bazen mutluluk bu kadar basit ve bu kadar ucuz.",
      },
      {
        t: "Acelen var, geç",
        etiketler: ["bencil", "kacinma"],
        fx: { mutluluk: -4 },
        sonuc:
          "Adımlarını hızlandırdın ve on saniye sonra unuttun. Akşam yatağa girdiğinde o bakış geri geldi. Küçük şeyler bazen en uzun kalanlar oluyor.",
      },
    ],
  },
  {
    id: "h3",
    stages: ["hepsi"],
    cat: "saglik",
    emoji: "🌙",
    baslik: "Uykusuz Gece",
    metin: "Saat üç. Tavana bakıyorsun ve zihnin durmuyor.",
    secenekler: [
      {
        t: "Kalk, bir şeyler yaz",
        etiketler: ["sanat", "yalniz"],
        fx: { mutluluk: 7, kariyer: 4, saglik: -4 },
        sonuc:
          "Mutfak masasında bir defter açtın ve sabaha kadar durmadan yazdın. Sabah okuduğunda yarısı saçmaydı, ama bir paragraf gerçekten iyiydi. O paragraf sonradan işine yarayacak.",
      },
      {
        t: "Birini ara",
        etiketler: ["sosyal", "durustluk"],
        fx: { arkadaslik: 9, mutluluk: 8 },
        sonuc:
          "Gece üçte aranabilecek birinin olması, sahip olduğun en pahalı şey. Konuşmadan çok sustunuz ama telefonu kapattığında omuzların inmişti. Uykuya gülümseyerek daldın.",
      },
      {
        t: "Zorla uyumaya çalış",
        etiketler: ["kacinma", "guvenli"],
        fx: { saglik: -5, mutluluk: -3 },
        sonuc:
          "Gözlerini kapattın ve saatlerce döndün durdun. Sabah alarm çaldığında sanki hiç yatmamış gibiydin. O gün her şey biraz daha zor oldu.",
      },
    ],
  },
  {
    id: "h4",
    stages: ["hepsi"],
    cat: "arkadaslik",
    emoji: "🚌",
    baslik: "Yabancı",
    metin: "Uzun bir yolculukta yanındaki kişi konuşmak istiyor gibi.",
    secenekler: [
      {
        t: "Sohbete gir",
        etiketler: ["sosyal", "kesif"],
        fx: { arkadaslik: 8, mutluluk: 7 },
        sonuc:
          "Üç saat boyunca hiç tanımadığın birine hayatının en dürüst özetini anlattın. O da anlattı. İniş yerinde vedalaştınız, isim bile almadınız ama o konuşma uzun süre içinde kaldı.",
      },
      {
        t: "Kulaklığı tak",
        etiketler: ["yalniz", "kacinma"],
        fx: { mutluluk: 3, saglik: 2, arkadaslik: -3 },
        sonuc:
          "Kulaklığı takıp camdan dışarı baktın ve manzara boyunca kendi düşüncelerinle kaldın. Dinlenmiş indin. Bazen yalnızlık dinlenmenin başka bir adı.",
      },
    ],
  },

  /* ================= KAOS ================= */
  {
    id: "k1",
    stages: ["hepsi"],
    kaosOnly: true,
    cat: "para",
    emoji: "🎰",
    baslik: "Piyango!",
    metin: "Aldığın bilet TUTTU. Büyük ikramiye senin!",
    secenekler: [
      {
        t: "Herkese ısmarla",
        etiketler: ["sosyal", "yardim"],
        fx: { arkadaslik: 20, mutluluk: 17, saglik: -3 },
        para: 200000,
        sonuc:
          "Bütün mahalleyi topladın, hesap kimin umurundaydı. Haftalarca aranmadığın gün olmadı; herkes seni buldu. Para bitince kimlerin kaldığını da öğrendin ve bu bilgi paradan daha değerliydi.",
        onemli: true,
      },
      {
        t: "Sessizce yatır",
        etiketler: ["guvenli", "yalniz", "ticaret"],
        fx: { mutluluk: 9, kariyer: 5 },
        para: 400000,
        sonuc:
          "Kimseye tek kelime etmedin, ne eşine ne dostuna. Hayatın kâğıt üstünde tamamen değişti ama sabah aynı otobüse bindin. Zenginlik en çok, kimsenin bunu bilmemesinde rahattı.",
        onemli: true,
      },
    ],
  },
  {
    id: "k2",
    stages: ["hepsi"],
    kaosOnly: true,
    cat: "saglik",
    emoji: "🛸",
    baslik: "Garip Işık",
    metin: "Gece gökyüzünde tuhaf bir ışık gördün. Ve sana doğru geliyor...",
    secenekler: [
      {
        t: "Yaklaş, bak",
        etiketler: ["cesaret", "kesif", "risk"],
        fx: { mutluluk: 15, saglik: -7, kariyer: 9 },
        sonuc:
          "Tarlanın ortasında kaç dakika kaldığını bilmiyorsun; saatin dört saat ileri gitmişti. Kimseye anlatamadın çünkü anlatacak kelime yoktu. O geceden sonra hiçbir şeyi eskisi kadar ciddiye alamadın.",
        onemli: true,
      },
      {
        t: "Kaç, saklan",
        etiketler: ["kacinma", "guvenli"],
        fx: { saglik: 4, mutluluk: -5 },
        sonuc:
          "Eve koştun, perdeleri çektin ve sabaha kadar ışığı açmadın. Sabah gökyüzü her zamanki gibiydi ve sen de kendine 'olmadı' dedin. Ama tarladaki o yanık daire haftalarca durdu.",
      },
    ],
  },
  {
    id: "k3",
    stages: ["hepsi"],
    kaosOnly: true,
    cat: "hayat",
    emoji: "🌊",
    baslik: "Ters Giden Gün",
    metin: "Bugün her şey aynı anda ters gidiyor. Kader seninle açıkça dalga geçiyor.",
    secenekler: [
      {
        t: "Gül geç, kabullen",
        etiketler: ["tembellik", "kesif"],
        fx: { mutluluk: 11, saglik: 5 },
        sonuc:
          "Üçüncü felaketten sonra sokağın ortasında kahkahayı bastın ve insanlar sana baktı. Umursamadın. Kaosla dans etmeyi öğrenmek de bir yetenekmiş ve sen o gün öğrendin.",
      },
      {
        t: "Sinirlen, savaş",
        etiketler: ["cesaret", "hirsli"],
        fx: { mutluluk: -9, saglik: -7, kariyer: 5 },
        sonuc:
          "Kime denk geldiyse bağırdın, üç kapı çaldın, iki dilekçe yazdın. Akşam olduğunda sorunların çoğu çözülmüştü ve senin hiç enerjin kalmamıştı. Kazandın ama savaş alanı sendin.",
      },
    ],
  },
  {
    id: "k4",
    stages: ["hepsi"],
    kaosOnly: true,
    cat: "kariyer",
    emoji: "🎪",
    baslik: "Absürt Teklif",
    metin: "Tanımadığın biri sana çok tuhaf ama çok kârlı bir iş teklif ediyor. Detay vermiyor.",
    secenekler: [
      {
        t: "Kabul et, sorma",
        etiketler: ["risk", "kesif", "hile"],
        fx: { kariyer: 8, mutluluk: 8, saglik: -6 },
        para: 55000,
        riskli: 0.5,
        kotu: {
          fx: { kariyer: -12, mutluluk: -10, arkadaslik: -8 },
          para: -20000,
          sonuc:
            "İşin ne olduğunu ancak polis kapıyı çaldığında öğrendin. Suçsuzdun ama ifade vermek, avukat tutmak ve herkese açıklamak aylarını aldı. Bazı sorular sorulmalıymış.",
        },
        sonuc:
          "Ne yaptığını tam olarak anlamadan üç ay çalıştın ve hayatının en yüksek ödemesini aldın. Sonra o kişi kayboldu, numarası kapandı. Hâlâ ne olduğunu bilmiyorsun ve artık öğrenmek de istemiyorsun.",
      },
      {
        t: "Sorular sor",
        etiketler: ["durustluk", "guvenli", "teknik"],
        fx: { kariyer: 4, mutluluk: 3 },
        para: 8000,
        sonuc:
          "Üst üste sorduğun sorulardan sonra teklif küçüldü, sonra makullüğe indi. Küçük ama temiz bir iş çıktı ortaya. Heyecanı azdı, uykusuz gecesi de yoktu.",
      },
    ],
  },
];

/* ---------- Yardımcılar ---------- */
const clamp = (v) => Math.max(0, Math.min(100, v));
const paraFmt = (n) => (n < 0 ? "-" : "") + "₺" + Math.abs(Math.round(n)).toLocaleString("tr-TR");
const rastgele = (dizi) => dizi[Math.floor(Math.random() * dizi.length)];

const KOPEK_ISIMLERI = ["Boncuk", "Karabaş", "Duman", "Paşa", "Zeytin", "Fındık", "Tarçın"];

function stageOf(age) {
  if (age <= 6) return "bebek";
  if (age <= 12) return "cocuk";
  if (age <= 19) return "genc";
  if (age <= 35) return "gencYetiskin";
  if (age <= 55) return "yetiskin";
  if (age <= 70) return "orta";
  return "yasli";
}

function stageEtiket(age) {
  return {
    bebek: "Bebeklik",
    cocuk: "Çocukluk",
    genc: "Gençlik",
    gencYetiskin: "Genç yetişkinlik",
    yetiskin: "Yetişkinlik",
    orta: "Orta yaş",
    yasli: "Yaşlılık",
  }[stageOf(age)];
}

/* İlişkiler için isim üretimi */
function iliskiIsmiUret(tur, cinsiyet, mevcutIsimler) {
  if (tur === "kopek")
    return (
      rastgele(KOPEK_ISIMLERI.filter((i) => !mevcutIsimler.includes(i))) || rastgele(KOPEK_ISIMLERI)
    );
  let havuz;
  if (tur === "sevgili" || tur === "es") {
    if (cinsiyet === "kadin") havuz = ISIMLER.erkek;
    else if (cinsiyet === "erkek") havuz = ISIMLER.kadin;
    else havuz = [...ISIMLER.kadin, ...ISIMLER.erkek];
  } else {
    havuz = [...ISIMLER.kadin, ...ISIMLER.erkek];
  }
  const kalan = havuz.filter((i) => !mevcutIsimler.includes(i));
  return rastgele(kalan.length ? kalan : havuz);
}

/* Metin yer tutucuları: {sevgili} {es} {arkadas} ... */
const YEDEK_AD = {
  sevgili: "sevdiğin kişi",
  es: "eşin",
  partner: "sevdiğin kişi",
  arkadas: "yakın bir arkadaşın",
  rakip: "eski rakibin",
  cocuk: "çocuğun",
  kopek: "köpeğin",
  ilkAsk: "ilk aşkın",
};

function iliskiBul(iliskiler, tur) {
  if (tur === "ilkAsk") return [...iliskiler].reverse().find((i) => i.ilkAsk);
  if (tur === "partner") return iliskiBul(iliskiler, "es") || iliskiBul(iliskiler, "sevgili");
  return [...iliskiler].reverse().find((i) => i.tur === tur && i.aktif);
}

function metinDoldur(metin, ctx) {
  if (!metin) return "";
  return metin.replace(/\{(\w+)\}/g, (tam, anahtar) => {
    if (anahtar === "isim") return ctx.karakter.isim;
    if (anahtar === "birlikteYil") {
      const p = iliskiBul(ctx.iliskiler, "partner");
      return String(Math.max(1, ctx.yas - (p ? p.baslangic : ctx.yas - 1)));
    }
    const iliski = iliskiBul(ctx.iliskiler, anahtar);
    if (iliski) return iliski.ad;
    return YEDEK_AD[anahtar] || tam;
  });
}

/* Olay uygunluk kontrolü */
function olayUygunMu(e, ctx) {
  const stage = stageOf(ctx.yas);
  if (!e.stages.includes(stage) && !e.stages.includes("hepsi")) return false;
  if (e.kaosOnly && ctx.mode !== "kaos") return false;
  if (e.tekSefer && ctx.gorulen.includes(e.id)) return false;
  const g = e.gerek;
  if (g) {
    if (g.bayrak && !g.bayrak.every((b) => ctx.bayraklar.includes(b))) return false;
    if (g.yokBayrak && g.yokBayrak.some((b) => ctx.bayraklar.includes(b))) return false;
    if (g.iliski && !iliskiBul(ctx.iliskiler, g.iliski)) return false;
    if (g.yokIliski && iliskiBul(ctx.iliskiler, g.yokIliski)) return false;
  }
  return true;
}

function olayAgirligi(e, ctx) {
  let w = e.agirlik || 1;
  if (ctx.mode === "romantik" && e.cat === "ask") w *= 3;
  if (ctx.mode === "fakir" && e.cat === "para") w *= 2;
  if (ctx.mode === "kaos" && e.kaosOnly) w *= 2;
  if (ctx.karakter.meslek === "doktor" && e.cat === "saglik") w *= 1.5;
  if (ctx.karakter.meslek === "girisimci" && e.cat === "para") w *= 1.5;
  if (ctx.karakter.meslek === "sanatci" && e.cat === "hayat") w *= 1.5;
  return Math.max(1, Math.round(w));
}

function olaySec(ctx, recent) {
  let havuz = EVENTS.filter((e) => olayUygunMu(e, ctx) && !recent.includes(e.id));
  if (havuz.length === 0) havuz = EVENTS.filter((e) => olayUygunMu(e, ctx));
  if (havuz.length === 0) havuz = EVENTS.filter((e) => e.stages.includes("hepsi") && !e.kaosOnly);
  const agirlikli = [];
  havuz.forEach((e) => {
    const w = olayAgirligi(e, ctx);
    for (let i = 0; i < w; i++) agirlikli.push(e);
  });
  return rastgele(agirlikli);
}

/* ---------- Seçim motoru ---------- */
function fxBirlestir(hedef, ek) {
  if (!ek) return hedef;
  Object.keys(ek).forEach((k) => {
    hedef[k] = (hedef[k] || 0) + ek[k];
  });
  return hedef;
}

function riskOrani(secenek, ctx) {
  let p = secenek.riskli;
  const k = ctx.karakter;
  if (k.kisilikler.includes("kurnaz")) p -= 0.08;
  if (k.kisilikler.includes("hirsli")) p -= 0.05;
  if (k.kisilikler.includes("umursamaz")) p += 0.07;
  if (k.kisilikler.includes("cesur")) p -= 0.04;
  if (k.meslek === "girisimci") p -= 0.08;
  return Math.max(0.05, Math.min(0.9, p));
}

function tonCumlesi(stats) {
  const kural = TON_KURALLARI.find((t) => t.test(stats));
  if (!kural || Math.random() > 0.5) return null;
  return rastgele(kural.cumleler);
}

/**
 * Bir seçeneğin sonucunu hesaplar: kişilik + meslek etkilerini uygular,
 * riskli seçimlerde başarı/başarısızlık belirler, anlatıyı kurar.
 */
function secimiHesapla(secenek, ctx) {
  const { kisilikler, meslek } = ctx.karakter;
  const etiketler = secenek.etiketler || [];
  const basarisiz = secenek.riskli ? Math.random() < riskOrani(secenek, ctx) : false;
  const kaynak = basarisiz && secenek.kotu ? secenek.kotu : secenek;

  const fx = { ...(kaynak.fx || {}) };
  let paraCarpan = 1;
  const kisilikNotMap = new Map(); // bir özellik tek sonuçta en fazla bir cümle söyler
  const meslekNotlari = [];

  etiketler.forEach((etiket) => {
    kisilikler.forEach((k) => {
      const etki = KISILIK_ETKI[k] && KISILIK_ETKI[k][etiket];
      if (!etki) return;
      fxBirlestir(fx, etki.fx);
      if (etki.paraCarpan) paraCarpan *= etki.paraCarpan;
      if (etki.not && !kisilikNotMap.has(k)) kisilikNotMap.set(k, etki.not);
    });
    const mEtki = MESLEK_ETKI[meslek] && MESLEK_ETKI[meslek][etiket];
    if (mEtki) {
      fxBirlestir(fx, mEtki.fx);
      if (mEtki.paraCarpan) paraCarpan *= mEtki.paraCarpan;
      if (mEtki.not) {
        if (MESLEK_IMZA_ETIKETLERI.includes(etiket)) meslekNotlari.unshift(mEtki.not);
        else meslekNotlari.push(mEtki.not);
      }
    }
  });

  /* Anlatı şişmesin: en fazla iki not. Meslek notu varsa yeri garanti. */
  const kisilikNotlari = Array.from(kisilikNotMap.values());
  const notlar = meslekNotlari.length
    ? [kisilikNotlari[0], meslekNotlari[0]].filter(Boolean)
    : kisilikNotlari.slice(0, 2);

  // Kaos modunda her etki savrulur
  if (ctx.mode === "kaos") {
    Object.keys(fx).forEach((k) => {
      fx[k] = Math.round(fx[k] * (0.6 + Math.random()));
    });
  }

  const hamPara = kaynak.para || 0;
  const dpara = Math.round(hamPara > 0 ? hamPara * paraCarpan : hamPara);

  // Anlatı: kişiliğe özel varyant varsa onu kullan
  let anlati = kaynak.sonuc;
  if (!basarisiz && secenek.sonucKisilik) {
    const eslesen = kisilikler.find((k) => secenek.sonucKisilik[k]);
    if (eslesen) anlati = secenek.sonucKisilik[eslesen];
  }

  return { fx, dpara, anlati, notlar, basarisiz };
}

/* ---------- Bitiş: hayat hikayesi ---------- */
function hayatHikayesi(ctx, skor) {
  const { karakter, bayraklar, iliskiler, stats, yas } = ctx;
  const koken = KOKENLER.find((k) => k.key === karakter.koken);
  const meslek = MESLEKLER.find((m) => m.key === karakter.meslek);
  const kisilikAdlari = karakter.kisilikler.map((k) =>
    KISILIKLER.find((x) => x.key === k).ad.toLowerCase(),
  );
  const cumleler = [];

  cumleler.push(
    `${karakter.isim}, ${koken.hikaye} başlayan bir hayatı ${yas} yıl taşıdı; ${kisilikAdlari.join(" ve ")} bir insandı ve bu iki huy neredeyse bütün dönüm noktalarında masadaydı.`,
  );

  if (karakter.meslek !== "belirsiz") {
    cumleler.push(
      stats.kariyer >= 60
        ? `İçindeki ${meslek.ad.toLowerCase()} olma isteğini bastırmadı; yaptığı işte adı anıldı, emeği karşılığını buldu.`
        : `${meslek.ad} olmak istemişti; hayat başka yerlere savurdu ama o eğilim seçimlerinin arasında hep bir yerlerde durdu.`,
    );
  } else {
    cumleler.push(
      "Ne olmak istediğine hiçbir zaman tam karar vermedi ve tuhaf biçimde bu belirsizlik onu hep yeni kapılara götürdü.",
    );
  }

  const romantik = iliskiler.filter((i) => i.tur === "sevgili" || i.tur === "es");
  const es = iliskiler.find((i) => i.tur === "es");
  if (es && !bayraklar.includes("bosandi")) {
    cumleler.push(`${es.ad} ile kurduğu hayat, en uzun süren ve en çok emek verdiği şeydi.`);
  } else if (bayraklar.includes("bosandi")) {
    cumleler.push(
      `Bir evlilik kurdu ve dağıldığını gördü; o kırılma sonraki her ilişkisinin bir yerinde iz bıraktı.`,
    );
  } else if (romantik.length > 0) {
    cumleler.push(
      `${romantik.length} kez ciddi biçimde sevdi, hiçbirinde yarım kalmayı seçmedi ama hiçbiri de kalıcı olmadı.`,
    );
  } else {
    cumleler.push(
      "Aşk, hayatına hep uzaktan uğradı; kapıyı çaldığı zamanlarda ya evde yoktu ya da açmadı.",
    );
  }

  if (bayraklar.includes("cocukVar")) {
    const c = iliskiler.find((i) => i.tur === "cocuk");
    cumleler.push(`${c ? c.ad : "Çocuğu"}, geriye bıraktığı en canlı hikâyeydi.`);
  }
  if (bayraklar.includes("kacak"))
    cumleler.push("Kapatmadığı bir borç yüzünden yıllarca omzunun üstünden arkasına baktı.");
  else if (bayraklar.includes("borcOdendi"))
    cumleler.push("Bir dönem borcun altında ezildi ama o borcu kendi eliyle kapattı.");
  if (bayraklar.includes("kendiIsi"))
    cumleler.push(
      "Kendi kurduğu işin ayakta durduğunu görmek, aldığı en büyük risklerin karşılığıydı.",
    );
  if (bayraklar.includes("terapi"))
    cumleler.push("Bir noktada kendine bakmayı öğrendi; bunu yapmak cesaret istedi.");
  if (bayraklar.includes("birakti"))
    cumleler.push(
      "Yıllar süren bir alışkanlığı geç de olsa bıraktı ve bedeni ona bunun için teşekkür etti.",
    );

  const enYuksek = [...STATS].sort((a, b) => stats[b.key] - stats[a.key])[0];
  const enDusuk = [...STATS].sort((a, b) => stats[a.key] - stats[b.key])[0];
  cumleler.push(
    `Geriye dönüp bakıldığında en zengin olduğu yer ${enYuksek.label.toLowerCase()}, en aç kaldığı yer ${enDusuk.label.toLowerCase()} oldu.`,
  );

  cumleler.push(
    skor >= 80
      ? "Sonunda geriye pişmanlıktan çok anı kaldı — ve anlatacak birileri hep vardı."
      : skor >= 55
        ? "Ne destansı ne de boşa geçmiş; sıradan olanı hakkıyla yaşamış bir ömürdü."
        : "Zor bir yoldu ve çoğu zaman yalnız yürüdü; yine de sonuna kadar yürüdü.",
  );

  return cumleler.join(" ");
}

/* =====================================================================
   ANA BİLEŞEN
===================================================================== */
export default function HayatSimulatoru() {
  /* ekran akışı: olustur (adım adım) -> game -> over */
  const [screen, setScreen] = useState("olustur");
  const [adim, setAdim] = useState(0);

  /* karakter oluşturma alanları */
  const [isim, setIsim] = useState("");
  const [cinsiyet, setCinsiyet] = useState("belirsiz");
  const [baslangic, setBaslangic] = useState("cocuk");
  const [koken, setKoken] = useState("orta");
  const [meslek, setMeslek] = useState("belirsiz");
  const [kisilikler, setKisilikler] = useState([]);

  /* oyun durumu */
  const [karakter, setKarakter] = useState(null);
  const [mode, setMode] = useState(null);
  const [yas, setYas] = useState(0);
  const [omur, setOmur] = useState(80);
  const [stats, setStats] = useState(null);
  const [para, setPara] = useState(0);
  const [ev, setEv] = useState(null);
  const [recent, setRecent] = useState([]);
  const [gorulen, setGorulen] = useState([]);
  const [bayraklar, setBayraklar] = useState([]);
  const [iliskiler, setIliskiler] = useState([]);
  const [sonuc, setSonuc] = useState(null);
  const [gunluk, setGunluk] = useState([]);
  const [olumSebep, setOlumSebep] = useState("");

  const ctxOlustur = (ekler = {}) => ({
    yas,
    stats,
    para,
    mode,
    karakter,
    bayraklar,
    iliskiler,
    gorulen,
    ...ekler,
  });

  /* ---------- Oyunu başlat ---------- */
  function baslat(m) {
    const secilenBaslangic = BASLANGICLAR.find((b) => b.key === baslangic);
    const secilenKoken = KOKENLER.find((k) => k.key === koken);
    const secilenMeslek = MESLEKLER.find((k) => k.key === meslek);

    const yeniKarakter = {
      isim: isim.trim() || "Sen",
      cinsiyet,
      baslangic,
      koken,
      meslek,
      kisilikler: kisilikler.length ? kisilikler : ["cesur", "durust"],
    };

    /* başlangıç statları: mod + köken + meslek + yaş + kişilikler */
    const ilkStats = { ...m.start };
    [secilenBaslangic.fx, secilenKoken.fx, secilenMeslek.fx].forEach((fx) =>
      fxBirlestir(ilkStats, fx),
    );
    yeniKarakter.kisilikler.forEach((k) => {
      const kis = KISILIKLER.find((x) => x.key === k);
      if (kis) fxBirlestir(ilkStats, kis.fx);
    });
    Object.keys(ilkStats).forEach((k) => (ilkStats[k] = clamp(ilkStats[k])));

    const ilkPara = Math.round(m.para * secilenKoken.paraCarpan + secilenKoken.paraEk);

    let ilkOmur = 72 + Math.floor(Math.random() * 20);
    ilkOmur += { varlikli: 4, orta: 0, zor: -4, kimsesiz: -6 }[koken] || 0;
    if (meslek === "sporcu") ilkOmur += 3;
    if (meslek === "doktor") ilkOmur += 2;

    const baslangicYas = secilenBaslangic.yas;
    const ilkCtx = {
      yas: baslangicYas,
      stats: ilkStats,
      para: ilkPara,
      mode: m.key,
      karakter: yeniKarakter,
      bayraklar: [],
      iliskiler: [],
      gorulen: [],
    };

    setKarakter(yeniKarakter);
    setMode(m.key);
    setStats(ilkStats);
    setPara(ilkPara);
    setYas(baslangicYas);
    setOmur(Math.max(baslangicYas + 12, ilkOmur));
    setRecent([]);
    setGorulen([]);
    setBayraklar([]);
    setIliskiler([]);
    setGunluk([]);
    setSonuc(null);
    setOlumSebep("");
    setEv(olaySec(ilkCtx, []));
    setScreen("game");
  }

  /* ---------- Bir seçenek seçildi ---------- */
  function sec(secenek) {
    const ctx = ctxOlustur();
    const hesap = secimiHesapla(secenek, ctx);

    /* 1) ilişkiler ve bayraklar güncellenir (metin bunları kullanacak) */
    let yeniIliskiler = iliskiler;
    if (secenek.iliskiYukselt) {
      yeniIliskiler = yeniIliskiler.map((i) =>
        i.tur === secenek.iliskiYukselt.eski && i.aktif
          ? { ...i, tur: secenek.iliskiYukselt.yeni }
          : i,
      );
    }
    if (secenek.iliskiBitir) {
      yeniIliskiler = yeniIliskiler.map((i) =>
        i.tur === secenek.iliskiBitir && i.aktif ? { ...i, aktif: false, bitis: yas } : i,
      );
    }
    if (secenek.iliski) {
      const ad = iliskiIsmiUret(
        secenek.iliski.tur,
        karakter.cinsiyet,
        yeniIliskiler.map((i) => i.ad),
      );
      yeniIliskiler = [
        ...yeniIliskiler,
        {
          id: `${ev.id}-${yas}`,
          ad,
          tur: secenek.iliski.tur,
          ilkAsk: !!secenek.iliski.ilkAsk,
          baslangic: yas,
          aktif: true,
        },
      ];
    }
    const yeniBayraklar = secenek.bayrak
      ? Array.from(new Set([...bayraklar, ...secenek.bayrak]))
      : bayraklar;

    /* 2) statlar */
    const yeniStats = { ...stats };
    Object.keys(hesap.fx).forEach((k) => {
      if (k in yeniStats) yeniStats[k] = clamp(yeniStats[k] + hesap.fx[k]);
    });
    const yeniPara = para + hesap.dpara;

    /* 3) anlatı: gövde + kişilik/meslek notları + kritik stat tonu */
    const yeniCtx = {
      ...ctx,
      iliskiler: yeniIliskiler,
      bayraklar: yeniBayraklar,
      stats: yeniStats,
    };
    const parcalar = [metinDoldur(hesap.anlati, yeniCtx), ...hesap.notlar];
    const ton = tonCumlesi(yeniStats);
    if (ton) parcalar.push(ton);
    const metin = parcalar.join(" ");

    setIliskiler(yeniIliskiler);
    setBayraklar(yeniBayraklar);
    setStats(yeniStats);
    setPara(yeniPara);
    setGorulen((g) => (g.includes(ev.id) ? g : [...g, ev.id]));
    setSonuc({
      metin,
      fx: hesap.fx,
      dpara: hesap.dpara,
      emoji: ev.emoji,
      basarisiz: hesap.basarisiz,
    });
    setGunluk((g) => [
      {
        yas,
        emoji: ev.emoji,
        baslik: ev.baslik,
        secim: secenek.t,
        metin,
        onemli: !!secenek.onemli,
      },
      ...g,
    ]);
  }

  /* ---------- Sonraki olaya geç ---------- */
  function devam() {
    const yeniRecent = [ev.id, ...recent].slice(0, 8);
    const artis = yas < 13 ? 2 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 3);
    const yeniYas = yas + artis;

    if (stats.saglik <= 0) return bitir("Sağlığın tükendi.");
    if (stats.saglik <= 12 && Math.random() < 0.3) return bitir("Bedenin daha fazla dayanamadı.");
    if (yeniYas >= omur) return bitir("Yaşlılığın huzuruyla gözlerini kapadın.");

    const yeniCtx = ctxOlustur({ yas: yeniYas });
    setYas(yeniYas);
    setRecent(yeniRecent);
    setSonuc(null);
    setEv(olaySec(yeniCtx, yeniRecent));
  }

  function bitir(sebep) {
    setOlumSebep(sebep);
    setScreen("over");
  }

  function yenidenBasla() {
    setScreen("olustur");
    setAdim(0);
    setKisilikler([]);
  }

  function kisilikSec(key) {
    setKisilikler((mevcut) => {
      if (mevcut.includes(key)) return mevcut.filter((k) => k !== key);
      if (mevcut.length >= 2) return [mevcut[1], key];
      return [...mevcut, key];
    });
  }

  /* ================= KARAKTER OLUŞTURMA ================= */
  if (screen === "olustur") {
    const ileriAktif = adim !== 4 || kisilikler.length === 2;
    const secilenBaslangic = BASLANGICLAR.find((b) => b.key === baslangic);
    const secilenKoken = KOKENLER.find((k) => k.key === koken);
    const secilenMeslek = MESLEKLER.find((m) => m.key === meslek);

    return (
      <Shell>
        {adim === 0 && (
          <div style={{ textAlign: "center", paddingTop: 4, marginBottom: 18 }}>
            <div
              style={{ fontSize: 13, letterSpacing: 3, color: C.muted, textTransform: "uppercase" }}
            >
              bir hayat, sayısız yol
            </div>
            <h1
              style={{
                fontFamily: serif,
                fontSize: 40,
                margin: "6px 0 0",
                color: C.cream,
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              Hayat
              <br />
              <span style={{ color: C.gold, fontStyle: "italic" }}>Simülatörü</span>
            </h1>
          </div>
        )}

        <AdimGostergesi adim={adim} />

        {/* --- 0: isim + cinsiyet --- */}
        {adim === 0 && (
          <div>
            <label style={etiketStyle}>Adın</label>
            <input
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
              placeholder="Adını yaz..."
              maxLength={16}
              style={inputStyle}
            />
            <label style={{ ...etiketStyle, marginTop: 18 }}>Cinsiyet</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CINSIYETLER.map((c) => (
                <Pill key={c.key} secili={cinsiyet === c.key} onClick={() => setCinsiyet(c.key)}>
                  {c.emoji} {c.ad}
                </Pill>
              ))}
            </div>
          </div>
        )}

        {/* --- 1: başlangıç yaşı --- */}
        {adim === 1 && (
          <StepBlok
            baslik="Hayata nereden başlıyorsun?"
            alt="Seçtiğin yaş, göreceğin olayları belirler."
          >
            {BASLANGICLAR.map((b) => (
              <SecimKarti
                key={b.key}
                emoji={b.emoji}
                ad={`${b.ad} (${b.yas})`}
                aciklama={b.aciklama}
                secili={baslangic === b.key}
                onClick={() => setBaslangic(b.key)}
              />
            ))}
          </StepBlok>
        )}

        {/* --- 2: köken --- */}
        {adim === 2 && (
          <StepBlok
            baslik="Nasıl bir evde açtın gözünü?"
            alt="Başlangıç paranı ve statlarını etkiler."
          >
            {KOKENLER.map((k) => (
              <SecimKarti
                key={k.key}
                emoji={k.emoji}
                ad={k.ad}
                aciklama={k.aciklama}
                secili={koken === k.key}
                onClick={() => setKoken(k.key)}
              />
            ))}
          </StepBlok>
        )}

        {/* --- 3: meslek eğilimi --- */}
        {adim === 3 && (
          <StepBlok baslik="İçinden gelen ne?" alt="Kariyer ve para olaylarında sana bonus verir.">
            {MESLEKLER.map((m) => (
              <SecimKarti
                key={m.key}
                emoji={m.emoji}
                ad={m.ad}
                aciklama={m.aciklama}
                secili={meslek === m.key}
                onClick={() => setMeslek(m.key)}
              />
            ))}
          </StepBlok>
        )}

        {/* --- 4: kişilik --- */}
        {adim === 4 && (
          <StepBlok
            baslik="Sen nasıl birisin?"
            alt={`İki özellik seç. (${kisilikler.length}/2) Seçimlerinin sonuçlarını ömür boyu değiştirirler.`}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {KISILIKLER.map((k) => (
                <Pill
                  key={k.key}
                  secili={kisilikler.includes(k.key)}
                  onClick={() => kisilikSec(k.key)}
                >
                  {k.emoji} {k.ad}
                </Pill>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {kisilikler.map((key) => {
                const k = KISILIKLER.find((x) => x.key === key);
                return (
                  <div key={key} style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.4 }}>
                    <b style={{ color: C.cream }}>{k.ad}:</b> {k.aciklama}
                  </div>
                );
              })}
            </div>
          </StepBlok>
        )}

        {/* --- 5: mod + özet --- */}
        {adim === 5 && (
          <div>
            <div style={{ ...cardStyle, marginBottom: 14, padding: "14px 16px" }}>
              <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.cream }}>
                {isim.trim() || "Sen"}
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginTop: 4 }}>
                {CINSIYETLER.find((c) => c.key === cinsiyet).ad} · {secilenBaslangic.ad} (
                {secilenBaslangic.yas} yaş)
                <br />
                {secilenKoken.emoji} {secilenKoken.ad} · {secilenMeslek.emoji} {secilenMeslek.ad}
                <br />
                {kisilikler
                  .map((k) => {
                    const x = KISILIKLER.find((y) => y.key === k);
                    return `${x.emoji} ${x.ad}`;
                  })
                  .join(" · ")}
              </div>
            </div>

            <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
              Bir hayat seç ve başla
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => baslat(m)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 16,
                    cursor: "pointer",
                    background: C.card,
                    border: `1px solid ${C.cardEdge}`,
                    color: C.cream,
                    transition: "transform .12s, border-color .12s",
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.98)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <span style={{ fontSize: 30 }}>{m.emoji}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 700 }}>{m.ad}</span>
                    <span
                      style={{ display: "block", fontSize: 12.5, color: C.muted, marginTop: 2 }}
                    >
                      {m.aciklama}
                    </span>
                  </span>
                  <ChevronRight size={18} color={C.muted} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- gezinme --- */}
        <div style={{ display: "flex", gap: 10, marginTop: 22, alignItems: "center" }}>
          {adim > 0 && (
            <button
              onClick={() => setAdim(adim - 1)}
              style={{
                ...secenekStyle,
                width: "auto",
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: C.muted,
                padding: "12px 14px",
              }}
            >
              <ChevronLeft size={16} /> Geri
            </button>
          )}
          {adim < 5 && (
            <button
              onClick={() => ileriAktif && setAdim(adim + 1)}
              disabled={!ileriAktif}
              style={{
                ...secenekStyle,
                flex: 1,
                background: ileriAktif ? C.gold : "#00000022",
                color: ileriAktif ? "#2b1d00" : C.muted,
                borderColor: ileriAktif ? C.gold : C.cardEdge,
                fontWeight: 700,
                textAlign: "center",
                cursor: ileriAktif ? "pointer" : "default",
              }}
            >
              {adim === 4 && !ileriAktif ? "İki özellik seç" : "Devam →"}
            </button>
          )}
        </div>
      </Shell>
    );
  }

  /* ================= OYUN ================= */
  if (screen === "game" && ev && stats && karakter) {
    const ctx = ctxOlustur();
    const aktifIliskiler = iliskiler.filter((i) => i.aktif);

    return (
      <Shell>
        {/* üst bilgi */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div>
            <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.cream }}>
              {karakter.isim}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted }}>{stageEtiket(yas)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 30,
                fontWeight: 700,
                color: C.gold,
                lineHeight: 1,
              }}
            >
              {yas}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>yaşında</div>
          </div>
        </div>

        {/* kişilik + meslek rozetleri */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {karakter.kisilikler.map((k) => {
            const x = KISILIKLER.find((y) => y.key === k);
            return (
              <MiniRozet key={k}>
                {x.emoji} {x.ad}
              </MiniRozet>
            );
          })}
          {karakter.meslek !== "belirsiz" && (
            <MiniRozet>
              {MESLEKLER.find((m) => m.key === karakter.meslek).emoji}{" "}
              {MESLEKLER.find((m) => m.key === karakter.meslek).ad}
            </MiniRozet>
          )}
        </div>

        {/* para */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Coins size={15} color={C.gold} />
          <span style={{ fontSize: 14, fontWeight: 600, color: para < 0 ? "#ff8080" : C.cream }}>
            {paraFmt(para)}
          </span>
        </div>

        {/* statlar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {STATS.map((s) => (
            <StatBar
              key={s.key}
              label={s.label}
              value={stats[s.key]}
              color={s.color}
              Icon={s.Icon}
            />
          ))}
        </div>

        {/* kalıcı ilişkiler */}
        {aktifIliskiler.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {aktifIliskiler.map((i) => (
              <MiniRozet key={i.id} renk={ILISKI_RENK[i.tur]}>
                {ILISKI_EMOJI[i.tur]} {i.ad}
                {yas - i.baslangic > 0 ? ` · ${yas - i.baslangic} yıl` : ""}
              </MiniRozet>
            ))}
          </div>
        )}

        {/* olay ya da sonuç */}
        {!sonuc ? (
          <div style={cardStyle}>
            <div style={{ fontSize: 34, marginBottom: 6 }}>{ev.emoji}</div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: 8,
              }}
            >
              {ev.baslik}
            </div>
            <p
              style={{
                fontFamily: serif,
                fontSize: 18,
                lineHeight: 1.5,
                color: C.cream,
                margin: "0 0 18px",
              }}
            >
              {metinDoldur(ev.metin, ctx)}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {ev.secenekler.map((sc, i) => (
                <button key={i} onClick={() => sec(sc)} style={secenekStyle}>
                  {sc.t}
                  {sc.riskli ? (
                    <span style={{ color: C.gold, fontSize: 12 }}> · riskli</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>
              {sonuc.basarisiz ? "💥" : sonuc.emoji}
            </div>
            <p
              style={{
                fontFamily: serif,
                fontSize: 17,
                lineHeight: 1.62,
                color: C.cream,
                margin: "0 0 16px",
              }}
            >
              {sonuc.metin}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
              {Object.keys(sonuc.fx)
                .filter((k) => STATS.some((s) => s.key === k) && sonuc.fx[k] !== 0)
                .map((k) => (
                  <Chip key={k} label={STATS.find((s) => s.key === k).label} delta={sonuc.fx[k]} />
                ))}
              {sonuc.dpara !== 0 && <Chip label="Para" delta={sonuc.dpara} para />}
            </div>
            <button
              onClick={devam}
              style={{
                ...secenekStyle,
                background: C.gold,
                color: "#2b1d00",
                fontWeight: 700,
                borderColor: C.gold,
                textAlign: "center",
              }}
            >
              Devam et →
            </button>
          </div>
        )}
      </Shell>
    );
  }

  /* ================= BİTİŞ ================= */
  if (screen === "over" && stats && karakter) {
    const ort = Math.round(STATS.reduce((a, s) => a + stats[s.key], 0) / STATS.length);
    const paraPuan = Math.max(-10, Math.min(20, Math.round(para / 20000)));
    const skor = Math.max(0, Math.min(100, ort + paraPuan));
    const unvan = unvanBul(skor, stats, para, karakter);

    const siraliStatlar = [...STATS].sort((a, b) => stats[b.key] - stats[a.key]);
    const enYuksek = siraliStatlar[0];
    const enDusuk = siraliStatlar[siraliStatlar.length - 1];

    const romantik = iliskiler.filter((i) => i.tur === "sevgili" || i.tur === "es");
    const arkadaslar = iliskiler.filter((i) => i.tur === "arkadas");
    const rakipler = iliskiler.filter((i) => i.tur === "rakip");
    const onemliAnlar = gunluk
      .filter((g) => g.onemli)
      .slice()
      .reverse();
    const hikaye = hayatHikayesi(ctxOlustur(), skor);

    return (
      <Shell>
        <div style={{ textAlign: "center", paddingTop: 6, marginBottom: 18 }}>
          <div style={{ fontSize: 44, marginBottom: 4 }}>🕯️</div>
          <div
            style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: C.muted }}
          >
            hayat sona erdi
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 30, color: C.cream, margin: "6px 0 2px" }}>
            {karakter.isim}
          </h1>
          <div style={{ fontSize: 14, color: C.muted }}>
            {yas} yıl yaşadı · {olumSebep}
          </div>
        </div>

        <div style={{ ...cardStyle, textAlign: "center", marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              marginBottom: 4,
            }}
          >
            hayat puanı
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 52,
              fontWeight: 700,
              color: C.gold,
              lineHeight: 1,
            }}
          >
            {skor}
          </div>
          <div
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 18,
              color: C.cream,
              marginTop: 6,
            }}
          >
            “{unvan}”
          </div>
        </div>

        {/* hayat hikayesi */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              marginBottom: 8,
            }}
          >
            hayat hikayesi
          </div>
          <p
            style={{ fontFamily: serif, fontSize: 16, lineHeight: 1.65, color: C.cream, margin: 0 }}
          >
            {hikaye}
          </p>
        </div>

        {/* künye */}
        <div style={{ ...cardStyle, marginBottom: 14, padding: "16px 18px" }}>
          <KunyeSatir
            etiket="En güçlü yanı"
            deger={`${enYuksek.label} (${stats[enYuksek.key]})`}
            renk={enYuksek.color}
          />
          <KunyeSatir
            etiket="En zayıf yanı"
            deger={`${enDusuk.label} (${stats[enDusuk.key]})`}
            renk={enDusuk.color}
          />
          <KunyeSatir
            etiket="Aşk hayatı"
            deger={romantik.length ? `${romantik.length} ciddi ilişki` : "hiç yaşanmadı"}
          />
          <KunyeSatir
            etiket="Yol arkadaşları"
            deger={`${arkadaslar.length} dost · ${rakipler.length} rakip`}
          />
          <KunyeSatir
            etiket="Geriye kalan"
            deger={paraFmt(para)}
            renk={para < 0 ? "#ff8080" : C.gold}
          />
        </div>

        {/* statlar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
          {STATS.map((s) => (
            <StatBar
              key={s.key}
              label={s.label}
              value={stats[s.key]}
              color={s.color}
              Icon={s.Icon}
            />
          ))}
        </div>

        {/* önemli kararlar zaman çizelgesi */}
        {onemliAnlar.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: 10,
              }}
            >
              dönüm noktaları
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {onemliAnlar.map((g, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 15 }}>{g.emoji}</span>
                    {i < onemliAnlar.length - 1 && (
                      <span style={{ flex: 1, width: 1, background: C.cardEdge, marginTop: 2 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 12 }}>
                    <div style={{ fontSize: 12.5, color: C.gold, fontWeight: 600 }}>
                      {g.yas} yaş · {g.baslik}
                    </div>
                    <div style={{ fontSize: 12.5, color: C.cream, marginTop: 1 }}>{g.secim}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* kesitler */}
        {gunluk.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: 8,
              }}
            >
              hayatından kesitler
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {gunluk.slice(0, 10).map((g, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 12.5,
                    color: C.muted,
                    lineHeight: 1.5,
                  }}
                >
                  <span>{g.emoji}</span>
                  <span>
                    <b style={{ color: C.cream }}>{g.yas}:</b> {g.metin}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={yenidenBasla}
          style={{
            ...secenekStyle,
            background: C.gold,
            color: "#2b1d00",
            fontWeight: 700,
            borderColor: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <RotateCcw size={17} /> Yeni bir hayat
        </button>
      </Shell>
    );
  }

  return null;
}

/* =====================================================================
   KÜÇÜK BİLEŞENLER
===================================================================== */
const ADIM_BASLIKLARI = ["Kimlik", "Başlangıç", "Köken", "Eğilim", "Kişilik", "Hayat"];

const ILISKI_EMOJI = {
  sevgili: "💞",
  es: "💍",
  arkadas: "🫂",
  rakip: "⚔️",
  cocuk: "🧒",
  kopek: "🐾",
};

const ILISKI_RENK = {
  sevgili: C.rose,
  es: C.rose,
  arkadas: C.teal,
  rakip: "#ff9090",
  cocuk: C.gold,
  kopek: C.green,
};

function Shell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`,
        fontFamily: sans,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{ width: "100%", maxWidth: 440, padding: "26px 20px 40px", boxSizing: "border-box" }}
      >
        {children}
      </div>
    </div>
  );
}

function AdimGostergesi({ adim }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
        {ADIM_BASLIKLARI.map((_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 3,
              background: i <= adim ? C.gold : C.cardEdge,
              transition: "background .3s",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
        {adim + 1}/{ADIM_BASLIKLARI.length} · {ADIM_BASLIKLARI[adim]}
      </div>
    </div>
  );
}

function StepBlok({ baslik, alt, children }) {
  return (
    <div>
      <h2
        style={{
          fontFamily: serif,
          fontSize: 23,
          color: C.cream,
          margin: "0 0 4px",
          fontWeight: 700,
        }}
      >
        {baslik}
      </h2>
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14, lineHeight: 1.45 }}>
        {alt}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{children}</div>
    </div>
  );
}

function SecimKarti({ emoji, ad, aciklama, secili, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        textAlign: "left",
        padding: "13px 15px",
        borderRadius: 16,
        cursor: "pointer",
        background: secili ? "#f5b94214" : C.card,
        border: `1px solid ${secili ? C.gold : C.cardEdge}`,
        color: C.cream,
        transition: "border-color .15s, background .15s",
      }}
    >
      <span style={{ fontSize: 25 }}>{emoji}</span>
      <span style={{ flex: 1 }}>
        <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 700 }}>{ad}</span>
        <span
          style={{
            display: "block",
            fontSize: 12.5,
            color: C.muted,
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          {aciklama}
        </span>
      </span>
      {secili && <Check size={18} color={C.gold} />}
    </button>
  );
}

function Pill({ children, secili, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 14px",
        borderRadius: 20,
        cursor: "pointer",
        fontSize: 13.5,
        fontFamily: sans,
        background: secili ? C.gold : "#00000022",
        color: secili ? "#2b1d00" : C.cream,
        border: `1px solid ${secili ? C.gold : C.cardEdge}`,
        fontWeight: secili ? 700 : 500,
        transition: "background .15s",
      }}
    >
      {children}
    </button>
  );
}

function MiniRozet({ children, renk }) {
  return (
    <span
      style={{
        fontSize: 11.5,
        padding: "4px 9px",
        borderRadius: 20,
        color: renk || C.muted,
        background: "#00000026",
        border: `1px solid ${C.cardEdge}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function KunyeSatir({ etiket, deger, renk }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        padding: "5px 0",
      }}
    >
      <span style={{ fontSize: 12.5, color: C.muted }}>{etiket}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: renk || C.cream, textAlign: "right" }}>
        {deger}
      </span>
    </div>
  );
}

function StatBar({ label, value, color, Icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={16} color={color} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 12, color: C.cream }}>{label}</span>
          <span style={{ fontSize: 11, color: C.muted }}>{value}</span>
        </div>
        <div style={{ height: 6, borderRadius: 4, background: "#00000033", overflow: "hidden" }}>
          <div
            style={{
              width: `${value}%`,
              height: "100%",
              background: color,
              borderRadius: 4,
              transition: "width .5s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Chip({ label, delta, para }) {
  const pos = delta >= 0;
  const txt = para ? (pos ? "+" : "") + paraFmt(delta) : (pos ? "+" : "") + delta + " " + label;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 20,
        color: pos ? C.green : "#ff9090",
        background: pos ? "#6ee7a022" : "#ff909022",
      }}
    >
      {txt}
    </span>
  );
}

/* ---------- Ortak stiller ---------- */
const cardStyle = {
  background: C.card,
  border: `1px solid ${C.cardEdge}`,
  borderRadius: 20,
  padding: "20px 18px",
};

const secenekStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: 13,
  background: "#00000022",
  border: `1px solid ${C.cardEdge}`,
  color: C.cream,
  fontSize: 15,
  fontFamily: sans,
  textAlign: "left",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: 14,
  background: C.card,
  border: `1px solid ${C.cardEdge}`,
  color: C.cream,
  fontSize: 16,
  fontFamily: sans,
  outline: "none",
};

const etiketStyle = { fontSize: 13, color: C.muted, display: "block", marginBottom: 6 };

/* ---------- Bitiş unvanı ---------- */
function unvanBul(skor, stats, para, karakter) {
  if (skor >= 88) return "Dolu dolu yaşanmış bir ömür";
  if (stats.ask >= 78) return "Sevgiyle dolu bir kalp";
  if (para >= 500000) return "Servetin gölgesinde bir hayat";
  if (stats.kariyer >= 78) return "Adı işiyle anılan biri";
  if (stats.arkadaslik >= 78) return "Dostlarıyla anılan biri";
  if (stats.saglik >= 80 && skor >= 60) return "Sağlam kalmış bir çınar";
  if (karakter.kisilikler.includes("hirsli") && skor >= 60) return "Durmayı hiç öğrenemeyen biri";
  if (karakter.kisilikler.includes("merhametli") && stats.mutluluk >= 60)
    return "Herkese bir şey bırakan biri";
  if (skor >= 50) return "Sıradan ama gerçek bir hayat";
  if (skor >= 30) return "Bir hayli çalkantılı bir yolculuk";
  return "Zorluklarla geçen bir ömür";
}
