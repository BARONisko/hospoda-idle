import type Phaser from 'phaser';
import { PixelCanvas, hash, addAtlas } from './pixel';
import { PalKey } from '../data/palette';

// Večerní ulice pro rvačku s Žabákem. Kreslí se ve „středních“ barvách –
// noc a světlo lamp dodá osvětlení scény (Light2D).

export const STREET_W = 320;
export const STREET_H = 180;

export type StreetVariant = 'A' | 'B' | 'C';

/** Kam se postaví lampy (x, y hlavy) a jaké další světlo scéna má. */
export interface StreetLight {
  x: number;
  y: number;
  r: number;
  color: number;
  i: number;
  flicker?: boolean;
  swing?: boolean;
}

export interface StreetLayout {
  /** horní a dolní hrana prostoru pro boj */
  top: number;
  bottom: number;
  lights: StreetLight[];
  /** popisky hospod (x, y) */
  ours: { x: number; y: number };
  theirs: { x: number; y: number };
  /** měsíc, výška oblohy a komíny (odkud se kouří) */
  moon: { x: number; y: number };
  skyH: number;
  chimneys: { x: number; y: number }[];
}

const LAMP = 0xffb85c;

export const STREET_LAYOUT: Record<StreetVariant, StreetLayout> = {
  A: {
    top: 116, bottom: 160,
    lights: [
      { x: 64, y: 48, r: 40, color: LAMP, i: 1.4, flicker: true },
      { x: 160, y: 48, r: 40, color: LAMP, i: 1.4 },
      { x: 256, y: 48, r: 40, color: LAMP, i: 1.4, flicker: true },
      { x: 64, y: 128, r: 75, color: LAMP, i: 1.5, flicker: true },
      { x: 160, y: 128, r: 75, color: LAMP, i: 1.5 },
      { x: 256, y: 128, r: 75, color: LAMP, i: 1.5, flicker: true },
      { x: 30, y: 80, r: 40, color: 0xffa040, i: 0.8 },
      { x: 290, y: 80, r: 40, color: 0x7dffb0, i: 0.7 },
    ],
    ours: { x: 44, y: 22 }, theirs: { x: 276, y: 22 },
    moon: { x: 214, y: 12 }, skyH: 50,
    chimneys: [{ x: 74, y: 7 }, { x: 124, y: 19 }, { x: 170, y: 11 }, { x: 214, y: 23 }, { x: 306, y: 7 }],
  },
  B: {
    top: 118, bottom: 162,
    lights: [
      { x: 160, y: 46, r: 60, color: LAMP, i: 1.6, flicker: true },
      { x: 150, y: 130, r: 95, color: LAMP, i: 1.6, flicker: true },
      { x: 34, y: 96, r: 70, color: 0xffa040, i: 1.3 },
      { x: 288, y: 96, r: 60, color: 0x7dffb0, i: 1.0 },
      { x: 236, y: 40, r: 30, color: 0x8fd3ff, i: 0.6 },
    ],
    ours: { x: 34, y: 46 }, theirs: { x: 288, y: 46 },
    moon: { x: 250, y: 12 }, skyH: 30,
    chimneys: [{ x: 63, y: 9 }],
  },
  C: {
    top: 116, bottom: 162,
    lights: [
      { x: 160, y: 40, r: 60, color: LAMP, i: 1.5, swing: true },
      { x: 160, y: 135, r: 100, color: LAMP, i: 1.7, swing: true },
      { x: 18, y: 108, r: 50, color: 0xffa040, i: 1.0, flicker: true },
      { x: 302, y: 108, r: 50, color: 0x7dffb0, i: 0.8 },
      { x: 92, y: 18, r: 20, color: 0xffc070, i: 0.7 },
    ],
    ours: { x: 30, y: 60 }, theirs: { x: 290, y: 60 },
    moon: { x: 60, y: 14 }, skyH: 60,
    chimneys: [{ x: 58, y: 9 }, { x: 118, y: -1 }, { x: 198, y: 13 }, { x: 248, y: 3 }, { x: 308, y: 7 }],
  },
};

// ---------------------------------------------------------------- pomocníci

// ---------------------------------------------------------------- obloha

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Noční obloha: přechod od tmavé nahoře k fialové záři města u obzoru, hvězdy, měsíc. */
export function drawSky(h: number, moon: { x: number; y: number }): PixelCanvas {
  const p = new PixelCanvas(STREET_W, h);
  // pásy s krátkým rozptýleným přechodem (ne šum přes celou oblohu)
  const bands: [number, PalKey][] = [[0, 'ink'], [0.3, 'navy'], [0.78, 'indigo'], [0.97, 'plum']];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < STREET_W; x++) {
      const f = y / h;
      let i = 0;
      while (i + 1 < bands.length && f >= bands[i + 1][0]) i++;
      let c = bands[i][1];
      // dithering jen 4 px kolem hranice
      if (i + 1 < bands.length) {
        const by = bands[i + 1][0] * h;
        const d = by - y;
        if (d < 4 && BAYER[(y % 4) * 4 + (x % 4)] / 16 > d / 4) c = bands[i + 1][1];
      }
      p.set(x, y, c);
    }
  // pevné hvězdy (některé blikají zvlášť ve scéně)
  for (let y = 0; y < h * 0.8; y++)
    for (let x = 0; x < STREET_W; x++) if (hash(x, y, 77) > 0.994) p.set(x, y, hash(x, y, 78) > 0.6 ? 'bone' : 'fog');
  // svatozář měsíce
  for (let y = moon.y - 16; y <= moon.y + 16; y++)
    for (let x = moon.x - 16; x <= moon.x + 16; x++) {
      const d = Math.hypot(x - moon.x, y - moon.y);
      const th = BAYER[(((y % 4) + 4) % 4) * 4 + (((x % 4) + 4) % 4)] / 16;
      if (d < 16 && (16 - d) / 9 > th) p.set(x, y, d < 11 ? 'blue' : 'indigo');
    }
  // měsíc s krátery
  p.ellipse(moon.x, moon.y, 7, 7, 'bone');
  p.ellipse(moon.x + 2, moon.y + 1, 5, 5, 'white');
  p.ellipse(moon.x - 3, moon.y - 2, 1.6, 1.6, 'fog');
  p.ellipse(moon.x + 2, moon.y + 3, 1.2, 1.2, 'fog');
  p.ellipse(moon.x + 3, moon.y - 3, 1, 1, 'fog');
  p.set(moon.x - 1, moon.y + 3, 'fog');
  return p;
}

/** Mrak nasvícený měsícem (světlý lem nahoře, tmavé břicho). */
export function drawCloud(w: number, h: number, seed: number): PixelCanvas {
  const p = new PixelCanvas(w, h);
  const blobs = 4 + Math.floor(hash(seed, 1) * 3);
  for (let i = 0; i < blobs; i++) {
    const cx = 6 + (i / (blobs - 1)) * (w - 12);
    const ry = h * (0.3 + hash(seed, i + 3) * 0.25);
    p.ellipse(cx, h - ry - 1, 4 + hash(seed, i + 9) * (w / blobs), ry, 'indigo');
  }
  p.rect(2, h - 4, w - 4, 3, 'indigo');
  // stínování: horní hrana světlá, spodek tmavý
  const top: number[] = [];
  for (let x = 0; x < w; x++) {
    let t = -1;
    for (let y = 0; y < h; y++)
      if (p.get(x, y)) {
        t = y;
        break;
      }
    top.push(t);
    if (t < 0) continue;
    p.set(x, t, 'fog');
    if (hash(x, seed, 5) > 0.35) p.set(x, t + 1, 'blue');
    for (let y = h - 3; y < h; y++) if (p.get(x, y)) p.set(x, y, 'navy');
  }
  return p;
}

/** Netopýr – dva snímky mávání. */
export function drawBat(): Record<'bat0' | 'bat1', PixelCanvas> {
  const mk = (rows: string[]) => {
    const p = new PixelCanvas(rows[0].length, rows.length);
    p.template(rows);
    return p;
  };
  return {
    bat0: mk(['k.....k', 'kk.k.kk', '.kkkkk.', '...k...']),
    bat1: mk(['.......', '...k...', 'kkkkkkk', 'k..k..k']),
  };
}

/** Dlažba z kočičích hlav – nepravidelné kameny se spárami. */
function cobbles(p: PixelCanvas, y0: number, y1: number, seed: number) {
  const rowH = 5;
  for (let row = 0; y0 + row * rowH < y1; row++) {
    const y = y0 + row * rowH;
    let x = -Math.floor(hash(row, 0, seed) * 6);
    let i = 0;
    while (x < p.w) {
      const w = 5 + Math.floor(hash(row, i, seed + 3) * 5);
      const r = hash(row, i, seed + 7);
      const base: PalKey = r > 0.82 ? 'mauve' : r > 0.45 ? 'slate' : 'dusk';
      for (let yy = 0; yy < rowH; yy++)
        for (let xx = 0; xx < w; xx++) {
          const px = x + xx;
          const py = y + yy;
          if (py >= y1) continue;
          const corner = (xx === 0 || xx === w - 1) && (yy === 0 || yy === rowH - 1);
          if (yy === rowH - 1 || xx === w - 1 || corner) p.set(px, py, 'ink');
          else if (yy === 0 && xx > 0 && xx < w - 2) p.set(px, py, base === 'dusk' ? 'slate' : base === 'slate' ? 'fog' : 'tan');
          else p.set(px, py, base);
        }
      x += w;
      i++;
    }
  }
}

/** Kaluž, ve které se odráží nebe a světlo. */
function puddle(p: PixelCanvas, cx: number, cy: number, rx: number, ry: number) {
  p.ellipse(cx, cy, rx, ry, 'indigo');
  p.ellipse(cx - 1, cy, rx - 2, Math.max(1, ry - 1), 'blue');
  p.hline(cx - rx + 3, cx - rx + 6, cy - 1, 'ice');
  p.set(cx + 2, cy + 1, 'sky');
}

function brickWall(p: PixelCanvas, x0: number, y0: number, w: number, h: number, a: PalKey, b: PalKey, seed: number) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const row = Math.floor((y - y0) / 4);
      const off = row % 2 ? 4 : 0;
      const bx = Math.floor((x - x0 + off) / 8);
      const mortar = (y - y0) % 4 === 3 || (x - x0 + off) % 8 === 7;
      p.set(x, y, mortar ? 'dusk' : hash(bx, row, seed) > 0.75 ? b : a);
    }
}

function window_(p: PixelCanvas, x: number, y: number, w: number, h: number, lit: boolean, frame: PalKey = 'ink') {
  p.rect(x - 1, y - 1, w + 2, h + 2, frame);
  p.rect(x, y, w, h, lit ? 'sand' : 'indigo');
  if (lit) {
    p.rect(x, y + h - 2, w, 2, 'amber');
    p.set(x + 1, y + 1, 'white');
  } else p.set(x + 1, y + 1, 'blue');
  p.vline(x + Math.floor(w / 2), y, y + h - 1, frame);
  p.hline(x, x + w - 1, y + Math.floor(h / 2), frame);
  p.hline(x - 2, x + w + 1, y + h + 1, 'fog');
}

/** Plynová lampa na sloupu: patka na (x, foot), hlava nahoře. */
function gasLamp(p: PixelCanvas, x: number, foot: number, top: number) {
  p.rect(x - 2, foot - 3, 5, 3, 'ink');
  p.rect(x - 1, foot - 5, 3, 2, 'coal');
  p.vline(x, top + 8, foot - 5, 'coal');
  p.vline(x + 1, top + 8, foot - 5, 'ink');
  p.hline(x - 2, x + 3, top + 8, 'ink');
  // lucerna
  p.rect(x - 3, top + 1, 7, 7, 'ink');
  p.rect(x - 2, top + 2, 5, 5, 'sand');
  p.rect(x - 1, top + 3, 3, 3, 'white');
  p.hline(x - 4, x + 4, top, 'coal');
  p.hline(x - 2, x + 2, top - 1, 'coal');
  p.set(x, top - 2, 'ink');
}

function barrel(p: PixelCanvas, x: number, y: number) {
  p.rect(x, y, 10, 12, 'rust');
  p.rect(x + 1, y, 8, 12, 'copper');
  p.vline(x + 3, y, y + 11, 'ochre');
  p.hline(x, x + 9, y + 2, 'coal');
  p.hline(x, x + 9, y + 9, 'coal');
  p.hline(x + 1, x + 8, y, 'tan');
  outlineRect(p, x - 1, y - 1, 12, 14);
}

function crate(p: PixelCanvas, x: number, y: number, s = 10, c: PalKey = 'olive') {
  p.rect(x, y, s, s, c);
  p.rect(x + 1, y + 1, s - 2, s - 2, c === 'olive' ? 'rust' : 'green');
  for (let i = 1; i < s - 1; i++) p.set(x + i, y + i, c);
  p.hline(x, x + s - 1, y, 'tan');
  outlineRect(p, x - 1, y - 1, s + 2, s + 2);
}

function outlineRect(p: PixelCanvas, x: number, y: number, w: number, h: number) {
  p.hline(x, x + w - 1, y, 'ink');
  p.hline(x, x + w - 1, y + h - 1, 'ink');
  p.vline(x, y, y + h - 1, 'ink');
  p.vline(x + w - 1, y, y + h - 1, 'ink');
}

function trashCan(p: PixelCanvas, x: number, y: number) {
  p.rect(x, y + 2, 10, 12, 'slate');
  for (let i = 1; i < 10; i += 3) p.vline(x + i, y + 3, y + 13, 'fog');
  p.rect(x - 1, y, 12, 3, 'fog');
  p.rect(x + 3, y - 1, 4, 1, 'ink');
  outlineRect(p, x - 2, y - 1, 14, 16);
  // odpadky kolem
  p.set(x + 12, y + 13, 'bone');
  p.set(x + 13, y + 13, 'fog');
  p.set(x - 3, y + 14, 'sand');
}

/** Klacky a pálky povalující se po zemi (jen na ozdobu). */
function sticksOnGround(p: PixelCanvas, spots: [number, number, number][]) {
  for (const [x, y, k] of spots) {
    if (k === 0) {
      // klacek
      p.hline(x, x + 9, y, 'olive');
      p.hline(x + 2, x + 7, y - 1, 'rust');
      p.set(x + 5, y - 2, 'olive');
    } else if (k === 1) {
      // prkno s hřebíkem
      p.rect(x, y - 1, 12, 3, 'tan');
      p.hline(x, x + 11, y + 1, 'mauve');
      p.set(x + 9, y - 2, 'fog');
    } else {
      // rozbitá lahev
      p.rect(x, y - 1, 2, 2, 'green');
      p.set(x + 3, y, 'mint');
      p.set(x + 5, y - 1, 'green');
    }
  }
}

function sign(p: PixelCanvas, x: number, y: number, w: number, h: number, bg: PalKey, rim: PalKey, mug = true) {
  p.rect(x, y, w, h, 'ink');
  p.rect(x + 1, y + 1, w - 2, h - 2, rim);
  p.rect(x + 2, y + 2, w - 4, h - 4, bg);
  if (mug) {
    const cx = x + Math.floor(w / 2) - 2;
    const cy = y + Math.floor(h / 2) - 3;
    p.rect(cx, cy, 4, 6, 'sand');
    p.rect(cx, cy, 4, 2, 'white');
    p.vline(cx + 4, cy + 2, cy + 4, 'sand');
  }
}

function frog(p: PixelCanvas, x: number, y: number) {
  p.template(
    [
      '.nn..nn.',
      'nkGnnkGn',
      'nGGGGGGn',
      'GGGGGGGG',
      '.GRRRRG.',
      '..GGGG..',
    ],
    x,
    y,
  );
}

// ---------------------------------------------------------------- A: ulice s lampami

function drawA(): PixelCanvas {
  const p = new PixelCanvas(STREET_W, STREET_H);
  // domy: [x, šířka, výška střechy, zeď, lem]
  const houses: [number, number, number, PalKey, PalKey][] = [
    [0, 88, 12, 'rust', 'gold'],
    [88, 50, 24, 'tan', 'mauve'],
    [138, 46, 16, 'slate', 'fog'],
    [184, 44, 28, 'mauve', 'tan'],
    [228, 92, 12, 'pine', 'mint'],
  ];
  for (const [x, w, top, wall, trim] of houses) {
    // střecha
    for (let i = 0; i < 8; i++) p.hline(x + 8 - i, x + w - 9 + i, top + i, i % 3 === 0 ? 'ink' : 'dusk');
    p.rect(x, top + 8, w, 96 - top - 8, wall);
    p.hline(x, x + w - 1, top + 8, trim);
    p.vline(x, top + 8, 95, 'ink');
    // komín
    p.rect(x + w - 16, top - 4, 5, 8, 'maroon');
    p.hline(x + w - 17, x + w - 11, top - 5, 'ink');
  }
  // okna (některá svítí)
  for (const [x, w, top] of houses) {
    const n = Math.max(1, Math.floor(w / 22));
    for (let i = 0; i < n; i++) {
      const wx = x + Math.floor((w / n) * i + w / n / 2) - 4;
      for (let fl = 0; fl < 2; fl++) {
        const wy = top + 16 + fl * 22;
        if (wy > 70) continue;
        window_(p, wx, wy, 8, 10, hash(wx, wy, 5) > 0.45);
      }
    }
  }
  // hospody: vchody, štíty
  p.rect(14, 70, 18, 26, 'ink');
  p.rect(16, 72, 14, 24, 'olive');
  p.rect(18, 74, 10, 8, 'amber');
  p.set(27, 85, 'gold');
  sign(p, 40, 64, 16, 12, 'rust', 'gold');
  p.vline(48, 60, 63, 'ink');
  p.hline(40, 56, 60, 'ink');
  p.rect(288, 70, 18, 26, 'ink');
  p.rect(290, 72, 14, 24, 'pine');
  p.rect(292, 74, 10, 8, 'mint');
  frog(p, 262, 66);
  // zavřený krámek uprostřed (roleta)
  p.rect(148, 72, 26, 24, 'ink');
  for (let y = 73; y < 96; y += 2) p.hline(149, 172, y, y % 4 === 1 ? 'fog' : 'slate');
  // plakáty
  p.rect(100, 74, 9, 12, 'bone');
  p.rect(101, 76, 7, 3, 'red');
  p.rect(196, 76, 8, 10, 'sand');
  p.hline(197, 202, 79, 'ink');
  p.hline(197, 201, 81, 'ink');
  // okapy
  p.vline(87, 20, 95, 'fog');
  p.vline(227, 36, 95, 'fog');
  // chodník
  for (let x = 0; x < STREET_W; x++)
    for (let y = 96; y < 106; y++) p.set(x, y, (x % 12 === 0 || y === 101) ? 'mauve' : hash(x >> 2, y >> 2, 9) > 0.8 ? 'fog' : 'tan');
  p.hline(0, STREET_W - 1, 96, 'ink');
  p.rect(0, 106, STREET_W, 2, 'fog');
  p.hline(0, STREET_W - 1, 108, 'ink');
  // vozovka
  cobbles(p, 109, 166, 21);
  puddle(p, 120, 150, 12, 3);
  puddle(p, 228, 128, 9, 2);
  sticksOnGround(p, [[90, 142, 0], [204, 158, 1], [146, 122, 2], [266, 146, 0]]);
  // blízký chodník a sloupky v popředí
  p.rect(0, 166, STREET_W, 2, 'fog');
  p.rect(0, 168, STREET_W, 12, 'dusk');
  for (let x = 6; x < STREET_W; x += 40) {
    p.rect(x, 162, 5, 18, 'ink');
    p.rect(x + 1, 163, 3, 2, 'coal');
  }
  // lampy
  for (const x of [64, 160, 256]) gasLamp(p, x, 106, 44);
  // sudy a bedny u hospod
  barrel(p, 4, 84);
  crate(p, 304, 86, 9, 'pine');
  return p;
}

// ---------------------------------------------------------------- B: zadní ulička

function drawB(): PixelCanvas {
  const p = new PixelCanvas(STREET_W, STREET_H);
  brickWall(p, 0, 28, STREET_W, 82, 'rust', 'maroon', 17);
  // římsa nahoře, střešní tašky
  for (let x = 0; x < STREET_W; x++) p.vline(x, 20 + (x % 6 < 3 ? 0 : 1), 26, x % 6 === 0 ? 'ink' : 'maroon');
  p.rect(0, 26, STREET_W, 3, 'coal');
  p.hline(0, STREET_W - 1, 29, 'ink');
  // anténa a komín na střeše
  p.rect(60, 12, 6, 9, 'maroon');
  p.hline(59, 66, 11, 'ink');
  p.vline(214, 4, 20, 'coal');
  p.hline(208, 220, 7, 'coal');
  p.hline(210, 218, 10, 'coal');
  // zadní dveře Zlatého sudu (otevřené, svítí)
  p.rect(18, 62, 32, 48, 'ink');
  p.rect(20, 64, 28, 46, 'amber');
  p.rect(22, 66, 24, 44, 'sand');
  p.rect(38, 64, 10, 46, 'olive'); // pootevřené křídlo
  p.vline(38, 64, 109, 'ink');
  sign(p, 20, 40, 28, 14, 'rust', 'gold');
  // zadní dveře Žabáka (zavřené)
  p.rect(272, 62, 32, 48, 'ink');
  p.rect(274, 64, 28, 46, 'pine');
  for (let y = 68; y < 108; y += 6) p.hline(275, 300, y, 'grave');
  p.set(298, 88, 'gold');
  frog(p, 284, 44);
  // graffiti: přeškrtnutá žába
  p.template(
    [
      '..nnnn....nnnn..',
      '.nkkGn....nkkGn.',
      'nGGGGGnnnnGGGGGn',
      'GGGGGGGGGGGGGGGG',
      'GGRRRRRRRRRRRRGG',
      '.GGRRRRRRRRRRGG.',
      '..GGGGGGGGGGGG..',
    ],
    104,
    44,
  );
  for (let i = 0; i < 20; i++) {
    p.set(102 + i, 40 + i * 0.6, 'bone');
    p.set(103 + i, 40 + i * 0.6, 'bone');
    p.set(102 + i, 52 - i * 0.6, 'bone');
    p.set(103 + i, 52 - i * 0.6, 'bone');
  }
  p.set(108, 52, 'mint');
  p.set(108, 54, 'mint');
  p.set(116, 53, 'mint');
  // nástěnná lampa uprostřed (rameno + lucerna)
  p.hline(150, 160, 36, 'coal');
  p.vline(150, 32, 40, 'ink');
  p.rect(157, 37, 7, 9, 'ink');
  p.rect(158, 38, 5, 7, 'sand');
  p.rect(159, 40, 3, 3, 'white');
  // zamřížované okénko vpravo
  p.rect(228, 32, 18, 14, 'ink');
  p.rect(229, 33, 16, 12, 'blue');
  for (let x = 231; x < 245; x += 3) p.vline(x, 33, 44, 'coal');
  // okapová roura
  p.vline(196, 15, 109, 'fog');
  p.vline(197, 15, 109, 'slate');
  p.rect(194, 106, 6, 3, 'fog');
  // plakáty, cáry
  p.rect(70, 70, 12, 16, 'bone');
  p.rect(72, 73, 8, 4, 'ink');
  p.rect(72, 79, 8, 1, 'red');
  p.rect(84, 72, 9, 12, 'sand');
  p.set(92, 84, 'navy');
  // pata zdi
  p.rect(0, 108, STREET_W, 3, 'coal');
  p.hline(0, STREET_W - 1, 111, 'ink');
  // zem: dlažba, kaluže
  cobbles(p, 112, 170, 33);
  puddle(p, 96, 140, 13, 3);
  puddle(p, 210, 156, 10, 3);
  puddle(p, 176, 124, 6, 2);
  // popelnice, bedny, pálka opřená o zeď
  trashCan(p, 60, 96);
  trashCan(p, 214, 96);
  crate(p, 236, 98, 10);
  crate(p, 240, 88, 8);
  p.vline(130, 88, 110, 'tan');
  p.vline(131, 86, 101, 'ochre');
  p.vline(129, 101, 110, 'mauve');
  sticksOnGround(p, [[80, 160, 0], [150, 150, 2], [250, 130, 1]]);
  // popředí: okraj střechy
  p.rect(0, 170, STREET_W, 10, 'ink');
  for (let x = 0; x < STREET_W; x += 10) p.rect(x, 168, 9, 3, 'coal');
  return p;
}

// ---------------------------------------------------------------- C: dvorek s prádlem

function drawC(): PixelCanvas {
  const p = new PixelCanvas(STREET_W, STREET_H);
  // siluety domů za plotem
  const roofs: [number, number, number][] = [[0, 70, 22], [70, 60, 12], [130, 80, 26], [210, 50, 16], [260, 60, 20]];
  for (const [x, w, y] of roofs) {
    p.rect(x, y, w, 60 - y, 'dusk');
    for (let i = 0; i < 6; i++) p.hline(x + 6 - i, x + w - 7 + i, y - 6 + i, 'coal');
    p.rect(x + w - 14, y - 12, 4, 8, 'coal');
  }
  window_(p, 88, 16, 7, 8, true, 'coal');
  window_(p, 230, 24, 7, 8, false, 'coal');
  window_(p, 196, 30, 7, 8, true, 'coal');
  // drát s lampou přes celý dvorek
  for (let x = 0; x < STREET_W; x++) p.set(x, 22 + Math.round(Math.pow((x - 160) / 160, 2) * -8) + 8, 'ink');
  // šňůry s prádlem
  const line = (y0: number, x0: number, x1: number) => {
    for (let x = x0; x <= x1; x++) p.set(x, y0 + Math.round(Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * 4), 'fog');
  };
  line(40, 0, 120);
  line(44, 200, 319);
  const cloth = (x: number, y: number, kind: number, c: PalKey) => {
    if (kind === 0) {
      // košile
      p.rect(x, y, 10, 9, c);
      p.rect(x - 2, y, 2, 4, c);
      p.rect(x + 10, y, 2, 4, c);
      p.vline(x + 5, y + 1, y + 8, 'ink');
    } else if (kind === 1) {
      // ponožka
      p.rect(x, y, 3, 7, c);
      p.rect(x, y + 6, 5, 2, c);
    } else {
      // trenky
      p.rect(x, y, 9, 4, c);
      p.rect(x, y + 4, 4, 3, c);
      p.rect(x + 5, y + 4, 4, 3, c);
    }
    p.set(x + 1, y - 1, 'tan');
  };
  cloth(16, 43, 0, 'sky');
  cloth(36, 45, 1, 'scarlet');
  cloth(46, 45, 2, 'bone');
  cloth(64, 44, 0, 'sand');
  cloth(86, 43, 1, 'mint');
  cloth(212, 48, 2, 'plum');
  cloth(232, 47, 0, 'bone');
  cloth(254, 48, 1, 'gold');
  cloth(276, 47, 0, 'red');
  // dřevěný plot
  for (let x = 0; x < STREET_W; x += 7) {
    const top = 58 + Math.floor(hash(x, 0, 4) * 4);
    p.rect(x, top, 6, 112 - top, hash(x, 1, 4) > 0.5 ? 'rust' : 'olive');
    p.vline(x + 1, top + 1, 110, 'copper');
    p.hline(x, x + 5, top, 'ink');
    p.vline(x + 6, top, 111, 'ink');
    if (hash(x, 2, 4) > 0.7) p.set(x + 3, top + 10, 'ink');
  }
  p.rect(0, 70, STREET_W, 3, 'olive');
  p.rect(0, 98, STREET_W, 3, 'olive');
  p.hline(0, STREET_W - 1, 73, 'ink');
  p.hline(0, STREET_W - 1, 101, 'ink');
  // kočka na plotě
  p.template(
    [
      'k...k....',
      'kk.kk....',
      'kgkgk....',
      'kkkkk...k',
      '.kkkkkkkk',
      '.kkkkkkk.',
      '.k.k.k.k.',
    ],
    180,
    52,
  );
  // vrátka hospod po stranách
  p.rect(0, 74, 26, 38, 'ink');
  p.rect(2, 76, 22, 36, 'amber');
  p.rect(4, 78, 18, 34, 'sand');
  sign(p, 4, 58, 20, 12, 'rust', 'gold');
  p.rect(294, 74, 26, 38, 'ink');
  p.rect(296, 76, 22, 36, 'pine');
  frog(p, 302, 62);
  // zem: udusaná hlína + kameny, kaluže
  for (let y = 112; y < 170; y++)
    for (let x = 0; x < STREET_W; x++) {
      const r = hash(x, y, 41);
      p.set(x, y, r > 0.96 ? 'mauve' : r > 0.7 ? 'olive' : 'dusk');
    }
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(hash(i, 1, 9) * STREET_W);
    const y = 114 + Math.floor(hash(i, 2, 9) * 54);
    p.rect(x, y, 3, 2, 'slate');
    p.hline(x, x + 2, y + 2, 'ink');
    p.set(x, y, 'fog');
  }
  p.hline(0, STREET_W - 1, 112, 'ink');
  puddle(p, 140, 146, 14, 3);
  puddle(p, 250, 130, 8, 2);
  // sudy Zlatého sudu, bedny Žabáka
  barrel(p, 30, 98);
  barrel(p, 42, 100);
  crate(p, 262, 100, 10, 'pine');
  crate(p, 276, 102, 8, 'pine');
  sticksOnGround(p, [[70, 156, 0], [190, 160, 1], [110, 126, 0], [226, 150, 2]]);
  // popředí: tráva a kamení
  p.rect(0, 170, STREET_W, 10, 'coal');
  for (let x = 0; x < STREET_W; x += 2) p.vline(x, 167 + Math.floor(hash(x, 3, 2) * 3), 170, hash(x, 4, 2) > 0.5 ? 'pine' : 'grave');
  return p;
}

export function drawStreetVariant(v: StreetVariant): PixelCanvas {
  return v === 'A' ? drawA() : v === 'B' ? drawB() : drawC();
}

/** Visací lucerna pro variantu C (houpe se samostatně). */
export function drawHangingLamp(): PixelCanvas {
  const p = new PixelCanvas(9, 14);
  p.vline(4, 0, 4, 'ink');
  p.hline(1, 7, 4, 'coal');
  p.rect(1, 5, 7, 7, 'ink');
  p.rect(2, 6, 5, 5, 'sand');
  p.rect(3, 7, 3, 3, 'white');
  p.hline(2, 6, 12, 'coal');
  p.set(4, 13, 'ink');
  return p;
}

// ---------------------------------------------------------------- zbraně (jen na ozdobu)

export const WEAPONS = ['bat', 'stick', 'plank', 'pipe', 'leg', 'broom'] as const;
export type WeaponId = (typeof WEAPONS)[number];

/** Zbraně kreslené svisle, rukojeť dole. */
export function drawWeapons(): Record<WeaponId, PixelCanvas> {
  const mk = (rows: string[]) => {
    const p = new PixelCanvas(rows[0].length, rows.length);
    p.template(rows);
    return p.outline('ink');
  };
  return {
    // pálka
    bat: mk(['.oo.', '.oo.', '.oc.', '.oc.', '.cc.', '..c.', '..t.', '..t.', '..t.', '..t.', '.kk.']),
    // klacek se suky
    stick: mk(['..O..', '..u..', '.Ou..', '..uO.', '..u..', '.Ou..', '..u..', '..u..', '..O..', '..u..']),
    // prkno s hřebíkem
    plank: mk(['f..', 'ttt', 'ttm', 'ttm', 'ttm', 'ttm', 'ttm', 'tm.', '.m.', '.m.', '.m.']),
    // trubka
    pipe: mk(['.ff', '.fs', '.fs', '.fs', '.fs', '.fs', '.fs', '.fs', '.fs', '.ff']),
    // noha od židle
    leg: mk(['cc', 'uu', 'cc', 'uc', 'uc', 'cc', 'uu', 'uc', 'uc', 'cc']),
    // koště
    broom: mk(['oyoyo', 'yoyoy', 'yyoyy', '.yyy.', '..u..', '..u..', '..u..', '..u..', '..u..', '..u..', '..u..']),
  };
}

/** Zbraně jako textura (sdílí ulice i nájezd v hospodě). */
export function ensureWeapons(scene: Phaser.Scene) {
  if (!scene.textures.exists('streetWeapons')) addAtlas(scene, 'streetWeapons', drawWeapons());
}
