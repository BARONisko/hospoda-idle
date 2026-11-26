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
  /** součet hodnot piv v tanku (každé pivo si pamatuje svůj druh; dřív se prodávalo podle právě zvoleného druhu → Ležák za cenu Speciálu) */
  sv?: number;
}

export type BeerKind = 'lager' | 'dark' | 'special';

export const BEERS: Record<BeerKind, { name: string; time: number; value: number }> = {
  lager: { name: t('Ležák'), time: 1, value: 1 },
  dark: { name: t('Polotmavé'), time: 1.6, value: 2 },
  special: { name: t('Speciál'), time: 3, value: 5 },
};

/** od které úrovně pivovaru jde pivo vařit (Petr 26. 11. podle Fable: postupně, ne všechna hned) */
export const BEER_LVL: Record<BeerKind, number> = { lager: 1, dark: 3, special: 6 };

export const newBrew = (): BrewState => ({ lvl: 1, inv: 0, stock: 0, at: Date.now(), kind: 'lager' });

/** zrychlení vaření z talismanů (nastavuje scéna) */
export const brewCfg = { speed: 1, tank: 0, tankMul: 1 };
/** délka jedné várky (ms): 15 min na 1. úrovni, každá úroveň o 0,9 % rychleji */
export const brewMs = (b: BrewState) => (15 * 60_000 * BEERS[b.kind].time * 0.991 ** (b.lvl - 1)) / brewCfg.speed;
/** velikost tanku */
export const tank = (b: BrewState) => (2 + b.lvl + brewCfg.tank) * brewCfg.tankMul;
/** kolik piv stojí další úroveň */
export const lvlCost = (b: BrewState) => 2 * b.lvl;
/** trvalý bonus k výdělku */
export const brewBonus = (b: BrewState) => 0.009 * (b.lvl - 1);
/** cena jednoho piva = tolik sekund výdělku */
/** hodnota tanku: staré uložení bez sv bere piva jako právě zvolený druh */
const sv = (b: BrewState) => (b.sv ??= b.stock * BEERS[b.kind].value);
/** průměrná hodnota piva v tanku (×1 Ležák … ×5 Speciál) */
export const beerValue = (b: BrewState) => (b.stock > 0 ? sv(b) / b.stock : BEERS[b.kind].value);
/** vzít z tanku n piv (prodej, vylepšení, pivní akce) – hodnota ubude poměrně */
export const takeBeer = (b: BrewState, n = 1) => {
  const v = beerValue(b) * n;
  b.sv = Math.max(0, sv(b) - v);
  b.stock -= n;
  if (b.stock <= 0) b.sv = 0;
};
/** dát do tanku n piv aktuálního druhu */
export const addBeer = (b: BrewState, n: number) => {
  sv(b);
  b.sv! += n * BEERS[b.kind].value;
  b.stock += n;
};
export const sellSecs = (b: BrewState) => 300 * (1 + 0.009 * (b.lvl - 1)) * beerValue(b);

/** dovaří, co se mezitím uvařilo (i offline); plný tank čeká */
export function tick(b: BrewState, now = Date.now()) {
  const ms = brewMs(b);
  if (b.stock >= tank(b)) {
    b.at = now;
    return;
  }
  const n = Math.floor((now - b.at) / ms);
  if (n > 0) {
    addBeer(b, Math.min(tank(b), b.stock + n) - b.stock);
    b.at += n * ms;
    if (b.stock >= tank(b)) b.at = now;
  }
}
