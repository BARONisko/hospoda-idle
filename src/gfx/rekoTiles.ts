import { PixelCanvas, hash } from './pixel';
import { PalKey } from '../data/palette';

// Pajzl po Rekonstrukci (★1 „Nový lak“): podlaha, zdi a dlažba za výčepem ve 3 návrzích.
// a = dub a mosaz (světlá omítka, tmavý dubový obklad, široká prkna)
// b = prvorepubliková pivnice (krémová omítka, zelené kachlíky, černobílá dlažba)
// c = roubenka (trámy, kamenná podlaha)
export type RekoLook = 'a' | 'b' | 'c';
const T = 16;

export function rekoFloor(p: PixelCanvas, tx: number, ty: number, look: RekoLook) {
  const ox = tx * T, oy = ty * T;
  if (look === 'a') {
    // široká dubová prkna (16 px na šířku, spáry s posunem), tmavší než dřív
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const gx = ox + x, gy = oy + y;
        const col = Math.floor(gx / 8);
        const shift = Math.floor(hash(col, 0, 31) * 32);
        const seamY = (gy + shift) % 32 === 0;
        const seamX = gx % 8 === 0;
        const tone = hash(col, Math.floor((gy + shift) / 32), 32);
        let c: PalKey = tone < 0.55 ? 'rust' : tone < 0.9 ? 'copper' : 'ochre';
        if (seamX || seamY) c = 'blood';
        else if (gx % 8 === 1) c = tone < 0.55 ? 'copper' : 'ochre';
        else if (hash(gx, gy, 33) < 0.05) c = 'rust';
        p.set(gx, gy, c);
      }
    return;
  }
  if (look === 'b') {
    // černobílá dlažba do šachovnice (8 px), drobné spáry
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const gx = ox + x, gy = oy + y;
        const dark = (Math.floor(gx / 8) + Math.floor(gy / 8)) % 2 === 0;
        let c: PalKey = dark ? 'dusk' : 'bone';
        if (gx % 8 === 7 || gy % 8 === 7) c = dark ? 'ink' : 'fog';
        else if (!dark && hash(gx, gy, 34) < 0.04) c = 'white';
        else if (dark && hash(gx, gy, 34) < 0.04) c = 'slate';
        p.set(gx, gy, c);
      }
    return;
  }
  // c: kamenné desky různé velikosti
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = ox + x, gy = oy + y;
      const row = Math.floor(gy / 10);
      const sh = Math.floor(hash(row, 1, 35) * 14);
      const w = 14;
      const col = Math.floor((gx + sh) / w);
      const tone = hash(col, row, 36);
      let c: PalKey = tone < 0.35 ? 'slate' : tone < 0.8 ? 'mauve' : 'tan';
      if (gy % 10 === 9 || (gx + sh) % w === 0) c = 'dusk';
      else if (gy % 10 === 0 || (gx + sh) % w === 1) c = tone < 0.35 ? 'mauve' : 'tan';
      else if (hash(gx, gy, 37) < 0.06) c = 'slate';
      p.set(gx, gy, c);
    }
}

export function rekoWall(p: PixelCanvas, tx: number, ty: number, upper: boolean, look: RekoLook) {
  const ox = tx * T, oy = ty * T;
  if (look === 'c') {
    // trámy roubenky: vodorovná kulatina 5 px, tmavé spáry s mazanicí
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const gy = oy + y, gx = ox + x;
        const r = (gy - T) % 6;
        let c: PalKey = r === 0 ? 'blood' : r === 1 ? 'ochre' : r === 5 ? 'rust' : 'copper';
        if (r === 0 && hash(gx, gy, 38) < 0.3) c = 'tan';
        else if (r > 1 && r < 5 && hash(gx, gy, 39) < 0.05) c = 'rust';
        p.set(gx, gy, c);
      }
    if (!upper) {
      p.hline(ox, ox + T - 1, oy + 14, 'olive');
      p.hline(ox, ox + T - 1, oy + 15, 'ink');
    } else p.hline(ox, ox + T - 1, oy, 'dusk');
    return;
  }
  if (upper) {
    // čistá omítka (a bílá, b krémová) s lištou
    const base: PalKey = look === 'a' ? 'bone' : 'sand';
    const spot: PalKey = look === 'a' ? 'fog' : 'ochre';
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const h = hash(ox + x, oy + y, 40);
        let c: PalKey = h < 0.05 ? spot : base;
        if (y < 2) c = y === 0 ? 'dusk' : spot;
        p.set(ox + x, oy + y, c);
      }
    p.hline(ox, ox + T - 1, oy + 14, look === 'a' ? 'gold' : 'pine');
    p.hline(ox, ox + T - 1, oy + 15, look === 'a' ? 'rust' : 'pine');
    return;
  }
  if (look === 'a') {
    // tmavý dubový kazetový obklad s mosaznou lištou
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const lx = (ox + x) % 16;
        let c: PalKey = 'blood';
        if (y >= 3 && y <= 11 && lx >= 2 && lx <= 13) c = lx === 2 || y === 3 ? 'rust' : lx === 13 || y === 11 ? 'maroon' : 'rust';
        if (y >= 4 && y <= 10 && lx >= 3 && lx <= 12) c = hash(ox + x, oy + y, 41) < 0.1 ? 'copper' : 'rust';
        p.set(ox + x, oy + y, c);
      }
    p.hline(ox, ox + T - 1, oy, 'gold');
    p.hline(ox, ox + T - 1, oy + 1, 'amber');
    p.hline(ox, ox + T - 1, oy + 14, 'olive');
    p.hline(ox, ox + T - 1, oy + 15, 'ink');
    return;
  }
  // b: zelené kachlíky 4×4
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = ox + x, gy = oy + y;
      let c: PalKey = hash(Math.floor(gx / 4), Math.floor(gy / 4), 42) < 0.25 ? 'sage' : 'green';
      if (gx % 4 === 3 || gy % 4 === 3) c = 'pine';
      else if (gx % 4 === 0 && gy % 4 === 0) c = 'mint';
      p.set(gx, gy, c);
    }
  p.hline(ox, ox + T - 1, oy, 'bone');
  p.hline(ox, ox + T - 1, oy + 1, 'pine');
  p.hline(ox, ox + T - 1, oy + 15, 'ink');
}

/** dlažba za výčepem */
export function rekoBar(p: PixelCanvas, tx: number, ty: number, look: RekoLook) {
  const ox = tx * T, oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = ox + x, gy = oy + y;
      let c: PalKey;
      if (look === 'a') {
        // cihlová dlažba do rybí kosti
        const k = (Math.floor(gx / 4) + Math.floor(gy / 8)) % 2;
        c = k ? 'red' : 'rust';
        if (gx % 4 === 0 || gy % 8 === 0) c = 'blood';
        else if (hash(gx, gy, 43) < 0.06) c = 'copper';
      } else if (look === 'b') {
        // drobná mozaika bílá s modrými kytičkami
        c = 'bone';
        if (gx % 4 === 3 || gy % 4 === 3) c = 'fog';
        if (gx % 8 === 1 && gy % 8 === 1) c = 'blue';
        if (gx % 8 === 5 && gy % 8 === 5) c = 'sky';
      } else {
        // prkna z hrubých fošen
        c = gy % 5 === 4 ? 'olive' : hash(Math.floor(gx / 20), Math.floor(gy / 5), 44) < 0.4 ? 'rust' : 'copper';
        if (c !== 'olive' && hash(gx, gy, 45) < 0.05) c = 'blood';
      }
      p.set(gx, gy, c);
    }
}
