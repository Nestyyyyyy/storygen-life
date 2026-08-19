# StoryGen — Yapay Zekâ Hikâye Simülatörü

Türkçe, tarayıcıda çalışan interaktif hikâye oyunları. Bir karakter yaratıyorsun,
seçimlerini yapıyorsun, anlatıcı hayatını yazıyor.

## Modlar

| Rota         | Mod              | Ne yapıyor                                                                                                                                                                                                                               |
| ------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/hayat`     | **Ömür Modu**    | Karakterini kur (isim, cinsiyet, köken, meslek, hedef, kişilik), bebeklikten yaşlılığa yaşına uygun olayları yaşa. Sahneler mesleğine göre kuruluyor; kararsız kaldığında akıl hocası öneri veriyor; istersen kendi cevabını yazıyorsun. |
| `/lifestory` | Hayat Simülatörü | Anlatıcının bölüm bölüm yazdığı serbest hikâye.                                                                                                                                                                                          |
| `/dedektif`  | Dedektif Modu    | Sorgu odasında kendini savun.                                                                                                                                                                                                            |
| `/karakter`  | Yoldaş           | Karakterle karşılıklı ilerleyen anlatı.                                                                                                                                                                                                  |

## Kurulum

```sh
git clone <bu-depo>
cd storygen-life
npm install
cp .env.example .env      # yapay zekâ anahtarını gir (opsiyonel)
npm run dev               # http://localhost:8080
```

## Yapay zekâ

Uygulama **OpenAI uyumlu `/chat/completions` ucu veren herhangi bir servisle** çalışır:
OpenAI, Google Gemini (uyumluluk ucu), OpenRouter ya da kendi ağ geçidin.

```sh
AI_API_KEY=...
AI_BASE_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

Ayrıntılar ve alternatif sağlayıcılar için `.env.example`.

**Anahtar yoksa oyun yine çalışır.** Ömür Modu'nun kendi yerel motoru var: elle yazılmış
olay havuzu + prosedürel sahne üreteci + meslek sözlüğü. Yapay zekâ devredeyken sahneler
modelden gelir ve olay kartında "yapay zekâ" rozeti görünür; anahtar yoksa ya da istek
düşerse sessizce yerel motora düşer.

## Ömür Modu nasıl çalışıyor

```
src/lib/hayat/
  tipler.ts    Ortak tipler
  veri.ts      Statlar, modlar, köken/hedef/kişilik listeleri, etiket tabloları
  olaylar.ts   Elle yazılmış 68 olay (zincir ve +18 olayları dahil)
  uretec.ts    52 prosedürel sahne kalıbı — kalıp + mekân/zaman yuvası + etki aralığı
  is.ts        Meslek sözlüğü ve iş sahnesi üreteci
  profil.ts    Serbest metin (meslek/kişilik) → oyun etiketleri
  motor.ts     Olay seçimi, etki hesabı, öneri motoru, bitiş değerlendirmesi
src/lib/hayat.server.ts     Yapay zekâ katmanı (sahne, öneri, profil, serbest cevap)
src/lib/hayat.functions.ts  Sunucu fonksiyonları
src/components/HayatOyunu.tsx  Arayüz (sağlayıcı verilmezse tamamen yerel çalışır)
```

Tasarım kuralı: **etiket seçimini yapay zekâ yapar, sayıları oyun verir.** Model hangi
davranışın hangi etikete girdiğine ve anlatı cümlelerine karar verir; stat etkileri
sabit tablodan gelir. Böylece denge modele bırakılmaz ve bozuk yanıt oyunu kıramaz.

Yeni içerik eklemek:

- **Olay** → `olaylar.ts` dizisine bir nesne
- **Sahne kalıbı** → `uretec.ts` içindeki `KALIPLAR`
- **Meslek grubu** → `is.ts` içindeki `SOZLUKLER` + `profil.ts` içindeki `MESLEK_SOZLUK`
- **Kişilik/meslek etkisi** → `veri.ts` içindeki `KISILIK_ETKI` / `MESLEK_ETKI`

## Dağıtım

Nitro ile derleniyor; varsayılan hedef Cloudflare Workers.

```sh
npm run build     # .output/ üretir
npm run deploy    # build + wrangler deploy
```

Başka bir hedef için `NITRO_PRESET` ayarla: `node-server`, `vercel`, `netlify`.

## Komutlar

```sh
npm run dev        # geliştirme sunucusu (8080)
npm run build      # üretim derlemesi
npm run preview    # derlemeyi önizle
npm run lint       # ESLint
npm run format     # Prettier
```
