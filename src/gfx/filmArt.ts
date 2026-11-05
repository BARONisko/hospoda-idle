import { PixelCanvas, hash } from './pixel';
import type { PalKey } from '../data/palette';

// Film o koupi hospody: ulice před hospodou U Zlatého sudu (320×180, ve scéně 4×). Fasáda je zanedbaná,
// okna nahoře zatlučená, v okně cedule NA PRODEJ (nápis dodá scéna – překládá se). Cedule s názvem nad
// dveřmi je zvlášť (`filmBoard`), visí na dvou hácích (FILM.hookL / hookR) a v půlce filmu spadne z jedné strany.

export type FilmMood = 'A' | 'B' | 'C';

export const FILM = {
  w: 320,
  h: 180,
  /** chodník (nohy postav) */
  walk: 147,
  door: { x: 160, y: 140 },
  hookL: { x: 112, y: 88 },
  hookR: { x: 208, y: 88 },
  board: { w: 100, h: 16 },
  /** cedule NA PRODEJ v levém okně (střed) */
  sale: { x: 101, y: 121 },
};

const SKY: Record<FilmMood, PalKey[]> = {
  A: ['sky', 'sky', 'ice', 'ice'],
  B: ['indigo', 'plum', 'maroon', 'copper', 'ochre'],
  C: ['slate', 'slate', 'fog', 'fog'],
};

function sky(p: PixelCanvas, m: FilmMood) {
  const ramp = SKY[m];
  const H = 60;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < FILM.w; x++) {
      const v = (y / H) * (ramp.length - 1);
      const i = Math.floor(v);
      const f = v - i;
      const c = f * 16 > BAYER[(y % 4) * 4 + (x % 4)] ? ramp[Math.min(ramp.length - 1, i + 1)] : ramp[i];
      p.set(x, y, c);
    }
  if (m === 'A') {
    for (const [cx, cy, w] of [[40, 14, 22], [250, 10, 30], [150, 6, 16]] as const) {
      p.ellipse(cx, cy, w / 2, 3.5, 'white');
      p.ellipse(cx - w / 4, cy - 2, w / 4, 3, 'white');
      p.hline(cx - w / 2 + 2, cx + w / 2 - 2, cy + 3, 'ice');
    }
    p.ellipse(290, 30, 6, 6, 'gold');
    p.ellipse(289, 29, 4, 4, 'sand');
  } else if (m === 'B') {
    p.ellipse(40, 46, 9, 9, 'gold');
    p.ellipse(40, 46, 7, 7, 'sand');
    for (let i = 0; i < 14; i++) p.set(hash(i, 1, 4) * 320, hash(i, 2, 4) * 18, 'bone');
  } else {
    for (const [cx, cy, w] of [[60, 12, 70], [200, 8, 90], [300, 18, 50]] as const) {
      p.ellipse(cx, cy, w / 2, 7, 'slate');
      p.ellipse(cx + 6, cy + 3, w / 2.4, 5, 'dusk');
    }
  }
}

function bricks(p: PixelCanvas, x0: number, y0: number, w: number, h: number, a: PalKey, b: PalKey, mortar: PalKey, seed: number) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const row = Math.floor((y - y0) / 4);
      const off = row % 2 ? 4 : 0;
      const m = (y - y0) % 4 === 3 || (x - x0 + off) % 8 === 7;
      p.set(x, y, m ? mortar : hash(Math.floor((x - x0 + off) / 8), row, seed) > 0.72 ? b : a);
    }
}

function win(p: PixelCanvas, x: number, y: number, w: number, h: number, lit: boolean, boarded = false) {
  p.rect(x - 1, y - 1, w + 2, h + 2, 'ink');
  p.rect(x, y, w, h, lit ? 'sand' : 'navy');
  if (lit) p.rect(x, y + h - 2, w, 2, 'amber');
  else p.set(x + 1, y + 1, 'indigo');
  p.vline(x + Math.floor(w / 2), y, y + h - 1, 'ink');
  p.hline(x - 2, x + w + 1, y + h + 1, 'fog');
  if (boarded) {
    // dvě prkna křížem
    for (let i = 0; i < w + 2; i++) {
      const yy = Math.round(y + (i / (w + 1)) * (h - 1));
      p.set(x - 1 + i, yy, 'tan');
      p.set(x - 1 + i, yy + 1, 'mauve');
      const y2 = Math.round(y + h - 1 - (i / (w + 1)) * (h - 1));
      p.set(x - 1 + i, y2, 'tan');
    }
  }
}

function neighbour(p: PixelCanvas, x: number, w: number, top: number, wall: PalKey, trim: PalKey, lit: boolean) {
  for (let i = 0; i < 7; i++) p.hline(x + 6 - i, x + w - 7 + i, top + i, i % 3 === 0 ? 'ink' : 'dusk');
  p.rect(x, top + 7, w, FILM.walk - 6 - top - 7, wall);
  p.hline(x, x + w - 1, top + 7, trim);
  p.vline(x, top + 7, FILM.walk - 7, 'ink');
  p.vline(x + w - 1, top + 7, FILM.walk - 7, 'ink');
  for (let fy = top + 16; fy < FILM.walk - 30; fy += 24)
    for (let fx = x + 8; fx < x + w - 12; fx += 18) win(p, fx, fy, 8, 11, lit && hash(fx, fy, 3) > 0.4);
}

/** Ulice s fasádou hospody (bez cedule s názvem). */
export function drawFilmStreet(m: FilmMood): PixelCanvas {
  const p = new PixelCanvas(FILM.w, FILM.h);
  sky(p, m);
  const lit = m === 'B';
  neighbour(p, -4, 64, 30, m === 'C' ? 'slate' : 'tan', 'mauve', lit);
  neighbour(p, 262, 62, 24, m === 'C' ? 'grave' : 'sage', 'mint', lit);
  // hospoda: střecha s taškami, vikýř
  const X0 = 66;
  const X1 = 254;
  for (let i = 0; i < 18; i++) {
    const y = 26 + i;
    p.hline(X0 - 4 + Math.max(0, 14 - i), X1 + 4 - Math.max(0, 14 - i), y, i % 3 === 2 ? 'blood' : hash(i, 0, 1) > 0.5 ? 'red' : 'rust');
  }
  for (let x = X0 + 14; x < X1 - 10; x += 6) p.vline(x, 26, 43, 'blood');
  p.hline(X0 - 4, X1 + 4, 44, 'ink');
  // díra ve střeše (chybí tašky)
  p.rect(196, 31, 7, 4, 'ink');
  p.rect(197, 32, 5, 2, 'dusk');
  // komín
  p.rect(92, 14, 9, 14, 'maroon');
  p.hline(91, 101, 14, 'ink');
  p.rect(93, 16, 2, 10, 'rust');
  // zeď
  bricks(p, X0, 45, X1 - X0, FILM.walk - 6 - 45, m === 'C' ? 'rust' : 'copper', m === 'C' ? 'maroon' : 'rust', 'olive', 11);
  // opadaná omítka (fleky)
  for (const [fx, fy, r] of [[84, 70, 6], [230, 60, 5], [180, 128, 4]] as const) p.ellipse(fx, fy, r, r * 0.7, 'mauve');
  p.vline(X0, 45, FILM.walk - 7, 'ink');
  p.vline(X1 - 1, 45, FILM.walk - 7, 'ink');
  // římsa mezi patry
  p.rect(X0, 84, X1 - X0, 3, 'tan');
  p.hline(X0, X1 - 1, 87, 'ink');
  // okna nahoře, zatlučená
  for (const x of [84, 124, 188, 228]) win(p, x, 54, 12, 16, false, x !== 124);
  // okna dole a dveře
  win(p, 84, 108, 34, 24, lit);
  win(p, 202, 108, 34, 24, lit);
  // dveře (oblouk)
  const dx = FILM.door.x;
  p.rect(dx - 10, 104, 20, FILM.door.y - 104, 'ink');
  p.ellipse(dx, 105, 10, 6, 'ink');
  p.rect(dx - 8, 106, 16, FILM.door.y - 106, 'olive');
  p.ellipse(dx, 106, 8, 4.5, 'olive');
  p.vline(dx, 104, FILM.door.y - 1, 'ink');
  for (const yy of [114, 126]) p.hline(dx - 8, dx + 7, yy, 'rust');
  p.set(dx + 3, 122, 'gold');
  p.set(dx - 4, 122, 'gold');
  p.rect(dx - 12, FILM.door.y, 24, 2, 'fog'); // schod
  // háky na ceduli
  for (const h of [FILM.hookL, FILM.hookR]) {
    p.rect(h.x - 1, h.y - 2, 3, 3, 'coal');
    p.set(h.x, h.y + 1, 'fog');
  }
  // lucerna u dveří
  p.rect(dx + 14, 100, 5, 7, 'ink');
  p.rect(dx + 15, 101, 3, 5, lit ? 'sand' : 'slate');
  // pavučina, plevel u zdi
  for (let i = 0; i < 6; i++) p.set(X0 + 1 + i, 46 + i, 'bone');
  for (const x of [70, 76, 130, 186, 244, 250]) {
    p.vline(x, FILM.walk - 9, FILM.walk - 7, 'green');
    p.set(x - 1, FILM.walk - 8, 'sage');
  }
  // chodník
  for (let x = 0; x < FILM.w; x++)
    for (let y = FILM.walk - 6; y < FILM.walk + 6; y++) p.set(x, y, x % 14 === 0 || y === FILM.walk ? 'mauve' : hash(x >> 2, y >> 2, 9) > 0.8 ? 'fog' : 'tan');
  p.hline(0, FILM.w - 1, FILM.walk - 6, 'ink');
  p.rect(0, FILM.walk + 6, FILM.w, 2, 'fog');
  p.hline(0, FILM.w - 1, FILM.walk + 8, 'ink');
  // dlažba
  for (let y = FILM.walk + 9; y < FILM.h; y++)
    for (let x = 0; x < FILM.w; x++) {
      const row = Math.floor(y / 5);
      const off = (row % 2) * 4;
      const edge = y % 5 === 4 || (x + off) % 8 === 7;
      p.set(x, y, edge ? 'ink' : hash((x + off) >> 3, row, 5) > 0.6 ? 'slate' : 'dusk');
    }
  if (m === 'C') {
    for (const [cx, cy, rx] of [[60, 168, 14], [230, 172, 18], [150, 150, 10]] as const) {
      p.ellipse(cx, cy, rx, 2.5, 'indigo');
      p.hline(cx - rx + 3, cx - rx + 7, cy - 1, 'ice');
    }
  }
  // sud a bedna u dveří, plynová lampa
  p.rect(130, FILM.walk - 18, 11, 13, 'rust');
  p.rect(131, FILM.walk - 18, 9, 13, 'copper');
  p.hline(130, 140, FILM.walk - 15, 'coal');
  p.hline(130, 140, FILM.walk - 9, 'coal');
  p.vline(42, 70, FILM.walk - 4, 'coal');
  p.rect(39, 62, 7, 8, 'ink');
  p.rect(40, 63, 5, 6, lit ? 'sand' : 'fog');
  return p.outline('ink');
}

/** Cedule s názvem (nápis dodá scéna). */
export function drawFilmBoard(): PixelCanvas {
  const { w, h } = FILM.board;
  const p = new PixelCanvas(w, h);
  p.rect(0, 0, w, h, 'ink');
  p.rect(1, 1, w - 2, h - 2, 'gold');
  p.rect(2, 2, w - 4, h - 4, 'olive');
  p.hline(2, w - 3, 2, 'rust');
  for (let x = 6; x < w - 6; x += 9) p.set(x, h - 4, 'rust');
  // půllitry na koncích
  for (const cx of [6, w - 9]) {
    p.rect(cx, 5, 3, 6, 'sand');
    p.rect(cx, 5, 3, 2, 'white');
    p.vline(cx + 3, 7, 9, 'sand');
  }
  return p;
}

/** Cedule NA PRODEJ (nápis dodá scéna). */
export function drawFilmSale(): PixelCanvas {
  const p = new PixelCanvas(26, 12);
  p.rect(0, 0, 26, 12, 'ink');
  p.rect(1, 1, 24, 10, 'white');
  p.rect(1, 1, 24, 2, 'scarlet');
  p.rect(1, 9, 24, 2, 'scarlet');
  return p;
}
