/* Hayat Simülatörü — oyun verisi
   Renk ve ikon gibi görsel şeyler burada değil; burası saf veri. */

import type { Etiket, Etki, Evre, StatAnahtar } from "./tipler";

export const STAT_ANAHTARLARI: StatAnahtar[] = [
  "saglik",
  "mutluluk",
  "ask",
  "arkadaslik",
  "kariyer",
];

export const STAT_ADI: Record<StatAnahtar, string> = {
  saglik: "Sağlık",
  mutluluk: "Mutluluk",
  ask: "Aşk",
  arkadaslik: "Arkadaşlık",
  kariyer: "Kariyer",
};

export const MODES = [
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

export const CINSIYETLER = [
  { key: "kadin", ad: "Kadın", emoji: "♀" },
  { key: "erkek", ad: "Erkek", emoji: "♂" },
  { key: "belirsiz", ad: "Belirtmek istemiyorum", emoji: "✦" },
];

export const BASLANGICLAR = [
  {
    key: "bebek",
    ad: "Bebeklikten",
    yas: 0,
    emoji: "🍼",
    aciklama: "Her şeyi en baştan yaşa. En uzun yolculuk.",
    fx: { saglik: 4, mutluluk: 3 } as Etki,
  },
  {
    key: "cocuk",
    ad: "Çocukluktan",
    yas: 7,
    emoji: "🎒",
    aciklama: "İlk zil, ilk arkadaşlık, ilk kırgınlık.",
    fx: { arkadaslik: 3 } as Etki,
  },
  {
    key: "genc",
    ad: "Gençlikten",
    yas: 16,
    emoji: "🛹",
    aciklama: "Kalbin hızlı atıyor, sınavlar kapıda, hayat aceleci.",
    fx: { kariyer: 6, arkadaslik: 5, mutluluk: -3 } as Etki,
  },
];

export const KOKENLER = [
  {
    key: "varlikli",
    ad: "Varlıklı aile",
    emoji: "🏛️",
    aciklama: "Kapılar senin için zaten aralık. Ama sevgi ayrı bir para birimi.",
    paraCarpan: 10,
    paraEk: 40000,
    fx: { kariyer: 10, saglik: 5, mutluluk: -4, arkadaslik: -6 } as Etki,
    hikaye: "geniş ama sessiz bir evde",
  },
  {
    key: "orta",
    ad: "Orta halli",
    emoji: "🏡",
    aciklama: "Ne çok var ne çok yok. Ay sonu biraz sıkışık, gerisi yolunda.",
    paraCarpan: 1,
    paraEk: 0,
    fx: { mutluluk: 4, arkadaslik: 4 } as Etki,
    hikaye: "kalabalık bir apartman dairesinde",
  },
  {
    key: "zor",
    ad: "Zor şartlar",
    emoji: "🔧",
    aciklama: "Her şeyi kendin kazanacaksın. Bu seni erken büyütür.",
    paraCarpan: 0.2,
    paraEk: 0,
    fx: { saglik: -6, mutluluk: -7, kariyer: -3, arkadaslik: 7 } as Etki,
    hikaye: "sobayla ısınan iki odalı bir evde",
  },
  {
    key: "kimsesiz",
    ad: "Kimsesiz",
    emoji: "🕯️",
    aciklama: "Kimse yok. Sadece sen ve çok kalabalık bir dünya.",
    paraCarpan: 0.05,
    paraEk: 0,
    fx: { saglik: -8, mutluluk: -11, ask: -5, arkadaslik: -8, kariyer: 5 } as Etki,
    hikaye: "yatakhanesi hep soğuk olan bir yurtta",
  },
];

export const MESLEKLER = [
  {
    key: "doktor",
    ad: "Doktor",
    emoji: "🩺",
    aciklama: "İyileştirmek istiyorsun.",
    fx: { saglik: 5, kariyer: 4 } as Etki,
  },
  {
    key: "sanatci",
    ad: "Sanatçı",
    emoji: "🎭",
    aciklama: "Anlatmadan duramıyorsun.",
    fx: { mutluluk: 6, kariyer: -2 } as Etki,
  },
  {
    key: "muhendis",
    ad: "Mühendis",
    emoji: "📐",
    aciklama: "Her şeyi söküp takıyorsun.",
    fx: { kariyer: 6 } as Etki,
  },
  {
    key: "girisimci",
    ad: "Girişimci",
    emoji: "🚀",
    aciklama: "Fırsat kokusu alıyorsun.",
    fx: { kariyer: 3, mutluluk: 2 } as Etki,
  },
  {
    key: "sporcu",
    ad: "Sporcu",
    emoji: "🏅",
    aciklama: "Bedenin en iyi aletin.",
    fx: { saglik: 9, kariyer: 2 } as Etki,
  },
  {
    key: "belirsiz",
    ad: "Belirsiz",
    emoji: "🌫️",
    aciklama: "Henüz karar vermedin. Belki de hiç vermezsin.",
    fx: { mutluluk: 3 } as Etki,
  },
];

/** Hayat hedefi: hem öneri motorunu hem bitiş puanını yönlendirir. */
export const HEDEFLER = [
  {
    key: "servet",
    ad: "Servet kur",
    emoji: "💎",
    aciklama: "Para güvenliktir. Rakamlar büyüsün.",
    olcut: "para",
    hedefDeger: 400000,
  },
  {
    key: "ask",
    ad: "Büyük aşkı bul",
    emoji: "❤️‍🔥",
    aciklama: "Bir ömür boyu sürecek tek bir bağ.",
    olcut: "ask",
    hedefDeger: 80,
  },
  {
    key: "iz",
    ad: "Geriye iz bırak",
    emoji: "🪶",
    aciklama: "Adın senden sonra da anılsın.",
    olcut: "kariyer",
    hedefDeger: 80,
  },
  {
    key: "huzur",
    ad: "Huzurlu ol",
    emoji: "🌿",
    aciklama: "Sağlık ve iç rahatlığı her şeyin önünde.",
    olcut: "huzur",
    hedefDeger: 78,
  },
  {
    key: "zirve",
    ad: "Zirveye çık",
    emoji: "⛰️",
    aciklama: "Kariyerin tepesinde bir isim ol.",
    olcut: "kariyer",
    hedefDeger: 90,
  },
];

export const KISILIKLER = [
  {
    key: "cesur",
    ad: "Cesur",
    emoji: "🦁",
    aciklama: "Korkuyu bilirsin ama durmazsın.",
    fx: { saglik: 3 } as Etki,
  },
  {
    key: "utangac",
    ad: "Utangaç",
    emoji: "🌙",
    aciklama: "Kalabalıkta sesin kısılır.",
    fx: { arkadaslik: -5, mutluluk: 3 } as Etki,
  },
  {
    key: "hirsli",
    ad: "Hırslı",
    emoji: "🔥",
    aciklama: "Yeterli diye bir şey yok.",
    fx: { kariyer: 6, mutluluk: -3 } as Etki,
  },
  {
    key: "sadik",
    ad: "Sadık",
    emoji: "🪢",
    aciklama: "Verdiğin sözü taşırsın.",
    fx: { ask: 5, arkadaslik: 4 } as Etki,
  },
  {
    key: "umursamaz",
    ad: "Umursamaz",
    emoji: "🫠",
    aciklama: "Omuz silkmek bir yetenektir.",
    fx: { mutluluk: 5, kariyer: -4 } as Etki,
  },
  {
    key: "merhametli",
    ad: "Merhametli",
    emoji: "🤍",
    aciklama: "Başkasının derdi sende kalır.",
    fx: { arkadaslik: 6, mutluluk: 2 } as Etki,
  },
  {
    key: "kurnaz",
    ad: "Kurnaz",
    emoji: "🦊",
    aciklama: "Kısa yolu hep sen bulursun.",
    fx: { kariyer: 4, arkadaslik: -3 } as Etki,
  },
  {
    key: "durust",
    ad: "Dürüst",
    emoji: "⚖️",
    aciklama: "Yalan söylemek sana pahalıya gelir.",
    fx: { arkadaslik: 5, kariyer: -2 } as Etki,
  },
];

export const ISIMLER = {
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
    "Ece",
    "Sude",
    "Bahar",
    "Nazlı",
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
    "Efe",
    "Doruk",
    "Yusuf",
    "Levent",
  ],
};

export const KOPEK_ISIMLERI = [
  "Boncuk",
  "Karabaş",
  "Duman",
  "Paşa",
  "Zeytin",
  "Fındık",
  "Tarçın",
  "Leblebi",
];

type EtiketEtki = { fx: Etki; paraCarpan?: number; not: string };

/** Kişilik → etiket → etki tablosu. Yeni kişilik eklemek için buraya satır eklemek yeterli. */
export const KISILIK_ETKI: Record<string, Partial<Record<Etiket, EtiketEtki>>> = {
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

/** Meslek → etiket → etki tablosu. */
export const MESLEK_ETKI: Record<string, Partial<Record<Etiket, EtiketEtki>>> = {
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

/** Bir seçenekte birden çok meslek etkisi tetiklenirse önce bunlar anılır. */
export const MESLEK_IMZA_ETIKETLERI: Etiket[] = [
  "tip",
  "sanat",
  "teknik",
  "ticaret",
  "spor",
  "kesif",
];

/** Kritik stat seviyelerinde anlatının tonu değişir. */
export const TON_KURALLARI = [
  {
    test: (s: Record<StatAnahtar, number>) => s.saglik <= 18,
    cumleler: [
      "Bedenin bu günlerde her şeye itiraz ediyor; en küçük çaba bile pahalıya geliyor.",
      "Ayağa kalkarken tutunacak bir yer aramaya başladın ve bunu kimseye söylemedin.",
      "Nefesin eskisi kadar yetmiyor; her şeyi biraz daha yavaş yapıyorsun.",
    ],
  },
  {
    test: (s: Record<StatAnahtar, number>) => s.mutluluk <= 18,
    cumleler: [
      "Her şey kalın bir camın ardından oluyor gibi; sevinç bile sana uzaktan el sallıyor.",
      "Bu aralar sabahları yataktan çıkmak, günün geri kalanından daha zor.",
      "İçindeki ağırlık her şeyi gölgeliyor; güzel şeyler bile sana geç ulaşıyor.",
    ],
  },
  {
    test: (s: Record<StatAnahtar, number>) => s.arkadaslik <= 15,
    cumleler: [
      "Telefonun günlerdir sessiz. Ne arayan var, ne arayacağın.",
      "Bunu anlatabileceğin birini düşündün ve listede kimse çıkmadı.",
    ],
  },
  {
    test: (s: Record<StatAnahtar, number>) => s.ask <= 12,
    cumleler: [
      "Yatağın bir yanı hep soğuk kalıyor ve buna alıştığını fark etmek daha da ağır.",
      "Eve döndüğünde ışığı açan kimse olmuyor; bunu artık düşünmemeye çalışıyorsun.",
    ],
  },
  {
    test: (s: Record<StatAnahtar, number>) => s.mutluluk >= 88,
    cumleler: [
      "Bu aralar içinde bir hafiflik var; en sıradan gün bile sana bir şey bırakıyor.",
      "Uzun zamandır kendini bu kadar yerinde hissetmemiştin.",
      "Bugünlerde gülmek için pek sebep aramıyorsun, kendiliğinden geliyor.",
    ],
  },
];

export const EVRE_ADI: Record<Evre, string> = {
  bebek: "Bebeklik",
  cocuk: "Çocukluk",
  genc: "Gençlik",
  gencYetiskin: "Genç yetişkinlik",
  yetiskin: "Yetişkinlik",
  orta: "Orta yaş",
  yasli: "Yaşlılık",
};

export function evreBul(yas: number): Evre {
  if (yas <= 6) return "bebek";
  if (yas <= 12) return "cocuk";
  if (yas <= 19) return "genc";
  if (yas <= 35) return "gencYetiskin";
  if (yas <= 55) return "yetiskin";
  if (yas <= 70) return "orta";
  return "yasli";
}
