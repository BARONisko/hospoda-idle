import { PixelCanvas, hash } from './pixel';
import { PalKey } from '../data/palette';

// Výzdoba pater sklepa: co je namalované na zdech a na zemi (podle tématu patra)
// a kde visí pochodně / lucerny. Pozice jsou deterministické (hash dlaždic), takže
// pozadí i scéna (světla, plameny, živé detaily) se shodnou, aniž by si je předávaly.

const T = 16;
type Theme = 1 | 2 | 3 | 4 | 5;

/** Nálada osvětlení – tři návrhy (A teplé pochodně, B detaily a lucerny, C kontrast). */
export type CellarLook = 'A' | 'B' | 'C';
export const CELLAR_LOOK_DEFAULT: CellarLook = 'A';
export function cellarLook(): CellarLook {
  const w = (globalThis as { CELLAR_LOOK?: CellarLook }).CELLAR_LOOK;
  return w === 'A' || w === 'B' || w === 'C' ? w : CELLAR_LOOK_DEFAULT;
}

/** Barvy kamenné dlažby podle nálady (null = původní). */
export function lookFloorColors(theme: Theme, look: CellarLook): [PalKey, PalKey, PalKey, PalKey] | null {
  if (look === 'A' && theme === 1) return ['slate', 'mauve', 'dusk', 'tan'];
  if (look === 'A' && theme === 3) return ['grave', 'sage', 'coal', 'tan'];
  if (look === 'C' && theme === 1) return ['dusk', 'slate', 'ink', 'mauve'];
  if (look === 'C' && theme === 2) return ['indigo', 'blue', 'navy', 'ice'];
  if (look === 'C' && theme === 3) return ['coal', 'grave', 'ink', 'sage'];
  return null;
}
/** Barvy cihel zdi podle nálady (null = původní). [A, B, odlesk] */
export function lookBrickColors(theme: Theme, look: CellarLook): [PalKey, PalKey, PalKey] | null {
  if (look === 'A' && theme === 1) return ['mauve', 'slate', 'tan'];
  if (look === 'C' && theme === 1) return ['slate', 'dusk', 'mauve'];
  if (look === 'C' && theme === 3) return ['grave', 'coal', 'sage'];
  return null;
}

export interface DecorGrid {
  w: number; h: number; grid: number[][]; terrain?: Uint8Array; theme?: number;
  stairs: { x: number; y: number }; stairsDown?: { x: number; y: number } | null;
  fuse?: { x: number; y: number }; notes?: { x: number; y: number }[]; kegRack?: { x: number; y: number };
  lamps?: { x: number; y: number }[]; floor?: 'sunken' | 'sewer';
}

export type LightKind = 'torch' | 'lantern' | 'lamp' | 'iceLamp' | 'shroom';
export interface WallLight { x: number; y: number; kind: LightKind }
export interface FloorProp { x: number; y: number; kind: string }

const floorAt = (d: DecorGrid, x: number, y: number) => x >= 0 && y >= 0 && x < d.w && y < d.h && d.grid[y][x] === 1;
/** Dlaždice zdi, která je vidět zepředu (pod ní je podlaha). */
const isFace = (d: DecorGrid, x: number, y: number) => x >= 0 && y >= 0 && x < d.w && y < d.h && d.grid[y][x] !== 1 && floorAt(d, x, y + 1);

function reserved(d: DecorGrid) {
  const r = new Set<number>();
  const k = (x: number, y: number) => r.add(y * d.w + x);
  for (const dx of [-1, 0, 1, 2]) {
    k(d.stairs.x + dx, d.stairs.y - 1);
    if (d.stairsDown) k(d.stairsDown.x + dx, d.stairsDown.y - 1);
  }
  if (d.fuse) k(d.fuse.x, d.fuse.y);
  if (d.kegRack) for (const dx of [-1, 0, 1, 2]) k(d.kegRack.x + dx, d.kegRack.y - 1);
  for (const n of d.notes ?? []) k(n.x, n.y - 1);
  for (const l of d.lamps ?? []) for (const dx of [-1, 0, 1]) k(l.x + dx, l.y - 1);
  return r;
}

/** Rozestup světel podle nálady (v dlaždicích). */
const LIGHT_GAP: Record<CellarLook, number> = { A: 5, B: 8, C: 11 };

/** Pochodně a lucerny na zdech (dlaždice zdi zepředu). */
export function cellarWallLights(d: DecorGrid, look: CellarLook): WallLight[] {
  const theme = (d.theme ?? 1) as Theme;
  if (theme === 5 || d.floor) return [];
  const res = reserved(d);
  const gap = LIGHT_GAP[look];
  const out: WallLight[] = [];
  for (let y = 1; y < d.h - 1; y++)
    for (let x = 1; x < d.w - 1; x++) {
      if (!isFace(d, x, y) || res.has(y * d.w + x)) continue;
      if (!isFace(d, x - 1, y) || !isFace(d, x + 1, y)) continue; // ne na samém rohu
      if (hash(x, y, 300 + theme) > 0.45) continue;
      if (out.some((l) => Math.abs(l.x - x) + Math.abs(l.y - y) * 1.5 < gap)) continue;
      const kind: LightKind = theme === 4 ? 'lamp' : theme === 2 ? (hash(x, y, 301) < 0.35 ? 'iceLamp' : 'lantern') : theme === 3 && hash(x, y, 302) < 0.3 ? 'shroom' : hash(x, y, 303) < 0.25 ? 'lantern' : 'torch';
      out.push({ x, y, kind });
    }
  return out;
}

/** Drobnosti u zdí na podlaze (nepřekáží, jen se o ně opírá zeď): pyramidy sudů, lebky se svíčkami… */
export function cellarFloorProps(d: DecorGrid, look: CellarLook): FloorProp[] {
  const theme = (d.theme ?? 1) as Theme;
  if (theme === 5 || d.floor) return [];
  const res = reserved(d);
  const lights = cellarWallLights(d, look);
  const kinds: Record<Theme, string[]> = {
    1: ['dCrates', 'dBottleCrate', 'dCrates'],
    2: ['dIceBlock', 'dIceBlock', 'dBottleCrate'],
    3: ['dSkulls', 'dSkulls', 'dUrn'],
    4: ['dChair', 'dMugs', 'dCrates'],
    5: [],
  };
  const out: FloorProp[] = [];
  for (let y = 1; y < d.h - 1; y++)
    for (let x = 1; x < d.w - 1; x++) {
      if (!isFace(d, x, y) || res.has(y * d.w + x)) continue;
      if (!isFace(d, x - 1, y) || !isFace(d, x + 1, y)) continue;
      if (lights.some((l) => l.y === y && Math.abs(l.x - x) < 2)) continue;
      if (hash(x, y, 320 + theme) > 0.1) continue;
      if (out.some((o) => Math.abs(o.x - x) + Math.abs(o.y - y) < 6)) continue;
      const list = kinds[theme];
      out.push({ x, y, kind: list[Math.floor(hash(x, y, 321) * list.length)] });
    }
  return out;
}

/** Kde ze zdi kape voda (zepředu viditelná zeď). */
export function cellarDrips(d: DecorGrid): { x: number; y: number }[] {
  const theme = (d.theme ?? 1) as Theme;
  if (theme === 5) return [];
  const chance = theme === 3 ? 0.18 : theme === 2 ? 0.05 : 0.07;
  const out: { x: number; y: number }[] = [];
  for (let y = 1; y < d.h - 1; y++)
    for (let x = 1; x < d.w - 1; x++)
      if (isFace(d, x, y) && hash(x, y, 340 + theme) < chance) out.push({ x: x * T + 3 + Math.floor(hash(x, y, 341) * 10), y: y * T + T - 1 });
  return out;
}

/** Krysí díry dole ve zdi (odtud vybíhají krysy a švábi). */
export function cellarRatHoles(d: DecorGrid): { x: number; y: number }[] {
  const theme = (d.theme ?? 1) as Theme;
  if (theme === 5 || d.floor === 'sunken') return [];
  const res = reserved(d);
  const out: { x: number; y: number }[] = [];
  for (let y = 1; y < d.h - 1; y++)
    for (let x = 1; x < d.w - 1; x++)
      if (isFace(d, x, y) && !res.has(y * d.w + x) && hash(x, y, 350 + theme) < 0.07) out.push({ x: x * T + 5 + Math.floor(hash(x, y, 351) * 6), y: y * T + T - 1 });
  return out;
}

// ------------------------------------------------------------- malba do pozadí

/** Drobné písmo 3×5 na nápisy křídou. */
const GLYPHS: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', E: '111100110100111', K: '101101110101101',
  L: '100100100100111', T: '111010010010010', U: '101101101101111', V: '101101101101010', Y: '101101010010010',
  P: '110101110100100', I: '111010010010111', O: '010101101101010', S: '011100010001110', N: '101111111111101',
  D: '110101101101110', '?': '111001010000010', ' ': '000000000000000', '!': '010010010000010',
};
function chalk(p: PixelCanvas, x: number, y: number, text: string, c: PalKey = 'bone') {
  for (const ch of text) {
    const g = GLYPHS[ch];
    if (g) for (let i = 0; i < 15; i++) if (g[i] === '1' && hash(x + (i % 3), y + i, 360) < 0.9) p.set(x + (i % 3), y + Math.floor(i / 3), c);
    x += 4;
  }
}

function crack(p: PixelCanvas, x: number, y: number, len: number, seed: number) {
  for (let i = 0; i < len; i++) {
    p.set(x, y + i, 'ink');
    if (hash(x, y + i, seed) < 0.35) x += hash(x, i, seed + 1) < 0.5 ? -1 : 1;
    if (hash(x, y + i, seed + 2) < 0.12) p.set(x + 1, y + i, 'ink');
  }
}

function faceDecor(p: PixelCanvas, d: DecorGrid, x: number, y: number, theme: Theme) {
  const ox = x * T;
  const oy = y * T;
  const h = hash(x, y, 370 + theme);
  const pick = hash(x, y, 371);
  if (h > 0.3) {
    // drobnosti i na „prázdných“ zdech
    if (hash(x, y, 372) < 0.25) crack(p, ox + 3 + Math.floor(pick * 10), oy + 2, 6 + Math.floor(hash(x, y, 373) * 8), 374);
    if ((theme === 1 || theme === 3) && hash(x, y, 375) < 0.3)
      for (let i = 0; i < 6; i++) p.set(ox + Math.floor(hash(x, i, 376) * 16), oy + 11 + Math.floor(hash(i, y, 377) * 4), hash(i, x, 378) < 0.5 ? 'pine' : 'sage'); // plíseň u země
    if (theme === 2 && hash(x, y, 379) < 0.4) for (let i = 0; i < 16; i++) if (hash(ox + i, oy, 380) < 0.5) p.set(ox + i, oy + 2 + Math.floor(hash(i, y, 381) * 2), 'white'); // jinovatka
    return;
  }
  const kinds: Record<Theme, string[]> = {
    1: ['shelf', 'chain', 'tally', 'vacek', 'shelf', 'roots', 'hooks'],
    2: ['frozenShelf', 'chain', 'tally', 'frost', 'icicles', 'vacek'],
    3: ['niche', 'roots', 'streak', 'chain', 'niche', 'streak', 'tally'],
    4: ['frame', 'board', 'hooks', 'frame', 'shelf', 'vacek'],
    5: [],
  };
  const list = kinds[theme];
  const kind = list[Math.floor(pick * list.length)];
  switch (kind) {
    case 'shelf':
    case 'frozenShelf': {
      // polička s lahvemi
      const ice = kind === 'frozenShelf';
      p.hline(ox + 1, ox + 14, oy + 9, ice ? 'sky' : 'copper');
      p.hline(ox + 1, ox + 14, oy + 10, ice ? 'blue' : 'rust');
      p.set(ox + 2, oy + 11, 'ink');
      p.set(ox + 13, oy + 11, 'ink');
      const cols: PalKey[] = ice ? ['ice', 'bone', 'sky', 'white'] : ['green', 'amber', 'red', 'bone', 'pine', 'mint'];
      for (let i = 0; i < 4; i++) {
        if (hash(x, i, 382) < 0.2) continue;
        const bx = ox + 2 + i * 3;
        const c = cols[Math.floor(hash(x + i, y, 383) * cols.length)];
        const tall = hash(x, y + i, 384) < 0.5;
        p.rect(bx, oy + (tall ? 4 : 6), 2, tall ? 5 : 3, c);
        p.set(bx, oy + (tall ? 3 : 5), 'ink');
        p.set(bx, oy + (tall ? 5 : 7), 'white');
      }
      break;
    }
    case 'chain': {
      // řetěz z háku
      const cx = ox + 4 + Math.floor(hash(x, y, 385) * 8);
      const len = 6 + Math.floor(hash(x, y, 386) * 6);
      p.set(cx, oy + 1, 'fog');
      for (let i = 2; i < len; i++) p.set(cx + (i % 2), oy + i, i % 2 ? 'fog' : 'slate');
      p.rect(cx - 1, oy + len, 3, 2, theme === 2 ? 'ice' : 'slate');
      p.set(cx, oy + len, 'ink');
      break;
    }
    case 'tally': {
      // čárky křídou (někdo tu čekal hodně dlouho)
      const n = 1 + Math.floor(hash(x, y, 387) * 2);
      for (let g = 0; g < n; g++) {
        const gx = ox + 2 + g * 7;
        for (let i = 0; i < 4; i++) p.vline(gx + i, oy + 4, oy + 8, 'bone');
        for (let i = 0; i < 5; i++) p.set(gx - 1 + i, oy + 8 - i, 'white');
      }
      break;
    }
    case 'vacek': {
      // nápis křídou přes víc dlaždic – jen když je zeď dost dlouhá
      const words = ['VACEK TU BYL', 'PIVO', 'KUDY?', 'SUDY!'];
      const word = words[Math.floor(hash(x, y, 388) * words.length)];
      const need = Math.ceil((word.length * 4) / T);
      for (let i = 1; i < need; i++) if (!isFace(d, x + i, y)) return;
      chalk(p, ox + 2, oy + 5, word, theme === 4 ? 'sand' : 'bone');
      break;
    }
    case 'roots': {
      for (let r = 0; r < 2; r++) {
        let rx = ox + 3 + Math.floor(hash(x, y + r, 389) * 10);
        const len = 6 + Math.floor(hash(x + r, y, 390) * 9);
        for (let i = 0; i < len; i++) {
          p.set(rx, oy + i, i < 3 ? 'olive' : 'rust');
          if (hash(rx, i, 391) < 0.3) rx += hash(i, rx, 392) < 0.5 ? -1 : 1;
        }
      }
      break;
    }
    case 'hooks': {
      // věšák s pytlem / šňůrou cibule
      p.hline(ox + 2, ox + 13, oy + 3, 'olive');
      for (const hx of [4, 11]) p.set(ox + hx, oy + 4, 'fog');
      if (theme === 1) {
        p.vline(ox + 4, oy + 5, oy + 11, 'tan');
        for (let i = 6; i < 12; i += 2) p.rect(ox + 3, oy + i, 3, 2, i % 4 ? 'ochre' : 'sand'); // cibule
      } else {
        p.rect(ox + 10, oy + 5, 3, 7, 'maroon'); // kabát
        p.vline(ox + 10, oy + 5, oy + 11, 'blood');
      }
      break;
    }
    case 'frost':
      for (let i = 0; i < 16; i++) for (let j = 0; j < 3 + hash(i, y, 393) * 5; j++) if (hash(ox + i, oy + j, 394) < 0.55) p.set(ox + i, oy + 2 + j, j < 2 ? 'white' : 'ice');
      break;
    case 'icicles':
      for (let i = 1; i < 15; i += 2) p.vline(ox + i, oy + 2, oy + 4 + Math.floor(hash(ox + i, y, 395) * 8), hash(i, y, 396) < 0.4 ? 'white' : 'ice');
      break;
    case 'niche': {
      // výklenek s lebkou (kostnice)
      p.rect(ox + 4, oy + 3, 8, 9, 'ink');
      p.hline(ox + 5, ox + 10, oy + 2, 'ink');
      p.rect(ox + 6, oy + 6, 4, 3, 'bone');
      p.hline(ox + 6, ox + 9, oy + 9, 'fog');
      p.set(ox + 6, oy + 7, 'ink');
      p.set(ox + 9, oy + 7, 'ink');
      p.hline(ox + 4, ox + 11, oy + 12, 'fog');
      if (hash(x, y, 397) < 0.5) {
        p.set(ox + 11, oy + 9, 'bone'); // svíčka vedle lebky
        p.set(ox + 11, oy + 10, 'bone');
        p.set(ox + 11, oy + 8, 'amber');
      }
      break;
    }
    case 'streak': {
      // stékající voda s mechem
      const sx = ox + 4 + Math.floor(hash(x, y, 398) * 8);
      for (let i = 1; i < 15; i++) {
        p.set(sx, oy + i, i % 3 === 0 ? 'sky' : 'blue');
        if (i > 8) p.set(sx + 1, oy + i, 'pine');
        if (i > 11) p.set(sx - 1, oy + i, 'green');
      }
      break;
    }
    case 'frame': {
      // obraz nakřivo
      const fx = ox + 3;
      const fy = oy + 1;
      const tilt = hash(x, y, 399) < 0.5;
      for (let i = 0; i < 10; i++) {
        p.set(fx + i, fy + (tilt ? Math.floor(i / 5) : 0), 'gold');
        p.set(fx + i, fy + 7 + (tilt ? Math.floor(i / 5) : 0), 'ochre');
      }
      for (let j = 0; j < 7; j++) {
        p.set(fx, fy + j, 'gold');
        p.set(fx + 9, fy + j + (tilt ? 1 : 0), 'ochre');
      }
      const c: PalKey = hash(x, y, 400) < 0.5 ? 'pine' : 'navy';
      p.rect(fx + 1, fy + 2, 8, 5, c);
      p.rect(fx + 3, fy + 3, 3, 3, hash(x, y, 401) < 0.5 ? 'skin' : 'mauve'); // portrét / krajina
      break;
    }
    case 'board': {
      // tabule s útratou
      p.rect(ox + 2, oy + 2, 12, 9, 'olive');
      p.rect(ox + 3, oy + 3, 10, 7, 'coal');
      for (let r = 0; r < 3; r++) for (let i = 0; i < 2 + Math.floor(hash(x, r, 402) * 5); i++) p.set(ox + 4 + i * 2, oy + 4 + r * 2, 'bone');
      break;
    }
  }
}

function floorDecor(p: PixelCanvas, d: DecorGrid, x: number, y: number, theme: Theme) {
  const ox = x * T;
  const oy = y * T;
  const h = hash(x, y, 410 + theme);
  if (h > 0.16) return;
  const pick = hash(x, y, 411);
  const px = ox + 3 + Math.floor(hash(x, y, 412) * 9);
  const py = oy + 3 + Math.floor(hash(x, y, 413) * 9);
  const nearWall = !floorAt(d, x, y - 1) || !floorAt(d, x - 1, y) || !floorAt(d, x + 1, y);
  const kinds: Record<Theme, string[]> = {
    1: ['straw', 'straw', 'shards', 'pebbles', 'crack', 'bone', 'cork'],
    2: ['snow', 'snow', 'shards', 'crack', 'frozen'],
    3: ['bones', 'moss', 'moss', 'pebbles', 'crack', 'bones'],
    4: ['cards', 'shards', 'butts', 'crack', 'straw', 'cork'],
    5: [],
  };
  const list = kinds[theme];
  let kind = list[Math.floor(pick * list.length)];
  if ((kind === 'snow' || kind === 'moss') && !nearWall && hash(x, y, 414) < 0.6) kind = 'crack';
  switch (kind) {
    case 'straw':
      for (let i = 0; i < 5; i++) {
        const sx = px + Math.floor(hash(i, x, 415) * 6) - 3;
        const sy = py + Math.floor(hash(y, i, 416) * 4) - 2;
        const c: PalKey = i % 3 ? 'ochre' : 'tan';
        if (hash(i, y, 417) < 0.5) p.hline(sx, sx + 2, sy, c);
        else {
          p.set(sx, sy, c);
          p.set(sx + 1, sy + 1, c);
          p.set(sx + 2, sy + 1, c);
        }
      }
      break;
    case 'shards': {
      const c: PalKey = theme === 4 ? 'bone' : hash(x, y, 418) < 0.5 ? 'green' : 'mint';
      p.set(px, py, c);
      p.set(px + 1, py, 'white');
      p.set(px + 3, py + 1, c);
      p.set(px - 2, py + 2, c);
      p.set(px + 1, py + 3, c);
      break;
    }
    case 'pebbles':
      for (let i = 0; i < 4; i++) {
        const sx = px + Math.floor(hash(i, x, 419) * 8) - 4;
        const sy = py + Math.floor(hash(y, i, 420) * 6) - 3;
        p.set(sx, sy, 'fog');
        p.set(sx + 1, sy, 'slate');
        p.set(sx, sy + 1, 'ink');
      }
      break;
    case 'crack':
      for (let i = 0, cx = px - 3, cy = py; i < 8; i++) {
        p.set(cx, cy, 'ink');
        cx++;
        if (hash(cx, cy, 421) < 0.4) cy += hash(cy, cx, 422) < 0.5 ? -1 : 1;
      }
      break;
    case 'bone':
    case 'bones':
      p.hline(px - 2, px + 2, py, 'bone');
      p.set(px - 3, py - 1, 'bone');
      p.set(px - 3, py + 1, 'bone');
      p.set(px + 3, py - 1, 'bone');
      p.set(px + 3, py + 1, 'bone');
      p.hline(px - 2, px + 2, py + 1, 'fog');
      if (kind === 'bones' && hash(x, y, 423) < 0.4) {
        // lebka
        p.rect(px + 4, py - 4, 4, 3, 'bone');
        p.set(px + 5, py - 3, 'ink');
        p.set(px + 7, py - 3, 'ink');
        p.hline(px + 5, px + 6, py - 1, 'fog');
      }
      break;
    case 'cork':
      p.rect(px, py, 2, 2, 'tan');
      p.set(px, py, 'ochre');
      p.set(px + 4, py + 2, 'gold'); // víčko
      p.set(px + 5, py + 2, 'amber');
      break;
    case 'snow':
      for (let i = 0; i < 7; i++) p.set(px + Math.floor(hash(i, x, 424) * 8) - 4, py + Math.floor(hash(y, i, 425) * 5) - 2, i % 3 ? 'white' : 'bone');
      break;
    case 'frozen':
      p.ellipse(px, py, 4, 2, 'ice');
      p.hline(px - 2, px, py - 1, 'white');
      break;
    case 'moss':
      for (let i = 0; i < 12; i++) p.set(px + Math.floor(hash(i, x, 426) * 8) - 4, py + Math.floor(hash(y, i, 427) * 5) - 2, i % 3 ? 'pine' : 'green');
      break;
    case 'cards':
      p.rect(px, py, 3, 4, 'white');
      p.set(px + 1, py + 1, 'red');
      p.rect(px + 3, py + 2, 4, 3, 'bone');
      p.set(px + 4, py + 3, 'ink');
      break;
    case 'butts':
      p.hline(px, px + 1, py, 'bone');
      p.set(px + 2, py, 'ochre');
      p.hline(px + 4, px + 5, py + 3, 'bone');
      p.set(px + 3, py + 3, 'ochre');
      p.set(px + 1, py - 2, 'slate'); // popel
      break;
  }
}

/** Krysí díra a držák pochodně do už nakreslené zdi. */
function ratHole(p: PixelCanvas, x: number, y: number) {
  p.rect(x - 2, y - 3, 5, 3, 'ink');
  p.hline(x - 1, x + 1, y - 4, 'ink');
  p.set(x - 3, y - 1, 'coal');
  p.set(x + 3, y - 1, 'coal');
}

function lightBracket(p: PixelCanvas, l: WallLight) {
  const ox = l.x * T;
  const oy = l.y * T;
  if (l.kind === 'torch') {
    // železný kruh a hůl
    p.rect(ox + 6, oy + 9, 4, 2, 'slate');
    p.hline(ox + 6, ox + 9, oy + 9, 'fog');
    p.vline(ox + 7, oy + 5, oy + 12, 'olive');
    p.vline(ox + 8, oy + 5, oy + 12, 'rust');
    p.rect(ox + 6, oy + 3, 4, 3, 'ink'); // ohořelý konec
    // osmahnutá zeď nad pochodní
    for (let i = 0; i < 10; i++) if (hash(ox + i, oy, 430) < 0.5) p.set(ox + 3 + i, oy + Math.floor(hash(i, oy, 431) * 3), 'ink');
  } else if (l.kind === 'shroom') {
    // svítící houby na trouchnivém trámu
    p.hline(ox + 1, ox + 14, oy + 12, 'olive');
    p.hline(ox + 1, ox + 14, oy + 13, 'ink');
    for (const [hx, hy] of [[4, 10], [7, 9], [11, 10]] as const) {
      p.vline(ox + hx, oy + hy + 1, oy + 11, 'bone');
      p.hline(ox + hx - 1, ox + hx + 1, oy + hy, 'mint');
      p.set(ox + hx, oy + hy - 1, 'mint');
    }
  } else {
    // háček na lucernu / lampu
    p.hline(ox + 6, ox + 10, oy + 2, 'slate');
    p.vline(ox + 8, oy + 2, oy + 4, 'fog');
  }
}

/** Domaluje výzdobu do pozadí patra (volá drawCellarBackground po dlaždicích a stínech). */
export function decorateCellar(p: PixelCanvas, d: DecorGrid, look: CellarLook) {
  const theme = (d.theme ?? 1) as Theme;
  if (theme === 5 || d.floor) return;
  const res = reserved(d);
  for (let y = 1; y < d.h - 1; y++)
    for (let x = 1; x < d.w - 1; x++) {
      if (isFace(d, x, y)) {
        if (!res.has(y * d.w + x)) faceDecor(p, d, x, y, theme);
      } else if (floorAt(d, x, y) && !(d.terrain?.[y * d.w + x] ?? 0)) floorDecor(p, d, x, y, theme);
    }
  for (const h of cellarRatHoles(d)) ratHole(p, h.x, h.y);
  for (const l of cellarWallLights(d, look)) {
    // pod světlem ať není jiná výzdoba – přemaluj dlaždici zdi znovu jen držákem
    lightBracket(p, l);
  }
}

// ------------------------------------------------------------- sprity (obj atlas)

function flame(f: number, blue = false): PixelCanvas {
  const p = new PixelCanvas(7, 10);
  const sway = [0, 1, -1][f % 3];
  const [c1, c2, c3]: PalKey[] = blue ? ['sky', 'ice', 'white'] : ['red', 'amber', 'gold'];
  p.ellipse(3, 7, 3, 2.5, c1);
  p.ellipse(3 + sway * 0.5, 5, 2.2, 2.6, c2);
  p.rect(3 + sway, 1 + (f % 2), 1, 3, c2);
  p.ellipse(3, 6, 1.2, 1.6, c3);
  p.set(3, 7, 'white');
  return p;
}

function lantern(kind: 'lantern' | 'lamp' | 'iceLamp'): PixelCanvas {
  const p = new PixelCanvas(8, 12);
  const metal: PalKey = kind === 'lamp' ? 'gold' : 'slate';
  const glass: PalKey = kind === 'iceLamp' ? 'ice' : 'sand';
  p.vline(4, 0, 1, 'fog');
  p.hline(2, 5, 2, metal);
  p.rect(1, 3, 6, 7, metal);
  p.rect(2, 4, 4, 5, glass);
  p.rect(3, 5, 2, 3, kind === 'iceLamp' ? 'white' : 'gold');
  p.hline(1, 6, 10, metal);
  p.hline(2, 5, 11, 'ink');
  if (kind === 'lamp') p.set(4, 3, 'ochre');
  return p.outline('ink');
}

function kegPile(frozen = false): PixelCanvas {
  const p = new PixelCanvas(26, 22);
  const keg = (cx: number, cy: number) => {
    p.ellipse(cx, cy, 5, 5, frozen ? 'blue' : 'rust');
    p.ellipse(cx, cy, 3.5, 3.5, frozen ? 'sky' : 'copper');
    p.ellipse(cx, cy, 1.5, 1.5, frozen ? 'blue' : 'rust');
    p.set(cx - 2, cy - 2, frozen ? 'white' : 'ochre');
  };
  keg(6, 16);
  keg(13, 16);
  keg(20, 16);
  keg(9.5, 7);
  keg(16.5, 7);
  if (frozen) for (let x = 2; x < 24; x += 3) p.vline(x, 20, 21, 'ice');
  return p.outline('ink');
}

function crates(): PixelCanvas {
  const p = new PixelCanvas(22, 22);
  const box = (x: number, y: number, w: number, h: number) => {
    p.rect(x, y, w, h, 'copper');
    p.rect(x + 1, y + 1, w - 2, h - 2, 'rust');
    for (let i = 1; i < w - 1; i++) p.set(x + i, y + 1 + Math.floor(((h - 3) * i) / (w - 2)), 'copper');
    p.hline(x, x + w - 1, y, 'ochre');
  };
  box(1, 10, 11, 11);
  box(11, 12, 10, 9);
  box(5, 1, 10, 9);
  return p.outline('ink');
}

function bottleCrate(): PixelCanvas {
  const p = new PixelCanvas(16, 14);
  for (let i = 0; i < 4; i++) {
    const c: PalKey = (['green', 'pine', 'amber', 'green'] as PalKey[])[i];
    p.rect(2 + i * 3, 1, 2, 7, c);
    p.set(2 + i * 3, 0, 'ink');
    p.set(2 + i * 3, 3, 'white');
  }
  p.rect(0, 6, 16, 8, 'rust');
  p.hline(0, 15, 6, 'ochre');
  p.hline(0, 15, 9, 'copper');
  p.rect(5, 10, 6, 2, 'bone'); // nálepka
  return p.outline('ink');
}

function iceBlock(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(1, 3, 14, 12, 'sky');
  p.rect(2, 4, 12, 10, 'ice');
  p.rect(1, 1, 14, 3, 'white');
  p.vline(3, 5, 12, 'white');
  p.set(9, 8, 'blue');
  p.set(10, 9, 'blue');
  p.rect(6, 7, 3, 4, 'blue'); // zamrzlá ryba / láhev uvnitř
  p.set(7, 6, 'navy');
  return p.outline('ink');
}

function skulls(): PixelCanvas {
  const p = new PixelCanvas(20, 16);
  const skull = (x: number, y: number) => {
    p.rect(x, y, 5, 4, 'bone');
    p.hline(x + 1, x + 3, y + 4, 'fog');
    p.set(x + 1, y + 2, 'ink');
    p.set(x + 3, y + 2, 'ink');
  };
  skull(1, 10);
  skull(7, 11);
  skull(13, 10);
  skull(4, 5);
  skull(10, 5);
  // svíčka nahoře
  p.rect(8, 0, 2, 5, 'bone');
  p.set(8, 0, 'white');
  p.vline(10, 3, 5, 'fog'); // stékající vosk
  return p.outline('ink');
}

function urn(): PixelCanvas {
  const p = new PixelCanvas(12, 16);
  p.ellipse(6, 10, 5, 5, 'mauve');
  p.rect(3, 2, 6, 4, 'mauve');
  p.hline(2, 9, 2, 'tan');
  p.ellipse(6, 10, 3, 3, 'slate');
  p.set(4, 8, 'tan');
  p.hline(3, 8, 15, 'ink');
  return p.outline('ink');
}

function chair(): PixelCanvas {
  // převrácená židle
  const p = new PixelCanvas(18, 14);
  p.rect(1, 8, 14, 3, 'rust');
  p.hline(1, 14, 8, 'copper');
  p.vline(3, 2, 7, 'rust');
  p.vline(12, 2, 7, 'rust');
  p.hline(3, 12, 3, 'copper');
  p.rect(14, 10, 3, 2, 'blood');
  p.vline(4, 11, 13, 'blood');
  return p.outline('ink');
}

function mugs(): PixelCanvas {
  const p = new PixelCanvas(18, 12);
  const mug = (x: number, y: number, broken: boolean) => {
    p.rect(x, y, 5, 6, 'bone');
    p.vline(x, y, y + 5, 'white');
    p.rect(x + 5, y + 1, 2, 3, 'fog');
    p.hline(x, x + 4, y, broken ? 'ink' : 'sand');
    if (broken) p.set(x + 3, y + 1, 'ink');
  };
  mug(1, 5, false);
  mug(9, 3, true);
  p.set(16, 10, 'bone');
  p.set(15, 11, 'fog');
  return p.outline('ink');
}

export function buildCellarDecorArt(): Record<string, PixelCanvas> {
  return {
    dFlame0: flame(0), dFlame1: flame(1), dFlame2: flame(2),
    dFlameB0: flame(0, true), dFlameB1: flame(1, true), dFlameB2: flame(2, true),
    dLantern: lantern('lantern'), dLamp: lantern('lamp'), dIceLamp: lantern('iceLamp'),
    dKegPile: kegPile(), dKegFrozen: kegPile(true), dCrates: crates(), dBottleCrate: bottleCrate(),
    dIceBlock: iceBlock(), dSkulls: skulls(), dUrn: urn(), dChair: chair(), dMugs: mugs(),
  };
}
