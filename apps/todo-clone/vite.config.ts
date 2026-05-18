import { cloudflare } from "@cloudflare/vite-plugin";
import { inertiaPages } from "@hono/inertia/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

export default defineConfig({
  esbuild: {
    jsxImportSource: "hono/jsx",
  },
  plugins: [
    cloudflare(),
    tailwindcss(),
    inertiaPages({
      pagesDir: "src/Pages",
      outFile: "src/pages.gen.ts",
      serverModule: "./index",
    }),
    ssrPlugin(),
  ],
});
