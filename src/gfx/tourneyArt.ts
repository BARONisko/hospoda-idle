import Phaser from 'phaser';
import { PixelCanvas, addImage, addAtlas, hash } from './pixel';
import type { PalKey } from '../data/palette';
import { t } from '../i18n';

// Turnaje (styl „Hospodský turnaj“): cihlová zeď s diváky, terč na šipky, křídová tabule,
// kulečníkový stůl se zeleným suknem, koule, tágo, poháry do vitríny a plakát v hospodě.
// Scény turnaje kreslí v logickém rozlišení 320×180 a zvětšují 4×.

export const TW = 320;
export const TH = 180;
export const TK = 4;

/** Cihlová zeď (teplá hospoda). */
function bricks(p: PixelCanvas, x0 = 0, y0 = 0, w = TW, h = TH) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const row = Math.floor(y / 12);
      const sx = x + (row % 2) * 20;
      let c: PalKey = hash(Math.floor(sx / 40), row, 7) < 0.3 ? 'copper' : 'rust';
      if (y % 12 === 0 || sx % 40 === 0) c = 'olive';
      else if (y % 12 === 1 && c === 'copper') c = 'ochre';
      else if (hash(x, y, 8) < 0.03) c = 'mauve';
      p.set(x, y, c);
    }
}

/** Siluety diváků dole (2 snímky – pohupují se). */
function crowd(p: PixelCanvas, f: number, skip: [number, number] | null) {
  for (let i = 0; i < 16; i++) {
    const x = 6 + i * 20 + (i % 3) * 4;
    if (skip && x > skip[0] && x < skip[1]) continue;
    const y = 174 - (i % 3) * 3 - ((i + f) % 2);
    p.ellipse(x, y, 9, 11, 'ink');
    p.ellipse(x, y - 14, 5.5, 5.5, 'ink');
    if (i % 4 === 1) p.rect(x - 6, y - 21, 12, 2, 'ink'); // klobouk
    if (i % 5 === 2) p.rect(x + 7, y - 16 - f * 2, 3, 6, 'ink'); // zvednutý půllitr
  }
}

/** Pozadí siloměru „Kladivo na zvon“: zeď, pouťové praporky, tabule vpravo, diváci. */
function boxBg(f: number): PixelCanvas {
  const p = new PixelCanvas(TW, TH);
  bricks(p);
  p.rect(0, 150, TW, 30, 'olive');
  for (let x = 0; x < TW; x += 24) p.vline(x, 150, 179, 'ink');
  p.hline(0, TW - 1, 150, 'copper');
  // křídová tabule vpravo (výsledky)
  const bx = 214;
  const by = 14;
  p.rect(bx - 3, by - 3, 104, 98, 'rust');
  p.hline(bx - 3, bx + 100, by - 3, 'copper');
  p.rect(bx, by, 98, 92, 'grave');
  for (let i = 0; i < 70; i++) p.set(bx + hash(i, 1, 5) * 98, by + hash(i, 2, 5) * 92, 'sage');
  // pouťové praporky přes zeď
  const flags: PalKey[] = ['scarlet', 'gold', 'sky', 'mint', 'amber', 'plum'];
  for (let x = 0; x < 206; x++) {
    const y = 6 + Math.round(Math.sin((x / 206) * Math.PI) * 10);
    p.set(x, y, 'ink');
    if (x % 12 === 2) for (let j = 0; j < 7; j++) p.hline(x + Math.ceil(j / 2), x + 8 - Math.ceil(j / 2), y + 1 + j, flags[Math.floor(x / 12) % flags.length]);
  }
  // plakát „Silák“ vlevo
  p.rect(18, 40, 26, 34, 'bone');
  p.rect(20, 42, 22, 6, 'red');
  p.ellipse(31, 56, 4, 4, 'ink');
  p.rect(25, 60, 12, 9, 'ink');
  p.rect(20, 59, 5, 3, 'ink');
  p.rect(37, 59, 5, 3, 'ink');
  p.rect(18, 57, 26, 1, 'slate'); // činka
  p.rect(16, 55, 3, 5, 'slate');
  p.rect(43, 55, 3, 5, 'slate');
  crowd(p, f, [70, 160]);
  return p;
}

/** Sloup siloměru (36×146): dřevěný sloup se stupnicí, kolejnice pro jezdce, dole terč; zvon je zvlášť. */
export const STRIKER = { w: 36, h: 146, top: 10, bot: 130 };
function strikerTower(): PixelCanvas {
  const { w: W, h: H, top, bot } = STRIKER;
  const p = new PixelCanvas(W, H);
  for (let y = 6; y < H - 12; y++)
    for (let x = 8; x < 28; x++) {
      const u = (x - 8) / 20;
      p.set(x, y, u < 0.15 ? 'sand' : u < 0.6 ? 'amber' : u < 0.85 ? 'ochre' : 'copper');
    }
  // barevné pásy stupnice (zdola zelená → nahoře červená)
  const bands: PalKey[] = ['green', 'mint', 'gold', 'amber', 'scarlet'];
  for (let i = 0; i < 5; i++) {
    const y0 = Math.round(bot - ((i + 1) * (bot - top)) / 5);
    const y1 = Math.round(bot - (i * (bot - top)) / 5);
    for (let y = y0; y < y1; y++) for (const x of [8, 9, 10, 25, 26, 27]) p.set(x, y, bands[i]);
    p.hline(8, 27, y0, 'ink');
  }
  // kolejnice uprostřed
  p.rect(16, top - 2, 4, bot - top + 4, 'coal');
  p.vline(17, top - 2, bot + 1, 'slate');
  p.vline(18, top - 2, bot + 1, 'fog');
  for (let i = 1; i < 10; i++) {
    const y = Math.round(bot - (i * (bot - top)) / 10);
    p.hline(12, 14, y, 'olive');
    p.hline(21, 23, y, 'olive');
  }
  // držák zvonu nahoře
  p.rect(6, 0, 24, 6, 'rust');
  p.hline(6, 29, 0, 'copper');
  // podstavec s terčem (na něj dopadne kladivo)
  p.rect(2, H - 12, 32, 12, 'coal');
  p.hline(2, 33, H - 12, 'slate');
  p.rect(10, H - 16, 16, 4, 'red');
  p.hline(10, 25, H - 16, 'scarlet');
  p.rect(16, H - 18, 4, 2, 'fog');
  return p.outline('ink');
}

/** Zvon nahoře (16×14). */
function strikerBell(): PixelCanvas {
  const p = new PixelCanvas(16, 14);
  p.rect(7, 0, 2, 2, 'slate');
  for (let y = 2; y < 12; y++) {
    const r = 2 + Math.round(((y - 2) / 10) * 5.5);
    for (let x = 8 - r; x < 8 + r; x++) p.set(x, y, x < 8 - r + 2 ? 'sand' : x > 8 + r - 3 ? 'amber' : 'gold');
  }
  p.hline(0, 15, 12, 'amber');
  p.rect(7, 12, 2, 2, 'olive');
  p.set(5, 4, 'white');
  return p.outline('ink');
}

/** Jezdec na kolejnici (10×6). */
function strikerPuck(): PixelCanvas {
  const p = new PixelCanvas(10, 6);
  p.rect(0, 0, 10, 6, 'red');
  p.hline(0, 9, 0, 'scarlet');
  p.hline(0, 9, 5, 'blood');
  p.set(2, 1, 'white');
  return p.outline('ink');
}

/** Pouťové kladivo (20×40, hlavou nahoru; ve hře se otáčí kolem konce násady). */
function strikerHammer(): PixelCanvas {
  const p = new PixelCanvas(20, 40);
  p.rect(9, 10, 3, 30, 'tan');
  p.vline(9, 10, 39, 'bone');
  p.rect(8, 34, 5, 6, 'rust'); // omotaná rukojeť
  p.hline(8, 12, 36, 'blood');
  p.rect(1, 0, 18, 11, 'copper');
  p.rect(1, 0, 18, 2, 'ochre');
  p.rect(1, 9, 18, 2, 'rust');
  p.rect(0, 1, 2, 9, 'slate'); // kovové obruče
  p.rect(18, 1, 2, 9, 'slate');
  return p.outline('ink');
}

/** Pozadí šipek: zeď, polička s poháry, tabule je zvlášť (texty). */
function dartsBg(f: number): PixelCanvas {
  const p = new PixelCanvas(TW, TH);
  bricks(p);
  // dřevěné obložení dole
  p.rect(0, 150, TW, 30, 'olive');
  for (let x = 0; x < TW; x += 24) p.vline(x, 150, 179, 'ink');
  p.hline(0, TW - 1, 150, 'copper');
  // křídová tabule vpravo
  const bx = 214;
  const by = 14;
  p.rect(bx - 3, by - 3, 104, 98, 'rust');
  p.hline(bx - 3, bx + 100, by - 3, 'copper');
  p.rect(bx, by, 98, 92, 'grave');
  for (let i = 0; i < 70; i++) p.set(bx + hash(i, 1, 3) * 98, by + hash(i, 2, 3) * 92, 'sage');
  p.rect(bx + 4, by + 93, 20, 2, 'bone'); // křída na liště
  // lampa nad terčem
  p.rect(108, 0, 8, 3, 'ink');
  crowd(p, f, [120, 180]);
  return p;
}

/** Terč (bez čísel – ta se píšou textem). R = 62 px. */
export const BOARD_R = 62;
function dartboard(g?: { bull: number; outer: number; t0: number; t1: number; d0: number }): PixelCanvas {
  // poloměry v px (výchozí jako v P.U.B.; šipky v Idle je zvětšují vylepšeními)
  const bull = g ? g.bull * BOARD_R : 3.2, outer = g ? g.outer * BOARD_R : 7;
  const t0 = g ? g.t0 * BOARD_R : 34, t1 = g ? g.t1 * BOARD_R : 39, d0 = g ? g.d0 * BOARD_R : BOARD_R - 6;
  const S = BOARD_R * 2 + 26;
  const p = new PixelCanvas(S, S);
  const cx = S / 2;
  const cy = S / 2;
  p.ellipse(cx, cy + 2, BOARD_R + 12, BOARD_R + 12, 'ink');
  p.ellipse(cx, cy, BOARD_R + 11, BOARD_R + 11, 'coal');
  p.ellipse(cx, cy, BOARD_R + 10, BOARD_R + 10, 'dusk');
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > BOARD_R) continue;
      const s = dartSegment(x + 0.5 - cx, y + 0.5 - cy) % 2;
      let c: PalKey = s ? 'bone' : 'ink';
      if (d > d0 || (d > t0 && d < t1)) c = s ? 'green' : 'red';
      if (d < outer) c = 'green';
      if (d < bull) c = 'red';
      p.set(x, y, c);
    }
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2 - Math.PI / 2 - Math.PI / 20;
    for (let r = Math.ceil(outer); r < BOARD_R; r++) if (r % 3) p.set(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 'fog');
  }
  for (const r of [outer, t0, t1, d0]) for (let a = 0; a < Math.PI * 2; a += 0.02) if (Math.floor(a * 40) % 3) p.set(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 'fog');
  return p;
}

/** terč pro Idle šipky s poloměry podle vylepšení (zlomky BOARD_R) */
export function makeDartboard(scene: Phaser.Scene, key: string, g: { bull: number; outer: number; t0: number; t1: number; d0: number }) {
  addImage(scene, key, dartboard(g));
}

/** Index výseče (0 = 20 nahoře, po směru hodin). */
export function dartSegment(dx: number, dy: number): number {
  const a = Math.atan2(dx, -dy); // 0 nahoře, kladně doprava
  return Math.floor((((a + Math.PI / 20) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 10));
}
export const BOARD_NUMS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

/** Body za zásah v souřadnicích terče (px od středu). */
export function dartScore(dx: number, dy: number): { pts: number; label: string } {
  const d = Math.hypot(dx, dy);
  if (d > BOARD_R) return { pts: 0, label: t('Vedle!') };
  if (d < 3.2) return { pts: 50, label: 'BULL!' };
  if (d < 7) return { pts: 25, label: '25' };
  const n = BOARD_NUMS[dartSegment(dx, dy)];
  if (d > BOARD_R - 6) return { pts: n * 2, label: `D${n}` };
  if (d > 34 && d < 39) return { pts: n * 3, label: `T${n}` };
  return { pts: n, label: String(n) };
}

/** Šipka v letu / zabodnutá (zezadu – vidíš letky). */
function dart(c: PalKey, c2: PalKey): PixelCanvas {
  const p = new PixelCanvas(14, 14);
  // tělo šikmo doprava nahoru
  for (let i = 0; i < 9; i++) {
    p.set(2 + i, 11 - i, 'fog');
    p.set(3 + i, 11 - i, 'slate');
  }
  p.set(1, 12, 'white');
  p.rect(10, 1, 3, 3, c);
  p.set(11, 0, c2);
  p.set(13, 2, c2);
  p.set(9, 3, c2);
  return p.outline('ink');
}

/** Ruka s šipkou (dole na obrazovce). */
function hand(): PixelCanvas {
  const p = new PixelCanvas(60, 46);
  p.ellipse(34, 40, 22, 14, 'skin');
  p.ellipse(30, 36, 8, 6, 'tan');
  p.ellipse(42, 32, 5, 4, 'skin');
  p.rect(20, 40, 30, 6, 'red'); // rukáv
  p.hline(20, 49, 40, 'scarlet');
  for (let i = 0; i < 24; i++) {
    p.set(32 - i * 0.9, 30 - i * 1.1, 'fog');
    p.set(33 - i * 0.9, 30 - i * 1.1, 'slate');
  }
  p.rect(8, 2, 6, 5, 'scarlet');
  p.set(9, 1, 'red');
  return p.outline('ink');
}

// ------------------------------------------------------------ kulečník
/** Hrací plocha (sukno) v logických px: levý horní roh a rozměr. */
export const TABLE = { x: 30, y: 34, w: 260, h: 128 };
export const POCKETS = [
  { x: TABLE.x, y: TABLE.y }, { x: TABLE.x + TABLE.w / 2, y: TABLE.y - 2 }, { x: TABLE.x + TABLE.w, y: TABLE.y },
  { x: TABLE.x, y: TABLE.y + TABLE.h }, { x: TABLE.x + TABLE.w / 2, y: TABLE.y + TABLE.h + 2 }, { x: TABLE.x + TABLE.w, y: TABLE.y + TABLE.h },
];
export const BALL_R = 4.4;

function poolBg(f: number): PixelCanvas {
  const p = new PixelCanvas(TW, TH);
  bricks(p);
  const { x: tx, y: ty, w: tw, h: th } = TABLE;
  // stín stolu
  p.rect(tx - 10, ty + th + 12, tw + 20, 6, 'olive');
  // mantinely (dřevo) s diamanty
  p.rect(tx - 12, ty - 12, tw + 24, th + 24, 'ink');
  p.rect(tx - 11, ty - 11, tw + 22, th + 22, 'rust');
  p.rect(tx - 11, ty - 11, tw + 22, 3, 'copper');
  p.rect(tx - 11, ty + th + 8, tw + 22, 3, 'olive');
  for (let i = 1; i < 8; i++) {
    if (i === 4) continue;
    p.set(tx + (i * tw) / 8, ty - 6, 'bone');
    p.set(tx + (i * tw) / 8, ty + th + 5, 'bone');
  }
  for (let i = 1; i < 4; i++) {
    p.set(tx - 6, ty + (i * th) / 4, 'bone');
    p.set(tx + tw + 5, ty + (i * th) / 4, 'bone');
  }
  // gumové mantinely a sukno
  p.rect(tx - 3, ty - 3, tw + 6, th + 6, 'pine');
  p.rect(tx, ty, tw, th, 'green');
  for (let y = ty; y < ty + th; y++) for (let x = tx; x < tx + tw; x++) if (hash(x, y, 9) < 0.05) p.set(x, y, 'mint');
  // čára a značka pro bílou
  for (let y = ty + 2; y < ty + th; y += 3) p.set(tx + 64, y, 'mint');
  p.set(tx + 64, ty + th / 2, 'white');
  p.set(tx + 195, ty + th / 2, 'mint');
  // kapsy
  for (const k of POCKETS) {
    p.ellipse(k.x, k.y, 7.5, 7.5, 'ink');
    p.ellipse(k.x, k.y, 5.5, 5.5, 'coal');
  }
  // lampy nad stolem (jen kryty nahoře)
  for (const x of [90, 230]) {
    p.rect(x - 14, 0, 28, 6, 'pine');
    p.hline(x - 14, x + 13, 6, 'sand');
  }
  // diváci jen po stranách (stůl nezakrývají)
  for (const [x, y] of [[6, 120], [8, 150], [312, 110], [314, 146]]) {
    p.ellipse(x, y + f, 7, 10, 'ink');
    p.ellipse(x, y - 13 + f, 5, 5, 'ink');
  }
  return p;
}

export const BALL_COLORS: PalKey[] = ['white', 'gold', 'blue', 'red', 'plum', 'ochre', 'green', 'maroon', 'ink', 'gold', 'blue', 'red', 'plum', 'ochre', 'green', 'maroon'];

function ball(n: number): PixelCanvas {
  const p = new PixelCanvas(11, 11);
  const c = BALL_COLORS[n];
  for (let y = 0; y < 11; y++)
    for (let x = 0; x < 11; x++) {
      const dx = x + 0.5 - 5.5;
      const dy = y + 0.5 - 5.5;
      const d = Math.hypot(dx, dy);
      if (d > BALL_R + 0.2) continue;
      let k: PalKey = n >= 9 ? (Math.abs(dy) <= 1.6 ? c : 'white') : c;
      if (d > BALL_R - 0.9) k = n === 0 || (n >= 9 && k === 'white') ? 'fog' : n === 8 ? 'ink' : k === 'white' ? 'fog' : 'ink';
      p.set(x, y, k);
    }
  if (n > 0) {
    // bílé kolečko s číslem (tečka)
    p.rect(4, 4, 3, 3, 'white');
    p.set(5, 5, n === 8 ? 'ink' : c);
  }
  p.set(3, 3, 'white');
  p.set(4, 2, 'white');
  return p;
}

/** Tágo (špička vlevo na x = 0). */
function cue(): PixelCanvas {
  const p = new PixelCanvas(150, 4);
  for (let x = 0; x < 150; x++) {
    const c: PalKey = x < 3 ? 'sky' : x < 6 ? 'bone' : x < 95 ? 'sand' : x < 100 ? 'ink' : 'rust';
    const c2: PalKey = x < 3 ? 'blue' : x < 6 ? 'fog' : x < 95 ? 'ochre' : x < 100 ? 'ink' : 'blood';
    p.set(x, 1, c);
    p.set(x, 2, c2);
    if (x > 100) {
      p.set(x, 0, 'rust');
      p.set(x, 3, 'blood');
    }
  }
  return p;
}

// ------------------------------------------------------------ do hospody
/** Pohár do vitríny: šipky (terčík) nebo kulečník (osmička). */
function cup(kind: 'darts' | 'pool' | 'box'): PixelCanvas {
  const p = new PixelCanvas(12, 15);
  p.rect(2, 12, 8, 3, 'olive');
  p.hline(2, 9, 12, 'rust');
  p.rect(5, 9, 2, 3, 'gold');
  p.rect(2, 2, 8, 7, 'gold');
  p.hline(1, 10, 1, 'sand');
  p.vline(2, 2, 8, 'sand');
  p.vline(9, 2, 8, 'amber');
  p.set(0, 3, 'gold');
  p.set(0, 4, 'gold');
  p.set(11, 3, 'gold');
  p.set(11, 4, 'gold');
  if (kind === 'darts') {
    p.ellipse(6, 5, 2.4, 2.4, 'red');
    p.set(6, 5, 'white');
  } else if (kind === 'box') {
    p.rect(4, 3, 5, 2, 'copper'); // kladívko
    p.vline(6, 5, 7, 'tan');
    p.set(4, 3, 'ochre');
  } else {
    p.ellipse(6, 5, 2.4, 2.4, 'ink');
    p.set(6, 5, 'white');
  }
  return p.outline('ink');
}

/** Plakát „TURNAJ“ na zeď hospody. */
function poster(kind: 'darts' | 'pool' | 'box'): PixelCanvas {
  const p = new PixelCanvas(14, 16);
  p.rect(0, 0, 14, 16, 'bone');
  p.hline(0, 13, 0, 'white');
  p.rect(1, 1, 12, 3, kind === 'darts' ? 'red' : kind === 'box' ? 'blue' : 'green');
  if (kind === 'box') {
    p.vline(10, 5, 13, 'amber'); // sloup siloměru se zvonem
    p.rect(9, 4, 3, 2, 'gold');
    p.set(10, 9, 'red');
    p.rect(2, 9, 5, 3, 'copper'); // kladivo
    p.vline(4, 12, 13, 'tan');
  } else if (kind === 'darts') {
    p.ellipse(7, 9, 4, 4, 'ink');
    p.ellipse(7, 9, 3, 3, 'bone');
    p.ellipse(7, 9, 1.5, 1.5, 'red');
  } else {
    p.ellipse(5, 9, 2.3, 2.3, 'ink');
    p.ellipse(9, 10, 2.3, 2.3, 'gold');
    p.set(5, 9, 'white');
  }
  p.hline(2, 11, 14, 'slate');
  p.set(7, 0, 'red');
  return p.outline('ink');
}


// ------------------------------------------------------------ karta turnaje
/** Rozměr karty soupeře (logické px; na obrazovce 4×). */
export const CARD_W = 190;
export const CARD_H = 95;
/** Hvězdička 5×5. */
function star(p: PixelCanvas, x: number, y: number, c: PalKey) {
  p.hline(x - 2, x + 2, y, c);
  p.vline(x, y - 2, y + 2, c);
  p.set(x - 1, y + 1, c);
  p.set(x + 1, y + 1, c);
}

/** Papírový plakát připíchnutý na zdi: čistý papír (text musí být čitelný), potrhaný okraj,
 *  rudá (šipky) / zelená (kulečník) stuha s nadpisem, připínáčky v rozích. */
function paper(kind: 'darts' | 'pool' | 'box' | 'game', W: number, H: number): PixelCanvas {
  const p = new PixelCanvas(W, H);
  for (let y = 2; y < H - 2; y++)
    for (let x = 2; x < W - 2; x++) {
      const edge = Math.min(x - 2, y - 2, W - 3 - x, H - 3 - y);
      if (edge === 0 && hash(x, y, 31) < 0.35) continue;
      p.set(x, y, edge < 2 && hash(x, y, 34) < 0.3 ? 'tan' : 'bone');
    }
  // stín papíru vpravo dole
  for (let x = 4; x < W; x++) p.set(x, H - 2, 'ink');
  for (let y = 4; y < H - 1; y++) p.set(W - 2, y, 'ink');
  // stuha s ocásky
  const [mid, hi, sh]: PalKey[] = kind === 'darts' ? ['red', 'scarlet', 'blood'] : kind === 'box' ? ['blue', 'sky', 'navy'] : kind === 'game' ? ['rust', 'copper', 'maroon'] : ['pine', 'green', 'ink'];
  const ry = 5;
  p.rect(14, ry, W - 28, 15, mid);
  p.hline(14, W - 15, ry, hi);
  p.hline(14, W - 15, ry + 14, sh);
  for (const [x0, dir] of [[14, -1], [W - 15, 1]] as const)
    for (let i = 1; i <= 9; i++) {
      const notch = i > 6 ? Math.abs(i - 6) : 0;
      for (let y = ry + 3 + notch; y < ry + 17 - notch; y++) p.set(x0 + dir * i, y, sh);
    }
  star(p, 22, ry + 7, 'gold');
  star(p, W - 23, ry + 7, 'gold');
  // připínáčky
  for (const [x, y] of [[6, 6], [W - 8, 6], [6, H - 8], [W - 9, H - 9]]) {
    p.ellipse(x + 1, y + 1, 2.5, 2.5, 'blood');
    p.ellipse(x, y, 2.3, 2.3, 'scarlet');
    p.set(x - 1, y - 1, 'white');
  }
  return p;
}

/** Karta soupeře: plakát + fotka (polaroid se „slunečními“ paprsky). */
function cardPoster(kind: 'darts' | 'pool' | 'box'): PixelCanvas {
  const p = paper(kind, CARD_W, CARD_H);
  const fx = 10;
  const fy = 27;
  p.rect(fx, fy, 46, 60, 'white');
  for (let y = fy + 3; y < fy + 49; y++)
    for (let x = fx + 3; x < fx + 43; x++) {
      const ang = Math.atan2(y - (fy + 50), x - (fx + 23)) + Math.PI;
      p.set(x, y, Math.floor((ang / (Math.PI * 2)) * 20) % 2 ? 'sand' : 'gold');
    }
  p.hline(fx, fx + 45, fy + 59, 'fog');
  p.vline(fx + 45, fy, fy + 59, 'fog');
  // páska přes roh fotky
  for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) p.set(fx - 3 + i + j, fy - 2 + i - j, 'sand');
  // čárkovaná linka pod jménem
  for (let x = 64; x < CARD_W - 12; x += 3) p.set(x, 46, 'tan');
  return p;
}

export const GCARD_W = 210;
export const GCARD_H = 170;
/** Karta před minihrou: jmenovka (polaroid + jméno + hláška) a pod ní „Jak na to“. */
function gameCard(): PixelCanvas {
  const W = GCARD_W;
  const p = paper('game', W, GCARD_H);
  const fx = 10;
  const fy = 30;
  p.rect(fx, fy, 46, 56, 'white');
  for (let y = fy + 3; y < fy + 46; y++)
    for (let x = fx + 3; x < fx + 43; x++) {
      const ang = Math.atan2(y - (fy + 47), x - (fx + 23)) + Math.PI;
      p.set(x, y, Math.floor((ang / (Math.PI * 2)) * 20) % 2 ? 'sand' : 'gold');
    }
  p.hline(fx, fx + 45, fy + 55, 'fog');
  p.vline(fx + 45, fy, fy + 55, 'fog');
  for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) p.set(fx - 3 + i + j, fy - 2 + i - j, 'sand');
  // čárkovaná linka pod jménem a oddělení „Jak na to“
  for (let x = 64; x < W - 12; x += 3) p.set(x, 46, 'tan');
  for (let x = 12; x < W - 12; x += 3) p.set(x, 94, 'tan');
  return p;
}


/** Pouťový siloměr do salonku (20×46, spodní střed = nohy). Varianty A/B/C pro výběr vzhledu. */
function strongman(v: 'A' | 'B' | 'C'): PixelCanvas {
  const W = 20, H = 46;
  const p = new PixelCanvas(W, H);
  const cx = 10;
  // podstavec s terčem
  p.rect(3, H - 7, 14, 6, 'ink');
  p.rect(4, H - 6, 12, 4, v === 'B' ? 'copper' : 'maroon');
  p.hline(4, 15, H - 6, v === 'B' ? 'tan' : 'red');
  p.ellipse(cx, H - 6, 3, 1, 'ink');
  p.ellipse(cx, H - 6, 2, 1, v === 'C' ? 'gold' : 'scarlet');
  // sloup
  const top = 7;
  p.rect(cx - 3, top, 6, H - 7 - top, 'ink');
  if (v === 'A') {
    // červenobílé pruhy jako na pouti
    for (let y = top + 1; y < H - 7; y++) p.hline(cx - 2, cx + 1, y, Math.floor((y - top) / 4) % 2 ? 'bone' : 'red');
  } else if (v === 'B') {
    // dřevěný sloup se stupnicí a žárovkami
    p.rect(cx - 2, top + 1, 4, H - 8 - top, 'tan');
    p.vline(cx + 1, top + 1, H - 8, 'ochre');
    for (let y = top + 3; y < H - 8; y += 4) p.set(cx - 3, y, y < top + 12 ? 'gold' : y < top + 22 ? 'amber' : 'red');
  } else {
    // modrý sloup s barevnou škálou (zelená → červená)
    p.rect(cx - 2, top + 1, 4, H - 8 - top, 'blue');
    const cols = ['red', 'red', 'amber', 'amber', 'gold', 'green', 'green', 'green'] as const;
    for (let i = 0; i < cols.length; i++) p.rect(cx - 1, top + 2 + i * 4, 2, 3, cols[i]);
  }
  // jezdec (dole na kolejnici)
  p.rect(cx - 2, H - 12, 4, 2, 'white');
  p.hline(cx - 2, cx + 1, H - 10, 'slate');
  // zvon nahoře
  p.rect(cx - 3, top - 1, 6, 1, 'ink');
  p.ellipse(cx, top - 3, 3, 3, 'ink');
  p.ellipse(cx, top - 3, 2, 2, 'gold');
  p.set(cx - 1, top - 4, 'white');
  p.set(cx, top + 0, 'ochre');
  // kladivo opřené o podstavec vpravo
  p.vline(17, H - 18, H - 3, 'ink');
  p.vline(16, H - 17, H - 3, 'tan');
  p.rect(14, H - 21, 6, 4, 'ink');
  p.rect(15, H - 20, 4, 2, v === 'B' ? 'slate' : 'copper');
  if (v === 'C') {
    // praporek nahoře
    p.hline(0, 3, 4, 'ink'); p.set(1, 5, 'red'); p.set(2, 5, 'gold');
    p.hline(16, 19, 4, 'ink'); p.set(17, 5, 'green'); p.set(18, 5, 'gold');
  }
  return p;
}

export function buildTourneyArt(scene: Phaser.Scene) {
  addImage(scene, 'gcard', gameCard());
  for (const k of ['darts', 'pool', 'box'] as const) {
    addImage(scene, `tcard_${k}`, cardPoster(k));
    addImage(scene, `thelp_${k}`, paper(k, 240, 152));
  }
  addImage(scene, 'dartsBg0', dartsBg(0));
  addImage(scene, 'dartsBg1', dartsBg(1));
  addImage(scene, 'poolBg0', poolBg(0));
  addImage(scene, 'poolBg1', poolBg(1));
  addImage(scene, 'boxBg0', boxBg(0));
  addImage(scene, 'boxBg1', boxBg(1));
  addImage(scene, 'strikerTower', strikerTower());
  addImage(scene, 'strikerBell', strikerBell());
  addImage(scene, 'strikerPuck', strikerPuck());
  addImage(scene, 'strikerHammer', strikerHammer());
  addImage(scene, 'dartboard', dartboard());
  const balls: Record<string, PixelCanvas> = {};
  for (let i = 0; i < 16; i++) balls[`ball${i}`] = ball(i);
  addAtlas(scene, 'tourney', { dartRed: dart('scarlet', 'red'), dartBlue: dart('sky', 'blue'), hand: hand(), cue: cue(), ...balls });
}

/** Předměty pro hospodu (do atlasu 'obj'). */
export function buildTourneyObjects(): Record<string, PixelCanvas> {
  return { cupDarts: cup('darts'), cupPool: cup('pool'), cupBox: cup('box'), posterDarts: poster('darts'), posterPool: poster('pool'), posterBox: poster('box'), strongA: strongman('A'), strongB: strongman('B'), strongC: strongman('C') };
}
