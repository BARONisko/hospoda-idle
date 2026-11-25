// Rekonstrukce ★ a Kniha hostinského (posudek pozdní hry, návrh C + D, vybráno 25. 11. 2026).
// Od Ligy (40. hygiena) pokračují úkoly hostinského po kapitolách. Každý splněný úkol přidá do hospody kousek
// nábytku nebo výzdoby; po všech úkolech kapitoly se dá zavolat Rekonstrukce = hygiena, která přidá hvězdičku podniku.
// Hvězdy: ★1 nový vzhled Pajzlu, ★2 pátá stanice, ★3 jen výzdoba, ★4 kasa offline +2 h, ★5 zlatý štít podniku.
// Krígly ani obchod s krígly Rekonstrukce nesmaže (bez simulace by tvrdý reset hráče v pozdní hře zastavil na dny).
import { t } from '../i18n';
import { mastStage, mastRank } from './mastery';
import { loyLvl, LOY_MAX } from './loyalty';
import type { Save } from './save';

export type RekoLook = 'a' | 'b' | 'c';

export interface RekoState {
  /** hvězdičky podniku (dokončené Rekonstrukce) */
  star: number;
  /** vyzvednuté úkoly (všechny kapitoly) */
  done: string[];
  /** čítače od začátku kapitoly (spropitné, hygieny, piva…) */
  c: Record<string, number>;
  /** denní čítače (den YYYY-MM-DD) */
  day?: { d: string; c: Record<string, number> };
  /** stav na začátku kapitoly (příchody hostů, součet úrovní talismanů) */
  s0?: { gxp: number; tal: number };
  /** vybraný vzhled Pajzlu (návrh A/B/C) */
  look?: RekoLook;
}

/** od kolikáté hygieny se Kniha otevře (stejně jako Liga) */
export const REKO_HYG = 40;
export const REKO_STARS = 5;
/** ★4: kasa offline o 2 h déle */
export const REKO_OFFLINE_H = 2;

const talSum = (d: Save) => Object.values(d.talis ?? {}).reduce((a, b) => a + b, 0);
const lvl = (d: Save, id: string) => Math.max(0, ...d.pubs.map((p) => p.st[id]?.lvl ?? 0));
const maxD = (d: Save) => d.temple?.maxD ?? 1;
const rank = (d: Save, id: string) => mastRank(mastStage(d.mast?.[id] ?? 0)).rank;

export function newReko(d: Save): RekoState {
  return { star: 0, done: [], c: {}, s0: { gxp: d.gxp ?? 0, tal: talSum(d) } };
}

/** kousek v hospodě: snímek z atlasu „obj“ (s {l} = vzhled a/b/c), hospoda (act), místo v px, na zdi = za vším */
export interface RekoItem {
  frame: string;
  act: number;
  x: number;
  y: number;
  wall?: boolean;
  /** místo nového kousku výmena stávajících (stoly a židle, pípa, livreje) */
  swap?: 'tables' | 'tap' | 'livery' | 'goldTap';
  /** závěsné lampy nad barem (3 kusy) */
  lamps?: boolean;
}

export interface RekoTask {
  id: string;
  star: number;
  text: () => string;
  goal: number;
  prog: (d: Save, R: RekoState) => number;
  /** co se v hospodě změní */
  what: () => string;
  item: RekoItem;
}

const T = 16;
const c = (k: string) => (_d: Save, R: RekoState) => R.c[k] ?? 0;
const day = (k: string) => (_d: Save, R: RekoState) => (R.day?.d === todayKey() ? R.day.c[k] ?? 0 : 0);
const wall = (frame: string, x: number, act = 1): RekoItem => ({ frame, act, x: x * T, y: T + 14, wall: true });
const floor = (frame: string, x: number, y: number, act = 1): RekoItem => ({ frame, act, x: x * T, y: y * T });

export const todayKey = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

// úkoly jdou od lehkých k těžkým a střídají druhy (sbírání, rychlost, přežití, plánování, souboje, sběratelství)
export const REKO_TASKS: RekoTask[] = [
  // ★1 Pajzl u Berana (lehké)
  { id: 't01', star: 1, text: () => t('Obslouž {n} bublin', { n: 200 }), goal: 200, prog: c('tips'), what: () => t('Nové stoly a židle v Pajzlu'), item: { frame: 'rk{l}_table', act: 1, x: 0, y: 0, swap: 'tables' } },
  { id: 't02', star: 1, text: () => t('Zavolej {n} hygieny', { n: 3 }), goal: 3, prog: c('hyg'), what: () => t('Lampy nad barem'), item: { frame: 'rk{l}_lamp', act: 1, x: 0, y: 0, lamps: true } },
  { id: 't03', star: 1, text: () => t('Pípa na úroveň {n} v jednom kole', { n: 150 }), goal: 150, prog: (d) => lvl(d, 'tap'), what: () => t('Pípa se třemi kohouty'), item: { frame: 'rk{l}_tap', act: 1, x: 0, y: 0, swap: 'tap' } },
  { id: 't04', star: 1, text: () => t('Uvař a prodej {n} piv', { n: 30 }), goal: 30, prog: c('beer'), what: () => t('Sudy s křídovými cedulkami za barem'), item: floor('rk{l}_kegs', 6.6, 4 + 13 / T) },
  { id: 't05', star: 1, text: () => t('Zvládni {n} událostí', { n: 25 }), goal: 25, prog: c('events'), what: () => t('Věšák s klobouky u dveří'), item: floor('rk{l}_coat', 16, 12 + 4 / T) },
  { id: 't05b', star: 1, text: () => t('Obslouž {n} bublin za jeden den', { n: 150 }), goal: 150, prog: day('tips'), what: () => t('Tabule s kresbami štamgastů'), item: { frame: 'rk{l}_board', act: 1, x: 13.5 * T, y: 2 * T + 13, wall: true } },
  { id: 't05c', star: 1, text: () => t('Rozežeň {n} rvaček', { n: 5 }), goal: 5, prog: c('brawls'), what: () => t('Boxerské rukavice na zdi'), item: wall('rkGloves', 13.5) },
  // ★2 (střední)
  { id: 't06', star: 2, text: () => t('Rozežeň {n} rvaček', { n: 15 }), goal: 15, prog: c('brawls'), what: () => t('Cedule „Kdo se pere, platí rundu“'), item: wall('posterBox', 11) },
  { id: 't07', star: 2, text: () => t('Dohraj {n} her šipek', { n: 20 }), goal: 20, prog: c('darts'), what: () => t('Druhý terč na šipky'), item: floor('darts', 16, 6.6) },
  { id: 't08', star: 2, text: () => t('Vylepši talismany o {n} úrovně', { n: 3 }), goal: 3, prog: (d, R) => talSum(d) - (R.s0?.tal ?? 0), what: () => t('Polička s talismany za barem'), item: wall('witchShelf', 4.5) },
  { id: 't09', star: 2, text: () => t('Poraz Cthulhu na obtížnost {d}', { d: 'II' }), goal: 1, prog: (d) => (maxD(d) > 2 ? 1 : 0), what: () => t('Lebeční svícny ve Sklepní krčmě'), item: floor('kSkullCandles', 4.5, 5 + 6 / T, 2) },
  { id: 't10', star: 2, text: () => t('Obslouž {n} VIP hostů', { n: 5 }), goal: 5, prog: c('vip'), what: () => t('Červený koberec ke dveřím'), item: { frame: 'rug', act: 1, x: 15.5 * T, y: 13 * T - 2 } },
  { id: 't10b', star: 2, text: () => t('Vyber v noci {n} spropitných za jeden den', { n: 40 }), goal: 40, prog: day('night'), what: () => t('Zvonek u dveří Sklepní krčmy'), item: wall('bell', 15, 2) },
  { id: 't10c', star: 2, text: () => t('Dohraj {n} hry šipek za jeden den', { n: 3 }), goal: 3, prog: day('darts'), what: () => t('Zlatá šipka v rámu'), item: wall('cupDarts', 12) },
  // ★3 (náročnější)
  { id: 't11', star: 3, text: () => t('Získej {n} krígel jednou hygienou', { n: 40 }), goal: 40, prog: c('kmax'), what: () => t('Akvárium s pulci'), item: floor('aquarium', 1.6, 12.8) },
  { id: 't12', star: 3, text: () => t('Vyhraj ligu {n}×', { n: 2 }), goal: 2, prog: c('lg'), what: () => t('Vitrína s ligovými poháry'), item: floor('dCase', 15.6, 4.2) },
  { id: 't13', star: 3, text: () => t('Hodnost {r} na kterékoli stanici', { r: t('Tovaryš') }), goal: 1, prog: (d) => (['tap', 'kitchen', 'cellar', 'dice'].some((s) => rank(d, s) >= 1) ? 1 : 0), what: () => t('Cechovní prapor na zdi'), item: wall('dFlag', 3) },
  { id: 't14', star: 3, text: () => t('Udrž {n}denní sérii denní truhly', { n: 7 }), goal: 7, prog: (d) => (d.chest?.last === todayKey() || d.chest?.last === yesterday() ? d.chest?.day ?? 0 : 0), what: () => t('Hrací skříň v rohu'), item: floor('jukebox0', 1, 9.6) },
  { id: 't15', star: 3, text: () => t('Nasbírej {n} kostí', { n: 5000 }), goal: 5000, prog: c('bones'), what: () => t('Pavučinový lustr ve Sklepní krčmě'), item: wall('kCobLustre', 7, 2) },
  { id: 't15b', star: 3, text: () => t('Vyřeš {n} návštěvníků', { n: 10 }), goal: 10, prog: c('visitors'), what: () => t('Věštecký stolek s lektvary'), item: floor('potionStand', 16, 9.4) },
  // ★4 (těžké)
  { id: 't16', star: 4, text: () => t('Měj {n} kusů výzdoby', { n: 8 }), goal: 8, prog: (d) => d.decor?.length ?? 0, what: () => t('Závěsné lampy v sále'), item: { frame: 'hangLamp1', act: 1, x: 10.5 * T, y: 6 * T, wall: true } },
  { id: 't17', star: 4, text: () => t('Hostinský na úroveň {n}', { n: 30 }), goal: 30, prog: (d) => d.klvl ?? 1, what: () => t('Portrét hostinského ve zlatém rámu'), item: wall('dPortrait', 7.5) },
  { id: 't18', star: 4, text: () => t('Poraz Cthulhu na obtížnost {d}', { d: 'IV' }), goal: 1, prog: (d) => (maxD(d) > 4 ? 1 : 0), what: () => t('Obraz Dagona na zdi'), item: wall('zDagonPic', 9.5) },
  { id: 't19', star: 4, text: () => t('Věrnost hostů na úroveň {n}', { n: LOY_MAX }), goal: LOY_MAX, prog: (d) => loyLvl(d.gxp ?? 0), what: () => t('Tabule „Štamgast měsíce“'), item: wall('wanted', 1.5) },
  { id: 't20', star: 4, text: () => t('Číšník s Podnosem {a} a Úsměvem {b}', { a: 3, b: 10 }), goal: 1, prog: (d) => (d.pubs.some((p) => p.w?.some((w) => w.t >= 3 && w.m >= 10)) ? 1 : 0), what: () => t('Nové livreje se zlatými knoflíky'), item: { frame: '', act: 1, x: 0, y: 0, swap: 'livery' } },
  { id: 't20b', star: 4, text: () => t('Postup do ligy: {l}', { l: t('Národní liga') }), goal: 3, prog: (d) => d.league?.tier ?? 1, what: () => t('Plakát „Nejlepší hospoda okresu“'), item: wall('posterPool', 6) },
  { id: 't20c', star: 4, text: () => t('Splň {n} týdenní výzvy', { n: 4 }), goal: 4, prog: c('weekly'), what: () => t('Kronika hospody na pultu'), item: floor('kBook', 1.2, 5.4) },
  // ★5 (nejtěžší)
  { id: 't21', star: 5, text: () => t('Vyhraj ligu: {l}', { l: t('Národní liga') }), goal: 1, prog: c('lg3'), what: () => t('Zlatá pípa'), item: { frame: '', act: 1, x: 0, y: 0, swap: 'goldTap' } },
  { id: 't22', star: 5, text: () => t('Poraz Cthulhu na obtížnost {d}', { d: 'V' }), goal: 1, prog: (d) => (maxD(d) > 5 ? 1 : 0), what: () => t('Modla z hlubin v rohu'), item: floor('dIdol1', 16, 11.4) },
  { id: 't23', star: 5, text: () => t('Ve všech 3 hospodách pípa nad {n} v jednom kole', { n: 300 }), goal: 3, prog: (d) => d.pubs.filter((p) => (p.st.tap?.lvl ?? 0) >= 300).length, what: () => t('Svítící cedule nad vchodem'), item: wall('ySign', 15) },
  { id: 't24', star: 5, text: () => t('{n} příchodů hostů', { n: '100 000' }), goal: 100000, prog: (d, R) => (d.gxp ?? 0) - (R.s0?.gxp ?? 0), what: () => t('Klavír pro štamgasty'), item: floor('piano', 5, 12.9) },
  { id: 't25', star: 5, text: () => t('Hodnost {r} na všech 4 stanicích', { r: t('Mistr') }), goal: 4, prog: (d) => ['tap', 'kitchen', 'cellar', 'dice'].filter((s) => rank(d, s) >= 2).length, what: () => t('Zlaté dveře do sklepa'), item: wall('gateDoorOpen', 12) },
  { id: 't25b', star: 5, text: () => t('Poraz Cthulhu na obtížnost {d}', { d: 'VI' }), goal: 1, prog: (d) => (maxD(d) > 6 ? 1 : 0), what: () => t('Cthulhuova koruna nad barem'), item: wall('cCrown', 5.5) },
  { id: 't25c', star: 5, text: () => t('{n} talismanů na úrovni {l}', { n: 8, l: 5 }), goal: 8, prog: (d) => Object.values(d.talis ?? {}).filter((v) => v >= 5).length, what: () => t('Vitrína s talismany se zlatým světlem'), item: floor('necroCaseLit', 16, 8) },
];

function yesterday() {
  const n = new Date(Date.now() - 86400_000);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/** úkoly kapitoly (hvězdy) */
export const chapter = (star: number) => REKO_TASKS.filter((k) => k.star === star);
/** aktuální kapitola = další hvězda (po ★5 žádná) */
export const curStar = (R: RekoState) => Math.min(REKO_STARS + 1, R.star + 1);
export const taskProg = (k: RekoTask, d: Save, R: RekoState) => Math.max(0, Math.min(k.goal, k.prog(d, R)));
export const taskDone = (k: RekoTask, d: Save, R: RekoState) => R.done.includes(k.id) || k.prog(d, R) >= k.goal;
/** všechny úkoly kapitoly vyzvednuté → jde zavolat Rekonstrukci */
export const rekoReady = (R: RekoState) => R.star < REKO_STARS && chapter(R.star + 1).every((k) => R.done.includes(k.id));
/** další úkol do lišty (první nevyzvednutý: nejdřív splněné k vyzvednutí, pak podle pořadí) */
export function nextTask(d: Save, R: RekoState): RekoTask | null {
  if (R.star >= REKO_STARS) return null;
  const ch = chapter(R.star + 1).filter((k) => !R.done.includes(k.id));
  return ch.find((k) => k.prog(d, R) >= k.goal) ?? ch[0] ?? null;
}

/** přičte čítač (kapitola i den) */
export function rekoCount(R: RekoState, key: string, n = 1) {
  R.c[key] = (R.c[key] ?? 0) + n;
  const dk = todayKey();
  if (R.day?.d !== dk) R.day = { d: dk, c: {} };
  R.day.c[key] = (R.day.c[key] ?? 0) + n;
}

/** nejvyšší hodnota (krígly jednou hygienou) */
export function rekoMax(R: RekoState, key: string, v: number) {
  R.c[key] = Math.max(R.c[key] ?? 0, v);
}

/** po Rekonstrukci: další hvězda, čítače nové kapitoly od nuly */
export function rekoStar(R: RekoState, d: Save) {
  R.star = Math.min(REKO_STARS, R.star + 1);
  R.c = {};
  R.day = undefined;
  R.s0 = { gxp: d.gxp ?? 0, tal: talSum(d) };
}

/** kousky v hospodě podle vyzvednutých úkolů */
export const rekoItems = (R: RekoState | undefined) => (R ? REKO_TASKS.filter((k) => R.done.includes(k.id)) : []);
export const rekoFrame = (f: string, R: RekoState | undefined) => f.replace('{l}', R?.look ?? 'a');
