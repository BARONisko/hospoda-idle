// Neviditelně větší dotyková místa (QA hospoda 76): malé tlačítko dostane kolem sebe větší zónu (min. TOUCH_MIN
// logických px = ~44 CSS px na telefonu), vzhled se nemění. Zóna se ale nesmí dotknout sousedního ovládacího prvku:
// k sousedovi se zvětší nejvýš o polovinu mezery (druhou polovinu si vezme soused), nepřeleze spodní lištu ani okraj.

export interface R {
  x: number;
  y: number;
  w: number;
  h: number;
}
/** cílová velikost dotykového místa (logické px; 59 ≈ 44 CSS px při šířce 405) */
export const TOUCH_MIN = 59;

/** přesah zóny na každou stranu (l, t, r, b) */
export type Pad = [number, number, number, number];

const over = (a0: number, a1: number, b0: number, b1: number) => Math.min(a1, b1) - Math.max(a0, b0) > 0;

/**
 * Spočítá přesahy pro zóny `rs` (viditelné obdélníky tlačítek). `obst` jsou další ovládací prvky (jen překážky,
 * nezvětšují se); obdélník, který tlačítko protíná (pozadí okna, karta…), se nepočítá. `bound` = kam smí zóna sahat.
 */
export function fitPads(rs: { r: R; obst: R[]; bound: R; depth?: number; floor?: number }[], min = TOUCH_MIN): Pad[] {
  // j je pro i soused, jen když není schovaný pod oknem, ve kterém i leží (depth j ≥ floor i)
  const sees = (i: number, j: number) => i !== j && (rs[j].depth ?? 0) >= (rs[i].floor ?? -Infinity);
  const pads: Pad[] = rs.map(({ r, obst, bound }, i) => {
    // sousedé: ostatní tlačítka (jejich viditelný obdélník) + jiné ovládací prvky
    const others = [...obst, ...rs.filter((_, j) => sees(i, j)).map((o) => o.r)].filter(
      (o) => !(over(r.x, r.x + r.w, o.x, o.x + o.w) && over(r.y, r.y + r.h, o.y, o.y + o.h)),
    );
    const split = (need: number, a: number, b: number): [number, number] => {
      let p = Math.min(a, need / 2);
      const q = Math.min(b, need - p);
      p = Math.min(a, need - q);
      return [Math.max(0, p), Math.max(0, q)];
    };
    // 1) svisle: sousedé nad a pod tlačítkem (překrývají se s ním vodorovně)
    let maxT = r.y - bound.y, maxB = bound.y + bound.h - (r.y + r.h);
    for (const o of others) {
      if (!over(r.x, r.x + r.w, o.x, o.x + o.w)) continue;
      if (o.y + o.h <= r.y) maxT = Math.min(maxT, (r.y - (o.y + o.h)) / 2);
      else if (o.y >= r.y + r.h) maxB = Math.min(maxB, (o.y - (r.y + r.h)) / 2);
    }
    const [t, b] = split(Math.max(0, min - r.h), maxT, maxB);
    // 2) vodorovně: sousedé vlevo a vpravo v už zvětšeném svislém rozsahu
    const y0 = r.y - t, y1 = r.y + r.h + b;
    let maxL = r.x - bound.x, maxR = bound.x + bound.w - (r.x + r.w);
    for (const o of others) {
      if (!over(y0, y1, o.y, o.y + o.h)) continue;
      if (o.x + o.w <= r.x) maxL = Math.min(maxL, (r.x - (o.x + o.w)) / 2);
      else if (o.x >= r.x + r.w) maxR = Math.min(maxR, (o.x - (r.x + r.w)) / 2);
    }
    const [l, rr] = split(Math.max(0, min - r.w), maxL, maxR);
    return [l, t, rr, b];
  });
  // 3) pojistka: dvě zvětšené zóny přes sebe (sousedé šikmo) → obě zkrátit k polovině mezery na ose, kde se míjí víc
  const ext = (i: number): R => {
    const { r } = rs[i], [l, t, rr, b] = pads[i];
    return { x: r.x - l, y: r.y - t, w: r.w + l + rr, h: r.h + t + b };
  };
  for (let k = 0; k < 4; k++) {
    let hit = false;
    for (let i = 0; i < rs.length; i++)
      for (let j = i + 1; j < rs.length; j++) {
        if (!sees(i, j) || !sees(j, i)) continue;
        const a = ext(i), c = ext(j);
        if (!(over(a.x, a.x + a.w, c.x, c.x + c.w) && over(a.y, a.y + a.h, c.y, c.y + c.h))) continue;
        const A = rs[i].r, C = rs[j].r;
        if (over(A.x, A.x + A.w, C.x, C.x + C.w) && over(A.y, A.y + A.h, C.y, C.y + C.h)) continue; // samy se překrývají
        hit = true;
        const gx = Math.max(C.x - (A.x + A.w), A.x - (C.x + C.w)), gy = Math.max(C.y - (A.y + A.h), A.y - (C.y + C.h));
        const pi = pads[i], pj = pads[j];
        if (gx >= gy) {
          const g = Math.max(0, gx) / 2;
          if (C.x >= A.x + A.w) (pi[2] = Math.min(pi[2], g)), (pj[0] = Math.min(pj[0], g));
          else (pi[0] = Math.min(pi[0], g)), (pj[2] = Math.min(pj[2], g));
        } else {
          const g = Math.max(0, gy) / 2;
          if (C.y >= A.y + A.h) (pi[3] = Math.min(pi[3], g)), (pj[1] = Math.min(pj[1], g));
          else (pi[1] = Math.min(pi[1], g)), (pj[3] = Math.min(pj[3], g));
        }
      }
    if (!hit) break;
  }
  return pads;
}
