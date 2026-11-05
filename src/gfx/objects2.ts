import { PixelCanvas } from './pixel';
import { PalKey } from '../data/palette';
import { buildSlots } from './slotsArt';

// Další předměty (atlas „obj“): truhly, zboží, zbraně, nábytek, úkolové věci.

function chest(open: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 15);
  p.rect(1, 6, 14, 8, 'rust');
  p.hline(1, 14, 6, 'copper');
  for (let x = 4; x < 14; x += 4) p.vline(x, 7, 13, 'blood');
  p.hline(1, 14, 13, 'blood');
  if (!open) {
    p.rect(1, 2, 14, 4, 'copper');
    p.hline(2, 13, 1, 'ochre');
    p.hline(1, 14, 5, 'rust');
    p.rect(7, 4, 2, 4, 'gold');
    p.set(7, 4, 'sand');
    p.set(8, 6, 'ink');
  } else {
    p.rect(1, 0, 14, 3, 'blood');
    p.hline(1, 14, 0, 'rust');
    p.rect(2, 4, 12, 2, 'ink');
  }
  p.vline(1, 6, 13, 'slate');
  p.vline(14, 6, 13, 'slate');
  return p.outline('ink');
}

function bottle(body: PalKey, hi: PalKey, label: PalKey, cap: PalKey): PixelCanvas {
  const p = new PixelCanvas(9, 13);
  p.rect(3, 0, 3, 1, cap);
  p.rect(3, 1, 3, 3, body);
  p.rect(2, 4, 5, 8, body);
  p.vline(3, 5, 10, hi);
  p.rect(2, 7, 5, 3, label);
  p.set(4, 8, 'ink');
  return p.outline('ink');
}

function jarOf(content: PalKey, shade: PalKey, dots: PalKey): PixelCanvas {
  const p = new PixelCanvas(11, 12);
  p.rect(2, 0, 7, 2, 'red');
  p.hline(2, 8, 0, 'scarlet');
  p.rect(1, 2, 9, 9, 'bone');
  p.rect(2, 3, 7, 7, content);
  p.hline(2, 8, 9, shade);
  p.set(3, 5, dots);
  p.set(6, 7, dots);
  p.set(5, 4, dots);
  p.vline(2, 3, 6, 'white');
  return p.outline('ink');
}

function sausage(): PixelCanvas {
  const p = new PixelCanvas(13, 9);
  p.ellipse(6.5, 4.5, 5.5, 2.8, 'red');
  p.hline(3, 9, 3, 'scarlet');
  p.set(4, 5, 'blood');
  p.set(8, 5, 'blood');
  p.set(1, 3, 'bone');
  p.set(12, 5, 'bone');
  p.set(6, 4, 'skin');
  return p.outline('ink');
}

function weapon(kind: 'broom' | 'mallet' | 'shovel' | 'pick'): PixelCanvas {
  // zbraň míří doprava, rukojeť vlevo (pro otáčení kolem rukojeti)
  const p = new PixelCanvas(18, 9);
  p.hline(0, 11, 4, 'ochre');
  p.hline(0, 11, 5, 'copper');
  if (kind === 'broom') {
    p.rect(11, 2, 6, 6, 'sand');
    for (let y = 2; y < 8; y += 2) p.hline(13, 16, y, 'amber');
    p.vline(11, 2, 7, 'rust');
  } else if (kind === 'mallet') {
    p.rect(11, 1, 5, 7, 'fog');
    p.vline(11, 1, 7, 'bone');
    for (let y = 2; y < 8; y += 2) p.set(15, y, 'slate');
  } else if (kind === 'shovel') {
    p.rect(11, 1, 6, 7, 'slate');
    p.vline(12, 2, 6, 'fog');
    p.set(16, 1, null);
    p.set(16, 7, null);
  } else {
    p.vline(12, 0, 8, 'fog');
    p.vline(13, 0, 8, 'slate');
    p.set(11, 0, 'fog');
    p.set(11, 8, 'fog');
    p.set(14, 1, 'slate');
    p.set(14, 7, 'slate');
  }
  return p.outline('ink');
}

function floorLamp(): PixelCanvas {
  const p = new PixelCanvas(12, 26);
  p.vline(6, 8, 23, 'slate');
  p.vline(5, 8, 23, 'fog');
  p.hline(2, 9, 24, 'dusk');
  p.rect(1, 1, 10, 7, 'sand');
  p.rect(2, 1, 8, 6, 'gold');
  p.hline(1, 10, 7, 'amber');
  p.vline(2, 1, 6, 'white');
  return p.outline('ink');
}

function darts(): PixelCanvas {
  const p = new PixelCanvas(14, 24);
  p.vline(6, 12, 22, 'rust');
  p.vline(7, 12, 22, 'blood');
  p.hline(3, 10, 23, 'blood');
  p.ellipse(7, 7, 6, 6, 'ink');
  p.ellipse(7, 7, 5, 5, 'bone');
  p.ellipse(7, 7, 3.6, 3.6, 'red');
  p.ellipse(7, 7, 2.2, 2.2, 'bone');
  p.ellipse(7, 7, 1, 1, 'green');
  p.set(9, 5, 'gold');
  p.set(10, 4, 'scarlet');
  return p.outline('ink');
}

function aquarium(): PixelCanvas {
  const p = new PixelCanvas(32, 24);
  p.rect(1, 18, 30, 5, 'rust');
  p.hline(1, 30, 18, 'copper');
  p.rect(2, 2, 28, 16, 'sky');
  p.rect(2, 2, 28, 3, 'ice');
  p.rect(2, 14, 28, 4, 'sand');
  p.vline(6, 9, 15, 'green');
  p.vline(7, 7, 15, 'mint');
  p.vline(25, 10, 15, 'green');
  // rybičky
  p.hline(12, 14, 9, 'gold');
  p.set(11, 8, 'amber');
  p.set(11, 10, 'amber');
  p.set(14, 9, 'ink');
  p.hline(19, 21, 12, 'scarlet');
  p.set(22, 11, 'red');
  p.set(22, 13, 'red');
  p.set(19, 12, 'white'); // ta s divným pohledem
  p.vline(3, 3, 16, 'white');
  return p.outline('ink');
}

function fireplace(f: number): PixelCanvas {
  const p = new PixelCanvas(32, 28);
  p.rect(1, 4, 30, 23, 'slate');
  for (let y = 6; y < 26; y += 4) for (let x = 2 + ((y / 4) % 2) * 3; x < 30; x += 6) p.set(x, y, 'dusk');
  p.rect(0, 2, 32, 3, 'rust');
  p.hline(0, 31, 2, 'copper');
  p.rect(7, 11, 18, 15, 'ink');
  p.ellipse(16, 11, 9, 4, 'ink');
  const fire: PalKey[] = f ? ['gold', 'amber', 'scarlet'] : ['amber', 'gold', 'red'];
  p.ellipse(16, 21, 6, 4 + f, fire[1]);
  p.ellipse(16, 22, 3.5, 3, fire[0]);
  p.set(13 + f, 16, fire[2]);
  p.set(19 - f, 17, fire[0]);
  p.hline(10, 22, 25, 'olive');
  return p.outline('ink');
}

function piano(): PixelCanvas {
  const p = new PixelCanvas(32, 26);
  p.rect(1, 1, 30, 20, 'blood');
  p.hline(1, 30, 1, 'rust');
  p.rect(3, 4, 26, 6, 'maroon');
  p.rect(1, 12, 30, 4, 'white');
  for (let x = 3; x < 30; x += 3) {
    p.vline(x, 12, 15, 'fog');
    if (x % 6 !== 0) p.rect(x - 1, 12, 1, 2, 'ink');
  }
  p.rect(2, 21, 3, 4, 'ink');
  p.rect(27, 21, 3, 4, 'ink');
  p.rect(12, 5, 8, 4, 'bone'); // noty
  p.hline(13, 18, 6, 'slate');
  p.hline(13, 18, 8, 'slate');
  p.set(4, 2, 'gold');
  p.set(27, 2, 'gold');
  return p.outline('ink');
}

function ring(): PixelCanvas {
  const p = new PixelCanvas(10, 10);
  p.ellipse(5, 6, 3.5, 3, 'gold');
  p.ellipse(5, 6, 2, 1.6, null as never);
  p.set(5, 2, 'ice');
  p.set(4, 2, 'white');
  p.set(6, 2, 'sky');
  return p.outline('ink');
}

function teeth(): PixelCanvas {
  const p = new PixelCanvas(12, 8);
  p.ellipse(6, 4, 5, 3, 'scarlet');
  for (let x = 2; x < 11; x += 2) {
    p.set(x, 3, 'white');
    p.set(x, 5, 'bone');
  }
  return p.outline('ink');
}

function photo(): PixelCanvas {
  const p = new PixelCanvas(12, 11);
  p.rect(0, 0, 12, 11, 'bone');
  p.rect(1, 1, 10, 7, 'tan');
  p.ellipse(4, 5, 1.5, 2, 'mauve');
  p.ellipse(8, 5, 1.5, 2, 'mauve');
  p.set(4, 3, 'olive');
  p.set(8, 3, 'slate');
  p.hline(1, 10, 9, 'fog');
  return p.outline('ink');
}

function oldBoots(): PixelCanvas {
  const p = new PixelCanvas(14, 10);
  p.rect(1, 1, 4, 6, 'olive');
  p.rect(1, 6, 6, 3, 'olive');
  p.rect(8, 2, 4, 5, 'rust');
  p.rect(8, 6, 6, 3, 'rust');
  p.hline(1, 6, 8, 'ink');
  p.hline(8, 13, 8, 'ink');
  return p.outline('ink');
}

function apron(): PixelCanvas {
  const p = new PixelCanvas(12, 13);
  p.rect(2, 4, 8, 8, 'rust');
  p.rect(3, 1, 6, 3, 'rust');
  p.vline(3, 4, 11, 'copper');
  p.rect(4, 7, 4, 3, 'blood');
  p.set(2, 1, 'ochre');
  p.set(9, 1, 'ochre');
  return p.outline('ink');
}

function bag(): PixelCanvas {
  const p = new PixelCanvas(12, 13);
  p.ellipse(6, 8, 5, 4.5, 'olive');
  p.rect(3, 2, 6, 4, 'olive');
  p.hline(3, 8, 2, 'tan');
  p.rect(4, 7, 4, 3, 'tan');
  p.set(6, 8, 'gold');
  return p.outline('ink');
}

function dog(): PixelCanvas {
  // Alík: hnědý voříšek z boku (hlava vpravo)
  const p = new PixelCanvas(14, 10);
  p.rect(3, 4, 8, 3, 'copper'); // tělo
  p.rect(10, 2, 3, 3, 'copper'); // hlava
  p.set(13, 4, 'ink'); // čumák
  p.set(11, 3, 'ink'); // oko
  p.vline(10, 1, 3, 'rust'); // ucho
  p.set(1, 3, 'copper'); // ocas
  p.set(2, 4, 'copper');
  p.vline(4, 7, 8, 'rust'); // nohy
  p.vline(9, 7, 8, 'rust');
  p.hline(5, 8, 6, 'ochre'); // bříško
  p.set(7, 4, 'scarlet'); // obojek
  return p.outline('ink');
}

function mapIcon(): PixelCanvas {
  const p = new PixelCanvas(12, 12);
  p.ellipse(6, 6, 5.5, 5.5, 'bone');
  p.ellipse(6, 6, 4, 4, 'tan');
  p.hline(3, 8, 5, 'ink');
  p.vline(5, 3, 8, 'ink');
  p.set(8, 8, 'scarlet');
  p.set(3, 3, 'red');
  return p.outline('ink');
}

function marker(q: boolean): PixelCanvas {
  const p = new PixelCanvas(7, 12);
  if (!q) {
    p.rect(2, 0, 3, 7, 'gold');
    p.rect(2, 9, 3, 3, 'gold');
    p.vline(2, 0, 6, 'sand');
  } else {
    p.rect(1, 0, 5, 2, 'mint');
    p.rect(4, 2, 2, 3, 'mint');
    p.rect(2, 5, 3, 2, 'mint');
    p.rect(2, 9, 3, 3, 'mint');
  }
  return p.outline('ink');
}

function slash(): PixelCanvas {
  const p = new PixelCanvas(24, 24);
  for (let a = -0.9; a <= 0.9; a += 0.05) {
    for (const r of [9, 10, 11]) {
      const x = 12 + Math.cos(a) * r;
      const y = 12 + Math.sin(a) * r;
      p.set(x, y, r === 10 ? 'white' : 'bone');
    }
  }
  return p;
}

function hatch(): PixelCanvas {
  // výdejní okénko do kuchyně (ve zdi, 16×32)
  const p = new PixelCanvas(16, 32);
  p.rect(1, 3, 14, 26, 'rust');
  p.rect(3, 6, 10, 15, 'ink');
  p.rect(4, 7, 8, 13, 'dusk');
  // kuchyně za okénkem – teplé světlo a pára
  p.rect(4, 14, 8, 6, 'olive');
  p.set(6, 15, 'amber');
  p.set(9, 16, 'gold');
  p.set(7, 9, 'fog');
  p.set(8, 8, 'fog');
  p.set(9, 10, 'fog');
  // pult okénka
  p.rect(0, 21, 16, 3, 'ochre');
  p.hline(0, 15, 21, 'sand');
  p.hline(0, 15, 23, 'copper');
  // cedulka
  p.rect(3, 0, 10, 4, 'bone');
  p.hline(4, 11, 2, 'blood');
  p.vline(1, 3, 28, 'copper');
  return p.outline('ink');
}

function plate(food: (p: PixelCanvas) => void): PixelCanvas {
  const p = new PixelCanvas(13, 10);
  p.ellipse(6.5, 6, 6, 3.5, 'white');
  p.ellipse(6.5, 6.5, 4.5, 2.4, 'bone');
  food(p);
  return p.outline('ink');
}

function fireFx(f: number): PixelCanvas {
  const p = new PixelCanvas(16, 20);
  const c1: PalKey = f ? 'gold' : 'amber';
  const c2: PalKey = f ? 'scarlet' : 'red';
  p.ellipse(8, 14, 6, 6, c2);
  p.ellipse(8, 12, 4.5, 6, 'amber');
  p.ellipse(8, 13, 2.5, 4, c1);
  p.set(5 + f, 4, 'gold');
  p.set(10 - f, 6, 'amber');
  p.set(8, 2 + f, 'sand');
  return p;
}

function pool(): PixelCanvas {
  // kulečníkový stůl 32×22
  const p = new PixelCanvas(32, 24);
  p.rect(1, 2, 30, 16, 'rust');
  p.rect(3, 4, 26, 12, 'green');
  p.hline(3, 28, 4, 'mint');
  for (const [x, y] of [[3, 4], [16, 4], [28, 4], [3, 15], [16, 15], [28, 15]]) p.set(x, y, 'ink');
  p.set(9, 9, 'white');
  p.set(20, 8, 'scarlet');
  p.set(22, 10, 'gold');
  p.set(21, 11, 'sky');
  p.hline(6, 15, 12, 'ochre'); // tágo
  p.hline(1, 30, 18, 'blood');
  p.rect(3, 19, 3, 4, 'blood');
  p.rect(26, 19, 3, 4, 'blood');
  p.hline(1, 30, 2, 'copper');
  return p.outline('ink');
}

function parasol(): PixelCanvas {
  const p = new PixelCanvas(20, 28);
  p.vline(10, 8, 25, 'bone');
  p.hline(7, 13, 26, 'slate');
  p.ellipse(10, 7, 9, 5, 'scarlet');
  for (let x = 2; x < 19; x += 4) p.vline(x, 4, 11, 'white');
  p.ellipse(10, 5, 5, 2, 'red');
  p.set(10, 1, 'gold');
  return p.outline('ink');
}

function trophy(): PixelCanvas {
  const p = new PixelCanvas(12, 14);
  p.rect(2, 1, 8, 6, 'gold');
  p.vline(3, 1, 6, 'sand');
  p.set(1, 2, 'gold');
  p.set(10, 2, 'gold');
  p.set(0, 3, 'amber');
  p.set(11, 3, 'amber');
  p.rect(5, 7, 2, 3, 'amber');
  p.rect(3, 10, 6, 2, 'rust');
  p.hline(3, 8, 12, 'copper');
  p.set(4, 2, 'white');
  return p.outline('ink');
}

function bigRat(): PixelCanvas {
  return new PixelCanvas(1, 1);
}

export function buildObjects2(): Record<string, PixelCanvas> {
  const o: Record<string, PixelCanvas> = {};
  o.chest = chest(false);
  o.chestOpen = chest(true);
  o.gRum = bottle('rust', 'copper', 'sand', 'ink');
  o.gSliv = bottle('bone', 'white', 'plum', 'red');
  o.gPickle = jarOf('sage', 'grave', 'scarlet');
  o.gCheese = jarOf('sand', 'ochre', 'red');
  o.gSausage = sausage();
  o.wBroom = weapon('broom');
  o.wMallet = weapon('mallet');
  o.wShovel = weapon('shovel');
  o.wPick = weapon('pick');
  o.floorLamp = floorLamp();
  o.darts = darts();
  o.aquarium = aquarium();
  o.fireplace = fireplace(0);
  o.fireplace1 = fireplace(1);
  o.piano = piano();
  o.qRing = ring();
  o.qTeeth = teeth();
  o.qPhoto = photo();
  o.qBoots = oldBoots();
  o.apronIcon = apron();
  o.bag = bag();
  o.mapIcon = mapIcon();
  o.dog = dog();
  o.exclaim = marker(false);
  o.question = marker(true);
  o.slash = slash();
  o.hatch = hatch();
  o.dToast = plate((p) => {
    p.rect(3, 3, 7, 4, 'ochre');
    p.hline(3, 9, 3, 'copper');
    p.set(5, 4, 'bone');
    p.set(7, 5, 'bone');
  });
  o.dGoulash = plate((p) => {
    p.ellipse(5, 5, 3, 2, 'rust');
    p.set(4, 4, 'red');
    p.rect(8, 3, 3, 3, 'bone');
    p.rect(9, 6, 2, 1, 'bone');
  });
  o.dFried = plate((p) => {
    p.ellipse(5, 5, 3, 2, 'ochre');
    p.set(4, 4, 'sand');
    for (let x = 8; x < 12; x++) p.vline(x, 3 + (x % 2), 6, 'gold');
  });
  o.dKnee = plate((p) => {
    p.ellipse(6, 4.5, 4, 3, 'copper');
    p.ellipse(5, 4, 2, 1.4, 'ochre');
    p.rect(10, 2, 2, 3, 'bone');
  });
  o.dSmoked = plate((p) => {
    p.ellipse(5, 5, 3.5, 2, 'rust');
    p.hline(3, 7, 4, 'copper');
    p.set(4, 5, 'bone');
    p.rect(9, 3, 2, 3, 'bone');
  });
  o.dBrawn = plate((p) => {
    p.rect(3, 3, 6, 4, 'skin');
    p.set(4, 4, 'bone');
    p.set(6, 5, 'bone');
    p.set(7, 4, 'red');
    p.rect(9, 3, 2, 2, 'bone');
    p.set(10, 6, 'bone');
  });
  // speciality z kuchařské knihy
  o.dBramborak = plate((p) => {
    p.ellipse(4.5, 5, 2.6, 1.8, 'copper');
    p.ellipse(8.5, 5.5, 2.6, 1.8, 'ochre');
    p.set(4, 4, 'sand');
    p.set(8, 5, 'gold');
    p.set(9, 6, 'copper');
  });
  o.dZelnacka = plate((p) => {
    p.ellipse(6.5, 5.5, 4.5, 2.4, 'rust');
    p.ellipse(6.5, 5.2, 3.6, 1.8, 'ochre');
    p.set(4, 5, 'bone');
    p.set(8, 5, 'red');
    p.set(6, 6, 'sand');
    p.set(5, 2, 'white');
    p.set(8, 1, 'white');
  });
  o.dHermelin = plate((p) => {
    p.ellipse(5.5, 5, 3, 2, 'sand');
    p.ellipse(5.5, 4.6, 2.2, 1.2, 'white');
    p.set(4, 4, 'ochre');
    p.rect(9, 4, 2, 2, 'plum');
    p.set(10, 6, 'bone');
  });
  o.dVepro = plate((p) => {
    p.rect(2, 4, 3, 2, 'copper');
    p.set(3, 4, 'ochre');
    p.rect(6, 4, 2, 2, 'white');
    p.rect(8, 5, 2, 1, 'white');
    p.rect(10, 4, 2, 2, 'sage');
    p.set(11, 5, 'mint');
  });
  o.pool = pool();
  o.parasol = parasol();
  o.trophy = trophy();
  o.fire0 = fireFx(0);
  o.fire1 = fireFx(1);
  void bigRat;
  Object.assign(o, buildSlots());
  return o;
}
