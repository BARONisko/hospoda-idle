import { PixelCanvas } from './pixel';
import type { PalKey } from '../data/palette';

// Hřbitov ve sklepě: náhrobky, lucerny, krypta, rakev, havran, ruce ze země,
// sombrero a kytara kostlivce, lopata, psí lebka a upíří víno.

function tomb(kind: 1 | 2 | 3): PixelCanvas {
  const p = new PixelCanvas(12, 16);
  const [c, hi, sh]: PalKey[] = kind === 3 ? ['dusk', 'slate', 'ink'] : ['slate', 'fog', 'dusk'];
  if (kind === 1) {
    // kulatý vršek
    p.rect(1, 4, 10, 11, c);
    p.ellipse(5.5, 4, 4.5, 3.5, c);
    p.vline(2, 3, 14, hi);
    p.vline(10, 4, 14, sh);
  } else if (kind === 2) {
    // hranatý s křížkem
    p.rect(1, 2, 10, 13, c);
    p.hline(1, 10, 2, hi);
    p.vline(10, 3, 14, sh);
    p.vline(5, 4, 9, 'ink');
    p.hline(4, 6, 5, 'ink');
  } else {
    // starý nakřivo, prasklý
    for (let y = 1; y < 15; y++) p.hline(2 + Math.floor(y / 7), 9 + Math.floor(y / 7), y, c);
    p.hline(3, 8, 1, hi);
    p.set(5, 4, 'ink');
    p.set(6, 5, 'ink');
    p.set(6, 6, 'ink');
    p.set(7, 7, 'ink');
  }
  // nápis (čárky)
  if (kind !== 3) for (const y of [9, 11]) p.hline(3, 8, y, sh);
  // mech u země a trs trávy
  p.hline(1, 10, 14, 'grave');
  p.set(2, 13, 'sage');
  p.set(9, 13, 'pine');
  p.hline(0, 11, 15, 'olive');
  return p.outline('ink');
}

function cross(): PixelCanvas {
  const p = new PixelCanvas(11, 17);
  p.rect(4, 1, 3, 15, 'rust');
  p.rect(1, 4, 9, 3, 'rust');
  p.vline(4, 1, 15, 'copper');
  p.hline(1, 9, 4, 'copper');
  p.set(5, 5, 'olive');
  p.hline(2, 8, 16, 'olive');
  return p.outline('ink');
}

function mound(treasure: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 8);
  p.ellipse(7.5, 4.5, 7, 3, 'rust');
  p.ellipse(7.5, 3.5, 6, 2, 'mauve');
  for (const [x, y] of [[4, 3], [9, 2], [12, 4]]) p.set(x, y, 'tan');
  if (treasure) {
    // malý dřevěný kolík s kouskem látky
    p.vline(8, 0, 4, 'copper');
    p.set(9, 0, 'scarlet');
    p.set(9, 1, 'red');
  }
  return p.outline('ink');
}

function hole(): PixelCanvas {
  const p = new PixelCanvas(16, 9);
  p.ellipse(7.5, 4.5, 7, 4, 'rust');
  p.ellipse(7.5, 4.5, 5, 2.5, 'ink');
  p.hline(4, 11, 3, 'olive');
  return p;
}

function lantern(lit: boolean): PixelCanvas {
  const p = new PixelCanvas(9, 24);
  // tyč
  p.rect(4, 8, 1, 15, 'olive');
  p.set(4, 8, 'rust');
  p.hline(2, 6, 23, 'ink');
  // rameno a lucerna
  p.hline(4, 7, 3, 'coal');
  p.set(7, 4, 'coal');
  p.rect(1, 5, 7, 2, 'coal');
  p.rect(2, 7, 5, 6, lit ? 'sand' : 'dusk');
  if (lit) {
    p.rect(3, 8, 3, 4, 'gold');
    p.set(4, 9, 'white');
  } else p.set(4, 10, 'slate');
  p.vline(2, 7, 12, 'coal');
  p.vline(6, 7, 12, 'coal');
  p.hline(2, 6, 13, 'coal');
  return p.outline('ink');
}

function raven(f: 0 | 1 | 2): PixelCanvas {
  const p = new PixelCanvas(12, 9);
  if (f === 0) {
    // sedí
    p.ellipse(6, 5, 3, 2.5, 'ink');
    p.rect(3, 2, 3, 3, 'ink');
    p.set(4, 3, 'scarlet');
    p.hline(1, 2, 3, 'tan');
    p.hline(8, 10, 6, 'ink');
    p.set(5, 8, 'tan');
    p.set(7, 8, 'tan');
    p.set(6, 4, 'indigo');
  } else {
    // letí: křídla nahoru / dolů
    p.ellipse(6, 5, 2.5, 1.5, 'ink');
    p.set(3, 4, 'ink');
    p.set(2, 4, 'tan');
    const wy = f === 1 ? -1 : 1;
    for (let i = 1; i < 6; i++) {
      p.set(6 - i, 5 + wy * Math.ceil(i / 2), 'ink');
      p.set(6 + i, 5 + wy * Math.ceil(i / 2), 'ink');
    }
    p.set(6, 4, 'indigo');
  }
  return p;
}

function hand(grab: boolean): PixelCanvas {
  const p = new PixelCanvas(10, 12);
  // hlína kolem
  p.ellipse(4.5, 10, 4.5, 1.5, 'olive');
  p.hline(1, 8, 10, 'rust');
  // předloktí a dlaň (šedozelená)
  p.rect(3, 5, 3, 5, 'sage');
  p.vline(3, 5, 9, 'grave');
  if (grab) {
    // prsty sevřené
    p.rect(2, 2, 5, 3, 'sage');
    p.hline(2, 6, 2, 'bone');
    p.set(7, 3, 'sage');
  } else {
    // roztažené prsty
    for (const x of [1, 3, 5, 7]) p.vline(x, 1 + (x === 3 || x === 5 ? 0 : 1), 4, 'sage');
    p.rect(2, 4, 5, 2, 'sage');
  }
  return p.outline('ink');
}

function crypt(): PixelCanvas {
  const W = 84;
  const H = 54;
  const p = new PixelCanvas(W, H);
  // střecha (štít)
  for (let y = 0; y < 14; y++) p.hline(42 - y * 3, 41 + y * 3, y + 2, y < 2 ? 'fog' : 'slate');
  p.hline(0, W - 1, 15, 'fog');
  p.hline(0, W - 1, 16, 'dusk');
  // kříž na vrcholu
  p.rect(41, 0, 2, 4, 'fog');
  p.hline(39, 44, 1, 'fog');
  // zdi a sloupy
  p.rect(6, 17, W - 12, H - 17, 'dusk');
  for (let y = 20; y < H; y += 6) for (let x = 6; x < W - 6; x++) if ((x + (y % 12 ? 0 : 5)) % 10 === 0) p.vline(x, y - 5, y - 1, 'ink');
  for (let y = 20; y < H; y += 6) p.hline(6, W - 7, y, 'ink');
  for (const x of [6, 18, W - 24, W - 12]) {
    p.rect(x, 17, 6, H - 17, 'slate');
    p.vline(x, 17, H - 1, 'fog');
    p.vline(x + 5, 17, H - 1, 'ink');
  }
  // dveře (tmavý oblouk)
  p.rect(32, 28, 20, H - 28, 'ink');
  p.ellipse(41.5, 28, 10, 6, 'ink');
  p.rect(33, 30, 18, H - 30, 'coal');
  p.vline(41, 28, H - 1, 'ink');
  p.set(39, 40, 'gold');
  p.set(44, 40, 'gold');
  // nápis nad dveřmi
  p.rect(30, 19, 24, 4, 'fog');
  for (let x = 32; x < 52; x += 3) p.set(x, 21, 'ink');
  // břečťan
  for (let y = 18; y < H; y++) if ((y * 7) % 5 < 3) p.set(8 + ((y * 3) % 4), y, (y % 3 ? 'pine' : 'green') as PalKey);
  for (let y = 22; y < H; y++) if ((y * 5) % 7 < 3) p.set(W - 10 + ((y * 2) % 3), y, 'pine');
  return p.outline('ink');
}

function coffin(open: boolean): PixelCanvas {
  const p = new PixelCanvas(30, 14);
  // tělo rakve (z boku, šestiúhelník)
  for (let y = 4; y < 13; y++) p.hline(1, 28, y, 'blood');
  p.hline(1, 28, 12, 'maroon');
  p.hline(1, 28, 4, 'rust');
  for (const x of [5, 24]) p.rect(x, 7, 2, 3, 'gold');
  if (open) {
    // víko odsunuté nakřivo, uvnitř rudý samet
    p.rect(3, 3, 24, 3, 'scarlet');
    p.hline(3, 26, 3, 'red');
    for (let x = 0; x < 30; x++) p.set(x, Math.floor(x / 10), 'maroon');
  } else {
    p.rect(1, 1, 28, 3, 'maroon');
    p.hline(2, 27, 1, 'red');
    p.vline(14, 1, 3, 'gold');
    p.hline(13, 15, 2, 'gold');
  }
  return p.outline('ink');
}

function sombrero(): PixelCanvas {
  const p = new PixelCanvas(18, 8);
  p.ellipse(8.5, 5.5, 8.5, 2, 'sand');
  p.hline(1, 16, 6, 'ochre');
  p.rect(6, 1, 6, 4, 'sand');
  p.hline(7, 10, 0, 'sand');
  p.hline(6, 11, 4, 'scarlet');
  p.set(7, 4, 'green');
  p.set(10, 4, 'green');
  return p.outline('ink');
}

function guitar(): PixelCanvas {
  const p = new PixelCanvas(16, 7);
  p.ellipse(4, 3.5, 3.5, 3, 'copper');
  p.ellipse(8, 3.5, 2.5, 2.5, 'copper');
  p.set(5, 3, 'ink');
  p.set(5, 4, 'ink');
  p.hline(9, 14, 3, 'olive');
  p.rect(14, 2, 2, 3, 'rust');
  p.hline(3, 14, 3, 'bone');
  return p.outline('ink');
}

function shovel(): PixelCanvas {
  const p = new PixelCanvas(7, 16);
  p.vline(3, 0, 10, 'copper');
  p.hline(2, 4, 0, 'olive');
  p.rect(1, 10, 5, 5, 'fog');
  p.vline(1, 10, 14, 'bone');
  p.hline(2, 4, 15, 'slate');
  return p.outline('ink');
}

function dogSkull(): PixelCanvas {
  const p = new PixelCanvas(10, 7);
  p.ellipse(3, 3, 3, 2.5, 'bone');
  p.rect(5, 2, 4, 3, 'bone');
  p.set(2, 2, 'ink');
  p.set(7, 4, 'ink');
  p.hline(5, 8, 5, 'fog');
  p.set(1, 0, 'bone');
  return p.outline('ink');
}

function wine(): PixelCanvas {
  const p = new PixelCanvas(6, 14);
  p.rect(2, 0, 2, 1, 'scarlet');
  p.rect(2, 1, 2, 4, 'ink');
  p.rect(1, 5, 4, 9, 'ink');
  p.rect(1, 7, 4, 4, 'blood');
  p.rect(2, 8, 2, 2, 'bone');
  p.set(2, 6, 'plum');
  return p.outline('ink');
}

/** Kovaná hřbitovní mříž ve zdi (vchod na hřbitov). */
function graveGate(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(0, 0, 16, 16, 'ink');
  // mlha za mříží
  for (let y = 4; y < 16; y++) for (let x = 1; x < 15; x++) if ((x + y) % 3 === 0) p.set(x, y, 'grave');
  p.ellipse(7.5, 10, 4, 2, 'fog');
  // oblouk a mříže
  for (let x = 0; x < 16; x++) p.set(x, Math.round(3 - Math.sin((x / 15) * Math.PI) * 3), 'slate');
  for (const x of [2, 5, 8, 11, 14]) {
    p.vline(x, 1, 15, 'coal');
    p.set(x, 0, 'slate');
  }
  p.hline(0, 15, 8, 'coal');
  // kříž nahoře
  p.vline(8, 0, 3, 'fog');
  p.hline(7, 9, 1, 'fog');
  return p;
}

/** Těžké dveře do arény Sudokong (sud a lebka opice). */
function arenaDoor(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(0, 0, 16, 16, 'olive');
  for (const x of [0, 5, 10, 15]) p.vline(x, 0, 15, 'ink');
  p.hline(0, 15, 3, 'coal');
  p.hline(0, 15, 12, 'coal');
  for (const x of [2, 13]) {
    p.set(x, 3, 'fog');
    p.set(x, 12, 'fog');
  }
  // znak: sud
  p.rect(5, 5, 6, 6, 'rust');
  p.hline(5, 10, 6, 'coal');
  p.hline(5, 10, 9, 'coal');
  p.set(6, 7, 'copper');
  // klepadlo
  p.set(12, 8, 'gold');
  return p;
}

/** Popraskaná zeď s křížkem z mapy pokladu. */
function secretWall(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const row = Math.floor(y / 4);
      const sx = x + (row % 2) * 4;
      p.set(x, y, y % 4 === 3 || sx % 8 === 0 ? 'ink' : (sx >> 3) % 2 ? 'indigo' : 'navy');
    }
  // praskliny
  for (const [x0, y0, dx] of [[3, 1, 1], [12, 2, -1], [7, 9, 1]]) for (let i = 0; i < 6; i++) p.set(x0 + Math.floor((i * dx) / 2), y0 + i, 'ink');
  // červený křížek
  for (let i = 0; i < 7; i++) {
    p.set(4 + i, 4 + i, 'scarlet');
    p.set(10 - i, 4 + i, 'scarlet');
    p.set(5 + i, 4 + i, 'red');
  }
  return p;
}

/** Kus mapy pokladu (čtvrtka pergamenu). */
function mapPiece(): PixelCanvas {
  const p = new PixelCanvas(10, 9);
  p.rect(0, 0, 10, 9, 'sand');
  p.rect(1, 1, 8, 7, 'bone');
  for (let x = 1; x < 9; x += 2) p.set(x, 4 + (x % 3) - 1, 'rust');
  p.set(7, 2, 'scarlet');
  p.set(6, 3, 'scarlet');
  p.set(8, 3, 'scarlet');
  p.set(0, 8, null);
  p.set(9, 0, null);
  return p.outline('olive');
}

export function buildGraveArt(): Record<string, PixelCanvas> {
  return {
    tomb1: tomb(1), tomb2: tomb(2), tomb3: tomb(3), graveCross: cross(),
    graveMound: mound(false), graveTreasure: mound(true), graveHole: hole(),
    lanternOff: lantern(false), lanternOn: lantern(true),
    raven0: raven(0), raven1: raven(1), raven2: raven(2),
    handOpen: hand(false), handGrab: hand(true),
    crypt: crypt(), coffin: coffin(false), coffinOpen: coffin(true),
    graveGate: graveGate(), arenaDoor: arenaDoor(), secretWall: secretWall(), mapPiece: mapPiece(),
    sombrero: sombrero(), guitar: guitar(), shovel: shovel(), dogSkull: dogSkull(), vampWine: wine(),
  };
}
