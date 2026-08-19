import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

/**
 * Bağımsız Vite yapılandırması.
 *
 * Dağıtım hedefi NITRO_PRESET ile değiştirilebilir:
 *   cloudflare-module (varsayılan) · node-server · vercel · netlify
 */
export default defineConfig(({ mode }) => {
  // VITE_ ile başlayan değişkenler istemciye gömülür.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define = Object.fromEntries(
    Object.entries(env).map(([anahtar, deger]) => [
      `import.meta.env.${anahtar}`,
      JSON.stringify(deger),
    ]),
  );

  return {
    define,
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // TanStack Start'ın sunucu girişini src/server.ts'e yönlendir (SSR hata sarmalayıcımız).
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      nitro({ defaultPreset: process.env.NITRO_PRESET ?? "cloudflare-module" }),
      viteReact(),
    ],
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      // Aynı React/TanStack kopyasının iki kez yüklenmesini engelle.
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    server: { host: true, port: 8080 },
  };
});
