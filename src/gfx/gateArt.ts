import { PixelCanvas, hash } from './pixel';
import type { PalKey } from '../data/palette';
import { CTHULHU_FRAMES, CTHULHU_H, CTHULHU_KEYS, CTHULHU_W } from './cthulhuSprite';
import { GATE_SPRITE, GATE_SPRITE_H, GATE_SPRITE_KEYS, GATE_SPRITE_W } from './gateSprite';
import { KRIGL_DEFS } from '../data/krigls';

// Utopená brána (endgame) a oltáře na vzácné krígly. Každý postavený krígl rozsvítí jednu runu
// na kamenném prstenci; když svítí všechny, kulaté dveře se otevřou. Hlava Cthulhu a krígly se
// kreslí stínovaně (světlo zleva shora) s ditheringem mezi odstíny.

export const KRIGLS = KRIGL_DEFS.length;
export const GATE_W = GATE_SPRITE_W;
export const GATE_H = GATE_SPRITE_H;
/** Geometrie brány ve spritu: střed prstence, dveře, dráha run, oči znaku. */
const GATE_RING = { cx: 65.5, cy: 57, doorCy: 60, doorRx: 48, doorRy: 46, runeRx: 57.5, runeRy: 50, eyeL: 61, eyeR: 68, eyeY: 63 };

/** Rampa patiny (bronz porostlý měděnkou), od nejtmavší. */
const PATINA: PalKey[] = ['ink', 'pine', 'sage', 'green', 'mint'];

const BAYER = [0, 0.5, 0.75, 0.25];
/** Odstín z rampy podle hodnoty 0–1, s ditheringem 2×2 mezi sousedními odstíny. */
function shade(ramp: PalKey[], v: number, x: number, y: number, dither = true): PalKey {
  const f = Math.max(0, Math.min(0.999, v)) * (ramp.length - 1);
  const i = Math.floor(f);
  const t = f - i;
  // dithering jen v úzkém přechodu mezi odstíny (velké plochy zůstanou čisté)
  const b = 0.3 + BAYER[(Math.floor(y) % 2) * 2 + (Math.floor(x) % 2)] * 0.4;
  return ramp[Math.min(ramp.length - 1, t > (dither ? b : 0.5) ? i + 1 : i)];
}

const LX = -0.55;
const LY = -0.75;
const LZ = 0.37;

/** Osvětlení koule / válce: normála (nx, ny), vrací 0–1. */
function lit(nx: number, ny: number) {
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return Math.max(0, nx * LX + ny * LY + nz * LZ);
}

// ================================================================ hlava Cthulhu (ruční pixel art)
// Plášť převislý dozadu doprava, vrásky, zamračené nadočnicové valy, šikmé hluboké důlky, svislé
// zornice, nosní hřeben a kořeny chapadel. Znaky: k obrys, 1–5 odstíny (od stínu ke světlu),
// p hluboký stín, n dno důlku, i/s/w oko. Barvy se dosadí podle místa (reliéf brány / živý Cthulhu).
const HEAD_AWAKE = [
  '.............kk4443321kk........',
  '............k44554333221kk......',
  '...........k44544433332211k.....',
  '..........k4454443333322211kk...',
  '.........k44444443333332221kkk..',
  '........k4444444343333222211k...',
  '........k45333313331113222111k..',
  '.......k444444433333331111111k..',
  '.......k44335443333332222111k...',
  '......k433444233222232222111k...',
  '......k44444443333331111111k....',
  '.....k444444433333332221111k....',
  '.....k43333333222222211111k.....',
  '.....k44443333333222211111k.....',
  '....k5554433333332222111333k....',
  '...k4kkk5443333322222223kkk1k...',
  '...k4444kkk4443322222kkk1111k...',
  '...k4444kkkkkk3322kkkkkk1111k...',
  '....k44kwikin333222nikiwk11k....',
  '....k444kkkisn3322nsikkk111k....',
  '.....k44433kkk3322kkk11111k.....',
  '....kk443k443k44k4433k4432kk....',
  '....kk433k443k44k4433k4435kk....',
  '....kk432k443k443k4332k433kk....',
  '...kk4432k443k443k4432k4432kk...',
  '...kk4435k443k443k4435k4435kk...',
  '...kk433kk443k443k4432kk433kk...',
  '...kk432kk433k443k4432kk443kk...',
  '..kk445kkk435k4435k435kkk435kk..',
  '..kk433kkk433k4432k433kkk432kk..',
  '..kk432kkk432kk43kk433kkk443kk..',
  '..kk45kkkk435kk45kk445kkkk45kk..'
];
const HEAD_ASLEEP = [
  '.............kk4443321kk........',
  '............k44554333221kk......',
  '...........k44544433332211k.....',
  '..........k4454443333322211kk...',
  '.........k44444443333332221kkk..',
  '........k4444444343333222211k...',
  '........k45333313331113222111k..',
  '.......k444444433333331111111k..',
  '.......k44335443333332222111k...',
  '......k433444233222232222111k...',
  '......k44444443333331111111k....',
  '.....k444444433333332221111k....',
  '.....k43333333222222211111k.....',
  '.....k44443333333222211111k.....',
  '....k5554433333332222111333k....',
  '...k4kkk5443333322222223kkk1k...',
  '...k4444kkk4443322222kkk1111k...',
  '...k4444kkkkkk3322kkkkkk1111k...',
  '....k44kppppn333222nppppk11k....',
  '....k444kknppn3322nppnkk111k....',
  '.....k44433kkk3322kkk11111k.....',
  '....kk443k443k44k4433k4432kk....',
  '....kk433k443k44k4433k4435kk....',
  '....kk432k443k443k4332k433kk....',
  '...kk4432k443k443k4432k4432kk...',
  '...kk4435k443k443k4435k4435kk...',
  '...kk433kk443k443k4432kk433kk...',
  '...kk432kk433k443k4432kk443kk...',
  '..kk445kkk435k4435k435kkk435kk..',
  '..kk433kkk433k4432k433kkk432kk..',
  '..kk432kkk432kk43kk433kkk443kk..',
  '..kk45kkkk435kk45kk445kkkk45kk..'
];

/** Vykreslí ruční hlavu (32×32) tak, že oči jsou na řádku ey a střed na cx. */
function headTemplate(p: PixelCanvas, cx: number, ey: number, awake: boolean, ramp: PalKey[]) {
  const map: Record<string, PalKey> = { k: 'ink', '1': ramp[0], '2': ramp[1], '3': ramp[2], '4': ramp[3], '5': ramp[4], p: 'pine', n: 'coal', i: 'ice', s: 'sky', w: 'white' };
  p.template(awake ? HEAD_AWAKE : HEAD_ASLEEP, Math.round(cx - 16), Math.round(ey - 18), map);
}

/** Runa (5×5) podle čísla – každá jiná. */
function rune(p: PixelCanvas, x: number, y: number, n: number, on: boolean) {
  const shapes = [
    ['.#.', '###', '.#.'], ['#.#', '.#.', '#.#'], ['##.', '.#.', '.##'], ['#..', '###', '..#'], ['.#.', '#.#', '.#.'],
    ['###', '..#', '.#.'], ['#.#', '###', '#.#'], ['.##', '#..', '.##'], ['#..', '#.#', '###'], ['###', '#.#', '#..'], ['.#.', '.#.', '###'], ['#.#', '#.#', '.#.'], ['##.', '#.#', '.##'],
  ];
  const s = shapes[n % shapes.length];
  for (let j = -1; j <= 3; j++) for (let i = -1; i <= 3; i++) if (on ? (i + j) % 2 === 0 : true) p.set(x + i, y + j, on ? 'sky' : 'slate');
  s.forEach((row, j) => [...row].forEach((c, i) => c === '#' && p.set(x + i, y + j, on ? (j === 1 ? 'white' : 'ice') : 'ink')));
}

/** Brána: kulaté zavřené dveře v kamenném prstenci, zamčené zaklesnutými chapadly (gateSprite.ts).
 *  lit = kolik kříglů už stojí na oltářích (0–KRIGLS); s každým se rozsvítí jedna runa na prstenci.
 *  Když svítí všechny, chapadla se rozpletou, dveře se odvalí a za nimi zeje tma. */
export function gate(lit_: number): PixelCanvas {
  const p = new PixelCanvas(GATE_W, GATE_H);
  GATE_SPRITE.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, GATE_SPRITE_KEYS[c])));
  const open = lit_ >= KRIGLS;
  const { cx, cy } = GATE_RING;
  if (open) {
    // otevřeno: místo dveří tma, v ní slabé odlesky vody
    for (let y = 0; y < GATE_H; y++)
      for (let x = 0; x < GATE_W; x++) {
        const e = ((x + 0.5 - cx) / GATE_RING.doorRx) ** 2 + ((y + 0.5 - GATE_RING.doorCy) / GATE_RING.doorRy) ** 2;
        if (e > 1) continue;
        let c: PalKey = e > 0.88 ? 'navy' : 'ink';
        // dole za prahem se leskne voda
        if (y > GATE_RING.doorCy + GATE_RING.doorRy * 0.55 && e < 0.88 && (y % 3 === 0 ? hash(x >> 2, y, 67) < 0.5 : false)) c = (x + y) % 2 ? 'navy' : 'indigo';
        p.set(x, y, c);
      }
  } else {
    // oči znaku s hlavou Cthulhu uprostřed dveří
    const glow = lit_ >= KRIGLS - 1;
    for (const ex of [GATE_RING.eyeL, GATE_RING.eyeR]) {
      p.set(ex, GATE_RING.eyeY, glow ? 'ice' : 'ink');
      p.set(ex + 1, GATE_RING.eyeY, glow ? 'white' : 'ink');
    }
  }
  // runy po obvodu prstence (od levé dolní přes vršek k pravé dolní)
  for (let i = 0; i < KRIGLS; i++) {
    const a = Math.PI * (0.8 + (i / (KRIGLS - 1)) * 1.4);
    rune(p, cx + Math.cos(a) * GATE_RING.runeRx - 1, cy + Math.sin(a) * GATE_RING.runeRy - 1, i, i < lit_);
  }
  return p;
}

/** Barvy kříglů (každý je jiný). */
export const KRIGL_COLORS: [PalKey, PalKey][] = [
  ['gold', 'amber'], ['fog', 'slate'], ['scarlet', 'blood'], ['sand', 'copper'], ['mint', 'green'],
  ['plum', 'maroon'], ['ochre', 'rust'], ['ice', 'blue'], ['bone', 'tan'], ['sky', 'indigo'], ['red', 'maroon'], ['amber', 'olive'], ['sage', 'pine'],
];

/** Vzácný krígl (12×14): cínové víčko, ucho, ozdobný pás s kamínkem. */
export function krigl(i: number): PixelCanvas {
  const [a, b] = KRIGL_COLORS[i % KRIGL_COLORS.length];
  const p = new PixelCanvas(12, 14);
  p.rect(1, 3, 7, 10, a);
  p.vline(6, 3, 12, b);
  p.vline(7, 3, 12, b);
  p.hline(1, 7, 12, b);
  p.rect(1, 6, 7, 2, 'gold');
  p.set(4, 6, 'white');
  p.set(4, 7, 'scarlet');
  p.rect(0, 1, 9, 2, 'fog');
  p.hline(0, 8, 1, 'bone');
  p.set(9, 1, 'fog');
  p.vline(9, 4, 10, a);
  p.vline(10, 5, 9, b);
  p.vline(2, 4, 5, 'white');
  p.set(2, 9, 'white');
  return p.outline('ink');
}

/** Oltář pod krígl (20×34): sloup z patinovaného kamene, korály, mušle, voda u paty. */
export function altar(filled: number | null, runeIdx = filled ?? 0): PixelCanvas {
  const W = 20;
  const p = new PixelCanvas(W, 34);
  const cx = 10;
  // sloup (válec, světlo zleva)
  for (let y = 18; y < 30; y++)
    for (let x = cx - 4; x <= cx + 3; x++) {
      const nx = (x + 0.5 - cx) / 4.5;
      let v = lit(nx, 0) * 0.85 + 0.1;
      if ((x - cx + 4) % 3 === 2) v -= 0.15; // kanelury
      p.set(x, y, shade(PATINA, v, x, y));
    }
  // hlavice a deska
  for (let x = 1; x < W - 1; x++) {
    p.set(x, 14, x < 8 ? 'mint' : 'green');
    p.set(x, 15, shade(PATINA, 0.55 - x * 0.015, x, 15));
    p.set(x, 16, 'sage');
    p.set(x, 17, 'pine');
  }
  // patka
  for (let x = 3; x < W - 3; x++) {
    p.set(x, 30, 'sage');
    p.set(x, 31, 'pine');
  }
  // runa na sloupu
  rune(p, cx - 2, 21, runeIdx, filled !== null);
  // korál vlevo, mušle vpravo
  for (const [x, y] of [[3, 29], [2, 27], [3, 25], [1, 25], [4, 27], [2, 23]]) p.set(x, y, y < 25 ? 'scarlet' : 'red');
  p.set(1, 24, 'scarlet');
  p.ellipse(16, 29, 2, 1.6, 'skin');
  p.set(15, 29, 'mauve');
  p.set(17, 29, 'mauve');
  // voda
  for (let x = 0; x < W; x++) {
    p.set(x, 32, (x % 4 === 1 ? 'blue' : 'indigo'));
    if (x % 3) p.set(x, 33, 'navy');
  }
  if (filled !== null) {
    p.blit(krigl(filled), 4, 0);
    for (let x = 4; x < 16; x += 2) p.set(x, 13, 'sky'); // záře pod kříglem
  } else {
    p.hline(7, 12, 13, 'pine');
    p.set(6, 12, 'pine');
    p.set(13, 12, 'pine');
  }
  return p.outline('ink');
}

// ================================================================ rekvizity kolem brány
const STONE: PalKey[] = ['ink', 'grave', 'sage', 'fog', 'bone'];

/** Ulomený kvádr z kruhu brány (patina, ostré hrany, světlo zleva shora). */
function rubble(w: number, h: number, seed: number, patina = true): PixelCanvas {
  const p = new PixelCanvas(w, h);
  const ramp = patina ? PATINA : STONE;
  // nepravidelný mnohoúhelník: horní hrana zubatá, spodek rovný
  for (let x = 0; x < w; x++) {
    const top = Math.floor(h * 0.25 + hash(x >> 1, 0, seed) * h * 0.3 + Math.abs(x - w / 2) * 0.25);
    for (let y = top; y < h; y++) {
      const u = (x + 0.5) / w;
      const face = y > h * 0.62; // přední stěna
      let v = face ? 0.38 - u * 0.14 : 0.86 - u * 0.3 - (y - top) * 0.02;
      if (y === top) v += 0.12;
      if (hash(x, y, seed + 1) < 0.08) v -= 0.18;
      // holý kámen se skvrnami patiny nahoře (kus kruhu brány)
      const moss = !face && patina && hash(x >> 1, y >> 1, seed + 2) < 0.45;
      p.set(x, y, moss ? shade(ramp, v, x, y) : shade(STONE, v, x, y));
    }
  }
  // praskliny a spára
  for (let i = 0; i < 3; i++) {
    let x = Math.floor(w * (0.25 + hash(i, 2, seed) * 0.5));
    for (let y = Math.floor(h * 0.45); y < h - 1; y++) {
      if (p.get(x, y)) p.set(x, y, 'ink');
      if (hash(x, y, seed + 3) < 0.4) x += hash(y, x, seed) < 0.5 ? -1 : 1;
    }
  }
  return p.outline('ink');
}

/** Spadlý sloup (vodorovně, kanelury, ulomený konec, chaluhy). */
function fallenPillar(): PixelCanvas {
  const W = 52;
  const H = 18;
  const p = new PixelCanvas(W, H);
  for (let x = 4; x < W - 2; x++) {
    const broken = x > W - 10 ? Math.floor(hash(x, 1, 70) * 4) : 0;
    for (let y = 3 + broken; y < 15; y++) {
      const ny = (y + 0.5 - 9) / 6.5;
      let v = lit(0, Math.max(-0.99, Math.min(0.99, ny))) * 0.85 + 0.1;
      if ((y - 3) % 3 === 2) v -= 0.14; // kanelury podél sloupu
      if (hash(x >> 1, y, 71) < 0.07) v -= 0.15;
      p.set(x, y, shade(STONE, v, x, y));
    }
  }
  // patka sloupu vlevo (širší)
  for (let y = 1; y < 17; y++)
    for (let x = 0; x < 6; x++) p.set(x, y, shade(STONE, x < 2 ? 0.7 : 0.45 - (y - 1) * 0.015, x, y));
  // ulomený konec: tmavý lom
  for (let y = 4; y < 15; y++) p.set(W - 3 - Math.floor(hash(y, 3, 72) * 3), y, 'ink');
  // chaluhy a mech přes sloup
  for (let k = 0; k < 4; k++) {
    const x0 = 12 + k * 9 + Math.floor(hash(k, 4, 73) * 4);
    for (let i = 0; i < 6 + k; i++) p.set(x0 + Math.round(Math.sin(i / 1.6 + k) * 1.2), 2 + i, i % 3 ? 'green' : 'mint');
  }
  for (let x = 6; x < W - 10; x++) if (hash(x, 5, 74) < 0.3) p.set(x, 3, 'sage');
  return p.outline('ink');
}

/** Louže (tmavá voda s odleskem). */
function puddle(w: number, h: number, seed: number): PixelCanvas {
  const p = new PixelCanvas(w, h);
  const cx = w / 2;
  const cy = h / 2;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const wob = 1 + (hash(Math.floor(Math.atan2(y - cy, x - cx) * 3), 0, seed) - 0.5) * 0.25;
      const e = ((x + 0.5 - cx) / (w / 2)) ** 2 + ((y + 0.5 - cy) / (h / 2)) ** 2;
      if (e > wob) continue;
      let c: PalKey = e > wob * 0.7 ? 'indigo' : 'navy';
      if (y === Math.floor(cy) - 1 && x > cx - w * 0.3 && x < cx && (x % 2 === 0)) c = 'sky';
      if (y === Math.floor(cy) && x > cx + 1 && x < cx + w * 0.25) c = 'blue';
      p.set(x, y, c);
    }
  return p;
}

/** Chaluha z podlahy (dva snímky na pohupování). */
function weed(frame: number, seed: number): PixelCanvas {
  const p = new PixelCanvas(10, 16);
  for (let k = 0; k < 3; k++) {
    const len = 9 + Math.floor(hash(k, 1, seed) * 6);
    const bx = 2 + k * 3;
    for (let i = 0; i < len; i++) {
      const sway = Math.sin(i / 2.4 + k + frame * 1.4) * (i / len) * 2;
      const c: PalKey = i < 2 ? 'pine' : i % 3 === 0 ? 'mint' : 'green';
      p.set(bx + sway, 15 - i, c);
      if (i % 4 === 2) p.set(bx + sway + (k % 2 ? 1 : -1), 15 - i, 'sage');
    }
  }
  return p.outline('ink');
}

function shell(): PixelCanvas {
  const p = new PixelCanvas(8, 6);
  p.template(['..Sfm...', '.SSfSm..', 'SfSSfSm.', 'SSfSSfm.', '.mmmmm..'], 0, 0, { S: 'skin', f: 'tan', m: 'mauve' });
  return p.outline('ink');
}

function starfish(): PixelCanvas {
  const p = new PixelCanvas(9, 9);
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + (k * Math.PI * 2) / 5;
    for (let i = 0; i < 4; i++) p.set(4 + Math.cos(a) * i, 4 + Math.sin(a) * i, i < 2 ? 'copper' : i < 3 ? 'ochre' : 'sand');
  }
  p.set(4, 4, 'amber');
  return p.outline('ink');
}

/** Kosti a lebka (utopenci, co bránu hledali před tebou). */
function bones(): PixelCanvas {
  const p = new PixelCanvas(20, 9);
  // lebka
  p.template(['.bbbb.', 'bbbbbb', 'bkbbkb', 'bbbbbb', '.bfbf.'], 1, 1, { b: 'bone', k: 'ink', f: 'fog' });
  // dlouhá kost
  p.hline(8, 17, 6, 'bone');
  p.hline(8, 17, 7, 'fog');
  for (const x of [7, 18]) {
    p.set(x, 5, 'bone');
    p.set(x, 6, 'bone');
    p.set(x, 7, 'fog');
    p.set(x, 8, 'fog');
  }
  // žebro
  for (let i = 0; i < 5; i++) p.set(10 + i, 3 + Math.round(Math.abs(i - 2) * 0.5), 'bone');
  return p.outline('ink');
}

/** Kapka ze stropu a kroužky na hladině. */
function drip(): PixelCanvas {
  const p = new PixelCanvas(3, 5);
  p.set(1, 0, 'ice');
  p.vline(1, 1, 3, 'sky');
  p.set(0, 3, 'sky');
  p.set(2, 3, 'sky');
  p.hline(0, 2, 4, 'blue');
  return p;
}

function ripple(): PixelCanvas {
  const p = new PixelCanvas(11, 5);
  for (let x = 0; x < 11; x++)
    for (let y = 0; y < 5; y++) {
      const e = ((x + 0.5 - 5.5) / 5.5) ** 2 + ((y + 0.5 - 2.5) / 2.5) ** 2;
      if (e <= 1 && e > 0.55) p.set(x, y, y < 2 ? 'ice' : 'sky');
    }
  return p;
}

/** Krápník a stékající voda na zdi (dekorace zdi 16×16). */
function wallSeep(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let k = 0; k < 3; k++) {
    const x = 3 + k * 5;
    const len = 6 + Math.floor(hash(k, 1, 75) * 8);
    for (let y = 0; y < len; y++) p.set(x, y, y % 4 === 1 ? 'ice' : 'sky');
    p.set(x + 1, 0, 'pine');
    p.set(x - 1, 1, 'green');
  }
  for (let x = 0; x < 16; x++) if (hash(x, 2, 76) < 0.6) p.set(x, 0, 'green');
  return p;
}

/** Bublina z vody před bránou. */
function bubble(): PixelCanvas {
  const p = new PixelCanvas(4, 4);
  p.template(['.ll.', 'lI.l', 'l..l', '.ll.'], 0, 0, { l: 'sky', I: 'white' });
  return p;
}

/** Mříž do zatopené kobky ve zdi 1. patra (16×16): rezavé pruty, za nimi modrá záře a voda. */
function gateDoor(open: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  // oblouk a otvor
  for (let y = 1; y < 16; y++)
    for (let x = 2; x < 14; x++) {
      const top = y < 6 ? Math.hypot(x + 0.5 - 8, y - 6) > 6 : false;
      if (top) continue;
      p.set(x, y, y > 12 ? ((x + y) % 2 ? 'blue' : 'indigo') : y > 8 ? 'navy' : 'ink');
    }
  for (let i = 0; i < 6; i++) p.set(4 + i * 1.6, 10 + (i % 2), 'sky'); // odlesk vody
  if (!open)
    for (const x of [3, 6, 9, 12]) {
      for (let y = 1; y < 16; y++) if (y >= 6 || Math.hypot(x + 0.5 - 8, y - 6) <= 6) p.set(x, y, y % 4 === 0 ? 'copper' : 'rust');
    }
  // kamenný rám
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      if (p.get(x, y)) continue;
      const d = y < 6 ? Math.hypot(x + 0.5 - 8, y - 6) : Math.min(Math.abs(x - 1.5), Math.abs(x - 13.5)) + 6;
      if (d <= 7.6) p.set(x, y, shade(STONE, 0.55 - y * 0.02, x, y));
    }
  for (let x = 4; x < 12; x++) if (hash(x, 3, 77) < 0.5) p.set(x, 0, 'green');
  p.set(13, 3, 'mint');
  p.set(2, 4, 'green');
  return p;
}

/** Železná pánev na trojnožce s modrozeleným ohněm (dva snímky plápolání). */
function brazier(frame: number): PixelCanvas {
  const p = new PixelCanvas(14, 30);
  // nohy
  for (let y = 16; y < 30; y++) {
    p.set(7, y, 'slate');
    p.set(7 - Math.floor((y - 16) / 3), y, 'dusk');
    p.set(7 + Math.floor((y - 16) / 3), y, 'dusk');
  }
  p.hline(3, 11, 29, 'coal');
  // pánev
  for (let x = 1; x < 13; x++) {
    p.set(x, 13, 'fog');
    p.set(x, 14, x < 5 ? 'slate' : 'dusk');
    if (x > 2 && x < 11) p.set(x, 15, 'coal');
  }
  for (let x = 2; x < 12; x += 3) p.set(x, 14, 'copper'); // nýty
  // plamen
  const flame = [0, 2, 4, 6, 8, 9, 9, 8, 6, 4, 2, 0];
  for (let i = 0; i < 12; i++) {
    const hgt = flame[i] + ((i + frame) % 3 === 0 ? 2 : 0) - (frame && i % 4 === 1 ? 1 : 0);
    for (let j = 0; j < hgt; j++) {
      const x = 1 + i + (j > 5 ? (frame ? 1 : -1) : 0);
      const c: PalKey = j > hgt - 2 ? 'sky' : j > hgt * 0.5 ? 'ice' : 'white';
      p.set(x, 12 - j, i < 3 || i > 8 ? (j > hgt - 3 ? 'mint' : 'sky') : c);
    }
  }
  return p.outline('ink');
}

/** Snímky pro atlas 'obj': oltáře, krígly, suť, sloup, louže, chaluhy, mušle, kosti, kapky. */
export function buildGateProps(): Record<string, PixelCanvas> {
  const o: Record<string, PixelCanvas> = {
    gRubble0: rubble(22, 15, 80),
    gRubble1: rubble(15, 11, 81),
    gRubble2: rubble(28, 17, 82),
    gRubble3: rubble(11, 8, 83, false),
    gRubble4: rubble(18, 12, 84, false),
    gPillar: fallenPillar(),
    gPuddle0: puddle(30, 10, 85),
    gPuddle1: puddle(18, 7, 86),
    gPuddle2: puddle(42, 12, 87),
    gWeed0: weed(0, 88),
    gWeed1: weed(1, 88),
    gWeedB0: weed(0, 89),
    gWeedB1: weed(1, 89),
    gShell: shell(),
    gStar: starfish(),
    gBones: bones(),
    gDrip: drip(),
    gRipple: ripple(),
    gSeep: wallSeep(),
    gBubble: bubble(),
    gBrazier0: brazier(0),
    gBrazier1: brazier(1),
    gateDoor: gateDoor(false),
    gateDoorOpen: gateDoor(true),
  };
  for (let i = 0; i < KRIGLS; i++) {
    o[`altar${i}`] = altar(i);
    o[`altarE${i}`] = altar(null, i);
    o[`krigl${i}`] = krigl(i);
  }
  return o;
}

// ================================================================ Cthulhu (finále a štamgast)
/** Cthulhu z Leonarda (78×64), snímek 0–15: chůze 0–3, čekání 4–7, „TEĎ… JÁ. PIVO.“ 8–9, šťastný 10–13, štamgast 14–15. */
export function cthulhu(frame: number): PixelCanvas {
  const p = new PixelCanvas(CTHULHU_W, CTHULHU_H);
  CTHULHU_FRAMES[frame].forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, CTHULHU_KEYS[c])));
  return p;
}
