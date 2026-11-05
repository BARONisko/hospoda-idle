import { PixelCanvas, hash } from './pixel';
import { PalKey } from '../data/palette';

// Všechny předměty a nábytek (atlas „obj“).

function table(): PixelCanvas {
  const p = new PixelCanvas(34, 22);
  // deska
  p.rect(1, 1, 32, 12, 'ochre');
  p.hline(2, 31, 1, 'sand');
  p.hline(1, 32, 12, 'copper');
  for (const sx of [11, 22]) p.vline(sx, 2, 12, 'copper');
  for (let i = 0; i < 14; i++) {
    const x = 2 + Math.floor(hash(i, 1, 81) * 29);
    const y = 3 + Math.floor(hash(i, 2, 81) * 8);
    p.set(x, y, 'copper');
    p.set(x + 1, y, 'copper');
  }
  // čelo
  p.rect(1, 13, 32, 3, 'rust');
  p.hline(1, 32, 15, 'blood');
  // nohy
  p.rect(3, 16, 2, 4, 'blood');
  p.rect(29, 16, 2, 4, 'blood');
  p.outline('ink');
  return p;
}

function chair(padded: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const seat: PalKey = padded ? 'red' : 'copper';
  const seatHi: PalKey = padded ? 'scarlet' : 'ochre';
  const back: PalKey = padded ? 'blood' : 'rust';
  p.rect(5, 8, 8, 4, seat);
  p.hline(5, 12, 8, seatHi);
  p.hline(5, 12, 11, back);
  p.rect(5, 12, 1, 3, 'blood');
  p.rect(12, 12, 1, 3, 'blood');
  // opěradlo vlevo
  p.rect(3, 2, 2, 11, back);
  p.vline(3, 2, 12, padded ? 'red' : 'copper');
  p.hline(3, 4, 2, seatHi);
  p.outline('ink');
  return p;
}

/** Kov pípy podle úrovně mistra pípy: hlavní, světlá a tmavá barva. */
export const TAP_METALS = {
  bronze: ['copper', 'ochre', 'rust'],
  iron: ['fog', 'bone', 'slate'],
  gold: ['gold', 'sand', 'amber'],
  crystal: ['ice', 'white', 'sky'],
} as const satisfies Record<string, readonly [PalKey, PalKey, PalKey]>;
export type TapMetal = keyof typeof TAP_METALS;

function tap(handle: PalKey, knob: PalKey, metal: TapMetal = 'gold'): PixelCanvas {
  const [main, light, dark] = TAP_METALS[metal];
  const p = new PixelCanvas(16, 20);
  // odkapávací miska
  p.rect(2, 15, 12, 3, 'slate');
  p.hline(2, 13, 15, 'fog');
  for (let x = 3; x < 13; x += 2) p.set(x, 16, 'dusk');
  // sloup
  p.rect(6, 5, 4, 10, main);
  p.vline(6, 5, 14, light);
  p.vline(9, 5, 14, dark);
  p.rect(5, 13, 6, 2, dark);
  // kohout
  p.rect(10, 7, 3, 2, main);
  p.set(12, 9, dark);
  p.set(12, 10, dark);
  // páka
  p.rect(7, 0, 2, 5, handle);
  p.rect(6, 0, 4, 2, knob);
  p.set(6, 0, 'white');
  if (metal === 'crystal') {
    // mistrovská pípa: třpytky na sloupu
    p.set(7, 7, 'white');
    p.set(8, 11, 'white');
  }
  p.outline('ink');
  return p;
}

function register(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(2, 7, 12, 8, 'slate');
  p.hline(2, 13, 7, 'fog');
  p.rect(3, 9, 10, 3, 'dusk');
  for (let x = 4; x < 12; x += 2) {
    p.set(x, 9, 'bone');
    p.set(x + 1, 10, 'fog');
  }
  p.rect(4, 2, 8, 4, 'ink');
  p.rect(5, 3, 6, 2, 'mint');
  p.set(5, 3, 'white');
  p.hline(2, 13, 14, 'dusk');
  p.rect(9, 12, 3, 1, 'gold');
  p.outline('ink');
  return p;
}

function keg(gold = false): PixelCanvas {
  const p = new PixelCanvas(16, 18);
  const body: PalKey = gold ? 'gold' : 'rust';
  const hi: PalKey = gold ? 'sand' : 'copper';
  const top: PalKey = gold ? 'sand' : 'ochre';
  const hoop: PalKey = gold ? 'amber' : 'slate';
  const hoopHi: PalKey = gold ? 'white' : 'fog';
  p.rect(2, 4, 12, 12, body);
  p.rect(1, 6, 14, 8, body);
  for (let x = 3; x < 14; x += 3) p.vline(x, 5, 15, gold ? 'amber' : 'blood');
  p.vline(3, 5, 14, hi);
  p.ellipse(8, 4, 6, 3, top);
  p.ellipse(8, 4, 4, 1.8, gold ? 'gold' : 'copper');
  p.set(8, 4, 'ink');
  p.hline(1, 14, 7, hoop);
  p.hline(2, 13, 13, hoop);
  p.set(3, 7, hoopHi);
  p.set(3, 13, hoopHi);
  p.outline('ink');
  return p;
}

function jukebox(f: number): PixelCanvas {
  const p = new PixelCanvas(16, 26);
  p.ellipse(8, 7, 7, 7, 'maroon');
  p.rect(1, 7, 14, 17, 'maroon');
  p.ellipse(8, 7.5, 5, 5, f ? 'scarlet' : 'gold');
  p.ellipse(8, 8, 3.6, 3.6, 'ink');
  p.ellipse(8, 8, 1.2, 1.2, 'gold');
  p.rect(3, 13, 10, 4, 'ink');
  for (let x = 4; x < 12; x += 2) p.set(x, 14, (x / 2 + f) % 2 ? 'sky' : 'mint');
  p.hline(4, 11, 16, 'gold');
  for (let y = 18; y < 23; y++) p.hline(3, 12, y, y % 2 ? 'blood' : 'ink');
  p.vline(1, 7, 23, f ? 'gold' : 'scarlet');
  p.vline(14, 7, 23, f ? 'gold' : 'scarlet');
  p.hline(1, 14, 24, 'ink');
  p.outline('ink');
  return p;
}

function tv(f: number): PixelCanvas {
  const p = new PixelCanvas(18, 14);
  p.rect(0, 0, 18, 12, 'dusk');
  p.rect(1, 1, 16, 10, 'ink');
  if (f < 2) {
    p.rect(2, 2, 14, 8, 'green');
    for (let x = 2; x < 16; x += 4) p.vline(x + f, 2, 9, 'mint');
    p.vline(9, 2, 9, 'white');
    p.ellipse(9, 6, 2, 2, 'green');
    p.set(5 + f * 2, 4, 'scarlet');
    p.set(12 - f, 7, 'sky');
    p.set(7 + f, 6, 'white');
  } else {
    p.rect(2, 2, 14, 8, 'navy');
    p.set(4, 3, 'indigo');
  }
  p.rect(7, 12, 4, 2, 'slate');
  p.set(15, 10, 'scarlet');
  return p;
}

function stove(f: number): PixelCanvas {
  const p = new PixelCanvas(16, 26);
  p.rect(6, 0, 4, 6, 'slate');
  p.vline(6, 0, 5, 'fog');
  p.rect(2, 6, 12, 17, 'coal');
  p.hline(1, 14, 6, 'fog');
  p.hline(1, 14, 7, 'slate');
  p.vline(3, 8, 22, 'dusk');
  p.rect(5, 13, 6, 6, 'ink');
  const fire: PalKey[] = f ? ['gold', 'amber', 'scarlet'] : ['amber', 'gold', 'red'];
  p.rect(6, 16, 4, 3, fire[1]);
  p.set(6 + f, 15, fire[0]);
  p.set(8, 14 + f, fire[0]);
  p.hline(6, 9, 18, fire[2]);
  p.set(7, 17, 'white');
  p.rect(3, 23, 2, 2, 'ink');
  p.rect(11, 23, 2, 2, 'ink');
  p.outline('ink');
  return p;
}

function coatRack(): PixelCanvas {
  const p = new PixelCanvas(16, 26);
  p.vline(8, 2, 23, 'rust');
  p.vline(7, 2, 23, 'copper');
  p.hline(4, 11, 24, 'blood');
  p.hline(5, 10, 3, 'rust');
  // kabát
  p.rect(3, 4, 4, 11, 'green');
  p.vline(3, 4, 14, 'pine');
  p.set(4, 4, 'mint');
  // klobouk
  p.rect(8, 0, 6, 2, 'olive');
  p.hline(7, 14, 2, 'ink');
  p.outline('ink');
  return p;
}

function plant(): PixelCanvas {
  const p = new PixelCanvas(16, 22);
  p.rect(4, 14, 8, 7, 'copper');
  p.hline(3, 12, 14, 'ochre');
  p.vline(11, 15, 20, 'rust');
  const leaves: [number, number, number, number, PalKey][] = [
    [8, 9, 5, 4, 'pine'], [5, 6, 3, 4, 'green'], [11, 6, 3, 4, 'green'], [8, 4, 3, 4, 'mint'], [4, 11, 3, 2, 'green'], [12, 11, 3, 2, 'pine'],
  ];
  for (const [x, y, rx, ry, c] of leaves) p.ellipse(x, y, rx, ry, c);
  p.set(7, 3, 'white');
  p.outline('ink');
  return p;
}

function trash(): PixelCanvas {
  const p = new PixelCanvas(16, 18);
  // koště
  p.vline(13, 0, 11, 'ochre');
  p.vline(12, 1, 11, 'copper');
  p.rect(10, 12, 5, 4, 'sand');
  p.hline(10, 14, 15, 'amber');
  // koš
  p.rect(2, 5, 8, 11, 'slate');
  p.vline(2, 5, 15, 'fog');
  p.vline(9, 5, 15, 'dusk');
  for (let y = 7; y < 15; y += 3) p.hline(3, 8, y, 'dusk');
  p.ellipse(6, 4, 5, 2, 'fog');
  p.set(4, 3, 'white');
  // odpadky
  p.set(5, 2, 'gold');
  p.set(7, 2, 'bone');
  p.outline('ink');
  return p;
}

function shelf(variant: number): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(0, 10, 16, 2, 'copper');
  p.hline(0, 15, 12, 'blood');
  p.hline(0, 15, 10, 'ochre');
  if (variant === 0) {
    const bottles: [number, PalKey, PalKey, number][] = [
      [1, 'green', 'pine', 8], [4, 'amber', 'gold', 6], [7, 'bone', 'white', 7], [10, 'red', 'scarlet', 8], [13, 'green', 'mint', 6],
    ];
    for (const [x, c, h, ht] of bottles) {
      p.rect(x, 10 - ht + 2, 2, ht - 2, c);
      p.vline(x, 10 - ht + 3, 9, h);
      p.set(x, 10 - ht + 1, 'ink');
      p.set(x + 1, 10 - ht + 1, c);
      p.set(x, 10 - ht, 'gold');
    }
  } else {
    for (let x = 1; x < 15; x += 4) {
      p.rect(x, 4, 3, 6, 'bone');
      p.vline(x, 4, 9, 'white');
      p.vline(x + 2, 4, 9, 'fog');
      p.hline(x, x + 2, 4, 'fog');
    }
  }
  return p;
}

function clock(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.ellipse(8, 7, 6, 6, 'copper');
  p.ellipse(8, 7, 4.6, 4.6, 'bone');
  p.vline(8, 3, 7, 'ink');
  p.hline(8, 10, 7, 'ink');
  p.set(8, 7, 'red');
  p.set(5, 4, 'white');
  p.vline(8, 13, 15, 'gold');
  p.outline('ink');
  return p;
}

function poster(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(2, 1, 12, 14, 'gold');
  p.rect(3, 2, 10, 2, 'red');
  p.rect(5, 6, 5, 6, 'amber');
  p.rect(5, 5, 5, 2, 'white');
  p.vline(10, 7, 10, 'bone');
  p.vline(11, 7, 10, 'bone');
  p.vline(5, 7, 11, 'sand');
  p.rect(3, 13, 10, 1, 'red');
  p.outline('ink');
  return p;
}

function antlers(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.ellipse(8, 11, 3, 3, 'rust');
  p.ellipse(8, 11, 1.6, 1.6, 'copper');
  const pts: [number, number][] = [
    [6, 9], [5, 8], [4, 7], [3, 6], [3, 5], [2, 4], [2, 3], [4, 5], [5, 4], [5, 3], [3, 7], [1, 6],
  ];
  for (const [x, y] of pts) {
    p.set(x, y, 'bone');
    p.set(15 - x, y, 'bone');
  }
  p.set(2, 3, 'white');
  p.outline('ink');
  return p;
}

function windowTile(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(1, 1, 14, 14, 'rust');
  p.rect(2, 2, 12, 11, 'navy');
  p.rect(2, 8, 12, 5, 'indigo');
  p.ellipse(10.5, 5, 1.8, 1.8, 'bone');
  p.set(10, 4, 'white');
  p.set(4, 4, 'ice');
  p.set(6, 6, 'ice');
  p.vline(7, 2, 12, 'rust');
  p.hline(2, 13, 7, 'rust');
  p.hline(1, 14, 14, 'copper');
  // záclonky
  p.rect(1, 1, 2, 9, 'red');
  p.rect(13, 1, 2, 9, 'red');
  p.set(2, 9, 'blood');
  p.set(13, 9, 'blood');
  p.outline('ink');
  return p;
}

function frame(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(2, 2, 12, 10, 'gold');
  p.rect(3, 3, 10, 8, 'sky');
  // kopce uvnitř rámu (dřív přetékaly dolů přes rám a vypadaly jako zelená skvrna)
  p.ellipse(6, 10, 3, 2, 'green');
  p.ellipse(10, 10, 3, 1, 'pine');
  p.set(10, 5, 'white');
  p.rect(3, 10, 10, 1, 'green');
  p.hline(2, 13, 2, 'sand');
  p.outline('ink');
  return p;
}

function menuBoard(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(1, 1, 14, 13, 'rust');
  p.rect(2, 2, 12, 11, 'coal');
  for (let y = 4; y < 12; y += 2) {
    const len = 4 + Math.floor(hash(y, 1, 91) * 5);
    p.hline(3, 3 + len, y, 'bone');
    p.set(11, y, 'fog');
    p.set(12, y, 'fog');
  }
  p.outline('ink');
  return p;
}

function cellarDoor(): PixelCanvas {
  const p = new PixelCanvas(16, 32);
  p.rect(1, 2, 14, 30, 'olive');
  p.rect(2, 3, 12, 29, 'blood');
  for (let x = 4; x < 14; x += 3) p.vline(x, 3, 31, 'maroon');
  p.hline(2, 13, 9, 'slate');
  p.hline(2, 13, 24, 'slate');
  p.hline(2, 13, 10, 'dusk');
  p.hline(2, 13, 25, 'dusk');
  p.set(11, 17, 'gold');
  p.set(11, 18, 'amber');
  // cedulka s lebkou
  p.rect(4, 4, 8, 5, 'bone');
  p.ellipse(8, 6, 2, 1.6, 'ink');
  p.set(7, 6, 'bone');
  p.set(9, 6, 'bone');
  p.hline(7, 9, 8, 'ink');
  p.outline('ink');
  return p;
}

/** Otevřené dveře do sklepa: křídlo přimáčknuté vlevo, uvnitř tma a první schody. */
function cellarDoorOpen(): PixelCanvas {
  const p = new PixelCanvas(16, 32);
  p.rect(1, 2, 14, 30, 'olive');
  p.rect(2, 3, 12, 29, 'ink');
  for (let y = 18; y < 32; y += 4) p.hline(5, 13, y, 'dusk'); // schody dolů
  for (let y = 19; y < 32; y += 4) p.hline(6, 13, y, 'coal');
  p.rect(2, 3, 3, 29, 'blood'); // křídlo z boku
  p.vline(4, 3, 31, 'maroon');
  p.set(3, 17, 'gold');
  p.outline('ink');
  return p;
}

function lampShade(): PixelCanvas {
  const p = new PixelCanvas(12, 9);
  p.ellipse(6, 4, 5, 3.5, 'copper');
  p.ellipse(5, 3, 2.5, 1.5, 'ochre');
  p.set(4, 2, 'sand');
  p.hline(4, 7, 7, 'gold');
  p.set(6, 8, 'white');
  p.outline('ink');
  return p;
}

function mug(kind: 'light' | 'dark' | 'empty'): PixelCanvas {
  const p = new PixelCanvas(10, 11);
  const body: PalKey = kind === 'dark' ? 'blood' : kind === 'empty' ? 'bone' : 'amber';
  const hi: PalKey = kind === 'dark' ? 'rust' : kind === 'empty' ? 'white' : 'gold';
  p.rect(1, 3, 6, 7, body);
  p.vline(2, 4, 8, hi);
  if (kind !== 'empty') p.set(5, 5, 'sand');
  // ucho
  p.vline(7, 4, 8, 'bone');
  p.vline(8, 5, 7, 'bone');
  p.set(7, 4, 'fog');
  // pěna
  if (kind !== 'empty') {
    p.hline(1, 6, 2, 'white');
    p.hline(2, 5, 1, 'white');
    p.set(6, 3, 'bone');
    p.set(1, 3, 'white');
  } else {
    p.hline(1, 6, 2, 'fog');
  }
  p.hline(1, 6, 9, kind === 'empty' ? 'fog' : 'bone');
  p.outline('ink');
  return p;
}

function shot(): PixelCanvas {
  const p = new PixelCanvas(7, 9);
  p.rect(1, 2, 5, 5, 'bone');
  p.rect(2, 4, 3, 3, 'white');
  p.vline(1, 2, 6, 'fog');
  p.hline(1, 5, 7, 'fog');
  p.set(4, 3, 'plum');
  p.outline('ink');
  return p;
}

function puddle(water: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const edge: PalKey = water ? 'indigo' : 'amber';
  const mid: PalKey = water ? 'blue' : 'gold';
  const shine: PalKey = water ? 'ice' : 'sand';
  p.ellipse(8, 9, 6.5, 4, edge);
  p.ellipse(4, 7, 3, 2.5, edge);
  p.ellipse(12, 11, 3, 2, edge);
  p.ellipse(8, 9, 4.5, 2.6, mid);
  p.ellipse(4, 7, 1.6, 1.2, mid);
  p.set(6, 7, shine);
  p.set(7, 7, shine);
  p.set(10, 9, 'white');
  p.set(13, 11, shine);
  return p;
}

function shards(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const bits: [number, number, PalKey][] = [
    [3, 5, 'bone'], [4, 5, 'white'], [4, 6, 'fog'], [9, 4, 'ice'], [10, 4, 'bone'], [10, 5, 'fog'],
    [7, 9, 'white'], [8, 9, 'bone'], [8, 10, 'fog'], [12, 10, 'bone'], [13, 11, 'white'], [4, 11, 'ice'],
    [5, 12, 'bone'], [11, 7, 'white'], [6, 7, 'amber'], [9, 12, 'amber'],
  ];
  for (const [x, y, c] of bits) p.set(x, y, c);
  p.outline('ink');
  return p;
}

function coin(): PixelCanvas {
  const p = new PixelCanvas(9, 9);
  p.ellipse(4.5, 4.5, 3.6, 3.6, 'gold');
  p.ellipse(4.5, 4.5, 2, 2, 'amber');
  p.set(4, 4, 'gold');
  p.set(3, 2, 'white');
  p.set(2, 3, 'sand');
  p.outline('ink');
  return p;
}

function jar(): PixelCanvas {
  const p = new PixelCanvas(12, 15);
  p.rect(3, 0, 6, 2, 'slate');
  p.hline(3, 8, 0, 'fog');
  p.rect(1, 2, 10, 11, 'pine');
  p.rect(1, 2, 10, 2, 'grave');
  p.ellipse(6, 8, 2.6, 2.6, 'bone');
  p.set(6, 8, 'ink');
  p.set(7, 8, 'ink');
  p.set(4, 7, 'red');
  p.set(8, 10, 'red');
  p.set(3, 11, 'mint');
  p.set(9, 5, 'mint');
  p.vline(2, 3, 11, 'green');
  p.vline(2, 4, 6, 'white');
  p.hline(1, 10, 13, 'grave');
  p.outline('ink');
  return p;
}

function note(): PixelCanvas {
  const p = new PixelCanvas(10, 11);
  p.rect(1, 1, 8, 9, 'bone');
  p.set(8, 9, 'tan');
  p.set(7, 9, 'tan');
  p.set(8, 8, 'tan');
  for (let y = 3; y < 9; y += 2) p.hline(2, 2 + Math.floor(hash(y, 2, 93) * 5), y, 'slate');
  p.set(5, 1, 'scarlet');
  p.set(5, 0, 'red');
  p.outline('ink');
  return p;
}

/** Papírek pohozený na zemi ve sklepě (lore): pomačkaný, s pár řádky. */
function scrap(): PixelCanvas {
  const p = new PixelCanvas(11, 8);
  p.rect(1, 1, 9, 6, 'bone');
  p.set(1, 1, 'tan');
  p.set(9, 6, 'tan');
  p.hline(8, 9, 1, 'fog');
  p.set(4, 6, 'fog');
  p.hline(2, 6, 3, 'slate');
  p.hline(3, 8, 5, 'slate');
  p.set(7, 3, 'blood');
  p.outline('ink');
  return p;
}

function fuse(on: boolean): PixelCanvas {
  const p = new PixelCanvas(14, 16);
  p.rect(1, 1, 12, 13, 'slate');
  p.hline(1, 12, 1, 'fog');
  p.vline(1, 1, 13, 'fog');
  p.rect(3, 3, 8, 5, 'dusk');
  for (let x = 4; x < 11; x += 2) p.vline(x, 4, 6, on ? 'mint' : 'red');
  // páka
  p.rect(6, on ? 9 : 11, 2, 3, 'scarlet');
  p.set(6, on ? 9 : 11, 'white');
  // výstražný trojúhelník
  p.set(10, 9, 'gold');
  p.hline(9, 11, 10, 'gold');
  p.hline(9, 11, 11, 'gold');
  p.set(10, 10, 'ink');
  p.outline('ink');
  return p;
}

function slivCrate(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(1, 5, 14, 10, 'copper');
  p.hline(1, 14, 5, 'ochre');
  p.hline(1, 14, 9, 'rust');
  p.hline(1, 14, 14, 'rust');
  p.vline(1, 5, 14, 'rust');
  p.vline(14, 5, 14, 'rust');
  for (let x = 3; x < 13; x += 3) {
    p.rect(x, 1, 2, 4, 'bone');
    p.set(x, 0, 'plum');
    p.set(x + 1, 0, 'plum');
    p.set(x, 2, 'white');
  }
  p.outline('ink');
  return p;
}

function well(): PixelCanvas {
  const p = new PixelCanvas(32, 32);
  p.ellipse(16, 16, 14, 13, 'slate');
  for (let a = 0; a < 20; a++) {
    const ang = (a / 20) * Math.PI * 2;
    const x = 16 + Math.cos(ang) * 12;
    const y = 16 + Math.sin(ang) * 11;
    p.set(x, y, 'dusk');
    if (a % 2 === 0) p.set(x + Math.cos(ang), y + Math.sin(ang) - 1, 'fog');
  }
  p.ellipse(16, 16, 9, 8, 'ink');
  p.ellipse(16, 17, 6, 5, 'navy');
  p.ellipse(16, 18, 4, 3, 'ink');
  p.set(13, 15, 'ice');
  p.set(19, 19, 'ice');
  p.outline('ink');
  return p;
}

function rubble(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.ellipse(5, 11, 4, 3, 'slate');
  p.ellipse(11, 10, 4, 4, 'dusk');
  p.ellipse(8, 6, 4, 3, 'slate');
  p.ellipse(4, 5, 2, 2, 'dusk');
  p.set(7, 4, 'fog');
  p.set(4, 9, 'fog');
  p.set(10, 8, 'slate');
  for (let i = 0; i < 10; i++) p.set(2 + i, 13 - Math.floor(i / 2), 'olive');
  p.outline('ink');
  return p;
}

function barrel(): PixelCanvas {
  const p = new PixelCanvas(16, 18);
  p.rect(2, 4, 12, 12, 'rust');
  p.rect(1, 6, 14, 8, 'rust');
  for (let x = 4; x < 14; x += 3) p.vline(x, 5, 15, 'blood');
  p.vline(3, 5, 14, 'copper');
  p.ellipse(8, 4, 6, 3, 'copper');
  p.ellipse(8, 4, 4, 1.6, 'rust');
  p.hline(1, 14, 7, 'slate');
  p.hline(2, 13, 13, 'slate');
  p.outline('ink');
  return p;
}

function barrels(): PixelCanvas {
  const p = new PixelCanvas(16, 22);
  p.blit(barrel(), 0, 0);
  const b = barrel();
  p.blit(b, 0, 5);
  return p;
}

function crate(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(1, 2, 14, 13, 'rust');
  p.rect(2, 3, 12, 11, 'copper');
  p.hline(1, 14, 2, 'ochre');
  for (let i = 0; i < 11; i++) {
    p.set(2 + i, 3 + i, 'rust');
    p.set(3 + i, 3 + i, 'rust');
  }
  p.hline(1, 14, 8, 'rust');
  p.outline('ink');
  return p;
}

function crates(): PixelCanvas {
  const p = new PixelCanvas(16, 22);
  p.blit(crate(), 0, 6);
  const top = crate();
  p.blit(top, 2, 0);
  return p;
}

function pillar(): PixelCanvas {
  const p = new PixelCanvas(16, 26);
  p.rect(3, 4, 10, 20, 'slate');
  for (let y = 6; y < 24; y += 4) p.hline(3, 12, y, 'dusk');
  for (let y = 4; y < 24; y += 8) p.set(7, y + 1, 'dusk');
  p.vline(3, 4, 23, 'fog');
  p.rect(2, 1, 12, 3, 'fog');
  p.hline(2, 13, 1, 'bone');
  p.rect(2, 23, 12, 2, 'dusk');
  p.outline('ink');
  return p;
}

function cobweb(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let i = 0; i < 12; i++) {
    p.set(i, 0, i % 2 ? 'fog' : null);
    p.set(0, i, i % 2 ? 'fog' : null);
    if (i < 10) p.set(i, i, 'fog');
  }
  for (const r of [4, 7, 10]) for (let a = 0; a <= r; a++) p.set(a, Math.round(Math.sqrt(r * r - a * a)), 'fog');
  return p;
}

function bulb(): PixelCanvas {
  const p = new PixelCanvas(7, 9);
  p.vline(3, 0, 2, 'ink');
  p.rect(2, 2, 3, 1, 'slate');
  p.ellipse(3.5, 5.5, 2.5, 2.6, 'gold');
  p.set(2, 4, 'white');
  p.outline('ink');
  return p;
}

function kegRack(): PixelCanvas {
  const p = new PixelCanvas(32, 24);
  p.rect(1, 18, 30, 3, 'olive');
  p.hline(1, 30, 18, 'ochre');
  p.rect(2, 20, 2, 4, 'olive');
  p.rect(28, 20, 2, 4, 'olive');
  const end = (cx: number, cy: number) => {
    p.ellipse(cx, cy, 6.5, 6.5, 'rust');
    p.ellipse(cx, cy, 5, 5, 'ochre');
    p.ellipse(cx, cy, 3, 3, 'copper');
    p.set(cx, cy, 'ink');
    p.set(cx - 3, cy - 3, 'sand');
  };
  end(9, 12);
  end(23, 12);
  end(16, 6);
  p.outline('ink');
  return p;
}

function bubble(): PixelCanvas {
  const p = new PixelCanvas(16, 17);
  p.rect(1, 2, 14, 10, 'white');
  p.rect(2, 1, 12, 12, 'white');
  p.hline(2, 13, 12, 'bone');
  p.hline(1, 14, 11, 'white');
  p.rect(6, 13, 3, 1, 'white');
  p.rect(6, 14, 2, 1, 'white');
  p.set(6, 15, 'white');
  p.outline('ink');
  return p;
}

function arrow(): PixelCanvas {
  const p = new PixelCanvas(9, 7);
  p.hline(1, 7, 1, 'gold');
  p.hline(2, 6, 2, 'gold');
  p.hline(3, 5, 3, 'amber');
  p.set(4, 4, 'amber');
  p.set(2, 1, 'sand');
  p.outline('ink');
  return p;
}

function anger(): PixelCanvas {
  const p = new PixelCanvas(9, 9);
  for (const [x, y] of [[2, 1], [2, 2], [1, 2], [6, 1], [6, 2], [7, 2], [1, 6], [2, 6], [2, 7], [7, 6], [6, 6], [6, 7]])
    p.set(x, y, 'scarlet');
  p.outline('blood');
  return p;
}

function zzz(): PixelCanvas {
  const p = new PixelCanvas(8, 8);
  p.hline(1, 4, 1, 'white');
  p.set(3, 2, 'white');
  p.set(2, 3, 'white');
  p.hline(1, 4, 4, 'white');
  p.hline(5, 7, 5, 'ice');
  p.set(6, 6, 'ice');
  p.hline(5, 7, 7, 'ice');
  return p;
}

function dust(): PixelCanvas {
  const p = new PixelCanvas(24, 20);
  const puffs: [number, number, number][] = [[8, 10, 6], [15, 9, 6], [12, 6, 5], [6, 14, 4], [17, 14, 4]];
  for (const [x, y, r] of puffs) p.ellipse(x, y, r, r * 0.85, 'bone');
  for (const [x, y, r] of puffs) p.ellipse(x - 1, y - 1, r * 0.5, r * 0.4, 'white');
  p.set(5, 4, 'gold');
  p.set(19, 5, 'gold');
  p.set(12, 16, 'scarlet');
  p.outline('fog');
  return p;
}

function mop(): PixelCanvas {
  const p = new PixelCanvas(8, 14);
  p.vline(5, 0, 9, 'ochre');
  p.rect(2, 9, 5, 4, 'bone');
  p.hline(2, 6, 12, 'fog');
  p.outline('ink');
  return p;
}

function flash(): PixelCanvas {
  const p = new PixelCanvas(6, 6);
  p.set(2, 0, 'white');
  p.set(2, 5, 'white');
  p.hline(0, 5, 2, 'white');
  p.hline(1, 4, 3, 'gold');
  p.set(3, 1, 'gold');
  p.set(3, 4, 'gold');
  return p;
}

/** Lékárnička u schodů ve sklepě (bílá skříňka s červeným křížem). */
function medkit(): PixelCanvas {
  const p = new PixelCanvas(12, 11);
  p.rect(4, 0, 4, 2, 'slate'); // ucho
  p.rect(0, 2, 12, 9, 'bone');
  p.rect(1, 3, 10, 7, 'white');
  p.rect(5, 4, 2, 5, 'scarlet');
  p.rect(3, 5, 6, 3, 'scarlet');
  p.hline(1, 10, 9, 'fog');
  p.outline('ink');
  return p;
}

function candle(): PixelCanvas {
  const p = new PixelCanvas(6, 10);
  p.rect(2, 4, 2, 4, 'bone');
  p.vline(2, 4, 7, 'white');
  p.hline(1, 4, 8, 'copper');
  p.set(2, 2, 'gold');
  p.set(3, 3, 'amber');
  p.set(2, 3, 'white');
  p.set(2, 1, 'sand');
  p.outline('ink');
  return p;
}

function sheet(): PixelCanvas {
  // nábytek přikrytý plachtou
  const p = new PixelCanvas(52, 22);
  p.ellipse(26, 9, 25, 8, 'fog');
  p.rect(2, 9, 48, 9, 'fog');
  p.ellipse(26, 7, 20, 5, 'bone');
  for (let x = 4; x < 48; x += 7) p.vline(x, 12, 17, 'slate');
  p.hline(2, 49, 18, 'slate');
  p.outline('ink');
  return p;
}

export function buildObjects(): Record<string, PixelCanvas> {
  const o: Record<string, PixelCanvas> = {};
  o.table = table();
  o.chairL = chair(false);
  o.chairR = o.chairL.flipped();
  o.chairL2 = chair(true);
  o.chairR2 = o.chairL2.flipped();
  o.tap = tap('ink', 'red');
  o.tap2 = tap('ink', 'green');
  // pípy podle mistra pípy (tap_<kov>, tap2_<kov>)
  for (const m of Object.keys(TAP_METALS) as TapMetal[]) {
    o[`tap_${m}`] = tap('ink', 'red', m);
    o[`tap2_${m}`] = tap('ink', 'green', m);
  }
  o.register = register();
  o.keg = keg();
  o.kegGold = keg(true);
  o.jukebox0 = jukebox(0);
  o.jukebox1 = jukebox(1);
  o.tv0 = tv(0);
  o.tv1 = tv(1);
  o.tvOff = tv(2);
  o.stove0 = stove(0);
  o.stove1 = stove(1);
  o.coatRack = coatRack();
  o.plant = plant();
  o.trash = trash();
  o.shelf = shelf(0);
  o.shelf2 = shelf(1);
  o.clock = clock();
  o.poster = poster();
  o.antlers = antlers();
  o.window = windowTile();
  o.frame = frame();
  o.menu = menuBoard();
  o.cellarDoor = cellarDoor();
  o.cellarDoorOpen = cellarDoorOpen();
  o.lampShade = lampShade();
  o.mug = mug('light');
  o.mugDark = mug('dark');
  o.mugEmpty = mug('empty');
  o.shot = shot();
  o.puddle = puddle(false);
  o.water = puddle(true);
  o.shards = shards();
  o.coin = coin();
  o.jar = jar();
  o.note = note();
  o.scrap = scrap();
  o.fuseOn = fuse(true);
  o.fuseOff = fuse(false);
  o.slivCrate = slivCrate();
  o.well = well();
  o.rubble = rubble();
  o.barrel = barrel();
  o.barrels = barrels();
  o.crate = crate();
  o.crates = crates();
  o.pillar = pillar();
  o.cobweb = cobweb();
  o.cobwebR = o.cobweb.flipped();
  o.bulb = bulb();
  o.kegRack = kegRack();
  o.bubble = bubble();
  o.arrow = arrow();
  o.anger = anger();
  o.zzz = zzz();
  o.dust = dust();
  o.mop = mop();
  o.flash = flash();
  o.candle = candle();
  o.medkit = medkit();
  o.sheet = sheet();
  return o;
}
