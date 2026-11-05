import Phaser from 'phaser';
import { PixelCanvas, addSheet } from './pixel';
import { DAGON_FRAMES, DAGON_H, DAGON_KEYS, DAGON_STATUE, DAGON_W } from './dagonSprite';
import { KC_FRAMES, KC_H, KC_KEYS, KC_W, KD_FRAMES, KD_H, KD_KEYS, KD_W } from './kombatSprites';
import type { PalKey } from '../data/palette';

// Souboj Cthulhu × Dagon ve stylu starého Mortal Kombatu. Pózy jsou z Leonarda (kombatSprites.ts); co chybí
// (přikrčení, dech, výpad, zásah), se skládá z nich: horní část těla se posune, řádky stehen se vypustí.
// Plátno má okraj M, aby se výpad vešel. Pata je vždy na spodním řádku, střed těla uprostřed plátna.

const M = 8;

function sheetFrame(rows: string[], keys: Record<string, PalKey>, w: number, h: number): PixelCanvas {
  const p = new PixelCanvas(w + 2 * M, h);
  rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x + M, y, keys[c])));
  return p;
}

/** První řádek, kde začíná postava (výška postavy = h - top). */
function top(p: PixelCanvas): number {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.get(x, y)) return y;
  return 0;
}

/** Horní část (řádky < cut) posunutá o dx, dy; spodek zůstává. Horní část se kreslí přes spodek. */
function lean(src: PixelCanvas, cut: number, dx: number, dy = 0): PixelCanvas {
  const p = new PixelCanvas(src.w, src.h);
  for (let y = cut; y < src.h; y++) for (let x = 0; x < src.w; x++) p.set(x, y, src.get(x, y));
  for (let y = 0; y < cut; y++)
    for (let x = 0; x < src.w; x++) {
      const c = src.get(x, y);
      if (c) p.set(x + dx, y + dy, c);
    }
  return p;
}

/** Přikrčení: vypustí n řádků od cut (stehna), horní část sjede dolů. */
function squat(src: PixelCanvas, cut: number, n: number): PixelCanvas {
  const p = new PixelCanvas(src.w, src.h);
  for (let y = cut + n; y < src.h; y++) for (let x = 0; x < src.w; x++) p.set(x, y, src.get(x, y));
  for (let y = 0; y < cut; y++)
    for (let x = 0; x < src.w; x++) {
      const c = src.get(x, y);
      if (c) p.set(x, y + n, c);
    }
  return p;
}

/** boky a stehna podle výšky postavy */
function hips(p: PixelCanvas) {
  const fh = p.h - top(p);
  return { cut: Math.round(p.h - fh * 0.32), n: Math.round(fh * 0.16), fh };
}

/** Snímky Cthulhu (kouká doprava): 0–6 z Leonarda (stojí, let, inkoust, kop, ruce nahoru, pivo, hod),
 *  7 dech, 8 přikrčení, 9 výpad, 10 blok (zakloněný), 11 zásah, 12 skok skrčmo. */
export const CF = {
  idle: [0, 7], walk: [0, 7], crouch: 8, jump: 1, jumpKick: 3, light: 9, wind: 4, heavy: 6, sweep: 8, block: 10, hit: 11, hitLow: 8,
  special: 2, dash: 1, win: [5, 4], down: 11, roar: 4,
};
/** Snímky Dagona (kouká doleva): 0–9 z Leonarda, 10 dech, 11 přikrčení, 12 skok skrčmo, 13 nápřah, 14 zásah. */
export const DF = {
  idle: [0, 10], walk: [0, 1], crouch: 11, jump: 12, jumpKick: 2, light: 2, wind: 13, heavy: 3, sweep: 6, block: 5, hit: 14, hitLow: 14,
  special: 4, grab: 9, win: [3, 0], down: 8, roar: 3,
};

function cthulhuKombat(): PixelCanvas[] {
  const base = KC_FRAMES.map((f) => sheetFrame(f, KC_KEYS, KC_W, KC_H));
  const st = base[0];
  const h = hips(st);
  return [...base, lean(st, h.cut, 0, 1), squat(st, h.cut, h.n), lean(st, h.cut, 5), lean(st, h.cut, -3), lean(base[4], h.cut, -5), squat(st, h.cut, Math.round(h.n * 0.7))];
}

function dagonKombat(): PixelCanvas[] {
  const base = KD_FRAMES.map((f) => sheetFrame(f, KD_KEYS, KD_W, KD_H));
  const st = base[0];
  const h = hips(st);
  return [...base, lean(st, h.cut, 0, 1), squat(st, h.cut, h.n), squat(st, h.cut, Math.round(h.n * 0.7)), lean(st, h.cut, 4, -1), lean(base[1], h.cut, 5)];
}

function dagon(i: number): PixelCanvas {
  const p = new PixelCanvas(DAGON_W, DAGON_H);
  DAGON_FRAMES[i].forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, DAGON_KEYS[c])));
  return p;
}

/** Socha Dagona na pult (16×24): 0 oči tlumené, 1 oči svítí. */
export function dagonStatue(i: number): PixelCanvas {
  const p = new PixelCanvas(16, 24);
  DAGON_STATUE[i].forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, DAGON_KEYS[c])));
  return p;
}

// ---------------------------------------------------------------- efekty
/** Chapadlo (slabý útok Cthulhu): 36×9, roste doprava, konec stočený nahoru. */
function tentacle(): PixelCanvas {
  const p = new PixelCanvas(36, 10);
  for (let x = 0; x < 33; x++) {
    const y = 5 + Math.round(Math.sin(x / 5) * 1.2);
    const th = x < 12 ? 3 : x < 24 ? 2 : 1;
    for (let t = 0; t < th; t++) p.set(x, y - t, t === 0 ? 'pine' : 'green');
    if (x % 4 === 1 && th > 1) p.set(x, y, 'bone');
  }
  p.set(33, 3, 'green');
  p.set(34, 2, 'green');
  p.set(34, 1, 'mint');
  p.outline('ink');
  return p;
}

/** Tři seky drápem (silný útok Cthulhu): 22×30. */
function slash(): PixelCanvas {
  const p = new PixelCanvas(22, 30);
  for (let k = 0; k < 3; k++)
    for (let t = 0; t < 24; t++) {
      const x = 3 + k * 6 + Math.round(Math.sin((t / 24) * Math.PI) * 4);
      const y = 3 + t;
      p.set(x, y, t > 4 && t < 20 ? 'white' : 'mint');
    }
  return p;
}

/** Jazyk (slabý útok Dagona): 34×6, roste doleva. */
function tongue(): PixelCanvas {
  const p = new PixelCanvas(34, 7);
  for (let x = 3; x < 33; x++) {
    p.set(x, 3, 'red');
    if (x > 20) p.set(x, 2, 'red');
  }
  p.rect(1, 2, 3, 3, 'scarlet');
  p.set(2, 1, 'scarlet');
  p.set(2, 2, 'white');
  p.outline('blood');
  return p;
}

/** Sliz (silný útok Dagona): kapka 12×10. */
function slime(): PixelCanvas {
  const p = new PixelCanvas(12, 10);
  p.ellipse(5.5, 5, 4.5, 3.6, 'green');
  p.ellipse(4.5, 4, 2.2, 1.6, 'mint');
  p.set(3, 3, 'white');
  p.outline('pine');
  return p;
}

/** Inkoustová koule (zvláštní útok Cthulhu): 12×12. */
function inkBall(): PixelCanvas {
  const p = new PixelCanvas(12, 12);
  p.ellipse(5.5, 5.5, 4.6, 4.6, 'ink');
  p.ellipse(5.5, 5.5, 3.2, 3.2, 'plum');
  p.set(4, 3, 'bone');
  p.set(4, 4, 'plum');
  p.outline('dusk');
  return p;
}

/** Jiskra zásahu 13×13. */
function spark(): PixelCanvas {
  const p = new PixelCanvas(13, 13);
  for (let i = 0; i < 6; i++) {
    const c: PalKey = i < 2 ? 'white' : 'gold';
    p.set(6 + i, 6, c);
    p.set(6 - i, 6, c);
    p.set(6, 6 + i, c);
    p.set(6, 6 - i, c);
  }
  for (let i = 1; i < 4; i++) {
    p.set(6 + i, 6 + i, 'amber');
    p.set(6 - i, 6 - i, 'amber');
    p.set(6 + i, 6 - i, 'amber');
    p.set(6 - i, 6 + i, 'amber');
  }
  p.set(6, 6, 'white');
  return p;
}

export function buildKombatArt(scene: Phaser.Scene) {
  addSheet(scene, 'kCthulhu', cthulhuKombat());
  addSheet(scene, 'kDagon', dagonKombat());
  addSheet(scene, 'dWake', [dagon(0), dagon(1)]); // probuzení sochy v hospodě
  const fx: [string, PixelCanvas][] = [['kTentacle', tentacle()], ['kSlash', slash()], ['kTongue', tongue()], ['kSlime', slime()], ['kSpark', spark()], ['kInk', inkBall()]];
  for (const [k, p] of fx) addSheet(scene, k, [p]);
  addSheet(scene, 'dStatue', [dagonStatue(0), dagonStatue(1)]);
  const anims: [string, string, number[], number][] = [
    ['kc_idle', 'kCthulhu', CF.idle, 3],
    ['kc_walk', 'kCthulhu', CF.walk, 6],
    ['kc_win', 'kCthulhu', CF.win, 3],
    ['kd_idle', 'kDagon', DF.idle, 3],
    ['kd_walk', 'kDagon', DF.walk, 6],
    ['kd_win', 'kDagon', DF.win, 3],
  ];
  for (const [k, tex, fr, rate] of anims)
    if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: fr.map((frame) => ({ key: tex, frame })), frameRate: rate, repeat: -1 });
}
