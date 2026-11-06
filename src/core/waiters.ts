// Číšníci: pípa točí piva na bar, číšníci je roznášejí ke stolům a teprve doručené pivo vydělá coins.
// Nestíhají-li, piva čekají na baru (strop BAR_CAP) a pípa stojí. Každý číšník má vlastní vylepšení.
import { t } from '../i18n';

export interface WaiterState {
  /** úroveň rychlosti chůze */
  s: number;
  /** úroveň podnosu (0 = 1 pivo naráz) */
  t: number;
  /** úroveň úsměvu (spropitné) */
  m: number;
}

export const WAITER_MAX = 4;
export const BAR_CAP = 12;
/** jména a postavy číšníků (lidé z P.U.B.) */
export const WAITERS = [
  { name: 'Franta', key: 'waiter' },
  { name: 'Jarka', key: 'waiterB' },
  { name: 'Bořek', key: 'waiterC' },
  { name: 'Vilma', key: 'waiterD' },
];

/** čas na baru (naložení podnosu) a chůze tam a zpět bez vylepšení (s) */
export const PICK_S = 0.5;
export const WALK_S = 3;
export const SPD_MAX = 20;
export const TRAY_MAX = 3;
export const SMILE_MAX = 10;
export const SMILE_STEP = 0.01;

export const tray = (w: WaiterState) => 1 + w.t;
export const tripTime = (w: WaiterState) => PICK_S + WALK_S / (1 + 0.15 * w.s);
/** kolik piv za sekundu číšník roznese */
export const waiterRate = (w: WaiterState) => tray(w) / tripTime(w);
export const smileBonus = (w: WaiterState) => SMILE_STEP * w.m;
export const waiterLvl = (w: WaiterState) => 1 + w.s + w.t + w.m;

/** cena najmutí n-tého číšníka (první dva nastoupí zadarmo s kostlivcem na pípě) */
export const hireCost = (i: number) => [0, 0, 400, 4000][i] ?? Infinity;
/** s kostlivcem na pípě nastoupí rovnou dva číšníci */
export const START_CREW = (): WaiterState[] => [{ s: 0, t: 0, m: 0 }, { s: 0, t: 0, m: 0 }];
/** kolik piv natočí pípa za cyklus: 1 + 1 za každý milník (25, 50, 100, …) – hostů žízní víc a číšníci musí stíhat */
export const beersPerCycle = (milestones: number) => 1 + milestones;

export type WaiterUp = 's' | 't' | 'm';
export const UP_MAX: Record<WaiterUp, number> = { s: SPD_MAX, t: TRAY_MAX, m: SMILE_MAX };
export const upCost = (k: WaiterUp, lvl: number) => (k === 's' ? 30 * 1.5 ** lvl : k === 't' ? 200 * 10 ** lvl : 100 * 2 ** lvl);
export const upName = (k: WaiterUp) => (k === 's' ? t('Rychlost chůze') : k === 't' ? t('Podnos') : t('Úsměv'));

/** roznos všech číšníků: piva/s a průměrné spropitné (vážené podle toho, kolik kdo roznese) */
export function crew(ws: WaiterState[]) {
  const rate = ws.reduce((a, w) => a + waiterRate(w), 0);
  const tip = rate ? ws.reduce((a, w) => a + waiterRate(w) * smileBonus(w), 0) / rate : 0;
  return { rate, tip };
}
