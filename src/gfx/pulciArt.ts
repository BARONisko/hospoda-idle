import Phaser from 'phaser';
import type { PalKey } from '../data/palette';
import { PixelCanvas, addSheet } from './pixel';

// Pulčí závody u Žabáka: pět pulců (každý jiné barvy, 4 snímky vlnění ocasu) a sud se závodní dráhou v hospodě.

export const PULEC_COLORS: [PalKey, PalKey, PalKey][] = [
  ['gold', 'ochre', 'white'],
  ['mint', 'green', 'white'],
  ['red', 'blood', 'sand'],
  ['mauve', 'plum', 'bone'],
  ['sky', 'blue', 'white'],
];

/** Pulec hlavou doprava (18×10): kulatá hlava s očima, vlnící se ocas (f = 0–3). */
function pulec(c: [PalKey, PalKey, PalKey], f: number): PixelCanvas {
  const [body, shade, light] = c;
  const p = new PixelCanvas(18, 10);
  // ocas: vlnka, čím dál od hlavy, tím víc se kroutí
  for (let x = 1; x <= 9; x++) {
    const amp = (10 - x) / 9;
    const y = Math.round(4.5 + Math.sin(x * 0.9 + f * (Math.PI / 2)) * 2.2 * amp);
    const thick = x > 6 ? 2 : 1;
    p.vline(x, y, y + thick - 1, x < 4 ? shade : body);
  }
  // hlava
  p.ellipse(12.5, 4.5, 4.5, 3.6, body);
  p.hline(10, 15, 7, shade);
  p.hline(10, 14, 2, light);
  // oči a pusa
  p.set(14, 3, 'white');
  p.set(15, 3, 'ink');
  p.set(16, 5, shade);
  return p.outline('ink');
}

/** Sud se závodní vodou v hospodě (24×22): dřevo, obruče, zelená voda a v ní pulci. */
function pulciSud(f: number): PixelCanvas {
  const p = new PixelCanvas(24, 22);
  for (let y = 4; y < 22; y++) {
    const inset = y < 6 || y > 19 ? 1 : 0;
    p.hline(2 + inset, 21 - inset, y, y % 4 === 0 ? 'rust' : 'copper');
  }
  for (let x = 5; x < 20; x += 4) p.vline(x, 6, 20, 'rust');
  p.hline(2, 21, 8, 'slate');
  p.hline(2, 21, 17, 'slate');
  // voda nahoře (elipsa) a pulci
  p.ellipse(11.5, 4, 9.5, 3, 'pine');
  p.ellipse(11.5, 4, 8, 2, 'green');
  const t = [[6, 4], [11, 3], [16, 5]];
  t.forEach(([x, y], i) => {
    const xx = x + ((f + i) % 2);
    p.set(xx, y, 'ink');
    p.set(xx - 1, y + ((f + i) % 2 ? 0 : 1), 'ink');
  });
  p.set(13 + f, 4, 'mint');
  return p.outline('ink');
}

/** Tlama ze dna (28×20): 0 = bubliny a tmavý stín, 1 = otevřená tlama vylézá, 2 = zaklapnutá. */
function maw(f: number): PixelCanvas {
  const p = new PixelCanvas(28, 20);
  if (f === 0) {
    p.ellipse(14, 12, 12, 5, 'navy');
    p.ellipse(14, 12, 8, 3, 'ink');
    for (const [x, y] of [[6, 5], [12, 3], [19, 6], [22, 2], [9, 1]]) {
      p.set(x, y, 'ice');
      p.set(x + 1, y, 'white');
    }
    return p;
  }
  const open = f === 1;
  // dolní a horní čelist (bažinatě zelené, žluté zuby)
  p.ellipse(14, 15, 12, 4, 'pine');
  p.hline(3, 24, 15, 'green');
  if (open) {
    p.ellipse(14, 5, 11, 4, 'pine');
    p.hline(4, 23, 3, 'green');
    p.rect(5, 7, 18, 6, 'blood');
    p.rect(8, 9, 12, 3, 'maroon');
    for (let x = 5; x < 23; x += 3) {
      p.set(x, 8, 'sand');
      p.set(x + 1, 13, 'sand');
    }
    p.set(9, 2, 'gold');
    p.set(18, 2, 'gold');
    p.set(9, 1, 'ink');
    p.set(18, 1, 'ink');
  } else {
    p.ellipse(14, 11, 11, 4, 'pine');
    p.hline(4, 23, 9, 'green');
    for (let x = 5; x < 23; x += 3) p.set(x, 13, 'sand');
    p.set(9, 8, 'gold');
    p.set(18, 8, 'gold');
  }
  return p.outline('ink');
}

/** Překážky v dráze: klacek, kámen, plechovka (16×10). */
function obstacle(kind: number): PixelCanvas {
  const p = new PixelCanvas(16, 10);
  if (kind === 0) {
    p.rect(1, 4, 14, 3, 'rust');
    p.hline(1, 14, 4, 'copper');
    p.set(5, 3, 'rust');
    p.set(10, 7, 'rust');
    p.set(12, 2, 'green');
    p.set(13, 2, 'green');
  } else if (kind === 1) {
    p.ellipse(8, 6, 6, 3.5, 'slate');
    p.hline(5, 10, 3, 'fog');
    p.set(4, 5, 'fog');
    p.set(11, 8, 'dusk');
  } else {
    p.rect(3, 2, 10, 7, 'scarlet');
    p.hline(3, 12, 2, 'fog');
    p.hline(3, 12, 8, 'fog');
    p.rect(6, 4, 4, 3, 'bone');
  }
  return p.outline('ink');
}

export function buildPulciArt(scene: Phaser.Scene) {
  addSheet(scene, 'pulciMaw', [maw(0), maw(1), maw(2)]);
  addSheet(scene, 'pulciObs', [obstacle(0), obstacle(1), obstacle(2)]);
  PULEC_COLORS.forEach((c, i) => addSheet(scene, `pulec${i}`, [0, 1, 2, 3].map((f) => pulec(c, f))));
  for (let i = 0; i < 5; i++)
    if (!scene.anims.exists(`pulec${i}_swim`)) scene.anims.create({ key: `pulec${i}_swim`, frames: [0, 1, 2, 3].map((frame) => ({ key: `pulec${i}`, frame })), frameRate: 10, repeat: -1 });
  addSheet(scene, 'pulciSud', [pulciSud(0), pulciSud(1)]);
  if (!scene.anims.exists('pulciSud_idle')) scene.anims.create({ key: 'pulciSud_idle', frames: [0, 1].map((frame) => ({ key: 'pulciSud', frame })), frameRate: 2, repeat: -1 });
}
