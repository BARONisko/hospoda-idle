import Phaser from 'phaser';
import { PixelCanvas, addSheet } from './pixel';
import { buildCharacterSheet, Look } from './characters';
import { PalKey } from '../data/palette';

// Nepřátelé ve sklepě + boss Sudomor. Všechny kreslené z palety, s automatickým obrysem.

function rat(f: number): PixelCanvas {
  const p = new PixelCanvas(16, 11);
  const leg = f === 0;
  // ocas
  p.hline(0, 3, 6 + (f ? 1 : 0), 'mauve');
  p.set(0, 5 + (f ? 2 : 0), 'mauve');
  // tělo
  p.ellipse(8, 6, 5, 3.3, 'slate');
  p.ellipse(7.5, 5, 3.6, 2, 'fog');
  p.hline(4, 11, 8, 'dusk');
  // hlava
  p.ellipse(12.5, 6, 2.6, 2.2, 'slate');
  p.set(15, 6, 'mauve');
  p.set(13, 5, 'scarlet');
  p.set(11, 3, 'mauve');
  p.set(12, 3, 'fog');
  // nohy
  p.set(leg ? 6 : 5, 9, 'dusk');
  p.set(leg ? 10 : 11, 9, 'dusk');
  return p.outline('ink');
}

function bat(f: number): PixelCanvas {
  const p = new PixelCanvas(18, 12);
  p.ellipse(9, 6, 2.6, 3, 'dusk');
  p.set(8, 5, 'scarlet');
  p.set(10, 5, 'scarlet');
  p.set(8, 2, 'dusk');
  p.set(10, 2, 'dusk');
  if (f === 0) {
    for (let i = 0; i < 6; i++) {
      p.vline(6 - i, 3 + Math.floor(i / 2), 6 - (i % 2), 'plum');
      p.vline(12 + i, 3 + Math.floor(i / 2), 6 - (i % 2), 'plum');
    }
  } else {
    for (let i = 0; i < 6; i++) {
      p.vline(6 - i, 6, 8 + (i % 2), 'plum');
      p.vline(12 + i, 6, 8 + (i % 2), 'plum');
    }
  }
  return p.outline('ink');
}

function spider(f: number): PixelCanvas {
  const p = new PixelCanvas(18, 13);
  // nohy
  const o = f ? 1 : 0;
  for (let i = 0; i < 4; i++) {
    const y = 4 + i * 2;
    const k = (i + o) % 2;
    p.hline(1, 5, y + k, 'ink');
    p.hline(12, 16, y + 1 - k, 'ink');
    p.set(1, y + k + 1, 'ink');
    p.set(16, y + 2 - k, 'ink');
  }
  p.ellipse(9, 6, 4, 3.5, 'plum');
  p.ellipse(9, 5, 2.4, 1.6, 'dusk');
  p.ellipse(9, 10, 2.6, 2, 'plum');
  p.set(7, 9, 'scarlet');
  p.set(8, 10, 'scarlet');
  p.set(10, 10, 'scarlet');
  p.set(11, 9, 'scarlet');
  p.set(8, 4, 'mauve');
  return p.outline('dusk');
}

function boss(f: number): PixelCanvas {
  // Sudomor: živý sud s obličejem a nožkama
  const p = new PixelCanvas(40, 42);
  const bob = f % 2;
  const charge = f >= 2;
  const yo = bob;
  // nohy
  p.rect(10, 36, 5, 5, 'blood');
  p.rect(25, 36, 5, 5, 'blood');
  p.rect(8 + (bob ? 1 : 0), 40, 8, 2, 'ink');
  p.rect(24 - (bob ? 1 : 0), 40, 8, 2, 'ink');
  // tělo sudu
  p.ellipse(20, 21 + yo, 17, 17, 'rust');
  p.rect(5, 10 + yo, 30, 24, 'rust');
  for (let x = 8; x < 34; x += 5) p.vline(x, 6 + yo, 36 + yo, 'blood');
  p.vline(9, 8 + yo, 34 + yo, 'copper');
  p.ellipse(20, 6 + yo, 13, 4, 'ochre');
  p.ellipse(20, 6 + yo, 10, 2.5, 'copper');
  p.set(20, 6 + yo, 'ink');
  // obruče
  for (const hy of [11, 30]) {
    p.hline(3, 36, hy + yo, 'slate');
    p.hline(3, 36, hy + 1 + yo, 'dusk');
    p.set(6, hy + yo, 'fog');
  }
  // obličej
  const eye: PalKey = charge ? 'gold' : 'scarlet';
  p.rect(11, 16 + yo, 6, 4, 'ink');
  p.rect(23, 16 + yo, 6, 4, 'ink');
  p.rect(13, 17 + yo, 2, 2, eye);
  p.rect(25, 17 + yo, 2, 2, eye);
  p.hline(10, 17, 14 + yo, 'ink'); // zamračené obočí
  p.hline(23, 30, 14 + yo, 'ink');
  p.set(17, 15 + yo, 'ink');
  p.set(23, 15 + yo, 'ink');
  // tlama
  p.rect(12, 23 + yo, 16, 5 + (charge ? 2 : 0), 'ink');
  for (let x = 13; x < 27; x += 3) {
    p.set(x, 23 + yo, 'bone');
    p.set(x + 1, 27 + yo + (charge ? 2 : 0), 'bone');
  }
  p.hline(13, 26, 25 + yo, 'amber'); // pivo v hubě
  // ručičky
  p.rect(0, 18 + yo - (charge ? 4 : 0), 4, 3, 'copper');
  p.rect(36, 18 + yo - (charge ? 4 : 0), 4, 3, 'copper');
  return p.outline('ink');
}

export const ZOMBIE_LOOK: Look = {
  skin: 'sage', skinShade: 'grave', hair: 'olive', hairShade: 'ink', shirt: 'tan', shirtShade: 'mauve',
  pants: 'grave', pantsShade: 'ink', shoes: 'ink', hat: 'cap', hatColor: 'olive', hatShade: 'ink', beard: 'mustache',
};
export const DROWNER_LOOK: Look = {
  skin: 'mint', skinShade: 'green', hair: 'pine', hairShade: 'ink', shirt: 'sky', shirtShade: 'blue',
  pants: 'blue', pantsShade: 'indigo', shoes: 'pine', hat: 'hat', hatColor: 'pine', hatShade: 'ink', beard: 'full', coat: true,
};

// probouzející se sklep (krígly): bývalí výčepní ze starých hospod a stíny jejich štamgastů
export const TAPSTER_LOOK: Look = {
  skin: 'sage', skinShade: 'grave', hair: 'ink', hairShade: 'ink', shirt: 'bone', shirtShade: 'fog',
  pants: 'ink', pantsShade: 'coal', shoes: 'ink', hat: 'bald', beard: 'mustache', apron: true,
};
/** Bossové témat (humanoidní, aby mohli přijít i do hospody jako hosté). */
export const BOSS_LOOKS: Record<string, Look> = {
  ratking: {
    skin: 'fog', skinShade: 'slate', hair: 'slate', hairShade: 'dusk', shirt: 'plum', shirtShade: 'dusk',
    pants: 'dusk', pantsShade: 'ink', shoes: 'ink', hat: null, beard: 'full', coat: true,
  },
  frostbrewer: {
    skin: 'ice', skinShade: 'sky', hair: 'white', hairShade: 'bone', shirt: 'blue', shirtShade: 'indigo',
    pants: 'navy', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'white', hatShade: 'bone', beard: 'full', apron: true,
  },
  captain: {
    skin: 'sage', skinShade: 'grave', hair: 'ink', hairShade: 'ink', shirt: 'navy', shirtShade: 'ink',
    pants: 'olive', pantsShade: 'ink', shoes: 'ink', hat: 'hat', hatColor: 'ink', hatShade: 'coal', beard: 'handlebar', coat: true,
  },
};
export const SHADE_LOOK: Look = {
  skin: 'slate', skinShade: 'dusk', hair: 'ink', hairShade: 'ink', shirt: 'dusk', shirtShade: 'ink',
  pants: 'ink', pantsShade: 'ink', shoes: 'ink', hat: 'cap', hatColor: 'dusk', hatShade: 'ink', beard: 'full',
};

export function buildCreatures(scene: Phaser.Scene) {
  const sheet = (key: string, frames: PixelCanvas[], rate: number) => {
    addSheet(scene, key, frames);
    if (scene.anims.exists(`${key}_walk`)) scene.anims.remove(`${key}_walk`);
    scene.anims.create({ key: `${key}_walk`, frames: frames.map((_, i) => ({ key, frame: i })), frameRate: rate, repeat: -1 });
  };
  sheet('rat', [rat(0), rat(1)], 10);
  sheet('bat', [bat(0), bat(1)], 12);
  sheet('spider', [spider(0), spider(1)], 8);
  addSheet(scene, 'boss', [boss(0), boss(1), boss(2), boss(3)]);
  scene.anims.create({ key: 'boss_walk', frames: [0, 1].map((i) => ({ key: 'boss', frame: i })), frameRate: 4, repeat: -1 });
  scene.anims.create({ key: 'boss_charge', frames: [2, 3].map((i) => ({ key: 'boss', frame: i })), frameRate: 10, repeat: -1 });
  buildCharacterSheet(scene, 'zombie', ZOMBIE_LOOK);
  buildCharacterSheet(scene, 'drowner', DROWNER_LOOK);
  buildCharacterSheet(scene, 'tapster', TAPSTER_LOOK);
  for (const [k, look] of Object.entries(BOSS_LOOKS)) buildCharacterSheet(scene, k, look);
  buildCharacterSheet(scene, 'shade', SHADE_LOOK);
}
