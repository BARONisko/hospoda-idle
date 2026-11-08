// Simulace průběhu hry: „chamtivý“ hráč kupuje vždy to, co se nejrychleji vrátí (úroveň, kostlivec, vylepšení).
// Spuštění: node tools/sim/run.mjs   → časy do milníků (1K, 1M, první prestiž…) pro 1.–3. hospodu.
import { crew, beersPerCycle, START_CREW, hireCost, freePoints, UP_MAX, WAITER_MAX, type WaiterState, type WaiterUp } from '../../src/core/waiters';
import { milestoneCount, styleSupplyMult } from '../../src/core/economy';
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
  // mrtvá místa: nejdelší čekání mezi nákupy (do 1 h a 1–6 h), počet čekání > 60 s v 1. hodině
  let lastBuy = 0, gap1 = 0, gapL = 0, long1 = 0;
  const bought = () => { const g = t - lastBuy; if (t <= 3600) { gap1 = Math.max(gap1, g); if (g > 60) { long1++; if (process.env.GAPS) console.log(`  čekání ${g} s končí v ${(t / 60).toFixed(1)} min, příjem ${rate().toFixed(1)}/s`); } } else gapL = Math.max(gapL, g); lastBuy = t; };
  const kb = 1 + KRIGL_BONUS * krigle;
  const spent = Array(pubs).fill(0), lvls = Array(pubs).fill(0);
  const mc = (p: number, i: number) => (st[p][i].lvl > 0 ? milestoneCount(st[p][i].lvl) : -1);
  // styl hospody + zásobování (OLD=1 = bez nich, pro srovnání)
  const pl = () => st.map((ps, p) => ({ act: p + 1, st: Object.fromEntries(ps.map((x, i) => [STATIONS[i].id, { lvl: x.lvl }])) }));
  const extra = (p: number, i: number) => {
    if (OLD) return 1;
    const P = pl();
    return styleSupplyMult(P, P[p], STATIONS[i].id);
  };
  const pay = (p: number, d: StationDef, s: St) => payout(d, Math.max(1, s.lvl)) * actMult(p + 1) * upMult(up, p + 1, d.id) * kb * extra(p, STATIONS.indexOf(d));
  const demand = (p: number) => {
    const ps = st[p];
    return (ps[0].auto ? beersPerCycle(milestoneCount(ps[0].lvl)) / STATIONS[0].cycle : 0) + (ps[1].auto ? 1 / STATIONS[1].cycle : 0);
  };
  const rate = () => {
    let r = 0;
    st.forEach((ps, p) => ps.forEach((s, i) => {
      const d = STATIONS[i];
      // pípa a kuchyně: vydělá jen to, co číšníci roznesou (piva + talíře)
      if (s.lvl > 0 && i <= 1 && s.auto && WAITERS_ON && ps[0].auto && ws[p].length) {
        const c = crew(ws[p]);
        r += (pay(p, d, s) / d.cycle) * Math.min(1, c.rate / demand(p)) * (1 + c.tip);
      } else if (s.lvl > 0 && (s.auto || (i === 0 && p === 0))) r += pay(p, d, s) / d.cycle; // pípu hráč ťuká ručně (jen v 1. hospodě), než má kostlivce
    }));
    return r;
  };
  while (t < maxT) {
    // nákupy: nejlepší poměr přírůstek výdělku / cena
    let anyAff = false;
    for (;;) {
      anyAff = false;
      const r0 = rate();
      let best: { gain: number; price: number; act: () => void; pub: number } | null = null;
      const consider = (price: number, act: () => void, undo: () => void, pub = -1) => {
        act();
        const g = rate() - r0;
        undo();
        const score = g / price;
        if (g > 0 && price <= coins) anyAff = true;
        if (g > 0 && (!best || score > best.gain / best.price)) best = { gain: g, price, act, pub };
      };
      st.forEach((ps, p) => ps.forEach((s, i) => {
        const d = STATIONS[i];
        if (s.lvl === 0 && !s.auto) {
          // otevření stanice a hned obsluha (samotné otevření bez obsluhy nic nevydělá)
          const crewIn = i === 0 && !ws[p].length;
          consider((cost(d, 0) + d.staff) * actMult(p + 1), () => ((s.lvl = 1), (s.auto = true), crewIn && ws[p].push(...START_CREW())), () => ((s.lvl = 0), (s.auto = false), crewIn && ws[p].splice(0)), p);
          return;
        }
        consider(cost(d, s.lvl) * actMult(p + 1), () => s.lvl++, () => s.lvl--, p);
        if (s.lvl > 0 && !s.auto) consider(d.staff * actMult(p + 1), () => ((s.auto = true), i === 0 && ws[p].push(...START_CREW())), () => ((s.auto = false), i === 0 && ws[p].splice(0)));
      }));
      if (WAITERS_ON) ws.forEach((list, p) => {
        if (!list.length) return;
        if (list.length < WAITER_MAX) consider(hireCost(list.length) * actMult(p + 1), () => list.push({ s: 0, t: 0, m: 0 }), () => list.pop());
      });
      for (const u of UPGRADES) {
        if (u.act > pubs || up.includes(u.id)) continue;
        if (u.tier > 1 && !up.includes(`${u.act}_${u.station}_${u.tier - 1}`)) continue;
        consider(u.cost, () => up.push(u.id), () => up.pop());
      }
      // levné „otevření“ stanice (bez okamžitého přínosu) – když nic jiného
      const b = best as { gain: number; price: number; act: () => void; pub: number } | null;
      if (!b || b.price > coins) {
        // počkej na peníze, ale nejdéle 2 min výdělku
        break;
      }
      coins -= b.price;
      if (b.pub >= 0) spent[b.pub] += b.price, lvls[b.pub]++;
      b.act();
      bought();
    }
    // skutečný hráč otevře a obsadí každou stanici, jakmile na ni má 3× (hladový výpočet to neumí)
    st.forEach((ps, p) => ps.forEach((s, i) => {
      const d = STATIONS[i], price = (cost(d, 0) + d.staff) * actMult(p + 1);
      if (s.lvl === 0 && coins >= 3 * price) {
        coins -= price;
        spent[p] += price;
        s.lvl = 1;
        s.auto = true;
        if (i === 0 && !ws[p].length) ws[p].push(...START_CREW());
      }
    }));
    // návod vede hráče ke kostlivci na pípě hned za 50 coins (pak už pípu neťuká)
    st.forEach((ps, p) => {
      const tap = ps[0], price = STATIONS[0].staff * actMult(p + 1);
      if (tap.lvl > 0 && !tap.auto && coins >= price) {
        coins -= price;
        tap.auto = true;
        if (WAITERS_ON) ws[p].push(...START_CREW());
      }
    });
    // číšníci: 1 XP za sekundu práce, body hned utratí za nejlepší vylepšení
    if (WAITERS_ON) ws.forEach((list, p) => {
      const tap = st[p][0];
      if (!list.length || !tap.auto) return;
      const busy = Math.min(1, demand(p) / crew(list).rate);
      for (const w of list) {
        w.xp = (w.xp ?? 0) + busy;
        while (freePoints(w) > 0) {
          const r0 = rate();
          let bk: WaiterUp | null = null, bg = -1;
          for (const k of ['s', 't', 'm'] as WaiterUp[]) {
            if (w[k] >= UP_MAX[k]) continue;
            w[k]++;
            const g = rate() - r0;
            w[k]--;
            if (g > bg) (bg = g), (bk = k);
          }
          if (!bk) break;
          w[bk]++;
        }
      }
    });
    if (anyAff && process.env.REAL) bought();
    const r = rate();
    coins += r;
    run += r;
    t += 1;
    for (const [name, v] of [['1K', 1e3], ['1M', 1e6], ['1B', 1e9]] as const) if (run >= v && !(name in marks)) marks[name] = t;
    if (kriglyFor(run) >= PRESTIGE_FIRST && !('1. hygiena' in marks)) marks['1. hygiena'] = t;
    if (kriglyFor(run) >= PRESTIGE_MIN && !('prestiž' in marks)) marks['prestiž'] = t;
    if (kriglyFor(run) >= 4 * PRESTIGE_MIN && !('40 krígel' in marks)) marks['40 krígel'] = t;
  }
  const res: Record<string, string> = Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, fmt(v)]));
  res['nejdelší čekání na nákup'] = `${gap1} s (1. h), ${gapL} s (dál); čekání >60 s v 1. h: ${long1}×`;
  if (pubs > 1) res['útrata po hospodách %'] = spent.map((x) => ((100 * x) / spent.reduce((a, b) => a + b, 0)).toFixed(2)).join(' / ') + '; úrovně ' + lvls.join(' / ') + '  (konec: ' + st.map((ps) => ps.map((x) => x.lvl).join(',')).join(' | ') + ')';
  return res;
}

const WAITERS_ON = !process.env.NO_WAITERS;
const OLD = !!process.env.OLD;
console.log('1 hospoda, 0 krígel ', run(1, 0));
console.log('2 hospody, 15 krígel', run(2, 15));
console.log('3 hospody, 50 krígel', run(3, 50));
