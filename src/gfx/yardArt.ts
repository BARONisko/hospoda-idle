// Kuchyně C (hospoda 38): lednice, okénko dodavatele, stroje v dílně, záhony a chmelnice na zahradě.
// Sprity převzaté ze schváleného návrhu (tools/navrhy/mockart.js), v atlasu 'obj' s předponou „y“.
import { PixelCanvas } from './pixel';
import type { PalKey } from '../data/palette';

export function buildYardArt(): Record<string, PixelCanvas> {
  const PC = PixelCanvas;
  const A: Record<string, PixelCanvas> = {};

  // lednice (dvoudveřová, chromová)
  { const p = new PC(26, 34);
    p.rect(0, 0, 26, 34, 'fog'); p.rect(1, 1, 24, 32, 'bone');
    p.vline(13, 1, 32, 'fog'); p.hline(1, 24, 12, 'fog');
    p.rect(10, 4, 2, 6, 'slate'); p.rect(14, 4, 2, 6, 'slate'); p.rect(10, 16, 2, 10, 'slate'); p.rect(14, 16, 2, 10, 'slate');
    p.rect(3, 2, 5, 3, 'ice'); p.set(4, 3, 'white');
    p.rect(2, 33, 3, 1, 'ink'); p.rect(21, 33, 3, 1, 'ink');
    A.yFridge = p.outline('ink'); }
  // otevřená lednice s regály
  { const p = new PC(30, 34);
    p.rect(4, 0, 22, 34, 'fog'); p.rect(5, 1, 20, 32, 'ice');
    for (const y of [9, 17, 25]) p.hline(5, 24, y, 'white');
    p.ellipse(9, 6, 3, 2.5, 'green'); p.ellipse(9, 5, 2, 1.5, 'mint'); p.ellipse(16, 6, 3, 2.5, 'green'); // zelí
    p.ellipse(9, 14, 2.5, 2, 'tan'); p.ellipse(14, 15, 2.5, 2, 'tan'); p.ellipse(19, 14, 2.5, 2, 'ochre'); // brambory
    p.rect(7, 19, 7, 5, 'red'); p.rect(8, 20, 5, 2, 'scarlet'); p.rect(16, 20, 6, 4, 'mauve'); // maso
    p.ellipse(9, 30, 2.5, 2.5, 'sand'); p.set(9, 27, 'sage'); p.ellipse(15, 30, 2.5, 2.5, 'ochre'); p.set(15, 27, 'sage');
    p.rect(19, 27, 4, 5, 'gold'); p.rect(20, 26, 2, 1, 'white'); // máslo/sýr
    p.rect(0, 1, 4, 32, 'bone'); p.vline(1, 8, 20, 'slate');
    A.yFridgeOpen = p.outline('ink'); }
  // dřevěný regál s bednami
  { const p = new PC(30, 30);
    p.rect(0, 0, 2, 30, 'rust'); p.rect(28, 0, 2, 30, 'rust');
    for (const y of [9, 19, 28]) { p.rect(0, y, 30, 2, 'copper'); p.hline(0, 29, y, 'ochre'); }
    // bedny
    const crate = (x: number, y: number, c1: PalKey, c2: PalKey) => { p.rect(x, y - 6, 11, 6, 'olive'); p.hline(x, x + 10, y - 3, 'rust'); for (let i = 0; i < 4; i++) p.ellipse(x + 2 + i * 2.4, y - 6, 1.6, 1.6, i % 2 ? c1 : c2); };
    crate(3, 9, 'green', 'mint'); crate(16, 9, 'tan', 'ochre');
    crate(3, 19, 'sand', 'ochre'); crate(16, 19, 'red', 'scarlet');
    p.rect(4, 22, 4, 6, 'bone'); p.rect(10, 23, 4, 5, 'sage'); p.rect(17, 21, 8, 7, 'tan'); p.hline(17, 24, 23, 'olive');
    A.yRack = p.outline('ink'); }
  // klobásy a šunka na háku
  { const p = new PC(18, 16);
    p.hline(0, 17, 0, 'slate');
    for (const x of [2, 6, 10]) { p.vline(x + 1, 1, 2, 'tan'); p.rect(x, 3, 3, 8, 'red'); p.vline(x, 4, 9, 'rust'); }
    p.vline(15, 1, 2, 'tan'); p.ellipse(15, 9, 3, 5, 'mauve'); p.ellipse(15, 8, 2, 3, 'skin');
    A.yHooks = p.outline('ink'); }
  // okénko dodavatele ve zdi (otevřené, s markýzou a dodavatelem)
  { const p = new PC(34, 30);
    p.rect(0, 0, 34, 6, 'red'); for (let x = 0; x < 34; x += 6) p.rect(x, 0, 3, 6, 'white');
    for (let x = 0; x < 34; x += 3) p.set(x + 1, 6, 'red');
    p.rect(2, 7, 30, 18, 'olive'); p.rect(4, 8, 26, 16, 'navy');
    // dodavatel: čepice, hlava, knír
    p.rect(11, 9, 12, 3, 'blue'); p.rect(9, 11, 16, 1, 'blue');
    p.rect(12, 12, 10, 7, 'skin'); p.set(14, 14, 'ink'); p.set(19, 14, 'ink'); p.hline(14, 19, 16, 'olive');
    p.rect(9, 19, 16, 5, 'blue'); p.rect(15, 19, 4, 5, 'white');
    // pult s bednou
    p.rect(0, 24, 34, 4, 'copper'); p.hline(0, 33, 24, 'sand');
    p.rect(24, 18, 8, 6, 'olive'); p.ellipse(26, 18, 1.6, 1.6, 'green'); p.ellipse(29, 18, 1.6, 1.6, 'tan');
    p.rect(2, 20, 5, 4, 'bone'); p.hline(3, 6, 21, 'slate'); // dodací list
    A.ySupplier = p.outline('ink'); }
  // zavřené okénko dodavatele (roleta)
  { const p = new PC(34, 30);
    p.rect(0, 0, 34, 6, 'red'); for (let x = 0; x < 34; x += 6) p.rect(x, 0, 3, 6, 'white');
    p.rect(2, 7, 30, 18, 'olive'); for (let y = 8; y < 24; y += 2) p.hline(4, 29, y, 'fog'); for (let y = 9; y < 24; y += 2) p.hline(4, 29, y, 'slate');
    p.rect(0, 24, 34, 4, 'copper'); p.hline(0, 33, 24, 'sand');
    p.rect(13, 13, 8, 5, 'bone'); p.hline(14, 20, 15, 'red');
    A.ySupplierShut = p.outline('ink'); }
  // tabule objednávek (křída)
  { const p = new PC(26, 22);
    p.rect(0, 0, 26, 22, 'rust'); p.rect(2, 2, 22, 18, 'grave');
    const row = (y: number, c: PalKey, n: number) => { p.rect(4, y, 3, 3, c); for (let i = 0; i < n; i++) p.set(9 + i * 2, y + 1, 'bone'); p.hline(18, 21, y + 1, 'gold'); };
    row(4, 'green', 3); row(8, 'tan', 4); row(12, 'red', 2); row(16, 'sand', 3);
    A.yBoard = p.outline('ink'); }
  // stroj: škrabka na brambory (buben s klikou)
  { const p = new PC(20, 24);
    p.rect(3, 16, 14, 8, 'slate'); p.rect(4, 17, 12, 6, 'fog');
    p.ellipse(10, 10, 7, 7, 'fog'); p.ellipse(10, 10, 5, 5, 'bone'); p.ellipse(10, 10, 2, 2, 'slate');
    p.ellipse(8, 8, 1.4, 1.2, 'tan'); p.ellipse(12, 12, 1.4, 1.2, 'tan');
    p.rect(17, 9, 3, 2, 'slate'); p.rect(18, 4, 2, 6, 'slate'); p.rect(17, 3, 3, 2, 'red');
    p.rect(5, 20, 3, 2, 'mint');
    A.yPeeler = p.outline('ink'); }
  // stroj: mlýnek na maso
  { const p = new PC(22, 22);
    p.rect(0, 16, 22, 6, 'olive'); p.hline(0, 21, 16, 'ochre');
    p.rect(5, 2, 8, 6, 'slate'); p.rect(6, 1, 6, 2, 'fog');
    p.rect(4, 8, 12, 6, 'fog'); p.rect(15, 9, 4, 4, 'slate'); p.ellipse(18, 11, 1.5, 2.5, 'bone');
    p.rect(1, 9, 4, 2, 'slate'); p.rect(0, 5, 2, 5, 'red');
    p.rect(17, 13, 4, 3, 'bone'); p.rect(18, 13, 2, 2, 'scarlet');
    A.yGrinder = p.outline('ink'); }
  // stroj: krouhač zelí do sudu
  { const p = new PC(20, 26);
    p.ellipse(10, 18, 9, 7, 'rust'); p.rect(1, 12, 18, 12, 'rust'); p.hline(1, 18, 15, 'olive'); p.hline(1, 18, 21, 'olive');
    p.ellipse(10, 12, 9, 3, 'olive'); p.ellipse(10, 12, 7, 2, 'sage');
    p.rect(3, 3, 14, 6, 'fog'); p.hline(4, 16, 5, 'slate'); p.hline(4, 16, 7, 'slate');
    p.ellipse(10, 2, 4, 2.5, 'green'); p.ellipse(10, 1.5, 2.5, 1.5, 'mint');
    A.ySlicer = p.outline('ink'); }
  // automat – sušička cibule (budoucí stroj „zásobovač“)
  { const p = new PC(20, 28);
    p.rect(1, 2, 18, 26, 'slate'); p.rect(2, 3, 16, 24, 'dusk');
    for (const y of [7, 13, 19]) { p.hline(3, 16, y, 'fog'); for (let x = 4; x < 16; x += 4) p.ellipse(x + 1, y - 2, 1.6, 1.6, 'sand'); }
    p.rect(3, 22, 14, 4, 'coal'); p.rect(5, 23, 3, 2, 'amber'); p.rect(12, 23, 3, 2, 'mint');
    p.rect(8, 0, 4, 2, 'fog');
    A.yDryer = p.outline('ink'); }
  // pásový dopravník (výstup stroje)
  { const p = new PC(32, 8);
    p.rect(0, 1, 32, 5, 'coal'); p.hline(0, 31, 1, 'slate'); for (let x = 1; x < 32; x += 4) p.vline(x, 2, 5, 'slate');
    p.ellipse(3, 6, 2, 2, 'fog'); p.ellipse(28, 6, 2, 2, 'fog');
    p.ellipse(10, 0.5, 2, 1.5, 'tan'); p.ellipse(20, 0.5, 2, 1.5, 'tan');
    A.yBelt = p.outline('ink'); }
  // záhon (3 řádky) – zelí / cibule / brambory
  // rostlina na řádku (společná pro všechny styly záhonu)
  const plant = (p: PixelCanvas, kind: string, x: number, y: number, grown: boolean) => {
    if (!grown) { p.set(x, y, 'sage'); p.set(x, y - 1, 'mint'); p.set(x - 1, y - 1, 'green'); return; }
    if (kind === 'cabbage') { p.ellipse(x, y - 1, 3, 2.6, 'pine'); p.ellipse(x, y - 1.5, 2.4, 2, 'green'); p.ellipse(x - 0.5, y - 2, 1.3, 1.1, 'mint'); p.set(x + 1, y, 'pine'); }
    else if (kind === 'onion') { p.ellipse(x, y, 1.6, 1.3, 'sand'); p.set(x - 1, y, 'ochre'); p.vline(x, y - 4, y - 1, 'green'); p.vline(x + 1, y - 3, y - 1, 'mint'); p.set(x - 1, y - 3, 'green'); }
    else { p.ellipse(x, y - 1, 2.8, 1.9, 'pine'); p.ellipse(x, y - 1.5, 2.2, 1.4, 'green'); p.set(x - 1, y - 2, 'mint'); p.set(x + 1, y - 3, 'mint'); p.set(x, y - 3, 'bone'); p.set(x + 2, y, 'tan'); }
  };
  // hlína s brázdami (tmavší dole, světlejší hřbet brázdy)
  const soil = (p: PixelCanvas, x0: number, y0: number, w: number, h: number) => {
    p.rect(x0, y0, w, h, 'rust');
    for (let y = y0 + 2; y < y0 + h; y += 6) { p.hline(x0, x0 + w - 1, y + 2, 'maroon'); p.hline(x0, x0 + w - 1, y + 3, 'copper'); }
    for (let i = 0; i < w * h / 14; i++) { const x = x0 + ((i * 37) % w); const y = y0 + ((i * 53) % h); p.set(x, y, i % 3 ? 'maroon' : 'ochre'); }
  };
  // vyvýšený záhon z prken (hospoda 41, návrh A): hřebíky, letokruhy, stín pod okrajem, hlína s brázdami
  const bed = (kind: string, grown = true) => {
    const p = new PC(34, 24);
    soil(p, 2, 3, 30, 15);
    p.hline(2, 31, 3, 'maroon'); // stín pod zadním prknem
    // zadní prkno
    p.rect(0, 0, 34, 3, 'copper'); p.hline(0, 33, 0, 'ochre'); for (let x = 3; x < 34; x += 8) p.set(x, 1, 'rust');
    // boční prkna
    for (const x of [0, 32]) { p.rect(x, 0, 2, 22, 'copper'); p.vline(x, 0, 21, 'ochre'); }
    // přední prkno (vyšší, je vidět z boku)
    p.rect(0, 18, 34, 5, 'copper'); p.hline(0, 33, 18, 'sand'); p.hline(0, 33, 19, 'ochre'); p.hline(0, 33, 22, 'rust');
    for (let x = 6; x < 34; x += 9) p.hline(x, x + 3, 20, 'rust'); // letokruhy
    for (const x of [2, 31]) { p.set(x, 20, 'fog'); p.set(x, 1, 'fog'); } // hřebíky
    for (let r = 0; r < 3; r++) for (let x = 6; x < 30; x += 6) plant(p, kind, x, 7 + r * 5, grown);
    return p.outline('ink');
  };
  A.yBedCabbage = bed('cabbage'); A.yBedOnion = bed('onion'); A.yBedPotato = bed('potato'); A.yBedSprout = bed('', false);
  // chmelnice – tyč s drátem a popínavým chmelem
  { const p = new PC(18, 52);
    p.vline(8, 0, 51, 'olive'); p.vline(9, 0, 51, 'rust'); p.hline(0, 17, 1, 'slate');
    for (let y = 4; y < 48; y++) { const x = 8 + Math.round(Math.sin(y / 3) * 4);
      p.set(x, y, 'green'); p.set(x + 1, y, 'pine');
      if (y % 5 === 0) { p.ellipse(x + (y % 10 ? 3 : -2), y, 2, 2.5, 'mint'); p.set(x + (y % 10 ? 3 : -2), y - 1, 'bone'); }
      if (y % 7 === 0) { p.set(x - 2, y, 'sage'); p.set(x + 3, y + 1, 'sage'); } }
    p.rect(5, 48, 8, 4, 'rust');
    A.yHop = p.outline('ink'); }
  { const p = new PC(18, 52);
    p.vline(8, 0, 51, 'olive'); p.vline(9, 0, 51, 'rust'); p.hline(0, 17, 1, 'slate');
    for (let y = 30; y < 48; y++) { const x = 8 + Math.round(Math.sin(y / 3) * 4); p.set(x, y, 'green'); p.set(x + 1, y, 'pine'); }
    p.rect(5, 48, 8, 4, 'rust');
    A.yHopBare = p.outline('ink'); }
  // dřevěný plot
  { const p = new PC(48, 14);
    p.hline(0, 47, 4, 'copper'); p.hline(0, 47, 9, 'copper'); p.hline(0, 47, 5, 'rust'); p.hline(0, 47, 10, 'rust');
    for (let x = 1; x < 48; x += 6) { p.rect(x, 1, 3, 13, 'ochre'); p.vline(x + 2, 1, 13, 'rust'); p.set(x + 1, 0, 'ochre'); }
    A.yFence = p.outline('ink'); }
  // konev, kompost, strašák
  { const p = new PC(14, 10);
    p.rect(3, 3, 7, 6, 'sage'); p.rect(4, 4, 5, 1, 'mint'); p.vline(11, 1, 6, 'sage'); p.set(12, 1, 'sage'); p.set(13, 0, 'sage');
    p.rect(4, 1, 5, 1, 'pine'); p.vline(3, 1, 2, 'pine'); p.vline(9, 1, 2, 'pine');
    A.yCan = p.outline('ink'); }
  { const p = new PC(18, 34);
    p.vline(8, 8, 33, 'olive'); p.hline(1, 16, 13, 'olive');
    p.rect(4, 12, 10, 12, 'red'); p.rect(5, 13, 8, 10, 'scarlet'); p.hline(4, 13, 18, 'gold');
    p.ellipse(9, 6, 4, 4, 'sand'); p.set(7, 6, 'ink'); p.set(10, 6, 'ink'); p.hline(7, 10, 8, 'rust');
    p.rect(3, 1, 12, 2, 'olive'); p.rect(5, -1, 8, 3, 'olive'); p.set(0, 13, 'sand'); p.set(17, 13, 'sand');
    A.yScare = p.outline('ink'); }
  // pytel chmele / koš úrody
  { const p = new PC(14, 12);
    p.ellipse(7, 7, 6, 5, 'tan'); p.rect(3, 1, 8, 4, 'tan'); p.hline(3, 10, 3, 'olive');
    p.ellipse(5, 1, 1.6, 1.6, 'mint'); p.ellipse(8, 0.5, 1.6, 1.6, 'green'); p.ellipse(10, 1.5, 1.6, 1.6, 'mint');
    A.ySack = p.outline('ink'); }
  // ikonka bubliny "+" s mincí
  { const p = new PC(12, 12); p.ellipse(6, 6, 5, 5, 'gold'); p.ellipse(6, 6, 3.5, 3.5, 'sand'); p.vline(6, 3, 8, 'amber'); A.yCoin = p.outline('ink'); }
  return A;
}
