import { PixelCanvas, hash } from './pixel';
import { PUB_MAP, PUB } from '../data/maps';
import { PalKey } from '../data/palette';
import { DecorGrid, cellarLook, decorateCellar, lookBrickColors, lookFloorColors } from './cellarDecor';
import { drawStairs, stairsMat } from './stairsArt';

const T = 16;

// ============================================================ HOSPODA
function woodFloor(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  for (let row = 0; row < 4; row++) {
    const py = oy + row * 4;
    const gy = ty * 4 + row; // globální řada prken
    // spáry prken: posun podle řady
    const shift = Math.floor(hash(0, gy, 7) * 24);
    for (let x = 0; x < T; x++) {
      const gx = ox + x;
      const plank = Math.floor((gx + shift) / 24);
      const lx = (gx + shift) % 24;
      const light = hash(plank, gy, 3) < 0.18;
      const base: PalKey = light ? 'copper' : 'rust';
      const hi: PalKey = light ? 'ochre' : 'copper';
      const seam = lx === 0;
      // jemná kresba dřeva: světlá linka jen v části prkna
      const grain = lx > 3 && lx < 3 + Math.floor(hash(plank, gy, 5) * 14);
      p.set(gx, py, seam ? 'blood' : grain ? hi : base);
      p.set(gx, py + 1, seam ? 'blood' : base);
      p.set(gx, py + 2, seam ? 'blood' : lx > 14 && lx < 19 && hash(plank, gy, 6) < 0.3 ? 'blood' : base);
      p.set(gx, py + 3, 'blood');
      // suk ve dřevě
      if (hash(plank, gy, 9) < 0.08 && (gx + shift) % 24 === 12) {
        p.set(gx, py + 1, 'blood');
        p.set(gx + 1, py + 1, 'maroon');
      }
    }
    // hřebíky
    for (let x = 0; x < T; x++) {
      const gx = ox + x;
      if ((gx + shift) % 24 === 2) p.set(gx, py + 1, 'maroon');
    }
  }
}

function barTiles(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const cx = Math.floor((ox + x) / 8);
      const cy = Math.floor((oy + y) / 8);
      const dark = (cx + cy) % 2 === 0;
      let c: PalKey = dark ? 'mauve' : 'tan';
      if ((ox + x) % 8 === 0 || (oy + y) % 8 === 0) c = dark ? 'maroon' : 'mauve';
      else if ((ox + x) % 8 === 1 && (oy + y) % 8 === 1) c = dark ? 'tan' : 'bone';
      p.set(ox + x, oy + y, c);
    }
}

function wallTop(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  p.rect(ox, oy, T, T, 'ink');
  for (let x = 0; x < T; x++) if (hash(ox + x, oy, 4) < 0.25) p.set(ox + x, oy + 3 + Math.floor(hash(ox + x, oy, 5) * 10), 'dusk');
}

function wallFace(p: PixelCanvas, tx: number, ty: number, upper: boolean) {
  const ox = tx * T;
  const oy = ty * T;
  if (upper) {
    // zakouřená omítka
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const h = hash(ox + x, oy + y, 11);
        let c: PalKey = 'tan';
        if (h < 0.1) c = 'mauve';
        else if (h > 0.97) c = 'bone';
        if (y < 2) c = y === 0 ? 'dusk' : 'mauve';
        p.set(ox + x, oy + y, c);
      }
    // skvrny od kouře
    if (hash(tx, ty, 12) < 0.4) {
      const sx = ox + 3 + Math.floor(hash(tx, ty, 13) * 8);
      p.ellipse(sx, oy + 5, 3, 2, 'mauve');
    }
    // lišta
    p.hline(ox, ox + T - 1, oy + 14, 'copper');
    p.hline(ox, ox + T - 1, oy + 15, 'rust');
  } else {
    // dřevěný obklad
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        let c: PalKey = 'rust';
        const px = (ox + x) % 8;
        if (px === 0) c = 'blood';
        else if (px === 1) c = 'copper';
        else if (hash(ox + x, oy + y, 14) < 0.06) c = 'maroon';
        p.set(ox + x, oy + y, c);
      }
    p.hline(ox, ox + T - 1, oy, 'ochre');
    p.hline(ox, ox + T - 1, oy + 1, 'copper');
    p.hline(ox, ox + T - 1, oy + 13, 'blood');
    p.hline(ox, ox + T - 1, oy + 14, 'olive');
    p.hline(ox, ox + T - 1, oy + 15, 'ink');
  }
}

function counter(p: PixelCanvas, tx: number, ty: number, leftEnd: boolean, rightEnd: boolean) {
  const ox = tx * T;
  const oy = ty * T;
  // deska pultu
  for (let y = 0; y < 9; y++)
    for (let x = 0; x < T; x++) {
      let c: PalKey = 'copper';
      if (y === 0) c = 'ink';
      else if (y === 1) c = 'sand';
      else if (y === 2) c = 'ochre';
      else if (y === 8) c = 'rust';
      else if (hash(ox + x, y, 21) < 0.15) c = 'ochre';
      p.set(ox + x, oy + y, c);
    }
  // čelo pultu
  for (let y = 9; y < T; y++)
    for (let x = 0; x < T; x++) {
      let c: PalKey = 'rust';
      const px = (ox + x) % 8;
      if (y === 9) c = 'blood';
      else if (px === 0) c = 'blood';
      else if (px === 1) c = 'copper';
      if (y >= 14) c = 'ink';
      p.set(ox + x, oy + y, c);
    }
  // měděná trubka na čele
  p.hline(ox, ox + T - 1, oy + 11, 'gold');
  p.hline(ox, ox + T - 1, oy + 12, 'amber');
  if (leftEnd) p.vline(ox, oy, oy + T - 1, 'ink');
  if (rightEnd) p.vline(ox + T - 1, oy, oy + T - 1, 'ink');
}

function partition(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  // zeď jako ostatní boční zdi; uprostřed zabedněný průchod
  p.rect(ox, oy, T, T, 'ink');
  const door = ty === 7 || ty === 8;
  if (door) {
    p.rect(ox + 2, oy, 12, T, 'olive');
    for (const by of ty === 7 ? [3, 10] : [5]) {
      const y0 = oy + by;
      for (let x = 0; x < T; x++) {
        const yy = y0 + Math.floor((x * (ty === 7 ? 1 : -1)) / 6);
        p.set(ox + x, yy, 'ink');
        p.set(ox + x, yy + 1, 'ochre');
        p.set(ox + x, yy + 2, 'copper');
        p.set(ox + x, yy + 3, 'rust');
        p.set(ox + x, yy + 4, 'ink');
      }
      p.set(ox + 2, y0 + 2, 'fog');
      p.set(ox + 13, y0 + 2, 'fog');
    }
  } else {
    for (let i = 0; i < 4; i++) p.set(ox + 3 + Math.floor(hash(tx, ty, 60 + i) * 10), oy + Math.floor(hash(tx, ty, 70 + i) * 15), 'dusk');
  }
}

function floorShadow(p: PixelCanvas, tx: number, ty: number, rows: number) {
  const ox = tx * T;
  const oy = ty * T;
  const darker: Partial<Record<PalKey, PalKey>> = {
    ochre: 'copper', copper: 'rust', rust: 'blood', blood: 'maroon', tan: 'mauve', mauve: 'maroon', bone: 'tan', maroon: 'dusk',
  };
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < T; x++) {
      const c = p.get(ox + x, oy + y);
      if (c && darker[c] && (y < rows - 1 || (x + y) % 2 === 0)) p.set(ox + x, oy + y, darker[c]!);
    }
}

function grass(p: PixelCanvas, tx: number, ty: number, lit: boolean) {
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const h = hash(ox + x, oy + y, 81);
      let c: PalKey = h < 0.55 ? 'green' : h < 0.85 ? 'pine' : 'sage';
      if (h > 0.97) c = 'mint';
      p.set(ox + x, oy + y, lit ? c : c === 'green' ? 'pine' : 'grave');
    }
  // kytičky
  if (lit && hash(tx, ty, 82) < 0.35) {
    const fx = ox + 2 + Math.floor(hash(tx, ty, 83) * 12);
    const fy = oy + 2 + Math.floor(hash(tx, ty, 84) * 12);
    const fc: PalKey = (['scarlet', 'gold', 'bone', 'sky'] as PalKey[])[Math.floor(hash(tx, ty, 85) * 4)];
    p.set(fx, fy, fc);
    p.set(fx + 1, fy, fc);
    p.set(fx, fy + 1, fc);
    p.set(fx + 1, fy + 1, 'gold');
  }
}

function nightGround(p: PixelCanvas, tx: number, ty: number) {
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) p.set(tx * T + x, ty * T + y, hash(tx * T + x, ty * T + y, 86) < 0.8 ? 'grave' : 'pine');
}

function fence(p: PixelCanvas, tx: number, ty: number, vertical: boolean) {
  grass(p, tx, ty, true);
  const ox = tx * T;
  const oy = ty * T;
  if (!vertical) {
    for (let x = 0; x < T; x += 4) {
      p.rect(ox + x + 1, oy + 2, 2, 12, 'ochre');
      p.vline(ox + x + 2, oy + 2, oy + 13, 'copper');
      p.set(ox + x + 1, oy + 1, 'sand');
    }
    p.hline(ox, ox + T - 1, oy + 5, 'rust');
    p.hline(ox, ox + T - 1, oy + 10, 'rust');
    p.hline(ox, ox + T - 1, oy + 14, 'ink');
  } else {
    p.rect(ox + 6, oy, 4, T, 'ochre');
    p.vline(ox + 9, oy, oy + T - 1, 'rust');
    p.vline(ox + 5, oy, oy + T - 1, 'ink');
    p.vline(ox + 10, oy, oy + T - 1, 'ink');
    for (let y = 2; y < T; y += 5) p.hline(ox + 6, ox + 9, oy + y, 'sand');
  }
}

/** Přebarví část plátna podle mapy barev (převlečené hospody v dalších dějstvích). */
function recolor(p: PixelCanvas, map: Partial<Record<PalKey, PalKey>>, x0 = 0, y0 = 0, x1 = p.w, y1 = p.h) {
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const c = p.data[y * p.w + x];
      if (c && map[c]) p.data[y * p.w + x] = map[c]!;
    }
}

/** Žabákův podnik (3. dějství): bažinatě zelené obložení a tmavá prkna. */
const ZABAK_COLORS: Partial<Record<PalKey, PalKey>> = {
  copper: 'green', rust: 'pine', ochre: 'sage', blood: 'grave', maroon: 'coal', tan: 'sage', mauve: 'grave', bone: 'fog', red: 'olive',
};

/**
 * Pozadí hospody. `act` = dějství: 1 U Zlatého sudu (dřevo), 2 sklepní hospoda (kámen, cihly, starý pult),
 * 3 Žabákův podnik (stejné rozložení, bažinatě zelené barvy).
 */
/** 4. hospoda (chrám Cthulhu): sklepní kámen přebarvený do hlubin */
const CTHULHU_COLORS: Partial<Record<PalKey, PalKey>> = {
  slate: 'indigo', fog: 'sage', mauve: 'plum', tan: 'grave', rust: 'navy', maroon: 'navy', copper: 'plum', ochre: 'indigo',
  blood: 'navy', red: 'pine', bone: 'ice', sand: 'mint', olive: 'grave', dusk: 'navy',
};

export function drawPubBackground(tablesLevel: number, act = 1): PixelCanvas {
  if (act === 4) {
    const c = drawCellarPubBackground(tablesLevel);
    recolor(c, CTHULHU_COLORS);
    return c;
  }
  if (act === 2) return drawCellarPubBackground(tablesLevel);
  const p = drawPubBackground1(tablesLevel);
  if (act === 3) recolor(p, ZABAK_COLORS);
  return p;
}

/** Sklepní hospoda (2. dějství): kamenná dlažba, cihlové zdi sklepa, za pultem stará prkna, místo zahrádky skála. */
function drawCellarPubBackground(tablesLevel: number): PixelCanvas {
  const p = new PixelCanvas(PUB.w * T, PUB.h * T);
  const open = tablesLevel >= 1;
  for (let y = 0; y < PUB.h; y++)
    for (let x = 0; x < PUB.w; x++) {
      const ch = PUB_MAP[y][x];
      if (x >= PUB.innerW - 1 && ch !== 'D') cellarWallTop(p, x, y);
      else if (ch === '#') cellarWallTop(p, x, y);
      else if (ch === 'W') brickFace(p, x, y, 1);
      else if (ch === 'b') oldPlanks(p, x, y);
      else if (ch === 'B') counter(p, x, y, x === 1, x === 9);
      else if (ch === 'P') {
        if (open) stoneFloor(p, x, y, 1);
        else partition(p, x, y);
      } else if (ch === 'D') {
        // vchod = schody nahoru (dolů do krčmy chodí příšery)
        p.rect(x * T, y * T, T, T, 'ink');
        for (let i = 0; i < 4; i++) p.rect(x * T + 1, y * T + i * 4, T - 2, 3, i % 2 ? 'dusk' : 'slate');
      } else if ('gvfS'.includes(ch)) cellarWallTop(p, x, y);
      else stoneFloor(p, x, y, 1);
    }
  // pult ze starého tmavého dřeva
  recolor(p, { copper: 'rust', sand: 'ochre', ochre: 'copper', rust: 'blood', gold: 'tan', amber: 'tan' }, T, 4 * T, 10 * T, 6 * T);
  for (let x = 1; x < PUB.innerW - 1; x++) floorShadow(p, x, 3, 3);
  if (!open) for (let y = 3; y < PUB.h - 1; y++) for (let x = PUB.partitionX + 1; x < PUB.innerW - 1; x++) floorShadow(p, x, y, T);
  for (let y = 3; y < PUB.h - 1; y++) for (let i = 0; i < T; i++) if (i % 2 === 0) p.set(T, y * T + i, 'ink');
  // ošoupaný koberec z pytloviny uprostřed
  const rx = 6 * T + 8;
  const ry = 8 * T + 4;
  p.rect(rx, ry, 5 * T, 2 * T - 2, 'olive');
  p.rect(rx + 2, ry + 2, 5 * T - 4, 2 * T - 6, 'tan');
  for (let x = rx + 4; x < rx + 5 * T - 4; x += 3) p.vline(x, ry + 3, ry + 2 * T - 6, 'olive');
  return p;
}

function drawPubBackground1(tablesLevel: number): PixelCanvas {
  const p = new PixelCanvas(PUB.w * T, PUB.h * T);
  const open = tablesLevel >= 1;
  for (let y = 0; y < PUB.h; y++)
    for (let x = 0; x < PUB.w; x++) {
      const ch = PUB_MAP[y][x];
      if (ch === '#') wallTop(p, x, y);
      else if (ch === 'W') wallFace(p, x, y, y === 1);
      else if (ch === 'b') barTiles(p, x, y);
      else if (ch === 'B') counter(p, x, y, x === 1, x === 9);
      else if (ch === 'P') {
        if (open) woodFloor(p, x, y);
        else partition(p, x, y);
      } else if (ch === 'D') {
        woodFloor(p, x, y);
        // práh
        p.rect(x * T, y * T, T, T, 'ink');
        p.rect(x * T + 1, y * T, T - 2, 4, 'olive');
        p.hline(x * T + 1, x * T + T - 2, y * T, 'copper');
      } else if (ch === 'g') grass(p, x, y, false);
      else if (ch === 'v') nightGround(p, x, y);
      else if (ch === 'f') fence(p, x, y, PUB_MAP[y - 1]?.[x] === 'f' || PUB_MAP[y + 1]?.[x] === 'f');
      else if (ch === 'S') wallTop(p, x, y);
      else woodFloor(p, x, y);
    }
  // stín pod zdí
  for (let x = 1; x < PUB.innerW - 1; x++) floorShadow(p, x, 3, 3);
  // zavřený salonek: zaprášený a temný
  if (!open) {
    for (let y = 3; y < PUB.h - 1; y++) for (let x = PUB.partitionX + 1; x < PUB.innerW - 1; x++) floorShadow(p, x, y, T);
  }
  // koberec v sále
  {
    const rx = 6 * T + 8;
    const ry = 8 * T + 4;
    const rw = 5 * T;
    const rh = 2 * T - 2;
    p.rect(rx, ry, rw, rh, 'blood');
    p.rect(rx + 2, ry + 2, rw - 4, rh - 4, 'red');
    p.rect(rx + 4, ry + 4, rw - 8, rh - 8, 'maroon');
    for (let x = rx + 7; x < rx + rw - 7; x += 4) {
      p.set(x, ry + rh / 2, 'ochre');
      p.set(x + 2, ry + rh / 2 - 2, 'red');
      p.set(x + 2, ry + rh / 2 + 2, 'red');
    }
    for (let x = rx; x < rx + rw; x += 2) {
      p.set(x, ry - 1, 'bone');
      p.set(x, ry + rh, 'bone');
    }
  }
  // stín u levé boční stěny
  for (let y = 3; y < PUB.h - 1; y++) for (let i = 0; i < T; i++) if (i % 2 === 0) p.set(T, y * T + i, 'ink');
  // rohožka u vchodu
  const mx = PUB.door.x * T;
  const my = (PUB.door.y - 1) * T + 4;
  p.rect(mx - 4, my, T + 8, 11, 'maroon');
  p.rect(mx - 3, my + 1, T + 6, 9, 'red');
  for (let i = 0; i < T + 6; i += 2) p.set(mx - 3 + i, my + 5, 'maroon');
  p.hline(mx - 3, mx + T + 2, my + 1, 'scarlet');
  // koberec v salonku
  if (open) {
    const rx = 19 * T + 4;
    const ry = 4 * T - 4;
    p.rect(rx, ry, 5 * T - 8, 8 * T, 'blood');
    p.rect(rx + 2, ry + 2, 5 * T - 12, 8 * T - 4, 'maroon');
    for (let y = ry + 6; y < ry + 8 * T - 6; y += 6)
      for (let x = rx + 6; x < rx + 5 * T - 12; x += 6) p.set(x, y, (x + y) % 12 === 0 ? 'gold' : 'red');
    p.rect(rx + 2, ry + 2, 5 * T - 12, 1, 'red');
  }
  return p;
}

// ============================================================ SKLEP
type CellarTheme = 1 | 2 | 3 | 4 | 5;

/** Barvy kamenné dlažby podle patra: [hlavní, světlejší, tmavá spára, odlesk]. */
const FLOOR_COLORS: Record<CellarTheme, [PalKey, PalKey, PalKey, PalKey]> = {
  1: ['indigo', 'blue', 'navy', 'sky'],
  2: ['blue', 'sky', 'indigo', 'ice'],
  3: ['grave', 'sage', 'coal', 'fog'],
  4: ['rust', 'copper', 'blood', 'ochre'],
  5: ['olive', 'mauve', 'ink', 'tan'],
};

function stoneFloor(p: PixelCanvas, tx: number, ty: number, theme: CellarTheme = 1) {
  if (theme === 4) return oldPlanks(p, tx, ty);
  if (theme === 5) return dirtFloor(p, tx, ty);
  const [cMain, cLight, cDark, cHi] = lookFloorColors(theme, cellarLook()) ?? FLOOR_COLORS[theme];
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      // nepravidelné dlažební kameny 8×8 s posunem každou druhou řadu
      const gx = ox + x;
      const gy = oy + y;
      const row = Math.floor(gy / 7);
      const sx = gx + (row % 2) * 4;
      const col = Math.floor(sx / 9);
      const lx = sx % 9;
      const ly = gy % 7;
      const h = hash(col, row, 41);
      // světlejší dlažba, ať je jasně odlišná od tmavých zdí
      let c: PalKey = h < 0.55 ? cMain : h < 0.75 ? cLight : cDark;
      if (lx === 0 || ly === 0) c = cDark;
      else if (lx === 1 || ly === 1) c = c === cDark ? cMain : c === cMain ? cLight : cHi;
      else if (lx === 8 || ly === 6) c = c === cLight ? cMain : cDark;
      if (h > 0.9 && hash(gx, gy, 42) < 0.4) c = theme === 2 ? 'bone' : theme === 3 ? 'pine' : 'grave'; // mech / jinovatka
      p.set(gx, gy, c);
    }
}

/** Prkna zazděné hospody (patro 4): tmavší a zaprášená verze podlahy z hospody nahoře. */
function oldPlanks(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  for (let row = 0; row < 4; row++) {
    const py = oy + row * 4;
    const gy = ty * 4 + row;
    const shift = Math.floor(hash(0, gy, 17) * 24);
    for (let x = 0; x < T; x++) {
      const gx = ox + x;
      const lx = (gx + shift) % 24;
      const plank = Math.floor((gx + shift) / 24);
      const light = hash(plank, gy, 13) < 0.2;
      const base: PalKey = light ? 'rust' : 'blood';
      const seam = lx === 0;
      p.set(gx, py, seam ? 'ink' : light ? 'copper' : base);
      p.set(gx, py + 1, seam ? 'ink' : base);
      p.set(gx, py + 2, seam ? 'ink' : base);
      p.set(gx, py + 3, 'maroon');
      if (hash(gx, gy, 19) < 0.04) p.set(gx, py + 1, 'mauve'); // prach
    }
  }
}

/** Led na podlaze (patro 2): lesklé plochy s odlesky. */
function iceTile(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = ox + x;
      const gy = oy + y;
      const h = hash(Math.floor(gx / 5), Math.floor(gy / 5), 71);
      let c: PalKey = h < 0.5 ? 'sky' : 'ice';
      if ((gx + gy) % 11 === 0 && hash(gx, gy, 72) < 0.6) c = 'white'; // odlesk
      if (hash(gx, gy, 73) < 0.02) c = 'blue'; // prasklinka
      p.set(gx, gy, c);
    }
}

/** Voda po kolena (patro 3): tmavá hladina s vlnkami. */
function waterTile(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = ox + x;
      const gy = oy + y;
      let c: PalKey = hash(Math.floor(gx / 4), Math.floor(gy / 3), 81) < 0.6 ? 'navy' : 'indigo';
      // vlnky
      if ((gy % 6 === 0 && (gx + Math.floor(gy / 6) * 3) % 8 < 3) || hash(gx, gy, 82) < 0.015) c = 'blue';
      if (gy % 6 === 0 && (gx + Math.floor(gy / 6) * 3) % 8 === 1) c = 'sky';
      p.set(gx, gy, c);
    }
}

/** Hřbitov: udusaná hlína s kamínky a trsy zažloutlé trávy. */
function dirtFloor(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = ox + x;
      const gy = oy + y;
      // tmavá hlína se zrnky (žádné kostky – jen jemný šum)
      const n = hash(gx, gy, 72);
      const m = hash(Math.floor(gx / 3), Math.floor(gy / 2), 71);
      let c: PalKey = 'olive';
      if (n > 0.985) c = 'tan'; // kamínek
      else if (n < 0.025) c = 'ink';
      else if (n < 0.1 + (m < 0.3 ? 0.1 : 0)) c = 'rust';
      else if (n > 0.95) c = 'mauve';
      p.set(gx, gy, c);
    }
  // trsy trávy
  if (hash(tx, ty, 73) < 0.45) {
    const x0 = ox + 2 + Math.floor(hash(tx, ty, 74) * 11);
    const y0 = oy + 4 + Math.floor(hash(tx, ty, 75) * 10);
    for (let i = -1; i <= 1; i++) p.vline(x0 + i * 2, y0 - (i === 0 ? 3 : 2), y0, i === 0 ? 'sage' : 'pine');
  }
  // kostička (jen občas)
  if (hash(tx, ty, 76) < 0.05) {
    const x0 = ox + 4 + Math.floor(hash(tx, ty, 77) * 7);
    const y0 = oy + 6 + Math.floor(hash(tx, ty, 78) * 6);
    p.hline(x0, x0 + 3, y0, 'bone');
    p.set(x0 - 1, y0 - 1, 'bone');
    p.set(x0 + 4, y0 + 1, 'bone');
  }
}

/** Hřbitovní zeď: velké omšelé kameny, popínavý břečťan. */
function graveWallFace(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const row = Math.floor(y / 6);
      const sx = x + (row % 2) * 6 + tx * 16;
      const h = hash(Math.floor(sx / 10), row + ty * 3, 81);
      let c: PalKey = h < 0.4 ? 'slate' : h < 0.8 ? 'dusk' : 'grave';
      if (y % 6 === 5 || sx % 10 === 0) c = 'ink';
      else if (y % 6 === 0) c = c === 'slate' ? 'fog' : 'slate';
      p.set(ox + x, oy + y, c);
    }
  if (hash(tx, ty, 82) < 0.5) {
    // břečťan
    let x = ox + 2 + Math.floor(hash(tx, ty, 83) * 12);
    for (let y = 0; y < T - 2; y++) {
      p.set(x, oy + y, y % 3 === 0 ? 'green' : 'pine');
      if (y % 3 === 0) p.set(x + 1, oy + y, 'sage');
      if (hash(x, y, 84) < 0.3) x += hash(x, y, 85) < 0.5 ? -1 : 1;
    }
  }
  p.hline(ox, ox + T - 1, oy, 'fog');
  p.hline(ox, ox + T - 1, oy + T - 1, 'ink');
}

function brickFace(p: PixelCanvas, tx: number, ty: number, theme: CellarTheme = 1) {
  if (theme === 4) return pubWallFace(p, tx, ty);
  if (theme === 5) return graveWallFace(p, tx, ty);
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const row = Math.floor(y / 4);
      const sx = x + (row % 2) * 4 + tx * 16;
      const [bA, bB, bHi]: PalKey[] = lookBrickColors(theme, cellarLook()) ?? (theme === 3 ? ['grave', 'coal', 'sage'] : theme === 2 ? ['indigo', 'navy', 'ice'] : ['indigo', 'navy', 'blue']);
      let c: PalKey = hash(Math.floor(sx / 8), row + ty * 4, 51) < 0.3 ? bA : bB;
      if (y % 4 === 3 || sx % 8 === 0) c = 'ink';
      else if (y % 4 === 0 && c === bA) c = bHi;
      p.set(ox + x, oy + y, c);
    }
  // vlhkost / skvrny
  if (hash(tx, ty, 52) < 0.35) {
    const x0 = ox + 2 + Math.floor(hash(tx, ty, 53) * 12);
    for (let y = 2; y < 14; y++) if (hash(x0, y, 54) < 0.8) p.set(x0, oy + y, theme === 2 ? 'ice' : theme === 3 ? 'pine' : 'grave');
  }
  // patro 2: rampouchy pod hranou zdi
  if (theme === 2) for (let x = 1; x < T; x += 3) if (hash(tx * T + x, ty, 55) < 0.6) p.vline(ox + x, oy + 2, oy + 3 + Math.floor(hash(x, ty, 56) * 4), 'ice');
  p.hline(ox, ox + T - 1, oy, 'fog');
  p.hline(ox, ox + T - 1, oy + 1, 'slate');
  p.hline(ox, ox + T - 1, oy + T - 1, 'ink');
}

/** Zeď zazděné hospody: tapeta nad dřevěným obložením (jako nahoře, jen starší). */
function pubWallFace(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      let c: PalKey;
      if (y < 9) c = (ox + x) % 6 === 0 ? 'maroon' : hash(ox + x, y, 91) < 0.08 ? 'mauve' : 'blood';
      else if (y === 9) c = 'copper';
      else c = (ox + x) % 8 === 0 ? 'blood' : 'rust';
      p.set(ox + x, oy + y, c);
    }
  // zazděné okno (občas)
  if (hash(tx, ty, 92) < 0.18) {
    p.rect(ox + 3, oy + 1, 10, 7, 'slate');
    for (let y = 1; y < 8; y += 2) p.hline(ox + 3, ox + 12, oy + y, 'dusk');
    p.rect(ox + 2, oy, 12, 1, 'olive');
  }
  p.hline(ox, ox + T - 1, oy, 'mauve');
  p.hline(ox, ox + T - 1, oy + T - 1, 'ink');
}

function cellarWallTop(p: PixelCanvas, tx: number, ty: number) {
  const ox = tx * T;
  const oy = ty * T;
  // hrubý kámen viděný shora
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = ox + x;
      const gy = oy + y;
      const cell = Math.floor(gx / 6) + Math.floor((gy + (Math.floor(gx / 6) % 2) * 3) / 6) * 97;
      const h = hash(cell, 0, 61);
      // tmavý vršek zdi (výrazně tmavší než podlaha)
      let c: PalKey = h < 0.6 ? 'ink' : 'coal';
      const lx = gx % 6;
      const ly = (gy + (Math.floor(gx / 6) % 2) * 3) % 6;
      if (lx === 0 || ly === 0) c = 'ink';
      else if (ly === 1 && h > 0.8) c = 'dusk';
      p.set(gx, gy, c);
    }
}

/** Utopená kobka u brány: velké staré desky, tmavé a mokré, mezi nimi písek a mech. */
function sunkenFloor(p: PixelCanvas, tx: number, ty: number) {
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = tx * T + x;
      const gy = ty * T + y;
      const row = Math.floor(gy / 11);
      const sx = gx + (row % 2) * 7 + Math.floor(hash(0, row, 91) * 5);
      const col = Math.floor(sx / 14);
      const lx = sx % 14;
      const ly = gy % 11;
      const h = hash(col, row, 92);
      let c: PalKey = h < 0.5 ? 'grave' : h < 0.8 ? 'coal' : 'dusk';
      if (lx === 0 || ly === 0) c = hash(gx, gy, 93) < 0.35 ? 'olive' : 'ink'; // spáry s pískem
      else if ((lx === 1 || ly === 1) && c !== 'dusk') c = 'sage'; // horní hrana desky chytá světlo
      else if (lx === 13 || ly === 10) c = 'ink';
      else if (h > 0.55 && hash(gx >> 1, gy, 94) < 0.06) c = 'navy'; // mokré skvrny
      else if (hash(gx, gy, 95) < 0.012) c = 'fog'; // odlesk vody
      if (h > 0.88 && lx > 2 && ly > 2 && hash(gx, gy, 96) < 0.35) c = 'pine'; // mech
      p.set(gx, gy, c);
    }
}

/** Stoka: chodník z tmavých cihel, slizké spáry, mokré skvrny. */
/** Stoka: podlaha chodníku a ostrůvku – musí být na první pohled podlaha, ne zeď. */
function sewerFloor(p: PixelCanvas, tx: number, ty: number) {
  const style = 'A' as 'A' | 'B' | 'C'; // vybráno A (kamenné desky); B lávka a C kostky zůstávají jako možnost
  const island = tx >= 24 && ty >= 13; // ostrůvek s hnízdem
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = tx * T + x;
      const gy = ty * T + y;
      let c: PalKey;
      if (island) {
        // bahnitý břeh: hnědá hlína, trs trávy, oblázky
        const h = hash(gx >> 1, gy >> 1, 160);
        c = h < 0.55 ? 'olive' : h < 0.85 ? 'rust' : 'mauve';
        if (hash(gx, gy, 161) < 0.04) c = 'sage';
        if (hash(gx >> 2, gy >> 2, 162) < 0.06) c = 'tan';
      } else if (style === 'A') {
        // velké kamenné desky (světlé, se spárami)
        const bx = Math.floor(gx / 8);
        const by = Math.floor(gy / 8);
        const h = hash(bx, by, 163);
        c = h < 0.45 ? 'tan' : h < 0.85 ? 'mauve' : 'fog';
        if (gx % 8 === 0 || gy % 8 === 0) c = 'slate';
        else if (hash(gx, gy, 164) < 0.05) c = 'slate';
        if (hash(gx >> 2, gy >> 2, 165) < 0.06 && c !== 'slate') c = 'sage'; // mokrá skvrna
      } else if (style === 'B') {
        // dřevěná lávka (prkna napříč)
        const plank = Math.floor(gy / 4);
        c = hash(plank, Math.floor(gx / 12), 166) < 0.5 ? 'ochre' : 'copper';
        if (gy % 4 === 0) c = 'rust';
        if (hash(gx, gy, 167) < 0.04) c = 'rust';
        if ((gx + plank * 5) % 12 === 0 && gy % 4 === 2) c = 'ink'; // hřebík
      } else {
        // dlažební kostky (šedé)
        const row = Math.floor(gy / 4);
        const sx = gx + (row % 2) * 2;
        const h = hash(Math.floor(sx / 4), row, 168);
        c = h < 0.5 ? 'fog' : h < 0.85 ? 'slate' : 'bone';
        if (gy % 4 === 0 || sx % 4 === 0) c = 'dusk';
      }
      p.set(gx, gy, c);
    }
}

/** Stoka: líná zelená břečka s vlnkami, pěnou a kolečky mastnoty. */
function sludgeTile(p: PixelCanvas, tx: number, ty: number) {
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const gx = tx * T + x;
      const gy = ty * T + y;
      let c: PalKey = hash(Math.floor(gx / 6), Math.floor(gy / 4), 150) < 0.6 ? 'sage' : 'green';
      if (hash(Math.floor(gx / 3), Math.floor(gy / 2), 153) < 0.12) c = 'pine';
      if (gy % 5 === 0 && (gx + Math.floor(gy / 5) * 5) % 11 < 4) c = 'mint';
      if (gy % 5 === 1 && (gx + Math.floor(gy / 5) * 5) % 11 < 4) c = 'pine';
      if (hash(gx >> 1, gy >> 1, 152) < 0.02) c = 'tan'; // pěna
      p.set(gx, gy, c);
    }
}

export function drawCellarBackground(dg: DecorGrid): PixelCanvas {
  const theme = (dg.theme ?? 1) as CellarTheme;
  const g = dg.grid;
  const W = dg.w;
  const H = dg.h;
  const p = new PixelCanvas(W * T, H * T);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tr = dg.terrain?.[y * W + x] ?? 0;
      if (g[y][x] === 1) {
        if (tr === 1) iceTile(p, x, y);
        else if (tr === 2) (dg.floor === 'sewer' ? sludgeTile : waterTile)(p, x, y);
        else if (dg.floor === 'sunken') sunkenFloor(p, x, y);
        else if (dg.floor === 'sewer') sewerFloor(p, x, y);
        else stoneFloor(p, x, y, theme);
      } else if (y + 1 < H && g[y + 1][x] === 1) brickFace(p, x, y, theme);
      else cellarWallTop(p, x, y);
    }
  // světlý okraj zdí: kde vršek zdi sousedí s podlahou, je jasná hrana
  const isFloor = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && g[y][x] === 1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (g[y][x] === 1) continue;
      const face = isFloor(x, y + 1);
      const ox = x * T;
      const oy = y * T;
      if (!face && isFloor(x, y - 1)) {
        p.hline(ox, ox + T - 1, oy, 'fog');
        p.hline(ox, ox + T - 1, oy + 1, 'slate');
      }
      if (isFloor(x - 1, y)) {
        p.vline(ox, oy, oy + T - 1, 'fog');
        p.vline(ox + 1, oy, oy + T - 1, 'slate');
      }
      if (isFloor(x + 1, y)) {
        p.vline(ox + T - 1, oy, oy + T - 1, 'fog');
        p.vline(ox + T - 2, oy, oy + T - 1, 'slate');
      }
    }
  // stín pod zdmi
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (g[y][x] !== 1) continue;
      if (y > 0 && g[y - 1][x] === 0) for (let i = 0; i < T; i++) {
        p.set(x * T + i, y * T, 'ink');
        if (i % 2 === 0) p.set(x * T + i, y * T + 1, 'ink');
        p.set(x * T + i, y * T + 2, p.get(x * T + i, y * T + 2) === 'ink' ? 'ink' : 'navy');
      }
      if (x > 0 && g[y][x - 1] === 0) for (let i = 0; i < T; i++) {
        p.set(x * T, y * T + i, 'ink');
        if (i % 2 === 0) p.set(x * T + 1, y * T + i, 'ink');
      }
      if (x + 1 < W && g[y][x + 1] === 0) for (let i = 0; i < T; i++) p.set(x * T + T - 1, y * T + i, 'ink');
    }
  decorateCellar(p, dg, cellarLook());
  // schody nahoru (2 dlaždice) a dolů: stupně mizí do klenutého otvoru ve zdi
  const mat = stairsMat(theme);
  drawStairs(p, dg.stairs.x * T, dg.stairs.y * T, true, mat);
  if (dg.stairsDown) drawStairs(p, dg.stairsDown.x * T, dg.stairsDown.y * T, false, mat);
  return p;
}
