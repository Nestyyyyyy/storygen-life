/* Hayat Simülatörü — yapay zekâ katmanı

   İki iş yapar:
   1) Sahne üretimi — o yaşa, o karaktere ve o ana özel, daha önce çıkmamış
      bir olay yazar. Yerel prosedürel motor her zaman yedekte durur.
   2) Öneri — "Öner" düğmesine basıldığında seçenekleri değerlendirip
      birini gerekçesiyle işaret eder.

   İstemler (prompt) bu oyunun kurallarına göre yazıldı: geçerli etiket
   sözlüğü, etki sınırları, yaş bandına uygunluk ve anlatı uzunluğu
   modele açıkça dayatılıyor; dönen JSON ayrıca burada temizleniyor. */

import { askAi } from "./life.server";
import { EVRE_ADI, HEDEFLER, KISILIKLER, MESLEKLER, evreBul } from "./hayat/veri";
import { iliskiBul } from "./hayat/motor";
import type { Durum, Etiket, Etki, Olay, Secenek, StatAnahtar } from "./hayat/tipler";

const GECERLI_ETIKETLER: Etiket[] = [
  "cesaret",
  "kacinma",
  "risk",
  "guvenli",
  "sosyal",
  "yalniz",
  "romantik",
  "sadakat",
  "calisma",
  "tembellik",
  "yardim",
  "bencil",
  "durustluk",
  "hile",
  "tip",
  "sanat",
  "teknik",
  "ticaret",
  "spor",
  "kesif",
];

const STAT_ANAHTAR: StatAnahtar[] = ["saglik", "mutluluk", "ask", "arkadaslik", "kariyer"];

/** Yaş bandına göre modele verilen "bu yaşta ne olur" çerçevesi. */
const EVRE_CERCEVESI: Record<string, string> = {
  bebek:
    "0-6 yaş. Konu: ilk keşifler, aile içi anlar, oyun, küçük hastalıklar, ilk arkadaşlıklar. İş, para, aşk, evlilik ASLA olmaz.",
  cocuk:
    "7-12 yaş. Konu: okul, öğretmen, harçlık, mahalle, kardeş, hayvanlar, ilk sorumluluklar. Romantik ilişki, iş hayatı, borç ASLA olmaz.",
  genc: "13-19 yaş. Konu: sınav, ilk aşk, arkadaş grubu, kimlik arayışı, aileyle çatışma, ilk yaz işi. Evlilik, çocuk, emeklilik olmaz.",
  gencYetiskin:
    "20-35 yaş. Konu: ilk işler, kira, ilişkiler, taşınma, arkadaşlıkların seyrelmesi, ilk büyük para kararları.",
  yetiskin:
    "36-55 yaş. Konu: kariyer platosu, evlilik/çocuk, yaşlanan anne baba, birikim, sağlık uyarıları, eski dostlar.",
  orta: "56-70 yaş. Konu: sağlık takibi, emekliliğe hazırlık, devretme, yetişkin çocuklar, kayıplar, ertelenmiş hayaller.",
  yasli:
    "71+ yaş. Konu: emeklilik düzeni, torunlar, sağlık, anılar, miras, vedalar. Sınav, ilk iş, ilk aşk gibi konular ASLA olmaz.",
};

function karakterOzeti(durum: Durum) {
  const k = durum.karakter;
  const kisilik = k.kisilikler
    .map((x) => KISILIKLER.find((y) => y.key === x)?.ad ?? x)
    .join(" ve ");
  const meslek = MESLEKLER.find((m) => m.key === k.meslek)?.ad ?? k.meslek;
  const hedef = HEDEFLER.find((h) => h.key === k.hedef)?.ad ?? k.hedef;
  const aktif = durum.iliskiler
    .filter((i) => i.aktif)
    .map((i) => `${i.tur}: ${i.ad} (${Math.max(0, durum.yas - i.baslangic)} yıldır)`)
    .join(", ");
  const son = durum.gecmis
    .slice(-6)
    .map((g) => `${g.yas} yaş — ${g.baslik}: ${g.secim}`)
    .join(" | ");

  return `İsim: ${k.isim}
Yaş: ${durum.yas} (${EVRE_ADI[evreBul(durum.yas)]})
Cinsiyet: ${k.cinsiyet}
Köken: ${k.koken}
Meslek eğilimi: ${meslek}
Hayat hedefi: ${hedef}
Kişilik: ${kisilik}
Statlar: sağlık ${durum.statlar.saglik}, mutluluk ${durum.statlar.mutluluk}, aşk ${durum.statlar.ask}, arkadaşlık ${durum.statlar.arkadaslik}, kariyer ${durum.statlar.kariyer}
Para: ${Math.round(durum.para)} TL
Aktif ilişkiler: ${aktif || "yok"}
Geçmiş işaretler: ${durum.bayraklar.join(", ") || "yok"}
Son kararlar: ${son || "yok"}`;
}

const SAHNE_SISTEM = `Sen "Hayat Simülatörü" adlı Türkçe bir hayat oyununun anlatıcısısın.
Görevin: oyuncunun O ANKİ yaşına ve karakterine özel, DAHA ÖNCE GÖRÜLMEMİŞ tek bir sahne yazmak.

SADECE şu JSON'u döndür:
{"baslik": string, "emoji": string, "metin": string,
 "secenekler": [{"t": string, "etiketler": string[], "fx": {"saglik"?: number, "mutluluk"?: number, "ask"?: number, "arkadaslik"?: number, "kariyer"?: number}, "para"?: number, "sonuc": string}]}

KURALLAR
1. YAŞ UYGUNLUĞU EN ÖNEMLİ KURAL. Sahne, verilen yaş bandının çerçevesine birebir uymalı.
   60 yaşındaki birine okul sınavı, 8 yaşındaki birine iş görüşmesi yazmak ağır hatadır.
2. "metin" = sahnenin kurulumu, 1-2 cümle, ikinci tekil şahıs ("...yapıyorsun"). Soru sorma, seçenekleri metinde sayma.
3. 2 ile 4 arası seçenek üret. Seçenekler gerçekten FARKLI yollar olsun; biri iyi biri kötü değil, hepsinin bedeli olsun.
4. "sonuc" = seçim yapıldıktan sonraki anlatı. 2-4 cümle, somut detay ve duygu içersin, klişe olmasın.
   Sonuç metninde asla seçenek metnini tekrar etme, olayın DEVAMINI anlat.
5. "etiketler" sadece şu sözlükten seçilir: ${GECERLI_ETIKETLER.join(", ")}.
   Her seçeneğe 1-3 etiket ver; etiket seçimin gerçekten o davranışı anlatsın.
6. "fx" değerleri -15 ile +15 arasında olsun; toplamda dengeli olsun (her seçenek biraz kazandırıp biraz kaybettirsin).
   "para" TL cinsinden, -60000 ile +60000 arası, çoğu sahnede 0 ya da küçük olsun.
7. Karakterin kişiliğini, meslek eğilimini ve hayat hedefini sahneye SIZDIR; ama etiketlerle çelişme.
8. Aktif ilişkiler varsa kişileri İSİMLERİYLE kullan (uydurma yeni isim ekleme).
9. Verilen "kaçınılacak başlıklar" listesindeki konuları ve başlıkları TEKRARLAMA. Her sahne yeni bir konu olsun.
10. Türkçe yaz. Argo yok, açık cinsellik yok, şiddeti yüceltme yok. Melankoli, mizah ve sıcaklık serbest.`;

function sayi(v: unknown, alt: number, ust: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(alt, Math.min(ust, Math.round(n)));
}

function metniKirp(v: unknown, uzunluk: number) {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, uzunluk);
}

/** Modelden geleni oyunun kabul ettiği şekle sokar; uymayan her şey elenir. */
function sahneyiTemizle(ham: Record<string, unknown>, durum: Durum): Olay | null {
  const evre = evreBul(durum.yas);
  const hamSecenekler = Array.isArray(ham.secenekler) ? ham.secenekler : [];
  const secenekler: Secenek[] = [];

  for (const hs of hamSecenekler.slice(0, 4)) {
    if (!hs || typeof hs !== "object") continue;
    const o = hs as Record<string, unknown>;
    const t = metniKirp(o.t, 60);
    const sonuc = metniKirp(o.sonuc, 600);
    if (!t || sonuc.length < 30) continue;

    const etiketler = (Array.isArray(o.etiketler) ? o.etiketler : [])
      .map((e) => String(e).trim())
      .filter((e): e is Etiket => (GECERLI_ETIKETLER as string[]).includes(e))
      .slice(0, 3);

    const fx: Etki = {};
    const hamFx = (o.fx ?? {}) as Record<string, unknown>;
    STAT_ANAHTAR.forEach((k) => {
      if (hamFx[k] !== undefined) {
        const d = sayi(hamFx[k], -15, 15);
        if (d !== 0) fx[k] = d;
      }
    });

    const secenek: Secenek = {
      t,
      etiketler: etiketler.length ? etiketler : (["kesif"] as Etiket[]),
      fx,
      sonuc,
    };
    const para = sayi(o.para ?? 0, -60000, 60000);
    if (para !== 0) secenek.para = para;
    secenekler.push(secenek);
  }

  if (secenekler.length < 2) return null;

  const baslik = metniKirp(ham.baslik, 40) || "Bir Gün";
  const metin = metniKirp(ham.metin, 400);
  if (metin.length < 20) return null;

  const emojiHam = String(ham.emoji ?? "").trim();
  const emoji = emojiHam && [...emojiHam].length <= 2 ? emojiHam : "✨";

  return {
    id: `ai-${durum.yas}-${Math.random().toString(36).slice(2, 9)}`,
    evreler: [evre],
    alan: "hayat",
    emoji,
    baslik,
    metin,
    secenekler,
    uretilmis: true,
    yapayZeka: true,
  };
}

/** Yapay zekâdan bir sahne ister. Başarısız olursa null döner, çağıran yerel motora düşer. */
export async function aiSahneUret(durum: Durum, kacinilan: string[]): Promise<Olay | null> {
  const evre = evreBul(durum.yas);
  const partner = iliskiBul(durum.iliskiler, "partner");
  const user = `${karakterOzeti(durum)}

YAŞ BANDI ÇERÇEVESİ — buna birebir uy:
${EVRE_CERCEVESI[evre]}

Kaçınılacak başlıklar (bunları ve benzer konuları tekrar etme): ${kacinilan.slice(0, 18).join(" | ") || "yok"}
${partner ? `Not: ${partner.ad} ile ilişkisi sürüyor; sahne bu kişiyi anabilir.` : ""}
Rastgelelik tohumu: ${Math.random().toString(36).slice(2, 10)}

Bu karakter için ${durum.yas} yaşına uygun tek bir sahne yaz.`;

  try {
    const ham = await askAi(SAHNE_SISTEM, user, 1.1, ["metin", "secenekler"]);
    return sahneyiTemizle(ham, durum);
  } catch (err) {
    console.error("[aiSahneUret]", err);
    return null;
  }
}

const ONERI_SISTEM = `Sen "Hayat Simülatörü" oyununun akıl hocasısın.
Oyuncunun karakterine, hedefine ve o anki durumuna bakıp seçeneklerden BİRİNİ önerirsin.

SADECE şu JSON'u döndür: {"indeks": number, "gerekce": string}

KURALLAR
1. "indeks" 0'dan başlar ve verilen seçenek listesindeki sıradır.
2. Önerini şu sıraya göre kur: (a) hayatta kalma — sağlık 25'in altındaysa önce onu koru,
   (b) oyuncunun HAYAT HEDEFİ, (c) en zayıf stat, (d) kişilik uyumu.
3. "gerekce" en fazla 2 cümle, Türkçe, ikinci tekil şahıs. Somut ol: hangi stat, hangi hedef, hangi huy.
   "Bu daha iyi" gibi boş cümle kurma. Sayı verebilirsin.
4. Oyuncuya emir verme, akıl hocası gibi konuş. Seçeneği kelimesi kelimesine tekrar etme.`;

export async function aiOneri(
  olay: Olay,
  durum: Durum,
): Promise<{ indeks: number; gerekce: string } | null> {
  const hedef = HEDEFLER.find((h) => h.key === durum.karakter.hedef);
  const liste = olay.secenekler
    .map(
      (s, i) => `${i}) ${s.t} — etiketler: ${s.etiketler.join(", ")}${s.riskli ? " (riskli)" : ""}`,
    )
    .join("\n");

  const user = `${karakterOzeti(durum)}

Sahne: ${olay.baslik}
${olay.metin}

Seçenekler:
${liste}

Oyuncunun hedefi: ${hedef?.ad ?? durum.karakter.hedef}. Hangisini önerirsin?`;

  try {
    const ham = await askAi(ONERI_SISTEM, user, 0.4, ["indeks", "gerekce"]);
    const indeks = sayi(ham.indeks, 0, olay.secenekler.length - 1);
    const gerekce = metniKirp(ham.gerekce, 240);
    if (!gerekce) return null;
    return { indeks, gerekce };
  } catch (err) {
    console.error("[aiOneri]", err);
    return null;
  }
}
