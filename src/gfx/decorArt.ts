import { PixelCanvas } from './pixel';
import { PalKey } from '../data/palette';
import { IDOL_KEYS, IDOL_FRAMES } from './idolSprite';
import type { TrophyKey } from '../data/trophies';

// Atlas „obj“: výzdoba na zeď, speciality a suroviny ze sklepa, věci pro muže v kabátě,
// páka zkratky a výtah na sudy.

// ------------------------------------------------------------------ výzdoba
function boar(): PixelCanvas {
  const p = new PixelCanvas(18, 16);
  p.rect(5, 12, 8, 3, 'rust'); // štít
  p.hline(5, 12, 12, 'copper');
  p.ellipse(9, 7, 5.5, 5, 'dusk'); // hlava
  p.ellipse(9, 10, 3.5, 3, 'mauve'); // čumák
  p.rect(7, 10, 1, 1, 'ink');
  p.rect(10, 10, 1, 1, 'ink');
  p.set(6, 5, 'scarlet');
  p.set(12, 5, 'scarlet');
  p.set(5, 11, 'bone'); // kly
  p.set(4, 10, 'bone');
  p.set(13, 11, 'bone');
  p.set(14, 10, 'bone');
  p.rect(3, 2, 2, 3, 'dusk'); // uši
  p.rect(13, 2, 2, 3, 'dusk');
  p.set(9, 3, 'slate');
  return p.outline('ink');
}

function flag(): PixelCanvas {
  const p = new PixelCanvas(16, 14);
  p.vline(1, 0, 13, 'ochre');
  p.rect(2, 1, 13, 4, 'white');
  p.rect(2, 5, 13, 4, 'red');
  for (let i = 0; i < 4; i++) p.vline(2 + i, 1 + i, 8 - i, 'blue');
  p.set(10, 3, 'gold');
  p.set(11, 3, 'gold');
  p.set(14, 8, 'blood');
  return p.outline('ink');
}

function stuffedRat(): PixelCanvas {
  const p = new PixelCanvas(18, 12);
  p.rect(1, 9, 16, 2, 'rust'); // podstavec
  p.hline(1, 16, 9, 'copper');
  p.ellipse(9, 6, 5, 3, 'slate');
  p.ellipse(14, 5, 2.5, 2, 'slate');
  p.set(15, 4, 'scarlet');
  p.set(16, 6, 'skin');
  p.set(13, 3, 'mauve');
  p.hline(1, 4, 6, 'skin'); // ocas
  p.set(0, 5, 'skin');
  p.set(7, 8, 'dusk');
  p.set(11, 8, 'dusk');
  return p.outline('ink');
}

function portrait(): PixelCanvas {
  const p = new PixelCanvas(14, 17);
  p.rect(0, 0, 14, 17, 'gold');
  p.rect(1, 1, 12, 15, 'amber');
  p.rect(2, 2, 10, 13, 'pine');
  p.ellipse(7, 7, 3, 3.5, 'skin'); // Vacek
  p.hline(5, 9, 4, 'dusk');
  p.set(6, 7, 'ink');
  p.set(8, 7, 'ink');
  p.hline(5, 9, 9, 'dusk'); // knír
  p.rect(3, 11, 8, 4, 'white'); // zástěra
  p.vline(7, 11, 14, 'fog');
  return p;
}

function landscape(): PixelCanvas {
  const p = new PixelCanvas(20, 13);
  p.rect(0, 0, 20, 13, 'rust');
  p.rect(1, 1, 18, 11, 'sky');
  p.rect(1, 6, 18, 6, 'green');
  p.ellipse(13, 8, 5, 2, 'blue'); // rybník
  p.rect(4, 5, 4, 4, 'copper'); // sud
  p.hline(4, 7, 6, 'ochre');
  p.hline(4, 7, 8, 'ochre');
  p.set(16, 2, 'sand');
  p.set(17, 2, 'sand');
  p.set(16, 3, 'gold');
  p.hline(1, 18, 11, 'pine');
  return p;
}

function coasters(): PixelCanvas {
  const p = new PixelCanvas(16, 14);
  p.rect(0, 0, 16, 14, 'rust');
  p.rect(1, 1, 14, 12, 'dusk');
  const cols: PalKey[] = ['red', 'bone', 'gold', 'green', 'sky', 'bone', 'scarlet', 'sand', 'ice'];
  cols.forEach((c, i) => {
    const x = 2 + (i % 3) * 4.5;
    const y = 2 + Math.floor(i / 3) * 3.7;
    p.ellipse(x + 1.5, y + 1.5, 1.6, 1.6, c);
  });
  return p;
}

function sabre(): PixelCanvas {
  const p = new PixelCanvas(20, 8);
  for (let i = 0; i < 14; i++) p.set(5 + i, 3 + Math.floor((i * i) / 90), 'fog');
  for (let i = 0; i < 13; i++) p.set(5 + i, 2 + Math.floor((i * i) / 90), 'white');
  p.rect(1, 2, 4, 3, 'gold'); // jílec
  p.vline(4, 0, 6, 'amber');
  p.set(0, 3, 'ochre');
  return p.outline('ink');
}

function cuckoo(): PixelCanvas {
  const p = new PixelCanvas(14, 20);
  // stříška
  for (let i = 0; i < 7; i++) p.hline(6 - i, 7 + i, i, 'copper');
  p.hline(0, 13, 6, 'rust');
  p.rect(2, 7, 10, 8, 'ochre');
  p.rect(5, 7, 4, 3, 'ink'); // dvířka
  p.set(7, 8, 'gold');
  p.ellipse(7, 12, 2.5, 2.5, 'bone'); // ciferník
  p.set(7, 12, 'ink');
  p.set(7, 11, 'ink');
  p.vline(4, 15, 18, 'slate'); // závaží
  p.vline(10, 15, 17, 'slate');
  p.rect(3, 19, 3, 1, 'gold');
  p.rect(9, 18, 3, 2, 'gold');
  return p.outline('ink');
}

// ------------------------------------------------------------------ speciality (do bubliny, 9–12 px)
function glass(liquid: PalKey, rim: PalKey, extra?: (p: PixelCanvas) => void): PixelCanvas {
  const p = new PixelCanvas(9, 11);
  p.rect(1, 1, 7, 9, 'ice');
  p.rect(2, 3, 5, 6, liquid);
  p.hline(2, 6, 3, rim);
  p.vline(2, 4, 8, 'white');
  extra?.(p);
  return p.outline('ink');
}

/** Zlatá jiskra v rohu = specialita (ať se nepletou s obyčejným zbožím). */
function sparkle(p: PixelCanvas, x: number, y: number) {
  p.set(x, y - 1, 'gold');
  p.set(x - 1, y, 'gold');
  p.set(x, y, 'white');
  p.set(x + 1, y, 'gold');
  p.set(x, y + 1, 'gold');
  return p;
}

/** Ledový tuzemák: lahev ve tvaru lebky, ledově modrá. */
function iceRum(): PixelCanvas {
  const p = new PixelCanvas(13, 14);
  p.rect(5, 0, 3, 2, 'rust'); // zátka
  p.rect(5, 2, 3, 2, 'ice'); // hrdlo
  p.ellipse(6, 8, 4.6, 4, 'ice');
  p.rect(4, 11, 5, 2, 'ice'); // čelist
  p.rect(3, 9, 7, 2, 'sky');
  p.rect(3, 6, 2, 2, 'navy'); // oči
  p.rect(8, 6, 2, 2, 'navy');
  p.set(6, 9, 'navy'); // nos
  p.set(5, 12, 'navy'); // zuby
  p.set(7, 12, 'navy');
  p.set(3, 5, 'white');
  p.outline('ink');
  return sparkle(p, 11, 1);
}

/** Utopenec s tajnou přísadou: baňatá fialová láhev se zátkou (ne sklenice jako obyčejný utopenec). */
function secretPickle(): PixelCanvas {
  const p = new PixelCanvas(13, 14);
  p.rect(5, 0, 3, 2, 'tan'); // zátka
  p.rect(5, 2, 3, 2, 'bone'); // hrdlo
  p.ellipse(6, 9, 5, 4.4, 'plum');
  p.ellipse(6, 9.5, 3.6, 3, 'maroon');
  p.ellipse(6, 10, 2.6, 1.4, 'green'); // utopenec
  p.set(5, 9, 'mint');
  p.set(8, 7, 'mint'); // bublinky
  p.set(4, 7, 'sand');
  p.vline(2, 7, 10, 'mauve'); // odlesk skla
  p.outline('ink');
  return sparkle(p, 11, 1);
}

function cataCheese(): PixelCanvas {
  const p = new PixelCanvas(12, 9);
  p.ellipse(6, 5, 5, 3, 'bone');
  p.ellipse(6, 4, 4, 2, 'white');
  p.set(4, 4, 'mint');
  p.set(7, 3, 'mint');
  p.set(8, 5, 'sage');
  p.set(3, 6, 'mint');
  p.outline('ink');
  return sparkle(p, 10, 1);
}

function underSausage(): PixelCanvas {
  const p = new PixelCanvas(13, 10);
  p.ellipse(6.5, 5, 5.5, 3, 'blood');
  p.hline(3, 9, 4, 'red');
  p.set(4, 6, 'maroon');
  p.set(8, 6, 'maroon');
  p.set(6, 5, 'gold');
  p.set(1, 4, 'bone');
  p.set(12, 6, 'bone');
  p.set(6, 1, 'amber'); // pára
  p.set(7, 0, 'sand');
  p.outline('ink');
  return sparkle(p, 11, 1);
}

// ------------------------------------------------------------------ suroviny
function iceShard(): PixelCanvas {
  const p = new PixelCanvas(9, 11);
  for (let y = 0; y < 10; y++) {
    const w = y < 5 ? y : 9 - y;
    p.hline(4 - Math.floor(w / 2), 4 + Math.floor(w / 2), y, 'ice');
  }
  p.vline(4, 1, 8, 'white');
  p.set(3, 6, 'sky');
  return p.outline('navy');
}

function mushrooms(): PixelCanvas {
  const p = new PixelCanvas(11, 10);
  p.ellipse(3.5, 3, 3, 2, 'rust');
  p.rect(3, 4, 2, 4, 'bone');
  p.ellipse(7.5, 4, 2.5, 1.7, 'copper');
  p.rect(7, 5, 2, 3, 'bone');
  p.set(2, 2, 'sand');
  p.set(5, 2, 'sand');
  p.hline(1, 9, 8, 'pine');
  return p.outline('ink');
}

function mold(): PixelCanvas {
  const p = new PixelCanvas(10, 10);
  p.ellipse(5, 5, 4, 4, 'pine');
  p.ellipse(5, 5, 3, 3, 'sage');
  for (const [x, y] of [[3, 3], [6, 4], [4, 6], [7, 6], [5, 2]]) p.set(x, y, 'mint');
  return p.outline('ink');
}

function spice(): PixelCanvas {
  const p = new PixelCanvas(10, 11);
  p.rect(2, 3, 6, 7, 'tan');
  p.hline(2, 7, 3, 'sand');
  p.rect(3, 1, 4, 2, 'rust');
  p.set(4, 0, 'copper');
  p.rect(3, 5, 4, 3, 'red');
  p.set(4, 6, 'gold');
  return p.outline('ink');
}

// ------------------------------------------------------------------ věci pro muže v kabátě
function crown(): PixelCanvas {
  const p = new PixelCanvas(11, 8);
  p.rect(1, 4, 9, 3, 'gold');
  for (const x of [1, 5, 9]) p.vline(x, 1, 4, 'gold');
  p.set(3, 3, 'gold');
  p.set(7, 3, 'gold');
  p.set(5, 5, 'scarlet');
  p.set(2, 5, 'sky');
  p.set(8, 5, 'sky');
  p.hline(1, 9, 6, 'amber');
  return p.outline('ink');
}

function iceEye(): PixelCanvas {
  const p = new PixelCanvas(10, 10);
  p.ellipse(5, 5, 4, 4, 'ice');
  p.ellipse(5, 5, 2.3, 2.3, 'sky');
  p.ellipse(5, 5, 1.1, 1.1, 'ink');
  p.set(3, 3, 'white');
  return p.outline('navy');
}

function oldBottle(): PixelCanvas {
  const p = new PixelCanvas(8, 13);
  p.rect(3, 0, 2, 1, 'rust');
  p.rect(3, 1, 2, 3, 'pine');
  p.rect(1, 4, 6, 8, 'pine');
  p.vline(2, 5, 10, 'sage');
  p.rect(2, 7, 4, 2, 'bone'); // vzkaz uvnitř
  return p.outline('ink');
}

function oldKey(): PixelCanvas {
  const p = new PixelCanvas(13, 7);
  p.ellipse(2.5, 3.5, 2.5, 2.5, 'gold');
  p.set(2, 3, null);
  p.set(3, 3, null);
  p.hline(5, 12, 3, 'gold');
  p.hline(5, 12, 4, 'amber');
  p.vline(10, 4, 6, 'gold');
  p.vline(12, 4, 6, 'gold');
  return p.outline('ink');
}

// ------------------------------------------------------------------ zkratka a výtah
function lever(on: boolean): PixelCanvas {
  const p = new PixelCanvas(12, 16);
  p.rect(2, 9, 8, 6, 'slate');
  p.hline(2, 9, 9, 'fog');
  p.rect(4, 11, 4, 2, 'ink');
  // páka
  if (on) for (let i = 0; i < 7; i++) p.set(6 + Math.floor(i / 2), 10 - i, 'rust');
  else for (let i = 0; i < 7; i++) p.set(6 - Math.floor(i / 2), 10 - i, 'rust');
  const kx = on ? 9 : 3;
  p.rect(kx - 1, 2, 3, 3, on ? 'mint' : 'scarlet');
  return p.outline('ink');
}

function liftWall(): PixelCanvas {
  // klec výtahu v líci zdi (16×28)
  const p = new PixelCanvas(16, 28);
  p.rect(0, 0, 16, 28, 'coal');
  p.rect(1, 1, 14, 26, 'ink');
  for (let x = 2; x < 15; x += 3) p.vline(x, 2, 25, 'slate');
  p.hline(1, 14, 1, 'fog');
  p.hline(1, 14, 26, 'fog');
  p.rect(6, 0, 4, 1, 'gold'); // kladka
  return p;
}

function liftIcon(): PixelCanvas {
  const p = new PixelCanvas(12, 14);
  p.rect(0, 0, 12, 14, 'slate');
  p.rect(1, 1, 10, 12, 'ink');
  p.rect(3, 5, 6, 7, 'copper');
  p.hline(3, 8, 7, 'ochre');
  p.hline(3, 8, 10, 'ochre');
  p.vline(6, 1, 4, 'fog');
  return p;
}

/** prokletý žabí idol na pult (z Leonarda, art/leonardo/idol_snimky.py): 0 oči tlumené, 1 svítí */
function idol(f: number): PixelCanvas {
  const rows = IDOL_FRAMES[f];
  const p = new PixelCanvas(rows[0].length, rows.length);
  rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, IDOL_KEYS[c])));
  return p;
}

/** Trofeje do vitríny (8×7): zlatý podnos, zub aligátora, zlatá vařečka, terč z posvícení, Sudokongova kravata, vodníkův hrneček. */
function trophyIcon(k: TrophyKey): PixelCanvas {
  const p = new PixelCanvas(8, 7);
  switch (k) {
    case 'tray':
      p.ellipse(3.5, 3.5, 3.6, 3, 'amber');
      p.ellipse(3.5, 3.5, 2.4, 2, 'gold');
      p.set(3, 3, 'green');
      p.set(4, 3, 'green');
      p.set(1, 2, 'white');
      break;
    case 'tooth':
      p.rect(2, 0, 4, 2, 'bone');
      p.rect(2, 2, 3, 2, 'bone');
      p.rect(3, 4, 2, 2, 'bone');
      p.set(3, 6, 'bone');
      p.vline(5, 2, 3, 'fog');
      p.set(2, 0, 'white');
      break;
    case 'spoon':
      p.ellipse(2, 2, 2, 2, 'gold');
      p.set(1, 1, 'white');
      for (let i = 0; i < 4; i++) p.set(3 + i, 3 + Math.floor(i * 0.8), 'amber');
      break;
    case 'target':
      p.ellipse(3.5, 3.5, 3.5, 3.4, 'white');
      p.ellipse(3.5, 3.5, 2.5, 2.4, 'scarlet');
      p.ellipse(3.5, 3.5, 1.4, 1.3, 'white');
      p.set(3, 3, 'scarlet');
      p.set(4, 3, 'scarlet');
      break;
    case 'tie':
      p.rect(3, 0, 2, 1, 'red');
      p.rect(3, 1, 2, 4, 'scarlet');
      p.rect(2, 4, 4, 2, 'scarlet');
      p.set(3, 6, 'red');
      p.set(4, 6, 'red');
      p.set(4, 2, 'gold');
      break;
    case 'mug':
      p.rect(1, 2, 4, 5, 'bone');
      p.vline(5, 3, 5, 'fog');
      p.set(6, 4, 'fog');
      p.set(2, 3, 'red');
      p.set(4, 5, 'red');
      // dušička nad hrnečkem
      p.set(3, 1, 'ice');
      p.set(2, 0, 'ice');
      p.set(4, 0, 'white');
      break;
  }
  return p.outline('ink');
}

const TROPHY_KEYS: TrophyKey[] = ['tray', 'tooth', 'spoon', 'target', 'tie', 'mug'];
/** středy přihrádek ve vitríně (34×18): dvě police po třech */
export const TROPHY_SLOTS: [number, number][] = [[7, 5], [17, 5], [27, 5], [7, 12], [17, 12], [27, 12]];

/** Vitrína s trofejemi (34×18): tmavé dřevo, dvě police po třech přihrádkách, sklo s odlesky, mosazná cedulka. */
function trophyCase(): PixelCanvas {
  const p = new PixelCanvas(34, 18);
  p.rect(0, 0, 34, 18, 'olive');
  p.rect(1, 1, 32, 15, 'navy');
  // police
  p.hline(1, 32, 8, 'rust');
  p.hline(1, 32, 15, 'rust');
  // sklo: odlesky
  p.set(2, 2, 'ice');
  p.set(3, 2, 'ice');
  p.set(2, 3, 'ice');
  p.set(2, 10, 'ice');
  p.set(30, 6, 'sky');
  // spodní lišta s cedulkou
  p.hline(0, 33, 16, 'olive');
  p.hline(13, 20, 17, 'gold');
  return p.outline('ink');
}

/** Kostěná šipka Kostlivce průvodce (ukazuje ke schodům dolů) a kostěný zámek truhly. */
function guideHand(): PixelCanvas {
  return new PixelCanvas(12, 7).template(['.......b..', 'bb.....bb.', 'bbbbbbbbbb', 'bb.....bb.', '.......b..'], 1, 1).outline('ink');
}
function lockBone(): PixelCanvas {
  return new PixelCanvas(7, 8).template(['.bbb.', 'b...b', 'bbbbb', 'bbkbb', 'bbkbb', 'bbbbb'], 1, 1).outline('ink');
}

// relikvie od muže v kabátě (ikony pro oslavu zisku)
function relicBell(): PixelCanvas {
  const p = new PixelCanvas(12, 13);
  p.rect(4, 0, 3, 2, 'copper');
  p.ellipse(5, 5, 3, 3, 'gold');
  p.rect(2, 5, 7, 4, 'gold');
  p.hline(1, 9, 9, 'amber');
  p.vline(3, 3, 8, 'white');
  p.set(5, 11, 'copper');
  p.set(10, 4, 'white');
  p.set(11, 6, 'white');
  return p.outline('ink');
}
function relicPipe(): PixelCanvas {
  const p = new PixelCanvas(12, 14);
  p.rect(1, 2, 6, 3, 'ice');
  p.hline(1, 6, 2, 'white');
  p.rect(5, 0, 2, 2, 'sky');
  p.rect(5, 5, 2, 4, 'ice');
  p.vline(5, 5, 8, 'white');
  p.set(5, 10, 'sky');
  p.set(5, 12, 'sky');
  p.rect(8, 1, 3, 9, 'slate');
  p.vline(8, 1, 9, 'fog');
  p.set(10, 2, 'white');
  return p.outline('ink');
}
function relicKeg(): PixelCanvas {
  const p = new PixelCanvas(12, 14);
  p.rect(1, 1, 9, 11, 'rust');
  p.vline(1, 2, 10, 'copper');
  p.hline(1, 9, 3, 'slate');
  p.hline(1, 9, 9, 'slate');
  p.set(5, 6, 'ink');
  p.set(6, 6, 'ink');
  p.set(5, 7, 'amber');
  p.vline(5, 8, 12, 'amber');
  p.set(4, 12, 'gold');
  p.set(6, 13, 'gold');
  return p.outline('ink');
}
function relicCoat(): PixelCanvas {
  const p = new PixelCanvas(13, 14);
  p.rect(2, 2, 9, 11, 'olive');
  p.rect(3, 0, 7, 2, 'sage');
  p.vline(6, 2, 12, 'pine');
  for (const [x, y] of [[3, 5], [8, 5], [3, 9], [8, 9]] as const) {
    p.rect(x, y, 2, 2, 'pine');
    p.set(x, y, 'sand');
  }
  p.set(1, 4, 'olive');
  p.set(11, 4, 'olive');
  return p.outline('ink');
}

export function buildDecorArt(): Record<string, PixelCanvas> {
  return {
    dCase: trophyCase(),
    ...Object.fromEntries(TROPHY_KEYS.map((k) => [`tr_${k}`, trophyIcon(k)])),
    dBoar: boar(), dFlag: flag(), dRat: stuffedRat(), dPortrait: portrait(), dLandscape: landscape(),
    dCoasters: coasters(), dSabre: sabre(), dCuckoo: cuckoo(), dIdol0: idol(0), dIdol1: idol(1),
    gIceRum: iceRum(), gSecretPickle: secretPickle(), gCataCheese: cataCheese(), gUnderSausage: underSausage(),
    iIce: iceShard(), iMush: mushrooms(), iMold: mold(), iSpice: spice(),
    cCrown: crown(), cIceEye: iceEye(), cBottle: oldBottle(), cKey: oldKey(),
    relic_doorBell: relicBell(), relic_icePipe: relicPipe(), relic_bottomlessKeg: relicKeg(), relic_coatOfMany: relicCoat(),
    guideHand: guideHand(), lockBone: lockBone(),
    leverOff: lever(false), leverOn: lever(true), liftWall: liftWall(), liftIcon: liftIcon(),
  };
}
