/* GitHub Pages için statik derleme: dist-web/ altına tek sayfa + tek paket.
   Sunucu gerektirmez; yapay zekâ oyuncunun kendi anahtarıyla tarayıcıdan çalışır. */

import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("dist-web", { recursive: true });

await build({
  entryPoints: ["web/cihaz-worker.ts"],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2020",
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: "dist-web/cihaz-worker.js",
  logLevel: "info",
});

await build({
  entryPoints: { oyun: "web/giris.tsx" },
  bundle: true,
  minify: true,
  format: "esm",
  splitting: true, // web-llm ayrı parçada kalır; yalnızca cihaz modeli seçilince iner
  jsx: "automatic",
  target: "es2020",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "@": "./src" },
  outdir: "dist-web",
  chunkNames: "parca/[name]-[hash]",
  logLevel: "info",
});

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>Hayat Simülatörü</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="description" content="Karakterini yarat, bir ömrü yaşa. Sahneleri yapay zekâ yazar — kendi ücretsiz Gemini anahtarınla." />
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕯️</text></svg>" />
<style>
  :root { --zemin: #17122a; --zemin-alt: #241a3d; --altin: #f5b942; --krem: #ece7f5; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--zemin); color: var(--krem);
    font-family: system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased;
    overflow-x: hidden; overscroll-behavior-y: none; }
  button { font-family: inherit; -webkit-tap-highlight-color: transparent; }
  button:focus-visible, input:focus-visible { outline: 2px solid var(--altin); outline-offset: 2px; }
  @media (hover: none) { button:active { filter: brightness(1.12); } }
  #yukleniyor { min-height: 100vh; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px; background: linear-gradient(160deg, var(--zemin), var(--zemin-alt));
    font-family: Georgia, "Times New Roman", serif; }
  #yukleniyor span { font-size: 34px; }
  #yukleniyor p { margin: 0; font-size: 14px; letter-spacing: 3px; text-transform: uppercase;
    color: #9a8fb5; font-family: system-ui, sans-serif; }
  @media (prefers-reduced-motion: reduce) { * { transition-duration: .01ms !important; animation-duration: .01ms !important; } }
</style>
</head>
<body>
<div id="oyun"><div id="yukleniyor"><span>🕯️</span><p>hayat kuruluyor</p></div></div>
<script type="module" src="./oyun.js"></script>
</body>
</html>
`;
writeFileSync("dist-web/index.html", html);
writeFileSync("dist-web/.nojekyll", "");
console.log("dist-web hazır");
