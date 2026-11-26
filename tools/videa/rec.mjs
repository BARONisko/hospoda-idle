import fs from 'fs';
import { chromium } from '/home/user/hospoda-idle/node_modules/playwright-core/index.mjs';
const out = '/tmp/claude-0/vid/raw';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const setup = async (p, U, late = true) => {
  await p.goto(U);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('pubidle_lang', 'en'); });
  if (late) {
  await p.goto(U); await p.waitForTimeout(2500);
  await p.evaluate(() => { const s = game.scene.getScene('Pub'), d = s.d; d.tut = -1; d.nightInfo = true; d.guideQ = []; d.guides = ['night', 'pub2', 'pub3']; d.brewTut = -1; d.ntfAsk = true; d.pubIntro = undefined;
    d.tabTut = ['home','brew','keeper','league','krigl','book','coll','bones','decor','special','opts','mast','quests','shop','up','gems','talis','darts','temple'];
    d.coins = 3.48e9; d.earned = 9e10; d.run = 2e9; d.krigle = 140; d.gems = 120; d.klvl = 24; d.bones = 5300; d.stats = { ...d.stats, prestiges: 21 }; d.menuOpen = undefined;
    while (d.pubs.length < 3) d.pubs.push({ act: d.pubs.length + 1, st: {} });
    d.pubs.forEach((p, i) => { p.st = { tap: { lvl: 120 - i * 20, auto: true, prog: 0.3 }, kitchen: { lvl: 80 - i * 15, auto: true, prog: 0.6 }, cellar: { lvl: 60 - i * 12, auto: true, prog: 0.1 }, dice: { lvl: 35 - i * 8, auto: true, prog: 0.5 } }; p.mgr = true; p.w = [{ s: 3, t: 2, m: 2, xp: 9e5 }, { s: 3, t: 2, m: 1, xp: 9e5 }, { s: 2, t: 1, m: 1, xp: 9e5 }]; });
    d.decor = ['portrait', 'boar', 'cuckoo', 'piano', 'aquarium', 'fireplace']; d.at = Date.now();
    localStorage.setItem('pubidle_save_v1', JSON.stringify(d)); });
  }
};
const rec = async (name, q, fn, late = true) => {
  // příprava bez nahrávání
  const ctx0 = await b.newContext({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'en-US' });
  const p0 = await ctx0.newPage(); const U = 'http://localhost:5177/' + q;
  await setup(p0, U, late);
  const st = await ctx0.storageState(); await ctx0.close();
  const ctx = await b.newContext({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'en-US', storageState: st });
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', name, e.message));
  await p.goto(U); await p.waitForTimeout(2500);
  const dir = out + '/' + name; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const cdp = await ctx.newCDPSession(p); const fr = []; let n = 0;
  cdp.on('Page.screencastFrame', async (f) => { const fn = `${dir}/f${String(n++).padStart(5, '0')}.jpg`; fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); fr.push([fn, f.metadata.timestamp]); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 810, maxHeight: 1440, everyNthFrame: 1 });
  await fn(p);
  await cdp.send('Page.stopScreencast'); await p.waitForTimeout(300);
  let txt = ''; for (let i = 0; i < fr.length; i++) { const d = i + 1 < fr.length ? fr[i + 1][1] - fr[i][1] : 0.05; txt += `file '${fr[i][0]}'\nduration ${d.toFixed(4)}\n`; }
  fs.writeFileSync(dir + '.txt', txt);
  await ctx.close(); console.log('ok', name, fr.length, fr.length ? (fr.at(-1)[1] - fr[0][1]).toFixed(1) : 0);
};
const S = (p, js) => p.evaluate(`(()=>{const s=game.scene.getScene('Pub'),d=s.d;${js}})()`);
const taps = async (p, n, x = 200, y = 250, dt = 120) => { for (let i = 0; i < n; i++) { await p.mouse.click(x + (i % 5) * 15 - 30, y + (i % 3) * 20); await p.waitForTimeout(dt); } };
const only = process.argv[2];
const J = {
  fresh: () => rec('fresh', '', async (p) => { await p.waitForTimeout(4000); for (let i = 0; i < 40; i++) { await p.mouse.click(90, 425); await p.waitForTimeout(110); if (i % 8 == 7) { await p.mouse.click(90, 487); await p.mouse.click(90, 487); await p.mouse.click(90, 487); } } await p.waitForTimeout(3000); }, false),
  day: () => rec('day', '?night=0&talis=1', async (p) => { await S(p, 's.closeShop?.();s.selectPub(0)'); await p.waitForTimeout(5000); await taps(p, 20, 200, 230); await S(p, 's.selectPub(1)'); await p.waitForTimeout(4000); await S(p, 's.selectPub(2)'); await p.waitForTimeout(4000); }),
  night: () => rec('night', '?night=1&talis=1', async (p) => { await S(p, 's.closeShop?.();s.selectPub(1)'); await p.waitForTimeout(7000); await taps(p, 15, 200, 230); await S(p, 's.selectPub(0)'); await p.waitForTimeout(5000); }),
  gold: () => rec('gold', '?night=0&talis=1&ev=gold', async (p) => { await p.waitForTimeout(3000); await taps(p, 30, 200, 230, 150); await p.waitForTimeout(3000); }),
  brawl: () => rec('brawl', '?night=0&talis=1&ev=brawl', async (p) => { await p.waitForTimeout(6000); await taps(p, 20, 200, 230, 150); await p.waitForTimeout(3000); }),
  temple: () => rec('temple', '?night=0&talis=1&temple=1', async (p) => { await S(p, 's.openTemple()'); await p.waitForTimeout(10000); }),
  away: () => rec('away', '?night=0&talis=1&away=30000', async (p) => { await p.waitForTimeout(6000); }),
  darts: () => rec('darts', '?night=0&talis=1', async (p) => { await S(p, 's.openDarts()'); await p.waitForTimeout(3000); for (let i = 0; i < 4; i++) { await p.mouse.click(202, 300 + i * 5); await p.waitForTimeout(1800); } }),
};
for (const k of Object.keys(J)) if (!only || only.split(',').includes(k)) await J[k]();
await b.close();
