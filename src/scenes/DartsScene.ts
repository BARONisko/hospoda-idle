// Šipky (minihra v Menu místo Den a noc): hra na nulu (301 a s každou hrou víc), šipky přibývají samy,
// dohraná hra = bod na vylepšení. Hází se jen automaticky (po 2 s), házení jde vypnout; zapnuté hází i offline.
// Terč i zeď jsou z původní hry P.U.B. (terč se překreslí, když vylepšení zvětší pole).
import Phaser from 'phaser';
import { PAL } from '../data/palette';
import { txt } from '../ui/font';
import { confetti, bigText, popText } from '../ui/juice';
import { t } from '../i18n';
import { big } from '../core/num';
import { sfx } from '../core/sfx';
import { DartsState, DART_UPS, dartMs, dartCap, START, NUMS, rings, aimFor, aimLand, autoOn, resolve, ThrowResult, THROW_GAP, migrateDarts } from '../core/darts';
import { makeDartboard, BOARD_R } from '../gfx/tourneyArt';
import type { StatId } from '../core/talisman';

const W = 540, H = 960;
const col = (k: keyof typeof PAL) => Phaser.Display.Color.HexStringToColor(PAL[k]).color;
const K = 3, BG_TOP = 116;
const CX = W / 2, CY = BG_TOP + 78 * K, R = BOARD_R * K;

export interface DartsHost {
  dartsData(): DartsState;
  dartsStats(): Record<StatId, number>;
  dartsSave(): void;
  dartsClose(): void;
  /** dohraná hra → odměny jinde (kosti, XP hostinského) */
  dartsLeg(n: number): void;
}

export class DartsScene extends Phaser.Scene {
  host!: DartsHost;
  S!: DartsState;
  ui: Phaser.GameObjects.GameObject[] = [];
  fx!: Phaser.GameObjects.Graphics;
  stuck: Phaser.GameObjects.GameObject[] = [];
  mode: 'play' | 'shop' = 'play';
  shopTab: 'darts' | 'game' = 'darts';
  boardImg!: Phaser.GameObjects.Image;
  tm = 0;
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
    migrateDarts(this.S);
    this.ui = [];
    this.stuck = [];
    this.mode = 'play';
    this.cameras.main.setBackgroundColor(PAL.ink);
    // zeď s diváky z P.U.B. (terč visí pod lampou)
    this.add.image(CX - 112 * K, BG_TOP, 'dartsBg0').setOrigin(0).setScale(K).setDepth(0);
    const fl = this.add.graphics().setDepth(0);
    fl.fillStyle(col('dusk')).fillRect(0, BG_TOP + 180 * K, W, H);
    this.boardImg = this.add.image(CX, CY, 'dartboard').setScale(K).setDepth(5);
    this.fx = this.add.graphics().setDepth(30);
    this.drawBoard();
    this.play();
  }

  // ---------- kreslení ----------
  /** terč z P.U.B.; po vylepšení (větší bull, širší pole) se překreslí s novými poloměry */
  private drawBoard() {
    const r = rings(this.S.up);
    const key = `dartboard_${r.bull.toFixed(3)}_${r.t0.toFixed(3)}_${r.d0.toFixed(3)}`;
    if (!this.textures.exists(key)) makeDartboard(this, key, r);
    this.boardImg.setTexture(key);
    this.children.list.filter((o) => o.getData?.('num')).forEach((o) => o.destroy());
    NUMS.forEach((n, i) => {
      const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
      this.add.text(CX + Math.cos(a) * (R + 20), CY + Math.sin(a) * (R + 20), String(n), txt(18, PAL.white)).setOrigin(0.5).setDepth(6).setStroke(PAL.ink, 4).setData('num', true);
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
      left: this.text(W / 2, 668, '', 64, PAL.white, 0.5),
      info: this.text(W / 2, 744, '', 20, PAL.bone, 0.5),
    };
    this.button(W - 120, 22, 104, 64, t('Zpět'), 'blue', true, () => this.leave());
    this.button(20, 800, 240, 72, t('Vylepšení'), 'plum', true, () => this.shop());
    const has = (S.up.auto ?? 0) > 0;
    if (has)
      this.button(280, 800, 240, 72, S.auto ? t('Házení: ZAP') : t('Házení: VYP'), S.auto ? 'green' : 'amber', true, () => {
        S.auto = !S.auto;
        this.host.dartsSave();
        this.play();
      });
    else
      this.button(280, 800, 240, 72, t('Koupit automat\n1 bod'), 'green', S.pts >= 1, () => {
        S.pts -= 1;
        S.up.auto = 1;
        S.auto = true;
        sfx.fanfare();
        this.host.dartsSave();
        this.play();
      });
    const info = !has ? t('Ťukni na terč = hod (míří se samo). Dohraj přesně na nulu = 1 bod. Za 1 bod si kup automat – hází sám i offline.')
      : S.auto ? t('Hází se samo, i když tu nejsi. Dohraj přesně na nulu = 1 bod.') : t('Házení je vypnuté – šipky se šetří do toulce. Ťukni na terč = hod.');
    this.text(W / 2, 888, info, 17, PAL.fog, 0.5).setWordWrapWidth(W - 40).setAlign('center');
    // ruční hod ťuknutím na terč (bez automatu nebo s vypnutým)
    if (!autoOn(S)) {
      const z = this.add.zone(CX, CY, R * 2 + 40, R * 2 + 40).setInteractive({ useHandCursor: true }).setDepth(20);
      z.on('pointerdown', () => {
        sfx.init();
        if (S.have <= 0) return sfx.error();
        this.throwDart();
      });
      this.ui.push(z);
    }
    this.hudTick();
  }

  private hudTick() {
    if (this.mode !== 'play') return;
    const S = this.S, h = this.hud;
    h.have.setText(t('{n} šipek', { n: big(S.have) }));
    const ms = dartMs(S.up, this.host.dartsStats().dspeed ?? 0);
    const left = Math.max(0, Math.ceil((S.at + ms - Date.now()) / 1000));
    h.next.setText(S.have >= dartCap(S.up) && !autoOn(S) ? t('zásoba plná ({n})', { n: dartCap(S.up) }) : t('další šipka za {m}:{s}', { m: Math.floor(left / 60), s: String(left % 60).padStart(2, '0') }));
    h.pts.setText(t('body: {p} · dohraných her: {l}', { p: S.pts, l: S.legs }));
    h.left.setText(String(S.left));
    const a = aimFor(S.left);
    h.info.setText(t('zbývá do nuly (hra {n}) · míří na {f}', { n: S.legs + 1, f: a.n === 25 ? (a.mult === 2 ? 'BULL' : '25') : `${['', '', 'D', 'T'][a.mult]}${a.n}` }));
  }

  private throwDart() {
    const S = this.S, st = this.host.dartsStats();
    if (S.have <= 0 || this.flying) return;
    S.have--;
    const [x, y] = aimLand(S, st.dacc ?? 0);
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
      this.host.dartsLeg(1);
      this.celebrate(r, x, y);
      // vítězná šipka zůstane v terči, dokud oslava nedoběhne
      const last = this.stuck.pop();
      this.stuck.forEach((o) => o.destroy());
      this.stuck = [];
      if (last) this.time.delayedCall(2000, () => last.destroy());
      // první bod → rozsvítit „Koupit automat“
      if (!this.S.up.auto && this.mode === 'play') this.play();
    }
  }

  /** dohraná hra (efekty A + diváci z B): konfety z vítězné šipky, zlatý kruh s polem, velký nápis, diváci jásají */
  private celebrate(r: ThrowResult, x: number, y: number) {
    sfx.fanfare();
    sfx.cheer();
    sfx.pop();
    this.cameras.main.flash(250, 255, 220, 120);
    confetti(this, x, y, 90, 58, 1.1);
    const ring = this.add.graphics().setDepth(57).setPosition(x, y);
    ring.lineStyle(6, col('gold')).strokeCircle(0, 0, 26).lineStyle(3, 0xffffff, 0.7).strokeCircle(0, 0, 40);
    ring.setScale(0.3);
    this.tweens.add({ targets: ring, scale: 1, duration: 300, ease: 'Back.out' });
    this.tweens.add({ targets: ring, alpha: 0, delay: 1600, duration: 500, onComplete: () => ring.destroy() });
    popText(this, x, y - 56, r.label, PAL.gold, 34, 59);
    bigText(this, W / 2, 500, t('PŘESNĚ NA NULU!'), t('+{n} bod', { n: r.leg }) + (r.leg > 1 ? t(' (bod navíc!)') : '') + ' · ' + t('+3 kosti, +5 XP'), 60, PAL.gold);
    // diváci pod terčem jásají v bublinách
    [t('Hurá!'), t('Bravo!'), t('Na nulu!'), t('Jo!')].forEach((s, i) => {
      const bx = 66 + i * 136, by = 640 - (i % 2) * 16;
      const g = this.add.graphics().setDepth(56);
      g.fillStyle(0xffffff).fillRoundedRect(-52, -22, 104, 40, 10).fillTriangle(-8, 18, 8, 18, 0, 30);
      const tx = this.add.text(0, -2, s, txt(24, PAL.ink)).setOrigin(0.5);
      const c = this.add.container(bx, by, [g, tx]).setDepth(56).setScale(0);
      this.tweens.add({ targets: c, scale: 1, duration: 260, delay: 150 + i * 110, ease: 'Back.out' });
      this.tweens.add({ targets: c, y: by - 10, duration: 220, delay: 450 + i * 110, yoyo: true, repeat: 2 });
      this.tweens.add({ targets: c, alpha: 0, delay: 1900, duration: 400, onComplete: () => c.destroy() });
    });
    // zbytek „0“ zezlátne
    this.hud.left.setText('0').setColor(PAL.gold);
    this.time.delayedCall(1800, () => this.hud?.left?.setColor(PAL.white));
  }



  update(_t: number, dms: number) {
    const dt = Math.min(0.05, dms / 1000);
    this.tm += dt;
    this.fx.clear();
    if (this.mode !== 'play') return;
    const S = this.S;
    // hází se samo po 2 s, když je terč otevřený (jinak hází hospoda na pozadí)
    if (autoOn(S) && !this.flying && S.have > 0 && (this.autoT -= dt) <= 0) {
      this.autoT = THROW_GAP;
      this.throwDart();
    }
    if (Math.floor(this.tm * 2) !== Math.floor((this.tm - dt) * 2)) this.hudTick();
  }

  // ---------- vylepšení ----------
  private shop() {
    this.mode = 'shop';
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
    const rh = this.shopTab === 'game' ? 88 : 64;
    list.forEach((u, i) => {
      const y = 158 + i * rh;
      const lvl = S.up[u.id] ?? 0;
      const max = lvl >= u.max;
      const price = u.cost(lvl);
      const bg = this.add.graphics().setDepth(50);
      bg.fillStyle(col('dusk'), 0.95).fillRoundedRect(10, y, W - 20, rh - 6, 9);
      // políčka: každá úroveň jedno (u dlouhých vylepšení se plní po desítkách, číslo ukazuje celkem)
      const n = Math.min(10, u.max), filled = u.max <= 10 ? lvl : max ? 10 : lvl % 10;
      const pw = 20, gap = 4, py = y + rh - 26;
      for (let k = 0; k < n; k++) {
        bg.fillStyle(col('ink')).fillRect(22 + k * (pw + gap), py, pw, 12);
        bg.fillStyle(col(k < filled ? (u.stat ? 'amber' : 'mint') : 'slate'), k < filled ? 1 : 0.5).fillRect(23 + k * (pw + gap), py + 1, pw - 2, 10);
      }
      this.ui.push(bg);
      const a = this.text(22, y + 4, u.name + (u.max > 10 ? ` · ${t('úr.')} ${lvl}/${u.max}` : ''), rh > 70 ? 22 : 19, PAL.bone);
      a.setScale(Math.min(1, 330 / a.width));
      const b = this.text(22, y + (rh > 70 ? 34 : 26), max ? u.desc(lvl) : lvl ? `${u.desc(lvl)} → ${u.desc(lvl + 1)}` : u.desc(lvl + 1), 14, PAL.fog);
      b.setScale(Math.min(1, 340 / b.width));
      // automatické házení je první vylepšení: ostatní až po něm
      const locked = u.id !== 'auto' && !(S.up.auto ?? 0);
      this.button(W - 160, y + 6, 140, rh - 20, max ? '✓' : locked ? t('nejdřív automat') : t('{n} b.', { n: price }), u.stat ? 'amber' : 'green', !max && !locked && S.pts >= price, () => {
        S.pts -= price;
        S.up[u.id] = lvl + 1;
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

