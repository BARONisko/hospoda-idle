import { PixelCanvas } from './pixel';
import type { PalKey } from '../data/palette';

// Studna u Žabáka (3. dějství): svítí z ní Barva z kosmu (Lovecraft, 1927). Hladina se kreslí zvlášť
// bílou (`wellWater`), ve hře se barví a přelévá. Víko, praskliny v podlaze.
export const WELL = { w: 44, h: 34, cx: 22, top: 18 };

function body(p: PixelCanvas, stone: PalKey, light: PalKey, moss?: PalKey) {
  const { cx, top } = WELL;
  const rx = 13;
  const ry = 5;
  // válec ze zdiva
  for (let y = top; y <= top + 10; y++) p.hline(cx - rx, cx + rx, y, stone);
  p.ellipse(cx, top + 10, rx + 0.5, ry, stone);
  // kameny: spáry
  for (let row = 0; row < 3; row++) {
    const y = top + 3 + row * 4;
    p.hline(cx - rx, cx + rx, y, 'dusk');
    for (let x = cx - rx + (row % 2 ? 2 : 0); x <= cx + rx; x += 5) p.vline(x, y + 1, y + 3, 'dusk');
  }
  for (let x = cx - rx; x <= cx + rx; x += 3) p.set(x, top + 1, light);
  if (moss) for (let i = 0; i < 9; i++) p.set(cx - rx + 1 + ((i * 7) % (rx * 2 - 1)), top + 2 + ((i * 5) % 10), moss);
  // horní obruba a tmavá šachta
  p.ellipse(cx, top, rx + 0.5, ry + 0.5, light);
  p.ellipse(cx, top, rx - 2, ry - 1.5, 'ink');
}

/** Kytka: stonek s lístky a květ 3×3 (okvětí, tmavší rohy, jinak barevný střed). */
function flower(p: PixelCanvas, x: number, y0: number, y1: number, petal: PalKey, dark: PalKey, mid: PalKey) {
  p.vline(x, y1, y0, 'green');
  const m = Math.round((y0 + y1) / 2);
  p.set(x - 1, m + 1, 'mint');
  p.set(x + 1, m + 2, 'mint');
  p.rect(x - 1, y1 - 1, 3, 3, petal);
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) p.set(x + dx, y1 + dy, dark);
  p.set(x, y1, mid);
  p.set(x, y1 - 1, 'white');
}

function flowers(p: PixelCanvas) {
  const { top } = WELL;
  const b = top + 14;
  // trsy listí u paty
  for (const [x, w] of [[1, 8], [35, 8]] as const) {
    p.hline(x, x + w - 1, b, 'pine');
    p.hline(x + 1, x + w - 2, b - 1, 'green');
    for (let i = 0; i < w; i += 2) p.set(x + i, b - 2, 'mint');
  }
  const L: [number, number, PalKey, PalKey, PalKey][] = [
    [2, top - 1, 'scarlet', 'red', 'gold'], [6, top - 6, 'scarlet', 'red', 'sand'], [4, top + 6, 'sand', 'amber', 'scarlet'],
    [8, top + 3, 'scarlet', 'red', 'gold'],
    [36, top + 3, 'scarlet', 'red', 'gold'], [38, top - 5, 'scarlet', 'red', 'sand'], [42, top - 1, 'skin', 'scarlet', 'gold'],
    [40, top + 7, 'scarlet', 'red', 'gold'],
  ];
  for (const [x, y, c, d, m] of L) flower(p, x, b - 1, y, c, d, m);
  // drobné květy v trávě před studnou
  for (const [x, c] of [[10, 'scarlet'], [13, 'gold'], [31, 'scarlet'], [33, 'skin']] as const) {
    p.set(x, b + 1, 'green');
    p.set(x + 1, b + 1, 'mint');
    p.set(x, b, c);
  }
}

export function wellVariant(v: 'A' | 'B' | 'C'): PixelCanvas {
  const p = new PixelCanvas(WELL.w, WELL.h);
  const { cx, top } = WELL;
  if (v === 'A') {
    body(p, 'slate', 'fog', 'sage');
    // sloupky a stříška s rumpálem
    p.vline(cx - 12, 4, top, 'rust');
    p.vline(cx + 12, 4, top, 'rust');
    for (let i = 0; i < 5; i++) p.hline(cx - 14 + i, cx + 14 - i, 4 - i, i % 2 ? 'copper' : 'rust');
    p.hline(cx - 11, cx + 11, 7, 'olive');
    p.vline(cx, 8, top - 2, 'tan');
    p.rect(cx - 2, top - 3, 4, 3, 'copper');
    p.hline(cx - 2, cx + 1, top - 3, 'rust');
  } else if (v === 'B') {
    body(p, 'grave', 'sage', 'green');
    // nízká obruba, kolem záhonek kytek (hlavně červené)
    flowers(p);
  } else {
    body(p, 'dusk', 'slate');
    // rozpadlá: chybí kameny, řetěz a rezavá klika, kost
    p.ellipse(cx + 9, top - 1, 3, 2, null as unknown as PalKey);
    p.rect(cx + 7, top - 2, 6, 3, null);
    for (let y = 6; y < top; y += 2) p.set(cx - 3, y, 'fog');
    for (let y = 7; y < top; y += 2) p.set(cx - 2, y, 'slate');
    p.vline(cx - 13, 8, top, 'rust');
    p.hline(cx - 13, cx - 3, 8, 'rust');
    p.rect(cx - 16, 10, 3, 2, 'copper');
    p.hline(cx + 4, cx + 9, top + 12, 'bone');
    p.set(cx + 3, top + 11, 'bone');
    p.set(cx + 10, top + 13, 'bone');
  }
  return p.outline('ink');
}

/** Hladina (bílá – barví se ve hře). */
export function wellWater(): PixelCanvas {
  const p = new PixelCanvas(WELL.w, WELL.h);
  p.ellipse(WELL.cx, WELL.top + 0.5, 10.5, 3, 'white');
  return p;
}

/** Víko z prken přes šachtu. */
export function wellLid(): PixelCanvas {
  const p = new PixelCanvas(WELL.w, WELL.h);
  const { cx, top } = WELL;
  p.ellipse(cx, top - 1, 12, 4.5, 'copper');
  for (let x = cx - 10; x <= cx + 10; x += 4) p.vline(x, top - 5, top + 3, 'rust');
  p.hline(cx - 9, cx + 9, top - 1, 'olive');
  p.rect(cx - 1, top - 3, 2, 3, 'slate');
  return p.outline('ink');
}

/** Prasklina v podlaze, ze které prosvítá barva (bílé pixely se ve hře barví, obrys zůstane tmavý). */
export function wellCrack(i: number): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const pts = [
    [[2, 8], [5, 7], [7, 9], [10, 8], [13, 10]],
    [[3, 3], [6, 6], [6, 9], [9, 12], [12, 13]],
    [[8, 2], [8, 5], [11, 7], [9, 10], [10, 14]],
  ][i % 3];
  for (let k = 0; k < pts.length - 1; k++) {
    const [x0, y0] = pts[k];
    const [x1, y1] = pts[k + 1];
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= n; s++) p.set(Math.round(x0 + ((x1 - x0) * s) / n), Math.round(y0 + ((y1 - y0) * s) / n), 'white');
  }
  return p.outline('ink');
}

export function buildWellArt(variant: 'A' | 'B' | 'C' = 'B'): Record<string, PixelCanvas> {
  return { well: wellVariant(variant), wellWater: wellWater(), wellLid: wellLid(), wellCrack0: wellCrack(0), wellCrack1: wellCrack(1), wellCrack2: wellCrack(2) };
}
