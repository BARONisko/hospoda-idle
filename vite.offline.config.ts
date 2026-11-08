// Offline verze do složky: celá hra v jednom index.html (JS, CSS, písmo i překlady uvnitř),
// takže jde spustit dvojklikem z disku (file://) bez serveru a bez internetu.
// Sestavení a vložení do HTML: npm run build:offline (tools/offline.mjs)
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// verze hry = krátké číslo commitu (ukazuje se v Nastavení, ať je vidět, jestli se hra aktualizovala)
const ver = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
})();

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(ver) },
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist-offline',
    target: 'es2022',
    chunkSizeWarningLimit: 4000,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
