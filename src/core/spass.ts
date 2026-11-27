// Sezónní pass (plán „hra na rok“, schváleno 25. 11. 2026): každé 4 týdny nová sezóna, 30 stupňů,
// řada zdarma a Zlatá řada (placená). Body za denní úkoly, denní truhlu, týdenní výzvu a hygienu.
// Spouští se týden po vydání hry (SPASS_START). Okno = návrh B (svislý seznam), vybral Petr 25. 11. 2026.
import { t } from '../i18n';

/** začátek první sezóny (týden po vydání) a délka sezóny */
export const SPASS_START = Date.UTC(2026, 11, 4);
/** začátek pro výpočet (headless test ho posune do minulosti) */
export const SP = { start: SPASS_START };
export const SPASS_LEN = 28 * 86400_000;
export const SPASS_TIERS = 30;
/** body na jeden stupeň: běžný hráč ~140 bodů denně → všech 30 stupňů za ~3 týdny, slabší ~20 */
export const SPASS_TIER_PTS = 100;
export const SPASS_PTS = { daily: 30, chest: 20, weekly: 150, hyg: 15 } as const;
export type SPassKind = keyof typeof SPASS_PTS;

export interface SPassState {
  /** číslo sezóny (od 0) */
  s: number;
  pts: number;
  /** vyzvednuté stupně zdarma a zlaté */
  got: number[];
  gotG: number[];
  /** Zlatá řada koupená pro tuto sezónu */
  gold?: boolean;
}

/** coinsH = hodiny výdělku místo kostí/krígel, které hráč ještě nemá odemčené */
export type SPassRew = { gems?: number; bones?: number; krigle?: number; coinsH?: number };

/** číslo sezóny podle data (−1 = ještě nezačala) */
export const spassIdx = (now = Date.now()) => (now < SP.start ? -1 : Math.floor((now - SP.start) / SPASS_LEN));
/** konec aktuální sezóny (ms) */
export const spassEnd = (now = Date.now()) => SP.start + (spassIdx(now) + 1) * SPASS_LEN;
/** název sezóny (střídají se podle čísla) */
export const spassName = (s: number) => [t('Pivní podzim'), t('Zimní krčma'), t('Masopust'), t('Jarní pípa'), t('Májová zábava'), t('Letní zahrádka')][s % 6];

/** stav pro aktuální sezónu (nová sezóna = body a odměny od nuly) */
export function spassSync(st: SPassState | undefined, now = Date.now()): SPassState | undefined {
  const s = spassIdx(now);
  if (s < 0) return st;
  if (!st || st.s !== s) return { s, pts: 0, got: [], gotG: [] };
  return st;
}

export const spassTier = (st: SPassState) => Math.min(SPASS_TIERS, Math.floor(st.pts / SPASS_TIER_PTS));

/** odměna stupně n (1–30): řada zdarma střídá 💎 / kosti / krígly, zlatá dává zhruba 3× víc, na 30. stupni nejvíc */
export function spassRew(n: number, gold: boolean): SPassRew {
  const k = n % 3, m = gold ? 3 : 1;
  if (n === SPASS_TIERS) return gold ? { gems: 200, krigle: 20 } : { gems: 50 };
  if (k === 1) return { gems: (5 + Math.floor(n / 3) * 2) * m };
  if (k === 2) return { bones: (300 + n * 40) * m };
  return { krigle: Math.max(1, Math.round((1 + n / 10) * m)) };
}

/** přičte body (jen v běžící sezóně) */
export function spassAdd(st: SPassState | undefined, kind: SPassKind, now = Date.now()): SPassState | undefined {
  const cur = spassSync(st, now);
  if (!cur) return cur;
  cur.pts = Math.min(SPASS_TIERS * SPASS_TIER_PTS, cur.pts + SPASS_PTS[kind]);
  return cur;
}

/** jde vyzvednout stupeň n v řadě? */
export const spassCan = (st: SPassState, n: number, gold: boolean) => n >= 1 && n <= spassTier(st) && !(gold ? st.gotG : st.got).includes(n) && (!gold || !!st.gold);

/** vyzvednutí: vrátí odměnu (připsání dělá hra) nebo null */
export function spassClaim(st: SPassState, n: number, gold: boolean): SPassRew | null {
  if (!spassCan(st, n, gold)) return null;
  (gold ? st.gotG : st.got).push(n);
  return spassRew(n, gold);
}
