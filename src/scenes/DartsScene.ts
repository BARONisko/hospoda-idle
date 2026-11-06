// Šipky (minihra v Menu místo Den a noc): hra 301, šipky přibývají samy, dohraná hra = bod na vylepšení.
// Ručně: táhni prstem = míříš (zaměřovač se třese a houpe), pusť = hod. Automat hází sám (i offline, když je zapnutý).
import Phaser from 'phaser';
import { PAL } from '../data/palette';
import { txt } from '../ui/font';
import { t } from '../i18n';
import { big } from '../core/num';
import { sfx } from '../core/sfx';
import { DartsState, DART_UPS, DART_MS, DART_CAP, START, NUMS, rings, aimFor, fieldPos, land, resolve, spread, ThrowResult } from '../core/darts';
import type { StatId } from '../core/talisman';

const W = 540, H = 960;
const col = (k: keyof typeof PAL) => Phaser.Display.Color.HexStringToColor(PAL[k]).color;
const CX = W / 2, CY = 430, R = 200;

export interface DartsHost {
  dartsData(): DartsState;
  dartsStats(): Record<StatId, number>;
  dartsSave(): void;
  dartsClose(): void;
}

export class DartsScene extends Phaser.Scene {
  host!: DartsHost;
  S!: DartsState;
  ui: Phaser.GameObjects.GameObject[] = [];
  board!: Phaser.GameObjects.Graphics;
  fx!: Phaser.GameObjects.Graphics;
  stuck: Phaser.GameObjects.GameObject[] = [];
  mode: 'play' | 'shop' = 'play';
  shopTab: 'darts' | 'game' = 'darts';
  aim: { x: number; y: number } | null = null;
  tm = 0;
  throwT = 0;
  autoT = 0;
  flying = false;
  hud!: { have: Phaser.GameObjects.Text; left: Phaser.GameObjects.Text; pts: Phaser.GameObjects.Text; info: Phaser.GameObjects.Text; next: Phaser.GameObjects.Text };

  constructor() {
    super('Darts');
  }

  init(data: { host: DartsHost }) {
    this.host = data.host;
  }

  create() {
    this.S = this.host.dartsData();
    this.ui = [];
    this.stuck = [];
    this.mode = 'play';
    this.add.image(W / 2, H / 2, 'dartsBg0').setDisplaySize(W * 1.8, H).setDepth(0).setTint(0x8a8a8a);
    const sh = this.add.graphics().setDepth(1);
    sh.fillStyle(0x000000, 0.35).fillRect(0, 0, W, H);
    this.board = this.add.graphics().setDepth(5);
    this.fx = this.add.graphics().setDepth(30);
    this.drawBoard();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.down(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.move(p));
    this.input.on('pointerup', () => this.up());
    this.play();
  }

  // ---------- kreslení ----------
  private drawBoard() {
    const g = this.board.clear();
    const r = rings(this.S.up);
    g.fillStyle(col('ink')).fillCircle(CX, CY + 6, R + 34);
    g.fillStyle(0x1b1b1b).fillCircle(CX, CY, R + 32);
    const ring = (r0: number, r1: number, odd: number, even: number) => {
      for (let i = 0; i < 20; i++) {
        const a0 = ((i - 0.5) / 20) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 0.5) / 20) * Math.PI * 2 - Math.PI / 2;
        g.fillStyle(i % 2 ? odd : even);
        g.beginPath();
        g.arc(CX, CY, r1 * R, a0, a1, false);
        g.arc(CX, CY, r0 * R, a1, a0, true);
        g.closePath();
        g.fillPath();
      }
    };
    ring(r.outer, 1, 0xe8dcc0, 0x1a1a1a);
    ring(r.d0, r.d1, 0x2e8b57, 0xc0392b);
    ring(r.t0, r.t1, 0x2e8b57, 0xc0392b);
    g.fillStyle(0x2e8b57).fillCircle(CX, CY, r.outer * R);
    g.fillStyle(0xc0392b).fillCircle(CX, CY, r.bull * R);
    g.lineStyle(1, 0x9a9a9a, 0.6);
    for (let i = 0; i < 20; i++) {
      const a = ((i + 0.5) / 20) * Math.PI * 2 - Math.PI / 2;
      g.lineBetween(CX + Math.cos(a) * r.outer * R, CY + Math.sin(a) * r.outer * R, CX + Math.cos(a) * R, CY + Math.sin(a) * R);
    }
    for (const rr of [r.outer, r.t0, r.t1, r.d0, 1]) g.strokeCircle(CX, CY, rr * R);
    // čísla
    this.children.list.filter((o) => o.getData?.('num')).forEach((o) => o.destroy());
    NUMS.forEach((n, i) => {
      const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
      this.add.text(CX + Math.cos(a) * (R + 18), CY + Math.sin(a) * (R + 18), String(n), txt(18, PAL.white)).setOrigin(0.5).setDepth(6).setData('num', true);
    });
  }

  private clearUi() {
    this.ui.forEach((o) => o.destroy());
    this.ui = [];
  }

  private text(x: number, y: number, s: string, size: number, c: string, ox = 0) {
    const o = this.add.text(x, y, s, txt(size, c)).setOrigin(ox, 0).setDepth(52).setStroke(PAL.ink, 4);
    this.ui.push(o);
    return o;
  }

  private button(x: number, y: number, w: number, h: number, label: string, c: keyof typeof PAL, ok: boolean, fn: () => void) {
    const g = this.add.graphics().setDepth(53);
    g.fillStyle(col('ink')).fillRoundedRect(x, y + 4, w, h, 9);
    g.fillStyle(col(ok ? c : 'slate')).fillRoundedRect(x, y, w, h, 9);
    g.fillStyle(0xffffff, ok ? 0.15 : 0.06).fillRoundedRect(x + 3, y + 3, w - 6, h / 3, 6);
    const tx = this.add.text(x + w / 2, y + h / 2, label, txt(h > 50 ? 22 : 17, ok ? PAL.white : PAL.fog)).setOrigin(0.5).setAlign('center').setDepth(54);
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

  // ---------- hra ----------
  private play() {
    this.mode = 'play';
    this.clearUi();
    const S = this.S;
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(col('ink'), 0.9).fillRect(0, 0, W, 112).fillStyle(col('gold')).fillRect(0, 112, W, 4);
    this.ui.push(g);
    const ic = this.add.image(38, 52, 'tourney', 'dartRed').setScale(4).setDepth(52);
    this.ui.push(ic);
    this.hud = {
      have: this.text(76, 8, '', 36, PAL.gold),
      next: this.text(78, 52, '', 18, PAL.fog),
      pts: this.text(78, 78, '', 20, PAL.mint),
      left: this.text(W / 2, 640, '', 64, PAL.white, 0.5),
      info: this.text(W / 2, 716, '', 20, PAL.bone, 0.5),
    };
    this.button(W - 120, 22, 104, 64, t('Zpět'), 'blue', true, () => this.leave());
    this.button(20, 790, 240, 72, t('Vylepšení'), 'plum', true, () => this.shop());
    const auto = !!S.up.auto;
    this.button(280, 790, 240, 72, !auto ? t('Automat: kup za 1 bod') : S.auto ? t('Automat: ZAP') : t('Automat: VYP'), S.auto && auto ? 'green' : 'amber', true, () => {
      if (!auto) {
        this.shopTab = 'darts';
        return this.shop();
      }
      S.auto = !S.auto;
      this.host.dartsSave();
      this.play();
    });
    this.text(W / 2, 880, S.up.auto && S.auto ? t('Automat hází sám – i když tu nejsi.') : t('Táhni prstem po terči a pusť = hod. Hra 301: dohraj přesně na nulu.'), 17, PAL.fog, 0.5).setWordWrapWidth(W - 40).setAlign('center');
    this.hudTick();
  }

  private hudTick() {
    if (this.mode !== 'play') return;
    const S = this.S, h = this.hud;
    h.have.setText(t('{n} šipek', { n: big(S.have) }));
    const ms = DART_MS / (1 + (this.host.dartsStats().dspeed ?? 0));
    const left = Math.max(0, Math.ceil((S.at + ms - Date.now()) / 1000));
    h.next.setText(S.have >= DART_CAP && !(S.up.auto && S.auto) ? t('zásoba plná ({n})', { n: DART_CAP }) : t('další šipka za {m}:{s}', { m: Math.floor(left / 60), s: String(left % 60).padStart(2, '0') }));
    h.pts.setText(t('body: {p} · dohraných her: {l}', { p: S.pts, l: S.legs }));
    h.left.setText(String(S.left));
    const a = aimFor(S.left);
    h.info.setText(t('zbývá do nuly · doporučeno: {f}', { f: a.n === 25 ? (a.mult === 2 ? 'BULL' : '25') : `${['', '', 'D', 'T'][a.mult]}${a.n}` }));
  }

  private down(p: Phaser.Input.Pointer) {
    sfx.init();
    if (this.mode !== 'play' || this.flying || (this.S.up.auto && this.S.auto)) return;
    if (p.y < 120 || p.y > 760) return;
    if (this.S.have <= 0) return this.toast(t('Došly šipky – další přibude sama.'));
    this.aim = { x: p.x, y: p.y };
    this.throwT = 6 + (this.S.up.time ?? 0);
  }

  private move(p: Phaser.Input.Pointer) {
    if (this.aim && p.isDown) this.aim = { x: p.x, y: p.y };
  }

  private up() {
    if (!this.aim) return;
    const c = this.cross();
    this.aim = null;
    this.throwDart((c.x - CX) / R, (c.y - CY) / R);
  }

  /** zaměřovač: kolem prstu se houpe a třese (vylepšení zmenšují) */
  private cross() {
    const a = this.aim!;
    const amp = 46 * (1 - 0.025 * (this.S.up.steady ?? 0)), sp = 1 - 0.025 * (this.S.up.slow ?? 0);
    const k = this.tm * 2.2 * sp;
    // mířit nad prst (ať ho prst nezakrývá)
    return { x: a.x + Math.sin(k * 1.3) * amp + Math.sin(k * 7.1) * amp * 0.15, y: a.y - 70 + Math.cos(k) * amp * 0.8 + Math.cos(k * 6.3) * amp * 0.15 };
  }

  private throwDart(ax: number, ay: number) {
    const S = this.S, st = this.host.dartsStats();
    if (S.have <= 0 || this.flying) return;
    S.have--;
    const [x, y] = land(S, ax, ay, st.dacc ?? 0);
    const res = resolve(S, x, y, st.dextra ?? 0);
    if (res.saved) S.have++;
    this.flying = true;
    const tx = CX + x * R, ty = CY + y * R;
    const d = this.add.image(W / 2 + 120, H + 40, 'tourney', 'dartRed').setScale(5).setDepth(40);
    this.tweens.add({
      targets: d,
      x: tx + 18,
      y: ty - 18,
      scale: 2.6,
      duration: 260,
      ease: 'Quad.out',
      onComplete: () => {
        this.flying = false;
        sfx.click();
        this.stuck.push(d);
        if (this.stuck.length > 9) this.stuck.shift()!.destroy();
        this.showResult(res, tx, ty);
        this.host.dartsSave();
        this.hudTick();
      },
    });
  }

  private showResult(r: ThrowResult, x: number, y: number) {
    const s = r.bust ? t('PŘESTŘELENO') : r.pts ? `${r.label}${r.crit ? ' ×2!' : ''}${r.combo ? ` ${t('kombo {n}', { n: r.combo })}` : ''}` : r.saved ? t('Vedle – druhá šance!') : r.label;
    const c = r.bust ? PAL.scarlet : r.crit ? PAL.gold : r.pts ? PAL.white : PAL.fog;
    const o = this.add.text(x, y - 30, s, txt(26, c)).setOrigin(0.5).setDepth(45).setStroke(PAL.ink, 5);
    this.tweens.add({ targets: o, y: y - 80, alpha: 0, duration: 900, onComplete: () => o.destroy() });
    if (r.leg) {
      sfx.fanfare();
      this.cameras.main.flash(300, 255, 220, 120);
      this.toast(t('Hra dohraná! +{n} bod', { n: r.leg }) + (r.leg > 1 ? ' (BONUS)' : ''));
      this.stuck.forEach((o) => o.destroy());
      this.stuck = [];
    }
  }

  private toast(s: string) {
    const o = this.add.text(W / 2, 300, s, txt(30, PAL.gold)).setOrigin(0.5).setDepth(60).setStroke(PAL.ink, 6).setAlign('center');
    o.setScale(Math.min(1, (W - 30) / o.width));
    this.tweens.add({ targets: o, y: 260, alpha: 0, delay: 1200, duration: 500, onComplete: () => o.destroy() });
  }

  update(_t: number, dms: number) {
    const dt = Math.min(0.05, dms / 1000);
    this.tm += dt;
    this.fx.clear();
    if (this.mode !== 'play') return;
    const S = this.S;
    if (this.aim) {
      const c = this.cross();
      this.fx.lineStyle(3, 0xffffff, 0.95).strokeCircle(c.x, c.y, 12).lineBetween(c.x - 18, c.y, c.x + 18, c.y).lineBetween(c.x, c.y - 18, c.x, c.y + 18);
      // rozptyl: kroužek, kam asi šipka dopadne
      this.fx.lineStyle(2, 0xffd166, 0.35).strokeCircle(c.x, c.y, spread(S.up, this.host.dartsStats().dacc ?? 0) * R);
      this.throwT -= dt;
      this.fx.fillStyle(col('gold')).fillRect(20, 760, (W - 40) * Math.max(0, this.throwT / (6 + (S.up.time ?? 0))), 8);
      if (this.throwT <= 0) this.up();
    }
    // automat hází, když je terč otevřený (jinak hází hospoda na pozadí)
    if (S.up.auto && S.auto && !this.flying && S.have > 0 && (this.autoT -= dt) <= 0) {
      this.autoT = 0.9;
      const a = aimFor(S.left);
      const [fx, fy] = fieldPos(a.n, a.mult, S.up);
      this.throwDart(fx, fy);
    }
    if (Math.floor(this.tm * 2) !== Math.floor((this.tm - dt) * 2)) this.hudTick();
  }

  // ---------- vylepšení ----------
  private shop() {
    this.mode = 'shop';
    this.aim = null;
    this.clearUi();
    const S = this.S;
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(col('ink'), 0.92).fillRect(0, 0, W, H);
    this.ui.push(g);
    this.text(20, 18, t('Body: {p}', { p: S.pts }), 34, PAL.mint);
    this.text(22, 62, t('1 dohraná hra = 1 bod'), 17, PAL.fog);
    this.button(W - 120, 18, 104, 60, t('Zpět'), 'blue', true, () => this.play());
    const tabs: ['darts' | 'game', string][] = [['darts', t('Terč')], ['game', t('Do celé hry')]];
    tabs.forEach(([id, name], i) => this.button(10 + i * ((W - 20) / 2) + 3, 96, (W - 20) / 2 - 6, 50, name, this.shopTab === id ? 'red' : 'blue', true, () => {
      this.shopTab = id;
      this.shop();
    }));
    const list = DART_UPS.filter((u) => (this.shopTab === 'game') === !!u.stat);
    const rh = this.shopTab === 'game' ? 84 : 56;
    list.forEach((u, i) => {
      const y = 158 + i * rh;
      const lvl = S.up[u.id] ?? 0;
      const max = lvl >= u.max;
      const price = u.cost(lvl);
      const bg = this.add.graphics().setDepth(50);
      bg.fillStyle(col('dusk'), 0.95).fillRoundedRect(10, y, W - 20, rh - 6, 9);
      this.ui.push(bg);
      const a = this.text(22, y + 4, u.name + (u.max > 1 ? ` ${lvl}/${u.max}` : ''), rh > 60 ? 22 : 19, PAL.bone);
      a.setScale(Math.min(1, 330 / a.width));
      const b = this.text(22, y + (rh > 60 ? 38 : 28), max ? u.desc(lvl) : lvl ? `${u.desc(lvl)} → ${u.desc(lvl + 1)}` : u.desc(lvl + 1), 14, PAL.fog);
      b.setScale(Math.min(1, 340 / b.width));
      this.button(W - 160, y + 4, 140, rh - 16, max ? '✓' : t('{n} b.', { n: price }), u.stat ? 'amber' : 'green', !max && S.pts >= price, () => {
        S.pts -= price;
        S.up[u.id] = lvl + 1;
        if (u.id === 'auto') S.auto = true;
        sfx.fanfare();
        this.drawBoard();
        this.host.dartsSave();
        this.shop();
      });
    });
  }

  private leave() {
    this.host.dartsSave();
    this.host.dartsClose();
  }
}

export { START };
