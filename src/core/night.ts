// Den a noc: přes den platí lidé coins, v noci příšery kostmi. Kosti mají vlastní vylepšení (zůstávají i po hygieně).

export const DAY_MS = 8 * 60_000;
export const NIGHT_MS = 4 * 60_000;
/** kolik kostí za 1 coin výdělku */
export const BONE_RATE = 0.0002;

const forced = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('night') : null;

/** je teď noc? (cyklus podle reálného času) */
/** prodloužení noci (stat) – nastavuje scéna */
export const nightCfg = { mult: 1 };
const nightMs = () => NIGHT_MS * nightCfg.mult;

export function isNight(now = Date.now()) {
  if (forced !== null) return forced === '1';
  return now % (DAY_MS + nightMs()) >= DAY_MS;
}

/** kolik ms zbývá do změny dne/noci */
export function phaseLeft(now = Date.now()) {
  const p = now % (DAY_MS + nightMs());
  return p < DAY_MS ? DAY_MS - p : DAY_MS + nightMs() - p;
}
