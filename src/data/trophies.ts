import { t } from '../i18n';
import type { SaveData } from '../systems/state';

// Trofeje ve vitríně v hospodě (obchod → Hospoda → Vitrína s trofejemi). Vitrína se nabídne, jakmile máš aspoň jednu;
// každá trofej se v ní objeví sama, když ji získáš, a dává malý trvalý bonus (jen když vitrínu máš).
// Pořadí = přihrádky (nahoře zleva tři, dole tři), obrázky tr_<key> v gfx/decorArt.ts.

export type TrophyKey = 'tray' | 'tooth' | 'spoon' | 'target' | 'tie' | 'mug';
type Fx = Partial<Record<'patience' | 'spend' | 'rep' | 'tips', number>>;

export interface TrophyDef {
  key: TrophyKey;
  name: string;
  has: (d: SaveData) => boolean;
  fx: Fx;
}

export const TROPHIES: TrophyDef[] = [
  { key: 'tray', name: t('Žabákův zlatý podnos'), has: (d) => !!d.muertosNight?.tray, fx: { tips: 0.06, rep: 0.2 } },
  { key: 'tooth', name: t('Zub aligátora Pepíka'), has: (d) => !!d.sewer?.tame, fx: { patience: 0.04 } },
  { key: 'spoon', name: t('Zlatá vařečka z kuchařské soutěže'), has: (d) => (d.prestige.stats.cookoffWins ?? 0) >= 1, fx: { spend: 0.06 } },
  { key: 'target', name: t('Terč z pouti'), has: (d) => (d.fair?.best ?? 0) >= 200, fx: { tips: 0.04 } },
  { key: 'tie', name: t('Sudokongova kravata'), has: (d) => (d.prestige.stats.sudokong ?? 0) >= 1, fx: { rep: 0.1 } },
  { key: 'mug', name: t('Vodníkův hrneček s dušičkou'), has: (d) => (d.vodnik?.given ?? 0) >= 7, fx: { patience: 0.04 } },
];

export const trophiesOwned = (d: SaveData) => TROPHIES.filter((t) => t.has(d));
