// ★8 Rekonstrukce: relikvie z Chrámu (návrh A + C). Od ★8 zanechá každý poražený Cthulhu další relikvii (4 celkem).
// Relikvie stojí na polici ve Sklepní krčmě a každá má jeden trvalý efekt (okno Relikviář v Úkolech).
import { t } from '../i18n';

export type RelicId = 'doorBell' | 'icePipe' | 'bottomlessKeg' | 'coatOfMany';
export const RELICS: { id: RelicId; name: () => string; desc: () => string }[] = [
  { id: 'doorBell', name: () => t('Zvonek z hlubin'), desc: () => t('události o 10 % častěji') },
  { id: 'icePipe', name: () => t('Ledová dýmka'), desc: () => t('kasa offline o 1 h déle') },
  { id: 'bottomlessKeg', name: () => t('Bezedný sud'), desc: () => t('odměny z událostí +20 %') },
  { id: 'coatOfMany', name: () => t('Kabát mnoha kapes'), desc: () => t('rvačky o 15 % kratší') },
];
/** ★ potřebná pro relikvie */
export const RELIC_STAR = 8;
export const hasRelic = (owned: string[] | undefined, id: RelicId) => !!owned?.includes(id);
/** další relikvie, kterou boss zanechá (null = všechny) */
export const nextRelic = (owned: string[] | undefined) => RELICS.find((r) => !owned?.includes(r.id)) ?? null;
