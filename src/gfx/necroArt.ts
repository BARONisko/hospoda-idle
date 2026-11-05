// Necronomicon od šíleného mnicha: kniha v kůži s tváří na obálce a prosklená vitrínka na zdi hospody.
import { PixelCanvas } from './pixel';

/** Kniha (leží na stole): tmavá kůže, kostěná tvář, zlaté kování. */
function necro(): PixelCanvas {
  const p = new PixelCanvas(12, 10);
  p.rect(1, 2, 10, 7, 'blood');
  p.hline(1, 10, 2, 'maroon');
  p.vline(1, 2, 8, 'olive'); // hřbet
  p.hline(2, 10, 8, 'bone'); // stránky zespodu
  p.set(10, 7, 'bone');
  // tvář: oči, nos, sešitá ústa
  p.set(5, 4, 'bone');
  p.set(8, 4, 'bone');
  p.set(6, 5, 'mauve');
  p.hline(5, 8, 6, 'mauve');
  p.set(6, 6, 'ink');
  p.set(7, 6, 'ink');
  // kování v rozích
  p.set(2, 3, 'gold');
  p.set(10, 3, 'gold');
  p.set(2, 7, 'gold');
  p.set(1, 1, 'mint'); // zelený záblesk
  p.outline('ink');
  return p;
}

/** Vitrínka na zdi: dřevěný rám, sklo s odleskem, kniha uvnitř na stojánku. */
function necroCase(lit: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(1, 1, 14, 14, 'olive');
  p.rect(2, 2, 12, 11, lit ? 'pine' : 'navy');
  // kniha na stojánku
  p.rect(4, 5, 8, 6, 'blood');
  p.vline(4, 5, 10, 'olive');
  p.set(6, 7, 'bone');
  p.set(9, 7, 'bone');
  p.hline(6, 9, 9, 'mauve');
  p.set(5, 6, 'gold');
  p.set(11, 6, 'gold');
  p.hline(5, 11, 11, 'rust'); // stojánek
  // odlesk skla
  p.set(3, 3, 'ice');
  p.set(4, 3, 'ice');
  p.set(3, 4, 'ice');
  p.set(12, 9, lit ? 'mint' : 'sky');
  // spodní lišta s mosaznou cedulkou
  p.hline(1, 14, 13, 'rust');
  p.hline(6, 9, 14, 'gold');
  p.outline('ink');
  return p;
}

export function buildNecroArt(): Record<string, PixelCanvas> {
  return { necro: necro(), necroCase: necroCase(false), necroCaseLit: necroCase(true) };
}
