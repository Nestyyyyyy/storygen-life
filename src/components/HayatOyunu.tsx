/* Hayat Simülatörü — oyun arayüzü

   Sahneleri ve önerileri dışarıdan gelen "sağlayıcı" fonksiyonlar üretir.
   Rota bunlara sunucudaki yapay zekâyı bağlar; sağlayıcı verilmezse oyun
   tamamen yerel motorla çalışır (çevrimdışı sürüm bunu kullanıyor). */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Heart,
  Lightbulb,
  Loader2,
  MessageSquarePlus,
  Plus,
  RotateCcw,
  Send,
  Smile,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import {
  BASLANGICLAR,
  CINSIYETLER,
  EVRE_ADI,
  HEDEFLER,
  ISIMLER,
  KISILIKLER,
  KOKENLER,
  MESLEKLER,
  MODES,
  STAT_ADI,
  STAT_ANAHTARLARI,
  evreBul,
} from "@/lib/hayat/veri";
import { yerelOneri, yerelOzellik } from "@/lib/hayat/profil";
import {
  anlatiKur,
  clamp,
  fxTopla,
  hayatHikayesi,
  hedefDegerlendir,
  iliskiIsmiUret,
  sahneKalipId,
  metinDoldur,
  olaySec,
  omurHesapla,
  serbestSecenek,
  oneriHesapla,
  paraFmt,
  secimiHesapla,
  skorHesapla,
  unvanBul,
  yasArtisi,
} from "@/lib/hayat/motor";
import type {
  Durum,
  Iliski,
  Olay,
  Ozellik,
  Secenek,
  StatAnahtar,
  Statlar,
} from "@/lib/hayat/tipler";
import type { Oneri } from "@/lib/hayat/motor";

/* ---------- Renkler & Fontlar ---------- */
const C = {
  bg1: "#17122a",
  bg2: "#241a3d",
  card: "#2b2146",
  cardEdge: "#3a2e5c",
  cream: "#ece7f5",
  muted: "#9a8fb5",
  gold: "#f5b942",
  rose: "#f2739d",
  teal: "#4fd1c5",
  green: "#6ee7a0",
  sky: "#7da8ff",
};
const serif = "Georgia, 'Times New Roman', serif";
const sans = "system-ui, -apple-system, sans-serif";

const STAT_GORUNUM: Record<StatAnahtar, { renk: string; Icon: typeof Activity }> = {
  saglik: { renk: C.green, Icon: Activity },
  mutluluk: { renk: C.gold, Icon: Smile },
  ask: { renk: C.rose, Icon: Heart },
  arkadaslik: { renk: C.teal, Icon: Users },
  kariyer: { renk: C.sky, Icon: Briefcase },
};

const ILISKI_EMOJI: Record<string, string> = {
  sevgili: "💞",
  es: "💍",
  arkadas: "🫂",
  rakip: "⚔️",
  cocuk: "🧒",
  kopek: "🐾",
};
const ILISKI_RENK: Record<string, string> = {
  sevgili: C.rose,
  es: C.rose,
  arkadas: C.teal,
  rakip: "#ff9090",
  cocuk: C.gold,
  kopek: C.green,
};

const ADIM_BASLIKLARI = ["Kimlik", "Başlangıç", "Köken", "Eğilim", "Hedef", "Kişilik", "Hayat"];
const SON_ADIM = ADIM_BASLIKLARI.length - 1;

/* ---------- Sağlayıcılar ---------- */
export type SahneSaglayici = (girdi: {
  durum: Durum;
  sonKaliplar: string[];
  kacinilanBasliklar: string[];
}) => Promise<{ olay: Olay; motor: "ai" | "yerel" }>;

export type OneriSaglayici = (girdi: { durum: Durum; olay: Olay }) => Promise<Oneri>;

/** Karakter oluştururken "Öner" düğmesinin çağırdığı sağlayıcılar. */
export type AlanOneriSaglayici = (girdi: {
  tur: "meslek" | "kisilik";
  ipucu?: string;
  kacinilan: string[];
}) => Promise<{ deger: string; kaynak: "ai" | "yerel" }>;

export type IsimOneriSaglayici = (girdi: {
  cinsiyet: "kadin" | "erkek" | "belirsiz";
  kacinilan: string[];
}) => Promise<{ deger: string; kaynak: "ai" | "yerel" }>;

/** Oyuncunun kendi yazdığı cevabı değerlendiren sağlayıcı. */
export type SerbestCevapSaglayici = (girdi: {
  durum: Durum;
  olay: Olay;
  metin: string;
}) => Promise<{ secenek: Secenek; motor: "ai" | "yerel" }>;

/** Serbest metni oyun profiline çeviren sağlayıcı. */
export type ProfilSaglayici = (girdi: {
  ad: string;
  tur: "meslek" | "kisilik";
}) => Promise<Ozellik>;

type Props = {
  sahneSaglayici?: SahneSaglayici;
  oneriSaglayici?: OneriSaglayici;
  alanOneriSaglayici?: AlanOneriSaglayici;
  isimOneriSaglayici?: IsimOneriSaglayici;
  profilSaglayici?: ProfilSaglayici;
  serbestCevapSaglayici?: SerbestCevapSaglayici;
};

type GunlukKayit = {
  yas: number;
  emoji: string;
  baslik: string;
  secim: string;
  metin: string;
  onemli: boolean;
};

type SonucGorunum = {
  metin: string;
  fx: Partial<Statlar>;
  dpara: number;
  emoji: string;
  basarisiz: boolean;
};

export default function HayatOyunu({
  sahneSaglayici,
  oneriSaglayici,
  alanOneriSaglayici,
  isimOneriSaglayici,
  profilSaglayici,
  serbestCevapSaglayici,
}: Props) {
  /* ---- ekran ---- */
  const [ekran, setEkran] = useState<"olustur" | "oyun" | "bitis">("olustur");
  const [adim, setAdim] = useState(0);

  /* ---- karakter oluşturma ---- */
  const [isim, setIsim] = useState("");
  /** Başlangıçta seçilmemiş: isim önerisi istenirse önce uyarı verilir. */
  const [cinsiyet, setCinsiyet] = useState<"kadin" | "erkek" | "belirsiz" | null>(null);
  const [cinsiyetUyari, setCinsiyetUyari] = useState(false);
  const [baslangic, setBaslangic] = useState<"bebek" | "cocuk" | "genc">("cocuk");
  const [koken, setKoken] = useState<"varlikli" | "orta" | "zor" | "kimsesiz">("orta");
  const [meslekMetni, setMeslekMetni] = useState("");
  const [hedef, setHedef] = useState<Durum["karakter"]["hedef"]>("huzur");
  const [kisilikMetinleri, setKisilikMetinleri] = useState<string[]>([]);
  const [kisilikGirdi, setKisilikGirdi] = useState("");
  const [hazirlaniyor, setHazirlaniyor] = useState(false);

  /* ---- oyun ---- */
  const [durum, setDurum] = useState<Durum | null>(null);
  const [olay, setOlay] = useState<Olay | null>(null);
  const [motor, setMotor] = useState<"ai" | "yerel">("yerel");
  const [sonuc, setSonuc] = useState<SonucGorunum | null>(null);
  const [gunluk, setGunluk] = useState<GunlukKayit[]>([]);
  const [olumSebep, setOlumSebep] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oneri, setOneri] = useState<Oneri | null>(null);
  const [oneriYukleniyor, setOneriYukleniyor] = useState(false);
  const [kendiCevap, setKendiCevap] = useState("");
  const [kendiCevapYukleniyor, setKendiCevapYukleniyor] = useState(false);
  const sonKaliplar = useRef<string[]>([]);
  const gecenBasliklar = useRef<string[]>([]);
  const gecenMetinler = useRef<string[]>([]);

  /* Sahne getirme: sağlayıcı varsa (yapay zekâ) ondan, yoksa yerel motordan. */
  const sahneGetir = useCallback(
    async (d: Durum) => {
      setYukleniyor(true);
      setOneri(null);
      try {
        if (sahneSaglayici) {
          const yanit = await sahneSaglayici({
            durum: d,
            sonKaliplar: sonKaliplar.current,
            kacinilanBasliklar: gecenBasliklar.current,
          });
          setOlay(yanit.olay);
          setMotor(yanit.motor);
          return yanit.olay;
        }
      } catch (err) {
        console.error("[sahneGetir]", err);
      } finally {
        setYukleniyor(false);
      }
      const yerel = olaySec(d, sonKaliplar.current, gecenMetinler.current);
      setOlay(yerel);
      setMotor("yerel");
      setYukleniyor(false);
      return yerel;
    },
    [sahneSaglayici],
  );

  useEffect(() => {
    if (!olay) return;
    const kid = sahneKalipId(olay);
    if (kid) sonKaliplar.current = [kid, ...sonKaliplar.current].slice(0, 8);
    gecenBasliklar.current = [olay.baslik, ...gecenBasliklar.current].slice(0, 30);
    gecenMetinler.current = [olay.metin, ...gecenMetinler.current].slice(0, 80);
  }, [olay]);

  /* ---- serbest metin → oyun profili ---- */
  const profilCoz = useCallback(
    async (ad: string, tur: "meslek" | "kisilik"): Promise<Ozellik> => {
      if (profilSaglayici) {
        try {
          return await profilSaglayici({ ad, tur });
        } catch (err) {
          console.error("[profilCoz]", err);
        }
      }
      return yerelOzellik(ad, tur === "meslek" ? "meslek" : "kisilik");
    },
    [profilSaglayici],
  );

  /* ---- oyunu başlat ---- */
  async function baslat(mod: (typeof MODES)[number]) {
    if (hazirlaniyor) return;
    setHazirlaniyor(true);

    const sb = BASLANGICLAR.find((b) => b.key === baslangic)!;
    const sk = KOKENLER.find((k) => k.key === koken)!;
    const meslekAdi = meslekMetni.trim() || "Belirsiz";
    const kisilikAdlari = kisilikMetinleri.length ? kisilikMetinleri : ["Cesur", "Dürüst"];

    /* Yazılan metinler oyun profiline çevriliyor (yapay zekâ varsa o çeviriyor). */
    const [meslekProfil, ...kisilikProfilleri] = await Promise.all([
      profilCoz(meslekAdi, "meslek"),
      ...kisilikAdlari.map((k) => profilCoz(k, "kisilik")),
    ]);

    const statlar = { ...mod.start } as Statlar;
    [sb.fx, sk.fx, meslekProfil.fx].forEach((fx) => fxTopla(statlar, fx));
    // Çok kişilik yazıldıysa başlangıç etkileri de aynı oranda hafifler.
    const kCarpan = 2 / Math.max(2, kisilikProfilleri.length);
    kisilikProfilleri.forEach((o) => {
      if (!o.fx) return;
      (Object.keys(o.fx) as StatAnahtar[]).forEach((k) => {
        statlar[k] += Math.round((o.fx![k] ?? 0) * kCarpan);
      });
    });
    STAT_ANAHTARLARI.forEach((k) => (statlar[k] = clamp(statlar[k])));

    const yeniDurum: Durum = {
      yas: sb.yas,
      omur: Math.max(sb.yas + 20, omurHesapla(koken, meslekAdi)),
      statlar,
      para: Math.round(mod.para * sk.paraCarpan + sk.paraEk),
      mod: mod.key,
      karakter: {
        isim: isim.trim() || "Sen",
        cinsiyet: cinsiyet ?? "belirsiz",
        baslangic,
        koken,
        meslek: meslekProfil,
        hedef,
        kisilikler: kisilikProfilleri,
      },
      bayraklar: [],
      iliskiler: [],
      gorulen: [],
      gecmis: [],
    };

    sonKaliplar.current = [];
    gecenBasliklar.current = [];
    gecenMetinler.current = [];
    setDurum(yeniDurum);
    setGunluk([]);
    setSonuc(null);
    setOlumSebep("");
    setEkran("oyun");
    setHazirlaniyor(false);
    void sahneGetir(yeniDurum);
  }

  /* ---- seçim ---- */
  function sec(secenek: Secenek) {
    if (!durum || !olay) return;
    const hesap = secimiHesapla(secenek, durum);

    let iliskiler: Iliski[] = durum.iliskiler;
    if (secenek.iliskiYukselt) {
      iliskiler = iliskiler.map((i) =>
        i.tur === secenek.iliskiYukselt!.eski && i.aktif
          ? { ...i, tur: secenek.iliskiYukselt!.yeni }
          : i,
      );
    }
    if (secenek.iliskiBitir) {
      iliskiler = iliskiler.map((i) =>
        i.tur === secenek.iliskiBitir && i.aktif ? { ...i, aktif: false, bitis: durum.yas } : i,
      );
    }
    if (secenek.iliski) {
      iliskiler = [
        ...iliskiler,
        {
          id: `${olay.id}-${durum.yas}`,
          ad: iliskiIsmiUret(
            secenek.iliski.tur,
            durum.karakter.cinsiyet,
            iliskiler.map((i) => i.ad),
          ),
          tur: secenek.iliski.tur,
          ilkAsk: !!secenek.iliski.ilkAsk,
          baslangic: durum.yas,
          aktif: true,
        },
      ];
    }
    const bayraklar = secenek.bayrak
      ? Array.from(new Set([...durum.bayraklar, ...secenek.bayrak]))
      : durum.bayraklar;

    const statlar = { ...durum.statlar };
    (Object.keys(hesap.fx) as StatAnahtar[]).forEach((k) => {
      statlar[k] = clamp(statlar[k] + (hesap.fx[k] ?? 0));
    });

    const yeniDurum: Durum = {
      ...durum,
      statlar,
      para: durum.para + hesap.dpara,
      iliskiler,
      bayraklar,
      gorulen: durum.gorulen.includes(olay.id) ? durum.gorulen : [...durum.gorulen, olay.id],
      gecmis: [...durum.gecmis, { yas: durum.yas, baslik: olay.baslik, secim: secenek.t }].slice(
        -40,
      ),
    };

    const metin = anlatiKur(hesap, yeniDurum, statlar);
    setDurum(yeniDurum);
    setSonuc({
      metin,
      fx: hesap.fx,
      dpara: hesap.dpara,
      emoji: olay.emoji,
      basarisiz: hesap.basarisiz,
    });
    setOneri(null);
    setGunluk((g) => [
      {
        yas: durum.yas,
        emoji: olay.emoji,
        baslik: olay.baslik,
        secim: secenek.t,
        metin,
        onemli: !!secenek.onemli,
      },
      ...g,
    ]);
  }

  /* ---- devam ---- */
  function devam() {
    if (!durum) return;
    if (durum.statlar.saglik <= 0) return bitir("Sağlığın tükendi.");
    if (durum.statlar.saglik <= 12 && Math.random() < 0.25)
      return bitir("Bedenin daha fazla dayanamadı.");

    const yeniYas = durum.yas + yasArtisi(durum.yas);
    if (yeniYas >= durum.omur) return bitir("Yaşlılığın huzuruyla gözlerini kapadın.");

    const yeniDurum = { ...durum, yas: yeniYas };
    setDurum(yeniDurum);
    setSonuc(null);
    void sahneGetir(yeniDurum);
  }

  function bitir(sebep: string) {
    setOlumSebep(sebep);
    setEkran("bitis");
  }

  /* ---- öneri ---- */
  async function oneriIste() {
    if (!durum || !olay || oneriYukleniyor) return;
    setOneriYukleniyor(true);
    try {
      if (oneriSaglayici) {
        setOneri(await oneriSaglayici({ durum, olay }));
        return;
      }
      setOneri(oneriHesapla(olay, durum));
    } catch (err) {
      console.error("[oneriIste]", err);
      setOneri(oneriHesapla(olay, durum));
    } finally {
      setOneriYukleniyor(false);
    }
  }

  /* ---- oyuncunun kendi cevabı ---- */
  async function kendiCevabiGonder() {
    const metin = kendiCevap.trim();
    if (!durum || !olay || !metin || kendiCevapYukleniyor) return;
    setKendiCevapYukleniyor(true);
    try {
      if (serbestCevapSaglayici) {
        const yanit = await serbestCevapSaglayici({ durum, olay, metin });
        sec(yanit.secenek);
        return;
      }
      sec(serbestSecenek(metin, durum));
    } catch (err) {
      console.error("[kendiCevap]", err);
      sec(serbestSecenek(metin, durum));
    } finally {
      setKendiCevapYukleniyor(false);
    }
  }

  function yenidenBasla() {
    setEkran("olustur");
    setAdim(0);
    setDurum(null);
    setOlay(null);
  }

  function kisilikEkle(ham: string) {
    const ad = ham.trim().slice(0, 40);
    if (!ad) return;
    setKisilikMetinleri((m) =>
      m.some((x) => x.toLocaleLowerCase("tr") === ad.toLocaleLowerCase("tr")) ? m : [...m, ad],
    );
    setKisilikGirdi("");
  }

  /* ---- karakter oluşturma önerileri ---- */
  async function alanOner(tur: "meslek" | "kisilik", ipucu?: string) {
    const kacinilan = (tur === "meslek" ? [meslekMetni] : kisilikMetinleri).filter(Boolean);
    if (alanOneriSaglayici) {
      try {
        return (await alanOneriSaglayici({ tur, ipucu, kacinilan })).deger;
      } catch (err) {
        console.error("[alanOner]", err);
      }
    }
    return yerelOneri(tur, ipucu, kacinilan);
  }

  async function isimOner(): Promise<string | null> {
    if (!cinsiyet) {
      setCinsiyetUyari(true);
      return null;
    }
    if (isimOneriSaglayici) {
      try {
        return (await isimOneriSaglayici({ cinsiyet, kacinilan: isim ? [isim] : [] })).deger;
      } catch (err) {
        console.error("[isimOner]", err);
      }
    }
    const havuz =
      cinsiyet === "kadin"
        ? ISIMLER.kadin
        : cinsiyet === "erkek"
          ? ISIMLER.erkek
          : [...ISIMLER.kadin, ...ISIMLER.erkek];
    const taze = havuz.filter((i) => i !== isim);
    return taze[Math.floor(Math.random() * taze.length)];
  }

  /* ================= KARAKTER OLUŞTURMA ================= */
  if (ekran === "olustur") {
    const ileriAktif =
      (adim !== 0 || cinsiyet !== null) &&
      (adim !== 3 || meslekMetni.trim().length > 0) &&
      (adim !== 5 || kisilikMetinleri.length > 0);
    const sb = BASLANGICLAR.find((b) => b.key === baslangic)!;
    const sk = KOKENLER.find((k) => k.key === koken)!;
    const sh = HEDEFLER.find((h) => h.key === hedef)!;

    return (
      <Shell>
        {adim === 0 && (
          <div style={{ textAlign: "center", paddingTop: 4, marginBottom: 18 }}>
            <div
              style={{ fontSize: 13, letterSpacing: 3, color: C.muted, textTransform: "uppercase" }}
            >
              bir hayat, sayısız yol
            </div>
            <h1
              style={{
                fontFamily: serif,
                fontSize: 40,
                margin: "6px 0 0",
                color: C.cream,
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              Hayat
              <br />
              <span style={{ color: C.gold, fontStyle: "italic" }}>Simülatörü</span>
            </h1>
          </div>
        )}

        <AdimGostergesi adim={adim} />

        {adim === 0 && (
          <div>
            <SerbestAlan
              etiket="Adın"
              deger={isim}
              onDegis={setIsim}
              yerTutucu="Adını yaz ya da öneri al..."
              maxUzunluk={16}
              onOner={isimOner}
              ipucuVar={false}
              uyari={
                cinsiyetUyari && !cinsiyet
                  ? "İsim önerisi için önce cinsiyet seç — öneri ona göre yapılıyor."
                  : undefined
              }
            />

            <label style={{ ...etiketStyle, marginTop: 18 }}>Cinsiyet</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CINSIYETLER.map((c) => (
                <Pill
                  key={c.key}
                  secili={cinsiyet === c.key}
                  onClick={() => {
                    setCinsiyet(c.key as "kadin" | "erkek" | "belirsiz");
                    setCinsiyetUyari(false);
                  }}
                >
                  {c.emoji} {c.ad}
                </Pill>
              ))}
            </div>
            {!cinsiyet && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
                Devam etmek için bir seçenek işaretle.
              </div>
            )}
          </div>
        )}

        {adim === 1 && (
          <StepBlok
            baslik="Hayata nereden başlıyorsun?"
            alt="Seçtiğin yaş, göreceğin olayları ve ömrün uzunluğunu belirler."
          >
            {BASLANGICLAR.map((b) => (
              <SecimKarti
                key={b.key}
                emoji={b.emoji}
                ad={`${b.ad} (${b.yas})`}
                aciklama={b.aciklama}
                secili={baslangic === b.key}
                onClick={() => setBaslangic(b.key as typeof baslangic)}
              />
            ))}
          </StepBlok>
        )}

        {adim === 2 && (
          <StepBlok
            baslik="Nasıl bir evde açtın gözünü?"
            alt="Başlangıç paranı ve statlarını etkiler."
          >
            {KOKENLER.map((k) => (
              <SecimKarti
                key={k.key}
                emoji={k.emoji}
                ad={k.ad}
                aciklama={k.aciklama}
                secili={koken === k.key}
                onClick={() => setKoken(k.key as typeof koken)}
              />
            ))}
          </StepBlok>
        )}

        {adim === 3 && (
          <StepBlok
            baslik="Ne olmak istiyorsun?"
            alt="Kendi kelimelerinle yaz. Aklına bir şey gelmezse öner, ya da tek bir kelime ver (deniz, uzay, satranç) — ondan bir meslek türetilsin."
          >
            <SerbestAlan
              etiket="Meslek eğilimi"
              deger={meslekMetni}
              onDegis={setMeslekMetni}
              yerTutucu="örn. gemi makinisti"
              maxUzunluk={40}
              onOner={() => alanOner("meslek")}
              onIpucuIleOner={(ip) => alanOner("meslek", ip)}
              ipucuYerTutucu="Bir kelime ver: deniz, uzay, satranç..."
            />
            <div style={{ fontSize: 12, color: C.muted, marginTop: -2 }}>Hazır fikirler:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {MESLEKLER.filter((m) => m.key !== "belirsiz").map((m) => (
                <Pill
                  key={m.key}
                  secili={meslekMetni === m.ad}
                  onClick={() => setMeslekMetni(m.ad)}
                >
                  {m.emoji} {m.ad}
                </Pill>
              ))}
            </div>
          </StepBlok>
        )}

        {adim === 4 && (
          <StepBlok
            baslik="Bu hayattan ne istiyorsun?"
            alt="Hedefin hem bitiş puanını hem de sana verilen önerileri belirler."
          >
            {HEDEFLER.map((h) => (
              <SecimKarti
                key={h.key}
                emoji={h.emoji}
                ad={h.ad}
                aciklama={h.aciklama}
                secili={hedef === h.key}
                onClick={() => setHedef(h.key as typeof hedef)}
              />
            ))}
          </StepBlok>
        )}

        {adim === 5 && (
          <StepBlok
            baslik="Sen nasıl birisin?"
            alt="İstediğin kadar özellik yaz. Ne kadar çok yazarsan her biri o kadar hafif etki eder; azı keskin, çoğu dengeli bir karakter yapar."
          >
            <SerbestAlan
              etiket="Kişilik özelliği"
              deger={kisilikGirdi}
              onDegis={setKisilikGirdi}
              yerTutucu="örn. inatçı"
              maxUzunluk={40}
              onEkle={() => kisilikEkle(kisilikGirdi)}
              onOner={async () => {
                const d = await alanOner("kisilik");
                if (d) kisilikEkle(d);
                return null;
              }}
              onIpucuIleOner={async (ip) => {
                const d = await alanOner("kisilik", ip);
                if (d) kisilikEkle(d);
                return null;
              }}
              ipucuYerTutucu="Bir kelime ver: kavgacı, sessiz, para..."
            />

            {kisilikMetinleri.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {kisilikMetinleri.map((k) => (
                  <span
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 10px 8px 13px",
                      borderRadius: 20,
                      fontSize: 13.5,
                      background: C.gold,
                      color: "#2b1d00",
                      fontWeight: 700,
                    }}
                  >
                    {k}
                    <button
                      onClick={() => setKisilikMetinleri((m) => m.filter((x) => x !== k))}
                      aria-label={`${k} özelliğini çıkar`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "none",
                        background: "transparent",
                        color: "#2b1d00",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ fontSize: 12, color: C.muted }}>Hazır fikirler:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {KISILIKLER.map((k) => (
                <Pill
                  key={k.key}
                  secili={kisilikMetinleri.includes(k.ad)}
                  onClick={() => kisilikEkle(k.ad)}
                >
                  {k.emoji} {k.ad}
                </Pill>
              ))}
            </div>
          </StepBlok>
        )}

        {adim === 6 && (
          <div>
            <div style={{ ...cardStyle, marginBottom: 14, padding: "14px 16px" }}>
              <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.cream }}>
                {isim.trim() || "Sen"}
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginTop: 4 }}>
                {CINSIYETLER.find((c) => c.key === cinsiyet)?.ad ?? "Belirtilmedi"} · {sb.ad} (
                {sb.yas} yaş)
                <br />
                {sk.emoji} {sk.ad} · 💼 {meslekMetni.trim() || "Belirsiz"}
                <br />
                {sh.emoji} Hedef: {sh.ad}
                <br />
                🧬 {kisilikMetinleri.length ? kisilikMetinleri.join(" · ") : "Cesur · Dürüst"}
              </div>
            </div>

            <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
              Bir hayat seç ve başla
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => void baslat(m)}
                  disabled={hazirlaniyor}
                  style={{ ...modKartStyle, opacity: hazirlaniyor ? 0.6 : 1 }}
                >
                  <span style={{ fontSize: 30 }}>{m.emoji}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 700 }}>{m.ad}</span>
                    <span
                      style={{ display: "block", fontSize: 12.5, color: C.muted, marginTop: 2 }}
                    >
                      {m.aciklama}
                    </span>
                    {"yetiskinIcerik" in m && (
                      <span
                        style={{ display: "block", fontSize: 11.5, color: "#ff9090", marginTop: 4 }}
                      >
                        Yetişkin içerik yalnızca bu modda ve karakter 18 yaşını geçtikten sonra
                        açılır.
                      </span>
                    )}
                  </span>
                  <ChevronRight size={18} color={C.muted} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 22, alignItems: "center" }}>
          {adim > 0 && (
            <button
              onClick={() => setAdim(adim - 1)}
              style={{
                ...secenekStyle,
                width: "auto",
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: C.muted,
                padding: "12px 14px",
              }}
            >
              <ChevronLeft size={16} /> Geri
            </button>
          )}
          {adim < SON_ADIM && (
            <button
              onClick={() => ileriAktif && setAdim(adim + 1)}
              disabled={!ileriAktif}
              style={{
                ...secenekStyle,
                flex: 1,
                background: ileriAktif ? C.gold : "#00000022",
                color: ileriAktif ? "#2b1d00" : C.muted,
                borderColor: ileriAktif ? C.gold : C.cardEdge,
                fontWeight: 700,
                textAlign: "center",
                cursor: ileriAktif ? "pointer" : "default",
              }}
            >
              {!ileriAktif
                ? adim === 0
                  ? "Cinsiyet seç"
                  : adim === 3
                    ? "Bir meslek yaz"
                    : "En az bir özellik ekle"
                : "Devam →"}
            </button>
          )}
        </div>
      </Shell>
    );
  }

  /* ================= OYUN ================= */
  if (ekran === "oyun" && durum) {
    const aktifIliskiler = durum.iliskiler.filter((i) => i.aktif);
    const hedefBilgi = HEDEFLER.find((h) => h.key === durum.karakter.hedef)!;
    const ilerleme = Math.min(100, (durum.yas / durum.omur) * 100);

    return (
      <Shell>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.cream }}>
              {durum.karakter.isim}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted }}>{EVRE_ADI[evreBul(durum.yas)]}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 30,
                fontWeight: 700,
                color: C.gold,
                lineHeight: 1,
              }}
            >
              {durum.yas}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>yaşında</div>
          </div>
        </div>

        {/* ömür çubuğu */}
        <div
          style={{
            height: 3,
            borderRadius: 3,
            background: "#00000033",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: `${ilerleme}%`,
              height: "100%",
              background: C.cardEdge,
              transition: "width .5s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {durum.karakter.kisilikler.map((o) => (
            <MiniRozet key={o.ad}>{o.ad}</MiniRozet>
          ))}
          {!/^belirsiz$/i.test(durum.karakter.meslek.ad) && (
            <MiniRozet>💼 {durum.karakter.meslek.ad}</MiniRozet>
          )}
          <MiniRozet renk={C.gold}>
            {hedefBilgi.emoji} {hedefBilgi.ad}
          </MiniRozet>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Coins size={15} color={C.gold} />
          <span
            style={{ fontSize: 14, fontWeight: 600, color: durum.para < 0 ? "#ff8080" : C.cream }}
          >
            {paraFmt(durum.para)}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {STAT_ANAHTARLARI.map((k) => (
            <StatBar
              key={k}
              label={STAT_ADI[k]}
              value={durum.statlar[k]}
              renk={STAT_GORUNUM[k].renk}
              Icon={STAT_GORUNUM[k].Icon}
            />
          ))}
        </div>

        {aktifIliskiler.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {aktifIliskiler.map((i) => (
              <MiniRozet key={i.id} renk={ILISKI_RENK[i.tur]}>
                {ILISKI_EMOJI[i.tur]} {i.ad}
                {durum.yas - i.baslangic > 0 ? ` · ${durum.yas - i.baslangic} yıl` : ""}
              </MiniRozet>
            ))}
          </div>
        )}

        {yukleniyor && !sonuc ? (
          <div
            style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 10, color: C.muted }}
          >
            <Loader2 size={18} color={C.gold} style={{ animation: "hs-spin 1s linear infinite" }} />
            <span style={{ fontSize: 14 }}>Hayatın bir sonraki sahnesi yazılıyor...</span>
          </div>
        ) : !sonuc && olay ? (
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 34, marginBottom: 6 }}>{olay.emoji}</div>
              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}
              >
                {motor === "ai" && (
                  <span style={rozetYaziStyle(C.sky)}>
                    <Sparkles size={12} /> yapay zekâ
                  </span>
                )}
                {olay.yetiskin && <span style={rozetYaziStyle("#ff9090")}>🔞 +18</span>}
                {olay.zorunlu && <span style={rozetYaziStyle(C.muted)}>elinde değil</span>}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: 8,
              }}
            >
              {olay.baslik}
            </div>
            <p
              style={{
                fontFamily: serif,
                fontSize: 18,
                lineHeight: 1.5,
                color: C.cream,
                margin: "0 0 16px",
              }}
            >
              {metinDoldur(olay.metin, durum)}
            </p>

            {olay.zorunlu ? (
              /* Seçim hakkı yok: olan olmuş, oyuncu sadece devam eder. */
              <button
                onClick={() => sec(olay.secenekler[0])}
                style={{
                  ...secenekStyle,
                  background: C.gold,
                  color: "#2b1d00",
                  fontWeight: 700,
                  borderColor: C.gold,
                  textAlign: "center",
                }}
              >
                Öyle oldu →
              </button>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {olay.secenekler.map((sc, i) => {
                    const onerilen = oneri?.indeks === i;
                    return (
                      <button
                        key={i}
                        onClick={() => sec(sc)}
                        style={{
                          ...secenekStyle,
                          border: `1px solid ${onerilen ? C.gold : C.cardEdge}`,
                          background: onerilen ? "#f5b94214" : "#00000022",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ flex: 1 }}>
                          {sc.t}
                          {sc.riskli ? (
                            <span style={{ color: C.gold, fontSize: 12 }}> · riskli</span>
                          ) : null}
                        </span>
                        {onerilen && (
                          <span style={{ ...rozetYaziStyle(C.gold), fontWeight: 700 }}>
                            <Lightbulb size={12} /> önerilen
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Oyuncunun kendi cevabı */}
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <input
                    value={kendiCevap}
                    onChange={(e) => setKendiCevap(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void kendiCevabiGonder();
                      }
                    }}
                    placeholder="Ya da kendi cevabını yaz..."
                    maxLength={140}
                    style={{ ...inputStyle, flex: 1, fontSize: 14.5, padding: "12px 14px" }}
                  />
                  <button
                    onClick={() => void kendiCevabiGonder()}
                    disabled={!kendiCevap.trim() || kendiCevapYukleniyor}
                    aria-label="Kendi cevabını gönder"
                    style={{
                      ...secenekStyle,
                      width: "auto",
                      padding: "0 15px",
                      display: "flex",
                      alignItems: "center",
                      color: kendiCevap.trim() ? C.gold : C.muted,
                      borderColor: kendiCevap.trim() ? C.gold : C.cardEdge,
                    }}
                  >
                    {kendiCevapYukleniyor ? (
                      <Loader2 size={16} style={{ animation: "hs-spin 1s linear infinite" }} />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>

                {oneri ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "#f5b9420f",
                      border: `1px solid ${C.gold}33`,
                    }}
                  >
                    <div style={{ ...rozetYaziStyle(C.gold), marginBottom: 4 }}>
                      <Lightbulb size={12} /> akıl hocası{" "}
                      {oneri.kaynak === "ai" ? "· yapay zekâ" : ""}
                    </div>
                    <div style={{ fontSize: 13, color: C.cream, lineHeight: 1.5 }}>
                      {oneri.gerekce}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={oneriIste}
                    disabled={oneriYukleniyor}
                    style={{
                      ...secenekStyle,
                      marginTop: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      color: C.gold,
                      background: "transparent",
                      borderStyle: "dashed",
                      fontSize: 13.5,
                    }}
                  >
                    {oneriYukleniyor ? (
                      <Loader2 size={15} style={{ animation: "hs-spin 1s linear infinite" }} />
                    ) : (
                      <Lightbulb size={15} />
                    )}
                    {oneriYukleniyor ? "Düşünüyor..." : "Öner"}
                  </button>
                )}
              </>
            )}
          </div>
        ) : sonuc ? (
          <div style={cardStyle}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>
              {sonuc.basarisiz ? "💥" : sonuc.emoji}
            </div>
            <p
              style={{
                fontFamily: serif,
                fontSize: 17,
                lineHeight: 1.62,
                color: C.cream,
                margin: "0 0 16px",
              }}
            >
              {sonuc.metin}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
              {STAT_ANAHTARLARI.filter((k) => (sonuc.fx[k] ?? 0) !== 0).map((k) => (
                <Chip key={k} label={STAT_ADI[k]} delta={sonuc.fx[k]!} />
              ))}
              {sonuc.dpara !== 0 && <Chip label="Para" delta={sonuc.dpara} para />}
            </div>
            <button
              onClick={devam}
              style={{
                ...secenekStyle,
                background: C.gold,
                color: "#2b1d00",
                fontWeight: 700,
                borderColor: C.gold,
                textAlign: "center",
              }}
            >
              Devam et →
            </button>
          </div>
        ) : null}
      </Shell>
    );
  }

  /* ================= BİTİŞ ================= */
  if (ekran === "bitis" && durum) {
    const skor = skorHesapla(durum);
    const unvan = unvanBul(skor, durum);
    const h = hedefDegerlendir(durum);
    const sirali = [...STAT_ANAHTARLARI].sort((a, b) => durum.statlar[b] - durum.statlar[a]);
    const enYuksek = sirali[0];
    const enDusuk = sirali[sirali.length - 1];
    const romantik = durum.iliskiler.filter((i) => i.tur === "sevgili" || i.tur === "es");
    const arkadaslar = durum.iliskiler.filter((i) => i.tur === "arkadas");
    const rakipler = durum.iliskiler.filter((i) => i.tur === "rakip");
    const onemliAnlar = gunluk
      .filter((g) => g.onemli)
      .slice()
      .reverse();
    const hikaye = hayatHikayesi(durum, skor);

    return (
      <Shell>
        <div style={{ textAlign: "center", paddingTop: 6, marginBottom: 18 }}>
          <div style={{ fontSize: 44, marginBottom: 4 }}>🕯️</div>
          <div
            style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: C.muted }}
          >
            hayat sona erdi
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 30, color: C.cream, margin: "6px 0 2px" }}>
            {durum.karakter.isim}
          </h1>
          <div style={{ fontSize: 14, color: C.muted }}>
            {durum.yas} yıl yaşadı · {olumSebep}
          </div>
        </div>

        <div style={{ ...cardStyle, textAlign: "center", marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              marginBottom: 4,
            }}
          >
            hayat puanı
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 52,
              fontWeight: 700,
              color: C.gold,
              lineHeight: 1,
            }}
          >
            {skor}
          </div>
          <div
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 18,
              color: C.cream,
              marginTop: 6,
            }}
          >
            “{unvan}”
          </div>
        </div>

        {/* hedef sonucu */}
        <div style={{ ...cardStyle, marginBottom: 14, padding: "16px 18px" }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              marginBottom: 8,
            }}
          >
            hayat hedefi
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{h.hedef.emoji}</span>
            <span style={{ fontFamily: serif, fontSize: 17, color: C.cream, flex: 1 }}>
              {h.hedef.ad}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: h.basarili ? C.green : C.muted }}>
              %{Math.round(h.oran * 100)}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: "#00000033", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.round(h.oran * 100)}%`,
                height: "100%",
                background: h.basarili ? C.green : C.gold,
                borderRadius: 4,
              }}
            />
          </div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
            {h.metin}
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              marginBottom: 8,
            }}
          >
            hayat hikayesi
          </div>
          <p
            style={{ fontFamily: serif, fontSize: 16, lineHeight: 1.65, color: C.cream, margin: 0 }}
          >
            {hikaye}
          </p>
        </div>

        <div style={{ ...cardStyle, marginBottom: 14, padding: "16px 18px" }}>
          <KunyeSatir
            etiket="En güçlü yanı"
            deger={`${STAT_ADI[enYuksek]} (${durum.statlar[enYuksek]})`}
            renk={STAT_GORUNUM[enYuksek].renk}
          />
          <KunyeSatir
            etiket="En zayıf yanı"
            deger={`${STAT_ADI[enDusuk]} (${durum.statlar[enDusuk]})`}
            renk={STAT_GORUNUM[enDusuk].renk}
          />
          <KunyeSatir
            etiket="Aşk hayatı"
            deger={romantik.length ? `${romantik.length} ciddi ilişki` : "hiç yaşanmadı"}
          />
          <KunyeSatir
            etiket="Yol arkadaşları"
            deger={`${arkadaslar.length} dost · ${rakipler.length} rakip`}
          />
          <KunyeSatir etiket="Yaşanan olay" deger={`${gunluk.length} sahne`} />
          <KunyeSatir
            etiket="Geriye kalan"
            deger={paraFmt(durum.para)}
            renk={durum.para < 0 ? "#ff8080" : C.gold}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
          {STAT_ANAHTARLARI.map((k) => (
            <StatBar
              key={k}
              label={STAT_ADI[k]}
              value={durum.statlar[k]}
              renk={STAT_GORUNUM[k].renk}
              Icon={STAT_GORUNUM[k].Icon}
            />
          ))}
        </div>

        {onemliAnlar.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: 10,
              }}
            >
              dönüm noktaları
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {onemliAnlar.map((g, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 15 }}>{g.emoji}</span>
                    {i < onemliAnlar.length - 1 && (
                      <span style={{ flex: 1, width: 1, background: C.cardEdge, marginTop: 2 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 12 }}>
                    <div style={{ fontSize: 12.5, color: C.gold, fontWeight: 600 }}>
                      {g.yas} yaş · {g.baslik}
                    </div>
                    <div style={{ fontSize: 12.5, color: C.cream, marginTop: 1 }}>{g.secim}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {gunluk.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: 8,
              }}
            >
              hayatından kesitler
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {gunluk.slice(0, 12).map((g, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 12.5,
                    color: C.muted,
                    lineHeight: 1.5,
                  }}
                >
                  <span>{g.emoji}</span>
                  <span>
                    <b style={{ color: C.cream }}>{g.yas}:</b> {g.metin}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={yenidenBasla}
          style={{
            ...secenekStyle,
            background: C.gold,
            color: "#2b1d00",
            fontWeight: 700,
            borderColor: C.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <RotateCcw size={17} /> Yeni bir hayat
        </button>
      </Shell>
    );
  }

  return null;
}

/* =====================================================================
   KÜÇÜK BİLEŞENLER
===================================================================== */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`,
        fontFamily: sans,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{"@keyframes hs-spin{to{transform:rotate(360deg)}}"}</style>
      <div
        style={{ width: "100%", maxWidth: 440, padding: "26px 20px 40px", boxSizing: "border-box" }}
      >
        {children}
      </div>
    </div>
  );
}

function AdimGostergesi({ adim }: { adim: number }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
        {ADIM_BASLIKLARI.map((_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 3,
              background: i <= adim ? C.gold : C.cardEdge,
              transition: "background .3s",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
        {adim + 1}/{ADIM_BASLIKLARI.length} · {ADIM_BASLIKLARI[adim]}
      </div>
    </div>
  );
}

function StepBlok({
  baslik,
  alt,
  children,
}: {
  baslik: string;
  alt: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        style={{
          fontFamily: serif,
          fontSize: 23,
          color: C.cream,
          margin: "0 0 4px",
          fontWeight: 700,
        }}
      >
        {baslik}
      </h2>
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14, lineHeight: 1.45 }}>
        {alt}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{children}</div>
    </div>
  );
}

function SecimKarti({
  emoji,
  ad,
  aciklama,
  secili,
  onClick,
}: {
  emoji: string;
  ad: string;
  aciklama: string;
  secili: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        textAlign: "left",
        padding: "13px 15px",
        borderRadius: 16,
        cursor: "pointer",
        background: secili ? "#f5b94214" : C.card,
        border: `1px solid ${secili ? C.gold : C.cardEdge}`,
        color: C.cream,
        transition: "border-color .15s, background .15s",
      }}
    >
      <span style={{ fontSize: 25 }}>{emoji}</span>
      <span style={{ flex: 1 }}>
        <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 700 }}>{ad}</span>
        <span
          style={{
            display: "block",
            fontSize: 12.5,
            color: C.muted,
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          {aciklama}
        </span>
      </span>
      {secili && <Check size={18} color={C.gold} />}
    </button>
  );
}

/**
 * Serbest metin alanı + öneri düğmeleri.
 * "Öner" boşken sürpriz bir değer getirir; "İpucu ver" ile bir kelime
 * yazılırsa öneri o kelimenin dünyasından türetilir.
 */
function SerbestAlan({
  etiket,
  deger,
  onDegis,
  yerTutucu,
  maxUzunluk,
  onOner,
  onIpucuIleOner,
  onEkle,
  ipucuYerTutucu = "Bir kelime ver...",
  ipucuVar = true,
  uyari,
}: {
  etiket: string;
  deger: string;
  onDegis: (v: string) => void;
  yerTutucu: string;
  maxUzunluk: number;
  onOner: () => Promise<string | null>;
  onIpucuIleOner?: (ipucu: string) => Promise<string | null>;
  onEkle?: () => void;
  ipucuYerTutucu?: string;
  ipucuVar?: boolean;
  uyari?: string;
}) {
  const [mesgul, setMesgul] = useState(false);
  const [ipucuAcik, setIpucuAcik] = useState(false);
  const [ipucu, setIpucu] = useState("");

  async function iste(ip?: string) {
    if (mesgul) return;
    setMesgul(true);
    try {
      const sonuc = ip && onIpucuIleOner ? await onIpucuIleOner(ip) : await onOner();
      if (sonuc) onDegis(sonuc);
    } finally {
      setMesgul(false);
    }
  }

  return (
    <div>
      <label style={etiketStyle}>{etiket}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={deger}
          onChange={(e) => onDegis(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEkle) {
              e.preventDefault();
              onEkle();
            }
          }}
          placeholder={yerTutucu}
          maxLength={maxUzunluk}
          style={{ ...inputStyle, flex: 1 }}
        />
        {onEkle && (
          <button
            onClick={onEkle}
            aria-label="Ekle"
            style={{
              ...secenekStyle,
              width: "auto",
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              color: C.gold,
            }}
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => void iste()}
          disabled={mesgul}
          style={{
            ...secenekStyle,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            color: C.gold,
            borderStyle: "dashed",
            fontSize: 13.5,
          }}
        >
          {mesgul ? (
            <Loader2 size={15} style={{ animation: "hs-spin 1s linear infinite" }} />
          ) : (
            <Sparkles size={15} />
          )}
          {mesgul ? "Düşünüyor..." : "Öner"}
        </button>
        {ipucuVar && (
          <button
            onClick={() => setIpucuAcik((o) => !o)}
            style={{
              ...secenekStyle,
              width: "auto",
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: ipucuAcik ? C.gold : C.muted,
              fontSize: 13.5,
            }}
          >
            <MessageSquarePlus size={15} /> İpucu ver
          </button>
        )}
      </div>

      {ipucuAcik && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            value={ipucu}
            onChange={(e) => setIpucu(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void iste(ipucu.trim() || undefined);
              }
            }}
            placeholder={ipucuYerTutucu}
            maxLength={40}
            style={{ ...inputStyle, flex: 1, fontSize: 14 }}
          />
          <button
            onClick={() => void iste(ipucu.trim() || undefined)}
            disabled={mesgul}
            style={{
              ...secenekStyle,
              width: "auto",
              padding: "0 16px",
              background: C.gold,
              color: "#2b1d00",
              borderColor: C.gold,
              fontWeight: 700,
              fontSize: 13.5,
            }}
          >
            Türet
          </button>
        </div>
      )}

      {uyari && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 6,
            marginTop: 8,
            fontSize: 12.5,
            color: "#ffb0b0",
            lineHeight: 1.45,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {uyari}
        </div>
      )}
    </div>
  );
}

function Pill({
  children,
  secili,
  onClick,
}: {
  children: React.ReactNode;
  secili: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 14px",
        borderRadius: 20,
        cursor: "pointer",
        fontSize: 13.5,
        fontFamily: sans,
        background: secili ? C.gold : "#00000022",
        color: secili ? "#2b1d00" : C.cream,
        border: `1px solid ${secili ? C.gold : C.cardEdge}`,
        fontWeight: secili ? 700 : 500,
        transition: "background .15s",
      }}
    >
      {children}
    </button>
  );
}

function MiniRozet({ children, renk }: { children: React.ReactNode; renk?: string }) {
  return (
    <span
      style={{
        fontSize: 11.5,
        padding: "4px 9px",
        borderRadius: 20,
        color: renk ?? C.muted,
        background: "#00000026",
        border: `1px solid ${C.cardEdge}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function KunyeSatir({ etiket, deger, renk }: { etiket: string; deger: string; renk?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        padding: "5px 0",
      }}
    >
      <span style={{ fontSize: 12.5, color: C.muted }}>{etiket}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: renk ?? C.cream, textAlign: "right" }}>
        {deger}
      </span>
    </div>
  );
}

function StatBar({
  label,
  value,
  renk,
  Icon,
}: {
  label: string;
  value: number;
  renk: string;
  Icon: typeof Activity;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={16} color={renk} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 12, color: C.cream }}>{label}</span>
          <span style={{ fontSize: 11, color: C.muted }}>{value}</span>
        </div>
        <div style={{ height: 6, borderRadius: 4, background: "#00000033", overflow: "hidden" }}>
          <div
            style={{
              width: `${value}%`,
              height: "100%",
              background: renk,
              borderRadius: 4,
              transition: "width .5s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Chip({ label, delta, para }: { label: string; delta: number; para?: boolean }) {
  const pos = delta >= 0;
  const txt = para ? (pos ? "+" : "") + paraFmt(delta) : (pos ? "+" : "") + delta + " " + label;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 20,
        color: pos ? C.green : "#ff9090",
        background: pos ? "#6ee7a022" : "#ff909022",
      }}
    >
      {txt}
    </span>
  );
}

/* ---------- Ortak stiller ---------- */
const cardStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.cardEdge}`,
  borderRadius: 20,
  padding: "20px 18px",
};

const secenekStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: 13,
  background: "#00000022",
  border: `1px solid ${C.cardEdge}`,
  color: C.cream,
  fontSize: 15,
  fontFamily: sans,
  textAlign: "left",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: 14,
  background: C.card,
  border: `1px solid ${C.cardEdge}`,
  color: C.cream,
  fontSize: 16,
  fontFamily: sans,
  outline: "none",
};

const modKartStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: 16,
  cursor: "pointer",
  background: C.card,
  border: `1px solid ${C.cardEdge}`,
  color: C.cream,
};

const etiketStyle: React.CSSProperties = {
  fontSize: 13,
  color: C.muted,
  display: "block",
  marginBottom: 6,
};

/** Kart üstündeki küçük durum yazıları (yapay zekâ, +18, önerilen...). */
const rozetYaziStyle = (renk: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 10.5,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: renk,
  whiteSpace: "nowrap",
});
