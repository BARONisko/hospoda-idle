// Mapy hospody a sklepa. 1 znak = 1 dlaždice 16×16.

// ---------------------------------------------------------------------- HOSPODA
// # zeď (vršek)  W zeď (líc)  b dlažba za výčepem  B pult  . podlaha  P zabedněná příčka  D vchod
// S boční branka na zahrádku  g tráva zahrádky  f plot  v venku (tma)
export const PUB_MAP = [
  '##########################vvvvvvvvvv',
  '#WWWWWWWWWWWWWWWWWWWWWWWW#vvvvvvvvvv',
  '#WWWWWWWWWWWWWWWWWWWWWWWW#ffffffffff',
  '#bbbbbbbbb........P......#gggggggggf',
  '#bbbbbbbbb........P......#gggggggggf',
  '#BBBBBBBBB........P......#gggggggggf',
  '#.................P......#gggggggggf',
  '#.................P......#gggggggggf',
  '#.................P......Sgggggggggf',
  '#.................P......#gggggggggf',
  '#.................P......#gggggggggf',
  '#.................P......#gggggggggf',
  '#.................P......#gggggggggf',
  '###############D##########ffffffffff',
];

/** Kuchyně za zdí nad výčepem (souřadnice v dlaždicích, y je nad hospodou – záporné).
 *  Do kuchyně se jde dveřmi vedle výdejního okénka, kamera vyjede nahoru. */
export const KITCHEN = {
  x: 9, // levý okraj
  w: 11, // šířka v dlaždicích
  top: -5, // horní okraj (2 řady zdi + 3 řady podlahy, spodní hrana = y 0)
  wallRows: 2,
  floorRows: 3,
  door: { x: 15 }, // dveře ve zdi hospody (y 1–2), v kuchyni dole
  // pevná místa pro stanice podél zadní zdi (střed v dlaždicích)
  slots: { toast: 9.9, goulash: 11.3, fried: 12.7, knee: 14.1, smoked: 15.5, brawn: 16.9 } as Record<string, number>,
  // volná místa pro budoucí kuchyňský nábytek (dole v rozích)
  furniture: [{ x: 10.2 }, { x: 18.6 }],
};

export const PUB = {
  w: 36,
  h: 14,
  innerW: 26, // šířka hospody (vpravo za zdí je už jen trávník – bývalá zahrádka)
  gardenX: 26, // od tohoto sloupce byla zrušená zahrádka (jen pro převod starých uložení)
  taps: [
    { x: 3, y: 5 },
    { x: 6, y: 5 },
  ],
  register: { x: 8, y: 5 },
  cooler: { x: 1, y: 3 },
  cellarDoor: { x: 12, y: 2 }, // dveře v líci zdi (2 dlaždice vysoké: y 1–2)
  lift: { x: 13 }, // výtah na sudy v líci zdi vedle dveří do sklepa, vyzvedává se z (13, 3)
  door: { x: 15, y: 13 },
  trash: { x: 1, y: 12 },
  jukebox: { x: 17, y: 3 },
  tv: { x: 16, y: 1 },
  stove: { x: 11, y: 3 },
  hatch: { x: 14 }, // výdejní okénko kuchyně (ve zdi), stojí se na (14, 3)
  coatRack: { x: 17, y: 12 },
  plant: { x: 1, y: 6 },
  staffOnly: { x1: 1, x2: 10, y1: 3, y2: 4 },
  partitionX: 18,
  // stoly: levá dlaždice stolu (stůl je 2×1), židle vlevo a vpravo; minLevel = úroveň vylepšení „Další stoly“
  tables: [
    { x: 3, y: 7, minLevel: 0 },
    { x: 3, y: 10, minLevel: 0 },
    { x: 8, y: 7, minLevel: 0 },
    { x: 8, y: 10, minLevel: 0 },
    { x: 13, y: 7, minLevel: 1 },
    { x: 13, y: 10, minLevel: 1 },
    { x: 21, y: 4, minLevel: 2 },
    { x: 21, y: 7, minLevel: 2 },
    { x: 21, y: 10, minLevel: 3 },
  ],
  // výzdoba na líci zdi (x, druh)
  wallDecor: [
    { x: 1, kind: 'shelf' }, { x: 2, kind: 'shelf' }, { x: 3, kind: 'shelf' }, { x: 4, kind: 'shelf2' },
    { x: 5, kind: 'shelf' }, { x: 6, kind: 'shelf2' }, { x: 7, kind: 'shelf' }, { x: 8, kind: 'shelf' },
    { x: 10, kind: 'clock' }, { x: 14, kind: 'poster' }, { x: 15, kind: 'antlers' },
    { x: 20, kind: 'window' }, { x: 23, kind: 'window' }, { x: 6, kind: 'window_skip' },
    { x: 22, kind: 'frame' }, { x: 9, kind: 'menu' },
  ],
  // světla: salonek = svítí jen když je otevřený
  lamps: [
    { x: 5, y: 4, salon: false }, { x: 4, y: 7.5, salon: false }, { x: 4, y: 10.5, salon: false }, { x: 9, y: 7.5, salon: false },
    { x: 9, y: 10.5, salon: false }, { x: 14, y: 7.5, salon: false }, { x: 14, y: 10.5, salon: false }, { x: 14.5, y: 4, salon: false },
    { x: 22, y: 4.5, salon: true }, { x: 22, y: 7.5, salon: true }, { x: 22, y: 10.5, salon: true }, { x: 15.5, y: 12.5, salon: false },
  ],
};

// Sklep se generuje náhodně při každém sestupu – viz src/systems/dungeon.ts a BAL.dungeon.
