// Vypíše texty z t('…') ve zdrojích, které chybí v překladech: node tools/i18n-missing.mjs [--json]
import fs from 'fs';
import path from 'path';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.ts$/.test(e.name) ? [path.join(d, e.name)] : []));
const keys = new Set();
for (const f of walk('src')) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\bt\(\s*(['"`])((?:\\.|(?!\1).)*)\1/gs)) if (!m[2].includes('${')) keys.add(m[2].replace(/\\n/g, '\n').replace(/\\(['"`\\])/g, '$1'));
}
const dir = 'src/i18n/locales';
const out = {};
for (const f of fs.readdirSync(dir)) {
  const loc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  out[f.replace('.json', '')] = [...keys].filter((k) => !(k in loc));
}
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else for (const [l, m] of Object.entries(out)) console.log(`${l}: chybí ${m.length} z ${keys.size}`);
