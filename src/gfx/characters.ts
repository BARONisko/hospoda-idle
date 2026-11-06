import Phaser from 'phaser';
import { PalKey } from '../data/palette';
import { PixelCanvas, addSheet } from './pixel';

export interface Look {
  skin: PalKey;
  skinShade: PalKey;
  hair: PalKey;
  hairShade: PalKey;
  shirt: PalKey;
  shirtShade: PalKey;
  pants: PalKey;
  pantsShade: PalKey;
  shoes: PalKey;
  hat?: 'cap' | 'hat' | 'beanie' | 'bald' | 'sombrero' | 'hood' | null; // hood = kápě přes celou hlavu (bez vlasů)
  hatColor?: PalKey;
  hatShade?: PalKey;
  beard?: 'none' | 'mustache' | 'full' | 'handlebar'; // handlebar = hostinský knír se zatočenými konci (Vacek)
  apron?: boolean;
  vest?: PalKey; // vesta (číšník)
  coat?: boolean; // dlouhý kabát
  glasses?: boolean; // kulaté brýle
  longHair?: boolean; // dlouhé vlasy přes ramena
  lips?: boolean; // rudá rtěnka
  catrina?: boolean; // lebkové líčení na Den mrtvých (důlky kolem očí, nos, sešitá ústa, květy ve vlasech)
  serape?: [PalKey, PalKey]; // pruhované pončo (Den mrtvých)
  jersey?: PalKey; // fotbalový dres: svislé pruhy přes tričko (fanoušci při fotbalu)
  dress?: PalKey; // dlouhé šaty se sukní (catrina)
  chad?: boolean; // „Chad“: vlasy dozadu, vous, obří hranatá brada (kovář z páky), viz CHAD
  mask?: boolean; // bledá maska bez úst se dvěma škvírami (Cizinec ve žlutém)
}

export type Dir = 'down' | 'up' | 'side';

// Snímky v listu postavy:
// 0–3 dolů (chůze), 4–7 nahoru, 8–11 do strany (vpravo), 12 sed (vpravo), 13 ruce nahoře (nese sud, dolů), 14 omdlí/leží
export const FRAMES = { down: 0, up: 4, side: 8, sit: 12, carry: 13, lie: 14 };

// Hlava „Chad“ (kovář z páky): vlasy dozadu, krátký vous, obří hranatá brada. Zepředu je brada vidět pod hlavou,
// z boku trčí dopředu do špičky, zezadu koukají rohy čelisti. h vlasy, H lesk vlasů, s kůže, o stín kůže,
// b vous, k tmavý vous, K obočí/oči, w zuby.
const CHAD: Record<Dir, string[]> = {
  down: [
    '................',
    '.....hhhhhh.....',
    '....hHHhhhhh....',
    '....hssssssh....',
    '....sKKssKKo....',
    '....ssKssKso....',
    '....sssosssoo...',
    '...sswwwwwwoo...',
    '...bssssssssb...',
    '...bbbbbbbbbb...',
    '....kbbbbbbk....',
  ],
  up: [
    '................',
    '.....hhhhhh.....',
    '....hhHhhhhh....',
    '....hhhhhhhh....',
    '....hhhhhhhh....',
    '....khhhhhhk....',
    '...bossssssob...',
    '...bbsssssobb...',
    '...bb.ssso.bb...',
  ],
  side: [
    '................',
    '.....hhhhh......',
    '....hHHhhhh.....',
    '...hhhhhssss....',
    '...hhhhsKKKs....',
    '...hhsssssKs....',
    '....ossssssss...',
    '....osssssww....',
    '.....bsssssss...',
    '......bbbbbbb...',
    '.........kbbbb..',
  ],
};

function drawChad(p: PixelCanvas, L: Look, dir: Dir, yo: number) {
  const C: Record<string, PalKey> = { h: L.hair, H: 'slate', s: L.skin, o: L.skinShade, b: L.hair, k: L.hairShade, K: 'ink', w: 'white' };
  CHAD[dir].forEach((row, y) => [...row].forEach((c, x) => c !== '.' && p.set(x, y + yo, C[c])));
}

function drawHead(p: PixelCanvas, L: Look, dir: Dir, yo = 0) {
  if (L.chad) return drawChad(p, L, dir, yo);
  const bald = L.hat === 'bald';
  if (dir === 'down') {
    p.rect(4, 4 + yo, 8, 4, L.skin);
    p.rect(5, 8 + yo, 6, 1, L.skin);
    p.vline(11, 5 + yo, 7 + yo, L.skinShade);
    p.set(10, 8 + yo, L.skinShade);
    if (!bald) {
      p.hline(5, 10, 2 + yo, L.hair);
      p.hline(4, 11, 3 + yo, L.hair);
      p.set(4, 4 + yo, L.hair);
      p.set(11, 4 + yo, L.hairShade);
      p.hline(5, 7, 4 + yo, L.hair);
      p.set(10, 3 + yo, L.hairShade);
      p.set(11, 3 + yo, L.hairShade);
      p.set(6, 2 + yo, L.hairShade === L.hair ? L.hair : L.hair);
    } else {
      p.hline(5, 10, 3 + yo, L.skin);
      p.set(10, 3 + yo, L.skinShade);
      p.set(6, 3 + yo, 'white');
      p.set(4, 5 + yo, L.hair);
      p.set(11, 5 + yo, L.hairShade);
    }
    p.set(6, 6 + yo, 'ink');
    p.set(9, 6 + yo, 'ink');
    if (L.mask) {
      // bledá maska: škvíry místo očí, žádná ústa
      p.hline(5, 6, 6 + yo, 'ink');
      p.hline(9, 10, 6 + yo, 'ink');
    } else if (L.catrina) {
      for (const x of [5, 10]) p.set(x, 6 + yo, 'plum');
      p.set(6, 5 + yo, 'plum');
      p.set(9, 5 + yo, 'plum');
      p.set(7, 7 + yo, 'ink');
      p.hline(6, 9, 8 + yo, 'fog');
      p.set(6, 8 + yo, 'ink');
      p.set(8, 8 + yo, 'ink');
      p.set(5, 2 + yo, 'scarlet');
      p.set(7, 1 + yo, 'amber');
      p.set(10, 2 + yo, 'scarlet');
    } else if (L.beard === 'mustache') {
      p.hline(6, 9, 7 + yo, L.hair);
      p.set(5, 8 + yo, L.hairShade);
      p.set(10, 8 + yo, L.hairShade);
    } else if (L.beard === 'handlebar') {
      p.hline(5, 10, 7 + yo, L.hair);
      p.hline(6, 9, 8 + yo, L.hairShade);
      p.set(4, 6 + yo, L.hair);
      p.set(11, 6 + yo, L.hair);
    } else if (L.beard === 'full') {
      p.hline(5, 10, 7 + yo, L.hair);
      p.hline(5, 10, 8 + yo, L.hair);
      p.hline(6, 9, 9 + yo, L.hairShade);
      p.set(7, 7 + yo, L.skinShade);
      p.set(8, 7 + yo, L.skinShade);
    } else {
      p.set(7, 8 + yo, L.skinShade);
      p.set(8, 8 + yo, L.skinShade);
    }
  } else if (dir === 'up') {
    p.rect(4, 3 + yo, 8, 5, bald ? L.skin : L.hair);
    p.hline(5, 10, 2 + yo, bald ? L.skin : L.hair);
    p.vline(11, 4 + yo, 7 + yo, bald ? L.skinShade : L.hairShade);
    p.hline(5, 10, 7 + yo, bald ? L.skinShade : L.hairShade);
    if (bald) p.set(6, 3 + yo, 'white');
    p.hline(5, 10, 8 + yo, L.skinShade);
  } else {
    // profil vpravo
    p.rect(5, 4 + yo, 7, 4, L.skin);
    p.hline(7, 10, 8 + yo, L.skin);
    p.set(12, 6 + yo, L.skin);
    p.set(11, 7 + yo, L.skinShade);
    if (!bald) {
      p.hline(5, 10, 2 + yo, L.hair);
      p.hline(4, 11, 3 + yo, L.hair);
      p.rect(4, 4 + yo, 4, 3, L.hair);
      p.hline(4, 6, 7 + yo, L.hairShade);
      p.set(11, 3 + yo, L.hairShade);
      p.set(8, 4 + yo, L.hair);
    } else {
      p.hline(5, 10, 3 + yo, L.skin);
      p.set(8, 3 + yo, 'white');
      p.rect(4, 5 + yo, 2, 2, L.hair);
    }
    p.set(7, 5 + yo, L.skinShade);
    p.set(7, 6 + yo, L.skinShade);
    p.set(10, 5 + yo, 'ink');
    if (L.mask) {
      p.hline(9, 11, 5 + yo, 'ink');
      p.hline(8, 11, 7 + yo, L.skin);
    }
    if (L.beard === 'mustache') {
      p.hline(9, 11, 7 + yo, L.hair);
    } else if (L.beard === 'handlebar') {
      p.hline(8, 12, 7 + yo, L.hair);
      p.hline(9, 11, 8 + yo, L.hairShade);
      p.set(12, 6 + yo, L.hair);
    } else if (L.beard === 'full') {
      p.hline(7, 11, 7 + yo, L.hair);
      p.hline(7, 10, 8 + yo, L.hair);
      p.hline(8, 9, 9 + yo, L.hairShade);
    }
  }
  // dlouhé kudrnaté vlasy, brýle, rtěnka
  if (L.longHair) {
    if (dir === 'down') {
      // prameny podél tváří, na koncích kudrlinky
      p.vline(4, 4 + yo, 9 + yo, L.hair);
      p.vline(11, 4 + yo, 9 + yo, L.hair);
      p.vline(3, 6 + yo, 9 + yo, L.hairShade);
      p.vline(12, 6 + yo, 9 + yo, L.hairShade);
      p.set(3, 10 + yo, L.hair);
      p.set(12, 10 + yo, L.hair);
      p.set(4, 10 + yo, L.hairShade);
      p.set(11, 10 + yo, L.hairShade);
      p.set(10, 4 + yo, L.hair); // ofina do strany
    } else if (dir === 'up') {
      p.rect(4, 3 + yo, 8, 7, L.hair);
      p.vline(3, 5 + yo, 9 + yo, L.hairShade);
      p.vline(12, 5 + yo, 9 + yo, L.hairShade);
      for (const [x, y] of [[5, 5], [8, 6], [10, 4], [6, 8], [9, 9]]) p.set(x, y + yo, L.hairShade);
      p.hline(5, 10, 10 + yo, L.hair);
      p.set(4, 10 + yo, L.hairShade);
      p.set(11, 10 + yo, L.hairShade);
    } else {
      p.rect(3, 4 + yo, 3, 6, L.hair);
      p.vline(3, 6 + yo, 10 + yo, L.hairShade);
      p.set(4, 10 + yo, L.hair);
      p.set(6, 5 + yo, L.hairShade);
    }
  }
  if (L.glasses) {
    if (dir === 'down') {
      // obroučky (tmavě fialové), ve skle odlesk místo očí
      for (const x of [5, 7, 8, 10]) p.set(x, 6 + yo, 'dusk');
      p.set(6, 6 + yo, 'ice');
      p.set(9, 6 + yo, 'ice');
      p.set(6, 7 + yo, L.skinShade);
      p.set(9, 7 + yo, L.skinShade);
    } else if (dir === 'side') {
      p.set(9, 5 + yo, 'dusk');
      p.set(11, 5 + yo, 'dusk');
      p.set(10, 5 + yo, 'ice');
      p.hline(7, 8, 5 + yo, 'dusk');
    }
  }
  if (L.lips) {
    if (dir === 'down') p.set(7, 8 + yo, 'scarlet');
    else if (dir === 'side') p.set(11, 7 + yo, 'scarlet');
  }
  // pokrývky hlavy
  const hc = L.hatColor ?? 'red';
  const hs = L.hatShade ?? 'blood';
  if (L.hat === 'cap') {
    if (dir === 'down') {
      p.hline(5, 10, 1 + yo, hc);
      p.rect(4, 2 + yo, 8, 2, hc);
      p.hline(4, 11, 4 + yo, hs);
      p.set(10, 2 + yo, hs);
    } else if (dir === 'up') {
      p.hline(5, 10, 1 + yo, hc);
      p.rect(4, 2 + yo, 8, 2, hc);
      p.hline(4, 11, 4 + yo, hs);
    } else {
      p.hline(5, 10, 1 + yo, hc);
      p.rect(4, 2 + yo, 8, 2, hc);
      p.hline(9, 13, 4 + yo, hs);
      p.set(5, 3 + yo, hs);
    }
  } else if (L.hat === 'hat') {
    if (dir === 'side') {
      p.rect(5, 0 + yo, 6, 3, hc);
      p.hline(3, 13, 3 + yo, hs);
      p.hline(5, 10, 2 + yo, 'ink');
    } else {
      p.rect(5, 0 + yo, 6, 3, hc);
      p.hline(3, 12, 3 + yo, hs);
      p.hline(5, 10, 2 + yo, 'ink');
      p.set(10, 1 + yo, hs);
    }
  } else if (L.hat === 'sombrero') {
    // široká krempa přes celou hlavu, nízká koruna s barevnou stuhou
    p.rect(5, 0 + yo, 6, 2, hc);
    p.hline(5, 10, 1 + yo, 'scarlet');
    p.set(7, 1 + yo, 'green');
    p.hline(2, 13, 2 + yo, hc);
    p.hline(1, 14, 3 + yo, hs);
    p.set(dir === 'side' ? 13 : 1, 3 + yo, hc);
  } else if (L.hat === 'hood') {
    // kápě (Cizinec ve žlutém): zaoblená, vpředu převislá špička, místo obličeje jen tma
    if (dir === 'down') {
      p.hline(6, 9, 0 + yo, hc);
      p.hline(5, 10, 1 + yo, hc);
      p.hline(4, 11, 2 + yo, hc);
      p.rect(3, 3 + yo, 10, 8, hc);
      p.hline(5, 10, 3 + yo, hs);
      p.rect(5, 4 + yo, 6, 6, 'ink');
      p.hline(6, 9, 10 + yo, 'ink');
      p.vline(4, 4 + yo, 10 + yo, hs);
      p.vline(11, 3 + yo, 10 + yo, hs);
      p.set(7, 1 + yo, hs);
    } else if (dir === 'up') {
      p.hline(6, 9, 0 + yo, hc);
      p.hline(5, 10, 1 + yo, hc);
      p.hline(4, 11, 2 + yo, hc);
      p.rect(3, 3 + yo, 10, 8, hc);
      p.vline(8, 2 + yo, 10 + yo, hs);
      p.vline(12, 4 + yo, 10 + yo, hs);
    } else {
      // z boku: zakulacená záda vlevo, nahoře oblouk dopředu, špička visí přes otvor
      p.hline(5, 10, 0 + yo, hc);
      p.hline(4, 11, 1 + yo, hc);
      p.hline(3, 12, 2 + yo, hc);
      p.hline(3, 13, 3 + yo, hc);
      p.hline(12, 13, 4 + yo, hc);
      p.set(13, 5 + yo, hs);
      p.rect(3, 4 + yo, 6, 7, hc);
      p.rect(9, 4 + yo, 3, 6, 'ink');
      p.rect(12, 5 + yo, 1, 5, 'ink');
      p.vline(8, 4 + yo, 10 + yo, hs);
      p.hline(9, 11, 10 + yo, hs);
      p.vline(3, 3 + yo, 10 + yo, hs);
      p.hline(9, 12, 3 + yo, hs);
    }
  } else if (L.hat === 'beanie') {
    p.hline(6, 9, 1 + yo, hc);
    p.rect(4, 2 + yo, 8, 2, hc);
    p.hline(4, 11, 4 + yo, hs);
    p.set(7, 0 + yo, 'white');
    p.set(8, 0 + yo, 'bone');
    if (dir !== 'up') p.set(dir === 'side' ? 11 : 10, 2 + yo, hs);
  }
}

/** Pončo (pruhy přes trup) a šaty se sukní přes nohy – kreslí se přes hotové tělo. */
function drawOutfit(p: PixelCanvas, L: Look, dir: Dir, frame: number) {
  if (L.jersey) {
    const x0 = dir === 'side' ? 6 : 5, x1 = dir === 'side' ? 10 : 11;
    for (let x = x0; x <= x1; x += 2) p.vline(x, 9, 11, L.jersey);
  }
  if (L.serape) {
    const [a, b] = L.serape;
    const x0 = dir === 'side' ? 4 : 3, x1 = dir === 'side' ? 11 : 12;
    for (let y = 9; y <= 12; y++) p.hline(x0 + (y === 9 ? 1 : 0), x1 - (y === 9 ? 1 : 0), y, y % 2 ? a : b);
    p.hline(x0, x1, 12, 'gold');
    for (let x = x0; x <= x1; x += 2) p.set(x, 13, a); // třásně
  }
  if (L.dress) {
    const sway = dir !== 'side' && frame % 2 ? 1 : 0;
    if (dir === 'side') {
      p.rect(5, 12, 6, 2, L.dress);
      p.hline(4, 11, 14, L.dress);
      p.hline(4, 11, 13, L.shirtShade);
    } else {
      p.rect(4, 12, 8, 2, L.dress);
      p.hline(3 + sway, 12 + sway - 1 + (sway ? 0 : 1), 14, L.dress);
      p.hline(4, 11, 13, L.shirtShade);
      p.set(6, 12, 'gold');
      p.set(9, 12, 'gold');
    }
  }
}

function drawBody(p: PixelCanvas, L: Look, dir: Dir, frame: number) {
  const swing = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  if (dir === 'down' || dir === 'up') {
    // trup
    p.rect(4, 9, 8, 3, L.shirt);
    p.vline(11, 9, 11, L.shirtShade);
    p.vline(10, 10, 11, L.shirtShade);
    if (dir === 'down') {
      p.set(7, 9, L.skinShade);
      p.set(8, 9, L.skinShade);
    }
    if (L.vest) {
      p.rect(4, 9, 2, 3, L.vest);
      p.rect(10, 9, 2, 3, L.vest);
    }
    // ruce
    p.vline(3, 9, 10 + (swing > 0 ? 1 : 0), L.shirtShade);
    p.vline(12, 9, 10 + (swing < 0 ? 1 : 0), L.shirtShade);
    p.set(3, 11 + (swing > 0 ? 1 : 0), L.skin);
    p.set(12, 11 + (swing < 0 ? 1 : 0), L.skinShade);
    // boky
    p.hline(4, 11, 12, L.pants);
    p.set(11, 12, L.pantsShade);
    if (L.coat) {
      p.rect(4, 9, 8, 5, L.shirt);
      p.vline(11, 9, 13, L.shirtShade);
      p.vline(7, 10, 13, L.shirtShade);
    }
    if (L.apron) {
      if (dir === 'down') {
        p.rect(5, 10, 6, 4, 'bone');
        p.vline(10, 10, 13, 'fog');
        p.hline(5, 10, 13, 'fog');
        p.set(5, 9, 'bone');
        p.set(10, 9, 'bone');
      } else {
        p.hline(4, 11, 11, 'bone');
        p.set(7, 12, 'bone');
        p.set(8, 12, 'fog');
      }
    }
    // nohy
    const lUp = frame === 3; // levá noha zvednutá
    const rUp = frame === 1;
    if (!lUp) {
      p.rect(5, 13, 2, 1, L.pants);
      p.rect(5, 14, 2, 1, L.shoes);
    } else p.rect(5, 13, 2, 1, L.shoes);
    if (!rUp) {
      p.rect(9, 13, 2, 1, L.pantsShade);
      p.rect(9, 14, 2, 1, L.shoes);
    } else p.rect(9, 13, 2, 1, L.shoes);
    if (L.coat) {
      p.hline(4, 11, 13, L.shirtShade);
    }
  } else {
    // profil
    p.rect(5, 9, 6, 3, L.shirt);
    p.vline(5, 9, 11, L.shirtShade);
    if (L.vest) p.rect(8, 9, 3, 3, L.vest);
    p.hline(5, 10, 12, L.pants);
    p.set(5, 12, L.pantsShade);
    if (L.coat) {
      p.rect(5, 9, 6, 5, L.shirt);
      p.vline(5, 9, 13, L.shirtShade);
    }
    if (L.apron) {
      p.rect(10, 10, 2, 4, 'bone');
      p.vline(11, 10, 13, 'fog');
    }
    // nohy
    if (frame === 0 || frame === 2) {
      p.rect(7, 13, 3, 1, L.pants);
      p.rect(7, 14, 4, 1, L.shoes);
    } else {
      const front = frame === 1 ? L.pants : L.pantsShade;
      const back = frame === 1 ? L.pantsShade : L.pants;
      p.rect(5, 13, 2, 1, back);
      p.rect(4, 14, 2, 1, L.shoes);
      p.rect(9, 13, 2, 1, front);
      p.rect(10, 14, 2, 1, L.shoes);
    }
    // paže
    const ax = swing > 0 ? 9 : swing < 0 ? 6 : 7;
    p.rect(ax, 9, 2, 2, L.shirtShade);
    p.set(ax + (swing > 0 ? 1 : 0), 11, L.skin);
  }
}

export function drawCharFrame(L: Look, dir: Dir, frame: number): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  drawBody(p, L, dir, frame);
  drawOutfit(p, L, dir, frame);
  drawHead(p, L, dir, 0);
  return p.outline('ink');
}

function drawSit(L: Look): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  // trup + stehna dopředu
  p.rect(5, 9, 6, 3, L.shirt);
  p.vline(5, 9, 11, L.shirtShade);
  if (L.vest) p.rect(8, 9, 3, 3, L.vest);
  if (L.coat) p.rect(5, 9, 6, 4, L.shirt);
  p.rect(5, 12, 7, 2, L.pants);
  p.hline(5, 11, 13, L.pantsShade);
  p.rect(11, 14, 2, 1, L.shoes);
  p.rect(9, 9, 2, 2, L.shirtShade);
  p.set(11, 10, L.skin);
  if (L.serape) for (let y = 9; y <= 12; y++) p.hline(5, 10, y, y === 12 ? 'gold' : y % 2 ? L.serape[0] : L.serape[1]);
  if (L.jersey) for (let x = 6; x <= 10; x += 2) p.vline(x, 9, 11, L.jersey);
  if (L.dress) {
    p.rect(5, 12, 7, 2, L.dress);
    p.rect(10, 14, 3, 1, L.dress);
  }
  drawHead(p, L, 'side', 0);
  return p.outline('ink');
}

function drawCarry(L: Look): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  drawBody(p, L, 'down', 0);
  // ruce nahoru
  p.set(3, 9, null);
  p.set(3, 10, null);
  p.set(3, 11, null);
  p.set(12, 9, null);
  p.set(12, 10, null);
  p.set(12, 11, null);
  p.vline(3, 3, 9, L.shirtShade);
  p.vline(12, 3, 9, L.shirtShade);
  p.set(3, 2, L.skin);
  p.set(12, 2, L.skin);
  drawHead(p, L, 'down', 1);
  return p.outline('ink');
}

function drawLie(L: Look): PixelCanvas {
  // postava leží (otočená o 90°) – pro omdlení / spícího štamgasta
  const base = drawCharFrame(L, 'side', 0);
  const p = new PixelCanvas(16, 16);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.set(15 - y, x, base.get(x, y));
  return p;
}

export function buildCharacterSheet(scene: Phaser.Scene, key: string, L: Look) {
  const frames: PixelCanvas[] = [];
  for (const d of ['down', 'up', 'side'] as Dir[]) for (let f = 0; f < 4; f++) frames.push(drawCharFrame(L, d, f));
  frames.push(drawSit(L));
  frames.push(drawCarry(L));
  frames.push(drawLie(L));
  addSheet(scene, key, frames);
  const mk = (name: string, start: number, rate = 8) => {
    if (scene.anims.exists(`${key}_${name}`)) scene.anims.remove(`${key}_${name}`);
    scene.anims.create({
      key: `${key}_${name}`,
      frames: [0, 1, 2, 3].map((i) => ({ key, frame: start + i })),
      frameRate: rate,
      repeat: -1,
    });
  };
  mk('down', FRAMES.down);
  mk('up', FRAMES.up);
  mk('side', FRAMES.side);
}

// ------------------------------------------------------------ varianty hostů
const SKINS: [PalKey, PalKey][] = [
  ['skin', 'ochre'],
  ['skin', 'tan'],
  ['ochre', 'copper'],
  ['tan', 'mauve'],
  ['mauve', 'maroon'],
];
const HAIRS: [PalKey, PalKey][] = [
  ['olive', 'ink'],
  ['ink', 'ink'],
  ['rust', 'blood'],
  ['fog', 'slate'],
  ['bone', 'fog'],
  ['sand', 'ochre'],
  ['dusk', 'ink'],
];
const SHIRTS: [PalKey, PalKey][] = [
  ['red', 'blood'],
  ['blue', 'indigo'],
  ['plum', 'dusk'],
  ['ochre', 'rust'],
  ['fog', 'slate'],
  ['sky', 'blue'],
  ['tan', 'ochre'],
  ['gold', 'amber'],
  ['mauve', 'maroon'],
  ['scarlet', 'red'],
  ['amber', 'rust'],
];
const PANTS: [PalKey, PalKey][] = [
  ['indigo', 'navy'],
  ['dusk', 'ink'],
  ['olive', 'ink'],
  ['slate', 'dusk'],
  ['navy', 'ink'],
];
const HATS: Look['hat'][] = [null, null, null, 'cap', 'hat', 'beanie', 'bald', 'bald'];
const HAT_COLORS: [PalKey, PalKey][] = [
  ['red', 'blood'],
  ['blue', 'indigo'],
  ['olive', 'ink'],
  ['slate', 'dusk'],
  ['gold', 'amber'],
];

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

export const GUEST_VARIANTS = 16;

export function guestLook(i: number): Look {
  let s = i * 9301 + 49297;
  const r = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const sk = pick(SKINS, r);
  const ha = pick(HAIRS, r);
  const sh = pick(SHIRTS, r);
  const pa = pick(PANTS, r);
  const hc = pick(HAT_COLORS, r);
  return {
    skin: sk[0], skinShade: sk[1], hair: ha[0], hairShade: ha[1],
    shirt: sh[0], shirtShade: sh[1], pants: pa[0], pantsShade: pa[1],
    shoes: r() < 0.5 ? 'ink' : 'olive',
    hat: pick(HATS, r), hatColor: hc[0], hatShade: hc[1],
    beard: pick(['none', 'none', 'mustache', 'mustache', 'full'] as const, r),
  };
}

export const LOOKS: Record<string, Look> = {
  player: {
    skin: 'skin', skinShade: 'ochre', hair: 'olive', hairShade: 'ink',
    shirt: 'white', shirtShade: 'bone', pants: 'dusk', pantsShade: 'ink', shoes: 'ink',
    hat: 'bald', beard: 'mustache', apron: true,
  },
  waiter: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink',
    shirt: 'white', shirtShade: 'bone', pants: 'ink', pantsShade: 'ink', shoes: 'ink',
    vest: 'ink', beard: 'none', hat: null,
  },
  // číšníci roznášející pivo (Franta = waiter, Jarka, Bořek, Vilma)
  waiterB: {
    skin: 'skin', skinShade: 'ochre', hair: 'rust', hairShade: 'blood',
    shirt: 'white', shirtShade: 'bone', pants: 'blood', pantsShade: 'ink', shoes: 'ink',
    vest: 'scarlet', longHair: true, lips: true, beard: 'none', hat: null,
  },
  waiterC: {
    skin: 'tan', skinShade: 'mauve', hair: 'olive', hairShade: 'ink',
    shirt: 'sage', shirtShade: 'pine', pants: 'dusk', pantsShade: 'ink', shoes: 'ink',
    apron: true, beard: 'full', hat: null,
  },
  waiterD: {
    skin: 'skin', skinShade: 'tan', hair: 'sand', hairShade: 'ochre',
    shirt: 'sky', shirtShade: 'blue', pants: 'ink', pantsShade: 'ink', shoes: 'ink',
    apron: true, longHair: true, beard: 'none', hat: 'cap', hatColor: 'scarlet', hatShade: 'red',
  },
  // číšníci u stanic (místo kostlivců): kuchyně, sklep, kostky
  staffK: {
    skin: 'skin', skinShade: 'ochre', hair: 'ink', hairShade: 'ink',
    shirt: 'white', shirtShade: 'bone', pants: 'ink', pantsShade: 'ink', shoes: 'ink',
    apron: true, beard: 'mustache', hat: 'beanie', hatColor: 'white', hatShade: 'bone',
  },
  staffC: {
    skin: 'tan', skinShade: 'mauve', hair: 'rust', hairShade: 'blood',
    shirt: 'white', shirtShade: 'bone', pants: 'olive', pantsShade: 'ink', shoes: 'ink',
    vest: 'olive', beard: 'full', hat: null,
  },
  staffD: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink',
    shirt: 'white', shirtShade: 'bone', pants: 'ink', pantsShade: 'ink', shoes: 'ink',
    vest: 'plum', longHair: true, lips: true, beard: 'none', hat: null,
  },
  cleaner: {
    skin: 'skin', skinShade: 'ochre', hair: 'fog', hairShade: 'slate',
    shirt: 'sky', shirtShade: 'blue', pants: 'sky', pantsShade: 'blue', shoes: 'bone',
    hat: 'beanie', hatColor: 'scarlet', hatShade: 'red', beard: 'none', coat: true,
  },
  cook: {
    skin: 'skin', skinShade: 'ochre', hair: 'rust', hairShade: 'blood',
    shirt: 'white', shirtShade: 'bone', pants: 'red', pantsShade: 'blood', shoes: 'ink',
    hat: 'beanie', hatColor: 'white', hatShade: 'bone', beard: 'none', apron: true, coat: true,
  },
  bouncer: {
    skin: 'tan', skinShade: 'mauve', hair: 'ink', hairShade: 'ink',
    shirt: 'ink', shirtShade: 'dusk', pants: 'ink', pantsShade: 'dusk', shoes: 'ink',
    hat: 'bald', beard: 'none',
  },
  inspector: {
    skin: 'skin', skinShade: 'tan', hair: 'slate', hairShade: 'dusk',
    shirt: 'white', shirtShade: 'fog', pants: 'fog', pantsShade: 'slate', shoes: 'ink',
    coat: true, hat: 'cap', hatColor: 'white', hatShade: 'fog', beard: 'none',
  },
  bailiff: {
    skin: 'skin', skinShade: 'ochre', hair: 'ink', hairShade: 'ink',
    shirt: 'slate', shirtShade: 'dusk', pants: 'dusk', pantsShade: 'ink', shoes: 'ink',
    coat: true, hat: 'hat', hatColor: 'ink', hatShade: 'dusk', beard: 'none',
  },
  stranger: {
    skin: 'fog', skinShade: 'slate', hair: 'ink', hairShade: 'ink',
    shirt: 'dusk', shirtShade: 'ink', pants: 'ink', pantsShade: 'ink', shoes: 'ink',
    coat: true, hat: 'hat', hatColor: 'ink', hatShade: 'ink', beard: 'none',
  },
  groom: {
    skin: 'skin', skinShade: 'ochre', hair: 'rust', hairShade: 'blood',
    shirt: 'ink', shirtShade: 'dusk', pants: 'ink', pantsShade: 'dusk', shoes: 'ink',
    vest: 'white', beard: 'none', hat: null,
  },
  tourist: {
    skin: 'skin', skinShade: 'skin', hair: 'sand', hairShade: 'ochre',
    shirt: 'mint', shirtShade: 'green', pants: 'tan', pantsShade: 'mauve', shoes: 'bone',
    hat: 'hat', hatColor: 'sand', hatShade: 'ochre', beard: 'none',
  },
  critic: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink',
    shirt: 'ink', shirtShade: 'dusk', pants: 'dusk', pantsShade: 'ink', shoes: 'red',
    hat: 'beanie', hatColor: 'red', hatShade: 'blood', beard: 'none', vest: 'white',
  },
  // elektrikář Jarda (modré montérky, čepice) – jde natáhnout světla do sklepa
  electrician: {
    skin: 'skin', skinShade: 'tan', hair: 'olive', hairShade: 'ink',
    shirt: 'blue', shirtShade: 'indigo', pants: 'blue', pantsShade: 'indigo', shoes: 'ink',
    hat: 'cap', hatColor: 'sky', hatShade: 'blue', beard: 'mustache',
  },
  // Žabákovi lidi na pouliční rvačku (zelené čepice)
  rivalThug: {
    skin: 'skin', skinShade: 'ochre', hair: 'ink', hairShade: 'ink',
    // zelená = Žabák (běžní hosté zelenou nenosí): zelená košile, mátová vesta, zelený kulich a plnovous
    shirt: 'green', shirtShade: 'pine', pants: 'ink', pantsShade: 'dusk', shoes: 'ink', hat: 'beanie', hatColor: 'green', hatShade: 'pine', beard: 'full', vest: 'mint',
  },
  // hororová hospoda: hosté z druhé strany
  zombie: {
    skin: 'sage', skinShade: 'pine', hair: 'olive', hairShade: 'ink',
    shirt: 'grave', shirtShade: 'coal', pants: 'slate', pantsShade: 'dusk', shoes: 'ink', hat: 'bald', beard: 'none',
  },
  // sklepní krčma: vlkodlak (srst, plnovous, roztrhaná košile) a krysí muž (šedý, vousky)
  werewolf: {
    skin: 'rust', skinShade: 'blood', hair: 'olive', hairShade: 'ink',
    shirt: 'indigo', shirtShade: 'navy', pants: 'olive', pantsShade: 'ink', shoes: 'rust', beard: 'full',
  },
  // banshee: bledá, dlouhé bílé vlasy, šedé šaty
  banshee: {
    skin: 'ice', skinShade: 'sky', hair: 'white', hairShade: 'fog',
    shirt: 'fog', shirtShade: 'slate', pants: 'fog', pantsShade: 'slate', shoes: 'slate', hat: null, beard: 'none', longHair: true, dress: 'fog', lips: true,
  },
  // žabí člověk (Žabákův podnik): zelený, velká tlama (vousy jako tmavý pruh), hnědé hadry
  frogman: {
    skin: 'green', skinShade: 'pine', hair: 'pine', hairShade: 'ink',
    shirt: 'olive', shirtShade: 'ink', pants: 'pine', pantsShade: 'ink', shoes: 'green', hat: 'bald', beard: 'mustache',
  },
  ratman: {
    skin: 'fog', skinShade: 'slate', hair: 'slate', hairShade: 'dusk',
    shirt: 'mauve', shirtShade: 'dusk', pants: 'dusk', pantsShade: 'ink', shoes: 'tan', hat: 'cap', hatColor: 'olive', hatShade: 'ink', beard: 'mustache',
  },
  skeleton: {
    skin: 'white', skinShade: 'fog', hair: 'white', hairShade: 'fog',
    shirt: 'bone', shirtShade: 'fog', pants: 'ink', pantsShade: 'coal', shoes: 'ink', hat: 'bald', beard: 'none',
  },
  vampire: {
    skin: 'bone', skinShade: 'fog', hair: 'ink', hairShade: 'ink',
    shirt: 'blood', shirtShade: 'maroon', pants: 'ink', pantsShade: 'coal', shoes: 'ink', coat: true,
  },
  ghost: {
    skin: 'ice', skinShade: 'sky', hair: 'white', hairShade: 'bone',
    shirt: 'bone', shirtShade: 'ice', pants: 'sky', pantsShade: 'blue', shoes: 'blue',
    hat: 'bald', beard: 'mustache', apron: true,
  },
  // Cizinec ve žlutém (Král ve žlutém, Chambers 1895): žlutá kápě se špičkou, pod ní místo obličeje tma, okrový plášť
  yellowKing: {
    skin: 'white', skinShade: 'bone', hair: 'ink', hairShade: 'ink', shirt: 'amber', shirtShade: 'copper', pants: 'copper', pantsShade: 'olive',
    shoes: 'olive', hat: 'hood', hatColor: 'gold', hatShade: 'amber', coat: true,
  },
  // duch bývalého hostinského Vacka: velký knír, modrá košile, světlá zástěra (odliší se od duchů-hostů)
  vacek: {
    skin: 'ice', skinShade: 'sky', hair: 'white', hairShade: 'fog',
    shirt: 'sky', shirtShade: 'blue', pants: 'sky', pantsShade: 'blue', shoes: 'blue',
    hat: 'bald', beard: 'handlebar', apron: true,
  },
  // hrabě: chce upíří víno z krypty (po napití se z něj stane upír)
  count: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink',
    shirt: 'ink', shirtShade: 'coal', pants: 'ink', pantsShade: 'coal', shoes: 'ink', vest: 'scarlet', coat: true, beard: 'mustache',
  },
  // kostlivec s kytarou na hřbitově (černý oblek se zlatou vestou, sombrero zvlášť)
  mariachi: {
    skin: 'white', skinShade: 'fog', hair: 'white', hairShade: 'fog',
    shirt: 'ink', shirtShade: 'coal', pants: 'ink', pantsShade: 'coal', shoes: 'ink', vest: 'gold', hat: 'bald', beard: 'none',
  },
  // duch hrobníka na hřbitově (kreslí se průhledně)
  digger: {
    skin: 'ice', skinShade: 'sky', hair: 'bone', hairShade: 'fog',
    shirt: 'indigo', shirtShade: 'navy', pants: 'navy', pantsShade: 'ink', shoes: 'ink', hat: 'hat', hatColor: 'navy', hatShade: 'ink', beard: 'full',
  },
  // Žabák v pyžamu a noční čepici (ulice před hospodou)
  zabak: {
    skin: 'skin', skinShade: 'tan', hair: 'olive', hairShade: 'ink',
    shirt: 'mint', shirtShade: 'green', pants: 'mint', pantsShade: 'green', shoes: 'sage', hat: 'beanie', hatColor: 'green', hatShade: 'pine', beard: 'mustache',
  },
  // strážník s čepicí a knírem
  policeman: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink',
    shirt: 'blue', shirtShade: 'navy', pants: 'navy', pantsShade: 'ink', shoes: 'ink', hat: 'cap', hatColor: 'navy', hatShade: 'ink', beard: 'mustache', coat: true,
  },
  // kuchař od Žabáka na kuchařskou soutěž
  rivalChef: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink',
    shirt: 'white', shirtShade: 'fog', pants: 'green', pantsShade: 'pine', shoes: 'ink', hat: 'cap', hatColor: 'mint', hatShade: 'green', beard: 'mustache', apron: true,
  },
  // pivní souboj: silák z vesnice
  challenger: {
    skin: 'skin', skinShade: 'tan', hair: 'rust', hairShade: 'maroon',
    shirt: 'red', shirtShade: 'blood', pants: 'olive', pantsShade: 'ink', shoes: 'ink', beard: 'full',
  },
  // páka: kovář „Chad“ – černé vlasy dozadu, černý vous, obří brada (podle pixelového Chada z Leonarda)
  wrestler: {
    skin: 'skin', skinShade: 'ochre', hair: 'coal', hairShade: 'ink',
    shirt: 'red', shirtShade: 'blood', pants: 'navy', pantsShade: 'ink', shoes: 'ink', hat: null, beard: 'full', chad: true,
  },
  // kapsář: nenápadný, šedý, čepice do čela
  pickpocket: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink',
    shirt: 'slate', shirtShade: 'dusk', pants: 'dusk', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'coal', hatShade: 'ink', coat: true,
  },
  // špekulant: kostkovaná košile, vyšisovaná čepice, knírek
  cheapskate: {
    skin: 'skin', skinShade: 'tan', hair: 'slate', hairShade: 'dusk',
    shirt: 'sand', shirtShade: 'ochre', pants: 'olive', pantsShade: 'ink', shoes: 'olive', hat: 'cap', hatColor: 'slate', hatShade: 'dusk', beard: 'mustache', vest: 'olive',
  },
  // paní, které utekl pes
  dogOwner: {
    skin: 'skin', skinShade: 'tan', hair: 'rust', hairShade: 'maroon',
    shirt: 'sky', shirtShade: 'blue', pants: 'navy', pantsShade: 'ink', shoes: 'red', hat: null, beard: 'none', longHair: true, lips: true,
  },
  // nevěsta na útěku
  bride: {
    skin: 'skin', skinShade: 'tan', hair: 'gold', hairShade: 'amber',
    shirt: 'white', shirtShade: 'bone', pants: 'white', pantsShade: 'bone', shoes: 'bone', coat: true,
  },
  // kontrolor z pivovaru
  brewer: {
    skin: 'skin', skinShade: 'tan', hair: 'slate', hairShade: 'dusk',
    shirt: 'bone', shirtShade: 'fog', pants: 'pine', pantsShade: 'ink', shoes: 'ink', hat: 'cap', hatColor: 'pine', hatShade: 'ink', apron: true,
  },
  mayor: {
    skin: 'skin', skinShade: 'tan', hair: 'fog', hairShade: 'slate',
    shirt: 'ink', shirtShade: 'dusk', pants: 'ink', pantsShade: 'dusk', shoes: 'ink',
    vest: 'red', hat: 'bald', beard: 'mustache', coat: true,
  },
  influencer: {
    skin: 'skin', skinShade: 'tan', hair: 'gold', hairShade: 'amber',
    shirt: 'plum', shirtShade: 'maroon', pants: 'white', pantsShade: 'bone', shoes: 'scarlet',
    hat: null, beard: 'none',
  },
  tycoon: {
    skin: 'skin', skinShade: 'ochre', hair: 'ink', hairShade: 'ink',
    shirt: 'white', shirtShade: 'fog', pants: 'ink', pantsShade: 'dusk', shoes: 'ink',
    vest: 'gold', hat: 'hat', hatColor: 'ink', hatShade: 'dusk', beard: 'full', coat: true,
  },
  // zrzavá štamgastka s brýlemi (sedává u výčepu sama a kouká)
  admirer: {
    skin: 'skin', skinShade: 'tan', hair: 'copper', hairShade: 'rust',
    shirt: 'plum', shirtShade: 'maroon', pants: 'maroon', pantsShade: 'blood', shoes: 'red',
    hat: null, beard: 'none', glasses: true, longHair: true, lips: true,
  },
  fan: {
    skin: 'skin', skinShade: 'ochre', hair: 'olive', hairShade: 'ink',
    shirt: 'scarlet', shirtShade: 'red', pants: 'indigo', pantsShade: 'navy', shoes: 'white',
    hat: 'beanie', hatColor: 'white', hatShade: 'scarlet', beard: 'mustache',
  },
  // fotbal v televizi: fanoušci dvou týmů v pruhovaných dresech (domácí červenobílí, hosté modrožlutí)
  fanA: {
    skin: 'skin', skinShade: 'ochre', hair: 'ink', hairShade: 'ink',
    shirt: 'scarlet', shirtShade: 'red', pants: 'navy', pantsShade: 'ink', shoes: 'white',
    hat: 'beanie', hatColor: 'white', hatShade: 'scarlet', beard: 'none', jersey: 'white',
  },
  fanA2: {
    skin: 'skin', skinShade: 'tan', hair: 'sand', hairShade: 'ochre',
    shirt: 'scarlet', shirtShade: 'red', pants: 'dusk', pantsShade: 'ink', shoes: 'ink',
    hat: 'cap', hatColor: 'red', hatShade: 'blood', beard: 'mustache', jersey: 'white',
  },
  fanB: {
    skin: 'skin', skinShade: 'ochre', hair: 'olive', hairShade: 'ink',
    shirt: 'blue', shirtShade: 'indigo', pants: 'slate', pantsShade: 'dusk', shoes: 'white',
    hat: 'beanie', hatColor: 'gold', hatShade: 'amber', beard: 'full', jersey: 'gold',
  },
  fanB2: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink',
    shirt: 'blue', shirtShade: 'indigo', pants: 'navy', pantsShade: 'ink', shoes: 'ink',
    hat: 'bald', beard: 'none', jersey: 'gold',
  },
  // finále: chapadloví hosté z hlubin (vousy = chapadla)
  deep0: {
    skin: 'mint', skinShade: 'green', hair: 'pine', hairShade: 'pine',
    shirt: 'navy', shirtShade: 'ink', pants: 'ink', pantsShade: 'ink', shoes: 'ink', hat: 'bald', beard: 'none',
  },
  deep1: {
    skin: 'sage', skinShade: 'grave', hair: 'green', hairShade: 'pine',
    shirt: 'grave', shirtShade: 'coal', pants: 'coal', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'pine', hatShade: 'ink', beard: 'full', coat: true,
  },
  deep2: {
    skin: 'ice', skinShade: 'sky', hair: 'blue', hairShade: 'indigo',
    shirt: 'indigo', shirtShade: 'navy', pants: 'navy', pantsShade: 'ink', shoes: 'ink', hat: 'bald', beard: 'none',
  },
  // kvízmistr pivního kvízu
  quizmaster: {
    skin: 'skin', skinShade: 'mauve', hair: 'fog', hairShade: 'slate',
    shirt: 'white', shirtShade: 'bone', pants: 'dusk', pantsShade: 'ink', shoes: 'ink', hat: 'bald', beard: 'mustache', vest: 'plum', glasses: true,
  },
  // mnich s tajným receptem
  monk: {
    skin: 'skin', skinShade: 'ochre', hair: 'olive', hairShade: 'ink',
    shirt: 'olive', shirtShade: 'ink', pants: 'olive', pantsShade: 'ink', shoes: 'rust', hat: 'bald', beard: 'full', coat: true,
  },
  // divný chlapík s klíči (prodá klíč od arény Sudokong): kulaté brýle, zelený kulich, fialová bunda se zlatou vestou
  keyGuy: {
    skin: 'skin', skinShade: 'tan', hair: 'rust', hairShade: 'olive',
    shirt: 'plum', shirtShade: 'dusk', pants: 'olive', pantsShade: 'ink', shoes: 'rust', vest: 'gold',
    hat: 'beanie', hatColor: 'mint', hatShade: 'green', glasses: true, beard: 'mustache', longHair: true,
  },
  // šílený mnich (Lovecraft): černá rozedraná kutna, bledý, rozcuchané bílé vlasy a vousy
  madMonk: {
    skin: 'bone', skinShade: 'fog', hair: 'white', hairShade: 'fog',
    shirt: 'dusk', shirtShade: 'ink', pants: 'dusk', pantsShade: 'ink', shoes: 'ink', beard: 'full', coat: true, longHair: true,
  },
  // vodník ze zatopených katakomb (zelený frak, cylindr, z šosu mu kape)
  vodnik: {
    skin: 'mint', skinShade: 'green', hair: 'green', hairShade: 'pine',
    shirt: 'green', shirtShade: 'pine', pants: 'olive', pantsShade: 'ink', shoes: 'ink', hat: 'hat', hatColor: 'pine', hatShade: 'ink', beard: 'mustache', vest: 'scarlet', coat: true,
  },
  // Den mrtvých: Mexičani, co unesou zaměstnance (sombrero je zvlášť, obj 'sombrero'); pončo = kabát
  bandito0: {
    skin: 'tan', skinShade: 'mauve', hair: 'ink', hairShade: 'ink',
    shirt: 'scarlet', shirtShade: 'red', pants: 'ink', pantsShade: 'dusk', shoes: 'olive', hat: 'bald', beard: 'mustache', vest: 'gold', coat: true,
  },
  bandito1: {
    skin: 'tan', skinShade: 'mauve', hair: 'ink', hairShade: 'ink',
    shirt: 'green', shirtShade: 'pine', pants: 'olive', pantsShade: 'ink', shoes: 'ink', hat: 'bald', beard: 'mustache', vest: 'sand', coat: true,
  },
  bandito2: {
    skin: 'tan', skinShade: 'mauve', hair: 'ink', hairShade: 'ink',
    shirt: 'amber', shirtShade: 'copper', pants: 'navy', pantsShade: 'ink', shoes: 'olive', hat: 'bald', beard: 'full', vest: 'scarlet', coat: true,
  },
  // Den mrtvých: mariachi v černém charro se zlatými knoflíky a černým sombrerem se zlatou krempou, zpěvačka catrina
  charro0: {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink', shirt: 'ink', shirtShade: 'coal', pants: 'ink', pantsShade: 'coal', shoes: 'ink',
    vest: 'gold', hat: 'sombrero', hatColor: 'ink', hatShade: 'gold', beard: 'mustache',
  },
  charro1: {
    skin: 'tan', skinShade: 'mauve', hair: 'ink', hairShade: 'ink', shirt: 'ink', shirtShade: 'coal', pants: 'ink', pantsShade: 'coal', shoes: 'ink',
    vest: 'gold', hat: 'sombrero', hatColor: 'ink', hatShade: 'gold', beard: 'full',
  },
  catrinaSinger: {
    skin: 'white', skinShade: 'fog', hair: 'ink', hairShade: 'ink', shirt: 'scarlet', shirtShade: 'red', pants: 'ink', pantsShade: 'ink', shoes: 'ink',
    longHair: true, catrina: true, dress: 'scarlet', beard: 'none', hat: null,
  },
  // kult v kápích (tajemní hosté)
  cultist0: {
    skin: 'skin', skinShade: 'mauve', hair: 'ink', hairShade: 'ink',
    shirt: 'plum', shirtShade: 'dusk', pants: 'dusk', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'plum', hatShade: 'dusk', coat: true,
  },
  cultist1: {
    skin: 'fog', skinShade: 'slate', hair: 'ink', hairShade: 'ink',
    shirt: 'maroon', shirtShade: 'blood', pants: 'blood', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'maroon', hatShade: 'blood', coat: true, beard: 'mustache',
  },
  // Dagonův kult (hosté u Žabáka): kápě v barvách hlubin
  cultist2: {
    skin: 'skin', skinShade: 'mauve', hair: 'ink', hairShade: 'ink',
    shirt: 'pine', shirtShade: 'grave', pants: 'grave', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'pine', hatShade: 'grave', coat: true,
  },
  cultist3: {
    skin: 'sage', skinShade: 'grave', hair: 'ink', hairShade: 'ink',
    shirt: 'green', shirtShade: 'pine', pants: 'pine', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'green', hatShade: 'pine', coat: true, beard: 'full',
  },
  cultist4: {
    skin: 'fog', skinShade: 'slate', hair: 'ink', hairShade: 'ink',
    shirt: 'navy', shirtShade: 'ink', pants: 'ink', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'navy', hatShade: 'ink', coat: true,
  },
  cultist5: {
    skin: 'skin', skinShade: 'mauve', hair: 'ink', hairShade: 'ink',
    shirt: 'slate', shirtShade: 'dusk', pants: 'dusk', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'slate', hatShade: 'dusk', coat: true, beard: 'mustache',
  },
};

/** Vzhled zaměstnance: oblečení podle role, obličej/vlasy podle jeho čísla vzhledu. */
export function employeeLook(role: string, lookIdx: number): Look {
  const base = guestLook(lookIdx);
  const outfit: Record<string, Partial<Look>> = {
    waiter: { shirt: 'white', shirtShade: 'bone', pants: 'ink', pantsShade: 'ink', vest: 'ink', apron: false },
    cook: { shirt: 'white', shirtShade: 'bone', pants: 'red', pantsShade: 'blood', apron: true, hat: 'beanie', hatColor: 'white', hatShade: 'bone' },
    brewer: { shirt: 'olive', shirtShade: 'ink', pants: 'rust', pantsShade: 'blood', apron: true },
    cleaner: { shirt: 'sky', shirtShade: 'blue', pants: 'sky', pantsShade: 'blue', coat: true },
    bouncer: { shirt: 'ink', shirtShade: 'dusk', pants: 'ink', pantsShade: 'dusk', hat: 'bald' },
    idle: {},
  };
  return { ...base, ...(outfit[role] ?? {}) };
}

// ------------------------------------------------------------ to ve sklepě
export function buildMonster(scene: Phaser.Scene) {
  const frames: PixelCanvas[] = [];
  for (let f = 0; f < 4; f++) {
    const p = new PixelCanvas(20, 28);
    // hlava
    p.ellipse(10, 6, 4.2, 4.5, 'ink');
    // tělo – zužující se nahoru, rozervané dole
    for (let y = 9; y < 26; y++) {
      const t = (y - 9) / 16;
      const half = 3 + t * 4.5 + Math.sin(y * 0.9 + f * 1.6) * 0.8;
      p.hline(Math.round(10 - half), Math.round(9 + half), y, 'ink');
    }
    // cáry dole
    for (let i = 0; i < 6; i++) {
      const x = 3 + i * 2.6 + ((f + i) % 2);
      const len = 1 + ((i * 7 + f * 3) % 3);
      p.vline(Math.round(x), 26, 25 + len, 'ink');
    }
    // dlouhé paže
    const sway = [0, 1, 0, -1][f];
    p.vline(3 + sway, 11, 21, 'ink');
    p.vline(16 - sway, 11, 21, 'ink');
    p.set(2 + sway, 22, 'ink');
    p.set(4 + sway, 22, 'ink');
    p.set(15 - sway, 22, 'ink');
    p.set(17 - sway, 22, 'ink');
    // jemný okraj (aby šel ve tmě rozeznat)
    const rim = new PixelCanvas(20, 28);
    rim.blit(p, 0, 0);
    rim.outline('navy');
    for (let y = 0; y < 28; y++)
      for (let x = 0; x < 20; x++) if (rim.get(x, y) === 'navy' && (x + y + f) % 3 === 0) p.set(x, y, 'indigo');
      else if (rim.get(x, y) === 'navy') p.set(x, y, 'navy');
    // vnitřní stín
    for (let y = 12; y < 24; y++) p.set(10 + Math.round(Math.sin(y + f)), y, 'dusk');
    // oči
    p.set(8, 6, 'white');
    p.set(12, 6, 'white');
    p.set(8, 7, 'ice');
    p.set(12, 7, 'ice');
    if (f === 2) {
      // mrknutí
      p.set(8, 6, 'ink');
      p.set(12, 6, 'ink');
      p.set(8, 7, 'ice');
      p.set(12, 7, 'ice');
    }
    frames.push(p);
  }
  addSheet(scene, 'monster', frames);
  scene.anims.create({
    key: 'monster_walk',
    frames: [0, 1, 2, 3].map((i) => ({ key: 'monster', frame: i })),
    frameRate: 6,
    repeat: -1,
  });
}
