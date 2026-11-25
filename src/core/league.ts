// Týdenní liga: soupeřova hospoda je číslo – její tržba během týdne živě roste a na konci týdne ji musíš mít vyšší.
// Soupeř zrychluje každý den, vyšší liga je silnější, a když vedeš, soupeř zabere víc (až +60 %).
// Výhra = postup do vyšší ligy + krígly + talisman, prohra = sestup.
import { t } from '../i18n';
import { NAMES, fullName } from '../i18n/names';

export const LEAGUES = [t('Okresní přebor'), t('Krajská liga'), t('Národní liga'), t('Pivní mistrovství'), t('Liga hlubin')];

export interface LeagueState {
  week: string;
  /** začátek týdne (ms) */
  start: number;
  /** liga 1–5 */
  tier: number;
  /** výdělek soupeře za sekundu na začátku týdne */
  rate: number;
  /** můj výdělek tento týden */
  me: number;
  /** tržba soupeře tento týden (roste průběžně, viz rivalTick) */
  rival?: number;
  /** kdy se tržba soupeře naposledy dopočítala (ms) */
  rAt?: number;
  /** pivo pro soupeře: do kdy vydělává jen polovinu (ms) */
  slowUntil?: number;
  /** můj výdělek za sekundu na začátku týdne (pro vyrovnání dalšího týdne) */
  base?: number;
  /** 💎 Posila na směnu: od kdy (ms) a v který den (max 1× denně) */
  boostFrom?: number;
  boostDay?: string;
  /** 💎 Divoká karta: tento týden při prohře nesestoupíš */
  wild?: boolean;
  /** 💎 Zavřená pípa soupeře: od kdy (ms) a v který den (max 1× denně) */
  stopFrom?: number;
  stopDay?: string;
  /** minulé týdny (až 3) pro výpočet soupeře */
  prev?: { me: number; base?: number }[];
  /** Ligový pohár: liga (1–5), kterou hráč vyhrál minulý týden → tento týden výdělek +LG_CUP × liga */
  cup?: number;
}

// ---------- utrácení 💎 v lize (přání uživatele) ----------
/** Posila na směnu: tržba do ligy ×2 na 1 h, max 1× denně */
export const LG_BOOST = { gems: 20, ms: 3600_000 };
/** Divoká karta: při prohře nesestoupíš, 1× týdně (platí pro tento týden) */
export const LG_WILD = 50;
/** Zavřít soupeři pípu: soupeř 2 h nepřibývá, max 1× denně */
export const LG_STOP = { gems: 30, ms: 2 * 3600_000 };
/** běží teď okno [from, from + ms)? (hodiny vrácené dozadu → neběží, neprodlouží se) */
export const fxOn = (from: number | undefined, ms: number, now = Date.now()) => from !== undefined && from <= now && now < from + ms;
/** zbývající čas okna (ms) */
export const fxLeft = (from: number | undefined, ms: number, now = Date.now()) => (fxOn(from, ms, now) ? from! + ms - now : 0);
/** jaký podíl úseku [a, b) spadá do Posily (pro výdělek offline) */
export function boostShare(L: LeagueState, a: number, b: number) {
  if (L.boostFrom === undefined || b <= a) return fxOn(L.boostFrom, LG_BOOST.ms, b) ? 1 : 0;
  const o = Math.min(b, L.boostFrom + LG_BOOST.ms) - Math.max(a, L.boostFrom);
  return Math.max(0, Math.min(1, o / (b - a)));
}

// ---------- soupeř jako člověk: jméno, hospoda, postavička ----------
// jména podle jazyka hry (src/i18n/names.ts)
const FIRST = NAMES.first, LAST = NAMES.last, PUBS = NAMES.pubs;

const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** soupeř tohoto týdne (stejný po celý týden): jméno, hospoda, číslo postavičky hosta */
export function rivalInfo(L: Pick<LeagueState, 'week' | 'tier'>, guests = 16) {
  const h = hashStr(`${L.week}|${L.tier}`);
  const fi = h % FIRST.length, woman = fi >= 12 && fi < 23;
  const last = LAST[(h >>> 5) % LAST.length];
  return { name: fullName(FIRST[fi], last, woman), woman, pub: PUBS[(h >>> 10) % PUBS.length], look: (h >>> 15) % guests };
}

/** obtížnost lig: kolik soupeř vydělá oproti tomu, co hráč zvládl minulý týden */
export const TIER_F = [0.7, 0.85, 1, 1.15, 1.3];
/** tržba soupeře za celý týden při daném rate (bez reakcí na hráče) */
const weekTotal = (rate: number, tier: number) => ((rate * 86400) / Math.log(GROW)) * (GROW ** 7 - 1) * activity(tier);

/** výdělek soupeře na začátku týdne: vyrovnaný podle toho, kolik hráč vydělal minulý týden
 *  (s ohledem na to, jak od té doby zrychlil), jinak podle jeho výdělku za sekundu */
export function rivalRate(tier: number, myRate: number, last?: { me: number; base?: number } | { me: number; base?: number }[]) {
  const byRate = (Math.max(1, myRate) * TIER_F[tier - 1]) / TIER_F[0];
  // 25. 11. 2026: průměr posledních až 3 týdnů (jeden silný/slabý týden nerozhodí soupeře – dřív hráč střídal výhra/prohra)
  const hist = (Array.isArray(last) ? last : last ? [last] : []).filter((h) => h.me > 0 && h.base);
  // první týden (bez historie): mírnější, aby i slabší hráč měl šanci
  if (!hist.length) return byRate * 0.45;
  // strop zrychlení 6× za každý týden stáří (starší týden mohl být mnohem menší)
  const grown = hist.map((h, i) => h.me * Math.min(6 ** (hist.length - i), Math.max(1, myRate / h.base!)));
  const target = (grown.reduce((a, b) => a + b, 0) / grown.length) * TIER_F[tier - 1];
  // nejvýš 2× a nejméně ¼ toho, co by dal výdělek za sekundu (aby jeden divný týden nerozhodil vše)
  return Math.min(byRate * 2, Math.max(byRate / 4, target / weekTotal(1, tier)));
}

const WEEK = 7 * 86400_000;
/** soupeř zrychluje o 20 % denně */
const GROW = 1.2;

/** pondělí 00:00 aktuálního týdne (místní čas) */
export function weekStart(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.getTime();
}

/** jak aktivní je soupeř (podíl dne, kdy vydělává) – vyšší liga je pilnější */
const activity = (tier: number) => 0.25 + 0.07 * tier;

/** tržba soupeře od začátku týdne do teď */
export function rivalScore(L: LeagueState, now = Date.now()) {
  const days = Math.min(WEEK, Math.max(0, now - L.start)) / 86400_000;
  return ((L.rate * 86400) / Math.log(GROW)) * (GROW ** days - 1) * activity(L.tier);
}

export const weekEnd = (L: LeagueState) => L.start + WEEK;
/** těsný výsledek (do ±5 %): odměna za výhru ano, ale hráč zůstává v lize (nepostoupí ani nesestoupí) */
export const LG_BAND = 0.05;
/** posun v lize podle výsledku: +1 postup, 0 zůstává, −1 sestup */
export const leagueMove = (me: number, rival: number) => (!(rival > 0) ? (me > rival ? 1 : -1) : me > rival * (1 + LG_BAND) ? 1 : me < rival * (1 - LG_BAND) ? -1 : 0);
// ---------- odměny za výhru (přání uživatele, hospoda 72: kdo platí 💎 za Posilu / Zavřenou pípu, musí za výhru dostat víc) ----------
/** 💎 za výhru = LG_WIN_GEMS × liga (30 … 150; dřív 2 × liga – míň než jedna Posila za 20 💎) */
export const LG_WIN_GEMS = 30;
/** krígly za výhru: aspoň LG_WIN_KRIGLE × liga, jinak LG_WIN_KRIGLE_F × liga z vlastněných (roste s hráčem jako truhla; dřív pevných 5 × liga) */
export const LG_WIN_KRIGLE = 10;
export const LG_WIN_KRIGLE_F = 0.01;
/** Ligový pohár: po výhře výdělek +10 % × vyhraná liga po celý další týden (nesčítá se, každý týden znovu) */
export const LG_CUP = 0.1;
export const winGems = (tier: number) => LG_WIN_GEMS * tier;
export const winReward = (tier: number, krigle = 0) => Math.max(LG_WIN_KRIGLE * tier, Math.floor(Math.max(0, krigle) * LG_WIN_KRIGLE_F * tier));
/** násobek výdělku z poháru za minulý týden */
export const cupMult = (L?: Pick<LeagueState, 'cup'>) => 1 + LG_CUP * Math.min(5, Math.max(0, L?.cup ?? 0));

/** jak rychle soupeř právě vydělává (coins/s) – bez reakce na hráče */
const rivalSpeed = (L: LeagueState, at: number) => L.rate * activity(L.tier) * GROW ** ((at - L.start) / 86400_000);

/** když vedeš, soupeř zabere: +0 až +60 % podle náskoku; když soupeř vede o hodně, poleví (až na 60 %) – souboj je vyrovnaný */
const push = (me: number, rival: number, rate: number) => {
  const d = (me - rival) / Math.max(me, rival, rate * 3600);
  return d > 0 ? 1 + 0.3 * Math.min(1, (me - rival) / Math.max(rival, rate * 3600)) : d < -0.2 ? Math.max(0.6, 1 + (d + 0.2)) : 1;
};

/** dopočítá tržbu soupeře do teď (po krocích max. 10 min, kvůli reakci na náskok) a vrátí ji */
export function rivalTick(L: LeagueState, now = Date.now()) {
  if (L.rival === undefined || L.rAt === undefined) {
    L.rival = rivalScore(L, now);
    L.rAt = Math.max(L.start, Math.min(now, weekEnd(L)));
  }
  const end = Math.min(now, weekEnd(L));
  while (L.rAt < end) {
    const dt = Math.min(60_000, end - L.rAt);
    const mid = L.rAt + dt / 2;
    const stop = L.stopFrom !== undefined && mid >= L.stopFrom && mid < L.stopFrom + LG_STOP.ms;
    L.rival += stop ? 0 : rivalSpeed(L, mid) * push(L.me, L.rival, L.rate) * (mid < (L.slowUntil ?? 0) ? 0.5 : 1) * (dt / 1000);
    L.rAt += dt;
  }
  return L.rival;
}
