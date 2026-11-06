// Den a noc: přes den platí lidé coins, v noci příšery kostmi. Kosti mají vlastní vylepšení (zůstávají i po hygieně).
import { MILESTONES } from './economy';

export const DAY_MS = 8 * 60_000;
/** noc je na začátku krátká (1 min) a vylepšením „Delší noc“ se prodlužuje o 1 s za úroveň */
export const NIGHT_BASE = 60_000;
export const NIGHT_STEP = 1_000;
export const NIGHT_MAX_LVL = 420; // až 8 min
/** Kosti v noci: každá výplata stanice dá 1 kost za každý milník, kterého stanice dosáhla (25, 50, 100, 200, …);
 *  stanice pod 25. úrovní nedá nic. Ťuknutí na hosta v noci = 1 kost. (Násobí se bonusy ke kostem.) */
export const bonesFor = (lvl: number) => MILESTONES.filter((m) => lvl >= m).length;

const forced = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('night') : null;

/** nastavuje scéna: mult = prodloužení noci ze statů, lvl = úroveň „Delší noc“, shift = posun cyklu (ruční přepínač) */
export const nightCfg = { mult: 1, lvl: 0, shift: 0 };
export const nightLen = (lvl = nightCfg.lvl) => (NIGHT_BASE + NIGHT_STEP * lvl) * nightCfg.mult;
const cycle = () => DAY_MS + nightLen();
const phase = (now: number) => (((now + nightCfg.shift) % cycle()) + cycle()) % cycle();

/** je teď noc? (cyklus podle reálného času) */
export function isNight(now = Date.now()) {
  if (forced !== null) return forced === '1';
  return phase(now) >= DAY_MS;
}

/** kolik ms zbývá do změny dne/noci */
export function phaseLeft(now = Date.now()) {
  const p = phase(now);
  return p < DAY_MS ? DAY_MS - p : cycle() - p;
}

/** podíl noci v cyklu (pro výdělek offline) */
export const nightShare = () => nightLen() / cycle();

/** ruční přepínač: posune cyklus tak, aby teď začala noc (nebo den); vrátí nový posun */
export function switchPhase(toNight: boolean, now = Date.now()) {
  const p = phase(now);
  const target = toNight ? DAY_MS : 0;
  nightCfg.shift = (nightCfg.shift + ((target - p + cycle()) % cycle())) % cycle();
  return nightCfg.shift;
}

/** cena úrovně „Delší noc“ v kostech */
export const nightCost = (lvl: number) => Math.round(10 * 1.012 ** lvl);
/** cena n úrovní najednou */
export const nightCostN = (lvl: number, n: number) => Array.from({ length: n }, (_, i) => nightCost(lvl + i)).reduce((a, b) => a + b, 0);
/** přepínač dne a noci: odemkne se od této úrovně „Delší noc“ a stojí tolik kostí */
export const SWITCH_LVL = 60; // noc aspoň 2 min
export const SWITCH_COST = 500;
