// Sestaví simulaci ligy (esbuild) s náhradou i18n a spustí ji: node tools/sim/league.mjs
import { build } from 'esbuild';
const out = 'tools/_tmp/league.mjs';
await build({
  entryPoints: ['tools/sim/league.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: out,
  logLevel: 'error',
  plugins: [{ name: 'i18n', setup(b) { b.onResolve({ filter: /\/i18n$/ }, () => ({ path: 'i18n', namespace: 'stub' })); b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const t = (s) => s;' })); } }],
});
await import('../../' + out);
