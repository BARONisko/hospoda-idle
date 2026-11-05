import { defineConfig } from 'vite';

export default defineConfig({
  // relativní cesty: hra běží i z podsložky / v mobilní aplikaci (Capacitor)
  base: './',
  server: { hmr: false },
  build: { target: 'es2022', chunkSizeWarningLimit: 2500 },
});
