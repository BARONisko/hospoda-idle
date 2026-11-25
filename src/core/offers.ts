// Lákadla k nákupu (přání uživatele, 25. 11. 2026): startovní balíček, vánoční balík, první nákup diamantů ×2,
// video za coins u nákupu, na který hráč nemá. Pravidla férovosti: žádné náhodné odměny, odpočty jsou skutečné
// (nabídka se po vypršení neobnoví), obsah i cena jsou vidět předem.
// Pravidlo jedné nabídky (uživatel): nejvýš jedna vyskakovací nabídka za spuštění hry, ne v prvních minutách,
// ostatní jen v dlaždici Speciální nabídka. Čistá logika bez Phaseru – testuje se i v simulaci.
import { dayKey } from './special';
import { season } from './season';

export interface OfferState {
  /** kdy se startovní balíček poprvé nabídl (od té chvíle platí STARTER_H hodin) */
  starterAt?: number;
  /** koupené jednorázové nabídky ('starter', 'xmas2026' …) */
  bought?: string[];
  /** balíčky diamantů koupené aspoň jednou (dvojnásobek jen při prvním nákupu každého) */
  first?: string[];
  /** den a nabídka posledního vyskakovacího okna (každá nabídka nejvýš jednou denně) */
  pop?: Record<string, string>;
  /** videa za coins dnes */
  vid?: { day: string; n: number };
  /** denní video výzva: kolik videí dnes, vyzvednuto */
  vc?: { day: string; n: number; got?: boolean };
  /** nabídka po milníku (nová hospoda, první poražený Cthulhu): id a kdy začala */
  ms?: { id: string; at: number };
}

// ---------- startovní balíček ----------
export const STARTER_H = 48;
export const STARTER_GEMS = 300;
export const STARTER_PASS_DAYS = 3;
/** za vzhled, který už hráč má, dostane místo něj tolik diamantů (= cena livreje v obchodě) */
export const STARTER_LOOK_GEMS = 300;

/** od kolikáté hygieny se startovní balíček nabízí: první hygiena od 1., ve které se nic neodemyká
 *  (přání uživatele: když se v té hygieně už něco odemyká, posunout o hygienu dál) */
export function starterHyg(unlocks: number[]) {
  let h = 1;
  while (unlocks.includes(h)) h++;
  return h;
}

/** do kdy platí startovní balíček (0 = ještě se nenabídl) */
export const starterUntil = (o: OfferState | undefined) => (o?.starterAt ? o.starterAt + STARTER_H * 3600_000 : 0);
/** startovní balíček jde koupit teď (nabídnutý, nevypršel, nekoupený) */
export const starterLive = (o: OfferState | undefined, now = Date.now()) => !!o?.starterAt && now < starterUntil(o) && !o.bought?.includes('starter');

// ---------- vánoční balík ----------
export const XMAS_GEMS = 700;
export const XMAS_PASS_DAYS = 7;
/** klíč vánočního balíku pro sezónu (Vánoce přes Nový rok patří k roku, kdy začaly) */
export function xmasKey(now = Date.now()) {
  const d = new Date(now);
  return `xmas${d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear()}`;
}
/** konec vánoční nabídky (6. 1. 23:59:59 místního času) */
export function xmasUntil(now = Date.now()) {
  const d = new Date(now);
  const y = d.getMonth() === 0 ? d.getFullYear() : d.getFullYear() + 1;
  return new Date(y, 0, 6, 23, 59, 59).getTime();
}
/** vánoční balík jde koupit teď (běží sezóna Vánoce a letos ještě nekoupen) */
export const xmasLive = (o: OfferState | undefined, now = Date.now(), s = season) => s === 'xmas' && !o?.bought?.includes(xmasKey(now));

// ---------- diamanty: víc balíčků, první nákup ×2 ----------
export const GEM_PACKS = ['gems50', 'gems100', 'gems550', 'gems1500', 'gems3500'] as const;
/** kolik diamantů balíček teď dá (první nákup každého balíčku ×2) */
export const packGems = (o: OfferState | undefined, id: string, base: number) => (o?.first?.includes(id) ? base : base * 2);

// ---------- video za coins (u nákupu, na který hráč nemá) ----------
export const COIN_VID_MIN = 30;
export const COIN_VID_DAY = 10;
export const coinVidLeft = (o: OfferState | undefined, now = Date.now()) => (o?.vid?.day === dayKey(now) ? Math.max(0, COIN_VID_DAY - o.vid.n) : COIN_VID_DAY);
export function coinVidUse(o: OfferState, now = Date.now()) {
  const day = dayKey(now);
  o.vid = o.vid?.day === day ? { day, n: o.vid.n + 1 } : { day, n: 1 };
}

// ---------- denní video výzva ----------
export const VC_GOAL = 5;
export const VC_GEMS = 3;
/** odměna navíc: tolik hodin výdělku */
export const VC_H = 2;
export const vcNow = (o: OfferState | undefined, now = Date.now()) => (o?.vc?.day === dayKey(now) ? o.vc : { day: dayKey(now), n: 0, got: false });
/** zhlédnuté video (jakékoli za odměnu) */
export function vcAdd(o: OfferState, now = Date.now()) {
  const v = vcNow(o, now);
  o.vc = { ...v, n: Math.min(VC_GOAL, v.n + 1) };
}
export const vcReady = (o: OfferState | undefined, now = Date.now()) => {
  const v = vcNow(o, now);
  return v.n >= VC_GOAL && !v.got;
};

// ---------- nabídka po milníku ----------
export const MS_H = 24;
export const MS_GEMS = 500;
export const MS_SKIP_H = 8;
export const MS_PASS_DAYS = 3;
/** milník nastal: nabídka začne, jen když žádná jiná neběží a tenhle milník ještě nebyl */
export function msStart(o: OfferState, id: string, now = Date.now()) {
  if (msLive(o, now) || o.bought?.includes('ms:' + id) || o.ms?.id === id) return false;
  o.ms = { id, at: now };
  return true;
}
export const msUntil = (o: OfferState | undefined) => (o?.ms ? o.ms.at + MS_H * 3600_000 : 0);
export const msLive = (o: OfferState | undefined, now = Date.now()) => !!o?.ms && now < msUntil(o) && !o.bought?.includes('ms:' + o.ms.id);

// ---------- pravidlo jedné nabídky ----------
/** vyskakovací nabídka nejdřív tolik minut po spuštění hry */
export const POP_AFTER_MIN = 3;
/** spuštění hry (modul se načte jednou za spuštění; hygiena scénu restartuje, ale tohle zůstává) */
const BOOT = Date.now();
let popped = false;

export type PopId = 'starter' | 'xmas' | 'milestone';
/** která nabídka smí teď vyskočit (null = žádná). hyg = počet hygien, from = od které hygieny startovní balíček. */
export function popDue(o: OfferState | undefined, hyg: number, from: number, now = Date.now(), s = season): PopId | null {
  if (popped || now - BOOT < POP_AFTER_MIN * 60_000) return null;
  const today = dayKey(now);
  const seen = (id: PopId) => o?.pop?.[id] === today;
  if (msLive(o, now) && o?.pop?.milestone !== o!.ms!.id) return 'milestone';
  // vánoční jen hráčům, kteří už hrají (po startovním prahu), ať nováčka nezahltí
  if (hyg >= from && xmasLive(o, now, s) && !seen('xmas')) return 'xmas';
  if (hyg >= from && !o?.bought?.includes('starter') && (!o?.starterAt || starterLive(o, now)) && !seen('starter')) return 'starter';
  return null;
}
/** nabídka vyskočila: zapsat (do dalšího spuštění už žádná) */
export function popShown(o: OfferState, id: PopId, now = Date.now()) {
  popped = true;
  // milník: jednou za milník (ne za den)
  (o.pop ??= {})[id] = id === 'milestone' ? (o.ms?.id ?? '') : dayKey(now);
  if (id === 'starter') o.starterAt ??= now;
}
/** jen pro testy */
export const _popReset = () => (popped = false);
