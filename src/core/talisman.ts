// Talismany: vzácné předměty (padají z událostí, rvaček a návštěv), vylepšují se za kosti donekonečna.
// Každý zvedá jeden stat. Staty se sčítají ze všech talismanů (později přibudou další zdroje statů).
import { t } from '../i18n';

export type StatId = 'income' | 'tips' | 'events' | 'bones' | 'brew' | 'offline' | 'krigly' | 'skill' | 'evfreq' | 'cycle';

export const STAT_NAMES: Record<StatId, (v: number) => string> = {
  income: (v) => t('výdělek +{v} %', { v: Math.round(v * 100) }),
  tips: (v) => t('spropitné +{v} %', { v: Math.round(v * 100) }),
  events: (v) => t('odměny z událostí +{v} %', { v: Math.round(v * 100) }),
  bones: (v) => t('kosti +{v} %', { v: Math.round(v * 100) }),
  brew: (v) => t('vaření rychlejší o {v} %', { v: Math.round(v * 100) }),
  offline: (v) => t('offline +{v} h', { v }),
  krigly: (v) => t('krígly z hygieny +{v} %', { v: Math.round(v * 100) }),
  skill: (v) => t('schopnost manažera +{v} %', { v: Math.round(v * 100) }),
  evfreq: (v) => t('události častěji o {v} %', { v: Math.round(v * 100) }),
  cycle: (v) => t('stanice rychlejší o {v} %', { v: Math.round(v * 100) }),
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
export const talisCost = (lvl: number) => Math.ceil(30 * 2.2 ** lvl);

/** součet statů ze všech talismanů */
export function stats(levels: Record<string, number> = {}): Record<StatId, number> {
  const s = { income: 0, tips: 0, events: 0, bones: 0, brew: 0, offline: 0, krigly: 0, skill: 0, evfreq: 0, cycle: 0 };
  for (const d of TALISMANS) s[d.stat] += (levels[d.id] ?? 0) * d.per;
  return s;
}
