import { PixelCanvas } from './pixel';
import type { PalKey } from '../data/palette';

// Mince (hospoda i sklep): placatá zlatá mince s vroubkovaným okrajem a nápisem COIN.
// 4 snímky otáčení: celá → hrana (při otočení je vidět tloušťka mince).

const FONT: Record<string, string[]> = {
  C: ['111', '100', '100', '100', '111'],
  O: ['111', '101', '101', '101', '111'],
  I: ['1', '1', '1', '1', '1'],
  N: ['101', '111', '111', '111', '101'],
};

function coin(D: number, w: number): PixelCanvas {
  const W = D + 4;
  const p = new PixelCanvas(W, D + 2);
  const r = D / 2;
  const rx = Math.max(0.5, r * w);
  const thick = w < 0.98 ? 2 : 0;
  const cx = r + 1 + thick / 2;
  const cy = r + 1;
  const inEll = (x: number, y: number, ox: number, ex: number, ey: number) => {
    const dx = (x + 0.5 - ox) / ex;
    const dy = (y + 0.5 - cy) / ey;
    return dx * dx + dy * dy <= 1;
  };
  // hrana (tloušťka): posunuté kopie elipsy, vroubkování
  for (let y = 0; y < D + 2; y++)
    for (let x = 0; x < W; x++)
      for (let off = 1; off <= thick; off++) if (inEll(x, y, cx + off, rx, r)) p.set(x, y, y % 2 ? 'copper' : 'ochre');
  // líc: vroubkovaný okraj a zlatý střed
  for (let y = 0; y < D + 2; y++)
    for (let x = 0; x < W; x++) {
      if (!inEll(x, y, cx, rx, r)) continue;
      const inner = rx > 3 && inEll(x, y, cx, rx - 2.2, r - 2.2);
      const ang = Math.atan2((y + 0.5 - cy) / r, (x + 0.5 - cx) / rx);
      p.set(x, y, inner ? 'gold' : ((ang * 16) / Math.PI) % 2 < 1 && ((ang * 16) / Math.PI) % 2 > -1 ? 'amber' : 'ochre');
    }
  // odlesk
  if (w > 0.5) {
    const hx = Math.floor(cx - rx * 0.55);
    const hy = Math.floor(cy - r * 0.55);
    if (p.get(hx, hy) === 'gold') p.set(hx, hy, 'white');
    if (p.get(hx + 1, hy - 1) === 'gold') p.set(hx + 1, hy - 1, 'sand');
    if (p.get(hx, hy + 1) === 'gold') p.set(hx, hy + 1, 'sand');
  }
  // nápis COIN (vyražený: tmavé písmo, světlá hrana nad ním)
  if (w > 0.85) {
    const word = 'COIN';
    const tw = [...word].reduce((s, ch) => s + FONT[ch][0].length, 0) + word.length - 1;
    let x0 = Math.round(cx - tw / 2);
    const y0 = Math.round(cy - 2.5);
    for (const ch of word) {
      const g = FONT[ch];
      g.forEach((row, yy) =>
        [...row].forEach((bit, xx) => {
          if (bit !== '1') return;
          p.set(x0 + xx, y0 + yy, 'olive');
          if (p.get(x0 + xx, y0 + yy - 1) === 'gold') p.set(x0 + xx, y0 + yy - 1, 'sand');
        }),
      );
      x0 += g[0].length + 1;
    }
  }
  return p.outline('olive' as PalKey);
}

export function buildCoinArt(): Record<string, PixelCanvas> {
  const out: Record<string, PixelCanvas> = {};
  [1, 0.75, 0.45, 0.15].forEach((w, i) => {
    out[`pcoin${i}`] = coin(19, w);
    out[`pcoinBig${i}`] = coin(23, w);
  });
  return out;
}

/** Snímek otáčející se mince podle času (s): 0→3→0, druhá půlka zrcadlově. */
export function coinFrame(t: number, big = false): { frame: string; flip: boolean } {
  const SPIN = [0, 1, 2, 3, 2, 1];
  const f = Math.floor(t * 10) % SPIN.length;
  return { frame: `${big ? 'pcoinBig' : 'pcoin'}${SPIN[f]}`, flip: f > 3 };
}
