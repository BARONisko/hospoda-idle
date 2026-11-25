// Test Google Play Her (předstíraný Google Play ?pg=1): obnova z cloudu, volba při konfliktu, nahrávání, žebříčky.
// Spuštění (vite na 5177): node tools/test-playgames.mjs
import { chromium } from 'playwright-core';
const U = 'http://localhost:5177/?pg=1';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
let fail = 0;
const ok = (c, m) => (console.log((c ? 'OK   ' : 'CHYBA') + ' ' + m), c || fail++);
const mk = (earned, kr) => JSON.stringify({ v: 2, coins: 5, earned, run: 0, krigle: kr, kSpent: 0, klvl: 3, pubs: [{ act: 1, st: { tap: { lvl: 5, auto: false, prog: 0 } } }], up: [], stats: { tips: 0, levels: 0, events: 0, prestiges: 0 }, daily: { day: '', tasks: [] }, ach: [], seen: [], tut: -1, at: Date.now() });
async function run(local, cloud, pick) {
  const ctx = await b.newContext({ viewport: { width: 405, height: 720 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(([l, c]) => {
    if (sessionStorage.getItem('x')) return;
    sessionStorage.setItem('x', '1');
    localStorage.clear();
    localStorage.setItem('pubidle_lang', 'cs');
    if (l) localStorage.setItem('pubidle_save_v1', l);
    if (c) localStorage.setItem('pubidle_pg_fake_cloud', JSON.stringify({ data: c, at: Date.now() - 3600e3 }));
  }, [local, cloud]);
  await p.goto(U);
  if (pick) {
    await p.waitForSelector('#pg-ask', { timeout: 8000 });
    await p.click(`#pg-ask button:nth-of-type(${pick === 'cloud' ? 1 : 2})`);
  }
  await p.waitForFunction(() => window.game?.scene?.getScene('Pub')?.d, null, { timeout: 15000 });
  await p.waitForTimeout(1500);
  // uložení (jako odchod ze hry) → nahrání do cloudu
  await p.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await p.evaluate(async () => { const s = game.scene.getScene('Pub'); const m = await import('/src/core/save.ts'); m.store(s.d, true); });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({ earned: game.scene.getScene('Pub').d.earned, cloud: JSON.parse(JSON.parse(localStorage.getItem('pubidle_pg_fake_cloud') ?? 'null')?.data ?? 'null')?.earned, lb: localStorage.getItem('pubidle_pg_fake_lb_krigle') }));
  await ctx.close();
  return { ...r, errs };
}
let r = await run(null, mk(5e9, 40));
ok(r.earned === 5e9, 'nový telefon bez hry: načte se z cloudu sám');
r = await run(mk(1e6, 2), mk(5e9, 40), 'cloud');
ok(r.earned === 5e9 && r.cloud === 5e9, 'cloud dál → hráč vybral cloud');
r = await run(mk(1e6, 2), mk(5e9, 40), 'local');
ok(r.earned === 1e6 && r.cloud === 1e6, 'cloud dál → hráč vybral telefon, cloud přepsán');
r = await run(mk(9e9, 50), mk(5e9, 40));
ok(r.earned === 9e9 && r.cloud === 9e9 && r.lb === '50', 'telefon dál → bez ptaní, nahráno do cloudu a krígly do žebříčku');
r = await run(mk(9e9, 50), null);
ok(r.cloud === 9e9 && !r.errs.length, 'prázdný cloud → nahráno, bez chyb ' + r.errs.join(' | '));
await b.close();
console.log(fail ? `${fail} chyb` : 'vše v pořádku');
process.exit(fail ? 1 : 0);
