import Phaser from 'phaser';
import { PixelCanvas, addCanvasTexture } from './pixel';
import { PalKey } from '../data/palette';

// Grafika UI (nine-slice panely, tlačítka) – kreslí se v 1× a v UI se zvětšuje 3×.

function bevelBox(w: number, h: number, frame: PalKey[], fill: PalKey, nails = false): PixelCanvas {
  // frame: [obrys, světlo, střed, stín]
  const p = new PixelCanvas(w, h);
  const [ol, hi, mid, sh] = frame;
  p.rect(0, 0, w, h, ol);
  p.rect(1, 1, w - 2, h - 2, mid);
  p.hline(1, w - 2, 1, hi);
  p.vline(1, 1, h - 2, hi);
  p.hline(1, w - 2, h - 2, sh);
  p.vline(w - 2, 1, h - 2, sh);
  p.rect(4, 4, w - 8, h - 8, ol);
  p.rect(5, 5, w - 10, h - 10, fill);
  // rohy zakulatit
  p.set(0, 0, null);
  p.set(w - 1, 0, null);
  p.set(0, h - 1, null);
  p.set(w - 1, h - 1, null);
  if (nails) {
    for (const [x, y] of [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]]) p.set(x, y, 'fog');
  }
  return p;
}

export function buildUI(): Record<string, PixelCanvas> {
  const o: Record<string, PixelCanvas> = {};
  // dřevěná cedule
  const wood = bevelBox(24, 24, ['ink', 'ochre', 'copper', 'rust'], 'olive', true);
  for (let y = 7; y < 18; y += 4) for (let x = 6; x < 18; x++) if ((x + y) % 7 !== 0) wood.set(x, y, 'olive');
  wood.hline(5, 18, 5, 'ink');
  o.panelWood = wood;
  // křídová tabule
  const chalk = bevelBox(24, 24, ['ink', 'copper', 'rust', 'blood'], 'coal', true);
  o.panelChalk = chalk;
  // papír (zažloutlý)
  const paper = new PixelCanvas(24, 24);
  paper.rect(1, 1, 22, 22, 'skin');
  paper.hline(1, 22, 22, 'tan');
  paper.vline(22, 1, 22, 'tan');
  paper.hline(1, 22, 21, 'ochre');
  paper.hline(1, 22, 1, 'white');
  paper.outline('ink');
  paper.set(0, 0, null);
  o.panelPaper = paper;
  // tmavý průhledný podklad HUDu
  o.panelDark = bevelBox(24, 24, ['ink', 'slate', 'dusk', 'ink'], 'ink');
  // tlačítka 16×16 (nine-slice 4px)
  const btn = (body: PalKey, hi: PalKey, sh: PalKey, top: PalKey) => {
    const p = new PixelCanvas(16, 16);
    p.rect(1, 1, 14, 13, body);
    p.hline(2, 13, 1, top);
    p.hline(1, 14, 2, hi);
    p.hline(1, 14, 12, sh);
    p.hline(1, 14, 13, sh);
    p.rect(1, 14, 14, 1, 'ink');
    p.outline('ink');
    p.set(0, 0, null);
    p.set(15, 0, null);
    p.set(0, 15, null);
    p.set(15, 15, null);
    return p;
  };
  o.btn = btn('copper', 'ochre', 'rust', 'sand');
  o.btnHover = btn('ochre', 'sand', 'copper', 'white');
  o.btnOff = btn('slate', 'fog', 'dusk', 'fog');
  o.btnGreen = btn('green', 'mint', 'pine', 'white');
  o.btnRed = btn('red', 'scarlet', 'blood', 'skin');
  // slot pro ikonu
  const slot = new PixelCanvas(16, 16);
  slot.rect(1, 1, 14, 14, 'ink');
  slot.hline(1, 14, 14, 'rust');
  slot.vline(14, 1, 14, 'rust');
  slot.hline(1, 14, 1, 'blood');
  slot.outline('copper');
  o.slot = slot;
  // ukazatel (pozadí / výplň)
  const barBg = new PixelCanvas(8, 6);
  barBg.rect(0, 0, 8, 6, 'ink');
  barBg.rect(1, 1, 6, 4, 'dusk');
  o.barBg = barBg;
  // kartička záložky
  o.tab = btn('rust', 'copper', 'blood', 'copper');
  o.tabOn = btn('olive', 'rust', 'ink', 'ochre');
  // pip na úrovně
  const pip = new PixelCanvas(5, 5);
  pip.rect(1, 1, 3, 3, 'gold');
  pip.set(1, 1, 'sand');
  pip.outline('ink');
  o.pip = pip;
  const pipOff = new PixelCanvas(5, 5);
  pipOff.rect(1, 1, 3, 3, 'dusk');
  pipOff.outline('ink');
  o.pipOff = pipOff;
  return o;
}

// ------------------------------------------------------------ světla a masky
// Světla jsou stupňovité kruhy (pixelový vzhled) v bílé, barví se tintem z palety.
export function buildLights(scene: Phaser.Scene) {
  const steps = (key: string, size: number, nSteps: number, maxA: number, pow = 1.4) => {
    addCanvasTexture(scene, key, size, size, (ctx) => {
      const r = size / 2;
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const d = Math.hypot(x + 0.5 - r, y + 0.5 - r) / r;
          if (d >= 1) continue;
          const t = Math.ceil((1 - Math.pow(d, pow)) * nSteps) / nSteps;
          // ditherování na hranách stupňů
          const dither = (x + y) % 2 === 0 ? 0.5 / nSteps : 0;
          const a = Math.min(1, Math.max(0, t - dither)) * maxA;
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fillRect(x, y, 1, 1);
        }
    });
  };
  steps('light', 64, 5, 1);
  steps('lightSoft', 64, 6, 1, 0.8);
  steps('glow', 32, 4, 1, 1.2);
  // kužel baterky (směr vpravo, počátek vlevo uprostřed)
  addCanvasTexture(scene, 'cone', 128, 128, (ctx) => {
    const ox = 4;
    const oy = 64;
    const n = 5;
    for (let y = 0; y < 128; y++)
      for (let x = 0; x < 128; x++) {
        const dx = x + 0.5 - ox;
        const dy = y + 0.5 - oy;
        const d = Math.hypot(dx, dy) / 122;
        if (d >= 1 || dx <= 0) continue;
        const ang = Math.abs(Math.atan2(dy, dx));
        const edge = 0.62;
        if (ang > edge) continue;
        const angF = 1 - Math.pow(ang / edge, 3);
        const t = Math.ceil(Math.max(0, (1 - Math.pow(d, 1.6)) * angF) * n) / n;
        const dither = (x + y) % 2 === 0 ? 0.5 / n : 0;
        const a = Math.max(0, t - dither);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });
  // vinětace
  addCanvasTexture(scene, 'vignette', 160, 90, (ctx) => {
    for (let y = 0; y < 90; y++)
      for (let x = 0; x < 160; x++) {
        const dx = (x - 80) / 80;
        const dy = (y - 45) / 45;
        const d = Math.sqrt(dx * dx * 0.8 + dy * dy * 0.9);
        const a = Math.max(0, Math.min(1, (d - 0.65) * 1.6));
        const st = Math.round(a * 4) / 4;
        ctx.fillStyle = `rgba(46,34,47,${st * 0.85})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });
  addCanvasTexture(scene, 'px', 2, 2, (ctx) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 2, 2);
  });
}
