// Talismany: vzácné předměty (padají z událostí, rvaček a návštěv), vylepšují se za kosti donekonečna.
// Každý zvedá jeden stat. Staty se sčítají ze všech talismanů (později přibudou další zdroje statů).
import { t } from '../i18n';

export type StatId =
  | 'income' | 'tips' | 'events' | 'bones' | 'brew' | 'offline' | 'krigly' | 'skill' | 'evfreq' | 'cycle'
  | 'luck' | 'xp' | 'tank' | 'night' | 'guests' | 'crit' | 'staff' | 'decor' | 'daily' | 'nighttips';

/** procenta s jedním desetinným místem (0,5 %) */
const pct = (v: number) => String(Math.round(v * 1000) / 10).replace('.', ',');
const num = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');

export const STAT_NAMES: Record<StatId, (v: number) => string> = {
  income: (v) => t('výdělek +{v} %', { v: pct(v) }),
  tips: (v) => t('spropitné +{v} %', { v: pct(v) }),
  events: (v) => t('odměny z událostí +{v} %', { v: pct(v) }),
  bones: (v) => t('kosti +{v} %', { v: pct(v) }),
  brew: (v) => t('vaření rychlejší o {v} %', { v: pct(v) }),
  offline: (v) => t('offline +{v} h', { v: num(v) }),
  krigly: (v) => t('krígly z hygieny +{v} %', { v: pct(v) }),
  skill: (v) => t('schopnost manažera +{v} %', { v: pct(v) }),
  evfreq: (v) => t('události častěji o {v} %', { v: pct(v) }),
  cycle: (v) => t('stanice rychlejší o {v} %', { v: pct(v) }),
  luck: (v) => t('šance na talisman +{v} %', { v: pct(v) }),
  xp: (v) => t('XP hostinského +{v} %', { v: pct(v) }),
  tank: (v) => t('tank pivovaru +{v} piv', { v: num(v) }),
  night: (v) => t('noc delší o {v} %', { v: pct(v) }),
  guests: (v) => t('hostů +{v}', { v: num(v) }),
  crit: (v) => t('šance na dvojitý výdělek {v} %', { v: pct(v) }),
  staff: (v) => t('kostlivci levnější o {v} %', { v: pct(v) }),
  decor: (v) => t('výzdoba levnější o {v} %', { v: pct(v) }),
  daily: (v) => t('odměny za úkoly +{v} %', { v: pct(v) }),
  nighttips: (v) => t('spropitné v noci +{v} %', { v: pct(v) }),
};

export const STAT_IDS = Object.keys(STAT_NAMES) as StatId[];

/** Kostnice: kostňák hodí kostkou a náhodný stat se zvedne o malý kousek (procentní staty o 0,5 %); některé mají strop */
export const OSSUARY: { stat: StatId; per: number; cap?: number }[] = [
  { stat: 'income', per: 0.005 },
  { stat: 'tips', per: 0.005 },
  { stat: 'events', per: 0.005 },
  { stat: 'bones', per: 0.005 },
  { stat: 'brew', per: 0.005, cap: 0.5 },
  { stat: 'offline', per: 0.05, cap: 16 },
  { stat: 'krigly', per: 0.005 },
  { stat: 'skill', per: 0.005 },
  { stat: 'evfreq', per: 0.005, cap: 0.5 },
  { stat: 'cycle', per: 0.005, cap: 0.4 },
  { stat: 'luck', per: 0.005 },
  { stat: 'xp', per: 0.005 },
  { stat: 'tank', per: 0.05, cap: 20 },
  { stat: 'night', per: 0.005, cap: 0.5 },
  { stat: 'guests', per: 0.02, cap: 6 },
  { stat: 'crit', per: 0.005, cap: 0.5 },
  { stat: 'staff', per: 0.005, cap: 0.6 },
  { stat: 'decor', per: 0.005, cap: 0.5 },
  { stat: 'daily', per: 0.005 },
  { stat: 'nighttips', per: 0.005 },
];
/** cena jednoho hodu kostkou (kosti) – zdražuje se s každým hodem */
export const rollCost = (rolls: number) => Math.ceil(60 * 1.06 ** rolls);
/** staré úrovně Kostnice (před náhodnými hody) – převod */
export const OLD_OSS_PER: Partial<Record<StatId, number>> = {
  income: 0.03, tips: 0.1, events: 0.05, bones: 0.05, brew: 0.02, offline: 0.5, krigly: 0.02, skill: 0.05, evfreq: 0.02, cycle: 0.01,
  luck: 0.05, xp: 0.05, tank: 1, night: 0.05, guests: 1, crit: 0.01, staff: 0.03, decor: 0.02, daily: 0.1, nighttips: 0.1,
};

export interface TalisDef {
  id: string;
  name: string;
  atlas: string;
  frame: string;
  stat: StatId;
  /** přírůstek statu za úroveň */
  per: number;
}

export const TALISMANS: TalisDef[] = [
  { id: 'horseshoe', name: t('Podkova'), atlas: 'weapons', frame: 'c_horseshoe', stat: 'income', per: 0.05 },
  { id: 'tooth', name: t('Vlčí zub'), atlas: 'weapons', frame: 'c_tooth', stat: 'tips', per: 0.15 },
  { id: 'cork', name: t('Šťastný korek'), atlas: 'weapons', frame: 'c_cork', stat: 'events', per: 0.1 },
  { id: 'ring', name: t('Kostěný prsten'), atlas: 'weapons', frame: 'c_ring', stat: 'bones', per: 0.1 },
  { id: 'garlic', name: t('Česnek'), atlas: 'weapons', frame: 'c_garlic', stat: 'brew', per: 0.04 },
  { id: 'feather', name: t('Pírko'), atlas: 'weapons', frame: 'c_feather', stat: 'offline', per: 1 },
  { id: 'cateye', name: t('Kočičí oko'), atlas: 'weapons', frame: 'c_catEye', stat: 'krigly', per: 0.05 },
  { id: 'key', name: t('Starý klíč'), atlas: 'obj', frame: 'cKey', stat: 'skill', per: 0.1 },
  { id: 'crown', name: t('Žabí korunka'), atlas: 'obj', frame: 'cCrown', stat: 'evfreq', per: 0.05 },
  { id: 'iceeye', name: t('Ledové oko'), atlas: 'obj', frame: 'cIceEye', stat: 'cycle', per: 0.02 },
];

/** cena další úrovně v kostech (roste donekonečna) */
export const talisCost = (lvl: number) => Math.ceil(30 * 2.6 ** lvl);

/** součet statů ze všech talismanů */
export function stats(levels: Record<string, number> = {}): Record<StatId, number> {
  const s = Object.fromEntries(STAT_IDS.map((k) => [k, 0])) as Record<StatId, number>;
  for (const d of TALISMANS) s[d.stat] += (levels[d.id] ?? 0) * d.per;
  return s;
}

/** strom dovedností hostinského: 3 větve po 5 uzlech, každý uzel = 1 bod, jde jen popořadě */
export interface SkillNode {
  id: string;
  branch: number;
  stat: StatId;
  val: number;
}
export const BRANCHES = [t('Výčep'), t('Sklep'), t('Noc')];
export const SKILLS: SkillNode[] = [
  { id: 'v1', branch: 0, stat: 'tips', val: 0.25 },
  { id: 'v2', branch: 0, stat: 'income', val: 0.05 },
  { id: 'v3', branch: 0, stat: 'tips', val: 0.5 },
  { id: 'v4', branch: 0, stat: 'income', val: 0.1 },
  { id: 'v5', branch: 0, stat: 'skill', val: 0.25 },
  { id: 's1', branch: 1, stat: 'cycle', val: 0.03 },
  { id: 's2', branch: 1, stat: 'offline', val: 2 },
  { id: 's3', branch: 1, stat: 'brew', val: 0.1 },
  { id: 's4', branch: 1, stat: 'cycle', val: 0.05 },
  { id: 's5', branch: 1, stat: 'krigly', val: 0.1 },
  { id: 'n1', branch: 2, stat: 'bones', val: 0.2 },
  { id: 'n2', branch: 2, stat: 'events', val: 0.25 },
  { id: 'n3', branch: 2, stat: 'evfreq', val: 0.1 },
  { id: 'n4', branch: 2, stat: 'bones', val: 0.4 },
  { id: 'n5', branch: 2, stat: 'events', val: 0.5 },
];
/** XP na další úroveň hostinského */
export const xpNeed = (lvl: number) => Math.round(100 * 1.4 ** (lvl - 1));

/** staty ze stromu dovedností */
export function skillStats(owned: string[] = []): Record<StatId, number> {
  const s = stats({});
  for (const n of SKILLS) if (owned.includes(n.id)) s[n.stat] += n.val;
  return s;
}
