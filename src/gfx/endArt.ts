import { PixelCanvas, hash } from './pixel';
import type { PalKey } from '../data/palette';
import { krigl } from './gateArt';
import { drawCharFrame, LOOKS } from './characters';
import { GATOR_FRAMES, GATOR_H, GATOR_KEYS, GATOR_W } from './gatorSprite';

// Grafika ke kříglům 8–11: stoka s aligátorem (hnízdo, kosti, zbytky, smetí), vodník
// (puntíkaté hrnečky s dušičkami, jezírko, police) a mříž do stoky.
// Stínování: světlo zleva shora, dithering jen v úzkých přechodech.

const BAYER = [0, 0.5, 0.75, 0.25];
function shade(ramp: PalKey[], v: number, x: number, y: number, dither = true): PalKey {
  const f = Math.max(0, Math.min(0.999, v)) * (ramp.length - 1);
  const i = Math.floor(f);
  const t = f - i;
  const b = 0.3 + BAYER[(Math.floor(y) % 2) * 2 + (Math.floor(x) % 2)] * 0.4;
  return ramp[Math.min(ramp.length - 1, t > (dither ? b : 0.5) ? i + 1 : i)];
}

// ================================================================ aligátor

/** Jeden kus do tlamy (8×7): knedlík, zlatý knedlík, utopenec. */
function morsel(kind: 'knedlik' | 'gold' | 'utopenec'): PixelCanvas {
  const p = new PixelCanvas(8, 7);
  if (kind === 'utopenec') {
    p.rect(1, 2, 6, 3, 'copper');
    p.hline(2, 5, 2, 'ochre');
    p.set(2, 2, 'sand');
    p.hline(1, 6, 4, 'rust');
    p.set(3, 1, 'mint');
    p.set(5, 5, 'bone');
  } else {
    const [a, b, c] = kind === 'gold' ? (['gold', 'sand', 'ochre'] as PalKey[]) : (['bone', 'white', 'sand'] as PalKey[]);
    p.ellipse(3.5, 3.5, 3, 2.6, a);
    p.set(2, 2, b);
    p.set(3, 2, b);
    p.hline(2, 5, 5, c);
    if (kind === 'gold') p.set(6, 1, 'white');
  }
  return p.outline('ink');
}

/** Hnízdo ze smetí (48×18): klacky, hadry, láhve, ponožka, kosti. withKrigl = uprostřed se leskne krígl. */
export function nest(withKrigl: boolean): PixelCanvas {
  const p = new PixelCanvas(48, 20);
  // kopeček (stín vpravo dole)
  for (let y = 6; y < 20; y++)
    for (let x = 0; x < 48; x++) {
      const dx = (x + 0.5 - 24) / 23.5;
      const dy = (y + 0.5 - 15) / 6;
      if (dx * dx + dy * dy > 1) continue;
      const v = 0.75 - dx * 0.25 - dy * 0.3;
      p.set(x, y, shade(['ink', 'olive', 'rust', 'mauve', 'tan'], v * 0.8, x, y));
    }
  // klacky křížem
  for (let i = 0; i < 26; i++) {
    const x0 = 3 + hash(i, 1, 300) * 40;
    const y0 = 9 + hash(i, 2, 300) * 9;
    const len = 5 + hash(i, 3, 300) * 7;
    const sl = (hash(i, 4, 300) - 0.5) * 0.9;
    const c: PalKey = (['tan', 'ochre', 'rust', 'olive', 'mauve'] as PalKey[])[Math.floor(hash(i, 5, 300) * 5)];
    for (let k = 0; k < len; k++) p.set(x0 + k, y0 + k * sl, c);
  }
  // láhev vlevo, ponožka vpravo, kost
  p.rect(5, 11, 6, 3, 'pine');
  p.rect(11, 12, 2, 1, 'green');
  p.set(6, 11, 'mint');
  p.rect(36, 11, 4, 3, 'scarlet');
  p.rect(39, 13, 3, 2, 'scarlet');
  p.set(36, 11, 'white');
  p.set(37, 11, 'white');
  p.hline(28, 33, 17, 'bone');
  p.set(27, 16, 'bone');
  p.set(34, 16, 'bone');
  p.set(27, 18, 'fog');
  p.set(34, 18, 'fog');
  // vejce (aligátoří) – dvě bílá
  p.ellipse(16, 12, 2.5, 2, 'bone');
  p.set(15, 11, 'white');
  p.ellipse(31, 12.5, 2.5, 2, 'bone');
  p.set(30, 11, 'white');
  // krígl schovaný v hnízdě
  if (withKrigl) {
    const k = krigl(7);
    p.blit(k, 19, 0);
    p.set(21, 3, 'white');
  }
  return p.outline('ink');
}

/** Kost na zemi (ve stoce – kdo na ni šlápne, ten křupne). */
function floorBone(v: number): PixelCanvas {
  const p = new PixelCanvas(11, 6);
  if (v === 0) {
    p.hline(2, 8, 2, 'bone');
    p.hline(2, 8, 3, 'fog');
    for (const x of [1, 9]) {
      p.vline(x, 1, 2, 'bone');
      p.vline(x, 3, 4, 'fog');
    }
  } else {
    p.template(['..bb.....', '.bbbb.b..', 'bkbbkbbb.', '.bbbbfbbb', '..f.f..ff'], 1, 0, { b: 'bone', k: 'ink', f: 'fog' });
  }
  return p.outline('ink');
}

/** Hromádka zbytků z hospody (knedlík, buřt, kůrka, zelí, kost). */
export function scraps(): PixelCanvas {
  const p = new PixelCanvas(14, 8);
  p.ellipse(4, 5, 3, 2.2, 'bone');
  p.set(3, 4, 'white');
  p.rect(7, 3, 5, 2, 'copper');
  p.set(7, 3, 'ochre');
  p.set(11, 4, 'rust');
  p.rect(8, 5, 4, 2, 'ochre');
  p.set(8, 5, 'sand');
  p.set(1, 6, 'green');
  p.set(2, 7, 'mint');
  p.set(12, 6, 'green');
  p.hline(5, 9, 7, 'fog');
  return p.outline('ink');
}

/** Kýbl na zbytky (ikona pro hlášky / v hospodě u okénka). */
function scrapBucket(): PixelCanvas {
  const p = new PixelCanvas(14, 14);
  for (let y = 4; y < 14; y++) {
    const inset = Math.floor((y - 4) / 4);
    for (let x = 1 + inset; x < 13 - inset; x++) p.set(x, y, x < 5 ? 'fog' : x < 10 ? 'slate' : 'dusk');
  }
  p.hline(1, 12, 4, 'bone');
  p.hline(2, 11, 8, 'dusk');
  p.ellipse(7, 4, 5, 1.6, 'olive');
  p.set(4, 3, 'bone');
  p.set(8, 3, 'copper');
  p.set(9, 3, 'copper');
  p.set(6, 2, 'green');
  for (let x = 2; x < 12; x++) p.set(x, Math.round(1 - Math.sin(((x - 2) / 9) * Math.PI) * 1 + 1) - 1, 'slate');
  return p.outline('ink');
}

/** Mříž do stoky ve zdi (16×16): kulatý cihlový kanál, rezavé pruty, zelený sliz. */
function sewerDoor(open: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  // cihly kolem
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 9);
      if (d > 8) continue;
      if (d > 5.6) {
        const a = Math.atan2(y + 0.5 - 9, x + 0.5 - 8);
        const brick = Math.floor((a + Math.PI) / (Math.PI / 6));
        p.set(x, y, Math.abs(((a + Math.PI) % (Math.PI / 6)) - 0.02) < 0.08 ? 'ink' : hash(brick, 0, 310) < 0.5 ? 'rust' : 'mauve');
        if (d > 7.4) p.set(x, y, 'olive');
      } else p.set(x, y, y > 11 ? (x % 3 ? 'pine' : 'olive') : y > 8 ? 'coal' : 'ink');
    }
  // stékající sliz
  for (const x of [6, 7, 10]) for (let y = 12; y < 16; y++) p.set(x, y, y % 2 ? 'green' : 'sage');
  p.set(5, 11, 'mint');
  if (!open) {
    for (const x of [4, 7, 10, 13]) for (let y = 4; y < 15; y++) if (Math.hypot(x - 7.5, y - 8.5) < 6) p.set(x, y, y % 3 === 0 ? 'copper' : 'rust');
    p.hline(3, 13, 8, 'rust');
    p.set(4, 8, 'copper');
  }
  return p;
}

/** Trubka ve zdi stoky, ze které teče zelená voda (2 snímky). */
function sewerPipe(frame: number): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.ellipse(8, 6, 5.5, 4.5, 'slate');
  p.ellipse(7.5, 5.5, 4, 3.4, 'fog');
  p.ellipse(8, 6.5, 3.2, 2.6, 'ink');
  p.set(5, 3, 'bone');
  p.set(6, 3, 'bone');
  for (let y = 8; y < 16; y++) {
    const w = y < 10 ? 1 : 2;
    for (let x = 8 - w; x <= 8 + w - 1; x++) p.set(x, y, (y + frame) % 3 === 0 ? 'mint' : (x + y + frame) % 2 ? 'green' : 'sage');
  }
  p.set(10, 2, 'rust');
  p.set(11, 3, 'rust');
  return p;
}

/** Lampa v kleci na zdi stoky (elektrika od Jardy). on = svítí. */
function sewerLamp(on: boolean): PixelCanvas {
  const p = new PixelCanvas(12, 16);
  // držák ze zdi a kabel
  p.vline(6, 0, 3, 'ink');
  p.rect(4, 3, 5, 2, 'slate');
  p.hline(4, 8, 3, 'fog');
  // baňka
  p.ellipse(6.5, 9.5, 3.6, 4.2, on ? 'gold' : 'dusk');
  if (on) {
    p.ellipse(6, 9, 2.2, 2.6, 'sand');
    p.set(5, 7, 'white');
    p.set(5, 8, 'white');
  } else {
    p.set(5, 8, 'slate');
    p.hline(5, 7, 11, 'coal');
  }
  // klec (dráty)
  for (const x of [3, 6, 9]) p.vline(x, 6, 13, 'coal');
  p.hline(3, 9, 9, 'coal');
  p.hline(4, 8, 14, 'slate');
  p.outline('ink');
  return p;
}

/** Kostra elektrikáře Jardy u pojistek: čepice, montérky, brašna s nářadím, cedulka se jménem. */
function jardaBones(): PixelCanvas {
  const p = new PixelCanvas(34, 16);
  // brašna s nářadím (vlevo, za hlavou)
  p.rect(0, 6, 8, 6, 'rust');
  p.hline(0, 7, 6, 'copper');
  p.rect(0, 11, 8, 1, 'olive');
  p.hline(2, 5, 4, 'olive'); // ucho
  p.set(1, 5, 'olive');
  p.set(6, 5, 'olive');
  p.vline(2, 3, 6, 'fog'); // šroubovák z brašny
  p.set(2, 2, 'red');
  p.set(5, 5, 'slate'); // kleště
  p.set(6, 4, 'slate');
  p.set(7, 7, 'gold'); // přezka
  // lebka
  p.ellipse(13, 9, 3.6, 3.3, 'bone');
  p.ellipse(12.5, 8.4, 2.4, 2, 'white');
  p.set(12, 9, 'ink');
  p.set(14, 9, 'ink');
  p.set(13, 11, 'ink');
  p.hline(12, 14, 12, 'fog');
  // modrá čepice s kšiltem (sjela na stranu)
  p.ellipse(12, 6, 3.6, 2, 'blue');
  p.hline(10, 13, 5, 'sky');
  p.hline(8, 10, 7, 'indigo'); // kšilt
  p.set(13, 5, 'gold'); // znak blesku
  // montérky (trup) a kosti
  p.rect(17, 6, 9, 7, 'blue');
  p.hline(17, 25, 6, 'sky');
  p.rect(17, 12, 9, 1, 'indigo');
  p.vline(19, 6, 12, 'indigo'); // šle
  p.vline(23, 6, 12, 'indigo');
  for (const x of [20, 21, 22]) p.set(x, 8, 'bone'); // žebra ve výstřihu
  p.set(21, 9, 'bone');
  // cedulka se jménem
  p.rect(18, 9, 4, 2, 'white');
  p.hline(18, 21, 10, 'red');
  // nohy v montérkách a boty
  p.rect(26, 7, 6, 2, 'blue');
  p.rect(26, 10, 5, 2, 'indigo');
  p.rect(32, 6, 2, 3, 'ink');
  p.rect(31, 10, 2, 3, 'ink');
  // ruka – kost natažená dopředu, v ní šroubovák
  p.hline(15, 18, 13, 'bone');
  p.hline(18, 21, 14, 'bone');
  p.set(22, 14, 'fog');
  p.hline(23, 25, 14, 'fog');
  p.rect(26, 14, 2, 1, 'red');
  p.outline('ink');
  return p;
}

/** Smetí plovoucí ve stoce. */
function trash(kind: 'bottle' | 'boot' | 'duck'): PixelCanvas {
  if (kind === 'bottle') {
    const p = new PixelCanvas(10, 5);
    p.rect(1, 1, 6, 3, 'green');
    p.hline(1, 6, 1, 'mint');
    p.rect(7, 2, 2, 1, 'pine');
    p.set(9, 2, 'tan');
    return p.outline('ink');
  }
  if (kind === 'boot') {
    const p = new PixelCanvas(10, 9);
    p.rect(2, 0, 4, 6, 'olive');
    p.rect(2, 5, 7, 3, 'olive');
    p.vline(2, 0, 7, 'rust');
    p.hline(2, 8, 8, 'ink');
    p.set(7, 5, 'tan');
    return p.outline('ink');
  }
  const p = new PixelCanvas(9, 7);
  p.ellipse(4, 4.5, 3.5, 2, 'gold');
  p.ellipse(6, 2, 1.8, 1.8, 'gold');
  p.set(8, 2, 'copper');
  p.set(6, 1, 'ink');
  p.set(3, 3, 'sand');
  p.hline(1, 6, 6, 'amber');
  return p.outline('ink');
}

/** Světlo z kanálu ve stropě – mříž na podlaze (16×16). */
function floorGrate(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  p.rect(1, 1, 14, 14, 'slate');
  for (let y = 3; y < 14; y += 3) p.hline(3, 12, y, 'ink');
  for (let x = 3; x < 14; x += 3) p.vline(x, 3, 12, 'ink');
  p.hline(1, 14, 1, 'fog');
  p.vline(1, 1, 14, 'fog');
  p.set(5, 5, 'rust');
  p.set(9, 11, 'rust');
  return p.outline('ink');
}

// ================================================================ vodník
/** Puntíkatý hrneček dnem vzhůru (11×11): pod ním je dušička, okraj prosvítá. */
function pot(color: PalKey, dark: PalKey, broken: boolean): PixelCanvas {
  const p = new PixelCanvas(12, 11);
  if (broken) {
    // střepy na zemi
    for (const [x, y, w] of [[0, 8, 3], [4, 9, 4], [9, 7, 2], [2, 6, 2], [7, 9, 2]] as const) {
      p.hline(x, x + w - 1, y, color);
      p.hline(x, x + w - 1, y + 1, dark);
    }
    p.set(5, 9, 'white');
    p.set(1, 8, 'white');
    return p.outline('ink');
  }
  // tělo (dnem vzhůru: širší dole)
  for (let y = 1; y < 10; y++) {
    const w = 3.2 + y * 0.18;
    for (let x = Math.round(5 - w); x <= Math.round(5 + w); x++) {
      const nx = (x + 0.5 - 5) / (w + 0.5);
      p.set(x, y, nx < -0.62 && nx > -0.9 && y > 2 ? 'white' : nx < 0.4 ? color : dark);
    }
  }
  p.hline(2, 8, 1, color); // dno
  // bílé puntíky
  for (const [x, y] of [[4, 3], [7, 5], [3, 7], [6, 8], [8, 2]] as const) p.set(x, y, 'white');
  // ucho
  p.vline(10, 3, 7, color);
  p.set(9, 3, color);
  p.set(9, 7, color);
  p.vline(11, 4, 6, dark);
  // okraj u země a záře dušičky zpod něj
  p.hline(1, 9, 10, 'ink');
  p.set(3, 10, 'ice');
  p.set(6, 10, 'ice');
  return p.outline('ink');
}

/** Dušička (7×10): bílomodrý plamínek s očičkama, 2 snímky. */
export function soul(frame: number): PixelCanvas {
  const p = new PixelCanvas(8, 11);
  for (let y = 0; y < 11; y++)
    for (let x = 0; x < 8; x++) {
      const t = y / 10;
      const w = t < 0.35 ? t * 6 : 3.6 - (t - 0.35) * 2.2;
      const sway = Math.sin(t * 5 + frame * 2) * (1 - t) * 1.2;
      const dx = Math.abs(x + 0.5 - 4 - sway);
      if (dx > w) continue;
      p.set(x, y, dx > w - 1 ? 'sky' : t < 0.3 ? 'ice' : 'white');
    }
  p.set(3, 6, 'ink');
  p.set(5, 6, 'ink');
  p.set(4, 8, 'sky');
  return p.outline('blue');
}

/** Vodníkovo jezírko (48×20): voda, lekníny s květem, rákos, kamínky. */
function pond(): PixelCanvas {
  const p = new PixelCanvas(48, 22);
  for (let y = 4; y < 22; y++)
    for (let x = 0; x < 48; x++) {
      const dx = (x + 0.5 - 24) / 23.5;
      const dy = (y + 0.5 - 13) / 8.5;
      const e = dx * dx + dy * dy;
      if (e > 1) continue;
      if (e > 0.82) p.set(x, y, dy < 0 ? 'sage' : 'olive'); // břeh
      else p.set(x, y, shade(['navy', 'indigo', 'blue', 'sky'], 0.75 - e * 0.6 - dy * 0.15, x, y, false));
    }
  for (let i = 0; i < 9; i++) p.hline(10 + hash(i, 1, 320) * 26, 12 + hash(i, 1, 320) * 26, 8 + hash(i, 2, 320) * 9, 'ice');
  // lekníny
  for (const [x, y] of [[14, 11], [31, 15], [22, 17]] as const) {
    p.ellipse(x, y, 3.4, 1.8, 'green');
    p.set(x + 1, y, 'pine');
    p.set(x + 2, y - 1, 'blue');
    p.hline(x - 2, x, y - 1, 'mint');
  }
  p.set(14, 10, 'white');
  p.set(13, 10, 'white');
  p.set(14, 9, 'skin');
  // rákos vlevo a vpravo
  for (const [x, h] of [[2, 12], [4, 15], [6, 10], [42, 13], [45, 16], [44, 10]] as const) {
    p.vline(x, 18 - h, 17, 'olive');
    p.vline(x, 18 - h, 18 - h + 3, 'rust');
    p.set(x + 1, 18 - h + 1, 'copper');
  }
  p.ellipse(9, 19, 2, 1.2, 'fog');
  p.ellipse(37, 20, 1.6, 1, 'slate');
  return p.outline('ink');
}

/** Police s plnými hrnečky (32×26) – vodníkova sbírka. */
function potShelf(): PixelCanvas {
  const p = new PixelCanvas(32, 26);
  // dřevěná police
  for (const y of [9, 20]) {
    p.rect(0, y, 32, 2, 'rust');
    p.hline(0, 31, y, 'copper');
    p.hline(0, 31, y + 2, 'olive');
  }
  p.rect(1, 0, 2, 26, 'olive');
  p.rect(29, 0, 2, 26, 'olive');
  p.vline(1, 0, 25, 'rust');
  const colors: [PalKey, PalKey][] = [['blue', 'indigo'], ['scarlet', 'red'], ['green', 'pine'], ['sky', 'blue'], ['ochre', 'rust']];
  let i = 0;
  for (const y of [0, 11])
    for (let x = 4; x < 27; x += 8) {
      const [c, d] = colors[i++ % colors.length];
      p.blit(pot(c, d, false), x, y - 1);
    }
  return p.outline('ink');
}

/** Oslizlé cihly ve stoce: dlaždice zdi s kapajícím slizem (dekorace zdi 16×16). */
function slime(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let k = 0; k < 4; k++) {
    const x = 1 + k * 4 + Math.floor(hash(k, 2, 330) * 2);
    const len = 4 + Math.floor(hash(k, 1, 330) * 9);
    for (let y = 0; y < len; y++) p.set(x, y, y === len - 1 ? 'mint' : y % 3 === 1 ? 'green' : 'sage');
    if (len > 8) p.set(x + 1, len - 2, 'green');
  }
  for (let x = 0; x < 16; x++) if (hash(x, 3, 331) < 0.7) p.set(x, 0, 'pine');
  return p;
}

export function buildEndProps(): Record<string, PixelCanvas> {
  const o: Record<string, PixelCanvas> = {
    nest: nest(true),
    nestEmpty: nest(false),
    sBone0: floorBone(0),
    sBone1: floorBone(1),
    sScraps: scraps(),
    sKnedlik: morsel('knedlik'),
    sKnedlikGold: morsel('gold'),
    sUtopenec: morsel('utopenec'),
    sBucket: scrapBucket(),
    sewerDoor: sewerDoor(false),
    sewerDoorOpen: sewerDoor(true),
    sPipe0: sewerPipe(0),
    sPipe1: sewerPipe(1),
    sSlime: slime(),
    sBottle: trash('bottle'),
    sBoot: trash('boot'),
    sDuck: trash('duck'),
    sGrate: floorGrate(),
    sLampOn: sewerLamp(true),
    sLampOff: sewerLamp(false),
    jardaBones: jardaBones(),
    potBlue: pot('blue', 'indigo', false),
    potRed: pot('scarlet', 'red', false),
    potGreen: pot('green', 'pine', false),
    potBroken: pot('blue', 'indigo', true),
    soul0: soul(0),
    soul1: soul(1),
    vPond: pond(),
    vShelf: potShelf(),
  };
  return o;
}

/** Listy aligátora (104×24, gatorSprite.ts): 0–1 spí, 2–3 chodí, 4–5 žere; 6–11 totéž s obojkem a mašlí (Pepík). */
export function gatorFrames(): PixelCanvas[] {
  return GATOR_FRAMES.map((rows) => {
    const p = new PixelCanvas(GATOR_W, GATOR_H);
    rows.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y, GATOR_KEYS[c])));
    return p;
  });
}

// ================================================================ stoka – varianta s lodičkou
/** Lodička z rozříznutého sudu (24×13) s pádlem. */
function barrelBoat(): PixelCanvas {
  const p = new PixelCanvas(24, 13);
  for (let y = 3; y < 12; y++) {
    const k = (y - 3) / 8;
    const inset = Math.round(k * k * 4);
    for (let x = 1 + inset; x < 23 - inset; x++) {
      let c: PalKey = Math.floor((x - 1) / 4) % 2 ? 'copper' : 'rust';
      if ((x - 1) % 4 === 0) c = 'olive';
      if (y === 3) c = 'ochre';
      p.set(x, y, c);
    }
  }
  // železné obruče
  for (const x of [5, 18]) for (let y = 3; y < 12; y++) if (p.get(x, y)) p.set(x, y, y === 3 ? 'fog' : 'slate');
  // vnitřek
  p.hline(3, 20, 4, 'olive');
  p.hline(4, 19, 5, 'ink');
  // pádlo
  for (let i = 0; i < 9; i++) p.set(15 + i * 0.9, 1 + i * 0.3, 'tan');
  p.rect(20, 2, 3, 4, 'tan');
  p.set(20, 2, 'sand');
  return p.outline('ink');
}

/**
 * Lodička ze sudu s hostinským uvnitř (24×21) – jeden obrázek pro jízdu ve stoce. Z postavy
 * kouká jen hlava a ramena, přední stěna sudu kryje zbytek; pádlo střídá strany (frame 0/1).
 */
export function boatRider(frame: number): PixelCanvas {
  const p = new PixelCanvas(24, 21);
  const top = 8; // horní okraj sudu
  // zadní (vnitřní) stěna sudu za postavou
  p.hline(3, 20, top, 'olive');
  p.hline(2, 21, top + 1, 'ink');
  // hostinský: hlava a ramena (bez obrysu dole, ten zakryje sud)
  const ch = drawCharFrame(LOOKS.player, 'down', 0);
  for (let y = 0; y < 13; y++) for (let x = 0; x < 16; x++) {
    const c = ch.get(x, y);
    if (c) p.set(4 + x, y - 1, c);
  }
  // pádlo v rukou šikmo přes sud, list ve vodě
  const side = frame ? 1 : -1;
  for (let i = 0; i < 12; i++) {
    const x = Math.round(12 + side * (i * 0.9 - 2));
    const y = Math.round(9 + i * 0.75);
    p.set(x, y, 'tan');
    p.set(x, y - 1, i < 2 ? 'skin' : p.get(x, y - 1));
  }
  const bx = side > 0 ? 20 : 1;
  p.rect(bx, 16, 3, 4, 'sand');
  p.vline(side > 0 ? bx + 2 : bx, 16, 19, 'tan');
  // přední stěna sudu (dýhy a obruče) přes nohy
  for (let y = top + 2; y < top + 11; y++) {
    const k = (y - top - 2) / 8;
    const inset = Math.round(k * k * 4);
    for (let x = 1 + inset; x < 23 - inset; x++) {
      let c: PalKey = Math.floor((x - 1) / 4) % 2 ? 'copper' : 'rust';
      if ((x - 1) % 4 === 0) c = 'olive';
      if (y === top + 2) c = 'ochre';
      p.set(x, y, c);
    }
  }
  for (const x of [5, 18]) for (let y = top + 2; y < top + 11; y++) if (p.get(x, y)) p.set(x, y, y === top + 2 ? 'fog' : 'slate');
  // ruce na pádle nad okrajem
  p.set(11, top + 1, 'skin');
  p.set(13, top + 1, 'skin');
  return p.outline('ink');
}

/** Stavidlo: dřevěné prkno v železném rámu. vertical = kanál svisle (prkno leží napříč). */
function sluice(vertical: boolean, open: boolean, flag: PalKey): PixelCanvas {
  const W = vertical ? 34 : 12;
  const H = vertical ? 12 : 36;
  const p = new PixelCanvas(W, H);
  if (vertical) {
    // rám po stranách kanálu
    p.rect(0, 2, 3, 10, 'slate');
    p.rect(31, 2, 3, 10, 'slate');
    p.hline(0, 33, 1, 'fog');
    p.hline(0, 33, 2, 'slate');
    if (!open) {
      p.rect(3, 4, 28, 7, 'rust');
      for (let x = 3; x < 31; x += 5) p.vline(x, 4, 10, 'olive');
      p.hline(3, 30, 4, 'copper');
    } else {
      p.rect(3, 3, 28, 2, 'rust');
      p.hline(3, 30, 3, 'copper');
    }
    p.rect(1, 0, 3, 3, flag);
  } else {
    p.rect(2, 0, 8, 3, 'slate');
    p.rect(2, 33, 8, 3, 'slate');
    p.vline(1, 0, 35, 'fog');
    if (!open) {
      p.rect(3, 3, 6, 30, 'rust');
      for (let y = 3; y < 33; y += 5) p.hline(3, 8, y, 'olive');
      p.vline(3, 3, 32, 'copper');
    } else {
      p.rect(3, 3, 6, 5, 'rust');
      p.vline(3, 3, 7, 'copper');
    }
    p.rect(8, 0, 4, 3, flag);
  }
  return p.outline('ink');
}

/** Kolečko stavidla na zdi (16×16) s barevným nábojem; frame = pootočení loukotí. */
function wheel(hub: PalKey, frame: number): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  for (let a = 0; a < 64; a++) {
    const t = (a / 64) * Math.PI * 2;
    p.set(8 + Math.cos(t) * 6, 8 + Math.sin(t) * 6, 'slate');
    p.set(8 + Math.cos(t) * 5.5, 8 + Math.sin(t) * 5.5, t > Math.PI ? 'fog' : 'slate');
  }
  for (let k = 0; k < 4; k++) {
    const t = (k / 4) * Math.PI * 2 + (frame * Math.PI) / 8;
    for (let r = 2; r < 6; r++) p.set(8 + Math.cos(t) * r, 8 + Math.sin(t) * r, 'slate');
    p.set(8 + Math.cos(t) * 7, 8 + Math.sin(t) * 7, 'rust'); // držadla
  }
  p.ellipse(8, 8, 1.8, 1.8, hub);
  p.set(7, 7, 'white');
  return p.outline('ink');
}

/** Krysí král (28×18): klubko krys se spletenými ocasy a korunkou. */
function ratKing(frame: number): PixelCanvas {
  const p = new PixelCanvas(28, 18);
  // spletené ocasy uprostřed
  for (let i = 0; i < 26; i++) p.set(8 + (i % 13), 13 + Math.round(Math.sin(i * 1.3) * 1.5), 'mauve');
  const heads: [number, number, boolean][] = [[3, 9, false], [8, 6, false], [14, 4, false], [20, 6, true], [24, 10, true], [6, 13, false], [21, 13, true]];
  heads.forEach(([x, y, right], i) => {
    const bob = (i + frame) % 2;
    p.ellipse(x, y + bob, 3.6, 2.6, i % 2 ? 'slate' : 'dusk');
    p.set(x - 1, y - 1 + bob, 'fog');
    const nx = right ? x + 3 : x - 3;
    p.set(nx, y + bob, 'mauve');
    p.set(nx + (right ? 1 : -1), y + bob, 'skin');
    p.set(right ? x + 1 : x - 1, y - 1 + bob, 'scarlet'); // oko
    p.set(x + (right ? -1 : 1), y - 3 + bob, 'mauve'); // ucho
  });
  // korunka na prostřední
  p.hline(12, 16, 1, 'gold');
  p.set(12, 0, 'gold');
  p.set(14, 0, 'gold');
  p.set(16, 0, 'gold');
  p.set(14, 1, 'scarlet');
  return p.outline('ink');
}

/** Vodopád do díry ve zdi (16×32, 2 snímky). */
function sewerFall(frame: number): PixelCanvas {
  const p = new PixelCanvas(16, 32);
  p.rect(2, 0, 12, 32, 'ink');
  for (let y = 0; y < 32; y++)
    for (let x = 3; x < 13; x++) if ((x + y + frame * 2) % 5 < 2) p.set(x, y, (x + y + frame) % 3 ? 'sage' : 'mint');
  for (let x = 0; x < 16; x++) p.set(x, 31 - (x % 3 === 0 ? 1 : 0), 'bone');
  return p;
}

export function buildSewerC(): Record<string, PixelCanvas> {
  const o: Record<string, PixelCanvas> = { sBoat: barrelBoat(), ratKing0: ratKing(0), ratKing1: ratKing(1), sFall0: sewerFall(0), sFall1: sewerFall(1) };
  const flags: PalKey[] = ['mint', 'scarlet', 'sky', 'gold'];
  flags.forEach((f, i) => {
    o[`sWheel${i}_0`] = wheel(f, 0);
    o[`sWheel${i}_1`] = wheel(f, 1);
    for (const v of [true, false]) {
      o[`sGate${i}${v ? 'V' : 'H'}0`] = sluice(v, false, f);
      o[`sGate${i}${v ? 'V' : 'H'}1`] = sluice(v, true, f);
    }
  });
  return o;
}
