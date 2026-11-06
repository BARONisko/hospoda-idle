// Týdenní liga: soupeřova hospoda je číslo – její tržba během týdne živě roste a na konci týdne ji musíš mít vyšší.
// Soupeř zrychluje každý den, vyšší liga je silnější, a když vedeš, soupeř zabere víc (až +60 %).
// Výhra = postup do vyšší ligy + krígly + talisman, prohra = sestup.
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
  /** tržba soupeře tento týden (roste průběžně, viz rivalTick) */
  rival?: number;
  /** kdy se tržba soupeře naposledy dopočítala (ms) */
  rAt?: number;
  /** pivo pro soupeře: do kdy vydělává jen polovinu (ms) */
  slowUntil?: number;
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

/** jak rychle soupeř právě vydělává (coins/s) – bez reakce na hráče */
const rivalSpeed = (L: LeagueState, at: number) => L.rate * activity(L.tier) * GROW ** ((at - L.start) / 86400_000);

/** když vedeš, soupeř zabere: +0 až +60 % podle náskoku */
const push = (me: number, rival: number, rate: number) => (me > rival ? 1 + 0.6 * Math.min(1, (me - rival) / Math.max(rival, rate * 3600)) : 1);

/** dopočítá tržbu soupeře do teď (po krocích max. 10 min, kvůli reakci na náskok) a vrátí ji */
export function rivalTick(L: LeagueState, now = Date.now()) {
  if (L.rival === undefined || L.rAt === undefined) {
    L.rival = rivalScore(L, now);
    L.rAt = Math.max(L.start, Math.min(now, weekEnd(L)));
  }
  const end = Math.min(now, weekEnd(L));
  while (L.rAt < end) {
    const dt = Math.min(60_000, end - L.rAt);
    const mid = L.rAt + dt / 2;
    L.rival += rivalSpeed(L, mid) * push(L.me, L.rival, L.rate) * (mid < (L.slowUntil ?? 0) ? 0.5 : 1) * (dt / 1000);
    L.rAt += dt;
  }
  return L.rival;
}
