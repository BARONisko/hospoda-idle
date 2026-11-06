import Phaser from 'phaser';
import { PAL } from '../data/palette';
import { t, lang, LANGS, AVAILABLE, setLang } from '../i18n';
import { txt } from '../ui/font';
import { confetti, rays, bigText, coinFountain, popText, punch, flashRect } from '../ui/juice';
import { big, dur } from '../core/num';
import { WAITERS, WAITER_MAX, BAR_CAP, crew, tripTime, smileBonus, hireCost as wHireCost, UP_MAX as W_UP_MAX, freePoints, xpProgress, xpFor, spent as wSpent, earned as wEarned, upName as wUpName, waiterLvl, waiterRate, tray, SMILE_STEP, START_CREW, beersPerCycle, type WaiterUp } from '../core/waiters';
import { milestoneCount } from '../core/economy';
import { STATIONS, StationDef, STATION_NAMES, PUB_NAMES, costN, affordable, payout, actMult, nextMilestone, upMult, upDef, upTiers, UpgradeDef, MANAGERS, mgrCost, BOOST_MULT, BOOST_S, BOOST_CD, kriglyFor, KRIGL_BONUS, prestigeMin, KRIGL_SHOP, KriglItem, startCoins, DECOR, kSpeed, kOffline, kEvents, kCthulhu, kKrigly, kMaxed, guestLvl, guestTips, GUEST_MAX, OFFLINE_MAX_H } from '../core/economy';
import { sfx } from '../core/sfx';
import { ads } from '../core/ads';
import { season, SEASONS, SEASON_BONUS } from '../core/season';
import { VISITORS, Visitor, VisitCtx } from '../game/visitors';
import { LEAGUES, LeagueState, weekStart, rivalTick, weekEnd, winReward } from '../core/league';
import { isNight, phaseLeft, DAY_MS, bonesFor, nightCfg, nightLen, nightShare, switchPhase, nightCost, nightCostN, NIGHT_MAX_LVL, SWITCH_LVL, SWITCH_COST } from '../core/night';
import type { TempleHost } from './TempleScene';
import { newDarts, tickDarts, dartStats, DartsState, DART_UPS, migrateDarts } from '../core/darts';
import { templeState, isWeekend, ROUNDS_PER_DAY, SEAL_BONUS, TempleState, weekendKey, ALTAR_PER } from '../core/temple';
import { TALISMANS, STAT_NAMES, talisCost, stats, SKILLS, BRANCHES, xpNeed, skillStats, OSSUARY, rollCost, OLD_OSS_PER, TEMPLE_STATS, StatId } from '../core/talisman';
import { brewCfg, BEERS, BeerKind, newBrew, brewMs, tank, lvlCost, brewBonus, sellSecs, tick } from '../core/brewery';
import { Save, PubState, load, store, newPub, Act, MAX_PUBS, exportSave, importSave } from '../core/save';
import { PubView } from '../game/PubView';
import { PubEvents, EventKind, EVENT_KINDS } from '../game/events';
import { GUESTS } from '../game/PubView';
import { ACHIEVEMENTS, GUEST_NAMES, TaskKind, newDaily, taskText, today, WeekKind, newWeekly, weekId, weekText } from '../core/goals';

const W = 540;
const H = 960;
const T = 16;
const TOP = 108;
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
/** výška ovládací lišty pod hospodou v režimu více hospod */
const SBAR = 46;
/** výhled hospody (1 hospoda) a výška záložek hospod (2–3 hospody) */
const VIEW_H = 404;
const TABH = 56;
const OPTS_KEY = 'pubidle_opts';

/** Stáhne soubor se zálohou hry */
function downloadBackup(text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = `pub-idle-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/** Vybere soubor se zálohou a předá jeho text */
function pickBackup(done: (text: string) => void) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json,application/json';
  inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.onchange = () => {
    inp.files?.[0]?.text().then(done);
    inp.remove();
  };
  // výběr souboru prohlížeč dovolí jen při „aktivaci“ – dotyk (pointerdown) se nepočítá, až zvednutí prstu
  const open = () => {
    window.removeEventListener('pointerup', open);
    window.removeEventListener('touchend', open);
    inp.click();
  };
  // Phaser zpracuje dotyk až ve snímku – zvednutí prstu už mohlo proběhnout, pak je aktivace platná hned
  if ((navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation?.isActive) return open();
  window.addEventListener('pointerup', open);
  window.addEventListener('touchend', open);
}

/** Stáhne offline verzi hry (složka PUB-Idle s index.html v zipu; sestavuje tools/offline.mjs). */
function downloadOffline() {
  const a = document.createElement('a');
  a.href = './PUB-Idle.zip';
  a.download = 'PUB-Idle.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function loadOpts() {
  try {
    // sv/mv = hlasitost zvuků/hudby 0–1; starší uložení měla jen zapnuto/vypnuto (snd/mus)
    const o = JSON.parse(localStorage.getItem(OPTS_KEY) ?? '{}') as { snd?: boolean; mus?: boolean; sv?: number; mv?: number };
    sfx.setSfxVol(o.sv ?? (o.snd === false ? 0 : 1));
    sfx.setMusVol(o.mv ?? (o.mus === false ? 0 : 1));
  } catch {
    sfx.setMusic(true);
  }
}
function saveOpts() {
  try {
    localStorage.setItem(OPTS_KEY, JSON.stringify({ sv: sfx.sfxVol, mv: sfx.musVol }));
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
export class PubScene extends Phaser.Scene implements TempleHost {
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
  infoText!: Phaser.GameObjects.Text;
  /** je teď noc */
  night = false;
  ev!: PubEvents;
  /** upíří hodina z události: ×2 vše do (ms) */
  evBoostUntil = 0;

  constructor() {
    super('Pub');
  }

  create() {
    this.d = load();
    // Chrám Cthulhu už není 4. hospoda (je z něj víkendová událost) → ze starých uložení ho odebrat
    this.d.pubs = this.d.pubs.filter((p) => p.act <= 3).slice(0, MAX_PUBS);
    if (!this.d.pubs.length) this.d.pubs = [newPub(1)];
    // číšníci: kdo už má kostlivce na pípě, dostane prvního číšníka
    for (const p of this.d.pubs) {
      if (p.st.tap?.auto && !p.w?.length) p.w = START_CREW();
      // vylepšení koupená dřív za coins zůstanou (zkušenosti aspoň na utracené body)
      for (const w of p.w ?? []) w.xp = Math.max(w.xp ?? 0, wSpent(w) ? xpFor(wSpent(w)) + 1e-6 : 0);
    }
    this.wrun = this.d.pubs.map(() => []);
    loadOpts();
    // ladění: ?pubs=2|3 přidá hospody (než bude prestiž)
    const dbg = Number(new URLSearchParams(location.search).get('pubs'));
    while (dbg && this.d.pubs.length < Math.min(MAX_PUBS, dbg)) {
      const p = newPub((this.d.pubs.length + 1) as Act);
      p.st = { tap: { lvl: 10, auto: true, prog: 0.1 }, kitchen: { lvl: 5, auto: true, prog: 0.3 }, cellar: { lvl: 2, auto: false, prog: 0 }, dice: { lvl: 1, auto: false, prog: 0 } };
      this.d.pubs.push(p);
    }
    // obchod s krígly v2: Delší spánek je teď po 30 s a Štědré hosty nahradila věrnost hostů → vrátit utracené krígly
    if (!this.d.kup2) {
      const k = this.d.kup ?? {};
      const back = (n: number, f: (l: number) => number) => Array.from({ length: n }, (_, l) => f(l)).reduce((a, b) => a + b, 0);
      this.d.krigle += back(k.offline ?? 0, (l) => Math.ceil(10 * 2 ** l)) + back(k.tips ?? 0, (l) => Math.ceil(20 * 2 ** l));
      delete k.offline;
      delete k.tips;
      this.d.kup2 = true;
    }
    // Zlatý výčep (dřív Cthulhu ×10): starým hráčům vrátit krígly za Cthulhu podle starých cen (300·6^l) a úroveň vynulovat
    if (!this.d.kup3) {
      const n = this.d.kup?.cthulhu ?? 0;
      for (let l = 0; l < n; l++) this.d.krigle += Math.ceil(300 * 6 ** l);
      if (this.d.kup) delete this.d.kup.cthulhu;
      this.d.kup3 = true;
    }
    this.events.off('guestArrive');
    this.events.on('guestArrive', () => (this.d.gxp = (this.d.gxp ?? 0) + 1 + this.ts().gxp));
    this.events.off('guestSeen');
    this.events.on('guestSeen', (key: string) => {
      if (!this.d.seen.includes(key)) this.d.seen.push(key);
    });
    this.views = [];
    this.wChips = [];
    this.wPanel = [];
    this.wPanelBtns = [];
    this.wSel = -1;
    this.cards = [];
    this.stripRates = [];
    this.pubTabs = [];
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
    this.coinIcon = this.add.image(40, 40, 'obj', 'coin').setScale(4).setDepth(101);
    this.coinsText = this.add.text(76, 12, '', txt(40, PAL.gold)).setDepth(101);
    this.rateText = this.add.text(78, 50, '', txt(22, PAL.mint)).setDepth(101);
    this.infoText = this.add.text(16, 80, '', txt(19, PAL.bone)).setDepth(101);
    this.modeBtn = this.btn(W - 112, 16, 96, 50, () => {
      this.mode = ({ 1: 10, 10: 100, 100: 0, 0: -1, [-1]: 1 } as Record<number, number>)[this.mode];
      sfx.click();
      this.drawMode();
    }, 102);
    this.drawMode();
    this.shopBtn = this.btn(W - 230, 16, 108, 50, () => this.openMenu(), 102);
    this.drawBtn(this.shopBtn, t('Menu'), true, 'plum');
    this.shopDot = this.add.graphics().setDepth(104);

    this.layout();
    this.hintObjs = [];
    this.hintBtn = undefined;
    this.idleS = 0;
    if (this.hintMode === 'a') this.hintBtn = this.btn(W - 66, this.hintY() - 52, 52, 44, () => (this.hintObjs.length ? this.hideHint() : this.showHint(this.hintY(), false)), 60);
    this.daily();
    this.time.delayedCall(700, () => this.leagueCheck());
    // „Delší noc“ byla po 30 s, teď po 1 s → úrovně ×30
    if (this.d.dn && !this.d.dn.v2) {
      this.d.dn.lvl *= 30;
      this.d.dn.v2 = true;
    }
    // kosti jsou teď malá čísla (ceny i zisky ÷ 100) – staré zásoby přepočítat jednou
    if (!this.d.bones2) {
      this.d.bones = (this.d.bones ?? 0) / 100;
      this.d.bones2 = true;
    }
    if (this.d.bup) {
      const m: Record<string, [string, number]> = { pipe: ['bones', 10], band: ['income', 3], grave: ['staff', 5], moon: ['bones', 10] };
      for (const [k, v] of Object.entries(this.d.bup)) if (m[k]) (this.d.oss ??= {})[m[k][0]] = (this.d.oss?.[m[k][0]] ?? 0) + v * m[k][1];
      delete this.d.bup;
    }
    if (this.d.oss && this.d.ossV !== 2) {
      for (const o of OSSUARY) {
        const lvl = this.d.oss[o.stat] ?? 0;
        if (lvl) this.d.oss[o.stat] = Math.round((lvl * (OLD_OSS_PER[o.stat] ?? o.per)) / o.per);
      }
    }
    this.d.ossV = 2;
    if (this.d.tut === undefined) this.d.tut = this.d.earned < 50 ? 0 : -1;
    this.tutShow();
    this.ev = new PubEvents(this, {
      views: this.views,
      reward: (secs, view) => {
        const p = this.d.pubs[view];
        const n = Math.max(10, Math.round(Math.max(this.rate(p), this.pay(p, STATIONS[0]) / STATIONS[0].cycle) * secs * (this.has('piano') ? 2 : 1) * (1 + this.ts().events)));
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
      onEvent: (k, ok) => {
        if (!ok) return;
        this.tryDrop(k === 'brawl' ? 0.06 : 0.04);
        this.d.stats.events++;
        this.week(k === 'brawl' ? 'brawls' : 'events');
        this.xp(20);
        this.task('events', 1);
      },
    });
    const evq = new URLSearchParams(location.search).get('ev') as EventKind | null;
    if (evq && EVENT_KINDS.includes(evq)) this.time.delayedCall(800, () => this.ev.start(evq, 0));
    this.applyKup();
    this.night = this.nightNow();
    this.views.forEach((v) => v.setNight(this.night));
    this.views.forEach((v) => v.showDecor(DECOR.filter((x) => this.has(x.id))));
    const vq = new URLSearchParams(location.search).get('visit');
    if (vq !== null) this.time.delayedCall(900, () => this.visit(VISITORS[Number(vq) % VISITORS.length]));

    // ťuknutí do hospody → spropitné od hosta
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      sfx.init();
      this.idleS = Math.min(this.idleS, 0) < 0 ? this.idleS : 0;
      if (this.awayObjs.length || this.shopObjs.length) return; // otevřené okno
      for (const v of this.views) {
        const c = v.cam;
        if (!c.visible || this.drag?.on) continue;
        if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(c.x, c.y, c.width, c.height), ptr.x, ptr.y)) continue;
        if (this.sheet >= 0 && ptr.y > this.sheetY()) continue; // pod panelem
        if (this.wChips.some((c) => c.zone.visible && c.zone.getBounds().contains(ptr.x, ptr.y))) continue; // lišta číšníků
        const wp = c.getWorldPoint(ptr.x, ptr.y);
        if (this.ev.tap(this.views.indexOf(v), wp.x, wp.y)) return;
        if (v.tap(wp.x, wp.y)) {
          this.tipReward(v);
          this.tut('tip');
          sfx.tip();
        }
      }
    });

    // ?away=<s> – ladění: předstírá nepřítomnost
    const away = Number(new URLSearchParams(location.search).get('away'));
    if (away) this.d.at = Date.now() - away * 1000;
    this.offline();
    if (new URLSearchParams(location.search).get('talis')) this.d.talis = Object.fromEntries(TALISMANS.map((x, i) => [x.id, i % 3 ? i : 0]));
    const dc = Number(new URLSearchParams(location.search).get('coins'));
    if (dc) this.d.coins = dc;
    const save = () => {
      if (document.visibilityState === 'visible') {
        this.offline();
        this.leagueCheck();
      }
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
    const leftAt = this.d.at;
    const raw = Math.max(0, (Date.now() - this.d.at) / 1000);
    const cap = this.offCap();
    const secs = Math.min(cap, raw);
    const rate = this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
    const g = Math.floor(rate * secs);
    this.d.at = Date.now();
    // číšníci sbírají zkušenosti i offline (jen přes den, podle toho, jak moc mají práce)
    const daySecs = secs * (1 - nightShare());
    for (const p of this.d.pubs) {
      if (!p.st.tap?.auto || !p.w?.length) continue;
      const tap = STATIONS[0];
      const busy = Math.min(1, this.beers(p) / this.cyc(tap) / crew(p.w).rate);
      for (const w of p.w) w.xp = (w.xp ?? 0) + daySecs * busy;
    }
    if (secs < OFFLINE_MIN || g < 1 || this.awayObjs.length) return;
    // část času byla noc: místo coins kosti
    const ns = nightShare();
    const coins = Math.floor(g * (1 - ns));
    const bones = secs * ns * this.bonesPerSec(true);
    // liga: o kolik soupeř mezitím přidal (jen když je to pořád stejný týden)
    const L = this.league();
    let rival: { add: number; lead: number } | undefined;
    if (L.start <= leftAt) {
      const before = rivalTick(L, leftAt);
      const after = rivalTick(L);
      rival = { add: after - before, lead: 0 };
    }
    this.gain(coins);
    this.d.bones = (this.d.bones ?? 0) + bones;
    if (rival) rival.lead = L.me - (L.rival ?? 0);
    store(this.d);
    this.awayPopup(coins, secs, raw > cap, bones, rival);
  }

  awayObjs: Phaser.GameObjects.GameObject[] = [];

  private awayPopup(g: number, secs: number, capped: boolean, bones = 0, rival?: { add: number; lead: number }) {
    const D = 500;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const dur = h ? t('{h} h {m} min', { h, m }) : t('{m} min', { m });
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(D).setInteractive();
    const bx = 40, by = rival ? 230 : 270, bw = W - 80, bh = rival ? 460 : 380;
    const g0 = this.add.graphics().setDepth(D + 1);
    g0.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g0.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g0.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    const objs: Phaser.GameObjects.GameObject[] = [shade, g0];
    const tx = (y: number, s: string, size: number, c: string) =>
      objs.push(this.add.text(W / 2, y, s, txt(size, c)).setOrigin(0.5).setAlign('center').setDepth(D + 2));
    tx(by + 44, t('Zatímco jsi byl pryč…'), 30, PAL.gold);
    tx(by + 96, t('kostlivci točili {d}', { d: dur }), 22, PAL.fog);
    if (capped) tx(by + 126, t('(víc než {h} h se nepočítá)', { h: String(Math.round(this.offCap() / 360) / 10).replace('.', ',') }), 18, PAL.fog);
    const amt = this.add.text(0, by + 190, `+${big(g)}`, txt(44, PAL.gold)).setOrigin(0, 0.5).setDepth(D + 2);
    const x0 = W / 2 - (amt.width + 46) / 2;
    amt.setX(x0 + 46);
    objs.push(this.add.image(x0 + 16, by + 190, 'obj', 'coin').setScale(5).setDepth(D + 2), amt);
    tx(by + 236, bones >= 1 ? t('coins a {n} kostí', { n: big(bones) }) : 'coins', 22, PAL.mint);
    if (rival) {
      tx(by + 284, t('Soupeř v lize mezitím přidal +{n} coins', { n: big(rival.add) }), 20, PAL.scarlet);
      tx(by + 314, rival.lead >= 0 ? t('Pořád vedeš o {n} coins', { n: big(rival.lead) }) : t('Soupeř vede o {n} coins', { n: big(-rival.lead) }), 20, rival.lead >= 0 ? PAL.mint : PAL.sand);
    }
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

  menuT = 2;

  /** krátké uvítání v nově otevřené hospodě */
  private pubIntro(act: number) {
    this.d.pubIntro = undefined;
    store(this.d);
    const D = 500;
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(D).setInteractive();
    const bx = 40, by = 250, bw = W - 80, bh = 430;
    const g0 = this.add.graphics().setDepth(D + 1);
    g0.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g0.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g0.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    const objs: Phaser.GameObjects.GameObject[] = [shade, g0];
    const tx = (y: number, s: string, size: number, c: string) =>
      objs.push(this.add.text(W / 2, y, s, txt(size, c)).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(bw - 50).setDepth(D + 2));
    const about: Record<number, string> = {
      2: t('Pod městem, ve vlhkém sklepení. Platí tu kostlivci a ztracené duše.'),
      3: t('Bažina, žáby a bahenní pivo. Žabák nalévá, dokud nekuňká.'),
      4: t('Hluboko pod mořem se otevírají dveře chrámu. Kultisté platí zlatem… a duší.'),
    };
    tx(by + 24, t('Nová hospoda!'), 34, PAL.gold);
    tx(by + 74, PUB_NAMES[act], 28, PAL.mint);
    tx(by + 124, about[act] ?? '', 21, PAL.bone);
    tx(by + 220, t('Vydělává {m}× víc než ta předchozí a běží vedle ostatních.', { m: 50 }), 20, PAL.sand);
    if (act === 2) tx(by + 284, t('V menu se otevřela Kostnice.'), 20, PAL.ice);
    const ok = this.btn(W / 2 - 110, by + bh - 90, 220, 64, () => {
      this.awayObjs.forEach((o) => o.destroy());
      this.awayObjs = [];
    }, D + 3);
    this.drawBtn(ok, t('Jdeme na to!'), true, 'green');
    objs.push(ok.bg, ok.label, ok.zone);
    this.awayObjs = objs;
    sfx.fanfare();
  }

  /** kdy se dlaždice menu odemkne (null = hned); vrací text podmínky, dokud je zamčená */
  private tileLock(name: string): string | null {
    const d = this.d, pre = d.stats.prestiges > 0;
    const opened = (id: string) => pre || d.pubs.some((p) => (p.st[id]?.lvl ?? 0) > 0);
    switch (name) {
      case 'brew': return opened('kitchen') ? null : t('po otevření kuchyně');
      case 'decor': return opened('cellar') ? null : t('po otevření sklepa');
      case 'daynight': return d.nightInfo ? null : t('po první noci');
      case 'darts': return d.nightInfo ? null : t('po první noci');
      case 'keeper': return (d.klvl ?? 1) >= 2 ? null : t('od 2. úrovně hostinského');
      case 'talis': return Object.keys(d.talis ?? {}).length ? null : t('po nálezu talismanu');
      case 'krigl': return pre ? null : t('po první hygieně');
      case 'temple': return pre ? null : t('po první hygieně');
      case 'league': return pre ? null : t('po první hygieně');
      case 'bones': return d.pubs.length >= 2 ? null : t('od 2. hospody');
      case 'coll': return d.nightInfo && (d.bones ?? 0) > 0 ? null : t('až budeš mít kosti');
      default: return null;
    }
  }

  /** nově odemčené dlaždice oznámit */
  private menuUnlocks() {
    const known = (this.d.menuOpen ??= []);
    const first = known.length === 0;
    for (const [tab, sub, label] of PubScene.TILES) {
      const key = sub && tab === 'shop' ? sub : tab;
      if (known.includes(key) || this.tileLock(key)) continue;
      known.push(key);
      if (!first && this.views[0]) this.banner(this.views[0].cam, t('Nové v menu: {s}', { s: label }));
    }
  }

  /** okno při první noci: coins teď nebudou, platí se kostmi */
  private nightIntro() {
    this.d.nightInfo = true;
    store(this.d);
    const D = 500;
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(D).setInteractive();
    const bx = 40, by = 230, bw = W - 80, bh = 470;
    const g0 = this.add.graphics().setDepth(D + 1);
    g0.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g0.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g0.lineStyle(4, col('ice')).strokeRoundedRect(bx, by, bw, bh, 16);
    const objs: Phaser.GameObjects.GameObject[] = [shade, g0];
    const tx = (y: number, s: string, size: number, c: string) =>
      objs.push(this.add.text(W / 2, y, s, txt(size, c)).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(bw - 50).setDepth(D + 2));
    tx(by + 26, t('Padla noc!'), 34, PAL.ice);
    tx(by + 84, t('V noci chodí příšery a platí kostmi – coins teď nepřibývají.'), 22, PAL.bone);
    tx(by + 170, t('Coins se vrátí ráno. Noc trvá {m} min.', { m: Math.round(nightLen() / 6000) / 10 }), 22, PAL.mint);
    tx(by + 236, t('Kosti utratíš v Obchodě (Kostnice) a za vylepšení talismanů.'), 22, PAL.gold);
    const ok = this.btn(W / 2 - 110, by + bh - 90, 220, 64, () => {
      this.awayObjs.forEach((o) => o.destroy());
      this.awayObjs = [];
    }, D + 3);
    this.drawBtn(ok, t('Rozumím'), true, 'blue');
    objs.push(ok.bg, ok.label, ok.zone);
    this.awayObjs = objs;
  }

  /** oslava milníku stanice */
  coinIcon!: Phaser.GameObjects.Image;
  private comboN = 0;
  private comboT = 0;
  private punchT = 0;

  /** milník (25, 50, 100 …): paprsky, velký nápis, konfety, mince do počítadla, otřes, zvuk (efekty B) */
  private milestone(i: number, def: StationDef) {
    const c = this.views[i].cam, cx = c.x + c.width / 2, cy = c.y + c.height / 2;
    const lvl = this.st(this.d.pubs[i], def.id).lvl;
    rays(this, cx, cy);
    bigText(this, cx, cy - 20, t('ÚROVEŇ {n}!', { n: lvl }), t('{s}: výdělek ×2!', { s: STATION_NAMES[this.d.pubs[i].act][def.id] }));
    confetti(this, cx, cy + 40, 70);
    const card = this.cards.find((k) => k.pub === i && k.def.id === def.id);
    coinFountain(this, card ? 160 : cx, card ? card.y + 40 : cy, 18, [40, 40], 462, () => this.bumpCoins());
    this.cameras.main.shake(260, 0.008);
    sfx.levelUp();
    sfx.pop();
  }

  /** počítadlo coins poskočí (nejvýš ~7× za s) */
  private bumpCoins() {
    if (this.punchT > 0) return;
    this.punchT = 0.14;
    punch(this, [this.coinIcon], 1.18);
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
    const ups: Offer[] = this.d.pubs.flatMap((p) =>
      STATIONS.filter((d) => (p.st[d.id]?.lvl ?? 0) > 0).map((d) => upDef(p.act, d.id, upTiers(this.d.up, p.act, d.id) + 1)),
    ).map((u) => ({
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

  tab: 'home' | 'shop' | 'tasks' | 'book' | 'krigl' | 'temple' | 'brew' | 'talis' | 'keeper' | 'league' | 'daynight' | 'darts' | 'coll' | 'opts' = 'home';

  /** má záložka něco nového (červená tečka)? Stejná pravidla rozsvěcují tečku na tlačítku Menu. */
  // ---------- šipky ----------
  dartsOpen = false;
  dartsT = 0;
  private openDarts() {
    this.closeShop();
    this.input.enabled = false;
    this.dartsOpen = true;
    this.scene.launch('Darts', { host: this });
  }

  dartsData(): DartsState {
    const s = (this.d.darts ??= newDarts());
    migrateDarts(s);
    return s;
  }

  dartsStats() {
    return this.ts();
  }

  dartsSave() {
    this.tsCache = undefined;
    this.applyKup();
    store(this.d);
  }

  /** šipky → kosti a hostinský: každá dohraná hra +3 kosti a +5 XP */
  dartsLeg(n: number) {
    this.d.bones = (this.d.bones ?? 0) + 3 * n;
    this.xp(5 * n);
  }

  dartsClose() {
    this.scene.stop('Darts');
    this.dartsOpen = false;
    this.input.enabled = true;
    this.menuUnlocks();
  }

  /** šipky přibývají i bez otevřeného terče; zapnutý automat je rovnou hází (i offline) */
  private dartsTick(dt: number) {
    if (!this.d.darts || this.dartsOpen || (this.dartsT -= dt) > 0) return;
    this.dartsT = 1;
    migrateDarts(this.d.darts);
    const s = this.ts();
    const r = tickDarts(this.d.darts, Date.now(), true, s.dacc, s.dspeed, s.dextra);
    if (r.pts) {
      this.dartsLeg(r.legs);
      this.tsCache = undefined;
      this.dartsNotice(r.pts);
    }
  }

  /** automat v šipkách dohrál hru, zatímco hráč je v hospodě: karta shora s konfetami, ťuknutí otevře šipky */
  private dartsNoticeObjs: Phaser.GameObjects.GameObject[] = [];
  private dartsNotice(pts: number) {
    this.dartsNoticeObjs.forEach((o) => o.destroy());
    const D = 470, x = 20, y = TOP + 8, w = W - 40, h = 92;
    const box = this.add.graphics().setDepth(D);
    box.fillStyle(col('ink'), 0.96).fillRoundedRect(0, 0, w, h, 14).lineStyle(4, col('gold')).strokeRoundedRect(0, 0, w, h, 14);
    const ic = this.add.image(46, h / 2, 'tourney', 'dartRed').setScale(4);
    const a = this.add.text(90, 14, t('Šipky: hra {n} dohraná!', { n: this.d.darts?.legs ?? 0 }), txt(28, PAL.gold));
    const b = this.add.text(90, 52, t('+{n} b. na vylepšení · ťukni a utrať', { n: pts }), txt(20, PAL.mint));
    [a, b].forEach((o) => o.setScale(Math.min(1, (w - 104) / o.width)));
    const c = this.add.container(x, y - 140, [box, ic, a, b]).setDepth(D).setSize(w, h);
    c.setInteractive(new Phaser.Geom.Rectangle(w / 2, h / 2, w, h), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => {
      c.destroy();
      this.openDarts();
    });
    this.dartsNoticeObjs = [c];
    this.tweens.add({ targets: c, y, duration: 380, ease: 'Back.out', onComplete: () => confetti(this, x + w / 2, y + h, 40, D - 1, 0.8) });
    this.tweens.add({ targets: ic, angle: { from: -25, to: 15 }, duration: 300, yoyo: true, repeat: 3 });
    this.tweens.add({ targets: c, y: y - 140, delay: 5500, duration: 400, ease: 'Quad.in', onComplete: () => c.destroy() });
    sfx.cheer();
    sfx.pop();
  }

  // ---------- chrám R'lyeh (víkendová událost) ----------
  private openTemple() {
    this.closeShop();
    this.input.enabled = false;
    this.scene.launch('Temple', { host: this });
  }

  templeData(): TempleState {
    return (this.d.temple = templeState(this.d.temple));
  }

  templeIncome() {
    return this.totalRate();
  }

  brawlCut() {
    return Math.min(0.7, this.ts().brawl);
  }

  templeStats() {
    return this.ts();
  }

  templeKriglyGift() {
    return Math.max(5, Math.round(this.d.krigle * 0.03));
  }

  templeReward(kind: 'talis' | 'krigle' | 'bones' | 'seal' | 'stat' | 'darts', n: number): string {
    if (kind === 'krigle') {
      this.d.krigle += n;
      return t('+{k} krígel', { k: big(n) });
    }
    if (kind === 'bones') {
      this.d.bones = (this.d.bones ?? 0) + n;
      return t('+{n} kostí', { n: big(n) });
    }
    if (kind === 'darts') {
      // chrám → šipky: body na vylepšení terče
      this.dartsData().pts += n;
      return t('+{n} bodů do šipek', { n });
    }
    if (kind === 'stat') {
      // malý trvalý bonus k náhodnému statu (z Kostnice nebo chrámu, bez přetečení stropu)
      const pool = [...OSSUARY, ...TEMPLE_STATS].filter((o) => o.cap === undefined || ((this.d.oss?.[o.stat] ?? 0) + n) * o.per <= o.cap + 1e-9);
      const o = Phaser.Utils.Array.GetRandom(pool);
      (this.d.oss ??= {})[o.stat] = (this.d.oss[o.stat] ?? 0) + n;
      this.tsCache = undefined;
      this.applyKup();
      return STAT_NAMES[o.stat](n * o.per);
    }
    if (kind === 'seal') return t('Pečeť R\'lyeh: výdělek všude +{v} %', { v: Math.round((this.d.temple?.boss ?? 0) * SEAL_BONUS * 100) });
    const tl = (this.d.talis ??= {});
    const pool = TALISMANS.filter((x) => x.temple);
    const d = pool.find((x) => !tl[x.id]) ?? Phaser.Utils.Array.GetRandom(pool);
    tl[d.id] = (tl[d.id] ?? 0) + 1;
    this.tsCache = undefined;
    this.applyKup();
    return tl[d.id] === 1 ? t('Nalezen talisman: {n}!', { n: d.name }) : t('{n} – úroveň {l}!', { n: d.name, l: tl[d.id] });
  }

  templeRefresh() {
    this.tsCache = undefined;
    this.applyKup();
  }

  templeSave() {
    store(this.d);
  }

  templeClose() {
    this.scene.stop('Temple');
    this.input.enabled = true;
    this.applyKup();
    this.menuUnlocks();
  }

  private tabAlert(id: string) {
    if (id === 'shop') return this.shopOffer().some((u) => u.cost <= this.d.coins);
    if (id === 'tasks') return this.claimable();
    if (id === 'brew') return this.brewFull();
    if (id === 'keeper') return this.skillPoints() > 0;
    if (id === 'darts') return !!this.d.darts && DART_UPS.some((u) => (this.d.darts!.up[u.id] ?? 0) < u.max && u.cost(this.d.darts!.up[u.id] ?? 0) <= this.d.darts!.pts);
    if (id === 'temple') return isWeekend() && !this.tileLock('temple') && templeState(this.d.temple).used < ROUNDS_PER_DAY;
    return false;
  }

  /** Menu: když někde svítí tečka, otevře rovnou tu záložku */
  /** Menu: mřížka dlaždic (červená tečka = něco tam čeká) */
  private openMenu() {
    this.openShop('home');
  }

  /** dlaždice menu: [záložka, podzáložka obchodu, název, atlas, snímek] */
  private static TILES: [PubScene['tab'], PubScene['shopSub'] | null, string, string, string][] = [
    ['temple', null, t('Chrám'), 'obj', 'dIdol1'],
    ['shop', 'up', t('Obchod'), 'obj', 'bag'],
    ['tasks', null, t('Úkoly'), 'icons', 'clipboard'],
    ['brew', null, t('Pivovar'), 'obj', 'fermenter'],
    ['league', null, t('Liga'), 'obj', 'trophy'],
    ['talis', null, t('Talismany'), 'icons', 'upAmulet'],
    ['shop', 'bones', t('Kostnice'), 'obj', 'dSkulls'],
    ['darts', null, t('Šipky'), 'tourney', 'dartRed'],
    ['coll', null, t('Sběrač'), 'icons', 'tray'],
    ['keeper', null, t('Hostinský'), 'obj', 'apronIcon'],
    ['krigl', null, t('Krígly'), 'obj', 'krigl0'],
    ['book', null, t('Sbírka'), 'icons', 'book'],
    ['shop', 'decor', t('Výzdoba'), 'obj', 'plant'],
    ['opts', null, t('Nastavení'), 'icons', 'gear'],
  ];

  private menuGrid(y0: number, D: number) {
    this.shopObjs.push(this.add.text(20, y0 + 16, t('Menu'), txt(30, PAL.gold)).setDepth(D + 2));
    const tw = (W - 40) / 3, th = 118;
    PubScene.TILES.forEach(([tab, sub, label, atlas, frame], i) => {
      const x = 10 + (i % 3) * (tw + 10), y = y0 + 64 + Math.floor(i / 3) * (th + 8);
      const lock = this.tileLock(sub && tab === 'shop' ? sub : tab);
      const b = this.btn(x, y, tw, th, () => {
        if (lock) return this.banner(this.views[0].cam, t('{s}: otevře se {c}', { s: label, c: lock }));
        if (tab === 'temple') return this.openTemple();
        if (tab === 'darts') return this.openDarts();
        if (sub) this.shopSub = sub;
        this.openShop(tab, false);
        if (tab === 'shop' && sub === 'up') this.tut('tile:shop');
      }, D + 2);
      this.drawBtn(b, '', true, lock ? 'ink' : 'slate');
      const img = this.add.image(x + tw / 2, y + 50, atlas, frame).setDepth(D + 4);
      img.setScale(Math.min(5, 64 / Math.max(img.width, img.height)));
      if (lock) img.setTintFill(col('dusk'));
      const lb = this.add.text(x + tw / 2, y + th - 24, label, txt(20, lock ? PAL.slate : PAL.bone)).setOrigin(0.5).setDepth(D + 4);
      if (lock) lb.setText(lock).setFontSize(15).setWordWrapWidth(tw - 10).setAlign('center');
      lb.setScale(Math.min(1, (tw - 12) / lb.width));
      this.shopObjs.push(b.bg, b.label, b.zone, img, lb);
      if (lock) {
        const lk = this.add.image(x + tw / 2, y + 50, 'icons', 'lock').setScale(3).setDepth(D + 5);
        this.shopObjs.push(lk);
        return;
      }
      if (!sub && this.tabAlert(tab) || (sub === 'up' && this.tabAlert('shop'))) {
        const dot = this.add.graphics().setDepth(D + 8);
        dot.fillStyle(col('ink')).fillCircle(x + tw - 6, y + 4, 11).fillStyle(col('scarlet')).fillCircle(x + tw - 6, y + 4, 8);
        this.shopObjs.push(dot);
      }
    });
  }

  private openShop(tab = this.tab, toggle = true) {
    this.tut('menu');
    if (this.shopObjs.length && toggle) {
      this.closeShop();
      return this.tut('close');
    }
    this.closeShop();
    this.closeSheet();
    // návod se v menu skryje – kromě kroků, které ukazují právě do menu
    const menuStep = ['tile:shop', 'close'].includes(PubScene.TUT[this.d.tut ?? -1]?.done ?? '');
    if (!menuStep) this.tutObjs.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Visible).setVisible(false));
    this.tab = tab;
    const D = 300, RH = 96;
    const y0 = H - 6 * RH - 126;
    const block = this.add.rectangle(0, TOP, W, H - TOP, 0x000000, 0.55).setOrigin(0).setDepth(D).setInteractive();
    block.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (ptr.y >= y0) return;
      this.closeShop();
      this.tut('close');
    });
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('dusk'), 0.98).fillRoundedRect(0, y0, W, H - y0 + 20, 16);
    g.fillStyle(col('gold')).fillRect(0, y0, W, 3);
    this.shopObjs.push(block, g);
    // hlavička: v mřížce jen ✕, v sekci „← Menu“ + název
    if (tab !== 'home') {
      // Den a noc je teď v Kostnici → zpět do Kostnice
      const dn = tab === 'daynight';
      const back = this.btn(10, y0 + 10, 130, 42, () => (dn ? ((this.shopSub = 'bones'), this.openShop('shop', false)) : this.openShop('home', false)), D + 5);
      this.drawBtn(back, dn ? t('← Kostnice') : t('← Menu'), true, 'plum');
      const tile = PubScene.TILES.find(([tb, sub]) => tb === tab && (tab !== 'shop' || sub === this.shopSub));
      const title = this.add.text(W / 2 + 30, y0 + 31, dn ? t('Den a noc') : tile?.[2] ?? '', txt(28, PAL.gold)).setOrigin(0.5).setDepth(D + 5);
      title.setScale(Math.min(1, 260 / title.width));
      this.shopObjs.push(back.bg, back.label, back.zone, title);
    }
    const close = this.btn(W - 62, y0 + 10, 52, 42, () => {
      this.closeShop();
      this.tut('close');
    }, D + 5);
    this.drawBtn(close, '✕', true, 'red');
    this.shopObjs.push(close.bg, close.label, close.zone);
    const cy0 = y0 + 112;
    if (tab === 'home') this.menuGrid(y0, D);
    else if (tab === 'daynight') this.dayNightTab(cy0 - 40, D);
    else if (tab === 'coll') this.collTab(cy0 - 44, D);
    else if (tab === 'shop') this.shopTab(cy0 - 52, D, RH);
    else if (tab === 'tasks') this.tasksTab(cy0, D);
    else if (tab === 'book') this.bookTab(cy0, D);
    else if (tab === 'krigl') this.kriglTab(cy0, D);
    else if (tab === 'brew') this.brewTab(cy0 - 50, D);
    else if (tab === 'talis') this.talisTab(cy0, D);
    else if (tab === 'keeper') this.keeperTab(cy0, D);
    else if (tab === 'league') this.leagueTab(cy0, D);
    else this.optsTab(cy0, D);
    sfx.click();
    this.refresh();
  }

  /** další záložky ve 2. řádku (talismany, hostinský) */
  private extraTabs(): [PubScene['tab'], string, number, number][] {
    return [
      ['talis', t('Talismany'), 1, 1],
      ['keeper', t('Hostinský'), 2, 1],
      ['league', t('Liga'), 3, 1],
    ];
  }

  tsCache?: ReturnType<typeof stats>;
  tsAt = -1;

  // ---------- talismany ----------
  private ts() {
    // talismany + dovednosti + Kostnice (kešováno na snímek)
    const now = this.time.now;
    if (this.tsCache && this.tsAt === now) return this.tsCache;
    const a = stats(this.d.talis), b = skillStats(this.d.skills);
    for (const k of Object.keys(a) as (keyof typeof a)[]) a[k] += b[k];
    for (const o of OSSUARY) a[o.stat] += (this.d.oss?.[o.stat] ?? 0) * o.per;
    // staty z chrámu: trvalé z truhel (d.oss) a týdenní z oltáře (platí jen do dalšího víkendu)
    for (const o of TEMPLE_STATS) a[o.stat] += (this.d.oss?.[o.stat] ?? 0) * o.per;
    const al = this.d.temple?.altar;
    // propojení částí hry (malé bonusy pod 1 % za úroveň):
    // pivovar → šipky přibývají rychleji, sběrač → chapadla, hostinský → síla v chrámu
    a.dspeed += 0.005 * Math.max(0, (this.d.brew?.lvl ?? 1) - 1);
    a.tentacles += 0.003 * Object.values(this.d.coll ?? {}).reduce((x, c) => x + c.spd + c.amt, 0);
    a.temple += 0.005 * Math.max(0, (this.d.klvl ?? 1) - 1);
    const ds = dartStats(this.d.darts);
    for (const [k, v] of Object.entries(ds)) a[k as StatId] += v as number;
    if (al && al.wk === weekendKey()) for (const [k, n] of Object.entries(al.lv)) a[k as StatId] += (n as number) * ALTAR_PER;
    this.tsCache = a;
    this.tsAt = now;
    return a;
  }

  // ---------- týdenní liga ----------
  /** aktuální liga; na začátku nového týdne vyhodnotí ten minulý */
  private league(): LeagueState {
    const ws = weekStart();
    let L = this.d.league;
    if (!L || L.start !== ws) {
      let tier = L?.tier ?? 1;
      if (L) {
        const rival = rivalTick(L, weekEnd(L));
        const win = L.me > rival;
        this.leagueResult = { win, me: L.me, rival, tier };
        this.d.leagueHist = [...(this.d.leagueHist ?? []), [tier, win] as [number, boolean]].slice(-8);
        if (win) {
          this.d.krigle += winReward(tier);
          // liga → šipky: +3 body
          if (this.d.darts) this.d.darts.pts += 3;
          this.leagueWinDrop = true;
          tier = Math.min(LEAGUES.length, tier + 1);
        } else tier = Math.max(1, tier - 1);
      }
      L = { week: String(ws), start: ws, tier, rate: Math.max(1, this.totalRate()), me: 0, rival: 0, rAt: ws };
      this.d.league = L;
      store(this.d);
    }
    return L;
  }

  /** živé překreslení čísel v záložce Liga (nastaví leagueTab) */
  leagueLive?: () => void;
  leagueLiveT = 0;
  dnT = 1;
  leagueResult?: { win: boolean; me: number; rival: number; tier: number };
  leagueWinDrop = false;

  /** okno s výsledkem minulého týdne */
  private leagueCheck() {
    this.league();
    const r = this.leagueResult;
    if (!r || this.awayObjs.length) return;
    this.leagueResult = undefined;
    if (this.leagueWinDrop) {
      this.leagueWinDrop = false;
      this.tryDrop(1);
    }
    const D = 520;
    const objs: Phaser.GameObjects.GameObject[] = [];
    objs.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(D).setInteractive());
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('dusk')).fillRoundedRect(30, 260, W - 60, 380, 16);
    g.lineStyle(4, col(r.win ? 'gold' : 'scarlet')).strokeRoundedRect(30, 260, W - 60, 380, 16);
    objs.push(g);
    const tx = (y: number, s2: string, size: number, c: string) => objs.push(this.add.text(W / 2, y, s2, txt(size, c)).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(W - 100).setDepth(D + 2));
    tx(284, r.win ? t('Vyhrál jsi ligu!') : t('Prohrál jsi ligu…'), 34, r.win ? PAL.gold : PAL.scarlet);
    tx(344, t('Tvoje tržba: {a} coins\nSoupeř: {b} coins', { a: big(r.me), b: big(r.rival) }), 22, PAL.bone);
    tx(420, r.win ? t('Odměna: +{k} krígel a talisman. Postupuješ do: {l}', { k: big(winReward(r.tier)), l: LEAGUES[Math.min(LEAGUES.length, r.tier + 1) - 1] }) : t('Sestupuješ do: {l}', { l: LEAGUES[Math.max(1, r.tier - 1) - 1] }), 22, r.win ? PAL.mint : PAL.fog);
    const ok = this.btn(W / 2 - 100, 560, 200, 60, () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    }, D + 3);
    this.drawBtn(ok, t('Dál'), true, 'green');
    objs.push(ok.bg, ok.label, ok.zone);
    this.awayObjs = objs;
    if (r.win) sfx.fanfare();
    else sfx.error();
  }

  private leagueTab(y0: number, D: number) {
    const L = this.league();
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const g = add(this.add.graphics().setDepth(D + 1));
    // žebříček lig
    const n = LEAGUES.length;
    const step = (W - 120) / (n - 1);
    for (let i = 0; i < n - 1; i++) g.fillStyle(col(i + 1 < L.tier ? 'gold' : 'slate')).fillRect(60 + i * step, y0 + 27, step, 6);
    for (let i = 0; i < n; i++) {
      const cx = 60 + i * step, cy = y0 + 30, cur = i + 1 === L.tier;
      g.fillStyle(col('ink')).fillCircle(cx, cy + 3, cur ? 26 : 20);
      g.fillStyle(col(i + 1 < L.tier ? 'gold' : cur ? 'amber' : 'slate')).fillCircle(cx, cy, cur ? 26 : 20);
      add(this.add.text(cx, cy, String(i + 1), txt(cur ? 28 : 22, i + 1 <= L.tier ? PAL.ink : PAL.fog)).setOrigin(0.5).setDepth(D + 2));
      if (cur) {
        const ring = add(this.add.circle(cx, cy, 30).setStrokeStyle(3, col('gold')).setDepth(D + 1));
        this.tweens.add({ targets: ring, scale: { from: 0.9, to: 1.2 }, alpha: { from: 1, to: 0 }, repeat: -1, duration: 1200 });
      }
    }
    add(this.add.text(W / 2, y0 + 66, LEAGUES[L.tier - 1], txt(30, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2));
    const left = Math.max(0, weekEnd(L) - Date.now());
    const d = Math.floor(left / 86400000), h = Math.floor((left % 86400000) / 3600000), m = Math.floor((left % 3600000) / 60000);
    add(this.add.text(W / 2, y0 + 104, t('do konce týdne: {d} d {h} h {m} min', { d, h, m }), txt(17, PAL.fog)).setOrigin(0.5, 0).setDepth(D + 2));
    // karta: soupeř proti mně – čísla se živě přepisují (leagueLive)
    g.fillStyle(col('ink'), 0.7).fillRoundedRect(10, y0 + 132, W - 20, 232, 14);
    const frame = add(this.add.graphics().setDepth(D + 1));
    add(this.add.text(30, y0 + 146, t('SOUPEŘ'), txt(18, PAL.fog)).setDepth(D + 2));
    const rivalT = add(this.add.text(30, y0 + 166, '', txt(44, PAL.scarlet)).setDepth(D + 2));
    add(this.add.text(W - 30, y0 + 146, t('TVOJE TRŽBA'), txt(18, PAL.fog)).setOrigin(1, 0).setDepth(D + 2));
    const meT = add(this.add.text(W - 30, y0 + 166, '', txt(44, PAL.mint)).setOrigin(1, 0).setDepth(D + 2));
    const bar = add(this.add.graphics().setDepth(D + 2));
    const msg = add(this.add.text(W / 2, y0 + 296, '', txt(20, PAL.mint)).setOrigin(0.5, 0).setDepth(D + 2));
    add(this.add.text(W / 2, y0 + 326, t('Soupeř zrychluje každý den – a když vedeš, zabere víc.'), txt(15, PAL.fog)).setOrigin(0.5, 0).setWordWrapWidth(W - 60).setAlign('center').setDepth(D + 2));
    this.leagueLive = () => {
      const rival = rivalTick(L), lead = L.me >= rival;
      rivalT.setText(big(rival));
      meT.setText(big(L.me));
      frame.clear().lineStyle(3, col(lead ? 'mint' : 'scarlet')).strokeRoundedRect(10, y0 + 132, W - 20, 232, 14);
      // přetahovaná: vlevo podíl soupeře, vpravo můj, bílá čára = remíza
      const bx = 30, bw = W - 60, by = y0 + 236;
      const share = L.me + rival > 0 ? rival / (L.me + rival) : 0.5;
      bar.clear().fillStyle(col('mint')).fillRoundedRect(bx, by, bw, 34, 10);
      bar.fillStyle(col('scarlet')).fillRoundedRect(bx, by, Math.max(20, Math.min(bw - 20, bw * share)), 34, 10);
      bar.fillStyle(col('white')).fillRect(bx + bw / 2 - 2, by - 8, 4, 50);
      msg.setText(lead ? t('Vedeš o {n} coins – soupeř přidává!', { n: big(L.me - rival) }) : t('Soupeř vede o {n} coins', { n: big(rival - L.me) }));
      msg.setColor(lead ? PAL.mint : PAL.sand);
    };
    this.leagueLive();
    // odměny
    g.fillStyle(col('pine'), 0.8).fillRoundedRect(10, y0 + 376, W / 2 - 15, 76, 12);
    g.fillStyle(col('blood'), 0.8).fillRoundedRect(W / 2 + 5, y0 + 376, W / 2 - 15, 76, 12);
    add(this.add.text(W / 4 + 2, y0 + 384, t('VÝHRA'), txt(18, PAL.mint)).setOrigin(0.5, 0).setDepth(D + 2));
    add(this.add.text(W / 4 + 2, y0 + 408, t('+{k} krígel, talisman\na postup', { k: big(winReward(L.tier)) }), txt(16, PAL.bone)).setOrigin(0.5, 0).setAlign('center').setDepth(D + 2));
    add(this.add.text((W * 3) / 4 - 2, y0 + 384, t('PROHRA'), txt(18, PAL.scarlet)).setOrigin(0.5, 0).setDepth(D + 2));
    add(this.add.text((W * 3) / 4 - 2, y0 + 408, L.tier > 1 ? t('sestup do ligy {n}', { n: L.tier - 1 }) : t('zůstaneš v 1. lize'), txt(16, PAL.bone)).setOrigin(0.5, 0).setDepth(D + 2));
    // historie posledních týdnů
    const hist = this.d.leagueHist ?? [];
    add(this.add.text(20, y0 + 468, t('Minulé týdny:'), txt(16, PAL.fog)).setDepth(D + 2));
    if (!hist.length) add(this.add.text(140, y0 + 468, t('zatím žádné'), txt(16, PAL.slate)).setDepth(D + 2));
    hist.forEach(([tier, win], i) => {
      const cx = 140 + i * 46;
      g.fillStyle(col(win ? 'green' : 'red')).fillRoundedRect(cx, y0 + 460, 40, 32, 8);
      add(this.add.text(cx + 20, y0 + 476, `${win ? '✓' : '✗'}${tier}`, txt(16, PAL.white)).setOrigin(0.5).setDepth(D + 2));
    });
  }

  // ---------- hostinský: úroveň a strom dovedností ----------
  private xp(n: number) {
    this.d.xp = (this.d.xp ?? 0) + n * (1 + this.ts().xp);
    this.d.klvl ??= 1;
    while (this.d.xp >= xpNeed(this.d.klvl)) {
      this.d.xp -= xpNeed(this.d.klvl);
      this.d.klvl++;
      this.banner(this.views[0].cam, t('Hostinský úroveň {n}! +1 bod dovedností', { n: this.d.klvl }), true);
    }
  }

  private skillPoints() {
    return (this.d.klvl ?? 1) - 1 - (this.d.skills?.length ?? 0);
  }

  private keeperTab(y0: number, D: number) {
    const lvl = this.d.klvl ?? 1, xp = this.d.xp ?? 0, pts = this.skillPoints();
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink'), 0.6).fillRoundedRect(10, y0, W - 20, 70, 10);
    g.fillStyle(col('dusk')).fillRoundedRect(26, y0 + 44, W - 52, 14, 6);
    g.fillStyle(col('gold')).fillRoundedRect(26, y0 + 44, Math.max(10, (W - 52) * Math.min(1, xp / xpNeed(lvl))), 14, 6);
    this.shopObjs.push(
      g,
      this.add.text(26, y0 + 8, t('Hostinský – úroveň {n}', { n: lvl }), txt(24, PAL.gold)).setDepth(D + 2),
      this.add.text(W - 26, y0 + 12, t('body: {n}', { n: pts }), txt(20, pts > 0 ? PAL.mint : PAL.fog)).setOrigin(1, 0).setDepth(D + 2),
    );
    const own = this.d.skills ?? [];
    BRANCHES.forEach((name, bi) => {
      const x = 10 + bi * 174;
      this.shopObjs.push(this.add.text(x + 83, y0 + 82, name, txt(22, PAL.bone)).setOrigin(0.5, 0).setDepth(D + 2));
      SKILLS.filter((n) => n.branch === bi).forEach((n, i, arr) => {
        const has = own.includes(n.id);
        const can = !has && pts > 0 && (i === 0 || own.includes(arr[i - 1].id));
        const b = this.btn(x, y0 + 114 + i * 94, 166, 82, () => {
          if (!can) return sfx.error();
          (this.d.skills ??= []).push(n.id);
          this.applyKup();
          sfx.fanfare();
          store(this.d);
          this.openShop('keeper', false);
        }, D + 2);
        this.drawBtn(b, STAT_NAMES[n.stat](n.val), has || can, has ? 'pine' : 'plum');
        b.label.setWordWrapWidth(150).setScale(1);
        b.label.setScale(Math.min(1, 156 / b.label.width, 70 / b.label.height));
        this.shopObjs.push(b.bg, b.label, b.zone);
        if (has) this.shopObjs.push(this.add.text(b.x + b.w - 8, b.y + 4, '✓', txt(18, PAL.mint)).setOrigin(1, 0).setDepth(D + 4));
      });
    });
  }

  /** vzácný nález talismanu (nový = úroveň 1, už ho máš = +1 úroveň zdarma) */
  private tryDrop(chance: number) {
    if (Math.random() >= chance * (1 + this.ts().luck)) return;
    const d = Phaser.Utils.Array.GetRandom(TALISMANS.filter((x) => !x.temple));
    const tl = (this.d.talis ??= {});
    tl[d.id] = (tl[d.id] ?? 0) + 1;
    this.applyKup();
    this.banner(this.views[0].cam, tl[d.id] === 1 ? t('Nalezen talisman: {n}!', { n: d.name }) : t('{n} – úroveň {l}!', { n: d.name, l: tl[d.id] }));
    store(this.d);
  }

  private talisTab(y0: number, D: number) {
    const tl = this.d.talis ?? {};
    const bones = this.d.bones ?? 0;
    this.shopObjs.push(this.add.text(20, y0 - 4, t('Vzácné nálezy z událostí, rvaček a návštěv. Vylepšují se za kosti.'), txt(16, PAL.fog)).setDepth(D + 1).setWordWrapWidth(W - 40));
    TALISMANS.forEach((d, i) => {
      const RT = TALISMANS.length > 10 ? 90 : 112;
      const x = 10 + (i % 2) * 262, y = y0 + 24 + Math.floor(i / 2) * RT;
      const lvl = tl[d.id] ?? 0;
      const box = this.add.graphics().setDepth(D + 1);
      box.fillStyle(col(lvl ? 'ink' : 'dusk'), 0.7).fillRoundedRect(x, y, 256, RT - 6, 10);
      const ic = this.add.image(x + 34, y + 40, d.atlas, d.frame).setDepth(D + 2);
      ic.setScale(Math.min(3, 52 / Math.max(ic.width, ic.height)));
      if (!lvl) ic.setTintFill(col('slate'));
      const nm = this.add.text(x + 66, y + (RT < 100 ? 4 : 8), lvl ? `${d.name} ${lvl}` : '???', txt(20, lvl ? PAL.gold : PAL.slate)).setDepth(D + 2);
      nm.setScale(Math.min(1, 180 / nm.width));
      const st = this.add.text(x + 66, y + (RT < 100 ? 26 : 34), STAT_NAMES[d.stat](Math.max(1, lvl) * d.per), txt(15, lvl ? PAL.mint : PAL.slate)).setDepth(D + 2);
      st.setScale(Math.min(1, 182 / st.width));
      this.shopObjs.push(box, ic, nm, st);
      if (!lvl) return;
      const cost = talisCost(lvl);
      const b = this.btn(x + 66, y + (RT < 100 ? 46 : 58), 180, RT < 100 ? 34 : 38, () => {
        if ((this.d.bones ?? 0) < cost) return sfx.error();
        this.d.bones! -= cost;
        tl[d.id] = lvl + 1;
        this.applyKup();
        sfx.buy();
        store(this.d);
        this.openShop('talis', false);
      }, D + 2);
      this.drawBtn(b, t('+1 · {n} kostí', { n: big(cost) }), bones >= cost, 'blue');
      b.label.setScale(Math.min(1, 170 / b.label.width));
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
  }

  // ---------- pivovar ----------
  private brew() {
    return (this.d.brew ??= newBrew());
  }

  private brewFull() {
    const b = this.brew();
    tick(b);
    return b.stock >= tank(b);
  }

  private brewTab(y0: number, D: number) {
    const b = this.brew();
    tick(b);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const box = add(this.add.graphics().setDepth(D + 1));
    box.fillStyle(col('ink'), 0.6).fillRoundedRect(10, y0, W - 20, 196, 10);
    const ferm = add(this.add.image(80, y0 + 150, 'obj', b.stock < tank(b) ? 'fermenterHiss' : 'fermenter').setOrigin(0.5, 1).setScale(4).setDepth(D + 2));
    if (b.stock < tank(b)) this.tweens.add({ targets: ferm, scaleY: 4.15, yoyo: true, repeat: -1, duration: 700 });
    add(this.add.text(150, y0 + 12, t('Pivovar – úroveň {n}', { n: b.lvl }), txt(26, PAL.gold)).setDepth(D + 2));
    add(this.add.text(150, y0 + 46, t('trvalý bonus: výdělek +{p} %', { p: String(Math.round(brewBonus(b) * 1000) / 10).replace('.', ',') }), txt(18, PAL.mint)).setDepth(D + 2));
    add(this.add.text(150, y0 + 72, t('V tanku: {a} / {b} piv', { a: b.stock, b: tank(b) }), txt(22, PAL.bone)).setDepth(D + 2));
    this.brewBar = add(this.add.graphics().setDepth(D + 2));
    this.brewTxt = add(this.add.text(150, y0 + 140, '', txt(18, PAL.fog)).setDepth(D + 2));
    this.brewY = y0 + 110;
    // druh piva (rozhodnutí: rychle a levně, nebo pomalu a draze)
    add(this.add.text(20, y0 + 208, t('Co vařit:'), txt(20, PAL.gold)).setDepth(D + 2));
    (Object.keys(BEERS) as BeerKind[]).forEach((k, i) => {
      const bt = this.btn(10 + i * 175, y0 + 236, 165, 62, () => {
        b.kind = k;
        store(this.d);
        this.openShop('brew', false);
      }, D + 2);
      this.drawBtn(bt, `${BEERS[k].name}\n×${BEERS[k].value} · ${t('čas ×{t}', { t: BEERS[k].time })}`, true, b.kind === k ? 'amber' : 'slate');
      bt.label.setScale(Math.min(1, 150 / bt.label.width));
      this.shopObjs.push(bt.bg, bt.label, bt.zone);
    });
    // prodat / vložit do pivovaru
    const price = this.visitCtx().income(sellSecs(b) * (1 + this.ts().beer));
    const sell = this.btn(10, y0 + 310, 255, 70, () => {
      if (b.stock < 1) return sfx.error();
      b.stock--;
      this.xp(15);
      this.week('beers');
      this.gain(price);
      sfx.coin(1.2);
      store(this.d);
      this.openShop('brew', false);
    }, D + 2);
    this.drawBtn(sell, t('Prodat pivo\n+{n} coins', { n: big(price) }), b.stock > 0, 'green');
    const inv = this.btn(275, y0 + 310, 255, 70, () => {
      if (b.stock < 1) return sfx.error();
      b.stock--;
      b.inv++;
      this.week('beers');
      if (b.inv >= lvlCost(b)) {
        b.inv = 0;
        b.lvl++;
        this.banner(this.views[0].cam, t('Pivovar úroveň {n}!', { n: b.lvl }));
      } else sfx.buy();
      store(this.d);
      this.openShop('brew', false);
    }, D + 2);
    this.drawBtn(inv, t('Vylepšit pivovar\n{a} / {b} piv', { a: b.inv, b: lvlCost(b) }), b.stock > 0, 'plum');
    this.shopObjs.push(sell.bg, sell.label, sell.zone, inv.bg, inv.label, inv.zone);
    // pivní akce: piva z tanku na efekty pro hru (každá se hodí v jiné situaci, silnější stojí víc)
    add(this.add.text(20, y0 + 392, t('Pivní akce (piva z tanku):'), txt(20, PAL.gold)).setDepth(D + 2));
    const fx = (this.d.fx ??= {});
    const L = this.league();
    const now = Date.now();
    const happyLeft = Math.max(0, (fx.happy ?? 0) - now), slowLeft = Math.max(0, (L.slowUntil ?? 0) - now);
    const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
    const acts: { cost: number; label: string; on?: string; ok: boolean; run: () => void }[] = [
      { cost: 2, label: t('Happy hour\n{m} min ×2', { m: this.happyMin() }), on: happyLeft ? t('běží {t}', { t: mmss(happyLeft) }) : undefined, ok: !happyLeft, run: () => {
        fx.happy = Date.now() + this.happyMin() * 60_000;
        this.banner(this.views[0].cam, t('Happy hour! Výdělek ×2 na {m} min', { m: this.happyMin() }));
      } },
      { cost: 1, label: t('Runda pro všechny\nspropitné od všech'), ok: true, run: () => {
        const per = Math.max(1, Math.round(this.visitCtx().income(sellSecs(b) * (1 + this.ts().beer)) * 0.08));
        let n = 0;
        this.views.forEach((v) => (n += v.tipAll('+' + big(per))));
        n = Math.max(n, 1);
        this.gain(per * n);
        this.d.stats.tips += n;
        this.week('tips', n);
        this.task('tips', n);
        this.xp(n);
        sfx.tip();
      } },
      { cost: 2, label: t('Pivo soupeři\nsoupeř 1 h na ½'), on: slowLeft ? t('běží {t}', { t: mmss(slowLeft) }) : undefined, ok: !slowLeft, run: () => {
        rivalTick(L);
        L.slowUntil = Date.now() + 3600_000;
        this.banner(this.views[0].cam, t('Soupeř se opil – hodinu vydělává polovinu!'));
      } },
      { cost: 1, label: t('Probuď manažery\nschopnosti hned'), ok: this.d.pubs.some((p) => p.mgr && (p.boostReady ?? 0) > Date.now() && !this.boosted(p)), run: () => {
        this.d.pubs.forEach((p) => p.mgr && !this.boosted(p) && (p.boostReady = 0));
        this.skillBtns.forEach((_, i) => this.drawSkill(i));
        this.banner(this.views[0].cam, t('Manažeři jsou vzhůru!'));
      } },
      { cost: 2, label: t('Noční várka\nnoc ×2 kosti'), on: fx.nightx2 ? t('platí do rána') : undefined, ok: !fx.nightx2, run: () => {
        fx.nightx2 = true;
        this.banner(this.views[0].cam, this.night ? t('Noční várka: tuhle noc ×2 kosti!') : t('Noční várka: příští noc ×2 kosti!'));
      } },
    ];
    acts.forEach((a, i) => {
      const bw = 166, x = 10 + (i % 3) * (bw + 9), y = y0 + 420 + Math.floor(i / 3) * 86;
      const can = a.ok && b.stock >= a.cost;
      const bt = this.btn(x, y, bw, 78, () => {
        if (!a.ok || b.stock < a.cost) return sfx.error();
        b.stock -= a.cost;
        a.run();
        store(this.d);
        this.openShop('brew', false);
      }, D + 2);
      this.drawBtn(bt, a.on ?? `${a.label}\n${t('{n} piva', { n: a.cost })}`, can, a.on ? 'slate' : 'amber');
      bt.label.setFontSize(18).setScale(Math.min(1, (bw - 10) / bt.label.width));
      this.shopObjs.push(bt.bg, bt.label, bt.zone);
    });
    this.drawBrewBar();
  }

  brewBar?: Phaser.GameObjects.Graphics;
  brewTxt?: Phaser.GameObjects.Text;
  brewY = 0;

  private drawBrewBar() {
    if (!this.brewBar?.active || !this.brewTxt) return;
    const b = this.brew();
    const full = b.stock >= tank(b);
    const p = full ? 1 : Math.min(1, (Date.now() - b.at) / brewMs(b));
    this.brewBar.clear().fillStyle(col('dusk')).fillRoundedRect(150, this.brewY, 360, 22, 8);
    this.brewBar.fillStyle(col(full ? 'scarlet' : 'amber')).fillRoundedRect(150, this.brewY, Math.max(14, 360 * p), 22, 8);
    const left = Math.max(0, Math.ceil((brewMs(b) - (Date.now() - b.at)) / 1000));
    this.brewTxt.setText(full ? t('Tank je plný – prodej nebo vylepši!') : t('{k}: další pivo za {m}:{s}', { k: BEERS[b.kind].name, m: Math.floor(left / 60), s: String(left % 60).padStart(2, '0') }));
  }

  /** řádek panelu: text vlevo, tlačítko vpravo */
  private row(y: number, h: number, D: number, title: string, sub: string, boxCol: keyof typeof PAL = 'ink', titleCol: string = PAL.bone) {
    const box = this.add.graphics().setDepth(D + 1);
    box.fillStyle(col(boxCol), boxCol === 'ink' ? 0.6 : 0.7).fillRoundedRect(10, y, W - 20, h - 8, 10);
    const name = this.add.text(26, y + (h < 70 ? 5 : 8), title, txt(h > 85 ? 26 : 22, titleCol)).setDepth(D + 1);
    name.setScale(Math.min(1, (h < 70 ? 240 : 300) / name.width));
    const st = this.add.text(26, y + (h > 85 ? 46 : h < 70 ? 33 : 40), sub, txt(h < 70 ? 16 : 18, PAL.fog)).setDepth(D + 1);
    st.setScale(Math.min(1, (h < 70 ? 240 : 300) / st.width));
    this.shopObjs.push(box, name, st);
  }

  private shopTab(y0: number, D: number, RH: number) {
    y0 += 48;
    if (this.shopSub === 'decor') return this.decorTab(y0, D);
    if (this.shopSub === 'bones') return this.bonesTab(y0, D);
    const offer = this.shopOffer().slice(0, 4);
    const k = this.kriglyNow();
    this.row(y0, RH, D, t('Zavolat hygienu'), t('krígly: {k} (+{b} % výdělek)', { k: big(this.d.krigle), b: big(Math.round(this.d.krigle * KRIGL_BONUS * 100)) }), 'blood', PAL.sand);
    const pb = this.btn(W - 212, y0 + 12, 190, 62, () => this.askPrestige(), D + 2);
    const pm = prestigeMin(this.d.stats.prestiges);
    this.drawBtn(pb, k >= pm ? t('+{k} krígel', { k: big(k) }) : t('{k} / {m} krígel', { k: big(k), m: big(pm) }), k >= pm, 'red');
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
    return (this.weekly().prog >= this.weekly().goal && !this.weekly().claimed) || this.daily().tasks.some((k) => !k.claimed && k.prog >= k.goal) || ACHIEVEMENTS.some((a) => !this.d.ach.includes(a.id) && a.done(this.d));
  }

  private taskReward() {
    return Math.max(100, Math.round(Math.max(this.totalRate(), this.pay(this.d.pubs[0], STATIONS[0]) / STATIONS[0].cycle) * 300 * (1 + this.ts().daily)));
  }

  private weekly() {
    if (this.d.weekly?.week !== weekId()) this.d.weekly = newWeekly();
    return this.d.weekly!;
  }

  private week(kind: WeekKind, n = 1) {
    const w = this.weekly();
    if (w.kind === kind && !w.claimed) w.prog = Math.min(w.goal, w.prog + n);
  }

  private tasksTab(y0: number, D: number) {
    const RH = 80;
    const head = (y: number, s: string) => this.shopObjs.push(this.add.text(20, y, s, txt(24, PAL.gold)).setDepth(D + 1));
    // týdenní výzva
    {
      const w = this.weekly();
      const done = w.prog >= w.goal;
      this.row(y0 - 4, RH, D, t('Týdenní výzva: {s}', { s: weekText(w.kind, w.goal) }), w.claimed ? t('hotovo – další v pondělí') : `${w.prog} / ${w.goal} · ${t('odměna: talisman + 5 krígel')}`, 'plum', PAL.sand);
      const b = this.btn(W - 172, y0 + 6, 150, 54, () => {
        if (w.claimed || w.prog < w.goal) return sfx.error();
        w.claimed = true;
        this.d.krigle += 5;
        this.tryDrop(1);
        store(this.d);
        this.openShop('tasks', false);
      }, D + 2);
      this.drawBtn(b, w.claimed ? '✓' : done ? t('Vybrat') : `${Math.floor((w.prog / w.goal) * 100)} %`, done && !w.claimed, 'green');
      this.shopObjs.push(b.bg, b.label, b.zone);
      y0 += RH + 4;
    }
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
    const list = ACHIEVEMENTS.filter((a) => !this.d.ach.includes(a.id)).sort((a, b) => Number(b.done(this.d)) - Number(a.done(this.d))).slice(0, 2);
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
    // hlasitost: − / hodnota / + po 10 % (0 % = vypnuto)
    const vols: [string, () => number, (v: number) => void][] = [
      [t('Zvuky'), () => sfx.sfxVol, (v) => sfx.setSfxVol(v)],
      [t('Hudba'), () => sfx.musVol, (v) => sfx.setMusVol(v)],
    ];
    vols.forEach(([title, get, set], i) => {
      const y = y0 + i * RH;
      this.row(y, RH, D, title, '');
      const v = get();
      const step = (d: number) => {
        set(get() + d);
        saveOpts();
        sfx.click();
        this.openShop('opts', false);
      };
      const minus = this.btn(W - 232, y + 14, 60, 60, () => step(-0.1), D + 2);
      this.drawBtn(minus, '−', v > 0, 'plum');
      const plus = this.btn(W - 82, y + 14, 60, 60, () => step(0.1), D + 2);
      this.drawBtn(plus, '+', v < 1, 'plum');
      const val = this.add.text(W - 127, y + 44, v > 0 ? `${Math.round(v * 100)} %` : t('vypnuto'), txt(22, v > 0 ? PAL.gold : PAL.slate)).setOrigin(0.5).setDepth(D + 2);
      val.setScale(Math.min(1, 84 / val.width));
      // proužek hlasitosti pod názvem
      const bar = this.add.graphics().setDepth(D + 2);
      bar.fillStyle(col('ink')).fillRoundedRect(26, y + 56, 230, 14, 6);
      if (v > 0) bar.fillStyle(col('gold')).fillRoundedRect(26, y + 56, 230 * v, 14, 6);
      this.shopObjs.push(minus.bg, minus.label, minus.zone, plus.bg, plus.label, plus.zone, val, bar);
    });
    const rows: [string, string, () => void][] = [
      [t('Jazyk / Language'), LANGS[lang], () => setLang(AVAILABLE[(AVAILABLE.indexOf(lang) + 1) % AVAILABLE.length])],
    ];
    // offline verze do složky (zip s index.html) – nabízí se jen na webu, ne ve hře spuštěné z disku
    const web = location.protocol.startsWith('http');
    if (web) rows.push([t('Hra do složky'), t('Stáhnout'), downloadOffline]);
    // záloha hry: dvě tlačítka v jednom řádku
    {
      const y = y0 + vols.length * RH;
      this.row(y, RH, D, t('Záloha hry'), t('přenos mezi webem a složkou'));
      const sv = this.btn(W - 232, y + 14, 102, 60, () => {
        downloadBackup(exportSave(this.d));
        this.banner(this.views[0].cam, t('Záloha uložena'));
      }, D + 2);
      this.drawBtn(sv, t('Uložit'), true, 'green');
      const ld = this.btn(W - 124, y + 14, 102, 60, () =>
        pickBackup((text) => {
          if (!importSave(text)) return this.banner(this.views[0].cam, t('Tohle není záloha hry'));
          location.reload();
        }), D + 2);
      this.drawBtn(ld, t('Nahrát'), true, 'amber');
      this.shopObjs.push(sv.bg, sv.label, sv.zone, ld.bg, ld.label, ld.zone);
    }
    rows.forEach(([title, val, fn], i) => {
      i += vols.length + 1;
      const y = y0 + i * RH;
      this.row(y, RH, D, title, i === 4 ? t('spustíš ji z disku bez internetu') : '');
      const b = this.btn(W - 232, y + 14, 210, 60, () => {
        fn();
        saveOpts();
        this.openShop('opts', false);
      }, D + 2);
      this.drawBtn(b, val, true, 'plum');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    this.shopObjs.push(this.add.text(W / 2, y0 + (vols.length + 1 + rows.length) * RH + 30, 'P.U.B. Idle – Pajzl Tycoon', txt(18, PAL.slate)).setOrigin(0.5).setDepth(D + 1));
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
    this.leagueLive = undefined;
    this.shopObjs.forEach((o) => o.destroy());
    this.shopObjs = [];
    this.shopRows = [];
    this.decorRows = [];
    this.tutObjs.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Visible).setVisible(true));
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

  // ---------- rádce „Co dál?“ ----------
  /** varianta zobrazení (návrhy pro uživatele): a = tlačítko „?“, b = lišta s radou, c = hostinský sám poradí, když hráč nic nedělá */
  hintMode = (new URLSearchParams(location.search).get('hint') ?? 'c') as 'a' | 'b' | 'c' | 'x'; // x = vypnuto, dokud uživatel nevybere
  hintObjs: Phaser.GameObjects.GameObject[] = [];
  hintBtn?: Btn;
  /** sekundy bez ťuknutí (pro variantu c) */
  idleS = 0;
  hintT = 0;
  hintKey = '';

  /** co má hráč udělat teď: první splnitelná věc podle priorit, jinak na co šetřit */
  advice(): { text: string; go?: () => void } {
    const d = this.d, i = this.views.length > 1 ? this.sel : 0, p = d.pubs[i];
    const open = (tab: PubScene['tab'], sub?: PubScene['shopSub']) => () => {
      if (sub) this.shopSub = sub;
      this.openShop(tab);
    };
    if (this.claimable()) return { text: t('Máš splněný úkol – vyzvedni odměnu v Úkolech.'), go: open('tasks') };
    const now = Date.now();
    if (p.mgr && !this.boosted(p) && (p.boostReady ?? 0) <= now) return { text: t('Pusť schopnost manažera „{s}“ – výdělek ×{m}.', { s: MANAGERS[p.act].skill, m: BOOST_MULT }), go: () => this.useSkill(i) };
    for (const def of STATIONS) {
      const st = p.st[def.id];
      const cost = def.staff * actMult(p.act) * (1 - this.ts().staff);
      if (st && st.lvl > 0 && !st.auto && d.coins >= cost) return { text: t('Najmi kostlivce na „{s}“ – pak pracuje sám, i když tu nejsi.', { s: STATION_NAMES[p.act][def.id] }) };
    }
    const off = this.shopOffer().find((o) => o.cost <= d.coins);
    if (off) return { text: t('V Obchodě si můžeš koupit: {s}.', { s: off.title }), go: open('shop', 'up') };
    const k = this.kriglyNow(), pm = prestigeMin(d.stats.prestiges);
    if (k >= pm && k >= d.krigle * 0.3) return { text: t('Zavolej hygienu (Obchod): dostaneš +{k} krígel = výdělek navždy +{v} %.', { k: big(k), v: big(Math.round(k * KRIGL_BONUS * 100)) }), go: open('shop', 'up') };
    if (!this.tileLock('krigl')) {
      const it = KRIGL_SHOP.find((x) => !kMaxed(x, this.kl(x.id)) && x.cost(this.kl(x.id)) <= d.krigle);
      if (it) return { text: t('Za krígly si můžeš koupit: {s}.', { s: it.name }), go: open('krigl') };
    }
    if (!this.tileLock('keeper') && this.skillPoints() > 0) return { text: t('Hostinský má volný bod – vyber dovednost.'), go: open('keeper') };
    if (!this.tileLock('brew') && this.brewFull()) return { text: t('Pivovar je plný – prodej pivo nebo ho dej do vylepšení.'), go: open('brew') };
    if (this.tabAlert('temple')) return { text: t('Je víkend – v Chrámu čeká Cthulhu.'), go: () => this.openTemple() };
    // na co šetřit: nejlevnější další úroveň stanice ve vybrané hospodě
    let best: { name: string; cost: number } | null = null;
    for (const def of STATIONS) {
      const lvl = p.st[def.id]?.lvl ?? 0;
      const cost = Math.ceil(costN(def, lvl, 1) * actMult(p.act));
      if (!best || cost < best.cost) best = { name: STATION_NAMES[p.act][def.id], cost };
    }
    if (best && d.coins >= best.cost) return { text: t('Kup další úroveň: {s}. Každých 25 úrovní výdělek ×2.', { s: best.name }) };
    const rate = this.totalRate();
    const wait = best && rate > 0 ? dur((best.cost - d.coins) / rate) : '';
    return { text: best ? t('Šetři na „{s}“ ({c} coins, asi {d}). Mezitím ťukej na hosty – dávají spropitné.', { s: best.name, c: big(best.cost), d: wait }) : t('Ťukej na hosty – dávají spropitné.') };
  }

  /** bublina s radou (u hostinského), ťuknutí na „Ukaž“ to rovnou otevře */
  private showHint(y: number, auto: boolean) {
    this.hideHint();
    const h = this.advice();
    const prev = this.hintKey;
    this.hintKey = h.text;
    const D = 300, x0 = 12, w = W - 24;
    const face = this.add.sprite(x0 + 34, y + 62, 'player', 0).setOrigin(0.5, 1).setScale(3).setDepth(D + 2);
    const tx = this.add.text(x0 + 70, y + 12, h.text, txt(20, PAL.ink)).setWordWrapWidth(w - 90 - (h.go ? 110 : 0)).setDepth(D + 2);
    const hh = Math.max(76, tx.height + 24);
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink'), 0.5).fillRoundedRect(x0 + 3, y + 4, w, hh, 14);
    g.fillStyle(col('sand')).fillRoundedRect(x0, y, w, hh, 14);
    g.lineStyle(3, col('gold')).strokeRoundedRect(x0, y, w, hh, 14);
    this.hintObjs.push(g, face, tx);
    const close = this.add.zone(x0, y, w, hh).setOrigin(0).setInteractive().setDepth(D + 3);
    close.on('pointerdown', (_p: unknown, _x: unknown, _y: unknown, ev: Phaser.Types.Input.EventData) => {
      ev?.stopPropagation?.();
      this.hideHint();
    });
    this.hintObjs.push(close);
    if (h.go) {
      const b = this.btn(x0 + w - 116, y + hh / 2 - 26, 104, 52, () => {
        this.hideHint();
        h.go!();
      }, D + 4);
      this.drawBtn(b, t('Ukaž'), true, 'green');
      this.hintObjs.push(b.bg, b.label, b.zone);
    }
    if (h.text !== prev) this.hintObjs.forEach((o) => this.tweens.add({ targets: o, alpha: { from: 0, to: 1 }, duration: 250 }));
    this.hintT = auto ? 9 : 12;
  }

  private hideHint() {
    this.hintObjs.forEach((o) => o.destroy());
    this.hintObjs = [];
  }

  /** rádce: volá se z update */
  private hintTick(dt: number) {
    if ((this.d.tut ?? -1) >= 0) return;
    const busy = this.awayObjs.length || this.shopObjs.length || this.ev.active || this.sheet >= 0;
    this.hintBtn && this.drawBtn(this.hintBtn, '?', true, 'blue', !busy);
    if (busy) {
      if (this.hintObjs.length) this.hideHint();
      return;
    }
    if (this.hintMode === 'b') {
      // stálá lišta s radou dole ve výhledu hospody (obnovuje se)
      if ((this.hintT -= dt) <= 0) {
        this.showHint(TOP + VIEW_H - 100, false);
        this.hintT = 3;
      }
      return;
    }
    if (this.hintObjs.length && (this.hintT -= dt) <= 0) this.hideHint();
    if (this.hintMode === 'c' && !this.hintObjs.length) {
      this.idleS += dt;
      if (this.idleS > 20) {
        this.idleS = -40; // další rada nejdřív za minutu
        this.showHint(this.hintY(), true);
      }
    }
  }

  private hintY() {
    return TOP + (this.views.length > 1 ? TABH : 0) + 62;
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
    p.boostUntil = now + BOOST_S * 1000 * (this.has('sabre') ? 2 : 1) * (1 + this.ts().skill);
    p.boostReady = now + (BOOST_S + BOOST_CD * (1 - Math.min(0.5, this.ts().mgrcd))) * 1000;
    this.banner(this.views[i].cam, t('{s}! Výdělek ×{m}', { s: MANAGERS[p.act].skill, m: BOOST_MULT }));
    store(this.d);
  }

  private drawSkill(i: number) {
    const p = this.d.pubs[i];
    const b = this.skillBtns[i];
    if (!b) return;
    // tlačítka všech hospod leží na stejném místě – ťuknutí smí chytit jen to vybrané hospody (dřív chytalo poslední)
    const mine = this.views.length < 2 || i === this.sel;
    b.zone.input && (b.zone.input.enabled = mine);
    if (!p.mgr || !mine) return this.drawBtn(b, '', false, 'amber', false);
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
  /** otevřený návštěvník: průběžně přebarvuje tlačítka podle coins */
  visitLive?: () => void;

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
      this.visitLive = undefined;
    };
    const draws: (() => void)[] = [];
    [v.a, v.b].forEach((ch, i) => {
      const cost = ch.cost(c);
      const b = this.btn(bx + 20 + i * (bw / 2), by + bh - 104, bw / 2 - 40, 84, () => {
        if (this.d.coins < cost) return sfx.error();
        this.d.coins -= cost;
        close();
        ch.run(c);
        this.tryDrop(0.03);
        this.xp(10);
        this.week('visitors');
        store(this.d);
      }, D + 3);
      // dokud nemáš dost, ukazuje kolik chybí; jakmile našetříš, tlačítko se zbarví a jde zaplatit
      let last = '';
      const draw = () => {
        const ok = this.d.coins >= cost;
        const label = !cost ? ch.label : ok ? `${ch.label}\n${big(cost)} coins` : `${ch.label}\n${t('chybí {n}', { n: big(cost - this.d.coins) })}`;
        if (label === last) return;
        last = label;
        this.drawBtn(b, label, ok, i === 0 ? 'green' : 'plum');
        b.label.setScale(Math.min(1, (b.w - 12) / b.label.width));
      };
      draw();
      draws.push(draw);
      objs.push(b.bg, b.label, b.zone);
    });
    this.visitLive = () => draws.forEach((f) => f());
    this.awayObjs = objs;
    sfx.hire();
  }

  // ---------- prestiž: hygiena ----------
  private askPrestige() {
    const k = this.kriglyNow();
    if (k < prestigeMin(this.d.stats.prestiges)) return sfx.error();
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
    tx(by + 170, t('Dostaneš +{k} krígel', { k: big(k) }), 30, PAL.gold);
    tx(by + 212, t('každý krígl = +{b} % výdělek navždy', { b: String(Math.round(KRIGL_BONUS * 1000) / 10).replace('.', ',') }), 18, PAL.fog);
    // o kolik se zlepší výdělek: bonus z krígel teď → po hygieně, a kolikrát víc
    const cur = this.d.krigle * KRIGL_BONUS, nw = (this.d.krigle + k) * KRIGL_BONUS;
    tx(by + 240, t('výdělek z krígel: +{a} % → +{b} %', { a: big(Math.round(cur * 100)), b: big(Math.round(nw * 100)) }), 22, PAL.mint);
    tx(by + 270, t('= vyděláváš ×{m} víc', { m: ((1 + nw) / (1 + cur)).toFixed(2) }), 22, PAL.gold);
    if (next) tx(by + 310, t('a otevřeš novou hospodu: {n}', { n: next }), 22, PAL.mint);
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
    const k = this.kriglyNow();
    const n = Math.min(MAX_PUBS, this.d.pubs.length + 1);
    if (n > this.d.pubs.length) this.d.pubIntro = n;
    this.d.krigle += k;
    this.d.stats.prestiges++;
    this.d.run = 0;
    this.d.coins = 0;
    this.d.up = [];
    const keep = this.kl('keepMgr') > 0;
    const had = this.d.pubs.map((p) => !!p.mgr);
    const crews = this.d.pubs.map((p) => p.w);
    this.d.pubs = Array.from({ length: n }, (_, i) => newPub((i + 1) as Act));
    // číšníci (zkušenosti a body) zůstávají i po hygieně
    this.d.pubs.forEach((p, i) => crews[i] && (p.w = crews[i]));
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
    { text: t('Ťukni na Menu – najdeš v něm obchod, úkoly a další.'), done: 'menu' },
    { text: t('Ťukni na Obchod – tady kupuješ vylepšení výdělku.'), done: 'tile:shop' },
    { text: t('Hotovo! Další části menu se odemknou během hry. Zavři menu – hodně štěstí, hostinský!'), done: 'close' },
  ];

  /** událost hráče posune návod */
  private tut(ev: string) {
    const i = this.d.tut ?? -1;
    if (i < 0 || PubScene.TUT[i].done !== ev) return;
    this.d.tut = i + 1 >= PubScene.TUT.length ? -1 : i + 1;
    // konec návodu: začne celý nový den (noc s kostmi přijde až za 8 min)
    if (this.d.tut < 0) {
      const dn = (this.d.dn ??= { lvl: 0, v2: true });
      nightCfg.shift = dn.shift ?? 0;
      dn.shift = switchPhase(false);
    }
    this.tutShow();
  }

  private tutShow(textOnly = false) {
    if (textOnly && this.tutBub) {
      const i0 = this.d.tut ?? -1;
      const need = i0 >= 0 ? this.tutNeed(PubScene.TUT[i0].done) : 0;
      const manual = !this.st(this.d.pubs[0], 'tap').auto;
      if (need > 0) this.tutBub.setText(manual
        ? t('Ťukej na Pípu (vlevo) a sbírej coins: {c} / {n}. Pak kup vpravo.', { c: Math.floor(this.d.coins), n: need })
        : t('Kostlivec točí sám – počkej na coins: {c} / {n} (nebo ťukej na hosty).', { c: Math.floor(this.d.coins), n: need }));
      return;
    }
    this.tutBub = null;
    this.tutRect = null;
    this.tutObjs.forEach((o) => o.destroy());
    this.tutObjs = [];
    this.tutFollow = null;
    const i = this.d.tut ?? -1;
    if (i < 0 || this.views.length > 1) return;
    const step = PubScene.TUT[i];
    // kam ukázat
    const card = (id: string) => this.cards.find((c) => c.def.id === id)!;
    // na nákup ještě nemá → ukázat, jak coins získat (ťukat na pípu vlevo / počkat), ne šedé tlačítko
    const need = this.tutNeed(step.done);
    this.tutPoor = need > 0;
    const tapManual = !this.st(this.d.pubs[0], 'tap').auto;
    let text = step.text;
    if (need > 0) text = tapManual
      ? t('Ťukej na Pípu (vlevo) a sbírej coins: {c} / {n}. Pak kup vpravo.', { c: Math.floor(this.d.coins), n: need })
      : t('Kostlivec točí sám – počkej na coins: {c} / {n} (nebo ťukej na hosty).', { c: Math.floor(this.d.coins), n: need });
    // dlaždice Obchod v mřížce Menu (stejný výpočet jako menuGrid)
    const menuY0 = H - 6 * 96 - 126, tw = (W - 40) / 3, th = 118;
    const si = PubScene.TILES.findIndex(([tb, sub]) => tb === 'shop' && sub === 'up');
    const shopTile = [10 + (si % 3) * (tw + 10), menuY0 + 64 + Math.floor(si / 3) * (th + 8), tw, th];
    let tx = 0, ty = 0;
    // ťukání na pípu: šipka nad kartou, zvýrazněná přesně levá část karty (kde se ťuká)
    const tapHere = (need > 0 && tapManual) || step.done === 'tap';
    if (tapHere) [tx, ty] = [160, card('tap').y + 2];
    else if (step.done === 'buy:tap') [tx, ty] = [card('tap').buy.x + 95, card('tap').buy.y];
    else if (step.done === 'hire') [tx, ty] = [card('tap').staff.x + 95, card('tap').staff.y];
    else if (step.done === 'buy:kitchen') [tx, ty] = [card('kitchen').buy.x + 95, card('kitchen').buy.y];
    else if (step.done === 'tile:shop') [tx, ty] = [shopTile[0] + shopTile[2] / 2, shopTile[1]];
    else if (step.done === 'close') [tx, ty] = [W - 36, menuY0 + 10];
    else [tx, ty] = [this.shopBtn.x + 54, this.shopBtn.y + 50];
    const D = 420;
    // ztmavení okolí: světlý zůstane jen cíl (u hosta ne – ten se hýbe)
    if (step.done !== 'tip') {
      const [hw, hh] = step.done === 'tile:shop' ? [180, 126] : step.done === 'close' ? [66, 54] : [260, 96];
      let [hx, hy] = step.done === 'menu' ? [this.shopBtn.x - 6, this.shopBtn.y - 6] : [tx - hw / 2, ty - 6];
      let [w2, h2] = step.done === 'menu' ? [120, 62] : [hw, hh];
      if (step.done === 'tile:shop') [hx, hy, w2, h2] = [shopTile[0] - 4, shopTile[1] - 4, shopTile[2] + 8, shopTile[3] + 8];
      if (step.done === 'close') [hx, hy, w2, h2] = [W - 68, menuY0 + 4, 64, 54];
      // nákup / kostlivec: rámeček přesně kolem tlačítka
      if (step.done === 'buy:tap' || step.done === 'buy:kitchen') {
        const b = card(step.done.slice(4)).buy;
        [hx, hy, w2, h2] = [b.x - 6, b.y - 6, b.w + 12, b.h + 12];
      } else if (step.done === 'hire') {
        const b = card('tap').staff;
        [hx, hy, w2, h2] = [b.x - 6, b.y - 6, b.w + 12, b.h + 12];
      }
      // bez peněz: světlá celá karta (vlevo ťukání, vpravo nákup), ať je vidět obojí
      if (tapHere && need <= 0) [hx, hy, w2, h2] = [6, card('tap').y - 4, 308, CARD_H];
      if (need > 0) {
        const cy = card(tapManual ? 'tap' : step.done === 'buy:kitchen' ? 'kitchen' : 'tap').y;
        [hx, hy, w2, h2] = [6, cy - 4, W - 12, CARD_H];
      }
      this.tutRect = [hx, hy, w2, h2];
      const dim = this.add.graphics().setDepth(D - 1);
      dim.fillStyle(0x000000, 0.6);
      dim.fillRect(0, 0, W, hy).fillRect(0, hy + h2, W, H - hy - h2).fillRect(0, hy, hx, h2).fillRect(hx + w2, hy, W - hx - w2, h2);
      dim.lineStyle(3, col('gold')).strokeRoundedRect(hx, hy, w2, h2, 10);
      this.tutObjs.push(dim);
    }
    const by = TOP + (step.done === 'menu' ? 90 : 16); // u Menu níž, ať ji nepřekryje šipka
    const bub = this.add.text(W / 2, by, text, txt(24, PAL.ink)).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(W - 80).setDepth(D + 1);
    this.tutBub = bub;
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('ink'), 0.5).fillRoundedRect(W / 2 - bub.width / 2 - 16, by - 6, bub.width + 32, bub.height + 16, 12);
    g.fillStyle(col('sand')).fillRoundedRect(W / 2 - bub.width / 2 - 18, by - 10, bub.width + 36, bub.height + 16, 12);
    const up = step.done === 'menu';
    // šipka v kontejneru: kontejner jde za cílem (u hosta každý snímek), šipka v něm houpe
    const holder = this.add.container(tx, ty).setDepth(D + 2);
    const arrow = this.add.graphics().setPosition(0, up ? 30 : -30);
    holder.add(arrow);
    const tri = (gr: Phaser.GameObjects.Graphics, c: number, grow: number) =>
      gr.fillStyle(c).fillTriangle(-22 - grow, -14 - grow, 22 + grow, -14 - grow, 0, 22 + grow).fillRect(-9 - grow, -40 - grow, 18 + grow * 2, 28);
    tri(arrow, col('ink'), 4);
    tri(arrow, col('gold'), 0);
    if (up) arrow.setAngle(180);
    this.tweens.add({ targets: arrow, y: arrow.y + (up ? -10 : 10), yoyo: true, repeat: -1, duration: 380, ease: 'Sine.inOut' });
    this.tutObjs.push(g, bub, holder);
    // kde ťukat: pulzující kruhy a „ŤUKNI“ přímo na pruhu karty Pípa
    if (tapHere) {
      const cx = 160, cy = card('tap').y + 81;
      for (let k = 0; k < 2; k++) {
        const ring = this.add.graphics().setDepth(D + 1).setPosition(cx, cy);
        ring.lineStyle(5, col('gold')).strokeCircle(0, 0, 26);
        this.tweens.add({ targets: ring, scale: { from: 0.6, to: 2.2 }, alpha: { from: 1, to: 0 }, duration: 1100, delay: k * 550, repeat: -1 });
        this.tutObjs.push(ring);
      }
      const hand = this.add.text(cx, cy, t('ŤUKNI SEM'), txt(26, PAL.gold)).setOrigin(0.5).setDepth(D + 2).setBackgroundColor(PAL.ink).setPadding(10, 2, 10, 2);
      this.tweens.add({ targets: hand, scale: 1.15, yoyo: true, repeat: -1, duration: 420, ease: 'Sine.inOut' });
      this.tutObjs.push(hand);
    }
    if (step.done === 'tip') {
      this.tutFollow = () => {
        const p = this.views[0]?.tipTarget();
        arrow.setVisible(!!p);
        if (p) holder.setPosition(p.x, p.y - 4);
      };
      this.tutFollow();
    }
  }

  /** noc (příšery platí kostmi) – během návodu nikdy, ať nový hráč vydělává coins */
  private nightNow() {
    return (this.d.tut ?? -1) < 0 && isNight();
  }

  /** u kroku „ťukni na hosta“ šipka sleduje hosta (volá se z update) */
  private tutFollow: (() => void) | null = null;
  private tutPoor = false;
  /** zvýrazněné místo návodu (x, y, š, v) – i pro automatický test */
  tutRect: number[] | null = null;
  private tutBub: Phaser.GameObjects.Text | null = null;
  private tutCoins = -1;

  /** kolik coins chybí k nákupu v kroku návodu (0 = má dost / krok nic nekupuje) */
  private tutNeed(done: string) {
    const p = this.d.pubs[0];
    if (!p) return 0;
    let price = 0;
    if (done === 'buy:tap' || done === 'buy:kitchen') {
      const def = STATIONS.find((s) => 'buy:' + s.id === done)!;
      price = this.offer(p, def).price;
    } else if (done === 'hire') {
      const def = STATIONS.find((s) => s.id === 'tap')!;
      price = Math.ceil(def.staff * actMult(p.act) * (1 - this.ts().staff));
    }
    return this.d.coins < price ? price : 0;
  }

  /** návod: přepnout text/zvýraznění, když hráč nasbírá dost (nebo průběžně ukazovat coins) */
  private tutTick() {
    const i = this.d.tut ?? -1;
    if (i < 0 || this.views.length > 1) return;
    const done = PubScene.TUT[i].done;
    if (done !== 'buy:tap' && done !== 'hire' && done !== 'buy:kitchen') return;
    const poor = this.tutNeed(done) > 0;
    const c = Math.floor(this.d.coins);
    if (poor !== this.tutPoor) this.tutShow();
    else if (poor && c !== this.tutCoins) this.tutShow(true);
    this.tutCoins = c;
  }

  private drawMode() {
    this.drawBtn(this.modeBtn, this.mode > 0 ? `×${this.mode}` : this.mode < 0 ? t('Další') : 'MAX', true, 'amber');
    this.modeBtn.label.setScale(Math.min(1, 84 / this.modeBtn.label.width));
  }

  /** kolik úrovní a za kolik se koupí podle přepínače ×1/×10/×100/MAX */
  private offer(p: PubState, def: StationDef) {
    const lvl = this.st(p, def.id).lvl;
    const m = actMult(p.act);
    // režim „Další“ (-1): přesně tolik úrovní, kolik chybí do dalšího milníku
    const n = lvl === 0 ? 1 : this.mode < 0 ? Math.max(1, (nextMilestone(lvl) ?? lvl + 1) - lvl) : this.mode || Math.max(1, affordable(def, lvl, this.d.coins / m));
    return { n, price: Math.ceil(costN(def, lvl, n) * m) };
  }

  private sheetY() {
    return H - 4 * CARD_H - 70;
  }

  /** rozložení obrazovky podle počtu hospod */
  private layout() {
    const n = this.views.length;
    if (n === 1) {
      const viewH = VIEW_H;
      this.views[0].frame(0, TOP, W, viewH, 118);
      // schopnost manažera nahoře u zdi (tam nesedí hosté) – dole by zakrývala bubliny s objednávkami
      this.skillBtns[0] = this.btn(14, TOP + 12, 180, 44, () => this.useSkill(0), 60);
      const g = this.add.graphics();
      g.fillStyle(col('dusk')).fillRect(0, TOP + viewH, W, H - TOP - viewH);
      g.fillStyle(col('gold')).fillRect(0, TOP + viewH, W, 3);
      this.addCards(0, TOP + viewH + 10);
      this.addWaiterChips();
      return;
    }
    // 2–3 hospody (návrh A): záložky hospod nahoře, vybraná hospoda velká, pod ní její stanice; přepnutí i tažením do strany
    const tw = (W - 16) / n;
    this.views.forEach((v, i) => {
      const tb = this.btn(8 + i * tw, TOP + 4, tw - 6, 48, () => this.selectPub(i), 60);
      const rt = this.add.text(tb.x + tb.w / 2, tb.y + 34, '', txt(14, PAL.mint)).setOrigin(0.5).setDepth(62);
      this.stripRates.push(rt);
      this.pubTabs.push(tb);
      this.skillBtns[i] = this.btn(14, TOP + TABH + 10, 180, 44, () => this.useSkill(i), 60);
    });
    const g = this.add.graphics();
    g.fillStyle(col('dusk')).fillRect(0, TOP, W, TABH).fillRect(0, TOP + VIEW_H, W, H - TOP - VIEW_H);
    g.fillStyle(col('gold')).fillRect(0, TOP + VIEW_H, W, 3);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => (this.swipe = p.y > TOP + TABH && p.y < TOP + VIEW_H ? p.x : null));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.swipe === null || this.shopObjs.length || this.awayObjs.length) return;
      const dx = p.x - this.swipe;
      this.swipe = null;
      if (Math.abs(dx) > 70) this.selectPub(Phaser.Math.Clamp(this.sel + (dx < 0 ? 1 : -1), 0, n - 1));
    });
    this.addWaiterChips();
    this.selectPub(Math.min(this.sel, n - 1));
  }

  /** záložky hospod (2–3 hospody) */
  pubTabs: Btn[] = [];
  sel = 0;
  swipe: number | null = null;

  /** přepne na hospodu i: její výhled, schopnost manažera a karty stanic */
  private selectPub(i: number) {
    if (this.views.length < 2) return;
    this.closeWaiter();
    this.sel = i;
    this.views.forEach((v, j) => {
      v.cam.setVisible(j === i);
      if (j === i) v.frame(0, TOP + TABH, W, VIEW_H - TABH, 118);
    });
    this.pubTabs.forEach((b, j) => {
      this.drawBtn(b, PUB_NAMES[this.d.pubs[j].act], true, j === i ? 'amber' : 'slate');
      b.label.setY(b.y + 16).setFontSize(18).setScale(Math.min(1, (b.w - 10) / b.label.width));
    });
    this.skillBtns.forEach((_, j) => this.drawSkill(j));
    for (const c of this.cards)
      [c.box, c.name, c.lvl, c.bar, c.info, c.tapZone, c.buy.bg, c.buy.label, c.buy.zone, c.staff.bg, c.staff.label, c.staff.zone].forEach((o) => o.destroy());
    this.cards = [];
    this.addCards(i, TOP + VIEW_H + 10);
    this.refresh();
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
      st.v.frameClip(0, y, W, st.h - 4 - SBAR, TOP, H, 112);
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
    if (this.views.length === 1 || this.sheet < 0) return;
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
    // kombo: rychlé ťukání za sebou (jen efekt a zvuk)
    if (s.lvl > 0 && !s.auto) {
      this.comboN = this.comboT > 0 ? this.comboN + 1 : 1;
      this.comboT = 0.9;
      const card = this.cards.find((k) => k.pub === i && k.def.id === def.id);
      if (this.comboN >= 3 && card) {
        sfx.combo(this.comboN);
        popText(this, 160 + Phaser.Math.Between(-60, 60), card.y + 20, t('KOMBO ×{n}', { n: this.comboN }), this.comboN >= 10 ? PAL.gold : PAL.white, this.comboN >= 10 ? 30 : 24);
        if (this.comboN % 10 === 0) {
          confetti(this, 160, card.y + 40, 20, 459, 0.6);
          this.cameras.main.shake(120, 0.004);
        }
      }
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
    this.xp(Math.min(n, 20));
    this.task('levels', n);
    this.tut('buy:' + def.id);
    sfx.buy();
    const card = this.cards.find((k) => k.pub === i && k.def.id === def.id);
    if (card) {
      flashRect(this, 10, card.y, W - 20, CARD_H - 8);
      popText(this, card.buy.x + card.buy.w / 2, card.buy.y - 6, t('+{n} úr.', { n }), PAL.mint);
      confetti(this, card.buy.x + card.buy.w / 2, card.buy.y + 10, 10, 459, 0.45);
    }
    if (before && s.lvl >= before) this.milestone(i, def);
    this.views[i].refresh();
    this.refresh();
  }

  private hire(i: number, def: StationDef) {
    const p = this.d.pubs[i];
    const s = this.st(p, def.id);
    const c = def.staff * actMult(p.act) * (1 - this.ts().staff);
    if (s.auto || s.lvl === 0) return;
    if (this.d.coins < c) return sfx.error();
    this.d.coins -= c;
    sfx.hire();
    sfx.pop();
    const card = this.cards.find((k) => k.pub === i && k.def.id === def.id);
    if (card) {
      confetti(this, card.staff.x + card.staff.w / 2, card.staff.y, 30, 459, 0.7);
      popText(this, card.staff.x + card.staff.w / 2, card.staff.y - 20, t('Kostlivec nastoupil!'), PAL.bone, 26);
    }
    s.auto = true;
    if (s.prog === 0) s.prog = 0.0001;
    // s kostlivcem na pípě nastoupí i první číšník – pivo od teď roznáší ke stolům
    if (def.id === 'tap' && !p.w?.length) {
      p.w = START_CREW();
      this.time.delayedCall(900, () => this.views[i] && this.banner(this.views[i].cam, t('{a} a {b} nastoupili – roznášejí pivo ke stolům', { a: WAITERS[0].name, b: WAITERS[1].name })));
    }
    this.tut('hire');
    this.views[i].refresh();
    this.refresh();
  }

  /** výdělek stanice za cyklus (úroveň, milníky, hospoda, vylepšení) */
  private pay(p: PubState, def: StationDef) {
    const lvl = p.st[def.id]?.lvl ?? 0;
    return payout(def, Math.max(1, lvl)) * actMult(p.act) * upMult(this.d.up, p.act, def.id) * (this.boosted(p) ? BOOST_MULT : 1) * (1 + KRIGL_BONUS * this.d.krigle) * (this.evBoostUntil > Date.now() ? 2 : 1) * kCthulhu(this.kl('cthulhu')) * (season ? 1 + SEASON_BONUS : 1) * (1 + (this.has('portrait') ? 0.1 : 0) + (this.has('fireplace') ? 0.25 : 0)) * (this.ev ? this.ev.brawlMult(this.d.pubs.indexOf(p)) : 1) * (1 + (this.d.brew ? brewBonus(this.d.brew) : 0)) * (1 + this.ts().income) * (1 + SEAL_BONUS * (this.d.temple?.boss ?? 0));
  }

  // ---------- obchod s krígly ----------
  /** úroveň položky z obchodu s krígly */
  private kl(id: KriglItem['id']) {
    return this.d.kup?.[id] ?? 0;
  }

  private cyc(def: StationDef) {
    return def.cycle * kSpeed(this.kl('speed')) * (this.has('aquarium') ? 0.9 : 1) / (1 + this.ts().cycle);
  }

  private offCap() {
    return Math.min(OFFLINE_MAX_H * 3600, OFFLINE_CAP + (kOffline(this.kl('offline')) + (this.has('cuckoo') ? 4 : 0)) * 3600 + this.ts().offline * 3600);
  }

  /** úroveň vylepšení za kosti */
  private bl(id: string) {
    return this.d.bup?.[id] ?? 0;
  }

  /** násobek kostí ze statů (talismany, Kostnice…) */
  private boneMult() {
    return (1 + this.ts().bones) * (this.d.fx?.nightx2 && this.night ? 2 : 1);
  }

  /** odměna za spropitné (ťuknutí nebo sběrač): přes den coins, v noci kost */
  private tipReward(v: PubView) {
    // zlatý host: občas dá spropitné ×10
    const gold = !this.night && Math.random() < Math.min(0.1, this.ts().golden);
    const tip = (gold ? 10 : 1) * Math.max(1, Math.round((this.rate(v.pub) * 2 + this.pay(v.pub, STATIONS[0])) * (this.has('boar') ? 3 : 1) * (1 + this.ts().tips + guestTips(this.d.gxp ?? 0)) * this.happyMult()));
    const bone = this.boneMult() * (1 + this.ts().nighttips);
    if (this.night) this.d.bones = (this.d.bones ?? 0) + bone;
    else this.gain(tip);
    this.d.stats.tips++;
    this.week('tips');
    this.xp(1);
    this.task('tips', 1);
    v.tipPop((gold ? t('ZLATÝ HOST! ') : '') + '+' + big(this.night ? bone : tip));
  }

  // ---------- sběrač bublin (číšník): každá hospoda vlastní, kupuje se a vylepšuje za kosti ----------
  /** sběrač v hospodě i: úroveň rychlosti a množství (null = nekoupený) */
  private coll(i: number) {
    return this.d.coll?.[this.d.pubs[i].act];
  }

  /** každá další hospoda má sběrače 10× dražšího */
  private collBase(i: number) {
    return 200 * 10 ** (this.d.pubs[i].act - 1);
  }

  /** interval sběru (s): 30 s, každá úroveň rychlosti o 1 % rychleji, nejrychleji 1,5 s */
  private collSecs(spd: number) {
    return Math.max(1.5, (30 * 0.99 ** spd) / (1 + this.ts().coll));
  }

  private collTick(dt: number) {
    this.d.pubs.forEach((p, i) => {
      const c = this.coll(i);
      if (!c) return;
      this.collT[i] = (this.collT[i] ?? this.collSecs(c.spd)) - dt;
      if (this.collT[i] > 0) return;
      this.collT[i] = this.collSecs(c.spd);
      const v = this.views[i];
      for (let k = 0; k < 1 + c.amt; k++) if (v.autoTip()) this.tipReward(v);
    });
  }

  collT: number[] = [];

  private collTab(y0: number, D: number) {
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const bones = this.d.bones ?? 0;
    add(this.add.text(W / 2, y0, t('Sběrač obslouží bubliny s objednávkou za tebe.\nKaždá hospoda má vlastního. Platí se kostmi.'), txt(18, PAL.fog)).setOrigin(0.5, 0).setAlign('center').setDepth(D + 2));
    add(this.add.text(W / 2, y0 + 50, t('máš {n} kostí', { n: big(bones) }), txt(20, PAL.bone)).setOrigin(0.5, 0).setDepth(D + 2));
    const RH = 118;
    this.d.pubs.forEach((p, i) => {
      const y = y0 + 84 + i * RH, c = this.coll(i), base = this.collBase(i);
      const refresh = (cost: number, fn: () => void) => () => {
        if ((this.d.bones ?? 0) < cost) return sfx.error();
        this.d.bones! -= cost;
        fn();
        sfx.buy();
        store(this.d);
        this.openShop('coll', false);
      };
      this.row(y, RH, D, PUB_NAMES[p.act], c ? t('1 bublina za {s} s · najednou {n}', { s: Math.round(this.collSecs(c.spd) * 10) / 10, n: 1 + c.amt }) : t('zatím nemáš sběrače'));
      if (!c) {
        const b = this.btn(W - 212, y + 24, 190, 62, refresh(base, () => ((this.d.coll ??= {})[p.act] = { spd: 0, amt: 0 })), D + 2);
        this.drawBtn(b, t('Najmout\n{n} kostí', { n: big(base) }), bones >= base, 'blue');
        this.shopObjs.push(b.bg, b.label, b.zone);
        return;
      }
      const cs = Math.ceil(base * 0.5 * 1.6 ** c.spd), ca = Math.ceil(base * 2 * 2.2 ** c.amt);
      const maxS = this.collSecs(c.spd) <= 1.5;
      const b1 = this.btn(W - 232, y + 24, 102, 62, refresh(cs, () => c.spd++), D + 2);
      this.drawBtn(b1, maxS ? t('rychlost\nmax') : t('rychleji\n{n}', { n: big(cs) }), !maxS && bones >= cs, 'blue');
      const b2 = this.btn(W - 122, y + 24, 102, 62, refresh(ca, () => c.amt++), D + 2);
      this.drawBtn(b2, t('+1 bublina\n{n}', { n: big(ca) }), bones >= ca, 'plum');
      [b1, b2].forEach((b) => b.label.setFontSize(16).setScale(Math.min(1, 94 / b.label.width)));
      this.shopObjs.push(b1.bg, b1.label, b1.zone, b2.bg, b2.label, b2.zone);
    });
  }

  // ---------- den a noc ----------
  /** délka happy hour roste s pivovarem stejně jako cena piva (aby zůstala vyrovnaná s prodejem) */
  private happyMin() {
    return Math.round(10 * (1 + 0.2 * (this.brew().lvl - 1)));
  }

  private happyMult() {
    return (this.d.fx?.happy ?? 0) > Date.now() ? 2 : 1;
  }

  private dayNightTab(y0: number, D: number) {
    const dn = (this.d.dn ??= { lvl: 0, v2: true });
    const bones = this.d.bones ?? 0;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const refresh = () => {
      store(this.d);
      this.applyKup();
      this.openShop('daynight', false);
    };
    const left = Math.ceil(phaseLeft() / 1000);
    const mins = (ms: number) => Math.round(ms / 6000) / 10;
    const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
    add(this.add.text(W / 2, y0, (this.night ? t('Je noc – příšery platí kostmi') : t('Je den – lidé platí coins')) + '\n' + t('{p} za {m}:{s}', { p: this.night ? t('Den') : t('Noc'), m: Math.floor(left / 60), s: String(left % 60).padStart(2, '0') }), txt(22, this.night ? PAL.ice : PAL.gold)).setOrigin(0.5, 0).setAlign('center').setDepth(D + 2));
    add(this.add.text(W / 2, y0 + 62, t('máš {n} kostí', { n: big(bones) }), txt(20, PAL.bone)).setOrigin(0.5, 0).setDepth(D + 2));
    const RH = 104;
    // 1) delší noc
    let y = y0 + 100;
    const max = dn.lvl >= NIGHT_MAX_LVL;
    this.row(y, RH, D, t('Delší noc'), max ? t('noc trvá {a} min (maximum)', { a: mins(nightLen()) }) : t('noc trvá {a} · +1 s za úroveň', { a: mmss(nightLen()) }));
    // dvě tlačítka: +1 s a +10 s
    ([1, 10] as const).forEach((n, i) => {
      const k = Math.min(n, NIGHT_MAX_LVL - dn.lvl), c = nightCostN(dn.lvl, Math.max(1, k));
      const bt = this.btn(W - 232 + i * 112, y + 16, 102, 62, () => {
        if (k < 1 || (this.d.bones ?? 0) < c) return sfx.error();
        this.d.bones! -= c;
        dn.lvl += k;
        sfx.buy();
        refresh();
      }, D + 2);
      this.drawBtn(bt, max ? '✓' : `+${k} s\n${t('{n} kostí', { n: big(c) })}`, k > 0 && bones >= c, 'blue');
      bt.label.setScale(Math.min(1, 94 / bt.label.width));
      this.shopObjs.push(bt.bg, bt.label, bt.zone);
    });
    // 2) přepínač dne a noci
    y += RH;
    const can = dn.lvl >= SWITCH_LVL;
    this.row(y, RH, D, t('Přepínač dne a noci'), dn.sw ? t('přepneš, kdy se ti hodí') : can ? t('ruční přepínání dne a noci') : t('odemkne se, až noc potrvá {m}', { m: mmss(60_000 + SWITCH_LVL * 1000) }));
    const b2 = this.btn(W - 212, y + 16, 190, 62, () => {
      if (!dn.sw) {
        if (!can || (this.d.bones ?? 0) < SWITCH_COST) return sfx.error();
        this.d.bones! -= SWITCH_COST;
        dn.sw = true;
        sfx.fanfare();
        return refresh();
      }
      dn.shift = switchPhase(!this.night);
      sfx.hire();
      refresh();
    }, D + 2);
    this.drawBtn(b2, dn.sw ? (this.night ? t('Přepnout na den') : t('Přepnout na noc')) : t('{n} kostí', { n: SWITCH_COST }), dn.sw || (can && bones >= SWITCH_COST), dn.sw ? 'plum' : 'blue');
    b2.label.setScale(Math.min(1, 176 / b2.label.width));
    this.shopObjs.push(b2.bg, b2.label, b2.zone);
    add(this.add.text(W / 2, y + RH + 14, t('Kosti sbíráš v noci: stanice a ťuknutí na hosty.\nUtratíš je i v Kostnici a za talismany.'), txt(16, PAL.fog)).setOrigin(0.5, 0).setAlign('center').setDepth(D + 2));
  }

  /** kolik kostí za sekundu dají v noci stanice (jen s kostlivcem = offline) */
  private bonesPerSec(autoOnly = false) {
    let r = 0;
    for (const p of this.d.pubs)
      for (const def of STATIONS) {
        const s = p.st[def.id];
        if (!s || s.lvl === 0 || (autoOnly && !s.auto)) continue;
        r += bonesFor(s.lvl) / this.cyc(def);
      }
    return r * this.boneMult();
  }

  ossLast?: string;
  ossBusy = false;

  /** Kostnice: zaplatíš kostňákovi, ten hodí kostkou a náhodný stat se trochu zvedne */
  private bonesTab(y0: number, D: number) {
    const bones = this.d.bones ?? 0;
    const rolls = this.d.ossRolls ?? 0;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const g = add(this.add.graphics().setDepth(D + 1));
    g.fillStyle(col('navy'), 0.8).fillRoundedRect(10, y0, W - 20, 150, 12);
    add(this.add.sprite(70, y0 + 132, 'skeleton', 12).setOrigin(0.5, 1).setScale(5).setDepth(D + 2));
    add(this.add.text(130, y0 + 10, t('Kostňák'), txt(26, PAL.ice)).setDepth(D + 2));
    add(this.add.text(130, y0 + 42, t('„Zaplať kostmi a já hodím. Co padne, to zesílí.“'), txt(16, PAL.bone)).setDepth(D + 2).setWordWrapWidth(250));
    add(this.add.text(130, y0 + 76, t('máš {n} kostí', { n: big(bones) }), txt(20, PAL.gold)).setDepth(D + 2));
    // Den a noc (dřív samostatná dlaždice v Menu, teď tu)
    const dnb = this.btn(130, y0 + 104, 170, 38, () => this.openShop('daynight', false), D + 3);
    this.drawBtn(dnb, t('Den a noc'), !this.tileLock('daynight'), 'blue');
    this.shopObjs.push(dnb.bg, dnb.label, dnb.zone);
    // kostka
    const die = add(this.add.graphics().setDepth(D + 3));
    const dx = W - 90, dy = y0 + 75;
    const face = (n: number) => {
      die.clear().fillStyle(col('ink')).fillRoundedRect(dx - 38, dy - 34, 76, 76, 12).fillStyle(col('bone')).fillRoundedRect(dx - 38, dy - 38, 76, 76, 12);
      const P: Record<number, number[][]> = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
      die.fillStyle(col('ink'));
      for (const [px, py] of P[n]) die.fillCircle(dx + px * 20, dy + py * 20, 7);
    };
    face(6);
    // hody
    const roll = (n: number) => {
      const cost = Array.from({ length: n }, (_, i) => rollCost(rolls + i)).reduce((a, b) => a + b, 0);
      if (this.ossBusy || (this.d.bones ?? 0) < cost) return sfx.error();
      this.d.bones! -= cost;
      this.ossBusy = true;
      const got: Record<string, number> = {};
      for (let i = 0; i < n; i++) {
        const free = OSSUARY.filter((o) => o.cap === undefined || ((this.d.oss?.[o.stat] ?? 0) + 1) * o.per <= o.cap + 1e-9);
        const o = Phaser.Utils.Array.GetRandom(free);
        (this.d.oss ??= {})[o.stat] = (this.d.oss[o.stat] ?? 0) + 1;
        got[o.stat] = (got[o.stat] ?? 0) + 1;
      }
      this.d.ossRolls = rolls + n;
      this.ossLast = Object.keys(got)[0];
      store(this.d);
      let k = 0;
      this.time.addEvent({
        delay: 70,
        repeat: 11,
        callback: () => {
          face(Phaser.Math.Between(1, 6));
          sfx.click();
          if (++k === 12) {
            this.ossBusy = false;
            this.applyKup();
            sfx.fanfare();
            const text = Object.entries(got)
              .map(([st, c]) => STAT_NAMES[st as keyof typeof STAT_NAMES](c * OSSUARY.find((o) => o.stat === st)!.per))
              .join(', ');
            this.banner(this.views[0].cam, text, true);
            if (this.shopObjs.length && this.tab === 'shop' && this.shopSub === 'bones') this.openShop('shop', false);
          }
        },
      });
    };
    const c1 = rollCost(rolls);
    const c10 = Array.from({ length: 10 }, (_, i) => rollCost(rolls + i)).reduce((a, b) => a + b, 0);
    const b1 = this.btn(10, y0 + 162, 255, 64, () => roll(1), D + 2);
    this.drawBtn(b1, t('Hodit kostkou\n{n} kostí', { n: big(c1) }), bones >= c1, 'blue');
    const b10 = this.btn(275, y0 + 162, 255, 64, () => roll(10), D + 2);
    this.drawBtn(b10, t('10 hodů\n{n} kostí', { n: big(c10) }), bones >= c10, 'plum');
    this.shopObjs.push(b1.bg, b1.label, b1.zone, b10.bg, b10.label, b10.zone);
    // přehled statů z Kostnice
    add(this.add.text(20, y0 + 236, t('Zesíleno kostňákem ({n} hodů):', { n: rolls }), txt(18, PAL.gold)).setDepth(D + 2));
    OSSUARY.forEach((o, i) => {
      const lvl = this.d.oss?.[o.stat] ?? 0;
      const capped = o.cap !== undefined && (lvl + 1) * o.per > o.cap + 1e-9;
      const x = 20 + (i % 2) * 262, y = y0 + 260 + Math.floor(i / 2) * 23;
      const tx = add(this.add.text(x, y, STAT_NAMES[o.stat](lvl * o.per) + (capped ? ' (max)' : ''), txt(15, o.stat === this.ossLast ? PAL.gold : lvl ? PAL.mint : PAL.slate)).setDepth(D + 2));
      tx.setScale(Math.min(1, 250 / tx.width));
    });
  }

  /** koupená výzdoba */
  private has(id: string) {
    return !!this.d.decor?.includes(id);
  }

  /** krígly za hygienu teď (se Zlatou modlou +25 %) */
  private kriglyNow() {
    return Math.floor(kriglyFor(this.d.run) * (this.has('idol') ? 1.25 : 1) * (1 + this.ts().krigly + kKrigly(this.kl('krigly'))));
  }

  shopSub: 'up' | 'decor' | 'bones' = 'up';

  private decorTab(y0: number, D: number) {
    const RH = 67;
    DECOR.forEach((it, i) => {
      const y = y0 + i * RH;
      const own = this.has(it.id);
      this.row(y, RH, D, it.name, it.desc, own ? 'pine' : 'ink');
      this.shopObjs.push(this.add.image(W - 232, y + 50, 'obj', it.frame).setOrigin(0.5, 1).setScale(1.6).setDepth(D + 2));
      const b = this.btn(W - 192, y + 6, 170, 48, () => {
        if (own || this.d.coins < this.decorCost(it.cost)) return sfx.error();
        this.d.coins -= this.decorCost(it.cost);
        (this.d.decor ??= []).push(it.id);
        this.views.forEach((v) => v.showDecor(DECOR.filter((x) => this.has(x.id))));
        this.banner(this.views[0].cam, t('{s}! {d}', { s: it.name, d: it.desc }));
        store(this.d);
        this.openShop('shop', false);
      }, D + 2);
      this.drawBtn(b, own ? '✓' : big(this.decorCost(it.cost)), !own && this.d.coins >= this.decorCost(it.cost), 'amber');
      this.shopObjs.push(b.bg, b.label, b.zone);
      if (!own) this.decorRows.push({ cost: this.decorCost(it.cost), b });
    });
  }
  decorRows: { cost: number; b: Btn }[] = [];

  private decorCost(c: number) {
    return Math.ceil(c * (1 - this.ts().decor));
  }

  private kriglTab(y0: number, D: number) {
    const RH = 86;
    this.shopObjs.push(
      this.add.text(20, y0 - 2, t('Máš {k} krígel (+{b} % výdělek)', { k: big(this.d.krigle), b: big(Math.round(this.d.krigle * KRIGL_BONUS * 100)) }), txt(22, PAL.gold)).setDepth(D + 1),
      this.add.text(20, y0 + 24, t('Utracené krígly už bonus nedávají.'), txt(16, PAL.fog)).setDepth(D + 1),
    );
    const RH2 = 63;
    KRIGL_SHOP.forEach((it, i) => {
      const y = y0 + 44 + i * RH2;
      const lvl = this.kl(it.id);
      const max = kMaxed(it, lvl);
      const price = it.cost(lvl);
      const sub = max ? it.eff(lvl) : lvl ? `${it.eff(lvl)} → ${it.eff(lvl + 1)}` : it.eff(lvl + 1);
      this.row(y, RH2, D, it.name + (it.max === 1 ? '' : ` ${t('úr.')} ${lvl}`), sub, it.id === 'cthulhu' ? 'pine' : 'ink');
      const b = this.btn(W - 172, y + 5, 150, 46, () => {
        if (max || this.d.krigle < price) return sfx.error();
        this.d.krigle -= price;
        (this.d.kup ??= {})[it.id] = lvl + 1;
        this.applyKup();
        sfx.fanfare();
        store(this.d);
        this.openShop('krigl', false);
      }, D + 2);
      this.drawBtn(b, max ? '✓' : t('{k} krígel', { k: big(price) }), !max && this.d.krigle >= price, 'amber');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    // věrnost hostů: roste sama příchody hostů (nekupuje se)
    const g = guestLvl(this.d.gxp ?? 0);
    const gy = y0 + 44 + KRIGL_SHOP.length * RH2;
    const gsub = g.lvl >= GUEST_MAX ? t('spropitné +{v} % (max)', { v: g.lvl * 5 }) : t('spropitné +{v} % · příchody {a} / {b}', { v: g.lvl * 5, a: big(g.xp), b: big(g.need) });
    this.row(gy, RH2, D, `${t('Věrnost hostů')} ${t('úr.')} ${g.lvl}/${GUEST_MAX}`, gsub, 'pine');
  }

  /** promítne vylepšení z krígel do systémů */
  private applyKup() {
    this.ev.freq = kEvents(this.kl('events')) / (1 + this.ts().evfreq);
    brewCfg.speed = 1 + this.ts().brew;
    brewCfg.tank = Math.floor(this.ts().tank);
    nightCfg.mult = 1 + this.ts().night;
    nightCfg.lvl = this.d.dn?.lvl ?? 0;
    nightCfg.shift = this.d.dn?.shift ?? 0;
    PubView.extraGuests = Math.floor(this.ts().guests);
  }

  private gain(n: number) {
    this.d.coins += n;
    this.d.earned += n;
    this.d.run += n;
    if (this.d.league) this.d.league.me += n;
    this.task('earn', n);
  }

  private rate(p: PubState) {
    let r = 0;
    for (const def of STATIONS) {
      const s = p.st[def.id];
      if (!s?.auto) continue;
      // pípa: vydělá jen to, co číšníci stihnou roznést (+ jejich spropitné)
      if (def.id === 'tap' && p.w?.length) {
        const c = crew(p.w);
        r += (this.pay(p, def) / this.cyc(def)) * Math.min(1, (c.rate * this.cyc(def)) / this.beers(p)) * (1 + c.tip);
      } else r += this.pay(p, def) / this.cyc(def);
    }
    return r;
  }

  // ---------- číšníci: lišta v hospodě (návrh B) a panel vylepšení ----------
  wChips: { bg: Phaser.GameObjects.Graphics; face: Phaser.GameObjects.Image; name: Phaser.GameObjects.Text; lvl: Phaser.GameObjects.Text; zone: Phaser.GameObjects.Zone }[] = [];
  wChipKey = '';
  wPanel: Phaser.GameObjects.GameObject[] = [];
  wPanelBtns: { b: Btn; cost: number; max: boolean }[] = [];
  /** získané body číšníka v otevřeném panelu (při nové úrovni se panel překreslí) */
  wPanelPts = -1;
  wSel = -1;

  /** hospoda, jejíž lišta číšníků je vidět */
  private wPub() {
    return this.views.length > 1 ? this.sel : 0;
  }

  private wHirePrice(p: PubState) {
    return wHireCost(p.w?.length ?? 0) * actMult(p.act);
  }

  private addWaiterChips() {
    const y = TOP + VIEW_H - 74;
    for (let k = 0; k < WAITER_MAX; k++) {
      const x = 12 + k * 72;
      const bg = this.add.graphics().setDepth(50);
      const face = this.add.image(x + 32, y + 40, WAITERS[k].key, 0).setScale(2).setDepth(51);
      const name = this.add.text(x + 32, y + 56, '', txt(14, PAL.bone)).setOrigin(0.5).setDepth(52);
      const lvl = this.add.text(x + 60, y + 2, '', txt(15, PAL.ink)).setOrigin(0.5).setDepth(53);
      const zone = this.add.zone(x, y, 64, 66).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(54);
      zone.on('pointerdown', () => this.waiterChip(k));
      this.wChips.push({ bg, face, name, lvl, zone });
    }
    this.wChipKey = '';
  }

  private drawWaiterChips() {
    const pi = this.wPub();
    const p = this.d.pubs[pi];
    const ws = p?.w ?? [];
    const price = p ? this.wHirePrice(p) : 0;
    const hidden = !ws.length || this.night || this.shopObjs.length > 0;
    const key = `${pi}|${hidden}|${ws.map((w) => waiterLvl(w) + ':' + freePoints(w)).join(',')}|${this.d.coins >= price}|${this.wSel}`;
    if (key === this.wChipKey) return;
    this.wChipKey = key;
    const y = TOP + VIEW_H - 74;
    this.wChips.forEach((c, k) => {
      const x = 12 + k * 72;
      const has = k < ws.length, next = k === ws.length;
      const show = !hidden && (has || next);
      c.bg.clear().setVisible(show);
      c.zone.setVisible(show);
      if (show) c.zone.setInteractive();
      else c.zone.disableInteractive();
      c.face.setVisible(show && has);
      c.lvl.setVisible(show && has);
      c.name.setVisible(show);
      if (!show) return;
      c.bg.fillStyle(col('ink'), 0.8).fillRoundedRect(x, y, 64, 66, 9);
      c.bg.lineStyle(3, col(this.wSel === k ? 'gold' : has ? 'mauve' : 'slate')).strokeRoundedRect(x, y, 64, 66, 9);
      if (has) {
        c.bg.fillStyle(col('gold')).fillRoundedRect(x + 48, y - 8, 26, 20, 9);
        // volný bod na vylepšení = zelená tečka
        if (freePoints(ws[k])) c.bg.fillStyle(col('ink')).fillCircle(x + 6, y + 6, 9).fillStyle(col('mint')).fillCircle(x + 6, y + 6, 7);
        c.lvl.setText(String(waiterLvl(ws[k])));
        c.name.setText(WAITERS[k].name).setColor(PAL.bone).setFontSize(14).setY(y + 58);
      } else {
        c.name.setText(`+\n${big(price)}`).setAlign('center').setColor(this.d.coins >= price ? PAL.gold : PAL.fog).setFontSize(18).setY(y + 33);
      }
    });
  }

  private waiterChip(k: number) {
    sfx.init();
    const pi = this.wPub();
    const p = this.d.pubs[pi];
    const ws = (p.w ??= []);
    if (k < ws.length) return this.openWaiter(pi, k);
    if (k !== ws.length || k >= WAITER_MAX) return;
    const price = this.wHirePrice(p);
    if (this.d.coins < price) return sfx.error();
    this.d.coins -= price;
    ws.push({ s: 0, t: 0, m: 0 });
    sfx.hire();
    sfx.pop();
    const x = 12 + k * 72 + 32, y = TOP + VIEW_H - 74;
    confetti(this, x, y + 30, 24, 459, 0.6);
    popText(this, Math.max(120, x), y - 16, t('{n} nastoupil(a)!', { n: WAITERS[k].name }), PAL.bone, 24);
    this.views[pi].refresh();
    this.wChipKey = '';
  }

  private closeWaiter() {
    this.wPanel.forEach((o) => o.destroy());
    this.wPanel = [];
    this.wPanelBtns = [];
    this.wSel = -1;
  }

  /** panel vylepšení jednoho číšníka přes karty stanic */
  private openWaiter(pi: number, k: number) {
    this.closeWaiter();
    this.wSel = k;
    const p = this.d.pubs[pi];
    const w = p.w![k];
    this.wPanelPts = wEarned(w);
    const D = 300;
    const y0 = TOP + VIEW_H + 4;
    const objs = this.wPanel;
    objs.push(this.add.zone(0, y0, W, H - y0).setOrigin(0).setInteractive().setDepth(D));
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('dusk')).fillRoundedRect(4, y0, W - 8, H - y0 - 4, 14);
    g.lineStyle(3, col('gold')).strokeRoundedRect(4, y0, W - 8, H - y0 - 4, 14);
    objs.push(g);
    objs.push(this.add.image(42, y0 + 44, WAITERS[k].key, 0).setScale(2.5).setDepth(D + 1));
    objs.push(this.add.text(74, y0 + 12, t('{n} · úroveň {l}', { n: WAITERS[k].name, l: waiterLvl(w) }), txt(28, PAL.gold)).setDepth(D + 1));
    const r = waiterRate(w);
    const free = freePoints(w);
    const xb = this.add.graphics().setDepth(D + 1);
    xb.fillStyle(col('ink')).fillRoundedRect(74, y0 + 72, W - 160, 10, 4).fillStyle(col('mint')).fillRoundedRect(74, y0 + 72, Math.max(6, (W - 160) * xpProgress(w)), 10, 4);
    objs.push(xb);
    objs.push(this.add.text(W - 80, y0 + 77, free ? t('body: {n}', { n: free }) : '', txt(18, PAL.gold)).setOrigin(1, 0.5).setDepth(D + 2));
    objs.push(this.add.text(74, y0 + 44, t('roznese {r} piva/s · podnos {n} · spropitné +{m} %', { r: r.toFixed(2).replace('.', ','), n: tray(w), m: Math.round(smileBonus(w) * 100) }), txt(17, PAL.fog)).setDepth(D + 1));
    const close = this.btn(W - 66, y0 + 10, 50, 44, () => this.closeWaiter(), D + 2);
    this.drawBtn(close, '✕', true, 'red');
    objs.push(close.bg, close.label, close.zone);
    const sec = (v: number) => v.toFixed(1).replace('.', ',');
    const beers = (n: number) => (n === 1 ? t('1 pivo naráz') : t('{n} piva naráz', { n }));
    const rows: { k: WaiterUp; now: string; next: string }[] = [
      { k: 's', now: t('cesta {s} s', { s: sec(tripTime(w)) }), next: t('cesta {s} s', { s: sec(tripTime({ ...w, s: w.s + 1 })) }) },
      { k: 't', now: beers(tray(w)), next: beers(tray(w) + 1) },
      { k: 'm', now: t('spropitné +{m} %', { m: Math.round(w.m * SMILE_STEP * 100) }), next: t('spropitné +{m} %', { m: Math.round((w.m + 1) * SMILE_STEP * 100) }) },
    ];
    rows.forEach((row, j) => {
      const y = y0 + 96 + j * 110;
      const lvl = w[row.k], max = lvl >= W_UP_MAX[row.k];
      const box = this.add.graphics().setDepth(D + 1);
      box.fillStyle(col('ink'), 0.6).fillRoundedRect(16, y, W - 32, 100, 10);
      objs.push(box);
      objs.push(this.add.text(32, y + 10, `${wUpName(row.k)} ${lvl}/${W_UP_MAX[row.k]}`, txt(24, PAL.bone)).setDepth(D + 1));
      objs.push(this.add.text(32, y + 46, max ? row.now : `${row.now} → ${row.next}`, txt(18, PAL.fog)).setDepth(D + 1));
      const b = this.btn(W - 190, y + 20, 160, 60, () => {
        if (max || freePoints(w) < 1) return sfx.error();
        w[row.k]++;
        sfx.buy();
        confetti(this, W - 110, y + 40, 12, 459, 0.45);
        this.wChipKey = '';
        this.openWaiter(pi, k);
      }, D + 2);
      this.drawBtn(b, max ? t('MAX') : t('+1 bod'), !max && free > 0, 'green');
      this.wPanelBtns.push({ b, cost: 0, max });
      objs.push(b.bg, b.label, b.zone);
    });
  }

  /** piva za cyklus pípy (roste s milníky) */
  private beers(p: PubState) {
    return Math.min(BAR_CAP, beersPerCycle(milestoneCount(p.st.tap?.lvl ?? 0)));
  }

  /** běžící roznosy číšníků v každé hospodě: zbývá s, celková doba, hodnota, už zaplaceno */
  wrun: { t: number; dur: number; v: number; paid: boolean }[][] = [];

  /** číšníci berou piva z baru a nosí je ke stolům; coins až při doručení (v půlce cesty) */
  private waitersTick(i: number, dt: number) {
    const p = this.d.pubs[i];
    const ws = p.w ?? [];
    const run = (this.wrun[i] ??= []);
    const bar = (p.bar ??= { n: 0, v: 0 });
    ws.forEach((w, k) => {
      const r = (run[k] ??= { t: 0, dur: 0, v: 0, paid: true });
      if (r.t > 0) {
        r.t -= dt;
        w.xp = (w.xp ?? 0) + dt;
        if (!r.paid && r.t <= r.dur / 2) {
          r.paid = true;
          const g = r.v * (1 + smileBonus(w));
          this.gain(g);
          this.bumpCoins();
          this.views[i].waiterPop(k, '+' + big(g), PAL.gold);
          if (this.coinT <= 0) {
            sfx.coin(1 + i * 0.12);
            this.coinT = 0.3;
          }
        }
        return;
      }
      if (bar.n < 1 || this.night) return;
      const n = Math.min(tray(w), Math.floor(bar.n));
      const v = (bar.v * n) / bar.n;
      bar.n -= n;
      bar.v -= v;
      if (bar.n < 1e-9) bar.v = 0;
      const dur = tripTime(w);
      run[k] = { t: dur, dur, v, paid: false };
      this.views[i].waiterTrip(k, n, dur);
    });
    this.views[i].setBar(Math.floor(bar.n), BAR_CAP);
  }

  update(_t: number, dms: number) {
    const dt = Math.min(dms / 1000, 0.25);
    this.comboT -= dt;
    this.punchT -= dt;
    this.tutFollow?.();
    this.tutTick();
    this.coinT -= dt;
    this.d.pubs.forEach((p, i) => {
      let open = 0;
      for (const def of STATIONS) {
        const s = p.st[def.id];
        if (!s || s.lvl === 0) continue;
        open++;
        if (s.prog === 0) continue;
        s.prog += dt / this.cyc(def);
        // pípa s číšníky: pivo jde na bar; když je bar plný, pípa počká
        const toBar = def.id === 'tap' && s.auto && !this.night && !!p.w?.length;
        const bar = (p.bar ??= { n: 0, v: 0 });
        if (toBar && s.prog >= 1 && bar.n + this.beers(p) > BAR_CAP) s.prog = 1;
        else if (s.prog >= 1) {
          let g = this.pay(p, def) * this.happyMult();
          if (Math.random() < this.ts().crit) g *= 2;
          if (toBar) {
            bar.n += this.beers(p);
            bar.v += g;
            this.views[i].payout(def.id, 0, false, true);
          } else if (this.night) {
            const b = bonesFor(p.st[def.id]!.lvl) * this.boneMult();
            this.d.bones = (this.d.bones ?? 0) + b;
            this.views[i].payout(def.id, b, true);
          } else {
            this.gain(g);
            this.views[i].payout(def.id, g);
            this.bumpCoins();
          }
          if (this.coinT <= 0) {
            sfx.coin(1 + i * 0.12);
            this.coinT = 0.3; // ať se cinkání neslévá
          }
          s.prog = s.auto ? s.prog - 1 : 0;
        }
      }
      this.waitersTick(i, dt);
      this.views[i].update(dt, open);
    });
    // během návodu nezačínají události (rvačka, žáby…) – nový hráč by nevěděl, co dělat
    if ((this.d.tut ?? -1) < 0 || this.ev.active) this.ev.update(dt);
    // první noc: jednou vysvětlit, že teď místo coins chodí kosti (až nebude otevřené jiné okno)
    if (this.night && !this.d.nightInfo && !this.awayObjs.length) this.nightIntro();
    if (this.d.pubIntro && !this.awayObjs.length) this.pubIntro(this.d.pubIntro);
    if ((this.menuT -= dt) <= 0) {
      this.menuT = 2;
      this.menuUnlocks();
    }
    const nn = this.nightNow();
    if (nn !== this.night) {
      this.night = nn;
      this.views.forEach((v) => v.setNight(nn));
      // noční várka platí jen do rána
      if (!nn && this.d.fx?.nightx2) delete this.d.fx.nightx2;
      this.banner(this.views[0].cam, nn ? t('Padla noc – příšery platí kostmi!') : t('Svítá – lidé zase platí coins.'), true);
    }
    if (this.tab === 'daynight' && this.shopObjs.length && (this.dnT -= dt) <= 0) {
      this.dnT = 1;
      this.openShop('daynight', false);
    }
    if (this.leagueLive && (this.leagueLiveT -= dt) <= 0) {
      this.leagueLiveT = 0.5;
      this.leagueLive();
    }
    if (this.tab === 'brew' && this.shopObjs.length) {
      const before = this.brew().stock;
      tick(this.brew());
      if (this.brew().stock !== before) this.openShop('brew', false);
      else this.drawBrewBar();
    }
    // návštěvník s rozhodnutím (jen když není otevřené jiné okno ani událost)
    this.visitLive?.();
    this.collTick(dt);
    this.visitT -= dt;
    if (this.visitT <= 0 && !this.awayObjs.length && !this.shopObjs.length && this.sheet < 0 && !this.ev.active && (this.d.tut ?? -1) < 0) {
      this.visitT = Phaser.Math.Between(180, 360) / (1 + this.ts().visit);
      this.visit(Phaser.Utils.Array.GetRandom(VISITORS));
    }
    this.saveT += dt;
    if (this.saveT > 5) {
      this.saveT = 0;
      store(this.d);
    }
    this.hintTick(dt);
    this.dartsTick(dt);
    this.refresh();
  }

  private refresh() {
    const total = this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
    this.coinsText.setText(`${big(this.d.coins)} coins`);
    this.coinsText.setScale(Math.min(1, 226 / this.coinsText.width));
    this.rateText.setText(this.night ? t('+{n} kostí / s', { n: this.bonesPerSec() < 1 ? this.bonesPerSec().toFixed(2) : big(this.bonesPerSec()) }) : t('+{n} / s', { n: big(total) }));
    this.rateText.setColor(this.night ? PAL.ice : PAL.mint).setScale(Math.min(1, 220 / this.rateText.width));
    // během návodu noc nepřijde – čas dne stojí
    const left = Math.ceil(((this.d.tut ?? -1) >= 0 ? DAY_MS : phaseLeft()) / 1000);
    this.infoText.setText(
      `${this.night ? t('Noc') : t('Den')} ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}  ·  ${t('kosti: {n}', { n: big(this.d.bones ?? 0) })}` +
        (season ? `  ·  ${SEASONS[season].name} +${SEASON_BONUS * 100} %` : ''),
    );
    this.infoText.setScale(Math.min(1, (W - 32) / this.infoText.width));
    this.skillBtns.forEach((_, i) => this.drawSkill(i));
    this.stripRates.forEach((r, i) => r.setText(t('+{n} / s', { n: big(this.rate(this.d.pubs[i])) })));

    const cheap = ['shop', 'tasks', 'brew', 'keeper'].some((id) => this.tabAlert(id) && !this.tileLock(id));
    this.shopDot.clear();
    if (cheap) this.shopDot.fillStyle(col('ink')).fillCircle(W - 126, 20, 11).fillStyle(col('scarlet')).fillCircle(W - 126, 20, 8);
    for (const r of this.shopRows) this.drawBtn(r.b, big(r.o.cost), this.d.coins >= r.o.cost, 'green');
    for (const r of this.decorRows) this.drawBtn(r.b, big(r.cost), this.d.coins >= r.cost, 'amber');

    for (const c of this.cards) {
      const p = this.d.pubs[c.pub];
      const s = this.st(p, c.def.id);
      const open = s.lvl > 0;
      const { n, price } = this.offer(p, c.def);
      const staff = c.def.staff * actMult(p.act) * (1 - this.ts().staff);
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
      // pípa s číšníky: plný bar = číšníci nestíhají
      if (c.def.id === 'tap' && s.auto && !this.night && p.w?.length && (p.bar?.n ?? 0) + this.beers(p) > BAR_CAP) c.info.setText(t('bar plný – číšníci nestíhají!')).setColor(PAL.sand);
      else c.info.setColor(PAL.white);
    }
    this.drawWaiterChips();
    // panel číšníka: nový bod za zkušenosti → překreslit
    if (this.wSel >= 0 && this.wPanel.length) {
      const w = this.d.pubs[this.wPub()]?.w?.[this.wSel];
      if (w && wEarned(w) !== this.wPanelPts) this.openWaiter(this.wPub(), this.wSel);
    }
  }
}
