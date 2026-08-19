# Depo notları

TanStack Start + React 19 + Tailwind v4. Derleme Nitro ile, varsayılan hedef
Cloudflare Workers.

## Yapı

- `src/routes/` — dosya tabanlı yönlendirme. `routeTree.gen.ts` otomatik üretilir, elle düzenleme.
- `src/lib/*.server.ts` — yalnızca sunucuda çalışır. İstemciden import edilirse derleme hata verir.
- `src/lib/*.functions.ts` — `createServerFn` sarmalayıcıları; istemci bunları çağırır.
- `src/lib/hayat/` — Ömür Modu oyun motoru. Saf TypeScript, React'e ve sunucuya bağlı değil;
  hem tarayıcıda hem sunucuda çalışır.
- `src/components/ui/` — shadcn/ui bileşenleri.

## Yapay zekâ

`src/lib/life.server.ts` içindeki `askAi`, OpenAI uyumlu herhangi bir uca istek atar.
Tanımlı bütün sağlayıcı/model kombinasyonlarını sırayla, her birini iki denemeyle çağırır.
Model çıktısı çağıran tarafta **mutlaka temizlenir** (sınır dışı değerler kırpılır,
geçersiz alanlar elenir); ham çıktı doğrudan oyuna girmez.

Yapay zekâ ulaşılamadığında her özellik yerel bir karşılığa düşer — oyun hiçbir durumda
durmaz. Yeni bir yapay zekâ özelliği eklerken bu kuralı koru.

## Kontroller

```sh
npx tsc --noEmit
npm run lint
npm run build
```
