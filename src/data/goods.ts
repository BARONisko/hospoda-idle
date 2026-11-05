// Zásoby, které se nacházejí v truhlách ve sklepě a prodávají se v hospodě.
// frame = snímek v atlasu „obj“ (malý obrázek do bubliny / nad hlavu) i „icons“.
//
// Speciality (kind 'special') se v truhlách nenacházejí: vyrobí se ze surovin (kind 'ingredient'),
// které leží jen na hlubších patrech. První donesená surovina specialitu odemkne v nabídce.

import { t } from '../i18n';
export type GoodId =
  | 'sliv' | 'rum' | 'pickle' | 'cheese' | 'sausage'
  | 'secretPickle' | 'iceRum' | 'cataCheese' | 'underSausage'
  | 'ingMush' | 'ingIce' | 'ingMold' | 'ingSpice'
  | 'grog' | 'lemonade';

export interface Good {
  id: GoodId;
  name: string;
  price: number;
  frame: string;
  minDepth: number; // od jaké hloubky se nachází v truhlách
  weight: number; // relativní četnost v truhlách
  orderWeight: number; // jak rádi to hosté objednávají
  quip: string;
  kind?: 'special' | 'ingredient' | 'weather'; // weather = grog/limonáda, dělá se v hospodě jen v danou dobu
  theme?: 1 | 2 | 3 | 4; // surovina: na kterém typu patra leží
  makes?: GoodId; // surovina: jakou specialitu odemkne a vyrobí
}

const NEVER = 99;

export const GOODS: Good[] = [
  { id: 'rum', name: t('Tuzemák'), price: 55, frame: 'gRum', minDepth: 1, weight: 4, orderWeight: 3, quip: t('Na zahřátí!') },
  { id: 'pickle', name: t('Utopenec'), price: 65, frame: 'gPickle', minDepth: 1, weight: 4, orderWeight: 3, quip: t('Ten je utopenej akorát.') },
  { id: 'sliv', name: t('Slivovice'), price: 95, frame: 'gSliv', minDepth: 2, weight: 3, orderWeight: 3, quip: t('Ta pálí jak čert!') },
  { id: 'cheese', name: t('Nakládaný hermelín'), price: 85, frame: 'gCheese', minDepth: 2, weight: 3, orderWeight: 2, quip: t('Smrdí krásně.') },
  { id: 'sausage', name: t('Domácí klobása'), price: 120, frame: 'gSausage', minDepth: 3, weight: 2, orderWeight: 2, quip: t('Od řezníka ze sklepa? Raději se neptat.') },
  // speciality
  { id: 'iceRum', name: t('Ledový tuzemák'), price: 135, frame: 'gIceRum', minDepth: NEVER, weight: 0, orderWeight: 3, kind: 'special', quip: t('Studí až do duše. Hlavně do duše.') },
  { id: 'secretPickle', name: t('Utopenec s tajnou přísadou'), price: 150, frame: 'gSecretPickle', minDepth: NEVER, weight: 0, orderWeight: 3, kind: 'special', quip: t('Co je ta tajná přísada? …Radši ne.') },
  { id: 'cataCheese', name: t('Hermelín z katakomb'), price: 190, frame: 'gCataCheese', minDepth: NEVER, weight: 0, orderWeight: 2, kind: 'special', quip: t('Zrál tam, kde zrají i jiné věci.') },
  { id: 'underSausage', name: t('Klobása zpod hospody'), price: 260, frame: 'gUnderSausage', minDepth: NEVER, weight: 0, orderWeight: 2, kind: 'special', quip: t('Recept má Sudomor. A ten nemluví.') },
  // podle počasí (systems/seasons.ts): grog na kamnech v zimě, limonáda u přepravek ve vedru; večer vystydne/zteplá
  { id: 'grog', name: t('Grog'), price: 70, frame: 'gGrog', minDepth: NEVER, weight: 0, orderWeight: 6, kind: 'weather', quip: t('Konečně mi roztajou prsty!') },
  { id: 'lemonade', name: t('Limonáda'), price: 60, frame: 'gLemonade', minDepth: NEVER, weight: 0, orderWeight: 6, kind: 'weather', quip: t('Ááá, ledová! Tohle vedro se nedá vydržet.') },
  // suroviny (do batohu, nahoře se z nich vyrobí speciality)
  { id: 'ingIce', name: t('Věčný led'), price: 0, frame: 'iIce', minDepth: NEVER, weight: 0, orderWeight: 0, kind: 'ingredient', theme: 2, makes: 'iceRum', quip: t('Netaje. Ani v ruce. Ani v pivu.') },
  { id: 'ingMush', name: t('Sklepní houby'), price: 0, frame: 'iMush', minDepth: NEVER, weight: 0, orderWeight: 0, kind: 'ingredient', theme: 2, makes: 'secretPickle', quip: t('Rostly na sudu. Nebo sud na nich.') },
  { id: 'ingMold', name: t('Katakombní plíseň'), price: 0, frame: 'iMold', minDepth: NEVER, weight: 0, orderWeight: 0, kind: 'ingredient', theme: 3, makes: 'cataCheese', quip: t('Svítí ve tmě. To je dobře. Asi.') },
  { id: 'ingSpice', name: t('Koření zpod hospody'), price: 0, frame: 'iSpice', minDepth: NEVER, weight: 0, orderWeight: 0, kind: 'ingredient', theme: 4, makes: 'underSausage', quip: t('Voní jako Vackova zástěra.') },
];

export function good(id: GoodId): Good {
  return GOODS.find((g) => g.id === id)!;
}

export const isIngredient = (id: GoodId) => good(id).kind === 'ingredient';
export const SPECIALS = GOODS.filter((g) => g.kind === 'special');
export const INGREDIENTS = GOODS.filter((g) => g.kind === 'ingredient');
