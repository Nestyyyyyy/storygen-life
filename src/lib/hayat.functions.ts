/* Hayat Simülatörü — sunucu fonksiyonları
   İstemci bunları çağırır. Yapay zekâ ulaşılamazsa aynı yanıt yerel
   motordan üretilir, oyun hiçbir durumda durmaz. */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { aiOneri, aiSahneUret } from "./hayat.server";
import { olaySec, oneriHesapla, type Oneri } from "./hayat/motor";
import type { Durum, Olay } from "./hayat/tipler";

const StatlarSchema = z.object({
  saglik: z.number(),
  mutluluk: z.number(),
  ask: z.number(),
  arkadaslik: z.number(),
  kariyer: z.number(),
});

const KarakterSchema = z.object({
  isim: z.string().max(24),
  cinsiyet: z.enum(["kadin", "erkek", "belirsiz"]),
  baslangic: z.enum(["bebek", "cocuk", "genc"]),
  koken: z.enum(["varlikli", "orta", "zor", "kimsesiz"]),
  meslek: z.enum(["doktor", "sanatci", "muhendis", "girisimci", "sporcu", "belirsiz"]),
  hedef: z.enum(["servet", "ask", "iz", "huzur", "zirve"]),
  kisilikler: z.array(z.string()).max(4),
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

export const sahneGetir = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SahneGirdi.parse(input))
  .handler(async ({ data }): Promise<SahneYanit> => {
    const durum = data.durum as Durum;
    if (data.yapayZeka) {
      const olay = await aiSahneUret(durum, data.kacinilanBasliklar);
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
