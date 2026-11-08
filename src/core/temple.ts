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
  /** zvolená obtížnost 1–5, nejvyšší odemčená, uložené životy a truhly ostatních obtížností */
  diff?: number;
  maxD?: number;
  lv?: Record<number, { hp: number; chests: number }>;
  /** neotevřené truhly (obtížnost, ze které jsou) – otevírají se na konci kola */
  pend?: number[];
  /** oltář: týdenní bonusy ke statům (platí jen do dalšího víkendu) – 3 nabídky, úrovně */
  altar?: { wk: string; offers: string[]; lv: Record<string, number> };
  /** v pondělí: kolik shnilo a kolik kostí zachránila sůl (ukázat při příštím otevření) */
  rot?: { ten: number; bones: number };
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** ladění: ?temple=1 otevře chrám i ve všední den */
const force = () => typeof location !== 'undefined' && new URLSearchParams(location.search).get('temple') === '1';

/** je víkend (sobota/neděle místního času)? */
/** dřívější otevření na vyzkoušení (přání uživatele): od pátku 6. 11. 2026 do pondělí 9. 11. 0:00 místního času */
const EARLY_FROM = new Date(2026, 10, 6).getTime(), EARLY_TO = new Date(2026, 10, 9).getTime();
const early = (now: number) => now >= EARLY_FROM && now < EARLY_TO;

export const isWeekend = (now = Date.now()) => force() || early(now) || [0, 6].includes(new Date(now).getDay());

/** víkend v chrámu: kolik ms zbývá do konce (běží) nebo do začátku (neběží) */
export function weekendLeft(now = Date.now()): { on: boolean; ms: number } {
  if (early(now)) return { on: true, ms: EARLY_TO - now };
  const d = new Date(now), day = d.getDay();
  const t0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (day === 0 || day === 6) {
    // konec = pondělí 0:00
    t0.setDate(t0.getDate() + (day === 6 ? 2 : 1));
    return { on: true, ms: t0.getTime() - now };
  }
  t0.setDate(t0.getDate() + (6 - day));
  return { on: false, ms: t0.getTime() - now };
}

/** klíč víkendu = datum jeho soboty (ve všední den poslední minulé soboty) */
export function weekendKey(now = Date.now()) {
  if (early(now)) return '2026-11-07';
  const d = new Date(now);
  const back = (d.getDay() + 1) % 7; // so=0, ne=1, po=2 …
  d.setDate(d.getDate() - back);
  return ymd(d);
}

export const todayKey = (now = Date.now()) => ymd(new Date(now));

/** ms do začátku příští soboty (ve všední den) nebo do konce víkendu (o víkendu) */
export function msToSwitch(now = Date.now()) {
  if (early(now)) return EARLY_TO - now;
  const d = new Date(now);
  const day = d.getDay();
  const add = day === 6 ? 2 : day === 0 ? 1 : 6 - day;
  const e = new Date(d.getFullYear(), d.getMonth(), d.getDate() + add);
  return e.getTime() - now;
}

export const ROUNDS_PER_DAY = 5;
export const ROUND_S = 45;
export const MAX_CULT = 2;

/** 5 obtížností: víc životů, víc chapadel a nástrah, ale i víc odměn (chapadla, truhly, krígly) */
export const DIFFS = 5;
export const DIFF_HP = [1, 3, 8, 20, 50];
export const DIFF_REW = [1, 1.6, 2.5, 4, 6];
export const DIFF_NAMES = ['I', 'II', 'III', 'IV', 'V'];

/** životy bosse (v bodech zásahu): podle obtížnosti, mírně roste s každým poraženým */
export const bossHp = (boss: number, diff = 1) => Math.round(30000 * 1.15 ** boss * DIFF_HP[diff - 1]);

/** přepnout obtížnost: životy a truhly té minulé se uloží, nová pokračuje tam, kde hráč skončil */
export function setDiff(s: TempleState, d: number) {
  const lv = (s.lv ??= {});
  lv[s.diff ?? 1] = { hp: s.hp, chests: s.chests };
  const n = lv[d] ?? { hp: 1, chests: 0 };
  s.diff = d;
  s.hp = n.hp;
  s.chests = n.chests;
}

/** síla zásahu: hospody pomáhají jen logaritmicky (10× výdělek ≈ +15 % síly), hlavně vylepšení chrámu */
export function tapPower(incomePerSec: number, knife: number, templeStat: number) {
  return 10 * (1 + 0.15 * Math.log10(1 + Math.max(0, incomePerSec))) * (1 + 0.009 * knife) * (1 + templeStat);
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
    s.lv = {};
    s.idleAt = now;
  }
  if (s.day !== todayKey(now)) {
    s.day = todayKey(now);
    s.used = 0;
  }
  return s;
}

/** chapadla od kultistů za dobu bez hráče (jen o víkendu) */
export function cultIdle(s: TempleState, now = Date.now(), gain = 0) {
  const n = s.up.kult ?? 0;
  const h = Math.min(8, Math.max(0, now - s.idleAt) / 3.6e6);
  s.idleAt = now;
  if (!n || !isWeekend(now)) return 0;
  const got = Math.floor(h * CULT_IDLE_PER_H * n * (1 + gain));
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
  { id: 'kult', name: t('Kultista'), desc: () => t('přijde hned, seká chapadla v každé události a sbírá i bez tebe'), cost: (l) => [5000, 20000][l] ?? 0, max: MAX_CULT },
  { id: 'knife', name: t('Obětní dýka'), desc: (l) => t('síla zásahu +{v} %', { v: String(Math.round(9 * l) / 10).replace('.', ',') }), cost: (l) => Math.ceil(150 * 1.5 ** l) },
  { id: 'candle', name: t('Svíce navíc'), desc: (l) => t('svící na oltáři: {n}', { n: 3 + l }), cost: (l) => Math.ceil(400 * 2.5 ** l), max: 3 },
  { id: 'ward', name: t('Ochranný amulet'), desc: () => t('první útok v kole oltář nezasáhne'), cost: () => 600, max: 1 },
  { id: 'salt', name: t('Solná lázeň'), desc: (l) => t('v pondělí zachrání {v} % chapadel jako kosti', { v: l }), cost: (l) => Math.ceil(200 * 1.6 ** l), max: 10 },
];

/** oltářní obětina: +0,9 % ke statu na týden za koupi; cena roste s každou koupí toho víkendu */
export const ALTAR_PER = 0.009;
export const altarCost = (n: number) => Math.ceil(300 * 1.5 ** n);

/** pečeť R'lyeh za poraženého bosse: trvale + výdělek v hospodách */
export const SEAL_BONUS = 0.1;
