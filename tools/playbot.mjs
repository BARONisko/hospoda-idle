// Robot-hráč: nová hra, projde návod (ťuká na šipku) a pak N minut náhodně ťuká prstem po celé obrazovce
// (hospoda, karty, menu, lišty, vyskakovací okna). Hlásí chyby v konzoli a zaseknutí (nic nejde ťuknout).
// Spuštění (vite na 5177): node tools/playbot.mjs [minuty=3] [jazyk=cs]
import { chromium } from 'playwright-core';
const mins = Number(process.argv[2] ?? 3), lang = process.argv[3] ?? 'cs';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errs = new Map();
const err = (m) => errs.set(m, (errs.get(m) ?? 0) + 1);
p.on('pageerror', (e) => err(e.message));
p.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && err(m.text()));
await p.goto('http://localhost:5177/');
await p.evaluate((l) => { localStorage.clear(); localStorage.setItem('pubidle_lang', l); }, lang);
await p.goto('http://localhost:5177/');
await p.waitForTimeout(2000);
let reloads = 0;
// stránka se může znovu načíst (jazyk, začít znovu) → počkat na hru
const S = async (fn) => {
  for (let i = 0; i < 40; i++) {
    try {
      const ok = await p.evaluate(() => !!window.game?.scene?.getScene('Pub')?.d);
      if (ok) return await p.evaluate(`(${fn})(game.scene.getScene('Pub'))`);
    } catch { /* načítá se */ }
    if (i === 0) reloads++;
    await p.waitForTimeout(500);
  }
  throw new Error('hra se nenačetla');
};
const sc = 405 / 540;
const tapGame = (x, y) => p.touchscreen.tap(x * sc, y * sc);
// všechny viditelné dotykové zóny (střed) – robot ťuká hlavně na ně, občas kamkoli
const zones = () => S((s) => s.children.list.filter((o) => o.type === 'Zone' && o.visible && o.input?.enabled).map((z) => [z.x + z.width / 2, z.y + z.height / 2]).filter(([x, y]) => x > 0 && x < 540 && y > 0 && y < 960));
const end = Date.now() + mins * 60_000;
let taps = 0, stuck = 0, last = '';
const t0 = await S((s) => ({ coins: s.d.coins, tut: s.d.tut }));
while (Date.now() < end) {
  const z = await zones();
  if (!z.length) {
    stuck++;
    await tapGame(270, 480);
  } else if (Math.random() < 0.85) {
    const [x, y] = z[Math.floor(Math.random() * z.length)];
    await tapGame(x, y);
  } else await tapGame(Math.random() * 540, Math.random() * 960);
  taps++;
  await p.waitForTimeout(60 + Math.random() * 120);
  // občas přeskočit den (noc, liga, truhla, offline okno)
  if (taps % 400 === 0) await S((s) => { s.d.at = Date.now() - 3 * 3600_000; s.offline(); });
  if (taps % 250 === 0) {
    const st = await S((s) => ({ coins: Math.round(s.d.coins), lvl: s.d.klvl, pubs: s.d.pubs.length, tut: s.d.tut, tab: s.tab, gems: s.d.gems }));
    const line = JSON.stringify(st);
    if (line !== last) console.log(`ťuků ${taps}:`, line);
    last = line;
  }
}
const t1 = await S((s) => ({ coins: s.d.coins, tut: s.d.tut, earned: s.d.earned, nan: [s.d.coins, s.d.bones, s.d.krigle, s.d.gems, s.d.earned].some((v) => v !== undefined && !Number.isFinite(v)) }));
await p.screenshot({ path: 'tools/_tmp/playbot-end.png' });
await b.close();
console.log(`\nnové načtení stránky ${reloads}×, ťuků ${taps}, bez dotykových míst ${stuck}×, návod ${t0.tut} → ${t1.tut}, vyděláno ${Math.round(t1.earned)}${t1.nan ? ', CHYBA: NaN/Infinity v uložení!' : ''}`);
for (const [m, n] of errs) console.log(`CHYBA ${n}×: ${m.slice(0, 200)}`);
console.log(errs.size || t1.nan ? 'NALEZENY CHYBY' : 'bez chyb');
