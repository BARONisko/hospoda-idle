// Roční uložení: vyrobí uložení hráče po ~roce hraní (plný strom, talismany, liga, 3 hospody, velká čísla)
// a změří načtení, výkon (zpomalené CPU) a hledá NaN / Infinity / undefined v textech všech částí menu.
// Spuštění (vite na 5177): node tools/rocni-ulozeni.mjs [mult=1] [cpu=4]  (mult = posune čísla o 10^mult… pro zátěž)
import { chromium } from 'playwright-core';
import fs from 'fs';
const EXP = Number(process.argv[2] ?? 0), CPU = Number(process.argv[3] ?? 4), LVL = Number(process.env.LVL ?? 900);
const OUT = 'tools/_tmp/rok';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'cs-CZ' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errs.push(m.text()));
const U = 'http://localhost:5177/';
await p.goto(U);
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('pubidle_lang', 'cs'); });
await p.goto(U + '?pubs=3'); await p.waitForTimeout(3000);
const raw = await p.evaluate(async ({ EXP, LVL }) => {
  const s = game.scene.getScene('Pub'), d = s.d;
  const T = await import('/src/core/skilltree.ts'), TA = await import('/src/core/talisman.ts'), E = await import('/src/core/economy.ts');
  const G = await import('/src/core/goals.ts'), DA = await import('/src/core/darts.ts'), BR = await import('/src/core/brewery.ts');
  const now = Date.now(), X = 10 ** EXP;
  d.tut = -1; d.nightInfo = true; d.guideQ = []; d.at = now - 3 * 3600_000;
  d.coins = 3.2e22 * X; d.earned = 4.1e25 * X; d.run = 7.7e23 * X; d.krigle = 2400; d.kSpent = 9100;
  d.stats = { tips: 186000, levels: 410000, events: 21000, prestiges: 260 };
  for (const p of d.pubs) {
    for (const st of E.STATIONS) p.st[st.id] = { lvl: LVL + Math.floor(Math.random() * 120), auto: true, prog: Math.random() };
    p.mgr = true; p.w = [{ s: 20, t: 3, m: 10, xp: 9e6 }, { s: 18, t: 3, m: 9, xp: 8e6 }, { s: 15, t: 2, m: 8, xp: 7e6 }];
  }
  d.kup = Object.fromEntries(E.KRIGL_SHOP.map((k) => [k.id, k.max ?? 60]));
  d.skills = T.TREE.map((n) => n.id); d.xp = 9e8; d.klvl = 650; d.sk2 = d.sk3 = true;
  d.talis = Object.fromEntries(TA.TALISMANS.map((x) => [x.id, 40]));
  d.oss = Object.fromEntries(TA.OSSUARY.map((x) => [x.stat, 80])); d.ossV = 2; d.ossRolls = 900;
  d.bones = 4.4e9 * X; d.bup = { speed: 40, amt: 40 };
  d.decor = E.DECOR.map((x) => x.id);
  d.ach = G.ACHIEVEMENTS.map((a) => a.id); d.seen = Object.keys(G.GUEST_NAMES);
  d.loy = Object.fromEntries(Object.keys(G.GUEST_NAMES).map((k) => [k, 60000])); d.gxp = 3e6;
  d.stars = {}; for (const a of [1, 2, 3]) for (const st of E.STATIONS) d.stars[`${a}_${st.id}`] = 5;
  d.mast = Object.fromEntries(E.STATIONS.map((st) => [st.id, 3.1e7]));
  d.leagueHist = Array.from({ length: 52 }, (_, i) => [1 + (i % 5), i % 3 > 0]);
  d.brew = { ...BR.newBrew(), lvl: 320, stock: 40 };
  d.darts = { ...DA.newDarts(), pts: 9e6, legs: 4000, up: { rate: 30, cap: 30, auto: 1 } };
  d.coll = { 1: { spd: 50, amt: 5 }, 2: { spd: 50, amt: 5 }, 3: { spd: 50, amt: 5 } };
  d.gems = 41000; d.own = []; d.vis = { a: 400 }; d.dn = { lvl: 30, sw: true, v2: true };
  d.temple = { ...(d.temple ?? {}), wk: '', hp: 1, boss: 140, ten: 5e5, lv: { 1: 140, 2: 120, 3: 90, 4: 60, 5: 30 }, diff: 5, maxD: 5 };
  return JSON.stringify(d);
}, { EXP, LVL });
fs.writeFileSync(`${OUT}/rok${EXP}.json`, raw);
console.log('velikost uložení', (raw.length / 1024).toFixed(1), 'KB');
// zpomalený telefon
const cdp = await ctx.newCDPSession(p);
await p.evaluate((r) => { window.onbeforeunload = null; localStorage.setItem('pubidle_save_v1', r); localStorage.setItem('pubidle_opts', JSON.stringify({ sv: 1, mv: 1 })); }, raw);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
const t0 = Date.now();
await p.goto(U);
await p.waitForFunction(() => window.game?.scene?.getScene('Pub')?.d?.pubs?.length === 3 && game.loop.frame > 5, null, { timeout: 60000 });
console.log(`načtení se ${CPU}× pomalejším CPU: ${Date.now() - t0} ms`);
await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/rok${EXP}-start.png` });
// zavřít okno offline
await p.evaluate(() => game.scene.getScene('Pub').awayClose?.());
// FPS a JS paměť po minutě
const perf = async (ms) => p.evaluate(async (ms) => { const f0 = game.loop.frame, t0 = performance.now(); let worst = 0, last = t0; await new Promise((r) => { const tick = () => { const t = performance.now(); worst = Math.max(worst, t - last); last = t; if (t - t0 < ms) requestAnimationFrame(tick); else r(); }; requestAnimationFrame(tick); }); return { fps: Math.round(((game.loop.frame - f0) * 1000) / (performance.now() - t0)), worstFrameMs: Math.round(worst), heapMB: Math.round((performance.memory?.usedJSHeapSize ?? 0) / 1e6), objs: game.scene.getScene('Pub').children.list.length }; }, ms);
console.log('po startu', JSON.stringify(await perf(10000)));
// projít menu a hledat rozbitá čísla
const PARTS = ["s.openShop('home',false);s.openShop('menu',false)", "s.shopSub='up';s.openShop('shop',false)", "s.shopSub='decor';s.openShop('shop',false)", "s.shopSub='bones';s.openShop('shop',false)", ...['tasks','book','krigl','temple','brew','talis','keeper','league','daynight','darts','coll','opts','special','chest','help'].map((k) => `s.openShop('${k}',false)`)];
const bad = new Set();
for (const [i, js] of PARTS.entries()) {
  try {
    await p.evaluate(`(()=>{const s=game.scene.getScene('Pub');${js}})()`);
  } catch (e) { bad.add('chyba ' + js + ': ' + e.message.slice(0, 120)); }
  await p.waitForTimeout(700);
  const txts = await p.evaluate(() => { const out = []; const walk = (l) => l.forEach((o) => { if (o.type === 'Text' && o.visible) out.push(o.text); if (o.list) walk(o.list); }); for (const sc of game.scene.getScenes(true)) walk(sc.children.list); return out; });
  for (const x of txts) if (/NaN|Infinity|undefined|∞|null/.test(x)) bad.add(x.replace(/\n/g, ' ').slice(0, 80));
  await p.screenshot({ path: `${OUT}/rok${EXP}-menu${i}.png` });
}
console.log('podezřelé texty:', bad.size ? [...bad] : 'žádné');
await p.evaluate(() => game.scene.getScene('Pub').openShop?.('home', false));
// hrát ještě minutu: ťukání do hospody a nákupy max
await p.evaluate(() => { const s = game.scene.getScene('Pub'); window.__buy = setInterval(() => { try { s.mode = 'max'; } catch {} }, 1000); });
console.log('po 60 s', JSON.stringify(await perf(60000)));
const d = await p.evaluate(() => { const d = game.scene.getScene('Pub').d; return { coins: d.coins, earned: d.earned, krigle: d.krigle, bad: Object.entries(d).filter(([, v]) => typeof v === 'number' && !Number.isFinite(v)).map(([k]) => k) }; });
console.log('stav', JSON.stringify(d));
console.log('chyby v konzoli:', errs.length ? [...new Set(errs)].slice(0, 10) : 'žádné');
await b.close();
