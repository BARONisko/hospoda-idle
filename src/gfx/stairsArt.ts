import type { PixelCanvas } from './pixel';
import type { PalKey } from '../data/palette';

// Schody ve sklepě (2 dlaždice široké): stupně v perspektivě mizí do klenutého otvoru ve zdi nad nimi.
// Nahoru = nahoře teplé světlo z hospody, dolů = stupně tmavnou do černa. Materiál podle patra:
// dřevo (sudový sklep), kámen (ležácký, katakomby, hřbitov), cihla (hospoda pod hospodou).

export type StairsMat = 'stone' | 'wood' | 'brick';

const STEPS = 7;

/** Barvy stupňů od nejbližšího (dole) po nejvzdálenější (v otvoru). */
function ramp(mat: StairsMat, up: boolean): { tread: PalKey[]; riser: PalKey[] } {
  if (!up) {
    return mat === 'wood'
      ? { tread: ['copper', 'rust', 'rust', 'maroon', 'dusk', 'ink', 'ink'], riser: ['rust', 'maroon', 'maroon', 'dusk', 'ink', 'ink', 'ink'] }
      : { tread: ['fog', 'slate', 'slate', 'dusk', 'navy', 'ink', 'ink'], riser: ['slate', 'dusk', 'dusk', 'navy', 'ink', 'ink', 'ink'] };
  }
  return mat === 'wood'
    ? { tread: ['rust', 'rust', 'copper', 'copper', 'ochre', 'amber', 'gold'], riser: ['maroon', 'maroon', 'rust', 'rust', 'copper', 'ochre', 'amber'] }
    : { tread: ['slate', 'slate', 'fog', 'fog', 'tan', 'sand', 'sand'], riser: ['dusk', 'dusk', 'slate', 'slate', 'mauve', 'tan', 'ochre'] };
}

/** Schody na pozici (sx, sy) = levý horní roh dvou dlaždic; zasahují 14 px do zdi nad sebou. */
export function drawStairs(p: PixelCanvas, sx: number, sy: number, up: boolean, mat: StairsMat) {
  const { tread, riser } = ramp(mat, up);
  const set = (x: number, y: number, c: PalKey) => p.set(sx + x, sy + y, c);
  const hl = (x0: number, x1: number, y: number, c: PalKey) => p.hline(sx + x0, sx + x1, sy + y, c);
  // otvor ve zdi (klenba) – uvnitř tma, nahoru se v něm svítí z hospody
  for (let y = -12; y < 0; y++) {
    const cut = y === -12 ? 3 : y === -11 ? 1 : 0;
    hl(5 + cut, 26 - cut, y, 'ink');
  }
  if (up) {
    hl(9, 22, -12, 'amber');
    hl(7, 24, -11, 'ochre');
    hl(6, 25, -10, 'rust');
  } else {
    hl(9, 22, -12, 'plum');
    hl(7, 24, -11, 'navy');
  }
  // stupně: každý 4 px (2 px nášlap, 1 px čelo, 1 px stín), čím dál, tím užší
  for (let k = 0; k < STEPS; k++) {
    const y0 = 12 - k * 4;
    const inset = 2 + k;
    const x0 = inset;
    const x1 = 31 - inset;
    if (y0 < -9 && up) continue; // nejvyšší stupeň schová záře
    hl(x0, x1, y0, tread[k]);
    hl(x0, x1, y0 + 1, tread[k]);
    hl(x0, x1, y0 + 2, riser[k]);
    hl(x0, x1, y0 + 3, 'ink');
    // hrana nášlapu je světlejší, ošlapaný střed taky
    if (k < 5) {
      hl(x0 + 1, x1 - 1, y0, up || k < 2 ? (mat === 'wood' ? 'ochre' : 'fog') : tread[k]);
      if (k < 3) hl(14 - k, 17 + k, y0 + 1, mat === 'wood' ? 'copper' : up ? 'fog' : 'slate');
    }
    if (mat === 'wood') {
      // prkna: spáry a hřebíky
      for (const fx of [9, 16, 23]) if (fx > x0 && fx < x1) set(fx, y0 + 1, 'maroon');
      if (k < 4) { set(x0 + 1, y0 + 1, 'tan'); set(x1 - 1, y0 + 1, 'tan'); }
    } else if (k < 4) {
      // kámen: spáry mezi kvádry, na střídačku
      const off = k % 2 ? 7 : 3;
      for (let fx = x0 + off; fx < x1; fx += 9) set(fx, y0 + 1, riser[k]);
      set(fx0(x0, k), y0 + 2, 'ink');
    }
  }
  // boční zídky šachty (trojúhelník mimo stupně) a zábradlí po stranách
  const side: PalKey = mat === 'wood' ? 'maroon' : mat === 'brick' ? 'maroon' : 'dusk';
  const sideHi: PalKey = mat === 'wood' ? 'rust' : mat === 'brick' ? 'rust' : 'slate';
  for (let y = 0; y < 16; y++) {
    const k = Math.floor((15 - y) / 4) + 0;
    const inset = 2 + k;
    for (let x = 0; x < inset; x++) {
      const c: PalKey = x === inset - 1 ? 'ink' : mat === 'brick' && (x + (y % 4 < 2 ? 0 : 2)) % 4 === 0 ? 'ink' : (x + y) % 5 === 0 ? sideHi : side;
      set(x, y, c);
      set(31 - x, y, c);
    }
    if (y % 4 === 0) { set(0, y, sideHi); set(31, y, sideHi); }
  }
  // zábradlí: sloupky na hranách stupňů a madlo šikmo nahoru k otvoru
  const rail: PalKey = mat === 'stone' ? 'slate' : 'rust';
  const railHi: PalKey = mat === 'stone' ? 'fog' : 'copper';
  for (let k = 0; k < 4; k++) {
    const y0 = 12 - k * 4;
    const x = 1 + k;
    for (const [px, dir] of [[x, 1], [31 - x, -1]] as const) {
      set(px, y0 - 1, rail);
      set(px, y0 - 2, rail);
      set(px, y0 - 3, railHi);
      if (k < 3) set(px + dir, y0 - 5, railHi);
    }
  }
  // rám otvoru
  if (mat === 'wood') {
    // trámy a překlad s hřebíky
    for (const x of [3, 4, 27, 28]) for (let y = -14; y < 1; y++) set(x, y, x === 3 || x === 27 ? 'copper' : 'rust');
    for (const y of [-14, -13]) hl(3, 28, y, y === -14 ? 'copper' : 'rust');
    hl(3, 28, -15, 'ink');
    hl(5, 26, -12 + 0, 'ink');
    for (const x of [5, 15, 26]) set(x, -14, 'tan');
    set(4, -5, 'tan');
    set(28, -5, 'tan');
  } else {
    // klenba z kvádrů / cihel se svorníkem
    const a: PalKey = mat === 'brick' ? 'rust' : 'fog';
    const b: PalKey = mat === 'brick' ? 'maroon' : 'slate';
    for (let y = -11; y < 1; y++) {
      const c = Math.floor((y + 12) / 3) % 2 ? a : b;
      set(4, y, c); set(3, y, c);
      set(27, y, c); set(28, y, c);
      if ((y + 12) % 3 === 0) { set(3, y, 'ink'); set(28, y, 'ink'); }
    }
    for (let x = 5; x <= 26; x++) {
      const yy = x < 8 || x > 23 ? -12 : -13;
      const c = Math.floor((x - 5) / 3) % 2 ? a : b;
      set(x, yy, c);
      set(x, yy - 1, c);
      if ((x - 5) % 3 === 0) set(x, yy - 1, 'ink');
    }
    set(4, -12, b); set(27, -12, b);
    // svorník
    hl(14, 17, -15, 'ink');
    hl(14, 17, -14, mat === 'brick' ? 'copper' : 'bone');
    hl(14, 17, -13, mat === 'brick' ? 'copper' : 'bone');
    hl(15, 16, -12, mat === 'brick' ? 'rust' : 'fog');
  }
}

/** Kde je na kamenném stupni stinná spára v čele (pro trochu nepravidelnosti). */
function fx0(x0: number, k: number) {
  return x0 + 5 + ((k * 7) % 11);
}

/** Materiál schodů podle tématu patra. */
export function stairsMat(theme: number): StairsMat {
  return theme === 1 ? 'wood' : theme === 4 ? 'brick' : 'stone';
}
