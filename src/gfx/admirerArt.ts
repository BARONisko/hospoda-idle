import { PixelCanvas } from './pixel';
import type { PalKey } from '../data/palette';

// Tajné místnosti posedlé obdivovatelky: zeď se srdíčkem, komická mučírna (lechtací stroj,
// kolovrátek, klády, skřipec, kýbl ledové vody), korková nástěnka s fotkami a stůl se stopami.
// Barvy dřeva a látek se dají přepnout (návrhy vzhledu).

export interface LairStyle {
  wood: PalKey; woodHi: PalKey; woodSh: PalKey;
  metal: PalKey; metalHi: PalKey;
  cloth: PalKey; clothSh: PalKey;
  heart: PalKey; heartHi: PalKey;
  cork: PalKey; corkSh: PalKey; corkHi: PalKey;
  frame: PalKey; frameHi: PalKey;
  bows: boolean; // mašličky a srdíčka navíc
}

export const LAIR_STYLES: Record<'A' | 'B' | 'C', LairStyle> = {
  // A – „Zamilovaná komnata“: vínové dřevo, růžové látky, mašle a srdíčka všude
  A: { wood: 'maroon', woodHi: 'mauve', woodSh: 'blood', metal: 'gold', metalHi: 'sand', cloth: 'scarlet', clothSh: 'red', heart: 'scarlet', heartHi: 'skin', cork: 'tan', corkSh: 'mauve', corkHi: 'sand', frame: 'maroon', frameHi: 'mauve', bows: true },
  // B – „Domácí dílna“: obyčejné hnědé dřevo, provazy a železo, kutilský sklep
  B: { wood: 'rust', woodHi: 'copper', woodSh: 'olive', metal: 'slate', metalHi: 'fog', cloth: 'tan', clothSh: 'mauve', heart: 'red', heartHi: 'scarlet', cork: 'ochre', corkSh: 'copper', corkHi: 'sand', frame: 'olive', frameHi: 'rust', bows: false },
  // C – „Noir“: tmavé dřevo a černé železo, jen červená srdce svítí
  C: { wood: 'dusk', woodHi: 'slate', woodSh: 'ink', metal: 'coal', metalHi: 'slate', cloth: 'plum', clothSh: 'dusk', heart: 'scarlet', heartHi: 'white', cork: 'mauve', corkSh: 'rust', corkHi: 'tan', frame: 'ink', frameHi: 'dusk', bows: false },
};

/** Malé srdíčko 5×4 (nebo 7×6). */
export function heartAt(p: PixelCanvas, x: number, y: number, c: PalKey, hi?: PalKey, big = false) {
  const rows = big ? ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'] : ['xx.xx', 'xxxxx', '.xxx.', '..x..'];
  rows.forEach((r, j) => [...r].forEach((ch, i) => ch === 'x' && p.set(x + i, y + j, c)));
  if (hi) p.set(x + 1, y + (big ? 1 : 0), hi);
}

function bow(p: PixelCanvas, x: number, y: number, c: PalKey) {
  p.set(x - 2, y - 1, c); p.set(x - 1, y, c); p.set(x - 2, y + 1, c); p.set(x - 2, y, c);
  p.set(x + 2, y - 1, c); p.set(x + 1, y, c); p.set(x + 2, y + 1, c); p.set(x + 2, y, c);
  p.set(x, y, 'ink');
  p.set(x - 1, y + 2, c); p.set(x + 1, y + 2, c);
}

/** Zeď se srdíčkem (vchod do tajných místností). */
function heartWall(open: boolean): PixelCanvas {
  const p = new PixelCanvas(16, 16);
  if (open) {
    p.rect(2, 2, 12, 14, 'ink');
    p.rect(3, 3, 10, 13, 'coal');
    for (const [x, y] of [[1, 3], [14, 6], [1, 9], [14, 12]]) p.set(x, y, 'slate');
    heartAt(p, 4, 6, 'blood', undefined, true);
    return p;
  }
  // vyrytý obrys srdíčka, uvnitř rudě prosvítá
  heartAt(p, 4, 5, 'blood', undefined, true);
  heartAt(p, 5, 6, 'red');
  p.set(6, 6, 'scarlet');
  for (const [x, y] of [[4, 4], [5, 4], [9, 4], [10, 4], [3, 5], [11, 5], [3, 7], [11, 7], [4, 9], [10, 9], [5, 10], [9, 10], [6, 11], [8, 11], [7, 12]]) p.set(x, y, 'ink');
  p.set(7, 5, 'ink');
  return p;
}

/** Dřevěný hranol s letokruhy, světlou hranou nahoře a tmavou dole. */
function plank(p: PixelCanvas, s: LairStyle, x: number, y: number, w: number, h: number, seed = 1) {
  p.rect(x, y, w, h, s.wood);
  for (let j = 1; j < h - 1; j++)
    for (let i = 0; i < w; i++) {
      const r = Math.sin((x + i) * 3.1 + (y + j) * 17.7 + seed * 5.3) * 9341.7;
      if (r - Math.floor(r) < 0.18) p.set(x + i, y + j, s.woodSh);
    }
  p.hline(x, x + w - 1, y, s.woodHi);
  p.hline(x, x + w - 1, y + h - 1, s.woodSh);
}

/** Svislý sloupek dřeva. */
function post(p: PixelCanvas, s: LairStyle, x: number, y: number, w: number, h: number) {
  p.rect(x, y, w, h, s.wood);
  p.vline(x, y, y + h - 1, s.woodHi);
  p.vline(x + w - 1, y, y + h - 1, s.woodSh);
  for (let j = y + 2; j < y + h - 1; j += 5) p.set(x + 1 + (j % 2), j, s.woodSh);
}

/** Hlavička nýtu. */
function rivet(p: PixelCanvas, s: LairStyle, x: number, y: number) {
  p.set(x, y, s.metalHi);
}

/** Železný pásek s nýty. */
function band(p: PixelCanvas, s: LairStyle, x: number, y: number, w: number) {
  p.hline(x, x + w - 1, y, s.metal);
  p.hline(x, x + w - 1, y + 1, 'ink');
  rivet(p, s, x + 1, y);
  rivet(p, s, x + w - 2, y);
}

/** Ozubené kolo. */
function gear(p: PixelCanvas, s: LairStyle, cx: number, cy: number, r: number, rot: number) {
  const teeth = Math.round(r * 2.2);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2 + rot;
    p.set(cx + Math.cos(a) * (r + 0.8), cy + Math.sin(a) * (r + 0.8), s.metal);
  }
  p.ellipse(cx, cy, r, r, s.metal);
  p.ellipse(cx, cy, r - 1.2, r - 1.2, s.metalHi);
  p.ellipse(cx, cy, r - 2, r - 2, s.metal);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + rot;
    for (let k = 1; k < r - 1; k++) p.set(cx + Math.cos(a) * k, cy + Math.sin(a) * k, s.metalHi);
  }
  p.set(cx, cy, 'ink');
}

/** Kožený řemen s přezkou přes lavici. */
function strap(p: PixelCanvas, x: number, y: number, h: number) {
  p.vline(x, y, y + h - 1, 'olive');
  p.vline(x + 1, y, y + h - 1, 'rust');
  p.rect(x, y + 1, 2, 2, 'sand');
  p.set(x, y + 1, 'gold');
}

/** Peříčko zahnuté do strany (délka 8–9 px). */
function feather(p: PixelCanvas, cx: number, cy: number, a: number, c: PalKey, sh: PalKey) {
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  for (let r = 0; r <= 9; r++) {
    const bend = (r * r) / 40; // zahnutí
    const x = cx + dx * r - dy * bend;
    const y = cy + dy * r + dx * bend;
    const wdt = r < 2 ? 0 : r > 7 ? 1 : 2;
    p.set(x, y, r < 2 ? 'tan' : sh);
    for (let k = 1; k <= wdt; k++) {
      p.set(x - dy * k, y + dx * k, c);
      p.set(x + dy * k, y - dx * k, k === wdt ? sh : c);
    }
  }
}

/** Lechtací stroj: lavice s řemeny, nad nohama rám s ozubeným převodem a kolem se šesti peříčky (2 snímky). */
function tickler(s: LairStyle, f: number): PixelCanvas {
  const p = new PixelCanvas(48, 36);
  // nohy lavice s příčkou
  post(p, s, 2, 26, 3, 10);
  post(p, s, 31, 26, 3, 10);
  plank(p, s, 3, 31, 30, 2, 4);
  // lavice: deska + polstr s cvočky
  plank(p, s, 0, 22, 36, 5, 2);
  p.rect(1, 19, 30, 3, s.cloth);
  p.hline(1, 30, 19, s.corkHi);
  p.hline(1, 30, 21, s.clothSh);
  for (let x = 4; x < 30; x += 6) p.set(x, 20, s.metal);
  // polštář pod hlavou
  p.rect(1, 16, 7, 4, 'bone');
  p.hline(1, 7, 16, 'white');
  p.hline(2, 6, 19, 'fog');
  // řemeny (hrudník a kotníky)
  strap(p, 12, 18, 6);
  strap(p, 24, 18, 6);
  // rám u nohou: dva sloupky + trám s kovovými úhelníky
  post(p, s, 34, 3, 3, 33);
  post(p, s, 45, 3, 3, 33);
  plank(p, s, 33, 1, 15, 3, 7);
  for (const x of [34, 46]) {
    p.set(x, 4, s.metal);
    p.set(x + (x > 40 ? 1 : 0), 5, s.metal);
  }
  // převod: velké kolo s klikou dole, řetěz/řemen k malému kolu s peříčky
  const rot = f ? 0.4 : 0;
  gear(p, s, 41, 27, 3.5, rot);
  for (let y = 12; y <= 25; y++) {
    p.set(38 + (y % 2 ? 0 : 0), y, (y + f) % 2 ? s.metal : 'ink');
    p.set(44, y, (y + f) % 2 ? 'ink' : s.metal);
  }
  // klika na velkém kole
  const ka = rot * 3 + 0.6;
  const kx = 41 + Math.round(Math.cos(ka) * 4);
  const ky = 27 + Math.round(Math.sin(ka) * 4);
  p.set(kx, ky, s.metal);
  p.rect(kx, ky - 1, 2, 2, s.woodHi);
  // náboj s peříčky
  const cx = 41;
  const cy = 11;
  const fc: [PalKey, PalKey][] = [['white', 'fog'], ['bone', 'fog'], ['white', 'fog'], ['bone', 'tan'], ['white', 'fog'], ['bone', 'fog']];
  for (let i = 0; i < 6; i++) feather(p, cx, cy, (i / 6) * Math.PI * 2 + (f ? Math.PI / 6 : 0), fc[i][0], fc[i][1]);
  gear(p, s, cx, cy, 2.5, rot);
  // páčka „rychlost“ s červenou kuličkou
  p.vline(37, 13, 17, s.metal);
  p.set(36, 12, 'red');
  p.set(37, 12, 'scarlet');
  return p.outline('ink');
}

/** Kolovrátek: vyřezávaná skříňka na kolečkách, mosazné píšťaly, děrný pás a klika (2 snímky). */
function organ(s: LairStyle, f: number): PixelCanvas {
  const p = new PixelCanvas(26, 30);
  // vozík s kolečky
  plank(p, s, 2, 22, 22, 3, 3);
  post(p, s, 4, 25, 2, 3);
  post(p, s, 20, 25, 2, 3);
  for (const x of [5, 21]) {
    p.ellipse(x, 27.5, 2.2, 2.2, s.woodSh);
    p.set(x, 27, s.metalHi);
  }
  // skříňka
  p.rect(2, 5, 20, 17, s.wood);
  p.vline(2, 5, 21, s.woodHi);
  p.vline(21, 5, 21, s.woodSh);
  // vyřezávaný rámeček
  p.rect(4, 7, 16, 9, s.woodSh);
  p.rect(5, 8, 14, 7, 'ink');
  // mosazné píšťaly různé délky
  const pipes = [6, 4, 3, 2, 3, 4, 6];
  pipes.forEach((top, i) => {
    const x = 6 + i * 2;
    p.vline(x, 8 + top - 2, 14, i % 2 ? 'sand' : 'gold');
    p.set(x, 8 + top - 2, 'bone');
    p.set(x, 13, 'ink');
  });
  // děrný notový pás
  p.rect(4, 17, 16, 3, 'bone');
  for (let x = 5; x < 19; x++) if ((x * 7 + f * 3) % 5 < 2) p.set(x, 18, 'ink');
  p.hline(4, 19, 20, s.woodSh);
  // kování v rozích
  for (const [x, y] of [[2, 5], [21, 5], [2, 21], [21, 21]]) p.set(x, y, s.metalHi);
  // obloukové víko
  p.rect(1, 2, 22, 3, s.woodSh);
  p.hline(2, 21, 2, s.wood);
  p.hline(4, 19, 1, s.wood);
  p.hline(4, 19, 0, s.woodHi);
  heartAt(p, 10, 2, s.heart);
  // klika vpravo (otáčí se)
  p.rect(22, 11, 2, 2, s.metal);
  const ang = f ? Math.PI * 0.35 : -Math.PI * 0.35;
  for (let r = 1; r <= 4; r++) p.set(23 + Math.round(Math.cos(ang) * r * 0.4), 12 + Math.round(Math.sin(ang) * r), s.metal);
  const hx = 23 + Math.round(Math.cos(ang) * 1.6);
  const hy = 12 + Math.round(Math.sin(ang) * 4);
  p.rect(hx, hy - 1, 2, 3, s.woodHi);
  // plechový hrníček na drobné
  p.rect(0, 13, 2, 3, s.metalHi);
  return p.outline('ink');
}

/** Nota pro kolovrátek. */
function note(): PixelCanvas {
  const p = new PixelCanvas(6, 8);
  p.vline(3, 0, 5, 'bone');
  p.hline(3, 5, 0, 'bone');
  p.set(5, 1, 'bone');
  p.ellipse(2, 6, 1.6, 1.2, 'bone');
  return p.outline('ink');
}

/** Klády: sloupky v kamenné patce, dělený trám se závěsy, výřezy pro hlavu a ruce, zámek a cedulka. */
function stocks(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(34, 30);
  // kamenné patky
  for (const x of [1, 27]) {
    p.rect(x, 26, 6, 4, 'slate');
    p.hline(x, x + 5, 26, 'fog');
    p.set(x + 2, 28, 'dusk');
  }
  post(p, s, 2, 2, 4, 25);
  post(p, s, 28, 2, 4, 25);
  // stříšky sloupků
  p.hline(1, 6, 1, s.woodHi);
  p.hline(27, 32, 1, s.woodHi);
  // horní a dolní půlka trámu
  plank(p, s, 0, 9, 34, 4, 5);
  plank(p, s, 0, 13, 34, 4, 6);
  p.hline(0, 33, 13, 'ink');
  // výřezy (hlava uprostřed, ruce po stranách)
  for (const [cx, r] of [[17, 3.2], [8, 1.8], [26, 1.8]] as [number, number][]) p.ellipse(cx, 13, r, r, 'ink');
  p.ellipse(8, 13, 1.2, 1.2, 'skin');
  p.ellipse(26, 13, 1.2, 1.2, 'skin');
  p.set(7, 13, 'tan');
  p.set(25, 13, 'tan');
  // železné závěsy vlevo a vpravo
  for (const x of [1, 31]) {
    p.rect(x, 11, 2, 5, s.metal);
    rivet(p, s, x, 12);
    rivet(p, s, x + 1, 14);
  }
  // visací zámek
  p.rect(16, 17, 3, 3, s.metalHi);
  p.set(17, 18, 'ink');
  p.set(16, 16, s.metal);
  p.set(18, 16, s.metal);
  // vyrytá srdíčka a vruby
  heartAt(p, 11, 10, s.woodSh);
  for (const x of [21, 23]) p.vline(x, 10, 11, s.woodSh);
  p.outline('ink');
  // výřez pro hlavu je průhledný – hlava hosta za kládami je vidět
  for (let y = 9; y <= 16; y++) for (let x = 13; x <= 21; x++) if (Math.hypot(x + 0.5 - 17.5, y + 0.5 - 13) < 3.6) p.set(x, y, null);
  return p;
}

/** Skřipec: rám na nohách s křížovou výztuhou, válce s navinutým provazem, rohatka s klikou. */
function rack(s: LairStyle, f: number): PixelCanvas {
  const p = new PixelCanvas(52, 26);
  // nohy + křížová výztuha
  post(p, s, 3, 13, 3, 13);
  post(p, s, 46, 13, 3, 13);
  for (let i = 0; i < 40; i++) {
    p.set(6 + i, 16 + Math.round((i / 40) * 7), s.woodSh);
    p.set(6 + i, 23 - Math.round((i / 40) * 7), s.woodSh);
  }
  // deska z prken
  plank(p, s, 1, 9, 50, 3, 8);
  plank(p, s, 1, 12, 50, 2, 9);
  for (const x of [13, 26, 39]) p.vline(x, 9, 13, 'ink');
  band(p, s, 1, 14, 50);
  // válce na koncích s navinutým provazem
  for (const x of [3, 48]) {
    p.ellipse(x, 8, 3, 3, s.woodSh);
    p.ellipse(x, 8, 2, 2, s.wood);
    for (let k = -2; k <= 2; k += 2) p.set(x + k, 8 + (k % 4 ? 0 : 1), 'tan');
    p.set(x, 8, s.metalHi);
  }
  // provazy k zápěstím a kotníkům (napnuté)
  p.hline(5, 9, 7, 'tan');
  p.hline(5, 9, 8, 'olive');
  p.hline(42, 46, 7, 'tan');
  p.hline(42, 46, 8, 'olive');
  // rohatka s klikou vpravo
  gear(p, s, 48, 8, 2.2, f * 0.5);
  const ang = f ? -Math.PI / 2 : -Math.PI / 4;
  for (let r = 1; r <= 6; r++) p.set(48 + Math.round(Math.cos(ang) * r), 8 + Math.round(Math.sin(ang) * r), s.metal);
  const hx = 48 + Math.round(Math.cos(ang) * 6);
  const hy = 8 + Math.round(Math.sin(ang) * 6);
  p.rect(hx - 1, hy - 1, 2, 2, s.woodHi);
  // západka
  p.set(45, 5, s.metal);
  p.set(46, 6, s.metal);
  return p.outline('ink');
}

/** Cedulka nad skřipcem (nápis se dopisuje textem). */
function sign(s: LairStyle): PixelCanvas {
  const W = 60;
  const p = new PixelCanvas(W, 13);
  // provázky
  p.set(10, 0, 'tan');
  p.set(11, 1, 'tan');
  p.set(W - 11, 0, 'tan');
  p.set(W - 12, 1, 'tan');
  p.rect(1, 2, W - 2, 10, s.bows ? 'bone' : 'tan');
  p.hline(1, W - 2, 2, s.bows ? 'white' : 'sand');
  p.hline(1, W - 2, 11, s.bows ? 'fog' : 'mauve');
  for (let x = 3; x < W - 2; x += 7) p.set(x, 10, 'mauve');
  p.set(2, 3, s.metal);
  p.set(W - 3, 3, s.metal);
  return p.outline('ink');
}

/** Kýbl ledové vody na kladce nad židlí s řemeny (2 snímky: v klidu / nakloněný a lije). */
function bucket(s: LairStyle, f: number): PixelCanvas {
  const p = new PixelCanvas(26, 46);
  // šibenička: sloupek v patce, rameno a vzpěra
  p.rect(18, 42, 7, 4, 'slate');
  p.hline(18, 24, 42, 'fog');
  post(p, s, 20, 1, 3, 42);
  plank(p, s, 4, 0, 19, 3, 3);
  for (let i = 0; i < 6; i++) p.set(19 - i, 3 + i, s.woodSh);
  // kladka
  p.ellipse(9, 4, 2, 2, s.metal);
  p.set(9, 4, s.metalHi);
  // provaz z kladky dolů ke kýblu a k háčku na sloupku
  p.vline(8, 5, 11, 'tan');
  for (let i = 0; i < 9; i++) p.set(11 + i, 5 + Math.round(i * 2.3), 'tan');
  p.rect(19, 25, 1, 2, s.metal);
  // kýbl (2 dřevěné obruče)
  const tilt = f;
  const top = 12;
  for (let y = 0; y < 10; y++) {
    const inset = Math.floor(y / 5);
    p.hline(3 + inset + (tilt && y < 3 ? 1 : 0), 14 - inset, top + y, y % 3 === 0 ? s.woodSh : s.wood);
  }
  for (let x = 4; x < 14; x += 3) p.vline(x, top + 1, top + 8, s.woodSh);
  band(p, s, 3, top + 2, 12);
  band(p, s, 4, top + 7, 10);
  // ucho
  p.hline(5, 12, top - 3, s.metal);
  p.set(4, top - 2, s.metal);
  p.set(13, top - 2, s.metal);
  // hladina s kostkami ledu
  p.hline(4 + tilt, 13, top, 'ice');
  for (const [x, y] of [[5, -1], [6, -1], [10, -1], [11, -2], [12, -1]]) p.set(x, top + y, y === -2 ? 'white' : 'ice');
  p.set(6, top - 2, 'white');
  // kapky / proud vody
  if (!f) for (const [x, y] of [[7, 24], [10, 27], [7, 30]]) p.set(x, y, 'ice');
  else {
    for (let y = top + 1; y < top + 14; y++) p.set(2 - Math.floor((y - top) / 6), y, y % 2 ? 'ice' : 'sky');
    p.set(1, top + 15, 'ice');
  }
  // židle s opěradlem a řemeny na područkách
  plank(p, s, 4, 34, 12, 2, 2);
  post(p, s, 4, 36, 2, 9);
  post(p, s, 14, 36, 2, 9);
  post(p, s, 14, 25, 2, 10);
  p.hline(14, 15, 27, s.woodHi);
  strap(p, 5, 32, 2);
  return p.outline('ink');
}

/** Ještě prázdná fotka (polaroid) s obličejem; `hair` = barva vlasů. */
function photo(p: PixelCanvas, x: number, y: number, hair: PalKey, cap: PalKey | null, tilt: number) {
  p.rect(x, y, 9, 10, 'bone');
  p.hline(x, x + 8, y, 'white');
  p.rect(x + 1, y + 1, 7, 6, 'fog');
  // obličej
  p.rect(x + 3, y + 3, 3, 3, 'skin');
  p.hline(x + 2, x + 6, y + 6, 'slate');
  if (cap) p.rect(x + 2, y + 2, 5, 1, cap);
  else p.hline(x + 3, x + 5, y + 2, hair);
  p.set(x + 3, y + 4, 'ink');
  p.set(x + 5, y + 4, 'ink');
  // přeškrtnutí X přes fotku (někteří už „vyřešení“)
  if (tilt > 0.6) for (let i = 0; i < 7; i++) {
    p.set(x + 1 + i, y + 1 + i * 0.8, 'red');
    p.set(x + 7 - i, y + 1 + i * 0.8, 'red');
  }
  p.set(x + 4, y - 1, 'red'); // špendlík
}

function line(p: PixelCanvas, x0: number, y0: number, x1: number, y1: number, c: PalKey) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0;
    // provázek se lehce prohýbá
    const sag = Math.sin(t * Math.PI) * Math.min(3, n / 14);
    p.set(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t + sag), c);
  }
}

/** Korková nástěnka: `n` fotek problémových hostů, provázky ke středu, hráčova fotka v srdíčku. */
export function corkboard(s: LairStyle, n: number, circles = 3): PixelCanvas {
  const W = 88;
  const H = 46;
  const p = new PixelCanvas(W, H);
  p.rect(0, 0, W, H, s.frame);
  p.hline(0, W - 1, 0, s.frameHi);
  p.vline(0, 0, H - 1, s.frameHi);
  p.rect(3, 3, W - 6, H - 6, s.cork);
  // zrnitost korku
  for (let y = 3; y < H - 3; y++)
    for (let x = 3; x < W - 3; x++) {
      const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const r = h - Math.floor(h);
      if (r < 0.14) p.set(x, y, s.corkSh);
      else if (r > 0.93) p.set(x, y, s.corkHi);
    }
  const cx = W / 2;
  const cy = H / 2;
  // pozice fotek po obvodu
  const slots = [
    [6, 5], [20, 4], [58, 5], [72, 6], [5, 30], [19, 32], [60, 31], [74, 30], [33, 33], [46, 4], [30, 5], [47, 33],
  ];
  const hairs: PalKey[] = ['olive', 'ink', 'tan', 'mauve', 'bone', 'rust', 'ink', 'olive', 'fog', 'copper', 'ink', 'tan'];
  const caps: (PalKey | null)[] = [null, 'blue', null, 'green', 'red', null, 'plum', null, 'ochre', null, 'sky', null];
  const shown = slots.slice(0, Math.min(n, slots.length));
  // provázky nejdřív (pod fotkami)
  for (const [x, y] of shown) line(p, x + 4, y + 5, cx, cy, 'red');
  // provázky i mezi sousedy
  for (let i = 0; i + 1 < shown.length; i += 2) line(p, shown[i][0] + 4, shown[i][1] + 5, shown[i + 1][0] + 4, shown[i + 1][1] + 5, 'scarlet');
  shown.forEach(([x, y], i) => photo(p, x, y, hairs[i], caps[i], (i * 0.37) % 1));
  // střed: hráčova fotka v srdíčku, několikrát zakroužkovaná
  for (let k = 0; k < circles; k++) {
    const rx = 12 + k * 1.6;
    const ry = 9.5 + k * 1.2;
    for (let a = 0; a < Math.PI * 2; a += 0.02) p.set(cx + Math.cos(a + k) * rx, cy + Math.sin(a + k) * ry - 1, k % 2 ? 'scarlet' : 'red');
  }
  heartBig(p, cx - 9, cy - 9, s);
  // obličej hráče (hospodský s knírem)
  p.rect(cx - 2, cy - 4, 5, 5, 'skin');
  p.hline(cx - 2, cx + 2, cy - 5, 'olive');
  p.set(cx - 1, cy - 3, 'ink');
  p.set(cx + 1, cy - 3, 'ink');
  p.hline(cx - 1, cx + 1, cy - 1, 'olive');
  p.rect(cx - 3, cy + 1, 7, 2, 'bone');
  // rtěnkový polibek vedle
  kissAt(p, cx + 7, cy + 3);
  // nápis štítky (čárky)
  p.hline(cx - 4, cx + 4, cy + 5, 'ink');
  return p.outline('ink');
}

function heartBig(p: PixelCanvas, x: number, y: number, s: LairStyle) {
  const rows = [
    '..xxxx...xxxx..',
    '.xxxxxx.xxxxxx.',
    'xxxxxxxxxxxxxxx',
    'xxxxxxxxxxxxxxx',
    'xxxxxxxxxxxxxxx',
    '.xxxxxxxxxxxxx.',
    '..xxxxxxxxxxx..',
    '...xxxxxxxxx...',
    '....xxxxxxx....',
    '.....xxxxx.....',
    '......xxx......',
    '.......x.......',
  ];
  rows.forEach((r, j) => [...r].forEach((ch, i) => ch === 'x' && p.set(x + i, y + j + 1, j < 1 || i < 1 ? s.heartHi : s.heart)));
  for (let j = 0; j < rows.length; j++) {
    const r = rows[j];
    const a = r.indexOf('x');
    const b = r.lastIndexOf('x');
    p.set(x + a, y + j + 1, 'blood');
    p.set(x + b, y + j + 1, 'blood');
  }
}

/** Rudý otisk rtů. */
function kissAt(p: PixelCanvas, x: number, y: number) {
  for (const [i, j] of [[1, 0], [2, 0], [4, 0], [5, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [1, 2], [5, 2], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [2, 4], [3, 4], [4, 4]]) p.set(x + i, y + j, 'scarlet');
  p.hline(x + 1, x + 5, y + 2, 'blood');
}

function kiss(): PixelCanvas {
  const p = new PixelCanvas(9, 7);
  kissAt(p, 1, 1);
  return p;
}

/** Čepice, která po zmizelém hostovi zůstane na zemi. */
function lostCap(c: PalKey): PixelCanvas {
  const p = new PixelCanvas(11, 6);
  p.ellipse(4.5, 3, 3.5, 2.5, c);
  p.hline(5, 10, 4, c);
  p.hline(2, 6, 1, 'white');
  p.hline(6, 10, 5, 'ink');
  return p.outline('ink');
}

/** Stůl se stopami: hrnek se rtěnkou, pouzdro na brýle, zrzavý vlas, deníček a svíčka. */
function desk(s: LairStyle, taken: number): PixelCanvas {
  const p = new PixelCanvas(40, 26);
  for (const x of [2, 36]) p.rect(x, 14, 2, 12, s.woodSh);
  p.rect(0, 10, 40, 5, s.wood);
  p.hline(0, 39, 10, s.woodHi);
  p.hline(0, 39, 14, s.woodSh);
  // ubrousek / dečka
  if (s.bows) p.rect(6, 10, 28, 2, 'bone');
  // svíčka
  p.rect(2, 5, 2, 5, 'bone');
  p.set(2, 4, 'gold');
  p.set(2, 3, 'amber');
  p.set(3, 4, 'sand');
  const has = (i: number) => !(taken & (1 << i));
  // 0 hrnek se rtěnkou
  if (has(0)) {
    p.rect(7, 4, 5, 6, 'white');
    p.vline(11, 4, 9, 'fog');
    p.vline(12, 5, 7, 'white');
    p.set(13, 6, 'white');
    p.hline(8, 9, 4, 'scarlet');
    p.set(8, 5, 'scarlet');
    heartAt(p, 8, 6, s.heart);
  }
  // 1 pouzdro na brýle (otevřené, brýle uvnitř)
  if (has(1)) {
    p.rect(15, 7, 9, 3, s.clothSh === 'dusk' ? 'plum' : 'maroon');
    p.hline(15, 23, 7, 'scarlet');
    p.ellipse(17, 6, 1.6, 1.4, 'ink');
    p.ellipse(21, 6, 1.6, 1.4, 'ink');
    p.set(17, 6, 'ice');
    p.set(21, 6, 'ice');
    p.set(19, 6, 'ink');
  }
  // 2 zrzavý vlas (kudrnatý, přes desku)
  if (has(2)) {
    for (let i = 0; i < 9; i++) p.set(25 + i, 9 + Math.round(Math.sin(i * 1.3) * 0.7), i % 2 ? 'copper' : 'ochre');
  }
  // 3 deníček se srdíčkovým zámkem
  if (has(3)) {
    p.rect(28, 4, 8, 6, s.bows ? 'scarlet' : 'plum');
    p.vline(28, 4, 9, 'blood');
    p.hline(29, 35, 4, s.bows ? 'skin' : 'mauve');
    heartAt(p, 30, 6, 'gold');
  }
  return p.outline('ink');
}

/** Vzkaz („Tvoje strážkyně ♥“) – růžový lísteček s polibkem. */
function letter(): PixelCanvas {
  const p = new PixelCanvas(10, 8);
  p.rect(0, 0, 10, 8, 'bone');
  p.hline(0, 9, 0, 'white');
  for (const y of [2, 4]) p.hline(1, 8, y, 'fog');
  kissAt(p, 2, 3);
  return p.outline('ink');
}

/** Nápoj lásky: lahvička ve tvaru srdce s růžovým lektvarem. */
function lovePotion(): PixelCanvas {
  const p = new PixelCanvas(11, 13);
  p.rect(4, 0, 3, 2, 'rust');
  p.rect(4, 2, 3, 2, 'ice');
  heartAt(p, 2, 4, 'scarlet', undefined, true);
  p.hline(3, 7, 6, 'red');
  p.set(3, 5, 'white');
  p.set(4, 5, 'skin');
  p.hline(4, 6, 8, 'red');
  return p.outline('ink');
}

/** Podstavec pro nápoj lásky: sloupek se zlatým lemem a růžovým polštářkem (vedle stolu se stopami). */
function potionStand(): PixelCanvas {
  const p = new PixelCanvas(14, 20);
  // polštářek
  p.ellipse(7, 3, 6, 2, 'scarlet');
  p.hline(3, 10, 2, 'red');
  p.set(4, 2, 'white');
  p.hline(1, 12, 5, 'maroon');
  for (const x of [1, 4, 7, 10, 12]) p.set(x, 6, 'gold');
  // sloupek
  p.rect(5, 6, 4, 11, 'bone');
  p.vline(5, 6, 16, 'white');
  p.vline(8, 6, 16, 'fog');
  p.hline(4, 9, 9, 'gold');
  p.hline(4, 9, 13, 'gold');
  // podstava
  p.rect(2, 17, 10, 3, 'tan');
  p.hline(2, 11, 17, 'bone');
  return p.outline('ink');
}

/** Bublina „Zzz“ / „!“ pro zajatce. */
function zzz(): PixelCanvas {
  const p = new PixelCanvas(11, 9);
  p.template(['wwww......', '..w.......', '.w..www...', 'wwww..w...', '.....w..ww', '....www..w', '........w.', '........ww'], 1, 0);
  return p.outline('ink');
}

// ------------------------------------------------------------ výplň místností (kutilský sklep)

/** Děrovaná deska s nářadím na zdi: pilka, kladivo, kleště, klubko provazu, nůžky, peříčka. */
function pegboard(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(34, 22);
  p.rect(0, 0, 34, 22, s.woodSh);
  p.rect(1, 1, 32, 20, s.corkSh);
  for (let y = 3; y < 21; y += 3) for (let x = 3; x < 33; x += 3) p.set(x, y, 'olive');
  // pilka
  p.rect(3, 4, 3, 4, s.wood);
  for (let x = 6; x < 14; x++) {
    p.set(x, 5, s.metalHi);
    p.set(x, 6, s.metal);
    if (x % 2) p.set(x, 7, s.metal);
  }
  // kladivo
  p.vline(18, 4, 12, s.woodHi);
  p.rect(16, 3, 5, 2, s.metal);
  p.set(16, 3, s.metalHi);
  // kleště
  p.set(24, 4, s.metal); p.set(25, 5, s.metal); p.set(26, 6, s.metal); p.set(28, 4, s.metal); p.set(27, 5, s.metal);
  p.vline(25, 7, 11, 'red'); p.vline(27, 7, 11, 'red');
  // klubko provazu
  p.ellipse(7, 15, 3.2, 3.2, 'tan');
  for (const [x, y] of [[5, 14], [7, 16], [9, 14], [6, 17]]) p.set(x, y, 'olive');
  p.vline(7, 11, 12, 'tan');
  // nůžky
  p.ellipse(15, 17, 1.4, 1.4, 'red'); p.ellipse(18, 17, 1.4, 1.4, 'red');
  p.set(16, 15, s.metalHi); p.set(17, 14, s.metalHi); p.set(17, 15, s.metalHi); p.set(16, 14, s.metalHi);
  // svazek peříček na háčku
  for (let i = 0; i < 3; i++) for (let k = 0; k < 6; k++) p.set(24 + i * 2 + (k > 3 ? 1 : 0), 12 + k, k % 2 ? 'bone' : 'white');
  p.set(26, 11, s.metal);
  return p.outline('ink');
}

/** Ponk se svěrákem, hoblíkem a rozdělaným peříčkovým kolem. */
function workbench(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(42, 26);
  post(p, s, 2, 13, 3, 13);
  post(p, s, 37, 13, 3, 13);
  plank(p, s, 3, 21, 36, 2, 5);
  plank(p, s, 0, 9, 42, 5, 11);
  // spodní polička s bednou hřebíků
  p.rect(8, 17, 8, 4, s.woodHi);
  p.hline(8, 15, 17, s.wood);
  for (let x = 9; x < 15; x += 2) p.set(x, 18, s.metalHi);
  // svěrák
  p.rect(32, 4, 7, 5, s.metal);
  p.hline(32, 38, 4, s.metalHi);
  p.rect(34, 2, 3, 2, s.metal);
  p.hline(30, 41, 6, s.metalHi);
  p.set(30, 7, s.metal); p.set(41, 7, s.metal);
  // hoblík
  p.rect(4, 6, 8, 3, s.woodHi);
  p.rect(7, 4, 2, 2, s.wood);
  p.hline(4, 11, 8, s.woodSh);
  // rozdělané kolečko s peříčky
  p.ellipse(20, 7, 2, 2, s.metal);
  p.set(20, 7, s.metalHi);
  for (const [dx, dy] of [[3, -1], [4, -2], [-3, -1], [-4, -2], [0, -3], [0, -4]]) p.set(20 + dx, 7 + dy, 'white');
  // hobliny
  for (const [x, y] of [[14, 8], [15, 7], [26, 8], [27, 8], [25, 7]]) p.set(x, y, 'sand');
  return p.outline('ink');
}

/** Regál se zavařovačkami: jahodová marmeláda, peříčka, rtěnky, knoflíky, provaz. */
function jarShelf(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(30, 34);
  post(p, s, 0, 0, 2, 34);
  post(p, s, 28, 0, 2, 34);
  for (const y of [9, 20, 31]) plank(p, s, 0, y, 30, 3, y);
  const jar = (x: number, y: number, fill: PalKey, fill2: PalKey, lid: PalKey) => {
    p.rect(x, y, 5, 6, 'ice');
    p.rect(x + 1, y + 2, 3, 4, fill);
    p.set(x + 2, y + 3, fill2);
    p.hline(x, x + 4, y - 1, lid);
    p.set(x, y + 1, 'white');
  };
  // horní: jahodová marmeláda (3×) s kostkovaným víčkem
  jar(3, 3, 'red', 'scarlet', 'red');
  jar(10, 3, 'red', 'scarlet', 'white');
  jar(17, 3, 'scarlet', 'red', 'red');
  heartAt(p, 23, 5, 'scarlet');
  // prostřední: peříčka, knoflíky, rtěnky
  jar(3, 14, 'white', 'bone', s.metal);
  jar(10, 14, 'sand', 'blue', s.metal);
  for (let i = 0; i < 4; i++) {
    p.rect(18 + i * 2, 16, 1, 4, 'gold');
    p.set(18 + i * 2, 15, 'scarlet');
  }
  // spodní: smotaný provaz a krabice „ZÁSOBY“
  p.ellipse(7, 28, 4, 2.5, 'tan');
  p.ellipse(7, 28, 2, 1, 'olive');
  p.rect(15, 24, 11, 7, s.corkSh);
  p.hline(15, 25, 24, s.cork);
  p.hline(17, 23, 27, 'olive');
  return p.outline('ink');
}

/** Bedny na sobě (jedna s jahodami). */
function crates(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(22, 26);
  const crate = (x: number, y: number, w: number, h: number) => {
    p.rect(x, y, w, h, s.wood);
    p.rect(x + 1, y + 1, w - 2, h - 2, s.woodHi);
    for (let i = 0; i < Math.min(w, h) - 2; i++) p.set(x + 1 + i * ((w - 2) / (h - 2)), y + 1 + i, s.woodSh);
    p.hline(x, x + w - 1, y + h - 1, s.woodSh);
  };
  crate(0, 12, 22, 14);
  crate(3, 2, 15, 11);
  // jahody navrchu
  for (const [x, y] of [[5, 1], [8, 0], [11, 1], [14, 0], [7, 2], [12, 2]]) {
    p.set(x, y, 'scarlet');
    p.set(x + 1, y, 'red');
    p.set(x, y - 1, 'green');
  }
  return p.outline('ink');
}

/** Pytel (s peřím, trochu vylézá). */
function sack(): PixelCanvas {
  const p = new PixelCanvas(14, 16);
  p.ellipse(7, 10, 6, 5.5, 'tan');
  p.ellipse(6, 9, 4, 3.5, 'sand');
  p.rect(5, 2, 4, 4, 'tan');
  p.hline(4, 9, 4, 'olive');
  for (const [x, y] of [[6, 1], [7, 0], [8, 1], [9, 0]]) p.set(x, y, 'white');
  for (const [x, y] of [[3, 11], [10, 8], [8, 13]]) p.set(x, y, 'mauve');
  return p.outline('ink');
}

/** Řetězy s okovy na zdi. */
function wallChains(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(16, 20);
  p.rect(6, 0, 4, 3, s.metal);
  p.set(7, 1, s.metalHi);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const x = 8 + side * (1 + i);
      const y = 3 + i * 2;
      p.set(x, y, i % 2 ? s.metalHi : s.metal);
      p.set(x, y + 1, s.metal);
    }
    p.ellipse(8 + side * 6, 17, 2, 1.6, s.metal);
    p.set(8 + side * 6, 17, null);
  }
  return p.outline('ink');
}

/** Klec z prutů (prázdná, jen zapomenutý klobouk). */
function cage(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(22, 30);
  p.rect(1, 26, 20, 3, s.wood);
  p.hline(1, 20, 26, s.woodHi);
  for (let x = 2; x < 21; x += 3) p.vline(x, 5, 25, s.metal);
  p.hline(1, 20, 5, s.metalHi);
  p.hline(1, 20, 15, s.metal);
  for (let i = 0; i < 9; i++) p.hline(1 + i, 20 - i, 5 - Math.floor(i / 2), s.metal);
  p.vline(11, 0, 1, s.metal);
  // dvířka se zámkem
  p.rect(9, 16, 4, 3, s.metalHi);
  // klobouk uvnitř
  p.rect(7, 23, 8, 2, 'olive');
  p.rect(9, 20, 4, 3, 'olive');
  p.hline(9, 12, 22, 'red');
  return p.outline('ink');
}

/** Šňůra s „trofejemi“: ponožky, čepice a kravata po zajatcích. */
function clothesline(): PixelCanvas {
  const p = new PixelCanvas(60, 16);
  for (let x = 0; x < 60; x++) p.set(x, 1 + Math.round(Math.sin((x / 59) * Math.PI) * 3), 'tan');
  const at = (x: number) => 2 + Math.round(Math.sin((x / 59) * Math.PI) * 3);
  const peg = (x: number) => p.set(x, at(x) - 1, 'copper');
  // ponožka
  let y = at(6);
  p.rect(5, y, 3, 7, 'bone'); p.rect(5, y + 6, 6, 3, 'bone'); p.hline(5, 7, y + 1, 'red'); peg(6);
  // čepice
  y = at(16);
  p.rect(13, y, 7, 4, 'blue'); p.hline(13, 22, y + 4, 'navy'); p.set(16, y - 1, 'white'); peg(16);
  // kravata
  y = at(27);
  p.rect(26, y, 3, 2, 'plum'); for (let i = 0; i < 7; i++) p.hline(26 - (i > 1 && i < 6 ? 1 : 0), 28 + (i > 1 && i < 6 ? 1 : 0), y + 2 + i, i % 3 ? 'plum' : 'sand'); peg(27);
  // druhá ponožka (děravá)
  y = at(37);
  p.rect(36, y, 3, 7, 'fog'); p.rect(36, y + 6, 6, 3, 'fog'); p.set(40, y + 7, 'ink'); peg(37);
  // trenýrky se srdíčky
  y = at(49);
  p.rect(45, y, 10, 5, 'white'); p.rect(45, y + 5, 4, 3, 'white'); p.rect(51, y + 5, 4, 3, 'white');
  heartAt(p, 46, y + 1, 'scarlet'); p.set(53, y + 2, 'scarlet'); peg(47); peg(53);
  return p.outline('ink');
}

/** Vybledlý koberec se srdcem uprostřed. */
function rug(): PixelCanvas {
  const p = new PixelCanvas(56, 30);
  p.rect(2, 1, 52, 28, 'maroon');
  p.rect(4, 3, 48, 24, 'red');
  p.rect(6, 5, 44, 20, 'maroon');
  for (let x = 2; x < 54; x += 2) {
    p.set(x, 0, 'tan');
    p.set(x, 29, 'tan');
  }
  for (let x = 8; x < 48; x += 6) {
    p.set(x, 7, 'sand');
    p.set(x + 3, 22, 'sand');
  }
  heartAt(p, 24, 11, 'scarlet', 'skin', true);
  // ošoupané místo
  for (const [x, y] of [[15, 12], [16, 13], [40, 18], [41, 18], [12, 20]]) p.set(x, y, 'mauve');
  return p;
}

/** Shluk svíček na podlaze (2 snímky plamene). */
function candles(f: number): PixelCanvas {
  const p = new PixelCanvas(14, 14);
  const c = (x: number, h: number) => {
    p.rect(x, 13 - h, 2, h, 'bone');
    p.set(x, 13 - h, 'white');
    p.set(x + (f ? 1 : 0), 12 - h, 'gold');
    p.set(x + (f ? 0 : 1), 11 - h, 'amber');
    p.set(x + 1, 13 - h + 1, 'fog');
  };
  c(1, 6);
  c(5, 9);
  c(9, 4);
  p.hline(0, 12, 13, 'bone');
  return p.outline('ink');
}

/** Koš s peřím. */
function featherBasket(): PixelCanvas {
  const p = new PixelCanvas(16, 14);
  for (let y = 6; y < 14; y++) p.hline(1 + Math.floor((y - 6) / 4), 14 - Math.floor((y - 6) / 4), y, y % 2 ? 'copper' : 'rust');
  for (let x = 2; x < 14; x += 2) p.vline(x, 6, 13, 'olive');
  for (const [x, y] of [[3, 4], [4, 3], [5, 2], [8, 3], [9, 1], [10, 2], [12, 4], [6, 5], [11, 5]]) p.set(x, y, 'white');
  for (const [x, y] of [[4, 5], [9, 4], [10, 5]]) p.set(x, y, 'bone');
  p.ellipse(7.5, 5, 6, 1.5, 'white');
  return p.outline('ink');
}

/** Visací petrolejka (zdroj světla, 2 snímky plamene). */
function hangLamp(f: number): PixelCanvas {
  const p = new PixelCanvas(10, 18);
  p.vline(5, 0, 6, 'slate');
  p.hline(3, 7, 7, 'slate');
  p.rect(2, 8, 7, 7, 'ice');
  p.rect(3, 9, 5, 5, 'sand');
  p.set(5, 10 + f, 'white');
  p.set(5, 11, 'gold');
  p.hline(2, 8, 15, 'slate');
  p.hline(3, 7, 16, 'copper');
  return p.outline('ink');
}

/** Koza na řezání s rozřezaným polenem. */
function sawhorse(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(24, 16);
  for (let i = 0; i < 9; i++) {
    p.set(3 + i * 0.4, 7 + i, s.woodSh);
    p.set(7 - i * 0.4, 7 + i, s.wood);
    p.set(17 + i * 0.4, 7 + i, s.woodSh);
    p.set(21 - i * 0.4, 7 + i, s.wood);
  }
  plank(p, s, 0, 5, 24, 3, 2);
  p.ellipse(12, 3, 8, 2.5, 'olive');
  p.ellipse(19.5, 3, 1.4, 2.3, 'sand');
  p.set(19, 3, 'ochre');
  return p.outline('ink');
}

/** Zrcadlo se srdíčkem namalovaným rtěnkou. */
function lipMirror(s: LairStyle): PixelCanvas {
  const p = new PixelCanvas(16, 20);
  p.ellipse(8, 10, 7.5, 9.5, s.woodHi);
  p.ellipse(8, 10, 6, 8, 'ice');
  p.ellipse(6, 7, 2, 3, 'white');
  heartAt(p, 5, 9, 'scarlet', undefined, true);
  p.set(6, 10, 'ice');
  p.set(10, 11, 'ice');
  return p.outline('ink');
}

/** Vývěska s „hledanými“ dlužníky. */
function wanted(): PixelCanvas {
  const p = new PixelCanvas(14, 18);
  p.rect(0, 0, 14, 18, 'bone');
  p.hline(0, 13, 0, 'white');
  p.hline(2, 11, 2, 'ink');
  p.rect(3, 4, 8, 7, 'fog');
  p.rect(5, 5, 4, 4, 'skin');
  p.hline(5, 8, 5, 'olive');
  p.set(6, 7, 'ink');
  p.set(8, 7, 'ink');
  p.hline(4, 9, 9, 'slate');
  for (const y of [13, 15]) p.hline(2, 11, y, 'slate');
  p.set(11, 15, 'red');
  p.set(7, 0, 'red');
  return p.outline('ink');
}

export function buildAdmirerArt(style: 'A' | 'B' | 'C' = 'B'): Record<string, PixelCanvas> {
  const s = LAIR_STYLES[style];
  return {
    heartWall: heartWall(false),
    heartWallOpen: heartWall(true),
    tickler0: tickler(s, 0),
    tickler1: tickler(s, 1),
    organ0: organ(s, 0),
    organ1: organ(s, 1),
    musicNote: note(), // ne „note“ – to je papírový vzkaz (objects.ts)
    stocks: stocks(s),
    rack0: rack(s, 0),
    rack1: rack(s, 1),
    rackSign: sign(s),
    bucket0: bucket(s, 0),
    bucket1: bucket(s, 1),
    lairDesk: desk(s, 0),
    kiss: kiss(),
    lostCap: lostCap('blue'),
    lairLetter: letter(),
    zzz: zzz(),
    lovePotion: lovePotion(),
    potionStand: potionStand(),
    loveHeart: (() => {
      const p = new PixelCanvas(9, 8);
      heartAt(p, 1, 1, 'scarlet', 'white', true);
      return p.outline('ink');
    })(),
    pegboard: pegboard(s),
    workbench: workbench(s),
    jarShelf: jarShelf(s),
    crates: crates(s),
    sack: sack(),
    wallChains: wallChains(s),
    cage: cage(s),
    clothesline: clothesline(),
    rug: rug(),
    candles0: candles(0),
    candles1: candles(1),
    featherBasket: featherBasket(),
    hangLamp0: hangLamp(0),
    hangLamp1: hangLamp(1),
    sawhorse: sawhorse(s),
    lipMirror: lipMirror(s),
    wanted: wanted(),
  };
}
