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
  4: { tap: t('Pípa z hlubin'), kitchen: t('Obětní kotel'), cellar: t('Potopená kaple'), dice: t('Kostky osudu') },
};
export const PUB_NAMES: Record<number, string> = { 1: t('Pajzl u Berana'), 2: t('Sklepní krčma'), 3: t('Žabákův podnik'), 4: t('Chrám Cthulhu') };
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

export const UPGRADES: UpgradeDef[] = [1, 2, 3, 4].flatMap((act) =>
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

/** manažer hospody: schopnost „hodina“ = ×BOOST_MULT výdělek na BOOST_S, pak nabíjení BOOST_CD */
export const MANAGERS: Record<number, { name: string; skill: string }> = {
  1: { name: t('Hostinský Beran'), skill: t('Šťastná hodina') },
  2: { name: t('Sudomor'), skill: t('Upíří hodina') },
  3: { name: t('Žabák'), skill: t('Žabí hodina') },
  4: { name: t('Žlutý král'), skill: t('Hodina chapadel') },
};
export const mgrCost = (act: number) => 25000 * actMult(act);
export const BOOST_MULT = 3;
export const BOOST_S = 30;
export const BOOST_CD = 300;

/** prestiž: krígly za výdělek v běhu, každý +KRIGL_BONUS výdělku navždy */
export const kriglyFor = (run: number) => Math.floor(Math.sqrt(run / 1e5));
export const KRIGL_BONUS = 0.02;
export const PRESTIGE_MIN = 10;

/** obchod s krígly: trvalá vylepšení (přežijí hygienu), platí se krígly */
export interface KriglItem {
  id: 'speed' | 'start' | 'offline' | 'events' | 'keepMgr' | 'cthulhu';
  name: string;
  desc: string;
  costs: number[];
}
export const KRIGL_SHOP: KriglItem[] = [
  { id: 'speed', name: t('Rychlejší kostlivci'), desc: t('všechny cykly o 10 % kratší'), costs: [5, 10, 20, 40, 80] },
  { id: 'start', name: t('Startovní kapitál'), desc: t('po hygieně začneš s coins'), costs: [5, 25, 100] },
  { id: 'offline', name: t('Delší spánek'), desc: t('výdělek offline o 4 h déle'), costs: [10, 20, 40, 80] },
  { id: 'events', name: t('Rušnější hospoda'), desc: t('události o 25 % častěji'), costs: [15, 45] },
  { id: 'keepMgr', name: t('Věrní manažeři'), desc: t('manažeři zůstanou i po hygieně'), costs: [30] },
  { id: 'cthulhu', name: t('Probudit Cthulhu'), desc: t('×10 výdělek všude navždy'), costs: [300] },
];
/** startovní coins po hygieně podle úrovně „Startovní kapitál“ */
export const startCoins = (lvl: number) => (lvl ? 1000 * 100 ** (lvl - 1) : 0);

/** výzdoba: extrémně drahé předměty za coins s trvalým bonusem (zůstanou i po hygieně) */
export interface DecorItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  frame: string;
  /** místo v hospodě (dlaždice) */
  x: number;
  y: number;
}
export const DECOR: DecorItem[] = [
  { id: 'portrait', name: t('Portrét zakladatele'), desc: t('výdělek +10 %'), cost: 1e8, frame: 'dPortrait', x: 5.5, y: 1.9 },
  { id: 'boar', name: t('Kančí hlava'), desc: t('spropitné ×3'), cost: 1e9, frame: 'dBoar', x: 7.5, y: 1.9 },
  { id: 'cuckoo', name: t('Kukačky'), desc: t('výdělek offline o 4 h déle'), cost: 1e10, frame: 'dCuckoo', x: 9.5, y: 1.9 },
  { id: 'piano', name: t('Klavír'), desc: t('odměny z událostí ×2'), cost: 1e11, frame: 'piano', x: 1.2, y: 9.2 },
  { id: 'aquarium', name: t('Akvárium'), desc: t('všechny cykly o 10 % kratší'), cost: 1e12, frame: 'aquarium', x: 16, y: 6.8 },
  { id: 'fireplace', name: t('Krb'), desc: t('výdělek +25 %'), cost: 1e13, frame: 'fireplace', x: 16, y: 10.4 },
  { id: 'sabre', name: t('Husarská šavle'), desc: t('schopnost manažera trvá 2× déle'), cost: 1e14, frame: 'dSabre', x: 12.5, y: 1.9 },
  { id: 'idol', name: t('Zlatá modla'), desc: t('krígly z hygieny +25 %'), cost: 1e15, frame: 'dIdol0', x: 14.2, y: 3.1 },
];
