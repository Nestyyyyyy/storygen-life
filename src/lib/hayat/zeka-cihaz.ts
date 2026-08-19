/* Hayat Simülatörü — cihaz-içi yapay zekâ (bizim model)

   Açık kaynak bir dil modeli, WebLLM ile doğrudan oyuncunun cihazında
   (WebGPU üzerinde) çalışır. Anahtar yok, kota yok, sağlayıcı yok.

   Önemli davranış: model HAZIR OLANA KADAR oyun beklemez. Sorucu,
   hazırlık bitmemişse hemen CIHAZ_HAZIRLANIYOR fırlatır; çağıran katman
   sessizce yerel motora düşer ve indirme ekrandaki kartta ilerler.
   Ağırlıklar tarayıcı önbelleğine (Cache API) yerleşir; sonraki
   ziyaretlerde indirme değil, önbellekten yükleme olur. */

import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import type { Sorucu } from "./zeka";

export type CihazModeli = {
  id: string;
  ad: string;
  aciklama: string;
  indirmeMB: number;
};

/* Türkçesi bu boyut sınıfında en güçlü olan açık modeller (MLC ön derlemeleri). */
export const CIHAZ_MODELLERI: CihazModeli[] = [
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    ad: "Hızlı — telefon için",
    aciklama: "Küçük iniş (~350 MB), her cihazda akıcı; yazımı daha basit.",
    indirmeMB: 350,
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    ad: "Güçlü — bilgisayar için",
    aciklama: "Daha iyi Türkçe, daha tutarlı sahneler (~950 MB); telefonda yavaş kalabilir.",
    indirmeMB: 950,
  },
];

export function cihazDestekliMi(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/** İndirme kartının ve durum çubuğunun tek gerçeği. */
export type CihazDurum = {
  asama: "iniyor" | "onbellek" | "hazirlaniyor" | "hazir" | "hata";
  /** 0-100 */
  oran: number;
  mesaj?: string;
};

export const CIHAZ_HAZIRLANIYOR = "CIHAZ_HAZIRLANIYOR";

const INDIRILDI_ONEKI = "hayat-cihaz-indirildi:";

/**
 * WebLLM'in ilerleme metnini oyunun aşamalarına çevirir.
 * (Metinler İngilizce ve sürüme göre değişebilir; kural gevşek tutuldu.)
 */
export function ilerlemeCoz(metin: string, oran: number): CihazDurum {
  const yuzde = Math.max(0, Math.min(100, Math.round(oran * 100)));
  if (/cache/i.test(metin) && !/fetching param cache\[\d+\/\d+\]: 0B/i.test(metin)) {
    // "Loading model from cache" / önbellekten okunan parçalar
    if (/loading.*cache|from cache/i.test(metin)) return { asama: "onbellek", oran: yuzde };
  }
  if (/fetch/i.test(metin)) return { asama: "iniyor", oran: yuzde };
  if (/finish|shader|gpu|initiali[sz]/i.test(metin)) return { asama: "hazirlaniyor", oran: yuzde };
  if (/load/i.test(metin)) return { asama: "onbellek", oran: yuzde };
  return { asama: "hazirlaniyor", oran: yuzde };
}

/** Bu model daha önce bu cihaza tamamen indirildi mi? */
export function cihazIndirildiMi(modelId: string): boolean {
  try {
    return localStorage.getItem(INDIRILDI_ONEKI + modelId) === "1";
  } catch {
    return false;
  }
}

function indirildiIsaretle(modelId: string) {
  try {
    localStorage.setItem(INDIRILDI_ONEKI + modelId, "1");
  } catch {
    /* saklama kapalı olabilir */
  }
}

/* Statik (GitHub Pages) sürüm ayrı bir worker paketi servis eder; motoru
   orada çalıştırmak arayüzü akıcı tutar. Yol verilmezse ana iş parçacığı. */
let workerYolu: string | null = null;
export function cihazWorkerYolu(yol: string) {
  workerYolu = yol;
}

/* Testler gerçek modeli indiremeyen ortamlarda motoru taklit edebilsin. */
declare global {
  interface Window {
    __cihazTaklit?: (system: string, user: string) => Promise<string>;
  }
}

let motorSozu: Promise<MLCEngineInterface> | null = null;
let aktifModelId: string | null = null;
let hazirModelId: string | null = null;

export function cihazHazirMi(modelId: string): boolean {
  return hazirModelId === modelId;
}

/**
 * Motoru başlatır (gerekirse indirir). Aynı model için tek kurulum yürür;
 * ilerleme ve hata onDurum'a akar.
 */
export function cihazBaslat(
  modelId: string,
  onDurum: (d: CihazDurum) => void,
): Promise<MLCEngineInterface> {
  if (motorSozu && aktifModelId === modelId) return motorSozu;
  aktifModelId = modelId;
  hazirModelId = null;
  motorSozu = (async () => {
    // Ağırlıklar büyük: tarayıcıdan önbelleği korumasını iste (sessizce).
    try {
      void navigator.storage?.persist?.();
    } catch {
      /* desteklenmiyorsa sorun değil */
    }
    const webllm = await import("@mlc-ai/web-llm");
    const secenekler = {
      initProgressCallback: (r: { text: string; progress: number }) =>
        onDurum(ilerlemeCoz(r.text, r.progress)),
    };
    const motor = workerYolu
      ? await webllm.CreateWebWorkerMLCEngine(
          new Worker(workerYolu, { type: "module" }),
          modelId,
          secenekler,
        )
      : await webllm.CreateMLCEngine(modelId, secenekler);
    hazirModelId = modelId;
    indirildiIsaretle(modelId);
    onDurum({ asama: "hazir", oran: 100 });
    return motor;
  })();
  motorSozu.catch((e) => {
    motorSozu = null;
    aktifModelId = null;
    onDurum({
      asama: "hata",
      oran: 0,
      mesaj: e instanceof Error ? e.message.slice(0, 160) : "Model başlatılamadı.",
    });
  });
  return motorSozu;
}

/** Açılışta çağrılır: model seçiliyse kurulumu arka planda yürütür. */
export function cihazOnIsit(modelId: string, onDurum: (d: CihazDurum) => void) {
  if (!cihazDestekliMi()) return;
  void cihazBaslat(modelId, onDurum).catch(() => {
    /* hata onDurum ile bildirildi */
  });
}

function zamanAsimi<T>(soz: Promise<T>, ms: number, kes: () => void): Promise<T> {
  return Promise.race([
    soz,
    new Promise<never>((_, red) =>
      setTimeout(() => {
        // Takılan üretim motoru da kilitler: kesmezsek sonraki her soru
        // kuyrukta bekler ve hepsi zaman aşımına düşer.
        kes();
        red(new Error("Model yanıt vermedi (zaman aşımı)."));
      }, ms),
    ),
  ]);
}

/**
 * Cihazdaki modelle soru soran Sorucu.
 * Model hazır değilse BEKLEMEZ: kurulumu tetikler ve CIHAZ_HAZIRLANIYOR
 * fırlatır — oyun o sahneyi yerel motordan alır, indirme kartta ilerler.
 */
export function cihazSorucu(modelId: string, onDurum: (d: CihazDurum) => void): Sorucu {
  return async (system, user, temperature, gerekli, enCokJeton) => {
    let ham: string;
    if (typeof window !== "undefined" && window.__cihazTaklit) {
      ham = await window.__cihazTaklit(system, user);
    } else {
      if (!cihazHazirMi(modelId)) {
        cihazOnIsit(modelId, onDurum);
        throw new Error(CIHAZ_HAZIRLANIYOR);
      }
      const motor = await cihazBaslat(modelId, onDurum);
      const butce = enCokJeton ?? 700;
      // Kısa cevaplı sorular (isim, öneri) uzun süre "Düşünüyor" diyemez.
      const sinir = butce <= 200 ? 45_000 : 100_000;
      const yanit = await zamanAsimi(
        motor.chat.completions.create({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: Math.min(1, temperature),
          max_tokens: butce,
          response_format: { type: "json_object" },
        }),
        sinir,
        () => {
          try {
            void motor.interruptGenerate();
          } catch {
            /* motor zaten ölmüş olabilir */
          }
        },
      );
      ham = yanit.choices[0]?.message?.content ?? "";
    }

    const temiz = ham
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const bas = temiz.indexOf("{");
    const son = temiz.lastIndexOf("}");
    const dilim = bas >= 0 && son > bas ? temiz.slice(bas, son + 1) : temiz;
    const nesne = JSON.parse(dilim) as Record<string, unknown>;
    const eksik = gerekli.filter((k) => {
      const v = nesne[k];
      return v === undefined || v === null || (typeof v === "string" && !v.trim());
    });
    if (eksik.length) throw new Error(`Eksik alanlar: ${eksik.join(", ")}`);
    return nesne;
  };
}
