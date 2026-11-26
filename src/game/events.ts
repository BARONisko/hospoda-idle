// Náhodné události s ťukáním: zlatý sud, nájezd žab, netopýr (upíří hodina), banshee karaoke.
// Objekty událostí žijí ve světě hospody (jako hosté), takže je vidí jen kamera dané hospody.
import Phaser from 'phaser';
import { t } from '../i18n';
import { PAL } from '../data/palette';
import { txt } from '../ui/font';
import { sfx } from '../core/sfx';
import { big } from '../core/num';
import type { PubView } from './PubView';

export type EventKind = 'gold' | 'frogs' | 'bat' | 'banshee' | 'brawl' | 'wedding';
export const EVENT_KINDS: EventKind[] = ['gold', 'frogs', 'bat', 'banshee', 'brawl'];
/** ★6 Rekonstrukce: svatba v hospodě (návrh A, tanec novomanželů) */
export const EVENT_EXTRA: EventKind[] = ['wedding'];

/** co událost potřebuje od scény */
export interface EventHost {
  views: PubView[];
  /** odměna = tolik sekund výdělku; vrací částku */
  reward(secs: number, view: number): number;
  /** pokuta = tolik sekund výdělku; vrací částku */
  fine(secs: number, view: number): number;
  banner(c: Phaser.Cameras.Scene2D.Camera, text: string, top?: boolean): void;
  /** upíří hodina: ×2 výdělek do (ms) */
  boostAll(ms: number): void;
  /** událost proběhla (pro úkoly a sbírku) */
  onEvent?(kind: EventKind, ok: boolean): void;
  /** stat „rvačka kratší“ (0–0,7) */
  brawlCut?(): number;
  /** události navíc (★6 svatba), losují se mezi ostatními */
  extraKinds?(): EventKind[];
}

interface Target {
  spr: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  hit: () => void;
}

export class PubEvents {
  /** násobek výdělku hospody kvůli rvačce (hosté utíkají): klesá až na 20 % */
  brawlMult(view: number) {
    const a = this.active;
    return a && a.kind === 'brawl' && a.view === view ? Math.max(0.2, 1 - 0.04 * a.t) : 1;
  }

  /** do další události (s) */
  next = 40;
  /** násobek intervalu mezi událostmi (vylepšení z krígel) */
  freq = 1;
  active: { kind: EventKind; view: number; t: number; dur: number; targets: Target[]; objs: Phaser.GameObjects.GameObject[]; off: (() => void)[]; hits: number } | null = null;

  constructor(private s: Phaser.Scene, private host: EventHost) {}

  update(dt: number) {
    const a = this.active;
    if (a) {
      a.t += dt;
      if (a.kind === 'brawl' && Math.floor(a.t / 3) !== Math.floor((a.t - dt) / 3)) this.host.views[a.view].leaveOne();
      if (a.t >= a.dur) {
        // rvačka se po čase uklidní sama (přání uživatele: idle hra nesmí trestat, že se hráč nedívá)
        if (a.kind === 'brawl') this.host.banner(this.host.views[a.view].cam, t('Rvačka skončila, hosté se vracejí.'));
        this.end(false);
      }
      return;
    }
    this.next -= dt;
    if (this.next <= 0) this.start(Phaser.Utils.Array.GetRandom([...EVENT_KINDS, ...(this.host.extraKinds?.() ?? [])]));
  }

  /** ťuknutí do hospody (souřadnice světa); true = trefa */
  tap(view: number, wx: number, wy: number) {
    const a = this.active;
    if (!a || a.view !== view) return false;
    for (const tg of a.targets) {
      if (!tg.spr.active) continue;
      const b = Phaser.Geom.Rectangle.Inflate(tg.spr.getBounds(), 8, 8);
      if (Phaser.Geom.Rectangle.Contains(b, wx, wy)) {
        tg.hit();
        return true;
      }
    }
    return false;
  }

  // QA hospoda 66: událost jen v hospodě, kterou hráč právě vidí (v jiné ji nešlo najít a rvačka tam trvala donekonečna)
  start(kind: EventKind, view = this.host.views.length > 1 ? (this.host as unknown as { sel: number }).sel ?? 0 : 0) {
    if (this.active) this.end(false);
    const v = this.host.views[view];
    const wv = v.cam.worldView;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const targets: Target[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => {
      objs.push(o);
      this.s.events.emit('pubObj', o);
      return o;
    };
    // plocha, kde se události ukazují (viditelná část hospody)
    const x0 = wv.x + 16, x1 = wv.right - 16, y0 = wv.y + 24, y1 = wv.bottom - 10;
    this.active = { kind, view, t: 0, dur: 10, targets, objs, off: [], hits: 0 };
    const a = this.active;

    if (kind === 'gold') {
      a.dur = 9;
      const y = Phaser.Math.Between(Math.round((y0 + y1) / 2), Math.round(y1));
      const keg = add(this.s.add.image(x0 - 10, y, 'obj', 'kegGold').setOrigin(0.5, 1).setScale(1.6).setDepth(4000));
      this.s.tweens.add({ targets: keg, x: x1 + 10, duration: a.dur * 1000, ease: 'Linear' });
      this.s.tweens.add({ targets: keg, angle: { from: -8, to: 8 }, yoyo: true, repeat: -1, duration: 260 });
      targets.push({
        spr: keg,
        hit: () => {
          const n = this.host.reward(60, view);
          this.host.banner(v.cam, t('Zlatý sud! +{n}', { n: big(n) }));
          this.end(true);
        },
      });
      this.host.banner(v.cam, t('Zlatý sud se kutálí!'), true);
    } else if (kind === 'frogs') {
      a.dur = 10;
      for (let i = 0; i < 6; i++) {
        const f = add(this.s.add.sprite(Phaser.Math.Between(x0, x1), Phaser.Math.Between(y0 + 20, y1), 'zabak', 0).setOrigin(0.5, 1).setDepth(4000).setScale(1.2));
        this.hop(f, x0, x1, y0 + 20, y1);
        targets.push({
          spr: f,
          hit: () => {
            const n = this.host.reward(6, view);
            this.pop(f.x, f.y - 20, '+' + big(n));
            sfx.tip();
            f.destroy();
            a.hits++;
            if (a.hits >= 6) {
              this.host.banner(v.cam, t('Žáby vyhnány!'));
              this.end(true);
            }
          },
        });
      }
      this.host.banner(v.cam, t('Nájezd žab! Ťukej na ně!'), true);
    } else if (kind === 'bat') {
      a.dur = 8;
      const bat = add(this.s.add.sprite(x1 + 10, y0 + 30, 'bat', 0).setDepth(4000).setScale(1.5));
      this.s.tweens.add({ targets: bat, x: x0 - 10, duration: a.dur * 1000 });
      this.s.tweens.add({ targets: bat, y: y0 + 80, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.inOut' });
      const flap = this.s.time.addEvent({ delay: 140, loop: true, callback: () => bat.active && bat.setFrame(bat.frame.name === '0' ? 1 : 0) });
      a.off.push(() => flap.remove());
      targets.push({
        spr: bat,
        hit: () => {
          this.host.boostAll(60_000);
          this.host.banner(v.cam, t('Upíří hodina! ×2 na 60 s'));
          this.end(true);
        },
      });
      this.host.banner(v.cam, t('Netopýr! Chyť ho!'), true);
    } else if (kind === 'brawl') {
      // rvačka trvá, dokud ji hráč nerozežene, nejdéle ~1 min (pak se uklidní sama, bez odměny); mezitím odcházejí hosté a výdělek klesá
      const cut = this.host.brawlCut?.() ?? 0;
      a.dur = Math.max(20, Math.round(60 * (1 - cut)));
      const need = Math.max(3, Math.round(10 * (1 - cut)));
      // jen na podlaze hospody (ne u horní zdi s policemi ani za barem): dlaždice x 2–17, y 6,7–12,5
      const fx0 = Math.max(x0 + 30, v.ox + 2 * 16), fx1 = Math.min(x1 - 30, v.ox + 17 * 16);
      // ne za ikonami číšníků a ×1 dole ve výřezu (řada ikon ~95 px obrazovky nad spodním okrajem)
      const fy0 = Math.max(y0 + 50, 6 * 16 + 12), fy1 = Math.min(y1 + 10 - 100 / (v.cam?.zoom || 1), 12 * 16 + 8);
      const cx = fx1 > fx0 ? Phaser.Math.Between(Math.round(fx0), Math.round(fx1)) : v.ox + 9 * 16;
      const cy = fy1 > fy0 ? Phaser.Math.Between(Math.round(fy0), Math.round(fy1)) : 9 * 16;
      const pool = v.guestKeys();
      const f1 = add(this.s.add.sprite(cx - 10, cy, Phaser.Utils.Array.GetRandom(pool), 8).setOrigin(0.5, 1).setDepth(4000));
      const f2 = add(this.s.add.sprite(cx + 10, cy, Phaser.Utils.Array.GetRandom(pool), 8).setOrigin(0.5, 1).setDepth(4000).setFlipX(true));
      const cloud = add(this.s.add.image(cx, cy + 4, 'obj', 'dust').setOrigin(0.5, 1).setDepth(3999).setScale(1.3).setAlpha(0.7));
      this.s.tweens.add({ targets: cloud, angle: { from: -12, to: 12 }, scaleX: { from: 1.1, to: 1.5 }, yoyo: true, repeat: -1, duration: 150 });
      this.s.tweens.add({ targets: f1, x: cx - 6, yoyo: true, repeat: -1, duration: 180 });
      this.s.tweens.add({ targets: f2, x: cx + 6, yoyo: true, repeat: -1, duration: 200, delay: 90 });
      const ang = add(this.s.add.image(cx, cy - 26, 'obj', 'anger').setDepth(4002).setScale(1.2));
      this.s.tweens.add({ targets: ang, y: cy - 30, yoyo: true, repeat: -1, duration: 200 });
      const hit = () => {
        a.hits++;
        sfx.click();
        this.s.tweens.add({ targets: [f1, f2], y: cy - 3, yoyo: true, duration: 80 });
        if (a.hits >= need) {
          this.host.banner(v.cam, t('Rvačka skončila, hosté se vracejí.'));
          this.end(true);
        }
      };
      targets.push({ spr: cloud, hit }, { spr: f1, hit }, { spr: f2, hit });
      this.host.banner(v.cam, t('Rvačka! Hosté odcházejí – ťukej na rváče!'), true);
    } else if (kind === 'wedding') {
      // svatba: novomanželé tančí uprostřed sálu, nad nimi dar – 5 darů za sebou (každý ťuk = výdělek), pak velký dar
      a.dur = 20;
      const need = 5;
      const cx = v.ox + 8.5 * 16, cy = Phaser.Math.Clamp(11.2 * 16, y0 + 50, y1 - 6);
      const ring = add(this.s.add.ellipse(cx, cy - 1, 44, 12, 0xffd23f, 0.35).setDepth(3998));
      this.s.tweens.add({ targets: ring, alpha: 0.15, yoyo: true, repeat: -1, duration: 600 });
      const pool = v.guestKeys();
      const bride = add(this.s.add.sprite(cx - 7, cy, Phaser.Utils.Array.GetRandom(pool), 0).setOrigin(0.5, 1).setDepth(4000));
      const groom = add(this.s.add.sprite(cx + 7, cy, Phaser.Utils.Array.GetRandom(pool), 0).setOrigin(0.5, 1).setDepth(4000).setFlipX(true));
      // závoj a motýlek (kreslené, jedou s postavami)
      const veil = add(this.s.add.graphics().setDepth(4001));
      veil.fillStyle(0xffffff, 1).fillRect(-4, -23, 8, 3).fillRect(-5, -20, 2, 10).fillRect(3, -20, 2, 10);
      const tie = add(this.s.add.graphics().setDepth(4001));
      tie.fillStyle(0x111111, 1).fillRect(-3, -13, 6, 3);
      const sync = () => (veil.setPosition(bride.x, bride.y), tie.setPosition(groom.x, groom.y));
      sync();
      this.s.tweens.add({ targets: [bride, groom], y: cy - 2, yoyo: true, repeat: -1, duration: 260, onUpdate: sync });
      this.s.tweens.add({ targets: bride, x: cx - 4, yoyo: true, repeat: -1, duration: 520, ease: 'Sine.inOut', onUpdate: sync });
      this.s.tweens.add({ targets: groom, x: cx + 4, yoyo: true, repeat: -1, duration: 520, ease: 'Sine.inOut', onUpdate: sync });
      const hearts = this.s.time.addEvent({
        delay: 450,
        loop: true,
        callback: () => {
          const h = add(this.s.add.image(cx + Phaser.Math.Between(-24, 24), cy - 18, 'obj', 'loveHeart').setDepth(4002));
          this.s.tweens.add({ targets: h, y: h.y - 22, alpha: 0, duration: 1200, onComplete: () => h.destroy() });
        },
      });
      a.off.push(() => hearts.remove());
      const gift = add(this.s.add.image(cx, cy - 34, 'obj', 'chest').setDepth(4003).setScale(1.2));
      this.s.tweens.add({ targets: gift, y: cy - 38, yoyo: true, repeat: -1, duration: 400, ease: 'Sine.inOut' });
      const cnt = add(this.s.add.text(cx, cy - 54, `0 / ${need}`, txt(12, PAL.gold)).setOrigin(0.5).setDepth(4004).setResolution(3).setStroke(PAL.ink, 4));
      targets.push({
        spr: gift,
        hit: () => {
          a.hits++;
          cnt.setText(`${a.hits} / ${need}`);
          const n = this.host.reward(15, view);
          this.pop(gift.x, gift.y - 10, '+' + big(n));
          sfx.tip();
          gift.setPosition(cx + Phaser.Math.Between(-20, 20), cy - 34);
          if (a.hits >= need) {
            const m = this.host.reward(90, view);
            this.host.banner(v.cam, t('Svatební dar! +{n}', { n: big(m) }));
            this.end(true);
          }
        },
      });
      this.host.banner(v.cam, t('Svatba v hospodě! Ťukej na dary!'), true);
    } else {
      a.dur = 9;
      const need = 12;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + 20;
      const bn = add(this.s.add.sprite(cx, cy, 'banshee', 0).setOrigin(0.5, 1).setDepth(4000).setScale(2));
      this.s.tweens.add({ targets: bn, y: cy - 6, yoyo: true, repeat: -1, duration: 400, ease: 'Sine.inOut' });
      const cnt = add(this.s.add.text(cx, cy - 46, `0 / ${need}`, txt(12, PAL.gold)).setOrigin(0.5).setDepth(4001).setResolution(3).setStroke(PAL.ink, 4));
      targets.push({
        spr: bn,
        hit: () => {
          a.hits++;
          cnt.setText(`${a.hits} / ${need}`);
          sfx.note(a.hits);
          this.s.tweens.add({ targets: bn, scale: { from: 2.3, to: 2 }, duration: 100 });
          if (a.hits >= need) {
            const n = this.host.reward(120, view);
            this.host.banner(v.cam, t('Karaoke hit! +{n}', { n: big(n) }));
            this.end(true);
          }
        },
      });
      this.host.banner(v.cam, t('Banshee karaoke! Ťukej do rytmu!'), true);
    }
  }

  private hop(f: Phaser.GameObjects.Sprite, x0: number, x1: number, y0: number, y1: number) {
    if (!f.active) return;
    const nx = Phaser.Math.Clamp(f.x + Phaser.Math.Between(-40, 40), x0, x1);
    const ny = Phaser.Math.Clamp(f.y + Phaser.Math.Between(-24, 24), y0, y1);
    f.setFlipX(nx < f.x);
    this.s.tweens.add({ targets: f, x: nx, duration: 420, ease: 'Linear' });
    this.s.tweens.add({ targets: f, y: { from: f.y, to: ny }, duration: 420, onUpdate: (tw) => f.active && f.setY(f.y - Math.sin(tw.progress * Math.PI) * 1.2) });
    this.s.time.delayedCall(Phaser.Math.Between(500, 900), () => this.hop(f, x0, x1, y0, y1));
  }

  private pop(x: number, y: number, text: string) {
    const tx = this.s.add.text(x, y, text, txt(10, PAL.mint)).setOrigin(0.5).setDepth(5000).setResolution(3);
    this.s.events.emit('pubObj', tx);
    this.s.tweens.add({ targets: tx, y: y - 18, alpha: 0, duration: 900, onComplete: () => tx.destroy() });
  }

  end(ok: boolean) {
    const a = this.active;
    if (!a) return;
    this.active = null;
    this.host.onEvent?.(a.kind, ok);
    a.off.forEach((f) => f());
    for (const o of a.objs) {
      if (!o.active) continue;
      this.s.tweens.killTweensOf(o);
      this.s.tweens.add({ targets: o, alpha: 0, duration: 300, onComplete: () => o.destroy() });
    }
    this.next = Phaser.Math.Between(90, 180) * this.freq;
  }
}

