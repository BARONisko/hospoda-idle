import Phaser from 'phaser';
import { PixelCanvas, addSheet } from './pixel';
import type { PalKey } from '../data/palette';

// Trpasličí obchodník (inspirovaný Gimlim): železná přilba s lícnicemi a nánosníkem,
// mohutný zrzavý plnovous zapletený do copánků se zlatými korálky, kroužková zbroj,
// široký opasek se zlatou přezkou a obouruční sekera přes rameno.
// Snímky: 0 a 1 = dýchání (vous a sekera se pohnou), 2 = smích (oči zavřené, sekera nahoře).

const W = 24;
const H = 28;

function dwarf(f: number): PixelCanvas {
  const p = new PixelCanvas(W, H);
  const up = f === 1 ? 1 : 0;
  const laugh = f === 2;

  // ---- sekera přes pravé rameno (za tělem)
  const ax = laugh ? -1 : 0;
  for (let i = 0; i < 15; i++) p.set(17 - Math.floor(i * 0.5) + ax, 3 + i, i % 4 === 0 ? 'rust' : 'olive'); // topůrko
  // dvojité ostří
  const bx = 18 + ax;
  const by = 2 - up;
  p.rect(bx - 1, by, 3, 6, 'slate');
  p.ellipse(bx + 3.5, by + 3, 2.5, 3.5, 'fog');
  p.ellipse(bx - 3.5, by + 3, 2.5, 3.5, 'fog');
  p.vline(bx + 5, by + 1, by + 5, 'white');
  p.vline(bx - 5, by + 1, by + 5, 'bone');
  p.set(bx, by + 2, 'gold');

  // ---- nohy a boty (krátké, široké)
  p.rect(7, 23, 4, 3, 'rust');
  p.rect(13, 23, 4, 3, 'rust');
  p.rect(6, 25, 5, 3, 'olive');
  p.rect(13, 25, 5, 3, 'olive');
  p.hline(6, 10, 27, 'ink');
  p.hline(13, 17, 27, 'ink');

  // ---- tělo: kroužková zbroj pod vousem
  for (let y = 13; y < 24; y++)
    for (let x = 4; x < 20; x++) {
      const edge = (y === 13 && (x < 6 || x > 17)) || (y > 21 && (x < 5 || x > 18));
      if (edge) continue;
      p.set(x, y, (x + y) % 2 ? 'slate' : 'fog');
    }
  // opasek se zlatou přezkou
  p.rect(4, 20, 16, 2, 'rust');
  p.hline(4, 19, 20, 'copper');
  p.rect(10, 19, 4, 4, 'gold');
  p.rect(11, 20, 2, 2, 'olive');
  // ruce v rukavicích
  p.rect(2, 14, 3, 7, 'olive');
  p.rect(19, 14, 3, 6, 'olive');
  p.rect(2, 20, 3, 2, 'rust');
  p.rect(19, 13 - (laugh ? 2 : 0), 3, 3, 'rust'); // drží topůrko
  // ramenní pláty
  p.rect(3, 12, 4, 3, 'copper');
  p.rect(17, 12, 4, 3, 'copper');
  p.hline(3, 6, 12, 'sand');
  p.hline(17, 20, 12, 'sand');

  // ---- hlava
  // obličej (velký nos, huňaté obočí)
  p.rect(8, 7, 8, 5, 'skin');
  p.rect(11, 9, 3, 3, 'tan'); // nos
  p.set(12, 9, 'skin');
  p.hline(8, 15, 7, 'rust'); // obočí
  p.hline(7, 10, 8, 'copper');
  p.hline(13, 16, 8, 'copper');
  if (laugh) {
    p.hline(9, 10, 9, 'ink');
    p.hline(14, 15, 9, 'ink');
  } else {
    p.set(9, 9, 'ink');
    p.set(15, 9, 'ink');
    p.set(10, 9, 'white');
  }
  // přilba: železná kopule, bronzový pruh, nánosník a lícnice
  p.ellipse(12, 5, 6.5, 4.5, 'slate');
  p.ellipse(11, 3.5, 4, 2.5, 'fog');
  p.set(10, 2, 'white');
  p.hline(5, 18, 6, 'copper');
  p.hline(5, 18, 7, 'rust');
  for (const x of [7, 10, 14, 17]) p.set(x, 6, 'sand'); // nýty
  p.vline(12, 7, 9, 'slate'); // nánosník
  p.rect(5, 7, 2, 5, 'slate'); // lícnice
  p.rect(17, 7, 2, 5, 'slate');
  p.vline(5, 7, 11, 'fog');
  p.set(12, 0, 'copper'); // hrot

  // ---- plnovous: od lícnic až k opasku, dva copy se zlatými korálky
  const by0 = 11;
  for (let y = by0; y < 21; y++) {
    const half = Math.min(7, 3 + (y - by0));
    const narrow = y > 17 ? y - 17 : 0;
    for (let x = 12 - half + narrow; x <= 11 + half - narrow; x++) {
      const tone: PalKey = x % 3 === 0 ? 'rust' : y < by0 + 2 && x % 3 === 1 ? 'ochre' : 'copper';
      p.set(x, y + (y > 15 ? up : 0), tone);
    }
  }
  // knír přes ústa (při smíchu otevřená pusa)
  p.hline(9, 15, 11, 'rust');
  if (laugh) {
    p.rect(10, 12, 5, 2, 'blood');
    p.hline(10, 14, 12, 'white');
  }
  // copy
  for (const cx of [9, 15]) {
    for (let y = 18; y < 24; y++) p.set(cx, y + up, y % 2 ? 'rust' : 'copper');
    p.set(cx, 24 + up, 'gold'); // korálek
    p.set(cx, 21 + up, 'gold');
  }
  return p.outline('ink');
}

export function buildDwarfArt(scene: Phaser.Scene) {
  addSheet(scene, 'dwarf', [0, 1, 2].map(dwarf));
}
