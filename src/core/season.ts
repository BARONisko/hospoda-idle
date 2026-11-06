// Sezónní události podle data: výzdoba, sezónní host do sbírky, +25 % výdělek. Ladění ?season=xmas|halloween|beerfest
import { t } from '../i18n';

export type SeasonId = 'xmas' | 'halloween' | 'beerfest';

export const SEASONS: Record<SeasonId, { name: string; guest: string; guestName: string; decor: string[] }> = {
  xmas: { name: t('Vánoce'), guest: 'monk', guestName: t('Mnich koledník'), decor: ['candles1', 'lanternOn'] },
  halloween: { name: t('Dušičky'), guest: 'muertos0', guestName: t('Calavera'), decor: ['candles0', 'cobweb', 'cobwebR'] },
  beerfest: { name: t('Pivní festival'), guest: 'brewer', guestName: t('Sládek'), decor: ['bunting', 'posterFair'] },
};
export const SEASON_BONUS = 0.25;

function detect(d = new Date()): SeasonId | null {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('season') : null;
  if (q && q in SEASONS) return q as SeasonId;
  const m = d.getMonth() + 1, day = d.getDate();
  if ((m === 12 && day >= 1) || (m === 1 && day <= 6)) return 'xmas';
  if ((m === 10 && day >= 20) || (m === 11 && day <= 3)) return 'halloween';
  if ((m === 9 && day >= 15) || (m === 10 && day <= 10)) return 'beerfest';
  return null;
}

/** aktuální sezóna (zjistí se při startu hry) */
export const season: SeasonId | null = detect();
