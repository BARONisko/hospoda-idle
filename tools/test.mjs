// Headless test celé hry (Playwright + Chromium): spustí vite, projde hlavní funkce, hlídá chyby.
// Spuštění: npm test   (Chromium: CHROME_PATH nebo /opt/pw-browsers/chromium-1243/chrome-linux64/chrome)
import { createServer } from 'vite';
import { chromium } from 'playwright-core';

const server = await createServer({ server: { port: 5199 }, logLevel: 'error' });
await server.listen();
const url = 'http://localhost:5199/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
let fails = 0;
const ok = (name, cond) => {
  console.log(`${cond ? '✓' : '✗'} ${name}`);
  if (!cond) fails++;
};
const page = async (q = '') => {
  const p = await b.newPage({ viewport: { width: 405, height: 720 }, isMobile: true, hasTouch: true });
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(e.message));
  await p.goto(url + (q.includes('night') ? q : q ? q + '&night=0' : '?night=0'));
  await p.waitForFunction(() => window.game?.scene?.getScene('Pub')?.d, null, { timeout: 15000 });
  await p.waitForTimeout(300);
  return p;
};
const S = (p, fn, arg) => p.evaluate(`(${fn})(game.scene.getScene('Pub'), ${JSON.stringify(arg ?? null)})`);

// 1) start, ruční cyklus, nákup úrovně
{
  const p = await page();
  ok('nová hra: 1 hospoda, pípa úroveň 1', await S(p, (s) => s.d.pubs.length === 1 && s.d.pubs[0].st.tap.lvl === 1));
  await S(p, (s) => s.manual(0, s.cards[0].def));
  await p.waitForFunction(() => game.scene.getScene("Pub").d.coins > 0, null, { timeout: 8000 }).catch(() => undefined);
  ok('ruční cyklus pípy vydělá', await S(p, (s) => s.d.coins > 0));
  await S(p, (s) => { s.d.coins = 1e6; s.buy(0, s.cards[1].def); s.hire(0, s.cards[0].def); });
  ok('otevření kuchyně a najmutí kostlivce', await S(p, (s) => s.d.pubs[0].st.kitchen.lvl === 1 && s.d.pubs[0].st.tap.auto));
  await S(p, (s) => { s.mode = 0; s.buy(0, s.cards[0].def); });
  ok('nákup MAX úrovní + milník', await S(p, (s) => s.d.pubs[0].st.tap.lvl >= 25));
  // 2) menu a záložky
  for (const tab of ['shop', 'tasks', 'book', 'opts']) {
    await S(p, (s, tb) => s.openShop(tb, false), tab);
    ok(`Menu: záložka ${tab}`, await S(p, (s) => s.shopObjs.length > 5));
  }
  await S(p, (s) => s.closeShop());
  // 3) obchod: vylepšení a manažer
  await S(p, (s) => { s.d.coins = 1e9; s.openShop('shop', false); s.shopRows[0].o.buy(); });
  ok('koupě v obchodě', await S(p, (s) => s.d.up.length + (s.d.pubs[0].mgr ? 1 : 0) >= 1));
  await S(p, (s) => { s.d.pubs[0].mgr = true; s.useSkill(0); });
  ok('schopnost manažera běží', await S(p, (s) => s.boosted(s.d.pubs[0])));
  // 4) události
  for (const ev of ['gold', 'frogs', 'bat', 'banshee']) {
    await S(p, (s, e) => s.ev.start(e, 0), ev);
    for (let i = 0; i < 12; i++) await S(p, (s) => { const a = s.ev.active; const tg = a?.targets.find((x) => x.spr.active); tg?.hit(); });
    ok(`událost ${ev} jde splnit`, await S(p, (s) => !s.ev.active));
  }
  // 5) úkoly a úspěch
  await S(p, (s) => { s.d.daily.tasks.forEach((k) => (k.prog = k.goal)); s.openShop('tasks', false); });
  ok('úkoly a úspěchy k vyzvednutí', await S(p, (s) => s.claimable()));
  // 5b) obchod s krígly
  await S(p, (s) => { s.d.krigle = 400; s.openShop('krigl', false); s.shopObjs.filter((o) => o.type === 'Zone').at(-1); });
  await S(p, (s) => { s.d.kup = { start: 1, keepMgr: 1, speed: 2 }; s.applyKup(); });
  ok('krígly: rychlejší cyklus', await S(p, (s) => Math.abs(s.cyc(s.cards[0].def) - 1.5 * 0.991 ** 2) < 1e-9));
  // 5c) návštěvník s rozhodnutím
  for (let k = 0; k < 5; k++) {
    const r = await S(p, (s, k) => {
      s.d.coins = 1e9;
      const before = s.d.coins;
      s.visit(s.visitList()[k]);
      const zones = s.awayObjs.filter((o) => o.type === 'Zone');
      zones[0].emit('pointerdown');
      return s.awayObjs.length === 0 && before > 0;
    }, k);
    ok(`návštěvník ${k + 1}: volba proběhne`, r);
  }
  // 5d) výzdoba
  await S(p, (s) => { s.d.coins = 1e16; s.shopSub = 'decor'; s.openShop('shop', false); s.decorRows[0].b.zone.emit('pointerdown'); });
  ok('výzdoba: koupě portrétu', await S(p, (s) => s.has('portrait')));
  // 5e) pivovar: uvaří se i offline, prodej a vylepšení
  await S(p, (s) => { const b = s.brew(); b.stock = 0; b.at = Date.now() - 3 * 15 * 60_000 - 1000; b.kind = 'lager'; s.openShop('brew', false); });
  ok('pivovar: offline uvařil 3 piva', await S(p, (s) => s.brew().stock === 3));
  for (let k = 0; k < 2; k++) await S(p, (s) => s.shopObjs.filter((o) => o.type === 'Zone' && o.x === 275).at(-1).emit('pointerdown'));
  ok('pivovar: 2 piva vložena → úroveň 2', await S(p, (s) => s.brew().lvl === 2));
  // 5f) talismany
  await S(p, (s) => { const r = Math.random; Math.random = () => 0; s.tryDrop(0.5); Math.random = r; });
  ok('talisman: nález', await S(p, (s) => Object.values(s.d.talis ?? {}).some((x) => x >= 1)));
  await S(p, (s) => { s.d.bones = 1e9; s.openShop('talis', false); s.shopObjs.filter((o) => o.type === 'Zone').at(-1).emit('pointerdown'); });
  ok('talisman: vylepšení za kosti', await S(p, (s) => Object.values(s.d.talis).some((x) => x >= 2)));
  // 5g) hostinský: XP → úroveň → dovednost
  await S(p, (s) => { s.d.klvl = 1; s.d.xp = 0; s.d.skills = []; s.xp(150); s.openShop('keeper', false); });
  ok('hostinský: úroveň 2 a bod', await S(p, (s) => s.d.klvl === 2 && s.skillPoints() === 1));
  await S(p, (s) => s.shopObjs.filter((o) => o.type === 'Zone').find((z) => z.y > 450).emit('pointerdown'));
  ok('hostinský: koupená dovednost', await S(p, (s) => s.d.skills.length === 1 && s.ts().tips >= 0.25));
  // 5h) týdenní výzva
  await S(p, (s) => { const w = s.weekly(); w.prog = w.goal; s.openShop('tasks', false); s.shopObjs.filter((o) => o.type === 'Zone').find((z) => z.y > 360).emit('pointerdown'); });
  ok('týdenní výzva: vyzvednuta', await S(p, (s) => s.weekly().claimed));
  // 5i) liga: výhra → postup a krígly, prohra → sestup
  const lg = await S(p, (s) => {
    const k0 = s.d.krigle;
    let L = s.league(); L.tier = 2; L.start -= 7 * 86400000; L.me = 1e30; s.leagueCheck();
    const won = s.d.league.tier === 3 && s.d.krigle >= k0 + 10;
    s.awayObjs.forEach((o) => o.destroy()); s.awayObjs = [];
    L = s.league(); L.start -= 7 * 86400000; L.me = 0; L.rate = 100; s.leagueCheck();
    const lost = s.d.league.tier === 2;
    s.awayObjs.forEach((o) => o.destroy()); s.awayObjs = [];
    return won && lost;
  });
  ok('liga: výhra = postup, prohra = sestup', lg);
  // 6) prestiž
  await S(p, (s) => { s.d.run = 1e8; s.askPrestige(); s.prestige(); });
  await p.waitForTimeout(800);
  ok('prestiž: 2 hospody a krígly', await S(p, (s) => s.d.pubs.length === 2 && s.d.krigle >= 31 && s.views.length === 2));
  ok('prestiž: startovní kapitál a věrní manažeři', await S(p, (s) => s.d.coins >= 1000 && s.d.pubs[0].mgr === true));
  ok('prestiž: výzdoba zůstala', await S(p, (s) => s.has('portrait')));
  ok('bez chyb v konzoli', p.errors.length === 0);
  if (p.errors.length) console.log(p.errors);
  await p.close();
}
// 7) offline výdělek
{
  const p = await page('?pubs=2&away=3600');
  ok('okno offline výdělku', await S(p, (s) => s.awayObjs.length > 0));
  ok('bez chyb v konzoli (offline)', p.errors.length === 0);
  await p.close();
}
// 7b) noc: stanice platí kostmi
{
  const p = await page('?night=1');
  await S(p, (s) => { s.d.tut = -1; s.d.pubs[0].st.tap.lvl = 30; s.manual(0, s.cards[0].def); });
  await p.waitForFunction(() => (game.scene.getScene('Pub').d.bones ?? 0) > 0, null, { timeout: 8000 }).catch(() => undefined);
  ok('noc: pípa vydělala kosti', await S(p, (s) => s.d.bones > 0 && s.d.coins === 0));
  await S(p, (s) => { s.d.bones = 1e6; s.shopSub = 'bones'; s.openShop('shop', false); s.shopObjs.filter((o) => o.type === 'Zone').find((z) => z.x === 10 && z.y > 500).emit('pointerdown'); });
  await p.waitForFunction(() => !game.scene.getScene('Pub').ossBusy, null, { timeout: 10000 }).catch(() => undefined);
  ok('noc: Kostnice – hod kostkou zvedne náhodný stat', await S(p, (s) => s.d.ossRolls === 1 && Object.values(s.d.oss ?? {}).reduce((a, b) => a + b, 0) === 1 && s.d.bones < 1e6));
  ok('bez chyb v konzoli (noc)', p.errors.length === 0);
  await p.close();
}
// 8) 3 hospody: záložky – přepnutí na 3. hospodu ukáže její výhled a karty
{
  const p = await page('?pubs=3');
  await S(p, (s) => s.selectPub(2));
  ok('3 hospody: záložka přepne hospodu', await S(p, (s) => s.sel === 2 && !s.views[0].cam.visible && s.views[2].cam.visible && s.cards.every((c) => c.pub === 2)));
  ok('bez chyb v konzoli (3 hospody)', p.errors.length === 0);
  await p.close();
}
await b.close();
await server.close();
console.log(fails ? `\n${fails} testů selhalo` : '\nvšechny testy prošly');
process.exit(fails ? 1 : 0);
