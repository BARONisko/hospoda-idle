// Ekonomika: stanice hospody, jejich úrovně, ceny a výdělek.
// Cena další úrovně = base · growth^úroveň (klasická idle křivka), výdělek roste lineárně s úrovní
// a skokově (×2) na milnících 25, 50, 100, … úrovní.
import { t } from '../i18n';

export interface StationDef {
  id: string;
  name: string;
  /** cena 1. úrovně */
  base: number;
  growth: number;
  /** výdělek za jeden cyklus na úroveň */
  income: number;
  /** délka cyklu v s */
  cycle: number;
  /** cena obsluhy (kostlivec za pultem – stanice pak běží sama) */
  staff: number;
}

export const STATIONS: StationDef[] = [
  { id: 'tap', name: t('Pípa'), base: 5, growth: 1.07, income: 1, cycle: 1.5, staff: 100 },
  { id: 'kitchen', name: t('Kuchyně'), base: 60, growth: 1.15, income: 8, cycle: 4, staff: 2500 },
  { id: 'cellar', name: t('Sklep se sudy'), base: 720, growth: 1.14, income: 70, cycle: 9, staff: 40000 },
  { id: 'dice', name: t('Kostky v rohu'), base: 8640, growth: 1.13, income: 600, cycle: 20, staff: 500000 },
];

/** názvy stanic podle hospody (dějství) */
export const STATION_NAMES: Record<number, Record<string, string>> = {
  1: { tap: t('Pípa'), kitchen: t('Kuchyně'), cellar: t('Sklep se sudy'), dice: t('Kostky v rohu') },
  2: { tap: t('Pípa s krví'), kitchen: t('Kotel s guláškem'), cellar: t('Sudomorův sklep'), dice: t('Kostky s kostlivcem') },
  3: { tap: t('Bahenní pípa'), kitchen: t('Žabí kuchyně'), cellar: t('Studna'), dice: t('Pulčí závody') },
};
export const PUB_NAMES: Record<number, string> = { 1: t('Pajzl u Berana'), 2: t('Sklepní krčma'), 3: t('Žabákův podnik') };
/** každá další hospoda vydělává řádově víc */
export const actMult = (act: number) => 50 ** (act - 1);

export const MILESTONES = [25, 50, 100, 200, 300, 400, 500];

export const cost = (d: StationDef, lvl: number) => d.base * d.growth ** lvl;

/** cena n dalších úrovní najednou */
export function costN(d: StationDef, lvl: number, n: number) {
  return (d.base * d.growth ** lvl * (d.growth ** n - 1)) / (d.growth - 1);
}

/** kolik úrovní si můžu dovolit (max) */
export function affordable(d: StationDef, lvl: number, coins: number) {
  const r = d.growth;
  return Math.max(0, Math.floor(Math.log((coins * (r - 1)) / (d.base * r ** lvl) + 1) / Math.log(r)));
}

export const milestoneMult = (lvl: number) => 2 ** MILESTONES.filter((m) => lvl >= m).length;

/** výdělek za cyklus */
export const payout = (d: StationDef, lvl: number) => d.income * lvl * milestoneMult(lvl);

/** výdělek za sekundu (když stanice běží sama) */
export const perSec = (d: StationDef, lvl: number) => payout(d, lvl) / d.cycle;

/** další milník (úroveň, kde se výdělek zdvojnásobí), nebo null */
export const nextMilestone = (lvl: number) => MILESTONES.find((m) => lvl < m) ?? null;

/** jednorázové vylepšení z obchodu: ×3 výdělek stanice v dané hospodě */
export interface UpgradeDef {
  id: string;
  act: number;
  station: string;
  tier: number;
  /** cena v coins (už včetně násobku hospody) */
  cost: number;
  mult: number;
}

export const UP_TIERS = 3;

export const UPGRADES: UpgradeDef[] = [1, 2, 3].flatMap((act) =>
  STATIONS.flatMap((d) =>
    Array.from({ length: UP_TIERS }, (_, k) => ({
      id: `${act}_${d.id}_${k + 1}`,
      act,
      station: d.id,
      tier: k + 1,
      cost: d.staff * 10 * 1000 ** k * actMult(act),
      mult: 3,
    })),
  ),
);

/** násobek výdělku stanice z koupených vylepšení */
export const upMult = (owned: string[], act: number, station: string) =>
  UPGRADES.reduce((m, u) => (u.act === act && u.station === station && owned.includes(u.id) ? m * u.mult : m), 1);
