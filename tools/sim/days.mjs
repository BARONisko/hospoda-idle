// Délka hry ve dnech pro slabšího / běžného / zapáleného hráče, včetně offline výdělku a bonusů, které tools/sim/sim.ts
// sám nezná (Chrám, pivovar, strom hostinského, ligový pohár, Zlatý výčep, výzdoba, reklama).
// Spuštění: CHAIN=1 node tools/sim/run.mjs && node tools/sim/days.mjs      (STARE=1 = bonusy Výčepu a Chrámu před 25. 11.,
// DAYS=60 = kolik dní; pozdní kola jsou pomalá na výpočet, rok trvá desítky minut)
// Odhad, ne přesný výpočet – předpoklady jsou v P níže a v komentářích. Pass a 💎 nepočítá (hráč zdarma).
process.env.CHAIN = '1';
const { run, MENU_HYG, PRESTIGE_GROW, PRESTIGE_MIN, PRESTIGE_FIRST, prestigeMin, SEAL, VYCEP, vycepCost } = await import('../_tmp/sim.mjs');

const STARE = !!process.env.STARE;
// TREE=D|A|B|C: strom hostinského podle tools/sim/strom-navrhy.mjs (D = dnešní strom spočítaný po uzlech) místo hrubých +10 %
const TREE = process.env.TREE ?? 'A'; // od 25. 11. 2026 je ve hře strom A (Tři cechy); TREE=0 = staré hrubé +10 %
const { treeMult } = TREE !== '0' ? await import('./strom-navrhy.mjs') : {};
const kf = (r, p) => Math.floor(2 * (r / (1e5 * 10 ** (p - 1))) ** 0.25);
const goalOf = (n) => prestigeMin(n);
// body stromu hostinského (tools/sim/skills.mjs, dny 1/7/30/100/365) → podíl stromu; celý strom ≈ +10 % výdělku (cesta Výčep)
const PTS = { slabší: [17, 43, 117, 209, 369], běžný: [37, 113, 212, 347, 610], zapálený: [86, 185, 315, 486, 749] };
const PD = [1, 7, 30, 100, 365];
const pts = (who, d) => {
  const a = PTS[who];
  if (d <= 1) return a[0] * d;
  for (let i = 1; i < PD.length; i++) if (d <= PD[i]) return a[i - 1] + ((a[i] - a[i - 1]) * (d - PD[i - 1])) / (PD[i] - PD[i - 1]);
  return a[4];
};
// sess = sezení za den, act = s aktivní hry v sezení, off = účinnost offline (hráč mezitím nekupuje), boss = poražený boss
// každý n-tý víkend, brew = úrovní pivovaru za den, ads = průměrný bonus reklamy, cup = průměrný ligový pohár
const P = [
  { who: 'slabší', sess: 2, act: 450, off: 0.3, boss: 2, brew: 0.5, ads: 0, cup: 0.05 },
  { who: 'běžný', sess: 4, act: 900, off: 0.3, boss: 1, brew: 1, ads: 0.1, cup: 0.1 },
  { who: 'zapálený', sess: 8, act: 1800, off: 0.3, boss: 1, brew: 2, ads: 0.2, cup: 0.12 },
];
const OFF_CAP = 8 * 3600;
const cache = new Map();
// zrychlení: krígly a bonusy zaokrouhlené (krígly na 2 %, bonusy na 5 %) → výsledky se opakují z mezipaměti
const q = (x, st) => (x < 50 ? x : Math.round(Math.exp(Math.round(Math.log(x) / st) * st)));
const roundT = (pubs, k, goal, m) => {
  const kq = q(k, 0.02), mq = Math.exp(Math.round(Math.log(m) / 0.05) * 0.05);
  const key = `${pubs}|${kq}|${goal}|${mq.toFixed(3)}`;
  if (!cache.has(key)) {
    const t0 = Date.now();
    const t = run(pubs, kq, 60 * 3600, goal, kf, mq);
    if (process.env.DEBUG) console.error(`run ${pubs} k${kq} cíl ${goal} ×${mq.toFixed(2)} → ${typeof t === 'number' ? (t / 60).toFixed(0) + ' min' : '∞'} (${Date.now() - t0} ms)`);
    cache.set(key, typeof t === 'number' ? t : Infinity);
  }
  return cache.get(key);
};

for (const pl of P) {
  let n = 0, k = 0, held = 0, pubs = 1, cth = 0, prog = 0, T = 0, goal = 0;
  const unlock = {}, log = [];
  let templeDay = null, decorDay = null, leagueDay = null;
  const mult = (day) => {
    const bosses = templeDay === null ? 0 : Math.floor((day - templeDay) / 7 / pl.boss);
    const seal = 1 + (STARE ? 0.1 : SEAL) * bosses;
    const brew = n >= MENU_HYG.brew ? 1 + 0.009 * pl.brew * day : 1;
    const tree = n >= 2 ? (TREE !== '0' ? treeMult(TREE, pl.who, day) : 1 + (0.1 * pts(pl.who, day)) / 654) : 1;
    const cup = leagueDay === null ? 1 : 1 + pl.cup;
    const vy = STARE ? (cth ? 1.25 + 0.25 * cth : 1) : 1 + VYCEP * cth;
    const decor = decorDay === null ? 1 : (1.1 * (day - decorDay >= 7 ? 1.25 : 1));
    return seal * brew * tree * cup * vy * decor * (1 + pl.ads);
  };
  const newRound = (day) => {
    goal = goalOf(n); // laťka podle čísla hygieny (od 25. 11. 2026, dřív 7 % držených krígel)
    T = roundT(pubs, k, goal, mult(day));
    prog = 0;
  };
  newRound(0);
  const DAYS = Number(process.env.DAYS ?? 60);
  const marks = [1, 3, 7, 14, 30, 60, 100, 365].filter((d) => d <= DAYS);
  for (let day = 0; day < DAYS; day++) {
    for (let s = 0; s < pl.sess; s++) {
      const now = day + s / pl.sess;
      if (day || s) prog = Math.min(T, prog + pl.off * Math.min(OFF_CAP, (86400 - pl.sess * pl.act) / pl.sess));
      let a = pl.act;
      while (a > 0) {
        const need = T - prog;
        if (need > a) { prog += a; break; }
        a -= Math.max(0, need);
        // hygiena
        n++; k += goal; held += goal; pubs = Math.min(3, pubs + 1);
        for (const [key, h] of Object.entries(MENU_HYG)) if (n === h) unlock[key] = now;
        if (n === MENU_HYG.temple) templeDay = now;
        if (n === MENU_HYG.decor) decorDay = now;
        if (n === MENU_HYG.league) leagueDay = now;
        // Zlatý výčep: utratí za něj nejvýš čtvrtinu držených krígel
        const vc = STARE ? (c) => Math.ceil(300 * 3 ** c) : vycepCost;
        while (n >= MENU_HYG.krigl && vc(cth) <= 0.25 * held) held -= vc(cth), cth++;
        newRound(now);
      }
    }
    if (T === Infinity) { log.push(`den ${day + 1}: kolo přes 60 h aktivní hry – konec výpočtu`); break; }
    if (marks.includes(day + 1)) log.push(`den ${day + 1}: ${n} hygien, kolo ${(T / 3600).toFixed(1)} h, krígel ${k}, výčep ${cth}, bonusy ×${mult(day + 1).toFixed(2)}`);
  }
  const u = Object.entries(MENU_HYG).map(([key, h]) => `${key} (${h}.) ${unlock[key] === undefined ? '–' : 'den ' + (unlock[key] + 1).toFixed(1)}`).join(', ');
  console.log(`${pl.who}${STARE ? ' [STARÉ bonusy]' : ''}\n  odemčení: ${u}\n  ${log.join('\n  ')}`);
}
