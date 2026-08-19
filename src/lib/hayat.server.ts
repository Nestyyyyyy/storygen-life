/* Hayat Simülatörü — sunucu tarafı yapay zekâ bağlayıcısı

   Bütün istem ve temizleme mantığı src/lib/hayat/zeka.ts içinde; burada
   yalnızca ortam değişkenindeki anahtarla soru soran Sorucu bağlanıyor. */

import { askAi } from "./life.server";
import {
  zAlanOner,
  zIsimOner,
  zOneri,
  zProfilCoz,
  zSahneUret,
  zSerbestCevap,
  type Sorucu,
} from "./hayat/zeka";
import type { Durum, Olay, Ozellik, Secenek } from "./hayat/tipler";

const sunucuSorucu: Sorucu = (system, user, temperature, gerekli) =>
  askAi(system, user, temperature, gerekli);

export const aiSahneUret = (
  durum: Durum,
  kacinilan: string[],
  secenekler: { zorunlu?: boolean } = {},
): Promise<Olay | null> => zSahneUret(sunucuSorucu, durum, kacinilan, secenekler);

export const aiOneri = (
  olay: Olay,
  durum: Durum,
): Promise<{ indeks: number; gerekce: string } | null> => zOneri(sunucuSorucu, olay, durum);

export const aiProfilCoz = (ad: string, tur: "kisilik" | "meslek"): Promise<Ozellik | null> =>
  zProfilCoz(sunucuSorucu, ad, tur);

export const aiIsimOner = (cinsiyet: string, kacinilan: string[]): Promise<string | null> =>
  zIsimOner(sunucuSorucu, cinsiyet, kacinilan);

export const aiAlanOner = (
  tur: "meslek" | "kisilik",
  ipucu: string | undefined,
  kacinilan: string[],
): Promise<string | null> => zAlanOner(sunucuSorucu, tur, ipucu, kacinilan);

export const aiSerbestCevap = (metin: string, olay: Olay, durum: Durum): Promise<Secenek | null> =>
  zSerbestCevap(sunucuSorucu, metin, olay, durum);
