import Phaser from 'phaser';
import { PAL, PalKey } from '../data/palette';

const RGB = Object.fromEntries(
  Object.entries(PAL).map(([k, v]) => [k, [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)]]),
) as Record<PalKey, number[]>;

/** Jednoduché „plátno“ z barev palety. Všechno kreslení jde přes tohle, takže nic mimo paletu. */
export class PixelCanvas {
  readonly data: (PalKey | null)[];
  constructor(readonly w: number, readonly h: number) {
    this.data = new Array(w * h).fill(null);
  }
  set(x: number, y: number, c: PalKey | null) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.data[y * this.w + x] = c;
  }
  get(x: number, y: number): PalKey | null {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.data[y * this.w + x];
  }
  rect(x: number, y: number, w: number, h: number, c: PalKey | null) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  hline(x1: number, x2: number, y: number, c: PalKey) {
    for (let x = x1; x <= x2; x++) this.set(x, y, c);
  }
  vline(x: number, y1: number, y2: number, c: PalKey) {
    for (let y = y1; y <= y2; y++) this.set(x, y, c);
  }
  /** Vyplněná elipsa podle středu a poloos. */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: PalKey) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
  }
  /** Přebarví neprázdné pixely v obdélníku (stínování). */
  recolor(x: number, y: number, w: number, h: number, c: PalKey) {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) if (this.get(x + i, y + j)) this.set(x + i, y + j, c);
  }
  /** Automatický obrys: každý průhledný pixel sousedící s neprůhledným dostane barvu. */
  outline(c: PalKey = 'ink', diagonal = false) {
    const add: number[] = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        const n =
          this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1) ||
          (diagonal && (this.get(x - 1, y - 1) || this.get(x + 1, y - 1) || this.get(x - 1, y + 1) || this.get(x + 1, y + 1)));
        if (n) add.push(y * this.w + x);
      }
    for (const i of add) this.data[i] = c;
    return this;
  }
  /** Vloží jiné plátno (průhlednost se nepřepisuje). */
  blit(src: PixelCanvas, ox: number, oy: number, flipX = false) {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const c = src.get(flipX ? src.w - 1 - x : x, y);
        if (c) this.set(ox + x, oy + y, c);
      }
  }
  /** Kreslení z textové šablony (viz CHARS). */
  template(rows: string[], ox = 0, oy = 0, map: Record<string, PalKey | null> = CHARS) {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        const c = map[ch];
        if (c !== undefined) this.set(ox + x, oy + y, c);
      }
    });
    return this;
  }
  flipped(): PixelCanvas {
    const p = new PixelCanvas(this.w, this.h);
    p.blit(this, 0, 0, true);
    return p;
  }
  paint(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const img = ctx.getImageData(ox, oy, this.w, this.h);
    const d = img.data;
    for (let i = 0; i < this.data.length; i++) {
      const c = this.data[i];
      if (!c) continue;
      const rgb = RGB[c];
      d[i * 4] = rgb[0];
      d[i * 4 + 1] = rgb[1];
      d[i * 4 + 2] = rgb[2];
      d[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, ox, oy);
  }
}

/** Znaky pro textové šablony → barvy palety. */
export const CHARS: Record<string, PalKey> = {
  k: 'ink', d: 'dusk', s: 'slate', m: 'mauve', t: 'tan', f: 'fog', b: 'bone', w: 'white',
  B: 'blood', r: 'red', R: 'scarlet', M: 'maroon',
  u: 'rust', c: 'copper', o: 'ochre', y: 'sand', a: 'amber', g: 'gold', O: 'olive',
  p: 'pine', G: 'green', n: 'mint', e: 'sage',
  C: 'coal', v: 'grave', N: 'navy', i: 'indigo', l: 'blue', L: 'sky', I: 'ice', P: 'plum',
  S: 'skin',
};

/** Deterministický hash pro variace dlaždic. */
export function hash(x: number, y: number, seed = 0): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

/** Zaregistruje sadu snímků (stejně velkých) jako texturu s číslovanými snímky. */
export function addSheet(scene: Phaser.Scene, key: string, frames: PixelCanvas[]) {
  const fw = frames[0].w;
  const fh = frames[0].h;
  const { c, ctx } = makeCanvas(fw * frames.length, fh);
  frames.forEach((f, i) => f.paint(ctx, i * fw, 0));
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.addCanvas(key, c)!;
  frames.forEach((_, i) => tex.add(i, 0, i * fw, 0, fw, fh));
  return tex;
}

/** Zaregistruje sadu pojmenovaných obrázků (různé velikosti) v jedné textuře. */
export function addAtlas(scene: Phaser.Scene, key: string, items: Record<string, PixelCanvas>) {
  const names = Object.keys(items);
  const pad = 1;
  // po řadách nejvýš MAX_W široké (jedna dlouhá řada přerostla maximální velikost textury a kreslila se černě)
  const MAX_W = 4096;
  let x = 0;
  let y = 0;
  let rowH = 0;
  let w = 1;
  const pos: Record<string, [number, number]> = {};
  for (const n of names) {
    if (x > 0 && x + items[n].w > MAX_W) { y += rowH + pad; x = 0; rowH = 0; }
    pos[n] = [x, y];
    x += items[n].w + pad;
    w = Math.max(w, x);
    rowH = Math.max(rowH, items[n].h);
  }
  const { c, ctx } = makeCanvas(w, Math.max(1, y + rowH));
  for (const n of names) items[n].paint(ctx, pos[n][0], pos[n][1]);
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.addCanvas(key, c)!;
  for (const n of names) tex.add(n, 0, pos[n][0], pos[n][1], items[n].w, items[n].h);
  return tex;
}

export function addImage(scene: Phaser.Scene, key: string, p: PixelCanvas) {
  const { c, ctx } = makeCanvas(p.w, p.h);
  p.paint(ctx, 0, 0);
  if (scene.textures.exists(key)) scene.textures.remove(key);
  return scene.textures.addCanvas(key, c)!;
}

/** Pro velká pozadí: kreslí rovnou do canvasu přes callback. */
export function addCanvasTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const { c, ctx } = makeCanvas(w, h);
  draw(ctx);
  if (scene.textures.exists(key)) scene.textures.remove(key);
  return scene.textures.addCanvas(key, c)!;
}
