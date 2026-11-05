// Kuchyně za zdí: stanice, dveře z výčepu, pozadí (kachlíky) a prázdné místo pro nábytek.
import { PixelCanvas } from './pixel';
import { PalKey } from '../data/palette';
import { KITCHEN } from '../data/maps';

const T = 16;

function stove(): PixelCanvas {
  const p = new PixelCanvas(22, 24);
  p.rect(1, 9, 20, 14, 'coal');
  p.rect(2, 10, 18, 12, 'slate');
  p.rect(4, 14, 14, 6, 'ink');
  p.rect(5, 15, 12, 4, 'rust');
  p.hline(5, 16, 17, 'amber');
  p.rect(1, 7, 20, 3, 'fog');
  // kotel s gulášem
  p.ellipse(11, 4, 7, 3.5, 'ink');
  p.rect(4, 2, 15, 6, 'ink');
  p.rect(5, 2, 13, 5, 'coal');
  p.hline(5, 17, 2, 'rust');
  p.hline(6, 16, 3, 'ochre');
  p.set(8, 0, 'bone');
  p.set(12, 1, 'bone');
  return p.outline('ink');
}

function toaster(): PixelCanvas {
  const p = new PixelCanvas(18, 18);
  p.rect(0, 10, 18, 7, 'olive'); // pult
  p.hline(0, 17, 10, 'ochre');
  p.rect(3, 4, 12, 8, 'fog');
  p.rect(4, 5, 10, 6, 'bone');
  p.rect(5, 1, 3, 5, 'sand');
  p.rect(10, 1, 3, 5, 'ochre');
  p.vline(15, 6, 9, 'ink');
  return p.outline('ink');
}

function fryer(): PixelCanvas {
  const p = new PixelCanvas(20, 24);
  p.rect(1, 8, 18, 15, 'fog');
  p.rect(2, 9, 16, 13, 'bone');
  p.rect(3, 4, 14, 6, 'slate');
  p.rect(4, 5, 12, 4, 'sand');
  p.hline(5, 14, 6, 'gold');
  p.rect(12, 0, 2, 5, 'ink'); // držadlo koše
  p.rect(5, 13, 10, 2, 'slate');
  p.set(5, 18, 'scarlet');
  return p.outline('ink');
}

function oven(): PixelCanvas {
  const p = new PixelCanvas(24, 26);
  p.ellipse(12, 12, 11, 11, 'rust');
  p.rect(1, 12, 22, 13, 'rust');
  for (let y = 2; y < 25; y += 4) for (let x = (y / 4) % 2 ? 0 : 3; x < 24; x += 6) p.hline(x, x + 1, y, 'blood');
  p.ellipse(12, 16, 6, 5, 'ink');
  p.rect(6, 16, 13, 6, 'ink');
  p.ellipse(12, 19, 4, 2, 'amber');
  p.set(10, 18, 'gold');
  p.rect(0, 22, 24, 3, 'mauve');
  return p.outline('ink');
}

function smoker(): PixelCanvas {
  const p = new PixelCanvas(18, 28);
  p.rect(2, 5, 14, 22, 'dusk');
  p.rect(3, 6, 12, 20, 'coal');
  p.rect(7, 0, 4, 6, 'slate');
  for (let i = 0; i < 3; i++) {
    p.vline(5 + i * 4, 8, 16, 'blood');
    p.vline(6 + i * 4, 9, 15, 'red');
  }
  p.hline(4, 13, 7, 'tan');
  p.rect(5, 20, 8, 4, 'ink');
  p.hline(6, 11, 22, 'amber');
  return p.outline('ink');
}

/** Lis na tlačenku. */
function press(): PixelCanvas {
  const p = new PixelCanvas(18, 22);
  p.rect(0, 13, 18, 8, 'olive');
  p.hline(0, 17, 13, 'ochre');
  p.rect(4, 7, 10, 7, 'fog');
  p.rect(5, 8, 8, 5, 'maroon');
  p.set(7, 10, 'bone');
  p.set(10, 9, 'bone');
  p.rect(8, 1, 2, 7, 'slate'); // šroub
  p.hline(4, 13, 1, 'slate');
  return p.outline('ink');
}

/** Volné místo (čárkovaný obrys na podlaze) – sem se postaví stanice / nábytek. */
function emptySlot(): PixelCanvas {
  const p = new PixelCanvas(18, 12);
  for (let x = 0; x < 18; x += 3) {
    p.set(x, 0, 'slate');
    p.set(x, 11, 'slate');
  }
  for (let y = 0; y < 12; y += 3) {
    p.set(0, y, 'slate');
    p.set(17, y, 'slate');
  }
  p.rect(8, 4, 2, 4, 'slate');
  p.rect(7, 5, 4, 2, 'slate');
  return p;
}

/** Kyvné dveře do kuchyně (s kulatým okénkem), ve zdi vedle výdejního okénka. */
function kitchenDoor(): PixelCanvas {
  const p = new PixelCanvas(16, 30);
  p.rect(0, 0, 16, 30, 'ink');
  p.rect(1, 1, 14, 29, 'rust');
  p.vline(8, 1, 29, 'blood');
  p.rect(2, 2, 5, 26, 'copper');
  p.rect(9, 2, 5, 26, 'copper');
  p.ellipse(4.5, 9, 1.8, 1.8, 'ice');
  p.ellipse(11.5, 9, 1.8, 1.8, 'ice');
  p.set(4, 8, 'white');
  p.set(11, 8, 'white');
  p.hline(2, 6, 18, 'sand');
  p.hline(9, 13, 18, 'sand');
  return p;
}

/** Police s hrnci na zdi kuchyně. */
function potShelf(): PixelCanvas {
  const p = new PixelCanvas(28, 12);
  p.rect(0, 9, 28, 2, 'rust');
  p.hline(0, 27, 9, 'ochre');
  p.ellipse(5, 6, 4, 3, 'copper');
  p.rect(1, 6, 9, 3, 'copper');
  p.hline(2, 8, 4, 'sand');
  p.ellipse(15, 7, 3, 2, 'slate');
  p.rect(12, 7, 7, 2, 'slate');
  p.rect(22, 3, 4, 6, 'bone');
  p.rect(23, 2, 2, 1, 'red');
  return p.outline('ink');
}

/** Stolek s kuchařskou knihou a hrncem na plotýnce (okno vaření receptů). */
function bookTable(): PixelCanvas {
  const p = new PixelCanvas(26, 22);
  // stolek
  p.rect(1, 11, 24, 3, 'copper');
  p.hline(1, 24, 11, 'ochre');
  p.rect(2, 14, 2, 8, 'rust');
  p.rect(22, 14, 2, 8, 'rust');
  p.rect(2, 17, 22, 1, 'rust');
  // otevřená kniha (vlevo)
  p.rect(2, 7, 6, 4, 'bone');
  p.rect(8, 7, 6, 4, 'white');
  p.vline(8, 6, 11, 'rust');
  p.rect(1, 10, 14, 1, 'maroon');
  for (const y of [8, 9]) { p.hline(3, 6, y, 'fog'); p.hline(9, 12, y, 'fog'); }
  p.set(4, 8, 'red');
  // plotýnka a hrnec (vpravo)
  p.rect(15, 9, 9, 2, 'coal');
  p.hline(16, 22, 10, 'amber');
  p.rect(16, 3, 7, 6, 'slate');
  p.rect(17, 4, 5, 4, 'fog');
  p.hline(15, 23, 3, 'coal');
  p.set(15, 5, 'coal');
  p.set(23, 5, 'coal');
  p.rect(18, 1, 3, 2, 'coal');
  return p.outline('ink');
}

/** Pozadí kuchyně: kachlíky na zdi a dlažba. */
export function drawKitchenBackground(): PixelCanvas {
  const w = KITCHEN.w * T;
  const h = (KITCHEN.wallRows + KITCHEN.floorRows) * T;
  const p = new PixelCanvas(w, h);
  const wallH = KITCHEN.wallRows * T;
  for (let y = 0; y < wallH; y++)
    for (let x = 0; x < w; x++) {
      let c: PalKey = 'white';
      if (y % 6 === 0 || (x + (Math.floor(y / 6) % 2) * 3) % 6 === 0) c = 'fog';
      if (y > wallH - 4) c = y === wallH - 1 ? 'ink' : 'sage';
      p.set(x, y, c);
    }
  p.hline(0, w - 1, 0, 'slate');
  for (let y = wallH; y < h; y++)
    for (let x = 0; x < w; x++) {
      const cx = Math.floor(x / 8);
      const cy = Math.floor((y - wallH) / 8);
      let c: PalKey = (cx + cy) % 2 ? 'fog' : 'bone';
      if (x % 8 === 0 || (y - wallH) % 8 === 0) c = 'slate';
      p.set(x, y, c);
    }
  // boční stěny
  p.rect(0, 0, 2, h, 'ink');
  p.rect(w - 2, 0, 2, h, 'ink');
  return p;
}

export function buildKitchenArt(): Record<string, PixelCanvas> {
  return {
    kStove: stove(), kToaster: toaster(), kFryer: fryer(), kOven: oven(), kSmoker: smoker(), kPress: press(),
    kEmpty: emptySlot(), kDoor: kitchenDoor(), kShelf: potShelf(), kBook: bookTable(),
  };
}
