// Sestaví offline verzi a zabalí ji do zipu se složkou „PUB-Idle“ (index.html + ikona + návod).
// Výsledek: dist/PUB-Idle.zip (na GitHub Pages ke stažení vedle hry).
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const run = (c) => execSync(c, { stdio: 'inherit' });
run('npx vite build --config vite.offline.config.ts');
const dir = 'dist-offline/PUB-Idle';
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
// JS a CSS vložit přímo do index.html (moduly ze souborů prohlížeč z disku nenačte), manifest pryč
let html = fs.readFileSync('dist-offline/index.html', 'utf8');
html = html.replace(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g, (_m, f) => {
  const code = fs.readFileSync(`dist-offline/${f}`, 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${code}</script>`;
});
html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g, (_m, f) => `<style>${fs.readFileSync(`dist-offline/${f}`, 'utf8')}</style>`);
html = html.replace(/<link rel="manifest"[^>]*>\s*/, '');
fs.writeFileSync(`${dir}/index.html`, html);
fs.copyFileSync('public/icon.png', `${dir}/icon.png`);
fs.writeFileSync(
  `${dir}/JAK-SPUSTIT.txt`,
  'P.U.B. Idle – Pajzl Tycoon (offline)\r\n\r\nOtevři soubor index.html dvojklikem (Chrome, Edge, Firefox, Safari).\r\n' +
    'Hra běží bez internetu. Postup se ukládá v prohlížeči – zvlášť od verze na webu.\r\n\r\n' +
    'Open index.html with a double click. The game runs offline; progress is saved in the browser.\r\n',
);
fs.mkdirSync('dist', { recursive: true });
fs.rmSync('dist/PUB-Idle.zip', { force: true });
run('cd dist-offline && zip -qr ../dist/PUB-Idle.zip PUB-Idle');
console.log('hotovo: dist/PUB-Idle.zip', (fs.statSync('dist/PUB-Idle.zip').size / 1e6).toFixed(1), 'MB');
