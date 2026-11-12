// Čistý výřez hospody (bez lišty úkolu) pro makety UI: node pubview.mjs <out.png>
import { chromium } from 'playwright-core';
const out = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'cs-CZ' });
const U = 'http://localhost:5177/?night=0';
await p.goto(U); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('pubidle_lang', 'cs'); }); await p.goto(U); await p.waitForTimeout(2500);
await p.evaluate(() => { const s = game.scene.getScene('Pub'), d = s.d; d.tut = -1; d.nightInfo = true; d.guideQ = []; d.guides = ['night']; d.ntfAsk = true; d.menuOpen = undefined;
  d.coins = 3.48e6; d.earned = 9.1e6; d.run = 2e6; d.gems = 120; d.klvl = 9; d.bones = 340;
  d.pubs[0].st = { tap: { lvl: 87, auto: true, prog: 0.3 }, kitchen: { lvl: 54, auto: true, prog: 0.6 }, cellar: { lvl: 41, auto: true, prog: 0.1 }, dice: { lvl: 22, auto: true, prog: 0.5 } };
  d.pubs[0].w = [{ s: 1, t: 1, m: 0, xp: 5e4 }, { s: 1, t: 0, m: 0, xp: 5e4 }, { s: 0, t: 0, m: 0, xp: 5e4 }]; d.decor = ['portrait', 'boar', 'piano'];
  d.q = []; let g = 0; while (s.qCur() && g++ < 200) d.q.push(s.qCur().id);
  localStorage.setItem('pubidle_save_v1', JSON.stringify(d)); });
await p.goto(U); await p.waitForTimeout(6000);
const r = await p.evaluate(() => { const c = game.scene.getScene('Pub').views[0].cam, K = 405 / 540; return { x: c.x * K, y: c.y * K, w: c.width * K, h: c.height * K }; });
console.log(JSON.stringify(r));
await p.screenshot({ path: out, clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
await p.screenshot({ path: out.replace('.png', '-full.png') });
await b.close();
