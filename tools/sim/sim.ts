// Simulace průběhu hry: „chamtivý“ hráč kupuje vždy to, co se nejrychleji vrátí (úroveň, kostlivec, vylepšení).
// Spuštění: node tools/sim/run.mjs   → časy do milníků (1K, 1M, první prestiž…) pro 1.–3. hospodu.
import { crew, beersPerCycle, START_CREW, hireCost, upCost, UP_MAX, WAITER_MAX, type WaiterState, type WaiterUp } from '../../src/core/waiters';
import { milestoneCount } from '../../src/core/economy';
import { STATIONS, StationDef, payout, cost, actMult, UPGRADES, upMult, kriglyFor, KRIGL_BONUS, PRESTIGE_MIN, PRESTIGE_FIRST } from '../../src/core/economy';

interface St { lvl: number; auto: boolean }
const fmt = (s: number) => (s < 3600 ? `${(s / 60).toFixed(1)} min` : `${(s / 3600).toFixed(2)} h`);

export function run(pubs: number, krigle: number, maxT = 6 * 3600) {
  const st: St[][] = Array.from({ length: pubs }, (_, i) => STATIONS.map((d) => ({ lvl: d.id === 'tap' && i === 0 ? 1 : 0, auto: false })));
  const up: string[] = [];
  // číšníci: první nastoupí s kostlivcem na pípě, pípa vydělá jen to, co roznesou
  const ws: WaiterState[][] = Array.from({ length: pubs }, () => []);
  let coins = 0, run = 0, t = 0;
  const marks: Record<string, number> = {};
  const kb = 1 + KRIGL_BONUS * krigle;
  const pay = (p: number, d: StationDef, s: St) => payout(d, Math.max(1, s.lvl)) * actMult(p + 1) * upMult(up, p + 1, d.id) * kb;
  const rate = () => {
    let r = 0;
    st.forEach((ps, p) => ps.forEach((s, i) => {
      const d = STATIONS[i];
      if (s.lvl > 0 && i === 0 && s.auto && WAITERS_ON) {
        const c = crew(ws[p]);
        r += (pay(p, d, s) / d.cycle) * Math.min(1, (c.rate * d.cycle) / beersPerCycle(milestoneCount(s.lvl))) * (1 + c.tip);
      } else if (s.lvl > 0 && (s.auto || (i === 0 && p === 0))) r += pay(p, d, s) / d.cycle; // pípu hráč ťuká ručně (jen v 1. hospodě), než má kostlivce
    }));
    return r;
  };
  while (t < maxT) {
    // nákupy: nejlepší poměr přírůstek výdělku / cena
    for (;;) {
      const r0 = rate();
      let best: { gain: number; price: number; act: () => void } | null = null;
      const consider = (price: number, act: () => void, undo: () => void) => {
        act();
        const g = rate() - r0;
        undo();
        const score = g / price;
        if (g > 0 && (!best || score > best.gain / best.price)) best = { gain: g, price, act };
      };
      st.forEach((ps, p) => ps.forEach((s, i) => {
        const d = STATIONS[i];
        consider(cost(d, s.lvl) * actMult(p + 1), () => s.lvl++, () => s.lvl--);
        if (s.lvl > 0 && !s.auto) consider(d.staff * actMult(p + 1), () => ((s.auto = true), i === 0 && ws[p].push(...START_CREW())), () => ((s.auto = false), i === 0 && ws[p].splice(0)));
      }));
      if (WAITERS_ON) ws.forEach((list, p) => {
        if (!list.length) return;
        if (list.length < WAITER_MAX) consider(hireCost(list.length) * actMult(p + 1), () => list.push({ s: 0, t: 0, m: 0 }), () => list.pop());
        for (const w of list) for (const k of ['s', 't', 'm'] as WaiterUp[]) if (w[k] < UP_MAX[k]) consider(upCost(k, w[k]) * actMult(p + 1), () => w[k]++, () => w[k]--);
      });
      for (const u of UPGRADES) {
        if (u.act > pubs || up.includes(u.id)) continue;
        if (u.tier > 1 && !up.includes(`${u.act}_${u.station}_${u.tier - 1}`)) continue;
        consider(u.cost, () => up.push(u.id), () => up.pop());
      }
      // levné „otevření“ stanice (bez okamžitého přínosu) – když nic jiného
      const b = best as { gain: number; price: number; act: () => void } | null;
      if (!b || b.price > coins) {
        // počkej na peníze, ale nejdéle 2 min výdělku
        break;
      }
      coins -= b.price;
      b.act();
    }
    // návod vede hráče ke kostlivci na pípě hned za 50 coins (pak už pípu neťuká)
    st.forEach((ps, p) => {
      const tap = ps[0], price = STATIONS[0].staff * actMult(p + 1);
      if (tap.lvl > 0 && !tap.auto && coins >= price) {
        coins -= price;
        tap.auto = true;
        if (WAITERS_ON) ws[p].push(...START_CREW());
      }
    });
    const r = rate();
    coins += r;
    run += r;
    t += 1;
    for (const [name, v] of [['1K', 1e3], ['1M', 1e6], ['1B', 1e9]] as const) if (run >= v && !(name in marks)) marks[name] = t;
    if (kriglyFor(run) >= PRESTIGE_FIRST && !('1. hygiena' in marks)) marks['1. hygiena'] = t;
    if (kriglyFor(run) >= PRESTIGE_MIN && !('prestiž' in marks)) marks['prestiž'] = t;
    if (kriglyFor(run) >= 4 * PRESTIGE_MIN && !('40 krígel' in marks)) marks['40 krígel'] = t;
  }
  return Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, fmt(v)]));
}

const WAITERS_ON = !process.env.NO_WAITERS;
console.log('1 hospoda, 0 krígel ', run(1, 0));
console.log('2 hospody, 15 krígel', run(2, 15));
console.log('3 hospody, 50 krígel', run(3, 50));
