import { chromium } from 'playwright-core';
import fs from 'fs';
const out = process.argv[2], list = process.argv.slice(3);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage();
await p.goto('http://localhost:5177/'); await p.waitForTimeout(3000);
const r = await p.evaluate((list) => list.map((kf) => {
  const [k, f] = kf.split('/'); const fr = game.textures.getFrame(k, f ?? '__BASE'); if (!fr) return [kf, null];
  const c = document.createElement('canvas'); c.width = fr.cutWidth; c.height = fr.cutHeight;
  c.getContext('2d').drawImage(fr.source.image, fr.cutX, fr.cutY, fr.cutWidth, fr.cutHeight, 0, 0, fr.cutWidth, fr.cutHeight);
  return [kf, c.toDataURL()];
}), list);
for (const [kf, u] of r) { if (!u) { console.log('chybí', kf); continue; } fs.writeFileSync(`${out}/${kf.replace('/', '_')}.png`, Buffer.from(u.split(',')[1], 'base64')); }
await b.close();
