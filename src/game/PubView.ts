import Phaser from 'phaser';
import { renderPubBackground } from '../gfx';
import { PUB } from '../data/maps';
import { PAL } from '../data/palette';
import { txt } from '../ui/font';
import { big } from '../core/num';
import type { PubState } from '../core/save';
import { season, SEASONS } from '../core/season';
import { registerBubble } from './bubbleArt';

// Jedna živá hospoda: pozadí podle dějství, vybavení, hostinský, kostlivci u stanic, hosté chodí, sedí a odcházejí.
// Každá hospoda leží ve světě scény na vlastním místě (ox) a má vlastní kameru.
const T = 16;
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
}

/** přes den má každá hospoda své hosty, v noci chodí do všech kostlivci */
const NIGHT_GUESTS = ['skeleton'];

/** jídlo podle hospody (objednávky hostů) */
const FOOD: Record<number, string> = { 1: 'dGoulash', 2: 'dKnee', 3: 'dFried', 4: 'dSmoked' };

/** vybavení, které přibude s úrovní stanice */
const LEVEL_DECOR: { id: string; lvl: number; frame: string; x: number; y: number }[] = [
  { id: 'tap', lvl: 25, frame: 'keg', x: 5 * T + 2, y: 4 * T + 10 },
  { id: 'tap', lvl: 100, frame: 'kegGold', x: 6 * T + 4, y: 4 * T + 10 },
  { id: 'kitchen', lvl: 25, frame: 'kOven', x: 13 * T + 8, y: 4 * T + 12 },
  { id: 'cellar', lvl: 25, frame: 'barrels', x: 2 * T + 12, y: 3 * T + 15 },
  { id: 'dice', lvl: 25, frame: 'trophy', x: 15 * T + 8, y: 2 * T + 14 },
  { id: 'dice', lvl: 100, frame: 'jukebox0', x: 15 * T + 4, y: 13 * T + 8 },
];

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
  private staff: Record<string, Phaser.GameObjects.Sprite> = {};
  private props: Record<string, Phaser.GameObjects.Image[]> = {};
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
    img(3 * T + 8, 5 * T + 6, 'tap', 5 * T + 6);
    img(6 * T + 8, 5 * T + 6, 'tap2', 5 * T + 6);
    img(PUB.register.x * T + 8, PUB.register.y * T + 9, 'register', 5 * T + 6);
    img(PUB.plant.x * T + 8, PUB.plant.y * T + 15, 'plant', PUB.plant.y * T + 15);
    this.props.kitchen = [img(PUB.stove.x * T + 8, PUB.stove.y * T + 15, 'stove0', PUB.stove.y * T + 15)];
    this.props.cellar = [img(1 * T + 8, 3 * T + 15, 'kegRack', 3 * T + 15)];
    for (const tb of TABLES) {
      img(tb.x * T + 16, tb.y * T + 14, 'table', tb.y * T + 14);
      img(tb.x * T - 8, tb.y * T + 15, 'chairL', tb.y * T + 2);
      img(tb.x * T + 40, tb.y * T + 15, 'chairR', tb.y * T + 2);
      const aisle = tb.y * T + 30;
      this.seats.push({ x: tb.x * T - 8, y: tb.y * T + 12, flip: false, aisle, taken: false });
      this.seats.push({ x: tb.x * T + 40, y: tb.y * T + 12, flip: true, aisle, taken: false });
    }
    // kostky: rezervované místo pro kostlivce s kostkami
    this.seats.find((st) => st.x === SPOT.dice.x && st.y === SPOT.dice.y)!.taken = true;
    this.keeper = add(s.add.sprite(ox + SPOT.tap.x, SPOT.tap.y, pub.act === 3 ? 'zabak' : pub.act === 4 ? 'cultist4' : 'player', 0).setOrigin(0.5, 1).setDepth(SPOT.tap.y));
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
    this.cam.centerOn(this.ox + 8.5 * T, Phaser.Math.Clamp(cy, halfH, 14 * T - halfH));
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
    this.cam.centerOn(this.ox + 8.5 * T, c + ((y0 + y1) / 2 - (y + h / 2)) / zoom);
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

  /** kostlivec u stanice nestojí jako socha: přejde kousek vedle, chvíli „pracuje“ (ruce nahoře) a zase zpátky */
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

  /** kostlivec obsluhy jde po bodech (relativně k hospodě), na konci zavolá done */
  private staffPath(spr: Phaser.GameObjects.Sprite, pts: { x: number; y: number }[], done: () => void) {
    const p = pts.shift();
    if (!p || !spr.active) return done();
    const tx = this.ox + p.x, dx = tx - spr.x, dy = p.y - spr.y;
    const dist = Math.hypot(dx, dy);
    let f = 0;
    this.s.tweens.add({
      targets: spr,
      x: tx,
      y: p.y,
      duration: Math.max(60, (dist / 40) * 1000),
      onUpdate: () => {
        const a = Math.floor(f++ / 6) % 4;
        if (Math.abs(dx) > Math.abs(dy)) spr.setFrame(8 + a).setFlipX(dx < 0);
        else spr.setFrame((dy < 0 ? 4 : 0) + a).setFlipX(false);
        spr.setDepth(spr.y + 1);
      },
      onComplete: () => this.staffPath(spr, pts, done),
    });
  }

  /** obsluha má smysl: kuchař-kostlivec donese jídlo sedícímu hostovi, sklepník přinese sud k pípě */
  private staffTrip(id: string) {
    const spr = this.staff[id];
    if (!spr?.active || spr.getData('busy') || !this.cam.visible) return;
    const home = SPOT[id];
    let there: { x: number; y: number }[];
    let item: string;
    if (id === 'kitchen') {
      const g = this.rnd.pick(this.guests.filter((q) => q.seat && !q.leaving && !q.path.length) ?? []);
      if (!g?.seat) return;
      there = [{ x: home.x, y: g.seat.aisle }, { x: g.seat.x, y: g.seat.aisle }];
      item = FOOD[this.pub.act];
    } else if (id === 'cellar') {
      there = [{ x: home.x, y: SPOT.tap.y }, { x: SPOT.tap.x + 20, y: SPOT.tap.y }];
      item = 'keg';
    } else return;
    spr.setData('busy', true);
    this.s.tweens.killTweensOf(spr);
    const carry = this.s.add.image(spr.x, spr.y - 22, 'obj', item).setOrigin(0.5, 1);
    if (carry.width > 14 || carry.height > 14) carry.setScale(0.6);
    this.objs.push(carry);
    this.s.events.emit('pubObj', carry);
    const follow = () => {
      if (!carry.active || !spr.active) return void this.s.events.off('update', follow);
      carry.setPosition(spr.x, spr.y - 22).setDepth(spr.y + 2);
    };
    this.s.events.on('update', follow);
    const back = [...there].reverse().slice(1).concat([{ x: home.x, y: home.y }]);
    this.staffPath(spr, there, () => {
      spr.setFrame(13);
      this.s.time.delayedCall(500, () => {
        carry.destroy();
        this.staffPath(spr, back, () => {
          this.s.events.off('update', follow);
          spr.setFlipX(false).setFrame(4).setDepth(home.y + 1).setData('busy', false);
        });
      });
    });
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

  /** stanice se otevřela/najala obsluhu → ukázat vybavení a kostlivce */
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
    for (const [id, list] of Object.entries(this.props)) list.forEach((o) => o.setVisible((st[id]?.lvl ?? 0) > 0));
    for (const id of ['kitchen', 'cellar', 'dice']) {
      const on = id === 'dice' ? (st[id]?.lvl ?? 0) > 0 : !!st[id]?.auto;
      if (on && !this.staff[id]) {
        const p = SPOT[id];
        const spr = this.s.add.sprite(this.ox + p.x, p.y, 'skeleton', id === 'dice' ? 12 : 4).setOrigin(0.5, 1).setDepth(p.y + 1);
        this.objs.push(spr);
        this.staff[id] = spr;
        this.s.events.emit('pubObj', spr);
        if (id !== 'dice') this.staffWork(spr, this.ox + p.x);
      }
    }
  }

  /** výdělek stanice → animace a „+coins“ */
  payout(id: string, amount: number, bones = false) {
    const p = SPOT[id];
    if (id === 'tap') this.pourT = 0.5;
    const sk = this.staff[id];
    if (sk && !sk.getData('busy')) {
      // občas (ne každý cyklus) obsluha opravdu něco donese
      if (this.rnd.frac() < 0.35) this.staffTrip(id);
      else this.s.tweens.add({ targets: sk, y: p.y - 3, yoyo: true, duration: 120 });
    }
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
    for (const g of this.guests) {
      if (g.tipped || g.leaving) continue;
      if (Phaser.Geom.Rectangle.Contains(Phaser.Geom.Rectangle.Inflate(g.spr.getBounds(), 6, 6), wx, wy)) return this.tipGuest(g);
    }
    return false;
  }

  /** host dá spropitné; bublina hned zmizí (obslouženo). Bublina dá spropitné vždy. */
  private tipGuest(g: Guest) {
    g.tipped = true;
    this.last = g;
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

  /** kam na obrazovce ukázat návodem „ťukni na hosta“: hlava sedícího hosta, který ještě nedal spropitné */
  tipTarget(): { x: number; y: number } | null {
    const g = this.guests.find((q) => !q.tipped && !q.leaving && !q.path.length) ?? this.guests.find((q) => !q.tipped && !q.leaving);
    if (!g || !this.cam.visible) return null;
    const b = g.spr.getBounds();
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
    // kostlivec s kostkami pohupuje
    const dice = this.staff.dice;
    if (dice) dice.setFrame(12);
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
        const food = (g.spr.x * 7 + g.spr.y) % 3 === 0;
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
        if (g.order && g.sat - (g.orderAt ?? 0) > 6) this.serve(g);
        if (!g.mug && !g.order && g.sat > 0.5) {
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
