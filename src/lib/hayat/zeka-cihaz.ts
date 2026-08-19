/* Hayat Simülatörü — cihaz-içi yapay zekâ (bizim model)

   Açık kaynak bir dil modeli, WebLLM ile doğrudan oyuncunun cihazında
   (WebGPU üzerinde) çalışır. Anahtar yok, kota yok, sağlayıcı yok:
   model ilk seferde bir kez indirilir, tarayıcı önbelleğine yerleşir ve
   sonraki açılışlarda saniyeler içinde hazır olur.

   Aynı Sorucu arayüzünü doldurur; istemler ve temizleyiciler zeka.ts'ten
   olduğu gibi kullanılır. Model küçük olduğu için çıktısı büyük modeller
   kadar iyi değildir — bozuk çıktıyı süzgeç eler, oyun yerel motora düşer. */

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
    ad: "Hızlı",
    aciklama: "Küçük iniş (~350 MB), zayıf cihazlarda da çalışır; yazımı daha basit.",
    indirmeMB: 350,
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    ad: "Önerilen",
    aciklama: "Daha iyi Türkçe ve daha tutarlı sahneler (~950 MB, bir kez iner).",
    indirmeMB: 950,
  },
];

export function cihazDestekliMi(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export type YuklemeDurumu = { metin: string; oran: number };

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

function motoruGetir(
  modelId: string,
  onYukleme: (d: YuklemeDurumu) => void,
): Promise<MLCEngineInterface> {
  if (motorSozu && aktifModelId === modelId) return motorSozu;
  aktifModelId = modelId;
  motorSozu = (async () => {
    const webllm = await import("@mlc-ai/web-llm");
    const secenekler = {
      initProgressCallback: (r: { text: string; progress: number }) => {
        // "Fetching param cache[23/24]..." gibi metinleri sadeleştir.
        const metin = /fetch/i.test(r.text)
          ? "model iniyor"
          : /load/i.test(r.text)
            ? "model hazırlanıyor"
            : "başlatılıyor";
        onYukleme({ metin, oran: Math.round(r.progress * 100) });
      },
    };
    if (workerYolu) {
      const worker = new Worker(workerYolu, { type: "module" });
      return webllm.CreateWebWorkerMLCEngine(worker, modelId, secenekler);
    }
    return webllm.CreateMLCEngine(modelId, secenekler);
  })();
  motorSozu.catch(() => {
    // Başarısız kurulum bir daha denenebilsin.
    motorSozu = null;
    aktifModelId = null;
  });
  return motorSozu;
}

/**
 * Cihazdaki modelle soru soran Sorucu. İlk çağrı modeli indirir/başlatır;
 * ilerleme onYukleme ile bildirilir. Çıktı JSON değilse hata fırlatır —
 * çağıran katman zaten yerel motora düşmeyi biliyor.
 */
export function cihazSorucu(modelId: string, onYukleme: (d: YuklemeDurumu) => void): Sorucu {
  return async (system, user, temperature, gerekli) => {
    let ham: string;
    if (typeof window !== "undefined" && window.__cihazTaklit) {
      ham = await window.__cihazTaklit(system, user);
    } else {
      const motor = await motoruGetir(modelId, onYukleme);
      const yanit = await motor.chat.completions.create({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: Math.min(1, temperature),
        max_tokens: 900,
        response_format: { type: "json_object" },
      });
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

/** Model önbellekte hazırsa başlatmayı arka planda tetikler (açılışta çağrılır). */
export function cihazOnIsit(modelId: string, onYukleme: (d: YuklemeDurumu) => void) {
  if (!cihazDestekliMi()) return;
  void motoruGetir(modelId, onYukleme).catch(() => {
    /* hata, ilk gerçek soruda kullanıcıya gösterilir */
  });
}
