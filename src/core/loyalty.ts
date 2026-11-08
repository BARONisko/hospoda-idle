// Věrnost hostů po druzích (varianta A, hospoda 63): každé obsloužení hosta (bublina – ťuk, sběrač, hvězda stromu)
// = 1 bod jeho druhu. Úrovně 1–5 (5 teček) za 10 / 50 / 200 / 1000 / 5000 obsloužení.
// Každá úroveň: +1 % spropitné od toho druhu. Úroveň 5 = věrný host: vlastní malý trvalý bonus (pod 1 %) + zlatý rámeček.
import { t } from '../i18n';
import type { StatId } from './talisman';

export const LOY_STEPS = [10, 50, 200, 1000, 5000];
export const LOY_MAX = LOY_STEPS.length;
export const loyLvl = (n = 0) => LOY_STEPS.filter((s) => n >= s).length;
/** postup k další úrovni 0–1 */
export const loyProg = (n = 0) => {
  const l = loyLvl(n);
  if (l >= LOY_MAX) return 1;
  const a = l ? LOY_STEPS[l - 1] : 0;
  return (n - a) / (LOY_STEPS[l] - a);
};
export const loyNext = (n = 0) => LOY_STEPS[Math.min(LOY_MAX - 1, loyLvl(n))];
/** násobek spropitného od druhu */
export const loyTip = (n = 0) => 1 + 0.01 * loyLvl(n);
/** bonus štamgasta (úroveň 5): stat podle pořadí druhu ve Sbírce */
const PERKS: [StatId, number][] = [
  ['income', 0.009], ['tips', 0.009], ['bones', 0.009], ['events', 0.009], ['brew', 0.009],
  ['luck', 0.009], ['gxp', 0.009], ['beer', 0.009], ['nighttips', 0.009], ['evfreq', 0.005],
];
export const loyPerk = (i: number) => PERKS[i % PERKS.length];
export const LOY_TITLE = t('věrný host');
