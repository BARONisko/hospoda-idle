import { PixelCanvas } from './pixel';
import { PalKey } from '../data/palette';

// Nalezené zbraně a talismany (atlas „weapons“, 16×16; rukojeť vlevo dole, jako ostatní zbraně).

function line(p: PixelCanvas, x0: number, y0: number, x1: number, y1: number, c: PalKey, w = 1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    const y = Math.round(y0 + ((y1 - y0) * i) / n);
    for (let k = 0; k < w; k++) p.set(x + k, y, c);
  }
}

function cleaver(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  line(p, 2, 14, 6, 10, 'rust', 2);
  p.set(3, 13, 'bone');
  p.rect(6, 2, 8, 8, 'fog');
  p.rect(7, 3, 6, 6, 'bone');
  p.hline(6, 13, 2, 'white');
  p.vline(13, 3, 9, 'slate');
  p.set(8, 4, 'ink'); // dírka na pověšení
  p.set(11, 7, 'scarlet');
  return p.outline('ink');
}

function cue(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  line(p, 1, 15, 4, 12, 'ink', 2);
  line(p, 4, 12, 9, 7, 'copper', 2);
  line(p, 9, 7, 14, 2, 'sand', 1);
  p.set(14, 1, 'sky'); // modrá křída
  p.set(15, 1, 'sky');
  p.set(2, 13, 'gold');
  return p.outline('ink');
}

function sausage(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let i = 0; i < 9; i++) p.ellipse(3 + i * 1.2, 13 - i * 1.2, 2.4, 2.4, i % 3 === 0 ? 'red' : 'blood');
  for (let i = 1; i < 8; i++) p.set(4 + i, 11 - i, 'scarlet');
  // jinovatka
  for (const [x, y] of [[5, 10], [8, 7], [11, 4], [12, 6], [7, 11]] as const) p.set(x, y, 'ice');
  p.set(14, 2, 'tan'); // provázek
  p.set(15, 1, 'tan');
  return p.outline('ink');
}

function pin(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  line(p, 1, 15, 3, 13, 'copper', 2);
  for (let i = 0; i < 7; i++) p.ellipse(5 + i * 1.2, 11 - i * 1.2, 2.2, 2.2, 'sand');
  for (let i = 0; i < 6; i++) p.set(5 + i, 9 - i, 'bone');
  line(p, 13, 3, 15, 1, 'copper', 1);
  p.set(8, 9, 'white'); // mouka
  return p.outline('ink');
}

function pan(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  line(p, 1, 15, 6, 10, 'ink', 2);
  p.ellipse(10, 6, 5, 5, 'coal');
  p.ellipse(10, 6, 3.5, 3.5, 'dusk');
  p.set(9, 4, 'slate');
  p.set(8, 5, 'slate');
  p.ellipse(11, 7, 1.5, 1, 'gold'); // zbytek vajíčka
  p.set(11, 7, 'white');
  return p.outline('ink');
}

function hammer(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  line(p, 2, 14, 9, 7, 'ochre', 2);
  line(p, 2, 14, 4, 12, 'rust', 2);
  // hlava kladiva
  for (let i = 0; i < 5; i++) line(p, 6 + i, 3 + i, 9 + i, 0 + i, i === 0 ? 'fog' : 'slate', 1);
  p.set(13, 4, 'red');
  p.set(12, 5, 'red');
  return p.outline('ink');
}

function sudoTap(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  line(p, 2, 14, 7, 9, 'blood', 2);
  p.rect(6, 3, 5, 7, 'gold');
  p.vline(6, 3, 9, 'sand');
  p.rect(10, 5, 4, 2, 'amber');
  p.rect(5, 1, 7, 2, 'ink');
  p.set(8, 2, 'scarlet'); // rudé oko Sudomora
  p.set(13, 8, 'amber');
  p.set(13, 10, 'scarlet');
  p.set(3, 13, 'scarlet');
  return p.outline('ink');
}

function goldMug(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  line(p, 1, 15, 4, 12, 'olive', 2);
  p.rect(5, 3, 7, 9, 'gold');
  p.vline(5, 3, 11, 'sand');
  p.rect(12, 5, 2, 5, 'amber');
  p.set(12, 5, 'ink');
  p.hline(5, 11, 2, 'white'); // pěna
  p.hline(6, 10, 1, 'bone');
  p.set(8, 7, 'amber');
  return p.outline('ink');
}

// ---------------------------------------------------------------- talismany

function horseshoe(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.ellipse(8, 7, 6, 6, 'fog');
  p.ellipse(8, 7, 3.5, 3.5, null as unknown as PalKey);
  p.rect(5, 8, 7, 7, null as unknown as PalKey);
  p.rect(2, 8, 3, 6, 'fog');
  p.rect(11, 8, 3, 6, 'fog');
  for (const [x, y] of [[3, 6], [8, 2], [12, 6], [3, 11], [12, 11]] as const) p.set(x, y, 'ink');
  p.set(5, 3, 'white');
  return p.outline('ink');
}

function tooth(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let x = 2; x < 14; x++) p.set(x, 3 + Math.round(Math.abs(x - 8) * 0.4), 'tan'); // šňůrka
  p.rect(6, 6, 4, 4, 'bone');
  p.rect(7, 10, 2, 3, 'bone');
  p.set(7, 13, 'fog');
  p.vline(6, 6, 9, 'white');
  return p.outline('ink');
}

function cork(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(5, 4, 6, 9, 'tan');
  p.ellipse(8, 4, 3, 1.4, 'ochre');
  for (const [x, y] of [[6, 7], [9, 9], [7, 11], [9, 6]] as const) p.set(x, y, 'olive');
  p.vline(5, 5, 12, 'sand');
  p.set(8, 2, 'scarlet'); // čtyřlístek? ne – mašlička
  p.set(7, 1, 'scarlet');
  p.set(9, 1, 'scarlet');
  return p.outline('ink');
}

function ring(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.ellipse(8, 9, 5, 5, 'gold');
  p.ellipse(8, 9, 3, 3, null as unknown as PalKey);
  p.rect(6, 2, 5, 4, 'amber'); // kámen = kapka piva
  p.rect(7, 3, 3, 2, 'sand');
  p.set(7, 3, 'white');
  p.set(4, 8, 'sand');
  return p.outline('ink');
}

function garlic(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let x = 2; x < 14; x++) p.set(x, 2 + Math.round(Math.abs(x - 8) * 0.3), 'tan');
  p.ellipse(8, 10, 4.5, 4, 'bone');
  p.vline(8, 7, 13, 'fog');
  p.vline(6, 8, 12, 'fog');
  p.vline(10, 8, 12, 'fog');
  p.rect(7, 4, 3, 3, 'sage');
  p.set(5, 9, 'white');
  return p.outline('ink');
}

function feather(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  line(p, 3, 14, 12, 3, 'slate', 1);
  for (let i = 0; i < 8; i++) {
    const x = 5 + i;
    const y = 12 - Math.round(i * 1.2);
    p.set(x - 1, y - 1, 'plum');
    p.set(x + 1, y + 1, 'mauve');
    if (i % 2) p.set(x - 2, y - 2, 'plum');
  }
  return p.outline('ink');
}

function catEye(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let x = 2; x < 14; x++) p.set(x, 2 + Math.round(Math.abs(x - 8) * 0.3), 'tan');
  p.ellipse(8, 10, 5, 4, 'gold');
  p.ellipse(8, 10, 3.5, 3, 'mint');
  p.vline(8, 7, 13, 'ink');
  p.set(6, 8, 'white');
  return p.outline('ink');
}

export function buildLootArt(): Record<string, PixelCanvas> {
  return {
    w_cleaver: cleaver(), w_cue: cue(), w_sausage: sausage(), w_pin: pin(), w_pan: pan(), w_hammer: hammer(),
    w_sudoTap: sudoTap(), w_goldMug: goldMug(),
    c_horseshoe: horseshoe(), c_tooth: tooth(), c_cork: cork(), c_ring: ring(), c_garlic: garlic(), c_feather: feather(), c_catEye: catEye(),
  };
}
