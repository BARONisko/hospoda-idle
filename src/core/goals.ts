// Úkoly, úspěchy a bestiář (sbírka hostů).
import { t } from '../i18n';
import type { Save } from './save';

/** statistiky pro úkoly a úspěchy */
export interface Stats {
  tips: number;
  levels: number;
  events: number;
  prestiges: number;
}

export type TaskKind = 'tips' | 'levels' | 'events' | 'earn';

export interface DailyTask {
  kind: TaskKind;
  goal: number;
  prog: number;
  claimed: boolean;
}

export interface Daily {
  day: string;
  tasks: DailyTask[];
}

// místní den (dřív UTC → denní úkoly se v ČR měnily v 1:00 / 2:00, truhla o půlnoci)
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** nové denní úkoly (3 z nabídky); „vydělej“ podle aktuálního výdělku */
export function newDaily(rate: number): Daily {
  const pool: DailyTask[] = [
    { kind: 'tips', goal: 15, prog: 0, claimed: false },
    { kind: 'levels', goal: 30, prog: 0, claimed: false },
    { kind: 'events', goal: 2, prog: 0, claimed: false },
    { kind: 'earn', goal: Math.max(500, Math.round(rate * 900)), prog: 0, claimed: false },
  ];
  const drop = Math.floor(Math.random() * pool.length);
  return { day: today(), tasks: pool.filter((_, i) => i !== drop) };
}

export const taskText = (k: TaskKind, goal: string) =>
  ({
    tips: t('Vyber spropitné od {n} hostů', { n: goal }),
    levels: t('Kup {n} úrovní stanic', { n: goal }),
    events: t('Zvládni {n} události', { n: goal }),
    earn: t('Vydělej {n} coins', { n: goal }),
  })[k];

export interface AchDef {
  id: string;
  text: string;
  done: (d: Save) => boolean;
}

const maxLvl = (d: Save) => Math.max(0, ...d.pubs.flatMap((p) => Object.values(p.st).map((s) => s.lvl)));

/** úspěchy – každý za odměnu 1 krígl */
export const ACHIEVEMENTS: AchDef[] = [
  ...[1e3, 1e6, 1e9, 1e12].map((n, i) => ({ id: `earn${i}`, text: t('Vydělej celkem {n} coins', { n: ['1K', '1M', '1B', '1T'][i] }), done: (d: Save) => d.earned >= n })),
  ...[25, 100, 200].map((n) => ({ id: `lvl${n}`, text: t('Stanice na úrovni {n}', { n }), done: (d: Save) => maxLvl(d) >= n })),
  { id: 'staff4', text: t('Obsluha u všech 4 stanic'), done: (d: Save) => d.pubs.some((p) => ['tap', 'kitchen', 'cellar', 'dice'].every((k) => p.st[k]?.auto)) },
  ...[100, 1000].map((n) => ({ id: `tips${n}`, text: t('Spropitné od {n} hostů', { n }), done: (d: Save) => d.stats.tips >= n })),
  ...[10, 50].map((n) => ({ id: `ev${n}`, text: t('Zvládni {n} událostí', { n }), done: (d: Save) => d.stats.events >= n })),
  ...[2, 3].map((n) => ({ id: `pubs${n}`, text: t('Měj {n} hospody', { n }), done: (d: Save) => d.pubs.length >= n })),
  ...[10, 20].map((n) => ({ id: `seen${n}`, text: t('Bestiář: {n} druhů hostů', { n }), done: (d: Save) => d.seen.length >= n })),
];

/** jména hostů v bestiáři */
export const GUEST_NAMES: Record<string, string> = {
  guest0: t('Štamgast'),
  guest1: t('Pepík z dílny'),
  guest2: t('Důchodce'),
  guest3: t('Student'),
  guest4: t('Turista'),
  guest5: t('Myslivec'),
  guest6: t('Fotbalista'),
  guest7: t('Pošťák'),
  guest8: t('Hasič'),
  guest9: t('Babka'),
  guest10: t('Kytarista'),
  guest11: t('Řidič autobusu'),
  zombie: t('Zombík'),
  werewolf: t('Vlkodlak'),
  banshee: t('Banshee'),
  vampire: t('Upír'),
  ghost: t('Duch'),
  ratman: t('Krysák'),
  frogman: t('Žabí muž'),
  zabak: t('Žabák'),
  cultist0: t('Kultista'),
  cultist1: t('Kultistka'),
  cultist2: t('Velekněz'),
  cultist3: t('Novic'),
  deep0: t('Hlubinný'),
  deep1: t('Hlubinná'),
  deep2: t('Stařešina hlubin'),
  drowner: t('Utopenec'),
};

/** týdenní výzva: jedna větší výzva na týden, odměna = jistý talisman + krígly */
export type WeekKind = 'events' | 'brawls' | 'beers' | 'visitors' | 'tips';
export interface Weekly {
  week: string;
  kind: WeekKind;
  goal: number;
  prog: number;
  claimed: boolean;
}
const WEEK_GOALS: Record<WeekKind, number> = { events: 15, brawls: 5, beers: 6, visitors: 8, tips: 300 };
export const weekText = (k: WeekKind, n: number) =>
  ({
    events: t('Zvládni {n} událostí', { n }),
    brawls: t('Rozežeň {n} rvaček', { n }),
    beers: t('Uvař a prodej nebo vlož {n} piv', { n }),
    visitors: t('Vyřeš {n} návštěvníků', { n }),
    tips: t('Vyber spropitné od {n} hostů', { n }),
  })[k];
/** číslo týdne (pondělí–neděle) */
export function weekId(d = new Date()) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return `${x.getUTCFullYear()}-${Math.ceil(((+x - +y0) / 86400000 + 1) / 7)}`;
}
export function newWeekly(): Weekly {
  const w = weekId();
  const kinds = Object.keys(WEEK_GOALS) as WeekKind[];
  const kind = kinds[w.split('-').reduce((a, b) => a + Number(b), 0) % kinds.length];
  return { week: w, kind, goal: WEEK_GOALS[kind], prog: 0, claimed: false };
}
