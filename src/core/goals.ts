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

export const today = () => new Date().toISOString().slice(0, 10);

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
  { id: 'staff4', text: t('Kostlivci u všech 4 stanic'), done: (d: Save) => d.pubs.some((p) => ['tap', 'kitchen', 'cellar', 'dice'].every((k) => p.st[k]?.auto)) },
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

/** denní specialita: hráč si každý den vybere jeden bonus (násobky výdělku stanic) */
export const SPECIALS: { id: string; name: string; desc: string; mult: Record<string, number> }[] = [
  { id: 'beer', name: t('Pivní den'), desc: t('pípa ×3'), mult: { tap: 3 } },
  { id: 'goulash', name: t('Gulášový den'), desc: t('kuchyně ×3'), mult: { kitchen: 3 } },
  { id: 'cellar', name: t('Den otevřených sklepů'), desc: t('sklep ×3'), mult: { cellar: 3 } },
  { id: 'gamble', name: t('Hazardní den'), desc: t('kostky ×6, pípa ×½'), mult: { dice: 6, tap: 0.5 } },
];
