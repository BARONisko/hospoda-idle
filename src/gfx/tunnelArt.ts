import { PixelCanvas } from './pixel';
import { BOAT_FRAMES, BOAT_H, BOAT_KEYS, BOAT_W } from './boatSprite';

// Tunel ve stoce: lodička ze sudu shora i s hostinským a pochodeň na zdi.

/** Pochodeň v železném držáku na vršku zdi (10×16), frame = plamen. */
export function tunnelTorch(frame: number): PixelCanvas {
  const p = new PixelCanvas(10, 16);
  // držák zapuštěný do zdi
  p.rect(1, 9, 8, 2, 'slate');
  p.hline(1, 8, 9, 'fog');
  p.rect(4, 8, 2, 7, 'olive');
  p.vline(4, 8, 14, 'rust');
  // smola a plamen
  p.rect(3, 6, 4, 3, 'ink');
  const f = frame ? 1 : 0;
  p.ellipse(5 - f * 0.5, 4, 2.6, 2.8, 'amber');
  p.ellipse(5 - f * 0.5, 4.5, 1.6, 1.8, 'gold');
  p.set(4 + f, 1, 'amber');
  p.set(5 - f, 0, 'scarlet');
  p.set(5, 5, 'white');
  return p.outline('ink');
}

/** Lodička ze sudu shora i s hostinským (30×46, příď nahoru, boatSprite.ts): lucerna na přídi, kýbl na zádi.
 * frame 0/1 = pádlo nakloněné doleva/doprava (pádlování). */
export function tunnelBoat(frame: number): PixelCanvas {
  const p = new PixelCanvas(BOAT_W, BOAT_H);
  BOAT_FRAMES[frame].forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, BOAT_KEYS[c])));
  return p;
}
