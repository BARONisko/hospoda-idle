// Uložení hry do localStorage (na mobilu přes Capacitor stejně). Verzované, aby šlo později převádět.
export interface StationState {
  lvl: number;
  /** obsluha (kostlivec) – stanice běží sama */
  auto: boolean;
  /** postup aktuálního cyklu 0–1 */
  prog: number;
}

export interface Save {
  v: 1;
  coins: number;
  /** celkem vyděláno (statistika, později prestiž) */
  earned: number;
  st: Record<string, StationState>;
  /** čas posledního uložení (ms) – pro výdělek offline */
  at: number;
}

const KEY = 'pubidle_save_v1';

export function fresh(): Save {
  return { v: 1, coins: 0, earned: 0, st: { tap: { lvl: 1, auto: false, prog: 0 } }, at: Date.now() };
}

export function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Save;
      if (d && d.v === 1) return d;
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
