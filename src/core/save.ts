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
  /** ×2 za reklamu na stanici: id stanice → platí do (ms) */
  adx?: Record<string, number>;
  /** styly hospody získané v tomto kole (economy.pubStyles) */
  sty?: string[];
  /** číšníci (vylepšení každého zvlášť) */
  w?: import('./waiters').WaiterState[];
  /** piva čekající na baru: počet a jejich hodnota v coins */
  bar?: { n: number; v: number };
  /** talíře z kuchyně čekající na číšníky: počet a hodnota v coins */
  dish?: { n: number; v: number };
}

export interface Save {
  /** číšníci v2 (najímají se místo kostlivce na pípě) – staré číšníky jednou prodat */
  wv2?: boolean;
  /** číšníci v3: pomalejší zkušenosti – všem jednou vynulovat úrovně a body */
  wv3?: boolean;
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
  /** krígly utracené (obchod, reklama, vrácení bodů) – dál dávají bonus výdělku (hospoda 72) */
  kSpent?: number;
  /** věrnost hostů: počet příchodů hostů (XP) */
  gxp?: number;
  /** obchod s krígly v2: vrácené krígly za starý Delší spánek a Štědré hosty */
  kup2?: boolean;
  /** vrácené krígly za starý Cthulhu (×10) */
  kup3?: boolean;
  /** ekonomika v2: menší čísla (hospody 10× místo 50×, krígly ze 4. odmocniny) – přepočteno */
  eco2?: boolean;
  /** průvodce novinkami: čekající (id) a už ukázané */
  guideQ?: string[];
  guides?: string[];
  /** záložky, kde už proběhl krátký návod (šipka + 1 řádek) */
  tabTut?: string[];
  /** mini průvodce pivovarem: krok 0–2, -1 = hotovo */
  brewTut?: number;
  /** úkol od hostinského: splněné úkoly (id) a navštívené části menu */
  q?: string[];
  qTiles?: string[];
  /** hvězdy stanic: klíč `${act}_${stanice}` → počet (0–5) */
  stars?: Record<string, number>;
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
  /** červené tečky: co hráč už viděl (záložka → podpis upozornění) */
  alertSeen?: Record<string, string>;
  /** den, kdy hráč naposled otevřel chrám (červená tečka jen do prvního ťuknutí za den) */
  templeSeen?: string;
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
  /** skilly na rok: převedeno na velký strom (hospoda 63), počet přerozdělení bodů */
  sk2?: boolean;
  /** nové ceny uzlů (hospoda 63b) – body jednou vráceny */
  sk3?: boolean;
  skR?: number;
  /** mistrovství stanic: odsloužené sekundy podle stanice (součet hospod, přežije hygienu) */
  mast?: Record<string, number>;
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
  /** věrnost hostů po druzích: počet obsloužení (klíč = druh hosta) */
  loy?: Record<string, number>;
  /** návštěvníci: kolikrát hráč přijal / zaplatil (Sbírka) */
  vis?: Record<string, number>;
  /** 💎 od návštěvníků dnes (strop VIS_GEMS_DAY) */
  visG?: { day: string; n: number };
  /** hygieny s 💎 dnes (strop PRESTIGE_GEMS_DAY) */
  hygG?: { day: string; n: number };
  /** bestiář: viděné druhy hostů */
  seen: string[];
  /** koupená vylepšení z obchodu (id) */
  up: string[];
  /** speciální nabídka: denní truhla, reklamní kampaň, VIP host */
  chest?: import('./special').ChestState;
  adv?: import('./special').AdvState;
  vip?: import('./special').VipState;
  /** diamanty (prémiová měna), Štamgast pass, trvalé automaty za diamanty, koupené „bez reklam“ */
  gems?: number;
  pass?: import('./special').PassState;
  own?: string[];
  noAds?: boolean;
  /** už se zeptal na upozornění; kolikrát vyzval k hodnocení v obchodě */
  ntfAsk?: boolean;
  rev?: number;
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

/** QA hospoda 66: poškozené uložení (null / chybějící pole / NaN) dřív zablokovalo hru nebo smazalo coins → opravit */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function repair(d: any): Save {
  const def = extra() as Record<string, unknown>;
  for (const k of Object.keys(def)) if (d[k] === null || d[k] === undefined || typeof d[k] !== typeof def[k]) d[k] = def[k];
  if (!Array.isArray(d.seen)) d.seen = [];
  if (!Array.isArray(d.up)) d.up = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  d.pubs = Array.isArray(d.pubs) ? d.pubs.filter((p: any) => p && typeof p === 'object') : [];
  if (!d.pubs.length) return fresh();
  for (const p of d.pubs) if (!p.st || typeof p.st !== 'object') p.st = {};
  for (const k of ['coins', 'earned', 'run', 'krigle']) if (!Number.isFinite(d[k])) d[k] = 0;
  if (!Number.isFinite(d.at)) d.at = Date.now();
  return d as Save;
}

/** po nahrání zálohy už se do znovunačtení nic neukládá (přepsalo by to nahranou hru) */
let locked = false;
let fullWarned = false;

/** Problém s ukládáním pro hráče: druhá karta, novější verze uložení, plné úložiště (main.ts ukáže pruh). */
export type SaveIssue = 'tab' | 'newer' | 'full';
let issueCb: ((k: SaveIssue) => void) | undefined;
const pending: SaveIssue[] = [];
function issue(k: SaveIssue) {
  if (issueCb) issueCb(k);
  else if (!pending.includes(k)) pending.push(k);
}
export function onSaveIssue(cb: (k: SaveIssue) => void) {
  issueCb = cb;
  for (const k of pending.splice(0)) cb(k);
}

// Dvě karty prohlížeče (QA hospoda 66): obě ukládaly a přepisovaly se. Každá karta má svoje id; když jiná karta uloží,
// tahle přestane ukládat a nabídne znovunačtení (pak je aktivní ona a zamkne se ta druhá).
const TAB = Math.random().toString(36).slice(2);
const OWNER = 'pubidle_tab';
if (typeof window !== 'undefined')
  window.addEventListener('storage', (e) => {
    if (e.key === OWNER && e.newValue && e.newValue !== TAB && !locked) {
      locked = true;
      issue('tab');
    }
  });

export function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = JSON.parse(raw) as any;
      // uložení z novější verze hry (v ≥ 3) nezahodit a nepřepsat – hrát bez ukládání a poradit aktualizaci
      if (typeof d?.v === 'number' && d.v > 2) {
        locked = true;
        issue('newer');
        return fresh();
      }
      if (d?.v === 1) return repair({ v: 2, coins: d.coins, earned: d.earned, pubs: [{ act: 1, st: d.st }], up: [], run: d.earned, krigle: 0, ...extra(), at: d.at });
      if (d?.v === 2) return repair({ up: [], run: d.earned ?? 0, krigle: 0, ...extra(), ...d } as Save);
    }
  } catch {
    /* poškozené nebo nedostupné úložiště → nová hra */
  }
  return fresh();
}


/** klíč uložené hry a značka „hráč začal znovu“ (pro core/backup.ts) */
export const SAVE_KEY = KEY;
export const WIPED_KEY = 'pubidle_wiped';
/** zrcadlo uložení (mobilní aplikace: úložiště, které Android zálohuje) – nastaví core/backup.ts; now = hned (odchod ze hry) */
let mirror: ((raw: string, now: boolean) => void) | undefined;
export function setMirror(fn: (raw: string, now: boolean) => void) {
  mirror = fn;
}

export function store(d: Save, flush = false) {
  if (locked) return;
  // hodiny vrácené dozadu nesmí posunout čas odchodu (přetáčení hodin = opakovaný offline výdělek); víc než den = oprava hodin
  const now = Date.now();
  d.at = d.at > now && d.at - now < 86_400_000 ? d.at : now;
  try {
    const raw = JSON.stringify(d);
    localStorage.setItem(KEY, raw);
    if (localStorage.getItem(OWNER) !== TAB) localStorage.setItem(OWNER, TAB);
    fullWarned = false;
    mirror?.(raw, flush);
  } catch {
    // plné nebo zakázané úložiště – hráči to říct (jednou, dokud se zas nepovede uložit)
    if (!fullWarned) issue('full');
    fullWarned = true;
  }
}

export function wipe() {
  locked = true; // po smazání už nic neukládat (pagehide při znovunačtení)
  try {
    localStorage.removeItem(KEY);
    localStorage.setItem(WIPED_KEY, '1'); // záloha v telefonu se smaže při dalším startu (backup.ts)
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
