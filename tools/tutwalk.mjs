// Průchod návodem jako nový hráč: ťuká vždy doprostřed zvýrazněného místa (u hosta na šipku), snímek každého kroku.
// Spuštění: vite na 5177, pak node tools/tutwalk.mjs ["?night=1"] [tools/_tmp/tw/n] (končí „ZASEKNUTO“, když se návod nedá dohrát)
import { chromium } from 'playwright-core';
const [q = '', out = 'tools/_tmp/tw'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'cs-CZ' });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:5177/' + q);
await p.waitForTimeout(2500);
const K = 405 / 540;
let last = -2, since = Date.now(), taps = 0;
const t0 = Date.now();
while (Date.now() - t0 < 400_000) {
  const st = await p.evaluate(() => {
    const s = game.scene.getScene('Pub');
    const i = s.d.tut ?? -1;
    let r = s.tutRect;
    let tip = null;
    const dn = s.constructor.TUT?.[i]?.done;
    if (i >= 0 && (dn === 'tip' || (dn === 'buy:kitchen' && s.tutPoor))) { const q = s.views[0]?.tipTarget(); tip = q ? [q.x, q.y] : null; }
    return { i, r, tip, coins: Math.floor(s.d.coins), night: s.night, text: (s.tutHead?.text ?? '') + ' – ' + (s.tutBub?.text ?? '') };
  });
  if (st.i !== last) {
    console.log(`krok ${st.i} po ${((Date.now() - since) / 1000).toFixed(0)} s, ťuků ${taps}, coins ${st.coins}, noc ${st.night}: ${st.text}`);
    await p.screenshot({ path: `${out}-${st.i}.png` });
    last = st.i; since = Date.now(); taps = 0;
    if (st.i < 0) break;
  }
  if (Date.now() - since > 150_000) { console.log('ZASEKNUTO v kroku', st.i, st.text); break; }
  let x, y;
  if (st.tip) [x, y] = st.tip;
  else if (st.r) [x, y] = [st.r[0] + st.r[2] / 2, st.r[1] + st.r[3] / 2];
  else { await p.waitForTimeout(300); continue; }
  await p.touchscreen.tap(x * K, y * K);
  taps++;
  await p.waitForTimeout(350);
}
console.log('chyby:', errs.length ? errs : 'žádné');
await b.close();
