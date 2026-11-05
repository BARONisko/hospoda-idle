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
  act: 1 | 2 | 3;
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
  /** koupená vylepšení z obchodu (id) */
  up: string[];
  /** čas posledního uložení (ms) – pro výdělek offline */
  at: number;
}

const KEY = 'pubidle_save_v1';

export const newPub = (act: 1 | 2 | 3): PubState => ({ act, st: { tap: { lvl: act === 1 ? 1 : 0, auto: false, prog: 0 } } });

export function fresh(): Save {
  return { v: 2, coins: 0, earned: 0, pubs: [newPub(1)], up: [], at: Date.now() };
}

export function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = JSON.parse(raw) as any;
      if (d?.v === 1) return { v: 2, coins: d.coins, earned: d.earned, pubs: [{ act: 1, st: d.st }], up: [], at: d.at };
      if (d?.v === 2) return { up: [], ...d } as Save;
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
