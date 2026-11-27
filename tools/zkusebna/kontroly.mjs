// Zkušebna – automatické kontroly pravidel (ano/ne). Doplňují boty a hodnotitele: chytají chyby,
// které hráč uvidí hned („kosti z truhly, když ještě není Kostnice“, překryvy, chybějící překlady…).
// Seznam kontrol: docs/zkusebna/checklist.md. Výsledek: RUN/kontroly.json + RUN/kontroly.md (+ snímky v RUN/kontroly/).
// Použití: node tools/zkusebna/kontroly.mjs <složka běhu>   (hra musí běžet na ZK_URL, výchozí http://localhost:5178/)
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const RUN = process.argv[2] ?? 'ZkusebnaRuns/kontroly';
const URL0 = process.env.ZK_URL ?? 'http://localhost:5178/';
const ONLY = process.env.ZK_ONLY ? process.env.ZK_ONLY.split(',') : null;
const SHOTS = path.join(RUN, 'kontroly');
fs.mkdirSync(SHOTS, { recursive: true });
const LANGS = ['cs', 'en', 'de', 'es', 'fr', 'pl', 'pt', 'ru', 'tr', 'ja', 'ko', 'zh'].filter((l) => l === 'cs' || fs.existsSync(`src/i18n/locales/${l}.json`));
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const results = [];
const res = (code, name, ok, detail = [], extra = {}) => {
  results.push({ code, name, ok, detail: detail.slice(0, 40), count: detail.length, ...extra });
  console.log(`${ok ? '✓' : '✗'} ${code} ${name}${detail.length ? ` (${detail.length}): ` + detail.slice(0, 3).join(' | ') : ''}`);
};
const want = (code) => !ONLY || ONLY.some((o) => code.startsWith(o));

/** nová stránka s čistou hrou (lang, volitelně uložení) */
async function page({ lang = 'cs', vw = 405, vh = 720, save = null, q = '' } = {}) {
  const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && !/Failed to load resource|favicon/.test(m.text()) && p.errors.push('console: ' + m.text()));
  await p.addInitScript(([l, s]) => {
    if (sessionStorage.getItem('zk_init')) return;
    sessionStorage.setItem('zk_init', '1');
    localStorage.clear();
    localStorage.setItem('pubidle_lang', l);
    if (s) localStorage.setItem('pubidle_save_v1', s);
  }, [lang, save]);
  await p.goto(URL0 + (q || '?night=0'));
  await p.waitForFunction(() => window.game?.scene?.getScene('Pub')?.d && window.game.scene.getScene('Pub').views?.length, null, { timeout: 20000 });
  await p.waitForTimeout(600);
  return p;
}
const S = (p, fn, arg) => p.evaluate(`(${fn})(game.scene.getScene('Pub'), ${JSON.stringify(arg ?? null)})`);
/** začátečník po návodu: pípa 10, kuchyně otevřená, nic dalšího */
const beginner = (s) => {
  s.d.tut = -1;
  s.tutShow?.();
  const p0 = s.d.pubs[0];
  p0.st.tap.lvl = 10;
  p0.st.tap.auto = true;
  s.d.coins = 500;
  s.refresh();
};

// ---------- K1: odměny jen z odemčených částí ----------
if (want('K1')) {
  const p = await page();
  const out = await S(p, (s) => {
    const bad = [];
    const snap = () => ({ bones: s.d.bones ?? 0, krigle: s.d.krigle ?? 0, darts: s.d.darts ? JSON.stringify(s.d.darts) : '', talis: JSON.stringify(s.d.talis ?? {}) });
    const locked = () => ['bones', 'darts', 'krigle', 'talis'].filter((k) => !s.rewOpen(k));
    const check = (what, fn) => {
      const L = locked();
      const a = snap();
      try { fn(); } catch (e) { bad.push(`${what}: chyba ${e.message}`); return; }
      const z = snap();
      for (const k of L) if (a[k] !== z[k]) bad.push(`${what} dal ${k} (zamčené: ${s.tileLock(k === 'krigle' ? 'krigl' : k === 'talis' ? 'bones' : k)})`);
    };
    const states = [
      ['nová hra', () => {}],
      ['po 1. hygieně, bez noci', () => { s.d.stats.prestiges = 1; s.d.nightInfo = false; }],
      ['po 11. hygieně (Chrám, bez šipek)', () => { s.d.stats.prestiges = 11; s.d.nightInfo = true; s.d.earned = 1e30; }],
    ];
    for (const [name, set] of states) {
      set();
      // denní truhla, všech 7 dní (i dvojitá za reklamu)
      for (let i = 0; i < 7; i++) for (const x of [1, 2]) {
        check(`${name}: truhla den ${i + 1}×${x}`, () => s.chestGive(s.chestRewAt(i), x));
        const txt = s.chestRewText(s.chestRewAt(i), x);
        for (const k of locked()) if ((k === 'bones' && /kost/i.test(txt)) || (k === 'darts' && /šip/i.test(txt)) || (k === 'krigle' && /krígl|krígel/i.test(txt))) bad.push(`${name}: truhla den ${i + 1} ukazuje „${txt}“`);
      }
      // sezónní pass, obě řady
      for (let n = 1; n <= 30; n++) for (const g of [false, true]) {
        const k3 = n % 3, m = g ? 3 : 1;
        const r = s.spRewFix(k3 === 1 ? { gems: 5 * m } : k3 === 2 ? { bones: (300 + n * 40) * m } : { krigle: Math.max(1, Math.round((1 + n / 10) * m)) });
        for (const k of locked()) if (r[k]) bad.push(`${name}: pass stupeň ${n}${g ? ' zlatý' : ''} dá ${k}`);
      }
      // Chrám (odměny za bosse, truhly, obchod)
      if (!s.tileLock('temple')) for (const k of ['bones', 'darts', 'krigle']) check(`${name}: Chrám ${k}`, () => s.templeReward(k, 3));
      // talisman (události, návštěvy, liga, týdenní výzva – všechny jdou přes tryDrop)
      check(`${name}: nález talismanu`, () => s.tryDrop(1));
      // offline výdělek (část noci)
      check(`${name}: offline 10 h`, () => { s.d.at = Date.now() - 10 * 3600e3; s.offline(); s.awayClose?.(); });
    }
    return bad;
  });
  // zdroje odměn v kódu, které kontrola nepokrývá voláním – hlídá je text: každé „d.bones +“/„krigle +=“ musí mít poblíž rewOpen/nightsOn/odemčení
  const src = fs.readFileSync('src/scenes/PubScene.ts', 'utf8').split('\n');
  const loose = [];
  src.forEach((l, i) => {
    if (!/(d\.bones = \(this\.d\.bones \?\? 0\) \+|d\.krigle \+=|dartsData\(\)\.(have|pts) \+=)/.test(l)) return;
    if (src.slice(Math.max(0, i - 3), i).some((x) => x.includes('zk-ok'))) return;
    const ctx = src.slice(Math.max(0, i - 25), i + 1).join('\n');
    if (!/rewOpen|this\.night\b|nightsOn|tileLock|prestiges >= ?\d|hyg >= ?\d|bonesPerSec\(\)|isNight|kind === /.test(ctx)) loose.push(`PubScene.ts:${i + 1} ${l.trim().slice(0, 80)}`);
  });
  // talismany: jediný vstup tryDrop musí hlídat Kostnici
  const td = fs.readFileSync('src/scenes/PubScene.ts', 'utf8').match(/private tryDrop\([^)]*\) \{[^}]*/);
  if (!td || !/rewOpen\('talis'\)/.test(td[0])) loose.push('tryDrop nehlídá rewOpen(\'talis\')');
  res('K1', 'Odměny dávají jen věci z odemčených částí hry (kosti, šipky, krígly, talismany)', out.length === 0, out);
  res('K1b', 'Každé místo v kódu, které přidává kosti/krígly/šipky, hlídá odemčení (nebo má ověřenou značku zk-ok)', loose.length === 0, loose);
  await p.close();
}

// ---------- K2: nic zamčeného není vidět ani koupit ----------
const LOCK_WORDS = { bones: /kost(?!k|el|ý|i v rohu)|kostí|Kostnic|talisman/i, darts: /šipk|šipek/i, temple: /Chrám/i, league: /Lig[ay]\b/i, brew: /Pivovar/i, krigl: /krígl|krígel/i };
const SCREENS = [
  ['hospoda', (s) => s.closeShop?.()],
  ['menu', (s) => s.openShop('home', false)],
  ['obchod', (s) => ((s.shopSub = 'up'), s.openShop('shop', false))],
  ['úkoly', (s) => s.openShop('tasks', false)],
  ['truhla', (s) => s.openShop('chest', false)],
  ['nabídka', (s) => ((s.spSub = 'offer'), s.openShop('special', false))],
  ['diamanty', (s) => ((s.spSub = 'gems'), s.openShop('special', false))],
  ['štamgast', (s) => ((s.spSub = 'pass'), s.openShop('special', false))],
  ['nastavení', (s) => s.openShop('opts', false)],
];
const visTexts = (s) => s.children.list.filter((o) => o.type === 'Text' && o.visible && o.alpha > 0.05 && o.x < 1500 && o.text?.trim()).map((o) => {
  const r = o.getBounds();
  return { t: o.text.replace(/\n/g, ' '), x: r.x, y: r.y, w: r.width, h: r.height, d: o.depth };
});
if (want('K2')) {
  const p = await page();
  await S(p, beginner);
  const bad = [];
  for (const [name, fn] of SCREENS) {
    await S(p, (s, n) => { s.closeShop?.(); }, name);
    await p.evaluate(`(${fn})(game.scene.getScene('Pub'))`);
    await p.waitForTimeout(250);
    const r = await S(p, (s, W) => {
      const lk = {};
      for (const k of Object.keys(W)) lk[k] = !!s.tileLock(k);
      const mt = s.menuTiles?.();
      const teaser = mt ? (mt.tiles.find((r) => s.tileLock(mt.keyOf(r))) ?? [])[2] : '';
      const hygRow = s.shopObjs.filter((o) => o.type === 'Text' && /kríg/.test(o.text ?? '') && /hygien|0 \/ \d/.test(o.text ?? '')).map((o) => o.text.replace(/\n/g, ' '));
      return { lk, teaser, hygRow, tx: s.children.list.filter((o) => o.type === 'Text' && o.visible && o.alpha > 0.05 && o.x < 1500 && o.text?.trim()).map((o) => o.text.replace(/\n/g, ' ')) };
    }, Object.fromEntries(Object.keys(LOCK_WORDS).map((k) => [k, 1])));
    for (const [k, re] of Object.entries(LOCK_WORDS)) {
      if (!r.lk[k]) continue;
      // povolené: jediná „nejbližší zamčená“ dlaždice Menu (návrh A, vybral Petr) a hygiena v Obchodě (krígly jsou její odměna)
      const okHere = (tx) => (name === 'menu' && r.teaser === tx) || (name === 'obchod' && k === 'krigl' && /kríg/.test(tx) && r.hygRow.includes(tx));
      for (const tx of r.tx) if (re.test(tx) && !okHere(tx) && !/po \d+\. hygien|po první noci|od \d|ještě|zamčen|Brzy|odemkne/i.test(tx)) bad.push(`${name}: „${tx.slice(0, 70)}“ (${k} zamčené)`);
    }
    await p.screenshot({ path: path.join(SHOTS, `K2-${name}.png`) });
  }
  res('K2', 'Na hlavních obrazovkách začátečníka nejsou zmínky o zamčených věcech (kosti, šipky, Chrám, Liga…)', bad.length === 0, bad);
  await p.close();
}

// ---------- K3: ceny na kartách = ceny z ekonomiky ----------
if (want('K3')) {
  const p = await page();
  await S(p, beginner);
  const bad = await S(p, (s) => {
    const bad = [];
    s.mode = 1;
    s.refresh();
    // úroveň 1 → 2: cena na kartě musí sedět s tím, co nákup strhne
    for (const c of s.cards) {
      const p0 = s.d.pubs[0];
      const st = p0.st[c.def.id];
      if (!st?.lvl) continue;
      s.d.coins = 1e7;
      const before = s.d.coins, lvl = st.lvl;
      const shown = c.buy.label.text;
      s.buy(0, c.def);
      const paid = before - s.d.coins;
      if (st.lvl !== lvl + 1) bad.push(`${c.def.id}: nákup ×1 nepřidal právě 1 úroveň (${lvl} → ${st.lvl})`);
      const m = shown.replace(/\s/g, '').match(/([\d.,]+)([KMBTa-z]*)$/);
      const SUF = { '': 1, K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
      const val = m ? parseFloat(m[1].replace(',', '.')) * (SUF[m[2]] ?? NaN) : NaN;
      if (!(Math.abs(val - paid) <= Math.max(1, paid * 0.012))) bad.push(`${c.def.id}: karta ukazuje „${shown}“, strhlo se ${Math.round(paid)}`);
    }
    return bad;
  });
  res('K3', 'Cena na kartě = cena, kterou nákup strhne (×1)', bad.length === 0, bad);
  await p.close();
}

// ---------- K4: uložení a načtení ----------
if (want('K4')) {
  const p = await page();
  await S(p, beginner);
  await S(p, (s) => { s.d.coins = 1e9; s.buy(0, s.cards[0].def); s.buy(0, s.cards[1].def); s.waiterChip?.(0); });
  const a = await S(p, (s) => JSON.parse(JSON.stringify({ c: Math.floor(s.d.coins), st: s.d.pubs[0].st, w: s.d.pubs[0].w?.length ?? 0, k: s.d.krigle, g: s.d.gems ?? 0 })));
  // zavření „uprostřed akce“: žádné ruční uložení, jen přepnutí do pozadí (jako zamčení telefonu) a reload
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await p.reload();
  await p.waitForFunction(() => window.game?.scene?.getScene('Pub')?.d && window.game.scene.getScene('Pub').views?.length, null, { timeout: 20000 });
  await p.waitForTimeout(500);
  const z = await S(p, (s) => JSON.parse(JSON.stringify({ c: Math.floor(s.d.coins), st: s.d.pubs[0].st, w: s.d.pubs[0].w?.length ?? 0, k: s.d.krigle, g: s.d.gems ?? 0 })));
  const bad = [];
  for (const id of Object.keys(a.st)) if ((a.st[id]?.lvl ?? 0) !== (z.st[id]?.lvl ?? 0)) bad.push(`${id}: úroveň ${a.st[id]?.lvl} → po načtení ${z.st[id]?.lvl}`);
  if (a.w !== z.w) bad.push(`číšníci ${a.w} → ${z.w}`);
  if (z.c < a.c * 0.99) bad.push(`coins ${a.c} → ${z.c}`);
  if (a.g !== z.g) bad.push(`💎 ${a.g} → ${z.g}`);
  res('K4', 'Uložení a načtení (i po zavření do pozadí) nic neztratí', bad.length === 0, bad);
  // poškozené uložení nesmí shodit hru
  const p2 = await page({ save: '{"v":1,"coins":"abc","pubs":[{}]}' });
  res('K4b', 'Poškozené uložení hru neshodí', p2.errors.length === 0, p2.errors);
  await p2.close();
  await p.close();
}

// ---------- K5: offline výdělek ----------
if (want('K5')) {
  const p = await page();
  await S(p, beginner);
  const r = await S(p, (s) => {
    const out = [];
    for (const h of [0.5, 2, 30]) {
      s.awayClose?.();
      const rate = s.d.pubs.reduce((a, q) => a + s.rate(q), 0);
      const cap = s.offCap();
      s.d.at = Date.now() - h * 3600e3;
      const c0 = s.d.coins;
      s.offline();
      // výdělek se připíše až tlačítkem Vybrat (nebo hned) – vezmeme, co je v okně, i coins
      const shown = (s.awayObjs ?? []).map((o) => o.text).filter(Boolean).join(' ');
      s.awayObjs?.filter((o) => o.type === 'Zone').forEach((z) => z.emit('pointerdown'));
      const got = s.d.coins - c0;
      const exp = rate * Math.min(h * 3600, cap);
      out.push({ h, got, exp, cap, shown: shown.slice(0, 120) });
    }
    return out;
  });
  const bad = r.filter((x) => !(x.got >= x.exp * 0.9 && x.got <= x.exp * 1.6)).map((x) => `${x.h} h pryč: dostal ${Math.round(x.got)}, čekáno ~${Math.round(x.exp)} (strop ${x.cap / 3600} h)`);
  res('K5', 'Offline výdělek odpovídá času a stropu kasy', bad.length === 0, bad, { data: r });
  await p.close();
}

// ---------- K6: překryvy a texty mimo obrazovku, všechny jazyky ----------
if (want('K6')) {
  const bad = [], miss = [];
  for (const lang of LANGS) {
    const p = await page({ lang });
    await S(p, beginner);
    for (const [name, fn] of SCREENS) {
      await S(p, (s) => s.closeShop?.());
      await p.evaluate(`(${fn})(game.scene.getScene('Pub'))`);
      await p.waitForTimeout(200);
      const tx = await p.evaluate(`(${visTexts})(game.scene.getScene('Pub'))`);
      for (const a of tx) {
        if (a.x < -2 || a.x + a.w > 542 || a.y + a.h > 962) bad.push(`${lang} ${name}: mimo obrazovku „${a.t.slice(0, 50)}“`);
        if (lang !== 'cs' && /[ěřůčšžĚŘŮČŠŽ]/.test(a.t.replace(/\d[\d\s.,]*Kč/g, '')) && !/P\.U\.B\.|Pajzl/.test(a.t)) miss.push(`${lang} ${name}: nepřeložené „${a.t.slice(0, 50)}“`);
      }
      for (let i = 0; i < tx.length; i++)
        for (let j = i + 1; j < tx.length; j++) {
          const a = tx[i], c = tx[j];
          if (Math.abs(a.d - c.d) > 3) continue;
          // okraje textu (výška řádku nad a pod písmeny) se nepočítají: 18 % výšky nahoře i dole
          const ia = 0.18 * a.h, ic = 0.18 * c.h;
          const ix = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x), iy = Math.min(a.y + a.h - ia, c.y + c.h - ic) - Math.max(a.y + ia, c.y + ic);
          if (ix <= 2 || iy <= 2) continue;
          const area = ix * iy, small = Math.min(a.w * a.h, c.w * c.h);
          if (small > 0 && area / small > 0.2) bad.push(`${lang} ${name}: „${a.t.slice(0, 30)}“ × „${c.t.slice(0, 30)}“`);
        }
      if (['de', 'ru', 'ja'].includes(lang) || lang === 'cs') await p.screenshot({ path: path.join(SHOTS, `K6-${lang}-${name}.png`) });
    }
    await p.close();
  }
  res('K6', 'Texty se nepřekrývají a nejsou mimo obrazovku (12 jazyků × 9 obrazovek)', bad.length === 0, [...new Set(bad)]);
  res('K6b', 'Žádný český text v cizím jazyce na obrazovce', miss.length === 0, [...new Set(miss)]);
}

// ---------- K7: chybějící překlady (zdroj) ----------
if (want('K7')) {
  const keys = new Set();
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.ts$/.test(e.name) && fs.readFileSync(path.join(d, e.name), 'utf8').replace(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g, (_, k) => (keys.add(k.replace(/\\'/g, "'").replace(/\\n/g, '\n')), ''))));
  walk('src');
  const bad = [];
  for (const L of LANGS.filter((l) => l !== 'cs')) {
    const d = JSON.parse(fs.readFileSync(`src/i18n/locales/${L}.json`, 'utf8'));
    const m = [...keys].filter((k) => !(k in d) || !d[k]);
    if (m.length) bad.push(`${L}: chybí ${m.length} (např. „${m[0].slice(0, 50)}“)`);
  }
  res('K7', `Všechny texty t() mají překlad ve všech jazycích (${keys.size} textů)`, bad.length === 0, bad);
}

// ---------- K8: velikost postav ----------
if (want('K8')) {
  const p = await page();
  await S(p, (s) => { s.d.tut = -1; s.tutShow?.(); const q = s.d.pubs[0]; q.st.tap.lvl = 60; q.st.tap.auto = true; s.d.coins = 1e12; s.refresh(); });
  await p.waitForTimeout(8000);
  // najmout číšníky a hned je poslat s pivem (dřív přerušené „poskočení“ nechalo číšníka větší)
  for (let i = 0; i < 3; i++) {
    await S(p, (s, i) => s.waiterChip(i), i);
    await p.waitForTimeout(40);
    await S(p, (s, i) => s.views[0].waiterTrip(i, 1, 6), i);
    await p.waitForTimeout(300);
  }
  await S(p, (s) => { s.d.pubs[0].st.kitchen && ((s.d.pubs[0].st.kitchen.lvl = 5), (s.d.pubs[0].st.kitchen.auto = true)); s.refresh(); });
  await p.waitForTimeout(6000);
  const r = await S(p, (s) => {
    const v = s.views[0];
    const chars = [...v.waiters, ...Object.values(v.staff ?? {}), v.keeper, ...v.guests.map((g) => g.spr)].filter((o) => o?.active);
    return chars.map((o) => ({ k: o.texture.key, sx: +o.scaleX.toFixed(2), sy: +o.scaleY.toFixed(2), h: o.frame.cutHeight }));
  });
  const bad = r.filter((x) => Math.abs(x.sx) !== 1 || x.sy !== 1 || x.h !== 16).map((x) => `${x.k}: měřítko ${x.sx}×${x.sy}, rámeček ${x.h} px`);
  await p.screenshot({ path: path.join(SHOTS, 'K8-postavy.png') });
  res('K8', `Obsluha a hosté jsou stejně velcí (${r.length} postav)`, bad.length === 0 && r.length > 5, bad.length ? bad : r.length > 5 ? [] : ['málo postav na měření']);
  await p.close();
}

// ---------- K9: nákupy a předplatné ----------
if (want('K9')) {
  // ?fakeshop=1: nákupy bez Google Play (jako v npm test); 'season' jen když běží sezóna
  const p = await page({ q: '?night=0&fakeshop=1' });
  await S(p, beginner);
  const ids = ['gems50', 'gems100', 'gems550', 'gems1500', 'gems3500', 'pass', 'noads', 'starter', 'xmas', 'milestone', 'passsub', 'season'];
  const bad = [];
  for (const id of ids) {
    const r = await p.evaluate(async (id) => {
      const s = game.scene.getScene('Pub');
      if (id === 'milestone') s.msStart('pub2');
      const a = JSON.stringify({ g: s.d.gems, p: s.d.pass, o: s.d.own, n: s.d.noAds ?? s.d.noads, of: s.d.offers, sp: s.d.spass });
      let err = '';
      try { await s.iapBuy(id); } catch (e) { err = e.message; }
      const z = JSON.stringify({ g: s.d.gems, p: s.d.pass, o: s.d.own, n: s.d.noAds ?? s.d.noads, of: s.d.offers, sp: s.d.spass });
      s.awayClose?.();
      return { changed: a !== z, err };
    }, id);
    if (r.err) bad.push(`${id}: chyba ${r.err}`);
    else if (!r.changed && id !== 'season') bad.push(`${id}: nákup nic nedodal`);
  }
  res('K9', 'Každý produkt v obchodě po nákupu něco dodá (bez chyb)', bad.length === 0 && p.errors.length === 0, [...bad, ...p.errors]);
  await p.close();
}

// ---------- K10: výkon na slabším telefonu ----------
if (want('K10')) {
  const p = await page();
  await S(p, (s) => { s.d.tut = -1; s.tutShow?.(); const q = s.d.pubs[0]; q.st.tap.lvl = 100; q.st.tap.auto = true; s.d.coins = 1e12; s.refresh(); for (let i = 0; i < 3; i++) s.waiterChip(i); });
  const cdp = await p.context().newCDPSession(p);
  const measure = async (rate) => {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await p.waitForTimeout(2000);
    return p.evaluate(() => new Promise((ok) => {
      const t0 = performance.now(), f0 = game.loop.frame;
      let worst = 0, last = performance.now();
      const tick = () => { const n = performance.now(); worst = Math.max(worst, n - last); last = n; if (n - t0 < 8000) requestAnimationFrame(tick); else ok({ fps: ((game.loop.frame - f0) * 1000) / (n - t0), worst }); };
      requestAnimationFrame(tick);
    }));
  };
  // tenhle stroj sám je pomalý (sdílené jádro v cloudu): měří se poměr k plné rychlosti; slabý telefon ≈ 4× pomalejší procesor
  const full = await measure(1);
  let weak = await measure(4);
  // měření ruší ostatní procesy na stroji: horší ze dvou pokusů se nepočítá
  if (weak.fps < 24) { const w2 = await measure(4); if (w2.fps > weak.fps) weak = w2; }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const okF = weak.fps >= 20 && weak.worst < 600;
  res('K10', `Slabý telefon (procesor 4× pomalejší): ${weak.fps.toFixed(1)} snímků/s (plná rychlost ${full.fps.toFixed(1)}), nejdelší záškub ${Math.round(weak.worst)} ms`, okF, okF ? [] : [`${weak.fps.toFixed(1)} fps (cíl 30, minimum 20), záškub ${Math.round(weak.worst)} ms`], { data: { full, weak } });
  await p.close();
}

// ---------- K11: tři velikosti displeje (snímky pro hodnotitele + hra vyplní šířku) ----------
if (want('K11')) {
  const bad = [];
  for (const [w, h, name] of [[360, 640, 'maly'], [390, 844, 'stredni'], [412, 915, 'velky']]) {
    const p = await page({ vw: w, vh: h });
    await S(p, beginner);
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(SHOTS, `K11-${name}-${w}x${h}.png`) });
    const c = await p.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { w: r.width, h: r.height, x: r.x, y: r.y }; });
    if (c.w < w - 2) bad.push(`${w}×${h}: hra je užší než displej (${Math.round(c.w)} px)`);
    if (p.errors.length) bad.push(`${w}×${h}: ${p.errors[0]}`);
    await p.close();
  }
  res('K11', 'Hra vyplní šířku na 3 velikostech displeje (snímky v kontroly/)', bad.length === 0, bad);
}

// ---------- K12: cedule (nápisy přes hospodu) nezakryjí lištu úkolu, truhlu ani jiná tlačítka ----------
if (want('K12')) {
  const src = fs.readFileSync('src/scenes/PubScene.ts', 'utf8');
  const calls = [...src.matchAll(/this\.banner\([^,()]+(?:\([^)]*\))?[^,()]*,\s*t\('((?:[^'\\]|\\.)*)'(?:,\s*\{[^}]*\})?\)(\s*,\s*true)?\)/g)].map((m) => ({ key: m[1].replace(/\\'/g, "'"), top: !!m[2] }));
  const bad = [];
  for (const lang of LANGS) {
    const dict = lang === 'cs' ? null : JSON.parse(fs.readFileSync(`src/i18n/locales/${lang}.json`, 'utf8'));
    const tr = (k) => (dict?.[k] || k).replace(/\{\w+\}/g, 'Xxxxxxxx');
    const pick = (top) => [...new Map(calls.filter((c) => c.top === top).map((c) => [c.key, tr(c.key)])).values()].sort((a, b) => b.length - a.length).slice(0, 4);
    const p = await page({ lang });
    await S(p, beginner);
    await S(p, (s) => { s.d.chest = undefined; s.refresh(); });
    await p.waitForTimeout(300);
    for (const top of [false, true])
      for (const text of pick(top)) {
        await S(p, (s, a) => {
          s.children.list.filter((o) => o.type === 'Text' && o.depth === 450).forEach((o) => o.destroy());
          s.bannerRaw(a.text, a.top);
        }, { text, top });
        await p.waitForTimeout(400); // po „vyskočení“ (260 ms), před odjezdem
        const r = await S(p, (s, a) => {
          const tx = s.children.list.filter((o) => o.type === 'Text' && o.depth === 450).pop();
          if (!tx) return [];
          const B = tx.getBounds();
          const hits = [];
          // lišta úkolu (celá, ne jen tlačítko) a truhla: nesmí být zakryté ani z 10 %
          const prot = [];
          const q = s.qUi && [s.qUi.icon, s.qUi.title, s.qUi.cnt, s.qUi.rew, s.qUi.coin, s.qUi.btn?.bg].filter((o) => o?.visible && o.getBounds);
          if (q?.length) { const bs = q.map((o) => o.getBounds()); const x0 = Math.min(...bs.map((r) => r.x)), y0 = Math.min(...bs.map((r) => r.y)); prot.push(['lišta úkolu', { x: x0, y: y0, right: Math.max(...bs.map((r) => r.right)), bottom: Math.max(...bs.map((r) => r.bottom)) }]); }
          if (s.chestHud?.img?.visible) prot.push(['truhla', s.chestHud.img.getBounds()]);
          for (const [n, Z] of prot) {
            const ix = Math.min(B.right, Z.right) - Math.max(B.x, Z.x), iy = Math.min(B.bottom, Z.bottom) - Math.max(B.y, Z.y);
            if (ix > 2 && iy > 2 && (ix * iy) / ((Z.right - Z.x) * (Z.bottom - Z.y)) > 0.1) hits.push(n);
          }
          for (const z of s.children.list) {
            if (z.type !== 'Zone' || !z.input?.enabled || !z.visible || z.depth >= 450 || z.x > 1500) continue;
            const Z = z.getBounds();
            if (Z.width * Z.height < 400 || Z.height > 600) continue;
            const ix = Math.min(B.right, Z.right) - Math.max(B.x, Z.x), iy = Math.min(B.bottom, Z.bottom) - Math.max(B.y, Z.y);
            if (ix > 4 && iy > 4 && (ix * iy) / (Z.width * Z.height) > 0.25) hits.push(`${Math.round(Z.x)},${Math.round(Z.y)} ${Math.round(Z.width)}×${Math.round(Z.height)} (cedule ${Math.round(B.x)},${Math.round(B.y)} ${Math.round(B.width)}×${Math.round(B.height)})`);
          }
          return hits.length ? [`cedule „${a.text.slice(0, 40)}“ (${a.top ? 'nahoře' : 'uprostřed'}) zakryje tlačítko ${hits.join(', ')}`] : [];
        }, { text, top });
        for (const x of r) bad.push(`${lang}: ${x}`);
        if (r.length && bad.length < 6) await p.screenshot({ path: path.join(SHOTS, `K12-${lang}-${bad.length}.png`) });
      }
    await p.close();
  }
  res('K12', `Cedule nezakryjí lištu úkolu, truhlu ani jiná tlačítka (${calls.length} cedulí, 4 nejdelší nahoře i uprostřed × 12 jazyků)`, bad.length === 0, bad);
}

await b.close();
const passed = results.filter((r) => r.ok).length;
fs.writeFileSync(path.join(RUN, 'kontroly.json'), JSON.stringify({ passed, total: results.length, results }, null, 1));
const md = [`# Zkušebna – automatické kontroly`, '', `**${passed} z ${results.length} prošlo.**`, '', '| Kód | Kontrola | Výsledek | Nálezy |', '|---|---|---|---|',
  ...results.map((r) => `| ${r.code} | ${r.name} | ${r.ok ? '✓' : '✗'} | ${r.detail.slice(0, 6).join('<br>').replace(/\|/g, '/')}${r.count > 6 ? `<br>… a dalších ${r.count - 6}` : ''} |`)];
fs.writeFileSync(path.join(RUN, 'kontroly.md'), md.join('\n') + '\n');
console.log(`\n${passed} z ${results.length} kontrol prošlo → ${RUN}/kontroly.md`);
