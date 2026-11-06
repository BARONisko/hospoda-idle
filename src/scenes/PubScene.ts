import Phaser from 'phaser';
import { PAL } from '../data/palette';
import { t, lang, LANGS, AVAILABLE, setLang } from '../i18n';
import { txt } from '../ui/font';
import { big } from '../core/num';
import { STATIONS, StationDef, STATION_NAMES, PUB_NAMES, costN, affordable, payout, actMult, nextMilestone, upMult, UPGRADES, UpgradeDef, MANAGERS, mgrCost, BOOST_MULT, BOOST_S, BOOST_CD, kriglyFor, KRIGL_BONUS, PRESTIGE_MIN, KRIGL_SHOP, KriglItem, startCoins } from '../core/economy';
import { sfx } from '../core/sfx';
import { ads } from '../core/ads';
import { season, SEASONS, SEASON_BONUS } from '../core/season';
import { VISITORS, Visitor, VisitCtx } from '../game/visitors';
import { Save, PubState, load, store, newPub, Act, MAX_PUBS } from '../core/save';
import { PubView } from '../game/PubView';
import { PubEvents, EventKind, EVENT_KINDS } from '../game/events';
import { GUESTS } from '../game/PubView';
import { ACHIEVEMENTS, GUEST_NAMES, TaskKind, newDaily, taskText, today } from '../core/goals';

const W = 540;
const H = 960;
const T = 16;
const TOP = 84;
/** výška pruhu hospody při posouvání (4 hospody) */
const STRIP = 380; // horní lišta s penězi
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
/** nastavení zvuku (zvlášť od uložené hry) */
const OPTS_KEY = 'pubidle_opts';
function loadOpts() {
  try {
    const o = JSON.parse(localStorage.getItem(OPTS_KEY) ?? '{}') as { snd?: boolean; mus?: boolean };
    sfx.setMuted(o.snd === false);
    sfx.setMusic(o.mus !== false);
  } catch {
    sfx.setMusic(true);
  }
}
function saveOpts() {
  try {
    localStorage.setItem(OPTS_KEY, JSON.stringify({ snd: !sfx.muted, mus: sfx.musicOn }));
  } catch {
    /* nic */
  }
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
  /** poslední barva (kvůli překreslení při posunu) */
  c?: keyof typeof PAL;
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
  ev!: PubEvents;
  /** upíří hodina z události: ×2 vše do (ms) */
  evBoostUntil = 0;

  constructor() {
    super('Pub');
  }

  create() {
    this.d = load();
    loadOpts();
    // ladění: ?pubs=2|3 přidá hospody (než bude prestiž)
    const dbg = Number(new URLSearchParams(location.search).get('pubs'));
    while (dbg && this.d.pubs.length < Math.min(MAX_PUBS, dbg)) {
      const p = newPub((this.d.pubs.length + 1) as Act);
      p.st = { tap: { lvl: 10, auto: true, prog: 0.1 }, kitchen: { lvl: 5, auto: true, prog: 0.3 }, cellar: { lvl: 2, auto: false, prog: 0 }, dice: { lvl: 1, auto: false, prog: 0 } };
      this.d.pubs.push(p);
    }
    this.events.off('guestSeen');
    this.events.on('guestSeen', (key: string) => {
      if (!this.d.seen.includes(key)) this.d.seen.push(key);
    });
    this.views = [];
    this.cards = [];
    this.stripRates = [];
    this.skillBtns = [];
    this.strips = [];
    this.scroll = 0;
    this.drag = null;
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
    this.drawBtn(this.shopBtn, t('Menu'), true, 'plum');
    this.shopDot = this.add.graphics().setDepth(104);

    this.layout();
    this.daily();
    if (this.d.tut === undefined) this.d.tut = this.d.earned < 50 ? 0 : -1;
    this.tutShow();
    this.ev = new PubEvents(this, {
      views: this.views,
      reward: (secs, view) => {
        const p = this.d.pubs[view];
        const n = Math.max(10, Math.round(Math.max(this.rate(p), this.pay(p, STATIONS[0]) / STATIONS[0].cycle) * secs));
        this.gain(n);
        return n;
      },
      banner: (c, text, top) => this.banner(c, text, top),
      fine: (secs, view) => {
        const p = this.d.pubs[view];
        const n = Math.min(this.d.coins, Math.round(Math.max(this.rate(p), this.pay(p, STATIONS[0]) / STATIONS[0].cycle) * secs));
        this.d.coins -= n;
        return n;
      },
      boostAll: (ms) => (this.evBoostUntil = Date.now() + ms),
      onEvent: (_k, ok) => {
        if (!ok) return;
        this.d.stats.events++;
        this.task('events', 1);
      },
    });
    const evq = new URLSearchParams(location.search).get('ev') as EventKind | null;
    if (evq && EVENT_KINDS.includes(evq)) this.time.delayedCall(800, () => this.ev.start(evq, 0));
    this.applyKup();
    const vq = new URLSearchParams(location.search).get('visit');
    if (vq !== null) this.time.delayedCall(900, () => this.visit(VISITORS[Number(vq) % VISITORS.length]));

    // ťuknutí do hospody → spropitné od hosta
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      sfx.init();
      if (this.awayObjs.length || this.shopObjs.length) return; // otevřené okno
      for (const v of this.views) {
        const c = v.cam;
        if (!c.visible || this.drag?.on) continue;
        if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(c.x, c.y, c.width, c.height), ptr.x, ptr.y)) continue;
        if (this.sheet >= 0 && ptr.y > this.sheetY()) continue; // pod panelem
        const wp = c.getWorldPoint(ptr.x, ptr.y);
        if (this.ev.tap(this.views.indexOf(v), wp.x, wp.y)) return;
        if (v.tap(wp.x, wp.y)) {
          const tip = Math.max(1, Math.round(this.rate(v.pub) * 2 + this.pay(v.pub, STATIONS[0])));
          this.gain(tip);
          this.d.stats.tips++;
          this.task('tips', 1);
          this.tut('tip');
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
    const cap = this.offCap();
    const secs = Math.min(cap, raw);
    const rate = this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
    const g = Math.floor(rate * secs);
    this.d.at = Date.now();
    if (secs < OFFLINE_MIN || g < 1 || this.awayObjs.length) return;
    this.gain(g);
    store(this.d);
    this.awayPopup(g, secs, raw > cap);
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
    if (capped) tx(by + 126, t('(víc než {h} h se nepočítá)', { h: this.offCap() / 3600 }), 18, PAL.fog);
    const amt = this.add.text(0, by + 190, `+${big(g)}`, txt(44, PAL.gold)).setOrigin(0, 0.5).setDepth(D + 2);
    const x0 = W / 2 - (amt.width + 46) / 2;
    amt.setX(x0 + 46);
    objs.push(this.add.image(x0 + 16, by + 190, 'obj', 'coin').setScale(5).setDepth(D + 2), amt);
    tx(by + 236, 'coins', 22, PAL.mint);
    const done = () => {
      this.awayObjs.forEach((o) => o.destroy());
      this.awayObjs = [];
      sfx.coin(1);
    };
    const two = ads.available;
    const ok = this.btn(two ? bx + 24 : W / 2 - 110, by + bh - 90, two ? 190 : 220, 64, done, D + 3);
    this.drawBtn(ok, t('Vybrat'), true, 'green');
    objs.push(ok.bg, ok.label, ok.zone);
    if (two) {
      const x2 = this.btn(bx + bw - 214, by + bh - 90, 190, 64, async () => {
        if (await ads.rewarded()) {
          this.gain(g);
          store(this.d);
        }
        done();
      }, D + 3);
      this.drawBtn(x2, t('×2 za reklamu'), true, 'amber');
      objs.push(x2.bg, x2.label, x2.zone);
    }
    this.awayObjs = objs;
    sfx.tip();
  }

  /** oslava milníku stanice */
  private milestone(i: number, def: StationDef) {
    this.banner(this.views[i].cam, t('{s}: výdělek ×2!', { s: STATION_NAMES[this.d.pubs[i].act][def.id] }));
  }

  private banner(c: Phaser.Cameras.Scene2D.Camera, text: string, top = false) {
    sfx.fanfare();
    const tx = this.add
      .text(c.x + c.width / 2, top ? c.y + 70 : c.y + c.height / 2, text, txt(30, PAL.gold))
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
    return [...mgrs, ...ups].sort((a, b) => a.cost - b.cost).slice(0, 5);
  }

  tab: 'shop' | 'tasks' | 'book' | 'krigl' | 'opts' = 'shop';

  private openShop(tab = this.tab, toggle = true) {
    this.tut('menu');
    if (this.shopObjs.length && toggle) return this.closeShop();
    this.closeShop();
    this.closeSheet();
    this.tab = tab;
    const D = 300, RH = 96;
    const y0 = H - 6 * RH - 74;
    const block = this.add.rectangle(0, TOP, W, H - TOP, 0x000000, 0.55).setOrigin(0).setDepth(D).setInteractive();
    block.on('pointerdown', (ptr: Phaser.Input.Pointer) => ptr.y < y0 && this.closeShop());
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('dusk'), 0.98).fillRoundedRect(0, y0, W, H - y0 + 20, 16);
    g.fillStyle(col('gold')).fillRect(0, y0, W, 3);
    this.shopObjs.push(block, g);
    const tabs: [typeof tab, string][] = [
      ['shop', t('Obchod')],
      ['tasks', t('Úkoly')],
      ['book', t('Sbírka')],
      ['krigl', t('Krígly')],
      ['opts', ''],
    ];
    tabs.forEach(([id, label], i) => {
      const b = this.btn(10 + i * 102, y0 + 10, id === 'opts' ? 54 : 96, 42, () => this.openShop(id, false), D + 5);
      if (id === 'opts') this.shopObjs.push(this.add.image(b.x + 27, b.y + 21, 'icons', 'gear').setScale(2).setDepth(D + 7));
      this.drawBtn(b, label, true, id === tab ? 'amber' : 'slate');
      b.label.setScale(Math.min(1, 88 / Math.max(1, b.label.width)));
      if (id !== tab) b.label.setColor(PAL.bone);
      this.shopObjs.push(b.bg, b.label, b.zone);
      if (id === 'tasks' && this.claimable()) {
        const dot = this.add.graphics().setDepth(D + 8);
        dot.fillStyle(col('ink')).fillCircle(b.x + b.w - 6, b.y + 4, 10).fillStyle(col('scarlet')).fillCircle(b.x + b.w - 6, b.y + 4, 7);
        this.shopObjs.push(dot);
      }
    });
    const close = this.btn(W - 62, y0 + 10, 52, 42, () => this.closeShop(), D + 5);
    this.drawBtn(close, '✕', true, 'red');
    this.shopObjs.push(close.bg, close.label, close.zone);
    if (tab === 'shop') this.shopTab(y0 + 64, D, RH);
    else if (tab === 'tasks') this.tasksTab(y0 + 64, D);
    else if (tab === 'book') this.bookTab(y0 + 64, D);
    else if (tab === 'krigl') this.kriglTab(y0 + 64, D);
    else this.optsTab(y0 + 64, D);
    sfx.click();
    this.refresh();
  }

  /** řádek panelu: text vlevo, tlačítko vpravo */
  private row(y: number, h: number, D: number, title: string, sub: string, boxCol: keyof typeof PAL = 'ink', titleCol: string = PAL.bone) {
    const box = this.add.graphics().setDepth(D + 1);
    box.fillStyle(col(boxCol), boxCol === 'ink' ? 0.6 : 0.7).fillRoundedRect(10, y, W - 20, h - 8, 10);
    const name = this.add.text(26, y + 8, title, txt(h > 85 ? 26 : 22, titleCol)).setDepth(D + 1);
    name.setScale(Math.min(1, 300 / name.width));
    const st = this.add.text(26, y + (h > 85 ? 46 : 40), sub, txt(18, PAL.fog)).setDepth(D + 1);
    st.setScale(Math.min(1, 300 / st.width));
    this.shopObjs.push(box, name, st);
  }

  private shopTab(y0: number, D: number, RH: number) {
    const offer = this.shopOffer();
    const k = kriglyFor(this.d.run);
    this.row(y0, RH, D, t('Zavolat hygienu'), t('krígly: {k} (+{b} % výdělek)', { k: this.d.krigle, b: Math.round(this.d.krigle * KRIGL_BONUS * 100) }), 'blood', PAL.sand);
    const pb = this.btn(W - 212, y0 + 12, 190, 62, () => this.askPrestige(), D + 2);
    this.drawBtn(pb, k >= PRESTIGE_MIN ? t('+{k} krígel', { k }) : t('{k} / {m} krígel', { k, m: PRESTIGE_MIN }), k >= PRESTIGE_MIN, 'red');
    this.shopObjs.push(pb.bg, pb.label, pb.zone);
    if (!offer.length) this.shopObjs.push(this.add.text(W / 2, y0 + 150, t('Teď tu nic není.\nOtevři další stanice.'), txt(22, PAL.fog)).setOrigin(0.5).setAlign('center').setDepth(D + 1));
    offer.forEach((o, i) => {
      const y = y0 + (i + 1) * RH;
      this.row(y, RH, D, o.title, o.sub);
      const b = this.btn(W - 212, y + 12, 190, 62, () => o.buy(), D + 2);
      this.shopRows.push({ o, b });
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
  }

  // ---------- úkoly a úspěchy ----------
  private daily() {
    if (this.d.daily.day !== today()) this.d.daily = newDaily(this.totalRate());
    return this.d.daily;
  }

  private totalRate() {
    return this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
  }

  private task(kind: TaskKind, n: number) {
    for (const tk of this.daily().tasks) if (tk.kind === kind && !tk.claimed) tk.prog = Math.min(tk.goal, tk.prog + n);
  }

  /** je co vyzvednout (úkol nebo úspěch)? */
  private claimable() {
    return this.daily().tasks.some((k) => !k.claimed && k.prog >= k.goal) || ACHIEVEMENTS.some((a) => !this.d.ach.includes(a.id) && a.done(this.d));
  }

  private taskReward() {
    return Math.max(100, Math.round(Math.max(this.totalRate(), this.pay(this.d.pubs[0], STATIONS[0]) / STATIONS[0].cycle) * 300));
  }

  private tasksTab(y0: number, D: number) {
    const RH = 80;
    const head = (y: number, s: string) => this.shopObjs.push(this.add.text(20, y, s, txt(24, PAL.gold)).setDepth(D + 1));
    head(y0, t('Denní úkoly'));
    this.daily().tasks.forEach((tk, i) => {
      const y = y0 + 34 + i * RH;
      const done = tk.prog >= tk.goal;
      this.row(y, RH, D, taskText(tk.kind, big(tk.goal)), tk.claimed ? t('hotovo') : `${big(tk.prog)} / ${big(tk.goal)}`);
      const b = this.btn(W - 172, y + 10, 150, 54, () => {
        if (tk.claimed || !done) return sfx.error();
        tk.claimed = true;
        const n = this.taskReward();
        this.gain(n);
        sfx.fanfare();
        store(this.d);
        this.openShop('tasks', false);
      }, D + 2);
      this.drawBtn(b, tk.claimed ? '✓' : done ? t('+{n}', { n: big(this.taskReward()) }) : t('{p} %', { p: Math.floor((tk.prog / tk.goal) * 100) }), done && !tk.claimed, 'green');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    const y1 = y0 + 34 + 3 * RH + 12;
    const got = this.d.ach.length;
    head(y1, t('Úspěchy {a} / {b}  (odměna 1 krígl)', { a: got, b: ACHIEVEMENTS.length }));
    // nejdřív k vyzvednutí, pak nesplněné
    const list = ACHIEVEMENTS.filter((a) => !this.d.ach.includes(a.id)).sort((a, b) => Number(b.done(this.d)) - Number(a.done(this.d))).slice(0, 3);
    if (!list.length) head(y1 + 50, t('Všechny úspěchy splněny!'));
    list.forEach((a, i) => {
      const y = y1 + 34 + i * RH;
      const done = a.done(this.d);
      this.row(y, RH, D, a.text, done ? t('splněno!') : t('zatím ne'));
      const b = this.btn(W - 172, y + 10, 150, 54, () => {
        if (!a.done(this.d) || this.d.ach.includes(a.id)) return sfx.error();
        this.d.ach.push(a.id);
        this.d.krigle += 1;
        sfx.fanfare();
        store(this.d);
        this.openShop('tasks', false);
      }, D + 2);
      this.drawBtn(b, done ? t('+1 krígl') : '—', done, 'green');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
  }

  // ---------- nastavení ----------
  private optsTab(y0: number, D: number) {
    const RH = 96;
    const rows: [string, string, () => void][] = [
      [t('Zvuky'), sfx.muted ? t('vypnuto') : t('zapnuto'), () => sfx.setMuted(!sfx.muted)],
      [t('Hudba'), sfx.musicOn ? t('zapnuto') : t('vypnuto'), () => sfx.setMusic(!sfx.musicOn)],
      [t('Jazyk / Language'), LANGS[lang], () => setLang(AVAILABLE[(AVAILABLE.indexOf(lang) + 1) % AVAILABLE.length])],
    ];
    rows.forEach(([title, val, fn], i) => {
      const y = y0 + i * RH;
      this.row(y, RH, D, title, '');
      const b = this.btn(W - 232, y + 14, 210, 60, () => {
        fn();
        saveOpts();
        this.openShop('opts', false);
      }, D + 2);
      this.drawBtn(b, val, true, 'plum');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    this.shopObjs.push(this.add.text(W / 2, y0 + 3 * RH + 30, 'P.U.B. Idle – Pajzl Tycoon', txt(18, PAL.slate)).setOrigin(0.5).setDepth(D + 1));
  }

  // ---------- bestiář ----------
  private bookTab(y0: number, D: number) {
    const all = [...new Set([...Object.values(GUESTS).flat(), ...Object.values(SEASONS).map((x) => x.guest)])];
    this.shopObjs.push(this.add.text(W - 20, y0 + 586, `${this.d.seen.length}/${all.length}`, txt(22, PAL.gold)).setOrigin(1, 0).setDepth(D + 6));
    all.forEach((key, i) => {
      const cx = 10 + (i % 7) * 74 + 37;
      const y = y0 + Math.floor(i / 7) * 114;
      const seen = this.d.seen.includes(key);
      const box = this.add.graphics().setDepth(D + 1);
      box.fillStyle(col('ink'), 0.6).fillRoundedRect(cx - 34, y, 68, 108, 8);
      const spr = this.add.sprite(cx, y + 76, key, 1).setOrigin(0.5, 1).setScale(3.6).setDepth(D + 2);
      if (!seen) spr.setTintFill(col('dusk'));
      const nm = this.add.text(cx, y + 92, seen ? GUEST_NAMES[key] ?? Object.values(SEASONS).find((x) => x.guest === key)?.guestName ?? key : '???', txt(14, seen ? PAL.bone : PAL.slate)).setOrigin(0.5).setDepth(D + 2);
      nm.setScale(Math.min(1, 64 / nm.width));
      this.shopObjs.push(box, spr, nm);
    });
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
    this.openShop('shop', false);
    this.banner(this.views[i].cam, t('{s}: výdělek ×{m}!', { s: STATION_NAMES[u.act][u.station], m: u.mult }));
    store(this.d);
  }

  private hireMgr(p: PubState) {
    const c = mgrCost(p.act);
    if (this.d.coins < c || p.mgr) return sfx.error();
    this.d.coins -= c;
    p.mgr = true;
    const i = this.d.pubs.indexOf(p);
    this.openShop('shop', false);
    this.views[i].refresh();
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

  // ---------- návštěvníci s rozhodnutím ----------
  visitT = 120;

  /** (pro testy) */
  visitList() {
    return VISITORS;
  }

  private visitCtx(): VisitCtx {
    const cam = this.views[0].cam;
    return {
      income: (secs) => Math.max(50, Math.round(Math.max(this.totalRate(), this.pay(this.d.pubs[0], STATIONS[0]) / STATIONS[0].cycle) * secs)),
      coins: () => this.d.coins,
      spend: (n) => (this.d.coins = Math.max(0, this.d.coins - n)),
      gain: (n) => this.gain(n),
      boost: (ms) => (this.evBoostUntil = Math.max(this.evBoostUntil, Date.now()) + ms),
      later: (ms, fn) => this.time.delayedCall(ms, fn),
      say: (text) => this.banner(cam, text, true),
    };
  }

  private visit(v: Visitor) {
    const D = 520;
    const c = this.visitCtx();
    const objs: Phaser.GameObjects.GameObject[] = [];
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setDepth(D).setInteractive();
    const bx = 30, by = 230, bw = W - 60, bh = 450;
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('amber')).strokeRoundedRect(bx, by, bw, bh, 16);
    objs.push(shade, g);
    const spr = this.add.sprite(W / 2, by + 130, v.key, 1).setOrigin(0.5, 1).setScale(6).setDepth(D + 2);
    this.tweens.add({ targets: spr, y: by + 124, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.inOut' });
    const nm = this.add.text(W / 2, by + 140, v.name, txt(30, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2);
    const tx = this.add.text(W / 2, by + 186, v.text, txt(22, PAL.bone)).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(bw - 50).setDepth(D + 2);
    objs.push(spr, nm, tx);
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    [v.a, v.b].forEach((ch, i) => {
      const cost = ch.cost(c);
      const ok = this.d.coins >= cost;
      const b = this.btn(bx + 20 + i * (bw / 2), by + bh - 104, bw / 2 - 40, 84, () => {
        if (this.d.coins < cost) return sfx.error();
        this.d.coins -= cost;
        close();
        ch.run(c);
        store(this.d);
      }, D + 3);
      this.drawBtn(b, cost ? `${ch.label}\n${big(cost)} coins` : ch.label, ok, i === 0 ? 'green' : 'plum');
      b.label.setScale(Math.min(1, (b.w - 12) / b.label.width));
      objs.push(b.bg, b.label, b.zone);
    });
    this.awayObjs = objs;
    sfx.hire();
  }

  // ---------- prestiž: hygiena ----------
  private askPrestige() {
    const k = kriglyFor(this.d.run);
    if (k < PRESTIGE_MIN) return sfx.error();
    this.closeShop();
    const D = 520;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setDepth(D).setInteractive();
    const bx = 30, by = 220, bw = W - 60, bh = 470;
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('scarlet')).strokeRoundedRect(bx, by, bw, bh, 16);
    objs.push(shade, g);
    const tx = (y: number, s: string, size: number, c: string) => {
      const o = this.add.text(W / 2, y, s, txt(size, c)).setOrigin(0.5, 0).setAlign('center').setDepth(D + 2).setWordWrapWidth(bw - 40);
      objs.push(o);
      return o;
    };
    const next = this.d.pubs.length < MAX_PUBS ? PUB_NAMES[this.d.pubs.length + 1] : '';
    tx(by + 24, t('Hygiena!'), 36, PAL.scarlet);
    tx(by + 84, t('Hygienik hospodu zavře. Přijdeš o coins, úrovně, vylepšení i manažery.'), 20, PAL.bone);
    tx(by + 170, t('Dostaneš +{k} krígel', { k }), 30, PAL.gold);
    tx(by + 212, t('každý krígl = +{b} % výdělek navždy', { b: KRIGL_BONUS * 100 }), 18, PAL.fog);
    if (next) tx(by + 252, t('a otevřeš novou hospodu: {n}', { n: next }), 22, PAL.mint);
    const close = () => objs.forEach((o) => o.destroy());
    const no = this.btn(bx + 24, by + bh - 88, 180, 64, () => close(), D + 3);
    this.drawBtn(no, t('Ještě ne'), true, 'slate');
    const yes = this.btn(bx + bw - 204, by + bh - 88, 180, 64, () => this.prestige(), D + 3);
    this.drawBtn(yes, t('Zavřít hospodu'), true, 'red');
    objs.push(no.bg, no.label, no.zone, yes.bg, yes.label, yes.zone);
    yes.label.setScale(Math.min(1, 160 / yes.label.width));
    this.awayObjs = objs; // blokuje ťukání do hospody
    sfx.error();
  }

  private prestige() {
    const k = kriglyFor(this.d.run);
    const n = Math.min(MAX_PUBS, this.d.pubs.length + 1);
    this.d.krigle += k;
    this.d.stats.prestiges++;
    this.d.run = 0;
    this.d.coins = 0;
    this.d.up = [];
    const keep = this.kl('keepMgr') > 0;
    const had = this.d.pubs.map((p) => !!p.mgr);
    this.d.pubs = Array.from({ length: n }, (_, i) => newPub((i + 1) as Act));
    if (keep) this.d.pubs.forEach((p, i) => (p.mgr = had[i] ?? false));
    this.d.coins = startCoins(this.kl('start'));
    store(this.d);
    sfx.fanfare();
    this.awayObjs = [];
    this.scene.restart();
  }

  // ---------- návod pro nového hráče ----------
  tutObjs: Phaser.GameObjects.GameObject[] = [];
  private static TUT: { text: string; done: string }[] = [
    { text: t('Ťukni na Pípu – hostinský natočí pivo a vyděláš coins.'), done: 'tap' },
    { text: t('Za coins kup další úroveň pípy – vydělá víc.'), done: 'buy:tap' },
    { text: t('Ťukni na hosta v hospodě – dá ti spropitné!'), done: 'tip' },
    { text: t('Najmi kostlivce – pípa pak točí sama, i když nehraješ.'), done: 'hire' },
    { text: t('Otevři kuchyni – další zdroj coins.'), done: 'buy:kitchen' },
    { text: t('V Menu je obchod, úkoly a sbírka hostů. Hodně štěstí, hostinský!'), done: 'menu' },
  ];

  /** událost hráče posune návod */
  private tut(ev: string) {
    const i = this.d.tut ?? -1;
    if (i < 0 || PubScene.TUT[i].done !== ev) return;
    this.d.tut = i + 1 >= PubScene.TUT.length ? -1 : i + 1;
    this.tutShow();
  }

  private tutShow() {
    this.tutObjs.forEach((o) => o.destroy());
    this.tutObjs = [];
    const i = this.d.tut ?? -1;
    if (i < 0 || this.views.length > 1) return;
    const step = PubScene.TUT[i];
    // kam ukázat
    const card = (id: string) => this.cards.find((c) => c.def.id === id)!;
    let tx = 0, ty = 0;
    if (step.done === 'tap') [tx, ty] = [160, card('tap').y + 30];
    else if (step.done === 'buy:tap') [tx, ty] = [card('tap').buy.x + 95, card('tap').buy.y];
    else if (step.done === 'tip') [tx, ty] = [W / 2, TOP + 230];
    else if (step.done === 'hire') [tx, ty] = [card('tap').staff.x + 95, card('tap').staff.y];
    else if (step.done === 'buy:kitchen') [tx, ty] = [card('kitchen').buy.x + 95, card('kitchen').buy.y];
    else [tx, ty] = [this.shopBtn.x + 54, this.shopBtn.y + 50];
    const D = 420;
    const bub = this.add.text(W / 2, TOP + 16, step.text, txt(24, PAL.ink)).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(W - 80).setDepth(D + 1);
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('ink'), 0.5).fillRoundedRect(W / 2 - bub.width / 2 - 16, TOP + 10, bub.width + 32, bub.height + 16, 12);
    g.fillStyle(col('sand')).fillRoundedRect(W / 2 - bub.width / 2 - 18, TOP + 6, bub.width + 36, bub.height + 16, 12);
    const up = step.done === 'menu';
    const arrow = this.add.graphics().setDepth(D + 2).setPosition(tx, up ? ty + 30 : ty - 30);
    const tri = (gr: Phaser.GameObjects.Graphics, c: number, grow: number) =>
      gr.fillStyle(c).fillTriangle(-22 - grow, -14 - grow, 22 + grow, -14 - grow, 0, 22 + grow).fillRect(-9 - grow, -40 - grow, 18 + grow * 2, 28);
    tri(arrow, col('ink'), 4);
    tri(arrow, col('gold'), 0);
    if (up) arrow.setAngle(180);
    this.tweens.add({ targets: arrow, y: arrow.y + (up ? -10 : 10), yoyo: true, repeat: -1, duration: 380, ease: 'Sine.inOut' });
    this.tutObjs.push(g, bub, arrow);
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
    // 2–3 hospody: pruhy přes celou výšku; 4 hospody: pruhy 380 px, posouvají se prstem
    this.scrollMax = n === 4 ? n * STRIP - (H - TOP) : 0;
    const h = n === 4 ? STRIP : Math.floor((H - TOP) / n);
    this.views.forEach((v, i) => {
      const y = TOP + i * h;
      const small = h < 260;
      const items: Phaser.GameObjects.Components.Transform[] = [];
      const g = this.add.graphics().setDepth(50);
      g.fillStyle(col('gold')).fillRect(0, y + h - 4, W, 4);
      const nm = this.add.text(14, y + 10, PUB_NAMES[v.pub.act], txt(small ? 20 : 24, PAL.gold)).setDepth(51);
      nm.setScale(Math.min(1, (W - 190) / nm.width));
      g.fillStyle(col('ink'), 0.8).fillRoundedRect(6, y + 6, nm.displayWidth + 18, small ? 30 : 36, 8);
      const rt = this.add.text(small ? 14 : W - 18, small ? y + 40 : y + 12, '', txt(small ? 18 : 22, PAL.mint)).setOrigin(small ? 0 : 1, 0).setDepth(51);
      this.stripRates.push(rt);
      if (!small) g.fillStyle(col('ink'), 0.8).fillRoundedRect(W - 150, y + 8, 142, 36, 8);
      const b = this.btn(W - 170, y + h - 62, 156, 48, () => this.openSheet(i), 60);
      this.drawBtn(b, t('▲ Stanice'), true, 'green');
      this.skillBtns[i] = this.btn(14, y + h - 62, 200, 48, () => this.useSkill(i), 60);
      items.push(g, nm, rt);
      this.strips.push({ v, y, h, items, btns: [b, this.skillBtns[i]] });
    });
    if (this.scrollMax) {
      this.scrollBar = this.add.graphics().setDepth(55);
      this.hint = this.add.text(W / 2, H - 30, t('▼ táhni pro další hospody'), txt(18, PAL.bone)).setOrigin(0.5).setDepth(56).setStroke(PAL.ink, 6);
      this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
        this.drag = { y: p.y, s: this.scroll, on: false };
      });
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
        if (!p.isDown || !this.drag || this.sheet >= 0 || this.shopObjs.length || this.awayObjs.length) return;
        if (!this.drag.on && Math.abs(p.y - this.drag.y) < 12) return;
        this.drag.on = true;
        this.setScroll(this.drag.s - (p.y - this.drag.y));
      });
      this.input.on('pointerup', () => (this.drag = null));
    }
    this.setScroll(this.scroll);
  }

  // ---------- posuvné pruhy (4 hospody) ----------
  strips: { v: PubView; y: number; h: number; items: Phaser.GameObjects.Components.Transform[]; btns: Btn[] }[] = [];
  scroll = 0;
  scrollMax = 0;
  drag: { y: number; s: number; on: boolean } | null = null;
  scrollBar?: Phaser.GameObjects.Graphics;
  hint?: Phaser.GameObjects.Text;

  private setScroll(v: number) {
    const prev = this.scroll;
    this.scroll = Phaser.Math.Clamp(v, 0, this.scrollMax);
    const dy = this.scroll - prev;
    for (const st of this.strips) {
      const y = st.y - this.scroll;
      st.v.frameClip(0, y, W, st.h - 4, TOP, H, 112);
      if (dy) {
        st.items.forEach((o) => (o.y -= dy));
        st.btns.forEach((b) => {
          b.y -= dy;
          b.zone.y -= dy;
          b.label.y -= dy;
          this.drawBtn(b, b.label.text, b.enabled, b.c ?? 'green', b.visible);
        });
      }
    }
    if (this.scrollBar) {
      const vis = H - TOP, total = vis + this.scrollMax;
      const bh = (vis * vis) / total, by = TOP + (this.scroll / total) * vis;
      this.scrollBar.clear().fillStyle(col('ink'), 0.6).fillRoundedRect(W - 9, TOP + 4, 6, vis - 8, 3).fillStyle(col('gold')).fillRoundedRect(W - 9, by + 4, 6, bh - 8, 3);
      if (this.scroll > 40) this.hint?.setVisible(false);
    }
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
    b.c = c;
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
      if (def.id === 'tap') this.tut('tap');
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
    this.d.stats.levels += n;
    this.task('levels', n);
    this.tut('buy:' + def.id);
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
    this.tut('hire');
    this.views[i].refresh();
    this.refresh();
  }

  /** výdělek stanice za cyklus (úroveň, milníky, hospoda, vylepšení) */
  private pay(p: PubState, def: StationDef) {
    const lvl = p.st[def.id]?.lvl ?? 0;
    return payout(def, Math.max(1, lvl)) * actMult(p.act) * upMult(this.d.up, p.act, def.id) * (this.boosted(p) ? BOOST_MULT : 1) * (1 + KRIGL_BONUS * this.d.krigle) * (this.evBoostUntil > Date.now() ? 2 : 1) * (this.kl('cthulhu') ? 10 : 1) * (season ? 1 + SEASON_BONUS : 1);
  }

  // ---------- obchod s krígly ----------
  /** úroveň položky z obchodu s krígly */
  private kl(id: KriglItem['id']) {
    return this.d.kup?.[id] ?? 0;
  }

  private cyc(def: StationDef) {
    return def.cycle * 0.9 ** this.kl('speed');
  }

  private offCap() {
    return OFFLINE_CAP + this.kl('offline') * 4 * 3600;
  }

  private kriglTab(y0: number, D: number) {
    const RH = 86;
    this.shopObjs.push(
      this.add.text(20, y0 - 2, t('Máš {k} krígel (+{b} % výdělek)', { k: this.d.krigle, b: Math.round(this.d.krigle * KRIGL_BONUS * 100) }), txt(22, PAL.gold)).setDepth(D + 1),
      this.add.text(20, y0 + 24, t('Utracené krígly už bonus nedávají.'), txt(16, PAL.fog)).setDepth(D + 1),
    );
    KRIGL_SHOP.forEach((it, i) => {
      const y = y0 + 52 + i * RH;
      const lvl = this.kl(it.id);
      const max = lvl >= it.costs.length;
      const price = it.costs[lvl];
      this.row(y, RH, D, it.name + (it.costs.length > 1 ? ` ${lvl}/${it.costs.length}` : ''), it.desc, it.id === 'cthulhu' ? 'pine' : 'ink');
      const b = this.btn(W - 192, y + 10, 170, 60, () => {
        if (max || this.d.krigle < price) return sfx.error();
        this.d.krigle -= price;
        (this.d.kup ??= {})[it.id] = lvl + 1;
        this.applyKup();
        sfx.fanfare();
        store(this.d);
        if (it.id === 'cthulhu') this.views.forEach((v) => v.refresh());
        this.openShop('krigl', false);
      }, D + 2);
      this.drawBtn(b, max ? '✓' : t('{k} krígel', { k: price }), !max && this.d.krigle >= price, 'amber');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
  }

  /** promítne vylepšení z krígel do systémů */
  private applyKup() {
    this.ev.freq = 0.75 ** this.kl('events');
    this.views.forEach((v) => (v.cthulhu = this.kl('cthulhu') > 0));
  }

  private gain(n: number) {
    this.d.coins += n;
    this.d.earned += n;
    this.d.run += n;
    this.task('earn', n);
  }

  private rate(p: PubState) {
    let r = 0;
    for (const def of STATIONS) {
      const s = p.st[def.id];
      if (s?.auto) r += this.pay(p, def) / this.cyc(def);
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
        s.prog += dt / this.cyc(def);
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
    this.ev.update(dt);
    // návštěvník s rozhodnutím (jen když není otevřené jiné okno ani událost)
    this.visitT -= dt;
    if (this.visitT <= 0 && !this.awayObjs.length && !this.shopObjs.length && this.sheet < 0 && !this.ev.active && (this.d.tut ?? -1) < 0) {
      this.visitT = Phaser.Math.Between(180, 360);
      this.visit(Phaser.Utils.Array.GetRandom(VISITORS));
    }
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
    this.rateText.setText(t('+{n} / s', { n: big(total) }) + (season ? `  · ${SEASONS[season].name} +${SEASON_BONUS * 100} %` : ''));
    this.rateText.setScale(Math.min(1, 240 / this.rateText.width));
    this.skillBtns.forEach((_, i) => this.drawSkill(i));
    this.stripRates.forEach((r, i) => r.setText(t('+{n} / s', { n: big(this.rate(this.d.pubs[i])) })));

    const cheap = this.shopOffer().some((u) => u.cost <= this.d.coins) || this.claimable();
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
      c.info.setText(open ? t('+{n} / {s} s', { n: big(this.pay(p, c.def)), s: +this.cyc(c.def).toFixed(2) }) : '');
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
