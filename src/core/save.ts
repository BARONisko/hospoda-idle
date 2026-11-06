import type { Stats, Daily } from './goals';
import type { BrewState } from './brewery';

// Uložení hry do localStorage (na mobilu přes Capacitor stejně). Verzované kvůli převodům.
export interface StationState {
  lvl: number;
  /** obsluha (kostlivec) – stanice běží sama */
  auto: boolean;
  /** postup aktuálního cyklu 0–1 (0 = stojí) */
  prog: number;
}

/** jedna hospoda; po prestiži přibude další (max 3 – Pajzl, sklepní krčma, Žabákův podnik) */
export interface PubState {
  act: Act;
  st: Record<string, StationState>;
  /** najatý manažer (schopnost „hodina“) */
  mgr?: boolean;
  /** schopnost běží do (ms) */
  boostUntil?: number;
  /** schopnost znovu připravena od (ms) */
  boostReady?: number;
}

export interface Save {
  v: 2;
  coins: number;
  /** celkem vyděláno (statistika, později prestiž) */
  earned: number;
  pubs: PubState[];
  /** vyděláno od poslední prestiže (hygieny) */
  run: number;
  /** krígly z prestiže – trvalý bonus */
  krigle: number;
  stats: Stats;
  /** denní úkoly */
  daily: Daily;
  /** vyzvednuté úspěchy (id) */
  ach: string[];
  /** obchod s krígly: úrovně koupených položek */
  kup?: Record<string, number>;
  /** denní specialita {den, id} */
  special?: { day: string; id: string };
  /** koupená výzdoba (id) – zůstává i po hygieně */
  decor?: string[];
  /** pivovar (zůstává i po hygieně) */
  brew?: BrewState;
  /** kosti (noční měna) a jejich vylepšení – zůstávají i po hygieně */
  bones?: number;
  bup?: Record<string, number>;
  /** krok návodu pro nového hráče (-1 = hotovo) */
  tut?: number;
  /** bestiář: viděné druhy hostů */
  seen: string[];
  /** koupená vylepšení z obchodu (id) */
  up: string[];
  /** čas posledního uložení (ms) – pro výdělek offline */
  at: number;
}

const extra = () => ({ stats: { tips: 0, levels: 0, events: 0, prestiges: 0 }, daily: { day: '', tasks: [] }, ach: [], seen: [] });

const KEY = 'pubidle_save_v1';

export type Act = 1 | 2 | 3 | 4;
/** nejvíc hospod (po 3. hygieně přibude chrám Cthulhu) */
export const MAX_PUBS = 4;

export const newPub = (act: Act): PubState => ({ act, st: { tap: { lvl: act === 1 ? 1 : 0, auto: false, prog: 0 } } });

export function fresh(): Save {
  return { v: 2, coins: 0, earned: 0, pubs: [newPub(1)], up: [], run: 0, krigle: 0, ...extra(), at: Date.now() };
}

export function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = JSON.parse(raw) as any;
      if (d?.v === 1) return { v: 2, coins: d.coins, earned: d.earned, pubs: [{ act: 1, st: d.st }], up: [], run: d.earned, krigle: 0, ...extra(), at: d.at };
      if (d?.v === 2) return { up: [], run: d.earned ?? 0, krigle: 0, ...extra(), ...d } as Save;
    }
  } catch {
    /* poškozené nebo nedostupné úložiště → nová hra */
  }
  return fresh();
}

export function store(d: Save) {
  d.at = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* plné úložiště – nic */
  }
}

export function wipe() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nic */
  }
}
