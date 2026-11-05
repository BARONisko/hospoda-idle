// Oči za zdí sklepa: místo cihly tmavá díra a z ní kouká něco. Díra (pod tmou) + oči (svítí i ve tmě).
// Sedí na dlaždici čela zdi 16×16 (cihly 8×4, liché řady posunuté o 4 – viz brickFace v tiles.ts).
// Tři varianty: A chybějící cihla, B vylomená díra, C škvíra s víc páry očí.
import { PixelCanvas } from './pixel';
import { PalKey } from '../data/palette';

export type EyesKind = 'A' | 'B' | 'C';
/** Snímky očí: c = kouká rovně, l/r = doleva/doprava, b = mrká (napůl). */
export const EYE_FRAMES = ['c', 'l', 'r', 'b'] as const;
type F = (typeof EYE_FRAMES)[number];

function holeA(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  // cihla ve 2. řadě (x 5–11, y 4–6) chybí, okraje trochu otlučené
  p.rect(5, 4, 7, 3, 'ink');
  p.set(4, 5, 'ink');
  p.set(12, 4, 'ink');
  p.set(11, 7, 'coal');
  p.set(6, 7, 'coal');
  return p;
}

function holeB(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  // vylomené dvě cihly přes sebe: zubatá díra, na kraji drobky malty
  p.rect(5, 4, 7, 3, 'ink');
  p.rect(3, 7, 10, 3, 'ink');
  p.rect(4, 10, 8, 1, 'ink');
  p.set(12, 5, 'ink');
  p.set(2, 8, 'ink');
  p.set(13, 9, 'ink');
  for (const [x, y] of [[4, 4], [11, 3], [2, 9], [13, 8], [5, 11], [10, 11]] as const) p.set(x, y, 'coal');
  p.set(7, 12, 'slate');
  p.set(9, 13, 'slate');
  return p;
}

function holeC(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  // škvíra podél spáry: maltu někdo vyškrábal zevnitř
  for (let x = 1; x < 15; x++) {
    p.set(x, 7, 'ink');
    if (x > 2 && x < 13 && (x * 7) % 5 !== 0) p.set(x, 6, 'ink');
    if ((x * 3) % 4 === 1) p.set(x, 8, 'ink');
  }
  p.set(4, 5, 'ink');
  p.set(11, 9, 'ink');
  p.set(4, 4, 'coal');
  p.set(12, 10, 'coal');
  return p;
}

/** Jedno oko 3 px na šířku: bělmo/duhovka a zornička podle směru pohledu. */
function eye3(p: PixelCanvas, x: number, y: number, f: F, iris: PalKey, glow: PalKey) {
  if (f === 'b') {
    p.hline(x, x + 2, y, glow);
    return;
  }
  p.hline(x, x + 2, y, iris);
  p.set(f === 'l' ? x : f === 'r' ? x + 2 : x + 1, y, 'ink');
}

function eyesA(f: F): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (const ex of [5, 9]) {
    if (f !== 'b') eye3(p, ex, 4, f, 'sand', 'olive');
    eye3(p, ex, 5, f, 'amber', 'olive');
  }
  return p;
}

function eyesB(f: F): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  // velké mandlové oči (4×3) se svislou zorničkou, červené s odleskem
  for (const ex of [3, 9]) {
    if (f === 'b') {
      p.hline(ex, ex + 3, 8, 'blood');
      continue;
    }
    p.hline(ex + 1, ex + 2, 7, 'scarlet');
    p.hline(ex, ex + 3, 8, 'scarlet');
    p.hline(ex + 1, ex + 2, 9, 'red');
    // svislá zornička uvnitř oka; při pohledu stranou jen kratší
    const px = f === 'r' ? ex + 2 : ex + 1;
    p.vline(px, f === 'c' ? 7 : 8, 9, 'ink');
    p.set(f === 'r' ? ex + 1 : ex + 2, 7, 'gold'); // odlesk
    if (f === 'l') p.set(ex, 8, 'blood');
    if (f === 'r') p.set(ex + 3, 8, 'blood');
  }
  return p;
}

function eyesC(f: F): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  // tři páry malých očí ve škvíře, každý pár mrká jindy (c/l/r = který pár zrovna mrká)
  const pairs: [number, number, PalKey][] = [[3, 7, 'ice'], [8, 6, 'mint'], [11, 7, 'ice']];
  pairs.forEach(([x, y, c], i) => {
    const shut = f === 'b' || (f === 'l' && i === 0) || (f === 'r' && i === 2);
    p.set(x, y, shut ? 'grave' : c);
    p.set(x + 2, y, shut ? 'grave' : c);
  });
  return p;
}

export function buildWallEyes(): Record<string, PixelCanvas> {
  const out: Record<string, PixelCanvas> = { eyesHoleA: holeA(), eyesHoleB: holeB(), eyesHoleC: holeC() };
  for (const f of EYE_FRAMES) {
    out[`eyesA_${f}`] = eyesA(f);
    out[`eyesB_${f}`] = eyesB(f);
    out[`eyesC_${f}`] = eyesC(f);
  }
  return out;
}
