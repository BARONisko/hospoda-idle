import Phaser from 'phaser';
import { renderPubBackground } from '../gfx';
import { PUB } from '../data/maps';
import { PAL } from '../data/palette';
import { txt } from '../ui/font';
import { big } from '../core/num';
import type { PubState } from '../core/save';
import { season, SEASONS } from '../core/season';
import { registerBubble } from './bubbleArt';
import { WAITERS } from '../core/waiters';

// Jedna živá hospoda: pozadí podle dějství, vybavení, hostinský, číšníci u stanic, hosté chodí, sedí a odcházejí.
// Každá hospoda leží ve světě scény na vlastním místě (ox) a má vlastní kameru.
const T = 16;
/** vzhled hospody za diamanty (jen vzhled; nastavuje scéna podle koupených položek) */
export const LOOK = { tap: false, tables: false, livery: false };
/** střed interiéru na šířku: sloupce 1–17 (sloupec 0 je vnější zeď – byl vidět jako černý pruh vlevo) */
const CX_ROOM = 9.5 * T;
const DOOR = { x: PUB.door.x * T + 8, y: PUB.door.y * T + 14 };
const TABLES = PUB.tables.slice(0, 6);

/** hosté podle dějství: 1 lidé, 2 příšery, 3 žabí lidé a kultisté */
export const GUESTS: Record<number, string[]> = {
  1: Array.from({ length: 12 }, (_, i) => `guest${i}`),
  2: ['zombie', 'werewolf', 'banshee', 'vampire', 'ghost', 'ratman', 'guest3', 'zombie', 'vampire'],
  3: ['frogman', 'frogman', 'guest1', 'guest5', 'frogman', 'guest8', 'zabak'],
  4: ['cultist0', 'cultist1', 'cultist2', 'deep0', 'deep1', 'drowner', 'cultist3', 'deep2'],
};

/** kde stanice stojí (relativně k hospodě) – tam pracuje obsluha a vyskakuje výdělek */
export const SPOT: Record<string, { x: number; y: number }> = {
  tap: { x: 3 * T + 8, y: 4 * T + 10 },
  kitchen: { x: 11 * T + 8, y: 4 * T + 12 },
  cellar: { x: 12 * T + 8, y: 3 * T + 12 },
  dice: { x: TABLES[5].x * T - 8, y: TABLES[5].y * T + 12 },
};

interface Seat {
  x: number;
  y: number;
  flip: boolean;
  aisle: number;
  taken: boolean;
}

interface Guest {
  spr: Phaser.GameObjects.Sprite;
  path: { x: number; y: number }[];
  seat?: Seat;
  sitT: number;
  leaving: boolean;
  t: number;
  tipped: boolean;
  mug?: Phaser.GameObjects.Image;
  /** bublina s objednávkou nad hlavou */
  order?: Phaser.GameObjects.Image[];
  /** jak dlouho sedí (s) */
  sat?: number;
  /** kdy (sat) si objednal naposledy / kdy si objedná znovu */
  orderAt?: number;
  next?: number;
  /** číšník už k němu nese pivo */
  served?: boolean;
}

/** přes den má každá hospoda své hosty, v noci chodí do všech kostlivci */
const NIGHT_GUESTS = ['skeleton'];

/** jídlo podle hospody (objednávky hostů) */
const FOOD: Record<number, string> = { 1: 'dGoulash', 2: 'dKnee', 3: 'dFried', 4: 'dSmoked' };

/** vybavení, které přibude s úrovní stanice */
const LEVEL_DECOR: { id: string; lvl: number; frame: string; x: number; y: number }[] = [
  { id: 'tap', lvl: 25, frame: 'keg', x: 5 * T + 2, y: 4 * T + 10 },
  { id: 'tap', lvl: 100, frame: 'kegGold', x: 6 * T + 4, y: 4 * T + 10 },
  { id: 'kitchen', lvl: 25, frame: 'kOven', x: 14 * T + 12, y: 3 * T + 12 }, // u zdi, ať nestojí v cestě
  { id: 'cellar', lvl: 25, frame: 'barrels', x: 2 * T + 12, y: 3 * T + 15 },
  { id: 'dice', lvl: 25, frame: 'trophy', x: 15 * T + 8, y: 2 * T + 14 },
  { id: 'dice', lvl: 100, frame: 'jukebox0', x: 10 * T + 8, y: 13 * T + 8 }, // u spodní zdi (dřív stál ve dveřích)
];

/** obsluha u stanic: kuchař, sklepník, u kostek kostlivec */
const STAFF_KEY: Record<string, string> = { kitchen: 'cook', cellar: 'brewer', dice: 'skeleton' };

/** kde číšníci čekají před barem a kudy chodí mezi stoly */
const WAIT_HOME = [
  { x: 4.5 * T, y: 6 * T + 2 },
  { x: 5.6 * T, y: 6 * T + 4 },
  { x: 8.9 * T, y: 6 * T + 2 },
  { x: 10 * T, y: 6 * T + 4 },
];
const CORRIDORS = [7 * T, 12 * T];

/** postava manažera podle hospody */
const MGR_SPRITE: Record<number, string> = { 1: 'tapster', 2: 'count', 3: 'deep0', 4: 'yellowKing' };

export class PubView {
  /** hostů navíc (stat z Kostnice) */
  static extraGuests = 0;
  /** probuzený Cthulhu (vylepšení z krígel) – kouká do hospody */
  cthulhu = false;
  private cth?: Phaser.GameObjects.Sprite;
  private mgr?: Phaser.GameObjects.Sprite;
  private decor: Record<string, Phaser.GameObjects.Image> = {};
  readonly cam: Phaser.Cameras.Scene2D.Camera;
  readonly objs: Phaser.GameObjects.GameObject[] = [];
  private guests: Guest[] = [];
  private seats: Seat[] = [];
  private spawnT = 0.5;
  private keeper: Phaser.GameObjects.Sprite;
  private pourT = 0;
  private props: Record<string, Phaser.GameObjects.Image[]> = {};
  /** obsluha u stanic: kuchař, sklepník, kostlivec u kostek (nic nenosí – nosí jen číšníci) */
  private staff: Record<string, Phaser.GameObjects.Sprite> = {};
  private dishes: Phaser.GameObjects.Image[] = [];
  /** číšníci (postavy) a piva čekající na baru */
  private waiters: Phaser.GameObjects.Sprite[] = [];
  private taps: Phaser.GameObjects.Image[] = [];
  private tables: Phaser.GameObjects.Image[] = [];

  /** použije koupený vzhled (pípa, stoly, livreje) – volá se po startu a po koupi */
  applyLook() {
    this.taps.forEach((o, i) => o.setFrame(LOOK.tap ? 'luxTap' : i ? 'tap2' : 'tap'));
    this.tables.forEach((o) => o.setFrame(LOOK.tables ? 'luxTable' : 'table'));
    this.waiters.forEach((o, i) => {
      const key = LOOK.livery ? `${WAITERS[i].key}_lux` : WAITERS[i].key;
      if (o.texture.key !== key) o.setTexture(key, o.frame.name);
    });
  }
  private barMugs: Phaser.GameObjects.Image[] = [];
  private barText?: Phaser.GameObjects.Text;
  private rnd: Phaser.Math.RandomDataGenerator;

  constructor(
    private s: Phaser.Scene,
    readonly pub: PubState,
    readonly ox: number,
  ) {
    this.rnd = new Phaser.Math.RandomDataGenerator([String(ox)]);
    const add = <G extends Phaser.GameObjects.GameObject>(g: G) => (this.objs.push(g), g);
    const img = (x: number, y: number, frame: string, depth = 0) =>
      add(s.add.image(ox + x, y, 'obj', frame).setOrigin(0.5, 1).setDepth(depth));
    add(s.add.image(ox, 0, renderPubBackground(s, 1, pub.act)).setOrigin(0).setDepth(-1000));
    for (const w of PUB.wallDecor) if (w.x < 17 && !w.kind.endsWith('_skip') && w.kind !== 'window') img(w.x * T + 8, 2 * T + 14, w.kind, -900);
    img(PUB.cellarDoor.x * T + 8, 2 * T + 16, 'cellarDoor', -900);
    this.taps = [img(3 * T + 8, 5 * T + 6, 'tap', 5 * T + 6), img(6 * T + 8, 5 * T + 6, 'tap2', 5 * T + 6)];
    img(PUB.register.x * T + 8, PUB.register.y * T + 9, 'register', 5 * T + 6);
    img(PUB.plant.x * T + 8, PUB.plant.y * T + 15, 'plant', PUB.plant.y * T + 15);
    this.props.kitchen = [img(PUB.stove.x * T + 8, PUB.stove.y * T + 15, 'stove0', PUB.stove.y * T + 15)];
    this.props.cellar = [img(1 * T + 8, 3 * T + 15, 'kegRack', 3 * T + 15)];
    for (const tb of TABLES) {
      this.tables.push(img(tb.x * T + 16, tb.y * T + 14, 'table', tb.y * T + 14));
      img(tb.x * T - 8, tb.y * T + 15, 'chairL', tb.y * T + 2);
      img(tb.x * T + 40, tb.y * T + 15, 'chairR', tb.y * T + 2);
      const aisle = tb.y * T + 30;
      this.seats.push({ x: tb.x * T - 8, y: tb.y * T + 12, flip: false, aisle, taken: false });
      this.seats.push({ x: tb.x * T + 40, y: tb.y * T + 12, flip: true, aisle, taken: false });
    }
    // kostky: místo u stolu s kostkami je zabrané (nesedá tam host)
    this.seats.find((st) => st.x === SPOT.dice.x && st.y === SPOT.dice.y)!.taken = true;
    this.keeper = add(s.add.sprite(ox + SPOT.tap.x, SPOT.tap.y, pub.act === 3 ? 'zabak' : pub.act === 4 ? 'cultist4' : 'player', 0).setOrigin(0.5, 1).setDepth(SPOT.tap.y));
    this.applyLook();
    // hospoda je už rozjetá: pár hostů sedí hned od začátku
    for (let i = 0; i < 4; i++) {
      this.spawn();
      const g = this.guests[this.guests.length - 1];
      if (g) {
        const last = g.path[g.path.length - 1];
        g.spr.setPosition(this.ox + last.x, last.y);
        g.path = [];
        g.sitT = this.rnd.realInRange(3, 15);
      }
    }
    // sezónní výzdoba
    if (season) {
      const spots = [
        [8.5 * T, 2 * T + 6],
        [11 * T, 2 * T + 6],
        [1 * T, 2 * T + 14],
        [16 * T, 2 * T + 14],
      ];
      SEASONS[season].decor.forEach((f, i) => {
        const [x, y] = spots[i % spots.length];
        add(s.add.image(ox + x, y, 'obj', f).setOrigin(0.5, 1).setDepth(y));
      });
    }
    this.cam = s.cameras.add(0, 0, 10, 10).setBackgroundColor(PAL.ink);
    this.cam.roundPixels = true;
    this.refresh();
  }

  /** umístí kameru: výřez obrazovky + co ve hospodě ukázat */
  /** přiblížení, při kterém je vidět celá místnost (17 × 14 dlaždic) – na šířku i na výšku */
  static fitZoom(w: number, h: number) {
    return Math.min(w / (17 * T), h / (14 * T));
  }

  frame(x: number, y: number, w: number, h: number, cy = 112, zoomTo?: number) {
    const zoom = zoomTo ?? w / (17 * T); // šířka interiéru (sloupce 0–16) přes celou šířku výřezu
    this.cam.setViewport(x, y, w, h).setZoom(zoom);
    const halfH = h / zoom / 2;
    this.cam.centerOn(this.ox + CX_ROOM, Phaser.Math.Clamp(cy, halfH, 14 * T - halfH));
  }

  /** jako frame(), ale rámeček může být zčásti mimo obrazovku (posuvné pruhy) – kamera ukáže jen viditelnou část */
  frameClip(x: number, y: number, w: number, h: number, top: number, bottom: number, cy = 112) {
    const zoom = w / (17 * T);
    const halfH = h / zoom / 2;
    const c = Phaser.Math.Clamp(cy, halfH, 14 * T - halfH);
    const y0 = Math.max(y, top), y1 = Math.min(y + h, bottom);
    if (y1 - y0 < 2) {
      this.cam.setVisible(false);
      return;
    }
    this.cam.setVisible(true).setViewport(x, y0, w, y1 - y0).setZoom(zoom);
    this.cam.centerOn(this.ox + CX_ROOM, c + ((y0 + y1) / 2 - (y + h / 2)) / zoom);
  }

  /** noc: potemnělá hospoda a chodí příšery */
  night = false;
  private dark?: Phaser.GameObjects.Rectangle;

  setNight(on: boolean) {
    if (on === this.night && this.dark) return;
    // při změně dne a noci se sedící hosté postupně zvednou a odejdou (přijdou noví – lidé nebo kostlivci)
    if (on !== this.night) for (const g of this.guests) if (!g.leaving && !g.path.length) g.sitT = Math.min(g.sitT, this.rnd.realInRange(0.5, 6));
    this.night = on;
    if (!this.dark) {
      this.dark = this.s.add.rectangle(this.ox - 20, -20, 17 * T + 60, 14 * T + 60, 0x10122a, 0).setOrigin(0).setDepth(3990);
      this.objs.push(this.dark);
      this.s.events.emit('pubObj', this.dark);
    }
    this.s.tweens.add({ targets: this.dark, fillAlpha: on ? 0.55 : 0, duration: 1500 });
  }

  /** obsluha u stanice (kuchař, sklepník) nestojí jako socha: přejde kousek vedle, chvíli „pracuje“ (ruce nahoře) a zase zpátky */
  private staffWork(spr: Phaser.GameObjects.Sprite, x0: number) {
    const step = () => {
      if (!spr.active) return;
      if (spr.getData('busy')) return void this.s.time.delayedCall(1000, step);
      const tx = x0 + this.rnd.between(-10, 10);
      const dist = Math.abs(tx - spr.x);
      spr.setFlipX(tx < spr.x);
      let f = 0;
      this.s.tweens.add({
        targets: spr,
        x: tx,
        duration: Math.max(200, dist * 60),
        onUpdate: () => spr.setFrame(8 + (Math.floor(f++ / 6) % 4)),
        onComplete: () => {
          if (!spr.active) return;
          spr.setFlipX(false).setFrame(this.rnd.frac() < 0.4 ? 13 : 4);
          this.s.time.delayedCall(this.rnd.between(1500, 4000), () => {
            if (spr.active) spr.setFrame(4);
            this.s.time.delayedCall(this.rnd.between(300, 1200), step);
          });
        },
      });
    };
    this.s.time.delayedCall(this.rnd.between(500, 2500), step);
  }

  /** druhy hostů této hospody (pro rváče) */
  guestKeys() {
    return GUESTS[this.pub.act];
  }

  /** jeden sedící host se zvedne a odejde (rvačka) */
  leaveOne() {
    const g = this.guests.find((q) => !q.leaving && !q.path.length);
    if (g) g.sitT = 0;
    this.spawnT = 6; // chvíli nikdo nepřijde
  }

  /** výzdoba z obchodu (snímek, místo v dlaždicích) */
  showDecor(items: { id: string; frame: string; x: number; y: number }[]) {
    for (const it of items) {
      const k = 'deco_' + it.id;
      if (this.decor[k]) continue;
      const x = this.ox + it.x * T, y = it.y * T;
      const o = this.s.add.image(x, y, 'obj', it.frame).setOrigin(0.5, 1).setDepth(y);
      this.decor[k] = o;
      this.objs.push(o);
      this.s.events.emit('pubObj', o);
      this.s.tweens.add({ targets: o, scale: { from: 2, to: 1 }, duration: 500, ease: 'Back.out' });
    }
  }

  /** stanice se otevřela/najala obsluhu → ukázat vybavení a číšníky */
  refresh() {
    if (this.pub.mgr && !this.mgr) {
      const x = this.ox + 8 * T, y = 4 * T + 10;
      this.mgr = this.s.add.sprite(x, y, MGR_SPRITE[this.pub.act], 1).setOrigin(0.5, 1).setDepth(y + 1);
      this.objs.push(this.mgr);
      this.s.events.emit('pubObj', this.mgr);
      this.s.tweens.add({ targets: this.mgr, y: y - 2, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.inOut' });
    }
    if (this.cthulhu && !this.cth) {
      const x = this.ox + 15.2 * T, y = 10.6 * T;
      this.cth = this.s.add.sprite(x, y, 'cthulhu', 0).setOrigin(0.5, 1).setDepth(y + 2).setAlpha(0.9);
      this.objs.push(this.cth);
      this.s.events.emit('pubObj', this.cth);
      this.s.tweens.add({ targets: this.cth, y: y - 4, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.inOut' });
    }
    const st = this.pub.st;
    for (const d of LEVEL_DECOR) {
      const k = `${d.id}${d.lvl}`;
      if ((st[d.id]?.lvl ?? 0) >= d.lvl && !this.decor[k]) {
        const o = this.s.add.image(this.ox + d.x, d.y, 'obj', d.frame).setOrigin(0.5, 1).setDepth(d.y);
        this.decor[k] = o;
        this.objs.push(o);
        this.s.events.emit('pubObj', o);
        this.s.tweens.add({ targets: o, scale: { from: 1.6, to: 1 }, duration: 400, ease: 'Back.out' });
      }
    }
    const nw = this.pub.w?.length ?? 0;
    for (let i = this.waiters.length; i < Math.min(nw, WAITERS.length); i++) {
      const h = WAIT_HOME[i];
      const spr = this.s.add.sprite(this.ox + h.x, h.y, LOOK.livery ? `${WAITERS[i].key}_lux` : WAITERS[i].key, 0).setOrigin(0.5, 1).setDepth(h.y + 1);
      this.objs.push(spr);
      this.waiters.push(spr);
      this.s.events.emit('pubObj', spr);
      this.s.tweens.add({ targets: spr, scale: { from: 1.6, to: 1 }, duration: 400, ease: 'Back.out' });
    }
    for (const id of ['kitchen', 'cellar', 'dice']) {
      const on = id === 'dice' ? (st[id]?.lvl ?? 0) > 0 : !!st[id]?.auto;
      if (on && !this.staff[id]) {
        const p = SPOT[id];
        const spr = this.s.add.sprite(this.ox + p.x, p.y, STAFF_KEY[id], id === 'dice' ? 12 : 4).setOrigin(0.5, 1).setDepth(p.y + 1);
        this.objs.push(spr);
        this.staff[id] = spr;
        this.s.events.emit('pubObj', spr);
        if (id !== 'dice') this.staffWork(spr, this.ox + p.x);
      }
    }
    for (const [id, list] of Object.entries(this.props)) list.forEach((o) => o.setVisible((st[id]?.lvl ?? 0) > 0));
  }

  /** výdělek stanice → animace a „+coins“ */
  payout(id: string, amount: number, bones = false, toBar = false) {
    const p = SPOT[id];
    if (id === 'tap') this.pourT = 0.5;
    if (toBar) return; // pivo jde na bar, coins až po doručení číšníkem
    if (!bones) return this.pop(p.x, p.y - 22, '+' + big(amount), PAL.gold);
    // kosti chodí po zlomcích – ukázat až celou kost
    const acc = (this.boneAcc[id] ?? 0) + amount;
    const whole = Math.floor(acc);
    this.boneAcc[id] = acc - whole;
    if (whole > 0) this.pop(p.x, p.y - 22, '+' + big(whole), PAL.ice);
  }

  private boneAcc: Record<string, number> = {};

  pop(x: number, y: number, text: string, color: string) {
    const tx = this.s.add.text(this.ox + x, y, text, txt(10, color)).setOrigin(0.5).setDepth(5000).setResolution(3);
    this.s.events.emit('pubObj', tx);
    this.s.tweens.add({ targets: tx, y: y - 18, alpha: 0, duration: 1000, onComplete: () => tx.destroy() });
  }

  /** ťuknutí do hospody: host = spropitné (vrací true, když se trefil) */
  tap(wx: number, wy: number): boolean {
    // nejdřív bubliny (leží nad hlavami a překrývají hosty v řadě za nimi), pak postavy
    for (const g of this.guests) {
      if (!g.order || g.leaving) continue;
      if (Phaser.Geom.Rectangle.Contains(Phaser.Geom.Rectangle.Inflate(g.order[0].getBounds(), 5, 5), wx, wy)) return this.tipGuest(g);
    }
    // spropitné dá jen host s bublinou (objednávkou) – ťuk na něj samotného taky platí, host bez bubliny nic
    for (const g of this.guests) {
      if (!g.order || g.leaving) continue;
      if (Phaser.Geom.Rectangle.Contains(Phaser.Geom.Rectangle.Inflate(g.spr.getBounds(), 6, 6), wx, wy)) return this.tipGuest(g);
    }
    return false;
  }

  /** host dá spropitné; bublina hned zmizí (obslouženo). Bublina dá spropitné vždy. */
  private tipGuest(g: Guest) {
    g.tipped = true;
    this.last = g;
    // věrnost hostů: druh obslouženého hosta (PubScene.tipReward přičte bod)
    this.lastKey = g.spr.texture.key;
    if (g.order) {
      const o = g.order;
      g.order = undefined;
      g.next = (g.sat ?? 0) + this.rnd.realInRange(8, 14);
      this.s.tweens.killTweensOf(o);
      this.s.tweens.add({ targets: o, scale: 0, alpha: 0, duration: 120, onComplete: () => o.forEach((x) => x.destroy()) });
    }
    this.s.tweens.add({ targets: g.spr, y: g.spr.y - 4, yoyo: true, duration: 100 });
    return true;
  }

  private last?: Guest;
  /** druh naposledy obslouženého hosta (klíč textury) */
  lastKey = '';
  /** návod čeká na ťuk na bublinu → bubliny se samy neobslouží */
  hold = false;


  /** sběrač: obslouží nejstarší bublinu s objednávkou (vrací true, když nějakou našel) */
  autoTip(): boolean {
    const g = this.guests.find((q) => q.order && !q.leaving);
    if (!g) return false;
    this.tipGuest(g);
    return true;
  }

  /** obsloužit objednávku: bublina zmizí, příští objednávka za 8–14 s */
  private serve(g: Guest) {
    g.order?.forEach((o) => o.destroy());
    g.order = undefined;
    g.next = (g.sat ?? 0) + this.rnd.realInRange(8, 14);
  }

  /** kam na obrazovce ukázat návodem „ťukni na bublinu“: bublina s objednávkou (host bez bubliny spropitné nedá) */
  tipTarget(): { x: number; y: number } | null {
    const g = this.guests.find((q) => q.order && !q.leaving);
    if (!g || !this.cam.visible) return null;
    const b = g.order![0].getBounds();
    const v = this.cam.worldView;
    return { x: this.cam.x + (b.centerX - v.x) * this.cam.zoom, y: this.cam.y + (b.top - v.y) * this.cam.zoom };
  }

  /** runda pro všechny: každý sedící host dá spropitné (vrací počet) */
  tipAll(text: string): number {
    let n = 0;
    for (const g of this.guests) {
      if (g.leaving || g.path.length) continue;
      n++;
      this.s.tweens.add({ targets: g.spr, y: g.spr.y - 4, yoyo: true, duration: 120, delay: n * 60 });
      this.pop(g.spr.x - this.ox, g.spr.y - 26, text, PAL.mint);
    }
    return n;
  }

  tipPop(text: string) {
    // poslední trefený host
    const g = this.last ?? [...this.guests].reverse().find((q) => q.tipped);
    if (g) this.pop(g.spr.x - this.ox, g.spr.y - 26, text, PAL.mint);
  }

  /** nosí pivo číšníci? (přes den, když hospoda nějaké má) */
  waiting() {
    return !this.night && (this.pub.w?.length ?? 0) > 0 && !!this.pub.st.tap?.auto;
  }

  /** objednává si host jídlo (jinak pivo) */
  private isFood(g: Guest) {
    return (g.spr.x * 7 + g.spr.y) % 3 === 0;
  }

  /** nosí to (pivo / jídlo) číšníci? jídlo jen když kuchyně běží sama */
  private carried(food: boolean) {
    return this.waiting() && (!food || !!this.pub.st.kitchen?.auto);
  }

  /** piva čekající na baru: hrnky na pultu a počet (červeně, když je bar plný) */
  setBar(n: number, cap: number) {
    const show = this.waiting() || n > 0 ? Math.min(6, n) : 0;
    while (this.barMugs.length < show) {
      const i = this.barMugs.length;
      const m = this.s.add.image(this.ox + 7.15 * T + (i % 3) * 7, 4 * T + 13 - Math.floor(i / 3) * 4, 'obj', 'mug').setOrigin(0.5, 1).setDepth(5 * T + 7 + i);
      this.objs.push(m);
      this.barMugs.push(m);
      this.s.events.emit('pubObj', m);
    }
    while (this.barMugs.length > show) this.barMugs.pop()!.destroy();
    if (!this.barText) {
      this.barText = this.s.add.text(this.ox + 7.55 * T, 4 * T + 22, '', txt(11, PAL.gold)).setOrigin(0.5).setBackgroundColor(PAL.ink).setPadding(2, 0, 2, 0).setDepth(5000).setResolution(3);
      this.objs.push(this.barText);
      this.s.events.emit('pubObj', this.barText);
    }
    this.barText.setVisible(this.waiting() || n > 0).setText(`${n}/${cap}`).setColor(n >= cap ? PAL.scarlet : PAL.gold);
  }

  /** talíře čekající u kuchyně na číšníky */
  private dishTable?: Phaser.GameObjects.Graphics;

  setDishes(n: number) {
    // výdejní stolek u kuchyně – talíře stojí na něm, ne na zemi
    if (!this.dishTable && (this.pub.st.kitchen?.lvl ?? 0) > 0) {
      const x0 = this.ox + 13.2 * T - 6, top = 4 * T - 4;
      const g = this.s.add.graphics().setDepth(4 * T + 6);
      g.fillStyle(0x1b141c).fillRect(x0 - 1, top - 1, 32, 7);
      g.fillStyle(0x8a4b2c).fillRect(x0, top, 30, 5).fillStyle(0xc77b3a).fillRect(x0, top, 30, 2);
      g.fillStyle(0x1b141c).fillRect(x0 + 2, top + 5, 3, 7).fillRect(x0 + 25, top + 5, 3, 7);
      g.fillStyle(0x5e3424).fillRect(x0 + 3, top + 5, 1, 6).fillRect(x0 + 26, top + 5, 1, 6);
      this.dishTable = g;
      this.objs.push(g);
      this.s.events.emit('pubObj', g);
    }
    const show = Math.min(4, n);
    while (this.dishes.length < show) {
      const i = this.dishes.length;
      const m = this.s.add.image(this.ox + 13.2 * T + i * 7, 4 * T - 2, 'obj', FOOD[this.pub.act]).setOrigin(0.5, 1).setScale(0.45).setDepth(4 * T + 7 + i);
      this.objs.push(m);
      this.dishes.push(m);
      this.s.events.emit('pubObj', m);
    }
    while (this.dishes.length > show) this.dishes.pop()!.destroy();
  }

  /** číšník i nese n piv ke stolu: tam za dur/2 s, pak zpátky; vrací hosta, kterému pivo nese (kvůli „+coins“) */
  waiterTrip(i: number, n: number, dur: number, food = false) {
    const spr = this.waiters[i];
    if (!spr?.active) return;
    const home = WAIT_HOME[i];
    const seated = this.guests.filter((q) => q.seat && !q.leaving && !q.path.length);
    // nejdřív host, který na to (pivo / jídlo) čeká, pak kdokoli, kdo to chce, pak kdokoli
    const want = seated.filter((q) => this.isFood(q) === food);
    const wait = want.filter((q) => !q.mug && !q.served);
    const pool = wait.length ? wait : want.length ? want : seated;
    const g = pool.length ? this.rnd.pick(pool) : undefined;
    const seat = g?.seat ?? this.rnd.pick(this.seats);
    if (g) g.served = true;
    const cx = CORRIDORS.reduce((a, b) => (Math.abs(b - seat.x) < Math.abs(a - seat.x) ? b : a));
    const there = [{ x: cx, y: home.y }, { x: cx, y: seat.aisle }, { x: seat.x, y: seat.aisle }];
    const back = [{ x: cx, y: seat.aisle }, { x: cx, y: home.y }, { x: home.x, y: home.y }];
    const len = (pts: { x: number; y: number }[]) => {
      let l = 0, px = home.x, py = home.y;
      for (const p of pts) (l += Math.abs(p.x - px) + Math.abs(p.y - py)), (px = p.x), (py = p.y);
      return l;
    };
    const walk = Math.max(0.3, dur / 2 - 0.25);
    const speed = Math.max(len(there), 1) / walk;
    this.s.tweens.killTweensOf(spr);
    spr.setPosition(this.ox + home.x, home.y);
    // podnos s pivy nad hlavou
    const tray = this.s.add.rectangle(spr.x, spr.y - 17, 16, 2, 0xc8c8d0).setStrokeStyle(1, 0x1a1a24);
    const item = food ? FOOD[this.pub.act] : 'mug';
    const mugs = Array.from({ length: Math.min(n, 4) }, () => {
      const m = this.s.add.image(spr.x, spr.y, 'obj', item).setOrigin(0.5, 1).setScale(0.8);
      if (m.width > 14 || m.height > 12) m.setScale(0.45);
      return m;
    });
    const carry = [tray, ...mugs];
    carry.forEach((o) => (this.objs.push(o), this.s.events.emit('pubObj', o)));
    const follow = () => {
      if (!spr.active || !tray.active) return void this.s.events.off('update', follow);
      tray.setPosition(spr.x, spr.y - 17).setDepth(spr.y + 3);
      mugs.forEach((m, k) => m.active && m.setPosition(spr.x - (mugs.length - 1) * 3 + k * 6, spr.y - 18).setDepth(spr.y + 4 + k));
    };
    this.s.events.on('update', follow);
    this.walkPath(spr, there, speed, () => {
      spr.setFrame(13);
      // pivo na stůl
      if (g && g.seat && !g.leaving) {
        if (g.mug) g.mug.setFrame(item);
        else {
          g.mug = this.s.add.image(g.spr.x + (g.seat.flip ? -13 : 13), g.spr.y - 6, 'obj', item).setOrigin(0.5, 1).setDepth(g.spr.y + 4);
          this.objs.push(g.mug);
          this.s.events.emit('pubObj', g.mug);
        }
        this.s.tweens.add({ targets: g.mug, scale: { from: 1.5, to: 1 }, duration: 200, ease: 'Back.out' });
      }
      if (g) g.served = false;
      mugs.forEach((m) => m.destroy());
      this.s.time.delayedCall(250, () => {
        tray.destroy();
        this.s.events.off('update', follow);
        this.walkPath(spr, back, speed, () => spr.setFlipX(false).setFrame(0).setDepth(home.y + 1));
      });
    });
  }

  /** „+coins“ nad číšníkem (doručené pivo) */
  waiterPop(i: number, text: string, color: string) {
    const spr = this.waiters[i];
    if (spr?.active) this.pop(spr.x - this.ox, spr.y - 30, text, color);
  }

  /** postava jde po bodech stálou rychlostí (px/s) */
  private walkPath(spr: Phaser.GameObjects.Sprite, pts: { x: number; y: number }[], speed: number, done: () => void): void {
    const p = pts.shift();
    if (!p || !spr.active) return done();
    const tx = this.ox + p.x, dx = tx - spr.x, dy = p.y - spr.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (dist < 0.5) return this.walkPath(spr, pts, speed, done);
    let f = 0;
    this.s.tweens.add({
      targets: spr,
      x: tx,
      y: p.y,
      duration: (dist / speed) * 1000,
      onUpdate: () => {
        const a = Math.floor(f++ / 5) % 4;
        if (Math.abs(dx) > Math.abs(dy)) spr.setFrame(8 + a).setFlipX(dx < 0);
        else spr.setFrame((dy < 0 ? 4 : 0) + a).setFlipX(false);
        spr.setDepth(spr.y + 1);
      },
      onComplete: () => this.walkPath(spr, pts, speed, done),
    });
  }

  update(dt: number, busy: number) {
    // hosté: čím víc otevřených stanic, tím víc lidí
    this.spawnT -= dt;
    const want = Math.min(this.seats.length - 1, 3 + busy * 2 + PubView.extraGuests);
    if (this.spawnT <= 0) {
      this.spawnT = this.rnd.realInRange(1.2, 3.5);
      if (this.guests.length < want) {
        const n = this.guests.length;
        this.spawn();
        if (this.guests.length > n) this.s.events.emit('guestArrive');
      }
    }
    for (const g of [...this.guests]) this.walk(g, dt);
    // hostinský: při čepování ruce nahoře
    this.pourT -= dt;
    this.keeper.setFrame(this.pourT > 0 ? 13 : 0);
  }

  private spawn() {
    const free = this.seats.filter((st) => !st.taken);
    if (!free.length) return;
    const seat = this.rnd.pick(free);
    seat.taken = true;
    const key = this.night ? this.rnd.pick(NIGHT_GUESTS) : season && this.rnd.frac() < 0.15 ? SEASONS[season].guest : this.rnd.pick(GUESTS[this.pub.act]);
    this.s.events.emit('guestSeen', key);
    const spr = this.s.add.sprite(this.ox + DOOR.x, DOOR.y, key, 4).setOrigin(0.5, 1).setDepth(DOOR.y);
    this.objs.push(spr);
    this.s.events.emit('pubObj', spr);
    const path = [
      { x: DOOR.x, y: seat.aisle },
      { x: seat.x, y: seat.aisle },
      { x: seat.x, y: seat.y },
    ];
    this.guests.push({ spr, path, seat, sitT: this.rnd.realInRange(8, 20), leaving: false, t: 0, tipped: false });
  }

  private walk(g: Guest, dt: number) {
    g.t += dt;
    const sp = g.spr;
    const tgt = g.path[0];
    if (!tgt) {
      // sedí
      if (!g.leaving && g.seat) {
        sp.setFrame(12).setFlipX(g.seat.flip);
        g.sitT -= dt;
        // po chvíli dostane pivo na stůl (v krčmě krev, u Žabáka bahno – zatím stejný půllitr)
        g.sat = (g.sat ?? 0) + dt;
        // nejdřív si objedná (bublina nad hlavou), pak mu přinesou pivo nebo jídlo
        const food = this.isFood(g);
        // objedná si hned po usednutí a pak znovu, pokud ještě chvíli sedí (každá objednávka = nové spropitné)
        const again = !g.order && g.mug && g.next !== undefined && g.sat >= g.next && g.sitT > 6;
        if ((!g.order && !g.mug && g.sat < 0.2) || again) {
          g.orderAt = g.sat;
          g.tipped = false;
          registerBubble(this.s);
          const bx = sp.x + 1, by = sp.y - 15;
          const b = this.s.add.image(bx, by, 'orderBubble').setOrigin(0.3, 1).setDepth(sp.y + 50);
          const ic = this.s.add.image(bx + 4, by - 11, 'obj', food ? FOOD[this.pub.act] : 'mug').setOrigin(0.5, 0.5).setDepth(sp.y + 51);
          // ikona v celé velikosti, jen větší jídlo se zmenší na polovinu (celé pixely, žádné rozmazání)
          if (ic.width > 14 || ic.height > 12) ic.setScale(0.5);
          g.order = [b, ic];
          g.order.forEach((o) => {
            this.objs.push(o);
            this.s.events.emit('pubObj', o);
          });
          // vyskočí a pak se pomalu pohupuje
          b.setScale(0);
          const icS = ic.scale;
          ic.setScale(0);
          this.s.tweens.add({ targets: b, scale: 1, duration: 220, ease: 'Back.out' });
          this.s.tweens.add({ targets: ic, scale: icS, duration: 220, delay: 60, ease: 'Back.out' });
          this.s.tweens.add({ targets: g.order, y: '-=2', yoyo: true, repeat: -1, duration: 700, delay: 250, ease: 'Sine.inOut' });
        }
        // bublina vydrží 6 s, pak se obslouží sama (ťuknutím hned)
        // (v návodu „ťukni na bublinu“ bublina počká, než na ni hráč ťukne)
        if (g.order && g.sat - (g.orderAt ?? 0) > 6 && !this.hold) this.serve(g);
        // pivo nosí číšníci (přes den, když nějaké má); jídlo a noc jako dřív
        if (!g.mug && !g.order && g.sat > 0.5 && !this.carried(food)) {
          g.mug = this.s.add.image(sp.x + (g.seat.flip ? -13 : 13), sp.y - 6, 'obj', food ? FOOD[this.pub.act] : g.sitT > 6 ? 'mug' : 'mugDark').setOrigin(0.5, 1).setDepth(sp.y + 4);
          this.objs.push(g.mug);
          this.s.events.emit('pubObj', g.mug);
        }
        if (g.sitT <= 0) {
          g.leaving = true;
          g.order?.forEach((o) => o.destroy());
          g.order = undefined;
          g.tipped = true;
          g.mug?.setFrame('mugEmpty');
          g.path = [{ x: g.seat.x, y: g.seat.aisle }, { x: DOOR.x, y: g.seat.aisle }, { x: DOOR.x, y: DOOR.y + 6 }];
        }
        return;
      }
      // odešel
      if (g.seat) g.seat.taken = false;
      g.mug?.destroy();
      g.order?.forEach((o) => o.destroy());
      sp.destroy();
      this.guests.splice(this.guests.indexOf(g), 1);
      return;
    }
    const x = sp.x - this.ox;
    const dx = tgt.x - x, dy = tgt.y - sp.y;
    const d = Math.hypot(dx, dy);
    const step = 34 * dt;
    if (d <= step) {
      sp.setPosition(this.ox + tgt.x, tgt.y);
      g.path.shift();
    } else {
      sp.setPosition(sp.x + (dx / d) * step, sp.y + (dy / d) * step);
    }
    const f = Math.floor(g.t * 8) % 4;
    if (Math.abs(dx) > Math.abs(dy)) sp.setFrame(8 + f).setFlipX(dx < 0);
    else sp.setFrame((dy < 0 ? 4 : 0) + f).setFlipX(false);
    sp.setDepth(sp.y);
  }
}
