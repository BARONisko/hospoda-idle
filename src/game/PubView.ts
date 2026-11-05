import Phaser from 'phaser';
import { renderPubBackground } from '../gfx';
import { PUB } from '../data/maps';
import { PAL } from '../data/palette';
import { txt } from '../ui/font';
import { big } from '../core/num';
import type { PubState } from '../core/save';

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
}

export class PubView {
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
    this.keeper = add(s.add.sprite(ox + SPOT.tap.x, SPOT.tap.y, pub.act === 3 ? 'zabak' : 'player', 0).setOrigin(0.5, 1).setDepth(SPOT.tap.y));
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
    this.cam = s.cameras.add(0, 0, 10, 10).setBackgroundColor(PAL.ink);
    this.cam.roundPixels = true;
    this.refresh();
  }

  /** umístí kameru: výřez obrazovky + co ve hospodě ukázat */
  frame(x: number, y: number, w: number, h: number, cy = 112) {
    const zoom = w / (17 * T); // šířka interiéru (sloupce 0–16) přes celou šířku výřezu
    this.cam.setViewport(x, y, w, h).setZoom(zoom);
    const halfH = h / zoom / 2;
    this.cam.centerOn(this.ox + 8.5 * T, Phaser.Math.Clamp(cy, halfH, 14 * T - halfH));
  }

  /** stanice se otevřela/najala obsluhu → ukázat vybavení a kostlivce */
  refresh() {
    const st = this.pub.st;
    for (const [id, list] of Object.entries(this.props)) list.forEach((o) => o.setVisible((st[id]?.lvl ?? 0) > 0));
    for (const id of ['kitchen', 'cellar', 'dice']) {
      const on = id === 'dice' ? (st[id]?.lvl ?? 0) > 0 : !!st[id]?.auto;
      if (on && !this.staff[id]) {
        const p = SPOT[id];
        const spr = this.s.add.sprite(this.ox + p.x, p.y, 'skeleton', id === 'dice' ? 12 : 4).setOrigin(0.5, 1).setDepth(p.y + 1);
        this.objs.push(spr);
        this.staff[id] = spr;
        this.s.events.emit('pubObj', spr);
      }
    }
  }

  /** výdělek stanice → animace a „+coins“ */
  payout(id: string, amount: number) {
    const p = SPOT[id];
    if (id === 'tap') this.pourT = 0.5;
    const sk = this.staff[id];
    if (sk) this.s.tweens.add({ targets: sk, y: p.y - 3, yoyo: true, duration: 120 });
    this.pop(p.x, p.y - 22, '+' + big(amount), PAL.gold);
  }

  pop(x: number, y: number, text: string, color: string) {
    const tx = this.s.add.text(this.ox + x, y, text, txt(10, color)).setOrigin(0.5).setDepth(5000).setResolution(3);
    this.s.events.emit('pubObj', tx);
    this.s.tweens.add({ targets: tx, y: y - 18, alpha: 0, duration: 1000, onComplete: () => tx.destroy() });
  }

  /** ťuknutí do hospody: host = spropitné (vrací true, když se trefil) */
  tap(wx: number, wy: number): boolean {
    for (const g of this.guests) {
      if (g.tipped) continue;
      const b = g.spr.getBounds();
      if (Phaser.Geom.Rectangle.Contains(Phaser.Geom.Rectangle.Inflate(b, 4, 4), wx, wy)) {
        g.tipped = true;
        this.s.tweens.add({ targets: g.spr, y: g.spr.y - 4, yoyo: true, duration: 100 });
        return true;
      }
    }
    return false;
  }

  tipPop(text: string) {
    // poslední trefený host
    const g = [...this.guests].reverse().find((q) => q.tipped);
    if (g) this.pop(g.spr.x - this.ox, g.spr.y - 26, text, PAL.mint);
  }

  update(dt: number, busy: number) {
    // hosté: čím víc otevřených stanic, tím víc lidí
    this.spawnT -= dt;
    const want = Math.min(this.seats.length - 1, 3 + busy * 2);
    if (this.spawnT <= 0) {
      this.spawnT = this.rnd.realInRange(1.2, 3.5);
      if (this.guests.length < want) this.spawn();
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
    const key = this.rnd.pick(GUESTS[this.pub.act]);
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
        if (!g.mug && g.t > 1.2) {
          g.mug = this.s.add.image(sp.x + (g.seat.flip ? -13 : 13), sp.y - 6, 'obj', g.sitT > 6 ? 'mug' : 'mugDark').setOrigin(0.5, 1).setDepth(sp.y + 4);
          this.objs.push(g.mug);
        }
        if (g.sitT <= 0) {
          g.leaving = true;
          g.tipped = true;
          g.mug?.setFrame('mugEmpty');
          g.path = [{ x: g.seat.x, y: g.seat.aisle }, { x: DOOR.x, y: g.seat.aisle }, { x: DOOR.x, y: DOOR.y + 6 }];
        }
        return;
      }
      // odešel
      if (g.seat) g.seat.taken = false;
      g.mug?.destroy();
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
