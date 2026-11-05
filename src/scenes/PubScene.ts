import Phaser from 'phaser';
import { renderPubBackground } from '../gfx';
import { PAL } from '../data/palette';
import { t } from '../i18n';
import { txt } from '../ui/font';
import { big } from '../core/num';
import { STATIONS, StationDef, cost, payout, perSec } from '../core/economy';
import { Save, load, store } from '../core/save';

const W = 540;
const TOP = 76; // horní lišta s penězi
const VIEW_H = 440; // výhled do hospody
const ROW_Y = TOP + VIEW_H + 8;
const ROW_H = 104;
const T = 16; // dlaždice

/** kde ve světě hospody stanice stojí (pixely pozadí) – tam se ukazuje obsluha a „+coins“ */
const SPOT: Record<string, { x: number; y: number }> = {
  tap: { x: 3 * T + 8, y: 4 * T + 6 },
  kitchen: { x: 11 * T + 8, y: 3 * T + 12 },
  cellar: { x: 12 * T + 8, y: 3 * T + 4 },
  dice: { x: 15 * T, y: 9 * T },
};

interface Row {
  def: StationDef;
  name: Phaser.GameObjects.Text;
  lvl: Phaser.GameObjects.Text;
  bar: Phaser.GameObjects.Graphics;
  info: Phaser.GameObjects.Text;
  buy: Btn;
  staff: Btn;
  staffSprite?: Phaser.GameObjects.Sprite;
}

interface Btn {
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  zone: Phaser.GameObjects.Zone;
  w: number;
  h: number;
  x: number;
  y: number;
  enabled: boolean;
  visible: boolean;
}

/** Hlavní obrazovka: nahoře výhled do hospody, dole stanice s vylepšením. */
export class PubScene extends Phaser.Scene {
  d!: Save;
  rows: Row[] = [];
  coinsText!: Phaser.GameObjects.Text;
  rateText!: Phaser.GameObjects.Text;
  uiCam!: Phaser.Cameras.Scene2D.Camera;
  world: Phaser.GameObjects.GameObject[] = [];
  ui: Phaser.GameObjects.GameObject[] = [];
  saveT = 0;

  constructor() {
    super('Pub');
  }

  create() {
    this.d = load();
    this.rows = [];
    this.world = [];
    this.ui = [];

    // --- svět hospody (kamera main, zoom 2) ---
    const bg = this.add.image(0, 0, renderPubBackground(this, 1, 1)).setOrigin(0);
    this.world.push(bg);
    const keeper = this.add.sprite(SPOT.tap.x, SPOT.tap.y, 'player', 0).setOrigin(0.5, 1);
    this.world.push(keeper);
    const cam = this.cameras.main;
    cam.setViewport(0, TOP, W, VIEW_H).setZoom(2).setBackgroundColor(PAL.ink);
    cam.centerOn(140, 112);
    cam.roundPixels = true;

    // --- UI (vlastní kamera bez zoomu) ---
    this.uiCam = this.cameras.add(0, 0, W, 960);
    const top = this.add.graphics();
    top.fillStyle(Phaser.Display.Color.HexStringToColor(PAL.dusk).color).fillRect(0, 0, W, TOP);
    top.fillStyle(Phaser.Display.Color.HexStringToColor(PAL.gold).color).fillRect(0, TOP - 3, W, 3);
    const panel = this.add.graphics();
    panel.fillStyle(Phaser.Display.Color.HexStringToColor(PAL.dusk).color).fillRect(0, TOP + VIEW_H, W, 960 - TOP - VIEW_H);
    panel.fillStyle(Phaser.Display.Color.HexStringToColor(PAL.gold).color).fillRect(0, TOP + VIEW_H, W, 3);
    this.ui.push(top, panel);
    this.coinsText = this.ui$(this.add.text(W / 2, 26, '', txt(44, PAL.gold)).setOrigin(0.5));
    this.rateText = this.ui$(this.add.text(W / 2, 58, '', txt(22, PAL.bone)).setOrigin(0.5));

    STATIONS.forEach((def, i) => this.makeRow(def, ROW_Y + i * ROW_H));

    cam.ignore(this.ui);
    this.uiCam.ignore(this.world);

    // ukládání: průběžně a při odchodu z aplikace
    const save = () => store(this.d);
    document.addEventListener('visibilitychange', save);
    window.addEventListener('pagehide', save);
    this.events.once('shutdown', () => {
      document.removeEventListener('visibilitychange', save);
      window.removeEventListener('pagehide', save);
    });
    this.refresh();
  }

  private ui$<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.ui.push(o);
    return o;
  }

  private st(id: string) {
    return (this.d.st[id] ??= { lvl: 0, auto: false, prog: 0 });
  }

  private makeRow(def: StationDef, y: number) {
    const g = this.ui$(this.add.graphics());
    g.fillStyle(Phaser.Display.Color.HexStringToColor(PAL.ink).color, 0.55).fillRoundedRect(10, y, W - 20, ROW_H - 10, 8);
    const name = this.ui$(this.add.text(24, y + 8, def.name, txt(28, PAL.bone)));
    const lvl = this.ui$(this.add.text(24, y + 38, '', txt(20, PAL.fog)));
    const bar = this.ui$(this.add.graphics());
    const info = this.ui$(this.add.text(24, y + 68, '', txt(18, PAL.gold)));
    // ťuknutím na řádek se ručně spustí cyklus (dokud stanice nemá obsluhu)
    const tapZone = this.ui$(this.add.zone(10, y, 300, ROW_H - 10).setOrigin(0).setInteractive({ useHandCursor: true }));
    tapZone.on('pointerdown', () => this.manual(def));
    const buy = this.btn(W - 200, y + 8, 180, 46, () => this.buy(def));
    const staff = this.btn(W - 200, y + 58, 180, 32, () => this.hire(def));
    this.rows.push({ def, name, lvl, bar, info, buy, staff });
  }

  private btn(x: number, y: number, w: number, h: number, fn: () => void): Btn {
    const bg = this.ui$(this.add.graphics());
    const label = this.ui$(this.add.text(x + w / 2, y + h / 2, '', txt(h > 40 ? 22 : 16, PAL.white)).setOrigin(0.5).setAlign('center'));
    const zone = this.ui$(this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true }));
    const b: Btn = { bg, label, zone, w, h, x, y, enabled: true, visible: true };
    zone.on('pointerdown', () => {
      if (!b.enabled || !b.visible) return;
      fn();
      this.tweens.add({ targets: label, scale: { from: 0.9, to: 1 }, duration: 120 });
    });
    return b;
  }

  private drawBtn(b: Btn, text: string, enabled: boolean, color: string, visible = true) {
    b.enabled = enabled;
    b.visible = visible;
    b.bg.clear();
    b.label.setVisible(visible);
    if (!visible) return;
    const c = Phaser.Display.Color.HexStringToColor(enabled ? color : PAL.slate).color;
    b.bg.fillStyle(Phaser.Display.Color.HexStringToColor(PAL.ink).color).fillRoundedRect(b.x, b.y + 3, b.w, b.h, 8);
    b.bg.fillStyle(c).fillRoundedRect(b.x, b.y, b.w, b.h, 8);
    b.label.setText(text).setColor(enabled ? PAL.white : PAL.fog);
  }

  private manual(def: StationDef) {
    const s = this.st(def.id);
    if (s.lvl > 0 && !s.auto && s.prog === 0) s.prog = 0.0001;
  }

  private buy(def: StationDef) {
    const s = this.st(def.id);
    const c = Math.ceil(cost(def, s.lvl));
    if (this.d.coins < c) return;
    this.d.coins -= c;
    s.lvl++;
    this.refresh();
  }

  private hire(def: StationDef) {
    const s = this.st(def.id);
    if (s.auto || s.lvl === 0 || this.d.coins < def.staff) return;
    this.d.coins -= def.staff;
    s.auto = true;
    if (s.prog === 0) s.prog = 0.0001;
    this.refresh();
  }

  private pop(def: StationDef, amount: number) {
    const p = SPOT[def.id];
    const tx = this.add.text(p.x, p.y - 22, '+' + big(amount), txt(12, PAL.gold)).setOrigin(0.5).setDepth(10);
    this.uiCam.ignore(tx);
    this.tweens.add({ targets: tx, y: p.y - 40, alpha: 0, duration: 900, onComplete: () => tx.destroy() });
  }

  update(_t: number, dms: number) {
    const dt = Math.min(dms / 1000, 0.25);
    for (const r of this.rows) {
      const s = this.st(r.def.id);
      if (s.lvl === 0 || s.prog === 0) continue;
      s.prog += dt / r.def.cycle;
      if (s.prog >= 1) {
        const gain = payout(r.def, s.lvl);
        this.d.coins += gain;
        this.d.earned += gain;
        this.pop(r.def, gain);
        s.prog = s.auto ? s.prog - 1 : 0;
      }
    }
    this.saveT += dt;
    if (this.saveT > 5) {
      this.saveT = 0;
      store(this.d);
    }
    this.refresh();
  }

  private refresh() {
    let rate = 0;
    for (const r of this.rows) {
      const s = this.st(r.def.id);
      if (s.auto) rate += perSec(r.def, s.lvl);
    }
    this.coinsText.setText(`${big(this.d.coins)} coins`);
    this.rateText.setText(t('{n} coins / s', { n: big(rate) }));

    for (const r of this.rows) {
      const s = this.st(r.def.id);
      const open = s.lvl > 0;
      const c = Math.ceil(cost(r.def, s.lvl));
      r.lvl.setText(open ? t('úroveň {n}', { n: s.lvl }) : t('zavřeno'));
      r.info.setText(open ? t('{n} coins za {s} s', { n: big(payout(r.def, s.lvl)), s: r.def.cycle }) : '');
      r.name.setAlpha(open ? 1 : 0.6);
      this.drawBtn(r.buy, open ? `+1   ${big(c)}` : t('Otevřít  {n}', { n: big(c) }), this.d.coins >= c, PAL.green);
      this.drawBtn(r.staff, t('Kostlivec  {n}', { n: big(r.def.staff) }), this.d.coins >= r.def.staff, PAL.plum, open && !s.auto);
      // ukazatel cyklu
      r.bar.clear();
      const bx = 24, by = r.name.y + 56, bw = 290 - 24;
      r.bar.fillStyle(Phaser.Display.Color.HexStringToColor(PAL.ink).color).fillRect(bx, by - 4, bw, 6);
      if (open) r.bar.fillStyle(Phaser.Display.Color.HexStringToColor(s.auto ? PAL.mint : PAL.amber).color).fillRect(bx, by - 4, bw * Math.min(1, s.prog), 6);
      // obsluha (kostlivec) u stanice ve výhledu
      if (s.auto && !r.staffSprite && r.def.id !== 'tap') {
        const p = SPOT[r.def.id];
        r.staffSprite = this.add.sprite(p.x, p.y, 'skeleton', 0).setOrigin(0.5, 1);
        this.uiCam.ignore(r.staffSprite);
      }
    }
  }
}
