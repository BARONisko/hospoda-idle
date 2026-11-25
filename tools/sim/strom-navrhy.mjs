// Tři návrhy nového stromu dovedností hostinského (25. 11. 2026) – jen návrh, ve hře zatím není.
// Počítá tempo na rok: kdy hráč dostane první schopnost, vrcholy cest, kolik stromu má po 7/30/100/365 dnech
// a kolik mu strom přidá k výdělku (odhad v „procentech výdělku“: každý stat má váhu W, schopnost má odhad ABIL).
// Pro srovnání je tu i dnešní strom (D). Body za den bere z tools/sim/skills.mjs.
// Spuštění: node tools/sim/strom-navrhy.mjs        Jako modul: treeMult('A', 'běžný', den) → násobek pro days.mjs (TREE=A|B|C|D).

const PTS = { slabší: [17, 43, 117, 209, 369], běžný: [37, 113, 212, 347, 610], zapálený: [86, 185, 315, 486, 749] };
const PD = [1, 7, 30, 100, 365];
export const ptsAt = (who, d) => {
  const a = PTS[who];
  if (d <= 1) return a[0] * d;
  for (let i = 1; i < PD.length; i++) if (d <= PD[i]) return a[i - 1] + ((a[i] - a[i - 1]) * (d - PD[i - 1])) / (PD[i] - PD[i - 1]);
  return a[4] + ((a[4] - a[3]) / 265) * (d - 365);
};
// váha statu = kolik z něj je „výdělku“ (odhad), offline je v hodinách (8 h = 100 %, hráč offline ~30 %)
const W = { income: 1, tips: 0.5, crit: 1, cycle: 1, beer: 0.3, mgrcd: 0.3, krigly: 0.3, staff: 0.3, events: 0.3, evfreq: 0.3,
  nighttips: 0.3, brew: 0.2, bones: 0.1, decor: 0.1, luck: 0.1, xp: 0.1, gxp: 0, offline: 0.04 };
// odhad schopností jako výdělek: vrchol cesty 8 %, volba / cech / karta 3 %, klíčový kámen 4 %, hvězda dnešního stromu 2 %
const ABIL = { cap: 0.08, pick: 0.03, guild: 0.03, key: 0.04, card: 0.03, star: 0.02 };
const ab = (n) => (n.cap ? ABIL.cap : n.pick ? ABIL.pick : n.guild ? ABIL.guild : n.key ? ABIL.key : n.star1 ? ABIL.card : n.star ? ABIL.star : 0);
const isAbility = (n) => ab(n) > 0;
const val = (stat, v) => W[stat] * v;

// D) DNEŠNÍ STROM (src/core/skilltree.ts): 3 × 40 uzlů, stezka 28 + 6 odboček po 2
function designD() {
  const SMALL = [[['income', 0.006], ['tips', 0.009], ['gxp', 0.009], ['beer', 0.008], ['crit', 0.003], ['mgrcd', 0.005]],
    [['cycle', 0.004], ['offline', 0.1], ['brew', 0.008], ['krigly', 0.006], ['staff', 0.008], ['decor', 0.008]],
    [['bones', 0.009], ['events', 0.009], ['evfreq', 0.005], ['luck', 0.009], ['nighttips', 0.009], ['xp', 0.009]]];
  const MID = [[['income', 0.025], ['tips', 0.03]], [['cycle', 0.02], ['krigly', 0.025]], [['bones', 0.03], ['events', 0.03]]];
  const N = [];
  for (let b = 0; b < 3; b++) {
    let si = 0, mi = 0;
    const k = 'vsn'[b];
    for (let i = 0; i < 28; i++) {
      const cost = [2, 5, 8][Math.floor(i / 10)];
      const n = { id: `${k}${i}`, cost, need: i ? [`${k}${i - 1}`] : [], inc: 0, branch: b };
      if ([6, 13, 20, 27].includes(i)) (n.star = true), (n.cost += 6), i === 27 && (n.cap = true);
      else { const [s, v] = i % 5 === 4 ? MID[b][mi++ % 2] : SMALL[b][si++ % 6]; n.inc = val(s, v); n.lvl = s === 'offline' ? 0 : v; }
      N.push(n);
      if ([2, 8, 11, 16, 22, 25].includes(i)) for (let f = 1; f <= 2; f++) {
        const [s, v] = f === 2 ? MID[b][mi++ % 2] : SMALL[b][si++ % 6];
        N.push({ id: `${k}${i}f${f}`, cost, need: [f === 1 ? `${k}${i}` : `${k}${i}f1`], inc: val(s, v), lvl: s === 'offline' ? 0 : v, branch: b, path: false });
      }
    }
  }
  return N;
}

// A) TŘI CECHY: 3 cesty po 8 patrech – řemeslo (5 úrovní) / volba 1 ze 2 / řemeslo / volba / řemeslo / volba / řemeslo / vrchol.
// Patro se otevře, když máš aspoň 1 úroveň (nebo jednu volbu) v patře pod ním. Nad třemi vrcholy koruna.
function designA() {
  const CRAFT = [
    [['income', 0.005], ['tips', 0.009], ['crit', 0.003], ['income', 0.005]],
    [['krigly', 0.008], ['cycle', 0.004], ['brew', 0.009], ['staff', 0.009]],
    [['bones', 0.009], ['nighttips', 0.009], ['events', 0.009], ['xp', 0.009]],
  ];
  const RC = [2, 4, 7, 11], CC = [8, 14, 22], CAP = 60;
  // patro f (0–7) se otevře, až máš v cestě utraceno aspoň G[f] bodů (jako u talentů: nejde jen proběhnout k vrcholu)
  const G = [0, 5, 15, 30, 50, 75, 100, 140];
  const N = [];
  for (let b = 0; b < 3; b++) {
    const k = 'vsn'[b];
    let gate = [];
    for (let f = 0; f < 4; f++) {
      const [s, v] = CRAFT[b][f];
      for (let r = 1; r <= 5; r++)
        N.push({ id: `${k}r${f}_${r}`, cost: RC[f], inc: val(s, v), lvl: v, branch: b, path: r === 1, gate: r === 1 ? G[2 * f] : 0, ...(r === 1 ? { any: gate } : { need: [`${k}r${f}_${r - 1}`] }) });
      if (f < 3) {
        const a = `${k}c${f}a`, c = `${k}c${f}b`;
        N.push({ id: a, cost: CC[f], pick: true, excl: c, need: [`${k}r${f}_1`], branch: b, path: true, gate: G[2 * f + 1] });
        N.push({ id: c, cost: CC[f], pick: true, excl: a, need: [`${k}r${f}_1`], branch: b, path: false, gate: G[2 * f + 1] });
        gate = [a, c];
      }
    }
    N.push({ id: `${k}cap`, cost: CAP, cap: true, need: [`${k}r3_1`], branch: b, path: true, gate: G[7] });
  }
  N.push({ id: 'crown', cost: 40, cap: true, need: ['vcap', 'scap', 'ncap'], branch: 3, path: true });
  return N;
}

// B) DESKA PODNIKU: mřížka 7 sloupců, dlaždice jde koupit vedle koupené; cena roste s výškou.
// Výčep vlevo, Sklep uprostřed, Noc vpravo, 3 vodorovné spojky. o = obyčejná, C = cech (schopnost), K = klíčový kámen, R = koruna.
export const MAP_B = [
  'R..R..R', // 13 koruny
  'o..o..o',
  'Co.K.oC',
  'o..o..o',
  'oooCooo', //  9 spojka
  'K..o..K',
  'o..o..o',
  'Co.C.oC',
  'o..o..o',
  'ooKoKoo', //  4 spojka
  'C..o..C',
  'o..C..o',
  'ooooooo', //  1 spojka
  '...S...', //  0 hostinský
].reverse();
function designB() {
  const STAT = [[['income', 0.006], ['tips', 0.009], ['crit', 0.003]], [['cycle', 0.004], ['krigly', 0.008], ['brew', 0.009]], [['bones', 0.009], ['events', 0.009], ['nighttips', 0.009]]];
  const cell = (x, y) => MAP_B[y]?.[x];
  const N = [];
  let i = 0;
  for (let y = 0; y < MAP_B.length; y++)
    for (let x = 0; x < 7; x++) {
      const c = cell(x, y);
      if (!c || c === '.') continue;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => cell(a, b) && cell(a, b) !== '.').map(([a, b]) => `${a},${b}`);
      const area = x < 2 ? 0 : x > 4 ? 2 : 1;
      const base = 2 + y;
      const n = { id: `${x},${y}`, nb, branch: area, y, inc: 0 };
      if (c === 'S') Object.assign(n, { cost: 0, start: true });
      else if (c === 'o') { const [s, v] = STAT[area][i++ % 3]; Object.assign(n, { cost: base, inc: val(s, v), lvl: v }); }
      else if (c === 'C') Object.assign(n, { cost: 2 * base + 4, guild: true });
      else if (c === 'K') Object.assign(n, { cost: 2 * base, key: true });
      else if (c === 'R') Object.assign(n, { cost: 50, cap: true });
      N.push(n);
    }
  return N;
}

// C) KUMPÁNI U STOLU: 18 karet (6 na Výčep / Sklep / Noc), každá ★1–★5. U stolu sedí jen 3–8 karet (místa přibývají
// podle bodů získaných celkem). ★1 = schopnost karty, ★2–★5 = +0,5–0,9 % jejího statu. Parta 3 stejné barvy = bonus.
export const SEATS = [0, 60, 150, 260, 400, 600]; // 3 místa od začátku, další při tolika získaných bodech
const seatsAt = (earned) => 2 + SEATS.filter((p) => earned >= p).length;
function designC() {
  const ST = [['income', 0.008], ['krigly', 0.009], ['nighttips', 0.009]];
  const COST = [8, 14, 20], UP = [3, 6, 9, 13];
  const N = [];
  for (let c = 0; c < 3; c++)
    for (let i = 0; i < 6; i++) {
      const k = `${'vsn'[c]}${i}`, tier = Math.floor(i / 2);
      N.push({ id: `${k}_1`, cost: COST[tier], card: k, branch: c, star1: true, unlockDay: [0, 3, 14][tier] });
      for (let s = 2; s <= 5; s++) N.push({ id: `${k}_${s}`, cost: UP[s - 2], inc: val(...ST[c]), lvl: ST[c][1], card: k, branch: c, need: [`${k}_${s - 1}`] });
    }
  return N;
}

/** nejvíc bodů, co jde do stromu dát (u A jen jedna z každé dvojice voleb) */
const maxSpend = (nodes) => nodes.filter((n) => !(n.pick && n.path === false)).reduce((a, n) => a + n.cost, 0);

export const DESIGNS = { D: designD(), A: designA(), B: designB(), C: designC() };

function can(D, n, own, day) {
  if (own.has(n.id)) return false;
  if (n.excl && own.has(n.excl)) return false;
  if (n.need && !n.need.every((x) => own.has(x))) return false;
  if (n.any && n.any.length && !n.any.some((x) => own.has(x))) return false;
  if (D === 'B' && !n.start && !n.nb.some((x) => own.has(x))) return false;
  if (D === 'C' && (n.unlockDay ?? 0) > day) return false;
  if (n.gate && DESIGNS[D].filter((x) => x.branch === n.branch && own.has(x.id)).reduce((a, x) => a + x.cost, 0) < n.gate) return false;
  return true;
}

/** výdělek ze stromu (u C jen karty u stolu – sedí ty nejsilnější) */
function incomeOf(D, own, earned) {
  const nodes = DESIGNS[D].filter((n) => own.has(n.id));
  if (D !== 'C') return nodes.reduce((a, n) => a + (n.inc ?? 0) + ab(n), 0);
  const by = {};
  for (const n of nodes) by[n.card] = (by[n.card] ?? 0) + (n.inc ?? 0) + ab(n);
  return Object.values(by).sort((a, b) => b - a).slice(0, seatsAt(earned)).reduce((a, b) => a + b, 0);
}

/**
 * Hráč den po dni utrácí body. mode 'mix' = běžné chování (kupuje nejlevnější, schopnost má přednost, když na ni má),
 * mode 'spěch' = jde rovnou po cestě k dalšímu vrcholu (u B nahoru, u C nové karty, dokud jsou místa).
 */
function simulate(D, who, mode, days = 365) {
  const nodes = DESIGNS[D];
  const own = new Set(nodes.filter((n) => n.start).map((n) => n.id));
  let spent = 0, first = null, abil = 0;
  const caps = [], curve = [1], hist = {};
  const total = maxSpend(nodes);
  for (let day = 1; day <= days; day++) {
    const earned = ptsAt(who, day);
    for (;;) {
      const bank = earned - spent;
      const opts = nodes.filter((n) => can(D, n, own, day));
      if (!opts.length) break;
      let p;
      if (D === 'C') {
        const cards = nodes.filter((n) => own.has(n.id) && n.star1).length;
        const nc = opts.filter((n) => n.star1).sort((a, b) => a.cost - b.cost)[0];
        const up = opts.filter((n) => !n.star1).sort((a, b) => a.cost - b.cost)[0];
        p = cards < seatsAt(earned) + (mode === 'spěch' ? 2 : 0) && nc ? nc : up ?? nc;
      } else if (mode === 'spěch') {
        if (D === 'B') p = opts.sort((a, b) => b.y - a.y || isAbility(b) - isAbility(a) || a.cost - b.cost)[0];
        else {
          const br = [0, 1, 2, 3].find((b) => nodes.some((n) => n.branch === b && n.cap && !own.has(n.id)));
          p = opts.filter((n) => n.branch === br && n.path).sort((a, b) => a.cost - b.cost)[0] ?? opts.filter((n) => n.branch === br).sort((a, b) => a.cost - b.cost)[0] ?? opts.sort((a, b) => a.cost - b.cost)[0];
        }
      } else {
        const a = opts.filter(isAbility).sort((x, y) => x.cost - y.cost)[0];
        p = a && a.cost <= bank ? a : opts.sort((x, y) => x.cost - y.cost || (y.inc ?? 0) - (x.inc ?? 0))[0];
      }
      if (!p || p.cost > bank) break;
      own.add(p.id);
      spent += p.cost;
      if (isAbility(p)) (abil++, (first ??= day));
      if (p.cap) caps.push(day);
    }
    curve.push(1 + incomeOf(D, own, earned));
    if ([7, 30, 100, 365].includes(day)) hist[day] = { pct: Math.round((100 * spent) / total), inc: incomeOf(D, own, earned), abil };
  }
  return { first, caps, hist, total, curve };
}

/** násobek výdělku ze stromu pro tools/sim/days.mjs */
export function treeMult(D, who, day) {
  const key = `${D}|${who}`;
  treeMult.c ??= {};
  treeMult.c[key] ??= simulate(D, who, 'mix', 800).curve;
  const c = treeMult.c[key];
  return c[Math.min(c.length - 1, Math.max(0, Math.floor(day)))];
}

if (process.argv[1]?.endsWith('strom-navrhy.mjs')) {
  const NAMES = { D: 'DNES (120 uzlů, stezky)', A: 'A) Tři cechy (patra s volbou)', B: 'B) Deska podniku (mřížka, kameny)', C: 'C) Kumpáni u stolu (karty + místa)' };
  for (const D of ['D', 'A', 'B', 'C']) {
    const nodes = DESIGNS[D];
    const maxLvl = Math.max(...nodes.map((n) => n.lvl ?? 0));
    const vis = D === 'A' ? new Set(nodes.map((n) => n.id.replace(/_\d$/, ''))).size : D === 'C' ? 18 : nodes.filter((n) => !n.start).length;
    const full = nodes.filter((n) => !(n.pick && n.path === false)).reduce((a, n) => a + (n.inc ?? 0) + ab(n), 0);
    console.log(`\n${NAMES[D]}: ${vis} uzlů na obrazovce, ${nodes.filter(isAbility).length} schopností, celkem ${maxSpend(nodes)} bodů, max ${(maxLvl * 100).toFixed(1)} % za úroveň, celý strom ≈ +${(full * 100).toFixed(0)} % výdělku`);
    for (const who of Object.keys(PTS)) {
      const m = simulate(D, who, 'mix'), s = simulate(D, who, 'spěch');
      const h = m.hist;
      console.log(`  ${who.padEnd(9)} 1. schopnost den ${m.first ?? '–'} · vrcholy (spěch) dny ${s.caps.join(', ') || '–'} · strom po 7/30/100/365 d: ${[7, 30, 100, 365].map((d) => h[d].pct + ' %').join(' / ')} · schopností ${[7, 30, 100, 365].map((d) => h[d].abil).join('/')} · výdělek ze stromu ${[30, 365].map((d) => '+' + (h[d].inc * 100).toFixed(0) + ' %').join(' → ')}`);
    }
  }
}
