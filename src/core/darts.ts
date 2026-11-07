// Šipky: hra na nulu (odečítá se, přestřelený hod se nepočítá). Začíná na 301 a každá dohraná hra cíl zvedne
// (body ze začátku rychle, pak pomaleji). Šipky přibývají samy (10 za hodinu), dohraná hra = 1 bod na vylepšení.
// Ručně se nemíří: bez automatu se hází ťuknutím na terč (jen když je otevřený); koupený automat (1 bod) hází
// sám po 2 s v reálném čase (i v hospodě a offline – 1 šipka za 2 s, nikdy celá zásoba najednou) a jde vypnout.
// Automat je první vylepšení (ostatní jdou koupit až po něm). Přestřelený hod se nepočítá.
import { t } from '../i18n';
import type { StatId } from './talisman';

export interface DartsState {
  /** šipky v zásobě a čas posledního přírůstku (ms) */
  have: number;
  at: number;
  /** body na vylepšení a úrovně vylepšení */
  pts: number;
  up: Record<string, number>;
  /** automatické házení zapnuté (platí jen s koupeným automatem up.auto) */
  auto: boolean;
  /** čas posledního hodu automatu na pozadí (ms) – hází v reálném čase, 1 šipka za THROW_GAP */
  tat?: number;
  /** verze (2 = bez ručního míření; 3 = automat se kupuje) */
  v?: number;
  /** zbývá do nuly v aktuální hře; dohrané hry; zásahy v řadě; vítr této hry (x, y v poloměrech terče) */
  left: number;
  legs: number;
  combo: number;
  wind: [number, number];
}

export const START = 301;
/** cíl hry podle počtu dohraných her: 301, 311, 321 … až 1001 */
export const target = (legs: number) => Math.min(1001, START + 10 * legs);
/** mezera mezi hody, když je terč otevřený (s) */
export const THROW_GAP = 2;
/** 10 šipek za hodinu (+1 za úroveň „Víc šipek za hodinu“) */
export const DART_MS = 360_000;
export const dartMs = (up: Record<string, number>, statSpeed = 0) => 3_600_000 / ((10 + (up.rate ?? 0)) * (1 + statSpeed));
/** strop zásoby (když se nehází) */
export const DART_CAP = 60;
export const dartCap = (up: Record<string, number>) => DART_CAP + 10 * (up.cap ?? 0);

export const newDarts = (now = Date.now()): DartsState => ({ have: 100, at: now, pts: 0, up: {}, auto: true, v: 3, left: START, legs: 0, combo: 0, wind: newWind() });

function newWind(): [number, number] {
  const a = Math.random() * Math.PI * 2, s = Math.random() * 0.15;
  return [Math.cos(a) * s, Math.sin(a) * s];
}

/** vylepšení terče: 14 pro šipky + 8 do celé hry (staty jako talismany, pod 1 % za úroveň) */
export interface DartUp {
  id: string;
  name: string;
  desc: (lvl: number) => string;
  max: number;
  cost: (lvl: number) => number;
  /** stat do celé hry (přičte se k talismanům) */
  stat?: StatId;
}
/** hází automat? (koupený a zapnutý) */
export const autoOn = (s: DartsState) => s.auto && (s.up.auto ?? 0) > 0;
const pc = (v: number) => String(Math.round(v * 10) / 10).replace('.', ',');
const grow = (base: number, g: number) => (l: number) => Math.ceil(base * g ** l);
export const DART_UPS: DartUp[] = [
  { id: 'auto', name: t('Automatické házení'), desc: () => t('hází samo po 2 s, i když tu nejsi'), max: 1, cost: () => 1 },
  { id: 'acc', name: t('Přesnost'), desc: (l) => t('rozptyl menší o {v} %', { v: pc((1 - 0.96 ** l) * 100) }), max: 40, cost: grow(1, 1.06) },
  { id: 'rate', name: t('Víc šipek za hodinu'), desc: (l) => t('{n} šipek za hodinu', { n: 10 + l }), max: 20, cost: grow(2, 1.08) },
  { id: 'cap', name: t('Větší toulec'), desc: (l) => t('zásoba až {n} šipek', { n: DART_CAP + 10 * l }), max: 10, cost: grow(1, 1.15) },
  { id: 'more', name: t('Víc šipek do hry'), desc: (l) => t('+{n} šipek zdarma na začátku každé hry', { n: 2 * l }), max: 5, cost: grow(2, 1.3) },
  { id: 'bull', name: t('Větší střed terče'), desc: (l) => t('bull větší o {v} %', { v: 5 * l }), max: 10, cost: grow(2, 1.15) },
  { id: 'rings', name: t('Širší double a triple'), desc: (l) => t('pole s násobky širší o {v} %', { v: 4 * l }), max: 10, cost: grow(2, 1.15) },
  { id: 'crit', name: t('Kritický hod'), desc: (l) => t('šance {v} % na ×2 body', { v: l }), max: 25, cost: grow(1, 1.07) },
  { id: 'combo', name: t('Kombo'), desc: (l) => t('od 3. zásahu v řadě +{n} bodů za zásah', { n: l }), max: 10, cost: grow(2, 1.15) },
  { id: 'magnet', name: t('Magnet'), desc: (l) => t('šipka se přitáhne k poli o {v} %', { v: 3 * l }), max: 20, cost: grow(1, 1.08) },
  { id: 'second', name: t('Druhá šance'), desc: (l) => t('šance {v} %, že hod mimo terč šipku nespotřebuje', { v: 2 * l }), max: 25, cost: grow(1, 1.07) },
  { id: 'wind', name: t('Méně větru'), desc: (l) => t('vítr stáčí šipky o {v} % méně', { v: 5 * l }), max: 20, cost: grow(1, 1.08) },
  { id: 'extra', name: t('Bod navíc'), desc: (l) => t('šance {v} %, že dohraná hra dá 2 body', { v: l }), max: 30, cost: grow(2, 1.05) },
  // do celé hry
  { id: 'gIncome', name: t('Terč: výdělek'), desc: (l) => t('výdělek v hospodách +{v} %', { v: pc(0.9 * l) }), max: 100, cost: grow(1, 1.055), stat: 'income' },
  { id: 'gTips', name: t('Terč: spropitné'), desc: (l) => t('spropitné +{v} %', { v: pc(0.9 * l) }), max: 100, cost: grow(1, 1.055), stat: 'tips' },
  { id: 'gBones', name: t('Terč: kosti'), desc: (l) => t('kosti +{v} %', { v: pc(0.9 * l) }), max: 100, cost: grow(1, 1.055), stat: 'bones' },
  { id: 'gTent', name: t('Terč: chapadla'), desc: (l) => t('chapadla v chrámu +{v} %', { v: pc(0.9 * l) }), max: 100, cost: grow(1, 1.055), stat: 'tentacles' },
  { id: 'gTemple', name: t('Terč: síla v chrámu'), desc: (l) => t('síla zásahu v chrámu +{v} %', { v: pc(0.9 * l) }), max: 100, cost: grow(1, 1.055), stat: 'temple' },
  { id: 'gKrigly', name: t('Terč: krígly'), desc: (l) => t('krígly z hygieny +{v} %', { v: pc(0.9 * l) }), max: 100, cost: grow(1, 1.055), stat: 'krigly' },
  { id: 'gColl', name: t('Terč: sběrač'), desc: (l) => t('sběrač bublin rychlejší o {v} %', { v: pc(0.9 * l) }), max: 100, cost: grow(1, 1.055), stat: 'coll' },
  { id: 'gBeer', name: t('Terč: pivo'), desc: (l) => t('pivo z pivovaru dráž o {v} %', { v: pc(0.9 * l) }), max: 100, cost: grow(1, 1.055), stat: 'beer' },
];
export const GAME_PER = 0.009;

/** staty do celé hry z terče */
export function dartStats(s: DartsState | undefined): Partial<Record<StatId, number>> {
  const o: Partial<Record<StatId, number>> = {};
  if (!s) return o;
  for (const u of DART_UPS) if (u.stat) o[u.stat] = (o[u.stat] ?? 0) + (s.up[u.id] ?? 0) * GAME_PER;
  return o;
}

// ---------- terč (souřadnice v poloměrech terče, 0 = střed, 1 = okraj) ----------
export const NUMS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
/** poloměry podle vylepšení: bull, outer bull, triple od–do, double od–do */
export function rings(up: Record<string, number>) {
  const b = 1 + 0.05 * (up.bull ?? 0), w = 1 + 0.04 * (up.rings ?? 0);
  // jako terč v P.U.B. (R = 62 px: bull 3,2, střed 7, triple 34–39, double 56–62)
  const tw = (5 / 62) * w, dw = (6 / 62) * w;
  return { bull: (3.2 / 62) * b, outer: (7 / 62) * b, t0: 36.5 / 62 - tw / 2, t1: 36.5 / 62 + tw / 2, d0: 1 - dw, d1: 1 };
}
export const segAt = (x: number, y: number) => {
  const a = Math.atan2(x, -y);
  return Math.floor(((((a + Math.PI / 20) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 10));
};
export function score(x: number, y: number, up: Record<string, number>): { pts: number; label: string; mult: number; n: number } {
  const r = rings(up), d = Math.hypot(x, y);
  if (d > 1) return { pts: 0, label: t('Vedle!'), mult: 0, n: 0 };
  if (d < r.bull) return { pts: 50, label: 'BULL', mult: 2, n: 25 };
  if (d < r.outer) return { pts: 25, label: '25', mult: 1, n: 25 };
  const n = NUMS[segAt(x, y)];
  if (d >= r.d0) return { pts: n * 2, label: `D${n}`, mult: 2, n };
  if (d >= r.t0 && d <= r.t1) return { pts: n * 3, label: `T${n}`, mult: 3, n };
  return { pts: n, label: String(n), mult: 1, n };
}
/** střed pole (pro míření a magnet) */
export function fieldPos(n: number, mult: number, up: Record<string, number>): [number, number] {
  const r = rings(up);
  if (n === 25) return [0, 0];
  const a = (NUMS.indexOf(n) / 20) * Math.PI * 2;
  const rad = mult === 3 ? (r.t0 + r.t1) / 2 : mult === 2 ? (r.d0 + r.d1) / 2 : (r.outer + r.t0) / 2;
  return [Math.sin(a) * rad, -Math.cos(a) * rad];
}
/** kam míří automat (a poradí hráči): na velký zbytek T20, na konci přesně na zbytek */
export function aimFor(left: number): { n: number; mult: number } {
  if (left > 60) return { n: 20, mult: 3 };
  if (left === 50 || left === 25) return { n: 25, mult: left === 50 ? 2 : 1 };
  if (left <= 20) return { n: left, mult: 1 };
  if (left % 3 === 0 && left / 3 <= 20) return { n: left / 3, mult: 3 };
  if (left % 2 === 0 && left / 2 <= 20) return { n: left / 2, mult: 2 };
  return { n: Math.min(20, left - 20 > 0 ? left - 20 : left), mult: 1 };
}

/** rozptyl hodu (směrodatná odchylka v poloměrech terče): na začátku skoro mimo */
export const spread = (up: Record<string, number>, statAcc = 0) => (0.3 * 0.96 ** (up.acc ?? 0)) / (1 + statAcc);

const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

/** hod na pole, kam míří automat (přestřelený hod se nepočítá – rozhodnutí uživatele) */
export function aimLand(s: DartsState, statAcc = 0): [number, number] {
  const a = aimFor(s.left);
  const [ax, ay] = fieldPos(a.n, a.mult, s.up);
  const [x, y] = land(s, ax, ay, statAcc);
  return [x, y];
}

/** kam šipka dopadne při míření na (ax, ay) */
export function land(s: DartsState, ax: number, ay: number, statAcc = 0): [number, number] {
  const sg = spread(s.up, statAcc), wk = 1 - 0.05 * (s.up.wind ?? 0);
  let x = ax + gauss() * sg + s.wind[0] * wk, y = ay + gauss() * sg + s.wind[1] * wk;
  // magnet: přitáhne ke středu pole, kam dopadla
  const m = 0.03 * (s.up.magnet ?? 0);
  if (m > 0 && Math.hypot(x, y) <= 1) {
    const sc = score(x, y, s.up);
    const [fx, fy] = fieldPos(sc.n, sc.mult, s.up);
    x += (fx - x) * m;
    y += (fy - y) * m;
  }
  return [x, y];
}

export interface ThrowResult {
  x: number;
  y: number;
  label: string;
  pts: number;
  bust: boolean;
  crit: boolean;
  combo: number;
  /** šipka se nespotřebovala (druhá šance) */
  saved: boolean;
  /** dohraná hra: kolik bodů */
  leg: number;
}

/** vyhodnotí hod (šipku už má volající odečtenou) */
export function resolve(s: DartsState, x: number, y: number, extra = 0): ThrowResult {
  const sc = score(x, y, s.up);
  const res: ThrowResult = { x, y, label: sc.label, pts: 0, bust: false, crit: false, combo: 0, saved: false, leg: 0 };
  if (!sc.pts) {
    s.combo = 0;
    res.saved = Math.random() < 0.02 * (s.up.second ?? 0);
    return res;
  }
  s.combo++;
  let pts = sc.pts;
  // krit a kombo pomáhají, ale nikdy nepřestřelí (na konci se počítá jen čistý zásah)
  if (Math.random() < 0.01 * (s.up.crit ?? 0) && pts * 2 <= s.left) {
    pts *= 2;
    res.crit = true;
  }
  if (s.combo >= 3 && pts + (s.up.combo ?? 0) <= s.left) {
    res.combo = s.combo;
    pts += s.up.combo ?? 0;
  }
  if (pts > s.left) {
    // přestřelil: hod se nepočítá
    res.bust = true;
    res.pts = 0;
    return res;
  }
  s.left -= pts;
  res.pts = pts;
  if (s.left === 0) {
    res.leg = Math.random() < 0.01 * (s.up.extra ?? 0) + extra ? 2 : 1;
    s.pts += res.leg;
    s.legs++;
    s.left = target(s.legs);
    s.combo = 0;
    s.wind = newWind();
    s.have += 2 * (s.up.more ?? 0);
  }
  return res;
}

/** doplní šipky podle času; když hází automat (a terč není otevřený), rovnou je odhází. Vrací počet dohraných her. */
export function tickDarts(s: DartsState, now: number, throwNow: boolean, statAcc = 0, statSpeed = 0, extra = 0): { legs: number; pts: number; thrown: number } {
  const ms = dartMs(s.up, statSpeed);
  const n0 = Math.floor((now - s.at) / ms);
  // offline nejvýš 12 h šipek
  const n = Math.min(n0, Math.round((12 * 3600_000) / ms));
  if (n0 > 0) {
    s.at += n0 * ms;
    // bez automatu se zásoba plní jen do stropu
    const cap = dartCap(s.up);
    s.have = autoOn(s) ? s.have + n : s.have >= cap ? s.have : Math.min(cap, s.have + n);
  }
  const out = { legs: 0, pts: 0, thrown: 0 };
  const gap = THROW_GAP * 1000;
  if (!throwNow || !autoOn(s)) {
    s.tat = now;
    return out;
  }
  // v reálném čase: za uplynulý čas nejvýš 1 hod za THROW_GAP (zásoba se neodhází najednou)
  let allowed = Math.floor((now - (s.tat ?? now)) / gap);
  if (s.tat === undefined) s.tat = now;
  while (s.have > 0 && allowed-- > 0) {
    s.tat += gap;
    s.have--;
    const [x, y] = aimLand(s, statAcc);
    const r = resolve(s, x, y, extra);
    if (r.saved) s.have++;
    out.thrown++;
    if (r.leg) {
      out.legs++;
      out.pts += r.leg;
    }
  }
  // bez šipek se čas na hody nešetří
  if (s.have <= 0 || now - s.tat > gap) s.tat = Math.max(s.tat, now - gap);
  return out;
}

/** staré uložení (ruční míření, automat za bod): vrátit body za zrušená vylepšení */
export function migrateDarts(s: DartsState) {
  // v3: automat se kupuje – kdo hrál s automatem zdarma, dostane ho
  if (s.v === 2) {
    s.up.auto = 1;
    s.v = 3;
  }
  if (s.v === 3) return;
  const old: Record<string, (l: number) => number> = { auto: () => 1, steady: grow(1, 1.15), slow: grow(1, 1.15), time: grow(1, 1.3) };
  for (const [id, f] of Object.entries(old)) {
    for (let l = 0; l < (s.up[id] ?? 0); l++) s.pts += f(l);
    delete s.up[id];
  }
  s.auto = true;
  s.up.auto = 1;
  s.v = 3;
}
