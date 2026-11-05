import { PixelCanvas } from './pixel';
import type { PalKey } from '../data/palette';

// Výherní automat v hospodě (nábytek 'slots') a symboly na válcích. Každá hospoda má svůj:
// U Zlatého sudu dřevěný se zlatým sudem, v Krčmě Kostnici kostěný s lebkou, u Žabáka zelená žába.
// Varianta „lit“ = rozsvícené žárovky (bliká po výhře).

export type SlotsLook = 'sud' | 'kost' | 'zaba';

function machine(look: SlotsLook, lit: boolean): PixelCanvas {
  const p = new PixelCanvas(18, 30);
  const [body, hi, dark, trim]: PalKey[] =
    look === 'sud' ? ['rust', 'copper', 'maroon', 'gold'] : look === 'kost' ? ['dusk', 'mauve', 'ink', 'bone'] : ['pine', 'green', 'grave', 'mint'];
  const bulbs: PalKey[] = lit ? ['white', 'gold', 'white'] : look === 'kost' ? ['plum', 'mauve', 'plum'] : ['ochre', 'amber', 'ochre'];
  // tělo
  p.rect(1, 7, 14, 21, body);
  p.vline(2, 8, 26, hi);
  p.vline(14, 8, 27, dark);
  p.rect(1, 27, 14, 2, dark);
  if (look === 'sud') {
    // dřevěná prkna a zlatý sud nahoře
    for (const y of [12, 18, 24]) p.hline(2, 13, y, 'maroon');
    p.ellipse(8, 4, 6, 3.4, 'gold');
    p.hline(3, 13, 2, 'ochre');
    p.hline(3, 13, 6, 'ochre');
    p.hline(4, 12, 3, 'sand');
    p.rect(7, 3, 3, 2, 'amber');
    p.set(8, 4, 'white');
  } else if (look === 'kost') {
    // lebka nahoře, kosti po stranách
    p.ellipse(8, 3.6, 4.4, 3.4, 'bone');
    p.rect(6, 5, 5, 2, 'bone');
    p.rect(6, 3, 2, 2, lit ? 'mint' : 'ink');
    p.rect(9, 3, 2, 2, lit ? 'mint' : 'ink');
    p.set(8, 5, 'ink');
    p.hline(6, 10, 7, 'fog');
    for (const x of [0, 15]) { p.vline(x, 9, 25, 'bone'); p.set(x, 8, 'white'); p.set(x, 26, 'white'); }
    for (const y of [20, 22, 24]) p.hline(4, 11, y, 'mauve');
  } else {
    // žabí oči a jazyk
    p.ellipse(4.5, 4, 3, 3, 'green');
    p.ellipse(11.5, 4, 3, 3, 'green');
    p.rect(3, 3, 3, 3, 'white');
    p.rect(10, 3, 3, 3, 'white');
    p.set(4, 4, 'ink');
    p.set(11, 4, 'ink');
    p.hline(2, 13, 7, 'mint');
    p.rect(7, 21, 2, 3, 'scarlet');
    for (const [x, y] of [[3, 19], [12, 20], [4, 25]]) p.set(x, y, 'olive');
  }
  // žárovky kolem okénka
  for (let k = 0; k < 5; k++) {
    p.set(3 + k * 2 + 1, 8, bulbs[k % 3]);
    if (k < 4) { p.set(2, 10 + k * 2, bulbs[(k + 1) % 3]); p.set(13, 10 + k * 2, bulbs[k % 3]); }
  }
  // okénko s válci
  p.rect(3, 10, 10, 7, trim);
  p.rect(4, 11, 8, 5, 'ink');
  for (const x of [4, 7, 10]) p.rect(x, 11, 2, 5, lit ? 'white' : 'bone');
  const mid: PalKey[] = look === 'sud' ? ['amber', 'gold', 'amber'] : look === 'kost' ? ['bone', 'fog', 'bone'] : ['green', 'scarlet', 'green'];
  [4, 7, 10].forEach((x, i) => { p.set(x, 13, mid[i]); p.set(x + 1, 13, 'ink'); });
  // štěrbina na mince a talíř na výhru
  p.rect(6, 18, 4, 1, 'ink');
  p.rect(4, 23, 8, 3, dark);
  p.hline(5, 10, 23, 'ink');
  p.set(6, 25, 'gold');
  p.set(9, 24, 'sand');
  // kloub páky (samotná páka je zvláštní obrázek, aby se dala stáhnout)
  p.rect(15, 16, 2, 3, 'slate');
  p.set(15, 16, 'fog');
  return p.outline('ink');
}

/** Páka automatu 5×12, kloub dole (stahuje se překlopením přes kloub). */
function lever(look: SlotsLook): PixelCanvas {
  const p = new PixelCanvas(5, 12);
  p.vline(2, 3, 11, 'fog');
  p.vline(3, 4, 11, 'slate');
  const knob: PalKey = look === 'kost' ? 'bone' : look === 'zaba' ? 'green' : 'scarlet';
  p.ellipse(2, 2, 1.6, 1.6, knob);
  p.set(1, 1, 'white');
  return p.outline('ink');
}

type Sym = 'mug' | 'skull' | 'frog' | 'heart' | 'foam';

/** Symbol na válci 9×9; každá hospoda má svou sadu (význam stejný, vzhled podle hospody). */
function sym(id: Sym, gold = false, look: SlotsLook = 'sud'): PixelCanvas {
  const p = new PixelCanvas(9, 9);
  const K = look === 'kost';
  const Z = look === 'zaba';
  if (id === 'mug' && K && !gold) {
    // kostnice: kalich z kosti s jedovatě zeleným mokem
    p.rect(1, 1, 7, 4, 'bone');
    p.hline(2, 6, 1, 'mint');
    p.hline(2, 6, 2, 'green');
    p.rect(3, 5, 3, 1, 'fog');
    p.vline(4, 5, 7, 'bone');
    p.hline(2, 6, 7, 'bone');
    p.set(1, 2, 'white');
  } else if (id === 'mug') {
    const b: PalKey = gold ? 'gold' : Z ? 'olive' : 'amber';
    p.rect(1, 2, 5, 6, b);
    p.hline(1, 5, 1, 'white');
    p.hline(1, 5, 2, Z && !gold ? 'mint' : 'bone');
    p.vline(2, 3, 6, gold ? 'white' : Z ? 'green' : 'sand');
    p.vline(7, 3, 6, gold ? 'ochre' : 'fog');
    p.set(6, 3, gold ? 'ochre' : 'fog');
    p.set(6, 6, gold ? 'ochre' : 'fog');
    if (Z && !gold) p.set(3, 5, 'white');
  } else if (id === 'skull') {
    p.ellipse(4, 3.5, 3.4, 3, 'bone');
    p.rect(2, 5, 5, 2, 'bone');
    p.set(3, 3, K ? 'mint' : 'ink');
    p.set(5, 3, K ? 'mint' : 'ink');
    p.set(4, 5, 'ink');
    p.set(3, 7, 'fog');
    p.set(5, 7, 'fog');
    if (Z) { p.ellipse(6, 1.2, 1.6, 1, 'green'); p.set(7, 1, 'mint'); }
  } else if (id === 'frog') {
    const body: PalKey = K ? 'sage' : 'green';
    p.ellipse(4, 5, 3.6, 2.6, body);
    p.rect(1, 1, 2, 2, K ? 'mint' : 'white');
    p.rect(6, 1, 2, 2, K ? 'mint' : 'white');
    p.set(2, 2, 'ink');
    p.set(6, 2, 'ink');
    p.hline(2, 6, 6, K ? 'grave' : 'pine');
    if (Z) { p.hline(3, 5, 0, 'gold'); p.set(3, 1, 'gold'); p.set(5, 1, 'gold'); p.set(4, 1, 'amber'); }
  } else if (id === 'heart') {
    const c: PalKey = K ? 'plum' : Z ? 'red' : 'scarlet';
    p.ellipse(2.5, 3, 2, 2, c);
    p.ellipse(5.5, 3, 2, 2, c);
    for (let y = 4; y < 8; y++) p.hline(1 + (y - 4), 7 - (y - 4), y, c);
    p.set(2, 2, 'white');
    if (K) { p.vline(4, 3, 6, 'mint'); p.set(3, 4, 'mint'); p.set(5, 5, 'mint'); }
    if (Z) p.hline(3, 5, 6, 'scarlet');
  } else if (K) {
    // kostnice: zelený přízračný dým
    p.ellipse(4, 3.5, 3.2, 2.4, 'mint');
    p.ellipse(2.5, 5.5, 2, 1.6, 'sage');
    p.ellipse(6, 5.5, 2, 1.6, 'sage');
    p.set(3, 3, 'white');
    p.set(5, 3, 'ink');
  } else if (Z) {
    // u Žabáka: bublinky z rybníka
    p.ellipse(3, 5, 2.4, 2.4, 'ice');
    p.ellipse(6.4, 2.4, 1.6, 1.6, 'sky');
    p.set(2, 4, 'white');
    p.set(6, 2, 'white');
    p.set(7, 6, 'ice');
  } else {
    p.ellipse(4, 4, 3.4, 2.4, 'white');
    p.ellipse(2.5, 5.5, 2, 1.6, 'bone');
    p.ellipse(6, 5.5, 2, 1.6, 'bone');
    p.set(3, 3, 'ice');
  }
  return p.outline('ink');
}

export function buildSlots(): Record<string, PixelCanvas> {
  return {
    slots: machine('sud', false),
    slotsLit: machine('sud', true),
    slotsKost: machine('kost', false),
    slotsKostLit: machine('kost', true),
    slotsZaba: machine('zaba', false),
    slotsZabaLit: machine('zaba', true),
    s_mug: sym('mug'),
    s_skull: sym('skull'),
    s_frog: sym('frog'),
    s_heart: sym('heart'),
    s_foam: sym('foam'),
    s_goldMug: sym('mug', true),
    ...Object.fromEntries((['mug', 'skull', 'frog', 'heart', 'foam'] as Sym[]).flatMap((id) => [[`s_${id}Kost`, sym(id, false, 'kost')], [`s_${id}Zaba`, sym(id, false, 'zaba')]])),
    slotsLever: lever('sud'),
    slotsLeverKost: lever('kost'),
    slotsLeverZaba: lever('zaba'),
  };
}
