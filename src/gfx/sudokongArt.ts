import Phaser from 'phaser';
import { PixelCanvas, addSheet, addImage, addCanvasTexture, hash } from './pixel';
import type { PalKey } from '../data/palette';
import { APE_KEYS, APE_FRAMES } from './apeSprite';
import { APE_DOWN_KEYS, APE_DOWN_FRAMES, APE_KRIGL } from './apeDownSprite';

// Sudokong (sklepní aréna): velký opičák na dřevěném lešení, sudy (4 druhy, otáčení ve vzduchu),
// pochodně, prach a pozadí sklepa s klenbami, regály sudů a dlažbou.

export const SK_W = 420;
export const SK_H = 210;
/** horní a dolní okraj podlahy arény (px) */
export const SK_TOP = 78;
export const SK_BOTTOM = 196;
/** lešení: levá hrana a výšky pater (y nohou opičáka) */
export const SK_SCAFFOLD_X = 340;

// ---------------------------------------------------------------- opičák (42×44)
// snímky: 0,1 dech | 2 sahá pro sud | 3 sud nad hlavou | 4 hod | 5 zásah | 6 omráčený | 7,8 bušení do hrudi
// Ve hře je verze z Leonarda (art/leonardo/sudokong_snimky.py -> apeSprite.ts); ručně kreslená zůstává jako záloha.
const AW = 42;
const AH = 44;

function fromRows(rows: string[], keys: Record<string, PalKey>, w: number, h: number): PixelCanvas {
  const p = new PixelCanvas(w, h);
  rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, keys[c])));
  return p;
}

/** 0–8 boj, 9–14 porážka (omráčený, smutný, ustaraný, nastavuje dlaně, natahuje ruku, podává krígl) */
function apeFrame(f: number): PixelCanvas {
  return f < APE_FRAMES.length ? fromRows(APE_FRAMES[f], APE_KEYS, AW, AH) : fromRows(APE_DOWN_FRAMES[f - APE_FRAMES.length], APE_DOWN_KEYS, AW, AH);
}

export function apeFrameDrawn(f: number): PixelCanvas {
  const p = new PixelCanvas(AW, AH);
  const F1: PalKey = 'rust'; // srst
  const F2: PalKey = 'copper'; // světlejší srst (hrany)
  const F0: PalKey = 'olive'; // stín srsti
  const SK: PalKey = 'sand'; // kůže
  const SKD: PalKey = 'ochre';
  const breathe = f === 1 ? 1 : 0;
  const cx = 21;

  if (f === 6) {
    // omráčený: sedí, hlava na stranu, hvězdičky
    p.ellipse(cx, 34, 15, 9, F1);
    p.ellipse(cx, 33, 9, 6, SK);
    p.rect(6, 36, 8, 6, F1);
    p.rect(28, 36, 8, 6, F1);
    p.ellipse(cx + 3, 20, 9, 8, F1);
    p.ellipse(cx + 4, 23, 6, 4, SK);
    p.hline(cx - 1, cx + 2, 19, 'ink');
    p.hline(cx + 5, cx + 8, 19, 'ink');
    p.set(cx, 18, 'ink');
    p.set(cx + 7, 18, 'ink');
    p.hline(cx + 2, cx + 6, 25, 'ink');
    for (const [x, y] of [[8, 8], [20, 4], [33, 9]]) {
      p.set(x, y, 'gold');
      p.set(x - 1, y, 'sand');
      p.set(x + 1, y, 'sand');
      p.set(x, y - 1, 'sand');
      p.set(x, y + 1, 'sand');
    }
    return p.outline('ink');
  }

  // nohy (krátké, široce rozkročené)
  p.rect(9, 33, 8, 8, F1);
  p.rect(25, 33, 8, 8, F1);
  p.vline(9, 33, 40, F2);
  p.rect(7, 40, 10, 3, SK);
  p.rect(25, 40, 10, 3, SK);
  p.hline(7, 16, 42, SKD);
  p.hline(25, 34, 42, SKD);
  // trup (široká hruď)
  p.ellipse(cx, 26 + breathe * 0.5, 14, 11 + breathe * 0.3, F1);
  p.ellipse(cx - 4, 22, 7, 5, F2); // světlo zleva nahoře
  p.ellipse(cx, 27, 9, 7.5, SK); // hruď a břicho
  p.ellipse(cx - 2, 25, 4, 3, 'white');
  p.hline(cx - 7, cx - 1, 24, SKD); // prsní svaly
  p.hline(cx + 1, cx + 7, 24, SKD);
  p.vline(cx, 25, 32, SKD);
  p.ellipse(cx + 5, 30, 4, 3, SKD);
  // kravata s půllitrem
  if (f !== 5) {
    p.rect(cx - 1, 17, 3, 3, 'red');
    p.rect(cx - 2, 20, 5, 7, 'scarlet');
    p.set(cx - 2, 26, 'red');
    p.set(cx + 2, 26, 'red');
    p.rect(cx - 1, 21, 3, 3, 'gold');
    p.set(cx, 21, 'white');
  }

  // ruce podle snímku
  const armL = (x: number, y: number, w: number, h: number) => {
    p.rect(x, y, w, h, F1);
    p.vline(x, y, y + h - 1, F2);
  };
  const fist = (x: number, y: number) => {
    p.ellipse(x, y, 3.5, 3, SK);
    p.hline(x - 2, x + 2, y + 2, SKD);
  };
  const barrelAt = (x: number, y: number) => {
    p.rect(x, y, 22, 12, 'rust');
    p.hline(x, x + 21, y + 1, 'copper');
    p.vline(x + 5, y, y + 11, 'coal');
    p.vline(x + 16, y, y + 11, 'coal');
    p.hline(x, x + 21, y + 11, 'blood');
  };
  if (f === 2) {
    // sahá vlevo nahoru pro sud z hromady
    armL(3, 14, 6, 16);
    fist(5, 12);
    armL(32, 18, 6, 14);
    fist(35, 33);
  } else if (f === 3) {
    // sud nad hlavou
    armL(5, 6, 6, 18);
    armL(31, 6, 6, 18);
    barrelAt(cx - 11, 0);
    fist(8, 6);
    fist(34, 6);
  } else if (f === 4) {
    // hod: pravá ruka natažená dopředu (doleva – opičák kouká doleva)
    armL(0, 20, 14, 6);
    fist(1, 23);
    armL(32, 16, 6, 14);
    fist(35, 31);
  } else if (f === 7 || f === 8) {
    // buší do hrudi
    const k = f === 7 ? 0 : 2;
    armL(6, 18, 6, 10);
    armL(30, 18, 6, 10);
    fist(cx - 5 + k, 24 - k);
    fist(cx + 5 - k, 24 + k);
  } else {
    // dlouhé ruce svěšené až k zemi
    armL(3, 17, 7, 20);
    armL(32, 17, 7, 20);
    fist(6, 38);
    fist(36, 38);
  }

  // hlava (obočí, tlama, oči)
  const hy = 12 - breathe;
  p.ellipse(cx, hy, 10, 9, F1);
  p.ellipse(cx - 3, hy - 4, 5, 3, F2);
  // chomáč na temeni
  p.vline(cx, hy - 10, hy - 7, F2);
  p.set(cx - 1, hy - 9, F2);
  p.set(cx + 1, hy - 8, F1);
  // obličejová maska
  p.ellipse(cx, hy + 2, 7.5, 6, SK);
  p.ellipse(cx, hy + 5, 6, 3.5, 'bone'); // tlama
  // obočí (silný val)
  p.hline(cx - 7, cx + 7, hy - 2, F0);
  p.hline(cx - 6, cx + 6, hy - 3, F1);
  // nos
  p.set(cx - 1, hy + 2, 'ink');
  p.set(cx + 1, hy + 2, 'ink');
  p.hline(cx - 2, cx + 2, hy + 1, SKD);
  const angry = f === 3 || f === 4 || f === 7 || f === 8;
  if (f === 5) {
    // zásah: oči do X, otevřená tlama
    for (const ex of [cx - 4, cx + 4]) {
      p.set(ex - 1, hy - 1, 'ink');
      p.set(ex + 1, hy + 1, 'ink');
      p.set(ex + 1, hy - 1, 'ink');
      p.set(ex - 1, hy + 1, 'ink');
      p.set(ex, hy, 'ink');
    }
    p.ellipse(cx, hy + 6, 3, 2, 'blood');
    p.set(cx, hy + 6, 'scarlet');
  } else {
    for (const ex of [cx - 4, cx + 4]) {
      p.rect(ex - 1, hy - 1, 3, 2, 'white');
      p.set(ex - (ex < cx ? 1 : 0), hy, 'ink');
      p.set(ex - (ex < cx ? 1 : 0), hy - 1, angry ? 'scarlet' : 'ink');
    }
    if (angry) {
      // řve: otevřená tlama se zuby
      p.rect(cx - 4, hy + 4, 9, 4, 'blood');
      p.hline(cx - 4, cx + 4, hy + 4, 'white');
      p.set(cx - 3, hy + 7, 'white');
      p.set(cx + 3, hy + 7, 'white');
      p.rect(cx - 2, hy + 6, 5, 1, 'scarlet');
    } else {
      p.hline(cx - 4, cx + 4, hy + 6, 'ink');
      p.set(cx - 5, hy + 5, 'ink');
      p.set(cx + 5, hy + 5, 'ink');
    }
  }
  // uši
  p.ellipse(cx - 10, hy + 1, 2, 2.5, SK);
  p.ellipse(cx + 10, hy + 1, 2, 2.5, SK);
  p.set(cx - 10, hy + 1, SKD);
  p.set(cx + 10, hy + 1, SKD);
  return p.outline('ink');
}

// ---------------------------------------------------------------- sudy (otáčí se úhlem sprite, snímky = posun obručí)
type Kind = 'normal' | 'bouncy' | 'fire' | 'big';
const BARREL: Record<Kind, { c: PalKey; hi: PalKey; lo: PalKey; hoop: PalKey; hoopHi: PalKey }> = {
  normal: { c: 'rust', hi: 'copper', lo: 'blood', hoop: 'coal', hoopHi: 'slate' },
  bouncy: { c: 'blue', hi: 'sky', lo: 'navy', hoop: 'ink', hoopHi: 'ice' },
  fire: { c: 'red', hi: 'ochre', lo: 'blood', hoop: 'coal', hoopHi: 'amber' },
  big: { c: 'olive', hi: 'rust', lo: 'ink', hoop: 'coal', hoopHi: 'fog' },
};

function barrel(kind: Kind, f: number): PixelCanvas {
  const big = kind === 'big';
  const W = big ? 28 : 20;
  const H = big ? 23 : 17;
  const C = BARREL[kind];
  const p = new PixelCanvas(W, H);
  // soudek z boku: vypouklý uprostřed
  for (let y = 1; y < H - 1; y++) {
    const bulge = Math.round(Math.sin((y / (H - 1)) * Math.PI) * 2);
    const x0 = 2 - bulge + 1;
    const x1 = W - 4 + bulge;
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0);
      p.set(x, y, t < 0.12 ? C.hi : t < 0.25 ? (y % 3 ? C.hi : C.c) : t > 0.82 ? C.lo : C.c);
    }
  }
  // dužiny (svislé spáry), posun podle snímku = otáčení
  const staves = big ? 6 : 5;
  for (let k = 0; k < staves; k++) {
    const x = 3 + ((k * Math.floor((W - 6) / staves) + f * 2) % (W - 6));
    for (let y = 2; y < H - 2; y += 1) if ((y + k) % 6 !== 0) p.set(x, y, C.lo);
  }
  // obruče (tři), lesk obruče se posouvá = otáčení
  const hoops = [Math.round(H * 0.22), Math.floor(H / 2), H - 1 - Math.round(H * 0.22)];
  for (const hy of hoops) {
    p.hline(1, W - 2, hy, C.hoop);
    p.set(2 + ((f * 4) % (W - 4)), hy, C.hoopHi);
    p.set(3 + ((f * 4) % (W - 4)), hy, C.hoopHi);
  }
  // čela sudu
  p.hline(4, W - 5, 1, C.hoop);
  p.hline(4, W - 5, H - 2, C.hoop);
  const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
  if (kind === 'fire') {
    p.rect(cx - 2, cy - 3, 4, 3, 'gold');
    p.rect(cx - 1, cy - 2, 2, 1, 'white');
  }
  if (kind === 'bouncy') {
    // pružina na boku
    for (let i = 0; i < 3; i++) p.hline(cx - 3, cx + 2, cy - 4 + i * 3, 'ice');
  }
  if (big) {
    // lebka = nebezpečný
    p.rect(cx - 4, cy - 4, 8, 7, 'bone');
    p.rect(cx - 3, cy - 2, 2, 2, 'ink');
    p.rect(cx + 1, cy - 2, 2, 2, 'ink');
    p.hline(cx - 2, cx + 1, cy + 2, 'fog');
    p.set(cx - 1, cy + 2, 'ink');
  }
  return p.outline('ink');
}

function splinter(): PixelCanvas {
  const p = new PixelCanvas(5, 2);
  p.hline(0, 4, 0, 'copper');
  p.hline(0, 3, 1, 'rust');
  return p;
}

function hoop(): PixelCanvas {
  const p = new PixelCanvas(9, 9);
  for (let a = 0; a < Math.PI * 2; a += 0.1) p.set(Math.round(4 + Math.cos(a) * 4), Math.round(4 + Math.sin(a) * 4), 'coal');
  return p;
}

function dust(): PixelCanvas {
  const p = new PixelCanvas(7, 5);
  p.ellipse(3, 2.5, 3.5, 2.5, 'tan');
  p.ellipse(2.5, 2, 2, 1.5, 'bone');
  return p;
}

function torch(f: number): PixelCanvas {
  const p = new PixelCanvas(9, 22);
  // držák a louč
  p.rect(3, 10, 3, 11, 'olive');
  p.vline(3, 10, 20, 'rust');
  p.rect(1, 17, 7, 2, 'coal');
  p.rect(2, 9, 5, 2, 'coal');
  // plamen (3 snímky)
  const h = [8, 9, 7][f];
  const sway = [0, 1, -1][f];
  for (let y = 0; y < h; y++) {
    const w = Math.max(0, Math.round(Math.sin(((y + 1) / (h + 1)) * Math.PI) * 3));
    const x = 4 + Math.round((sway * (h - y)) / h);
    p.hline(x - w, x + w, 9 - h + y, y < 2 ? 'gold' : y < h - 3 ? 'amber' : 'copper');
  }
  p.set(4 + sway, 9 - h + 2, 'white');
  return p;
}

// ---------------------------------------------------------------- pozadí sklepa
function bgCellar(): PixelCanvas {
  const p = new PixelCanvas(SK_W, SK_H);
  const wallH = SK_TOP - 6;
  // kamenná zeď: nepravidelné kvádry se stínováním
  for (let y = 0; y < wallH; y++)
    for (let x = 0; x < SK_W; x++) {
      const row = Math.floor(y / 8);
      const off = (row % 2) * 9 + Math.floor(hash(row, 0, 11) * 6);
      const col = Math.floor((x + off) / 18);
      const lx = (x + off) % 18;
      const ly = y % 8;
      const h = hash(col, row, 12);
      let c: PalKey = h < 0.3 ? 'dusk' : h < 0.75 ? 'navy' : 'indigo';
      if (ly === 0 || lx === 0) c = 'ink';
      else if (ly === 1 || lx === 1) c = c === 'indigo' ? 'blue' : c === 'navy' ? 'indigo' : 'slate';
      else if (ly === 7 || lx === 17) c = 'ink';
      if (hash(x, y, 13) < 0.03) c = 'grave'; // mech
      p.set(x, y, c);
    }
  // klenuté výklenky s regály sudů (3 oblouky)
  for (let i = 0; i < 3; i++) {
    const cx = 52 + i * 104;
    const top = 10;
    const halfW = 34;
    // tmavý vnitřek oblouku (hloubka)
    for (let y = top; y < wallH; y++)
      for (let x = cx - halfW; x <= cx + halfW; x++) {
        const dx = (x - cx) / halfW;
        const archY = top + 14 - Math.sqrt(Math.max(0, 1 - dx * dx)) * 14;
        if (y < archY) continue;
        const depth = Math.abs(dx);
        p.set(x, y, depth > 0.85 ? 'dusk' : (x + y) % 2 && depth > 0.6 ? 'dusk' : 'ink');
      }
    // obloukové kameny
    for (let a = 0; a <= Math.PI; a += 0.02) {
      const x = Math.round(cx - Math.cos(a) * (halfW + 2));
      const y = Math.round(top + 14 - Math.sin(a) * 16);
      p.set(x, y, 'fog');
      p.set(x, y + 1, 'slate');
      if (Math.floor(a * 10) % 3 === 0) p.set(x, y - 1, 'ink');
    }
    // regál: dvě police se sudy (kruhová čela)
    for (const shelfY of [36, wallH - 3]) {
      p.rect(cx - halfW + 2, shelfY, halfW * 2 - 3, 3, 'rust');
      p.hline(cx - halfW + 2, cx + halfW - 2, shelfY, 'copper');
      p.hline(cx - halfW + 2, cx + halfW - 2, shelfY + 2, 'olive');
      for (let k = 0; k < 5; k++) {
        const bx = cx - halfW + 9 + k * 13;
        const by = shelfY - 7;
        p.ellipse(bx, by, 6, 6, 'olive');
        p.ellipse(bx, by, 4.6, 4.6, 'rust');
        for (const k of [-2, 0, 2]) p.vline(bx + k, by - 4, by + 4, 'olive'); // dužiny čela
        p.set(bx - 2, by - 3, 'copper');
        p.set(bx - 3, by - 2, 'copper');
        p.rect(bx - 1, by + 1, 2, 2, 'coal'); // kohoutek
        p.set(bx, by + 3, 'fog');
        for (let a = 0; a < Math.PI * 2; a += 0.15) p.set(Math.round(bx + Math.cos(a) * 6), Math.round(by + Math.sin(a) * 6), 'coal');
      }
    }
  }
  // dřevěná cedule s nápisem SUDOKONG
  const sx = 186;
  p.rect(sx, 2, 52, 11, 'rust');
  p.hline(sx, sx + 51, 2, 'copper');
  p.hline(sx, sx + 51, 12, 'olive');
  p.vline(sx + 8, 0, 2, 'coal');
  p.vline(sx + 43, 0, 2, 'coal');
  const FONT: Record<string, string[]> = {
    S: ['111', '100', '111', '001', '111'], U: ['101', '101', '101', '101', '111'], D: ['110', '101', '101', '101', '110'],
    O: ['111', '101', '101', '101', '111'], K: ['101', '110', '100', '110', '101'], N: ['101', '111', '111', '111', '101'], G: ['111', '100', '101', '101', '111'],
  };
  let tx = sx + 5;
  for (const ch of 'SUDOKONG') {
    FONT[ch].forEach((row, yy) => [...row].forEach((b, xx) => b === '1' && p.set(tx + xx, 5 + yy, 'sand')));
    tx += 5;
  }
  // řetězy visící ze stropu
  for (const x of [20, 150, 274]) for (let y = 0; y < 14; y++) p.set(x + (y % 2), y, y % 3 === 0 ? 'fog' : 'slate');
  // pavučiny v rozích
  for (let i = 0; i < 12; i++) {
    p.set(i, 12 - i, 'fog');
    p.set(i, 0, 'fog');
    p.set(SK_W - 1 - i, 12 - i, 'fog');
  }
  // spodní lišta zdi (sokl)
  p.rect(0, wallH - 1, SK_W, 3, 'slate');
  p.hline(0, SK_W - 1, wallH - 1, 'fog');
  p.hline(0, SK_W - 1, wallH + 1, 'ink');

  // podlaha: nepravidelné kočičí hlavy (Voroného buňky), u zdi tmavší
  const CELL = 11;
  const seed = (cx: number, cy: number) => ({ x: cx * CELL + hash(cx, cy, 31) * CELL, y: wallH + 2 + cy * CELL * 0.8 + hash(cx, cy, 32) * CELL * 0.8 });
  for (let y = wallH + 2; y < SK_H; y++)
    for (let x = 0; x < SK_W; x++) {
      const gx = Math.floor(x / CELL);
      const gy = Math.floor((y - wallH - 2) / (CELL * 0.8));
      let d1 = 1e9;
      let d2 = 1e9;
      let best = { cx: 0, cy: 0, px: 0, py: 0 };
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const sp = seed(gx + i, gy + j);
          const d = Math.hypot(x - sp.x, (y - sp.y) * 1.25);
          if (d < d1) {
            d2 = d1;
            d1 = d;
            best = { cx: gx + i, cy: gy + j, px: sp.x, py: sp.y };
          } else if (d < d2) d2 = d;
        }
      const h = hash(best.cx, best.cy, 33);
      let c: PalKey = h < 0.4 ? 'dusk' : h < 0.8 ? 'navy' : h < 0.93 ? 'slate' : 'mauve';
      // spára mezi kameny a světlá hrana nahoře vlevo (kameny jsou vypouklé)
      if (d2 - d1 < 1.3) c = 'ink';
      else if (d2 - d1 < 2.4 && y < best.py && x < best.px + 2) c = c === 'navy' ? 'indigo' : c === 'dusk' ? 'slate' : 'fog';
      else if (d2 - d1 < 2.2 && y > best.py) c = c === 'slate' || c === 'mauve' ? 'dusk' : 'ink';
      const n = hash(x, y, 22);
      if (n < 0.01 && c !== 'ink') c = 'grave';
      const fy = y - wallH - 2;
      if (fy < 5 && (x + y) % (fy + 2) === 0) c = 'ink';
      p.set(x, y, c);
    }
  // praskliny
  for (let i = 0; i < 14; i++) {
    let x = Math.floor(hash(i, 1, 23) * SK_W);
    let y = wallH + 6 + Math.floor(hash(i, 2, 23) * (SK_H - wallH - 10));
    for (let k = 0; k < 7; k++) {
      p.set(x, y, 'ink');
      x += hash(i, k, 24) < 0.5 ? 1 : -1;
      y += hash(i, k, 25) < 0.6 ? 1 : 0;
    }
  }
  // sláma
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(hash(i, 3, 26) * (SK_SCAFFOLD_X - 10));
    const y = wallH + 4 + Math.floor(hash(i, 4, 26) * (SK_H - wallH - 8));
    const len = 2 + Math.floor(hash(i, 5, 26) * 3);
    for (let k = 0; k < len; k++) p.set(x + k, y + (hash(i, 6, 26) < 0.5 ? 0 : Math.floor(k / 2)), k % 2 ? 'sand' : 'ochre');
  }
  // louže
  for (const [x, y, rx] of [[96, 170, 14], [230, 120, 10], [40, 110, 8]]) {
    p.ellipse(x, y, rx, rx * 0.35, 'navy');
    p.ellipse(x - 2, y - 1, rx * 0.6, rx * 0.2, 'indigo');
    p.hline(x - Math.floor(rx / 2), x - Math.floor(rx / 2) + 3, y - 1, 'ice');
  }

  // ---------------- dřevěné lešení vpravo (zadní sloupy tmavší, přední světlejší)
  const X0 = SK_SCAFFOLD_X;
  const levels = [30, 62, 98, 126, 154, 182];
  const post = (x: number, front: boolean) => {
    p.rect(x, 4, 6, SK_BOTTOM - 2, front ? 'rust' : 'olive');
    p.vline(x, 4, SK_BOTTOM + 2, front ? 'copper' : 'rust');
    p.vline(x + 5, 4, SK_BOTTOM + 2, 'ink');
    for (let y = 10; y < SK_BOTTOM; y += 13) p.hline(x + 1, x + 4, y, front ? 'olive' : 'ink'); // letokruhy
  };
  post(X0 + 30, false);
  post(SK_W - 12, false);
  for (const ly of levels) {
    // šikmé vzpěry
    for (let k = 0; k < 30; k++) p.set(X0 + 6 + k, ly + 12 + Math.floor(k * 0.9), 'olive');
    // prkno patra (s hloubkou)
    p.rect(X0 - 4, ly, SK_W - X0 + 4, 3, 'rust');
    p.rect(X0 - 4, ly + 3, SK_W - X0 + 4, 3, 'copper');
    p.hline(X0 - 4, SK_W - 1, ly + 3, 'sand');
    p.hline(X0 - 4, SK_W - 1, ly + 6, 'ink');
    for (let x = X0; x < SK_W; x += 11) p.vline(x, ly + 3, ly + 5, 'rust');
    for (let x = X0 + 4; x < SK_W; x += 22) {
      p.set(x, ly + 4, 'fog');
      p.set(x + 1, ly + 4, 'slate');
    }
    // provaz omotaný kolem sloupu
    for (let k = 0; k < 4; k++) p.hline(X0 - 1, X0 + 6, ly - 2 + k * 2, k % 2 ? 'tan' : 'sand');
  }
  post(X0, true);
  post(X0 + 54, true);
  // žebřík
  for (const x of [X0 + 14, X0 + 22]) p.vline(x, 6, SK_BOTTOM, 'tan');
  for (let y = 8; y < SK_BOTTOM; y += 6) p.hline(X0 + 14, X0 + 22, y, 'ochre');
  // hromada sudů nahoře (opičákova munice)
  for (const [bx, by] of [[X0 + 36, 14], [X0 + 48, 14], [X0 + 60, 14], [X0 + 42, 6], [X0 + 54, 6]]) {
    p.ellipse(bx, by, 6, 5, 'rust');
    p.ellipse(bx - 1, by - 1, 4, 3, 'copper');
    p.hline(bx - 6, bx + 6, by + 2, 'coal');
    p.set(bx, by, 'olive');
  }
  return p;
}

/** Chlupatá ruka Sudokonga (krade sudy): tlustá paže v barvách Leonardova opičáka, dole velká dlaň
 *  se čtyřmi prsty a palcem (otevřená), nebo sevřená pěst. 22×64, ruka dole. */
export function apeArm(grab: boolean): PixelCanvas {
  const W = 22;
  const H = 64;
  const p = new PixelCanvas(W, H);
  const wrist = H - 19;
  // paže: srst (rust), světlá hrana (copper), stín (blood), pramínky srsti
  for (let y = 0; y <= wrist; y++) {
    const sway = Math.round(Math.sin(y / 9));
    const x0 = 5 + sway;
    const x1 = 16 + sway;
    for (let x = x0; x <= x1; x++) {
      let c: PalKey = x <= x0 + 1 ? 'copper' : x >= x1 - 2 ? 'blood' : 'rust';
      if (c === 'rust' && (x * 2 + y) % 7 === 0) c = 'blood';
      if (c === 'rust' && (x + y * 3) % 11 === 0) c = 'copper';
      p.set(x, y, c);
    }
    // chomáče trčí do stran
    if (y % 4 === 1) p.set(x0 - 1, y, 'rust');
    if (y % 4 === 3) p.set(x1 + 1, y, 'blood');
  }
  // huňatá manžeta u zápěstí
  for (let x = 3; x <= 18; x++) for (let y = wrist - 2; y <= wrist; y++) if ((x + y) % 3) p.set(x, y, y === wrist - 2 ? 'copper' : 'rust');
  const py = wrist + 1;
  if (!grab) {
    // dlaň
    for (let y = py; y < py + 8; y++) for (let x = 4; x <= 17; x++) p.set(x, y, x >= 15 || y === py + 7 ? 'ochre' : 'sand');
    p.hline(6, 14, py + 3, 'ochre'); // čára v dlani
    // palec do strany
    for (let i = 0; i < 4; i++) p.rect(1 + i, py + 1 + i, 3, 2, i === 3 ? 'ochre' : 'sand');
    // čtyři prsty
    for (const [fx, len] of [[4, 8], [8, 10], [12, 9], [16, 7]] as [number, number][]) {
      p.rect(fx, py + 8, 3, len, 'sand');
      p.vline(fx + 2, py + 8, py + 7 + len, 'ochre');
      p.hline(fx, fx + 2, py + 10, 'ochre'); // kloub
      p.hline(fx, fx + 2, py + 7 + len, 'tan'); // nehet
    }
  } else {
    // sevřená pěst: kulatá, klouby jako hrbolky, palec přes prsty
    for (let y = py; y < py + 13; y++)
      for (let x = 3; x <= 18; x++) {
        const dx = (x - 10.5) / 8;
        const dy = (y - (py + 6)) / 7;
        if (dx * dx + dy * dy <= 1) p.set(x, y, x >= 15 ? 'ochre' : 'sand');
      }
    for (const fx of [5, 9, 13]) p.vline(fx + 3, py + 6, py + 12, 'ochre'); // mezery mezi prsty
    p.hline(5, 17, py + 5, 'ochre');
    for (const fx of [5, 9, 13, 16]) p.set(fx + 1, py + 11, 'tan'); // klouby
    p.rect(3, py + 3, 7, 2, 'ochre'); // palec přes prsty
    p.hline(3, 9, py + 2, 'sand');
  }
  return p.outline('ink');
}

export function buildSudokongArt(scene: Phaser.Scene) {
  addImage(scene, 'apeArm', apeArm(false));
  addImage(scene, 'apeArmGrab', apeArm(true));
  addSheet(scene, 'ape', Array.from({ length: APE_FRAMES.length + APE_DOWN_FRAMES.length }, (_, f) => apeFrame(f)));
  addImage(scene, 'skKrigl', fromRows(APE_KRIGL, APE_DOWN_KEYS, APE_KRIGL[0].length, APE_KRIGL.length));
  for (const k of ['normal', 'bouncy', 'fire', 'big'] as Kind[]) addSheet(scene, `skb_${k}`, [0, 1, 2, 3].map((f) => barrel(k, f)));
  addSheet(scene, 'skTorch', [0, 1, 2].map(torch));
  addImage(scene, 'skSplinter', splinter());
  addImage(scene, 'skHoop', hoop());
  addImage(scene, 'skDust', dust());
  addImage(scene, 'skBg', bgCellar());
  addCanvasTexture(scene, 'skVignette', SK_W, SK_H, (ctx) => {
    const g = ctx.createRadialGradient(SK_W * 0.42, SK_H * 0.55, 60, SK_W * 0.45, SK_H * 0.55, 260);
    g.addColorStop(0, 'rgba(46,34,47,0)');
    g.addColorStop(1, 'rgba(46,34,47,0.75)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SK_W, SK_H);
  });
  if (!scene.anims.exists('skTorch_burn'))
    scene.anims.create({ key: 'skTorch_burn', frames: [0, 1, 2, 1].map((frame) => ({ key: 'skTorch', frame })), frameRate: 9, repeat: -1 });
}
