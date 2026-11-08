// Mistrovství stanic (skilly na rok): roste samo – čas, kdy stanice běží s obsluhou (součet všech hospod, i offline,
// přežije hygienu). Hodnosti Učeň → Tovaryš → Mistr → Velmistr → Legenda, každá 10 stupňů (50 stupňů na stanici).
// Každý stupeň = 1 bod do stromu hostinského (nic jiného – přání uživatele, hospoda 63). Rychlost ani výdělek se nemění.
// Prahy: stupeň s potřebuje M0·s^P sekund → běžný hráč (12 h/den, 3 hospody) Legenda 10 ≈ za rok (tools/sim/skills.mjs).
import { t } from '../i18n';

export const MAST_M0 = 2100;
export const MAST_P = 2.56;
export const MAST_MAX = 50;
export const RANKS = [t('Učeň'), t('Tovaryš'), t('Mistr'), t('Velmistr'), t('Legenda')];
export const RANK_COLORS = ['copper', 'fog', 'gold', 'plum', 'scarlet'] as const;

/** sekundy potřebné na stupeň s */
export const mastNeed = (s: number) => MAST_M0 * s ** MAST_P;
/** stupeň 0–50 z odsloužených sekund */
export function mastStage(sec = 0) {
  let s = Math.min(MAST_MAX, Math.floor((sec / MAST_M0) ** (1 / MAST_P)));
  while (s < MAST_MAX && mastNeed(s + 1) <= sec) s++;
  while (s > 0 && mastNeed(s) > sec) s--;
  return s;
}
/** hodnost 0–4 a stupeň v ní 1–10 (stupeň 0 = ještě nic) */
export const mastRank = (s: number) => ({ rank: Math.max(0, Math.floor((s - 1) / 10)), step: s ? ((s - 1) % 10) + 1 : 0 });
/** postup k dalšímu stupni 0–1 */
export const mastProg = (sec = 0) => {
  const s = mastStage(sec);
  return s >= MAST_MAX ? 1 : (sec - (s ? mastNeed(s) : 0)) / (mastNeed(s + 1) - (s ? mastNeed(s) : 0));
};
