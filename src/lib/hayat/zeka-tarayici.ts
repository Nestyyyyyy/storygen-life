/* Hayat Simülatörü — tarayıcı tarafı yapay zekâ istemcisi

   Oyuncu kendi anahtarını ayarlar panelinden girer; istekler doğrudan
   oyuncunun tarayıcısından sağlayıcıya gider, hiçbir sunucudan geçmez.
   Anahtar yalnızca bu cihazın localStorage'ında durur.

   Varsayılan sağlayıcı Gemini: ücretsiz anahtar veriyor ve ucu tarayıcıdan
   çağrıya (CORS) açık — doğrulandı. */

import type { Sorucu } from "./zeka";

export type ZekaAyar = {
  saglayici: "gemini" | "openrouter" | "openai" | "ozel";
  anahtar: string;
  model: string;
  /** Yalnızca "ozel" sağlayıcıda kullanılır. */
  url?: string;
};

export const SAGLAYICILAR: Record<
  Exclude<ZekaAyar["saglayici"], "ozel">,
  { ad: string; url: string; varsayilanModel: string; anahtarIpucu: string }
> = {
  gemini: {
    ad: "Google Gemini (ücretsiz)",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    varsayilanModel: "gemini-2.0-flash",
    anahtarIpucu: "aistudio.google.com/apikey adresinden ücretsiz alınır",
  },
  openrouter: {
    ad: "OpenRouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    varsayilanModel: "google/gemini-2.0-flash-exp:free",
    anahtarIpucu: "openrouter.ai/keys",
  },
  openai: {
    ad: "OpenAI",
    url: "https://api.openai.com/v1/chat/completions",
    varsayilanModel: "gpt-4o-mini",
    anahtarIpucu: "platform.openai.com/api-keys",
  },
};

const SAKLAMA_ANAHTARI = "hayat-zeka-ayar";

export function ayarYukle(): ZekaAyar | null {
  try {
    const ham = localStorage.getItem(SAKLAMA_ANAHTARI);
    if (!ham) return null;
    const a = JSON.parse(ham) as ZekaAyar;
    if (!a || typeof a.anahtar !== "string" || !a.anahtar.trim()) return null;
    return a;
  } catch {
    return null;
  }
}

export function ayarKaydet(ayar: ZekaAyar | null) {
  try {
    if (ayar) localStorage.setItem(SAKLAMA_ANAHTARI, JSON.stringify(ayar));
    else localStorage.removeItem(SAKLAMA_ANAHTARI);
  } catch {
    /* gizli sekmede saklama kapalı olabilir; oyun yine çalışır */
  }
}

export function ayarUcu(ayar: ZekaAyar): { url: string; model: string } {
  if (ayar.saglayici === "ozel") {
    return { url: ayar.url ?? "", model: ayar.model };
  }
  const s = SAGLAYICILAR[ayar.saglayici];
  return { url: s.url, model: ayar.model || s.varsayilanModel };
}

/** Kullanıcıya gösterilecek, sağlayıcı hatasını Türkçeleştiren mesaj. */
export function hataMesaji(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/401|403|API key|api anahtar/i.test(m))
    return "Anahtar geçersiz ya da yetkisiz. Ayarlardan kontrol et.";
  if (/429/.test(m)) return "Sağlayıcı 'çok hızlı' dedi; birkaç saniye sonra tekrar dene.";
  if (/Failed to fetch|NetworkError|CORS/i.test(m))
    return "Sağlayıcıya ulaşılamadı (ağ ya da CORS engeli).";
  return m;
}

/**
 * Oyuncunun ayarlarıyla soru soran Sorucu.
 * Yanıt biçimi ve temizleme sunucudakiyle birebir aynı kurallara tabidir;
 * asıl süzgeç zeka.ts içinde çalışır.
 */
export function tarayiciSorucu(ayar: ZekaAyar): Sorucu {
  const { url, model } = ayarUcu(ayar);
  return async (system, user, temperature, gerekli) => {
    let sonHata: unknown;
    for (let deneme = 0; deneme < 2; deneme++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ayar.anahtar.trim()}`,
          },
          body: JSON.stringify({
            model,
            temperature,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          }),
        });
        if (!res.ok) throw new Error(`Yapay zekâ isteği başarısız (${res.status})`);
        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const ham = (json.choices?.[0]?.message?.content ?? "").trim();
        const temiz = ham
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
      } catch (e) {
        sonHata = e;
        // Anahtar/kota hatasında ikinci deneme anlamsız.
        if (e instanceof Error && /401|403|429/.test(e.message)) break;
      }
    }
    throw sonHata instanceof Error ? sonHata : new Error("Yapay zekâya ulaşılamadı.");
  };
}

/* ---------- Kayıtlı seçim ----------
   Oyuncunun yapay zekâ tercihi: cihazdaki bizim model ya da kendi anahtarı.
   Eski sürümün kaydettiği düz ZekaAyar nesneleri anahtar seçimine göçürülür. */

export type ZekaSecim = { tur: "cihaz"; model: string } | { tur: "anahtar"; ayar: ZekaAyar };

const SECIM_ANAHTARI = "hayat-zeka-secim";

export function secimYukle(): ZekaSecim | null {
  try {
    const yeni = localStorage.getItem(SECIM_ANAHTARI);
    if (yeni) {
      const s = JSON.parse(yeni) as ZekaSecim;
      if (s?.tur === "cihaz" && typeof s.model === "string") return s;
      if (s?.tur === "anahtar" && s.ayar?.anahtar?.trim()) return s;
      return null;
    }
    const eski = ayarYukle();
    return eski ? { tur: "anahtar", ayar: eski } : null;
  } catch {
    return null;
  }
}

export function secimKaydet(secim: ZekaSecim | null) {
  try {
    if (secim) localStorage.setItem(SECIM_ANAHTARI, JSON.stringify(secim));
    else localStorage.removeItem(SECIM_ANAHTARI);
  } catch {
    /* saklama kapalı olabilir */
  }
}
