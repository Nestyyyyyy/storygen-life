/* Hayat Simülatörü — ortak tipler */

export type StatAnahtar = "saglik" | "mutluluk" | "ask" | "arkadaslik" | "kariyer";
export type Statlar = Record<StatAnahtar, number>;

export type Evre = "bebek" | "cocuk" | "genc" | "gencYetiskin" | "yetiskin" | "orta" | "yasli";

export type Alan =
  "aile" | "okul" | "arkadaslik" | "ask" | "kariyer" | "para" | "saglik" | "hayat" | "hayvan";

/** Seçeneklerin taşıdığı davranış etiketleri. Kişilik ve meslek tabloları
 *  bunlara bakarak ek etki ve anlatı cümlesi ekler. */
export type Etiket =
  | "cesaret"
  | "kacinma"
  | "risk"
  | "guvenli"
  | "sosyal"
  | "yalniz"
  | "romantik"
  | "sadakat"
  | "calisma"
  | "tembellik"
  | "yardim"
  | "bencil"
  | "durustluk"
  | "hile"
  | "tip"
  | "sanat"
  | "teknik"
  | "ticaret"
  | "spor"
  | "kesif";

export type Etki = Partial<Statlar>;

export type IliskiTur = "sevgili" | "es" | "arkadas" | "rakip" | "cocuk" | "kopek";

export type Iliski = {
  id: string;
  ad: string;
  tur: IliskiTur;
  ilkAsk: boolean;
  baslangic: number;
  aktif: boolean;
  bitis?: number;
};

/** Serbest metinle girilen bir meslek ya da kişilik özelliğinin oyun karşılığı.
 *  Oyuncu ne yazarsa yazsın, çözümleyici (profil.ts) ya da yapay zekâ onu
 *  etiket etkilerine çevirir; motor sadece bu şekli tanır. */
export type Ozellik = {
  /** Oyuncunun yazdığı metin — ekranda ve anlatıda bu görünür. */
  ad: string;
  /** Etiket → bu özelliğin o davranışa kattığı etki ve anlatı cümlesi. */
  etkiler: Partial<Record<Etiket, { fx: Etki; paraCarpan?: number; not: string }>>;
  /** Oyuna başlarken statlara bir kerelik etki. */
  fx?: Etki;
  /** Bu işin geçtiği yerler — kariyer/para sahneleri buralarda kurulur. */
  ortam?: string[];
  /** Profili kim çıkardı: yerel sözlük mü, yapay zekâ mı? */
  kaynak?: "yerel" | "ai";
};

export type Karakter = {
  isim: string;
  cinsiyet: "kadin" | "erkek" | "belirsiz";
  baslangic: "bebek" | "cocuk" | "genc";
  koken: "varlikli" | "orta" | "zor" | "kimsesiz";
  /** Serbest metin: "gemi makinisti", "gece vardiyası hemşiresi"... */
  meslek: Ozellik;
  hedef: "servet" | "ask" | "iz" | "huzur" | "zirve";
  /** Serbest metin, sayısı sınırsız. Çok yazılırsa her biri daha hafif etki eder. */
  kisilikler: Ozellik[];
};

/** Bir seçeneğin oynanabilir hali. */
export type Secenek = {
  t: string;
  etiketler: Etiket[];
  fx: Etki;
  para?: number;
  sonuc: string;
  /** Kişilik anahtarına göre tam anlatı varyantı. */
  sonucKisilik?: Record<string, string>;
  onemli?: boolean;
  iliski?: { tur: IliskiTur; ilkAsk?: boolean };
  iliskiYukselt?: { eski: IliskiTur; yeni: IliskiTur };
  iliskiBitir?: IliskiTur;
  bayrak?: string[];
  /** 0-1 arası başarısızlık olasılığı. */
  riskli?: number;
  kotu?: { fx: Etki; para?: number; sonuc: string };
};

/** Ekrana gelen olay. Hem elle yazılmış hem üretilmiş sahneler bu şekli alır. */
export type Olay = {
  id: string;
  evreler: (Evre | "hepsi")[];
  alan: Alan;
  emoji: string;
  baslik: string;
  metin: string;
  secenekler: Secenek[];
  kaosOnly?: boolean;
  gerek?: {
    bayrak?: string[];
    yokBayrak?: string[];
    iliski?: IliskiTur;
    yokIliski?: IliskiTur;
    minYas?: number;
    maxYas?: number;
  };
  tekSefer?: boolean;
  agirlik?: number;
  /** Seçim hakkı yok: olan olmuş, oyuncu sadece okuyup devam eder. */
  zorunlu?: boolean;
  /** Sadece +18 modunda ve karakter reşitken çıkar. */
  yetiskin?: boolean;
  /** Sahne prosedürel üreteçten mi geldi? İstatistik ve tekrar kontrolü için. */
  uretilmis?: boolean;
  /** Yapay zekâ ürettiyse işaretlenir. */
  yapayZeka?: boolean;
};

/** Oyunun o anki tam durumu — motor fonksiyonlarının hepsi bunu alır. */
export type Durum = {
  yas: number;
  omur: number;
  statlar: Statlar;
  para: number;
  mod: string;
  karakter: Karakter;
  bayraklar: string[];
  iliskiler: Iliski[];
  gorulen: string[];
  gecmis: { yas: number; baslik: string; secim: string }[];
};
