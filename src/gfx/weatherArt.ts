import Phaser from 'phaser';
import { PixelCanvas, addSheet } from './pixel';

// Počasí: grog a limonáda (atlas „obj“) a počasí za okny hospody (listy wxRain/wxSnow/wxFog/wxFrost,
// průhledné 12×11, kreslí se přes sklo okna – sklo okna je v dlaždici na x 2–13, y 2–12, příčky x 7 a y 7).

function grog(): PixelCanvas {
  // sklenice s uchem, horký tuzemák s plátkem citronu a pára
  const p = new PixelCanvas(12, 14);
  p.rect(2, 4, 7, 9, 'bone'); // sklo
  p.rect(3, 6, 5, 6, 'copper');
  p.hline(3, 7, 6, 'ochre');
  p.vline(3, 7, 11, 'amber');
  p.rect(9, 6, 2, 1, 'bone'); // ucho
  p.rect(10, 7, 1, 3, 'bone');
  p.rect(9, 10, 2, 1, 'bone');
  p.set(7, 5, 'gold'); // plátek citronu na okraji
  p.set(8, 5, 'gold');
  p.set(8, 4, 'sand');
  p.hline(2, 8, 12, 'fog');
  p.outline('ink');
  // pára (bez obrysu)
  p.set(4, 2, 'white');
  p.set(5, 1, 'bone');
  p.set(6, 2, 'bone');
  p.set(5, 0, 'white');
  return p;
}

function lemonade(): PixelCanvas {
  // vysoká sklenice, žlutá limonáda, kostka ledu, brčko a kolečko citronu
  const p = new PixelCanvas(10, 15);
  p.rect(2, 3, 6, 11, 'bone');
  p.rect(3, 5, 4, 8, 'gold');
  p.vline(3, 5, 12, 'sand');
  p.rect(5, 6, 2, 2, 'white'); // led
  p.set(6, 10, 'sand');
  p.hline(2, 7, 13, 'fog');
  p.vline(6, 0, 4, 'scarlet'); // brčko
  p.set(7, 0, 'scarlet');
  p.set(1, 3, 'gold'); // citron na okraji
  p.set(1, 4, 'amber');
  p.set(0, 3, 'gold');
  return p.outline('ink');
}

export function buildWeatherObjects(): Record<string, PixelCanvas> {
  return { gGrog: grog(), gLemonade: lemonade() };
}

/** Pixel skla (ne příčka okna). */
const glass = (x: number, y: number) => x >= 0 && x < 12 && y >= 0 && y < 11 && x !== 5 && y !== 5;

function rain(f: number): PixelCanvas {
  const p = new PixelCanvas(12, 11);
  const drops = [[1, 0], [8, 2], [4, 5], [10, 7], [2, 8], [7, 9], [6, 1], [11, 4]];
  for (const [dx, dy] of drops) {
    const y0 = (dy + f * 3) % 11;
    for (let i = 0; i < 2; i++) {
      const x = dx - i, y = y0 - i * 2;
      if (glass(x, y)) p.set(x, y, i ? 'sky' : 'ice');
      if (glass(x, y + 1)) p.set(x, y + 1, 'sky');
    }
  }
  // kapky stékají po skle
  if (glass(9, 10 - f)) p.set(9, 10 - f, 'ice');
  return p;
}

function snow(f: number): PixelCanvas {
  const p = new PixelCanvas(12, 11);
  const flakes = [[1, 0], [9, 1], [4, 3], [11, 5], [2, 6], [7, 8], [6, 0], [10, 9], [3, 10]];
  flakes.forEach(([dx, dy], i) => {
    const y = (dy + f * 2) % 11;
    const x = (dx + (f + i) % 3 - 1 + 12) % 12;
    if (glass(x, y)) p.set(x, y, i % 3 ? 'white' : 'bone');
  });
  // závěje v dolních rozích tabulek
  for (const [x0, x1] of [[0, 4], [6, 11]]) {
    for (let x = x0; x <= x1; x++) p.set(x, 10, 'white');
    p.set(x0, 9, 'white');
    p.set(x0 + 1, 9, 'bone');
    p.set(x1, 9, 'bone');
    p.set(x0, 5, 'white');
    p.set(x0 + 1, 5, 'bone');
  }
  return p;
}

function fog(f: number): PixelCanvas {
  // mlha: plné pruhy (žádný dithering), pomalu se posouvají
  const p = new PixelCanvas(12, 11);
  for (let y = 0; y < 11; y++)
    for (let x = 0; x < 12; x++) {
      if (!glass(x, y)) continue;
      const band = Math.floor((x + f * 2 + Math.floor(y / 3) * 3) / 4) % 3;
      p.set(x, y, y > 6 ? 'fog' : band === 0 ? 'bone' : 'fog');
    }
  return p;
}

function frost(): PixelCanvas {
  // námraza: ledové květy v rozích tabulek
  const p = new PixelCanvas(12, 11);
  const corner = (cx: number, cy: number, sx: number, sy: number) => {
    for (let i = 0; i < 4; i++) {
      const x = cx + sx * i, y = cy;
      if (glass(x, y)) p.set(x, y, i < 2 ? 'white' : 'ice');
      if (glass(cx, cy + sy * i)) p.set(cx, cy + sy * i, i < 2 ? 'white' : 'ice');
    }
    if (glass(cx + sx, cy + sy)) p.set(cx + sx, cy + sy, 'white');
    if (glass(cx + sx * 2, cy + sy * 2)) p.set(cx + sx * 2, cy + sy * 2, 'ice');
    if (glass(cx + sx * 2, cy + sy)) p.set(cx + sx * 2, cy + sy, 'bone');
  };
  corner(0, 0, 1, 1);
  corner(11, 10, -1, -1);
  corner(4, 10, -1, -1);
  corner(6, 0, 1, 1);
  return p;
}

export function buildWeatherArt(scene: Phaser.Scene) {
  addSheet(scene, 'wxRain', [0, 1, 2, 3].map(rain));
  addSheet(scene, 'wxSnow', [0, 1, 2, 3, 4].map(snow));
  addSheet(scene, 'wxFog', [0, 1, 2, 3, 4, 5].map(fog));
  addSheet(scene, 'wxFrost', [frost()]);
  for (const [k, n, r] of [['wxRain', 4, 10], ['wxSnow', 5, 4], ['wxFog', 6, 1.5]] as const)
    if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: Array.from({ length: n }, (_, frame) => ({ key: k, frame })), frameRate: r, repeat: -1 });
}
