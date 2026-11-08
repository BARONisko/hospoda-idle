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
  // relativní cesty: hra běží i z podsložky / v mobilní aplikaci (Capacitor)
  base: './',
  server: { hmr: false },
  build: { target: 'es2022', chunkSizeWarningLimit: 2500 },
});
