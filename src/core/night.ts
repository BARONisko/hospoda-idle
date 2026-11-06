// Den a noc: přes den platí lidé coins, v noci příšery kostmi. Kosti mají vlastní vylepšení (zůstávají i po hygieně).
import { t } from '../i18n';

export const DAY_MS = 8 * 60_000;
export const NIGHT_MS = 4 * 60_000;
/** kolik kostí za 1 coin výdělku */
export const BONE_RATE = 0.001;

const forced = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('night') : null;

/** je teď noc? (cyklus podle reálného času) */
export function isNight(now = Date.now()) {
  if (forced !== null) return forced === '1';
  return now % (DAY_MS + NIGHT_MS) >= DAY_MS;
}

/** kolik ms zbývá do změny dne/noci */
export function phaseLeft(now = Date.now()) {
  const p = now % (DAY_MS + NIGHT_MS);
  return p < DAY_MS ? DAY_MS - p : DAY_MS + NIGHT_MS - p;
}

export interface BoneUp {
  id: 'pipe' | 'band' | 'grave' | 'moon';
  name: string;
  desc: string;
  base: number;
  max?: number;
}

/** vylepšení za kosti – ceny rostou ×3 za úroveň */
export const BONE_UPS: BoneUp[] = [
  { id: 'pipe', name: t('Kostěná pípa'), desc: t('v noci kostí +50 %'), base: 50 },
  { id: 'band', name: t('Kostlivá kapela'), desc: t('přes den výdělek +10 %'), base: 100 },
  { id: 'grave', name: t('Hřbitovní nábor'), desc: t('kostlivci o 15 % levnější'), base: 200, max: 5 },
  { id: 'moon', name: t('Měsíční svit'), desc: t('offline kostí +50 %'), base: 80 },
];
export const boneCost = (u: BoneUp, lvl: number) => Math.ceil(u.base * 3 ** lvl);
