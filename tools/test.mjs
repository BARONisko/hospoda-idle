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
  ok('číšníci: najmutím na pípě nastoupili 2', await S(p, (s) => s.d.pubs[0].w?.length === 2));
  await S(p, (s) => { s.waiterChip(2); s.d.pubs[0].w[0].xp = 40000; s.openWaiter(0, 0); s.wPanelBtns[1].b.zone.emit('pointerdown'); s.closeWaiter(); });
  ok('číšníci: najmutí 3. a vylepšení podnosu za bod', await S(p, (s) => s.d.pubs[0].w.length === 3 && s.d.pubs[0].w[0].t === 1));
  await p.waitForTimeout(4000);
  ok('číšníci: roznášejí pivo z baru', await S(p, (s) => s.wrun[0].some((r) => r.t > 0 || r.paid)));
  await S(p, (s) => { s.mode = 0; s.buy(0, s.cards[0].def); });
  ok('nákup MAX úrovní + milník', await S(p, (s) => s.d.pubs[0].st.tap.lvl >= 25));
  // 2) menu a záložky
  for (const tab of ['shop', 'tasks', 'book', 'opts']) {
    await S(p, (s, tb) => s.openShop(tb, false), tab);
    ok(`Menu: záložka ${tab}`, await S(p, (s) => s.shopObjs.length > 5));
  }
  await S(p, (s) => s.closeShop());
  ok('upozornění: plná hospoda naplánovaná za strop offline', await S(p, (s) => s.notes().some((n) => n.id === 1 && Math.abs(n.at - Date.now() - s.offCap() * 1000) < 5000)));
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
  await S(p, (s) => { s.d.klvl = 1; s.d.xp = 0; s.d.skills = []; s.ktab = 0; s.ktSel = ''; s.d.stars = {}; s.d.mast = {}; s.d.loy = {}; s.xp(15); s.openShop('keeper', false); });
  ok('hostinský: úroveň 3 a 2 body', await S(p, (s) => s.d.klvl === 3 && s.skillPoints() === 2));
  await S(p, (s) => s.shopObjs.filter((o) => o.type === 'Zone').at(-1).emit('pointerdown'));
  ok('strom: koupen 1. uzel Výčepu (KOUPIT)', await S(p, (s) => s.d.skills.join() === 'v0' && s.skillPoints() === 0 && s.ts().income >= 0.006));
  ok('strom: další uzel bez bodů nejde', await S(p, (s) => { s.shopObjs.filter((o) => o.type === 'Zone').at(-1).emit('pointerdown'); return s.d.skills.length === 1; }));
  // 5g2) hvězdný uzel a hygiena: Dobrá pověst nechá 5 % úrovní
  await S(p, (s) => { s.d.klvl = 300; s.d.skills = []; for (let i = 0; i <= 20; i++) s.d.skills.push('s' + i); });
  ok('strom: hvězda Dobrá pověst', await S(p, (s) => s.star('keep5') && !s.star('tray') && s.skillPoints() > 0));
  // 5g3) mistrovství: roste s časem obsluhy, zvedá výdělek a rychlost; štít na kartě
  ok('mistrovství, hvězdy a hosté dávají jen body do stromu', await S(p, (s) => {
    s.d.mast = {}; s.d.stars = {}; s.d.loy = {}; const pub = s.d.pubs[0], def = s.cards[0].def; pub.st.tap.auto = true;
    const p0 = s.pay(pub, def), c0 = s.cyc(def), b0 = s.skillPoints();
    s.mastAdd(2e6); s.d.stars = { '1_tap': 2 }; s.d.loy = { guest0: 1750 }; s.tsCache = undefined;
    return s.mast('tap') >= 10 && s.pay(pub, def) === p0 && s.cyc(def) === c0 && s.skillPoints() === b0 + s.mast('tap') + 2 + 2;
  }));
  ok('mistrovství: hodnost a tečky na kartě', await S(p, (s) => { s.refresh(); return s.cards[0].bnum.text === 'Tovaryš' || s.cards[0].bnum.text.length > 2; }));
  // 5g4) věrnost hostů: obsloužení druhu = bod, úroveň 1 po 10, spropitné od něj +1 %
  ok('věrnost hostů: 300 obsloužení = úroveň 1, Sbírka s tečkami', await S(p, (s) => {
    const v = s.views[0]; s.d.loy = { guest3: 290 }; v.lastKey = 'guest3';
    for (let i = 0; i < 10; i++) s.tipReward(v);
    s.bookGrp = 0; s.bookSel = 'guest3'; s.d.seen.includes('guest3') || s.d.seen.push('guest3'); s.openShop('book', false);
    return s.d.loy.guest3 === 300 && s.loyText('guest3').l === 1;
  }));
  ok('sběrač: najmutí 500 kostí, bubliny nejvýš 5', await S(p, (s) => {
    s.d.coll = { 1: { spd: 0, amt: 5 } }; s.d.bones = 1e9; s.d.tabTut = [...(s.d.tabTut ?? []), 'coll']; s.openShop('coll', false);
    s.shopObjs.filter((o) => o.type === 'Zone').at(-1).emit('pointerdown');
    return s.collBase(0) === 500 && s.d.coll[1].amt === 5;
  }));
  // 5h) týdenní výzva
  await S(p, (s) => { const w = s.weekly(); w.prog = w.goal; s.openShop('tasks', false); s.shopObjs.filter((o) => o.type === 'Zone').find((z) => z.y > 250).emit('pointerdown'); });
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
  await S(p, (s) => { s.d.run = 1e8; s.d.pubs[0].st.tap.lvl = 500; s.askPrestige(); s.prestige(); });
  await p.waitForTimeout(800);
  ok('prestiž: 2 hospody a krígly', await S(p, (s) => s.d.pubs.length === 2 && s.d.krigle >= 11 && s.views.length === 2));
  ok('hvězdy: pípa na 500 = po hygieně hvězda (bod do stromu, úrovně 10× dražší za hvězdu)', await S(p, (s) => { s.mode = 1; const st = s.d.stars, n = st?.['1_tap'] ?? 0; const a = s.offer(s.d.pubs[0], s.cards[0].def).price; s.d.stars = {}; const b = s.offer(s.d.pubs[0], s.cards[0].def).price; s.d.stars = st; return n >= 1 && a >= (b - 1) * 10 ** n && s.bonusPoints() >= n; }));
  ok('prestiž: startovní kapitál a věrní manažeři', await S(p, (s) => s.d.coins >= 1000 && s.d.pubs[0].mgr === true));
  ok('prestiž: výzdoba zůstala', await S(p, (s) => s.has('portrait')));
  ok('bez chyb v konzoli', p.errors.length === 0);
  if (p.errors.length) console.log(p.errors);
  await p.close();
}
// 6a2) červená tečka zmizí po prvním otevření a znovu svítí, až přibude něco nového (Hostinský, Pivovar)
{
  const p = await page();
  ok('tečky: Hostinský svítí → po otevření zmizí → nový bod znovu svítí', await S(p, (s) => {
    s.d.tut = -1; s.d.klvl = 10; s.d.skills = []; s.d.alertSeen = {};
    const a = s.tabAlert('keeper'); s.openShop('keeper', false); s.closeShop();
    const b = s.tabAlert('keeper'); s.d.klvl = 11; const c = s.tabAlert('keeper');
    return a && !b && c;
  }));
  ok('tečky: plný Pivovar svítí, po otevření zmizí', await S(p, (s) => {
    const br = s.brew(); br.stock = 999; s.d.alertSeen = {};
    const a = s.tabAlert('brew'); s.openShop('brew', false); s.closeShop();
    return a && !s.tabAlert('brew');
  }));
  await p.close();
}
// 6b) hygiena jako skutečný hráč (lišta úkolu, VIP, styl): „Ještě ne“ hru neblokuje, po hygieně hra běží dál,
//     coins na rozjezd a průvodce novou hospodou jde dokončit (dřív zamrznutí / zaseknutí)
{
  const p = await page();
  await S(p, (s) => { s.d.tut = -1; s.tutShow(); const pb = s.d.pubs[0];
    for (const [id, l] of [['tap', 100], ['kitchen', 50], ['cellar', 50]]) pb.st[id] = { ...(pb.st[id] || {}), lvl: l, auto: true, prog: 0 };
    pb.mgr = true; s.d.run = 1e13; s.d.vip = { next: Date.now() - 1000, until: 0 }; s.vipT = 0; });
  await p.waitForTimeout(1500);
  ok('hygiena: lišta úkolu a VIP jsou vidět', await S(p, (s) => !!s.qUi && !!s.vipBar));
  await S(p, (s) => { s.askPrestige(); s.awayObjs.find((o) => o.type === 'Zone')?.emit('pointerdown'); });
  ok('hygiena: „Ještě ne“ zavře okno a hospoda reaguje', await S(p, (s) => s.awayObjs.length === 0));
  await S(p, (s) => { s.askPrestige(); s.prestige(); });
  await p.waitForTimeout(1500);
  const f0 = await p.evaluate(() => game.loop.frame);
  await p.waitForTimeout(1000);
  ok('hygiena: hra po restartu běží (nezamrzla)', (await p.evaluate(() => game.loop.frame)) > f0 + 5 && (await S(p, (s) => s.d.pubs.length === 2)));
  ok('hygiena: coins na otevření pípy a číšníky v nové hospodě', await S(p, (s) => s.d.coins >= s.restartNeed()));
  await S(p, (s) => { s.awayObjs.forEach((o) => o.destroy()); s.awayObjs = []; s.d.pubIntro = 0; });
  // průvodce jako skutečný hráč: ťuká PRSTEM přesně tam, kam ukazuje šipka (u „Dál“ na tlačítko cedule)
  for (let k = 0; k < 10; k++) {
    await p.waitForTimeout(900);
    const xy = await S(p, (s) => {
      const g = s.guideCur; if (!g) return null;
      const st = s.guideSteps(g.id)[g.i];
      let r = st.at?.();
      if (st.done === 'ok') { const z = s.guideObjs.filter((o) => o.type === 'Zone').pop(); if (z) { const bd = z.getBounds(); r = [bd.x, bd.y, bd.width, bd.height]; } }
      if (!r) return [];
      const rc = game.canvas.getBoundingClientRect(), kk = rc.width / 540;
      return [rc.left + (r[0] + r[2] / 2) * kk, rc.top + (r[1] + r[3] / 2) * kk];
    });
    if (xy === null) break;
    if (xy.length) await p.touchscreen.tap(xy[0], xy[1]);
  }
  ok('hygiena: průvodce novou hospodou dokončen ťukáním prstem', await S(p, (s) => !s.guideCur && s.d.pubs[1].st.tap.lvl > 0 && s.d.pubs[1].st.tap.auto));
  ok('bez chyb v konzoli (hygiena)', p.errors.length === 0);
  if (p.errors.length) console.log(p.errors);
  await p.close();
}
// 6b2) hlášení: průvodce visel na „NAJMI ČÍŠNÍKY“, když hráč přepnul hospodu tažením a najal číšníky dřív
{
  const p = await page();
  await S(p, (s) => { s.d.tut = -1; s.tutShow(); s.d.run = 1e13; s.d.pubs[0].st.tap.lvl = 100; s.prestige(); });
  await p.waitForTimeout(1500);
  await S(p, (s) => { s.awayObjs.forEach((o) => o.destroy()); s.awayObjs = []; s.d.pubIntro = 0; });
  await p.waitForTimeout(1500);
  // přepnutí tažením (bez události „pub:1“), koupě pípy a najmutí dřív, než o tom průvodce ví
  await S(p, (s) => { s.sel = 1; s.d.coins = 1e6; s.d.pubs[1].st.tap = { lvl: 34, auto: true, prog: 0 }; });
  await p.waitForTimeout(2500);
  ok('průvodce nové hospody: splněné kroky přeskočí (nevisí)', await S(p, (s) => !s.guideCur || s.guideSteps(s.guideCur.id)[s.guideCur.i].done === 'ok'));
  // hlášení: v kroku NAJMI ČÍŠNÍKY přepnul na jinou hospodu → šipka mířila na prázdné místo; teď na záložku té hospody
  ok('průvodce: po přepnutí hospody šipka na záložku, po návratu na tlačítko', await S(p, (s) => {
    s.d.pubs[1].st.tap = { lvl: 1, auto: false, prog: 0 }; s.guideCur = { id: 'pub2', i: 2 }; s.guideShow();
    const st = s.guideSteps('pub2')[2];
    s.sel = 0; s.refresh(); const a = st.at();
    s.sel = 1; s.refresh(); const b = st.at();
    const tab = s.pubTabs[1];
    return !!a && a[0] === tab.x && a[1] === tab.y && !!b && b[1] > 400;
  }));
  ok('bez chyb v konzoli (průvodce přeskočí)', p.errors.length === 0);
  await p.close();
}
// 6c) první noc stojí, dokud hráč v průvodci neťukne na Dál
{
  const p = await page('?nightcycle=1');
  await S(p, (s) => { s.d.tut = -1; s.tutShow(); s.d.nightInfo = false; s.d.dn = { lvl: 0, v2: true }; s.d.dn.shift = window.__night.switchPhase(true); s.openShop('shop', false); });
  await p.waitForTimeout(3000);
  ok('první noc: běží a průvodce čeká na zavřené menu', await S(p, (s) => s.night && !s.guideCur && s.d.guideQ.includes('night')));
  ok('první noc: zatím neubývá', await p.evaluate(() => window.__night.phaseLeft() > 59_000 * 0.99 - 1000));
  await S(p, (s) => s.closeShop());
  await p.waitForTimeout(1500);
  await S(p, (s) => s.guideEv('ok'));
  await p.waitForTimeout(2500);
  ok('první noc: po Dál běží dál', await p.evaluate(() => window.__night.phaseLeft() < 58_500));
  ok('bez chyb v konzoli (první noc)', p.errors.length === 0);
  await p.close();
}
// 6d) převod uložení: starý strom 3×5 → velký strom (úroveň podle celkového XP, body vrácené)
{
  const p = await page();
  await S(p, (s) => { delete s.d.sk2; s.d.klvl = 6; s.d.xp = 0; s.d.skills = ['v1', 'v2', 's1']; s.d.tut = -1; });
  await p.reload();
  await p.waitForFunction(() => window.game?.scene?.getScene('Pub')?.d, null, { timeout: 15000 });
  await p.waitForTimeout(300);
  ok('převod skillů: nový strom, body vrácené', await S(p, (s) => s.d.sk2 && s.d.skills.length === 0 && s.d.klvl >= 10 && s.skillPoints() === s.d.klvl - 1));
  // mistrovství i offline: hodina pryč s obsluhou na pípě
  await S(p, (s) => { s.d.coins = 1e6; s.hire(0, s.cards[0].def); s.d.mast = {}; s.d.at = Date.now() - 3600_000; s.offline(); });
  ok('mistrovství roste i offline', await S(p, (s) => (s.d.mast.tap ?? 0) >= 3500));
  ok('bez chyb v konzoli (převod skillů)', p.errors.length === 0);
  if (p.errors.length) console.log(p.errors);
  await p.close();
}
// 6e) dotyky: žádné viditelné tlačítko hlavní obrazovky nesmí zakrývat neviditelný objekt; truhla jde ťuknout prstem
{
  for (const q of ['?night=0', '?pubs=3&night=0', '?night=1']) {
    const p = await page(q);
    await S(p, (s) => { s.d.tut = -1; s.tutShow(); s.d.chest = undefined; s.d.coins = 1e12; s.buy(0, s.cards[1].def); for (const c of s.cards) s.hire(0, c.def); s.d.pubs[0].mgr = true; s.chestHudDraw(); s.refresh(); });
    await p.waitForTimeout(1200);
    const bad = await S(p, (s) => {
      const cam = s.cameras.main, im = s.input.manager;
      const list = (s.input._list ?? []).filter((o) => im.inputCandidate(o, cam) && o.getBounds);
      return list.filter((o) => {
        const bd = o.getBounds();
        const hits = list.filter((x) => x.getBounds().contains(bd.centerX, bd.centerY));
        return hits.some((x) => x !== o && x.depth > o.depth);
      }).map((o) => `${o.type} ${Math.round(o.x)},${Math.round(o.y)}`);
    });
    ok(`dotyky ${q}: nic zakrytého`, bad.length === 0);
    if (bad.length) console.log(bad);
    if (q === '?night=0') {
      const xy = await S(p, (s) => { const z = s.chestHud.zone, rc = game.canvas.getBoundingClientRect(), k = rc.width / 540; return [rc.left + (z.x + 32) * k, rc.top + (z.y + 32) * k]; });
      await p.touchscreen.tap(xy[0], xy[1]);
      await p.waitForTimeout(400);
      ok('truhla: ťuknutí prstem otevře truhlu', await S(p, (s) => s.shopObjs.length > 0 && s.tab === 'chest'));
      // blesk (schopnost manažera): nejdřív bez manažera (tlačítko skryté), pak najmout → ťuknutí prstem spustí ×3
      await S(p, (s) => { s.closeShop(); s.d.pubs[0].mgr = false; s.d.pubs[0].boostReady = 0; s.d.pubs[0].boostUntil = 0; });
      await p.waitForTimeout(300);
      await S(p, (s) => { s.d.pubs[0].mgr = true; });
      await p.waitForTimeout(300);
      const bx = await S(p, (s) => { const b = s.skillBtns[0], rc = game.canvas.getBoundingClientRect(), k = rc.width / 540; return [rc.left + (b.x + b.w / 2) * k, rc.top + (b.y + b.h / 2) * k]; });
      await p.touchscreen.tap(bx[0], bx[1]);
      await p.waitForTimeout(300);
      ok('blesk: po najmutí manažera ťuknutí prstem spustí Šťastnou hodinu', await S(p, (s) => s.boosted(s.d.pubs[0])));
    }
    await p.close();
  }
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
  await S(p, (s) => { s.d.tut = -1; s.d.coins = 0; s.d.pubs[0].st.tap.lvl = 30; s.manual(0, s.cards[0].def); });
  await p.waitForFunction(() => (game.scene.getScene('Pub').d.bones ?? 0) > 0, null, { timeout: 8000 }).catch(() => undefined);
  ok('noc: pípa vydělala kosti', await S(p, (s) => s.d.bones > 0 && s.d.coins === 0));
  await S(p, (s) => { s.d.bones = 1e6; s.shopSub = 'bones'; s.openShop('shop', false); s.shopObjs.filter((o) => o.type === 'Zone').find((z) => z.x === 10 && z.y > 416).emit('pointerdown'); });
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
  // styl hospody + zásobování: Pajzl s pípou na 50 = Pivnice a zásobuje vyšší hospody
  const r0 = await S(p, (s) => { s.d.pubs.forEach((q) => ['tap', 'kitchen', 'cellar', 'dice'].forEach((k) => (q.st[k] = { lvl: 10, auto: true, prog: 0 }))); return s.pay(s.d.pubs[2], s.cards[0].def); });
  await S(p, (s) => { s.d.pubs[0].st.tap.lvl = 50; s.selectPub(0); s.refresh(); });
  ok('styl: Pajzl je Pivnice, svítí cedule stylu (karta je bez textu – návrh 4)', await S(p, (s) => s.styleSign.a.visible));
  ok('zásobování: pípa v Žabákovi vydělává víc', await S(p, (s, r) => s.pay(s.d.pubs[2], s.cards[0].def) > r * 1.25, r0));
  await S(p, (s) => { s.d.pubs[1].st.dice.lvl = 50; s.refresh(); });
  ok('styly: 2 různé styly = +25 % všude', await S(p, (s) => s.styleSign.b.text.includes('25')));
  // průvodce: nová hospoda – záložka, nákup pípy, číšníci, rozumím
  await S(p, (s) => { s.d.tut = -1; s.d.guideQ = ['pub2']; s.d.pubs[1].st.tap = { lvl: 0, auto: false, prog: 0 }; s.selectPub(0); s.guideStart(); s.selectPub(1); });
  await p.waitForTimeout(400);
  await S(p, (s) => { s.d.coins = 1e9; s.buy(1, s.cards[0].def); s.hire(1, s.cards[0].def); });
  await p.waitForTimeout(400);
  await S(p, (s) => s.guideEv('ok'));
  ok('průvodce: nová hospoda projde a uloží se', await S(p, (s) => !s.guideCur && s.d.guides.includes('pub2') && !s.d.guideQ.length));
  ok('bez chyb v konzoli (3 hospody)', p.errors.length === 0);
  await p.close();
}
// 9) speciální nabídka: denní truhla, reklamní kampaň, VIP host
{
  const p = await page('?fakeads=1');
  await S(p, (s) => { s.d.tut = -1; s.d.coins = 1e6; s.buy(0, s.cards[1].def); s.hire(0, s.cards[0].def); s.chestHudDraw(); });
  ok('truhla: ikona v hospodě svítí', await S(p, (s) => s.chestHud.img.visible));
  await S(p, (s) => s.openShop('chest', false));
  ok('truhla: záložka se otevře', await S(p, (s) => s.shopObjs.length > 20));
  await p.evaluate(() => game.scene.getScene('Pub').chestOpen(false));
  ok('truhla: 1. den otevřen, ikona zmizí', await S(p, (s) => s.d.chest.day === 1 && !s.chestHud.img.visible));
  await S(p, (s) => { const y = new Date(); y.setDate(y.getDate() - 1); s.d.chest = { day: 6, last: `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}` }; window.k0 = s.d.krigle; });
  await p.evaluate(() => game.scene.getScene('Pub').chestOpen(true));
  ok('truhla: 7. den zlatá ×2 = 6 krígel a body číšníkům', await S(p, (s) => s.d.chest.day === 7 && s.d.krigle - window.k0 === 6 && s.d.pubs[0].w.every((w) => w.xp >= 40000)));
  await S(p, (s) => { s.openShop('special', false); window.p0 = s.pay(s.d.pubs[0], s.cards[0].def); });
  await p.evaluate(() => game.scene.getScene('Pub').adWatchNow());
  ok('kampaň: výdělek ×1,22 po 1. zhlédnutí', await S(p, (s) => Math.abs(s.pay(s.d.pubs[0], s.cards[0].def) / window.p0 - 1.22) < 1e-6));
  await S(p, (s) => { s.d.vip = { next: Date.now() - 1000, until: 0 }; s.vipT = 0; });
  await p.waitForTimeout(1500);
  ok('VIP: přišel a čeká', await S(p, (s) => !!s.vipSpr && s.d.vip.until > Date.now()));
  ok('VIP: ťuknutí ho obslouží a dá výdělek', await S(p, (s) => { const e = s.d.earned; s.vipServeNow(); return !s.vipSpr && s.d.earned > e && s.d.vip.until === 0; }));
  ok('upozornění: VIP a truhla naplánované', await S(p, (s) => { const n = s.notes().map((x) => x.id); return n.includes(5) && n.includes(3); }));
  ok('bez chyb v konzoli (speciální nabídka)', p.errors.length === 0);
  await p.close();
}
// 10) diamanty a Štamgast
{
  const p = await page('?fakeshop=1');
  await S(p, (s) => { s.d.tut = -1; s.d.coins = 1e6; s.buy(0, s.cards[1].def); s.hire(0, s.cards[0].def); s.d.gems = 0; s.spSub = 'gems'; s.openShop('special', false); });
  await p.evaluate(() => game.scene.getScene('Pub').iapBuy('gems550'));
  ok('diamanty: balíček připsán', await S(p, (s) => s.d.gems === 550));
  ok('diamanty: časoskok 4 h dá výdělek, liga se nemění', await S(p, (s) => { const c = s.d.coins, l = s.d.league?.me ?? 0; s.gemBuy('skip4'); return s.d.coins > c && s.d.gems === 530 && (s.d.league?.me ?? 0) === l; }));
  ok('diamanty: VIP vrátný napořád', await S(p, (s) => { s.d.gems += 600; return s.gemBuy('vipdoor') && s.d.own.includes('vipdoor') && !s.gemBuy('vipdoor'); }));
  ok('diamanty: offline II až po offline I, +2 h za stupeň', await S(p, (s) => { s.d.gems = 2000; const c0 = s.offCap(); const no2 = !s.gemBuy('off2'); s.gemBuy('off1'); s.gemBuy('off2'); return no2 && s.offCap() - c0 === 4 * 3600; }));
  ok('diamanty: Pivní kronika +10 % výdělku', await S(p, (s) => { s.d.gems = 2000; const r0 = s.pay(s.d.pubs[0], s.cards[0].def); s.gemBuy('chronicle'); s.tsCache = undefined; return Math.abs(s.pay(s.d.pubs[0], s.cards[0].def) / r0 - 1.1) < 0.02; }));
  ok('diamanty: šťastná hodina hned', await S(p, (s) => { const pb = s.d.pubs[0]; pb.mgr = true; pb.boostUntil = 0; pb.boostReady = Date.now() + 3600e3; s.d.gems = 10; return s.gemBuy('hhnow') && pb.boostReady === 0 && s.d.gems === 5; }));
  await S(p, (s) => { window.p0 = s.pay(s.d.pubs[0], s.cards[0].def); });
  await p.evaluate(() => game.scene.getScene('Pub').iapBuy('pass'));
  ok('Štamgast: výdělek ×2', await S(p, (s) => Math.abs(s.pay(s.d.pubs[0], s.cards[0].def) / window.p0 - 2) < 1e-6));
  ok('Štamgast: denní diamanty jednou za den', await S(p, (s) => { const g = s.d.gems; s.passClaim(); s.passClaim(); return s.d.gems === g + 20; }));
  await S(p, (s) => { s.d.vip = { next: Date.now() - 1000, until: Date.now() - 10 }; s.vipT = 0; window.e0 = s.d.earned; });
  await p.waitForTimeout(800);
  ok('VIP vrátný obslouží nestihnutého VIP', await S(p, (s) => s.d.earned > window.e0));
  for (const sub of ['offer', 'gems', 'pass']) {
    await S(p, (s, x) => { s.spSub = x; s.openShop('special', false); }, sub);
    ok(`speciální nabídka: záložka ${sub}`, await S(p, (s) => s.shopObjs.length > 15));
  }
  ok('bez chyb v konzoli (diamanty)', p.errors.length === 0);
  await p.close();
}
await b.close();
await server.close();
console.log(fails ? `\n${fails} testů selhalo` : '\nvšechny testy prošly');
process.exit(fails ? 1 : 0);
