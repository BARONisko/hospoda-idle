import { PixelCanvas, hash } from './pixel';
import type { PalKey } from '../data/palette';

// Vzhled hospody za diamanty (jen vzhled): pípa, stoly, lustr – tři styly návrhů (a = zlato a mahagon,
// b = selská dubová, c = grand hotel). Klíče v atlasu „obj“: luxTap_<s>, luxTable_<s>, luxLamp_<s>.

export type LuxStyle = 'a' | 'b' | 'c';

/** zdobená pípa: věžička se dvěma kohouty a ozdobou nahoře */
function luxTap(s: LuxStyle): PixelCanvas {
  const p = new PixelCanvas(20, 24);
  const [main, light, dark]: PalKey[] = s === 'c' ? ['ice', 'white', 'sky'] : s === 'b' ? ['copper', 'ochre', 'rust'] : ['gold', 'sand', 'amber'];
  // miska
  p.rect(1, 19, 18, 3, 'slate');
  p.hline(1, 18, 19, 'fog');
  for (let x = 2; x < 18; x += 2) p.set(x, 20, 'dusk');
  // sloup (širší) s prstenci
  p.rect(6, 8, 8, 11, main);
  p.vline(6, 8, 18, light);
  p.vline(7, 8, 18, light);
  p.vline(13, 8, 18, dark);
  for (const y of [10, 15]) p.hline(6, 13, y, dark);
  p.rect(5, 17, 10, 2, dark);
  // dva kohouty
  p.rect(2, 11, 4, 2, main);
  p.set(2, 13, dark);
  p.set(2, 14, dark);
  p.rect(14, 11, 4, 2, main);
  p.set(17, 13, dark);
  p.set(17, 14, dark);
  // páky
  p.rect(3, 5, 2, 6, s === 'b' ? 'olive' : 'ink');
  p.rect(15, 5, 2, 6, s === 'b' ? 'olive' : 'ink');
  p.rect(2, 4, 4, 2, s === 'c' ? 'scarlet' : s === 'b' ? 'green' : 'red');
  p.rect(14, 4, 4, 2, s === 'c' ? 'scarlet' : s === 'b' ? 'green' : 'red');
  // ozdoba nahoře
  if (s === 'a') {
    // korunka
    p.rect(7, 4, 6, 4, 'gold');
    p.set(7, 2, 'gold'), p.set(7, 3, 'gold'), p.set(10, 1, 'gold'), p.vline(10, 1, 3, 'gold'), p.set(12, 2, 'gold'), p.set(12, 3, 'gold');
    p.set(9, 5, 'scarlet'), p.set(11, 5, 'sky');
    p.hline(7, 12, 7, 'amber');
  } else if (s === 'b') {
    // dřevěný sudový uzávěr s chmelem
    p.ellipse(10, 5, 4, 3, 'rust');
    p.hline(7, 13, 5, 'copper');
    p.set(9, 3, 'green'), p.set(10, 2, 'mint'), p.set(11, 3, 'green'), p.set(10, 4, 'green');
  } else {
    // křišťálová koule
    p.ellipse(10, 4, 3.5, 3.5, 'ice');
    p.set(9, 3, 'white'), p.set(8, 4, 'white');
    p.hline(8, 12, 7, 'sky');
  }
  if (s !== 'b') p.set(8, 12, 'white'), p.set(8, 16, 'white');
  p.outline('ink');
  return p;
}

/** stůl 34×22 jako běžný, jiné dřevo a zdobení */
function luxTable(s: LuxStyle): PixelCanvas {
  const p = new PixelCanvas(34, 22);
  const top: PalKey = s === 'a' ? 'maroon' : s === 'b' ? 'sand' : 'rust';
  const hi: PalKey = s === 'a' ? 'red' : s === 'b' ? 'white' : 'copper';
  const grain: PalKey = s === 'a' ? 'blood' : s === 'b' ? 'ochre' : 'blood';
  p.rect(1, 1, 32, 12, top);
  p.hline(2, 31, 1, hi);
  for (const sx of [8, 16, 25]) p.vline(sx, 2, 12, grain);
  for (let i = 0; i < 18; i++) {
    const x = 2 + Math.floor(hash(i, 1, 93) * 29);
    const y = 3 + Math.floor(hash(i, 2, 93) * 8);
    p.set(x, y, grain);
    if (s === 'b') p.set(x + 1, y, grain), p.set(x + 2, y, grain);
  }
  if (s === 'a') {
    // zlatá lišta kolem desky
    p.hline(1, 32, 12, 'gold');
    p.rect(1, 13, 32, 3, 'blood');
    p.hline(1, 32, 13, 'amber');
    p.rect(3, 16, 3, 4, 'blood');
    p.rect(28, 16, 3, 4, 'blood');
    p.set(4, 17, 'gold'), p.set(29, 17, 'gold');
  } else if (s === 'b') {
    // selský běhoun červeno-bílý přes střed
    for (let x = 1; x <= 32; x++) for (let y = 5; y <= 8; y++) p.set(x, y, (x + y) % 2 ? 'scarlet' : 'white');
    p.rect(1, 13, 32, 3, 'ochre');
    p.hline(1, 32, 15, 'copper');
    // masivní nohy
    p.rect(2, 16, 4, 4, 'copper');
    p.rect(28, 16, 4, 4, 'copper');
  } else {
    // bílý ubrus přes okraj, svíčka uprostřed
    p.rect(1, 1, 32, 15, 'white');
    p.hline(1, 32, 12, 'bone');
    p.rect(1, 13, 32, 3, 'bone');
    for (let x = 2; x <= 31; x += 3) p.set(x, 15, 'fog');
    p.rect(3, 16, 2, 4, 'blood');
    p.rect(29, 16, 2, 4, 'blood');
    p.rect(16, 4, 2, 4, 'bone');
    p.set(16, 2, 'gold'), p.set(16, 3, 'amber');
    p.hline(15, 18, 8, 'gold');
  }
  p.outline('ink');
  return p;
}

/** vyřízne elipsu (průhledná) */
function hole(p: PixelCanvas, cx: number, cy: number, rx: number, ry: number) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) p.set(x, y, null);
}

/** lustr se svíčkami (visí od stropu) */
function luxLamp(s: LuxStyle): PixelCanvas {
  const p = new PixelCanvas(44, 34);
  const metal: PalKey = s === 'b' ? 'dusk' : s === 'c' ? 'fog' : 'gold';
  const metalHi: PalKey = s === 'b' ? 'slate' : s === 'c' ? 'white' : 'sand';
  // řetěz
  for (let y = 0; y < 12; y++) p.set(22, y, y % 2 ? metal : metalHi);
  if (s === 'b') {
    // kolo od vozu
    p.ellipse(22, 22, 18, 5, metal);
    hole(p, 22, 22, 15, 3);
    p.hline(5, 39, 22, metal);
    p.vline(22, 13, 27, metal);
    p.hline(5, 39, 18, metalHi);
    p.rect(20, 12, 5, 4, 'rust');
  } else {
    // ramena
    p.rect(20, 12, 5, 9, metal);
    p.vline(20, 12, 20, metalHi);
    p.ellipse(22, 22, 17, 4, metal);
    hole(p, 22, 21, 14, 2);
    p.hline(6, 38, 20, metalHi);
    p.ellipse(22, 25, 3, 3, metal);
    if (s === 'c') {
      // křišťálové ověsy
      for (const x of [8, 13, 18, 26, 31, 36]) {
        p.vline(x, 25, 28, 'ice');
        p.set(x, 29, 'white');
      }
      p.vline(22, 28, 32, 'ice');
      p.set(22, 33, 'white');
    }
  }
  // svíčky
  for (const x of [6, 13, 22, 31, 38]) {
    p.rect(x - 1, 13, 3, 5, 'bone');
    p.vline(x - 1, 13, 17, 'white');
    p.set(x, 11, 'gold');
    p.set(x, 12, 'amber');
    p.set(x, 10, 'sand');
  }
  p.outline('ink');
  return p;
}

/** záře lustru na podlaze */
function luxGlow(): PixelCanvas {
  const p = new PixelCanvas(60, 20);
  for (let y = 0; y < 20; y++)
    for (let x = 0; x < 60; x++) {
      const dx = (x - 30) / 30, dy = (y - 10) / 10, r = dx * dx + dy * dy;
      if (r < 1 && hash(x, y, 7) < 0.55 - r * 0.5) p.set(x, y, 'sand');
    }
  return p;
}

export function buildLux(): Record<string, PixelCanvas> {
  const o: Record<string, PixelCanvas> = {};
  for (const s of ['a', 'b', 'c'] as LuxStyle[]) {
    o[`luxTap_${s}`] = luxTap(s);
    o[`luxTable_${s}`] = luxTable(s);
    o[`luxLamp_${s}`] = luxLamp(s);
  }
  o.luxGlow = luxGlow();
  return o;
}
