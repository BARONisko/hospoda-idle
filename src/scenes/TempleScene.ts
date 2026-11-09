import { GEMS_FREE } from '../core/special';
// Chrám v potopeném R'lyeh – víkendový boss. Akční: ťukání do Cthulhu, swipe seká chapadla, inkoust se stírá,
// hlubinní lezou na molo. Oltář má svíce (životy kola). Kultisté (max 2) po stranách sekají chapadla sami.
import Phaser from 'phaser';
import { PAL } from '../data/palette';
import { txt } from '../ui/font';
import { t } from '../i18n';
import { big } from '../core/num';
import { sfx } from '../core/sfx';
import { confetti, rays, bigText, pointAt } from '../ui/juice';
import { STAT_NAMES, OSSUARY, TEMPLE_STATS, type StatId } from '../core/talisman';
import {
  TempleState, templeState, cultIdle, isWeekend, msToSwitch, ROUNDS_PER_DAY, ROUND_S, bossHp, DIFFS, DIFF_REW, DIFF_NAMES, setDiff, ALTAR_PER, altarCost, weekendKey, tapPower, chestTen, TEMPLE_UPS, SEAL_BONUS,
} from '../core/temple';

const W = 540, H = 960;
const col = (k: keyof typeof PAL) => Phaser.Display.Color.HexStringToColor(PAL[k]).color;
const SEA = 600; // hladina (obrazovka)
const PIER = 800; // molo
const ALTAR = { x: 270, y: 790 };

/** co chrám potřebuje od hospody */
export interface TempleHost {
  templeData(): TempleState;
  /** výdělek coins/s (síla zásahu – jen logaritmicky) */
  templeIncome(): number;
  templeStats(): Record<StatId, number>;
  /** odměny do hlavní hry; vrací text pro hlášku */
  templeReward(kind: 'talis' | 'krigle' | 'bones' | 'seal' | 'stat' | 'darts' | 'gems', n: number): string;
  templeSave(): void;
  /** přepočítat staty (po oltáři) */
  templeRefresh?(): void;
  /** kolik krígel dá obchod chrámu (roste s tvými krígly) */
  templeKriglyGift(): number;
  templeClose(): void;
}

interface Tent {
  bx: number; by: number; ax: number; ay: number;
  p: number; growT: number; ph: number; amp: number; curl: number;
  cut: number; // 1 = celé; < 1 useknuté (stáhne se)
  state: 'grow' | 'retract';
  pts: { x: number; y: number; r: number }[];
  hue: number;
}
interface Piece { pts: { x: number; y: number; r: number }[]; vy: number; vx: number; a: number; dy: number; dx: number }
interface Ink { x: number; y: number; r: number; a: number; g: Phaser.GameObjects.Graphics; blobs: [number, number, number][] }
interface Deep { s: Phaser.GameObjects.Sprite; dir: number; dead: boolean }

export class TempleScene extends Phaser.Scene {
  host!: TempleHost;
  T!: TempleState;
  ui: Phaser.GameObjects.GameObject[] = [];
  mode: 'lobby' | 'fight' | 'shop' | 'result' | 'chest' = 'lobby';
  // boj
  tents: Tent[] = [];
  pieces: Piece[] = [];
  inks: Ink[] = [];
  deeps: Deep[] = [];
  g!: Phaser.GameObjects.Graphics;
  fx!: Phaser.GameObjects.Graphics;
  cth!: Phaser.GameObjects.Sprite;
  weak?: { x: number; y: number; until: number; g: Phaser.GameObjects.Graphics };
  candles = 3;
  candleObjs: Phaser.GameObjects.Image[] = [];
  ward = false;
  left = 0;
  spawnT = 0;
  inkT = 0;
  /** délka tahu prstem od položení (px) */
  stroke = 0;
  deepT = 0;
  weakT = 0;
  cultT: number[] = [];
  cults: Phaser.GameObjects.Sprite[] = [];
  last?: { x: number; y: number };
  gotTen = 0;
  dmgDone = 0;
  chestsGot = 0;
  hud?: { ten: Phaser.GameObjects.Text; time: Phaser.GameObjects.Text; hp: Phaser.GameObjects.Graphics; hpT: Phaser.GameObjects.Text; ph: Phaser.GameObjects.Text };
  tm = 0;

  constructor() {
    super('Temple');
  }

  init(data: { host: TempleHost }) {
    this.host = data.host;
  }

  create() {
    this.T = templeState(this.host.templeData());
    this.mode = 'lobby';
    this.tents = []; this.pieces = []; this.inks = []; this.deeps = []; this.cults = []; this.candleObjs = [];
    this.makeBg();
    this.add.image(0, 0, 'rlyehBg').setOrigin(0).setScale(3).setDepth(0);
    this.cth = this.add.sprite(270, SEA + 70, 'kCthulhu', 0).setOrigin(0.5, 1).setScale(3).setDepth(2).play('kc_idle');
    this.tweens.add({ targets: this.cth, y: SEA + 50, yoyo: true, repeat: -1, duration: 2600, ease: 'Sine.inOut' });
    // přední moře (zakryje Cthulhuovi nohy) a molo s oltářem
    const sea = this.add.graphics().setDepth(3);
    sea.fillStyle(0x0f3a35, 0.92).fillRect(0, SEA, W, H - SEA);
    sea.fillStyle(0x06171a, 0.6).fillRect(0, SEA + 200, W, H - SEA - 200);
    for (let i = 0; i < 70; i++) sea.fillStyle(0x3e8f7a, 0.7).fillRect(Phaser.Math.Between(0, W), Phaser.Math.Between(SEA + 4, H), Phaser.Math.Between(6, 18), 3);
    sea.fillStyle(0x6fd3a0, 0.5).fillRect(0, SEA, W, 3);
    this.tweens.add({ targets: sea, x: { from: -4, to: 4 }, yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.inOut' });
    const pier = this.add.graphics().setDepth(6);
    pier.fillStyle(0x2a241c).fillRect(60, PIER + 22, 420, 10);
    for (let i = 0; i < 7; i++) pier.fillStyle(0x2a241c).fillRect(72 + i * 64, PIER + 30, 9, 90);
    pier.fillStyle(0x3a3226).fillRect(50, PIER, 440, 26);
    pier.fillStyle(0x5a4a36).fillRect(50, PIER, 440, 4);
    for (let i = 0; i < 11; i++) pier.fillStyle(0x2a241c).fillRect(50 + i * 40, PIER + 4, 2, 22);
    this.add.image(ALTAR.x, PIER + 4, 'dStatue', 0).setOrigin(0.5, 1).setScale(3).setDepth(7);
    this.g = this.add.graphics().setDepth(8);
    this.fx = this.add.graphics().setDepth(40);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.down(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.move(p));
    this.input.on('pointerup', () => (this.last = undefined));
    this.placeCults();
    this.lobby();
  }

  /** pozadí R'lyeh: zelený měsíc, zkřivené monolity s runami, moře (kreslené kódem, 180×320, zvětšené 3×) */
  private makeBg() {
    if (this.textures.exists('rlyehBg')) return;
    const tex = this.textures.createCanvas('rlyehBg', 180, 320)!;
    const c = tex.getContext();
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const grad = (y0: number, y1: number, a: string, b: string) => {
      const g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, a); g.addColorStop(1, b);
      c.fillStyle = g; c.fillRect(0, y0, 180, y1 - y0);
    };
    const disc = (x: number, y: number, r: number, f: string) => {
      c.fillStyle = f;
      for (let yy = -Math.ceil(r); yy <= r; yy++) for (let xx = -Math.ceil(r); xx <= r; xx++) if (xx * xx + yy * yy <= r * r + 0.3) c.fillRect(Math.round(x + xx), Math.round(y + yy), 1, 1);
    };
    grad(0, 205, '#081512', '#2c5a3e');
    for (let i = 0; i < 70; i++) { c.fillStyle = rnd() < 0.8 ? '#cfe9b066' : '#ffffffaa'; c.fillRect(Math.floor(rnd() * 180), Math.floor(rnd() * 120), 1, 1); }
    disc(132, 58, 20, '#1f4a33'); disc(132, 58, 16, '#2f6b47'); disc(132, 58, 13, '#c9e3a6');
    disc(127, 54, 3, '#a9c98a'); disc(136, 63, 4, '#a9c98a'); disc(139, 52, 2, '#a9c98a');
    // mlha
    c.globalAlpha = 0.25;
    for (let i = 0; i < 9; i++) { c.fillStyle = '#6fbf8f'; c.fillRect(Math.floor(rnd() * 160) - 20, 150 + Math.floor(rnd() * 50), 40 + Math.floor(rnd() * 40), 2); }
    c.globalAlpha = 1;
    const mono = (x: number, y: number, w: number, h: number, tilt: number, f: string) => {
      c.save(); c.translate(x, y); c.transform(1, 0, tilt, 1, 0, 0);
      c.fillStyle = f; c.fillRect(0, -h, w, h);
      c.fillStyle = '#3d6e58'; c.fillRect(0, -h, 1, h); c.fillRect(0, -h, w, 1);
      c.fillStyle = '#0b1c17'; c.fillRect(w - 1, -h, 1, h);
      for (let i = 0; i < h / 7; i++) if (rnd() < 0.7) { c.fillStyle = '#46ff9a'; c.fillRect(2 + Math.floor(rnd() * (w - 5)), -h + 5 + i * 7, 2, 1); c.fillRect(3 + Math.floor(rnd() * (w - 6)), -h + 7 + i * 7, 1, 1); }
      c.restore();
    };
    mono(2, 205, 22, 120, 0.22, '#16302a'); mono(150, 205, 26, 140, -0.28, '#16302a');
    mono(30, 205, 12, 64, -0.18, '#1b3a30'); mono(124, 205, 14, 80, 0.32, '#1b3a30'); mono(64, 205, 9, 40, 0.5, '#1b3a30');
    // oblouk v dálce (neeuklidovský)
    c.strokeStyle = '#21463a'; c.lineWidth = 3; c.beginPath(); c.moveTo(48, 205); c.quadraticCurveTo(70, 120, 112, 160); c.stroke();
    grad(200, 320, '#14423a', '#06171a');
    tex.refresh();
  }

  // ---------- ovládání ----------
  private down(p: Phaser.Input.Pointer) {
    sfx.init();
    this.last = { x: p.x, y: p.y };
    this.stroke = 0;
    if (this.mode !== 'fight') return;
    // hlubinný na molu
    for (const d of this.deeps) if (!d.dead && Phaser.Math.Distance.Between(p.x, p.y, d.s.x, d.s.y - 24) < 46) return this.kickDeep(d);
    // slabé místo
    if (this.weak && Phaser.Math.Distance.Between(p.x, p.y, this.weak.x, this.weak.y) < 40) {
      const w = this.weak;
      this.weak = undefined;
      w.g.destroy();
      this.hit(p.x, p.y, 5 * (1 + this.host.templeStats().weak), true);
      return;
    }
    const b = this.cth.getBounds();
    if (p.y < SEA + 10 && Phaser.Geom.Rectangle.Contains(b, p.x, p.y)) this.hit(p.x, p.y, 1, false);
  }

  private move(p: Phaser.Input.Pointer) {
    if (!p.isDown || !this.last || this.mode !== 'fight') return;
    const a = this.last, bpt = { x: p.x, y: p.y };
    const len = Phaser.Math.Distance.Between(a.x, a.y, bpt.x, bpt.y);
    if (len < 6) return;
    this.last = bpt;
    this.stroke += len;
    // stopa swipu
    this.fx.lineStyle(6, 0xffffff, 0.9).lineBetween(a.x, a.y, bpt.x, bpt.y);
    this.fx.lineStyle(12, 0x8fd3ff, 0.3).lineBetween(a.x, a.y, bpt.x, bpt.y);
    for (const tn of this.tents) {
      if (tn.state !== 'grow') continue;
      const n = tn.pts.length;
      for (let i = 2; i < n; i++) {
        const q = tn.pts[i];
        if (distToSeg(q.x, q.y, a.x, a.y, bpt.x, bpt.y) < q.r + 14) {
          this.cutTent(tn, i / (n - 1), false);
          break;
        }
      }
    }
    // inkoust jde pryč jen stíráním (delší tah prstem), ne ťukáním
    if (this.stroke > 40) for (const k of this.inks) if (distToSeg(k.x, k.y, a.x, a.y, bpt.x, bpt.y) < k.r) k.a -= Math.min(0.12, len * 0.004);
  }

  // ---------- boj ----------
  private power() {
    return tapPower(this.host.templeIncome(), this.T.up.knife ?? 0, this.host.templeStats().temple);
  }

  private tenMult() {
    return (1 + this.host.templeStats().tentacles) * DIFF_REW[this.diff() - 1];
  }

  /** zvolená obtížnost 1–5 */
  private diff() {
    return this.T.diff ?? 1;
  }

  private phase() {
    const hp = this.T.hp;
    return hp > 0.75 ? 1 : hp > 0.5 ? 2 : hp > 0.25 ? 3 : 4;
  }

  private hit(x: number, y: number, mult: number, crit: boolean) {
    const dmg = this.power() * mult;
    this.damage(dmg);
    sfx.coin(crit ? 1.6 : 0.7 + Math.random() * 0.3);
    const tx = this.add.text(x, y - 10, (crit ? t('KRITICKÝ ') : '') + big(Math.round(dmg)), txt(crit ? 30 : 22, crit ? PAL.gold : PAL.white)).setOrigin(0.5).setDepth(45);
    this.tweens.add({ targets: tx, y: y - 70, alpha: 0, duration: 800, onComplete: () => tx.destroy() });
    this.cth.setTintFill(0xffffff);
    this.time.delayedCall(60, () => this.cth.clearTint());
    if (crit) this.cameras.main.shake(140, 0.006);
  }

  private damage(dmg: number) {
    this.dmgDone += dmg;
    this.T.hp -= dmg / bossHp(this.T.boss, this.diff());
    // truhly po 10 %
    while (Math.floor((1 - Math.max(0, this.T.hp)) * 10 + 1e-9) > this.T.chests && this.T.chests < 10) {
      this.T.chests++;
      this.chestsGot++;
      // truhla se otevře až na konci kola (s točením)
      (this.T.pend ??= []).push(this.diff());
      this.flash(t('Truhla! Otevřeš ji na konci kola.'), PAL.gold);
      this.chestFx();
    }
    if (this.T.hp <= 0) this.defeat();
  }

  /** zisk truhly v boji: velký nápis, paprsky, konfety, truhla vyskočí a odletí nahoru, otřes a fanfára */
  private chestFx() {
    const x = W / 2, y = 360, D = 470;
    rays(this, x, y, D - 5, 300);
    bigText(this, x, y - 120, t('TRUHLA!'), '', D + 2);
    confetti(this, x, y, 50, D + 1, 0.9);
    const c = this.add.image(x, y + 40, 'obj', 'chest').setScale(1).setDepth(D);
    this.tweens.add({ targets: c, scale: 7, duration: 380, ease: 'Back.out' });
    this.tweens.add({ targets: c, angle: { from: -10, to: 10 }, yoyo: true, repeat: 3, duration: 90, delay: 380 });
    this.tweens.add({ targets: c, x: W - 60, y: 40, scale: 2, alpha: 0.2, delay: 1100, duration: 500, ease: 'Quad.in', onComplete: () => c.destroy() });
    this.cameras.main.shake(260, 0.012);
    this.cameras.main.flash(180, 255, 220, 120);
    sfx.levelUp();
    sfx.cheer();
  }

  private defeat() {
    this.T.boss++;
    this.T.hp = 1;
    this.T.chests = 0;
    const d = this.diff();
    const seal = this.host.templeReward('seal', 1);
    const tal = this.host.templeReward('talis', 1);
    const kr = this.host.templeReward('krigle', Math.round(this.kriglyGift() * DIFF_REW[d - 1]));
    const dp = this.host.templeReward('darts', 2 * d);
    const gm = this.host.templeReward('gems', GEMS_FREE.boss * d);
    let msg = t('CTHULHU PORAŽEN!') + '\n' + seal + '\n' + tal + '\n' + kr + '\n' + dp + '\n' + gm;
    if (d < DIFFS && (this.T.maxD ?? 1) <= d) {
      this.T.maxD = d + 1;
      msg += '\n' + t('Odemčena obtížnost {d}!', { d: DIFF_NAMES[d] });
    }
    sfx.fanfare();
    this.cameras.main.flash(500, 120, 255, 160);
    this.flash(msg, PAL.mint, 3200);
    this.host.templeSave();
  }

  private addTen(n: number, x: number, y: number) {
    this.T.ten += n;
    this.gotTen += n;
    const tx = this.add.text(x, y, '+' + n, txt(22, PAL.mint)).setOrigin(0.5).setDepth(45);
    this.tweens.add({ targets: tx, y: y - 50, alpha: 0, duration: 900, onComplete: () => tx.destroy() });
  }

  private flash(s: string, c: string, ms = 1600) {
    const tx = this.add.text(W / 2, 380, s, txt(32, c)).setOrigin(0.5).setAlign('center').setDepth(60);
    tx.setScale(Math.min(1, (W - 30) / tx.width));
    this.tweens.add({ targets: tx, scale: { from: tx.scale * 0.6, to: tx.scale }, duration: 220, ease: 'Back.out' });
    this.tweens.add({ targets: tx, alpha: 0, delay: ms, duration: 400, onComplete: () => tx.destroy() });
  }

  private spawnTent() {
    const ph = this.phase();
    const side = Math.random() < 0.5 ? -1 : 1;
    const fromSide = Math.random() < 0.55;
    const bx = fromSide ? (side < 0 ? -30 : W + 30) : Phaser.Math.Between(40, W - 40);
    const by = fromSide ? Phaser.Math.Between(SEA + 40, PIER - 40) : H + 20;
    const ax = ALTAR.x + Phaser.Math.Between(-40, 40), ay = ALTAR.y - 30;
    this.tents.push({
      bx, by, ax, ay, p: 0, growT: ([0, 7.5, 6.5, 6, 4.2][ph] / (1 + 0.1 * (this.diff() - 1))) * Phaser.Math.FloatBetween(0.85, 1.15), ph: Math.random() * 6, amp: Phaser.Math.Between(18, 34) * (Math.random() < 0.5 ? -1 : 1),
      curl: Math.random() < 0.5 ? -1 : 1, cut: 1, state: 'grow', pts: [], hue: Math.random() < 0.15 ? 1 : 0,
    });
  }

  private cutTent(tn: Tent, s: number, byCult: boolean) {
    s = Math.max(0.12, Math.min(0.92, s));
    const n = tn.pts.length;
    const k = Math.floor(s * (n - 1));
    this.pieces.push({ pts: tn.pts.slice(k).map((q) => ({ ...q })), vy: -120, vx: Phaser.Math.Between(-80, 80), a: 1, dy: 0, dx: 0 });
    const q = tn.pts[k];
    // šťáva
    for (let i = 0; i < 8; i++) {
      const sp = this.add.rectangle(q.x, q.y, 6, 6, i % 2 ? 0x9cff7a : 0x2f8f6a).setDepth(41);
      this.tweens.add({ targets: sp, x: q.x + Phaser.Math.Between(-50, 50), y: q.y + Phaser.Math.Between(-50, 30), alpha: 0, duration: 450, onComplete: () => sp.destroy() });
    }
    tn.cut = s;
    tn.state = 'retract';
    const gold = tn.hue === 1;
    const n2 = Math.round((byCult ? 1 + this.host.templeStats().cultgain : 3 + this.phase()) * (gold ? 5 : 1) * this.tenMult());
    this.addTen(n2, q.x, q.y - 20);
    this.damage(this.power() * (byCult ? 1 : 2) * (gold ? 3 : 1));
    sfx.hiss(0.12, 900, 0.08, 300);
  }

  private spawnInk() {
    const x = Phaser.Math.Between(110, W - 110), y = Phaser.Math.Between(260, 700), r = 110;
    const g = this.add.graphics().setDepth(30);
    const blobs: [number, number, number][] = Array.from({ length: 9 }, () => [Phaser.Math.Between(-70, 70), Phaser.Math.Between(-60, 60), Phaser.Math.Between(34, 60)]);
    this.inks.push({ x, y, r, a: 0.95, g, blobs });
    const s = this.add.image(x, y, 'kInk').setScale(6).setDepth(31);
    this.tweens.add({ targets: s, scale: 14, alpha: 0, duration: 380, onComplete: () => s.destroy() });
    this.flash(t('Inkoust! Setři ho prstem'), PAL.ice, 900);
  }

  private spawnDeep() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const s = this.add.sprite(dir > 0 ? 40 : W - 40, PIER + 2, 'deep' + Phaser.Math.Between(0, 2), 0).setOrigin(0.5, 1).setScale(3.4).setDepth(9).setFlipX(dir < 0);
    s.y = PIER + 60;
    this.tweens.add({ targets: s, y: PIER + 2, duration: 500 });
    this.deeps.push({ s, dir, dead: false });
  }

  private kickDeep(d: Deep) {
    d.dead = true;
    sfx.coin(1.2);
    this.addTen(Math.round(5 * this.tenMult()), d.s.x, d.s.y - 60);
    this.tweens.add({ targets: d.s, y: d.s.y + 160, x: d.s.x - d.dir * 120, angle: 360 * -d.dir, alpha: 0, duration: 700, onComplete: () => d.s.destroy() });
  }

  private loseCandle(x: number, y: number) {
    if (Math.random() < Math.min(0.5, this.host.templeStats().candlesave)) {
      this.flash(t('Svíce se nezhasla!'), PAL.gold, 900);
      return;
    }
    if (this.ward) {
      this.ward = false;
      this.flash(t('Amulet ochránil oltář!'), PAL.ice, 900);
      return;
    }
    this.candles--;
    sfx.error();
    this.cameras.main.shake(200, 0.01);
    const c = this.candleObjs[this.candles];
    if (c) c.setTintFill(col('slate')).setAlpha(0.6);
    const tx = this.add.text(x, y, t('svíce zhasla!'), txt(22, PAL.scarlet)).setOrigin(0.5).setDepth(45);
    this.tweens.add({ targets: tx, y: y - 50, alpha: 0, duration: 900, onComplete: () => tx.destroy() });
    if (this.candles <= 0) this.endRound(t('Oltář zhasl!'));
  }

  update(_t: number, dms: number) {
    const dt = Math.min(0.05, dms / 1000);
    this.tm += dt;
    // stopa swipu bledne
    this.fx.clear();
    this.g.clear();
    if (this.mode === 'fight') this.fightTick(dt);
    this.drawTents(dt);
  }

  private fightTick(dt: number) {
    this.left -= dt;
    const ph = this.phase();
    // vyšší obtížnost: víc a rychlejších chapadel, inkoust a hlubinní dřív a častěji
    const k = this.diff() - 1, fast = 1 + 0.18 * k;
    this.spawnT -= dt;
    if (this.spawnT <= 0 && this.tents.filter((x) => x.state === 'grow').length < [0, 4, 5, 5, 7][ph] + k) {
      this.spawnTent();
      this.spawnT = ([0, 2.6, 2.2, 2, 1.3][ph] / fast) * Phaser.Math.FloatBetween(0.7, 1.2);
    }
    if (ph >= 2 || k >= 2) {
      this.inkT -= dt;
      if (this.inkT <= 0 && this.inks.length < 2 + Math.floor(k / 2)) { this.spawnInk(); this.inkT = (ph >= 4 ? 6 : 9) / fast; }
    }
    if (ph >= 3 || k >= 3) {
      this.deepT -= dt;
      if (this.deepT <= 0) { this.spawnDeep(); this.deepT = (ph >= 4 ? 3 : 4.5) / fast; }
    }
    // slabé místo na Cthulhuovi
    this.weakT -= dt;
    if (this.weakT <= 0 && !this.weak) {
      const b = this.cth.getBounds();
      const x = Phaser.Math.Between(b.x + 70, b.right - 70), y = Phaser.Math.Between(b.y + 50, Math.min(SEA - 30, b.bottom - 40));
      const g = this.add.graphics().setDepth(20);
      this.weak = { x, y, until: this.tm + 2.6, g };
      this.weakT = 4.5;
    }
    if (this.weak) {
      const w = this.weak, k = 0.5 + 0.5 * Math.sin(this.tm * 12);
      w.g.clear().lineStyle(5, col('gold'), 0.9).strokeCircle(w.x, w.y, 22 + k * 6).fillStyle(col('gold'), 0.25 + k * 0.3).fillCircle(w.x, w.y, 14);
      w.g.fillStyle(col('scarlet')).fillCircle(w.x, w.y, 5);
      if (this.tm > w.until) { w.g.destroy(); this.weak = undefined; }
    }
    // chapadla rostou k oltáři
    for (const tn of this.tents) {
      if (tn.state === 'grow') {
        tn.p += dt / tn.growT;
        if (tn.p >= 1) { tn.state = 'retract'; tn.cut = 1; this.loseCandle(tn.ax, tn.ay - 30); if (this.mode !== 'fight') return; }
      }
    }
    // hlubinní jdou k oltáři
    for (const d of this.deeps) {
      if (d.dead) continue;
      d.s.x += d.dir * 48 * dt;
      d.s.setFrame(Math.floor(this.tm * 6) % 2 ? 1 : 2);
      if (Math.abs(d.s.x - ALTAR.x) < 30) { d.dead = true; d.s.destroy(); this.loseCandle(ALTAR.x, PIER - 60); if (this.mode !== 'fight') return; }
    }
    this.deeps = this.deeps.filter((d) => d.s.active);
    // inkoust
    for (const k of this.inks) {
      k.g.clear();
      for (const [ox, oy, r] of k.blobs) k.g.fillStyle(0x1a0f24, Math.max(0, k.a)).fillCircle(k.x + ox, k.y + oy, r);
      k.g.fillStyle(0x6b3e75, Math.max(0, k.a) * 0.5).fillCircle(k.x - 20, k.y - 25, 16);
    }
    this.inks = this.inks.filter((k) => (k.a > 0.12 ? true : (k.g.destroy(), false)));
    // kultisté sekají
    this.cults.forEach((c, i) => {
      this.cultT[i] -= dt;
      if (this.cultT[i] > 0) return;
      const side = i === 0 ? -1 : 1;
      const tg = this.tents.filter((x) => x.state === 'grow' && x.p > 0.35).sort((a, b) => Math.sign(a.bx - ALTAR.x) * side < Math.sign(b.bx - ALTAR.x) * side ? 1 : b.p - a.p)[0];
      if (!tg) return;
      this.cultT[i] = 3.2;
      const k = Math.floor(tg.pts.length * 0.55), q = tg.pts[k];
      const sl = this.add.image(q.x, q.y, 'kSlash').setScale(3).setDepth(42).setFlipX(side > 0);
      this.tweens.add({ targets: sl, alpha: 0, scale: 4, duration: 300, onComplete: () => sl.destroy() });
      this.tweens.add({ targets: c, y: c.y - 16, yoyo: true, duration: 120 });
      this.cutTent(tg, 0.55, true);
    });
    this.hudTick();
    if (this.left <= 0) this.endRound(t('Čas vypršel'));
  }

  /** kreslení chapadel: zúžené, vlnící se, přísavky dole, stočená špička */
  private drawTents(dt: number) {
    const g = this.g;
    for (const tn of this.tents) {
      if (tn.state === 'retract') tn.p -= dt * 1.6;
      const dx = tn.ax - tn.bx, dy = tn.ay - tn.by, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      const N = 30, pts: Tent['pts'] = [];
      const reach = Math.max(0, tn.p) * len;
      const maxS = tn.state === 'retract' ? tn.cut : 1;
      for (let i = 0; i <= N; i++) {
        const s = i / N;
        if (s > maxS) break;
        const w = Math.sin(s * Math.PI * 1.7 + tn.ph + this.tm * 2.6) * tn.amp * Math.min(1, s * 1.5);
        const tip = s > 0.78 ? (s - 0.78) / 0.22 : 0;
        const x = tn.bx + ux * reach * s + nx * (w + tn.curl * tip * tip * 26) - ux * tip * tip * 14;
        const y = tn.by + uy * reach * s + ny * (w + tn.curl * tip * tip * 26) - uy * tip * tip * 14;
        pts.push({ x: Math.round(x / 3) * 3, y: Math.round(y / 3) * 3, r: Math.max(3, 21 * Math.pow(1 - s, 0.8) * Math.min(1, 0.4 + tn.p)) });
      }
      tn.pts = pts;
      drawTentacle(g, pts, tn.hue === 1);
    }
    this.tents = this.tents.filter((x) => !(x.state === 'retract' && x.p <= 0));
    for (const pc of this.pieces) {
      pc.vy += 600 * dt;
      pc.dy += pc.vy * dt;
      pc.dx += pc.vx * dt;
      pc.a -= dt * 1.4;
      drawTentacle(g, pc.pts.map((q) => ({ x: q.x + pc.dx, y: q.y + pc.dy, r: q.r })), false, Math.max(0, pc.a));
    }
    this.pieces = this.pieces.filter((p) => p.a > 0);
  }

  // ---------- kultisté ----------
  private placeCults() {
    this.cults.forEach((c) => c.destroy());
    this.cults = [];
    const n = this.T.up.kult ?? 0;
    for (let i = 0; i < n; i++) {
      const c = this.add.sprite(i === 0 ? 110 : W - 110, PIER + 4, 'cultist' + (i * 3), 0).setOrigin(0.5, 1).setScale(3.4).setDepth(9).setFlipX(i === 1);
      this.tweens.add({ targets: c, scaleY: 3.5, yoyo: true, repeat: -1, duration: 700 + i * 90 });
      this.cults.push(c);
    }
    this.cultT = this.cults.map((_, i) => 1 + i);
  }

  // ---------- obrazovky ----------
  private clearUi() {
    this.ui.forEach((o) => o.destroy());
    this.ui = [];
    this.tutClear();
    this.hud = undefined;
  }

  private panel(y: number, h: number, a = 0.85) {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(col('ink'), a).fillRoundedRect(14, y, W - 28, h, 14);
    g.lineStyle(3, col('mint'), 0.7).strokeRoundedRect(14, y, W - 28, h, 14);
    this.ui.push(g);
    return g;
  }

  private text(x: number, y: number, s: string, size: number, c: string = PAL.bone, ox = 0) {
    const o = this.add.text(x, y, s, txt(size, c)).setOrigin(ox, 0).setDepth(52);
    this.ui.push(o);
    return o;
  }

  private button(x: number, y: number, w: number, h: number, label: string, c: keyof typeof PAL, ok: boolean, fn: () => void) {
    const g = this.add.graphics().setDepth(53);
    g.fillStyle(col('ink')).fillRoundedRect(x, y + 4, w, h, 9);
    g.fillStyle(col(ok ? c : 'slate')).fillRoundedRect(x, y, w, h, 9);
    g.fillStyle(0xffffff, ok ? 0.15 : 0.06).fillRoundedRect(x + 3, y + 3, w - 6, h / 3, 6);
    const tx = this.add.text(x + w / 2, y + h / 2, label, txt(h > 50 ? 22 : 18, ok ? PAL.white : PAL.fog)).setOrigin(0.5).setAlign('center').setDepth(54);
    tx.setScale(Math.min(1, (w - 12) / tx.width, (h - 6) / tx.height));
    const z = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(55);
    z.on('pointerdown', (_p: unknown, _x: unknown, _y: unknown, ev: Phaser.Types.Input.EventData) => {
      ev?.stopPropagation?.();
      sfx.init();
      if (!ok) return sfx.error();
      sfx.click();
      fn();
    });
    this.ui.push(g, tx, z);
  }

  private topBar(sub: string) {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(col('ink'), 0.9).fillRect(0, 0, W, 96);
    g.fillStyle(col('mint')).fillRect(0, 96, W, 4);
    this.ui.push(g);
    const ic = this.add.image(36, 46, 'kTentacle').setScale(2.4).setAngle(-70).setDepth(52);
    this.ui.push(ic);
    const ten = this.text(70, 6, t('{n} chapadel', { n: big(this.T.ten) }), 40, PAL.mint);
    this.text(72, 56, sub, 20, PAL.fog);
    return ten;
  }

  /** úvodní obrazovka chrámu: boss, kola, kultisté, obchod */
  private lobby() {
    this.mode = 'lobby';
    this.clearUi();
    this.endFightObjs();
    const T = this.T;
    const we = isWeekend();
    const idle = we ? cultIdle(T, Date.now(), this.host.templeStats().cultgain) : (cultIdle(T), 0);
    const left = msToSwitch();
    const hh = Math.floor(left / 3.6e6), dd = Math.floor(hh / 24);
    this.topBar(we ? t('Víkend v R\'lyeh · zbývá {d} d {h} h', { d: dd, h: hh % 24 }) : t('Chrám je zavřený · otevře za {d} d {h} h', { d: dd, h: hh % 24 }));
    this.button(W - 120, 18, 104, 60, t('Obchod'), 'plum', true, () => this.shop());
    this.panel(120, 230);
    this.text(W / 2, 134, t('CTHULHU · {n}. probuzení', { n: T.boss + 1 }) + ` · ${DIFF_NAMES[this.diff() - 1]}`, 30, PAL.gold, 0.5);
    this.hpBar(30, 176, W - 60, 26, this.ui);
    this.text(W / 2, 214, t('fáze {p}/4 · truhly {c}/10 · pečetě R\'lyeh: {s} (výdělek +{v} %)', { p: this.phase(), c: T.chests, s: T.boss, v: Math.round(T.boss * SEAL_BONUS * 100) }), 18, PAL.bone, 0.5).setScale(1);
    this.text(W / 2, 244, t('síla zásahu: {n}', { n: big(Math.round(this.power())) }), 20, PAL.mint, 0.5);
    const kult = T.up.kult ?? 0;
    this.text(W / 2, 274, kult ? t('kultistů: {n} – sekají chapadla a sbírají i bez tebe', { n: kult }) : t('kultistu najmeš v Obchodě'), 18, PAL.fog, 0.5);
    if (idle > 0) this.text(W / 2, 302, t('Kultisté mezitím nasbírali {n} chapadel', { n: big(idle) }), 20, PAL.mint, 0.5);
    if (T.rot) {
      const r = T.rot;
      this.text(W / 2, 326, r.bones ? t('V pondělí shnilo {n} chapadel (sůl zachránila {b} kostí)', { n: big(r.ten), b: big(r.bones) }) : t('V pondělí shnilo {n} chapadel', { n: big(r.ten) }), 18, PAL.scarlet, 0.5);
      if (r.bones) this.host.templeReward('bones', r.bones);
      T.rot = undefined;
    }
    const roundsLeft = ROUNDS_PER_DAY - T.used;
    if (T.pend?.length) this.button(W / 2 - 160, 630, 320, 66, t('Otevřít truhly ({n})', { n: T.pend.length }), 'amber', true, () => this.openChests());
    if (we) {
      // obtížnosti: každá má vlastní životy bosse (pokračuje se, kde hráč skončil); další se odemkne poražením předchozí
      this.panel(712, 112);
      this.text(W / 2, 720, t('Obtížnost (víc životů a nástrah, odměny ×{r})', { r: String(DIFF_REW[this.diff() - 1]).replace('.', ',') }), 18, PAL.bone, 0.5);
      const bw = (W - 60) / DIFFS;
      for (let d = 1; d <= DIFFS; d++) {
        const open = d <= (T.maxD ?? 1);
        const hp = d === this.diff() ? T.hp : T.lv?.[d]?.hp ?? 1;
        this.button(30 + (d - 1) * bw + 3, 748, bw - 6, 64, open ? `${DIFF_NAMES[d - 1]}\n${Math.ceil(Math.max(0, hp) * 100)} %` : `${DIFF_NAMES[d - 1]}\n✕`, d === this.diff() ? 'red' : 'blue', open, () => {
          if (d === this.diff()) return;
          setDiff(T, d);
          this.lobby();
        });
      }
      this.button(70, 840, W - 140, 74, roundsLeft > 0 ? t('Do boje! (kolo {a}/{b})', { a: T.used + 1, b: ROUNDS_PER_DAY }) : t('Dnes už žádná kola – zítra znovu'), 'red', roundsLeft > 0, () => this.startRound());
    } else {
      this.panel(840, 76);
      this.text(W / 2, 852, t('Chrám se otevírá jen o víkendu (sobota a neděle).'), 20, PAL.bone, 0.5);
      this.text(W / 2, 880, t('Chapadla platí jen o víkendu – v pondělí shnijí.'), 18, PAL.fog, 0.5);
    }
    this.button(W - 236, 18, 104, 60, t('Zpět'), 'blue', true, () => this.leave());
    this.host.templeSave();
    this.tutShow();
  }

  // ---------- návod při prvním otevření (o víkendu): šipka + 1 řádek ----------
  tutObjs: Phaser.GameObjects.GameObject[] = [];
  tutT?: Phaser.Time.TimerEvent;
  private tutClear() {
    this.tutObjs.forEach((o) => o.destroy());
    this.tutObjs = [];
    this.tutT?.remove();
    this.tutT = undefined;
  }

  private tutShow() {
    this.tutClear();
    const T = this.T, i = T.tut ?? 0;
    // ve všední den je chrám zavřený – návod počká na víkend
    if (i < 0 || !isWeekend()) return;
    const b = this.cth.getBounds();
    const steps: [string, number[], string, boolean, number?][] = [
      ['lobby', [70, 840, W - 140, 74], t('o víkendu bojuj s Cthulhu'), false, 680],
      ['fight', [b.x + b.width * 0.15, b.y + b.height * 0.55, b.width * 0.7, b.height * 0.3], t('táhni prstem přes chapadla'), true],
      ['fight', [b.x + b.width * 0.3, b.y + b.height * 0.2, b.width * 0.4, b.height * 0.3], t('ťukni na Cthulhu = zásah'), true],
      ['lobby', [W - 120, 18, 104, 60], t('za chapadla kupuj vylepšení'), true],
    ];
    const st = steps[i];
    if (!st || st[0] !== this.mode) return;
    if (i === 0 && T.used >= ROUNDS_PER_DAY) return;
    this.tutObjs = pointAt(this, st[1], st[2], 70, st[3], st[4]);
    // krok 0 čeká na „Do boje!“, ostatní jdou dál samy
    if (i > 0) this.tutT = this.time.delayedCall(4000, () => this.tutNext());
  }

  private tutNext() {
    const T = this.T;
    T.tut = (T.tut ?? 0) + 1 >= 4 ? -1 : (T.tut ?? 0) + 1;
    this.host.templeSave();
    this.tutShow();
  }

  private leave() {
    this.host.templeSave();
    this.host.templeClose();
  }

  private hpBar(x: number, y: number, w: number, h: number, list: Phaser.GameObjects.GameObject[]) {
    const g = this.add.graphics().setDepth(52);
    g.fillStyle(col('ink')).fillRoundedRect(x - 3, y - 3, w + 6, h + 6, 6);
    g.fillStyle(col('blood')).fillRect(x, y, w, h);
    g.fillStyle(col('scarlet')).fillRect(x, y, w * Math.max(0, this.T.hp), h);
    for (let i = 1; i < 10; i++) g.fillStyle(col('ink'), 0.6).fillRect(x + (w * i) / 10, y, 2, h);
    const tx = this.add.text(x + w / 2, y + h / 2, `${Math.ceil(Math.max(0, this.T.hp) * 100)} % · ${big(Math.ceil(Math.max(0, this.T.hp) * bossHp(this.T.boss, this.diff())))} HP`, txt(18, PAL.white)).setOrigin(0.5).setDepth(53);
    list.push(g, tx);
    return { g, tx };
  }

  private startRound() {
    if (!isWeekend() || this.T.used >= ROUNDS_PER_DAY) return;
    this.T.used++;
    this.host.templeSave();
    this.clearUi();
    this.mode = 'fight';
    this.left = ROUND_S;
    this.gotTen = 0;
    this.dmgDone = 0;
    this.chestsGot = 0;
    this.spawnT = 0.8;
    this.inkT = 5;
    this.deepT = 3;
    this.weakT = 2.5;
    this.ward = (this.T.up.ward ?? 0) > 0;
    this.candles = 3 + (this.T.up.candle ?? 0);
    this.candleObjs = Array.from({ length: this.candles }, (_, i) => {
      const x = ALTAR.x + (i - (this.candles - 1) / 2) * 30;
      const c = this.add.image(x, PIER - 70, 'obj', 'candle').setScale(2.6).setDepth(11);
      this.ui.push(c);
      return c;
    });
    const ten = this.topBar(t('Swipe = useknout chapadlo · ťuk = zásah'));
    const time = this.text(W - 20, 14, '', 40, PAL.gold, 1);
    const ph = this.text(20, 108, '', 20, PAL.bone);
    const hpG = this.add.graphics().setDepth(52);
    const hpT = this.add.text(W / 2, 148, '', txt(18, PAL.white)).setOrigin(0.5).setDepth(53);
    this.ui.push(hpG, hpT);
    this.hud = { ten, time, hp: hpG, hpT, ph };
    this.flash(t('Kolo {a}/{b}!', { a: this.T.used, b: ROUNDS_PER_DAY }), PAL.gold, 900);
    this.cth.play('kc_win');
    this.time.delayedCall(1200, () => this.cth.active && this.cth.play('kc_idle'));
    this.hudTick();
    if ((this.T.tut ?? 0) === 0) this.tutNext();
    else this.tutShow();
  }

  private hudTick() {
    const h = this.hud;
    if (!h) return;
    h.ten.setText(t('{n} chapadel', { n: big(this.T.ten) }));
    h.time.setText(`${Math.max(0, Math.ceil(this.left))} s`);
    const names = ['', t('chapadla'), t('inkoustová clona'), t('hlubinní lezou na molo'), t('ZUŘIVOST')];
    h.ph.setText(t('Fáze {p}/4: {n}', { p: this.phase(), n: names[this.phase()] }));
    const x = 20, y = 136, w = W - 40, hh = 24;
    h.hp.clear().fillStyle(col('ink')).fillRoundedRect(x - 3, y - 3, w + 6, hh + 6, 6).fillStyle(col('blood')).fillRect(x, y, w, hh)
      .fillStyle(col('scarlet')).fillRect(x, y, w * Math.max(0, this.T.hp), hh);
    for (let i = 1; i < 10; i++) h.hp.fillStyle(col('ink'), 0.6).fillRect(x + (w * i) / 10, y, 2, hh);
    h.hpT.setText(`${Math.ceil(Math.max(0, this.T.hp) * 100)} %`);
  }

  private endFightObjs() {
    this.tents.forEach((tn) => { tn.state = 'retract'; tn.cut = 1; });
    this.deeps.forEach((d) => d.s.destroy());
    this.deeps = [];
    this.inks.forEach((k) => k.g.destroy());
    this.inks = [];
    if (this.weak) { this.weak.g.destroy(); this.weak = undefined; }
  }

  private endRound(why: string) {
    if (this.mode !== 'fight') return;
    this.mode = 'result';
    this.endFightObjs();
    this.clearUi();
    this.T.best = Math.max(this.T.best ?? 0, this.gotTen);
    this.host.templeSave();
    sfx.fanfare();
    this.topBar(why);
    this.panel(250, 400);
    this.text(W / 2, 270, why, 34, PAL.gold, 0.5);
    this.text(W / 2, 330, t('Získáno: {n} chapadel', { n: big(this.gotTen) }), 28, PAL.mint, 0.5);
    this.text(W / 2, 372, t('Způsobené poškození: {n} ({p} % bosse)', { n: big(Math.round(this.dmgDone)), p: Math.round((this.dmgDone / bossHp(this.T.boss, this.diff())) * 1000) / 10 }), 20, PAL.bone, 0.5);
    this.text(W / 2, 404, t('Truhel: {n}', { n: this.chestsGot }), 22, PAL.bone, 0.5);
    this.hpBar(40, 450, W - 80, 26, this.ui);
    this.text(W / 2, 500, t('Zbývá kol dnes: {n}', { n: ROUNDS_PER_DAY - this.T.used }), 22, PAL.fog, 0.5);
    const pend = this.T.pend?.length ?? 0;
    if (pend) this.button(W / 2 - 160, 560, 320, 70, t('Otevřít truhly ({n})', { n: pend }), 'amber', true, () => this.openChests());
    else this.button(W / 2 - 130, 560, 260, 70, t('Pokračovat'), 'green', true, () => this.lobby());
  }

  /** otevírání truhel: truhla se natřese, otevře a odměna z ní vyskočí (chapadla vždy, k tomu něco navíc) */
  private openChests() {
    const T = this.T;
    const d = T.pend?.shift();
    if (d === undefined) return this.lobby();
    this.mode = 'chest';
    this.clearUi();
    const tenTx = this.topBar(t('Truhly: zbývá {n}', { n: (T.pend?.length ?? 0) + 1 }));
    const shade = this.add.graphics().setDepth(49);
    shade.fillStyle(0x000000, 0.7).fillRect(0, 100, W, H - 100);
    this.ui.push(shade);
    const chest = this.add.image(W / 2, 420, 'obj', 'chest').setScale(7).setDepth(55);
    this.ui.push(chest);
    // výsledek je daný předem, kolo se jen „dotočí“
    const mult = (1 + this.host.templeStats().tentacles) * DIFF_REW[d - 1];
    const ten = Math.round(chestTen(T.boss) * mult);
    const r = Math.random();
    const kind = r < 0.2 ? 'bones' : r < 0.35 ? 'krigle' : r < 0.55 ? 'stat' : r < 0.62 ? 'talis' : 'ten2';
    const icons: Record<string, [string, string?]> = { ten2: ['kTentacle'], bones: ['obj', 'dSkulls'], krigle: ['obj', 'krigl0'], stat: ['obj', 'candle'], talis: ['obj', 'dIdol1'] };
    this.tweens.add({ targets: chest, angle: { from: -8, to: 8 }, yoyo: true, repeat: 5, duration: 70 });
    this.time.delayedCall(900, () => {
      if (this.mode !== 'chest') return;
      chest.setFrame('chestOpen');
      sfx.coin(1.4);
      this.cameras.main.flash(260, 255, 220, 120);
      this.cameras.main.shake(220, 0.01);
      rays(this, W / 2, 330, 54, 380);
      confetti(this, W / 2, 400, 60, 58, 1.1);
      this.time.delayedCall(250, () => this.mode === 'chest' && confetti(this, W / 2, 400, 40, 58, 0.8));
      sfx.coinRain(8);
      sfx.cheer();
      // odměna vyskočí z truhly (bez točení – žádné hazardní kolo)
      const [ia, ifr] = icons[kind];
      const ic = this.add.image(W / 2, 400, ia, ifr).setDepth(57).setAngle(kind === 'ten2' ? -60 : 0);
      const sc = Math.min(4, 80 / Math.max(ic.width, ic.height));
      ic.setScale(sc * 0.3);
      this.ui.push(ic);
      this.tweens.add({ targets: ic, y: 250, scale: sc, duration: 600, ease: 'Back.out' });
      for (let i = 0; i < 14; i++) {
        const sp = this.add.rectangle(W / 2, 380, 6, 6, i % 2 ? 0xffd166 : 0x9cff7a).setDepth(56);
        this.tweens.add({ targets: sp, x: W / 2 + Phaser.Math.Between(-160, 160), y: 380 + Phaser.Math.Between(-220, 40), alpha: 0, duration: 800, onComplete: () => sp.destroy() });
      }
      sfx.fanfare();
      T.ten += ten;
      const extra = kind === 'bones' ? this.host.templeReward('bones', 5 * d)
        : kind === 'krigle' ? this.host.templeReward('krigle', Math.max(1, Math.round(this.kriglyGift() * 0.1 * DIFF_REW[d - 1])))
        : kind === 'stat' ? this.host.templeReward('stat', d)
        : kind === 'talis' ? this.host.templeReward('talis', 1)
        : (T.ten += ten, t('Plná truhla! Chapadla ×2'));
      this.host.templeSave();
      tenTx.setText(t('{n} chapadel', { n: big(T.ten) }));
      const tx = this.text(W / 2, 560, t('+{n} chapadel', { n: big(kind === 'ten2' ? ten * 2 : ten) }) + '\n' + extra, 26, PAL.mint, 0.5).setAlign('center');
      tx.setScale(Math.min(1, (W - 30) / tx.width));
      const more = T.pend?.length ?? 0;
      this.button(W / 2 - 150, 680, 300, 70, more ? t('Další truhla ({n})', { n: more }) : t('Pokračovat'), more ? 'amber' : 'green', true, () => (more ? this.openChests() : this.lobby()));
    });
  }

  /** obchod s chapadly */
  shopTab: 'now' | 'altar' | 'perm' = 'now';

  /** oltářní obětiny: 3 nabídky statů na tento týden (do dalšího víkendu), každá koupě +0,9 %, cena roste */
  private altarShop(row: (title: string, sub: string, price: number, ok: boolean, label: string, fn: () => void, icon?: [string, string?], c?: keyof typeof PAL) => void, can: (c: number) => boolean) {
    const T = this.T, wk = weekendKey();
    if (!T.altar || T.altar.wk !== wk) {
      const pool = [...OSSUARY, ...TEMPLE_STATS].filter((o) => o.per === 0.005).map((o) => o.stat as string); // jen procentní staty
      Phaser.Utils.Array.Shuffle(pool);
      T.altar = { wk, offers: pool.slice(0, 3), lv: {} };
    }
    const al = T.altar;
    this.text(W / 2, 440, t('Obětiny platí jen do dalšího víkendu.\nKaždý víkend 3 jiné nabídky.'), 18, PAL.fog, 0.5).setAlign('center');
    const bought = Object.values(al.lv).reduce((a, b) => a + b, 0);
    const price = altarCost(bought);
    for (const st of al.offers) {
      const n = al.lv[st] ?? 0;
      const name = STAT_NAMES[st as StatId];
      row(name(ALTAR_PER), t('teď: {v} · do dalšího víkendu', { v: name(n * ALTAR_PER) }), price, can(price), '', () => {
        T.ten -= price;
        al.lv[st] = n + 1;
        sfx.fanfare();
        this.host.templeSave();
        this.host.templeRefresh?.();
        this.shop();
      }, ['obj', 'candle'], 'amber');
    }
  }

  private shop() {
    this.mode = 'shop';
    this.clearUi();
    const T = this.T;
    this.topBar(t('Chapadla v pondělí shnijí – utrať je!'));
    this.button(W - 120, 18, 104, 60, t('Zpět'), 'blue', true, () => this.lobby());
    const shade = this.add.graphics().setDepth(49);
    shade.fillStyle(0x000000, 0.55).fillRect(0, 100, W, H - 100);
    this.ui.push(shade);
    const can = (c: number) => isWeekend() && T.ten >= c;
    // záložky obchodu
    const tabs: [typeof this.shopTab, string][] = [['now', t('Hned')], ['altar', t('Oltář (týden)')], ['perm', t('Napořád')]];
    tabs.forEach(([id, name], i) => this.button(10 + i * ((W - 20) / 3) + 3, 108, (W - 20) / 3 - 6, 52, name, this.shopTab === id ? 'red' : 'blue', true, () => {
      this.shopTab = id;
      this.shop();
    }));
    let y = 172;
    const row = (title: string, sub: string, price: number, ok: boolean, label: string, fn: () => void, icon?: [string, string?], c: keyof typeof PAL = 'green') => {
      const g = this.add.graphics().setDepth(50);
      g.fillStyle(col('dusk'), 0.95).fillRoundedRect(10, y, W - 20, 78, 10);
      this.ui.push(g);
      if (icon) {
        const im = this.add.image(46, y + 39, icon[0], icon[1]).setDepth(52);
        im.setScale(Math.min(4, 54 / Math.max(im.width, im.height)));
        this.ui.push(im);
      }
      const a = this.text(86, y + 8, title, 24, PAL.bone);
      a.setScale(Math.min(1, 280 / a.width));
      const b = this.text(86, y + 42, sub, 16, PAL.fog);
      b.setScale(Math.min(1, 290 / b.width));
      this.button(W - 150, y + 10, 128, 56, label || t('{n}\nchapadel', { n: big(price) }), c, ok, fn);
      y += 84;
    };
    if (this.shopTab === 'altar') return this.altarShop(row, can);
    if (this.shopTab === 'now') {
    const tc = Math.ceil(600 * 1.5 ** (T.up.talb ?? 0));
    row(t('Talisman hlubin'), t('Modla z R\'lyeh nebo Mušle hlubin (+1 úroveň)'), tc, can(tc), '', () => { T.ten -= tc; T.up.talb = (T.up.talb ?? 0) + 1; this.toast(this.host.templeReward('talis', 1)); this.shop(); }, ['obj', 'dIdol1']);
    row(t('Krígly'), t('+{n} krígel', { n: big(this.kriglyGift()) }), 400, can(400), '', () => { T.ten -= 400; this.toast(this.host.templeReward('krigle', this.kriglyGift())); this.shop(); }, ['obj', 'krigl0']);
    row(t('Kosti'), t('+30 kostí do Kostnice a na talismany'), 250, can(250), '', () => { T.ten -= 250; this.toast(this.host.templeReward('bones', 30)); this.shop(); }, ['obj', 'dSkulls']);
    }
    if (this.shopTab === 'perm') {
    this.text(20, y, t('Platí napořád, i další víkendy'), 20, PAL.ice); y += 28;
    for (const u of TEMPLE_UPS) {
      const lvl = T.up[u.id] ?? 0;
      const max = u.max !== undefined && lvl >= u.max;
      const price = u.cost(lvl);
      const icons: Record<string, [string, string?]> = { kult: ['cultist0', '0'], knife: ['kSlash'], candle: ['obj', 'candle'], ward: ['obj', 'eyesA_c'], salt: ['obj', 'saltPile'] };
      const ic = icons[u.id];
      row(u.name + (u.max === 1 ? '' : ` ${lvl}${u.max ? '/' + u.max : ''}`), u.desc(Math.max(1, lvl + (max ? 0 : 1))), price, !max && can(price), max ? '✓' : '', () => {
        T.ten -= price;
        T.up[u.id] = lvl + 1;
        if (u.id === 'kult') this.placeCults();
        sfx.fanfare();
        this.host.templeSave();
        this.shop();
      }, ic ? [ic[0], ic[1] === '0' ? undefined : ic[1]] : undefined, 'plum');
    }
    }
    if (!isWeekend()) this.text(W / 2, y + 4, t('Nakupovat jde jen o víkendu.'), 20, PAL.scarlet, 0.5);
  }

  private kriglyGift() {
    return this.host.templeKriglyGift();
  }

  private toast(s: string) {
    sfx.fanfare();
    this.host.templeSave();
    this.time.delayedCall(30, () => this.flash(s, PAL.gold, 1400));
  }
}

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy || 1;
  const tt = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return Math.hypot(px - (ax + tt * dx), py - (ay + tt * dy));
}

/** chapadlo z kruhů: obrys, tmavá spodní strana, tělo, odlesk, přísavky */
function drawTentacle(g: Phaser.GameObjects.Graphics, pts: { x: number; y: number; r: number }[], gold: boolean, a = 1) {
  if (pts.length < 2) return;
  const pal = gold ? [0x3a2a08, 0xa8781c, 0xe6b43a, 0xffe58a, 0xfff0c0] : [0x0b2a22, 0x1f6a4e, 0x2f8f6a, 0x6fd3a0, 0xe7a3b4];
  for (const q of pts) g.fillStyle(pal[0], a).fillCircle(q.x, q.y, q.r + 3);
  for (const q of pts) g.fillStyle(pal[1], a).fillCircle(q.x, q.y, q.r);
  for (let i = 0; i < pts.length; i++) {
    const q = pts[i], n = pts[Math.min(pts.length - 1, i + 1)], p = pts[Math.max(0, i - 1)];
    const dx = n.x - p.x, dy = n.y - p.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    g.fillStyle(pal[2], a).fillCircle(q.x - nx * q.r * 0.25, q.y - ny * q.r * 0.25, q.r * 0.72);
    if (q.r > 6) g.fillStyle(pal[3], a).fillRect(Math.round((q.x - nx * q.r * 0.55) / 3) * 3, Math.round((q.y - ny * q.r * 0.55) / 3) * 3, 3, 3);
    if (i % 2 === 0 && q.r > 5) {
      const sx = q.x + nx * q.r * 0.62, sy = q.y + ny * q.r * 0.62;
      g.fillStyle(pal[4], a).fillCircle(sx, sy, Math.max(2, q.r * 0.24));
      if (q.r > 10) g.fillStyle(0x9b5a6e, a).fillCircle(sx, sy, Math.max(1, q.r * 0.1));
    }
  }
}
