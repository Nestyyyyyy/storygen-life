/* Hayat Simülatörü — oyun motoru
   Olay seçimi, etki hesabı, öneri sistemi ve bitiş değerlendirmesi. */

import { OLAYLAR } from "./olaylar";
import { kalipId, rastgeleSahne } from "./uretec";
import {
  HEDEFLER,
  ISIMLER,
  KISILIKLER,
  KISILIK_ETKI,
  KOKENLER,
  KOPEK_ISIMLERI,
  MESLEKLER,
  MESLEK_ETKI,
  MESLEK_IMZA_ETIKETLERI,
  STAT_ADI,
  STAT_ANAHTARLARI,
  TON_KURALLARI,
  evreBul,
} from "./veri";
import type { Durum, Etki, Iliski, IliskiTur, Olay, Secenek, StatAnahtar, Statlar } from "./tipler";

export const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
export const paraFmt = (n: number) =>
  (n < 0 ? "-" : "") + "₺" + Math.abs(Math.round(n)).toLocaleString("tr-TR");
export const rast = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export function fxTopla(hedef: Etki, ek?: Etki) {
  if (!ek) return hedef;
  (Object.keys(ek) as StatAnahtar[]).forEach((k) => {
    hedef[k] = (hedef[k] ?? 0) + (ek[k] ?? 0);
  });
  return hedef;
}

/* ---------- İlişkiler ---------- */

export function iliskiIsmiUret(tur: IliskiTur, cinsiyet: string, mevcut: string[]) {
  if (tur === "kopek") {
    const kalan = KOPEK_ISIMLERI.filter((i) => !mevcut.includes(i));
    return rast(kalan.length ? kalan : KOPEK_ISIMLERI);
  }
  let havuz: string[];
  if (tur === "sevgili" || tur === "es") {
    if (cinsiyet === "kadin") havuz = ISIMLER.erkek;
    else if (cinsiyet === "erkek") havuz = ISIMLER.kadin;
    else havuz = [...ISIMLER.kadin, ...ISIMLER.erkek];
  } else {
    havuz = [...ISIMLER.kadin, ...ISIMLER.erkek];
  }
  const kalan = havuz.filter((i) => !mevcut.includes(i));
  return rast(kalan.length ? kalan : havuz);
}

const YEDEK_AD: Record<string, string> = {
  sevgili: "sevdiğin kişi",
  es: "eşin",
  partner: "sevdiğin kişi",
  arkadas: "yakın bir arkadaşın",
  rakip: "eski rakibin",
  cocuk: "çocuğun",
  kopek: "köpeğin",
  ilkAsk: "ilk aşkın",
};

export function iliskiBul(iliskiler: Iliski[], tur: string): Iliski | undefined {
  if (tur === "ilkAsk") return [...iliskiler].reverse().find((i) => i.ilkAsk);
  if (tur === "partner") return iliskiBul(iliskiler, "es") ?? iliskiBul(iliskiler, "sevgili");
  return [...iliskiler].reverse().find((i) => i.tur === tur && i.aktif);
}

export function metinDoldur(metin: string, durum: Durum): string {
  if (!metin) return "";
  return metin.replace(/\{(\w+)\}/g, (tam, anahtar: string) => {
    if (anahtar === "isim") return durum.karakter.isim;
    if (anahtar === "birlikteYil") {
      const p = iliskiBul(durum.iliskiler, "partner");
      return String(Math.max(1, durum.yas - (p ? p.baslangic : durum.yas - 1)));
    }
    const iliski = iliskiBul(durum.iliskiler, anahtar);
    if (iliski) return iliski.ad;
    return YEDEK_AD[anahtar] ?? tam;
  });
}

/* ---------- Olay seçimi ---------- */

function kosulUygun(olay: Olay, durum: Durum) {
  const g = olay.gerek;
  if (!g) return true;
  if (g.bayrak && !g.bayrak.every((b) => durum.bayraklar.includes(b))) return false;
  if (g.yokBayrak && g.yokBayrak.some((b) => durum.bayraklar.includes(b))) return false;
  if (g.iliski && !iliskiBul(durum.iliskiler, g.iliski)) return false;
  if (g.yokIliski && iliskiBul(durum.iliskiler, g.yokIliski)) return false;
  if (g.minYas !== undefined && durum.yas < g.minYas) return false;
  if (g.maxYas !== undefined && durum.yas > g.maxYas) return false;
  return true;
}

export function olayUygunMu(olay: Olay, durum: Durum) {
  const evre = evreBul(durum.yas);
  if (!olay.evreler.includes(evre)) return false;
  if (olay.kaosOnly && durum.mod !== "kaos") return false;
  // Bir hayatta aynı olay iki kez çıkmaz.
  if (durum.gorulen.includes(olay.id)) return false;
  return kosulUygun(olay, durum);
}

function agirlik(olay: Olay, durum: Durum) {
  let w = olay.agirlik ?? 1;
  if (olay.gerek) w *= 3; // koşulu tutan zincir olayları öne çıksın
  if (durum.mod === "romantik" && olay.alan === "ask") w *= 3;
  if (durum.mod === "fakir" && olay.alan === "para") w *= 2;
  if (durum.mod === "kaos" && olay.kaosOnly) w *= 3;
  const meslek = durum.karakter.meslek;
  if (meslek === "doktor" && olay.alan === "saglik") w *= 1.5;
  if (meslek === "girisimci" && olay.alan === "para") w *= 1.5;
  if (meslek === "sanatci" && olay.alan === "hayat") w *= 1.5;
  return Math.max(1, Math.round(w));
}

/**
 * Sıradaki olayı seçer. Önce koşulu tutmuş zincir olayları, sonra elle
 * yazılmış sahneler ve prosedürel sahneler karışık gelir. Aynı olay bir
 * hayatta iki kez çıkmaz; üretilen sahnelerde de son kalıplar tekrarlanmaz.
 */
export function olaySec(durum: Durum, sonKaliplar: string[] = []): Olay {
  const evre = evreBul(durum.yas);
  const uygun = OLAYLAR.filter((o) => olayUygunMu(o, durum));
  const zincir = uygun.filter((o) => o.gerek);

  if (zincir.length && Math.random() < 0.7) {
    return tartiliSec(zincir, durum);
  }
  const uretilen = rastgeleSahne(evre, sonKaliplar);
  const uretilenUygun = uretilen && kosulUygun(uretilen, durum) ? uretilen : null;

  if (!uygun.length) return uretilenUygun ?? rastgeleSahne(evre) ?? uygunOlmayanYedek(durum);
  if (!uretilenUygun) return tartiliSec(uygun, durum);
  return Math.random() < 0.45 ? tartiliSec(uygun, durum) : uretilenUygun;
}

function tartiliSec(havuz: Olay[], durum: Durum): Olay {
  const tartili: Olay[] = [];
  havuz.forEach((o) => {
    const w = agirlik(o, durum);
    for (let i = 0; i < w; i++) tartili.push(o);
  });
  return rast(tartili);
}

/** Hiçbir şey uymazsa (teoride olmamalı) en azından bir sahne dönsün. */
function uygunOlmayanYedek(durum: Durum): Olay {
  const evre = evreBul(durum.yas);
  return (
    rastgeleSahne(evre) ?? {
      id: `bos-${durum.yas}`,
      evreler: [evre],
      alan: "hayat",
      emoji: "🌫️",
      baslik: "Sıradan Bir Gün",
      metin: "Bugün kayda değer bir şey olmadı. Bazı yıllar böyle geçiyor.",
      secenekler: [
        {
          t: "Günü öylece geçir",
          etiketler: ["tembellik"],
          fx: { mutluluk: 1 },
          sonuc: "Gün akıp gitti. Hatırlanacak bir tarafı yoktu ve bu da bir çeşit dinlenmeydi.",
        },
      ],
      uretilmis: true,
    }
  );
}

/* ---------- Seçim sonucu ---------- */

export function riskOrani(secenek: Secenek, durum: Durum) {
  let p = secenek.riskli ?? 0;
  const k = durum.karakter;
  if (k.kisilikler.includes("kurnaz")) p -= 0.08;
  if (k.kisilikler.includes("hirsli")) p -= 0.05;
  if (k.kisilikler.includes("umursamaz")) p += 0.07;
  if (k.kisilikler.includes("cesur")) p -= 0.04;
  if (k.meslek === "girisimci") p -= 0.08;
  return Math.max(0.05, Math.min(0.9, p));
}

function tonCumlesi(statlar: Statlar) {
  const kural = TON_KURALLARI.find((t) => t.test(statlar));
  if (!kural || Math.random() > 0.5) return null;
  return rast(kural.cumleler);
}

export type Hesap = {
  fx: Etki;
  dpara: number;
  anlati: string;
  notlar: string[];
  basarisiz: boolean;
};

/** Etiketlere göre kişilik ve meslek etkilerini toplar. */
function etiketEtkileri(secenek: Secenek, durum: Durum) {
  const { kisilikler, meslek } = durum.karakter;
  const fx: Etki = {};
  let paraCarpan = 1;
  const kisilikNot = new Map<string, string>(); // özellik başına en fazla bir cümle
  const meslekNot: string[] = [];

  secenek.etiketler.forEach((etiket) => {
    kisilikler.forEach((k) => {
      const etki = KISILIK_ETKI[k]?.[etiket];
      if (!etki) return;
      fxTopla(fx, etki.fx);
      if (etki.paraCarpan) paraCarpan *= etki.paraCarpan;
      if (etki.not && !kisilikNot.has(k)) kisilikNot.set(k, etki.not);
    });
    const mEtki = MESLEK_ETKI[meslek]?.[etiket];
    if (mEtki) {
      fxTopla(fx, mEtki.fx);
      if (mEtki.paraCarpan) paraCarpan *= mEtki.paraCarpan;
      if (mEtki.not) {
        if (MESLEK_IMZA_ETIKETLERI.includes(etiket)) meslekNot.unshift(mEtki.not);
        else meslekNot.push(mEtki.not);
      }
    }
  });

  const kisilikNotlari = Array.from(kisilikNot.values());
  const notlar = meslekNot.length
    ? [kisilikNotlari[0], meslekNot[0]].filter(Boolean)
    : kisilikNotlari.slice(0, 2);
  return { fx, paraCarpan, notlar, kisilikSayisi: kisilikNotlari.length };
}

export function secimiHesapla(secenek: Secenek, durum: Durum): Hesap {
  const basarisiz = secenek.riskli ? Math.random() < riskOrani(secenek, durum) : false;
  const kaynak = basarisiz && secenek.kotu ? secenek.kotu : secenek;

  const fx: Etki = { ...(kaynak.fx ?? {}) };
  const ek = etiketEtkileri(secenek, durum);
  fxTopla(fx, ek.fx);

  if (durum.mod === "kaos") {
    (Object.keys(fx) as StatAnahtar[]).forEach((k) => {
      fx[k] = Math.round((fx[k] ?? 0) * (0.6 + Math.random()));
    });
  }

  const hamPara = kaynak.para ?? 0;
  const dpara = Math.round(hamPara > 0 ? hamPara * ek.paraCarpan : hamPara);

  let anlati = kaynak.sonuc;
  if (!basarisiz && secenek.sonucKisilik) {
    const eslesen = durum.karakter.kisilikler.find((k) => secenek.sonucKisilik![k]);
    if (eslesen) anlati = secenek.sonucKisilik[eslesen];
  }

  return { fx, dpara, anlati, notlar: ek.notlar, basarisiz };
}

/** Seçimin ardından anlatıyı kurar: gövde + kişilik/meslek notu + kritik stat tonu. */
export function anlatiKur(hesap: Hesap, yeniDurum: Durum, yeniStatlar: Statlar) {
  const parcalar = [metinDoldur(hesap.anlati, yeniDurum), ...hesap.notlar];
  const ton = tonCumlesi(yeniStatlar);
  if (ton) parcalar.push(ton);
  return parcalar.join(" ");
}

/* ---------- Öneri sistemi ----------
   "Öner" düğmesi bunu çağırır. Seçenekleri karakterin kişiliğine, meslek
   eğilimine, hayat hedefine ve o anki stat dengesine göre puanlar; en
   yüksek puanlıyı gerekçesiyle birlikte döner. */

export type Oneri = {
  indeks: number;
  gerekce: string;
  puanlar: number[];
  /** Yapay zekâdan mı geldi, yerel motordan mı? */
  kaynak: "yerel" | "ai";
};

function statAgirligi(k: StatAnahtar, durum: Durum) {
  let w = 1 + (100 - durum.statlar[k]) / 60;
  const hedef = durum.karakter.hedef;
  if (hedef === "ask" && k === "ask") w *= 2;
  if ((hedef === "zirve" || hedef === "iz") && k === "kariyer") w *= 2;
  if (hedef === "huzur" && (k === "saglik" || k === "mutluluk")) w *= 1.8;
  if (k === "saglik" && durum.statlar.saglik < 30) w *= 2.2;
  if (k === "mutluluk" && durum.statlar.mutluluk < 25) w *= 1.6;
  return w;
}

/** Riskli seçeneklerde iyi ve kötü sonucun olasılıkla ağırlıklı ortalaması. */
function beklenenEtki(secenek: Secenek, durum: Durum) {
  const ek = etiketEtkileri(secenek, durum);
  const p = secenek.riskli ? riskOrani(secenek, durum) : 0;
  const iyiFx = secenek.fx ?? {};
  const kotuFx = secenek.kotu?.fx ?? iyiFx;
  const fx: Etki = {};
  STAT_ANAHTARLARI.forEach((k) => {
    const iyi = iyiFx[k] ?? 0;
    const kotu = kotuFx[k] ?? 0;
    const taban = (1 - p) * iyi + p * kotu;
    const deger = taban + (ek.fx[k] ?? 0);
    if (deger !== 0) fx[k] = deger;
  });
  const iyiPara =
    (secenek.para ?? 0) > 0 ? (secenek.para ?? 0) * ek.paraCarpan : (secenek.para ?? 0);
  const kotuPara = secenek.kotu?.para ?? iyiPara;
  const para = (1 - p) * iyiPara + p * kotuPara;
  return { fx, para, notlar: ek.notlar, kisilikSayisi: ek.kisilikSayisi, risk: p };
}

function paraAgirligi(durum: Durum) {
  let w = 1;
  if (durum.para < 5000) w += 1;
  if (durum.para < 0) w += 1;
  if (durum.karakter.hedef === "servet") w *= 2.2;
  return w;
}

export function oneriHesapla(olay: Olay, durum: Durum): Oneri {
  const hedef = HEDEFLER.find((h) => h.key === durum.karakter.hedef)!;
  const analizler = olay.secenekler.map((s) => beklenenEtki(s, durum));

  const puanlar = analizler.map((a, i) => {
    let puan = 0;
    STAT_ANAHTARLARI.forEach((k) => {
      puan += (a.fx[k] ?? 0) * statAgirligi(k, durum);
    });
    puan += (a.para / 9000) * paraAgirligi(durum);
    // Kişiliğe uygun seçim küçük bir bonus alır.
    puan += a.kisilikSayisi * 1.5;
    // Hayatta kalma: sağlığı dibe çekecek seçenek elenir.
    const sonrakiSaglik = durum.statlar.saglik + (a.fx.saglik ?? 0);
    if (sonrakiSaglik < 10) puan -= 45;
    else if (sonrakiSaglik < 20) puan -= 12;
    // Borçtayken daha da borçlandıran seçenek cezalı.
    if (durum.para < 0 && a.para < 0) puan -= 6;
    // Riskli seçenekler belirsizlik cezası alır (girişimci daha az).
    if (a.risk > 0) puan -= a.risk * (durum.karakter.meslek === "girisimci" ? 4 : 9);
    return { i, puan };
  });

  const kazanan = puanlar.reduce((en, x) => (x.puan > en.puan ? x : en), puanlar[0]);
  const a = analizler[kazanan.i];
  const secenek = olay.secenekler[kazanan.i];

  /* ---- gerekçe ---- */
  const gerekceler: string[] = [];
  const enDusuk = [...STAT_ANAHTARLARI].sort((x, y) => durum.statlar[x] - durum.statlar[y])[0];

  if (durum.statlar.saglik < 30 && (a.fx.saglik ?? 0) > 0) {
    gerekceler.push(`Sağlığın kritik (${durum.statlar.saglik}); bu seçenek onu toparlıyor.`);
  } else if ((a.fx[enDusuk] ?? 0) > 0) {
    gerekceler.push(
      `En zayıf yanın ${STAT_ADI[enDusuk].toLowerCase()}; bu seçim tam oraya dokunuyor.`,
    );
  }

  const hedefStat: Partial<Record<string, StatAnahtar>> = {
    ask: "ask",
    iz: "kariyer",
    zirve: "kariyer",
  };
  const hs = hedefStat[hedef.key];
  if (hs && (a.fx[hs] ?? 0) > 0) {
    gerekceler.push(`"${hedef.ad}" hedefine bu seçenek yaklaştırıyor.`);
  } else if (hedef.key === "servet" && a.para > 0) {
    gerekceler.push(`"${hedef.ad}" hedefin için kasaya en çok bunu koyuyor.`);
  } else if (hedef.key === "huzur" && ((a.fx.mutluluk ?? 0) > 0 || (a.fx.saglik ?? 0) > 0)) {
    gerekceler.push(`"${hedef.ad}" hedefinle en uyumlu adım bu.`);
  }

  if (a.kisilikSayisi > 0 && gerekceler.length < 2) {
    const kisilikAdi = durum.karakter.kisilikler
      .map((k) => KISILIKLER.find((x) => x.key === k))
      .find((x) => x && secenek.etiketler.some((e) => KISILIK_ETKI[x.key]?.[e]));
    if (kisilikAdi) gerekceler.push(`${kisilikAdi.ad} yanın bu seçimde avantaja dönüyor.`);
  }

  if (durum.para < 0 && a.para > 0 && gerekceler.length < 2) {
    gerekceler.push("Borçtasın; nakit getiren tek seçenek bu.");
  }

  const riskliVar = olay.secenekler.some((s) => s.riskli);
  if (!secenek.riskli && riskliVar && gerekceler.length < 2) {
    gerekceler.push("Diğer seçenekler kumar; bu, riski en düşük olan.");
  }

  if (!gerekceler.length) gerekceler.push("Şu anki dengende en çok kazandıran seçenek bu.");

  return {
    indeks: kazanan.i,
    gerekce: gerekceler.slice(0, 2).join(" "),
    puanlar: puanlar.map((p) => Math.round(p.puan * 10) / 10),
    kaynak: "yerel",
  };
}

/* ---------- Yaş ilerleyişi ---------- */

export function yasArtisi(yas: number) {
  const evre = evreBul(yas);
  if (evre === "bebek" || evre === "cocuk" || evre === "genc")
    return 1 + Math.floor(Math.random() * 2);
  return 2 + Math.floor(Math.random() * 2);
}

export function omurHesapla(koken: string, meslek: string) {
  let omur = 78 + Math.floor(Math.random() * 15);
  omur += ({ varlikli: 4, orta: 0, zor: -4, kimsesiz: -6 } as Record<string, number>)[koken] ?? 0;
  if (meslek === "sporcu") omur += 3;
  if (meslek === "doktor") omur += 2;
  return omur;
}

/* ---------- Bitiş ---------- */

export function hedefDegerlendir(durum: Durum) {
  const hedef = HEDEFLER.find((h) => h.key === durum.karakter.hedef)!;
  let deger: number;
  if (hedef.olcut === "para") deger = durum.para;
  else if (hedef.olcut === "huzur") deger = (durum.statlar.saglik + durum.statlar.mutluluk) / 2;
  else deger = durum.statlar[hedef.olcut as StatAnahtar];
  const oran = Math.max(0, Math.min(1, deger / hedef.hedefDeger));
  const basarili = oran >= 1;
  const metin = basarili
    ? `Hedefine ulaştın: ${hedef.ad.toLowerCase()}.`
    : oran >= 0.7
      ? `Hedefine çok yaklaştın ama tam varamadın: ${hedef.ad.toLowerCase()}.`
      : `Hedefin "${hedef.ad}" yolda kaldı.`;
  return { hedef, deger, oran, basarili, metin };
}

export function unvanBul(skor: number, durum: Durum) {
  const s = durum.statlar;
  const h = hedefDegerlendir(durum);
  if (h.basarili && skor >= 75) return `${h.hedef.ad}: başardı`;
  if (skor >= 88) return "Dolu dolu yaşanmış bir ömür";
  if (s.ask >= 78) return "Sevgiyle dolu bir kalp";
  if (durum.para >= 500000) return "Servetin gölgesinde bir hayat";
  if (s.kariyer >= 78) return "Adı işiyle anılan biri";
  if (s.arkadaslik >= 78) return "Dostlarıyla anılan biri";
  if (s.saglik >= 80 && skor >= 60) return "Sağlam kalmış bir çınar";
  if (durum.karakter.kisilikler.includes("hirsli") && skor >= 60)
    return "Durmayı hiç öğrenemeyen biri";
  if (durum.karakter.kisilikler.includes("merhametli") && s.mutluluk >= 60)
    return "Herkese bir şey bırakan biri";
  if (skor >= 50) return "Sıradan ama gerçek bir hayat";
  if (skor >= 30) return "Bir hayli çalkantılı bir yolculuk";
  return "Zorluklarla geçen bir ömür";
}

export function skorHesapla(durum: Durum) {
  const ort = Math.round(
    STAT_ANAHTARLARI.reduce((a, k) => a + durum.statlar[k], 0) / STAT_ANAHTARLARI.length,
  );
  const paraPuan = Math.max(-10, Math.min(20, Math.round(durum.para / 20000)));
  const hedefPuan = Math.round(hedefDegerlendir(durum).oran * 12);
  return Math.max(0, Math.min(100, ort + paraPuan + hedefPuan));
}

export function hayatHikayesi(durum: Durum, skor: number) {
  const { karakter, bayraklar, iliskiler, statlar, yas } = durum;
  const koken = KOKENLER.find((k) => k.key === karakter.koken)!;
  const meslek = MESLEKLER.find((m) => m.key === karakter.meslek)!;
  const kisilikAdlari = karakter.kisilikler.map((k) =>
    (KISILIKLER.find((x) => x.key === k)?.ad ?? k).toLowerCase(),
  );
  const h = hedefDegerlendir(durum);
  const c: string[] = [];

  c.push(
    `${karakter.isim}, ${koken.hikaye} başlayan bir hayatı ${yas} yıl taşıdı; ${kisilikAdlari.join(" ve ")} bir insandı ve bu iki huy neredeyse bütün dönüm noktalarında masadaydı.`,
  );

  c.push(
    karakter.meslek !== "belirsiz"
      ? statlar.kariyer >= 60
        ? `İçindeki ${meslek.ad.toLowerCase()} olma isteğini bastırmadı; yaptığı işte adı anıldı, emeği karşılığını buldu.`
        : `${meslek.ad} olmak istemişti; hayat başka yerlere savurdu ama o eğilim seçimlerinin arasında hep bir yerlerde durdu.`
      : "Ne olmak istediğine hiçbir zaman tam karar vermedi ve tuhaf biçimde bu belirsizlik onu hep yeni kapılara götürdü.",
  );

  const romantik = iliskiler.filter((i) => i.tur === "sevgili" || i.tur === "es");
  const es = iliskiler.find((i) => i.tur === "es");
  if (es && !bayraklar.includes("bosandi")) {
    c.push(`${es.ad} ile kurduğu hayat, en uzun süren ve en çok emek verdiği şeydi.`);
  } else if (bayraklar.includes("bosandi")) {
    c.push(
      "Bir evlilik kurdu ve dağıldığını gördü; o kırılma sonraki her ilişkisinin bir yerinde iz bıraktı.",
    );
  } else if (romantik.length) {
    c.push(`${romantik.length} kez ciddi biçimde sevdi ama hiçbiri kalıcı olmadı.`);
  } else {
    c.push(
      "Aşk, hayatına hep uzaktan uğradı; kapıyı çaldığı zamanlarda ya evde yoktu ya da açmadı.",
    );
  }

  if (bayraklar.includes("cocukVar")) {
    const cocuk = iliskiler.find((i) => i.tur === "cocuk");
    c.push(`${cocuk ? cocuk.ad : "Çocuğu"}, geriye bıraktığı en canlı hikâyeydi.`);
  }
  if (bayraklar.includes("kacak"))
    c.push("Kapatmadığı bir borç yüzünden yıllarca omzunun üstünden arkasına baktı.");
  else if (bayraklar.includes("borcOdendi"))
    c.push("Bir dönem borcun altında ezildi ama o borcu kendi eliyle kapattı.");
  if (bayraklar.includes("kendiIsi"))
    c.push("Kendi kurduğu işin ayakta durduğunu görmek, aldığı en büyük risklerin karşılığıydı.");
  if (bayraklar.includes("terapi"))
    c.push("Bir noktada kendine bakmayı öğrendi; bunu yapmak cesaret istedi.");
  if (bayraklar.includes("birakti"))
    c.push(
      "Yıllar süren bir alışkanlığı geç de olsa bıraktı ve bedeni ona bunun için teşekkür etti.",
    );

  c.push(h.basarili ? `Kendine koyduğu hedefi tutturdu: ${h.hedef.ad.toLowerCase()}.` : h.metin);

  const sirali = [...STAT_ANAHTARLARI].sort((x, y) => statlar[y] - statlar[x]);
  c.push(
    `Geriye dönüp bakıldığında en zengin olduğu yer ${STAT_ADI[sirali[0]].toLowerCase()}, en aç kaldığı yer ${STAT_ADI[sirali[sirali.length - 1]].toLowerCase()} oldu.`,
  );

  c.push(
    skor >= 80
      ? "Sonunda geriye pişmanlıktan çok anı kaldı — ve anlatacak birileri hep vardı."
      : skor >= 55
        ? "Ne destansı ne de boşa geçmiş; sıradan olanı hakkıyla yaşamış bir ömürdü."
        : "Zor bir yoldu ve çoğu zaman yalnız yürüdü; yine de sonuna kadar yürüdü.",
  );

  return c.join(" ");
}

export { kalipId };
