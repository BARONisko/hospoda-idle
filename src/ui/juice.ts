// Efekty „B – výbušné“ (schváleno uživatelem): paprsky, konfety, fontána mincí, velký nápis, otřes, kombo.
// Vše jsou krátké tweeny nad hrou; nic neblokuje dotyk.
import Phaser from 'phaser';
import { PAL } from '../data/palette';
import { txt } from './font';

const CONF = [0xff5c5c, 0x7fe0a0, 0x6fb3ff, 0xffd75e, 0xd78bff, 0xffffff];
const rnd = Phaser.Math.FloatBetween;

/** konfety vystřelené z bodu (padají s gravitací a točí se) */
export function confetti(s: Phaser.Scene, x: number, y: number, n = 40, depth = 460, spread = 1) {
  for (let i = 0; i < n; i++) {
    const r = s.add.rectangle(x, y, rnd(5, 9), rnd(8, 14), CONF[i % CONF.length]).setDepth(depth).setAngle(rnd(0, 360));
    const a = rnd(-Math.PI, 0), v = rnd(180, 420) * spread;
    const vx = Math.cos(a) * v, vy = Math.sin(a) * v;
    const dur = rnd(900, 1500);
    s.tweens.addCounter({
      from: 0,
      to: 1,
      duration: dur,
      onUpdate: (tw) => {
        const k = tw.getValue() ?? 0, tt = (k * dur) / 1000;
        r.setPosition(x + vx * tt, y + vy * tt + 520 * tt * tt);
        r.setAngle(r.angle + 9);
        r.setAlpha(1 - k * k);
      },
      onComplete: () => r.destroy(),
    });
  }
}

/** otáčející se paprsky za nápisem */
export function rays(s: Phaser.Scene, x: number, y: number, depth = 455, rad = 420) {
  const g = s.add.graphics().setDepth(depth).setPosition(x, y);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.fillStyle(i % 2 ? 0xffd75e : 0xff9a3c, 0.32).slice(0, 0, rad, a, a + Math.PI / 16, false).fillPath();
  }
  g.setScale(0.2).setAlpha(0);
  s.tweens.add({ targets: g, scale: 1, alpha: 1, duration: 300, ease: 'Back.out' });
  s.tweens.add({ targets: g, angle: 40, duration: 1800 });
  s.tweens.add({ targets: g, alpha: 0, delay: 1300, duration: 500, onComplete: () => g.destroy() });
}

/** velký nápis (+ menší pod ním), naskočí a zmizí */
export function bigText(s: Phaser.Scene, x: number, y: number, text: string, sub = '', depth = 465, color: string = PAL.gold) {
  const a = s.add.text(x, y, text, txt(64, color)).setOrigin(0.5).setDepth(depth).setStroke(PAL.ink, 10);
  a.setScale(Math.min(1, 500 / a.width));
  const sc = a.scale;
  const objs: Phaser.GameObjects.Text[] = [a];
  if (sub) objs.push(s.add.text(x, y + 56, sub, txt(32, PAL.white)).setOrigin(0.5).setDepth(depth).setStroke(PAL.ink, 7));
  objs.forEach((o, i) => {
    const k = i ? 1 : sc;
    o.setScale(0.2 * k);
    s.tweens.add({ targets: o, scale: k, duration: 380, delay: i * 120, ease: 'Back.out' });
    s.tweens.add({ targets: o, y: o.y - 30, alpha: 0, delay: 1500, duration: 500, onComplete: () => o.destroy() });
  });
}

/** fontána mincí; když je cíl (počítadlo), mince k němu doletí */
export function coinFountain(s: Phaser.Scene, x: number, y: number, n = 14, to?: [number, number], depth = 462, onHit?: () => void) {
  for (let i = 0; i < n; i++) {
    const c = s.add.image(x, y, 'obj', 'coin').setScale(rnd(2.4, 3.6)).setDepth(depth);
    const a = -Math.PI / 2 + rnd(-0.9, 0.9), r = rnd(50, 160);
    s.tweens.add({
      targets: c,
      x: x + Math.cos(a) * r,
      y: y + Math.sin(a) * r,
      duration: 320,
      ease: 'Quad.out',
      onComplete: () => {
        if (!to) {
          s.tweens.add({ targets: c, y: c.y + 60, alpha: 0, duration: 400, delay: 100, onComplete: () => c.destroy() });
          return;
        }
        s.tweens.add({
          targets: c,
          x: to[0],
          y: to[1],
          scale: 2,
          duration: rnd(380, 620),
          delay: i * 25,
          ease: 'Quad.in',
          onComplete: () => {
            c.destroy();
            onHit?.();
          },
        });
      },
    });
  }
}

/** číslo, které vyskočí a odletí (např. „+1“ nad tlačítkem) */
export function popText(s: Phaser.Scene, x: number, y: number, text: string, color: string = PAL.gold, size = 30, depth = 458) {
  const o = s.add.text(x, y, text, txt(size, color)).setOrigin(0.5).setDepth(depth).setStroke(PAL.ink, 6).setScale(0.5);
  s.tweens.add({ targets: o, scale: 1.15, duration: 140, ease: 'Back.out', yoyo: true, hold: 60 });
  s.tweens.add({ targets: o, y: y - 60, alpha: 0, delay: 350, duration: 650, onComplete: () => o.destroy() });
}

/** poskočení (tlačítko, počítadlo) – vrací cíl do původní velikosti */
export function punch(s: Phaser.Scene, targets: Phaser.GameObjects.GameObject[], amount = 1.12) {
  for (const t of targets as unknown as Phaser.GameObjects.Components.Transform[]) {
    s.tweens.killTweensOf(t);
    const base = (t as unknown as { pScale?: number }).pScale ?? t.scaleX;
    (t as unknown as { pScale?: number }).pScale = base;
    t.setScale(base);
    s.tweens.add({ targets: t, scaleX: base * amount, scaleY: base * amount, duration: 90, yoyo: true, ease: 'Quad.out' });
  }
}

/** záblesk obdélníku (karta při nákupu) */
export function flashRect(s: Phaser.Scene, x: number, y: number, w: number, h: number, depth = 457, color = 0xffffff) {
  const g = s.add.graphics().setDepth(depth);
  g.fillStyle(color, 0.35).fillRoundedRect(x, y, w, h, 10);
  g.lineStyle(4, 0xffd75e).strokeRoundedRect(x, y, w, h, 10);
  s.tweens.add({ targets: g, alpha: 0, duration: 450, onComplete: () => g.destroy() });
}

/** návod: zlatý rámeček kolem cíle, houpající se šipka a jeden řádek textu (přání uživatele: šipkou, málo textu).
 *  below = šipka zespodu (míří nahoru), text pod ní. Vrací objekty ke smazání. */
export function pointAt(s: Phaser.Scene, r: number[], text: string, depth: number, below = false, textY?: number): Phaser.GameObjects.GameObject[] {
  const [x, y, w, h] = r;
  const ink = Phaser.Display.Color.HexStringToColor(PAL.ink).color, gold = Phaser.Display.Color.HexStringToColor(PAL.gold).color;
  const fr = s.add.graphics().setDepth(depth);
  fr.lineStyle(4, gold).strokeRoundedRect(x - 4, y - 4, w + 8, h + 8, 10);
  s.tweens.add({ targets: fr, alpha: 0.35, yoyo: true, repeat: -1, duration: 450 });
  const ax = x + w / 2, ay = below ? y + h + 34 : y - 34;
  const ar = s.add.graphics().setDepth(depth + 1).setPosition(ax, ay);
  const tri = (c: number, g: number) => ar.fillStyle(c).fillTriangle(-20 - g, -12 - g, 20 + g, -12 - g, 0, 20 + g).fillRect(-8 - g, -36 - g, 16 + g * 2, 26);
  tri(ink, 4);
  tri(gold, 0);
  if (below) ar.setAngle(180);
  s.tweens.add({ targets: ar, y: ay + (below ? 8 : -8), yoyo: true, repeat: -1, duration: 380, ease: 'Sine.inOut' });
  const W = s.scale.width;
  const tx = s.add.text(W / 2, textY ?? (below ? ay + 58 : ay - 58), text, txt(24, PAL.gold)).setOrigin(0.5).setDepth(depth + 1).setBackgroundColor(PAL.ink).setPadding(12, 6, 12, 6);
  tx.setScale(Math.min(1, (W - 30) / tx.width));
  return [fr, ar, tx];
}
