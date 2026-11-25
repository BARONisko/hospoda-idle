import { PixelCanvas, hash } from './pixel';
import { PalKey } from '../data/palette';
import type { RekoLook } from './rekoTiles';

// Kousky z úkolů ★1 Rekonstrukce (Pajzl u Berana) ve 3 návrzích vzhledu a/b/c.
// Atlas „obj“: rk{a,b,c}_{table,chair,lamp,tap,kegs,coat,board} a rkGloves.

/** barvy dřeva podle návrhu: deska, světlá, tmavá, nejtmavší */
const WOOD: Record<RekoLook, [PalKey, PalKey, PalKey, PalKey]> = {
  a: ['rust', 'copper', 'blood', 'ink'],
  b: ['dusk', 'slate', 'ink', 'ink'],
  c: ['ochre', 'sand', 'copper', 'rust'],
};

function table(l: RekoLook): PixelCanvas {
  const p = new PixelCanvas(34, 22);
  const [m, hi, dk, dd] = WOOD[l];
  if (l === 'b') {
    // ubrus červenobílý do čtverečků, splývá přes okraj
    for (let y = 1; y < 16; y++)
      for (let x = 1; x < 33; x++) {
        const k = (Math.floor(x / 3) + Math.floor(y / 3)) % 2;
        const both = Math.floor(x / 3) % 2 === 0 && Math.floor(y / 3) % 2 === 0;
        p.set(x, y, both ? 'red' : k ? 'white' : 'scarlet');
      }
    p.hline(1, 32, 1, 'white');
    for (let x = 1; x < 33; x += 4) p.set(x, 15, 'blood');
    p.hline(2, 31, 16, 'blood');
    p.rect(5, 17, 2, 3, 'ink');
    p.rect(27, 17, 2, 3, 'ink');
    // malá váza
    p.rect(16, 4, 2, 3, 'blue');
    p.set(16, 3, 'gold');
    p.set(17, 2, 'scarlet');
    return p.outline('ink');
  }
  // deska z masivu
  p.rect(1, 1, 32, 12, m);
  p.hline(2, 31, 1, hi);
  for (let i = 0; i < 4; i++) p.hline(2, 31, 3 + i * 3, i % 2 ? dk : m);
  for (let i = 0; i < 10; i++) {
    const x = 3 + Math.floor(hash(i, l.charCodeAt(0), 90) * 27);
    const y = 2 + Math.floor(hash(i, 3, 90) * 10);
    p.set(x, y, hi);
  }
  if (l === 'c') {
    // kulatina: letokruhy na čelech
    p.rect(1, 13, 32, 4, dk);
    p.hline(1, 32, 13, m);
    for (const cx of [3, 30]) {
      p.ellipse(cx, 6.5, 2.5, 5.5, hi);
      p.vline(cx, 3, 10, m);
    }
    p.rect(3, 17, 4, 4, dd);
    p.rect(27, 17, 4, 4, dd);
    p.set(4, 17, dk);
    p.set(28, 17, dk);
  } else {
    // a: tmavý dub s mosaznými rohy, soustružené nohy
    p.rect(1, 13, 32, 3, dk);
    p.hline(1, 32, 13, hi);
    for (const x of [1, 32]) {
      p.set(x, 1, 'gold');
      p.set(x, 12, 'gold');
    }
    for (const x of [3, 29]) {
      p.rect(x, 16, 2, 5, dk);
      p.set(x, 18, hi);
      p.set(x + 1, 18, hi);
    }
  }
  return p.outline('ink');
}

function chair(l: RekoLook): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  if (l === 'a') {
    // lavice s polstrovaným sedákem z kůže
    p.rect(2, 8, 12, 4, 'maroon');
    p.hline(2, 13, 8, 'red');
    p.hline(2, 13, 11, 'blood');
    p.rect(2, 12, 1, 3, 'blood');
    p.rect(13, 12, 1, 3, 'blood');
    p.rect(1, 1, 3, 11, 'rust');
    p.vline(1, 1, 11, 'copper');
    p.hline(1, 3, 1, 'gold');
    for (let y = 3; y < 10; y += 3) p.set(2, y, 'gold');
  } else if (l === 'b') {
    // ohýbaná židle (thonetka)
    p.rect(5, 8, 8, 3, 'dusk');
    p.hline(5, 12, 8, 'slate');
    p.vline(5, 11, 14, 'ink');
    p.vline(12, 11, 14, 'ink');
    p.vline(3, 2, 12, 'dusk');
    p.vline(4, 1, 3, 'slate');
    p.ellipse(4, 5, 1.5, 3, 'dusk');
    p.set(4, 5, 'ink');
  } else {
    // pařez se stoličkou z kulatiny
    p.ellipse(8, 9, 6, 2.5, 'sand');
    p.ellipse(8, 9, 3.5, 1.2, 'ochre');
    p.set(8, 9, 'copper');
    p.rect(3, 10, 11, 5, 'copper');
    p.vline(3, 10, 14, 'ochre');
    p.vline(13, 10, 14, 'rust');
    p.set(6, 12, 'rust');
    p.set(10, 13, 'rust');
  }
  return p.outline('ink');
}

/** závěsná lampa (řetízek + stínidlo + světlo) */
function lamp(l: RekoLook): PixelCanvas {
  const p = new PixelCanvas(14, 22);
  for (let y = 0; y < 10; y += 2) p.set(7, y, l === 'b' ? 'slate' : 'olive');
  if (l === 'a') {
    // mosazný zvon
    p.ellipse(7, 15, 6, 4.5, 'amber');
    p.rect(1, 15, 13, 3, 'amber');
    p.ellipse(5, 13, 2.5, 2, 'gold');
    p.hline(1, 13, 18, 'copper');
    p.rect(4, 10, 6, 2, 'copper');
    p.hline(4, 10, 19, 'sand');
    p.set(7, 20, 'white');
  } else if (l === 'b') {
    // smaltované stínidlo, zelené navrchu, bílé uvnitř
    p.rect(5, 10, 4, 2, 'dusk');
    p.ellipse(7, 15, 6.5, 3.5, 'green');
    p.ellipse(6, 14, 3, 1.5, 'mint');
    p.hline(0, 13, 17, 'bone');
    p.hline(1, 12, 18, 'white');
    p.ellipse(7, 19, 2, 1.2, 'sand');
  } else {
    // kovaná lucerna se svíčkou
    p.rect(5, 10, 5, 1, 'coal');
    p.rect(4, 11, 7, 9, 'coal');
    p.rect(5, 12, 5, 7, 'sand');
    p.rect(6, 14, 3, 4, 'gold');
    p.vline(7, 12, 13, 'white');
    p.vline(7, 11, 19, 'coal');
    p.hline(4, 10, 20, 'coal');
  }
  return p.outline('ink');
}

/** pípa se třemi kohouty */
function tap(l: RekoLook): PixelCanvas {
  const p = new PixelCanvas(26, 21);
  const [mm, ml, md]: PalKey[] = l === 'a' ? ['gold', 'sand', 'amber'] : l === 'b' ? ['fog', 'white', 'slate'] : ['copper', 'ochre', 'rust'];
  p.rect(2, 16, 22, 3, 'slate');
  p.hline(2, 23, 16, 'fog');
  for (let x = 3; x < 23; x += 2) p.set(x, 17, 'dusk');
  // vodorovné rameno na sloupku
  p.rect(11, 9, 4, 7, mm);
  p.vline(11, 9, 15, ml);
  p.rect(2, 6, 22, 3, mm);
  p.hline(2, 23, 6, ml);
  p.hline(2, 23, 8, md);
  const knob: PalKey[] = l === 'c' ? ['blood', 'olive', 'rust'] : ['scarlet', 'gold', 'blue'];
  [4, 12, 20].forEach((x, i) => {
    p.rect(x, 9, 2, 3, mm);
    p.set(x + 1, 12, md);
    p.rect(x, 0, 2, 6, l === 'b' ? 'ink' : 'blood');
    p.rect(x - 1, 0, 4, 2, knob[i]);
    p.set(x - 1, 0, 'white');
  });
  return p.outline('ink');
}

/** sudy za barem s křídovými cedulkami */
function kegs(l: RekoLook): PixelCanvas {
  const p = new PixelCanvas(36, 26);
  const [bm, bh, bd]: PalKey[] = l === 'b' ? ['fog', 'bone', 'slate'] : l === 'c' ? ['rust', 'copper', 'blood'] : ['copper', 'ochre', 'rust'];
  const hoop: PalKey = l === 'b' ? 'slate' : 'dusk';
  // stojan
  p.rect(1, 22, 34, 3, 'olive');
  p.hline(1, 34, 22, 'ochre');
  const keg = (cx: number, cy: number) => {
    p.ellipse(cx, cy, 7, 6, bm);
    p.ellipse(cx - 2, cy - 2, 3, 2.5, bh);
    p.ellipse(cx, cy, 3, 2.5, bd);
    p.set(cx, cy, 'ink');
    for (let a = 0; a < 24; a++) {
      const t = (a / 24) * Math.PI * 2;
      p.set(Math.round(cx + Math.cos(t) * 6.5), Math.round(cy + Math.sin(t) * 5.5), hoop);
    }
  };
  keg(9, 15);
  keg(27, 15);
  keg(18, 6);
  p.outline('ink');
  // křídové cedulky
  for (const [x, y, n] of [[5, 18, 0], [23, 18, 1], [14, 9, 2]] as const) {
    p.rect(x, y, 8, 5, 'coal');
    p.hline(x + 1, x + 6, y + 1, 'white');
    p.hline(x + 1, x + 3 + n, y + 3, 'bone');
    if (n === 1) p.set(x + 6, y + 3, 'gold');
  }
  return p;
}

/** věšák s klobouky a kabáty */
function coat(l: RekoLook): PixelCanvas {
  const p = new PixelCanvas(20, 30);
  if (l === 'c') {
    // paroží jako věšák
    p.vline(10, 4, 27, 'copper');
    p.vline(9, 4, 27, 'ochre');
    p.hline(5, 14, 28, 'rust');
    for (const [x, d] of [[6, -1], [13, 1]] as const) {
      p.hline(Math.min(x, x + 3 * d), Math.max(x, x + 3 * d), 4, 'bone');
      p.set(x + 3 * d, 3, 'bone');
      p.set(x + d, 3, 'bone');
      p.set(x + 2 * d, 2, 'bone');
    }
  } else {
    const pole: PalKey = l === 'b' ? 'dusk' : 'rust';
    p.vline(10, 3, 27, pole);
    p.vline(9, 3, 27, l === 'b' ? 'slate' : 'copper');
    p.hline(5, 14, 28, pole);
    p.hline(6, 13, 4, l === 'a' ? 'gold' : pole);
  }
  // kabát a klobouky
  p.rect(3, 6, 5, 13, l === 'b' ? 'navy' : 'green');
  p.vline(3, 6, 18, l === 'b' ? 'ink' : 'pine');
  p.set(5, 7, 'white');
  p.rect(12, 7, 5, 10, 'maroon');
  p.vline(16, 7, 16, 'blood');
  p.rect(12, 0, 7, 2, 'olive');
  p.hline(11, 19, 2, 'ink');
  p.rect(1, 1, 6, 2, l === 'b' ? 'ink' : 'tan');
  p.hline(0, 7, 3, 'dusk');
  return p.outline('ink');
}

/** tabule s kresbami štamgastů */
function board(l: RekoLook): PixelCanvas {
  const p = new PixelCanvas(22, 16);
  const fr: PalKey = l === 'a' ? 'gold' : l === 'b' ? 'bone' : 'copper';
  p.rect(0, 0, 22, 16, fr);
  p.rect(1, 1, 20, 14, l === 'b' ? 'pine' : 'coal');
  // tři hlavičky křídou
  for (const [x, c] of [[4, 'white'], [10, 'bone'], [16, 'white']] as const) {
    p.ellipse(x + 0.5, 6, 2.5, 2.5, c);
    p.set(x - 1, 6, l === 'b' ? 'pine' : 'coal');
    p.set(x + 1, 6, l === 'b' ? 'pine' : 'coal');
    p.hline(x - 2, x + 3, 10, c);
  }
  p.set(3, 3, 'gold'); // korunka nejlepšího štamgasta
  p.set(5, 3, 'gold');
  p.hline(3, 5, 4, 'gold');
  p.hline(3, 18, 13, 'fog');
  return p.outline('ink');
}

/** boxerské rukavice na hřebíku */
function gloves(): PixelCanvas {
  const p = new PixelCanvas(16, 14);
  p.hline(4, 11, 1, 'bone');
  p.vline(4, 1, 4, 'bone');
  p.vline(11, 1, 4, 'bone');
  p.set(8, 0, 'slate');
  for (const cx of [4, 11]) {
    p.ellipse(cx, 8.5, 3.5, 4, 'red');
    p.ellipse(cx - 1, 7, 1.5, 2, 'scarlet');
    p.rect(cx - 2, 11, 5, 2, 'white');
  }
  return p.outline('ink');
}

export function buildRekoArt(): Record<string, PixelCanvas> {
  const o: Record<string, PixelCanvas> = { rkGloves: gloves() };
  for (const l of ['a', 'b', 'c'] as const) {
    o[`rk${l}_table`] = table(l);
    const c = chair(l);
    o[`rk${l}_chairL`] = c;
    o[`rk${l}_chairR`] = c.flipped();
    o[`rk${l}_lamp`] = lamp(l);
    o[`rk${l}_tap`] = tap(l);
    o[`rk${l}_kegs`] = kegs(l);
    o[`rk${l}_coat`] = coat(l);
    o[`rk${l}_board`] = board(l);
  }
  return o;
}
