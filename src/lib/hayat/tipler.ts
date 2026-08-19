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

export type Karakter = {
  isim: string;
  cinsiyet: "kadin" | "erkek" | "belirsiz";
  baslangic: "bebek" | "cocuk" | "genc";
  koken: "varlikli" | "orta" | "zor" | "kimsesiz";
  meslek: "doktor" | "sanatci" | "muhendis" | "girisimci" | "sporcu" | "belirsiz";
  hedef: "servet" | "ask" | "iz" | "huzur" | "zirve";
  kisilikler: string[];
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
