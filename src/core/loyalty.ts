// Věrnost hostů po druzích (varianta A, hospoda 63): každé obsloužení hosta (bublina – ťuk, sběrač, hvězda stromu)
// = 1 obsloužení jeho druhu. Úrovně 1–5 (5 teček); každá úroveň = JEN 1 bod do stromu hostinského (přání uživatele).
// Prahy: běžný hráč (~125 obsloužení jednoho druhu denně) má druh na max za ~345 dní (tools/sim/skills.mjs).
// Úroveň 5 = věrný host (zlatý rámeček).
import { t } from '../i18n';

export const LOY_STEPS = [300, 1750, 7500, 18750, 43000];
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
export const LOY_TITLE = t('věrný host');
