// Zkušebna – bot pro P.U.B. Idle. Hraje skutečnou hru v prohlížeči bez okna (headless Chromium) přes dotyky
// jako hráč a zapisuje časovou osu (timeline.json) + snímky obrazovky (shots/). Herní čas běží zrychleně:
// smyčka Phaseru se uspí a bot ji posouvá sám (game.headlessStep po 250 ms), Date.now se posouvá s ní.
// Hráčův save se nečte: každý běh začíná localStorage.clear() v čisté stránce.
//
// Spuštění (vite na 5177):  node tools/zkusebna/bot.mjs <povaha> <složka běhu> [minuty herního času] [jazyk]
// Povahy: dlouhy (jako běžný, 600 min – kdy dojdou novinky), novacek (15 min, vše přes obrazovku, snímek po 30 s), bezny (180 min, hygiena, když se vyplatí),
//         slaby (240 min, hraje 8 min, pak 80 min pryč; ťuká na cokoli, úkoly skoro nečte, hygiena 2 min po tom, co jde).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const [persona = 'novacek', outDir = 'tools/_tmp/zkusebna', minsArg, lang = 'cs'] = process.argv.slice(2);
const P = {
  novacek: { min: 15, think: 1.5, shotEvery: 30, maxShots: 60, prestige: 'never', session: 0, away: 0, quests: 1 },
  bezny: { min: 180, think: 2, shotEvery: 600, maxShots: 40, prestige: 'worth', session: 0, away: 0, quests: 1 },
  dlouhy: { min: 600, think: 2, shotEvery: 3600, maxShots: 15, prestige: 'worth', session: 0, away: 0, quests: 1 },
  slaby: { min: 240, think: 4, shotEvery: 1800, maxShots: 25, prestige: 'late', session: 8 * 60, away: 80 * 60, quests: 0.3 },
}[persona];
if (!P) throw new Error('neznámá povaha ' + persona);
const MINS = Number(minsArg ?? P.min);
const URL = process.env.ZK_URL ?? 'http://localhost:5177/';
const shotsDir = path.join(outDir, 'shots');
fs.mkdirSync(shotsDir, { recursive: true });
const name = persona === 'novacek' ? 'timeline.json' : `timeline_${persona}.json`;

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.addInitScript(() => {
  const o = Date.now.bind(Date);
  window.__skew = 0;
  Date.now = () => o() + window.__skew;
});
const errors = new Map();
// ZK_PROF: kde bot tráví skutečný čas (evaluate / tap / screenshot), výpis po 200 tazích
const PROF = { ev: 0, evN: 0, tap: 0, tapN: 0, shot: 0 };
if (process.env.ZK_PROF) {
  const ev = p.evaluate.bind(p), tp = p.touchscreen.tap.bind(p.touchscreen), sc = p.screenshot.bind(p);
  p.evaluate = async (...a) => { const t = Date.now(); try { return await ev(...a); } finally { PROF.ev += Date.now() - t; PROF.evN++; } };
  p.touchscreen.tap = async (...a) => { const t = Date.now(); try { return await tp(...a); } finally { PROF.tap += Date.now() - t; PROF.tapN++; } };
  p.screenshot = async (...a) => { const t = Date.now(); try { return await sc(...a); } finally { PROF.shot += Date.now() - t; } };
}
p.on('pageerror', (e) => errors.set(e.message, (errors.get(e.message) ?? 0) + 1));
p.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.set(m.text(), (errors.get(m.text()) ?? 0) + 1));
await p.goto(URL);
await p.evaluate((l) => { localStorage.clear(); localStorage.setItem('pubidle_lang', l); }, lang);
await p.goto(URL);
for (let i = 0; i < 60 && !(await p.evaluate(() => !!window.game?.scene?.getScene('Pub')?.d).catch(() => false)); i++) await p.waitForTimeout(250);
await p.waitForTimeout(1500);
await p.evaluate(() => {
  game.loop.sleep();
  window.__tm = game.loop.now;
  window.__step = (sec) => {
    for (let i = 0; i < Math.round(sec * 4); i++) {
      window.__skew += 250;
      window.__tm += 250;
      game.headlessStep(window.__tm, 250);
    }
  };
});

// tlačítka hry: zóna → tlačítko (bot pak ví, které svítí); nabídky k zaplacení se počítají
const patch = () => p.evaluate(() => {
  const s = game.scene.getScene('Pub');
  if (!s || s.__zk) return;
  s.__zk = true;
  window.__offers = window.__offers ?? [];
  const ob = s.btn.bind(s);
  s.btn = (...a) => { const b = ob(...a); b.zone.__btn = b; return b; };
  const op = s.offerPop.bind(s);
  s.offerPop = (id) => { window.__offers.push(String(id)); return op(id); };
});
await patch();

let T = 0; // herní sekundy od startu
const marks = [], samples = [];
let shots = 0, lastShotT = -1e9;
const mark = (t, kind, text = '', shot = null) => marks.push({ t: Math.round(t * 10) / 10, kind, text, shot });
const K = 405 / 540;
// před ťuknutím jeden vykreslený snímek: Phaser řadí objekty podle hloubky až při vykreslení a bez toho
// by ťuknutí do okna (hloubka 500+) spadlo do hospody pod ním
const tap = async (x, y) => {
  await p.evaluate(() => { window.__skew += 33; window.__tm += 33; game.step(window.__tm, 33); });
  // dotyk jako události v prohlížeči (touchstart/touchend na plátně), bez čekání na snímek:
  // p.touchscreen.tap po hodině hry čekal na vykreslení až 2 s na ťuk (dlouhý bot běžel skoro ve skutečném čase)
  await p.evaluate(([cx, cy]) => {
    const c = game.canvas, r = c.getBoundingClientRect();
    const mk = () => new Touch({ identifier: 1, target: c, clientX: r.left + cx, clientY: r.top + cy, pageX: r.left + cx, pageY: r.top + cy });
    const fire = (type, list) => c.dispatchEvent(new TouchEvent(type, { touches: list, targetTouches: list, changedTouches: [mk()], bubbles: true, cancelable: true }));
    fire('touchstart', [mk()]);
    window.__skew += 33; window.__tm += 33; game.step(window.__tm, 33);
    fire('touchend', []);
  }, [x * K, y * K]);
};
const step = (sec) => p.evaluate((s) => window.__step(s), sec);

async function shot(label, force = false) {
  if (shots >= P.maxShots && !force) return null;
  // vykreslit aktuální stav (smyčka spí): jeden krok s vykreslením
  await p.evaluate(() => { window.__skew += 33; window.__tm += 33; game.step(window.__tm, 33); });
  const f = `shots/${persona}_${String(++shots).padStart(3, '0')}_t${Math.round(T)}_${label.replace(/[^\w-]+/g, '_').slice(0, 40)}.png`;
  await p.screenshot({ path: path.join(outDir, f) });
  lastShotT = T;
  return f;
}

// stav hry: co je na obrazovce k ťuknutí (stejně jako tools/novy-hrac.mjs) + čísla pro časovou osu
const read = () => p.evaluate(() => {
  const s = game.scene.getScene('Pub'), d = s.d;
  if (!d || !s.sys.isActive()) return null;
  const i = d.tut ?? -1;
  const dn = s.constructor.TUT?.[i]?.done;
  const tt = s.views?.[s.sel ?? 0]?.tipTarget?.();
  const g = s.guideCur;
  let gr = null, gok = null, gtext = '';
  if (g) {
    const stp = s.guideSteps(g.id)[g.i];
    gr = stp?.at?.() ?? null;
    gtext = (stp?.head ?? '') + ' – ' + (stp?.text ?? '');
    const z = (s.guideObjs ?? []).find((o) => o.type === 'Zone');
    if (z) gok = [z.x + z.width / 2, z.y + z.height / 2];
  }
  const zc = (list) => list.filter((o) => o.type === 'Zone' && o.visible && o.input?.enabled).map((z) => [z.x + z.width / 2, z.y + z.height / 2]);
  const modal = s.children.list.filter((o) => o.type === 'Zone' && o.visible && o.input?.enabled && o.depth >= 400 && o.width < 520).map((z) => [z.x + z.width / 2, z.y + z.height / 2]);
  const sel = s.sel ?? 0, pub = d.pubs[sel];
  let afford = 0;
  const cards = s.cards.filter((c) => c.pub === sel).map((c) => {
    let price = null;
    try { price = s.offer(pub, c.def).price; } catch { /* */ }
    const ok = price != null && d.coins >= price;
    if (ok && c.buy?.visible) afford++;
    return { id: c.def.id, ok, be: !!c.buy?.enabled, se: !!c.staff?.enabled, buy: c.buy?.visible ? [c.buy.x + c.buy.w / 2, c.buy.y + c.buy.h / 2] : null, staff: c.staff?.visible ? [c.staff.x + c.staff.w / 2, c.staff.y + c.staff.h / 2] : null };
  });
  let evt = null;
  const A = s.ev?.active;
  if (A) {
    const cam = s.views[A.view]?.cam, wv = cam?.worldView;
    const tg = A.targets.filter((x) => x.spr?.active).map((x) => { const bb = x.spr.getBounds(); return [cam.x + (bb.centerX - wv.x) * cam.zoom, cam.y + (bb.centerY - wv.y) * cam.zoom]; });
    evt = { kind: A.kind, tg: tg.filter(([x, y]) => x > 0 && x < 540 && y > 0 && y < 960) };
  }
  let rate = 0;
  try { rate = s.totalRate(); } catch { /* */ }
  let kNow = 0, kMin = 1e9;
  try { kNow = s.kriglyNow(); kMin = window.__pmin?.(d.stats.prestiges) ?? 10; } catch { /* */ }
  return {
    i, dn, poor: !!s.tutPoor, r: s.tutRect ?? null, tip: tt ? [tt.x, tt.y] : null, g: g ? g.id + ':' + g.i : '', gr, gok, gtext,
    tutText: (s.tutHead?.text ?? '') + ' – ' + (s.tutBub?.text ?? ''),
    away: zc(s.awayObjs ?? []), shop: (s.shopObjs ?? []).length, modal, cards, afford, evt, menuOpen: (s.shopObjs ?? []).length > 0, tab: s.tab,
    words: s.children.list.filter((o) => o.type === 'Text' && o.visible && o.alpha > 0.2 && o.text && o.y > -20 && o.y < 980).reduce((a, o) => a + (o.text.match(/[\p{L}]{2,}/gu) ?? []).length, 0),
    offers: (window.__offers ?? []).length, wp: (s.wPanel ?? []).length, wpb: (s.wPanelBtns ?? []).map((x) => x.b).filter((b) => b.visible && b.enabled).map((b) => [b.x + b.w / 2, b.y + b.h / 2]), mode: s.mode, modeBtn: s.modeBtn?.visible ? [s.modeBtn.x + s.modeBtn.w / 2, s.modeBtn.y + s.modeBtn.h / 2] : null,
    qbtn: s.qUi?.btn?.visible ? [s.qUi.btn.x + 54, s.qUi.btn.y + 23, s.qUi.btn.label.text, s.qUi.title.text] : null,
    coins: d.coins, run: d.run, rate, kNow, pubs: d.pubs.length, pr: d.stats?.prestiges ?? 0, krigle: d.krigle ?? 0, gems: d.gems ?? 0,
    bones: d.bones ?? 0, night: !!s.night, klvl: d.klvl ?? 1, events: d.stats?.events ?? 0, ach: (d.ach ?? []).length, seen: [...(d.seen ?? [])],
    tabs: [...(d.menuOpen ?? [])], qdone: (d.q ?? []).filter((q) => q.done || q.claimed).length, qn: (d.q ?? []).length,
    up: [...(d.up ?? [])], st: d.pubs.map((pp) => Object.fromEntries(Object.entries(pp.st).map(([k, v]) => [k, [v.lvl, v.auto ? 1 : 0]]))),
    waiters: d.pubs.map((pp) => pp.w?.length ?? 0), tasks: (d.daily?.tasks ?? []).filter((x) => x.claimed).length,
  };
});

let prev = null;
const firsts = new Set();
const first = (k, text, t = T) => { if (!firsts.has(k)) { firsts.add(k); mark(t, 'first:' + k, text); return true; } return false; };
let lastSample = -1e9, lastBuyT = 0;
const lastPrices = [];

async function record(st) {
  if (!st) return;
  if (prev) {
    const spent = prev.coins + Math.max(0, st.run - prev.run) - st.coins;
    const changes = [];
    if (st.pr > prev.pr) {
      mark(T, 'prestige', `krigle=${st.krigle - prev.krigle} total=${st.krigle} pubs=${st.pubs}`);
      first('prestige', 'první hygiena');
      await patch();
      prev = st;
      return;
    }
    st.st.forEach((ps, pi) => Object.entries(ps).forEach(([k, [lvl, auto]]) => {
      const o = prev.st[pi]?.[k] ?? [0, 0];
      if (lvl > o[0]) {
        if (o[0] === 0) { changes.push(['unlock', `${pi + 1}:${k}`, lvl]); first('station:' + k, k); }
        else changes.push(['buy', `${pi + 1}:${k}`, lvl]);
      }
      if (auto && !o[1]) { changes.push(['staff', `${pi + 1}:${k}`, lvl]); first('staff', k); }
    }));
    st.up.filter((u) => !prev.up.includes(u)).forEach((u) => { changes.push(['upgrade', u, 1]); first('upgrade', u); });
    st.waiters.forEach((n, pi) => { if (n > (prev.waiters[pi] ?? 0) && prev.waiters[pi] > 0) changes.push(['waiter', `${pi + 1}`, n]); });
    if (st.pubs > prev.pubs) { mark(T, 'pub', `pubs=${st.pubs}`); first('pub:' + st.pubs, ''); }
    if (changes.length) {
      const per = spent > 0 ? spent / changes.length : 0;
      for (const [k, item, lvl] of changes) {
        mark(T, k === 'unlock' || k === 'staff' || k === 'upgrade' || k === 'waiter' ? k : 'buy', `${item} level=${lvl} price=${Math.round(per)}`);
        if (spent > 0) { first('buy', item); lastBuyT = T; lastPrices.push(per); }
      }
    }
    if (st.evt && !prev.evt) { mark(T, 'event_start', st.evt.kind); first('event:' + st.evt.kind, st.evt.kind); }
    if (st.offers > prev.offers) { mark(T, 'offer', 'nabídka k zaplacení'); first('offer', ''); }
    if (st.events > prev.events) { mark(T, 'event', `n=${st.events}`); first('event', ''); }
    if (st.ach > prev.ach) mark(T, 'ach', `n=${st.ach}`);
    if (st.klvl > prev.klvl) { mark(T, 'level', `klvl=${st.klvl}`); first('level', ''); }
    if (st.tasks > prev.tasks) mark(T, 'quest', 'denní úkol');
    if (st.qdone > prev.qdone || (st.qn < prev.qn)) mark(T, 'quest', 'úkol');
    st.tabs.filter((x) => !prev.tabs.includes(x)).forEach((x) => { if (T < 5) firsts.add('tab:' + x); else { mark(T, 'tab', x); first('tab:' + x, x); } });
    st.seen.filter((x) => !prev.seen.includes(x)).forEach((x) => { mark(T, 'guest', x); first('guest', x); });
    if (st.night !== prev.night) { mark(T, st.night ? 'night' : 'day', ''); if (st.night) first('night', ''); }
    if (st.i !== prev.i) { mark(T, 'tut', `${prev.i}→${st.i}`); if (st.i < 0) first('tutorial_done', ''); }
    if (st.g && st.g !== prev.g) mark(T, 'guide', st.g + ' ' + st.gtext.slice(0, 80));
    if (st.run > prev.run && prev.run === 0) first('coins', 'první coins');
  } else {
    // stav na startu se počítá jako známý
    st.tabs.forEach((x) => firsts.add('tab:' + x));
  }
  if (T - lastSample >= 5) {
    lastSample = T;
    samples.push({ t: Math.round(T), coins: st.coins, run: st.run, rate: st.rate, afford: st.afford, klvl: st.klvl, pubs: st.pubs, prestiges: st.pr, krigle: st.krigle, gems: st.gems, bones: st.bones, night: st.night, kNow: st.kNow, words: st.words, menu: st.menuOpen });
  }
  prev = st;
}

// prahy hygieny bez importu: zjistí se z tlačítka (askPrestige odmítne pod prahem) – použijeme kriglyNow a tvar z economy
await p.evaluate(() => { window.__pmin = (n) => (n === 0 ? 4 : Math.max(6, Math.ceil(6 * 1.07 ** (Math.min(n, 70) - 14)))); });

// Menu jako hráč: ťukne na Menu, pak na dlaždici (kam ukazuje i průvodce), v okně ťuká na tlačítka, která svítí
// (nikdy ne na platbu skutečnými penězi – Speciální nabídku si jen prohlédne), pak zavře. První návštěva = snímek.
const seenTab = new Set();
let afterBuyShot = false;
let menuIdx = 0, lastMenuT = 0;
async function menuVisit(maxTaps) {
  const tiles = await p.evaluate(() => {
    const s = game.scene.getScene('Pub');
    s.closeShop(); s.openMenu();
    const r = s.menuTiles();
    return r.tiles.map(r.keyOf).filter((k) => !s.tileLock?.(k));
  });
  await step(0.3);
  // Fable (3. běh): snímek mřížky Menu (karta „Až se vrátíš“, silueta další hospody) – jednou před 1. hygienou a jednou po 3.
  const pr = await p.evaluate(() => game.scene.getScene('Pub').d.stats.prestiges);
  const gk = 'grid_' + (pr >= 3 ? 'b' : 'a');
  if (!seenTab.has(gk)) { seenTab.add(gk); await shot('menu_mrizka', true); }
  const pick = ['obchod', 'ukoly', ...tiles.filter((k) => k !== 'opts')]; // spodní lišta: Obchod (vylepšení ×3), Úkoly
  if (!pick.length) { await p.evaluate(() => game.scene.getScene('Pub').closeShop()); return; }
  const k = pick[menuIdx++ % pick.length];
  const at = await p.evaluate((k) => {
    const s = game.scene.getScene('Pub');
    if (k === 'obchod' || k === 'ukoly') { s.closeShop(); const b = s.navBtns[k === 'obchod' ? 1 : 2]; return [b.x, b.y, b.w, b.h]; }
    try { return s.guideSteps('tile:' + k)[1].at(); } catch { return null; }
  }, k);
  if (!at) { await p.evaluate(() => game.scene.getScene('Pub').closeShop()); return; }
  await tap(at[0] + at[2] / 2, at[1] + at[3] / 2);
  await step(0.5);
  let f = null;
  const w = (await read()).words;
  if (!seenTab.has(k)) { seenTab.add(k); first('screen:' + k, k); f = await shot('menu_' + k, true); }
  // Chrám a Šipky jsou vlastní scény: vyfotit a odejít tlačítkem Zpět (dřív dlouhý bot zůstal v Chrámu 2 h)
  const other = await p.evaluate(() => ['Temple', 'Darts'].find((n) => game.scene.isActive(n)) ?? null);
  if (other) {
    if (!f) f = await shot('scena_' + other.toLowerCase(), true);
    await p.evaluate((n) => {
      const sc = game.scene.getScene(n);
      try { if (n === 'Temple') sc.lobby?.(); } catch { /* */ }
      try { sc.leave?.(); } catch { /* */ }
      if (game.scene.isActive(n)) { game.scene.stop(n); game.scene.wake('Pub'); game.scene.resume('Pub'); }
    }, other);
    await step(0.5);
    mark(T, 'menu', `${k} scene=${other} words=${w}`, f);
    return;
  }
  // Speciální nabídka: projít i záložky Diamanty a Štamgast (balíčky, předplatné) a každou jednou vyfotit; nic se nekupuje
  if (k === 'special') {
    for (const sub of ['gems', 'pass']) {
      await p.evaluate((sb) => { const sc = game.scene.getScene('Pub'); sc.spSub = sb; sc.openShop('special', false); }, sub);
      await step(0.3);
      if (!seenTab.has('special_' + sub)) { seenTab.add('special_' + sub); first('screen:special_' + sub, sub); await shot('menu_special_' + sub, true); }
    }
    await p.evaluate(() => { game.scene.getScene('Pub').spSub = 'offer'; });
  }
  let bought = 0;
  if (k !== 'special' && k !== 'league') {
    for (let i = 0; i < maxTaps; i++) {
      const b = await p.evaluate(() => {
        const s = game.scene.getScene('Pub');
        const z = (s.shopObjs ?? []).filter((o) => o.type === 'Zone' && o.visible && o.input?.enabled && o.__btn?.enabled && o.__btn.visible && o.y > 120)
          .filter((o) => !/€|Kč|\$|zł|£|USD|EUR|reklam|video|Smazat|jazyk/i.test(o.__btn.label?.text ?? ''));
        if (!z.length) return null;
        const o = z[Math.floor(Math.random() * z.length)];
        return [o.x + o.width / 2, o.y + o.height / 2, o.__btn.label?.text ?? ''];
      });
      if (!b) break;
      await tap(b[0], b[1]);
      await step(0.4);
      bought++;
      if (!(await p.evaluate(() => (game.scene.getScene('Pub').shopObjs ?? []).length))) break; // okno se zavřelo
    }
  }
  mark(T, 'menu', `${k} taps=${bought} words=${w}`, f);
  await p.evaluate(() => { const s = game.scene.getScene('Pub'); s.closeShop(); s.awayClose?.(); });
  await step(0.3);
}

let kReadyT = null, stuckMarkT = -1e9; // běžný hráč: první hygiena minutu po tom, co jde (cíl „do hygieny 100 %“ na obrazovce)
let tick = 0, lastQ = 0, taps = 0, stuck = 0, sessionStart = 0;
const lastFirstShot = new Set();
const end = MINS * 60;
const t0 = Date.now();
await record(await read());
await shot('start', true);
while (T < end) {
  let st = null;
  const _t0 = Date.now();
  try { st = await read(); } catch { st = null; }
  if (!st) { await step(1); T += 1; continue; }
  await record(st);
  // Fable (3. běh): jednou snímek hned po běžném nákupu (vyletí +X/s, pruh zezelená)
  if (!afterBuyShot && T > 600 && lastBuyT === T) { afterBuyShot = true; await step(0.3); await shot('po_nakupu', true); }
  // Chrám / Šipky otevřené jinudy než z Menu (např. průvodce novinkou tile:temple): podívat se a odejít (dřív bot zůstal v Chrámu do konce)
  const other = await p.evaluate(() => ['Temple', 'Darts'].find((n) => game.scene.isActive(n)) ?? null);
  if (other) {
    const key = other === 'Temple' ? 'temple' : 'darts';
    if (!seenTab.has(key)) { seenTab.add(key); first('screen:' + key, key); }
    await shot('scena_' + key, true);
    await step(3);
    T += 3;
    await p.evaluate((n) => {
      const sc = game.scene.getScene(n);
      try { if (n === 'Temple') sc.lobby?.(); } catch { /* */ }
      try { sc.leave?.(); } catch { /* */ }
      if (game.scene.isActive(n)) { game.scene.stop(n); game.scene.wake('Pub'); game.scene.resume('Pub'); }
    }, other);
    await step(0.5);
    mark(T, 'scene_leave', other);
    continue;
  }
  // snímky: pravidelně + při prvních výskytech
  const newFirst = marks.filter((m) => m.kind.startsWith('first:') && !lastFirstShot.has(m.kind));
  for (const m of newFirst) { lastFirstShot.add(m.kind); if (!m.shot) m.shot = await shot(m.kind); }
  if (T - lastShotT >= P.shotEvery) await shot('t' + Math.round(T));
  // přestávka slabého hráče: zavře aplikaci, za 80 min se vrátí (offline výdělek)
  if (P.session && T - sessionStart >= P.session && st.i < 0) {
    const before = st.coins;
    mark(T, 'leave', `coins=${Math.round(before)} useful=${Math.round(lastPrices.slice(-5).sort((a, b) => a - b)[Math.min(2, lastPrices.slice(-5).length - 1)] ?? 0)}`);
    await p.evaluate((ms) => { window.__skew += ms; game.scene.getScene('Pub').offline(); }, P.away * 1000);
    T += P.away;
    await step(0.5);
    const after = await read();
    mark(T, 'offline', `secs=${P.away} coins=${Math.round(after?.coins ?? 0)} before=${Math.round(before)} cheapest=${Math.round(await p.evaluate(() => { const s = game.scene.getScene('Pub'); const d = s.d; let m = Infinity; d.pubs.forEach((pp) => s.stations().forEach((def) => { try { m = Math.min(m, s.offer(pp, def).price); } catch { /* */ } })); return Number.isFinite(m) ? m : 0; }))}`, await shot('navrat'));
    sessionStart = T;
    continue;
  }
  tick++;
  if (process.env.ZK_PROF && tick % 200 === 0) { console.log('PROF', Math.round(T), JSON.stringify(PROF), await p.evaluate(() => { const s = game.scene.getScene('Pub'); return [s.children.list.length, s.tweens.getTweens?.().length, s.time._active?.length, game.loop.running, game.loop.sleeping]; })); for (const k in PROF) PROF[k] = 0; }
  // pojistka: má na nákup, a přesto 3 min nic nekoupil → zapsat (zaseknutí bota nebo hry, se snímkem)
  if (persona !== 'slaby' && st.afford > 0 && T - lastBuyT > 180 && T - stuckMarkT > 600 && st.i < 0) { stuckMarkT = T; mark(T, 'bot_stuck', `afford=${st.afford} g=${st.g} away=${st.away.length} wp=${st.wp}`, await shot('zasek', true)); }
  if (process.env.ZK_DEBUG && T - lastBuyT > 120 && tick % 20 === 0) console.log(Math.round(T), JSON.stringify({ i: st.i, g: st.g, away: st.away, modal: st.modal, shop: st.shop, evt: st.evt, q: st.qbtn, afford: st.afford, cards: st.cards }).slice(0, 600));
  const r = Math.random();
  let did = true;
  if (st.i >= 0) { // návod
    const useTip = st.dn === 'tip' || (st.dn === 'buy:kitchen' && st.poor);
    if (useTip && st.tip) await tap(...st.tip);
    else if (st.r) await tap(st.r[0] + st.r[2] / 2, st.r[1] + st.r[3] / 2);
    else if (st.tip) await tap(...st.tip);
    else did = false;
  } else if (st.away.length) await tap(...st.away[st.away.length - 1]); // okno (návštěvník, hygiena…) zavřít dřív než průvodce pod ním
  else if (st.g && (st.gr || st.gok) && tick % 4 !== 0) { // průvodce; každý 4. tah hraje dál (průvodce „ťukni na bublinu“ ve dne nemá bublinu)
    if (st.gr) await tap(st.gr[0] + st.gr[2] / 2, st.gr[1] + st.gr[3] / 2); else await tap(...st.gok);
  }
  else if (st.modal.length) { const z = st.modal[st.modal.length - 1]; await tap(z[0], z[1]); }
  else if (st.wp) { // panel číšníka: utratit body, pak zavřít (✕)
    if (st.wpb.length) await tap(...st.wpb[0]); else await p.evaluate(() => game.scene.getScene('Pub').closeWaiter());
  }
  else if (st.evt?.tg.length && Math.random() < (persona === 'slaby' ? 0.5 : 0.9)) await tap(...st.evt.tg[0]);
  else if (st.shop) await p.evaluate(() => game.scene.getScene('Pub').closeShop?.());
  else if (P.prestige !== 'never' && st.kNow >= (await p.evaluate((n) => window.__pmin(n), st.pr)) &&
    (P.prestige === 'worth' ? (st.pr === 0 ? (kReadyT ??= T) <= T - 60 : st.kNow >= Math.max(6, 0.5 * st.krigle)) : (kReadyT ??= T) <= T - 120)) {
    await p.evaluate(() => game.scene.getScene('Pub').askPrestige());
    await step(0.5);
    const s2 = await read();
    if (s2?.away.length) { mark(T, 'prestige_ask', `krigle_now=${Math.round(st.kNow)}`, st.pr < 2 ? await shot('okno_hygieny', true) : null); await tap(...s2.away[s2.away.length - 1]); }
  } else if (persona !== 'novacek' && st.i < 0 && !st.g && T - lastMenuT > (persona === 'slaby' ? 240 : 90)) {
    lastMenuT = T;
    await menuVisit(persona === 'slaby' ? 2 : 6);
    await patch();
  } else if (st.qbtn && T - lastQ > 9 && Math.random() < P.quests) { lastQ = T; await tap(st.qbtn[0], st.qbtn[1]); }
  else if (st.tip && tick % 3 === 0) await tap(...st.tip);
  else {
    // obsluha má přednost (to je smysl idle hry), pak nákupy, na které má (tlačítko svítí)
    const staff = st.cards.filter((c) => c.staff && c.se).map((c) => c.staff);
    const buys = st.cards.filter((c) => c.buy && c.be).map((c) => c.buy);
    let acts = staff.length ? staff : buys;
    if (persona === 'slaby') acts = st.cards.flatMap((c) => [c.staff, c.buy]).filter(Boolean); // ťuká na cokoli, i co nemá na zaplacení
    if (!staff.length && !buys.length && st.mode !== 1 && st.modeBtn && tick % 3 === 0) await tap(...st.modeBtn); // přepínač ×1/×10/×100/MAX zpět na ×1
    else if (!staff.length && !buys.length && st.pubs > 1 && tick % 5 === 0) { // jiná hospoda (přepnutí pruhu)
      await p.evaluate(() => { const s = game.scene.getScene('Pub'); s.selectPub(((s.sel ?? 0) + 1) % s.d.pubs.length); });
    } else if (acts.length) await tap(...acts[persona === 'slaby' ? Math.floor(r * acts.length) : tick % acts.length]);
    else if (st.tip) await tap(...st.tip);
    else did = false;
  }
  if (process.env.ZK_DEBUG && T > 480 && T < 500) console.log('TAPDBG', Math.round(T), JSON.stringify(await p.evaluate(() => { const s = game.scene.getScene('Pub'); const ptr = s.input.activePointer; return { last: [Math.round(ptr.x), Math.round(ptr.y)], hits: s.input.hitTestPointer(ptr).map((o) => o.type + '@' + o.depth + (o.name ? ':' + o.name : '')).slice(0, 5), lv: s.d.pubs[0].st.tap.lvl, coins: Math.round(s.d.coins), awayN: (s.awayObjs ?? []).length, tb: s.tapBlock - Date.now() }; })));
  if (did) taps++; else stuck++;
  if (process.env.ZK_PROF && Date.now() - _t0 > 400) console.log('SLOW', Math.round(T), Date.now() - _t0, 'ms', JSON.stringify({ g: st.g, away: st.away.length, modal: st.modal.length, wp: st.wp, shop: st.shop, evt: st.evt, night: st.night, i: st.i }));
  const th = st.evt?.tg.length ? 0.5 : P.think; // při události ťuká rychle (banshee chce 12 ťuků za 9 s)
  await step(th);
  T += th;
}
await record(await read());
await shot('konec', true);
const tl = { game: 'pub-idle', persona, lang, seconds: Math.round(T), real_s: Math.round((Date.now() - t0) / 1000), taps, idle_ticks: stuck,
  errors: [...errors].map(([m, n]) => ({ m: m.slice(0, 300), n })), marks, samples };
fs.writeFileSync(path.join(outDir, name), JSON.stringify(tl));
await b.close();
const last = samples[samples.length - 1] ?? {};
console.log(`${persona}: ${Math.round(T / 60)} herních min za ${tl.real_s} s, ${marks.length} značek, ${shots} snímků, ťuků ${taps}, hygien ${last.prestiges}, chyb ${errors.size} → ${path.join(outDir, name)}`);
