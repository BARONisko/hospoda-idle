import { PixelCanvas } from './pixel';
import { PalKey } from '../data/palette';

// Ikony zbraní z vylepšení „Zbraň“, které nejsou v atlasu „obj“ (16×16, atlas „weapons“).

const handle = (p: PixelCanvas, x0: number, y0: number, x1: number, y1: number, c: PalKey = 'ochre') => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    const y = Math.round(y0 + ((y1 - y0) * i) / n);
    p.set(x, y, c);
    p.set(x + 1, y, i % 3 ? c : 'copper');
  }
};

/** Rozbitá láhev: hrdlo dole vlevo, zubaté střepy nahoře. */
function brokenBottle(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const c1: PalKey = 'green';
  handle(p, 2, 14, 5, 11, 'mint');
  for (let i = 0; i < 6; i++) p.ellipse(7 + i * 0.8, 9 - i * 0.9, 2.6, 2.6, c1);
  p.set(9, 3, c1);
  p.set(12, 2, c1);
  p.set(13, 5, c1);
  p.set(11, 4, 'white');
  p.set(8, 8, 'white');
  p.outline('ink');
  return p;
}

/** Ulomená mosazná pípa. */
function brokenTap(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(5, 3, 4, 10, 'gold');
  p.vline(5, 3, 12, 'sand');
  p.rect(9, 5, 4, 2, 'amber');
  p.rect(4, 1, 6, 2, 'ink');
  p.set(12, 8, 'amber');
  p.set(12, 10, 'scarlet');
  p.outline('ink');
  return p;
}

export function buildWeaponIcons(): Record<string, PixelCanvas> {
  return { w_bottle: brokenBottle(), w_tap: brokenTap() };
}
