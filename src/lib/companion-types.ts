// Karakter modu — tarayıcıda da güvenle kullanılabilen paylaşılan tipler.

export type Genre = "fantastik" | "bilimkurgu" | "dram" | "gizem";

export const GENRES: { id: Genre; label: string; hint: string; blurb: string }[] = [
  {
    id: "fantastik",
    label: "Doğaüstü / Fantastik",
    hint: "Güç edinme, büyü, yaratıklar, savaşlar.",
    blurb: "Kanında uyanan bir güç ve onu senden önce fark eden biri.",
  },
  {
    id: "bilimkurgu",
    label: "Bilim Kurgu",
    hint: "Uzay istasyonları, siborglar, distopya.",
    blurb: "Bozuk bir istasyon, sahte kimlikler ve nefes kadar az zaman.",
  },
  {
    id: "dram",
    label: "Gerçekçi Dram",
    hint: "Günlük hayat, ilişki ve duygu odaklı sohbet.",
    blurb: "İki insan, bir şehir ve söylenmemiş onca cümle.",
  },
  {
    id: "gizem",
    label: "Gizem / Korku",
    hint: "Lanetli kasaba, kayıp dosyalar, gerilim.",
    blurb: "Kapanmamış bir dosya ve seni tanıyormuş gibi bakan biri.",
  },
];

export type CompanionMeters = {
  /** Aranızdaki bağ. */ bond: number;
  /** Sana duyduğu güven. */ trust: number;
  /** Kendi gücün / yeteneğin. */ power: number;
  /** Sahnedeki tehlike. */ danger: number;
};

export type Companion = {
  name: string;
  title: string;
  persona: string;
  voice: string;
  genre: Genre;
  world: string;
  quest: string;
};

export type CompanionEvent = {
  kind: "savaş" | "güç" | "sır" | "yol";
  label: string;
  text: string;
};

export type CompanionScene = {
  reply: string;
  action: string;
  suggestions: string[];
  delta: CompanionMeters;
  event?: CompanionEvent;
  engine: "ai" | "local";
};

export const START_METERS: CompanionMeters = { bond: 20, trust: 25, power: 15, danger: 20 };
