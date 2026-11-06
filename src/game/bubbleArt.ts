// Bublina s objednávkou nad hostem (vlastní pro idle hru): zaoblená, světlá, se stínem a ocáskem vlevo dole.
// Vnitřek 14×12 px – ikona piva/jídla se do ní vejde v celé velikosti (ostrá, bez rozmazání).
import { PixelCanvas, addImage } from '../gfx/pixel';

function orderBubble(): PixelCanvas {
  const p = new PixelCanvas(20, 20);
  // tělo se zaoblenými rohy
  p.rect(2, 1, 16, 14, 'white');
  p.rect(1, 2, 18, 12, 'white');
  // jemný stín dole a vpravo
  p.hline(2, 17, 14, 'bone');
  p.vline(18, 3, 13, 'bone');
  p.hline(3, 16, 13, 'bone');
  // odlesk vlevo nahoře
  p.hline(3, 5, 2, 'sand');
  // ocásek k hlavě hosta
  p.rect(5, 15, 4, 1, 'white');
  p.rect(5, 16, 3, 1, 'bone');
  p.set(5, 17, 'bone');
  p.outline('ink');
  return p;
}

export function registerBubble(scene: Phaser.Scene) {
  if (!scene.textures.exists('orderBubble')) addImage(scene, 'orderBubble', orderBubble());
}
