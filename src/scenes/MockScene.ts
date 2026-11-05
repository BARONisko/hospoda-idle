import Phaser from 'phaser';
import { renderPubBackground } from '../gfx';
import { PAL } from '../data/palette';
import { txt } from '../ui/font';

// DOČASNÉ: tři návrhy rozložení obrazovky (část 2) – spouští se přes ?mock=a|b|c, jen pro screenshoty.
const W = 540;
const H = 960;
const T = 16;
const col = (k: keyof typeof PAL) => Phaser.Display.Color.HexStringToColor(PAL[k]).color;

/** vybavená hospoda: pípy, kasa, kamna, dveře do sklepa, stoly se židlemi, hosté, hostinský, kostlivci */
function furnish(s: Phaser.Scene) {
  const o: Phaser.GameObjects.GameObject[] = [];
  const add = <G extends Phaser.GameObjects.GameObject>(g: G) => (o.push(g), g);
  add(s.add.image(0, 0, renderPubBackground(s, 1, 1)).setOrigin(0));
  add(s.add.image(12 * T + 8, 2 * T + 16, 'obj', 'cellarDoor').setOrigin(0.5, 1));
  add(s.add.image(3 * T + 8, 5 * T + 6, 'obj', 'tap').setOrigin(0.5, 1).setDepth(90));
  add(s.add.image(6 * T + 8, 5 * T + 6, 'obj', 'tap2').setOrigin(0.5, 1).setDepth(90));
  add(s.add.image(8 * T + 8, 5 * T + 9, 'obj', 'register').setOrigin(0.5, 1).setDepth(90));
  add(s.add.image(11 * T + 8, 3 * T + 15, 'obj', 'stove0').setOrigin(0.5, 1).setDepth(3 * T + 10));
  add(s.add.image(1 * T + 8, 3 * T + 15, 'obj', 'kegRack').setOrigin(0.5, 1).setDepth(3 * T + 10));
  add(s.add.image(16 * T + 8, 1 * T + 14, 'obj', 'clock').setOrigin(0.5, 1));
  add(s.add.image(5 * T, 1 * T + 14, 'obj', 'poster').setOrigin(0.5, 1));
  add(s.add.image(1 * T + 8, 6 * T + 15, 'obj', 'plant').setOrigin(0.5, 1).setDepth(6 * T + 10));
  // hostinský u pípy, kostlivci u kamen a ve dveřích sklepa
  add(s.add.sprite(3 * T + 8, 4 * T + 10, 'player', 0).setOrigin(0.5, 1).setDepth(4 * T));
  add(s.add.sprite(11 * T + 8, 4 * T + 12, 'skeleton', 4).setOrigin(0.5, 1).setDepth(4 * T + 12));
  add(s.add.sprite(13 * T + 8, 3 * T + 12, 'skeleton', 13).setOrigin(0.5, 1).setDepth(3 * T + 12));
  // stoly
  const tables = [[3, 8], [8, 8], [13, 8], [3, 11], [8, 11], [13, 11]];
  let g = 0;
  for (const [tx, ty] of tables) {
    add(s.add.image(tx * T + 16, ty * T + 14, 'obj', 'table').setOrigin(0.5, 1).setDepth(ty * T + 10));
    add(s.add.image(tx * T - 8, ty * T + 15, 'obj', 'chairL').setOrigin(0.5, 1).setDepth(ty * T + 2));
    add(s.add.image(tx * T + 40, ty * T + 15, 'obj', 'chairR').setOrigin(0.5, 1).setDepth(ty * T + 2));
    if (g % 3 !== 2) add(s.add.sprite(tx * T - 8, ty * T + 12, `guest${g % 12}`, 12).setOrigin(0.5, 1).setDepth(ty * T + 6));
    if (g % 2 === 0) add(s.add.sprite(tx * T + 40, ty * T + 12, `guest${(g + 5) % 12}`, 12).setOrigin(0.5, 1).setFlipX(true).setDepth(ty * T + 6));
    add(s.add.image(tx * T + 12, ty * T + 4, 'obj', 'mug').setOrigin(0.5, 1).setDepth(ty * T + 11));
    g++;
  }
  // host u pultu čeká
  add(s.add.sprite(5 * T + 8, 7 * T, 'guest7', 4).setOrigin(0.5, 1).setDepth(7 * T));
  return o;
}

function panel(s: Phaser.Scene, x: number, y: number, w: number, h: number, a = 0.92) {
  const g = s.add.graphics();
  g.fillStyle(col('ink'), a).fillRoundedRect(x, y, w, h, 10);
  g.lineStyle(2, col('olive')).strokeRoundedRect(x, y, w, h, 10);
  return g;
}

function button(s: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, c: keyof typeof PAL = 'green', size = 22) {
  const g = s.add.graphics();
  g.fillStyle(col('ink')).fillRoundedRect(x, y + 4, w, h, 9);
  g.fillStyle(col(c)).fillRoundedRect(x, y, w, h, 9);
  g.fillStyle(0xffffff, 0.15).fillRoundedRect(x + 3, y + 3, w - 6, h / 3, 6);
  const t = s.add.text(x + w / 2, y + h / 2, label, txt(size, PAL.white)).setOrigin(0.5).setAlign('center');
  return [g, t];
}

function topBar(s: Phaser.Scene, h = 84) {
  const g = s.add.graphics();
  g.fillStyle(col('dusk')).fillRect(0, 0, W, h);
  g.fillStyle(col('gold')).fillRect(0, h - 3, W, 3);
  s.add.image(40, h / 2 - 4, 'obj', 'coin').setScale(4);
  s.add.text(76, 14, '12,4K coins', txt(40, PAL.gold));
  s.add.text(78, 52, '+356 / s', txt(22, PAL.mint));
  button(s, W - 128, 18, 112, 46, 'Krígly 3', 'plum', 20);
}

function tabBar(s: Phaser.Scene, active = 0) {
  const y = H - 88;
  const g = s.add.graphics();
  g.fillStyle(col('dusk')).fillRect(0, y, W, 88);
  g.fillStyle(col('gold')).fillRect(0, y, W, 3);
  const tabs = ['Hospoda', 'Vylepšení', 'Personál', 'Obchod'];
  tabs.forEach((t, i) => {
    const x = 8 + i * 133;
    if (i === active) g.fillStyle(col('olive')).fillRoundedRect(x, y + 10, 124, 68, 10);
    s.add.text(x + 62, y + 44, t, txt(22, i === active ? PAL.gold : PAL.bone)).setOrigin(0.5);
  });
}

function stationCard(s: Phaser.Scene, y: number, name: string, lvl: string, gain: string, prog: number, cost: string, auto: boolean) {
  panel(s, 12, y, W - 24, 108);
  s.add.text(28, y + 10, name, txt(28, PAL.bone));
  s.add.text(28, y + 42, lvl, txt(20, PAL.fog));
  const g = s.add.graphics();
  g.fillStyle(col('dusk')).fillRoundedRect(28, y + 72, 270, 18, 6);
  g.fillStyle(col(auto ? 'mint' : 'amber')).fillRoundedRect(28, y + 72, 270 * prog, 18, 6);
  s.add.text(163, y + 81, gain, txt(16, PAL.white)).setOrigin(0.5);
  button(s, W - 214, y + 14, 186, 56, `+1\n${cost}`, 'green', 22);
  s.add.text(W - 121, y + 86, auto ? 'kostlivec ✓' : 'kostlivec 2,5K', txt(16, auto ? PAL.mint : PAL.fog)).setOrigin(0.5);
}

/** A: výhled do hospody nahoře, karty stanic pod ním, záložky dole */
function mockA(s: Phaser.Scene) {
  const view = furnish(s);
  const cam = s.cameras.main;
  cam.setViewport(0, 84, W, 380).setZoom(2).centerOn(150, 120);
  const ui = s.cameras.add(0, 0, W, H);
  ui.ignore(view);
  const before = s.children.list.length;
  topBar(s);
  const pg = s.add.graphics();
  pg.fillStyle(col('dusk')).fillRect(0, 464, W, H - 464);
  pg.fillStyle(col('gold')).fillRect(0, 464, W, 3);
  s.add.text(W / 2, 486, '×1   ×10   ×100   MAX', txt(22, PAL.gold)).setOrigin(0.5);
  stationCard(s, 506, 'Pípa', 'úroveň 42', '+168 / 1,5 s', 0.6, '1,2K', true);
  stationCard(s, 620, 'Kuchyně', 'úroveň 12', '+768 / 4 s', 0.3, '4,1K', true);
  stationCard(s, 734, 'Sklep se sudy', 'úroveň 3', '+210 / 9 s', 0.8, '1,1K', false);
  tabBar(s);
  cam.ignore(s.children.list.slice(before));
}

/** B: hospoda přes celou obrazovku (větší zoom), stanice ovládané bublinami přímo ve hře */
function mockB(s: Phaser.Scene) {
  const view = furnish(s);
  const cam = s.cameras.main;
  cam.setViewport(0, 84, W, H - 84 - 88).setZoom(2.6).centerOn(124, 128);
  const ui = s.cameras.add(0, 0, W, H);
  ui.ignore(view);
  const before = s.children.list.length;
  topBar(s);
  // bubliny nad stanicemi (souřadnice obrazovky)
  const bubble = (x: number, y: number, name: string, lvl: string, cost: string, c: keyof typeof PAL = 'green') => {
    panel(s, x - 80, y - 4, 160, 92, 0.88);
    s.add.text(x, y + 14, `${name}  ${lvl}`, txt(20, PAL.bone)).setOrigin(0.5);
    button(s, x - 66, y + 34, 132, 42, `▲ ${cost}`, c, 20);
  };
  bubble(150, 110, 'Pípa', '42', '1,2K');
  bubble(370, 110, 'Kuchyně', '12', '4,1K');
  bubble(440, 440, 'Sklep', '3', '1,1K', 'slate');
  // ťukací hint
  s.add.text(W / 2, 760, 'ťukni na hosta = spropitné', txt(22, PAL.gold)).setOrigin(0.5);
  tabBar(s);
  cam.ignore(s.children.list.slice(before));
}

/** C: patra pod sebou – každá stanice má svůj „pruh“ hospody, dolů se jde hlouběji do sklepa */
function mockC(s: Phaser.Scene) {
  const view = furnish(s);
  const cams: Phaser.Cameras.Scene2D.Camera[] = [];
  const strips: [string, string, string, number, number, number, keyof typeof PAL][] = [
    ['Pípa', 'úr. 42', '1,2K', 70, 70, 0.6, 'green'],
    ['Kuchyně', 'úr. 12', '4,1K', 180, 58, 0.3, 'green'],
    ['Sklep se sudy', 'úr. 3', '1,1K', 208, 52, 0.8, 'green'],
    ['Kostky v rohu', 'zavřeno', '8,6K', 140, 168, 0, 'slate'],
  ];
  const y0 = 92, sh = 180;
  strips.forEach(([, , , cx, cy], i) => {
    const c = s.cameras.add(0, y0 + i * sh, 330, sh - 12).setZoom(2.4).centerOn(cx, cy);
    c.setBackgroundColor(PAL.ink);
    cams.push(c);
  });
  s.cameras.main.setVisible(false);
  const ui = s.cameras.add(0, 0, W, H);
  ui.ignore(view);
  const before = s.children.list.length;
  topBar(s, 84);
  const bg = s.add.graphics();
  bg.fillStyle(col('dusk')).fillRect(330, 84, W - 330, H - 84 - 88);
  strips.forEach(([name, lvl, cost, , , prog, c], i) => {
    const y = y0 + i * sh;
    bg.fillStyle(col('olive')).fillRect(0, y + sh - 12, W, 12);
    s.add.text(344, y + 6, name, txt(24, PAL.bone));
    s.add.text(344, y + 34, lvl, txt(18, PAL.fog));
    const g = s.add.graphics();
    g.fillStyle(col('ink')).fillRoundedRect(344, y + 60, 180, 14, 5);
    g.fillStyle(col('mint')).fillRoundedRect(344, y + 60, 180 * prog, 14, 5);
    button(s, 344, y + 86, 180, 66, `▲ ${cost}`, c, 24);
  });
  s.add.text(165, H - 104, '▼ hlouběji do sklepa ▼', txt(18, PAL.gold)).setOrigin(0.5);
  tabBar(s);
  cams.forEach((c) => c.ignore(s.children.list.slice(before)));
}

export class MockScene extends Phaser.Scene {
  constructor() {
    super('Mock');
  }
  create(data: { v: string }) {
    ({ a: mockA, b: mockB, c: mockC } as Record<string, (s: Phaser.Scene) => void>)[data.v]?.(this);
  }
}
