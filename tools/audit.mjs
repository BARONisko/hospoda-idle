// Audit obrazovek: projde všechny části menu (a podstránky) v několika jazycích a hlásí texty
// pod spodní lištou, mimo obrazovku a navzájem překryté. Snímky do tools/_tmp/audit/<jazyk>-<část>.png.
// Spuštění (vite na 5177): node tools/audit.mjs [cs,en,de,ru]
import { chromium } from 'playwright-core';
import fs from 'fs';
const langs = (process.argv[2] ?? 'cs,en,de,ru').split(',');
const URL = 'http://localhost:5177/?night=0&pubs=3&talis=1';
fs.mkdirSync('tools/_tmp/audit', { recursive: true });
const PARTS = [
  ['menu', "s.openShop('home',false);s.openShop('menu',false)"],
  ['obchod', "s.shopSub='up';s.openShop('shop',false)"],
  ['vyzdoba', "s.shopSub='decor';s.openShop('shop',false)"],
  ['kostnice', "s.shopSub='bones';s.openShop('shop',false)"],
  ['ukoly', "s.openShop('tasks',false)"],
  ['chram', "s.openShop('temple',false)"],
  ['pivovar', "s.openShop('brew',false)"],
  ['liga', "s.openShop('league',false)"],
  ['talismany', "s.openShop('talis',false)"],
  ['sipky', "s.openShop('darts',false)"],
  ['sberac', "s.openShop('coll',false)"],
  ['hostinsky0', "s.ktab=0;s.openShop('keeper',false)"],
  ['hostinsky3', "s.ktab=3;s.openShop('keeper',false)"],
  ['hostinsky-info', "s.ktab=0;s.ktInfo=true;s.openShop('keeper',false)"],
  ['krigly', "s.openShop('krigl',false)"],
  ['sbirka', "s.bookGrp=0;s.openShop('book',false)"],
  ['sbirka-sezona', "s.bookGrp=3;s.openShop('book',false)"],
  ['nabidka', "s.spSub='offer';s.openShop('special',false)"],
  ['diamanty0', "s.spSub='gems';s.gemPage=0;s.openShop('special',false)"],
  ['diamanty1', "s.spSub='gems';s.gemPage=1;s.openShop('special',false)"],
  ['diamanty2', "s.spSub='gems';s.gemPage=2;s.openShop('special',false)"],
  ['stamgast', "s.spSub='pass';s.openShop('special',false)"],
  ['nastaveni', "s.openShop('opts',false)"],
  ['dennoc', "s.openShop('daynight',false)"],
  ['hospoda', "s.openShop('home',false)"],
];
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
let problems = 0;
for (const lang of langs) {
  const p = await b.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errs.push(m.text()));
  await p.goto(URL);
  await p.evaluate((l) => localStorage.setItem('pubidle_lang', l), lang);
  await p.goto(URL);
  await p.waitForTimeout(2000);
  // bohatý stav: vše odemčené, ať se ukáže co nejvíc
  await p.evaluate(() => {
    const s = game.scene.getScene('Pub');
    const d = s.d;
    d.tut = -1; d.coins = 3.3e12; d.gems = 1234; d.bones = 5.5e6; d.krigle = 4321; d.klvl = 40;
    d.stats.prestiges = 6;
    // jednorázové nápovědy (šipka + řádek přes obsah, záměr) vypnout – audit hledá trvalé chyby
    d.tabTut = Object.keys(s.constructor.TAB_TUT); s.tabTutKey = '';
    s.awayObjs.forEach((o) => o.destroy()); s.awayObjs = [];
  });
  for (const [name, js] of PARTS) {
    let r;
    try {
      r = await p.evaluate(`(() => { const s = game.scene.getScene('Pub'); s.awayObjs.forEach((o) => o.destroy()); s.awayObjs = []; ${js}; })()`);
    } catch (e) {
      console.log(`[${lang}] ${name}: CHYBA ${e.message.split('\n')[0]}`);
      problems++;
      continue;
    }
    await p.waitForTimeout(350);
    r = await p.evaluate(() => {
      const s = game.scene.getScene('Pub');
      const W = 540, H = 960, MB = H - 84;
      const objs = (s.shopObjs.length ? s.shopObjs : s.children.list).filter((o) => o.visible && o.alpha > 0.05 && o.active);
      const texts = objs.filter((o) => o.type === 'Text' && o.text.trim());
      const out = [];
      const box = (o) => o.getBounds();
      for (const o of texts) {
        const q = box(o);
        if (q.bottom > MB + 2 && q.top < H && s.shopObjs.length && (o.depth ?? 0) < 340) out.push(`pod lištou: "${o.text.slice(0, 40)}" (y ${Math.round(q.top)}–${Math.round(q.bottom)})`);
        if (q.right > W + 2 || q.left < -2) out.push(`mimo okraj: "${o.text.slice(0, 40)}" (x ${Math.round(q.left)}–${Math.round(q.right)})`);
      }
      for (let i = 0; i < texts.length; i++)
        for (let j = i + 1; j < texts.length; j++) {
          const a = box(texts[i]), c = box(texts[j]);
          const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
          if (ix > 4 && iy > 4 && ix * iy > 0.25 * Math.min(a.width * a.height, c.width * c.height))
            out.push(`překryv: "${texts[i].text.slice(0, 30)}" × "${texts[j].text.slice(0, 30)}"`);
        }
      return out;
    });
    await p.screenshot({ path: `tools/_tmp/audit/${lang}-${name}.png` });
    for (const x of r) console.log(`[${lang}] ${name}: ${x}`);
    problems += r.length;
  }
  for (const e of errs) console.log(`[${lang}] CHYBA v konzoli: ${e}`);
  problems += errs.length;
  await p.close();
}
await b.close();
console.log(problems ? `\nnalezeno ${problems} problémů` : '\nbez problémů');
