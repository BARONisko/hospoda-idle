// Ekonomika: stanice hospody, jejich úrovně, ceny a výdělek.
// Cena další úrovně = base · growth^úroveň (klasická idle křivka), výdělek roste lineárně s úrovní
// a skokově (×2) na milnících 25, 50, 100, … úrovní.
import { t } from '../i18n';
import { big } from './num';

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
  { id: 'tap', name: t('Pípa'), base: 5, growth: 1.07, income: 1, cycle: 1.5, staff: 15 },
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
/** každá další hospoda vydělává řádově víc (dřív 50×, teď 10× – menší čísla, víc prostoru pro bonusy) */
export const ACT_STEP = 10;
export const actMult = (act: number) => ACT_STEP ** (act - 1);

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

/** počet dosažených milníků: 25, 50, 100, 200, 300, 400, 500 a dál každých 100 úrovní donekonečna */
export const milestoneCount = (lvl: number) => MILESTONES.filter((m) => lvl >= m).length + Math.max(0, Math.floor((lvl - 500) / 100));
export const milestoneMult = (lvl: number) => 2 ** milestoneCount(lvl);

/** výdělek za cyklus */
export const payout = (d: StationDef, lvl: number) => d.income * lvl * milestoneMult(lvl);

/** výdělek za sekundu (když stanice běží sama) */
export const perSec = (d: StationDef, lvl: number) => payout(d, lvl) / d.cycle;

/** další milník (úroveň, kde se výdělek zdvojnásobí), nebo null */
export const nextMilestone = (lvl: number): number | null => MILESTONES.find((m) => lvl < m) ?? (Math.floor(lvl / 100) + 1) * 100;

/** styl hospody (návrh C): stanice s nejvíc milníky určí styl – sama ×STYLE_MULT a hospoda dostane výhodu stylu */
export const STYLES: Record<string, { name: string; perk: string }> = {
  tap: { name: t('Pivnice'), perk: t('spropitné ×2') },
  kitchen: { name: t('Jídelna'), perk: t('schopnost manažera o 50 % delší') },
  cellar: { name: t('Sklípek'), perk: t('spánek o 1 h delší') },
  dice: { name: t('Herna'), perk: t('události o 25 % častěji') },
};
export const STYLE_MULT = 1.25;
/** styl až od 2 milníků (úroveň 50) */
export const STYLE_MIN = 2;
/** každý další odlišný styl napříč hospodami: +25 % výdělek všude */
export const STYLE_MIX = 0.25;
/** zásobování (návrh A): každý milník stanice v nižší hospodě = +15 % stejné stanici ve všech vyšších */
export const SUPPLY = 0.15;
type PubLike = { act: number; st: Record<string, { lvl: number } | undefined>; sty?: string[] };
const ms = (p: PubLike, id: string) => milestoneCount(p.st[id]?.lvl ?? 0);
/** stanice, které teď vedou (nejvíc milníků, aspoň STYLE_MIN, i při remíze) */
const leaders = (p: PubLike) => {
  const m = STATIONS.map((d) => ms(p, d.id)), top = Math.max(...m);
  return top >= STYLE_MIN ? STATIONS.filter((_, i) => m[i] === top).map((d) => d.id) : [];
};
/** styly hospody v tomto kole (do hygieny): stanice, která kdy vedla (i remízou), styl si nechá.
 *  QA hospoda 66: dřív při remíze / předběhnutí styl zmizel a koupě úrovně SNÍŽILA výdělek → styly jen přibývají */
export function pubStyles(p: PubLike): string[] {
  const now = leaders(p);
  if (now.some((id) => !p.sty?.includes(id))) p.sty = STATIONS.map((d) => d.id).filter((id) => now.includes(id) || p.sty?.includes(id));
  return p.sty ?? [];
}
/** hlavní styl hospody (první získaný podle pořadí stanic), jinak null */
export const pubStyle = (p: PubLike): string | null => pubStyles(p)[0] ?? null;
/** má hospoda styl stanice id */
export const isStyle = (p: PubLike, id: string) => pubStyles(p).includes(id);
/** kolik milníků chybí stanici, aby získala styl hospody (0 = už ho má) */
export function styleGap(p: PubLike, id: string) {
  if (isStyle(p, id)) return 0;
  const top = Math.max(...STATIONS.map((d) => ms(p, d.id)));
  return Math.max(1, Math.max(top, STYLE_MIN) - ms(p, id));
}
/** počet odlišných stylů ve všech hospodách (každá hospoda počítá jeden svůj styl, nejvýhodněji) */
export function styleCount(pubs: PubLike[]) {
  const sets = pubs.map(pubStyles).filter((x) => x.length);
  let best = 0;
  const go = (i: number, used: Set<string>) => {
    if (i === sets.length) return void (best = Math.max(best, used.size));
    for (const id of sets[i]) {
      const had = used.has(id);
      used.add(id);
      go(i + 1, used);
      if (!had) used.delete(id);
    }
  };
  go(0, new Set());
  return best;
}
export const styleMix = (pubs: PubLike[]) => 1 + STYLE_MIX * Math.max(0, styleCount(pubs) - 1);
/** má některá hospoda styl stanice id */
export const hasStyle = (pubs: PubLike[], id: string) => pubs.some((p) => isStyle(p, id));
/** násobek ze zásob od nižších hospod */
export const supplyIn = (pubs: PubLike[], p: PubLike, id: string) => 1 + SUPPLY * pubs.filter((q) => q.act < p.act).reduce((a, q) => a + ms(q, id), 0);
/** kolik % tahle stanice dodává vyšším hospodám (0 = žádná vyšší hospoda nebo bez milníku) */
export const supplyOut = (pubs: PubLike[], p: PubLike, id: string) => (pubs.some((q) => q.act > p.act) ? SUPPLY * ms(p, id) : 0);
/** celkový násobek stanice ze stylu, zásob a mixu stylů */
export const styleSupplyMult = (pubs: PubLike[], p: PubLike, id: string) => (isStyle(p, id) ? STYLE_MULT : 1) * supplyIn(pubs, p, id) * styleMix(pubs);

/** hvězdy stanic: úroveň STAR_LVL v běhu = po hygieně hvězda (max STAR_MAX); každá +10 % výdělek celé hospody,
 *  úrovně té stanice pak STAR_COST× dražší za každou hvězdu */
export const STAR_LVL: Record<string, number> = { tap: 500, kitchen: 400, cellar: 300, dice: 300 };
export const STAR_MAX = 5;
// hospoda 63 (přání uživatele): hvězda dává 1 bod do stromu hostinského (žádný bonus výdělku); úrovně té stanice
// jsou ale za každou hvězdu 10× dražší – další hvězda je tak těžší a body ze stromu nejdou získat hned všechny
export const STAR_BONUS = 0;
export const STAR_COST = 10;
export const starKey = (act: number, id: string) => `${act}_${id}`;
export const starsOf = (stars: Record<string, number> | undefined, act: number, id: string) => stars?.[starKey(act, id)] ?? 0;
/** násobek výdělku hospody z hvězd všech jejích stanic */
export const starMult = (stars: Record<string, number> | undefined, act: number) => 1 + STAR_BONUS * STATIONS.reduce((a, d) => a + starsOf(stars, act, d.id), 0);
export const starCost = (stars: Record<string, number> | undefined, act: number, id: string) => STAR_COST ** starsOf(stars, act, id);

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

/** vylepšení libovolného stupně (obchod jde donekonečna: každý stupeň ×3, cena ×1000) */
export function upDef(act: number, station: string, tier: number): UpgradeDef {
  const d = STATIONS.find((x) => x.id === station)!;
  return { id: `${act}_${station}_${tier}`, act, station, tier, cost: d.staff * 10 * 1000 ** (tier - 1) * actMult(act), mult: 3 };
}

/** koupené stupně stanice v hospodě */
export const upTiers = (owned: string[], act: number, station: string) => owned.filter((id) => id.startsWith(`${act}_${station}_`)).length;

/** násobek výdělku stanice z koupených vylepšení */
export const upMult = (owned: string[], act: number, station: string) => 3 ** upTiers(owned, act, station);

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
/** krígly rostou se čtvrtou odmocninou tržby (dřív druhou → tisíce až miliony krígel) */
/** krígly se počítají podle nejnovější hospody (tržba ÷ její násobek ×10 na hospodu) – jinak by 3. hospoda dávala
 *  krígly 3× rychleji a kola by se zkracovala na 2 min (simulace tools/sim/chain.mjs) */
export const kriglyFor = (run: number, pubs = 1) => Math.floor(2 * (run / (1e5 * ACT_STEP ** (pubs - 1))) ** 0.25);
export const KRIGL_BONUS = 0.009;
export const PRESTIGE_MIN = 6;
/** první hygiena (cesta k 2. hospodě) jde dřív: stačí 4 krígly (~1,6M tržby, cca 15 min) */
export const PRESTIGE_FIRST = 4;
/** každá další hygiena musí přinést aspoň +10 % krígel, co už máš (kola se tak pomalu prodlužují: 9 → 14 → … → 22 min) */
export const PRESTIGE_GROW = 0.1;
export const prestigeMin = (prestiges: number, krigle = 0) => (prestiges > 0 ? Math.max(PRESTIGE_MIN, Math.ceil(PRESTIGE_GROW * krigle)) : PRESTIGE_FIRST);

/** obchod s krígly: trvalá vylepšení (přežijí hygienu), platí se krígly; většina jde donekonečna (cena roste exponenciálně) */
export type KriglId = 'speed' | 'start' | 'offline' | 'events' | 'keepMgr' | 'cthulhu' | 'krigly';
export interface KriglItem {
  id: KriglId;
  name: string;
  /** cena další úrovně (lvl = současná úroveň) */
  cost: (lvl: number) => number;
  /** strop úrovní (undefined = donekonečna) */
  max?: number;
  /** popis účinku na dané úrovni (pro „teď → další“) */
  eff: (lvl: number) => string;
}
const exp = (base: number, g: number) => (l: number) => Math.ceil(base * g ** l);
const pc = (v: number) => String(Math.round(v * 10) / 10).replace('.', ',');
/** násobek délky cyklů: −0,9 % za úroveň */
export const kSpeed = (n: number) => 0.991 ** n;
/** spánek offline: základ 8 h, celkem nejvýš 12 h */
export const OFFLINE_BASE_H = 8;
export const OFFLINE_MAX_H = 12;
/** hodiny navíc offline: +30 s za úroveň (strop 4 h → celkem 12 h) */
export const kOffline = (n: number) => Math.min(OFFLINE_MAX_H - OFFLINE_BASE_H, n * 30 / 3600);
/** násobek intervalu událostí (nejméně 0,25): 2× −25 %, pak už jen −1 % za úroveň */
export const kEvents = (n: number) => Math.max(0.25, 0.75 ** Math.min(n, 2) * 0.99 ** Math.max(0, n - 2));
/** Zlatý výčep (dřív „Probudit Cthulhu“, id zůstává kvůli uložení): ×1,5, ×1,75, ×2 … */
export const kCthulhu = (n: number) => (n ? 1.25 + 0.25 * n : 1);
/** věrnost hostů: XP = příchody hostů, max 10 úrovní, 1. úroveň 20 000 příchodů, každá další ×1,3; +5 % spropitného za úroveň */
export const GUEST_MAX = 10;
export const guestNeed = (lvl: number) => Math.round(20000 * 1.3 ** lvl);
export const guestLvl = (xp: number) => {
  let l = 0;
  while (l < GUEST_MAX && xp >= guestNeed(l)) xp -= guestNeed(l++);
  return { lvl: l, xp, need: l < GUEST_MAX ? guestNeed(l) : 0 };
};
export const guestTips = (xp: number) => 0.05 * guestLvl(xp).lvl;
/** spánek ve formátu „4 h 30 min“ */
const hm = (h: number) => {
  const m = Math.round(h * 60);
  return m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`;
};
export const kKrigly = (n: number) => 0.009 * n;
export const KRIGL_SHOP: KriglItem[] = [
  { id: 'speed', name: t('Rychlejší obsluha'), cost: exp(5, 2), eff: (n) => t('cykly kratší o {v} %', { v: pc(100 - kSpeed(n) * 100) }) },
  { id: 'start', name: t('Startovní kapitál'), cost: (n) => (n < 3 ? [5, 25, 100][n] : Math.ceil(100 * 5 ** (n - 2))), eff: (n) => t('start s {c} coins', { c: big(startCoins(n)) }) },
  { id: 'offline', name: t('Delší spánek'), cost: exp(2, 1.035), eff: (n) => t('spánek {h} (max 12 h)', { h: hm(OFFLINE_BASE_H + kOffline(n)) }) },
  { id: 'events', name: t('Rušnější hospoda'), cost: (n) => (n < 2 ? [15, 45][n] : Math.ceil(45 * 1.15 ** (n - 1))), eff: (n) => t('události o {v} % častěji', { v: pc((1 / kEvents(n) - 1) * 100) }) },
  { id: 'krigly', name: t('Hlubší sklep'), cost: exp(40, 2.5), eff: (n) => t('krígly z hygieny +{v} %', { v: Math.round(kKrigly(n) * 100) }) },
  { id: 'keepMgr', name: t('Věrní manažeři'), cost: () => 200, max: 1, eff: (n) => (n ? t('manažeři zůstanou i po hygieně') : t('manažeři po hygieně odejdou')) },
  { id: 'cthulhu', name: t('Zlatý výčep'), cost: exp(300, 3), eff: (n) => t('výdělek všude ×{v}', { v: pc(kCthulhu(n)) }) },
];
/** je položka na maximu (strop úrovní nebo už nic nepřidá) */
export const kMaxed = (it: KriglItem, n: number) => (it.max !== undefined && n >= it.max) || (it.id === 'events' && kEvents(n) <= 0.25) || (it.id === 'offline' && kOffline(n) >= OFFLINE_MAX_H - OFFLINE_BASE_H);
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
