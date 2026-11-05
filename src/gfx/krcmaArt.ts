import { PixelCanvas } from './pixel';

// Rekvizity událostí sklepní krčmy: rozsypaný kostlivec (okousal ho vlkodlak), stehenní kost
// a kýbl zbytků pro aligátora (plný / vyjedený).

/** Hromádka kostí: lebka, žebra, pánev a hnáty – kostlivec, kterého rozebral vlkodlak. */
function skelPile(): PixelCanvas {
  const p = new PixelCanvas(22, 11);
  // žebra (oblouky nad sebou)
  p.vline(10, 1, 9, 'fog');
  for (let i = 0; i < 4; i++) {
    const w = 3 - (i === 3 ? 1 : 0);
    p.hline(10 - w, 10 + w, 2 + i * 2, 'bone');
    p.set(9 - w, 3 + i * 2, 'bone');
    p.set(11 + w, 3 + i * 2, 'bone');
  }
  // pánev
  p.template(['.bbb.', 'bfbfb', '.b.b.'], 14, 7, { b: 'bone', f: 'fog' });
  // lebka (válí se vlevo, šklebí se)
  p.template(['.bbbb.', 'bbbbbb', 'bkbbkb', 'bbbbbb', '.wkwk.'], 0, 4, { b: 'bone', k: 'ink', w: 'white' });
  // ruka a hnát ležící napříč
  p.hline(15, 20, 3, 'bone');
  p.hline(15, 20, 4, 'fog');
  p.set(14, 2, 'bone');
  p.set(21, 2, 'bone');
  p.set(14, 5, 'fog');
  p.set(21, 5, 'fog');
  p.hline(2, 6, 10, 'bone');
  p.set(1, 9, 'bone');
  p.set(7, 9, 'bone');
  return p.outline('ink');
}

/** Stehenní kost (vlkodlak ji ohryzává). */
function femur(): PixelCanvas {
  const p = new PixelCanvas(11, 5);
  p.hline(2, 8, 2, 'bone');
  p.hline(2, 8, 3, 'fog');
  for (const x of [1, 9]) {
    p.vline(x, 1, 3, 'bone');
    p.set(x === 1 ? 0 : 10, 1, 'bone');
    p.set(x === 1 ? 0 : 10, 3, 'fog');
  }
  p.set(5, 2, 'white');
  return p.outline('ink');
}

/** Kýbl zbytků pro aligátora: dřevěný, okované obruče; plný (rybí ocas, kost, maso) nebo vyjedený. */
function gatorBucket(full: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const top = 5;
  for (let y = 0; y < 10; y++) {
    const inset = Math.floor(y / 4);
    p.hline(2 + inset, 13 - inset, top + y, y % 3 === 0 ? 'rust' : 'copper');
  }
  for (let x = 4; x < 13; x += 3) p.vline(x, top + 1, top + 8, 'rust');
  p.hline(2, 13, top + 2, 'slate');
  p.hline(3, 12, top + 7, 'slate');
  // ucha po stranách
  p.set(1, top + 1, 'slate');
  p.set(14, top + 1, 'slate');
  // vnitřek
  p.hline(3, 12, top, 'coal');
  if (full) {
    // rybí ocas, kost a kusy masa trčí ven
    p.template(['s...s', 'ss.ss', '.sss.', '..s..', '..l..'], 2, top - 5, { s: 'sky', l: 'blue' });
    p.template(['bb.', '.b.', '.bb'], 9, top - 4, { b: 'bone' });
    p.template(['.rr.', 'rRRr'], 6, top - 2, { r: 'red', R: 'scarlet' });
    p.hline(3, 12, top, 'blood');
    p.set(5, top, 'red');
    p.set(11, top - 1, 'sage');
    p.set(12, top, 'sage');
  } else {
    // jen pár kapek a rybí páteř
    p.hline(5, 9, top, 'dusk');
    p.set(7, top, 'fog');
  }
  return p.outline('ink');
}

export function buildKrcmaObjects(): Record<string, PixelCanvas> {
  return {
    kSkelPile: skelPile(),
    kFemur: femur(),
    kBucketFull: gatorBucket(true),
    kBucketEmpty: gatorBucket(false),
  };
}
