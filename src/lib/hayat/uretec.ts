/* Hayat Simülatörü — prosedürel sahne üreteci

   Amaç: aynı sorunun bir daha çıkmaması. Sahneler sabit metin değil;
   kalıp + yuva (mekân/zaman) + sonuç varyantı + etki aralığı birleşiminden
   üretiliyor. Tek bir kalıp yüzlerce farklı sahneye açılıyor.

   Her kalıp tek bir yaş bandına bağlı, yani 60 yaşında okul sahnesi ya da
   7 yaşında iş görüşmesi çıkmıyor. */

import type { Alan, Etiket, Etki, Evre, Olay, Secenek, StatAnahtar } from "./tipler";

type Aralik = [number, number];
type EtkiAraligi = Partial<Record<StatAnahtar, Aralik>>;

type SecenekKalibi = {
  t: string[];
  etiketler: Etiket[];
  fx: EtkiAraligi;
  para?: Aralik;
  sonuc: string[];
  riskli?: number;
  kotu?: { fx: EtkiAraligi; para?: Aralik; sonuc: string[] };
  /** Zincir olaylarını tetikleyen işaretler. */
  bayrak?: string[];
  onemli?: boolean;
};

type SahneKalibi = {
  id: string;
  evreler: Evre[];
  alan: Alan;
  emoji: string[];
  baslik: string[];
  durum: string[];
  secenekler: SecenekKalibi[];
  /** Sahnenin çıkması için gereken/engelleyen koşullar. */
  gerek?: Olay["gerek"];
  /** Seçim hakkı yok: olan olmuş, oyuncu okuyup devam eder. */
  zorunlu?: boolean;
  /** Sadece +18 modunda çıkar. */
  yetiskin?: boolean;
};

/* ---------- Yuvalar ---------- */

const MEKANLAR: Record<Evre, string[]> = {
  bebek: [
    "salondaki halının ortasında",
    "mutfağın kapısında",
    "apartmanın merdiven boşluğunda",
    "parkın kum havuzunun kenarında",
    "komşunun balkonunda",
  ],
  cocuk: [
    "okulun arka bahçesinde",
    "mahallenin bakkalının önünde",
    "sınıfın en arka sırasında",
    "apartmanın kömürlük merdiveninde",
    "pazar yerinin kalabalığında",
    "boş arsadaki kale direklerinin arasında",
  ],
  genc: [
    "okulun kantininde",
    "kütüphanenin en arka masasında",
    "sahil yolunun korkuluklarında",
    "servis beklenen durakta",
    "birinin evinin bodrum katında",
    "spor salonunun soyunma odasında",
  ],
  gencYetiskin: [
    "ofisin çay mutfağında",
    "sabah kalabalığındaki metro vagonunda",
    "kirası zor ödenen dairenin salonunda",
    "gece açık büfenin önünde",
    "iş çıkışı uğradığın kafede",
    "havaalanının bekleme salonunda",
  ],
  yetiskin: [
    "toplantı odasının camının önünde",
    "veli toplantısının koridorunda",
    "banka kuyruğunun ortasında",
    "hafta sonu alışveriş merkezinin otoparkında",
    "servis aracının arka koltuğunda",
    "site yönetiminin toplantı salonunda",
  ],
  orta: [
    "hastane bekleme salonunda",
    "yıllardır gittiğin berberin koltuğunda",
    "bahçedeki asmanın altında",
    "bir dostun taziye evinde",
    "emlakçının vitrininin önünde",
    "kapanmak üzere olan eski bir dükkânda",
  ],
  yasli: [
    "balkondaki koltuğunda",
    "muayenehane koridorunda",
    "torunların koştuğu oyun bahçesinde",
    "cami avlusunun serinliğinde",
    "sahildeki tahta bankta",
    "yıllardır aynı yerde duran çay ocağında",
  ],
};

const ZAMANLAR = [
  "sabahın köründe",
  "öğle sıcağında",
  "gün batarken",
  "gece yarısına doğru",
  "yağmurlu bir salı akşamı",
  "bayram sabahı",
  "ay sonuna üç gün kala",
  "ilk kar düşerken",
  "cumartesi öğleden sonra",
  "elektrikler kesildiği o akşam",
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

/* ---------- Sahne kalıpları ---------- */
const KALIPLAR: SahneKalibi[] = [
  /* ===== BEBEKLİK ===== */
  {
    id: "u-b1",
    evreler: ["bebek"],
    alan: "aile",
    emoji: ["🧸", "🍼", "🪆"],
    baslik: ["Yeni Bir Şey", "Küçük Keşif", "İlk Kez"],
    durum: [
      "{mekan}, {zaman}: daha önce hiç görmediğin bir şey ilgini çekti ve doğruca ona gidiyorsun.",
      "{zaman} {mekan} yeni bir sesin peşine düştün. Kimse durdurmuyor, kimse de yardım etmiyor.",
    ],
    secenekler: [
      {
        t: ["Dokun, karıştır", "Elini uzat"],
        etiketler: ["kesif", "cesaret"],
        fx: { mutluluk: [5, 10], saglik: [-3, 0], kariyer: [1, 4] },
        sonuc: [
          "Elini uzattın ve dünyanın nasıl çalıştığına dair minik bir bilgi daha topladın. Bir yerin çizildi ama umursamadın.",
          "Ne olduğunu anlayana kadar bırakmadın. Merakın yorulmak nedir bilmiyor ve bu huyun hiç geçmeyecek.",
        ],
      },
      {
        t: ["Uzaktan izle", "Önce bak, sonra karar ver"],
        etiketler: ["guvenli", "yalniz"],
        fx: { mutluluk: [1, 4], saglik: [1, 3], kariyer: [2, 5] },
        sonuc: [
          "Yaklaşmadın, oturduğun yerden uzun uzun izledin. Anlamadan atılmamayı daha konuşmayı öğrenmeden öğrendin.",
          "Bir adım geri durdun. Etrafındakiler 'ne sakin çocuk' dedi; sen sadece hesap yapıyordun.",
        ],
      },
    ],
  },
  {
    id: "u-b2",
    evreler: ["bebek"],
    alan: "saglik",
    emoji: ["🤒", "🍎", "🥄"],
    baslik: ["Yemek Savaşı", "Kaşık Meselesi"],
    durum: [
      "{zaman} önüne bir tabak kondu. İçindekini hiç sevmedin ve bunu belli ediyorsun.",
      "Mutfakta bir pazarlık sürüyor: bir kaşık daha. Herkes seni ikna etmeye çalışıyor.",
    ],
    secenekler: [
      {
        t: ["Ye bitir", "Kaşığı kendin al"],
        etiketler: ["guvenli"],
        fx: { saglik: [4, 9], mutluluk: [-2, 2] },
        sonuc: [
          "Suratını ekşiterek de olsa bitirdin. Akşam yatağa girerken karnın tok, herkes memnundu.",
          "Kaşığı elinden kaptın ve etrafı batırarak yedin. Yarısı üstüne gitti ama bu senin zaferindi.",
        ],
      },
      {
        t: ["Kafanı çevir, reddet", "Tabağı it"],
        etiketler: ["kacinma", "bencil"],
        fx: { saglik: [-6, -2], mutluluk: [2, 6] },
        sonuc: [
          "Tabak geri gitti, yerine sevdiğin bir şey geldi. Nasıl direneceğini o gün öğrendin ve bir daha unutmadın.",
          "Ağzını kapattın ve açmadın. Kazandın ama o akşam huysuz uyudun.",
        ],
      },
    ],
  },
  {
    id: "u-b3",
    evreler: ["bebek"],
    alan: "arkadaslik",
    emoji: ["👶", "🫧", "🎈"],
    baslik: ["Öbür Çocuk", "Yan Yana"],
    durum: [
      "{mekan} senin yaşlarında bir çocuk var. İkiniz de birbirinize bakıyorsunuz.",
      "{zaman} tanımadığın bir çocuk yanına oturdu ve elindekini sana uzattı.",
    ],
    secenekler: [
      {
        t: ["Yanına git", "Sen de bir şey uzat"],
        etiketler: ["sosyal", "yardim"],
        fx: { arkadaslik: [5, 10], mutluluk: [3, 7] },
        sonuc: [
          "Kelime kullanmadan anlaştınız. Yarım saat sonra ikiniz de aynı şeye gülüyordunuz.",
          "Elindekini paylaştın. Anneler birbirine gülümsedi, siz oyununuza devam ettiniz.",
        ],
      },
      {
        t: ["Anneni ara", "Geri çekil"],
        etiketler: ["kacinma", "yalniz"],
        fx: { arkadaslik: [-4, -1], mutluluk: [0, 3] },
        sonuc: [
          "Tanıdık bir bacağa sarıldın ve oradan izledin. Yabancılık sana zor geliyor, bunu çok erken fark ettin.",
          "Geri çekildin. Öbür çocuk bir süre bekledi, sonra başka bir yere gitti.",
        ],
      },
    ],
  },
  {
    id: "u-b4",
    evreler: ["bebek"],
    alan: "hayat",
    emoji: ["🌙", "🛏️", "⭐"],
    baslik: ["Uyku Vakti", "Gece Yarısı"],
    durum: [
      "{zaman} herkes uyudu ama senin gözlerin fal taşı gibi açık.",
      "Işıklar kapandı. Karanlık bu gece sana biraz fazla büyük geliyor.",
    ],
    secenekler: [
      {
        t: ["Ağla, birini çağır", "Sesini duyur"],
        etiketler: ["sosyal", "cesaret"],
        fx: { mutluluk: [4, 8], arkadaslik: [2, 5], saglik: [-2, 1] },
        sonuc: [
          "Birkaç saniye içinde bir kapı açıldı ve bir kucak seni aldı. İstemenin işe yaradığını öğrendin.",
          "Sesini duyurdun ve karşılık aldın. Bu basit ders yıllarca işine yarayacak.",
        ],
      },
      {
        t: ["Kendi kendine uyu", "Sessizce bekle"],
        etiketler: ["yalniz", "guvenli"],
        fx: { saglik: [2, 5], mutluluk: [-3, 2], kariyer: [1, 3] },
        sonuc: [
          "Kimseyi çağırmadan, dönüp dolaşıp kendin uyudun. Kendi başına kalmayı erken öğrenen çocuklardan oldun.",
          "Sabaha kadar ses çıkarmadın. Sabah kimse bir şey fark etmedi ve bu da sana normal geldi.",
        ],
      },
    ],
  },

  /* ===== ÇOCUKLUK ===== */
  {
    id: "u-c1",
    evreler: ["cocuk"],
    alan: "okul",
    emoji: ["📕", "✏️", "🧮"],
    baslik: ["Ödev", "Tahtaya Kalk", "Not Defteri"],
    durum: [
      "{zaman} {mekan} öğretmen adını okudu: yarınki gösteri için bir kişi gerekiyor.",
      "Ödevini yapmadın ve öğretmen tam da bugün defterleri toplayacağını söyledi.",
    ],
    secenekler: [
      {
        t: ["Doğruyu söyle", "Elini kaldır, üstlen"],
        etiketler: ["durustluk", "cesaret"],
        fx: { mutluluk: [2, 6], arkadaslik: [3, 7], kariyer: [2, 5] },
        sonuc: [
          "Ayağa kalkıp yapmadığını söyledin. Öğretmen bir süre baktı, sonra 'yarın getir' dedi. Sınıfta kimse gülmedi.",
          "Kimse elini kaldırmazken sen kaldırdın. Ertesi gün herkesin önünde biraz titredin ama bitirdin.",
        ],
      },
      {
        t: ["Bir bahane uydur", "Sıranın altına saklan"],
        etiketler: ["hile", "kacinma"],
        fx: { mutluluk: [-4, 1], kariyer: [-4, -1], arkadaslik: [-2, 2] },
        sonuc: [
          "Uydurduğun bahane tuttu ama bütün ders içine bir taş oturdu. Kurtulmak her zaman rahatlamak değilmiş.",
          "Başını eğdin ve sıra sana gelmeden zil çaldı. O gün ucuz atlattın, ertesi gün aynı korkuyla uyandın.",
        ],
      },
      {
        t: ["Bu akşam telafi et", "Oturup çalış"],
        etiketler: ["calisma", "teknik"],
        fx: { kariyer: [4, 9], mutluluk: [-3, 1], saglik: [-2, 0] },
        sonuc: [
          "Akşam masaya oturdun ve gecikmeyi kapattın. Kimse övmedi ama defterin temizdi.",
          "Oyunu bırakıp çalıştın. Ertesi gün öğretmenin gözünde bir şey değişti, sen de fark ettin.",
        ],
      },
    ],
  },
  {
    id: "u-c2",
    evreler: ["cocuk"],
    alan: "arkadaslik",
    emoji: ["⚽", "🏃", "🤾"],
    baslik: ["Takım Seçimi", "Oyunun Ortası"],
    durum: [
      "{mekan} takımlar seçiliyor ve sen en son kalanlardansın.",
      "{zaman} oyunun kuralları yüzünden kavga çıktı. Herkes senin ne diyeceğine bakıyor.",
    ],
    secenekler: [
      {
        t: ["Araya gir, barıştır", "Kuralı sen söyle"],
        etiketler: ["sosyal", "durustluk"],
        fx: { arkadaslik: [5, 10], mutluluk: [2, 6] },
        sonuc: [
          "İki tarafı da dinledin ve ortada bir yol buldun. Oyun devam etti; o günden sonra tartışmalarda sana danışıldı.",
          "Sesini yükseltmeden konuştun ve şaşırtıcı biçimde herkes sustu. Küçük bir otorite kazandın.",
        ],
      },
      {
        t: ["Kendi tarafını tut", "Kavgaya karış"],
        etiketler: ["cesaret", "bencil"],
        fx: { arkadaslik: [-5, 2], mutluluk: [1, 5], saglik: [-5, -1] },
        sonuc: [
          "Bağırdın, itiştin, dizin kanadı. Oyun yarıda kaldı ama kimse seni ezemedi.",
          "Tarafını seçtin ve arkasında durdun. Kazandığın kişiler oldu, kaybettiklerin de.",
        ],
      },
      {
        t: ["Çekil, eve git", "Boş ver, uzaklaş"],
        etiketler: ["kacinma", "yalniz"],
        fx: { arkadaslik: [-6, -2], mutluluk: [-3, 3], saglik: [1, 3] },
        sonuc: [
          "Çantanı alıp yürüdün. Arkandan seslenen olmadı ve bu, kavgadan daha çok canını yaktı.",
          "Gürültüden uzaklaştın. Evde sakinlik vardı ama akşam pencereden onların hâlâ oynadığını gördün.",
        ],
      },
    ],
  },
  {
    id: "u-c3",
    evreler: ["cocuk"],
    alan: "para",
    emoji: ["🍬", "🪙", "🛒"],
    baslik: ["Harçlık", "Bakkal Hesabı"],
    durum: [
      "{mekan} elinde bir harçlık var ve iki şey arasında kalmışsın.",
      "{zaman} bakkal para üstünü fazla verdi. Fark etmedi.",
    ],
    secenekler: [
      {
        t: ["Fazlasını geri ver", "Doğrusunu yap"],
        etiketler: ["durustluk"],
        fx: { mutluluk: [3, 7], arkadaslik: [2, 6] },
        para: [-40, -10],
        sonuc: [
          "Geri döndün ve parayı uzattın. Bakkal gözlüğünün üstünden sana baktı; o günden sonra sana hep bir şeker fazla verdi.",
          "'Fazla vermişsiniz' dedin. Küçük bir andı ama içinde büyük bir şey yerine oturdu.",
        ],
      },
      {
        t: ["Cebe at, sus", "Kimse görmedi zaten"],
        etiketler: ["hile", "bencil"],
        fx: { mutluluk: [-3, 3] },
        para: [30, 90],
        sonuc: [
          "Parayı cebine attın ve hızlı adımlarla uzaklaştın. O hafta cebin doluydu, içinde bir şey ise eksikti.",
          "Sesini çıkarmadın. Kimse fark etmedi; bunu fark eden tek kişi sendin.",
        ],
      },
      {
        t: ["Arkadaşlarınla paylaş", "Herkese ısmarla"],
        etiketler: ["yardim", "sosyal"],
        fx: { arkadaslik: [6, 11], mutluluk: [3, 8] },
        para: [-90, -40],
        sonuc: [
          "Aldıklarını ortaya koydun ve hepsi bir anda bitti. Mahallede o gün en popüler çocuk sendin.",
          "Paranı paylaştın. Yarın kendine bir şey kalmadı ama bugün herkes yanındaydı.",
        ],
      },
    ],
  },
  {
    id: "u-c4",
    evreler: ["cocuk"],
    alan: "aile",
    emoji: ["🏠", "🔇", "🚪"],
    baslik: ["Kapalı Kapı", "Evdeki Ses"],
    durum: [
      "{zaman} evde yüksek sesle konuşuluyor ve senin duymaman gerekiyor.",
      "Odandan çıkmadın ama duvarlar ince. Sofrada kimse bir şey olmamış gibi davranıyor.",
    ],
    secenekler: [
      {
        t: ["Sor, konuş", "Ne olduğunu öğren"],
        etiketler: ["durustluk", "cesaret"],
        fx: { mutluluk: [-4, 3], arkadaslik: [2, 5], saglik: [-2, 1] },
        sonuc: [
          "Sofrada 'ne oluyor?' diye sordun. Bir sessizlik oldu, sonra sana yaşına uygun bir cevap verildi. Yine de dinlenmiş olmak iyi geldi.",
          "Soru sordun ve büyükler şaşırdı. Tam cevap alamadın ama görünmez olmadığını anladın.",
        ],
      },
      {
        t: ["Duymamış gibi yap", "Odana çekil"],
        etiketler: ["kacinma", "yalniz"],
        fx: { mutluluk: [-5, -1], saglik: [-2, 1], kariyer: [1, 4] },
        sonuc: [
          "Kulaklarını kapattın ve bir şeyler çizdin. Ev sakinleşti ama o ses aklında bir yerde kaldı.",
          "Görmezden geldin. Büyüklerin dünyası sana biraz daha uzaklaştı ve sen kendi dünyanı kurmaya başladın.",
        ],
      },
    ],
  },
  {
    id: "u-c5",
    evreler: ["cocuk"],
    alan: "hayvan",
    emoji: ["🐈", "🐦", "🐢"],
    baslik: ["Yaralı Kanat", "Küçük Misafir"],
    durum: [
      "{mekan} kanadı yaralı bir kuş buldun. Kimse durup bakmıyor.",
      "{zaman} bir kedi arkandan geliyor ve durduğunda o da duruyor.",
    ],
    secenekler: [
      {
        t: ["Bak, iyileştirmeye çalış", "Eve götür"],
        etiketler: ["yardim", "tip"],
        fx: { mutluluk: [5, 10], saglik: [-2, 1], arkadaslik: [1, 4] },
        para: [-200, -40],
        sonuc: [
          "Bir kutu, birkaç bez ve internetten bakılmış birkaç bilgi. İki hafta sonra uçtuğunu gördüğünde bağırarak sevindin.",
          "Elinden geleni yaptın. Hepsi kurtulmadı ama denemek sende bir şey açtı; ilgin oraya kaydı.",
        ],
      },
      {
        t: ["Bir yetişkine haber ver", "Yardım çağır"],
        etiketler: ["guvenli", "sosyal"],
        fx: { mutluluk: [2, 5], arkadaslik: [2, 5] },
        sonuc: [
          "Koşup birini buldun ve olayı anlattın. Sen çözmedin ama çözülmesini sağladın.",
          "Doğru kişiyi bulmak da bir beceri. O gün bunu yaptın ve kimse sana bunu öğretmemişti.",
        ],
      },
      {
        t: ["Geç git", "Karışma"],
        etiketler: ["kacinma", "bencil"],
        fx: { mutluluk: [-5, -1] },
        sonuc: [
          "Adımlarını hızlandırdın. Ertesi gün aynı yerden geçerken gözlerini kaçırdın.",
          "Karışmadın. Küçük bir şeydi ama akşam yatakta aklına geldi.",
        ],
      },
    ],
  },

  /* ===== GENÇLİK ===== */
  {
    id: "u-g1",
    evreler: ["genc"],
    alan: "okul",
    emoji: ["📝", "⏰", "📊"],
    baslik: ["Deneme Sınavı", "Sonuç Günü", "Ders Programı"],
    durum: [
      "{zaman} sonuçlar açıklandı ve beklediğin gibi değil. {mekan} telefonuna bakıp duruyorsun.",
      "Önünde bir program var: uyku, ders, biraz da hayat. Üçü aynı anda sığmıyor.",
    ],
    secenekler: [
      {
        t: ["Programı sıkılaştır", "Eksiklerin üstüne git"],
        etiketler: ["calisma", "teknik"],
        fx: { kariyer: [6, 12], saglik: [-7, -2], mutluluk: [-5, 0] },
        sonuc: [
          "Uyku saatinden çaldın ve konuların üstüne gittin. Bir sonraki denemede rakamlar döndü ama gözlerinin altı da öyle.",
          "Yanlışlarını tek tek çıkardın, kimseye danışmadan. İlerleme yavaştı ama gerçekti.",
        ],
      },
      {
        t: ["Yardım iste", "Birine sor"],
        etiketler: ["sosyal", "durustluk"],
        fx: { kariyer: [4, 8], arkadaslik: [3, 7], mutluluk: [1, 5] },
        sonuc: [
          "Anlamadığını söylemek ilk cümlede zor, ikinci cümlede kolaydı. Birlikte çalıştığınız o akşamlar hem notunu hem çevreni büyüttü.",
          "Sormak zayıflık değilmiş. Bunu öğrendiğin gün, öğrendiğin her şeyden değerliydi.",
        ],
      },
      {
        t: ["Bugünlük bırak", "Kafanı dağıt"],
        etiketler: ["tembellik", "kacinma"],
        fx: { mutluluk: [4, 9], saglik: [2, 5], kariyer: [-6, -2] },
        sonuc: [
          "Kitapları kapattın ve dışarı çıktın. Kafan gerçekten dağıldı; sonuçlar da öyle.",
          "Bir gün mola verdin, gün üçe çıktı. Dinlendin ama açığın büyüdü.",
        ],
      },
    ],
  },
  {
    id: "u-g2",
    evreler: ["genc"],
    alan: "ask",
    emoji: ["💬", "📱", "🌸"],
    baslik: ["Mesaj", "Bekleyen Yanıt", "İki Satır"],
    durum: [
      "{zaman} biri sana yazdı ve ekranda 'yazıyor...' yazısını on dakikadır izliyorsun.",
      "{mekan} biri seninle konuşmak için bekliyor. Ne diyeceğini bilmiyorsun ama kalbin biliyor.",
    ],
    secenekler: [
      {
        t: ["Açık konuş", "Ne hissettiğini söyle"],
        etiketler: ["cesaret", "romantik", "durustluk"],
        fx: { ask: [6, 13], mutluluk: [3, 8], saglik: [-3, 0] },
        sonuc: [
          "Cümleyi kurarken kulaklarının uğuldadığını duydun ama kurdun. Karşındaki gülümsedi ve o gülümseme haftalarca yetti.",
          "Söylemek istediğini süslemeden söyledin. Sonuç ne olursa olsun, kendinle barışık uyudun.",
        ],
      },
      {
        t: ["Şakaya vur", "Konuyu değiştir"],
        etiketler: ["kacinma", "hile"],
        fx: { ask: [-6, -1], mutluluk: [-4, 2], arkadaslik: [0, 3] },
        sonuc: [
          "Bir espriyle geçiştirdin, ikiniz de güldünüz. Sonra konu bir daha hiç açılmadı.",
          "Anı savuşturdun. Rahatladın ama o gece uzun uzun tavana baktın.",
        ],
      },
      {
        t: ["Yanıtlama, bekle", "Biraz zaman tanı"],
        etiketler: ["yalniz", "guvenli"],
        fx: { ask: [-3, 3], mutluluk: [-3, 2], kariyer: [1, 3] },
        sonuc: [
          "Telefonu ters çevirdin ve o akşam açmadın. Ertesi gün her şey biraz daha soğuktu.",
          "Acele etmedin. Bazı şeyler beklemeyi kaldırır, bazıları kalkıp gider; hangisi olduğunu sonra öğreneceksin.",
        ],
      },
    ],
  },
  {
    id: "u-g3",
    evreler: ["genc"],
    alan: "arkadaslik",
    emoji: ["🎧", "🛹", "🌃"],
    baslik: ["Grup Kararı", "Herkes Gidiyor"],
    durum: [
      "{zaman} grup bir şey yapmaya karar verdi ve senin içine sinmiyor.",
      "{mekan} arkadaşların seni bir şeye ikna etmeye çalışıyor. Hayır demek zor.",
    ],
    secenekler: [
      {
        t: ["Hayır de", "Kendi kararını ver"],
        etiketler: ["durustluk", "cesaret"],
        fx: { arkadaslik: [-5, 2], mutluluk: [2, 7], saglik: [2, 5] },
        sonuc: [
          "'Ben yokum' dedin ve nedenini açıklamadın. Bir kişi kaşını kaldırdı, diğerleri geçti gitti. Kendine olan güvenin biraz büyüdü.",
          "Kalabalığa uymamak o yaşta pahalı bir şey. Ödedin ve buna değdi.",
        ],
      },
      {
        t: ["Uy, birlikte git", "Kalabalığa katıl"],
        etiketler: ["sosyal", "risk"],
        fx: { arkadaslik: [5, 10], mutluluk: [3, 8], saglik: [-6, -1] },
        sonuc: [
          "Sonu iyi bitti ve o geceyi yıllarca anlattınız. İçindeki o küçük tereddüdü kimseye söylemedin.",
          "Herkesle gittin ve arada kayboldun. Eğlendin, biraz da kendini kaybettin.",
        ],
      },
    ],
  },
  {
    id: "u-g4",
    evreler: ["genc"],
    alan: "para",
    emoji: ["💼", "🧃", "🪧"],
    baslik: ["İlk İş", "Yaz Çalışması"],
    durum: [
      "{zaman} yaz için bir iş çıktı: uzun saatler, düşük para, hiç teşekkür yok.",
      "{mekan} bir tanıdık 'gel bize yardım et, harçlığın çıkar' diyor.",
    ],
    secenekler: [
      {
        t: ["Kabul et, çalış", "Yazı işte geçir"],
        etiketler: ["calisma", "ticaret"],
        fx: { kariyer: [5, 10], saglik: [-5, -1], mutluluk: [-3, 3] },
        para: [1500, 6000],
        sonuc: [
          "Ayakların şişti, sırtın ağrıdı ve ilk maaşını aldığın gün elin titredi. Paranın ağırlığını o gün öğrendin.",
          "Yaz boyunca çalıştın. Arkadaşların denizdeyken sen kasadaydın; ama eylülde kimseden bir şey istemedin.",
        ],
      },
      {
        t: ["Reddet, yazı yaşa", "Bu yaz benim"],
        etiketler: ["tembellik", "kesif"],
        fx: { mutluluk: [6, 11], arkadaslik: [3, 7], kariyer: [-4, -1] },
        sonuc: [
          "O yaz hiçbir şey üretmedin ve her şeyi yaşadın. Sonradan aklına geldiğinde hep gülümsedin.",
          "Çalışmadın. Cebin boştu ama o yazın fotoğrafları hâlâ en sevdiklerin arasında.",
        ],
      },
    ],
  },
  {
    id: "u-g5",
    evreler: ["genc"],
    alan: "saglik",
    emoji: ["🏋️", "🥤", "😴"],
    baslik: ["Ayna Karşısında", "Beden Meselesi"],
    durum: [
      "{zaman} aynada kendine baktın ve gördüğün şey hoşuna gitmedi.",
      "{mekan} biri bedeninle ilgili bir laf etti ve o laf gitmiyor.",
    ],
    secenekler: [
      {
        t: ["Spora başla", "Düzenli bir şey kur"],
        etiketler: ["spor", "calisma"],
        fx: { saglik: [7, 13], mutluluk: [3, 8], kariyer: [0, 3] },
        para: [-1500, -300],
        sonuc: [
          "İlk hafta her yerin ağrıdı, ikinci hafta bırakmayı düşündün, üçüncü hafta alıştın. Aynadaki değişimden çok, dayanabildiğini görmek işe yaradı.",
          "Bir düzen kurdun ve sürdürdün. Bedeninle aran ilk kez kavga değil, ortaklık oldu.",
        ],
      },
      {
        t: ["Aldırma, geç", "Sözü kafana takma"],
        etiketler: ["tembellik", "kacinma"],
        fx: { saglik: [-6, -1], mutluluk: [-4, 3] },
        sonuc: [
          "'Boş ver' dedin ve gerçekten de bir süre unuttun. Sonra aynı laf başka bir ağızdan tekrar geldi.",
          "Üstünde durmadın. Bazen bu olgunluk, bazen sadece erteleme; hangisi olduğunu sen de bilmiyorsun.",
        ],
      },
      {
        t: ["Söyleyene karşılık ver", "Sınırını çiz"],
        etiketler: ["cesaret", "durustluk"],
        fx: { arkadaslik: [-3, 4], mutluluk: [3, 8], saglik: [0, 3] },
        sonuc: [
          "Sakin ama net konuştun. Ortam bir an sessizleşti; o kişi bir daha aynı şeyi söylemedi.",
          "Karşılık verdin ve sesin titremedi. Kendine saygın o gün bir kat arttı.",
        ],
      },
    ],
  },
  {
    id: "u-g6",
    evreler: ["genc"],
    alan: "hayat",
    emoji: ["🎬", "🎸", "🖊️"],
    baslik: ["Bir Şeye Merak", "Yeni Uğraş"],
    durum: [
      "{zaman} tesadüfen bir şeye denk geldin ve saatlerce onunla uğraştın.",
      "{mekan} birinin yaptığı şeyi izlerken içinden 'ben de yapabilirim' geçti.",
    ],
    secenekler: [
      {
        t: ["Ciddiye al, devam et", "Peşine düş"],
        etiketler: ["sanat", "kesif"],
        fx: { mutluluk: [6, 11], kariyer: [3, 8], saglik: [-2, 1] },
        para: [-2000, -200],
        sonuc: [
          "Gereken şeyleri biriktirip aldın ve her gün biraz uğraştın. Kimse görmedi ama sen bir şeye sahip oldun.",
          "Bir uğraşın olduğunu fark ettiğinde, günlerin şekli değişti. Sıkıldığın zamanlar azaldı.",
        ],
      },
      {
        t: ["Hevesin geçsin diye bekle", "Şimdilik rafa kaldır"],
        etiketler: ["guvenli", "tembellik"],
        fx: { mutluluk: [-4, 2], kariyer: [-2, 1] },
        sonuc: [
          "'Sonra' dedin ve gerçekten sonraya kaldı. Yıllar sonra o şeyi yapan birini gördüğünde içinde bir kıpırtı oldu.",
          "Heves geçti mi, yoksa sen mi bıraktın; bunu hiç netleştiremedin.",
        ],
      },
    ],
  },

  /* ===== GENÇ YETİŞKİNLİK ===== */
  {
    id: "u-y1",
    evreler: ["gencYetiskin"],
    alan: "kariyer",
    emoji: ["🗂️", "📌", "💻"],
    baslik: ["Fazla Mesai", "Kimsenin İstemediği İş", "Toplantı"],
    durum: [
      "{zaman} {mekan} kimsenin sahiplenmediği bir iş masaya kondu ve gözler sana döndü.",
      "Yöneticin senden bir şey istiyor: bu hafta sonu da çalışmanı. Karşılığında belirsiz bir 'sonra hallederiz'.",
    ],
    secenekler: [
      {
        t: ["Üstlen, bitir", "Ben yaparım de"],
        etiketler: ["calisma", "teknik"],
        fx: { kariyer: [6, 12], saglik: [-7, -2], mutluluk: [-4, 2] },
        para: [1000, 7000],
        sonuc: [
          "İşi aldın ve beklenenden temiz bitirdin. Adın toplantılarda geçmeye başladı; uykun ise azaldı.",
          "Kimsenin dokunmadığı dosyayı çözdün. Teşekkür kısa oldu ama itibarın kalıcı.",
        ],
      },
      {
        t: ["Sınır koy, reddet", "Bu hafta sonu benim"],
        etiketler: ["durustluk", "guvenli"],
        fx: { kariyer: [-5, 0], saglik: [4, 9], mutluluk: [3, 8] },
        sonuc: [
          "'Bu hafta sonu müsait değilim' dedin ve açıklama yapmadın. Ortam bir an gerildi, sonra normale döndü. Dünya yıkılmadı.",
          "Hayır demeyi denedin ve işe yaradı. Pazartesi kimse konuyu açmadı.",
        ],
      },
      {
        t: ["Başkasına yıka", "Uygun birini öner"],
        etiketler: ["hile", "bencil"],
        fx: { kariyer: [1, 5], arkadaslik: [-7, -2], mutluluk: [-2, 3] },
        sonuc: [
          "Ustaca başka bir isim önerdin ve konu kapandı. O kişi işi bitirdi, sana bir daha aynı gözle bakmadı.",
          "Kendini kurtardın. Ekipte kimse bir şey demedi ama masa arkadaşlığı bitti.",
        ],
      },
    ],
  },
  {
    id: "u-y2",
    evreler: ["gencYetiskin"],
    alan: "para",
    emoji: ["🧾", "💳", "🏦"],
    baslik: ["Ay Sonu", "Beklenmedik Fatura", "Zam Görüşmesi"],
    durum: [
      "{zaman} beklemediğin bir masraf çıktı ve hesabın buna hazır değil.",
      "{mekan} zam konuşmasına gireceksin. Rakamı söylemek en zor kısmı.",
    ],
    secenekler: [
      {
        t: ["Rakamı yüksek söyle", "Hakkını iste"],
        etiketler: ["cesaret", "ticaret"],
        fx: { kariyer: [3, 8], mutluluk: [1, 6], saglik: [-3, 0] },
        para: [4000, 18000],
        riskli: 0.3,
        kotu: {
          fx: { kariyer: [-6, -2], mutluluk: [-8, -3] },
          sonuc: [
            "Rakamı duyunca odada bir sessizlik oldu. 'Bütçe yok' dediler ve o günden sonra sana biraz mesafeli davrandılar.",
            "İstediğini alamadın, üstüne bir de fazla istemiş gibi hissettirildin. Odadan çıkarken kulakların yanıyordu.",
          ],
        },
        sonuc: [
          "Rakamı söyledin ve sonrasında sustun — asıl zor olan o sessizlikti. Karşı taraf önce kaşlarını çattı, sonra kabul etti.",
          "İstediğini net söyledin ve aldın. Kendi değerini yüksek sesle söylemenin bir bedeli yokmuş.",
        ],
      },
      {
        t: ["Kemer sık, idare et", "Masrafı kıs"],
        etiketler: ["guvenli", "calisma"],
        fx: { mutluluk: [-5, 0], saglik: [-3, 1], kariyer: [0, 3] },
        para: [500, 3000],
        sonuc: [
          "Listeden bir sürü şey çıkardın ve ayı zar zor kapattın. Kimseye söylemedin; bu senin sessiz mücadelen oldu.",
          "Harcamalarını daralttın. Sıkıcıydı ama borçlanmadan çıktın ve bu da bir başarı.",
        ],
      },
      {
        t: ["Kredi kartına yükle", "Sonra düşünürüm"],
        etiketler: ["risk", "kacinma"],
        fx: { mutluluk: [2, 6], saglik: [-4, 0] },
        para: [6000, 15000],
        sonuc: [
          "Kartı uzattın ve o an rahatladın. Ekstre geldiğinde rahatlama yerini bir taşa bıraktı.",
          "Bugünü kurtardın, yarını ipotek ettin. Bunu yaparken bile biliyordun.",
        ],
      },
    ],
  },
  {
    id: "u-y3",
    evreler: ["gencYetiskin"],
    alan: "ask",
    emoji: ["🍷", "🌙", "💐"],
    baslik: ["Üçüncü Buluşma", "Tanıdık Bir Yüz"],
    durum: [
      "{zaman} {mekan} biriyle buluşuyorsun ve bu üçüncü sefer. Artık bir karar noktası var.",
      "Arkadaşların biriyle tanıştırmak istiyor. Sen 'gerek yok' demek üzereydin.",
    ],
    gerek: { yokIliski: "es" },
    secenekler: [
      {
        t: ["İlerlet, açıl", "Ciddiye al"],
        etiketler: ["romantik", "cesaret"],
        fx: { ask: [7, 14], mutluluk: [4, 9] },
        sonuc: [
          "Kendinle ilgili söylemesi zor bir şeyi söyledin ve karşındaki kaçmadı. O akşam ikiniz de biraz daha az yalnızdınız.",
          "Adım attın. Nereye gideceği belli değildi ama en azından duran taraf sen olmadın.",
        ],
      },
      {
        t: ["Yavaş git", "Acele etme"],
        etiketler: ["guvenli"],
        fx: { ask: [1, 5], mutluluk: [1, 4], saglik: [1, 3] },
        sonuc: [
          "Aceleye getirmedin ve bu iyi geldi. İlişki kendi hızında ilerledi, sen de zorlanmadın.",
          "Ne ileri ne geri; olduğun yerde kaldın. Bazen bu da bir cevap.",
        ],
      },
      {
        t: ["Bitir, uzatma", "Vazgeç"],
        etiketler: ["yalniz", "durustluk"],
        fx: { ask: [-8, -2], mutluluk: [-4, 3], kariyer: [1, 4] },
        sonuc: [
          "Uzatmadan söyledin. Kırıcı olmadın ama net oldun; karşındaki teşekkür bile etti.",
          "Bitirmeyi seçtin. Eve dönerken içinde hem hafiflik hem tuhaf bir boşluk vardı.",
        ],
      },
    ],
  },
  {
    id: "u-y4",
    evreler: ["gencYetiskin"],
    alan: "arkadaslik",
    emoji: ["📞", "🎂", "🚗"],
    baslik: ["Uzaklaşan Dostluk", "Bir İyilik İsteği"],
    durum: [
      "{zaman} eskiden her gün konuştuğun biriyle aylardır konuşmadığını fark ettin.",
      "{mekan} bir arkadaşın senden zamanını isteyen bir iyilik istedi ve senin de vaktin yok.",
    ],
    secenekler: [
      {
        t: ["Ara, bul", "Zaman ayır"],
        etiketler: ["sosyal", "sadakat", "yardim"],
        fx: { arkadaslik: [6, 12], mutluluk: [4, 9], kariyer: [-3, 0] },
        sonuc: [
          "Telefonu açtın ve iki saat konuştunuz; aradan geçen zamanın hiç önemi kalmadı. Bazı bağlar sadece bir arama uzaklıkta.",
          "Vaktini verdin. O gün yapman gerekenler ertelendi ama karşındaki bunu unutmadı.",
        ],
      },
      {
        t: ["Şimdi olmaz de", "Kendi işine bak"],
        etiketler: ["bencil", "kacinma"],
        fx: { arkadaslik: [-8, -3], mutluluk: [-4, 1], kariyer: [2, 5] },
        sonuc: [
          "Kibarca reddettin ve işine döndün. Verimli bir gün geçirdin; telefon bir daha çalmadı.",
          "'Bu aralar çok yoğunum' dedin. Doğruydu ama iki tarafın da bildiği bir şey vardı: bu bir seçimdi.",
        ],
      },
    ],
  },
  {
    id: "u-y5",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "saglik",
    emoji: ["😵", "☕", "🛌"],
    baslik: ["Uyku Borcu", "Bitmeyen Hafta"],
    durum: [
      "{zaman} üst üste kötü uyudun ve bugün her şey biraz bulanık.",
      "{mekan} ayakta durmakta zorlandığını fark ettin. Kimseye söylemedin.",
    ],
    secenekler: [
      {
        t: ["Dur, dinlen", "Bugünü iptal et"],
        etiketler: ["guvenli", "tembellik"],
        fx: { saglik: [6, 12], mutluluk: [3, 8], kariyer: [-4, -1] },
        sonuc: [
          "Her şeyi iptal edip uyudun. Uyandığında dünya aynı yerdeydi ve sen daha iyiydin.",
          "Bir gün çalmak zorunda kaldın kendinden yana. Bedeli küçük, faydası büyüktü.",
        ],
      },
      {
        t: ["Kahveyle idare et", "Devam"],
        etiketler: ["calisma", "risk"],
        fx: { saglik: [-10, -4], kariyer: [3, 7], mutluluk: [-3, 1] },
        sonuc: [
          "Üçüncü kahveden sonra ellerin titriyordu ama işi bitirdin. Vücudun faturayı hemen kesmedi, taksitlendirdi.",
          "Zorladın ve yürüdü. Akşam eve varınca ayakkabılarını çıkarmadan uyudun.",
        ],
      },
      {
        t: ["Doktora görün", "Bir kontrol yaptır"],
        etiketler: ["tip", "durustluk"],
        fx: { saglik: [8, 14], mutluluk: [-2, 3] },
        para: [-4000, -800],
        sonuc: [
          "Randevu aldın ve gittiğine sevindin: büyük bir şey yoktu ama düzeltilecek birkaç şey vardı.",
          "Kontrol seni rahatlattı. Bilmemek, bilmekten daha yorucuymuş.",
        ],
      },
    ],
  },
  {
    id: "u-y6",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "hayat",
    emoji: ["📦", "🔑", "🏙️"],
    baslik: ["Taşınma", "Yeni Ev", "Kira Zammı"],
    durum: [
      "{zaman} ev sahibi aradı: ya zam ya çıkış. Karar birkaç güne kalmış.",
      "{mekan} bir ilan gördün ve aklından çıkmıyor: başka bir semt, başka bir hayat.",
    ],
    secenekler: [
      {
        t: ["Taşın, yeni bir yer", "Değişikliği seç"],
        etiketler: ["kesif", "risk"],
        fx: { mutluluk: [4, 10], arkadaslik: [-5, 0], saglik: [-3, 1] },
        para: [-25000, -6000],
        sonuc: [
          "Kolileri taşırken sırtın koptu ama ilk sabah pencereyi açtığında havanın bile farklı geldiğini düşündün.",
          "Yeni mahallede kimseyi tanımıyorsun. Bu ilk hafta ürkütücü, üçüncü hafta özgürlük gibi geldi.",
        ],
      },
      {
        t: ["Kal, zammı öde", "Tanıdık olanı koru"],
        etiketler: ["guvenli", "sadakat"],
        fx: { mutluluk: [-2, 4], arkadaslik: [2, 6] },
        para: [-15000, -4000],
        sonuc: [
          "Zammı kabul ettin ve aynı sokakta kaldın. Bakkal, komşu, alışkanlıklar; hepsi yerinde durdu.",
          "Taşınmamayı seçtin. Cebin daha çok yandı ama hayatın düzeni bozulmadı.",
        ],
      },
    ],
  },

  /* ===== YETİŞKİNLİK ===== */
  {
    id: "u-a1",
    evreler: ["yetiskin"],
    alan: "kariyer",
    emoji: ["📈", "🧭", "🪑"],
    baslik: ["Duraklama", "Genç Rakip", "Yol Ayrımı"],
    durum: [
      "{zaman} işinde uzun süredir aynı yerde durduğunu fark ettin ve bu seni rahatsız ediyor.",
      "{mekan} senden çok daha genç biri senin yapman gereken işi yaptı ve bunu herkes gördü.",
    ],
    secenekler: [
      {
        t: ["Kendini yenile", "Yeni bir şey öğren"],
        etiketler: ["calisma", "teknik", "kesif"],
        fx: { kariyer: [6, 12], mutluluk: [2, 7], saglik: [-4, 0] },
        para: [-9000, -1500],
        sonuc: [
          "Bu yaşta yeniden öğrenci olmak gururunu okşamadı ama altı ay sonra masaya koyduğun iş kimseye benzemiyordu.",
          "Sıfırdan bir şeye başladın. Zordu; yine de duraklamaktan daha az yordu.",
        ],
      },
      {
        t: ["Bulunduğun yeri koru", "Sessizce devam et"],
        etiketler: ["guvenli", "kacinma"],
        fx: { kariyer: [-4, 1], mutluluk: [-5, 1], saglik: [1, 4] },
        sonuc: [
          "Riske girmedin, maaşın yerinde durdu. Yıllar sonra bu yılı hatırlamayacak olman da bir sonuç.",
          "Bulunduğun yerde kaldın. Kimse seni zorlamadı; kimse fark da etmedi.",
        ],
      },
      {
        t: ["İstifa et, yeni yol", "Baştan başla"],
        etiketler: ["risk", "cesaret", "ticaret"],
        fx: { kariyer: [-3, 9], mutluluk: [5, 11], saglik: [-6, -1] },
        para: [-20000, 8000],
        riskli: 0.4,
        kotu: {
          fx: { kariyer: [-12, -6], mutluluk: [-10, -4], saglik: [-6, -2] },
          para: [-30000, -12000],
          sonuc: [
            "Yeni yol çıkmaz çıktı. Sekiz ay boyunca ne eski işin ne yeni bir şey vardı; her sabah aynı boşluğa uyandın.",
            "Karar erken alınmıştı. Geri dönmek için birkaç kapı çaldın ve hepsi kapalıydı.",
          ],
        },
        sonuc: [
          "İstifa mektubunu yazarken elin titredi, gönderdikten sonra derin bir nefes aldın. Yeni yer küçüktü ama nefes alınıyordu.",
          "Her şeyi bırakıp başka bir yere geçtin. İlk aylar sarsıcıydı, sonra yerine oturdu.",
        ],
      },
    ],
  },
  {
    id: "u-a2",
    evreler: ["yetiskin", "orta"],
    alan: "aile",
    emoji: ["🧓", "☎️", "🏥"],
    baslik: ["Yaşlanan Anne Baba", "Uzak Şehirden Haber"],
    durum: [
      "{zaman} ailenden biri hastalandı ve bakıma ihtiyacı var. Herkes senin ne yapacağını bekliyor.",
      "{mekan} telefonda uzun bir sessizlik oldu, sonra 'ben iyiyim, merak etme' dendi. İyi olmadığı belli.",
    ],
    secenekler: [
      {
        t: ["Sen üstlen", "Yanına taşın"],
        etiketler: ["yardim", "sadakat"],
        fx: { mutluluk: [-3, 5], arkadaslik: [3, 8], kariyer: [-7, -2], saglik: [-5, 0] },
        para: [-20000, -5000],
        sonuc: [
          "Hayatının düzenini bozdun ve yanına gittin. Yorucu aylar oldu ama o zamanı bir daha hiç pişmanlıkla anmadın.",
          "Sorumluluğu aldın. İşin aksadı, uykun bölündü; yine de doğru yerde olduğunu biliyordun.",
        ],
      },
      {
        t: ["Parayla destek ol", "Bakım ayarla"],
        etiketler: ["guvenli", "ticaret"],
        fx: { mutluluk: [-5, 2], arkadaslik: [-2, 3], kariyer: [0, 3] },
        para: [-45000, -15000],
        sonuc: [
          "Elinden gelenin parasını gönderdin ve iyi bir bakım ayarladın. Pratikti; yine de telefonu kapatınca içine bir şey oturdu.",
          "Çözümü satın aldın. İşe yaradı ama 'orada olmak' başka bir şeymiş.",
        ],
      },
      {
        t: ["Kardeşlere bırak", "Bu sefer başkası"],
        etiketler: ["bencil", "kacinma"],
        fx: { mutluluk: [-8, -2], arkadaslik: [-9, -3], kariyer: [3, 6] },
        sonuc: [
          "Bu kez sıranın sende olmadığını söyledin. Haklıydın belki ama aile sofrasında yerin bir daha eskisi gibi olmadı.",
          "Geri çekildin. İşin yolunda gitti, telefonların ise seyreldi.",
        ],
      },
    ],
  },
  {
    id: "u-a3",
    evreler: ["yetiskin"],
    alan: "para",
    emoji: ["🏘️", "📑", "💼"],
    baslik: ["Birikim Kararı", "Ortaklık Teklifi"],
    durum: [
      "{zaman} elinde bir miktar birikim var ve herkesin farklı bir tavsiyesi.",
      "{mekan} bir tanıdık ortaklık teklif etti. Rakamlar güzel, detaylar bulanık.",
    ],
    secenekler: [
      {
        t: ["Gir, ortak ol", "Riski al"],
        etiketler: ["risk", "ticaret"],
        fx: { kariyer: [2, 8], mutluluk: [-3, 4], saglik: [-4, 0] },
        para: [15000, 70000],
        riskli: 0.42,
        kotu: {
          fx: { kariyer: [-8, -3], mutluluk: [-12, -5], arkadaslik: [-9, -3] },
          para: [-60000, -25000],
          sonuc: [
            "Ortaklık dağıldı, defterler tutmadı ve arkadaşlık da onunla gitti. Avukat masrafları en az kayıp kısmıydı.",
            "İş yürümedi. Parayı da, o kişiyle olan yılları da kaybettin.",
          ],
        },
        sonuc: [
          "İmzayı attın ve iki yıl boyunca uyurken bile hesap yaptın. Sonunda tuttu ve ilk kez birikim diye bir şeyin oldu.",
          "Riski aldın ve karşılığını gördün. Yine de o dönem kaç gece uyanık kaldığını sadece sen biliyorsun.",
        ],
      },
      {
        t: ["Güvenli yatır", "Mevduatta beklet"],
        etiketler: ["guvenli", "teknik"],
        fx: { mutluluk: [0, 4], saglik: [1, 4] },
        para: [4000, 20000],
        sonuc: [
          "Heyecansız ama sağlam bir yol seçtin. Kazancın küçüktü, uykun bölünmedi.",
          "Parayı hareket ettirmedin. Kimse seni kutlamadı, kimse de zarar haberi getirmedi.",
        ],
      },
      {
        t: ["Kendine harca", "Ertelediğin şeyi al"],
        etiketler: ["tembellik", "kesif"],
        fx: { mutluluk: [7, 13], saglik: [1, 5], kariyer: [-3, 0] },
        para: [-40000, -12000],
        sonuc: [
          "Yıllardır ertelediğin şeyi aldın ve hiç pişman olmadın. Bazı paralar tam da bunun için birikiyormuş.",
          "Hesaplı olmayı bir kez bıraktın. Sonraki aylar biraz dar geçti ama gülümseyerek geçti.",
        ],
      },
    ],
  },
  {
    id: "u-a4",
    evreler: ["yetiskin", "orta"],
    alan: "arkadaslik",
    emoji: ["🍽️", "🎤", "🪟"],
    baslik: ["Eski Kalabalık", "Davet"],
    durum: [
      "{zaman} yıllar sonra bir buluşmaya çağrıldın. Gitsen mi, gitmesen mi?",
      "{mekan} eskiden çok yakın olduğun bir grup şimdi birbirine yabancı gibi.",
    ],
    secenekler: [
      {
        t: ["Git, karış", "Kalabalığa gir"],
        etiketler: ["sosyal", "kesif"],
        fx: { arkadaslik: [5, 11], mutluluk: [2, 8], saglik: [-3, 0] },
        para: [-4000, -800],
        sonuc: [
          "İlk yarım saat zorlandın, sonra eski bir şaka her şeyi açtı. Gece bitmesin istedin.",
          "Gittin ve iyi ki gitmişsin dedin. Birkaç numara alıp döndün, birkaçını gerçekten aradın.",
        ],
      },
      {
        t: ["Gitme, evde kal", "Bahane bul"],
        etiketler: ["yalniz", "kacinma"],
        fx: { arkadaslik: [-7, -2], mutluluk: [-3, 3], saglik: [2, 5] },
        sonuc: [
          "Mesajı görmezden geldin ve o akşam evde kaldın. Sabah fotoğrafları görünce içinde küçük bir sızı oldu.",
          "Kalabalık sana zor geliyor artık. Evde huzurluydun; sadece biraz da uzaktın.",
        ],
      },
    ],
  },
  {
    id: "u-a5",
    evreler: ["yetiskin", "orta"],
    alan: "saglik",
    emoji: ["🩻", "🚭", "🥗"],
    baslik: ["Tahlil Sonucu", "Küçük Uyarı"],
    durum: [
      "{zaman} rutin bir kontrolde bir değer sınırın üstünde çıktı. Doktor 'takip edelim' dedi.",
      "{mekan} merdiven çıkarken durup nefeslendiğini fark ettin. Eskiden böyle değildi.",
    ],
    secenekler: [
      {
        t: ["Düzeni değiştir", "Ciddiye al"],
        etiketler: ["tip", "spor", "calisma"],
        fx: { saglik: [9, 16], mutluluk: [1, 6], kariyer: [-3, 0] },
        para: [-6000, -1000],
        sonuc: [
          "Tabağın değişti, akşam yürüyüşü hayatına girdi. Üç ay sonraki tahlilde doktorun kaşları kalktı.",
          "Bu kez erteleme yapmadın. Değişim yavaş oldu ama kalıcı oldu.",
        ],
      },
      {
        t: ["Bir dahaki sefere", "Şimdilik idare eder"],
        etiketler: ["kacinma", "tembellik"],
        fx: { saglik: [-12, -5], mutluluk: [-2, 3] },
        sonuc: [
          "Kâğıdı bir çekmeceye koydun. Altı ay sonra aynı değer daha yukarıdaydı.",
          "'Bir şey olmaz' dedin. Muhtemelen olmayacak; muhtemelen.",
        ],
      },
    ],
  },
  {
    id: "u-a6",
    evreler: ["yetiskin"],
    alan: "hayat",
    emoji: ["🧩", "🪞", "🕰️"],
    baslik: ["Pazar Akşamı", "Boşluk"],
    durum: [
      "{zaman} her şey yolunda görünüyor ama içinde adını koyamadığın bir boşluk var.",
      "{mekan} bir anlığına durdun ve 'bundan sonrası ne?' diye düşündün.",
    ],
    secenekler: [
      {
        t: ["Bir şeye gönüllü ol", "Faydalı bir işe gir"],
        etiketler: ["yardim", "sosyal"],
        fx: { mutluluk: [7, 13], arkadaslik: [4, 9], kariyer: [-2, 2] },
        para: [-6000, -500],
        sonuc: [
          "Hafta sonlarının bir kısmını başkalarına ayırdın ve o boşluk sessizce doldu. Kimse alkışlamadı, gerek de yoktu.",
          "Verecek bir şeyinin olduğunu görmek, alacaklarını beklemekten daha iyi geldi.",
        ],
      },
      {
        t: ["Kendine bak, dur", "Bir süre yavaşla"],
        etiketler: ["yalniz", "guvenli"],
        fx: { mutluluk: [3, 8], saglik: [4, 9], kariyer: [-4, 0] },
        sonuc: [
          "Bir süre az şey yaptın ve bunu suçluluk duymadan yaptın. Kafandaki gürültü azaldı.",
          "Yavaşladın. İlk günler tuhaftı, sonra yıllardır olmadığın kadar dinlenmiş hissettin.",
        ],
      },
      {
        t: ["Görmezden gel, çalış", "İşe göm kendini"],
        etiketler: ["calisma", "kacinma"],
        fx: { kariyer: [5, 10], mutluluk: [-8, -2], saglik: [-6, -1] },
        para: [3000, 12000],
        sonuc: [
          "Takvimini doldurdun ki düşünecek boşluk kalmasın. İşe yaradı, ta ki bir pazar akşamı yeniden karşına çıkana kadar.",
          "Meşgul olmayı çözüm sandın. Rakamlar iyileşti, geceler iyileşmedi.",
        ],
      },
    ],
  },

  /* ===== ORTA YAŞ ===== */
  {
    id: "u-o1",
    evreler: ["orta"],
    alan: "saglik",
    emoji: ["🫁", "🦴", "💊"],
    baslik: ["Sabah Ağrısı", "İlaç Kutusu"],
    durum: [
      "{zaman} sabah kalkarken bir yerin ağrıdı ve bu ilk değil.",
      "{mekan} çantandan ilaç kutusunu çıkardığında yanındaki fark etti. Küçük bir utanç hissettin.",
    ],
    secenekler: [
      {
        t: ["Fizyoterapiye başla", "Düzenli tedavi"],
        etiketler: ["tip", "calisma"],
        fx: { saglik: [8, 15], mutluluk: [2, 6] },
        para: [-14000, -4000],
        sonuc: [
          "Haftada iki gün, aylarca. Sıkıcıydı, pahalıydı ve işe yaradı; artık sabahları korkmuyorsun.",
          "Tedaviyi aksatmadın. Yaşlanmayı durduramadın ama pazarlık edebildin.",
        ],
      },
      {
        t: ["Alışırım de", "Ağrıyla yaşa"],
        etiketler: ["kacinma", "cesaret"],
        fx: { saglik: [-9, -3], mutluluk: [-4, 2] },
        sonuc: [
          "Ağrıyı hayatının bir parçası yaptın ve kimseye söylemedin. Beden söylenmeyen şeyleri unutmuyor.",
          "İdare ettin. Bazı günler iyi, bazı günler hiç iyi değil.",
        ],
      },
    ],
  },
  {
    id: "u-o2",
    evreler: ["orta"],
    alan: "kariyer",
    emoji: ["🎓", "🗝️", "🧑‍🏫"],
    baslik: ["Devretme Zamanı", "Son Büyük Proje"],
    durum: [
      "{zaman} yönetim senden bir devir planı istiyor: yerine birini yetiştirmen gerekiyor.",
      "{mekan} muhtemelen kariyerinin son büyük işi masaya kondu.",
    ],
    secenekler: [
      {
        t: ["Yetiştir, devret", "Bildiğini aktar"],
        etiketler: ["yardim", "calisma"],
        fx: { kariyer: [4, 9], arkadaslik: [5, 10], mutluluk: [5, 10] },
        sonuc: [
          "Bildiğin her şeyi anlattın, hatalarını da sakladığın yerden çıkarıp gösterdin. Bir yıl sonra o kişi senin göremediğin bir çözümü buldu.",
          "Devrettin ve geri çekildin. Koltuğun küçüldü, adın büyüdü.",
        ],
      },
      {
        t: ["Sıkı tut, bırakma", "Yerini koru"],
        etiketler: ["bencil", "hile"],
        fx: { kariyer: [2, 6], arkadaslik: [-8, -3], mutluluk: [-5, 0] },
        para: [4000, 15000],
        sonuc: [
          "Bilgiyi paylaşmadın, kimse senin yerini dolduramadı. Vazgeçilmez oldun ve yalnız kaldın.",
          "Koltuğunu korudun. Kimse bunu yüzüne söylemedi ama toplantı sonrası konuşmalarda adın geçti.",
        ],
      },
    ],
  },
  {
    id: "u-o3",
    evreler: ["orta"],
    alan: "hayat",
    emoji: ["📻", "🌾", "🚙"],
    baslik: ["Erteleme Listesi", "Uzun Yol"],
    durum: [
      "{zaman} yıllardır 'zamanı gelince' dediğin şey aklına yine geldi.",
      "{mekan} biri sana 'ne zaman kendin için bir şey yapacaksın?' diye sordu ve cevabın yoktu.",
    ],
    secenekler: [
      {
        t: ["Şimdi yap", "Tarihi belirle"],
        etiketler: ["kesif", "cesaret"],
        fx: { mutluluk: [8, 15], saglik: [2, 6], kariyer: [-3, 0] },
        para: [-30000, -8000],
        sonuc: [
          "Takvimden bir hafta çıkardın ve gerçekten gittin. Döndüğünde herkes seni daha dinlenmiş buldu; sen daha fazlasını biliyordun.",
          "Bu kez ertelemedin. Yıllar sonra hatırladığın birkaç şeyden biri oldu.",
        ],
      },
      {
        t: ["Bir yıl daha bekle", "Şartlar uygun değil"],
        etiketler: ["guvenli", "kacinma"],
        fx: { mutluluk: [-7, -2], kariyer: [1, 4] },
        para: [2000, 9000],
        sonuc: [
          "'Seneye' dedin, seneye de aynısını dedin. Takvim yaprakları sen fark etmeden hızlanıyor.",
          "Mantıklı olanı yaptın. Mantık her zaman doğru olan değilmiş.",
        ],
      },
    ],
  },
  {
    id: "u-o4",
    evreler: ["orta", "yasli"],
    alan: "arkadaslik",
    emoji: ["🕊️", "📇", "🫖"],
    baslik: ["Azalan Liste", "Bir Haber"],
    durum: [
      "{zaman} tanıdığın birinin gittiğini öğrendin. Rehberindeki isimler azalıyor.",
      "{mekan} uzun süredir görüşmediğin biri seni sordu diye haber geldi.",
    ],
    secenekler: [
      {
        t: ["Hemen ara, görüş", "Vakit kaybetme"],
        etiketler: ["sosyal", "sadakat"],
        fx: { arkadaslik: [7, 13], mutluluk: [4, 10], saglik: [1, 4] },
        sonuc: [
          "Telefonu açtın ve o hafta buluştunuz. Sohbetin sonunda ikiniz de 'niye bu kadar bekledik' dediniz.",
          "Ertelemeden aradın. Bu yaşta en pahalı şeyin zaman olduğunu artık biliyorsun.",
        ],
      },
      {
        t: ["Sonra ararım", "Uygun bir zamanda"],
        etiketler: ["kacinma", "yalniz"],
        fx: { arkadaslik: [-7, -2], mutluluk: [-6, -1] },
        sonuc: [
          "Numarayı bir kâğıda yazdın ve o kâğıt bir yerlerde kayboldu. Bazı aramalar bir daha yapılmıyor.",
          "'Bu hafta olmaz' dedin. Haftalar birbirine benziyor ve hepsi geçiyor.",
        ],
      },
    ],
  },

  /* ===== YAŞLILIK ===== */
  {
    id: "u-z1",
    evreler: ["yasli"],
    alan: "aile",
    emoji: ["👵", "🧒", "🍪"],
    baslik: ["Torun Ziyareti", "Kalabalık Sofra"],
    durum: [
      "{zaman} {mekan} küçükler etrafında dönüyor ve senden bir hikâye istiyorlar.",
      "Bayram sofrası kuruldu. Herkes kendi telefonuna bakıyor ve sen bunu izliyorsun.",
    ],
    secenekler: [
      {
        t: ["Anlat, aktar", "Eski hikâyeleri ver"],
        etiketler: ["sosyal", "yardim", "sanat"],
        fx: { mutluluk: [8, 14], arkadaslik: [5, 10], saglik: [1, 4] },
        sonuc: [
          "Anlattıkça telefonlar masaya bırakıldı. Odada tek ses senin sesindi ve bunun kıymetini o an anladın.",
          "Hikâyeni anlattın; birinin gözleri doldu. Aktarılan şey bir daha kaybolmaz.",
        ],
      },
      {
        t: ["Sessizce izle", "Karışma, seyret"],
        etiketler: ["yalniz", "guvenli"],
        fx: { mutluluk: [-3, 4], saglik: [1, 4], arkadaslik: [-4, 0] },
        sonuc: [
          "Bir köşeye çekilip onları izledin. Huzurluydu ama biraz da uzaktı.",
          "Konuşmadın. Kimse fark etmedi ve bu, en çok canını yakan kısımdı.",
        ],
      },
    ],
  },
  {
    id: "u-z2",
    evreler: ["yasli"],
    alan: "saglik",
    emoji: ["🚶", "🩺", "🌤️"],
    baslik: ["Günlük Yürüyüş", "Kontrol Randevusu"],
    durum: [
      "{zaman} doktor 'hareket edeceksin' dedi ama bugün hiç istemiyorsun.",
      "{mekan} yürüyüş grubuna çağrıldın. Kendini onlardan biri gibi hissetmiyorsun.",
    ],
    secenekler: [
      {
        t: ["Kalk, yürü", "Gruba katıl"],
        etiketler: ["spor", "sosyal"],
        fx: { saglik: [7, 13], mutluluk: [5, 10], arkadaslik: [3, 8] },
        sonuc: [
          "İlk gün ayak uyduramadın, üçüncü hafta en önde yürüyordun. Sabahları yeniden bir sebebin oldu.",
          "Yürüdün ve yanında birileri vardı. Nefesin de moralin de düzeldi.",
        ],
      },
      {
        t: ["Bugün olmaz", "Koltukta kal"],
        etiketler: ["tembellik", "kacinma"],
        fx: { saglik: [-8, -3], mutluluk: [-3, 3] },
        sonuc: [
          "Perdeyi araladın ve dışarıyı içeriden izledin. Yarın da aynısını yapmak çok kolay olacak.",
          "Kalkmadın. Bir gün bir şey değiştirmez ama günler birikiyor.",
        ],
      },
    ],
  },
  {
    id: "u-z3",
    evreler: ["yasli"],
    alan: "para",
    emoji: ["🧧", "🗄️", "📜"],
    baslik: ["Kâğıt İşleri", "Kimin Olacak"],
    durum: [
      "{zaman} yıllardır ertelediğin evrakları düzenleme vakti geldi.",
      "{mekan} biri sana geleceğe dair bir soru sordu ve cevabı hazırlamamışsın.",
    ],
    secenekler: [
      {
        t: ["Her şeyi düzene sok", "Vasiyetini yaz"],
        etiketler: ["durustluk", "teknik"],
        fx: { mutluluk: [6, 11], kariyer: [1, 4], saglik: [1, 3] },
        para: [-8000, -1500],
        sonuc: [
          "Bir avukat, birkaç imza ve uzun bir öğleden sonra. Her şey yerli yerinde; geriye kalanlara kavga değil, açıklık bıraktın.",
          "Kâğıtları düzenledin. Konuşması ağır bir işti ama bitince omuzların indi.",
        ],
      },
      {
        t: ["Sonra hallederiz", "Şimdi sırası değil"],
        etiketler: ["kacinma", "tembellik"],
        fx: { mutluluk: [-5, 0] },
        sonuc: [
          "Dosyayı kapattın ve rafa koydun. Bu iş bir gün başkalarının başına kalacak, bunu ikiniz de biliyorsunuz.",
          "Konuyu değiştirdin. Rahatladın ama mesele olduğu yerde duruyor.",
        ],
      },
    ],
  },
  {
    id: "u-z4",
    evreler: ["yasli"],
    alan: "hayat",
    emoji: ["📷", "🎞️", "🪑"],
    baslik: ["Eski Fotoğraflar", "Bir Kutu Anı"],
    durum: [
      "{zaman} dolabın üstünde unutulmuş bir kutu buldun. İçi fotoğraf dolu.",
      "{mekan} biri sana gençliğini sordu ve aklına ilk gelen şey seni şaşırttı.",
    ],
    secenekler: [
      {
        t: ["Hepsini elden geçir", "Anıları düzenle"],
        etiketler: ["sanat", "yalniz"],
        fx: { mutluluk: [6, 12], saglik: [-2, 2] },
        sonuc: [
          "Her fotoğrafın arkasına kim, nerede, ne zaman yazdın. Saatler geçti; bazılarında güldün, birkaçında durup uzun uzun baktın.",
          "Kutuyu boşalttın ve bir hayat masaya yayıldı. Kendinle ilgili unuttuğun birkaç iyi şeyi hatırladın.",
        ],
      },
      {
        t: ["Birlikte bak", "Ailene göster"],
        etiketler: ["sosyal", "yardim"],
        fx: { mutluluk: [7, 13], arkadaslik: [5, 10], ask: [1, 5] },
        sonuc: [
          "Herkesi çağırdın ve fotoğrafları tek tek anlattın. O akşam evde kimse erken kalkmadı.",
          "Paylaşınca anılar iki katına çıktı. Bir tanesini duvara astılar.",
        ],
      },
      {
        t: ["Kutuyu kapat", "Geçmişi karıştırma"],
        etiketler: ["kacinma", "guvenli"],
        fx: { mutluluk: [-6, 2], saglik: [1, 3] },
        sonuc: [
          "Kapağı kapattın ve yerine koydun. Bazı şeylere bakmak, unutmaktan daha yorucu.",
          "Karıştırmadın. Belki de iyi ettin; belki de bir şeyi kaçırdın.",
        ],
      },
    ],
  },
  /* ===== İŞ HAYATI — sahne, oyuncunun mesleğine göre kuruluyor ===== */
  {
    id: "u-i1",
    evreler: ["genc", "gencYetiskin"],
    alan: "kariyer",
    emoji: ["🧰", "🪪", "📋"],
    baslik: ["İlk Vardiya", "Acemilik", "İşin Başı"],
    durum: [
      "{isYeri} ilk günün. Herkes ne yapacağını biliyor, sen hariç.",
      "{zaman} {isYeri} sana kimsenin anlatmadığı bir işi yapman söylendi.",
    ],
    secenekler: [
      {
        t: ["Bilmediğini söyle, sor", "Yardım iste"],
        etiketler: ["durustluk", "sosyal"],
        fx: { kariyer: [3, 8], arkadaslik: [4, 9], mutluluk: [1, 5] },
        sonuc: [
          '"Bilmiyorum, gösterir misin?" demek ilk cümlede zor, ikincisinde kolaydı. Kıdemli biri yanına oturdu ve o günden sonra sana hep göz kulak oldu.',
          "Sordun ve kimse gülmedi. Aksine, sorduğun için işi doğru yaptın ve bu fark edildi.",
        ],
      },
      {
        t: ["Biliyormuş gibi yap", "Kendi başına dene"],
        etiketler: ["hile", "cesaret"],
        fx: { kariyer: [-4, 6], saglik: [-5, 0], mutluluk: [-4, 3] },
        sonuc: [
          "Kimseye sormadan giriştin. Yarısı doğru çıktı, yarısı baştan yapıldı; kimse bir şey demedi ama sen biliyordun.",
          "Bilmediğini belli etmedin ve şansın yaver gitti. O gün kurtuldun, ertesi gün aynı numara tutmadı.",
        ],
      },
    ],
  },
  {
    id: "u-i2",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "kariyer",
    emoji: ["⏱️", "📎", "🗣️"],
    baslik: ["Hata", "Kimin Suçu", "Denetim"],
    durum: [
      "{isYeri} bir hata ortaya çıktı ve kimin yaptığı belli değil. Aslında sen biliyorsun.",
      "{zaman} {isYeri} yapılan işte bir sorun çıktı; herkes birbirine bakıyor.",
    ],
    secenekler: [
      {
        t: ["Benim, diye çık", "Üstlen"],
        etiketler: ["durustluk", "cesaret"],
        fx: { kariyer: [-3, 5], arkadaslik: [5, 10], mutluluk: [2, 7] },
        sonuc: [
          '"Benim hatam" dedin ve odada bir sessizlik oldu. Zarar aynı kaldı ama o günden sonra sözüne farklı bir ağırlık verildi.',
          "Kabul ettin. Kısa vadede canını yaktı; uzun vadede kimse senden şüphe etmedi.",
        ],
      },
      {
        t: ["Sessiz kal", "Belli etme"],
        etiketler: ["kacinma", "hile"],
        fx: { kariyer: [0, 4], mutluluk: [-7, -2], arkadaslik: [-5, 0] },
        sonuc: [
          "Sesini çıkarmadın. Fatura başkasına kesildi ve o kişi bir daha sana eskisi gibi bakmadı.",
          "Konu kapandı, kimse bir şey öğrenmedi. Sen öğrendin ve o bilgi aylarca yanında kaldı.",
        ],
      },
      {
        t: ["Sistemi düzelt", "Bir daha olmasın diye çalış"],
        etiketler: ["teknik", "calisma"],
        fx: { kariyer: [5, 11], saglik: [-5, -1], mutluluk: [0, 4] },
        sonuc: [
          "Suçluyu aramak yerine nedenini buldun ve bir daha olmayacak hale getirdin. Bir hafta fazla mesai, bir ömür rahat.",
          "Hatanın kaynağını çıkardın ortaya. Kimse teşekkür etmedi ama bir daha aynı sorun yaşanmadı.",
        ],
      },
    ],
  },
  {
    id: "u-i3",
    evreler: ["gencYetiskin", "yetiskin", "orta"],
    alan: "kariyer",
    emoji: ["🚪", "🔒", "🪟"],
    baslik: ["Kapalı Kapılar Ardında", "Uzun Vardiya"],
    durum: [
      "{isYeri} gün bitmek bilmiyor; dışarıda hava kararalı çok olmuş.",
      "{zaman} {isYeri} saatlerdir aynı yerdesin ve buranın havası üstüne siniyor.",
    ],
    secenekler: [
      {
        t: ["Sonuna kadar kal", "Bitmeden çıkma"],
        etiketler: ["calisma"],
        fx: { kariyer: [4, 9], saglik: [-8, -3], mutluluk: [-5, 1] },
        para: [500, 5000],
        sonuc: [
          "Son kişi sen çıktın, ışıkları sen kapattın. İş bitti; sırtın tutuldu, telefonda üç cevapsız arama vardı.",
          "Kalanların arasında sen de vardın. Bitirdiniz, sabaha karşı eve döndün ve yemek yemeden uyudun.",
        ],
      },
      {
        t: ["Kalanı yarına bırak", "Paydos et"],
        etiketler: ["guvenli", "tembellik"],
        fx: { saglik: [4, 9], mutluluk: [3, 8], kariyer: [-5, -1] },
        sonuc: [
          "Ceketini aldın ve çıktın. Arkanda yarım kalan iş vardı ama akşam yemeğine yetiştin.",
          "Bugünlük bu kadar dedin. Sabah geldiğinde iş hâlâ oradaydı ve dünya dönmeye devam etmişti.",
        ],
      },
      {
        t: ["Yardım çağır", "Ekibi topla"],
        etiketler: ["sosyal", "teknik"],
        fx: { kariyer: [3, 8], arkadaslik: [4, 9], saglik: [-3, 1] },
        sonuc: [
          "Tek başına boğulmak yerine iki kişi daha çağırdın. İş üçte bir sürede bitti, sonra hep birlikte bir şeyler yediniz.",
          "Yükü paylaştın. Kimse itiraz etmedi; herkes zaten aynı gemideydi.",
        ],
      },
    ],
  },
  {
    id: "u-i4",
    evreler: ["yetiskin", "orta"],
    alan: "para",
    emoji: ["🧮", "💼", "📉"],
    baslik: ["Zor Karar", "Kesinti", "Liste"],
    durum: [
      "{isYeri} bütçe kısıldı ve birilerinin gitmesi gerekiyor. Listeyi senden istiyorlar.",
      "{zaman} {isYeri} işlerin daralttığı bir konuşma yapılacak ve konuşacak kişi sensin.",
    ],
    secenekler: [
      {
        t: ["Adil ol, açık konuş", "Herkese yüz yüze söyle"],
        etiketler: ["durustluk", "yardim"],
        fx: { arkadaslik: [3, 8], mutluluk: [-6, 0], kariyer: [0, 4] },
        sonuc: [
          "Herkesle tek tek, yüz yüze konuştun. Kimse sevinmedi ama kimse de arkandan konuşmadı; bir kişi çıkarken sana sarıldı.",
          "Kararı yumuşatmadın, süslemedin. Zor bir gündü; yine de kimseye yalan söylemedin.",
        ],
      },
      {
        t: ["Kendini kurtar", "Listeyi kendine göre yaz"],
        etiketler: ["bencil", "hile"],
        fx: { kariyer: [4, 9], arkadaslik: [-10, -4], mutluluk: [-8, -2] },
        para: [2000, 12000],
        sonuc: [
          "Listeyi kendi konumunu sağlama alacak şekilde yazdın. Koltuğun kaldı; öğle yemeğinde masan boşaldı.",
          "Kendini oyunun dışında tuttun. Kimse kanıtlayamadı ama herkes anladı.",
        ],
      },
      {
        t: ["Karşı çık, imzalama", "Ben yapmam de"],
        etiketler: ["cesaret", "durustluk"],
        fx: { kariyer: [-9, -2], arkadaslik: [6, 12], mutluluk: [2, 8] },
        sonuc: [
          '"Bunu ben yapmam" dedin ve odadan çıktın. Liste yine yapıldı, senin adın da bir sonrakine yazıldı — ama başın dikti.',
          "İmzalamadın. Kariyerine iyi gelmedi; aynada kendine bakarken sorun yaşamadın.",
        ],
      },
    ],
  },

  /* ===== SEÇİM HAKKI OLMAYAN OLAYLAR — hayat sormadan yapar ===== */
  {
    id: "u-z1",
    evreler: ["bebek", "cocuk"],
    alan: "aile",
    emoji: ["📦", "🚚", "🏚️"],
    baslik: ["Taşınıyoruz", "Haber"],
    zorunlu: true,
    durum: [
      "{zaman} eve kolilerle girildi: taşınıyorsunuz. Kimse sana sormadı, soramazdın da.",
      "Bir sabah evde her şey değişti; büyüklerin aldığı bir karar seni de alıp götürdü.",
    ],
    secenekler: [
      {
        t: ["..."],
        etiketler: ["kacinma"],
        fx: { mutluluk: [-8, -3], arkadaslik: [-9, -3], saglik: [-2, 1] },
        sonuc: [
          "Yeni mahallede kimseyi tanımıyordun ve eski arkadaşlarının hiçbirinin telefonu yoktu. İlk aylar pencereden dışarı bakmakla geçti.",
          "Odanı bile toplamana izin verilmedi, her şey kutulara girdi. Yeni evde bir süre kendi eşyalarını yabancı gibi kullandın.",
        ],
      },
    ],
  },
  {
    id: "u-z2",
    evreler: ["cocuk", "genc"],
    alan: "saglik",
    emoji: ["🦴", "🩹", "🚑"],
    baslik: ["Kaza", "Talihsizlik"],
    zorunlu: true,
    durum: [
      "{zaman} {mekan} bir anda oldu: ayağın kaydı, dünya döndü ve yerdeydin.",
      "Hiç beklemediğin bir anda bir kaza geçirdin. Kimsenin suçu yoktu, sadece oldu.",
    ],
    secenekler: [
      {
        t: ["..."],
        etiketler: ["kacinma"],
        fx: { saglik: [-14, -6], mutluluk: [-6, -1] },
        para: [-6000, -800],
        sonuc: [
          "Alçı, birkaç hafta ders kaybı ve gecelerce süren bir sızı. İyileştin ama o mevsim seninle hiç geçmedi.",
          "Hastane, röntgen, uzun bir bekleme. Sonrasında yürüdün ama havanın değiştiği günlerde o yer hep hatırlattı.",
        ],
      },
    ],
  },
  {
    id: "u-z3",
    evreler: ["genc", "gencYetiskin"],
    alan: "aile",
    emoji: ["📄", "🕊️", "📞"],
    baslik: ["Beklenmedik Haber", "Telefon"],
    zorunlu: true,
    durum: [
      "{zaman} bir telefon geldi ve söylenen cümleden sonra dünyanın sesi kısıldı.",
      "Kimsenin hazırlıklı olmadığı bir haber düştü. Yapabileceğin bir şey yoktu.",
    ],
    secenekler: [
      {
        t: ["..."],
        etiketler: ["yalniz"],
        fx: { mutluluk: [-14, -6], saglik: [-5, -1], arkadaslik: [-2, 4] },
        sonuc: [
          "Cenaze kalabalıktı, sonrası çok sessiz. Haftalarca sabahları bir anlığına unutup sonra yeniden hatırladın.",
          "O gün ne yediğini, ne giydiğini hatırlamıyorsun. Sadece telefonun kulağına değdiği anı hatırlıyorsun.",
        ],
      },
    ],
  },
  {
    id: "u-z4",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "kariyer",
    emoji: ["📪", "🏢", "🧾"],
    baslik: ["Kapanış", "İşten Çıkarma"],
    zorunlu: true,
    durum: [
      "{isYeri} bir sabah herkes toplantıya çağrıldı: işler kapanıyor. İtiraz edilecek bir yer yoktu.",
      "{zaman} kararı yukarıdan verdiler; senin performansınla ilgisi bile yoktu.",
    ],
    secenekler: [
      {
        t: ["..."],
        etiketler: ["kacinma"],
        fx: { kariyer: [-12, -5], mutluluk: [-10, -3], arkadaslik: [-3, 2] },
        para: [-4000, 9000],
        sonuc: [
          "Masanı bir kutuya sığdırdın. Kapıdan çıkarken güvenlikle vedalaşman, o işteki son insani an oldu.",
          "Tazminat hesaplandı, imzalar atıldı ve iki saat içinde her şey bitti. Eve gidince ne diyeceğini bilemedin.",
        ],
      },
    ],
  },
  {
    id: "u-z5",
    evreler: ["yetiskin", "orta"],
    alan: "para",
    emoji: ["📊", "🌪️", "🏦"],
    baslik: ["Kriz", "Her Şey Bir Anda"],
    zorunlu: true,
    durum: [
      "{zaman} ekonomide bir şey kırıldı ve senin hiçbir dahlin olmadan hesabın eridi.",
      "Kimsenin öngöremediği bir gelişme oldu; birikimin bir gecede anlamını değiştirdi.",
    ],
    secenekler: [
      {
        t: ["..."],
        etiketler: ["kacinma"],
        fx: { mutluluk: [-9, -3], saglik: [-5, 0], kariyer: [-4, 1] },
        para: [-40000, -6000],
        sonuc: [
          "Rakamlara bakıp bakıp kapattın, sonra bir daha açtın. Yıllarca biriktirdiğin şey artık aynı şeyi almıyordu.",
          "Planların bir kalemde silindi. Kızacak birini bulamadın; kimse yoktu.",
        ],
      },
    ],
  },
  {
    id: "u-z6",
    evreler: ["orta", "yasli"],
    alan: "saglik",
    emoji: ["🫀", "🏥", "💤"],
    baslik: ["Bir Sabah", "Ansızın"],
    zorunlu: true,
    durum: [
      "{zaman} sabah kalkarken bir şey ters gitti; gerisini hastane odasında hatırlıyorsun.",
      "Vücudun uyarı vermeden bir şey yaptı ve karar verme sırası sende değildi.",
    ],
    secenekler: [
      {
        t: ["..."],
        etiketler: ["kacinma"],
        fx: { saglik: [-16, -7], mutluluk: [-6, 0], arkadaslik: [0, 5] },
        para: [-25000, -3000],
        sonuc: [
          "Birkaç gün gözlem, bir sürü kablo ve tanıdık yüzlerin endişeli hali. Taburcu oldun ama artık her sabah bir ilaç kutusu var.",
          'Zamanında yetişilmiş. Doktor "şanslısın" dedi ve sen bunun ne kadar ince bir çizgi olduğunu ilk kez anladın.',
        ],
      },
    ],
  },
  {
    id: "u-z7",
    evreler: ["gencYetiskin", "yetiskin", "orta"],
    alan: "hayat",
    emoji: ["🌧️", "🚧", "📵"],
    baslik: ["Aksilik", "Öyle Bir Gün"],
    zorunlu: true,
    durum: [
      "{zaman} {mekan} planladığın hiçbir şey olmadı; olan her şey plansızdı.",
      "Elinde olmayan bir sebeple bütün gün ters gitti ve sen sadece izledin.",
    ],
    secenekler: [
      {
        t: ["..."],
        etiketler: ["kacinma"],
        fx: { mutluluk: [-7, -2], saglik: [-4, 0], kariyer: [-3, 1] },
        para: [-5000, -300],
        sonuc: [
          "Ne yapsan olmadı; her çözüm yeni bir sorun açtı. Akşam eve vardığında sadece sessizlik istedin.",
          "Kimsenin suçu değildi, kimseye kızamadın. Bazı günler sadece dayanmakla geçiyor.",
        ],
      },
    ],
  },

  /* ===== +18 MOD — sadece bu modda ve karakter reşitken çıkar =====
     Yetişkin hayatının sert tarafı: bağımlılık, ihanet, kumar, şiddet.
     Ağır konular açık sahne olarak değil, sonuçlarıyla anlatılıyor. */
  {
    id: "u-y18a",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "saglik",
    emoji: ["🥃", "🍺", "🌫️"],
    baslik: ["Son Kadeh", "Kapanış Saati"],
    yetiskin: true,
    durum: [
      "{zaman} masadaki şişe boşaldı ve biri bir tane daha söylüyor. Yarın işin var.",
      "Bu hafta üçüncü gece; içmeden uyuyamadığını fark etmeye başladın.",
    ],
    secenekler: [
      {
        t: ["Kalk, çık", "Bu gecelik yeter"],
        etiketler: ["guvenli", "durustluk"],
        fx: { saglik: [5, 11], mutluluk: [-3, 3], arkadaslik: [-4, 1] },
        sonuc: [
          "Ceketini aldın, arkandan laf atıldı ama durmadın. Sabah kalktığında başın ağrımıyordu ve bu, aylardır ilkti.",
          '"Ben kaçtım" dedin. Masada kalanlar seni anlamadı; sen kendini anladın, o yeterdi.',
        ],
      },
      {
        t: ["Bir tane daha", "Devam et"],
        etiketler: ["risk", "tembellik"],
        fx: { saglik: [-12, -5], mutluluk: [3, 8], arkadaslik: [2, 6] },
        para: [-4000, -600],
        sonuc: [
          "Gece nasıl bittiğini hatırlamıyorsun; sabah telefonundaki mesajları okumak için cesaret gerekti. Bir daha içmem dedin, bu sefer inanmadın bile.",
          "Masa kapanana kadar kaldın. Eğlenceliydi, sonrası değildi; ertesi gün yarısını kaybettin.",
        ],
      },
    ],
  },
  {
    id: "u-y18b",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "ask",
    emoji: ["🚬", "🛏️", "🌆"],
    baslik: ["Sabah", "Ertesi Gün"],
    yetiskin: true,
    durum: [
      "{zaman} tanımadığın bir evde uyandın. Yanındaki hâlâ uyuyor ve adını tam hatırlamıyorsun.",
      "Gece kimsenin planlamadığı bir yere gitti. Şimdi sabah oldu ve konuşulması gereken bir şey var.",
    ],
    secenekler: [
      {
        t: ["Kal, konuş", "Kahvaltı yap"],
        etiketler: ["durustluk", "romantik"],
        fx: { ask: [4, 10], mutluluk: [3, 8], arkadaslik: [1, 5] },
        sonuc: [
          "Kaçmak yerine oturup konuştunuz. Ne olduğunu ikiniz de biliyordunuz ama en azından yabancı gibi ayrılmadınız.",
          "İki fincan kahve, tuhaf ama dürüst bir sohbet. Devam etmedi, yine de kimse kimseyi küçük düşürmedi.",
        ],
      },
      {
        t: ["Sessizce çık", "Not bırakma"],
        etiketler: ["kacinma", "bencil"],
        fx: { ask: [-6, -1], mutluluk: [-7, 1], saglik: [-2, 1] },
        sonuc: [
          "Ayakkabılarını dışarıda giydin. Kapıyı çekerken içeride bir şeyin kımıldadığını duydun ve daha hızlı yürüdün.",
          "Kimseyi uyandırmadan çıktın. Metroda camdaki yansımana bakarken bunu kaçıncı kez yaptığını saydın.",
        ],
      },
    ],
  },
  {
    id: "u-y18c",
    evreler: ["yetiskin", "orta"],
    alan: "ask",
    emoji: ["📱", "🔥", "🚪"],
    baslik: ["Aralanan Kapı", "Mesaj"],
    yetiskin: true,
    gerek: { iliski: "es" },
    durum: [
      "{zaman} {es} yan odada uyurken telefonuna gelen mesaj, uzun süredir beklediğin bir kapıyı aralıyor.",
      "İş yerinden biriyle konuşmalar bir yerden sonra iş olmaktan çıktı ve bugün açık bir teklif geldi.",
    ],
    secenekler: [
      {
        t: ["Sil, kapat", "Sınırı çiz"],
        etiketler: ["sadakat", "durustluk"],
        fx: { ask: [4, 10], mutluluk: [-3, 4], arkadaslik: [0, 3] },
        sonuc: [
          "Konuşmayı sildin ve o kişiye net bir cümle yazdın. İçinde bir şey buruldu ama gece {es} yanına uzandığında gözünü kaçırmak zorunda kalmadın.",
          "Kapıyı kendin kapattın. Kolay olmadı; kimse alkışlamadı, sadece sen bildin.",
        ],
      },
      {
        t: ["Cevap yaz", "Riski al"],
        etiketler: ["hile", "risk", "romantik"],
        fx: { ask: [-10, 4], mutluluk: [-6, 6], arkadaslik: [-5, 0] },
        sonuc: [
          "Yazdın ve bir şey başladı. Haftalarca iki hayat yaşadın; ikisinde de tam olarak yoktun.",
          "Kendine binlerce açıklama ürettin. Hiçbiri, eve girerken duraksadığın o iki saniyeyi geçirmedi.",
        ],
        bayrak: ["ihanet"],
        onemli: true,
      },
    ],
  },
  {
    id: "u-y18d",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "para",
    emoji: ["🎲", "🃏", "💸"],
    baslik: ["Masa", "Son El"],
    yetiskin: true,
    durum: [
      "{zaman} masadasın ve önündeki para bu akşam kaybedebileceğinden fazla.",
      "Bir el daha, hep bir el daha. Bu sefer masaya koyduğun şey kira parası.",
    ],
    secenekler: [
      {
        t: ["Kalk, git", "Zararı kes"],
        etiketler: ["guvenli", "durustluk"],
        fx: { mutluluk: [-4, 4], saglik: [2, 6] },
        para: [-9000, -1500],
        sonuc: [
          'Sandalyeyi geri ittin ve kalanı cebine koydun. Arkandan "korkak" diyen oldu; sen o gece kirasını ödeyebilen tek kişiydin.',
          "Kaybettiğinle yetindin. Kapıdan çıkarken elin titriyordu ama daha fazlasını kaybetmedin.",
        ],
      },
      {
        t: ["Hepsini koy", "Son bir el"],
        etiketler: ["risk", "hile"],
        fx: { saglik: [-8, -2], mutluluk: [-10, 8] },
        para: [10000, 60000],
        riskli: 0.6,
        kotu: {
          fx: { saglik: [-10, -4], mutluluk: [-16, -8], arkadaslik: [-8, -2] },
          para: [-70000, -25000],
          sonuc: [
            "Her şey bitti. Masadan kalkarken kimse yüzüne bakmadı; borcunu kime ödeyeceğini ise ertesi sabah öğrendin.",
            "Son el de gitti. Eve nasıl döndüğünü hatırlamıyorsun, kime ne söz verdiğini de.",
          ],
        },
        sonuc: [
          "Tuttu. Parayı sayarken ellerin titriyordu ve o gece kimseye anlatamadın. Bir daha oturmayacağını söyledin — kendine bile inandıramadın.",
          "Kazandın ve masadan efsane gibi kalktın. Asıl sorun, bu duyguyu bir daha aramaya başlaman oldu.",
        ],
        bayrak: ["kumarTadi"],
      },
    ],
  },
  {
    id: "u-y18e",
    evreler: ["gencYetiskin", "yetiskin"],
    alan: "saglik",
    emoji: ["🥊", "🚨", "🩸"],
    baslik: ["Kavga", "Gerilen Gece"],
    yetiskin: true,
    durum: [
      "{zaman} {mekan} bir laf büyüdü ve karşındaki adam üstüne yürüyor.",
      "Kalabalıkta bir itiş kakış çıktı; içine çekilmen an meselesi.",
    ],
    secenekler: [
      {
        t: ["Geri çekil, uzaklaş", "Bulaşma"],
        etiketler: ["guvenli", "kacinma"],
        fx: { saglik: [1, 5], mutluluk: [-5, 2], arkadaslik: [-4, 1] },
        sonuc: [
          "Ellerini kaldırıp geri adım attın ve döndün. Arkandan bağırdılar; sen sağlam yürüdün.",
          "Karışmadın. Ertesi gün olayın nasıl bittiğini duyunca çekilmekle iyi ettiğini anladın.",
        ],
      },
      {
        t: ["Karşılık ver", "Durma"],
        etiketler: ["cesaret", "risk"],
        fx: { saglik: [-16, -5], mutluluk: [-6, 5], arkadaslik: [-3, 5] },
        para: [-12000, -1000],
        sonuc: [
          "Birkaç saniye sürdü, sonrası karakol ve dikiş. Kimse kazanmadı; ikinizin de sabıka kaydında bir satır var artık.",
          "Yumruk attın, yumruk yedin. Kaburgan haftalarca ağrıdı ve o geceyi anlatırken hiç gurur duymadın.",
        ],
      },
    ],
  },
  {
    id: "u-y18f",
    evreler: ["yetiskin", "orta"],
    alan: "ask",
    emoji: ["🕯️", "🛌", "🤍"],
    baslik: ["Aradaki Mesafe", "Yatak Odası"],
    yetiskin: true,
    gerek: { iliski: "es" },
    durum: [
      "{zaman} {es} ile aranızdaki fiziksel mesafe artık konuşulması gereken bir şey oldu.",
      "Yıllar geçti ve ikiniz de aynı şeyi düşünüp söylemiyorsunuz: bu iş eskisi gibi değil.",
    ],
    secenekler: [
      {
        t: ["Açık konuş", "Utanmadan söyle"],
        etiketler: ["durustluk", "romantik", "cesaret"],
        fx: { ask: [7, 14], mutluluk: [4, 10] },
        sonuc: [
          "Söylemesi zordu, söyledin. {es} önce sustu, sonra kendi tarafını anlattı; ikiniz de yıllardır aynı odada yalnız olduğunuzu fark ettiniz. O konuşma bir şeyi geri getirdi.",
          "Konuyu ilk açan sen oldun. Rahatlamak birkaç gün sürdü ama ilk kez gerçekten aynı taraftaydınız.",
        ],
      },
      {
        t: ["Görmezden gel", "Zamanla geçer"],
        etiketler: ["kacinma", "tembellik"],
        fx: { ask: [-11, -4], mutluluk: [-7, -1] },
        sonuc: [
          "Konuyu açmadın, o da açmadı. Aynı yatakta sırt sırta uyumak bir alışkanlığa dönüştü.",
          '"Herkeste böyle" dedin kendine. Belki öyleydi; yine de aradaki boşluk her ay biraz daha büyüdü.',
        ],
      },
    ],
  },
];

/* ---------- Üretim ---------- */

const TR_BUYUK: Record<string, string> = { i: "İ", ı: "I", ş: "Ş", ğ: "Ğ", ü: "Ü", ö: "Ö", ç: "Ç" };

function buyukHarf(metin: string) {
  if (!metin) return metin;
  const ilk = metin[0];
  return (TR_BUYUK[ilk] ?? ilk.toUpperCase()) + metin.slice(1);
}

function yuvalariDoldur(metin: string, evre: Evre, isYerleri: string[]) {
  const dolu = metin.replace(/\{(mekan|zaman|isYeri)\}/g, (_tam, ad: string) => {
    if (ad === "mekan") return rast(MEKANLAR[evre]);
    if (ad === "isYeri") return rast(isYerleri.length ? isYerleri : MEKANLAR[evre]);
    return rast(ZAMANLAR);
  });
  // Yuvalar cümle ortasında da başında da geçiyor; nokta sonrası büyük harf.
  const duzeltilmis = dolu.replace(
    /([.!?]\s+)(\p{Ll})/gu,
    (_t, ayrac: string, harf: string) => ayrac + buyukHarf(harf),
  );
  return buyukHarf(duzeltilmis);
}

/** Bu yaş bandında ve bu modda çıkabilecek kalıplar. */
export function uygunKaliplar(evre: Evre, yetiskinIcerik = false): SahneKalibi[] {
  return KALIPLAR.filter((k) => k.evreler.includes(evre) && (yetiskinIcerik || !k.yetiskin));
}

let sayac = 0;

/** Kalıbı somut bir sahneye dönüştürür: yuvalar dolar, etkiler aralıktan seçilir. */
export function sahneUret(kalip: SahneKalibi, evre: Evre, isYerleri: string[] = []): Olay {
  sayac += 1;
  const secenekler: Secenek[] = kalip.secenekler.map((sk) => {
    const s: Secenek = {
      t: rast(sk.t),
      etiketler: sk.etiketler,
      fx: etkiCoz(sk.fx),
      sonuc: rast(sk.sonuc),
    };
    if (sk.para) s.para = arasi(sk.para);
    if (sk.bayrak) s.bayrak = sk.bayrak;
    if (sk.onemli) s.onemli = true;
    if (sk.riskli) {
      s.riskli = sk.riskli;
      if (sk.kotu) {
        s.kotu = {
          fx: etkiCoz(sk.kotu.fx),
          sonuc: rast(sk.kotu.sonuc),
          ...(sk.kotu.para ? { para: arasi(sk.kotu.para) } : {}),
        };
      }
    }
    return s;
  });

  return {
    id: `uret-${kalip.id}-${sayac}`,
    evreler: [evre],
    alan: kalip.alan,
    emoji: rast(kalip.emoji),
    baslik: rast(kalip.baslik),
    metin: yuvalariDoldur(rast(kalip.durum), evre, isYerleri),
    secenekler,
    gerek: kalip.gerek,
    ...(kalip.zorunlu ? { zorunlu: true } : {}),
    ...(kalip.yetiskin ? { yetiskin: true } : {}),
    uretilmis: true,
  };
}

/** Kalıp havuzundan, son kullanılanları atlayarak bir sahne üretir. */
export function rastgeleSahne(
  evre: Evre,
  kacinilan: string[] = [],
  isYerleri: string[] = [],
  yetiskinIcerik = false,
): Olay | null {
  const hepsi = uygunKaliplar(evre, yetiskinIcerik);
  if (!hepsi.length) return null;
  const taze = hepsi.filter((k) => !kacinilan.includes(k.id));
  return sahneUret(rast(taze.length ? taze : hepsi), evre, isYerleri);
}

/** Bir sahnenin hangi kalıptan geldiği — tekrar kontrolü için. */
export function kalipId(olay: Olay): string | null {
  if (!olay.uretilmis) return null;
  const parcalar = olay.id.split("-");
  return parcalar.length >= 3 ? `${parcalar[1]}-${parcalar[2]}` : null;
}
