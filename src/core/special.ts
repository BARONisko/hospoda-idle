// Speciální nabídka: denní truhla (série 7 dní), reklamní kampaň (výdělek ×1,2 → ×2) a VIP host (každých 6 h).
// Čistá logika bez Phaseru – testuje se i v simulaci.

// ---------- denní truhla ----------
export interface ChestState {
  /** kolikátý den série byl naposledy otevřen (1–7) */
  day: number;
  /** den posledního otevření (místní datum YYYY-MM-DD) */
  last: string;
}

/** místní datum YYYY-MM-DD */
export function dayKey(now = Date.now()) {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const yesterday = (now: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return dayKey(d.getTime());
};

export const chestReady = (c: ChestState | undefined, now = Date.now()) => !c || c.last !== dayKey(now);
/** kolikátý den série by se otevřel teď (1–7); vynechaný den = znovu od 1., po 7. dnu znovu 1. */
export function chestDay(c: ChestState | undefined, now = Date.now()) {
  if (!c) return 1;
  if (c.last === dayKey(now)) return c.day;
  return c.last === yesterday(now) && c.day < 7 ? c.day + 1 : 1;
}

export type ChestRew = { k: 'coins'; h: number } | { k: 'bones'; n: number } | { k: 'darts'; n: number } | { k: 'krigle'; n: number } | { k: 'gold' };
/** odměny dnů 1–7 (7. den zlatá truhla: +1 bod číšníkovi a 3 krígly) */
export const CHEST_REW: ChestRew[] = [
  { k: 'coins', h: 2 },
  { k: 'bones', n: 5 },
  { k: 'darts', n: 20 },
  { k: 'coins', h: 4 },
  { k: 'bones', n: 10 },
  { k: 'krigle', n: 1 },
  { k: 'gold' },
];
export const GOLD_KRIGLE = 3;

/** otevře truhlu: vrátí den (1–7) a uloží sérii */
export function openChest(c: ChestState | undefined, now = Date.now()): { st: ChestState; day: number } {
  const day = chestDay(c, now);
  return { st: { day, last: dayKey(now) }, day };
}

// ---------- reklamní kampaň ----------
export interface AdvState {
  /** kampaň běží do (ms) */
  until: number;
  /** počet zhlédnutí (každé +0,02, nejvýš +0,4) */
  views: number;
  /** úroveň „Lepší reklama“ za krígly (každá +0,1, max 4) */
  lvl: number;
}
export const AD_BASE = 1.2;
export const AD_VIEW = 0.02;
export const AD_VIEW_MAX = 0.4;
export const AD_LVL = 0.1;
export const AD_LVL_MAX = 4;
export const AD_H = 4;
export const AD_MAX_H = 12;
export const AD_TOP = AD_BASE + AD_VIEW_MAX + AD_LVL * AD_LVL_MAX;
export const adLvlCost = (l: number) => [10, 30, 90, 270][l] ?? Infinity;

export const newAdv = (): AdvState => ({ until: 0, views: 0, lvl: 0 });
/** násobek kampaně (i když zrovna neběží – kolik by dala) */
export const adPower = (a: AdvState | undefined) => (a ? AD_BASE + Math.min(AD_VIEW_MAX, a.views * AD_VIEW) + a.lvl * AD_LVL : AD_BASE);
/** násobek výdělku teď (1 = kampaň neběží) */
export const adMult = (a: AdvState | undefined, now = Date.now()) => (a && a.until > now ? adPower(a) : 1);
/** zhlédnutí: +4 h (nejvýš 12 h dopředu) a +0,02 do násobku */
export function adWatch(a: AdvState, now = Date.now()) {
  a.until = Math.min(now + AD_MAX_H * 3600_000, Math.max(now, a.until) + AD_H * 3600_000);
  a.views++;
}
/** kolik sekund z intervalu [from, to] (ms) kampaň běžela */
export const adOverlap = (a: AdvState | undefined, from: number, to: number) => (a ? Math.max(0, Math.min(to, a.until) - from) / 1000 : 0);

// ---------- VIP host ----------
export interface VipState {
  /** příchod dalšího VIP (ms) */
  next: number;
  /** právě čeká do (ms); 0 = nikdo nečeká */
  until: number;
}
export const VIP_EVERY = 6 * 3600_000;
/** odměna = tolik hodin výdělku */
export const VIP_H = 2;
/** jak dlouho VIP čeká (30–60 min, podle času příchodu – stejné i po načtení) */
export const vipWait = (at: number) => (30 + (Math.floor(at / 60_000) % 31)) * 60_000;

export const newVip = (now = Date.now()): VipState => ({ next: now + 20 * 60_000, until: 0 });

/** posune stav: příchod / odchod (nestihl). Vrací 'came' | 'left' | null. */
export function vipTick(v: VipState, now = Date.now()): 'came' | 'left' | null {
  if (v.until && now >= v.until) {
    v.until = 0;
    return 'left';
  }
  if (!v.until && now >= v.next) {
    // přeskočit příchody, které celé proběhly, když hra byla zavřená
    while (v.next + vipWait(v.next) <= now) v.next += VIP_EVERY;
    if (now < v.next) return null;
    v.until = v.next + vipWait(v.next);
    v.next += VIP_EVERY;
    return 'came';
  }
  return null;
}

/** obsloužen: odchází spokojený */
export function vipServe(v: VipState) {
  v.until = 0;
}
