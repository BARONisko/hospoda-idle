import Phaser from 'phaser';
import { PixelCanvas, addSheet } from './pixel';
import { buildCharacterSheet, Look } from './characters';
import { PalKey } from '../data/palette';

// Sklep: úkryty, kvasící sudy, golem, nové potvory, pomůcky z hospody a dekorace pater.

function hideBarrel(): PixelCanvas {
  // velký sud s odsunutým víkem – dá se do něj vlézt
  const p = new PixelCanvas(16, 20);
  p.ellipse(8, 11, 7, 8.5, 'rust');
  p.rect(1, 5, 14, 12, 'rust');
  for (const x of [3, 7, 11]) p.vline(x, 4, 18, 'blood');
  p.vline(4, 5, 17, 'copper');
  for (const y of [7, 15]) {
    p.hline(1, 14, y, 'slate');
    p.set(2, y, 'fog');
  }
  p.ellipse(8, 4, 6.5, 2.5, 'ink');
  p.ellipse(8, 4, 5, 1.5, 'coal');
  // víko opřené vedle
  p.ellipse(13, 3, 3, 1.4, 'ochre');
  p.hline(11, 15, 3, 'copper');
  return p.outline('ink');
}

function hideShelf(broken: boolean): PixelCanvas {
  const p = new PixelCanvas(16, broken ? 14 : 28);
  if (broken) {
    // zřícený regál: prkna a střepy
    p.rect(1, 9, 14, 2, 'rust');
    p.rect(3, 6, 9, 2, 'copper');
    p.set(4, 12, 'green');
    p.set(9, 12, 'mint');
    p.set(12, 11, 'bone');
    p.hline(2, 13, 13, 'blood');
    return p.outline('ink');
  }
  p.rect(1, 0, 14, 28, 'blood');
  p.rect(2, 1, 12, 26, 'olive');
  for (const y of [7, 14, 21, 27]) p.hline(1, 14, y, 'rust');
  p.vline(1, 0, 27, 'copper');
  // lahve a krabice na policích
  const bottles: PalKey[] = ['green', 'mint', 'red', 'bone', 'amber', 'pine'];
  for (let s = 0; s < 3; s++)
    for (let i = 0; i < 4; i++) {
      const x = 3 + i * 3;
      const c = bottles[(s * 4 + i) % bottles.length];
      p.rect(x, 3 + s * 7, 2, 4, c);
      p.set(x, 2 + s * 7, 'ink');
    }
  // žebřík nahoru
  p.vline(14, 0, 27, 'tan');
  return p.outline('ink');
}

function wardrobe(open: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 28);
  p.rect(1, 2, 14, 25, 'rust');
  p.rect(0, 0, 16, 3, 'blood');
  p.hline(0, 15, 0, 'copper');
  p.vline(8, 3, 26, 'blood');
  // ozdobné panely
  p.rect(2, 5, 5, 8, 'copper');
  p.rect(9, 5, 5, 8, 'copper');
  p.rect(2, 15, 5, 9, 'copper');
  p.rect(9, 15, 5, 9, 'copper');
  p.rect(3, 6, 3, 6, 'rust');
  p.rect(10, 6, 3, 6, 'rust');
  p.set(7, 14, 'gold');
  p.set(9, 14, 'gold');
  p.rect(1, 26, 2, 2, 'blood');
  p.rect(13, 26, 2, 2, 'blood');
  if (open) {
    // pootevřené dveře, uvnitř tma
    p.rect(9, 3, 6, 23, 'ink');
    p.rect(13, 3, 3, 23, 'copper');
    p.vline(13, 3, 25, 'ochre');
  }
  return p.outline('ink');
}

function fermenter(hiss: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 22);
  p.ellipse(8, 13, 7, 8.5, hiss ? 'copper' : 'rust');
  p.rect(1, 7, 14, 12, hiss ? 'copper' : 'rust');
  for (const x of [3, 7, 11]) p.vline(x, 6, 20, 'blood');
  for (const y of [9, 17]) {
    p.hline(1, 14, y, 'slate');
    p.set(2, y, 'fog');
  }
  // pěna navrchu
  p.ellipse(8, 6, 6, 2.2, 'sand');
  p.ellipse(6, 5, 2, 1.5, 'white');
  p.ellipse(10, 5, 2, 1.4, 'bone');
  if (hiss) {
    p.ellipse(8, 3, 4, 2.5, 'white');
    p.set(3, 2, 'bone');
    p.set(13, 1, 'bone');
  }
  // kohoutek a cedulka
  p.rect(7, 13, 3, 2, 'gold');
  p.set(8, 15, 'amber');
  p.set(5, 11, 'scarlet');
  return p.outline('ink');
}

function kegOld(): PixelCanvas {
  // nejstarší sud – tmavý, zaprášený, s mosaznou cedulkou a pavučinou
  const p = new PixelCanvas(18, 20);
  p.ellipse(9, 11, 8, 8.5, 'olive');
  p.rect(1, 5, 16, 12, 'olive');
  for (const x of [4, 9, 14]) p.vline(x, 3, 18, 'ink');
  for (const y of [6, 15]) p.hline(1, 16, y, 'gold');
  p.ellipse(9, 3, 7, 2.4, 'rust');
  p.ellipse(9, 3, 5, 1.4, 'blood');
  p.rect(6, 9, 6, 3, 'gold');
  p.hline(7, 10, 10, 'olive');
  // prach a pavučina
  p.set(2, 4, 'fog');
  p.set(3, 3, 'fog');
  p.set(15, 8, 'fog');
  p.set(16, 9, 'bone');
  return p.outline('ink');
}

function cracks(): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const lines: [number, number][][] = [
    [[2, 3], [5, 6], [7, 6], [9, 9], [13, 11]],
    [[7, 6], [8, 2], [11, 1]],
    [[5, 6], [3, 10], [4, 14]],
    [[9, 9], [9, 13], [12, 15]],
  ];
  for (const l of lines)
    for (let i = 0; i < l.length - 1; i++) {
      const [x0, y0] = l[i];
      const [x1, y1] = l[i + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let k = 0; k <= n; k++) {
        const x = Math.round(x0 + ((x1 - x0) * k) / n);
        const y = Math.round(y0 + ((y1 - y0) * k) / n);
        p.set(x, y, 'ink');
        if (k % 2) p.set(x + 1, y, 'dusk');
      }
    }
  p.set(1, 1, 'fog');
  p.set(14, 5, 'fog');
  return p;
}

function hole(): PixelCanvas {
  const p = new PixelCanvas(20, 18);
  p.ellipse(10, 9, 9.5, 8.5, 'dusk');
  p.ellipse(10, 9.5, 8, 7, 'ink');
  for (let i = 0; i < 8; i++) p.set(3 + i * 2, 2 + (i % 3), 'slate');
  p.set(4, 14, 'slate');
  p.set(15, 15, 'slate');
  return p;
}

function iceBarrel(): PixelCanvas {
  const p = new PixelCanvas(16, 18);
  p.ellipse(8, 10, 7, 8, 'indigo');
  p.rect(1, 4, 14, 11, 'indigo');
  for (const x of [4, 8, 12]) p.vline(x, 3, 16, 'navy');
  for (const y of [6, 13]) p.hline(1, 14, y, 'fog');
  p.ellipse(8, 3, 6.5, 2.3, 'ice');
  p.ellipse(8, 3, 4.5, 1.2, 'bone');
  // rampouchy
  for (const x of [2, 6, 10, 13]) p.vline(x, 15, 16 + (x % 2), 'ice');
  p.set(3, 8, 'white');
  return p.outline('ink');
}

function oldTable(): PixelCanvas {
  const p = new PixelCanvas(16, 14);
  p.rect(0, 2, 16, 5, 'rust');
  p.hline(0, 15, 2, 'copper');
  p.hline(0, 15, 6, 'blood');
  p.rect(1, 7, 2, 7, 'blood');
  p.rect(13, 7, 2, 7, 'blood');
  // prach a převržený půllitr
  p.set(3, 3, 'fog');
  p.set(9, 4, 'fog');
  p.rect(6, 0, 3, 3, 'bone');
  p.set(9, 1, 'bone');
  p.set(7, 1, 'amber');
  return p.outline('ink');
}

function oldBar(): PixelCanvas {
  const p = new PixelCanvas(16, 18);
  p.rect(0, 0, 16, 4, 'rust');
  p.hline(0, 15, 0, 'ochre');
  p.rect(0, 4, 16, 14, 'blood');
  for (const x of [0, 5, 10, 15]) p.vline(x, 4, 17, 'maroon');
  p.rect(2, 7, 2, 6, 'rust');
  p.rect(7, 7, 2, 6, 'rust');
  p.rect(12, 7, 2, 6, 'rust');
  p.set(4, 1, 'fog');
  p.set(11, 2, 'fog');
  return p.outline('ink');
}

function rack(): PixelCanvas {
  // stojan na sudy / lahve
  const p = new PixelCanvas(16, 20);
  p.rect(0, 2, 16, 18, 'olive');
  p.vline(0, 2, 19, 'rust');
  p.vline(15, 2, 19, 'rust');
  for (let r = 0; r < 3; r++)
    for (let i = 0; i < 4; i++) {
      p.ellipse(2.5 + i * 3.6, 5 + r * 6, 1.6, 1.6, (r + i) % 3 === 0 ? 'pine' : 'green');
      p.set(2 + i * 3.6, 5 + r * 6, 'ink');
    }
  p.hline(0, 15, 2, 'copper');
  return p.outline('ink');
}

function web(torn: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  const c: PalKey = 'fog';
  if (!torn) {
    for (let i = 0; i < 16; i++) {
      p.set(i, i, c);
      p.set(15 - i, i, c);
      if (i % 2 === 0) p.set(8, i, 'bone');
      p.set(i, 8, i % 3 ? c : 'bone');
    }
    for (const r of [3, 6]) for (let a = 0; a < 16; a++) p.set(8 + Math.cos(a * 0.4) * r, 8 + Math.sin(a * 0.4) * r, 'bone');
  } else {
    for (let i = 0; i < 5; i++) {
      p.set(i, i, c);
      p.set(15 - i, i, c);
      p.set(i, 15 - i, c);
      p.set(15 - i, 15 - i, c);
    }
  }
  return p;
}

function bell(): PixelCanvas {
  const p = new PixelCanvas(8, 9);
  p.ellipse(4, 4.5, 3, 3.5, 'gold');
  p.rect(1, 5, 7, 2, 'gold');
  p.hline(0, 7, 7, 'amber');
  p.set(4, 8, 'olive');
  p.set(4, 0, 'olive');
  p.set(3, 3, 'white');
  return p.outline('ink');
}

function beerTile(): PixelCanvas {
  // celá dlaždice, ať rozlité pivo navazuje jako souvislá louže
  const p = new PixelCanvas(16, 16);
  p.rect(0, 0, 16, 16, 'amber');
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      if ((x * 7 + y * 11) % 13 === 0) p.set(x, y, 'gold');
      if ((x * 5 + y * 3) % 17 === 0) p.set(x, y, 'ochre');
    }
  for (const [x, y] of [[3, 4], [11, 3], [13, 11], [5, 12], [8, 7]]) {
    p.set(x, y, 'bone');
    p.set(x + 1, y, 'white');
  }
  return p;
}

function saltPile(): PixelCanvas {
  const p = new PixelCanvas(16, 6);
  for (let i = 0; i < 16; i++) {
    p.set(i, 2 + ((i * 7) % 3), i % 2 ? 'white' : 'bone');
    if (i % 3 === 0) p.set(i, 3, 'white');
  }
  return p;
}

function webShot(): PixelCanvas {
  const p = new PixelCanvas(7, 7);
  p.ellipse(3.5, 3.5, 3, 3, 'bone');
  p.set(3, 3, 'white');
  p.set(1, 1, 'fog');
  p.set(5, 5, 'fog');
  return p;
}

function bigrat(f: number): PixelCanvas {
  // potkan: velký, tlustý, pomalý
  const p = new PixelCanvas(26, 16);
  const leg = f === 0;
  p.hline(0, 5, 10 + (f ? 1 : 0), 'mauve');
  p.set(0, 9 + (f ? 2 : 0), 'mauve');
  p.ellipse(12, 9, 8, 5.5, 'dusk');
  p.ellipse(11, 7.5, 6, 3.5, 'slate');
  p.hline(6, 18, 13, 'ink');
  p.ellipse(20, 9, 4.5, 3.6, 'dusk');
  p.ellipse(20, 8, 3, 2.2, 'slate');
  p.set(24, 9, 'mauve');
  p.set(25, 9, 'mauve');
  p.set(21, 7, 'scarlet');
  p.set(22, 7, 'scarlet');
  p.set(18, 4, 'mauve');
  p.set(19, 4, 'fog');
  p.set(23, 11, 'bone'); // zub
  p.set(leg ? 8 : 7, 14, 'ink');
  p.set(leg ? 16 : 17, 14, 'ink');
  p.set(leg ? 9 : 10, 14, 'dusk');
  return p.outline('ink');
}

function golem(f: number): PixelCanvas {
  // pivní golem: sudy na sobě, pěnová hlava, žhnoucí jantarové oči
  const p = new PixelCanvas(34, 40);
  const sleep = f === 0;
  const fall = f === 3;
  const bob = f === 2 ? 1 : 0;
  const yo = (sleep ? 6 : 0) + bob;
  // nohy – dva sudy
  if (!sleep) {
    p.rect(7, 30, 7, 9, 'rust');
    p.rect(20, 30, 7, 9, 'rust');
    p.hline(7, 13, 33, 'slate');
    p.hline(20, 26, 33, 'slate');
    p.rect(6 + bob, 38, 9, 2, 'ink');
    p.rect(19 - bob, 38, 9, 2, 'ink');
  }
  // trup – velký sud
  p.ellipse(17, 20 + yo, 13, 12, 'rust');
  p.rect(4, 12 + yo, 26, 16, 'rust');
  for (const x of [8, 13, 18, 23, 27]) p.vline(x, 9 + yo, 31 + yo, 'blood');
  p.vline(9, 11 + yo, 29 + yo, 'copper');
  for (const hy of [14, 26]) {
    p.hline(4, 29, hy + yo, 'slate');
    p.set(6, hy + yo, 'fog');
  }
  // ruce – menší soudky
  const arm = sleep ? 10 : 2;
  p.rect(0, 14 + yo + arm, 5, 8, 'copper');
  p.rect(29, 14 + yo + arm, 5, 8, 'copper');
  p.hline(0, 4, 17 + yo + arm, 'slate');
  p.hline(29, 33, 17 + yo + arm, 'slate');
  // hlava z pěny
  p.ellipse(17, 8 + yo, 9, 6, 'bone');
  p.ellipse(12, 6 + yo, 3, 2.5, 'white');
  p.ellipse(21, 5 + yo, 3, 2, 'white');
  p.ellipse(17, 11 + yo, 8, 2, 'sand');
  // oči
  if (sleep) {
    p.hline(12, 14, 9 + yo, 'ink');
    p.hline(19, 21, 9 + yo, 'ink');
  } else {
    p.rect(11, 7 + yo, 4, 3, 'ink');
    p.rect(19, 7 + yo, 4, 3, 'ink');
    p.rect(12, 8 + yo, 2, 1, fall ? 'white' : 'amber');
    p.rect(20, 8 + yo, 2, 1, fall ? 'white' : 'amber');
    p.hline(13, 21, 13 + yo, 'ink'); // tlama
    p.hline(14, 20, 14 + yo, 'amber');
  }
  // kohoutek na břiše
  p.rect(15, 20 + yo, 4, 3, 'gold');
  p.set(17, 23 + yo, 'amber');
  return p.outline('ink');
}

const SKELETON_LOOK: Look = {
  skin: 'bone', skinShade: 'fog', hair: 'fog', hairShade: 'slate', shirt: 'dusk', shirtShade: 'ink',
  pants: 'slate', pantsShade: 'dusk', shoes: 'ink', hat: 'cap', hatColor: 'maroon', hatShade: 'blood', beard: 'none',
};

export function buildCellarArt(): Record<string, PixelCanvas> {
  return {
    hideBarrel: hideBarrel(),
    hideShelf: hideShelf(false),
    hideShelfBroken: hideShelf(true),
    wardrobe: wardrobe(false),
    wardrobeOpen: wardrobe(true),
    fermenter: fermenter(false),
    fermenterHiss: fermenter(true),
    kegOld: kegOld(),
    cracks: cracks(),
    hole: hole(),
    iceBarrel: iceBarrel(),
    oldTable: oldTable(),
    oldBar: oldBar(),
    rack: rack(),
    web: web(false),
    webTorn: web(true),
    bell: bell(),
    beerTile: beerTile(),
    saltPile: saltPile(),
    webShot: webShot(),
  };
}

export function buildCellarCreatures(scene: Phaser.Scene) {
  const sheet = (key: string, frames: PixelCanvas[], rate: number) => {
    addSheet(scene, key, frames);
    if (scene.anims.exists(`${key}_walk`)) scene.anims.remove(`${key}_walk`);
    scene.anims.create({ key: `${key}_walk`, frames: frames.map((_, i) => ({ key, frame: i })), frameRate: rate, repeat: -1 });
  };
  sheet('bigrat', [bigrat(0), bigrat(1)], 6);
  addSheet(scene, 'golem', [golem(0), golem(1), golem(2), golem(3)]);
  if (!scene.anims.exists('golem_walk')) scene.anims.create({ key: 'golem_walk', frames: [1, 2].map((i) => ({ key: 'golem', frame: i })), frameRate: 3, repeat: -1 });
  buildCharacterSheet(scene, 'skeleton', SKELETON_LOOK);
}
