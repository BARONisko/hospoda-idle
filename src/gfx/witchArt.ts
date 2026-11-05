import Phaser from 'phaser';
import { PixelCanvas, addSheet } from './pixel';
import { WITCH_W, WITCH_H, CAULDRON_W, CAULDRON_H, WITCH_KEYS, WITCH_FRAMES, CAULDRON_FRAMES } from './witchSprite';

// Čarodějnice ve sklepě: shrbená, z boku, míchá zelený lektvar v kotli nad ohněm (z Leonarda, art/leonardo/carodejnice_*).
// „witch“ = 4 snímky míchání (snímek 0 slouží i jako portrét v rozhovoru),
// „cauldron“ = 3 snímky plamenů a bubliny. Pixely jsou v witchSprite.ts.

function fromRows(rows: string[], w: number, h: number): PixelCanvas {
  const p = new PixelCanvas(w, h);
  rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, WITCH_KEYS[c])));
  return p;
}

const witchFrame = (f: number) => fromRows(WITCH_FRAMES[f], WITCH_W, WITCH_H);
const cauldronFrame = (f: number) => fromRows(CAULDRON_FRAMES[f], CAULDRON_W, CAULDRON_H);

/** Poloviční čarodějnice (k postavám 16 px, Žabákova hospoda v noci): blok 2×2 → nejčastější barva, obrys má přednost. */
function halfFrame(f: number): PixelCanvas {
  const src = witchFrame(f);
  const w = Math.ceil(WITCH_W / 2), h = Math.ceil(WITCH_H / 2);
  const p = new PixelCanvas(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const cnt = new Map<string, number>();
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const c = src.get(x * 2 + dx, y * 2 + dy);
        if (c) cnt.set(c, (cnt.get(c) ?? 0) + 1);
      }
      const opaque = [...cnt.values()].reduce((a, b) => a + b, 0);
      if (opaque < 2) continue;
      const inner = [...cnt.entries()].filter(([c]) => c !== 'ink').sort((a, b) => b[1] - a[1])[0];
      // vnitřek kreslí převládající barvu, čistě obrysové bloky zůstanou tmavé
      p.set(x, y, (inner && inner[1] >= (cnt.get('ink') ?? 0) - 1 ? inner[0] : 'ink') as never);
    }
  return p;
}

export function buildWitchArt(scene: Phaser.Scene) {
  if (!scene.textures.exists('witchSmall')) {
    addSheet(scene, 'witchSmall', [0, 1, 2, 3].map(halfFrame));
    scene.anims.create({ key: 'witchSmall_stir', frames: [0, 1, 2, 3].map((i) => ({ key: 'witchSmall', frame: i })), frameRate: 5, repeat: -1 });
  }
  if (scene.textures.exists('witch')) return;
  addSheet(scene, 'witch', [0, 1, 2, 3].map(witchFrame));
  addSheet(scene, 'cauldron', [0, 1, 2].map(cauldronFrame));
  scene.anims.create({ key: 'witch_stir', frames: [0, 1, 2, 3].map((i) => ({ key: 'witch', frame: i })), frameRate: 5, repeat: -1 });
  scene.anims.create({ key: 'cauldron_boil', frames: [0, 1, 2].map((i) => ({ key: 'cauldron', frame: i })), frameRate: 7, repeat: -1 });
}

/** Polička s lahvičkami a sušenými bylinkami na zeď nad čarodějnicí; svíčka na zem. */
export function buildWitchProps(): Record<string, PixelCanvas> {
  const shelf = new PixelCanvas(30, 16);
  // sušené bylinky visí z prkna
  for (const [x, c] of [[3, 'green'], [7, 'sage'], [25, 'olive']] as const) {
    shelf.vline(x, 0, 5, c);
    shelf.set(x - 1, 3, c);
    shelf.set(x + 1, 4, c);
  }
  // lahvičky a lebka
  const jar = (x: number, h: number, c: 'mint' | 'scarlet' | 'sky' | 'gold' | 'plum') => {
    shelf.rect(x, 12 - h, 3, h, c);
    shelf.set(x + 1, 11 - h, 'tan');
    shelf.set(x, 12 - h, 'white');
  };
  jar(10, 5, 'mint');
  jar(14, 3, 'scarlet');
  jar(18, 4, 'plum');
  jar(27, 3, 'gold');
  shelf.rect(21, 8, 4, 4, 'bone');
  shelf.set(22, 9, 'ink');
  shelf.set(24, 9, 'ink');
  shelf.hline(22, 23, 11, 'fog');
  shelf.rect(0, 12, 30, 2, 'rust');
  shelf.hline(0, 29, 14, 'olive');
  shelf.set(2, 15, 'olive');
  shelf.set(27, 15, 'olive');
  shelf.outline('ink');
  const candle = new PixelCanvas(5, 9);
  candle.rect(1, 3, 3, 6, 'bone');
  candle.vline(1, 4, 8, 'fog');
  candle.set(2, 2, 'ink');
  candle.set(2, 1, 'amber');
  candle.set(2, 0, 'gold');
  candle.set(3, 5, 'bone');
  candle.set(4, 6, 'bone'); // stékající vosk
  return { witchShelf: shelf, witchCandle: candle };
}
