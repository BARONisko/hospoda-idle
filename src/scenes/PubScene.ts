import Phaser from 'phaser';
import { PAL } from '../data/palette';
import { t } from '../i18n';
import { txt } from '../ui/font';
import { big } from '../core/num';
import { STATIONS, StationDef, STATION_NAMES, PUB_NAMES, costN, affordable, payout, actMult, nextMilestone, upMult, UPGRADES, UpgradeDef, MANAGERS, mgrCost, BOOST_MULT, BOOST_S, BOOST_CD } from '../core/economy';
import { sfx } from '../core/sfx';
import { Save, PubState, load, store, newPub } from '../core/save';
import { PubView } from '../game/PubView';

const W = 540;
const H = 960;
const TOP = 84; // horní lišta s penězi
const CARD_H = 108;
/** strop výdělku offline (s) */
const OFFLINE_CAP = 8 * 3600;
/** kratší nepřítomnost se nehlásí oknem (s) */
const OFFLINE_MIN = 60;
interface Offer {
  title: string;
  sub: string;
  cost: number;
  buy: () => void;
}
const col = (k: keyof typeof PAL) => Phaser.Display.Color.HexStringToColor(PAL[k]).color;

interface Btn {
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  zone: Phaser.GameObjects.Zone;
  x: number;
  y: number;
  w: number;
  h: number;
  enabled: boolean;
  visible: boolean;
}

interface Card {
  pub: number;
  def: StationDef;
  box: Phaser.GameObjects.Graphics;
  name: Phaser.GameObjects.Text;
  lvl: Phaser.GameObjects.Text;
  bar: Phaser.GameObjects.Graphics;
  info: Phaser.GameObjects.Text;
  buy: Btn;
  staff: Btn;
  tapZone: Phaser.GameObjects.Zone;
  y: number;
}

/**
 * Hlavní obrazovka. 1 hospoda: výhled nahoře, karty stanic pod ním.
 * 2–3 hospody (po prestiži): obrazovka rozdělená na pruhy, každá hospoda žije; „▲ Stanice“ vysune panel s kartami.
 */
export class PubScene extends Phaser.Scene {
  d!: Save;
  views: PubView[] = [];
  cards: Card[] = [];
  coinsText!: Phaser.GameObjects.Text;
  rateText!: Phaser.GameObjects.Text;
  /** otevřený panel stanic (index hospody) při 2–3 hospodách */
  sheet = -1;
  sheetObjs: Phaser.GameObjects.GameObject[] = [];
  stripRates: Phaser.GameObjects.Text[] = [];
  saveT = 0;
  /** kolik úrovní kupovat najednou: 1, 10, 100, 0 = max */
  mode = 1;
  coinT = 0;
  modeBtn!: Btn;

  constructor() {
    super('Pub');
  }

  create() {
    this.d = load();
    // ladění: ?pubs=2|3 přidá hospody (než bude prestiž)
    const dbg = Number(new URLSearchParams(location.search).get('pubs'));
    while (dbg && this.d.pubs.length < Math.min(3, dbg)) {
      const p = newPub((this.d.pubs.length + 1) as 1 | 2 | 3);
      p.st = { tap: { lvl: 10, auto: true, prog: 0.1 }, kitchen: { lvl: 5, auto: true, prog: 0.3 }, cellar: { lvl: 2, auto: false, prog: 0 }, dice: { lvl: 1, auto: false, prog: 0 } };
      this.d.pubs.push(p);
    }
    this.views = [];
    this.cards = [];
    this.stripRates = [];
    this.skillBtns = [];
    this.sheet = -1;
    this.cameras.main.setBackgroundColor(PAL.ink);
    // hospody leží ve světě daleko vpravo (x ≥ 2000), aby je UI kamera neviděla; UI kamera je nad nimi
    this.d.pubs.forEach((p, i) => this.views.push(new PubView(this, p, 2000 + i * 1000)));
    const ui = this.cameras.main;
    this.cameras.remove(ui, false);
    this.cameras.addExisting(ui);
    ui.setBackgroundColor('rgba(0,0,0,0)');

    // horní lišta
    const top = this.add.graphics().setDepth(100);
    top.fillStyle(col('dusk')).fillRect(0, 0, W, TOP);
    top.fillStyle(col('gold')).fillRect(0, TOP - 3, W, 3);
    this.add.image(40, TOP / 2 - 2, 'obj', 'coin').setScale(4).setDepth(101);
    this.coinsText = this.add.text(76, 12, '', txt(40, PAL.gold)).setDepth(101);
    this.rateText = this.add.text(78, 50, '', txt(22, PAL.mint)).setDepth(101);
    this.modeBtn = this.btn(W - 112, 16, 96, 50, () => {
      this.mode = ({ 1: 10, 10: 100, 100: 0, 0: 1 } as Record<number, number>)[this.mode];
      sfx.click();
      this.drawMode();
    }, 102);
    this.drawMode();
    this.shopBtn = this.btn(W - 230, 16, 108, 50, () => this.openShop(), 102);
    this.drawBtn(this.shopBtn, t('Obchod'), true, 'plum');
    this.shopDot = this.add.graphics().setDepth(104);

    this.layout();

    // ťuknutí do hospody → spropitné od hosta
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      sfx.init();
      if (this.awayObjs.length || this.shopObjs.length) return; // otevřené okno
      for (const v of this.views) {
        const c = v.cam;
        if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(c.x, c.y, c.width, c.height), ptr.x, ptr.y)) continue;
        if (this.sheet >= 0 && ptr.y > this.sheetY()) continue; // pod panelem
        const wp = c.getWorldPoint(ptr.x, ptr.y);
        if (v.tap(wp.x, wp.y)) {
          const tip = Math.max(1, Math.round(this.rate(v.pub) * 2 + this.pay(v.pub, STATIONS[0])));
          this.gain(tip);
          v.tipPop('+' + big(tip));
          sfx.tip();
        }
      }
    });

    // ?away=<s> – ladění: předstírá nepřítomnost
    const away = Number(new URLSearchParams(location.search).get('away'));
    if (away) this.d.at = Date.now() - away * 1000;
    this.offline();
    const dc = Number(new URLSearchParams(location.search).get('coins'));
    if (dc) this.d.coins = dc;
    const save = () => {
      if (document.visibilityState === 'visible') this.offline();
      else store(this.d);
    };
    document.addEventListener('visibilitychange', save);
    window.addEventListener('pagehide', save);
    this.events.once('shutdown', () => {
      document.removeEventListener('visibilitychange', save);
      window.removeEventListener('pagehide', save);
    });
    this.refresh();
  }

  /** výdělek za dobu nepřítomnosti (běží jen stanice s kostlivcem), strop 8 h */
  private offline() {
    const raw = Math.max(0, (Date.now() - this.d.at) / 1000);
    const secs = Math.min(OFFLINE_CAP, raw);
    const rate = this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
    const g = Math.floor(rate * secs);
    this.d.at = Date.now();
    if (secs < OFFLINE_MIN || g < 1 || this.awayObjs.length) return;
    this.gain(g);
    store(this.d);
    this.awayPopup(g, secs, raw > OFFLINE_CAP);
  }

  awayObjs: Phaser.GameObjects.GameObject[] = [];

  private awayPopup(g: number, secs: number, capped: boolean) {
    const D = 500;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const dur = h ? t('{h} h {m} min', { h, m }) : t('{m} min', { m });
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(D).setInteractive();
    const bx = 40, by = 270, bw = W - 80, bh = 380;
    const g0 = this.add.graphics().setDepth(D + 1);
    g0.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g0.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g0.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    const objs: Phaser.GameObjects.GameObject[] = [shade, g0];
    const tx = (y: number, s: string, size: number, c: string) =>
      objs.push(this.add.text(W / 2, y, s, txt(size, c)).setOrigin(0.5).setAlign('center').setDepth(D + 2));
    tx(by + 44, t('Zatímco jsi byl pryč…'), 30, PAL.gold);
    tx(by + 96, t('kostlivci točili {d}', { d: dur }), 22, PAL.fog);
    if (capped) tx(by + 126, t('(víc než 8 h se nepočítá)'), 18, PAL.fog);
    const amt = this.add.text(0, by + 190, `+${big(g)}`, txt(44, PAL.gold)).setOrigin(0, 0.5).setDepth(D + 2);
    const x0 = W / 2 - (amt.width + 46) / 2;
    amt.setX(x0 + 46);
    objs.push(this.add.image(x0 + 16, by + 190, 'obj', 'coin').setScale(5).setDepth(D + 2), amt);
    tx(by + 236, 'coins', 22, PAL.mint);
    const ok = this.btn(W / 2 - 110, by + bh - 90, 220, 64, () => {
      this.awayObjs.forEach((o) => o.destroy());
      this.awayObjs = [];
      sfx.coin(1);
    }, D + 3);
    this.drawBtn(ok, t('Vybrat'), true, 'green');
    objs.push(ok.bg, ok.label, ok.zone);
    this.awayObjs = objs;
    sfx.tip();
  }

  /** oslava milníku stanice */
  private milestone(i: number, def: StationDef) {
    this.banner(this.views[i].cam, t('{s}: výdělek ×2!', { s: STATION_NAMES[this.d.pubs[i].act][def.id] }));
  }

  private banner(c: Phaser.Cameras.Scene2D.Camera, text: string) {
    sfx.fanfare();
    const tx = this.add
      .text(c.x + c.width / 2, c.y + c.height / 2, text, txt(30, PAL.gold))
      .setOrigin(0.5)
      .setStroke(PAL.ink, 8)
      .setDepth(450);
    this.tweens.add({ targets: tx, scale: { from: 0.4, to: 1 }, duration: 260, ease: 'Back.out' });
    this.tweens.add({ targets: tx, y: tx.y - 40, alpha: 0, delay: 1300, duration: 600, onComplete: () => tx.destroy() });
  }

  // ---------- obchod s vylepšeními ----------
  shopObjs: Phaser.GameObjects.GameObject[] = [];
  shopRows: { o: Offer; b: Btn }[] = [];
  shopBtn!: Btn;
  shopDot!: Phaser.GameObjects.Graphics;

  /** nabídka obchodu: nejlevnější nekoupená vylepšení pro otevřené hospody a stanice */
  private shopOffer(): Offer[] {
    const many = this.d.pubs.length > 1;
    const sub = (act: number, x: string) => (many ? PUB_NAMES[act] + ' · ' + x : x);
    const acts = this.d.pubs.map((p) => p.act as number);
    const ups: Offer[] = UPGRADES.filter((u) => acts.includes(u.act) && !this.d.up.includes(u.id))
      .filter((u) => (this.d.pubs.find((p) => p.act === u.act)?.st[u.station]?.lvl ?? 0) > 0)
      .filter((u) => u.tier === 1 || this.d.up.includes(`${u.act}_${u.station}_${u.tier - 1}`))
      .map((u) => ({
        title: t('{s} ×{m}', { s: STATION_NAMES[u.act][u.station], m: u.mult }),
        sub: sub(u.act, t('stupeň {n}', { n: u.tier })),
        cost: u.cost,
        buy: () => this.buyUp(u),
      }));
    const mgrs: Offer[] = this.d.pubs
      .filter((p) => !p.mgr && (p.st.kitchen?.lvl ?? 0) > 0)
      .map((p) => ({
        title: t('Manažer: {n}', { n: MANAGERS[p.act].name }),
        sub: sub(p.act, t('schopnost: {s}', { s: MANAGERS[p.act].skill })),
        cost: mgrCost(p.act),
        buy: () => this.hireMgr(p),
      }));
    return [...mgrs, ...ups].sort((a, b) => a.cost - b.cost).slice(0, 6);
  }

  private openShop() {
    if (this.shopObjs.length) return this.closeShop();
    this.closeSheet();
    const D = 300, RH = 96;
    const offer = this.shopOffer();
    const y0 = H - Math.max(2, offer.length) * RH - 74;
    const block = this.add.rectangle(0, TOP, W, H - TOP, 0x000000, 0.55).setOrigin(0).setDepth(D).setInteractive();
    block.on('pointerdown', (ptr: Phaser.Input.Pointer) => ptr.y < y0 && this.closeShop());
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('dusk'), 0.98).fillRoundedRect(0, y0, W, H - y0 + 20, 16);
    g.fillStyle(col('gold')).fillRect(0, y0, W, 3);
    const title = this.add.text(20, y0 + 14, t('Obchod'), txt(28, PAL.gold)).setDepth(D + 1);
    const close = this.btn(W - 120, y0 + 10, 104, 40, () => this.closeShop(), D + 5);
    this.drawBtn(close, t('Zavřít'), true, 'red');
    this.shopObjs.push(block, g, title, close.bg, close.label, close.zone);
    if (!offer.length) this.shopObjs.push(this.add.text(W / 2, y0 + 120, t('Teď tu nic není.\nOtevři další stanice.'), txt(22, PAL.fog)).setOrigin(0.5).setAlign('center').setDepth(D + 1));
    offer.forEach((o, k) => {
      const y = y0 + 64 + k * RH;
      const box = this.add.graphics().setDepth(D + 1);
      box.fillStyle(col('ink'), 0.6).fillRoundedRect(10, y, W - 20, RH - 8, 10);
      const name = this.add.text(26, y + 10, o.title, txt(26, PAL.bone)).setDepth(D + 1);
      name.setScale(Math.min(1, 280 / name.width));
      const sub = this.add.text(26, y + 46, o.sub, txt(18, PAL.fog)).setDepth(D + 1);
      sub.setScale(Math.min(1, 280 / sub.width));
      const b = this.btn(W - 212, y + 12, 190, 62, () => o.buy(), D + 2);
      this.shopRows.push({ o, b });
      this.shopObjs.push(box, name, sub, b.bg, b.label, b.zone);
    });
    sfx.click();
    this.refresh();
  }

  private closeShop() {
    this.shopObjs.forEach((o) => o.destroy());
    this.shopObjs = [];
    this.shopRows = [];
  }

  private buyUp(u: UpgradeDef) {
    if (this.d.coins < u.cost || this.d.up.includes(u.id)) return sfx.error();
    this.d.coins -= u.cost;
    this.d.up.push(u.id);
    const i = this.d.pubs.findIndex((p) => p.act === u.act);
    this.closeShop();
    this.openShop();
    this.banner(this.views[i].cam, t('{s}: výdělek ×{m}!', { s: STATION_NAMES[u.act][u.station], m: u.mult }));
    store(this.d);
  }

  private hireMgr(p: PubState) {
    const c = mgrCost(p.act);
    if (this.d.coins < c || p.mgr) return sfx.error();
    this.d.coins -= c;
    p.mgr = true;
    const i = this.d.pubs.indexOf(p);
    this.closeShop();
    this.openShop();
    this.banner(this.views[i].cam, t('{n} nastoupil!', { n: MANAGERS[p.act].name }));
    this.skillBtns[i] && this.drawSkill(i);
    store(this.d);
  }

  // ---------- schopnost manažera ----------
  skillBtns: Btn[] = [];

  private boosted(p: PubState) {
    return (p.boostUntil ?? 0) > Date.now();
  }

  private useSkill(i: number) {
    const p = this.d.pubs[i];
    const now = Date.now();
    if (!p.mgr || this.boosted(p) || (p.boostReady ?? 0) > now) return sfx.error();
    p.boostUntil = now + BOOST_S * 1000;
    p.boostReady = now + (BOOST_S + BOOST_CD) * 1000;
    this.banner(this.views[i].cam, t('{s}! Výdělek ×{m}', { s: MANAGERS[p.act].skill, m: BOOST_MULT }));
    store(this.d);
  }

  private drawSkill(i: number) {
    const p = this.d.pubs[i];
    const b = this.skillBtns[i];
    if (!p.mgr) return this.drawBtn(b, '', false, 'amber', false);
    const now = Date.now();
    const mmss = (ms: number) => {
      const s = Math.ceil(ms / 1000);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };
    if (this.boosted(p)) this.drawBtn(b, `×${BOOST_MULT}  ${mmss(p.boostUntil! - now)}`, true, 'scarlet');
    else if ((p.boostReady ?? 0) > now) this.drawBtn(b, mmss(p.boostReady! - now), false, 'amber');
    else this.drawBtn(b, MANAGERS[p.act].skill, true, 'amber');
  }

  private drawMode() {
    this.drawBtn(this.modeBtn, this.mode ? `×${this.mode}` : 'MAX', true, 'amber');
  }

  /** kolik úrovní a za kolik se koupí podle přepínače ×1/×10/×100/MAX */
  private offer(p: PubState, def: StationDef) {
    const lvl = this.st(p, def.id).lvl;
    const m = actMult(p.act);
    const n = lvl === 0 ? 1 : this.mode || Math.max(1, affordable(def, lvl, this.d.coins / m));
    return { n, price: Math.ceil(costN(def, lvl, n) * m) };
  }

  private sheetY() {
    return H - 4 * CARD_H - 70;
  }

  /** rozložení obrazovky podle počtu hospod */
  private layout() {
    const n = this.views.length;
    if (n === 1) {
      const viewH = 404;
      this.views[0].frame(0, TOP, W, viewH, 118);
      this.skillBtns[0] = this.btn(14, TOP + viewH - 60, 200, 48, () => this.useSkill(0), 60);
      const g = this.add.graphics();
      g.fillStyle(col('dusk')).fillRect(0, TOP + viewH, W, H - TOP - viewH);
      g.fillStyle(col('gold')).fillRect(0, TOP + viewH, W, 3);
      this.addCards(0, TOP + viewH + 10);
      return;
    }
    const h = Math.floor((H - TOP) / n);
    this.views.forEach((v, i) => {
      const y = TOP + i * h;
      v.frame(0, y, W, h - 4, 112);
      const g = this.add.graphics().setDepth(50);
      g.fillStyle(col('gold')).fillRect(0, y + h - 4, W, 4);
      g.fillStyle(col('ink'), 0.8).fillRoundedRect(8, y + 8, 260, 36, 8);
      g.fillStyle(col('ink'), 0.8).fillRoundedRect(W - 150, y + 8, 142, 36, 8);
      this.add.text(18, y + 12, PUB_NAMES[v.pub.act], txt(24, PAL.gold)).setDepth(51);
      this.stripRates.push(this.add.text(W - 18, y + 12, '', txt(22, PAL.mint)).setOrigin(1, 0).setDepth(51));
      const b = this.btn(W - 170, y + h - 64, 156, 48, () => this.openSheet(i), 60);
      this.drawBtn(b, t('▲ Stanice'), true, 'green');
      this.skillBtns[i] = this.btn(14, y + h - 64, 200, 48, () => this.useSkill(i), 60);
    });
  }

  private openSheet(i: number) {
    this.closeSheet();
    this.closeShop();
    this.sheet = i;
    const y0 = this.sheetY();
    const g = this.add.graphics().setDepth(200);
    g.fillStyle(col('dusk'), 0.97).fillRoundedRect(0, y0, W, H - y0 + 20, 16);
    g.fillStyle(col('gold')).fillRect(0, y0, W, 3);
    const title = this.add.text(20, y0 + 14, PUB_NAMES[this.d.pubs[i].act], txt(28, PAL.gold)).setDepth(201);
    const close = this.btn(W - 120, y0 + 10, 104, 40, () => this.closeSheet(), 210);
    this.drawBtn(close, t('Zavřít'), true, 'red');
    this.sheetObjs.push(g, title, close.bg, close.label, close.zone);
    this.addCards(i, y0 + 60, 201);
    this.refresh();
  }

  private closeSheet() {
    if (this.views.length === 1) return;
    this.sheetObjs.forEach((o) => o.destroy());
    this.sheetObjs = [];
    for (const c of this.cards)
      [c.box, c.name, c.lvl, c.bar, c.info, c.tapZone, c.buy.bg, c.buy.label, c.buy.zone, c.staff.bg, c.staff.label, c.staff.zone].forEach((o) => o.destroy());
    this.cards = [];
    this.sheet = -1;
  }

  private addCards(pubIdx: number, y0: number, depth = 10) {
    STATIONS.forEach((def, i) => {
      const y = y0 + i * CARD_H;
      const box = this.add.graphics().setDepth(depth);
      box.fillStyle(col('ink'), 0.6).fillRoundedRect(10, y, W - 20, CARD_H - 8, 10);
      const name = this.add.text(26, y + 8, '', txt(28, PAL.bone)).setDepth(depth);
      const lvl = this.add.text(26, y + 40, '', txt(20, PAL.fog)).setDepth(depth);
      const bar = this.add.graphics().setDepth(depth);
      const info = this.add.text(161, y + 81, '', txt(16, PAL.white)).setOrigin(0.5).setDepth(depth + 1);
      // ťuknutím na kartu se ručně spustí cyklus (dokud stanice nemá obsluhu)
      const tapZone = this.add.zone(10, y, 300, CARD_H - 8).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(depth);
      tapZone.on('pointerdown', () => this.manual(pubIdx, def));
      const buy = this.btn(W - 212, y + 10, 190, 56, () => this.buy(pubIdx, def), depth);
      const staff = this.btn(W - 212, y + 72, 190, 26, () => this.hire(pubIdx, def), depth);
      this.cards.push({ pub: pubIdx, def, box, name, lvl, bar, info, buy, staff, tapZone, y });
    });
  }

  private btn(x: number, y: number, w: number, h: number, fn: () => void, depth = 10): Btn {
    const bg = this.add.graphics().setDepth(depth);
    const label = this.add.text(x + w / 2, y + h / 2, '', txt(h > 40 ? 22 : 16, PAL.white)).setOrigin(0.5).setAlign('center').setDepth(depth + 1);
    const zone = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(depth + 2);
    const b: Btn = { bg, label, zone, x, y, w, h, enabled: true, visible: true };
    zone.on('pointerdown', () => {
      if (!b.visible) return;
      sfx.init();
      if (!b.enabled) return sfx.error();
      fn();
      if (label.active) this.tweens.add({ targets: label, scale: { from: 0.88, to: 1 }, duration: 120 });
    });
    return b;
  }

  private drawBtn(b: Btn, text: string, enabled: boolean, c: keyof typeof PAL, visible = true) {
    b.enabled = enabled;
    b.visible = visible;
    b.bg.clear();
    b.label.setVisible(visible);
    if (!visible) return;
    b.bg.fillStyle(col('ink')).fillRoundedRect(b.x, b.y + 4, b.w, b.h, 9);
    b.bg.fillStyle(col(enabled ? c : 'slate')).fillRoundedRect(b.x, b.y, b.w, b.h, 9);
    b.bg.fillStyle(0xffffff, enabled ? 0.15 : 0.06).fillRoundedRect(b.x + 3, b.y + 3, b.w - 6, b.h / 3, 6);
    b.label.setText(text).setColor(enabled ? PAL.white : PAL.fog);
  }

  private st(p: PubState, id: string) {
    return (p.st[id] ??= { lvl: 0, auto: false, prog: 0 });
  }


  private manual(i: number, def: StationDef) {
    const s = this.st(this.d.pubs[i], def.id);
    if (s.lvl > 0 && !s.auto && s.prog === 0) {
      s.prog = 0.0001;
      if (def.id === 'tap') sfx.pour();
      else sfx.click();
    }
  }

  private buy(i: number, def: StationDef) {
    const p = this.d.pubs[i];
    const { n, price } = this.offer(p, def);
    if (this.d.coins < price) return sfx.error();
    this.d.coins -= price;
    const s = this.st(p, def.id);
    const before = nextMilestone(s.lvl);
    s.lvl += n;
    sfx.buy();
    if (before && s.lvl >= before) this.milestone(i, def);
    this.views[i].refresh();
    this.refresh();
  }

  private hire(i: number, def: StationDef) {
    const p = this.d.pubs[i];
    const s = this.st(p, def.id);
    const c = def.staff * actMult(p.act);
    if (s.auto || s.lvl === 0) return;
    if (this.d.coins < c) return sfx.error();
    this.d.coins -= c;
    sfx.hire();
    s.auto = true;
    if (s.prog === 0) s.prog = 0.0001;
    this.views[i].refresh();
    this.refresh();
  }

  /** výdělek stanice za cyklus (úroveň, milníky, hospoda, vylepšení) */
  private pay(p: PubState, def: StationDef) {
    const lvl = p.st[def.id]?.lvl ?? 0;
    return payout(def, Math.max(1, lvl)) * actMult(p.act) * upMult(this.d.up, p.act, def.id) * (this.boosted(p) ? BOOST_MULT : 1);
  }

  private gain(n: number) {
    this.d.coins += n;
    this.d.earned += n;
  }

  private rate(p: PubState) {
    let r = 0;
    for (const def of STATIONS) {
      const s = p.st[def.id];
      if (s?.auto) r += this.pay(p, def) / def.cycle;
    }
    return r;
  }

  update(_t: number, dms: number) {
    const dt = Math.min(dms / 1000, 0.25);
    this.coinT -= dt;
    this.d.pubs.forEach((p, i) => {
      let open = 0;
      for (const def of STATIONS) {
        const s = p.st[def.id];
        if (!s || s.lvl === 0) continue;
        open++;
        if (s.prog === 0) continue;
        s.prog += dt / def.cycle;
        if (s.prog >= 1) {
          const g = this.pay(p, def);
          this.gain(g);
          this.views[i].payout(def.id, g);
          if (this.coinT <= 0) {
            sfx.coin(1 + i * 0.12);
            this.coinT = 0.3; // ať se cinkání neslévá
          }
          s.prog = s.auto ? s.prog - 1 : 0;
        }
      }
      this.views[i].update(dt, open);
    });
    this.saveT += dt;
    if (this.saveT > 5) {
      this.saveT = 0;
      store(this.d);
    }
    this.refresh();
  }

  private refresh() {
    const total = this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
    this.coinsText.setText(`${big(this.d.coins)} coins`);
    this.coinsText.setScale(Math.min(1, 226 / this.coinsText.width));
    this.rateText.setText(t('+{n} / s', { n: big(total) }));
    this.skillBtns.forEach((_, i) => this.drawSkill(i));
    this.stripRates.forEach((r, i) => r.setText(t('+{n} / s', { n: big(this.rate(this.d.pubs[i])) })));

    const cheap = this.shopOffer().some((u) => u.cost <= this.d.coins);
    this.shopDot.clear();
    if (cheap) this.shopDot.fillStyle(col('ink')).fillCircle(W - 126, 20, 11).fillStyle(col('scarlet')).fillCircle(W - 126, 20, 8);
    for (const r of this.shopRows) this.drawBtn(r.b, big(r.o.cost), this.d.coins >= r.o.cost, 'green');

    for (const c of this.cards) {
      const p = this.d.pubs[c.pub];
      const s = this.st(p, c.def.id);
      const open = s.lvl > 0;
      const { n, price } = this.offer(p, c.def);
      const staff = c.def.staff * actMult(p.act);
      c.name.setText(STATION_NAMES[p.act][c.def.id]).setAlpha(open ? 1 : 0.55);
      const ms = nextMilestone(s.lvl);
      c.lvl.setText(open ? (ms ? t('úroveň {n} · ×2 na {m}', { n: s.lvl, m: ms }) : t('úroveň {n}', { n: s.lvl })) : t('zavřeno'));
      c.info.setText(open ? t('+{n} / {s} s', { n: big(this.pay(p, c.def)), s: c.def.cycle }) : '');
      this.drawBtn(c.buy, open ? `+${n}\n${big(price)}` : t('Otevřít\n{n}', { n: big(price) }), this.d.coins >= price, 'green');
      this.drawBtn(c.staff, t('Kostlivec {n}', { n: big(staff) }), this.d.coins >= staff, 'plum', open && !s.auto);
      if (open && s.auto) c.staff.label.setVisible(true).setText(t('kostlivec ✓')).setColor(PAL.mint);
      c.bar.clear();
      c.bar.fillStyle(col('dusk')).fillRoundedRect(26, c.y + 72, 270, 18, 6);
      if (open && s.prog > 0) c.bar.fillStyle(col(s.auto ? 'mint' : 'amber')).fillRoundedRect(26, c.y + 72, Math.max(12, 270 * Math.min(1, s.prog)), 18, 6);
      if (open && !s.auto && s.prog === 0) c.info.setText(t('ťukni sem!'));
    }
  }
}
