// Nový hráč (en): návod → pak „rozumný“ hráč: bubliny, úkol, nákupy, průvodci. Snímky při událostech + každou minutu.
import { chromium } from 'playwright-core';
const [out, minsS = '12', lang = 'en'] = process.argv.slice(2);
const mins = Number(minsS);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'en-US' });
const errs = new Set();
p.on('pageerror', (e) => errs.add(e.message));
await p.goto('http://localhost:5177/');
await p.evaluate((l) => { localStorage.clear(); localStorage.setItem('pubidle_lang', l); }, lang);
await p.goto('http://localhost:5177/');
await p.waitForTimeout(2500);
const K = 405 / 540, t0 = Date.now();
const T = () => ((Date.now() - t0) / 1000).toFixed(0).padStart(4);
let shots = 0, lastKey = '', lastMin = -1, tick = 0, lastQ = 0;
const shot = async (name) => { if (shots++ < 70) await p.screenshot({ path: `${out}/${String(shots).padStart(2, '0')}-${name}.png` }); };
const tap = (x, y) => p.touchscreen.tap(x * K, y * K);
while (Date.now() - t0 < mins * 60_000) {
  let st;
  try {
    st = await p.evaluate(() => {
      const s = game.scene.getScene('Pub'), d = s.d;
      const i = d.tut ?? -1;
      const dn = s.constructor.TUT?.[i]?.done;
      let tip = null;
      const tt = s.views[s.sel ?? 0]?.tipTarget?.();
      if (tt) tip = [tt.x, tt.y];
      const g = s.guideCur;
      let gr = null, gok = null, gtext = '';
      if (g) {
        const stp = s.guideSteps(g.id)[g.i];
        gr = stp?.at?.() ?? null; gtext = (stp?.head ?? '') + ' – ' + (stp?.text ?? '');
        const z = s.guideObjs.find((o) => o.type === 'Zone'); if (z) gok = [z.x + z.width / 2, z.y + z.height / 2];
      }
      const zc = (list) => list.filter((o) => o.type === 'Zone' && o.visible && o.input?.enabled).map((z) => [z.x + z.width / 2, z.y + z.height / 2]);
      const modal = s.children.list.filter((o) => o.type === 'Zone' && o.visible && o.input?.enabled && o.depth >= 400 && o.width < 520).map((z) => [z.x + z.width / 2, z.y + z.height / 2, z.depth]);
      const p0 = d.pubs[s.sel ?? 0];
      return { i, dn, poor: !!s.tutPoor, r: s.tutRect, tip, tutText: (s.tutHead?.text ?? '') + ' – ' + (s.tutBub?.text ?? ''), g: g ? g.id + ':' + g.i : '', gr, gok, gtext,
        away: zc(s.awayObjs ?? []), shop: (s.shopObjs ?? []).length, modal,
        cards: s.cards.filter((c) => c.pub === (s.sel ?? 0)).map((c) => ({ id: c.def.id, buy: c.buy?.visible ? [c.buy.x + c.buy.w / 2, c.buy.y + c.buy.h / 2] : null, staff: c.staff?.visible ? [c.staff.x + c.staff.w / 2, c.staff.y + c.staff.h / 2] : null })),
        qbtn: s.qUi?.btn?.visible ? [s.qUi.btn.x + 54, s.qUi.btn.y + 23, s.qUi.btn.label.text, s.qUi.title.text] : null,
        coins: Math.floor(d.coins), run: Math.floor(d.run), lv: Object.entries(p0.st).map(([k, v]) => k[0] + v.lvl + (v.auto ? 'a' : '')).join(' '), pubs: d.pubs.length, pr: d.stats?.prestiges ?? 0, kr: d.krigle, gems: d.gems ?? 0, bones: d.bones ?? 0, night: s.night, klvl: d.klvl ?? 1, q: (d.q ?? []).length, tab: s.tab };
    });
  } catch { await p.waitForTimeout(500); continue; }
  const key = `${st.i}|${st.g}|${st.away.length ? 'away' : ''}|${st.modal.length ? 'M' + st.modal.length : ''}|${st.pr}|${st.pubs}|${st.night}`;
  if (key !== lastKey) {
    console.log(`${T()}s tut ${st.i}${st.i >= 0 ? ' [' + st.tutText + ']' : ''} guide ${st.g}${st.g ? ' [' + st.gtext + ']' : ''} away ${st.away.length} modal ${st.modal.length} | coins ${st.coins} ${st.lv} pr ${st.pr} kr ${st.kr} 💎${st.gems} bones ${st.bones} night ${st.night} klvl ${st.klvl} q ${st.q} | quest: ${st.qbtn ? st.qbtn[3] + ' / ' + st.qbtn[2] : '-'}`);
    await shot(key.replace(/[^\w]+/g, '_'));
    lastKey = key;
  }
  const m = Math.floor((Date.now() - t0) / 60_000);
  if (m !== lastMin) { lastMin = m; console.log(`${T()}s == min ${m}: coins ${st.coins} run ${st.run} ${st.lv} quests ${st.q} tab ${st.tab}`); await shot('min' + m); }
  tick++;
  if (st.i >= 0) { // návod
    const useTip = st.dn === 'tip' || (st.dn === 'buy:kitchen' && st.poor);
    if (useTip && st.tip) await tap(...st.tip);
    else if (st.r) await tap(st.r[0] + st.r[2] / 2, st.r[1] + st.r[3] / 2);
    else if (st.tip) await tap(...st.tip);
  } else if (st.g) { if (st.gr) await tap(st.gr[0] + st.gr[2] / 2, st.gr[1] + st.gr[3] / 2); else if (st.gok) await tap(...st.gok); else if (st.tip) await tap(...st.tip); }
  else if (st.away.length) await tap(...st.away[st.away.length - 1]);
  else if (st.modal.length) { const z = st.modal[st.modal.length - 1]; await tap(z[0], z[1]); }
  else if (st.shop) { await p.evaluate(() => game.scene.getScene('Pub').closeShop?.()); }
  else if (st.tip && tick % 2 === 0) await tap(...st.tip);
  else if (st.qbtn && Date.now() - lastQ > 9000) { lastQ = Date.now(); await tap(st.qbtn[0], st.qbtn[1]); }
  else { const acts = st.cards.flatMap((c) => [c.staff, c.buy]).filter(Boolean); if (acts.length) await tap(...acts[tick % acts.length]); }
  await p.waitForTimeout(450);
}
await shot('end');
console.log('errors:', [...errs]);
await b.close();
