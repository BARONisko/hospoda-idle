// Víkendová událost: Chrám v potopeném R'lyeh. Boss Cthulhu má životy na celý víkend, hráč bojuje v kolech (max 5 za den).
// Měna chapadla platí jen o víkendu – v pondělí shnijí (Solná lázeň z nich zachrání trochu kostí).
import { t } from '../i18n';

export interface TempleState {
  /** klíč víkendu (datum soboty) – při změně chapadla shnijí a přijde nový boss */
  wk: string;
  /** zbývající životy bosse 0–1 */
  hp: number;
  /** poražení bossové celkem (síla dalšího bosse, trvalé pečetě) */
  boss: number;
  /** chapadla (víkendová měna) */
  ten: number;
  /** odehraná kola: den + počet */
  day: string;
  used: number;
  /** vyzvednuté truhly tohoto bosse (po 10 %) */
  chests: number;
  /** trvalá vylepšení chrámu (přežijí víkend): kult = kultisté, knife, candle, salt, ward */
  up: Record<string, number>;
  /** kdy naposledy kultisté sbírali chapadla bez hráče (ms) */
  idleAt: number;
  /** statistiky */
  best?: number;
  /** v pondělí: kolik shnilo a kolik kostí zachránila sůl (ukázat při příštím otevření) */
  rot?: { ten: number; bones: number };
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** ladění: ?temple=1 otevře chrám i ve všední den */
const force = () => typeof location !== 'undefined' && new URLSearchParams(location.search).get('temple') === '1';

/** je víkend (sobota/neděle místního času)? */
export const isWeekend = (now = Date.now()) => force() || [0, 6].includes(new Date(now).getDay());

/** klíč víkendu = datum jeho soboty (ve všední den poslední minulé soboty) */
export function weekendKey(now = Date.now()) {
  const d = new Date(now);
  const back = (d.getDay() + 1) % 7; // so=0, ne=1, po=2 …
  d.setDate(d.getDate() - back);
  return ymd(d);
}

export const todayKey = (now = Date.now()) => ymd(new Date(now));

/** ms do začátku příští soboty (ve všední den) nebo do konce víkendu (o víkendu) */
export function msToSwitch(now = Date.now()) {
  const d = new Date(now);
  const day = d.getDay();
  const add = day === 6 ? 2 : day === 0 ? 1 : 6 - day;
  const e = new Date(d.getFullYear(), d.getMonth(), d.getDate() + add);
  return e.getTime() - now;
}

export const ROUNDS_PER_DAY = 5;
export const ROUND_S = 90;
export const MAX_CULT = 2;

/** životy bosse (v bodech zásahu): roste s každým poraženým */
export const bossHp = (boss: number) => Math.round(30000 * 1.7 ** boss);

/** síla zásahu: hospody pomáhají jen logaritmicky (10× výdělek ≈ +15 % síly), hlavně vylepšení chrámu */
export function tapPower(incomePerSec: number, knife: number, templeStat: number) {
  return 10 * (1 + 0.15 * Math.log10(1 + Math.max(0, incomePerSec))) * (1 + 0.25 * knife) * (1 + templeStat);
}

/** truhla po každých 10 % životů bosse */
export const chestTen = (boss: number) => Math.round(80 * (1 + 0.5 * boss));

/** kultisté mimo boj: chapadla za hodinu (o víkendu, strop 8 h) */
export const CULT_IDLE_PER_H = 12;

/** nová/aktualizovaná správa víkendu; vrací stav (mění ho na místě) */
export function templeState(s: TempleState | undefined, now = Date.now()): TempleState {
  const wk = weekendKey(now);
  if (!s) return { wk, hp: 1, boss: 0, ten: 0, day: todayKey(now), used: 0, chests: 0, up: {}, idleAt: now };
  if (s.wk !== wk) {
    // nový víkend: chapadla shnijí (sůl zachrání část jako kosti), boss se vrátí s plnými životy
    const salt = s.up.salt ?? 0;
    const bones = Math.floor(s.ten * 0.01 * salt);
    if (s.ten > 0) s.rot = { ten: s.ten, bones };
    s.ten = 0;
    s.wk = wk;
    s.hp = 1;
    s.chests = 0;
    s.idleAt = now;
  }
  if (s.day !== todayKey(now)) {
    s.day = todayKey(now);
    s.used = 0;
  }
  return s;
}

/** chapadla od kultistů za dobu bez hráče (jen o víkendu) */
export function cultIdle(s: TempleState, now = Date.now()) {
  const n = s.up.kult ?? 0;
  const h = Math.min(8, Math.max(0, now - s.idleAt) / 3.6e6);
  s.idleAt = now;
  if (!n || !isWeekend(now)) return 0;
  const got = Math.floor(h * CULT_IDLE_PER_H * n);
  s.ten += got;
  return got;
}

/** obchod chrámu: trvalá vylepšení (zůstávají napořád) */
export interface TempleUp {
  id: string;
  name: string;
  desc: (lvl: number) => string;
  cost: (lvl: number) => number;
  max?: number;
}
export const TEMPLE_UPS: TempleUp[] = [
  { id: 'kult', name: t('Kultista'), desc: () => t('přijde hned, seká chapadla v každé události a sbírá i bez tebe'), cost: (l) => [500, 1500][l] ?? 0, max: MAX_CULT },
  { id: 'knife', name: t('Obětní dýka'), desc: (l) => t('síla zásahu +{v} %', { v: 25 * l }), cost: (l) => Math.ceil(150 * 1.5 ** l) },
  { id: 'candle', name: t('Svíce navíc'), desc: (l) => t('svící na oltáři: {n}', { n: 3 + l }), cost: (l) => Math.ceil(400 * 2.5 ** l), max: 3 },
  { id: 'ward', name: t('Ochranný amulet'), desc: () => t('první útok v kole oltář nezasáhne'), cost: () => 600, max: 1 },
  { id: 'salt', name: t('Solná lázeň'), desc: (l) => t('v pondělí zachrání {v} % chapadel jako kosti', { v: l }), cost: (l) => Math.ceil(200 * 1.6 ** l), max: 10 },
];

/** pečeť R'lyeh za poraženého bosse: trvale + výdělek v hospodách */
export const SEAL_BONUS = 0.1;
