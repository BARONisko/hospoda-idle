import Phaser from 'phaser';
import { renderRekoBackground } from '../gfx';
import type { RekoLook } from '../gfx/rekoTiles';
import type { PubView } from './PubView';

const T = 16;

/** Návrh vzhledu Pajzlu po ★1 Rekonstrukci (pro snímky návrhů): přemaluje pozadí, vymění stoly a židle a přidá kousky z úkolů. */
export function applyReko(s: Phaser.Scene, v: PubView, look: RekoLook, items = ['table', 'lamp', 'tap', 'kegs', 'coat', 'board', 'gloves']) {
  const x0 = v.ox - 40, x1 = v.ox + 36 * T;
  const imgs = s.children.list.filter((o): o is Phaser.GameObjects.Image => o instanceof Phaser.GameObjects.Image && o.x >= x0 && o.x <= x1);
  for (const o of imgs) {
    if (o.depth === -1000) o.setTexture(renderRekoBackground(s, 1, look));
    if (o.texture.key !== 'obj') continue;
    const f = o.frame.name;
    if (items.includes('table') && (f === 'table' || f === 'luxTable')) o.setFrame(`rk${look}_table`);
    if (items.includes('table') && (f === 'chairL' || f === 'chairR')) o.setFrame(`rk${look}_${f}`);
    if (items.includes('tap') && (f === 'tap' || f === 'luxTap') && o.x - v.ox < 4 * T) o.setFrame(`rk${look}_tap`);
  }
  const put = (frame: string, x: number, y: number, depth = y) => s.add.image(v.ox + x, y, 'obj', frame).setOrigin(0.5, 1).setDepth(depth);
  if (items.includes('lamp')) for (const x of [2.5, 5, 7.5]) put(`rk${look}_lamp`, x * T, 3 * T + 4, 6 * T);
  if (items.includes('kegs')) put(`rk${look}_kegs`, 6.6 * T, 4 * T + 13);
  if (items.includes('board')) put(`rk${look}_board`, 13 * T + 8, 2 * T + 13, -800);
  if (items.includes('gloves')) put('rkGloves', 13 * T + 8, 1 * T + 12, -800);
  if (items.includes('coat')) put(`rk${look}_coat`, 16 * T, 12 * T + 4);
}
