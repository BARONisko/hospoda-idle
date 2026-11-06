// Den a noc: přes den platí lidé coins, v noci příšery kostmi. Kosti mají vlastní vylepšení (zůstávají i po hygieně).

export const DAY_MS = 8 * 60_000;
/** noc je na začátku krátká (1 min) a vylepšením „Delší noc“ se prodlužuje o 30 s za úroveň */
export const NIGHT_BASE = 60_000;
export const NIGHT_STEP = 30_000;
export const NIGHT_MAX_LVL = 14; // až 8 min
/** Kosti jsou malá čísla nezávislá na coins: výplata stanice v noci dá BONE_PER × log10(1 + výplata) kostí
 *  (začátek ~10 kostí za noc, pozdní hra desítky), ťuknutí na hosta v noci 1 kost. */
export const BONE_PER = 0.02;
export const bonesFor = (pay: number) => BONE_PER * Math.log10(1 + Math.max(0, pay));

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
export const nightCost = (lvl: number) => Math.ceil(2 * 1.55 ** lvl);
/** přepínač dne a noci: odemkne se od této úrovně „Delší noc“ a stojí tolik kostí */
export const SWITCH_LVL = 3;
export const SWITCH_COST = 30;
