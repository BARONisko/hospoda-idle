// Scénář: node scen.mjs <out-prefix> <js1> <js2> … ; env SAVEJS = úprava uložení (proměnná d), Q = parametry URL, LG = jazyk
import { chromium } from 'playwright-core';
const [out, ...steps] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'en-US' });
p.on('pageerror', (e) => console.log('ERR', e.message));
const U = 'http://localhost:5177/' + (process.env.Q ?? '');
await p.goto(U);
await p.evaluate((l) => { localStorage.clear(); localStorage.setItem('pubidle_lang', l); }, process.env.LG ?? 'en');
await p.goto(U); await p.waitForTimeout(2500);
await p.evaluate((js) => {
  const s = game.scene.getScene('Pub'), d = s.d;
  d.tut = -1; d.at = Date.now();
  new Function('d', 's', js)(d, s);
  s.constructor.cur = null; // nic
  window.onbeforeunload = null;
  localStorage.setItem('pubidle_save_v1', JSON.stringify(d));
}, process.env.SAVEJS ?? '');
// uložení při zavření stránky by přepsalo naše → vypnout ukládání přes zámek druhé karty není potřeba: rovnou reload
await p.goto(U); await p.waitForTimeout(3500);
let i = 0;
await p.screenshot({ path: `${out}-0.png` });
for (const js of steps) {
  i++;
  try { const r = await p.evaluate(`(async()=>{const s=game.scene.getScene('Pub'),d=s.d;${js}})()`); if (r !== undefined) console.log(i, JSON.stringify(r)); } catch (e) { console.log(i, 'CHYBA', e.message.slice(0, 200)); }
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `${out}-${i}.png` });
}
await b.close();
