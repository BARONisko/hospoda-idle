// Nápověda „Jak to funguje“ v Nastavení (přání uživatele: „dej do nastavení i informace ohledně různých věcí ve hře“).
// Posuvný seznam témat → ťuknutí = krátké vysvětlení (2–5 vět). Části menu, které se teprve odemknou, ukážou jen
// „Odemkne se po N. hygieně.“ (nic neprozradí dopředu). Kreslí PubScene.helpTab přes HelpUI (tlačítka ve stylu hry).
import Phaser from 'phaser';
import { t } from '../i18n';
import { PAL } from '../data/palette';
import { txt } from './font';
import { big } from '../core/num';
import { collHire } from '../core/collector';
import { sfx } from '../core/sfx';

/** po kolikáté hygieně se odemkne dlaždice menu (jediný zdroj pro PubScene.tileLock i nápovědu) */
export const MENU_HYG: Record<string, number> = { krigl: 1, brew: 3, temple: 6, decor: 10, darts: 15, league: 20 };

export interface HelpTopic {
  title: string;
  /** ikona: [atlas, snímek], nebo znak (💎) */
  icon: [string, string] | string;
  text: string;
  /** dlaždice menu (klíč tileLock): dokud je zamčená, ukáže se jen věta „Odemkne se …“ */
  lock?: string;
}

/** témata v pořadí, jak je hráč během hry potkává */
export const HELP: HelpTopic[] = [
  {
    title: t('Coins a výdělek'),
    icon: ['obj', 'coin'],
    text: t('Coins jsou hlavní peníze hry. Vydělávají je stanice v hospodě a hosté k tomu přidávají spropitné. Za coins kupuješ úrovně stanic, obsluhu a v Obchodě vylepšení, která výdělek stanice ztrojnásobí. Každá další hospoda vydělává mnohem víc než ta předchozí.'),
  },
  {
    title: t('Stanice a úrovně'),
    icon: ['obj', 'tap'],
    text: t('Pípa, kuchyně, sklep a kostky jsou stanice – každá vydělává coins pořád dokola. Bez obsluhy ji spustíš ťuknutím, s obsluhou běží sama. Každá úroveň přidá výdělek a stojí víc než ta předchozí; na milnících 25, 50, 100, 200… úrovní se výdělek stanice zdvojnásobí. Když stanici během jednoho kola dotáhneš hodně vysoko, dostane po hygieně hvězdu – bod do stromu hostinského.'),
  },
  {
    title: t('Číšníci a obsluha'),
    icon: ['icons', 'waiter'],
    text: t('Obsluha pracuje za tebe: stanice s obsluhou běží sama, i když nehraješ. Pípa točí pivo na bar a číšníci ho roznášejí ke stolům – coins vydělá až donesené pivo. Když číšníci nestíhají, bar se zaplní a pípa stojí; pomůže další číšník nebo jejich vylepšení. Za zkušenosti dostávají body na rychlost, podnos a úsměv (spropitné) a zůstávají i po hygieně.'),
  },
  {
    title: t('Hosté, bubliny a události'),
    icon: ['obj', 'bubble'],
    text: t('Když si host objedná, objeví se nad ním bublina – ťukni na ni a dostaneš spropitné. Čas od času se v hospodě něco stane: zlatý sud, nájezd žab, netopýr nebo karaoke. Ťukej na ně a získáš odměnu. Rvačku rozežeň co nejdřív, jinak hosté utíkají a výdělek klesá. Z událostí může padnout i vzácný talisman.'),
  },
  {
    title: t('Výdělek offline a kasa'),
    icon: ['obj', 'register'],
    text: t('Když hru zavřeš, stanice s obsluhou vydělávají dál a po návratu si výdělek vybereš. Kasa ale pojme jen výdělek za omezenou dobu (zpočátku 8 hodin) – pak se už nic nepřičítá. Dobu prodloužíš Delším spánkem za krígly a dalšími vylepšeními. Čas, kdy byla noc, se připíše v kostech. Upozornění v Nastavení ti dají vědět, až bude kasa plná.'),
  },
  {
    title: t('Úkoly a denní truhla'),
    icon: ['icons', 'clipboard'],
    text: t('V Úkolech najdeš denní úkoly (odměna v coins), týdenní výzvu (talisman a krígly) a úspěchy (krígl za každý). Úkol od hostinského tě postupně provede celou hrou – tlačítko UKAŽ ukáže, kam ťuknout. Ve Speciální nabídce na tebe každý den čeká truhla zdarma; když nevynecháš ani den, sedmý den je zlatá truhla s 💎.'),
  },
  {
    title: t('Šťastná hodina a manažeři'),
    icon: ['obj', 'clock'],
    text: t('Jakmile otevřeš kuchyni, nabídne ti Obchod manažera hospody. Manažer má schopnost – v první hospodě Šťastnou hodinu: ťukni na její ceduli v hospodě a výdělek bude chvíli trojnásobný. Pak se schopnost několik minut nabíjí. Po hygieně manažeři odejdou, pokud si za krígly nekoupíš Věrné manažery.'),
  },
  {
    title: t('Den a noc, kosti'),
    icon: ['obj', 'sBone0'],
    text: t('Po několika minutách dne padne noc. V noci chodí příšery a platí kostmi – coins se vrátí až ráno. Kosti dávají stanice od 25. úrovně a ťuknutí na bublinu příšery. Utratíš je v Kostnici, za Sběrače, vylepšení talismanů a Delší noc; zůstávají i po hygieně.'),
  },
  {
    title: t('Hygiena a krígly'),
    icon: ['obj', 'krigl0'],
    text: t('Hygienu zavoláš v Obchodě. Zavře hospodu – coins, úrovně stanic a vylepšení začnou od nuly – a dá ti krígly: každý trvale zvýší výdělek. Čím víc v kole vyděláš, tím víc krígel dostaneš, a časem přibudou nové hospody. Krígly jde utratit v menu Krígly za trvalá vylepšení, utracené už ale bonus nedávají. Číšníci, kosti a výzdoba zůstávají.'),
  },
  {
    title: t('Návštěvníci a VIP host'),
    icon: ['obj', 'wanted'],
    text: t('Občas přijde zvláštní návštěvník – třeba hygienik, sládek nebo štamgast – a nabídne ti dvě možnosti: jistotu, nebo riziko. Vyber si sám; když z návštěvy nic nemáš, dostaneš aspoň 💎. Jednou za několik hodin přijde VIP host: obsluž ho ťuknutím, než odejde, a dostaneš velkou odměnu a 💎. Návštěvníky najdeš ve Sbírce.'),
  },
  {
    title: t('Diamanty'),
    icon: '💎',
    text: t('Diamanty jsou vzácná měna. Zdarma je dostaneš třeba za VIP hosta, zlatou truhlu, hygienu, každou 5. úroveň hostinského, výhru v lize nebo poraženého bosse v Chrámu; v mobilní aplikaci je jde i koupit. Utratíš je ve Speciální nabídce za okamžitý výdělek, trvalé pomocníky a vzhled hospody, nebo v lize. Bez nich se dá hrát úplně normálně.'),
  },
  {
    title: t('Sbírka'),
    icon: ['icons', 'book'],
    text: t('Ve Sbírce jsou všechny druhy hostů podle hospod, sezónní hosté a návštěvníci. Když obsluhuješ bubliny určitého druhu hostů, roste jejich věrnost a každá její úroveň je bod do stromu hostinského. Sezónní hosté chodí jen v určitou dobu roku.'),
  },
  {
    title: t('Kostnice a talismany'),
    icon: ['obj', 'dSkulls'],
    lock: 'bones',
    text: t('V Kostnici hodíš za kosti kostkou a náhodná vlastnost hospody se natrvalo o kousek zlepší. Talismany jsou vzácné nálezy z událostí, návštěv, týdenní výzvy, ligy i Chrámu – každý zvedá jednu vlastnost. Za kosti je můžeš dál vylepšovat. Kostnice i talismany zůstávají po hygieně.'),
  },
  {
    title: t('Sběrač'),
    icon: ['icons', 'tray'],
    lock: 'coll',
    text: t('Sběrač ťuká na bubliny hostů za tebe, takže spropitné chodí, i když se nedíváš. Kupuje se za kosti – do každé hospody jeden. Vylepšením bude rychlejší a vezme víc bublin naráz.'),
  },
  {
    title: t('Hostinský a mistrovství'),
    icon: ['obj', 'apronIcon'],
    lock: 'keeper',
    text: t('Hostinský sbírá zkušenosti za nákup úrovní, obsluhu bublin a další akce a za každou úroveň dostane bod. Body přidávají i mistrovství stanic, hvězdy stanic a věrní hosté. Utrácíš je ve stromu se třemi cestami – uzel jde koupit jen za už koupeným. Mistrovství roste samo: čím déle stanice běží s obsluhou (i offline), tím vyšší hodnost. Body jde za krígly nebo 💎 rozdat znovu.'),
  },
  {
    title: t('Pivovar'),
    icon: ['obj', 'fermenter'],
    lock: 'brew',
    text: t('Pivovar vaří pivo sám, i když nehraješ. Hotová piva prodáš za coins, vložíš do vylepšení pivovaru, nebo je utratíš za pivní akce – třeba Happy hour s dvojnásobným výdělkem. Vyšší úroveň vaří rychleji, má větší tank a dává trvalý bonus k výdělku, který zůstane i po hygieně. Když je tank plný, vaření stojí.'),
  },
  {
    title: t('Chrám'),
    icon: ['obj', 'dIdol1'],
    lock: 'temple',
    text: t('Chrám je otevřený jen o víkendu. Bojuješ s Cthulhu: ťuknutím na něj útočíš a tahem prstu sekáš chapadla, která ohrožují oltář. Každý den máš několik kol a boss má životy na celý víkend – za každý kus jeho životů dostaneš truhlu. Nasbíraná chapadla utrať v chrámovém obchodě, v pondělí totiž shnijí.'),
  },
  {
    title: t('Výzdoba'),
    icon: ['obj', 'plant'],
    lock: 'decor',
    text: t('Výzdoba jsou velmi drahé ozdoby hospody za coins. Každá dává trvalý bonus – třeba vyšší výdělek, delší výdělek offline nebo rychlejší stanice – a zůstane i po hygieně.'),
  },
  {
    title: t('Šipky'),
    icon: ['tourney', 'dartRed'],
    lock: 'darts',
    text: t('Šipky přibývají samy a házíš je ťuknutím na terč. Hraje se na nulu: body se odečítají a hod přes nulu se nepočítá. Každá dohraná hra dá bod na vylepšení – nejdřív se vyplatí automat, který hází za tebe. Některá vylepšení terče pomáhají celé hře. Když je toulec plný, nové šipky nepřibývají.'),
  },
  {
    title: t('Liga'),
    icon: ['obj', 'trophy'],
    lock: 'league',
    text: t('Každý týden soupeříš s jiným hospodským – vyhraje, kdo za týden víc vydělá. Výhra znamená postup do vyšší ligy a odměnu (krígly, 💎 a talisman), prohra sestup o ligu níž. Soupeř během týdne zrychluje, tak nepolevuj. Za 💎 si v lize můžeš pomoct.') + ' ' + t('Vítěz navíc získá Ligový pohár – výdělek +10 % za každou ligu po celý další týden.'),
  },
  {
    title: t('Ukládání a záloha'),
    icon: ['obj', 'note'],
    text: t('Hra se ukládá sama každých pár sekund a při odchodu. V mobilní aplikaci se postup navíc zálohuje přes zálohu Androidu do tvého Google účtu, takže po přeinstalaci nezmizí. Na webu je hra uložená v prohlížeči – v Nastavení si můžeš zálohu stáhnout do souboru (Uložit) a zase ji načíst (Nahrát). Začít znovu smaže celou hru.'),
  },
  {
    title: t('Statistiky a soukromí'),
    icon: ['icons', 'eye'],
    text: t('Hra posílá jen anonymní statistiky o hraní (třeba kolikátou hygienu máš) – žádné jméno ani e-mail. Pomáhají hru vylepšovat a v Nastavení je můžeš vypnout. Reklamy jsou jen dobrovolné, za odměnu. Podrobnosti najdeš v zásadách ochrany soukromí na stránce hry v Google Play.'),
  },
];

/** věta pro zamčené téma (klíč dlaždice menu jako v tileLock) */
export function helpLockText(key: string): string {
  const n = MENU_HYG[key];
  if (n) return t('Odemkne se po {n}. hygieně.', { n });
  if (key === 'coll') return t('Odemkne se po první noci, až budeš mít {n} kostí.', { n: big(collHire(0)) });
  if (key === 'keeper') return t('Odemkne se po {n}. hygieně.', { n: 2 });
  return t('Odemkne se po první noci.');
}

/** co nápověda potřebuje od scény */
export interface HelpUI {
  scene: Phaser.Scene;
  /** objekt patří k panelu (zavře se s ním) */
  add<T extends Phaser.GameObjects.GameObject>(o: T): T;
  /** tlačítko ve stylu hry */
  button(x: number, y: number, w: number, h: number, label: string, color: keyof typeof PAL, enabled: boolean, fn: () => void): void;
  /** je dlaždice menu ještě zamčená? */
  locked(key: string): boolean;
  /** překreslí panel: sel = téma, −1 = seznam */
  show(sel: number): void;
}

/** stav panelu (přežije překreslení): vybrané téma, posun seznamu, naposledy otevřené téma */
export const helpState = { sel: -1, scroll: 0, last: -1 };

const col = (k: keyof typeof PAL) => Phaser.Display.Color.HexStringToColor(PAL[k]).color;
/** výška řádku seznamu včetně mezery (78 log. px ≈ 58 CSS px – celý řádek je dotykové místo) */
const RH = 78;

function icon(ui: HelpUI, ic: HelpTopic['icon'], x: number, y: number, size: number, dim: boolean, D: number) {
  const s = ui.scene;
  if (typeof ic === 'string') {
    const tx = s.add.text(x, y, ic, { fontSize: `${Math.round(size * 0.8)}px` }).setOrigin(0.5).setDepth(D);
    if (dim) tx.setAlpha(0.35);
    return tx;
  }
  const im = s.add.image(x, y, ic[0], ic[1]).setDepth(D);
  im.setScale(Math.min(5, size / Math.max(im.width, im.height)));
  if (dim) im.setTintFill(col('slate'));
  return im;
}

/** panel nápovědy od `top` do `bottom` (šířka hry `W`) */
export function helpPanel(ui: HelpUI, top: number, bottom: number, W: number, D: number) {
  if (helpState.sel >= 0 && HELP[helpState.sel]) return topic(ui, helpState.sel, top, bottom, W, D);
  helpState.sel = -1;
  list(ui, top, bottom, W, D);
}

/** posuvný seznam témat (tažení prstem, kolečko myši; ťuknutí = téma) */
function list(ui: HelpUI, top: number, bottom: number, W: number, D: number) {
  const s = ui.scene, h = bottom - top, total = HELP.length * RH - 8;
  const max = Math.max(0, total - h);
  // naposledy otevřené téma zůstane po návratu vidět
  const L = helpState.last;
  if (L >= 0) helpState.scroll = Phaser.Math.Clamp(helpState.scroll, L * RH + RH - h, L * RH);
  helpState.scroll = Phaser.Math.Clamp(helpState.scroll, 0, max);
  const cont = ui.add(s.add.container(0, top - helpState.scroll).setDepth(D + 2));
  const mask = ui.add(s.make.graphics({}, false).fillRect(0, top, W, h));
  cont.setMask(mask.createGeometryMask());
  const g = s.add.graphics();
  cont.add(g);
  HELP.forEach((tp, i) => {
    const y = i * RH, rh = RH - 8, cy = y + rh / 2;
    const lock = !!tp.lock && ui.locked(tp.lock);
    g.fillStyle(col('ink'), lock ? 0.45 : 0.6).fillRoundedRect(10, y, W - 20, rh, 10);
    cont.add(icon(ui, tp.icon, 46, cy, 46, lock, 0));
    if (lock) cont.add(s.add.image(60, cy + 14, 'icons', 'lock').setScale(2));
    // písmo B (výběr uživatele): větší a světlé; zamčené šedé s větou „Odemkne se …“ pod názvem
    const maxW = W - 86 - (lock ? 30 : 60);
    const name = s.add.text(86, lock ? y + 6 : cy, tp.title, txt(lock ? 24 : 26, lock ? PAL.fog : PAL.white)).setOrigin(0, lock ? 0 : 0.5);
    name.setScale(Math.min(1, maxW / name.width));
    cont.add(name);
    if (lock) {
      const sub = s.add.text(86, y + 38, helpLockText(tp.lock!), txt(17, PAL.fog));
      sub.setScale(Math.min(1, maxW / sub.width));
      cont.add(sub);
    } else {
      // šipka „otevřít“ (kreslená – písmo nemusí mít znak ›)
      const ax = W - 40;
      g.fillStyle(col('ink')).fillTriangle(ax - 8, cy - 13, ax + 10, cy, ax - 8, cy + 13);
      g.fillStyle(col('gold')).fillTriangle(ax - 6, cy - 9, ax + 6, cy, ax - 6, cy + 9);
    }
  });
  // posuvník vpravo (jen když se seznam nevejde)
  const bar = ui.add(s.add.graphics().setDepth(D + 3));
  const drawBar = () => {
    bar.clear();
    if (!max) return;
    const bh = Math.max(40, (h * h) / total), by = top + (helpState.scroll / max) * (h - bh);
    bar.fillStyle(col('ink'), 0.6).fillRoundedRect(W - 8, top, 6, h, 3).fillStyle(col('gold')).fillRoundedRect(W - 8, by, 6, bh, 3);
  };
  drawBar();
  const setScroll = (v: number) => {
    helpState.scroll = Phaser.Math.Clamp(v, 0, max);
    cont.y = top - helpState.scroll;
    drawBar();
  };
  // jedna zóna přes celý seznam: tažení posouvá, ťuknutí (bez pohybu) otevře téma
  const zone = ui.add(s.add.zone(0, top, W, h).setOrigin(0).setInteractive().setDepth(D + 4));
  let sy = -1, so = 0, moved = false;
  zone.on('pointerdown', (p: Phaser.Input.Pointer) => ((sy = p.y), (so = helpState.scroll), (moved = false)));
  zone.on('pointermove', (p: Phaser.Input.Pointer) => {
    if (sy < 0 || !p.isDown) return;
    if (Math.abs(p.y - sy) > 10) moved = true;
    if (moved) setScroll(so - (p.y - sy));
  });
  zone.on('pointerup', (p: Phaser.Input.Pointer) => {
    const tap = sy >= 0 && !moved;
    sy = -1;
    if (!tap) return;
    const i = Math.floor((p.y - top + helpState.scroll) / RH);
    if (i < 0 || i >= HELP.length) return;
    sfx.click();
    helpState.last = i;
    ui.show(i);
  });
  zone.on('pointerout', () => (sy = -1));
  zone.on('wheel', (_p: Phaser.Input.Pointer, _dx: number, dy: number) => setScroll(helpState.scroll + dy * 0.6));
}

/** jedno téma: ikona, název, text; dole předchozí / další */
function topic(ui: HelpUI, i: number, top: number, bottom: number, W: number, D: number) {
  const s = ui.scene, tp = HELP[i];
  const lock = !!tp.lock && ui.locked(tp.lock);
  helpState.last = i;
  ui.add(icon(ui, tp.icon, 46, top + 26, 52, lock, D + 2));
  const name = ui.add(s.add.text(86, top + 26, tp.title, txt(30, lock ? PAL.fog : PAL.gold)).setOrigin(0, 0.5).setDepth(D + 2));
  name.setScale(Math.min(1, (W - 160) / name.width));
  ui.add(s.add.text(W - 20, top + 26, `${i + 1} / ${HELP.length}`, txt(18, PAL.fog)).setOrigin(1, 0.5).setDepth(D + 2));
  // text v rámečku (27 log. px ≈ 20 CSS px); delší překlad se zmenší, aby se vešel (nejmenší písmo 18)
  const by = top + 62, bh = bottom - 76 - by;
  const box = ui.add(s.add.graphics().setDepth(D + 1));
  box.fillStyle(col('ink'), 0.6).fillRoundedRect(10, by, W - 20, bh, 10);
  if (lock) {
    ui.add(s.add.image(W / 2, by + bh / 2 - 50, 'icons', 'lock').setScale(5).setDepth(D + 2));
    const lt = ui.add(s.add.text(W / 2, by + bh / 2 + 20, helpLockText(tp.lock!), txt(26, PAL.bone)).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(W - 80).setDepth(D + 2));
    lt.setScale(Math.min(1, (W - 60) / lt.width));
  } else {
    const body = ui.add(s.add.text(30, by + 18, tp.text, txt(27, PAL.bone)).setWordWrapWidth(W - 60).setLineSpacing(6).setDepth(D + 2));
    for (let size = 26; body.height > bh - 34 && size >= 18; size--) body.setFontSize(size).setLineSpacing(size >= 22 ? 6 : 4);
  }
  // předchozí / další (velká tlačítka pro palec)
  const bw = (W - 30) / 2, y = bottom - 62;
  ui.button(10, y, bw, 58, t('‹ Předchozí'), 'plum', i > 0, () => ui.show(i - 1));
  ui.button(20 + bw, y, bw, 58, t('Další ›'), 'plum', i < HELP.length - 1, () => ui.show(i + 1));
}
