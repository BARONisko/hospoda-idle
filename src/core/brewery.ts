// Pivovar: vaří pomalu (i offline). Každé uvařené pivo jde prodat (coins), nebo vložit do vylepšení pivovaru.
// Vyšší úroveň = rychlejší vaření, větší tank, dražší piva a trvalý bonus k výdělku (zůstává i po hygieně).
import { t } from '../i18n';

export interface BrewState {
  lvl: number;
  /** piva vložená do další úrovně */
  inv: number;
  /** hotová piva v tanku */
  stock: number;
  /** začátek vaření aktuální várky (ms) */
  at: number;
  /** druh piva */
  kind: BeerKind;
}

export type BeerKind = 'lager' | 'dark' | 'special';

export const BEERS: Record<BeerKind, { name: string; time: number; value: number }> = {
  lager: { name: t('Ležák'), time: 1, value: 1 },
  dark: { name: t('Polotmavé'), time: 1.6, value: 2 },
  special: { name: t('Speciál'), time: 3, value: 5 },
};

export const newBrew = (): BrewState => ({ lvl: 1, inv: 0, stock: 0, at: Date.now(), kind: 'lager' });

/** zrychlení vaření z talismanů (nastavuje scéna) */
export const brewCfg = { speed: 1, tank: 0 };
/** délka jedné várky (ms): 15 min na 1. úrovni, každá úroveň o 8 % rychleji */
export const brewMs = (b: BrewState) => (15 * 60_000 * BEERS[b.kind].time * 0.92 ** (b.lvl - 1)) / brewCfg.speed;
/** velikost tanku */
export const tank = (b: BrewState) => 2 + b.lvl + brewCfg.tank;
/** kolik piv stojí další úroveň */
export const lvlCost = (b: BrewState) => 2 * b.lvl;
/** trvalý bonus k výdělku */
export const brewBonus = (b: BrewState) => 0.03 * (b.lvl - 1);
/** cena jednoho piva = tolik sekund výdělku */
export const sellSecs = (b: BrewState) => 300 * (1 + 0.2 * (b.lvl - 1)) * BEERS[b.kind].value;

/** dovaří, co se mezitím uvařilo (i offline); plný tank čeká */
export function tick(b: BrewState, now = Date.now()) {
  const ms = brewMs(b);
  if (b.stock >= tank(b)) {
    b.at = now;
    return;
  }
  const n = Math.floor((now - b.at) / ms);
  if (n > 0) {
    b.stock = Math.min(tank(b), b.stock + n);
    b.at += n * ms;
    if (b.stock >= tank(b)) b.at = now;
  }
}
