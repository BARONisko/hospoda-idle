import Phaser from 'phaser';
import { PixelCanvas, addSheet } from './pixel';
import { FRAMES } from './characters';
import { PalKey } from '../data/palette';

// Skřítek ze spíže: malý zelený zloděj s červenou čepicí a velkýma ušima.
// Sheet je kompatibilní s Actor (stejné pořadí snímků jako postavy):
// 0–3 dolů, 4–7 nahoru, 8–11 bokem (doprava), 12 sedí, 13 nese, 14 leží.
// Varianta „carry“ má ruce nad hlavou (nese ukradenou přísadu).

type Dir = 'down' | 'up' | 'side';

function goblinFrame(dir: Dir, f: number, carry: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const skin: PalKey = 'green';
  const shade: PalKey = 'pine';
  const step = f % 2 === 1 ? (f === 1 ? 1 : -1) : 0;
  const bob = f % 2 === 1 ? 1 : 0;
  const y0 = 3 + bob; // vršek hlavy (čepice začíná nad ním)
  // nohy
  if (dir === 'side') {
    p.rect(6 + step, 13, 2, 3, 'olive');
    p.rect(9 - step, 13, 2, 3, 'olive');
    p.set(7 + step, 15, 'ink');
    p.set(10 - step, 15, 'ink');
  } else {
    p.rect(5, 13 + (step > 0 ? -1 : 0), 2, 3 - (step > 0 ? -1 : 0), 'olive');
    p.rect(9, 13 + (step < 0 ? -1 : 0), 2, 3, 'olive');
    p.hline(5, 6, 15, 'ink');
    p.hline(9, 10, 15, 'ink');
  }
  // tělo – hnědá halena s opaskem
  p.rect(5, y0 + 6, 6, 5 - bob, 'rust');
  p.hline(5, 10, y0 + 9, 'olive');
  p.set(8, y0 + 9, 'gold');
  // ruce
  if (carry) {
    p.vline(4, y0 - 1, y0 + 7, skin);
    p.vline(11, y0 - 1, y0 + 7, skin);
  } else if (dir === 'side') {
    p.rect(7 - step, y0 + 7, 2, 3, shade);
  } else {
    p.rect(4, y0 + 7, 1, 3, skin);
    p.rect(11, y0 + 7, 1, 3, skin);
  }
  // hlava
  p.rect(5, y0 + 1, 6, 5, skin);
  p.hline(6, 9, y0 + 6, shade);
  // uši
  if (dir === 'side') {
    p.hline(3, 5, y0 + 2, skin);
    p.set(2, y0 + 1, skin);
    p.set(4, y0 + 3, shade);
  } else {
    p.hline(2, 4, y0 + 2, skin);
    p.hline(11, 13, y0 + 2, skin);
    p.set(1, y0 + 1, skin);
    p.set(14, y0 + 1, skin);
    p.set(3, y0 + 3, shade);
    p.set(12, y0 + 3, shade);
  }
  // obličej
  if (dir === 'down') {
    p.set(6, y0 + 3, 'gold');
    p.set(9, y0 + 3, 'gold');
    p.set(7, y0 + 4, shade);
    p.set(8, y0 + 4, shade); // velký nos
    p.hline(6, 9, y0 + 5, 'ink'); // šklebící se pusa
    p.set(7, y0 + 5, 'white');
  } else if (dir === 'side') {
    p.set(9, y0 + 3, 'gold');
    p.rect(11, y0 + 3, 2, 2, skin); // nos dopředu
    p.hline(8, 10, y0 + 5, 'ink');
    p.set(9, y0 + 5, 'white');
  }
  // čepice
  p.hline(4, 11, y0, 'red');
  p.hline(5, 10, y0 - 1, 'red');
  p.hline(6, 9, y0 - 2, 'scarlet');
  p.set(dir === 'side' ? 5 : 10, y0 - 3, 'scarlet');
  p.set(dir === 'side' ? 4 : 11, y0 - 3, 'bone'); // bambule
  p.hline(4, 11, y0 + 1, 'maroon');
  return p.outline('ink');
}

function lieFrame(): PixelCanvas {
  const base = goblinFrame('side', 0, false);
  const p = new PixelCanvas(16, 16);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.set(15 - y, x, base.get(x, y));
  return p;
}

function buildSheet(scene: Phaser.Scene, key: string, carry: boolean) {
  const frames: PixelCanvas[] = [];
  for (const d of ['down', 'up', 'side'] as Dir[]) for (let f = 0; f < 4; f++) frames.push(goblinFrame(d, f, carry));
  frames.push(goblinFrame('side', 0, carry)); // sedí – nepoužívá se
  frames.push(goblinFrame('down', 0, true)); // nese
  frames.push(lieFrame());
  addSheet(scene, key, frames);
  for (const [name, start] of [['down', FRAMES.down], ['up', FRAMES.up], ['side', FRAMES.side]] as const) {
    const k = `${key}_${name}`;
    if (scene.anims.exists(k)) scene.anims.remove(k);
    scene.anims.create({ key: k, frames: [0, 1, 2, 3].map((i) => ({ key, frame: start + i })), frameRate: 12, repeat: -1 });
  }
}

export function buildGoblinSheets(scene: Phaser.Scene) {
  if (scene.textures.exists('goblin')) return;
  buildSheet(scene, 'goblin', false);
  buildSheet(scene, 'goblinCarry', true);
}

// ---------------------------------------------------------------- přísady, spíž, díra

function cabbage(): PixelCanvas {
  const p = new PixelCanvas(10, 9);
  p.ellipse(5, 4.5, 4.5, 4, 'green');
  p.ellipse(5, 4, 3, 2.8, 'mint');
  p.vline(5, 1, 7, 'green');
  p.set(3, 3, 'green');
  p.set(7, 3, 'green');
  p.set(4, 1, 'bone');
  return p.outline('ink');
}

function potato(): PixelCanvas {
  // pytel brambor
  const p = new PixelCanvas(10, 10);
  p.rect(1, 3, 8, 7, 'tan');
  p.rect(2, 2, 6, 1, 'tan');
  p.hline(3, 6, 1, 'mauve');
  p.set(4, 0, 'mauve');
  p.set(5, 0, 'mauve');
  p.vline(1, 4, 9, 'mauve');
  p.ellipse(3.5, 2.5, 1.2, 1, 'ochre');
  p.ellipse(6.5, 2.5, 1.2, 1, 'copper');
  p.hline(3, 6, 6, 'mauve');
  return p.outline('ink');
}

function meat(): PixelCanvas {
  // kýta
  const p = new PixelCanvas(11, 9);
  p.ellipse(4, 4.5, 4, 3.5, 'red');
  p.ellipse(3.5, 4, 2.6, 2.2, 'scarlet');
  p.rect(7, 4, 3, 2, 'bone');
  p.rect(9, 3, 2, 1, 'bone');
  p.rect(9, 6, 2, 1, 'bone');
  p.set(2, 3, 'skin');
  return p.outline('ink');
}

function onion(): PixelCanvas {
  const p = new PixelCanvas(9, 10);
  p.ellipse(4.5, 6, 3.8, 3.5, 'ochre');
  p.ellipse(4, 5.5, 2.4, 2.4, 'sand');
  p.vline(4, 0, 2, 'green');
  p.set(5, 1, 'mint');
  p.vline(4, 6, 8, 'copper');
  return p.outline('ink');
}

/** Spíž: police s bednami (obsah se kreslí přes ni ve scéně). */
function pantryShelf(): PixelCanvas {
  const p = new PixelCanvas(30, 26);
  p.rect(0, 0, 30, 26, 'olive');
  p.rect(1, 1, 28, 24, 'rust');
  for (const y of [8, 16, 24]) {
    p.hline(1, 28, y, 'olive');
    p.hline(1, 28, y + 1, 'ochre');
  }
  p.vline(0, 0, 25, 'ink');
  p.vline(29, 0, 25, 'ink');
  p.hline(0, 29, 0, 'ink');
  p.hline(0, 29, 25, 'ink');
  // stín pod policemi
  for (const y of [2, 10, 18]) p.hline(2, 27, y, 'maroon');
  return p;
}

/** Díra ve zdi u podlahy, odkud lezou skřítci. */
function goblinHole(): PixelCanvas {
  const p = new PixelCanvas(16, 12);
  p.ellipse(8, 8, 7, 6, 'ink');
  p.ellipse(8, 9, 5, 4.5, 'coal');
  // vylámané kachlíky kolem
  for (const [x, y] of [[1, 4], [14, 5], [2, 2], [13, 2], [0, 7], [15, 8]]) p.set(x, y, 'fog');
  p.set(6, 7, 'gold');
  p.set(9, 7, 'gold'); // oči ve tmě
  return p;
}

export function buildPantryArt(): Record<string, PixelCanvas> {
  return { pCabbage: cabbage(), pPotato: potato(), pMeat: meat(), pOnion: onion(), kPantry: pantryShelf(), kHole: goblinHole() };
}
