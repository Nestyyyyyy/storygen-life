/* Hayat Simülatörü — sunucu fonksiyonları
   İstemci bunları çağırır. Yapay zekâ ulaşılamazsa aynı yanıt yerel
   motordan üretilir, oyun hiçbir durumda durmaz. */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  aiAlanOner,
  aiIsimOner,
  aiOneri,
  aiProfilCoz,
  aiSahneUret,
  aiSerbestCevap,
} from "./hayat.server";
import { olaySec, oneriHesapla, serbestSecenek, type Oneri } from "./hayat/motor";
import { yerelOneri, yerelOzellik } from "./hayat/profil";
import { ISIMLER } from "./hayat/veri";
import type { Durum, Olay, Ozellik, Secenek } from "./hayat/tipler";

const StatlarSchema = z.object({
  saglik: z.number(),
  mutluluk: z.number(),
  ask: z.number(),
  arkadaslik: z.number(),
  kariyer: z.number(),
});

const EtkiSchema = z.record(z.string(), z.number());

const OzellikSchema = z.object({
  ad: z.string().max(40),
  etkiler: z.record(
    z.string(),
    z.object({ fx: EtkiSchema, paraCarpan: z.number().optional(), not: z.string().max(200) }),
  ),
  fx: EtkiSchema.optional(),
  kaynak: z.enum(["yerel", "ai"]).optional(),
});

const KarakterSchema = z.object({
  isim: z.string().max(24),
  cinsiyet: z.enum(["kadin", "erkek", "belirsiz"]),
  baslangic: z.enum(["bebek", "cocuk", "genc"]),
  koken: z.enum(["varlikli", "orta", "zor", "kimsesiz"]),
  meslek: OzellikSchema,
  hedef: z.enum(["servet", "ask", "iz", "huzur", "zirve"]),
  kisilikler: z.array(OzellikSchema).max(20),
});

const IliskiSchema = z.object({
  id: z.string(),
  ad: z.string(),
  tur: z.enum(["sevgili", "es", "arkadas", "rakip", "cocuk", "kopek"]),
  ilkAsk: z.boolean(),
  baslangic: z.number(),
  aktif: z.boolean(),
  bitis: z.number().optional(),
});

const DurumSchema = z.object({
  yas: z.number().min(0).max(130),
  omur: z.number(),
  statlar: StatlarSchema,
  para: z.number(),
  mod: z.string(),
  karakter: KarakterSchema,
  bayraklar: z.array(z.string()).max(60),
  iliskiler: z.array(IliskiSchema).max(40),
  gorulen: z.array(z.string()).max(200),
  gecmis: z.array(z.object({ yas: z.number(), baslik: z.string(), secim: z.string() })).max(120),
});

const SahneGirdi = z.object({
  durum: DurumSchema,
  sonKaliplar: z.array(z.string()).max(20).default([]),
  kacinilanBasliklar: z.array(z.string()).max(40).default([]),
  /** Oyuncu ayarlardan yapay zekâyı kapatmışsa doğrudan yerel motor kullanılır. */
  yapayZeka: z.boolean().default(true),
});

export type SahneYanit = { olay: Olay; motor: "ai" | "yerel" };

/** Sahnelerin bir kısmında oyuncunun seçim hakkı yoktur; hayat sormadan yapar. */
const ZORUNLU_ORANI = 0.16;

export const sahneGetir = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SahneGirdi.parse(input))
  .handler(async ({ data }): Promise<SahneYanit> => {
    const durum = data.durum as Durum;
    if (data.yapayZeka) {
      const zorunlu = Math.random() < ZORUNLU_ORANI;
      const olay = await aiSahneUret(durum, data.kacinilanBasliklar, { zorunlu });
      if (olay) return { olay, motor: "ai" };
    }
    return { olay: olaySec(durum, data.sonKaliplar), motor: "yerel" };
  });

const SecenekSchema = z.object({
  t: z.string(),
  etiketler: z.array(z.string()),
  fx: z.record(z.string(), z.number()).default({}),
  para: z.number().optional(),
  sonuc: z.string(),
  riskli: z.number().optional(),
  kotu: z
    .object({
      fx: z.record(z.string(), z.number()).default({}),
      para: z.number().optional(),
      sonuc: z.string(),
    })
    .optional(),
});

const OneriGirdi = z.object({
  durum: DurumSchema,
  olay: z.object({
    id: z.string(),
    baslik: z.string(),
    metin: z.string(),
    secenekler: z.array(SecenekSchema).min(1).max(6),
  }),
  yapayZeka: z.boolean().default(true),
});

export const oneriGetir = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => OneriGirdi.parse(input))
  .handler(async ({ data }): Promise<Oneri> => {
    const durum = data.durum as Durum;
    const olay = data.olay as unknown as Olay;
    const yerel = oneriHesapla(olay, durum);
    if (!data.yapayZeka) return yerel;

    const ai = await aiOneri(olay, durum);
    if (!ai) return yerel;
    return { indeks: ai.indeks, gerekce: ai.gerekce, puanlar: yerel.puanlar, kaynak: "ai" };
  });

/* ---------- Karakter oluşturma yardımcıları ---------- */

const AlanOneriGirdi = z.object({
  tur: z.enum(["meslek", "kisilik"]),
  ipucu: z.string().max(60).optional(),
  kacinilan: z.array(z.string().max(60)).max(20).default([]),
});

/** "Öner" düğmesi: boşsa sürpriz bir öneri, ipucu verilmişse o kelimeden türetir. */
export const alanOner = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AlanOneriGirdi.parse(input))
  .handler(async ({ data }): Promise<{ deger: string; kaynak: "ai" | "yerel" }> => {
    const ai = await aiAlanOner(data.tur, data.ipucu, data.kacinilan);
    if (ai) return { deger: ai, kaynak: "ai" };
    return { deger: yerelOneri(data.tur, data.ipucu, data.kacinilan), kaynak: "yerel" };
  });

const IsimOneriGirdi = z.object({
  cinsiyet: z.enum(["kadin", "erkek", "belirsiz"]),
  kacinilan: z.array(z.string().max(40)).max(20).default([]),
});

export const isimOner = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IsimOneriGirdi.parse(input))
  .handler(async ({ data }): Promise<{ deger: string; kaynak: "ai" | "yerel" }> => {
    const ai = await aiIsimOner(data.cinsiyet, data.kacinilan);
    if (ai) return { deger: ai, kaynak: "ai" };
    const havuz =
      data.cinsiyet === "kadin"
        ? ISIMLER.kadin
        : data.cinsiyet === "erkek"
          ? ISIMLER.erkek
          : [...ISIMLER.kadin, ...ISIMLER.erkek];
    const taze = havuz.filter((i) => !data.kacinilan.includes(i));
    const liste = taze.length ? taze : havuz;
    return { deger: liste[Math.floor(Math.random() * liste.length)], kaynak: "yerel" };
  });

const ProfilGirdi = z.object({
  ad: z.string().max(40),
  tur: z.enum(["meslek", "kisilik"]),
});

/** Serbest metni oyun profiline çevirir: önce yapay zekâ, olmazsa yerel sözlük. */
export const profilCoz = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ProfilGirdi.parse(input))
  .handler(async ({ data }): Promise<Ozellik> => {
    const ai = await aiProfilCoz(data.ad, data.tur === "meslek" ? "meslek" : "kisilik");
    if (ai) return ai;
    return yerelOzellik(data.ad, data.tur === "meslek" ? "meslek" : "kisilik");
  });

const SerbestCevapGirdi = z.object({
  durum: DurumSchema,
  olay: z.object({
    id: z.string(),
    baslik: z.string(),
    metin: z.string(),
    secenekler: z.array(SecenekSchema).min(1).max(6),
  }),
  metin: z.string().min(1).max(140),
  yapayZeka: z.boolean().default(true),
});

/** Oyuncunun kendi yazdığı cevabı oynanabilir bir seçeneğe çevirir. */
export const serbestCevap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SerbestCevapGirdi.parse(input))
  .handler(async ({ data }): Promise<{ secenek: Secenek; motor: "ai" | "yerel" }> => {
    const durum = data.durum as Durum;
    if (data.yapayZeka) {
      const olay = data.olay as unknown as Olay;
      const ai = await aiSerbestCevap(data.metin, olay, durum);
      if (ai) return { secenek: ai, motor: "ai" };
    }
    return { secenek: serbestSecenek(data.metin, durum), motor: "yerel" };
  });
