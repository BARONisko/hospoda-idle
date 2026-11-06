// Týdenní liga: soupeřova hospoda je jen číselný cíl týdne (tržba), který musíš překonat.
// Výhra = postup do vyšší ligy + krígly + talisman, prohra = sestup. Soupeř roste každý den a vyšší liga je silnější.
import { t } from '../i18n';

export const LEAGUES = [t('Okresní přebor'), t('Krajská liga'), t('Národní liga'), t('Pivní mistrovství'), t('Liga hlubin')];

export interface LeagueState {
  week: string;
  /** začátek týdne (ms) */
  start: number;
  /** liga 1–5 */
  tier: number;
  /** výdělek soupeře za sekundu na začátku týdne */
  rate: number;
  /** můj výdělek tento týden */
  me: number;
}

const WEEK = 7 * 86400_000;
/** soupeř zrychluje o 20 % denně */
const GROW = 1.2;

/** pondělí 00:00 aktuálního týdne (místní čas) */
export function weekStart(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.getTime();
}

/** jak aktivní je soupeř (podíl dne, kdy vydělává) – vyšší liga je pilnější */
const activity = (tier: number) => 0.25 + 0.07 * tier;

/** tržba soupeře od začátku týdne do teď */
export function rivalScore(L: LeagueState, now = Date.now()) {
  const days = Math.min(WEEK, Math.max(0, now - L.start)) / 86400_000;
  return ((L.rate * 86400) / Math.log(GROW)) * (GROW ** days - 1) * activity(L.tier);
}

export const weekEnd = (L: LeagueState) => L.start + WEEK;
export const winReward = (tier: number) => 5 * tier;
