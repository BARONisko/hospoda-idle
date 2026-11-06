import type { Stats, Daily, Weekly } from './goals';
import type { BrewState } from './brewery';
import type { LeagueState } from './league';

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
  /** číšníci (vylepšení každého zvlášť) */
  w?: import('./waiters').WaiterState[];
  /** piva čekající na baru: počet a jejich hodnota v coins */
  bar?: { n: number; v: number };
  /** talíře z kuchyně čekající na číšníky (jen pro vzhled, coins dala kuchyně) */
  food?: number;
}

export interface Save {
  /** číšníci v2 (najímají se místo kostlivce na pípě) – staré číšníky jednou prodat */
  wv2?: boolean;
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
  /** věrnost hostů: počet příchodů hostů (XP) */
  gxp?: number;
  /** obchod s krígly v2: vrácené krígly za starý Delší spánek a Štědré hosty */
  kup2?: boolean;
  /** vrácené krígly za starý Cthulhu (×10) */
  kup3?: boolean;
  /** koupená výzdoba (id) – zůstává i po hygieně */
  decor?: string[];
  /** pivovar (zůstává i po hygieně) */
  brew?: BrewState;
  /** kosti (noční měna) a jejich vylepšení – zůstávají i po hygieně */
  bones?: number;
  bup?: Record<string, number>;
  /** den a noc: úroveň „Delší noc“, odemčený přepínač, posun cyklu (ms) */
  dn?: { lvl: number; sw?: boolean; shift?: number; v2?: boolean };
  /** pivní akce: happy hour do (ms), noční várka (×2 kosti příští/tuto noc) */
  fx?: { happy?: number; nightx2?: boolean };
  /** sběrač bublin podle hospody (act): úroveň rychlosti a množství */
  coll?: Record<number, { spd: number; amt: number }>;
  /** po hygieně otevřená nová hospoda (ukázat uvítání) */
  pubIntro?: number;
  /** dlaždice menu, které už jsou odemčené (kvůli oznámení „nové v menu“) */
  menuOpen?: string[];
  /** kosti přepočtené na malá čísla (staré uložení ÷ 100) */
  bones2?: boolean;
  /** Kostnice: úrovně statů koupené za kosti */
  oss?: Record<string, number>;
  /** verze Kostnice (2 = náhodné hody) a počet hodů */
  ossV?: number;
  ossRolls?: number;
  /** šipky (minihra 301) */
  darts?: import('./darts').DartsState;
  /** víkendový chrám R'lyeh */
  temple?: import('./temple').TempleState;
  /** talismany: úrovně (0 = nemá) */
  talis?: Record<string, number>;
  /** hostinský: zkušenosti, úroveň, koupené dovednosti (zůstává i po hygieně) */
  xp?: number;
  klvl?: number;
  skills?: string[];
  /** týdenní výzva */
  weekly?: Weekly;
  /** týdenní liga */
  league?: LeagueState;
  /** historie lig: [liga, výhra] posledních týdnů */
  leagueHist?: [number, boolean][];
  /** krok návodu pro nového hráče (-1 = hotovo) */
  tut?: number;
  /** už viděl vysvětlení první noci (kosti místo coins) */
  nightInfo?: boolean;
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
export const MAX_PUBS = 3;

export const newPub = (act: Act): PubState => ({ act, st: { tap: { lvl: act === 1 ? 1 : 0, auto: false, prog: 0 } } });

export function fresh(): Save {
  // nový hráč začíná s 6 coins – hned si koupí 2. úroveň pípy (návod)
  return { v: 2, coins: 6, earned: 0, pubs: [newPub(1)], up: [], run: 0, krigle: 0, ...extra(), at: Date.now() };
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

/** po nahrání zálohy už se do znovunačtení nic neukládá (přepsalo by to nahranou hru) */
let locked = false;

export function store(d: Save) {
  if (locked) return;
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

/** Záloha hry do souboru: uložená hra + nastavení + jazyk (pro přenos mezi webem a složkou HRA). */
export function exportSave(d: Save): string {
  store(d);
  const ls = (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  return JSON.stringify({ game: 'pubidle', ver: 1, at: Date.now(), save: ls(KEY), opts: ls('pubidle_opts'), lang: ls('pubidle_lang') });
}

/** Nahraje zálohu; vrátí false, když soubor není záloha této hry. Po úspěchu je potřeba hru znovu načíst. */
export function importSave(text: string): boolean {
  try {
    const b = JSON.parse(text);
    if (b?.game !== 'pubidle' || typeof b.save !== 'string') return false;
    const d = JSON.parse(b.save);
    if (!d || !Array.isArray(d.pubs) || typeof d.coins !== 'number') return false;
    localStorage.setItem(KEY, b.save);
    if (typeof b.opts === 'string') localStorage.setItem('pubidle_opts', b.opts);
    if (typeof b.lang === 'string') localStorage.setItem('pubidle_lang', b.lang);
    locked = true;
    return true;
  } catch {
    return false;
  }
}
