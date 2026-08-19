/* Hayat Simülatörü — yapay zekâ sarmalayıcısı

   HayatOyunu'nu sarar ve iki şeyi çözer:

   1. Görünürlük: yapay zekânın o an açık mı kapalı mı olduğu ekranın
      üstündeki çubukta her zaman yazar. Sessiz yerel moda düşüş yok.
   2. Oyuncunun kendi anahtarı: ayarlar panelinden ücretsiz bir Gemini
      anahtarı girilirse sahneleri, önerileri ve serbest cevapları model
      yazar — istekler doğrudan oyuncunun tarayıcısından gider.

   Öncelik: oyuncunun anahtarı > sunucudaki anahtar > yerel motor. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Settings2, Sparkles, X } from "lucide-react";

import HayatOyunu, {
  type AlanOneriSaglayici,
  type IsimOneriSaglayici,
  type OneriSaglayici,
  type ProfilSaglayici,
  type SahneSaglayici,
  type SerbestCevapSaglayici,
} from "@/components/HayatOyunu";
import { olaySec, oneriHesapla, serbestSecenek } from "@/lib/hayat/motor";
import { yerelOneri, yerelOzellik } from "@/lib/hayat/profil";
import { ISIMLER } from "@/lib/hayat/veri";
import {
  zAlanOner,
  zIsimOner,
  zOneri,
  zProfilCoz,
  zSahneUret,
  zSerbestCevap,
} from "@/lib/hayat/zeka";
import {
  SAGLAYICILAR,
  ayarUcu,
  hataMesaji,
  secimKaydet,
  secimYukle,
  tarayiciSorucu,
  type ZekaAyar,
  type ZekaSecim,
} from "@/lib/hayat/zeka-tarayici";
import {
  CIHAZ_HAZIRLANIYOR,
  CIHAZ_MODELLERI,
  cihazDestekliMi,
  cihazIndirildiMi,
  cihazOnIsit,
  cihazSorucu,
  type CihazDurum,
} from "@/lib/hayat/zeka-cihaz";
import type { Sorucu } from "@/lib/hayat/zeka";
import type { Durum } from "@/lib/hayat/tipler";

const C = {
  bg: "#17122a",
  kart: "#2b2146",
  kenar: "#3a2e5c",
  krem: "#ece7f5",
  solgun: "#9a8fb5",
  altin: "#f5b942",
  gok: "#7da8ff",
  kirmizi: "#ff9090",
};
const sans = "system-ui, -apple-system, sans-serif";

/** Sunucudaki yapay zekâ sağlayıcıları (varsa). */
type SunucuSaglayicilar = {
  sahne?: SahneSaglayici;
  oneri?: OneriSaglayici;
  alanOneri?: AlanOneriSaglayici;
  isimOneri?: IsimOneriSaglayici;
  profil?: ProfilSaglayici;
  serbestCevap?: SerbestCevapSaglayici;
};

type Props = {
  sunucu?: SunucuSaglayicilar;
  /** Sunucuda anahtar tanımlı mı? Durum çubuğu buna göre yazar. */
  sunucuZekaVar?: boolean;
};

const ZORUNLU_ORANI = 0.16;

export default function HayatZeka({ sunucu, sunucuZekaVar = false }: Props) {
  const [secim, setSecim] = useState<ZekaSecim | null>(() =>
    typeof window === "undefined" ? null : secimYukle(),
  );
  const [panelAcik, setPanelAcik] = useState(false);
  const [sonHata, setSonHata] = useState<string | null>(null);
  const [cihazDurum, setCihazDurum] = useState<CihazDurum | null>(null);
  const hataZamani = useRef(0);

  /* Hata bildirimi 12 sn sonra kendiliğinden kapanır. */
  useEffect(() => {
    if (!sonHata) return;
    const z = setTimeout(() => setSonHata(null), 12000);
    return () => clearTimeout(z);
  }, [sonHata]);

  /* "Hazır ✓" kartı kısa süre görünüp kaybolur. */
  useEffect(() => {
    if (cihazDurum?.asama !== "hazir") return;
    const z = setTimeout(() => setCihazDurum(null), 2400);
    return () => clearTimeout(z);
  }, [cihazDurum]);

  /* Test kancası: sandbox gerçek indirme yapamadığı için testler kart
     durumlarını buradan sürer. Yalnızca taklit modunda açılır. */
  useEffect(() => {
    if (typeof window !== "undefined" && window.__cihazTaklit) {
      (window as unknown as { __cihazDurumAyarla?: typeof setCihazDurum }).__cihazDurumAyarla =
        setCihazDurum;
    }
  }, []);

  /* Cihaz modeli seçiliyse açılışta ısıt: önbellekteyse saniyeler içinde hazır. */
  useEffect(() => {
    if (secim?.tur === "cihaz" && cihazDestekliMi()) {
      cihazOnIsit(secim.model, setCihazDurum);
    }
  }, [secim]);

  const hataBildir = (e: unknown) => {
    // Model daha hazırlanıyorsa bu bir hata değil: kart zaten ilerlemeyi
    // gösteriyor, sahne sessizce yerel motordan gelir.
    if (e instanceof Error && e.message === CIHAZ_HAZIRLANIYOR) return;
    setSonHata(hataMesaji(e));
    hataZamani.current = Date.now();
  };

  /* Oyuncu anahtarıyla çalışan sağlayıcılar. Model düşerse hatayı durum
     çubuğuna yazar ve yerel motora döner — oyun asla durmaz. */
  const oyuncuSaglayicilari = useMemo(() => {
    if (!secim) return null;
    if (secim.tur === "cihaz" && !cihazDestekliMi()) return null;
    const sorucu: Sorucu =
      secim.tur === "cihaz" ? cihazSorucu(secim.model, setCihazDurum) : tarayiciSorucu(secim.ayar);

    const sahne: SahneSaglayici = async ({ durum, sonKaliplar, kacinilanBasliklar }) => {
      try {
        const zorunlu = Math.random() < ZORUNLU_ORANI;
        const olay = await zSahneUret(sorucu, durum, kacinilanBasliklar, { zorunlu });
        if (olay) {
          setSonHata(null);
          return { olay, motor: "ai" as const };
        }
      } catch (e) {
        hataBildir(e);
      }
      return { olay: olaySec(durum, sonKaliplar), motor: "yerel" as const };
    };

    const oneri: OneriSaglayici = async ({ durum, olay }) => {
      const yerel = oneriHesapla(olay, durum);
      try {
        const ai = await zOneri(sorucu, olay, durum);
        if (ai)
          return {
            indeks: ai.indeks,
            gerekce: ai.gerekce,
            puanlar: yerel.puanlar,
            kaynak: "ai" as const,
          };
      } catch (e) {
        hataBildir(e);
      }
      return yerel;
    };

    const alanOneri: AlanOneriSaglayici = async ({ tur, ipucu, kacinilan }) => {
      try {
        const deger = await zAlanOner(sorucu, tur, ipucu, kacinilan);
        if (deger) return { deger, kaynak: "ai" as const };
      } catch (e) {
        hataBildir(e);
      }
      return { deger: yerelOneri(tur, ipucu, kacinilan), kaynak: "yerel" as const };
    };

    const isimOneri: IsimOneriSaglayici = async ({ cinsiyet, kacinilan }) => {
      try {
        const deger = await zIsimOner(sorucu, cinsiyet, kacinilan);
        if (deger) return { deger, kaynak: "ai" as const };
      } catch (e) {
        hataBildir(e);
      }
      const havuz =
        cinsiyet === "kadin"
          ? ISIMLER.kadin
          : cinsiyet === "erkek"
            ? ISIMLER.erkek
            : [...ISIMLER.kadin, ...ISIMLER.erkek];
      return { deger: havuz[Math.floor(Math.random() * havuz.length)], kaynak: "yerel" as const };
    };

    const profil: ProfilSaglayici = async ({ ad, tur }) => {
      try {
        const p = await zProfilCoz(sorucu, ad, tur);
        if (p) return p;
      } catch (e) {
        hataBildir(e);
      }
      return yerelOzellik(ad, tur);
    };

    const serbestCevap: SerbestCevapSaglayici = async ({ durum, olay, metin }) => {
      try {
        const secenek = await zSerbestCevap(sorucu, metin, olay, durum);
        if (secenek) return { secenek, motor: "ai" as const };
      } catch (e) {
        hataBildir(e);
      }
      return { secenek: serbestSecenek(metin, durum as Durum), motor: "yerel" as const };
    };

    return { sahne, oneri, alanOneri, isimOneri, profil, serbestCevap };
  }, [secim]);

  const aktif = oyuncuSaglayicilari ?? (sunucuZekaVar ? sunucu : undefined);
  const durumYazisi = oyuncuSaglayicilari
    ? secim!.tur === "cihaz"
      ? cihazDurum && cihazDurum.asama !== "hazir"
        ? "bizim model hazırlanıyor…"
        : "yapay zekâ açık · bizim model"
      : `yapay zekâ açık · ${ayarUcu((secim as { tur: "anahtar"; ayar: ZekaAyar }).ayar).model}`
    : sunucuZekaVar
      ? "yapay zekâ açık · sunucu"
      : "yapay zekâ kapalı";

  return (
    <div style={{ position: "relative" }}>
      {/* Durum çubuğu */}
      <button
        onClick={() => setPanelAcik(true)}
        aria-label="Yapay zekâ ayarları"
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 13px",
          borderRadius: 999,
          border: `1px solid ${aktif ? C.altin : C.kenar}`,
          background: "rgba(23, 18, 42, 0.92)",
          color: aktif ? C.altin : C.solgun,
          fontFamily: sans,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {aktif ? <Sparkles size={13} /> : <Settings2 size={13} />}
        {durumYazisi}
      </button>

      {sonHata && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 52,
            right: 10,
            zIndex: 40,
            maxWidth: 300,
            padding: "9px 12px",
            borderRadius: 12,
            border: `1px solid ${C.kirmizi}55`,
            background: "rgba(23, 18, 42, 0.95)",
            color: C.kirmizi,
            fontFamily: sans,
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          {sonHata} Bu sahne yerel motordan geldi.
        </div>
      )}

      {secim?.tur === "cihaz" && cihazDurum && (
        <IndirmeKarti
          durum={cihazDurum}
          modelAd={CIHAZ_MODELLERI.find((m) => m.id === secim.model)?.ad ?? "Model"}
          onTekrar={() => cihazOnIsit(secim.model, setCihazDurum)}
        />
      )}

      <HayatOyunu
        sahneSaglayici={aktif?.sahne}
        oneriSaglayici={aktif?.oneri}
        alanOneriSaglayici={aktif?.alanOneri}
        isimOneriSaglayici={aktif?.isimOneri}
        profilSaglayici={aktif?.profil}
        serbestCevapSaglayici={aktif?.serbestCevap}
      />

      {panelAcik && (
        <AyarPaneli
          secim={secim}
          onKapat={() => setPanelAcik(false)}
          onKaydet={(y) => {
            secimKaydet(y);
            setSecim(y);
            setSonHata(null);
            setCihazDurum(null);
            setPanelAcik(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Ayarlar paneli ---------- */

function AyarPaneli({
  secim,
  onKapat,
  onKaydet,
}: {
  secim: ZekaSecim | null;
  onKapat: () => void;
  onKaydet: (y: ZekaSecim | null) => void;
}) {
  const ayar = secim?.tur === "anahtar" ? secim.ayar : null;
  const cihazVar = cihazDestekliMi();
  const [cihazModel, setCihazModel] = useState(
    secim?.tur === "cihaz" ? secim.model : CIHAZ_MODELLERI[1].id,
  );
  const [saglayici, setSaglayici] = useState<ZekaAyar["saglayici"]>(ayar?.saglayici ?? "gemini");
  const [anahtar, setAnahtar] = useState(ayar?.anahtar ?? "");
  const [model, setModel] = useState(ayar?.model ?? "");
  const [url, setUrl] = useState(ayar?.url ?? "");
  const [test, setTest] = useState<{
    durum: "bos" | "calisiyor" | "tamam" | "hata";
    mesaj?: string;
  }>({
    durum: "bos",
  });

  const taslak = (): ZekaAyar => ({
    saglayici,
    anahtar: anahtar.trim(),
    model: model.trim() || (saglayici !== "ozel" ? SAGLAYICILAR[saglayici].varsayilanModel : ""),
    ...(saglayici === "ozel" ? { url: url.trim() } : {}),
  });

  async function testEt() {
    if (!anahtar.trim() || test.durum === "calisiyor") return;
    setTest({ durum: "calisiyor" });
    try {
      const sorucu = tarayiciSorucu(taslak());
      await sorucu('Sadece şu JSON\'u döndür: {"tamam": true}', "ping", 0, ["tamam"]);
      setTest({ durum: "tamam" });
    } catch (e) {
      setTest({ durum: "hata", mesaj: hataMesaji(e) });
    }
  }

  const girdiStil: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 13px",
    borderRadius: 12,
    background: "rgba(0,0,0,0.28)",
    border: `1px solid ${C.kenar}`,
    color: C.krem,
    fontFamily: sans,
    fontSize: 14,
    outline: "none",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Yapay zekâ ayarları"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(10, 7, 20, 0.72)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontFamily: sans,
      }}
      onClick={onKapat}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "88vh",
          overflowY: "auto",
          background: C.kart,
          border: `1px solid ${C.kenar}`,
          borderRadius: "22px 22px 0 0",
          padding: "20px 18px 26px",
          color: C.krem,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>Yapay zekâ ayarları</div>
          <button
            onClick={onKapat}
            aria-label="Kapat"
            style={{
              background: "none",
              border: "none",
              color: C.solgun,
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>
        {/* ---- Bizim model: cihazda çalışır, limitsiz ---- */}
        <div
          style={{
            border: `1px solid ${C.altin}55`,
            background: "rgba(245, 185, 66, 0.06)",
            borderRadius: 14,
            padding: "13px 14px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>
            Bizim yapay zekâ — cihazında çalışır
          </div>
          <p style={{ fontSize: 12, color: C.solgun, lineHeight: 1.5, margin: "0 0 10px" }}>
            Anahtar yok, kota yok, kimseye bağlı değil. Açık kaynak model bir kez iner, tarayıcı
            önbelleğine yerleşir ve senin cihazında düşünür. Küçük olduğu için yazımı bulut
            modelleri kadar parlak değildir ama tamamen bizimdir.
          </p>
          {!cihazVar ? (
            <div style={{ fontSize: 12.5, color: C.kirmizi, lineHeight: 1.45 }}>
              Bu tarayıcı WebGPU desteklemiyor. Güncel Chrome ya da Edge ile açmayı dene; şimdilik
              aşağıdan anahtarla da çalışabilirsin.
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gap: 7, marginBottom: 10 }}>
                {CIHAZ_MODELLERI.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCihazModel(m.id)}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${cihazModel === m.id ? C.altin : C.kenar}`,
                      background: cihazModel === m.id ? "rgba(245,185,66,0.1)" : "rgba(0,0,0,0.22)",
                      color: C.krem,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {m.ad}{" "}
                      <span style={{ color: C.solgun, fontWeight: 400 }}>· ~{m.indirmeMB} MB</span>
                      {cihazIndirildiMi(m.id) && (
                        <span style={{ color: "#6ee7a0", fontWeight: 600, fontSize: 11.5 }}>
                          {"  "}✓ indirildi
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.solgun, marginTop: 2, lineHeight: 1.4 }}>
                      {m.aciklama}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => onKaydet({ tur: "cihaz", model: cihazModel })}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${C.altin}`,
                  background: C.altin,
                  color: "#2b1d00",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {secim?.tur === "cihaz" && secim.model === cihazModel
                  ? "Kullanılıyor ✓"
                  : "Bu modeli kullan"}
              </button>
              <div style={{ fontSize: 11, color: C.solgun, marginTop: 7, lineHeight: 1.4 }}>
                İndirme oyun içinde, sağ üstteki çubukta yüzdeyle görünür; Wi-Fi önerilir.
              </div>
            </>
          )}
        </div>

        <div
          style={{
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: C.solgun,
            marginBottom: 10,
          }}
        >
          ya da kendi anahtarınla
        </div>
        <p style={{ fontSize: 12.5, color: C.solgun, lineHeight: 1.5, margin: "0 0 14px" }}>
          Daha kaliteli yazım istersen ücretsiz bir Gemini anahtarı gir. Anahtar yalnızca bu cihazda
          saklanır ve istekler doğrudan senin tarayıcından gider.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
          {(["gemini", "openrouter", "openai", "ozel"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSaglayici(s);
                setTest({ durum: "bos" });
              }}
              style={{
                padding: "8px 13px",
                borderRadius: 999,
                border: `1px solid ${saglayici === s ? C.altin : C.kenar}`,
                background: saglayici === s ? C.altin : "rgba(0,0,0,0.22)",
                color: saglayici === s ? "#2b1d00" : C.krem,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {s === "ozel" ? "Özel uç" : SAGLAYICILAR[s].ad}
            </button>
          ))}
        </div>

        {saglayici !== "ozel" && (
          <div style={{ fontSize: 12, color: C.gok, marginBottom: 10 }}>
            Anahtar: {SAGLAYICILAR[saglayici].anahtarIpucu}
          </div>
        )}

        <label style={{ fontSize: 12, color: C.solgun, display: "block", marginBottom: 5 }}>
          API anahtarı
        </label>
        <input
          value={anahtar}
          onChange={(e) => {
            setAnahtar(e.target.value);
            setTest({ durum: "bos" });
          }}
          placeholder={saglayici === "gemini" ? "AIzaSy..." : "sk-..."}
          type="password"
          autoComplete="off"
          style={{ ...girdiStil, marginBottom: 12 }}
        />

        <label style={{ fontSize: 12, color: C.solgun, display: "block", marginBottom: 5 }}>
          Model {saglayici !== "ozel" ? `(boşsa ${SAGLAYICILAR[saglayici].varsayilanModel})` : ""}
        </label>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={saglayici !== "ozel" ? SAGLAYICILAR[saglayici].varsayilanModel : "model adı"}
          style={{ ...girdiStil, marginBottom: 12 }}
        />

        {saglayici === "ozel" && (
          <>
            <label style={{ fontSize: 12, color: C.solgun, display: "block", marginBottom: 5 }}>
              /chat/completions ucu (OpenAI uyumlu, CORS açık olmalı)
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://.../v1/chat/completions"
              style={{ ...girdiStil, marginBottom: 12 }}
            />
          </>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => void testEt()}
            disabled={!anahtar.trim() || test.durum === "calisiyor"}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px dashed ${C.kenar}`,
              background: "transparent",
              color: C.altin,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            {test.durum === "calisiyor" ? (
              <Loader2 size={15} className="hs-donen" />
            ) : (
              <Sparkles size={15} />
            )}
            {test.durum === "calisiyor" ? "Deneniyor..." : "Anahtarı dene"}
          </button>
          <button
            onClick={() => onKaydet(anahtar.trim() ? { tur: "anahtar", ayar: taslak() } : null)}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${C.altin}`,
              background: C.altin,
              color: "#2b1d00",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Kaydet
          </button>
        </div>

        {test.durum === "tamam" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              color: "#6ee7a0",
            }}
          >
            <Check size={14} /> Anahtar çalışıyor; kaydedince sahneleri model yazacak.
          </div>
        )}
        {test.durum === "hata" && (
          <div style={{ fontSize: 12.5, color: C.kirmizi, lineHeight: 1.45 }}>{test.mesaj}</div>
        )}

        {secim && (
          <button
            onClick={() => onKaydet(null)}
            style={{
              marginTop: 12,
              background: "none",
              border: "none",
              color: C.solgun,
              fontSize: 12.5,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Yapay zekâyı kapat (yerel motora dön)
          </button>
        )}
        <style>
          {
            "@keyframes hs-don{to{transform:rotate(360deg)}} .hs-donen{animation:hs-don 1s linear infinite}"
          }
        </style>
      </div>
    </div>
  );
}

/* ---------- İndirme kartı ----------
   App Store indirmesi gibi: halka ilerleme, aşama metni, biten indirme
   kısa bir "Hazır" onayıyla kaybolur. Ekranın altına sabitlenir. */

function IndirmeKarti({
  durum,
  modelAd,
  onTekrar,
}: {
  durum: CihazDurum;
  modelAd: string;
  onTekrar: () => void;
}) {
  const R = 15.5;
  const CEVRE = 2 * Math.PI * R;
  const oran = Math.max(0, Math.min(100, durum.oran));
  const belirsiz = oran <= 0 && durum.asama !== "hazir" && durum.asama !== "hata";

  const baslik =
    durum.asama === "iniyor"
      ? `${modelAd} model indiriliyor`
      : durum.asama === "onbellek"
        ? "Önbellekten yükleniyor"
        : durum.asama === "hazirlaniyor"
          ? "Model hazırlanıyor"
          : durum.asama === "hazir"
            ? "Bizim yapay zekâ hazır"
            : "Model başlatılamadı";

  const alt =
    durum.asama === "iniyor"
      ? "Bir kez iner, cihazında kalır · oyun bu sırada oynanabilir"
      : durum.asama === "onbellek"
        ? "Daha önce indirildi; saniyeler sürer"
        : durum.asama === "hazirlaniyor"
          ? "Son dokunuşlar…"
          : durum.asama === "hazir"
            ? "Sahneleri artık cihazındaki model yazacak"
            : (durum.mesaj ?? "Bilinmeyen hata");

  const renk = durum.asama === "hata" ? C.kirmizi : C.altin;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 14,
        transform: "translateX(-50%)",
        zIndex: 45,
        width: "min(400px, calc(100vw - 24px))",
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "13px 15px",
        borderRadius: 18,
        border: `1px solid ${durum.asama === "hata" ? `${C.kirmizi}66` : C.kenar}`,
        background: "rgba(23, 18, 42, 0.94)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 18px 50px -20px rgba(0,0,0,0.85)",
        color: C.krem,
        fontFamily: sans,
      }}
    >
      {/* Halka */}
      <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          style={
            belirsiz
              ? { animation: "hz-don 1.1s linear infinite" }
              : { transform: "rotate(-90deg)" }
          }
          aria-hidden
        >
          <circle cx="20" cy="20" r={R} fill="none" stroke={`${C.kenar}`} strokeWidth="3.5" />
          <circle
            cx="20"
            cy="20"
            r={R}
            fill="none"
            stroke={renk}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={CEVRE}
            strokeDashoffset={belirsiz ? CEVRE * 0.72 : CEVRE * (1 - oran / 100)}
            style={belirsiz ? undefined : { transition: "stroke-dashoffset 0.35s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: durum.asama === "hazir" || durum.asama === "hata" ? 15 : 9.5,
            fontWeight: 700,
            color: renk,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {durum.asama === "hazir" ? "✓" : durum.asama === "hata" ? "!" : belirsiz ? "" : `${oran}`}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>{baslik}</div>
        <div
          style={{
            fontSize: 11.5,
            color: durum.asama === "hata" ? C.kirmizi : C.solgun,
            lineHeight: 1.4,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {alt}
        </div>
      </div>

      {durum.asama === "hata" && (
        <button
          onClick={onTekrar}
          style={{
            flexShrink: 0,
            padding: "9px 13px",
            borderRadius: 11,
            border: `1px solid ${C.altin}`,
            background: C.altin,
            color: "#2b1d00",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Tekrar dene
        </button>
      )}
      <style>{"@keyframes hz-don{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
