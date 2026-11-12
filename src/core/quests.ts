// Úkol od hostinského: pořád jeden aktuální cíl nahoře (lišta s úkolníčkem), tlačítko UKAŽ ukáže šipkou kam ťuknout.
// Po splnění malá odměna a hned další. ~30 úkolů postupně představí celou hru.
import { t } from '../i18n';
import { freePoints, spent } from './waiters';
import { STATIONS, pubStyle } from './economy';
import type { Save } from './save';

/** kam ukazuje šipka */
export type QAt =
  | { k: 'buy' | 'staff'; s: string }
  | { k: 'tile'; key: string }
  | { k: 'up' }
  | { k: 'hyg' }
  | { k: 'tip' }
  | { k: 'waiter'; hire?: boolean }
  | { k: 'style' };

/** co úkol potřebuje ze scény */
export interface QCtx {
  /** dlaždice menu zamčená? (null = odemčená) */
  lock: (key: string) => string | null;
  /** krígly za hygienu teď a potřebné minimum */
  krigly: () => [number, number];
}

export interface QuestDef {
  id: string;
  text: () => string;
  prog: (d: Save, c: QCtx) => [number, number];
  /** smí se teď ukázat? (jinak se přeskočí a vrátí se k němu později) */
  avail?: (d: Save, c: QCtx) => boolean;
  at: QAt;
  /** splněno jinak než postupem (hygiena: krígly stačí, ale musí ji opravdu zavolat) */
  fin?: (d: Save) => boolean;
}

const sname = (id: string) => STATIONS.find((s) => s.id === id)!.name;
const lvl = (d: Save, id: string) => Math.max(0, ...d.pubs.map((p) => p.st[id]?.lvl ?? 0));
const auto = (d: Save, id: string) => (d.pubs.some((p) => p.st[id]?.auto) ? 1 : 0);
const opened = (d: Save, id: string) => lvl(d, id) > 0;

const level = (s: string, n: number): QuestDef => ({ id: `lvl_${s}_${n}`, text: () => t('{s} na úroveň {n}', { s: sname(s), n }), prog: (d) => [lvl(d, s), n], avail: (d) => opened(d, s), at: { k: 'buy', s } });
const open = (s: string): QuestDef => ({ id: `open_${s}`, text: () => t('Otevři: {s}', { s: sname(s) }), prog: (d) => [opened(d, s) ? 1 : 0, 1], at: { k: 'buy', s } });
const staff = (s: string): QuestDef => ({ id: `staff_${s}`, text: () => t('Najmi obsluhu: {s}', { s: sname(s) }), prog: (d) => [auto(d, s), 1], avail: (d) => opened(d, s), at: { k: 'staff', s } });
const ups = (n: number): QuestDef => ({ id: `up_${n}`, text: () => (n === 1 ? t('Kup vylepšení v Obchodě') : t('Kup {n} vylepšení v Obchodě', { n })), prog: (d) => [d.up.length, n], at: { k: 'up' } });
/** podívej se do části menu (stačí ji otevřít) */
const tile = (key: string, name: () => string): QuestDef => ({ id: `tile_${key}`, text: () => t('Podívej se do menu: {s}', { s: name() }), prog: (d) => [d.qTiles?.includes(key) ? 1 : 0, 1], avail: (_d, c) => !c.lock(key), at: { k: 'tile', key } });

/** nejvíc číšníků v jedné hospodě */
const crewMax = (d: Save) => Math.max(0, ...d.pubs.map((p) => p.w?.length ?? 0));

export const QUESTS: QuestDef[] = [
  level('tap', 10),
  level('kitchen', 10),
  // kontrola hospoda 70: bez 3. číšníka a bodů číšníků výdělek stojí („bar plný“) a nic na ně nevedlo
  { id: 'waiter3', text: () => t('Najmi {n}. číšníka', { n: 3 }), prog: (d) => [Math.min(3, crewMax(d)), 3], avail: (d) => crewMax(d) >= 2, at: { k: 'waiter', hire: true } },
  staff('kitchen'),
  level('tap', 25),
  { id: 'wpoint', text: () => t('Vylepši číšníka – ťukni na něj'), prog: (d) => [d.pubs.some((p) => p.w?.some((w) => spent(w) > 0)) ? 1 : 0, 1], avail: (d) => d.pubs.some((p) => p.w?.some((w) => freePoints(w) > 0 || spent(w) > 0)), at: { k: 'waiter' } },
  ups(1),
  open('cellar'),
  level('kitchen', 25),
  { id: 'tips30', text: () => t('Vyber spropitné od {n} hostů', { n: 30 }), prog: (d) => [d.stats.tips, 30], at: { k: 'tip' } },
  tile('tasks', () => t('Úkoly')),
  staff('cellar'),
  tile('brew', () => t('Pivovar')),
  level('cellar', 25),
  ups(3),
  open('dice'),
  level('tap', 50),
  tile('decor', () => t('Výzdoba')),
  staff('dice'),
  { id: 'style', text: () => t('Získej styl hospody (2 milníky jedné stanice)'), prog: (d) => [d.pubs.some((p) => pubStyle(p)) ? 1 : 0, 1], at: { k: 'style' } },
  { id: 'bones5', text: () => t('V noci nasbírej {n} kostí', { n: 5 }), prog: (d) => [Math.min(5, d.bones ?? 0), 5], avail: (d) => !!d.nightInfo, at: { k: 'tip' } },
  tile('darts', () => t('Šipky')),
  tile('coll', () => t('Sběrač')),
  level('kitchen', 50),
  { id: 'hyg1', text: () => t('Zavolej hygienu – dostaneš krígly'), prog: (d, c) => (d.stats.prestiges > 0 ? [1, 1] : c.krigly()), fin: (d) => d.stats.prestiges > 0, at: { k: 'hyg' } },
  tile('krigl', () => t('Krígly')),
  tile('temple', () => t('Chrám')),
  tile('league', () => t('Liga')),
  tile('keeper', () => t('Hostinský')),
  tile('bones', () => t('Kostnice')),
  tile('talis', () => t('Talismany')),
  ups(10),
  level('tap', 100),
];

/** první nesplněný úkol, který se teď dá dělat */
export function currentQuest(d: Save, c: QCtx): QuestDef | null {
  const done = d.q ?? [];
  return QUESTS.find((q) => !done.includes(q.id) && (!q.avail || q.avail(d, c))) ?? null;
}

export const questDone = (q: QuestDef, d: Save, c: QCtx) => {
  if (q.fin) return q.fin(d);
  const [a, b] = q.prog(d, c);
  return a >= b;
};
