import Phaser from 'phaser';
import { PixelCanvas, addImage, addAtlas, addSheet, hash } from './pixel';
import type { PalKey } from '../data/palette';
import { krigl } from './gateArt';

// Posvícení: večerní náves s kolotočem, stánky, kostelem a žárovičkami; uprostřed střelnice
// s pruhovanou markýzou, třemi lištami terčů a cenami. Scéna kreslí v 320×180 a zvětšuje 4×.

export const FW = 320;
export const FH = 180;
/** lišty terčů (y paty terče) */
export const RAILS = [70, 100, 130];
/** vnitřek budky (x od–do), kde jezdí terče */
export const BOOTH = { x1: 84, x2: 236, top: 38, counter: 142 };

/** Obloha: pruhy bez ditheringu, hvězdy, měsíc. */
function sky(p: PixelCanvas) {
  const bands: [number, PalKey][] = [[0, 'ink'], [22, 'navy'], [52, 'indigo'], [78, 'plum'], [96, 'maroon']];
  for (let y = 0; y < 120; y++) {
    let c: PalKey = 'ink';
    for (const [from, col] of bands) if (y >= from) c = col;
    // zubatý přechod mezi pruhy (pixelový, ne šum)
    for (let x = 0; x < FW; x++) {
      const next = bands.find(([from]) => from > y);
      const edge = next && y >= next[0] - 2 && (x + y * 3) % 7 < (y - next[0] + 3) * 2 ? next[1] : c;
      p.set(x, y, edge);
    }
  }
  for (let i = 0; i < 60; i++) {
    const x = hash(i, 1, 400) * FW;
    const y = hash(i, 2, 400) * 70;
    p.set(x, y, i % 5 ? 'fog' : 'white');
  }
  p.ellipse(282, 20, 9, 9, 'bone');
  p.ellipse(285, 18, 8, 8, 'navy');
  p.set(276, 16, 'white');
}

/** Silueta vesnice: střechy, kostelní věž s křížem, stromy. */
function village(p: PixelCanvas) {
  // stromy
  for (let i = 0; i < 9; i++) {
    const x = 10 + i * 37 + hash(i, 3, 401) * 12;
    const r = 9 + hash(i, 4, 401) * 6;
    p.ellipse(x, 104 - r * 0.6, r, r, 'dusk');
  }
  // domky
  for (let i = 0; i < 7; i++) {
    const x = 4 + i * 48 + hash(i, 5, 402) * 10;
    const w = 26 + hash(i, 6, 402) * 10;
    const h = 14 + hash(i, 7, 402) * 6;
    p.rect(x, 108 - h, w, h, 'ink');
    for (let k = 0; k < w / 2 + 2; k++) p.hline(x - 2 + k, x + w + 1 - k, 108 - h - k, 'ink');
    // rozsvícené okno
    if (i % 2 === 0) {
      p.rect(x + 6, 108 - h + 5, 4, 4, 'sand');
      p.set(x + 8, 108 - h + 5, 'ochre');
      p.vline(x + 8, 108 - h + 5, 108 - h + 8, 'olive');
    }
  }
  // kostel vpravo vzadu
  const cx = 262;
  p.rect(cx - 9, 50, 18, 60, 'ink');
  for (let k = 0; k < 14; k++) p.hline(cx - 9 + Math.floor(k * 0.64), cx + 8 - Math.floor(k * 0.64), 50 - k, 'ink');
  p.vline(cx, 30, 37, 'ink');
  p.hline(cx - 2, cx + 2, 32, 'ink');
  p.ellipse(cx, 60, 3, 3, 'sand'); // hodiny
  p.set(cx, 59, 'ink');
  p.set(cx + 1, 60, 'ink');
  p.rect(cx - 2, 72, 4, 7, 'ochre');
}

/** Žárovičky na drátech přes celou náves (2 snímky blikání). */
function lights(p: PixelCanvas, f: number) {
  const wires: [number, number, number, number][] = [[0, 24, 120, 30], [120, 30, 320, 20], [0, 10, 160, 18]];
  wires.forEach(([x1, y1, x2, y2], wi) => {
    for (let x = x1; x < x2; x++) {
      const t = (x - x1) / (x2 - x1);
      const y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 9;
      p.set(x, y, 'ink');
      if ((x + wi * 3) % 9 === 0) {
        const cols: PalKey[] = ['gold', 'scarlet', 'mint', 'sky', 'sand'];
        const on = (Math.floor(x / 9) + f + wi) % 3 !== 0;
        const c = on ? cols[Math.floor(x / 9 + wi) % cols.length] : 'slate';
        p.set(x, y + 1, c);
        p.set(x, y + 2, c);
        p.set(x - 1, y + 1, on ? 'white' : c);
      }
    }
  });
}

/** Stánek s perníkem vpravo (srdce, koláčky). */
function gingerStall(p: PixelCanvas, x0: number) {
  // markýza
  for (let x = x0; x < x0 + 48; x++) for (let y = 86; y < 94; y++) p.set(x, y, Math.floor((x - x0) / 6) % 2 ? 'white' : 'red');
  for (let x = x0; x < x0 + 48; x += 6) p.ellipse(x + 3, 94, 3, 1.6, Math.floor((x - x0) / 6) % 2 ? 'white' : 'red');
  p.hline(x0, x0 + 47, 86, 'blood');
  // sloupky a pult
  p.vline(x0 + 1, 94, 140, 'rust');
  p.vline(x0 + 46, 94, 140, 'rust');
  p.rect(x0, 120, 48, 20, 'rust');
  p.hline(x0, x0 + 47, 120, 'ochre');
  p.rect(x0 + 2, 96, 44, 24, 'blood');
  // perníková srdce na provázcích
  for (let i = 0; i < 4; i++) {
    const hx = x0 + 8 + i * 10;
    p.vline(hx, 95, 100, 'tan');
    heart(p, hx, 104, 4, 'copper');
  }
  // koláčky na pultu
  for (let i = 0; i < 5; i++) {
    p.ellipse(x0 + 6 + i * 9, 119, 3.5, 1.6, 'ochre');
    p.set(x0 + 6 + i * 9, 118, i % 2 ? 'plum' : 'sand');
  }
}

/** Srdce (perník): r = velikost, bílá poleva po okraji. */
function heart(p: PixelCanvas, cx: number, cy: number, r: number, c: PalKey) {
  for (let y = -r; y <= r * 1.6; y++)
    for (let x = -r * 1.6; x <= r * 1.6; x++) {
      const nx = x / r;
      const ny = -y / r;
      const v = (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny * ny * ny;
      if (v <= 0) p.set(cx + x, cy + y, c);
    }
  for (let y = -r; y <= r * 1.6; y++)
    for (let x = -r * 1.6; x <= r * 1.6; x++) {
      if (p.get(cx + x, cy + y) !== c) continue;
      const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => p.get(cx + x + dx, cy + y + dy) !== c && p.get(cx + x + dx, cy + y + dy) !== 'white');
      if (edge && (x + y) % 2 === 0) p.set(cx + x, cy + y, 'white');
    }
}

/** Střelnice: markýza, sloupky, zadní stěna s lištami, pult s flintou, ceny. */
function booth(p: PixelCanvas) {
  const { x1, x2, top, counter } = BOOTH;
  // zadní stěna (svislá prkna)
  for (let y = top; y < counter; y++)
    for (let x = x1; x < x2; x++) {
      let c: PalKey = Math.floor((x - x1) / 10) % 2 ? 'maroon' : 'blood';
      if ((x - x1) % 10 === 0) c = 'ink';
      if (hash(x, y, 410) < 0.02) c = 'plum';
      p.set(x, y, c);
    }
  // hvězdy na stěně
  for (let i = 0; i < 10; i++) {
    const sx = x1 + 8 + hash(i, 1, 411) * (x2 - x1 - 16);
    const sy = top + 6 + hash(i, 2, 411) * 90;
    p.set(sx, sy, 'gold');
    p.set(sx - 1, sy, 'amber');
    p.set(sx + 1, sy, 'amber');
    p.set(sx, sy - 1, 'amber');
    p.set(sx, sy + 1, 'amber');
  }
  // lišty pro terče
  for (const ry of RAILS) {
    p.hline(x1, x2 - 1, ry + 1, 'fog');
    p.hline(x1, x2 - 1, ry + 2, 'slate');
    p.hline(x1, x2 - 1, ry + 3, 'ink');
  }
  // sloupky budky
  for (const sx of [x1 - 8, x2]) {
    p.rect(sx, top - 4, 8, counter - top + 30, 'rust');
    p.vline(sx, top - 4, counter + 25, 'copper');
    p.vline(sx + 7, top - 4, counter + 25, 'olive');
    for (let y = top; y < counter + 25; y += 12) p.hline(sx, sx + 7, y, 'olive');
  }
  // markýza: pruhy a vroubkovaný okraj
  for (let y = top - 22; y < top - 4; y++)
    for (let x = x1 - 14; x < x2 + 14; x++) {
      const st = Math.floor((x - x1 + 14) / 10) % 2;
      const k = (y - (top - 22)) / 18;
      p.set(x, y, st ? (k < 0.3 ? 'white' : 'bone') : k < 0.3 ? 'scarlet' : 'red');
    }
  for (let x = x1 - 14; x < x2 + 14; x += 10) {
    const st = Math.floor((x - x1 + 14) / 10) % 2;
    p.ellipse(x + 5, top - 4, 5, 3, st ? 'bone' : 'red');
  }
  p.hline(x1 - 14, x2 + 13, top - 22, 'blood');
  // nápis STŘELNICE na desce nad markýzou
  p.rect(x1 + 34, top - 34, x2 - x1 - 68, 12, 'gold');
  p.rect(x1 + 35, top - 33, x2 - x1 - 70, 10, 'sand');
  // pult
  p.rect(x1 - 8, counter, x2 - x1 + 16, 26, 'rust');
  p.hline(x1 - 8, x2 + 7, counter, 'ochre');
  p.hline(x1 - 8, x2 + 7, counter + 1, 'copper');
  for (let x = x1 - 8; x < x2 + 8; x += 14) p.vline(x, counter + 3, counter + 25, 'olive');
  // flinta na pultu
  p.rect(x1 + 6, counter - 3, 40, 2, 'slate');
  p.hline(x1 + 6, x1 + 45, counter - 3, 'fog');
  p.rect(x1 + 40, counter - 5, 14, 4, 'rust');
  p.hline(x1 + 40, x1 + 53, counter - 5, 'copper');
  // krabička s broky
  p.rect(x2 - 34, counter - 5, 10, 5, 'gold');
  p.hline(x2 - 34, x2 - 25, counter - 5, 'sand');
  // ceny na sloupcích: perníková srdce vlevo, papírové růže vpravo
  for (let i = 0; i < 3; i++) heart(p, x1 - 18, top + 14 + i * 26, 5, 'copper');
  for (let i = 0; i < 4; i++) {
    const rx = x2 + 15;
    const ry = top + 10 + i * 22;
    p.vline(rx, ry + 3, ry + 14, 'green');
    p.ellipse(rx, ry + 2, 3, 3, i % 2 ? 'scarlet' : 'sand');
    p.set(rx - 1, ry + 1, 'white');
  }
}

/** Kolotoč (64×70, 4 snímky): kuželová pruhovaná střecha, sloup, koníci nahoru a dolů. */
function carousel(f: number): PixelCanvas {
  const p = new PixelCanvas(64, 70);
  const cx = 32;
  // podlaha (elipsa)
  p.ellipse(cx, 60, 30, 6, 'rust');
  p.ellipse(cx, 59, 29, 5, 'copper');
  // sloupky s koníky
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + (f / 4) * (Math.PI / 3);
    const x = cx + Math.cos(a) * 24;
    const front = Math.sin(a) > -0.2;
    const bob = Math.round(Math.sin(a * 2 + f) * 3);
    p.vline(Math.round(x), 22, 58, front ? 'gold' : 'olive');
    if (!front) continue;
    const hy = 42 + bob;
    const dir = Math.cos(a) < 0 ? 1 : -1;
    // koník: tělo, hlava, nohy
    p.rect(Math.round(x) - 5, hy, 10, 5, i % 2 ? 'white' : 'bone');
    p.rect(Math.round(x) + dir * 5 - (dir < 0 ? 3 : 0), hy - 4, 3, 6, i % 2 ? 'white' : 'bone');
    p.set(Math.round(x) + dir * 6, hy - 3, 'ink');
    p.vline(Math.round(x) - 4, hy + 5, hy + 8, 'tan');
    p.vline(Math.round(x) + 3, hy + 5, hy + 8, 'tan');
    p.hline(Math.round(x) - 2, Math.round(x) + 2, hy + 1, i % 3 ? 'scarlet' : 'sky'); // sedlo
    p.set(Math.round(x) - dir * 6, hy + 1, 'fog'); // ocas
  }
  // střecha: pruhovaný kužel
  for (let y = 4; y < 22; y++) {
    const w = 2 + (y - 4) * 1.75;
    for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) {
      const seg = Math.floor(((x - cx) / (w + 0.01) + 1) * 4 + f * 0.5) % 2;
      p.set(x, y, seg ? 'scarlet' : 'white');
    }
  }
  // vroubky pod střechou a žárovičky
  for (let x = 1; x < 63; x += 4) {
    p.ellipse(x + 2, 22, 2, 1.6, Math.floor(x / 4) % 2 ? 'red' : 'bone');
    p.set(x + 2, 25, (Math.floor(x / 4) + f) % 2 ? 'gold' : 'sand');
  }
  // vlaječka nahoře
  p.vline(cx, 0, 4, 'ink');
  p.rect(cx + 1, 0, 4, 2, f % 2 ? 'gold' : 'amber');
  p.vline(cx, 22, 58, 'gold');
  return p.outline('ink');
}

/** Pozadí návsi se stánky a střelnicí (2 snímky blikajících žárovek). */
export function fairBg(f: number): PixelCanvas {
  const p = new PixelCanvas(FW, FH);
  sky(p);
  village(p);
  lights(p, f);
  // zem: udusaná tráva a hlína
  for (let y = 108; y < FH; y++)
    for (let x = 0; x < FW; x++) {
      // udusaná cesta před budkou, kolem tráva (plochy čisté, jen řídké trsy)
      const path = Math.abs(x - 160) < 70 + (y - 108) * 0.9;
      let c: PalKey = y < 111 ? 'sage' : path ? 'olive' : 'pine';
      if (!path && y >= 111 && hash(Math.floor(x / 4), Math.floor(y / 3), 421) < 0.08 && (x + y) % 3 !== 0) c = 'green';
      if (path && hash(Math.floor(x / 3), Math.floor(y / 2), 422) < 0.05) c = 'rust';
      p.set(x, y, c);
    }
  gingerStall(p, 262);
  booth(p);
  // davy siluet dole
  for (let i = 0; i < 18; i++) {
    const x = 4 + i * 19 + (i % 3) * 3;
    if (x > 70 && x < 250) continue;
    const y = 178 - (i % 3) * 3 - ((i + f) % 2);
    p.ellipse(x, y, 8, 10, 'ink');
    p.ellipse(x, y - 13, 5, 5, 'ink');
    if (i % 4 === 1) p.rect(x - 6, y - 19, 12, 2, 'ink');
    if (i % 5 === 3) p.ellipse(x + 8, y - 22 - f, 3, 3, i % 2 ? 'scarlet' : 'sky'); // balónek
    if (i % 5 === 3) p.vline(x + 8, y - 19 - f, y - 10, 'fog');
  }
  return p;
}

/** Plechová kachna na lištu (16×14). gold = zlatá za 50. hit = sklopená. */
function duck(gold: boolean, hit: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 14);
  const [a, b, c]: PalKey[] = gold ? ['gold', 'amber', 'sand'] : ['ochre', 'copper', 'sand'];
  if (hit) {
    p.rect(1, 10, 14, 3, b);
    p.hline(1, 14, 10, c);
    p.rect(6, 13, 4, 1, 'slate');
    return p.outline('ink');
  }
  p.ellipse(7, 9, 6, 3.5, a);
  p.hline(3, 11, 7, c);
  p.ellipse(11, 4, 2.6, 2.6, a);
  p.set(10, 3, c);
  p.set(12, 3, 'ink');
  p.rect(13, 4, 3, 2, 'scarlet');
  p.hline(2, 11, 11, b);
  p.set(1, 8, b);
  p.set(0, 7, b);
  p.rect(6, 12, 4, 2, 'slate'); // nožka do lišty
  if (gold) p.set(6, 8, 'white');
  return p.outline('ink');
}

/** Hvězda na tyčce (13×15). */
function star(hit: boolean): PixelCanvas {
  const p = new PixelCanvas(13, 16);
  if (hit) {
    p.vline(6, 11, 15, 'slate');
    p.rect(3, 9, 7, 2, 'amber');
    return p.outline('ink');
  }
  // pěticípá hvězda: bod uvnitř mnohoúhelníku o 10 vrcholech
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 2.6 : 6.2;
    pts.push([6.5 + Math.cos(a) * r, 6.3 + Math.sin(a) * r]);
  }
  const inside = (x: number, y: number) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i];
      const [xj, yj] = pts[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  for (let y = 0; y < 13; y++)
    for (let x = 0; x < 13; x++) if (inside(x + 0.5, y + 0.5)) p.set(x, y, x + y < 11 ? 'gold' : 'amber');
  p.set(5, 5, 'sand');
  p.set(6, 4, 'white');
  p.vline(6, 12, 15, 'slate');
  p.vline(7, 12, 15, 'slate');
  return p.outline('ink');
}

/** Hliněná trubička (klasika ze střelnice) s papírovou kytičkou (5×18). */
function pipe(hit: boolean): PixelCanvas {
  const p = new PixelCanvas(7, 18);
  if (hit) {
    p.rect(2, 13, 3, 5, 'bone');
    p.set(2, 13, 'fog');
    p.set(4, 12, 'bone');
    return p.outline('ink');
  }
  p.rect(2, 4, 3, 14, 'bone');
  p.vline(2, 4, 17, 'white');
  p.vline(4, 4, 17, 'fog');
  p.ellipse(3, 2, 2.6, 2, 'scarlet');
  p.set(2, 1, 'white');
  p.set(3, 2, 'gold');
  return p.outline('ink');
}

/** Zaměřovač (15×15). */
function cross(): PixelCanvas {
  const p = new PixelCanvas(15, 15);
  for (let i = 0; i < 15; i++) {
    const r = Math.hypot(i - 7, 0);
    if (r > 2) {
      p.set(i, 7, 'white');
      p.set(7, i, 'white');
    }
  }
  for (let a = 0; a < 40; a++) p.set(7 + Math.cos((a / 40) * Math.PI * 2) * 6, 7 + Math.sin((a / 40) * Math.PI * 2) * 6, 'scarlet');
  p.set(7, 7, 'scarlet');
  return p;
}

/** Odměny na výsledkové kartě: perníkové srdce a papírová růže. */
function bigHeart(): PixelCanvas {
  const p = new PixelCanvas(26, 24);
  heart(p, 13, 10, 8, 'copper');
  p.ellipse(13, 12, 3, 2, 'scarlet');
  p.set(12, 11, 'white');
  p.hline(6, 20, 1, 'gold');
  return p.outline('ink');
}

function rose(): PixelCanvas {
  const p = new PixelCanvas(11, 22);
  p.vline(5, 7, 21, 'green');
  p.hline(6, 8, 13, 'mint');
  p.hline(2, 4, 16, 'green');
  p.ellipse(5, 4, 4, 4, 'scarlet');
  p.ellipse(5, 4, 2, 2, 'red');
  p.set(4, 2, 'white');
  return p.outline('ink');
}

/** Praporky přes zeď hospody (48×9) a plakát pouti (16×18). */
function bunting(): PixelCanvas {
  const p = new PixelCanvas(48, 9);
  const cols: PalKey[] = ['scarlet', 'white', 'gold', 'sky', 'mint'];
  for (let x = 0; x < 48; x++) p.set(x, Math.round(Math.sin((x / 47) * Math.PI) * 2), 'ink');
  for (let i = 0; i < 6; i++) {
    const x0 = 2 + i * 8;
    const y0 = Math.round(Math.sin(((x0 + 3) / 47) * Math.PI) * 2) + 1;
    for (let y = 0; y < 5; y++) p.hline(x0 + Math.floor(y / 1.6), x0 + 6 - Math.floor(y / 1.6), y0 + y, cols[i % cols.length]);
  }
  return p;
}

function posterFair(): PixelCanvas {
  const p = new PixelCanvas(16, 18);
  p.rect(1, 1, 14, 16, 'bone');
  p.rect(1, 1, 14, 4, 'scarlet');
  p.hline(3, 12, 2, 'white');
  // mini kolotoč
  for (let y = 6; y < 10; y++) p.hline(8 - (y - 5) * 1.4, 8 + (y - 5) * 1.4, y, y % 2 ? 'red' : 'white');
  p.vline(8, 10, 14, 'gold');
  p.vline(4, 10, 14, 'gold');
  p.vline(12, 10, 14, 'gold');
  p.hline(3, 13, 15, 'rust');
  p.set(5, 12, 'white');
  p.set(11, 11, 'white');
  return p.outline('ink');
}

export function buildFairObjects(): Record<string, PixelCanvas> {
  return { bunting: bunting(), posterFair: posterFair() };
}

export function buildFairArt(scene: Phaser.Scene) {
  addImage(scene, 'fairBg0', fairBg(0));
  addImage(scene, 'fairBg1', fairBg(1));
  addSheet(scene, 'carousel', [0, 1, 2, 3].map((f) => carousel(f)));
  addAtlas(scene, 'fair', {
    duck: duck(false, false), duckHit: duck(false, true), duckGold: duck(true, false), duckGoldHit: duck(true, true),
    star: star(false), starHit: star(true), pipe: pipe(false), pipeHit: pipe(true), cross: cross(),
    bigHeart: bigHeart(), rose: rose(), prize: krigl(9),
  });
}
