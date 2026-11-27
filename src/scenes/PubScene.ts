import Phaser from 'phaser';
import { PAL } from '../data/palette';
import { t, lang, LANGS, AVAILABLE, setLang, langChosen, keepLang, type Lang } from '../i18n';
import { txt } from '../ui/font';
import { Capacitor } from '@capacitor/core';
import { InAppReview } from '@capacitor-community/in-app-review';
import { Share } from '@capacitor/share';
import { stats as meter } from '../core/stats';
import { fitPads, type R } from '../ui/touch';
import { helpPanel, helpState, MENU_HYG } from '../ui/help';
import { confetti, rays, bigText, coinFountain, popText, punch, flashRect } from '../ui/juice';
import { big, dur } from '../core/num';
import { WAITERS, WAITER_MAX, BAR_CAP, crew, tripTime, smileBonus, hireCost as wHireCost, UP_MAX as W_UP_MAX, freePoints, xpProgress, xpFor, spent as wSpent, earned as wEarned, MAX_POINTS, upName as wUpName, waiterLvl, waiterRate, tray, SMILE_STEP, START_CREW, beersPerCycle, type WaiterUp } from '../core/waiters';
import { milestoneCount } from '../core/economy';
import { STATIONS, STATIONS5, StationDef, STATION_NAMES, PUB_NAMES, costN, affordable, payout, actMult, nextMilestone, upMult, upDef, upTiers, UpgradeDef, MANAGERS, mgrCost, BOOST_MULT, BOOST_S, BOOST_CD, kriglyFor, KRIGL_BONUS, setCthOld, prestigeMin, KRIGL_SHOP, KriglItem, startCoins, DECOR, kSpeed, kOffline, kEvents, kCthulhu, kKrigly, kMaxed, guestLvl, guestTips, GUEST_MAX, OFFLINE_MAX_H, STYLES, pubStyle, styleGap, styleCount, hasStyle, isStyle, pubStyles, styleSupplyMult, supplyIn, supplyOut, STYLE_MIX, STAR_LVL, STAR_MAX, starsOf, starMult, starCost, starKey, ACT_STEP, MENU_EARN } from '../core/economy';
import { sfx } from '../core/sfx';
import { ads } from '../core/ads';
import { iap, ProductId, PRODUCTS, onIapReady } from '../core/shop';
type Bundle = 'starter' | 'xmas' | 'milestone';
import { msStart, msLive, msUntil, MS_GEMS, MS_SKIP_H, MS_PASS_DAYS, vcNow, vcAdd, vcReady, VC_GOAL, VC_GEMS, VC_H, starterHyg, starterUntil, starterLive, STARTER_GEMS, STARTER_PASS_DAYS, STARTER_LOOK_GEMS, xmasLive, xmasUntil, xmasKey, XMAS_GEMS, XMAS_PASS_DAYS, GEM_PACKS, packGems, coinVidLeft, coinVidUse, COIN_VID_MIN, popDue, popShown } from '../core/offers';
import { season, SEASONS, SEASON_BONUS } from '../core/season';
/** kdy přijde sezónní host (karta ve Sbírce, dokud ho hráč neviděl; data podle core/season.ts) */
const SEASON_WHEN: Record<string, string> = { monk: t('1. 12. – 6. 1.'), muertos0: t('20. 10. – 3. 11.'), brewer: t('15. 9. – 10. 10.') };
import { VISITORS, Visitor, VisitCtx, VIS_GOLD, VIS_GEMS_DAY, visGems } from '../game/visitors';
import { LEAGUES, LeagueState, weekStart, rivalTick, weekEnd, winReward, winGems, cupMult, LG_CUP, rivalInfo, rivalRate, leagueMove, LG_BOOST, LG_WILD, LG_STOP, fxOn, fxLeft, boostShare } from '../core/league';
import { isNight, nightForced, phaseLeft, DAY_MS, bonesFor, nightCfg, retune, nightLen, nightShare, switchPhase, nightCost, nightCostN, NIGHT_MAX_LVL, SWITCH_LVL, SWITCH_COST } from '../core/night';
import type { TempleHost } from './TempleScene';
import { newDarts, tickDarts, dartStats, DartsState, DART_UPS, migrateDarts, autoOn, dartCap, dartMs } from '../core/darts';
import { notify, NOTE, Note } from '../core/notify';
import { pg, showBoards, signIn as pgSignIn, saveNow as pgSaveNow } from '../core/playgames';
import { chestReady, chestDay, openChest, jokerFree, CHEST_REW, ChestRew, GOLD_KRIGLE, GOLD_KRIGLE_F, newAdv, adPower, adMult, adWatch, adOverlap, adLvlCost, AD_LVL_MAX, AD_BASE, AD_TOP, AD_H, newVip, vipTick, vipServe, VIP_H, dayKey, GEM_COST, GemItem, GEM_PERM, GEM_LOOK, CHRONICLE_BONUS, VIP_GEMS, GOLD_GEMS, GEMS_FREE, PRESTIGE_GEMS_DAY, RESPEC_GEMS, passOn, passBuy, PASS_MULT, paidMult, PAID_CAP, PASS_GEMS, PASS_DAYS, multSecs, vipCfg, VIP_EVERY } from '../core/special';
import { templeState, isWeekend, ROUNDS_PER_DAY, sealBonus, TempleState, weekendKey, ALTAR_PER, weekendLeft } from '../core/temple';
import { TALISMANS, STAT_NAMES, talisCost, stats, OSSUARY, rollCost, OLD_OSS_PER, TEMPLE_STATS, StatId } from '../core/talisman';
import { TREE, TREE_BY_ID, TREE_BRANCHES, TREE_COLORS, STAR_TEXT, GATE, treeSpent, treeCan, treeWhy, branchSpent, floorNodes, hasStar, treeStats, oldTreeStats, xpNeed, oldXpNeed, lvlFromTotal, respecCost, type StarId, type TreeNode } from '../core/skilltree';
import { collHire, collSpdCost, collAmtCost, COLL_AMT_MAX } from '../core/collector';
import { loyLvl, loyProg, loyNext, LOY_MAX } from '../core/loyalty';
import { mastStage, mastRank, mastProg, RANKS, RANK_COLORS, MAST_MAX } from '../core/mastery';
import { brewCfg, BEERS, BEER_LVL, BeerKind, newBrew, brewMs, tank, lvlCost, brewBonus, sellSecs, tick, takeBeer, addBeer } from '../core/brewery';
import { Save, PubState, load, store, newPub, Act, MAX_PUBS, exportSave, importSave, wipe } from '../core/save';
import { PubView, LOOK, REKO, livery } from '../game/PubView';
import { RELICS, RELIC_STAR, hasRelic, nextRelic } from '../core/relics';
import { spassAdd, SPassKind, spassSync, spassIdx, spassEnd, spassTier, spassRew, spassCan, spassClaim, SPassRew, SPASS_TIERS, SPASS_TIER_PTS, SPASS_PTS, spassName } from '../core/spass';
import { RekoState, REKO_HYG, REKO_OFFLINE_H, REKO_STARS, REKO_GOLD, newReko, rekoCount, rekoMax, nextTask, rekoReady, chapter, taskProg, taskDone, rekoStar, RekoTask } from '../core/reko';
import { PubEvents, EventKind, EVENT_KINDS, EVENT_EXTRA } from '../game/events';
import { GUESTS } from '../game/PubView';
import { QUESTS, QCtx, QuestDef, currentQuest, questDone } from '../core/quests';
import { ACHIEVEMENTS, GUEST_NAMES, TaskKind, newDaily, taskText, today, WeekKind, newWeekly, weekId, weekNum, weekText, GOLD_WEEK_X, GOLD_WEEK_GEMS } from '../core/goals';
/** hvězdičky podniku: do ★5 pět políček, pak deset */
const rkStars = (n: number) => '★'.repeat(n) + '☆'.repeat((n >= 5 ? 10 : 5) - n);

const W = 540;
/** kolik talířů z kuchyně může čekat na číšníky */
const FOOD_CAP = 6;
/** rozjezd po hygieně: výdělek ×RUSH_MULT na RUSH_S sekund */
const RUSH_S = 120;
const RUSH_MULT = 3;
/** obsluha stanic: tlačítko, po najmutí, hláška */
const STAFF_LABEL: Record<string, [string, string, string]> = {
  tap: [t('Číšníci'), t('číšníci'), t('Číšníci nastoupili!')],
  kitchen: [t('Kuchař'), t('kuchař'), t('Kuchař nastoupil!')],
  cellar: [t('Sklepník'), t('sklepník'), t('Sklepník nastoupil!')],
  dice: [t('Kostlivec'), t('kostlivec'), t('Kostlivec nastoupil!')],
  pool: [t('Markér'), t('markér'), t('Markér nastoupil!')],
};
const H = 960;
const T = 16;
/** horní lišta (návrh B „Velká hospoda“: jen coins, příjem a diamanty) */
const TOP = 72;
/** výška pruhu hospody při posouvání (4 hospody) */
const STRIP = 380; // horní lišta s penězi
const CARD_H = 88;
/** spodní lišta Hospoda / Obchod / Úkoly / Menu (návrh 4) */
const NAV_H = 84;
/** ×2 za reklamu na stanici – minut */
const STATION_AD_MIN = 15;
/** horní okraj otevřeného menu: spodní lišta zůstává vidět pod ním (výběr uživatele B) */
const MENU_Y0 = 960 - NAV_H - 6 * 96 - 126;
/** spodek obsahu menu (nad lištou) */
const MB = 960 - NAV_H;
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
/** výhled hospody (1 hospoda; u 2–3 hospod včetně záložek) a výška záložek hospod (2–3 hospody) */
/** výška 444 = celá místnost (14 dlaždic) při přiblížení „celá šířka místnosti“ (přání uživatele: všechny tři stoly
 *  celé, nic uříznutého po stranách) – zbytek místa dostanou dlaždice stanic */
let VIEW_H = 444;
const TABH = 56;
/** spodní okraj hospody = horní okraj dlaždic stanic */
let PUB_BOT = TOP + VIEW_H;
/** dlaždice stanic 2×2 (návrh B) */
const TILE_PAD = 10;
const TILE_GAP = 8;
const TILE_W = (W - 2 * TILE_PAD - TILE_GAP) / 2;
const TILE_H = Math.floor((960 - NAV_H - PUB_BOT - 18 - TILE_GAP) / 2);
/** pátá stanice (★2 Rekonstrukce, varianta A): úzká karta přes celou šířku pod mřížkou 2×2, hospoda o tolik nižší */
const NARROW_H = 72;
const setLayout = (five: boolean) => {
  VIEW_H = five ? 444 - NARROW_H - TILE_GAP : 444;
  PUB_BOT = TOP + VIEW_H;
};
/** horní řádek přes hospodu: pilulka úkolu a hygieny */
const PILL_H = 46;
/** kulatá tlačítka číšníků vlevo dole v hospodě: střed k-tého, poloměr */
const CHIP_R = 32;
const chipXY = (k: number) => ({ x: 14 + CHIP_R + k * 76, y: PUB_BOT - 58 });
const OPTS_KEY = 'pubidle_opts';
/** násobek česky: 1.2 → „1,2“ */
const xf = (m: number) => m.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
/** zbývající čas h:mm:ss */
const hms = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
/** upozornění na mobilu zapnutá (nastavení) */
let notesOn = false;
/** méně textu na hlavní obrazovce (posudek 25. 11.): a = bez „ťukni sem!“ a jmen číšníků, b = navíc kratší hygiena a cedule stylu,
 *  c = navíc „úr. N“ a kratší úkol. Ladění ?ui=0|a|b|c */
const UI_LEAN = ((): number => {
  try {
    const v = new URLSearchParams(location.search).get('ui') ?? '';
    return v in { 0: 1, a: 1, b: 1, c: 1 } ? ({ 0: 0, a: 1, b: 2, c: 3 } as Record<string, number>)[v] : 2;
  } catch {
    return 2;
  }
})();
/** skrytý vývojářský režim (7× ťuknout na číslo verze v Nastavení): ukáže admin věci */
let devMode = false;
/** hráč vypnul anonymní statistiky (Nastavení) */
let statsOff = false;

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

// odkazy z Nastavení (přání testerů Google Play: ohodnotit, sdílet, zásady soukromí)
const PLAY_URL = 'https://play.google.com/store/apps/details?id=cz.baronisko.pubidle';
const PRIVACY_URL = () => `https://baronisko.github.io/hospoda-idle/${lang === 'cs' ? 'soukromi-cs' : 'soukromi'}.html`;
/** otevře odkaz mimo hru: v aplikaci přechod stránky (Capacitor ho pošle do Obchodu Play / prohlížeče), na webu nová karta */
function openExternal(url: string) {
  if (Capacitor.isNativePlatform()) location.href = url;
  else window.open(url, '_blank', 'noopener');
}
/** sdílení hry: v aplikaci systémové okno Sdílet, na webu Web Share nebo zkopírování odkazu; vrací false, když nešlo nic */
async function shareGame(): Promise<'ok' | 'copied' | 'fail'> {
  const text = t('Zahraj si P.U.B. Idle – idle hospoda s pivem, upíry a Cthulhu!');
  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({ title: 'P.U.B. Idle', text, url: PLAY_URL, dialogTitle: t('Sdílet') });
      return 'ok';
    }
    if (navigator.share) {
      await navigator.share({ title: 'P.U.B. Idle', text, url: PLAY_URL });
      return 'ok';
    }
    await navigator.clipboard.writeText(`${text} ${PLAY_URL}`);
    return 'copied';
  } catch {
    return 'fail';
  }
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
    const o = JSON.parse(localStorage.getItem(OPTS_KEY) ?? '{}') as { snd?: boolean; mus?: boolean; sv?: number; mv?: number; nt?: boolean; cs?: number; so?: boolean; dv?: boolean };
    notesOn = !!o.nt;
    statsOff = !!o.so;
    meter.set(!statsOff, { lang, app: Capacitor.isNativePlatform() ? 'android' : 'web' });
    devMode = !!o.dv;
    // varianty zvuku výdělku jsou jen ve vývojářském režimu – hráč má vždy výchozí A melodii
    sfx.coinStyle = devMode ? (o.cs ?? 0) : 0;
    sfx.setSfxVol(o.sv ?? (o.snd === false ? 0 : 1));
    sfx.setMusVol(o.mv ?? (o.mus === false ? 0 : 1));
  } catch {
    sfx.setMusic(true);
  }
}
function saveOpts() {
  try {
    localStorage.setItem(OPTS_KEY, JSON.stringify({ sv: sfx.sfxVol, mv: sfx.musVol, nt: notesOn, cs: sfx.coinStyle, so: statsOff, dv: devMode }));
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
  /** ťuk na nepřístupné tlačítko (např. málo coins → nabídka videa) */
  denied?: () => void;
}

interface Card {
  /** text „+X/s · ×2 za N úr.“ na pruhu karty a klíč, kdy ho přepočítat */
  infoTxt?: string;
  infoKey?: string;
  /** kdy naposled číšníci nestíhali (tlačítko pomoci na kartě drží 5 s, ať nebliká) */
  jamAt?: number;
  /** řádek stylu / zásobování vedle pruhu */
  tag: Phaser.GameObjects.Text;
  pub: number;
  def: StationDef;
  box: Phaser.GameObjects.Graphics;
  name: Phaser.GameObjects.Text;
  lvl: Phaser.GameObjects.Text;
  bar: Phaser.GameObjects.Graphics;
  info: Phaser.GameObjects.Text;
  /** T2: do kdy je přírůstek po nákupu zvýrazněný */
  hiUntil?: number;
  /** T2: text „teď → potom“ po nákupu */
  hiText?: string;
  buy: Btn;
  staff: Btn;
  tapZone: Phaser.GameObjects.Zone;
  /** dlaždice stanice (návrh B): levý horní roh, šířka, výška */
  x: number;
  y: number;
  w: number;
  h: number;
  /** obrázek stanice vlevo nahoře na dlaždici */
  icon: Phaser.GameObjects.Image;
  /** název hodnosti mistrovství (vedle úrovně, za ním tečky stupňů) */
  bnum: Phaser.GameObjects.Text;
  /** odznak „×2 za reklamu“ vedle názvu (návrh B) */
  adG: Phaser.GameObjects.Graphics;
  adT: Phaser.GameObjects.Text;
  adZ: Phaser.GameObjects.Zone;
  /** úzká karta páté stanice (varianta A) */
  narrow?: boolean;
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

  /** právě běžící scéna (obchod se připojí později a jen jednou – viz onIapReady) */
  static cur?: PubScene;
  static iapHooked = false;
  create() {
    this.d = load();
    // první spuštění: výběr jazyka (předvybraný jazyk telefonu) – návrh A, mřížka 2×6
    if (!langChosen() && (this.d.tut ?? (this.d.earned < 50 ? 0 : -1)) === 0) this.time.delayedCall(200, () => this.pickLang(true));
    setLayout((this.d.reko?.star ?? 0) >= 2);
    PubScene.cur = this;
    if (!PubScene.iapHooked) {
      PubScene.iapHooked = true;
      onIapReady(() => void PubScene.cur?.iapRestore());
    }
    // Chrám Cthulhu už není 4. hospoda (je z něj víkendová událost) → ze starých uložení ho odebrat
    this.d.pubs = this.d.pubs.filter((p) => p.act <= 3).slice(0, MAX_PUBS);
    if (!this.d.pubs.length) this.d.pubs = [newPub(1)];
    // číšníci: kdo už má kostlivce na pípě, dostane prvního číšníka
    // v2: číšníci místo kostlivce na pípě – dosavadní číšníky „prodat“ (vrátit coins za najmutí, vylepšení i kostlivce
    // na pípě a piva na baru), hráč je koupí znovu
    if (!this.d.wv2) {
      let back = 0;
      for (const p of this.d.pubs) {
        if (!p.w?.length) continue;
        const am = actMult(p.act);
        p.w.forEach((w, k) => {
          back += (k >= 2 ? [0, 0, 400, 4000][k] : 0) * am;
          for (let l = 0; l < w.s; l++) back += 30 * 1.5 ** l * am;
          for (let l = 0; l < w.t; l++) back += 200 * 10 ** l * am;
          for (let l = 0; l < w.m; l++) back += 100 * 2 ** l * am;
        });
        if (p.st.tap?.auto) back += STATIONS[0].staff * am;
        back += p.bar?.v ?? 0;
        p.w = undefined;
        p.bar = undefined;
        if (p.st.tap) (p.st.tap.auto = false), (p.st.tap.prog = 0);
      }
      this.d.wv2 = true;
      if (back > 0) {
        this.d.coins += back;
        this.time.delayedCall(1500, () => this.views[0] && this.banner(this.views[0].cam, t('Číšníci prodáni – vráceno {n} coins. Najmi je znovu na Pípě.', { n: big(back) })));
      }
    }
    // krígly (hospoda 72, přání uživatele): bonus výdělku dávají i utracené krígly → dopočítat, kolik hráč už utratil
    // (obchod za krígly + Lepší reklama; vrácení bodů stromu se zpětně zjistit nedá)
    if (this.d.kSpent === undefined) {
      let sp = 0;
      for (const it of KRIGL_SHOP) for (let l = 0; l < (this.d.kup?.[it.id] ?? 0); l++) sp += it.cost(l);
      for (let l = 0; l < (this.d.adv?.lvl ?? 0); l++) sp += adLvlCost(l);
      this.d.kSpent = Number.isFinite(sp) ? sp : 0;
    }
    // skilly na rok (hospoda 63): starý strom 3×5 → nový velký strom; úroveň podle celkového XP na nové křivce, body se vrátí
    if (!this.d.sk2) {
      let tot = this.d.xp ?? 0;
      for (let l = 1; l < (this.d.klvl ?? 1); l++) tot += oldXpNeed(l);
      const r = lvlFromTotal(tot);
      this.d.klvl = r.lvl;
      this.d.xp = r.xp;
      this.d.skills = [];
      this.d.sk2 = true;
    }
    // hospoda 63b: nové ceny uzlů (body i z hvězd, mistrovství, hostů) → koupené uzly jednou zdarma vrátit
    if (!this.d.sk3) {
      this.d.skills = [];
      this.d.sk3 = true;
    }
    // strom „Tři cechy“ (25. 11. 2026): body zpět; staty starého stromu zůstanou jako „Stará pověst“ (platí to větší)
    if (!this.d.sk4) {
      const old = this.d.skills ?? [];
      if (old.length) {
        this.d.skOld = oldTreeStats(old) as Record<string, number>;
        this.d.skNew = true;
      }
      this.d.skills = [];
      this.d.sk4 = true;
    }
    // 25. 11. 2026 (pravidlo pod 1 %): Zlatý výčep a pečetě Chrámu nově po 0,9 % – co hráč už má, zůstane po starém
    if (!this.d.bon9) {
      this.d.cthOld = this.kl('cthulhu');
      if (this.d.temple) this.d.temple.old = this.d.temple.boss;
      this.d.bon9 = true;
    }
    setCthOld(this.d.cthOld ?? 0);
    for (const p of this.d.pubs) {
      if (p.st.tap?.auto && !p.w?.length) p.w = START_CREW();
      // v3: číšníci se levelovali ~20× moc rychle → zkušenosti, úrovně i body všem vynulovat (přání uživatele)
      if (!this.d.wv3) for (const w of p.w ?? []) (w.xp = 0), (w.s = 0), (w.t = 0), (w.m = 0);
    }
    // jen 3 číšníci (ať je aspoň trochu čekání a Rychlost s Podnosem mají smysl): 4. číšník odchází, vrátit cenu
    for (const p of this.d.pubs) {
      while ((p.w?.length ?? 0) > WAITER_MAX) {
        p.w!.pop();
        const back = 4000 * actMult(p.act);
        this.d.coins += back;
        this.time.delayedCall(2500, () => this.views[0] && this.banner(this.views[0].cam, t('Vilma odešla (číšníci jsou teď 3) – vráceno {n} coins', { n: big(back) })));
      }
    }
    if (!this.d.wv3 && this.d.pubs.some((p) => p.w?.length)) this.time.delayedCall(1500, () => this.views[0] && this.banner(this.views[0].cam, t('Číšníci začínají znovu od úrovně 1 – zkušenosti teď přibývají pomaleji')));
    this.d.wv3 = true;
    this.wrun = this.d.pubs.map(() => []);
    loadOpts();
    if (!PubScene.statStart) {
      PubScene.statStart = true;
      meter.track('game_start', { hyg: this.d.stats.prestiges, pubs: this.d.pubs.length, fresh: this.d.earned < 50 ? 1 : 0 });
    }
    // dotaz na upozornění (jednou, až hráč splní 3 úkoly) a výzva k hodnocení v obchodě (po 3. a 10. hygieně)
    this.time.delayedCall(5000, () => this.askNotify());
    this.time.addEvent({ delay: 6000, repeat: 12, callback: () => this.askReview() });
    this.time.addEvent({ delay: 5000, loop: true, callback: () => this.offerTick() });
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
    // ekonomika v2 (přání uživatele: menší čísla): krígly přepočtené na novou křivku (2·√K), coins a tržba běhu
    // podle nového násobku hospod (10× místo 50×)
    if (!this.d.eco2) {
      const old = this.d.krigle;
      this.d.krigle = Math.floor(2 * Math.sqrt(Math.max(0, old)));
      const top = Math.max(1, ...this.d.pubs.map((p) => p.act));
      const f = 5 ** (top - 1);
      this.d.coins /= f;
      this.d.run /= f;
      this.d.eco2 = true;
      if (old > 0) this.time.delayedCall(1500, () => this.views[0] && this.banner(this.views[0].cam, t('Nová ekonomika: krígly {a} → {b}', { a: big(old), b: big(this.d.krigle) }), true));
    }
    // po hygieně: nové hvězdy stanic = body do stromu (jeden nápis)
    if (this.starMsg) {
      const n = this.starMsg;
      this.starMsg = 0;
      this.time.delayedCall(2500, () => this.views[0] && this.banner(this.views[0].cam, t('★ Nové hvězdy stanic: {n} – +{n} b. do stromu hostinského', { n }), true));
    }
    // po Rekonstrukci: oslava nové hvězdičky podniku
    if (this.d.rekoMsg) {
      const n = this.d.rekoMsg;
      this.d.rekoMsg = undefined;
      this.time.delayedCall(1200, () => {
        if (!this.views[0]) return;
        sfx.fanfare();
        this.cameras.main.flash(600, 255, 220, 120);
        this.banner(this.views[0].cam, t('Rekonstrukce hotová! Podnik {s}', { s: '★'.repeat(n) }) + '\n' + this.rekoGift(n), true);
      });
    }
    this.events.off('guestArrive');
    this.events.on('guestArrive', () => (this.d.gxp = (this.d.gxp ?? 0) + 1 + this.ts().gxp));
    this.events.off('goldGuest');
    this.events.on('goldGuest', (key: string, act: number) => {
      const view = Math.max(0, this.d.pubs.findIndex((p) => p.act === act));
      // odměna = 5 min výdělku hospody + 3 💎
      const c = Math.max(10, Math.round(this.rate(this.d.pubs[view]) * 300));
      this.gain(c);
      const first = !(this.d.goldG ??= []).includes(key);
      if (first) this.d.goldG.push(key);
      this.d.gems = (this.d.gems ?? 0) + 3;
      sfx.fanfare();
      this.banner(this.views[view].cam, t('Zlatý host! +{n} coins a +{g} 💎', { n: big(c), g: 3 }) + (first ? '\n' + t('Nová zlatá hvězda ve Sbírce') : ''));
      store(this.d);
    });
    this.events.off('guestSeen');
    this.events.on('guestSeen', (key: string, spr?: Phaser.GameObjects.Sprite, view?: unknown) => {
      if (this.d.seen.includes(key)) return;
      this.d.seen.push(key);
      // Zkušebna O1: nový host je malá událost – hvězda nad hlavou a (nejvýš jednou za 90 s) cedule
      // jen hosté, kteří ve Sbírce opravdu jsou (noční kostlivec tam není – dřív cedule „Nový host ve Sbírce: skeleton“)
      if ((this.d.tut ?? -1) >= 0 || !spr || this.guestName(key) === key) return;
      const star = this.add.text(spr.x, spr.y - spr.displayHeight - 6, '★', txt(30, PAL.gold)).setOrigin(0.5, 1).setDepth(spr.depth + 1);
      this.events.emit('pubObj', star);
      const follow = () => (spr.active ? star.setPosition(spr.x, spr.y - spr.displayHeight - 6).setDepth(spr.depth + 1) : star.setVisible(false));
      this.events.on('update', follow);
      this.tweens.add({ targets: star, scale: { from: 0.8, to: 1.2 }, yoyo: true, repeat: 5, duration: 450 });
      this.time.delayedCall(6000, () => (this.events.off('update', follow), star.destroy()));
      const vi = this.views.findIndex((v) => v === view);
      if (this.time.now - this.newGuestAt > 90_000 && vi >= 0 && (this.d.rushU ?? 0) - RUSH_S * 1000 + 60_000 < Date.now()) {
        this.newGuestAt = this.time.now;
        this.banner(this.views[vi].cam, t('Nový host ve Sbírce: {s}', { s: this.guestName(key) }));
      }
    });
    // uvízlí v průvodci nové hospody bez peněz (před opravou dávala hygiena 0 coins) → dorovnat na rozjezd
    const lastPub = this.d.pubs[this.d.pubs.length - 1];
    if (this.d.pubs.length > 1 && (lastPub.st.tap?.lvl ?? 0) === 0 && this.d.coins < this.restartNeed()) this.d.coins = this.restartNeed();
    // pro headless test (jen ve vývoji): ovládání cyklu dne a noci
    if (import.meta.env.DEV) (window as unknown as { __night: unknown }).__night = { switchPhase, phaseLeft };
    // mini průvodce pivovarem jen pro ty, kdo pivovar ještě neviděli
    if (this.d.brewTut === undefined && this.d.guides?.includes('tile:brew')) this.d.brewTut = -1;
    this.views = [];
    // po restartu scény (hygiena) jsou staré objekty zničené – odkazy na ně zahodit, jinak hra spadne (zamrzne)
    this.goalUi = undefined;
    this.goalKey = '';
    this.gemUi = undefined;
    this.gemKey = '';
    this.qUi = this.styleSign = this.chestHud = this.chestBg = this.vipBar = this.vipSpr = this.brewBar = this.brewTxt = undefined;
    this.scrollBar = this.hint = this.hygBtn = undefined;
    this.signBot = this.signLeft = 0;
    this.qOffNow = -1;
    this.ntfQ = [];
    this.ntfBusy = 0;
    this.dartsNoticeObjs = [];
    this.awayObjs = [];
    this.awayClose = undefined;
    this.guideObjs = [];
    this.guideCur = null;
    this.guideFollow = null;
    this.tutObjs = [];
    this.tutFinaleUntil = 0;
    this.wChips = [];
    this.wPanel = [];
    this.wPanelBtns = [];
    this.wSel = -1;
    this.cards = [];
    this.stripRates = [];
    this.pubTabs = [];
    this.skillBtns = [];
    this.skillIcons = [];
    this.skillSubs = [];
    this.skillKeys = [];
    this.touchZones = [];
    this.strips = [];
    this.scroll = 0;
    this.drag = null;
    this.sheet = -1;
    this.cameras.main.setBackgroundColor(PAL.ink);
    // hospody leží ve světě daleko vpravo (x ≥ 2000), aby je UI kamera neviděla; UI kamera je nad nimi
    this.lookSync();
    this.d.pubs.forEach((p, i) => this.views.push(new PubView(this, p, 2000 + i * 1000)));
    const ui = this.cameras.main;
    this.cameras.remove(ui, false);
    this.cameras.addExisting(ui);
    ui.setBackgroundColor('rgba(0,0,0,0)');

    // horní lišta (návrh B): coins velkým písmem, pod nimi příjem (a den/noc), vpravo diamanty
    const top = this.add.graphics().setDepth(100);
    top.fillStyle(col('ink')).fillRect(0, 0, W, TOP);
    top.fillStyle(col('gold')).fillRect(0, TOP - 3, W, 3);
    this.coinIcon = this.add.image(32, 33, 'obj', 'coin').setScale(3.6).setDepth(101);
    this.coinsText = this.add.text(62, 1, '', txt(44, PAL.gold)).setDepth(101);
    this.rateText = this.add.text(64, 41, '', txt(22, PAL.mint)).setDepth(101);
    this.rateText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.incomePopup());
    this.infoText = this.add.text(0, 41, '', txt(20, PAL.fog)).setDepth(101);
    // ×1 / ×10 / MAX: vpravo dole v hospodě, hned nad dlaždicemi stanic (v dosahu palce)
    this.modeBtn = this.btn(W - 12 - 92, PUB_BOT - 12 - 52, 92, 52, () => {
      this.mode = ({ 1: 10, 10: 100, 100: 0, 0: -1, [-1]: 1 } as Record<number, number>)[this.mode];
      sfx.click();
      this.drawMode();
    }, 102);
    this.drawMode();
    // Zkušebna U1: do první hygieny přepínač ×1/×10/MAX schovaný (nový hráč kupuje po jedné, tlačítko jen mátlo)
    if (this.d.stats.prestiges === 0) {
      this.modeBtn.visible = false;
      [this.modeBtn.bg, this.modeBtn.label, this.modeBtn.zone].forEach((o) => o.setVisible(false));
    }
    this.makeNav();
    this.shopDot = this.add.graphics().setDepth(254);

    this.layout();
    this.hintObjs = [];
    this.hintBtn = undefined;
    this.idleS = 0;
    if (this.hintMode === 'a') this.hintBtn = this.btn(W - 66, this.hintY() - 52, 52, 44, () => (this.hintObjs.length ? this.hideHint() : this.showHint(this.hintY(), false)), 60);
    if (!this.d.q) this.d.q = QUESTS.filter((q) => questDone(q, this.d, this.qctx())).map((q) => q.id);
    this.daily();
    this.chestHudDraw();
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
        const n = Math.max(10, Math.round(Math.max(this.rate(p), this.pay(p, STATIONS[0]) / STATIONS[0].cycle) * secs * (this.has('piano') ? 2 : 1) * (1 + this.ts().events) * (hasRelic(this.d.relics, 'bottomlessKeg') ? 1.2 : 1)));
        this.gain(n);
        return n;
      },
      // Zkušebna H3: cedule událostí ne přes otevřené okno (dřív „Zlatý sud!“ přes Úkoly)
      banner: (c, text, top) => { if (!this.shopObjs.length) this.banner(c, text, top); },
      fine: (secs, view) => {
        const p = this.d.pubs[view];
        const n = Math.min(this.d.coins, Math.round(Math.max(this.rate(p), this.pay(p, STATIONS[0]) / STATIONS[0].cycle) * secs));
        this.d.coins -= n;
        return n;
      },
      boostAll: (ms) => (this.evBoostUntil = Date.now() + ms),
      extraKinds: () => ((this.d.reko?.star ?? 0) >= 6 ? ['wedding'] : []),
      // Zkušebna O1 (Petr 26. 11., bez změny ekonomiky – odměna události nezávisí na druhu): události přicházejí postupně –
      // zlato a rvačka hned, žáby po 1. hygieně, netopýr a banshee po 3. hygieně (dřív všech 5 v první půlhodině, pak 1 h nic nového)
      baseKinds: () => {
        const h = this.d.stats.prestiges;
        return EVENT_KINDS.filter((k) => k === 'gold' || k === 'brawl' || (k === 'frogs' && h >= 1) || h >= 3);
      },
      onEvent: (k, ok) => {
        if (!ok) return;
        this.tryDrop(k === 'brawl' ? 0.06 : 0.04);
        this.d.stats.events++;
        this.week(k === 'brawl' ? 'brawls' : 'events');
        this.xp(20);
        this.task('events', 1);
        // návrh J6: v pozdní hře (od 30. hygieny) dá událost navíc i věc, kterou hygiena nesmaže – kosti, nebo zkušenosti číšníkům
        if (this.d.stats.prestiges >= 30) {
          if (Math.random() < 0.5) {
            const b = Math.max(20, Math.round(this.bonesPerSec() * 900));
            this.d.bones = (this.d.bones ?? 0) + b;
            this.banner(this.views[0].cam, t('Událost navíc: +{n} kostí', { n: big(b) }));
          } else {
            for (const p of this.d.pubs) for (const w of p.w ?? []) w.xp = (w.xp ?? 0) + 900;
            this.banner(this.views[0].cam, t('Událost navíc: číšníci +15 min zkušeností'));
          }
        }
      },
    });
    const evq = new URLSearchParams(location.search).get('ev') as EventKind | null;
    if (evq && [...EVENT_KINDS, ...EVENT_EXTRA].includes(evq)) this.time.delayedCall(800, () => this.ev.start(evq, 0));
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
        if (this.chestHud?.zone.visible && this.chestHud.zone.getBounds().contains(ptr.x, ptr.y)) continue; // ikona truhly
        if (this.vipBar?.zone.getBounds().contains(ptr.x, ptr.y)) continue; // pruh VIP
        // pilulky úkolu a hygieny, ×1 a schopnost manažera přes hospodu (návrh B) – ťuknutí na ně není spropitné
        if ([this.qUi?.btn.zone, this.goalUi?.zone, this.modeBtn.zone, ...this.skillBtns.map((b) => b?.zone)].some((z) => z?.visible && z.input?.enabled && z.getBounds().contains(ptr.x, ptr.y))) continue;
        if (this.vipTap(this.views.indexOf(v), wp.x, wp.y)) return;
        if (this.ev.tap(this.views.indexOf(v), wp.x, wp.y)) return;
        if (v.tap(wp.x, wp.y)) {
          this.tipReward(v, true);
          this.tut('tip');
          sfx.tip();
        }
      }
    });

    // ?away=<s> – ladění: předstírá nepřítomnost
    const away = Number(new URLSearchParams(location.search).get('away'));
    if (away) this.d.at = Date.now() - away * 1000;
    this.clampClock();
    this.offline();
    if (this.d.skNew)
      this.time.delayedCall(2500, () => {
        delete this.d.skNew;
        this.banner(this.views[0].cam, t('Nový strom hostinského! Body máš zpátky, starý výdělek drží Stará pověst.'), true);
      });
    if (new URLSearchParams(location.search).get('talis')) this.d.talis = Object.fromEntries(TALISMANS.map((x, i) => [x.id, i % 3 ? i : 0]));
    const dc = Number(new URLSearchParams(location.search).get('coins'));
    if (dc) this.d.coins = dc;
    const save = () => {
      if (document.visibilityState === 'visible') {
        void notify.cancel();
        if (iap.available) void this.iapRestore();
        this.clampClock();
        this.offline();
        this.leagueCheck();
      } else {
        store(this.d, true);
        if (notesOn) void notify.schedule(this.notes());
      }
    };
    document.addEventListener('visibilitychange', save);
    window.addEventListener('pagehide', save);
    this.events.once('shutdown', () => {
      document.removeEventListener('visibilitychange', save);
      window.removeEventListener('pagehide', save);
    });
    this.refresh();
  }

  /** upozornění na dobu, kdy je hra zavřená: plná hospoda, plný toulec, víkend v chrámu */
  notes(now = Date.now()): Note[] {
    const out: Note[] = [];
    if (this.d.pubs.some((p) => this.rate(p) > 0))
      out.push({ id: NOTE.full, at: now + this.offCap() * 1000, title: t('Hospoda je plná!'), body: t('Kasa přetéká – přijď vybrat výdělek, jinak se už nic nepřičítá.') });
    const ds = this.d.darts;
    if (ds && this.d.nightInfo && !autoOn(ds) && ds.have < dartCap(ds.up))
      out.push({ id: NOTE.darts, at: now + (dartCap(ds.up) - ds.have) * dartMs(ds.up, this.ts().dspeed), title: t('Toulec je plný'), body: t('Šipky čekají na hod – další už nepřibývají.') });
    const vip = this.d.vip;
    if (vip && (this.d.tut ?? -1) < 0)
      out.push({ id: NOTE.vip, at: vip.next, title: t('Přišel VIP host!'), body: t('Čeká nejvýš hodinu – obsluž ho ťuknutím a dostaneš {h} h výdělku.', { h: VIP_H }) });
    if (!chestReady(this.d.chest, now)) {
      const m = new Date(now);
      m.setDate(m.getDate() + 1);
      m.setHours(10, 0, 0, 0);
      out.push({ id: NOTE.chest, at: m.getTime(), title: t('Denní truhla je připravená'), body: t('Otevři ji a nepřeruš sérii – 7. den zlatá truhla!') });
    } else if ((this.d.tut ?? -1) < 0) {
      // truhla dnes čeká neotevřená: připomenout za 3 h, nejpozději ve 20:00 (ať se série nepřeruší); pozdě večer až ráno v 10
      const eve = new Date(now);
      eve.setHours(20, 0, 0, 0);
      let at = Math.min(now + 3 * 3600_000, eve.getTime());
      if (at < now + 30 * 60_000) {
        const m = new Date(now);
        m.setDate(m.getDate() + 1);
        m.setHours(10, 0, 0, 0);
        at = m.getTime();
      }
      out.push({ id: NOTE.chest, at, title: t('Denní truhla čeká neotevřená'), body: t('Otevři ji a nepřeruš sérii – 7. den zlatá truhla!') });
    }
    // návrat po delší pauze: za 2 a za 5 dní v 18:00 (zruší se, jakmile hráč hru otevře)
    if ((this.d.tut ?? -1) < 0)
      for (const [id, days, title, body] of [
        [NOTE.back2, 2, t('Štamgasti se ptají, kde jsi'), t('Hospoda mezitím vydělávala – kasa je plná a čekají nové úkoly.')],
        [NOTE.back5, 5, t('Hospoda bez hostinského chátrá'), t('Vrať se pro výdělek a denní truhlu – číšníci to sami dlouho neutáhnou.')],
      ] as const) {
        const m = new Date(now);
        m.setDate(m.getDate() + days);
        m.setHours(18, 0, 0, 0);
        out.push({ id, at: m.getTime(), title, body });
      }
    if (!this.tileLock('temple') && !isWeekend(now)) {
      const sat = new Date(now);
      sat.setDate(sat.getDate() + ((6 - sat.getDay() + 7) % 7));
      sat.setHours(9, 0, 0, 0);
      out.push({ id: NOTE.temple, at: sat.getTime(), title: t('Víkend v chrámu začíná'), body: t('Cthulhu se probudil – chrám v R\'lyeh je otevřený.') });
    }
    return out;
  }

  /** výdělek za dobu nepřítomnosti (běží jen stanice s kostlivcem), strop 8 h */
  private offline() {
    if (!Number.isFinite(this.d.at)) this.d.at = Date.now(); // poškozené uložení → dřív NaN coins
    const leftAt = this.d.at;
    const raw = Math.max(0, (Date.now() - this.d.at) / 1000);
    const cap = this.offCap();
    const secs = Math.min(cap, raw);
    const rate = this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
    // reklamní kampaň platí jen po dobu, kdy běžela
    // reklamní kampaň a Štamgast platí jen po dobu, kdy běžely
    const base = rate / paidMult(this.d.adv, this.d.pass);
    const g = Math.floor(base * multSecs(leftAt, leftAt + secs * 1000, [[this.d.adv?.until ?? 0, adPower(this.d.adv)], [this.d.pass?.until ?? 0, PASS_MULT]], PAID_CAP));
    // hodiny vrácené dozadu čas odchodu neposunou (jinak přetáčení hodin = opakovaný offline výdělek)
    if (!(this.d.at > Date.now() && this.d.at - Date.now() < 86_400_000)) this.d.at = Date.now();
    this.mastAdd(secs);
    // číšníci sbírají zkušenosti i offline (jen přes den, podle toho, jak moc mají práce)
    const daySecs = secs * (1 - (this.nightsOn() ? nightShare() : 0));
    for (const p of this.d.pubs) {
      if (!p.st.tap?.auto || !p.w?.length) continue;
      const busy = Math.min(1, this.demand(p) / crew(p.w).rate);
      for (const w of p.w) w.xp = (w.xp ?? 0) + daySecs * busy;
    }
    // schopnost „Uvítací hodina“: po návratu (aspoň 5 min pryč) je schopnost manažera hned nabitá
    if (raw >= 300 && this.star('welcome')) for (const p of this.d.pubs) if (p.mgr && !this.boosted(p)) p.boostReady = 0;
    if (secs < OFFLINE_MIN || g < 1) return;
    // část času byla noc: místo coins kosti
    const ns = this.nightsOn() ? nightShare() : 0;
    const coins = Math.floor(g * (1 - ns));
    const bones = secs * ns * this.bonesPerSec(true);
    // liga: o kolik soupeř mezitím přidal (jen když je to pořád stejný týden)
    const L = this.league();
    let rival: { add: number; lead: number } | undefined;
    // liga ještě zamčená (odemyká se po MENU_HYG.league. hygieně) → o soupeři v okně nepsat, nový hráč by nevěděl, o co jde
    if (L.start <= leftAt && !this.tileLock('league')) {
      const before = rivalTick(L, leftAt);
      const after = rivalTick(L);
      rival = { add: after - before, lead: 0 };
    }
    this.gain(coins, L.start <= leftAt ? boostShare(L, leftAt, Date.now()) : 0);
    this.d.bones = (this.d.bones ?? 0) + bones;
    if (rival) rival.lead = L.me - (L.rival ?? 0);
    store(this.d);
    // otevřené okno (návštěvník, noc, liga…): výdělek se připíše vždy, jen místo okna krátký nápis
    if (this.awayObjs.length) this.banner(this.cameras.main, `+${big(coins)} coins`);
    else this.awayPopup(coins, secs, raw > cap, bones, rival);
    meter.track('offline_return', { hours: Math.round(secs / 360) / 10 });
  }

  /** okno návratu: nejlepší nákup, na který hráč právě má (obsluha > nejdražší stanice) */
  private awayTip(): string | null {
    let staff: [number, string] | null = null, buy: [number, string] | null = null;
    this.d.pubs.forEach((p) => {
      for (const def of this.stations()) {
        const s = this.st(p, def.id);
        const name = STATION_NAMES[p.act][def.id];
        if (s.lvl > 0 && !s.auto) {
          const c = def.staff * actMult(p.act) * (1 - this.ts().staff);
          if (c <= this.d.coins && (!staff || c > staff[0])) staff = [c, STAFF_LABEL[def.id][0]];
        }
        try {
          const { n, price } = this.offer(p, def);
          if (n > 0 && price <= this.d.coins && (!buy || price > buy[0])) buy = [price, name];
        } catch { /* stanice v téhle hospodě není */ }
      }
    });
    const pick = (staff ?? buy) as [number, string] | null;
    return pick ? `${pick[1]} (${big(pick[0])})` : null;
  }

  awayObjs: Phaser.GameObjects.GameObject[] = [];
  /** jak zavřít právě otevřené okno (awayObjs) tlačítkem Zpět – stejně jako jeho vlastní tlačítko */
  awayClose?: () => void;

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
    // dlouhé řádky (ruština, jméno soupeře v lize) zmenšit na šířku okna
    const tx = (y: number, s: string, size: number, c: string) => {
      const o = this.add.text(W / 2, y, s, txt(size, c)).setOrigin(0.5).setAlign('center').setDepth(D + 2);
      o.setScale(Math.min(1, (bw - 28) / o.width));
      objs.push(o);
    };
    tx(by + 44, t('Zatímco jsi byl pryč…'), 30, PAL.gold);
    tx(by + 96, t('obsluha pracovala {d}', { d: dur }), 22, PAL.fog);
    const capH = String(Math.round(this.offCap() / 360) / 10).replace('.', ',');
    // Zkušebna (L3): strop vidět vždy, ne jen když ho hráč přetáhl
    tx(by + 126, capped ? t('(víc než {h} h se nepočítá)', { h: capH }) : t('(strop {h} h)', { h: capH }), 18, PAL.fog);
    const amt = this.add.text(0, by + 190, `+${big(g)}`, txt(44, PAL.gold)).setOrigin(0, 0.5).setDepth(D + 2);
    const x0 = W / 2 - (amt.width + 46) / 2;
    amt.setX(x0 + 46);
    objs.push(this.add.image(x0 + 16, by + 190, 'obj', 'coin').setScale(5).setDepth(D + 2), amt);
    tx(by + 236, bones >= 1 ? t('coins a {n} kostí', { n: big(bones) }) : 'coins', 22, PAL.mint);
    // Zkušebna (L3): co si za to hned koupit (obsluha má přednost, jinak nejdražší nákup, na který je)
    const tip = this.awayTip();
    if (tip && !rival) tx(by + 268, t('stačí na: {s}', { s: tip }), 20, PAL.sand);
    if (rival) {
      const ri = rivalInfo(this.league());
      // soupeřka: „přidala“ (dřív vždy „přidal“)
      tx(by + 284, ri.woman ? t('{s} mezitím v lize přidala +{n} coins', { n: big(rival.add), s: ri.name }) : t('{s} mezitím v lize přidal +{n} coins', { n: big(rival.add), s: ri.name }), 20, PAL.scarlet);
      tx(by + 314, rival.lead >= 0 ? t('Pořád vedeš o {n} coins', { n: big(rival.lead) }) : t('{s} vede o {n} coins', { n: big(-rival.lead), s: rivalInfo(this.league()).name }), 20, rival.lead >= 0 ? PAL.mint : PAL.sand);
    }
    const done = () => {
      this.awayObjs.forEach((o) => o.destroy());
      this.awayObjs = [];
      sfx.coin(1);
    };
    const two = this.canReward();
    const ok = this.btn(two ? bx + 24 : W / 2 - 110, by + bh - 90, two ? 190 : 220, 64, done, D + 3);
    this.drawBtn(ok, t('Vybrat'), true, 'green');
    objs.push(ok.bg, ok.label, ok.zone);
    if (two) {
      const x2 = this.btn(bx + bw - 214, by + bh - 90, 190, 64, async () => {
        if (await this.rewarded()) {
          this.gain(g);
          store(this.d);
        }
        done();
      }, D + 3);
      this.drawBtn(x2, t('×2 za reklamu'), true, 'amber');
      objs.push(x2.bg, x2.label, x2.zone);
    }
    this.awayObjs = objs;
    this.awayClose = done;
    sfx.tip();
  }

  menuT = 2;

  /** krátké uvítání v nově otevřené hospodě */
  private pubIntro(act: number) {
    this.d.pubIntro = undefined;
    this.msStart('pub' + act);
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
    tx(by + 220, t('Vydělává {m}× víc než ta předchozí a běží vedle ostatních.', { m: ACT_STEP }), 20, PAL.sand);
    const close = () => {
      this.awayObjs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    const ok = this.btn(W / 2 - 110, by + bh - 90, 220, 64, close, D + 3);
    this.drawBtn(ok, t('Jdeme na to!'), true, 'green');
    objs.push(ok.bg, ok.label, ok.zone);
    this.awayObjs = objs;
    this.awayClose = close;
    sfx.fanfare();
  }

  /** kdy se dlaždice menu odemkne (null = hned); vrací text podmínky, dokud je zamčená */
  private tileLock(name: string): string | null {
    const d = this.d;
    // co už jednou bylo odemčené, zůstává (po hygieně se úrovně vynulují)
    if (d.menuOpen?.includes(name)) return null;
    // menu se odemyká postupně (přání uživatele): ne všechno naráz po 1. hygieně
    // pořadí (přání uživatele): nejvýš jedna novinka za kolo, vždy se šipkou a krátkým návodem
    // 1. hygiena krígly a noc · 2. Hostinský · 4. pivovar · 11. Chrám · 20. výzdoba · 30. šipky · 40. Liga (25. 11. 2026, dřív 3/6/10/15/20)
    // (pomaleji – přání uživatele, dřív 1–6 a vše odemčené za ~1 h)
    // prahy hygien v MENU_HYG (ui/help.ts) – stejná čísla ukazuje nápověda „Jak to funguje“
    const hyg = d.stats.prestiges, after = (n: number) => (hyg >= n ? null : t('po {n}. hygieně', { n: String(n) }));
    switch (name) {
      case 'krigl':
      case 'brew':
      case 'temple':
      case 'decor':
      case 'darts':
      case 'league': {
        // přání uživatele 25. 11.: odemyká se hygienou a k tomu výdělkem (celoživotní coins, MENU_EARN)
        const n = MENU_HYG[name], c = MENU_EARN[name] ?? 0;
        if (hyg < n) return c > d.earned ? t('po {n}. hygieně a {c} coins výdělku', { n: String(n), c: big(c) }) : after(n);
        return d.earned >= c ? null : t('ještě {c} coins výdělku', { c: big(c - d.earned) });
      }
      case 'daynight': return d.nightInfo ? null : t('po první noci');
      // přání uživatele (hospoda 72): strom až po 2. hygieně (dřív od 5. úrovně = v prvních minutách hry); kdo už ve stromu utrácel, tomu zůstane
      case 'keeper': return treeSpent(d.skills) > 0 ? null : after(2);
      case 'talis': return Object.keys(d.talis ?? {}).length ? null : t('po nálezu talismanu');
      case 'bones': return d.nightInfo ? null : t('po první noci');
      // až když je na prvního sběrače (dřív stačila 1 kost a průvodce ukazoval na nákup, na který hráč neměl)
      case 'coll': return d.nightInfo && (d.bones ?? 0) >= collHire(0) ? null : t('od {n} kostí', { n: big(collHire(0)) });
      default: return null;
    }
  }

  /** nejbližší zamčená dlaždice Menu, která se odemyká hygienou (pro okno hygieny) */
  private nextUnlock(): { label: string; n: number; earnOk: boolean } | null {
    const list: [string, number][] = [['keeper', 2], ...Object.entries(MENU_HYG)];
    const open = this.d.menuOpen ?? [];
    const cand = list.filter(([k, n]) => !open.includes(k) && this.tileLock(k) && n > this.d.stats.prestiges).sort((x, y) => x[1] - y[1])[0];
    if (!cand) return null;
    const tile = PubScene.TILES.find(([tab, sub]) => (sub && tab === 'shop' ? sub : tab) === cand[0]);
    return tile ? { label: tile[2], n: cand[1], earnOk: this.d.earned >= (MENU_EARN[cand[0]] ?? 0) } : null;
  }

  /** nově odemčené dlaždice oznámit */
  private menuUnlocks() {
    const known = (this.d.menuOpen ??= []);
    const first = known.length === 0;
    for (const [tab, sub, label] of PubScene.TILES) {
      const key = sub && tab === 'shop' ? sub : tab;
      if (known.includes(key) || this.tileLock(key)) continue;
      known.push(key);
      if (!first && this.views[0]) this.guideAdd('tile:' + key);
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
    const close = () => {
      this.awayObjs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    const ok = this.btn(W / 2 - 110, by + bh - 90, 220, 64, close, D + 3);
    this.drawBtn(ok, t('Rozumím'), true, 'blue');
    objs.push(ok.bg, ok.label, ok.zone);
    this.awayObjs = objs;
    this.awayClose = close;
  }

  /** oslava milníku stanice */
  coinIcon!: Phaser.GameObjects.Image;
  private comboN = 0;
  private comboT = 0;
  private punchT = 0;

  /** milník (25, 50, 100 …): paprsky, velký nápis, konfety, mince do počítadla, otřes, zvuk (efekty B) */
  private milestone(i: number, def: StationDef) {
    const lvl = this.st(this.d.pubs[i], def.id).lvl;
    this.ntfPush({ k: 'mile', text: 'mile' + i + def.id + lvl, top: true, run: () => this.milestoneFx(i, def, lvl) });
  }

  private milestoneFx(i: number, def: StationDef, lvl: number) {
    const cx = W / 2, cy = TOP + VIEW_H / 2;
    rays(this, cx, cy);
    bigText(this, cx, cy - 20, t('ÚROVEŇ {n}!', { n: lvl }), t('{s}: výdělek ×2!', { s: STATION_NAMES[this.d.pubs[i].act][def.id] }));
    confetti(this, cx, cy + 40, 70);
    const card = this.cards.find((k) => k.pub === i && k.def.id === def.id);
    coinFountain(this, card ? card.x + card.w / 2 : cx, card ? card.y + 40 : cy, 18, [32, 33], 462, () => this.bumpCoins());
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

  // ---------- upozornění (výběr uživatele A – fronta): vždy jen jedno naráz ----------
  private ntfQ: { k: 'txt' | 'mile' | 'darts'; text: string; top: boolean; run?: () => void; at?: number }[] = [];
  private ntfBusy = 0;

  /** fronta: vždy jen jedno upozornění naráz, stejné texty se nespojují dvakrát, nejvýš 3 čekající */
  private ntfPush(n: { k: 'txt' | 'mile' | 'darts'; text: string; top: boolean; run?: () => void }) {
    if (this.ntfQ.some((x) => x.text === n.text)) return;
    this.ntfQ.push({ ...n, at: Date.now() });
    // víc než 3 čekající → zahodit nejstarší obyčejný nápis (výzvy k akci a milníky zůstanou)
    while (this.ntfQ.length > 3) {
      const k = this.ntfQ.findIndex((x) => x.k !== 'mile' && !x.top);
      this.ntfQ.splice(k >= 0 ? k : 0, 1);
    }
    this.ntfNext();
  }

  private ntfNext() {
    if (this.ntfBusy > Date.now()) return;
    // co čeká přes 10 s, už je staré – zahodit
    this.ntfQ = this.ntfQ.filter((x) => Date.now() - (x.at ?? 0) < 10000);
    const n = this.ntfQ.shift();
    if (!n) return;
    this.ntfBusy = Date.now() + (n.k === 'mile' ? 2000 : n.k === 'darts' ? 2600 : 1900);
    if (n.run) return n.run();
    this.bannerRaw(n.text, n.top);
  }

  private banner(c: Phaser.Cameras.Scene2D.Camera, text: string, top = false) {
    void c;
    this.ntfPush({ k: 'txt', text, top });
  }

  private bannerRaw(text: string, top = false) {
    sfx.fanfare();
    // vždy uprostřed výhledu hospody (kamera skryté hospody mohla mít nesmyslný rámeček → nápis vlevo nahoře)
    // a dlouhý text se zalomí a zmenší, aby nepřetekl mimo obrazovku
    const tx = this.add
      // nahoře pod lištou úkolu (dřív ležel přes ni)
      .text(W / 2, top ? this.pubTop() + 62 + this.qOff() : TOP + VIEW_H / 2, text, { ...txt(30, PAL.gold), align: 'center', wordWrap: { width: W - 40 } })
      .setOrigin(0.5)
      .setStroke(PAL.ink, 8)
      .setDepth(450);
    // Zkušebna H3: horní nápis (pokyn k události) na tmavém podkladu a déle – dřív splýval s barem a zmizel za 2 s
    if (top) tx.setBackgroundColor('rgba(20,16,28,0.82)').setPadding(14, 6, 14, 6);
    tx.setScale(Math.min(1, (W - 24) / tx.width));
    this.tweens.add({ targets: tx, scale: { from: 0.4 * tx.scale, to: tx.scale }, duration: 260, ease: 'Back.out' });
    // horní nápis mizí dolů (nahoru by vjel do lišty úkolu – posudek nováčka)
    this.tweens.add({ targets: tx, y: tx.y + (top ? 30 : -40), alpha: 0, delay: top ? 2800 : 1300, duration: 600, onComplete: () => tx.destroy() });
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
      this.stations().filter((d) => (p.st[d.id]?.lvl ?? 0) > 0).map((d) => upDef(p.act, d.id, upTiers(this.d.up, p.act, d.id) + 1)),
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
        // Zkušebna H2: místo jména schopnosti číslo, co dělá
        sub: sub(p.act, t('{s}: výdělek ×{m} na {n} s', { s: MANAGERS[p.act].skill, m: BOOST_MULT, n: Math.round(this.boostLen(p) / 1000) })),
        cost: mgrCost(p.act),
        buy: () => this.hireMgr(p),
      }));
    return [...mgrs, ...ups].sort((a, b) => a.cost - b.cost).slice(0, 5);
  }

  tab: 'home' | 'shop' | 'tasks' | 'book' | 'krigl' | 'temple' | 'brew' | 'talis' | 'keeper' | 'league' | 'daynight' | 'darts' | 'coll' | 'opts' | 'special' | 'chest' | 'help' = 'home';

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
    this.task('darts', n);
    this.d.bones = (this.d.bones ?? 0) + 3 * n;
    this.xp(5 * n);
  }

  dartsClose() {
    // automat na pozadí naváže v reálném čase (nic se neodhází najednou)
    if (this.d.darts) this.d.darts.tat = Date.now();
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
    this.ntfPush({ k: 'darts', text: 'darts', top: false, run: () => this.dartsNoticeRaw(pts) });
  }

  private dartsNoticeRaw(pts: number) {
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
    this.d.templeSeen = dayKey(); // červená tečka jen do prvního otevření za den
    this.closeShop();
    this.input.enabled = false;
    this.scene.launch('Temple', { host: this });
  }

  templeData(): TempleState {
    return (this.d.temple = templeState(this.d.temple));
  }

  /** denní úkol „Odehraj kolo v Chrámu“ */
  templeRound() {
    this.task('temple', 1);
  }

  templeIncome() {
    return this.totalRate();
  }

  brawlCut() {
    return Math.min(0.7, this.ts().brawl + (hasRelic(this.d.relics, 'coatOfMany') ? 0.15 : 0));
  }

  templeStats() {
    return this.ts();
  }

  templeKriglyGift() {
    return Math.max(5, Math.round(this.d.krigle * 0.03));
  }

  templeReward(kind: 'talis' | 'krigle' | 'bones' | 'seal' | 'stat' | 'darts' | 'gems' | 'relic', n: number): string {
    if (kind === 'relic') {
      // ★8: poražený Cthulhu zanechá relikvii (dokud nejsou všechny 4)
      const r = (this.d.reko?.star ?? 0) >= RELIC_STAR ? nextRelic(this.d.relics) : null;
      if (!r) return '';
      (this.d.relics ??= []).push(r.id);
      REKO.relics = this.d.relics;
      this.tsCache = undefined;
      this.views.forEach((v) => v.rekoRefresh(true));
      return t('Relikvie: {r} ({d})', { r: r.name(), d: r.desc() });
    }
    if (kind === 'gems') {
      this.d.gems = (this.d.gems ?? 0) + n;
      return t('+{n} 💎', { n });
    }
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
    if (kind === 'seal') return t('Pečeť R\'lyeh: výdělek všude +{v} %', { v: Math.round(sealBonus(this.d.temple?.boss ?? 0, this.d.temple?.old) * 1000) / 10 });
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

  /** červená tečka: svítí, dokud hráč záložku neotevře; znovu se rozsvítí, až přibude něco nového
   *  (přání uživatele: „po prvním kliknutí ať upozornění zmizí“) */
  private tabAlert(id: string) {
    const raw = this.alertRaw(id);
    const seen = (this.d.alertSeen ??= {});
    if (!raw) {
      if (id in seen) delete seen[id];
      return false;
    }
    const sig = this.alertSig(id), old = seen[id];
    if (old === undefined) return true;
    // čísla (body, úkoly…): svítí jen když přibylo; po utracení se „viděno“ sníží, ať další přírůstek zase svítí
    if (/^\d+$/.test(sig) && /^\d+$/.test(old)) {
      if (Number(sig) < Number(old)) seen[id] = sig;
      return Number(sig) > Number(old);
    }
    return sig !== old;
  }

  /** co přesně upozornění hlásí (když se změní – víc bodů, další úkol – tečka se rozsvítí znovu) */
  private alertSig(id: string) {
    if (id === 'keeper') return String(this.skillPoints());
    if (id === 'tasks') return String(this.daily().tasks.filter((k) => !k.claimed && k.prog >= k.goal).length + (this.weekly().claimed ? (this.weekly().gc ? 0 : (this.weekly().gp ?? 0) >= this.weekly().goal * GOLD_WEEK_X ? 1e5 : 0) : this.weekly().prog >= this.weekly().goal ? 1e4 : 0));
    if (id === 'book') return String(this.d.ach.length);
    if (id === 'special') return dayKey();
    if (id === 'darts') return String(Math.floor(this.d.darts?.pts ?? 0));
    if (id === 'shop') return String(this.shopOffer().filter((u) => u.cost <= this.d.coins).length);
    return '1';
  }

  /** otevřená záložka = upozornění viděno */
  private alertSeenNow(id: string) {
    if (this.alertRaw(id)) (this.d.alertSeen ??= {})[id] = this.alertSig(id);
  }

  private alertRaw(id: string) {
    if (id === 'shop') return this.shopOffer().some((u) => u.cost <= this.d.coins);
    if (id === 'tasks') return this.claimable();
    if (id === 'book') return this.achClaimable();
    if (id === 'brew') return this.brewFull();
    if (id === 'keeper') return this.skillPoints() > 0;
    if (id === 'special') return (chestReady(this.d.chest) && (this.d.tut ?? -1) < 0) || (passOn(this.d.pass) && (this.d.pass!.claim ?? '') < dayKey());
    if (id === 'darts') return !!this.d.darts && DART_UPS.some((u) => (this.d.darts!.up[u.id] ?? 0) < u.max && u.cost(this.d.darts!.up[u.id] ?? 0) <= this.d.darts!.pts);
    if (id === 'temple') return isWeekend() && !this.tileLock('temple') && templeState(this.d.temple).used < ROUNDS_PER_DAY && this.d.templeSeen !== dayKey();
    return false;
  }

  /** Menu: když někde svítí tečka, otevře rovnou tu záložku */
  /** Menu: mřížka dlaždic (červená tečka = něco tam čeká) */
  private qVisit(k: string) {
    if (!(this.d.qTiles ??= []).includes(k)) this.d.qTiles.push(k);
  }

  private openMenu() {
    this.openShop('home');
  }

  /** spodní lišta (návrh 4): Hospoda / Obchod / Úkoly / Menu; menu otevřené přes ni se kreslí nad ní */
  navBtns: Btn[] = [];
  navDots?: Phaser.GameObjects.Graphics;
  navDotAt = 0;
  navDotOn = [false, false];
  private makeNav() {
    // lišta je nad otevřeným menu (D 300+) – výběr uživatele B; pod návodem (420) a okny
    const y = H - NAV_H, D = 350, bw = W / 4;
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('dusk')).fillRect(0, y, W, NAV_H).fillStyle(col('gold')).fillRect(0, y, W, 3);
    const items: [string, string, string, () => void][] = [
      [t('Hospoda'), 'obj', 'krigl0', () => (this.closeShop(), this.tut('close'))],
      [t('Obchod'), 'obj', 'bag', () => ((this.shopSub = 'up'), this.qVisit('up'), this.guideEv('menu'), this.openShop('shop', false), this.tut('tile:shop'), this.guideEv('tile:up'))],
      [t('Úkoly'), 'icons', 'clipboard', () => (this.qVisit('tasks'), this.guideEv('menu'), this.openShop('tasks', false), this.guideEv('tile:tasks'))],
      [t('Menu'), 'icons', 'menu', () => this.openMenu()],
    ];
    this.navBtns = items.map(([label, atlas, frame, fn], i) => {
      const x = i * bw;
      const ic = this.add.image(x + bw / 2, y + 30, atlas, frame).setScale(atlas === 'obj' ? 2.4 : 2.6).setDepth(D + 1);
      const tx = this.add.text(x + bw / 2, y + 54, label, txt(19, PAL.bone)).setOrigin(0.5, 0).setDepth(D + 1);
      const z = this.add.zone(x, y, bw, NAV_H).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(D + 2);
      z.on('pointerdown', () => {
        sfx.init();
        sfx.click();
        fn();
      });
      // stejné rozhraní jako tlačítko (návod a průvodce míří na shopBtn = Menu)
      const bg = this.add.graphics().setDepth(D);
      return { bg, label: tx, zone: z, x, y, w: bw, h: NAV_H, visible: true, ic } as unknown as Btn;
    });
    this.shopBtn = this.navBtns[3];
    this.navDots = this.add.graphics().setDepth(D + 3);
  }

  /** dlaždice menu: [záložka, podzáložka obchodu, název, atlas, snímek] */
  private static TILES: [PubScene['tab'], PubScene['shopSub'] | null, string, string, string][] = [
    ['temple', null, t('Chrám'), 'obj', 'dIdol1'],
    ['brew', null, t('Pivovar'), 'obj', 'fermenter'],
    ['league', null, t('Liga'), 'obj', 'trophy'],
    ['shop', 'bones', t('Kostnice'), 'obj', 'dSkulls'],
    ['darts', null, t('Šipky'), 'tourney', 'dartRed'],
    ['coll', null, t('Sběrač'), 'icons', 'tray'],
    ['keeper', null, t('Hostinský'), 'obj', 'apronIcon'],
    ['krigl', null, t('Krígly'), 'obj', 'krigl0'],
    ['book', null, t('Sbírka'), 'icons', 'book'],
    ['shop', 'decor', t('Výzdoba'), 'obj', 'plant'],
    ['special', null, t('Speciální nabídka'), 'obj', 'chest'],
    ['opts', null, t('Nastavení'), 'icons', 'gear'],
  ];

  tileH = 118;
  /** kde je tlačítko online žebříčků (návrhy 25. 11. 2026): a = Nastavení + Chrám, b = + hlavička Ligy, c = + hlavička Menu */
  lbMode = (new URLSearchParams(location.search).get('lb') ?? 'c') as 'a' | 'b' | 'c';
  /** návrhy zamčeného Menu (posudek nováčka: 10 z 12 dlaždic zamčených bez názvu = zeď):
   *  x = dosavadní, a = odemčené + jen nejbližší zamčená, b = všechny se jménem a siluetou, c = odemčené + pruh „Brzy“ */
  menuMode = (new URLSearchParams(location.search).get('menu') ?? 'a') as 'x' | 'a' | 'b' | 'c'; // výběr uživatele: A
  /** pořadí odemykání dlaždic (pro „nejbližší zamčenou“) */
  private static TILE_RANK: Record<string, number> = { krigl: 1, bones: 1.2, daynight: 1.2, keeper: 2, coll: 2.5, brew: 3, talis: 4, temple: 6, decor: 10, darts: 15, league: 20 };

  /** dlaždice menu v pořadí, jak se kreslí (odemčené napřed) + pruh „Brzy“ (návrh c); podle toho míří i šipka průvodce */
  private menuTiles() {
    const mode = this.menuMode;
    const keyOf = ([tab, sub]: (typeof PubScene.TILES)[number]) => (sub && tab === 'shop' ? sub : tab) as string;
    let tiles = PubScene.TILES;
    let soon: (typeof PubScene.TILES)[number][] = [];
    if (mode !== 'x') {
      const open = tiles.filter((r) => !this.tileLock(keyOf(r)));
      const locked = tiles.filter((r) => this.tileLock(keyOf(r))).sort((a, b) => (PubScene.TILE_RANK[keyOf(a)] ?? 99) - (PubScene.TILE_RANK[keyOf(b)] ?? 99));
      tiles = mode === 'a' ? [...open, ...locked.slice(0, 1)] : mode === 'b' ? [...open, ...locked] : open;
      if (mode === 'c') soon = locked;
    }
    return { tiles, soon, keyOf };
  }

  private menuGrid(y0: number, D: number) {
    this.shopObjs.push(this.add.text(20, y0 + 16, t('Menu'), txt(30, PAL.gold)).setDepth(D + 2));
    const tw = (W - 40) / 3, th = this.tileH;
    const mode = this.menuMode;
    const { tiles, soon, keyOf } = this.menuTiles();
    if (soon.length) {
      // c: pod odemčenými dlaždicemi jeden pruh s nejbližší novinkou
      const [tab, sub, label, atlas, frame] = soon[0];
      const rows = Math.ceil(tiles.length / 3), y = y0 + 64 + rows * (th + 8) + 6, h = 96;
      const g = this.add.graphics().setDepth(D + 2);
      g.fillStyle(col('ink'), 0.75).fillRoundedRect(10, y, W - 20, h, 12).lineStyle(3, col('slate')).strokeRoundedRect(10, y, W - 20, h, 12);
      const img = this.add.image(62, y + h / 2, atlas, frame).setDepth(D + 4).setTintFill(col('slate'));
      img.setScale(Math.min(4, 64 / Math.max(img.width, img.height)));
      const lk = this.add.image(92, y + 22, 'icons', 'lock').setScale(1.8).setDepth(D + 5);
      const a = this.add.text(118, y + 12, t('Brzy: {s}', { s: label }), txt(24, PAL.bone)).setDepth(D + 4);
      a.setScale(Math.min(1, (W - 140) / a.width));
      const more = soon.length - 1;
      const b2 = this.add.text(118, y + 50, (this.tileLock(keyOf(soon[0])) ?? '') + (more > 0 ? '  ·  ' + t('a dalších {n} věcí', { n: more }) : ''), txt(18, PAL.fog)).setDepth(D + 4);
      b2.setScale(Math.min(1, (W - 140) / b2.width));
      this.shopObjs.push(g, img, lk, a, b2);
      void tab; void sub;
    }
    // Zkušebna D2/H6 (Petr vybral B): pod dlaždicemi karta „Až se vrátíš“ s číslem a další hospoda se siluetou hosta
    {
      const rows = Math.ceil(tiles.length / 3);
      const y = y0 + 64 + rows * (th + 8) + 6 + (soon.length ? 96 + 10 : 0);
      const capH = String(Math.round(this.offCap() / 360) / 10).replace('.', ',');
      const back = t('1 h pryč: +{n} coins · strop {h} h', { n: big(this.totalRate() * 3600), h: capH });
      const nextPub = this.d.pubs.length < MAX_PUBS ? PUB_NAMES[this.d.pubs.length + 1] : '';
      const g = this.add.graphics().setDepth(D + 2);
      const h = nextPub ? 128 : 70;
      g.fillStyle(col('ink'), 0.75).fillRoundedRect(10, y, W - 20, h, 12).lineStyle(3, col('slate')).strokeRoundedRect(10, y, W - 20, h, 12);
      this.shopObjs.push(g, this.add.image(46, y + 35, 'obj', 'coin').setScale(4).setDepth(D + 4));
      const line = (yy: number, str: string, size: number, c: string) => {
        const o = this.add.text(80, yy, str, txt(size, c)).setDepth(D + 4);
        o.setScale(Math.min(1, (W - 104) / o.width));
        this.shopObjs.push(o);
      };
      line(y + 10, t('Až se vrátíš'), 20, PAL.gold);
      line(y + 38, back, 18, PAL.bone);
      if (nextPub) {
        // silueta hosta z další hospody (duch / žabák) – zvědavost, co tam je
        const key = this.d.pubs.length + 1 === 2 ? 'banshee' : 'zabak';
        this.shopObjs.push(this.add.sprite(46, y + 96, key, 0).setScale(2.5).setDepth(D + 4).setTintFill(col('slate')));
        line(y + 74, t('Další hospoda: {n}', { n: nextPub }), 20, PAL.mint);
        line(y + 100, t('otevře se po další hygieně'), 16, PAL.fog);
      }
    }
    tiles.forEach(([tab, sub, label, atlas, frame], i) => {
      const x = 10 + (i % 3) * (tw + 10), y = y0 + 64 + Math.floor(i / 3) * (th + 8);
      const lock = this.tileLock(sub && tab === 'shop' ? sub : tab);
      const b = this.btn(x, y, tw, th, () => {
        if (lock) return this.banner(this.views[0].cam, t('{s}: otevře se {c}', { s: label, c: lock }));
        const qk = sub && tab === 'shop' ? sub : tab;
        if (!(this.d.qTiles ??= []).includes(qk)) this.d.qTiles.push(qk);
        if (tab === 'temple') return this.guideEv('tile:temple'), this.openTemple();
        if (tab === 'darts') return this.guideEv('tile:darts'), this.openDarts();
        if (sub) this.shopSub = sub;
        this.openShop(tab, false);
        if (tab === 'shop' && sub === 'up') this.tut('tile:shop');
        this.guideEv('tile:' + (sub && tab === 'shop' ? sub : tab));
      }, D + 2);
      this.drawBtn(b, '', true, lock ? 'ink' : 'slate');
      const img = this.add.image(x + tw / 2, y + 50, atlas, frame).setDepth(D + 4);
      img.setScale(Math.min(5, 64 / Math.max(img.width, img.height)));
      if (lock) img.setTintFill(col('dusk'));
      // písmo B (výběr uživatele): větší a světlejší
      const lb = this.add.text(x + tw / 2, y + th - 24, label, txt(24, lock ? PAL.fog : PAL.white)).setOrigin(0.5).setDepth(D + 4);
      if (lock && mode === 'x') lb.setText(lock).setFontSize(19).setWordWrapWidth(tw - 10).setAlign('center');
      lb.setScale(Math.min(1, (tw - 12) / lb.width));
      this.shopObjs.push(b.bg, b.label, b.zone, img, lb);
      if (lock && mode !== 'x') {
        // návrh a/b: jméno + silueta, malý zámek v rohu, podmínka malým písmem
        img.setY(y + 40).setTintFill(col('slate'));
        lb.setY(y + th - 38);
        const cond = this.add.text(x + tw / 2, y + th - 14, lock, txt(16, PAL.fog)).setOrigin(0.5).setDepth(D + 4).setAlpha(0.85);
        cond.setScale(Math.min(1, (tw - 12) / cond.width));
        const lk = this.add.image(x + tw - 20, y + 20, 'icons', 'lock').setScale(1.8).setDepth(D + 5);
        this.shopObjs.push(cond, lk);
        return;
      }
      if (lock) {
        const lk = this.add.image(x + tw / 2, y + 50, 'icons', 'lock').setScale(3).setDepth(D + 5);
        this.shopObjs.push(lk);
        return;
      }
      if (tab === 'temple') {
        // víkendový chrám: kolik zbývá do konce (nebo do otevření)
        const wl = weekendLeft(), h = Math.floor(wl.ms / 3600_000), m = Math.floor((wl.ms % 3600_000) / 60_000);
        const tt = h >= 24 ? t('{d} d {h} h', { d: Math.floor(h / 24), h: h % 24 }) : h ? t('{h} h {m} min', { h, m }) : t('{m} min', { m });
        const tl = this.add.text(x + tw / 2, y + 12, wl.on ? t('končí za {t}', { t: tt }) : t('otevře za {t}', { t: tt }), txt(15, wl.on ? PAL.gold : PAL.fog)).setOrigin(0.5, 0).setDepth(D + 6).setBackgroundColor(PAL.ink).setPadding(4, 1, 4, 1);
        tl.setScale(Math.min(1, (tw - 16) / tl.width));
        this.shopObjs.push(tl);
      }
      if (tab === 'keeper') {
        // úroveň hostinského a volné body přímo na dlaždici
        const pts = this.skillPoints();
        const kl = this.add.text(x + tw / 2, y + 12, pts > 0 ? t('úr. {n} · body {p}', { n: this.d.klvl ?? 1, p: pts }) : t('úroveň {n}', { n: this.d.klvl ?? 1 }), txt(15, pts > 0 ? PAL.mint : PAL.gold)).setOrigin(0.5, 0).setDepth(D + 6).setBackgroundColor(PAL.ink).setPadding(4, 1, 4, 1);
        kl.setScale(Math.min(1, (tw - 16) / kl.width));
        this.shopObjs.push(kl);
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
    const menuStep = ['tile:shop', 'up', 'close'].includes(PubScene.TUT[this.d.tut ?? -1]?.done ?? '');
    if (!menuStep) this.tutObjs.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Visible).setVisible(false));
    this.tab = tab;
    this.alertSeenNow(tab === 'shop' && this.shopSub === 'up' ? 'shop' : tab);
    const D = 300, RH = 96;
    const y0 = MENU_Y0;
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
      const dn = tab === 'daynight' || tab === 'talis';
      // nápověda: zpět z tématu do seznamu, ze seznamu do Nastavení
      const help = tab === 'help';
      const back = this.btn(10, y0 + 10, 130, 42, () => (help ? this.helpBack() : dn ? ((this.shopSub = 'bones'), this.openShop('shop', false)) : this.openShop('home', false)), D + 5);
      this.drawBtn(back, help ? (helpState.sel >= 0 ? t('← Témata') : t('← Nastavení')) : dn ? t('← Kostnice') : t('← Menu'), true, 'plum');
      const tile = PubScene.TILES.find(([tb, sub]) => tb === tab && (tab !== 'shop' || sub === this.shopSub));
      const title = this.add.text(W / 2 + 30, y0 + 31, help ? t('Jak to funguje') : tab === 'talis' ? t('Talismany') : dn ? t('Den a noc') : tab === 'chest' ? t('Denní truhla') : tile?.[2] ?? '', txt(28, PAL.gold)).setOrigin(0.5).setDepth(D + 5);
      title.setScale(Math.min(1, 260 / title.width));
      this.shopObjs.push(back.bg, back.label, back.zone, title);
    }
    const close = this.btn(W - 62, y0 + 10, 52, 42, () => {
      this.closeShop();
      this.tut('close');
    }, D + 5);
    this.drawBtn(close, '✕', true, 'red');
    this.shopObjs.push(close.bg, close.label, close.zone);
    // online žebříčky Google Play: tlačítko v hlavičce Menu (návrh C) nebo Ligy (návrh B); A = jen Nastavení a Chrám
    if (pg.available && ((tab === 'home' && this.lbMode === 'c') || (tab === 'league' && this.lbMode === 'b'))) {
      const bw = tab === 'home' ? 190 : 64;
      const lb = this.btn(W - 72 - bw, y0 + 10, bw, 42, () => {
        sfx.click();
        meter.track('pg_boards', { from: tab });
        void showBoards().then((ok) => ok || this.banner(this.views[0].cam, t('Google Play Hry teď nejdou – zkus to později')));
      }, D + 5);
      this.drawBtn(lb, tab === 'home' ? '🏆 ' + t('Žebříčky') : '🏆', true, 'blue');
      this.shopObjs.push(lb.bg, lb.label, lb.zone);
    }
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
    else if (tab === 'special') this.specialTab(y0, D);
    else if (tab === 'chest') this.chestTab(y0, D);
    else if (tab === 'help') this.helpTab(y0 + 64, D);
    else this.optsTab(cy0, D);
    this.tabTut(tab === 'shop' ? this.shopSub : tab === 'keeper' && this.ktab === 3 ? 'mast' : tab, tab === 'keeper' && this.ktab < 3 ? y0 + 170 : y0 + 60, D);
    sfx.click();
    this.refresh();
  }

  /** krátký návod při prvním otevření nové části menu: šipka na hlavní tlačítko + jeden řádek (přání uživatele: šipkou, málo textu) */
  private static TAB_TUT: Record<string, string> = {
    krigl: t('za krígly kup vylepšení – platí navždy'),
    bones: t('za kosti hoď kostkou – vylepší něco navždy'),
    coll: t('kup sběrače – ťuká na bubliny za tebe'),
    decor: t('kup ozdobu – bonus zůstane i po hygieně'),
    league: t('vydělávej víc než ostatní a postoupíš'),
    keeper: t('dej bod do dovednosti'),
    mast: t('stanice s obsluhou sbírá stupně – každý = bod do stromu'),
    book: t('obsluhuj bubliny hostů – každá úroveň = bod do stromu'),
    talis: t('nasaď talisman – dá bonus'),
  };
  tabTutKey = '';
  tabTutUntil = 0;
  private tabTut(key: string, yMin: number, D: number) {
    const text = PubScene.TAB_TUT[key];
    if (!text || (key === 'book' && this.bookGrp === 4)) return; // nápověda o hostech, ne o návštěvnících
    const seen = (this.d.tabTut ??= []);
    if (!seen.includes(key)) {
      seen.push(key);
      store(this.d);
      this.tabTutKey = key;
      this.tabTutUntil = Date.now() + 7000;
    } else if (this.tabTutKey !== key || Date.now() > this.tabTutUntil) return;
    // hlavní tlačítko = první aktivní tlačítko pod hlavičkou (v Kostnici třetí – před ním Den a noc a Talismany)
    const zs = this.shopObjs.filter((o): o is Phaser.GameObjects.Zone => o instanceof Phaser.GameObjects.Zone && o.visible && o.y > yMin);
    // Hostinský: KOUPIT u uzlu se šipkou; Mistrovství: 1. stanice (poslední zóna); Sbírka: 1. karta (za 5 záložkami)
    // Liga: bez šipky (tlačítka za 💎 dole nejsou hlavní akce)
    const z = key === 'league' ? undefined : key === 'keeper' || key === 'mast' ? zs[zs.length - 1] : key === 'book' ? zs[5] : zs[key === 'bones' ? 2 : 0];
    // málo místa nad tlačítkem → šipka zespodu a text pod ní
    const below = !!z && z.y - yMin < 110;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    if (z) {
      const { x, y } = z, w = z.width, h = z.height;
      const fr = add(this.add.graphics().setDepth(D + 6));
      fr.lineStyle(4, col('gold')).strokeRoundedRect(x - 4, y - 4, w + 8, h + 8, 10);
      this.tweens.add({ targets: fr, alpha: 0.35, yoyo: true, repeat: -1, duration: 450 });
      const ax = x + w / 2, ay = below ? y + h + 34 : y - 34;
      const ar = add(this.add.graphics().setDepth(D + 7).setPosition(ax, ay));
      const tri = (c: number, g: number) => ar.fillStyle(c).fillTriangle(-20 - g, -12 - g, 20 + g, -12 - g, 0, 20 + g).fillRect(-8 - g, -36 - g, 16 + g * 2, 26);
      tri(col('ink'), 4);
      tri(col('gold'), 0);
      if (below) ar.setAngle(180);
      this.tweens.add({ targets: ar, y: ay + (below ? 8 : -8), yoyo: true, repeat: -1, duration: 380, ease: 'Sine.inOut' });
    }
    const ty = !z ? yMin + 40 : key === 'keeper' ? yMin + 150 : below ? z.y + z.height + 92 : z.y - 96;
    const tx = add(this.add.text(W / 2, ty, text, txt(24, PAL.gold)).setOrigin(0.5).setDepth(D + 7).setBackgroundColor(PAL.ink).setPadding(12, 6, 12, 6));
    tx.setScale(Math.min(1, (W - 30) / tx.width));
  }

  /** další záložky ve 2. řádku (talismany, hostinský) */
  private extraTabs(): [PubScene['tab'], string, number, number][] {
    return [
      ['talis', t('Talismany'), 1, 1],
      ['keeper', t('Hostinský'), 2, 1],
      ['league', t('Liga'), 3, 1],
    ];
  }

  /** „Odkud mám výdělek“ (přání uživatele 25. 11., návrh E): rozpad násobku výdělku podle zdrojů.
   *  Násobky (×) se násobí, vlastnosti (+ %) se nejdřív sečtou. Ťuknutí na výdělek v horní liště. */
  incomeSources() {
    const d = this.d, mul: [string, number][] = [], add: [string, number][] = [];
    const kq = this.kAll();
    if (kq) mul.push([t('Krígly'), 1 + KRIGL_BONUS * kq]);
    if (this.kl('cthulhu') || d.cthOld) mul.push([t('Zlatý výčep'), kCthulhu(this.kl('cthulhu'), d.cthOld ?? 0)]);
    const dec = (this.has('portrait') ? 0.1 : 0) + (this.has('fireplace') ? 0.25 : 0);
    if (dec) mul.push([t('Výzdoba'), 1 + dec]);
    if (d.brew && brewBonus(d.brew)) mul.push([t('Pivovar'), 1 + brewBonus(d.brew)]);
    const seal = sealBonus(d.temple?.boss ?? 0, d.temple?.old);
    if (seal) mul.push([t('Chrám'), 1 + seal]);
    if (cupMult(d.league) > 1) mul.push([t('Ligový pohár'), cupMult(d.league)]);
    if (season) mul.push([SEASONS[season].name, 1 + SEASON_BONUS]);
    if (adMult(d.adv) > 1) mul.push([t('Reklamní kampaň'), adMult(d.adv)]);
    if (passOn(d.pass)) mul.push([t('Štamgast'), paidMult(d.adv, d.pass) / adMult(d.adv)]);
    if (this.evBoostUntil > Date.now()) mul.push([t('Upíří hodina'), 2]);
    // vlastnosti „výdělek“ (sčítají se, viz ts())
    const tal = stats(d.talis).income, tree = treeStats(d.skills, stats({}), d.skOld).income;
    let oss = 0, tem = 0;
    for (const o of OSSUARY) if (o.stat === 'income') oss += (d.oss?.income ?? 0) * o.per;
    for (const o of TEMPLE_STATS) if (o.stat === 'income') tem += (d.oss?.income ?? 0) * o.per;
    const al = d.temple?.altar, alt = al && al.wk === weekendKey() ? ((al.lv as Record<string, number>).income ?? 0) * ALTAR_PER : 0;
    const dar = dartStats(d.darts).income ?? 0;
    const chr = this.owns('chronicle') ? CHRONICLE_BONUS : 0;
    ([[t('Talismany'), tal], [t('Hostinský'), tree], [t('Kostnice'), oss], [t('Chrám'), tem], [t('Oltář (týden)'), alt], [t('Šipky'), dar], [t('Pivní kronika'), chr]] as [string, number][]).forEach((r) => r[1] > 0.0005 && add.push(r));
    const sum = add.reduce((a, r) => a + r[1], 0);
    mul.sort((a, b) => b[1] - a[1]);
    add.sort((a, b) => b[1] - a[1]);
    const total = mul.reduce((a, r) => a * r[1], 1) * (1 + sum);
    return { mul, add, sum, total };
  }

  private incomePopup() {
    if (this.night) return;
    const D = 520, { mul, add, sum, total } = this.incomeSources();
    const fx = (m: number) => (m >= 100 ? big(m) : String(Math.round(m * 100) / 100).replace('.', ','));
    const fp = (v: number) => String(Math.round(v * 1000) / 10).replace('.', ',');
    const rows: [string, string, string][] = mul.map(([n, m]) => [n, '×' + fx(m), PAL.gold]);
    if (add.length) rows.push([t('Vlastnosti se sčítají: {v}', { v: '×' + fx(1 + sum) }), '', PAL.mint]);
    add.forEach(([n, v]) => rows.push(['   ' + n, '+' + fp(v) + ' %', PAL.bone]));
    const RH = 36, bx = 30, bw = W - 60, bh = 206 + Math.max(1, rows.length) * RH, by = Math.max(TOP + 10, (H - bh) / 2);
    const objs: Phaser.GameObjects.GameObject[] = [];
    const close = () => objs.forEach((o) => o.destroy());
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(D).setInteractive();
    shade.on('pointerdown', close);
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    objs.push(shade, g);
    const tt = this.add.text(W / 2, by + 18, t('Odkud mám výdělek'), txt(30, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2);
    objs.push(tt);
    rows.forEach(([n, v, c], i) => {
      const y = by + 66 + i * RH;
      const a = this.add.text(bx + 22, y, n, txt(22, c)).setDepth(D + 2);
      const b = this.add.text(bx + bw - 22, y, v, txt(22, c)).setOrigin(1, 0).setDepth(D + 2);
      a.setScale(Math.min(1, (bw - 44 - b.width - 12) / a.width));
      objs.push(a, b);
    });
    if (!rows.length) objs.push(this.add.text(bx + 22, by + 66, t('Zatím žádné bonusy – přibudou s krígly a dalšími částmi hry.'), txt(20, PAL.fog)).setWordWrapWidth(bw - 44).setDepth(D + 2));
    const ty = by + 66 + Math.max(1, rows.length) * RH + 6;
    g.fillStyle(col('gold')).fillRect(bx + 22, ty, bw - 44, 2);
    objs.push(this.add.text(W / 2, ty + 12, t('Celkem ×{m}', { m: fx(total) }), txt(26, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2));
    const ok = this.btn(W / 2 - 90, by + bh - 66, 180, 52, close, D + 3);
    this.drawBtn(ok, t('Zavřít'), true, 'green');
    objs.push(ok.bg, ok.label, ok.zone);
    sfx.click();
  }

  tsCache?: ReturnType<typeof stats>;
  tsAt = -1;

  // ---------- talismany ----------
  private ts() {
    // talismany + dovednosti + Kostnice (kešováno na snímek)
    const now = this.time.now;
    if (this.tsCache && this.tsAt === now) return this.tsCache;
    const a = stats(this.d.talis), b = treeStats(this.d.skills, stats({}), this.d.skOld);
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
    // Pivní kronika (za diamanty): trvale +10 % výdělku
    if (this.owns('chronicle')) a.income += CHRONICLE_BONUS;
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
    // hodiny vrácené dozadu (ws < start): týden se nevyhodnotí předčasně (dřív = krígly a 💎 znovu), počká se na skutečný konec
    if (!L || L.start < ws) {
      let tier = L?.tier ?? 1, cup = 0;
      if (L) {
        const rival = rivalTick(L, weekEnd(L));
        const win = L.me > rival, move = leagueMove(L.me, rival);
        // odměny (hospoda 72): 💎 30 × liga, krígly podle vlastněných, Ligový pohár = výdělek +10 % × liga na celý další týden
        const k = win ? winReward(tier, this.d.krigle) : 0, gm = win ? winGems(tier) : 0;
        cup = win ? tier : 0;
        this.leagueResult = { win, me: L.me, rival, tier, name: rivalInfo(L).name, wild: !win && move < 0 && !!L.wild && tier > 1, stay: move === 0, k, g: gm };
        this.d.leagueHist = [...(this.d.leagueHist ?? []), [tier, win] as [number, boolean]].slice(-8);
        if (win) {
          const R = this.rk();
          if (R) (rekoCount(R, 'lg'), tier >= 3 && rekoCount(R, 'lg3'));
          this.d.krigle += k;
          this.d.gems = (this.d.gems ?? 0) + gm;
          // liga → šipky: +3 body
          if (this.d.darts) this.d.darts.pts += 3;
          this.leagueWinDrop = true;
          if (move > 0) tier = Math.min(LEAGUES.length, tier + 1);
        } else if (!L.wild && move < 0) tier = Math.max(1, tier - 1); // Divoká karta nebo těsná prohra: zůstává
      }
      // soupeř vyrovnaný podle minulého týdne (kolik hráč skutečně vydělal), vyšší liga o kus silnější
      const my = Math.max(1, this.totalRate());
      const prev = L ? [...(L.prev ?? []), { me: L.me, base: L.base }].slice(-3) : [];
      L = { week: String(ws), start: ws, tier, rate: rivalRate(tier, my, prev), me: 0, rival: 0, rAt: ws, base: my, prev, ...(cup ? { cup } : {}) };
      this.d.league = L;
      store(this.d);
    }
    return L;
  }

  /** živé překreslení čísel v záložce Liga (nastaví leagueTab) */
  leagueLive?: () => void;
  leagueLiveT = 0;
  dnT = 1;
  leagueResult?: { win: boolean; me: number; rival: number; tier: number; name: string; wild?: boolean; stay?: boolean; k?: number; g?: number };
  leagueWinDrop = false;

  /** okno s výsledkem minulého týdne */
  private leagueCheck() {
    this.league();
    const r = this.leagueResult;
    if (!r) return;
    if (this.awayObjs.length) return void this.time.delayedCall(1000, () => this.leagueCheck());
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
    tx(344, t('Tvoje tržba: {a} coins\n{s}: {b} coins', { a: big(r.me), b: big(r.rival), s: r.name }), 22, PAL.bone);
    const rw = { k: big(r.k ?? winReward(r.tier)), g: r.g ?? winGems(r.tier), p: Math.round(LG_CUP * r.tier * 100), l: LEAGUES[Math.min(LEAGUES.length, r.tier + (r.stay ? 0 : 1)) - 1] };
    tx(420, r.win ? (r.stay ? t('Odměna: +{g} 💎, +{k} krígel a talisman.\nLigový pohár: výdělek +{p} % na celý týden.\nTěsná výhra – zůstáváš: {l}', rw) : t('Odměna: +{g} 💎, +{k} krígel a talisman.\nLigový pohár: výdělek +{p} % na celý týden.\nPostupuješ do: {l}', rw)) : r.stay ? t('Těsná prohra – zůstáváš: {l}', { l: LEAGUES[r.tier - 1] }) : r.wild ? t('Divoká karta – zůstáváš: {l}', { l: LEAGUES[r.tier - 1] }) : t('Sestupuješ do: {l}', { l: LEAGUES[Math.max(1, r.tier - 1) - 1] }), 22, r.win ? PAL.mint : PAL.fog);
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    const ok = this.btn(W / 2 - 100, 560, 200, 60, close, D + 3);
    this.drawBtn(ok, t('Dál'), true, 'green');
    objs.push(ok.bg, ok.label, ok.zone);
    this.awayObjs = objs;
    this.awayClose = close;
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
    // soupeř jako člověk: postavička, jméno a hospoda (stejný celý týden)
    const ri = rivalInfo(L);
    add(this.add.sprite(46, y0 + 184, `guest${ri.look}`, 0).setOrigin(0.5, 1).setScale(2.6).setDepth(D + 2));
    const nm = add(this.add.text(80, y0 + 142, ri.name, txt(20, PAL.sand)).setDepth(D + 2));
    nm.setScale(Math.min(1, 210 / nm.width));
    // 2. řádek (hospoda soupeře) se musí vejít vedle tržby (ja/ko dřív přetékal rámeček)
    const pt = add(this.add.text(80, y0 + 166, t('hospoda {p}', { p: ri.pub }), txt(14, PAL.fog)).setDepth(D + 2));
    pt.setScale(Math.min(1, 210 / pt.width));
    const rivalT = add(this.add.text(84, y0 + 186, '', txt(40, PAL.scarlet)).setDepth(D + 2));
    add(this.add.text(W - 30, y0 + 146, t('TVOJE TRŽBA'), txt(18, PAL.fog)).setOrigin(1, 0).setDepth(D + 2));
    const meT = add(this.add.text(W - 30, y0 + 186, '', txt(40, PAL.mint)).setOrigin(1, 0).setDepth(D + 2));
    const bar = add(this.add.graphics().setDepth(D + 2));
    const msg = add(this.add.text(W / 2, y0 + 296, '', txt(20, PAL.mint)).setOrigin(0.5, 0).setDepth(D + 2));
    // vysvětlení o soupeři je v nápovědě (Nastavení → Jak to funguje); tady jen běžící pohár za minulou výhru
    if (L.cup) {
      const ct = add(this.add.text(W / 2, y0 + 330, t('Ligový pohár: výdělek +{p} % do konce týdne', { p: Math.round((cupMult(L) - 1) * 100) }), txt(18, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2));
      ct.setScale(Math.min(1, (W - 50) / ct.width));
    }
    this.leagueLive = () => {
      const rival = rivalTick(L), lead = L.me >= rival;
      rivalT.setText(big(rival)).setScale(Math.min(1, 180 / rivalT.setScale(1).width));
      meT.setText(big(L.me)).setScale(Math.min(1, 230 / meT.setScale(1).width));
      frame.clear().lineStyle(3, col(lead ? 'mint' : 'scarlet')).strokeRoundedRect(10, y0 + 132, W - 20, 232, 14);
      // přetahovaná: vlevo podíl soupeře, vpravo můj, bílá čára = remíza
      const bx = 30, bw = W - 60, by = y0 + 236;
      const share = L.me + rival > 0 ? rival / (L.me + rival) : 0.5;
      bar.clear().fillStyle(col('mint')).fillRoundedRect(bx, by, bw, 34, 10);
      bar.fillStyle(col('scarlet')).fillRoundedRect(bx, by, Math.max(20, Math.min(bw - 20, bw * share)), 34, 10);
      bar.fillStyle(col('white')).fillRect(bx + bw / 2 - 2, by - 8, 4, 50);
      msg.setText(lead ? t('Vedeš o {n} coins – {s} přidává!', { n: big(L.me - rival), s: ri.name.split(' ')[0] }) : t('{s} vede o {n} coins', { n: big(rival - L.me), s: ri.name }));
      msg.setScale(Math.min(1, (W - 40) / msg.setScale(1).width));
      msg.setColor(lead ? PAL.mint : PAL.sand);
    };
    this.leagueLive();
    // odměny
    // karta výhry širší (víc odměn), prohra užší
    const WW = 330, LX = 10 + WW + 10, LW = W - 10 - LX;
    g.fillStyle(col('pine'), 0.8).fillRoundedRect(10, y0 + 376, WW, 76, 12);
    g.fillStyle(col('blood'), 0.8).fillRoundedRect(LX, y0 + 376, LW, 76, 12);
    add(this.add.text(10 + WW / 2, y0 + 382, t('VÝHRA'), txt(18, PAL.mint)).setOrigin(0.5, 0).setDepth(D + 2));
    const wt = add(this.add.text(10 + WW / 2, y0 + 404, t('+{g} 💎 · +{k} krígel\ntalisman · výdělek +{p} % na týden', { k: big(winReward(L.tier, this.d.krigle)), g: winGems(L.tier), p: Math.round(LG_CUP * L.tier * 100) }), txt(19, PAL.bone)).setOrigin(0.5, 0).setAlign('center').setDepth(D + 2));
    wt.setScale(Math.min(1, (WW - 14) / wt.width));
    add(this.add.text(LX + LW / 2, y0 + 382, t('PROHRA'), txt(18, PAL.scarlet)).setOrigin(0.5, 0).setDepth(D + 2));
    const lt = add(this.add.text(LX + LW / 2, y0 + 410, L.tier > 1 ? t('sestup do ligy {n}', { n: L.tier - 1 }) : t('zůstaneš v 1. lize'), txt(17, PAL.bone)).setOrigin(0.5, 0).setDepth(D + 2));
    lt.setScale(Math.min(1, (LW - 12) / lt.width));
    // historie posledních týdnů
    const hist = this.d.leagueHist ?? [];
    if (hist.length) add(this.add.text(20, y0 + 468, t('Minulé týdny:'), txt(16, PAL.fog)).setDepth(D + 2));
    hist.forEach(([tier, win], i) => {
      const cx = 140 + i * 46;
      g.fillStyle(col(win ? 'green' : 'red')).fillRoundedRect(cx, y0 + 460, 40, 32, 8);
      add(this.add.text(cx + 20, y0 + 476, `${win ? '✓' : '✗'}${tier}`, txt(16, PAL.white)).setOrigin(0.5).setDepth(D + 2));
    });
    this.leagueGems(L, y0 + 504, D);
  }

  /** utrácení 💎 v lize: Posila na směnu, Divoká karta, Zavřít soupeři pípu */
  private leagueGems(L: LeagueState, y: number, D: number) {
    const gems = this.d.gems ?? 0, today = dayKey(), now = Date.now();
    const mm = (ms: number) => `${Math.floor(ms / 3600_000)}:${String(Math.floor((ms % 3600_000) / 60_000)).padStart(2, '0')}`;
    const boostL = fxLeft(L.boostFrom, LG_BOOST.ms, now), stopL = fxLeft(L.stopFrom, LG_STOP.ms, now);
    const items: { label: string; cost: number; state?: string; ok: boolean; color: 'green' | 'plum' | 'red'; buy: () => string }[] = [
      { label: t('Posila ×2'), cost: LG_BOOST.gems, color: 'green',
        state: boostL ? t('běží {t}', { t: mm(boostL) }) : (L.boostDay ?? '') >= today ? t('zase zítra') : undefined,
        ok: !boostL && (L.boostDay ?? '') < today,
        buy: () => ((L.boostFrom = Date.now()), (L.boostDay = today), t('Posila na směnu! Tržba do ligy ×2 na 1 h')) },
      { label: t('Divoká karta'), cost: LG_WILD, color: 'plum',
        state: L.wild ? t('máš ✓') : L.tier === 1 ? t('od 2. ligy') : undefined,
        ok: !L.wild && L.tier > 1,
        buy: () => ((L.wild = true), t('Divoká karta: tento týden nesestoupíš')) },
      { label: t('Zavřít pípu'), cost: LG_STOP.gems, color: 'red',
        state: stopL ? t('běží {t}', { t: mm(stopL) }) : (L.stopDay ?? '') >= today ? t('zase zítra') : undefined,
        ok: !stopL && (L.stopDay ?? '') < today,
        buy: () => ((L.stopFrom = Date.now()), (L.stopDay = today), t('Soupeři teče jen pěna – 2 h nepřibývá')) },
    ];
    const bw = (W - 40) / 3;
    items.forEach((it, i) => {
      const x = 10 + i * (bw + 10);
      const b = this.btn(x, y, bw, 70, () => {
        if (!it.ok) return sfx.error();
        if ((this.d.gems ?? 0) < it.cost) return this.banner(this.views[0].cam, t('Málo 💎')), sfx.error();
        rivalTick(L); // soupeř dopočítaný do teď, ať se zavřená pípa nepočítá zpětně
        this.d.gems = (this.d.gems ?? 0) - it.cost;
        this.banner(this.views[0].cam, it.buy(), true);
        sfx.buy();
        store(this.d);
        this.openShop('league', false);
      }, D + 3);
      this.drawBtn(b, `${it.label}\n${it.state ?? it.cost + ' 💎'}`, it.ok && gems >= it.cost, it.color);
      b.label.setScale(Math.min(1, (bw - 10) / b.label.width));
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
  }

  /** krígly pro bonus výdělku: držené + utracené (utracené bonus neztrácí – nákup v obchodě už není krok zpět) */
  kAll() {
    return this.d.krigle + (this.d.kSpent ?? 0);
  }

  // ---------- hostinský: úroveň a strom dovedností ----------
  private xp(n: number) {
    this.d.xp = (this.d.xp ?? 0) + n * (1 + this.ts().xp);
    this.d.klvl ??= 1;
    while (this.d.xp >= xpNeed(this.d.klvl)) {
      // nápis jen když hráč neměl volné body a Hostinský je odemčený (jinak by úrovně na začátku spamovaly)
      const quiet = this.skillPoints() > 0 || !!this.tileLock('keeper');
      this.d.xp -= xpNeed(this.d.klvl);
      this.d.klvl++;
      // každá 5. úroveň: diamanty
      const gm = this.d.klvl % 5 === 0 ? GEMS_FREE.keeper5 : 0;
      if (gm) this.d.gems = (this.d.gems ?? 0) + gm;
      if (gm && !this.tileLock('keeper')) this.banner(this.views[0].cam, t('Hostinský úroveň {n}! +1 bod dovedností a +{g} 💎', { n: this.d.klvl, g: gm }), true);
      else if (!quiet && !this.tileLock('keeper')) this.banner(this.views[0].cam, t('Hostinský úroveň {n}! +1 bod dovedností', { n: this.d.klvl }), true);
    }
  }

  private skillPoints() {
    return (this.d.klvl ?? 1) - 1 + this.bonusPoints() - treeSpent(this.d.skills);
  }

  /** body do stromu z hvězd stanic, stupňů mistrovství a úrovní věrnosti hostů (každý = 1 bod) */
  private bonusPoints() {
    const st = Object.values(this.d.stars ?? {}).reduce((a, b) => a + b, 0);
    const ms = STATIONS.reduce((a, d) => a + this.mast(d.id), 0);
    const lo = Object.values(this.d.loy ?? {}).reduce((a, n) => a + loyLvl(n), 0);
    return st + ms + lo;
  }

  // záložka Hostinský: 0–2 = cesty stromu (návrh B: stezka zdola nahoru), 3 = Mistrovství stanic
  ktab = 0;
  ktSel = '';
  ktOff = [-1, -1, -1];
  ktInfo = false;
  /** panel „odkud body?“: 4 zdroje bodů a kolik z nich máš */
  private pointsInfo(ay: number, D: number) {
    const lvl = (this.d.klvl ?? 1) - 1;
    const st = Object.values(this.d.stars ?? {}).reduce((a, b) => a + b, 0);
    const ms = STATIONS.reduce((a, d) => a + this.mast(d.id), 0);
    const lo = Object.values(this.d.loy ?? {}).reduce((a, n) => a + loyLvl(n), 0);
    const rows: [string, number, string][] = [
      [t('Úrovně hostinského'), lvl, t('XP za nákup úrovní, bubliny, akce')],
      [t('Mistrovství stanic'), ms, t('roste samo, když má stanice obsluhu')],
      [t('Hvězdy stanic'), st, t('stanice na 500/400/300 úr. v kole → hvězda po hygieně')],
      [t('Věrní hosté'), lo, t('obsluhuj bubliny hostů (Sbírka)')],
    ];
    const g = this.add.graphics().setDepth(D + 2);
    this.shopObjs.push(g);
    rows.forEach(([name, n, how], i) => {
      const y = ay + 12 + i * 92;
      g.fillStyle(col('dusk')).fillRoundedRect(20, y, W - 40, 82, 10);
      this.shopObjs.push(
        this.add.text(36, y + 8, name, txt(24, PAL.bone)).setDepth(D + 3),
        this.add.text(W - 36, y + 8, t('{n} b.', { n }), txt(26, PAL.gold)).setOrigin(1, 0).setDepth(D + 3),
      );
      const h = this.add.text(36, y + 46, how, txt(17, PAL.fog)).setDepth(D + 3);
      h.setScale(Math.min(1, (W - 80) / h.width));
      this.shopObjs.push(h);
    });
    const sp = this.add.text(W / 2, ay + 12 + 4 * 92 + 6, t('utraceno: {n} b.', { n: treeSpent(this.d.skills) }), txt(20, PAL.fog)).setOrigin(0.5, 0).setDepth(D + 3);
    const ok = this.btn(W / 2 - 110, MB - 120, 220, 56, () => ((this.ktInfo = false), this.openShop('keeper', false)), D + 3);
    this.drawBtn(ok, t('Rozumím'), true, 'green');
    this.shopObjs.push(sp, ok.bg, ok.label, ok.zone);
  }
  private keeperTab(y0: number, D: number) {
    const lvl = this.d.klvl ?? 1, xp = this.d.xp ?? 0, pts = this.skillPoints();
    const own = (this.d.skills ??= []);
    const top = y0 - 50;
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('dusk')).fillRoundedRect(26, top + 34, W - 52, 12, 5);
    g.fillStyle(col('gold')).fillRoundedRect(26, top + 34, Math.max(10, (W - 52) * Math.min(1, xp / xpNeed(lvl))), 12, 5);
    this.shopObjs.push(
      g,
      this.add.text(26, top, t('Hostinský – úroveň {n}', { n: lvl }), txt(24, PAL.gold)).setDepth(D + 2),
    );
    // body + „?“ = odkud body chodí (panel)
    const pb = this.btn(W - 190, top - 4, 170, 34, () => ((this.ktInfo = !this.ktInfo), this.openShop('keeper', false)), D + 2);
    this.drawBtn(pb, t('body: {n}  ?', { n: pts }), true, pts > 0 ? 'green' : 'plum');
    pb.label.setFontSize(21).setScale(1);
    pb.label.setScale(Math.min(1, 160 / pb.label.width));
    this.shopObjs.push(pb.bg, pb.label, pb.zone);
    // záložky: Výčep / Sklep / Noc / Mistrovství (tečka = jde něco koupit)
    const tabs = [...TREE_BRANCHES, t('Mistrovství')];
    const tw = (W - 20 - 3 * 6) / 4, ty = top + 56;
    tabs.forEach((name, i) => {
      const b = this.btn(10 + i * (tw + 6), ty, tw, 42, () => {
        this.ktab = i;
        this.ktSel = '';
        this.ktInfo = false;
        this.openShop('keeper', false);
      }, D + 2);
      const on = this.ktab === i;
      this.drawBtn(b, name, true, on ? (i < 3 ? TREE_COLORS[i] : 'gold') : 'plum');
      b.label.setScale(Math.min(1, (tw - 10) / b.label.width));
      if (on) b.label.setColor(PAL.ink).setStroke(PAL.ink, 0);
      this.shopObjs.push(b.bg, b.label, b.zone);
      if (i < 3 && pts > 0 && TREE.some((n) => n.branch === i && treeCan(n, own) && n.cost <= pts)) {
        const dot = this.add.graphics().setDepth(D + 5);
        dot.fillStyle(col('ink')).fillCircle(b.x + b.w - 8, b.y + 6, 9).fillStyle(col('scarlet')).fillCircle(b.x + b.w - 8, b.y + 6, 6);
        this.shopObjs.push(dot);
      }
    });
    const ay = ty + 50, ah = MB - 140 - ay, py = ay + ah + 8;
    const area = this.add.graphics().setDepth(D + 1);
    area.fillStyle(col('ink'), 0.55).fillRoundedRect(10, ay, W - 20, ah, 10);
    this.shopObjs.push(area);
    if (this.ktInfo) return this.pointsInfo(ay, D);
    if (this.ktab === 3) return this.masteryTab(ay, ah, py, D);
    const b = this.ktab;
    // strom „Tři cechy“: věž o 8 patrech zdola nahoru, celá na jedné obrazovce; nahoře vrchol a vedle něj koruna
    const bc = col(TREE_COLORS[b]);
    const spent = branchSpent(own, b);
    const capH = Math.min(70, ah * 0.14), rowH = (ah - 20 - capH - 8) / 7;
    const rowY = (f: number) => (f === 7 ? ay + 8 : ay + 8 + capH + 8 + (6 - f) * rowH);
    const X0 = 46, X1 = W - 18;
    const hits: { x: number; y: number; w: number; h: number; id: string }[] = [];
    const tg = this.add.graphics().setDepth(D + 2);
    this.shopObjs.push(tg);
    // páteř věže a čísla pater
    tg.fillStyle(0x4a3f55).fillRoundedRect(24, ay + 14, 6, ah - 28, 3);
    const label = (x: number, y: number, s: string, size: number, color: string, maxW: number, ox = 0) => {
      const o = this.add.text(x, y, s, txt(size, color)).setOrigin(ox, 0.5).setDepth(D + 3);
      o.setScale(Math.min(1, maxW / o.width));
      this.shopObjs.push(o);
      return o;
    };
    const box = (x: number, y: number, w: number, h: number, fill: number, line: number | null, lw = 3) => {
      tg.fillStyle(col('ink')).fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 10);
      tg.fillStyle(fill).fillRoundedRect(x, y, w, h, 9);
      if (line !== null) tg.lineStyle(lw, line).strokeRoundedRect(x - 3, y - 3, w + 6, h + 6, 11);
    };
    // vybraný uzel: ťuknutý, jinak první, co jde koupit (zdola), jinak vrchol
    const bnodes = TREE.filter((n) => n.branch === b);
    const next = bnodes.find((n) => treeCan(n, own) && (n.kind !== 'craft' || n.rank === 1)) ?? bnodes.find((n) => treeCan(n, own));
    const sel = TREE_BY_ID[this.ktSel] && (TREE_BY_ID[this.ktSel].branch === b || this.ktSel === 'crown') ? TREE_BY_ID[this.ktSel] : next ?? bnodes[bnodes.length - 1];
    const lockTxt = (f: number) => (spent < GATE[f] ? t('zámek: {n} b. v cestě', { n: GATE[f] }) : '');
    for (let f = 0; f < 8; f++) {
      const y = rowY(f), h = (f === 7 ? capH : rowH) - 8;
      const fl = floorNodes(b, f);
      label(14 + 13, y + h / 2, String(f + 1), 18, PAL.fog, 20, 0.5);
      if (fl[0].kind === 'craft') {
        const n = fl.filter((x) => own.includes(x.id)).length;
        const nx = fl.find((x) => !own.includes(x.id));
        const can = !!nx && treeCan(nx, own), locked = !n && !can;
        box(X0, y, X1 - X0, h, n ? bc : can ? 0x5d4f6b : 0x3a3045, can && nx && pts >= nx.cost ? col('mint') : null);
        if (sel && fl.includes(sel)) tg.lineStyle(3, col('white')).strokeRoundedRect(X0 - 6, y - 6, X1 - X0 + 12, h + 12, 12);
        label(X0 + 12, y + h / 2, STAT_NAMES[fl[0].stat!](fl[0].val!), 20, locked ? '#7d6d80' : n ? PAL.ink : PAL.bone, 260).setStroke(PAL.ink, n ? 0 : 3);
        const lt = locked ? lockTxt(f) : '';
        if (lt) label(X1 - 10, y + h / 2, lt, 15, '#9a8aa0', 170, 1);
        else for (let r = 0; r < 5; r++) {
          const px = X1 - 14 - (4 - r) * 20 - 14, py2 = y + h / 2 - 7;
          tg.fillStyle(col('ink')).fillRect(px - 2, py2 - 2, 18, 18);
          tg.fillStyle(r < n ? col('white') : 0x3a3045).fillRect(px, py2, 14, 14);
        }
        hits.push({ x: X0, y, w: X1 - X0, h, id: (nx ?? fl[4]).id });
      } else if (fl[0].kind === 'pick') {
        const gap = 44, w = (X1 - X0 - gap) / 2;
        fl.forEach((n, i) => {
          const x = X0 + i * (w + gap);
          const has = own.includes(n.id), why = treeWhy(n, own);
          const fill = has ? bc : why === '' ? 0x5d4f6b : why === 'other' ? 0x2c2433 : 0x3a3045;
          box(x, y, w, h, fill, why === '' && pts >= n.cost ? col('mint') : null);
          if (sel === n) tg.lineStyle(3, col('white')).strokeRoundedRect(x - 6, y - 6, w + 12, h + 12, 12);
          const dim = why === 'other' || why === 'gate' || why === 'below';
          label(x + 8, y + h * 0.34, STAR_TEXT[n.star!][0], 18, has ? PAL.ink : dim ? '#7d6d80' : PAL.bone, w - 16).setStroke(PAL.ink, has ? 0 : 3);
          // štítek „ťukám“ (aktivní hra) / „samo“ (běží samo)
          const tag = this.add.text(x + 8, y + h * 0.74, i ? t('samo') : t('ťukám'), txt(14, PAL.ink)).setOrigin(0, 0.5).setStroke(PAL.ink, 0).setDepth(D + 4);
          tg.fillStyle(col(i ? 'ice' : 'sand')).fillRoundedRect(x + 5, y + h * 0.74 - 10, tag.width + 6, 21, 5);
          tag.setX(x + 8);
          this.shopObjs.push(tag);
          hits.push({ x, y, w, h, id: n.id });
        });
        label(X0 + w + gap / 2, y + h / 2, t('nebo'), 15, PAL.fog, gap - 4, 0.5);
      } else {
        // vrchol + koruna vedle
        const n = fl[0], has = own.includes(n.id), why = treeWhy(n, own);
        const cw = 92, w = X1 - X0 - cw - 10;
        box(X0, y, w, h, has ? bc : 0x3a3045, col('gold'));
        if (sel === n) tg.lineStyle(3, col('white')).strokeRoundedRect(X0 - 7, y - 7, w + 14, h + 14, 13);
        this.starShape(tg, X0 + 26, y + h / 2, 16, has ? col('ink') : col('gold'));
        label(X0 + 50, y + h * 0.33, STAR_TEXT[n.star!][0], 21, has ? PAL.ink : PAL.gold, w - 60).setStroke(PAL.ink, has ? 0 : 3);
        label(X0 + 50, y + h * 0.72, why === 'gate' ? lockTxt(7) : STAR_TEXT[n.star!][1], 14, has ? PAL.ink : PAL.fog, w - 60).setStroke(PAL.ink, has ? 0 : 2);
        hits.push({ x: X0, y, w, h, id: n.id });
        const cr = TREE_BY_ID.crown, hasC = own.includes('crown');
        const caps = TREE.filter((x) => x.kind === 'cap' && own.includes(x.id)).length;
        const cx = X1 - cw;
        box(cx, y, cw, h, hasC ? col('gold') : 0x3a3045, col('gold'));
        if (sel === cr) tg.lineStyle(3, col('white')).strokeRoundedRect(cx - 7, y - 7, cw + 14, h + 14, 13);
        label(cx + cw / 2, y + h * 0.33, t('Koruna'), 17, hasC ? PAL.ink : PAL.gold, cw - 10, 0.5).setStroke(PAL.ink, hasC ? 0 : 3);
        label(cx + cw / 2, y + h * 0.72, `${caps} / 3`, 16, hasC ? PAL.ink : PAL.fog, cw - 10, 0.5).setStroke(PAL.ink, hasC ? 0 : 2);
        hits.push({ x: cx, y, w: cw, h, id: 'crown' });
      }
    }
    // ťuknutí na patro / volbu / vrchol
    const zone = this.add.zone(10, ay, W - 20, ah).setOrigin(0).setInteractive().setDepth(D + 5);
    zone.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      const hit = hits.find((r) => ptr.x >= r.x - 4 && ptr.x <= r.x + r.w + 4 && ptr.y >= r.y - 4 && ptr.y <= r.y + r.h + 4);
      if (!hit) return;
      this.ktSel = hit.id;
      sfx.click();
      this.openShop('keeper', false);
    });
    this.shopObjs.push(zone);
    // panel vybraného uzlu + KOUPIT
    if (!sel) return;
    const pg = this.add.graphics().setDepth(D + 1);
    pg.fillStyle(col('ink'), 0.6).fillRoundedRect(10, py, W - 20, MB - py - 10, 10);
    const has = own.includes(sel.id), can = treeCan(sel, own);
    // u koupeného uzlu: přerozdělení všech bodů za krígly
    if (has) {
      // dvě cesty: za krígly (cena roste) nebo za diamanty (pevná cena)
      const rc = respecCost(this.d.skR ?? 0), gems = this.d.gems ?? 0;
      const reset = () => {
        this.d.skills = [];
        this.tsCache = undefined;
        this.applyKup();
        store(this.d);
        sfx.fanfare();
        this.banner(this.views[0].cam, t('Strom vynulován – body jsou zpět'));
        this.openShop('keeper', false);
      };
      // QA: vynulování bez potvrzení a skoro na místě KOUPIT → nejdřív se zeptat
      const ask = (fn: () => void) => this.askYesNo(t('Vrátit všechny body?'), fn, t('Všechny koupené uzly se smažou a body dostaneš zpět.'));
      const rb = this.btn(20, py + 76, 240, 44, () => {
        if (this.d.krigle < rc) return sfx.error();
        ask(() => {
          if (this.d.krigle < rc) return sfx.error();
          this.d.krigle -= rc;
          this.d.kSpent = (this.d.kSpent ?? 0) + rc;
          this.d.skR = (this.d.skR ?? 0) + 1;
          reset();
        });
      }, D + 6);
      this.drawBtn(rb, t('vrátit body: {n} krígel', { n: rc }), this.d.krigle >= rc, 'plum');
      rb.label.setScale(Math.min(1, 226 / rb.label.width));
      const gb = this.btn(W - 260, py + 76, 240, 44, () => {
        if (gems < RESPEC_GEMS) return sfx.error();
        ask(() => {
          if ((this.d.gems ?? 0) < RESPEC_GEMS) return sfx.error();
          this.d.gems = (this.d.gems ?? 0) - RESPEC_GEMS;
          reset();
        });
      }, D + 6);
      this.drawBtn(gb, t('vrátit body: {n} 💎 (máš {m})', { n: RESPEC_GEMS, m: gems }), gems >= RESPEC_GEMS, 'plum');
      gb.label.setScale(Math.min(1, 226 / gb.label.width));
      this.shopObjs.push(rb.bg, rb.label, rb.zone, gb.bg, gb.label, gb.zone);
    }
    const sc = sel.branch < 3 ? col(TREE_COLORS[sel.branch]) : col('gold');
    pg.fillStyle(col('ink')).fillCircle(50, py + 40, 28).fillStyle(sel.star ? col('gold') : sc).fillCircle(50, py + 40, 25);
    if (sel.star) this.starShape(pg, 50, py + 40, 16, col('ink'));
    else this.treeIcon(pg, sel.branch, 50, py + 40, 22, col('ink'), sc);
    const why = treeWhy(sel, own);
    const head = sel.star
      ? '★ ' + STAR_TEXT[sel.star][0] + (sel.kind === 'pick' ? ' · ' + (sel.side ? t('samo') : t('ťukám')) : '')
      : t('{s} · úroveň {r}/5', { s: STAT_NAMES[sel.stat!](sel.val!), r: sel.rank ?? 1 });
    const whyTxt = why === 'gate' ? t('otevře se po {n} b. v cestě (máš {m})', { n: GATE[sel.floor], m: branchSpent(own, sel.branch) })
      : why === 'other' ? t('vybráno jinak – změna jen vrácením bodů')
      : why === 'below' ? (sel.kind === 'crown' ? t('nejdřív vrchol ve všech třech cestách') : t('nejdřív kup patro pod ním')) : '';
    const sub = has ? (sel.star ? STAR_TEXT[sel.star][1] : t('koupeno')) : whyTxt || (sel.star ? STAT_NAMES_STAR(sel.star) : t('cena: {n} b.', { n: sel.cost }));
    const ht = this.add.text(90, py + 10, head, txt(26, sel.star ? PAL.gold : PAL.bone)).setDepth(D + 2);
    ht.setScale(Math.min(1, (W - 110) / ht.width));
    const st = this.add.text(90, py + 44, sub, txt(18, PAL.fog)).setDepth(D + 2);
    st.setScale(Math.min(1, (!can && !has ? W - 110 : W - 300) / st.width));
    this.shopObjs.push(pg, ht, st);
    if (!has && can) {
      const bb = this.btn(W - 200, py + 64, 180, 50, () => {
        if (pts < sel.cost) return sfx.error();
        own.push(sel.id);
        // řemeslo: další úroveň zůstane vybraná (ťukat KOUPIT dokola)
        const nx = sel.kind === 'craft' ? TREE.find((x) => x.branch === sel.branch && x.floor === sel.floor && x.rank === (sel.rank ?? 0) + 1) : undefined;
        this.ktSel = nx?.id ?? '';
        this.tsCache = undefined;
        this.applyKup();
        sfx.fanfare();
        store(this.d);
        this.openShop('keeper', false);
      }, D + 2);
      this.drawBtn(bb, t('KOUPIT · {n} b.', { n: sel.cost }), pts >= sel.cost, 'green');
      this.shopObjs.push(bb.bg, bb.label, bb.zone);
    }

    function STAT_NAMES_STAR(s: StarId) {
      return STAR_TEXT[s][1] + (has ? '' : ' · ' + t('{n} b.', { n: sel!.cost }));
    }
  }

  /** ikonka uzlu podle cesty: korbel (Výčep), sud (Sklep), měsíc (Noc) */
  private treeIcon(g: Phaser.GameObjects.Graphics, b: number, x: number, y: number, r: number, c: number, bg: number) {
    const s = r * 1.1;
    g.fillStyle(c);
    if (b === 0) {
      g.fillRect(x - s * 0.36, y - s * 0.28, s * 0.56, s * 0.66);
      g.lineStyle(Math.max(2, s * 0.1), c).strokeRect(x + s * 0.2, y - s * 0.12, s * 0.18, s * 0.3);
      g.fillStyle(col('white')).fillRect(x - s * 0.4, y - s * 0.42, s * 0.64, s * 0.16);
    } else if (b === 1) {
      g.fillEllipse(x, y, s * 0.7, s * 0.86);
      g.fillStyle(bg).fillRect(x - s * 0.35, y - s * 0.2, s * 0.7, Math.max(2, s * 0.07)).fillRect(x - s * 0.35, y + s * 0.15, s * 0.7, Math.max(2, s * 0.07));
    } else {
      g.fillCircle(x, y, s * 0.38);
      g.fillStyle(bg).fillCircle(x + s * 0.17, y - s * 0.1, s * 0.32);
    }
  }

  /** záložka Mistrovství: 4 stanice, hodnost, stupeň, postup a bonus */
  private masteryTab(ay: number, ah: number, py: number, D: number) {
    const g = this.add.graphics().setDepth(D + 2);
    this.shopObjs.push(g);
    const rh = ah / 4;
    STATIONS.forEach((def, i) => {
      const y = ay + i * rh, sec = this.d.mast?.[def.id] ?? 0, s = mastStage(sec), { rank, step } = mastRank(s);
      const rc = col(RANK_COLORS[rank]);
      if (s > 0) {
        g.fillStyle(col('ink')).fillPoints([{ x: 22, y: y + 14 }, { x: 70, y: y + 14 }, { x: 70, y: y + 46 }, { x: 46, y: y + 68 }, { x: 22, y: y + 46 }], true);
        g.fillStyle(rc).fillPoints([{ x: 25, y: y + 17 }, { x: 67, y: y + 17 }, { x: 67, y: y + 45 }, { x: 46, y: y + 64 }, { x: 25, y: y + 45 }], true);
        this.shopObjs.push(this.add.text(46, y + 37, String(step), txt(28, PAL.ink)).setOrigin(0.5).setDepth(D + 3));
      } else g.fillStyle(0x3a3045).fillCircle(46, y + 40, 22);
      this.shopObjs.push(
        this.add.text(86, y + 10, STATION_NAMES[1][def.id], txt(24, PAL.bone)).setDepth(D + 3),
        this.add.text(W - 26, y + 12, s > 0 ? `${RANKS[rank]} ${step}/10` : t('zatím nic'), txt(20, s > 0 ? PAL[RANK_COLORS[rank]] : PAL.fog)).setOrigin(1, 0).setDepth(D + 3),
        this.add.text(86, y + 62, t('{n} b. do stromu', { n: s }), txt(16, PAL.fog)).setDepth(D + 3),
      );
      g.fillStyle(col('dusk')).fillRoundedRect(86, y + 40, W - 112, 14, 6);
      g.fillStyle(rc).fillRoundedRect(86, y + 40, Math.max(10, (W - 112) * mastProg(sec)), 14, 6);
    });
    this.shopObjs.push(this.add.zone(14, ay + 4, W - 28, rh - 8).setOrigin(0).setDepth(D + 1));
    const pg = this.add.graphics().setDepth(D + 1);
    pg.fillStyle(col('ink'), 0.6).fillRoundedRect(10, py, W - 20, MB - py - 10, 10);
    const tx = this.add.text(W / 2, py + (MB - py - 10) / 2, t('každý stupeň = 1 bod do stromu · roste samo, i offline'), txt(20, PAL.bone)).setOrigin(0.5).setDepth(D + 2);
    tx.setScale(Math.min(1, (W - 50) / tx.width));
    this.shopObjs.push(pg, tx);
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
    // úvod na 1 řádek (delší překlady se zmenší, nepřekryjí 1. řadu talismanů)
    const intro = this.add.text(20, y0 - 4, t('Vzácné nálezy z událostí, rvaček a návštěv. Vylepšují se za kosti.'), txt(16, PAL.fog)).setDepth(D + 1);
    intro.setScale(Math.min(1, (W - 40) / intro.width));
    this.shopObjs.push(intro);
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
      const lock = b.lvl < BEER_LVL[k];
      const bt = this.btn(10 + i * 175, y0 + 236, 165, 62, () => {
        if (lock) {
          sfx.error();
          return this.banner(this.views[0].cam, t('{s}: od úrovně pivovaru {n}', { s: BEERS[k].name, n: BEER_LVL[k] }));
        }
        b.kind = k;
        store(this.d);
        this.openShop('brew', false);
      }, D + 2);
      // Fable 26. 11.: místo „×2 · čas ×1,6“ konkrétně, za kolik minut a kolik coins
      const mins = Math.round(brewMs({ ...b, kind: k }) / 60000);
      const val = this.visitCtx().income(300 * (1 + 0.009 * (b.lvl - 1)) * BEERS[k].value * (1 + this.ts().beer));
      if (lock) this.drawBtn(bt, `🔒 ${BEERS[k].name}\n${t('od úrovně {n}', { n: BEER_LVL[k] })}`, false, 'slate');
      else this.drawBtn(bt, `${BEERS[k].name}\n${t('{m} min · +{c}', { m: mins, c: big(val) })}`, true, b.kind === k ? 'amber' : 'slate');
      bt.label.setScale(Math.min(1, 150 / bt.label.width));
      this.shopObjs.push(bt.bg, bt.label, bt.zone);
    });
    // prodat / vložit do pivovaru
    const price = this.visitCtx().income(sellSecs(b) * (1 + this.ts().beer));
    const sell = this.btn(10, y0 + 310, 255, 70, () => {
      if (b.stock < 1) return sfx.error();
      if (this.d.brewTut === 0 || this.d.brewTut === 1) this.d.brewTut = 2;
      takeBeer(b);
      this.xp(15);
      this.week('beers');
      this.task('beer', 1);
      this.gain(price);
      sfx.coin(1.2);
      store(this.d);
      this.openShop('brew', false);
    }, D + 2);
    this.drawBtn(sell, t('Prodat pivo\n+{n} coins', { n: big(price) }), b.stock > 0, 'green');
    const inv = this.btn(275, y0 + 310, 255, 70, () => {
      if (b.stock < 1) return sfx.error();
      if (this.d.brewTut === 0 || this.d.brewTut === 1) this.d.brewTut = 2;
      takeBeer(b);
      b.inv++;
      this.week('beers');
      this.task('beer', 1);
      if (b.inv >= lvlCost(b)) {
        b.inv = 0;
        b.lvl++;
        const nb = (Object.keys(BEERS) as BeerKind[]).find((k) => BEER_LVL[k] === b.lvl);
        this.banner(this.views[0].cam, nb ? t('Nové pivo: {s}!', { s: BEERS[nb].name }) : t('Pivovar úroveň {n}!', { n: b.lvl }));
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
      // návrh J4 (výběr uživatele): místo Happy hour ×2 (sčítala se se Šťastnou hodinou ×3) Pivní horečka – 2× víc hostů a objednávek
      { cost: 2, label: t('Pivní horečka\n{m} min: 2× víc hostů', { m: this.happyMin() }), on: happyLeft ? t('běží {t}', { t: mmss(happyLeft) }) : undefined, ok: !happyLeft, run: () => {
        fx.happy = Date.now() + this.happyMin() * 60_000;
        PubView.rushUntil = fx.happy;
        this.banner(this.views[0].cam, t('Pivní horečka! 2× víc hostů na {m} min', { m: this.happyMin() }));
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
        takeBeer(b, a.cost);
        a.run();
        store(this.d);
        this.openShop('brew', false);
      }, D + 2);
      this.drawBtn(bt, a.on ?? `${a.label}\n${a.cost === 1 ? t('1 pivo') : t('{n} piva', { n: a.cost })}`, can, a.on ? 'slate' : 'amber');
      bt.label.setFontSize(18).setScale(Math.min(1, (bw - 10) / bt.label.width));
      this.shopObjs.push(bt.bg, bt.label, bt.zone);
    });
    this.drawBrewBar();
    this.brewTutDraw(y0, D);
  }

  /** mini průvodce pivovarem při prvním otevření: šipka + krátký popisek (v menu žádná velká cedule) */
  /** kdy přejde krok bez akce dál (ms, 0 = nečeká) */
  private brewTutAt = 0;
  private brewTutDraw(y0: number, D: number) {
    const b = this.brew();
    if (this.d.brewTut === undefined) {
      this.d.brewTut = 0;
      if (b.stock < 1) addBeer(b, 1 - b.stock); // první pivo zdarma, ať jde prodej hned vyzkoušet
      store(this.d);
      return this.openShop('brew', false);
    }
    const i = this.d.brewTut;
    if (i < 0) return;
    const steps = [
      { r: [150, this.brewY, 360, 22], text: t('pivo se vaří samo – i offline'), up: true },
      { r: [10, y0 + 310, 255, 70], text: t('první pivo zdarma – prodej ho'), up: false },
      { r: [10, y0 + 420, W - 20, 164], text: t('piva jdou i na pivní akce'), up: false },
    ];
    const st = steps[i];
    if (!st) return;
    const [x, y, w, h] = st.r;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const fr = add(this.add.graphics().setDepth(D + 6));
    fr.lineStyle(4, col('gold')).strokeRoundedRect(x - 4, y - 4, w + 8, h + 8, 10);
    this.tweens.add({ targets: fr, alpha: 0.35, yoyo: true, repeat: -1, duration: 450 });
    // šipka u cíle (nahoru zespodu u tanku, jinak dolů shora) a pod/nad ní jeden řádek textu
    const ax = x + w / 2, ay = st.up ? y + h + 34 : y - 34;
    const ar = add(this.add.graphics().setDepth(D + 7).setPosition(ax, ay));
    const tri = (c: number, g: number) => ar.fillStyle(c).fillTriangle(-20 - g, -12 - g, 20 + g, -12 - g, 0, 20 + g).fillRect(-8 - g, -36 - g, 16 + g * 2, 26);
    tri(col('ink'), 4);
    tri(col('gold'), 0);
    if (st.up) ar.setAngle(180);
    this.tweens.add({ targets: ar, y: ay + (st.up ? 8 : -8), yoyo: true, repeat: -1, duration: 380, ease: 'Sine.inOut' });
    const tx = add(this.add.text(W / 2, st.up ? ay + 46 : ay - 58, st.text, txt(24, PAL.gold)).setOrigin(0.5).setDepth(D + 7).setBackgroundColor(PAL.ink).setPadding(12, 6, 12, 6));
    tx.setScale(Math.min(1, (W - 30) / tx.width));
    // kroky bez akce jdou dál samy (3,5 s); prodej čeká na ťuknutí na Prodat / Vylepšit
    this.brewTutAt = i !== 1 ? Date.now() + 3500 : 0;
  }

  private brewTutNext() {
    this.brewTutAt = 0;
    const from = this.d.brewTut ?? -1;
    // menu zavřené → krok počká, až se pivovar zase otevře
    if (from < 0 || this.tab !== 'brew' || !this.shopObjs.length) return;
    this.d.brewTut = from + 1 >= 3 ? -1 : from + 1;
    store(this.d);
    if (this.tab === 'brew' && this.shopObjs.length) this.openShop('brew', false);
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
  private row(y: number, h: number, D: number, title: string, sub: string, boxCol: keyof typeof PAL = 'ink', titleCol: string = PAL.bone, maxW = h < 70 ? 240 : 300) {
    const box = this.add.graphics().setDepth(D + 1);
    box.fillStyle(col(boxCol), boxCol === 'ink' ? 0.6 : 0.7).fillRoundedRect(10, y, W - 20, h - 8, 10);
    const name = this.add.text(26, y + (h < 70 ? 5 : 8), title, txt(h > 85 ? 26 : 22, titleCol)).setDepth(D + 1);
    name.setScale(Math.min(1, maxW / name.width));
    const st = this.add.text(26, y + (h > 85 ? 46 : h < 70 ? 33 : 40), sub, txt(h < 70 ? 16 : 18, PAL.fog)).setDepth(D + 1);
    // dlouhý podtitulek (de/fr/ru…): radši zalomit na 2 řádky, než ho zmáčknout na nečitelné písmo (QA)
    if (st.width * 0.85 > maxW) {
      st.setFontSize(h < 70 ? 13 : 15).setLineSpacing(-2).setWordWrapWidth(maxW).setY(st.y - 4);
      if (st.y + st.height > y + h - 9) st.setWordWrapWidth(null as unknown as number).setFontSize(h < 70 ? 16 : 18).setLineSpacing(0).setY(st.y + 4);
    }
    st.setScale(Math.min(1, maxW / st.width));
    this.shopObjs.push(box, name, st);
  }

  private shopTab(y0: number, D: number, RH: number) {
    y0 += 48;
    if (this.shopSub === 'decor') return this.decorTab(y0, D);
    if (this.shopSub === 'bones') return this.bonesTab(y0, D);
    const offer = this.shopOffer().slice(0, 4);
    const k = this.kriglyNow();
    const kv = { k: big(this.d.krigle), b: big(Math.round(this.kAll() * KRIGL_BONUS * 100)), g: GEMS_FREE.prestige };
    this.row(y0, RH, D, t('Zavolat hygienu'), this.hygGemsLeft() > 0 ? t('krígly: {k} (+{b} % výdělek) · hygiena +{g} 💎', kv) : t('krígly: {k} (+{b} % výdělek) · 💎 zase zítra', kv), 'blood', PAL.sand);
    const pb = this.btn(W - 212, y0 + 12, 190, 62, () => this.askPrestige(), D + 2);
    this.hygBtn = pb;
    const pm = prestigeMin(this.d.stats.prestiges);
    this.drawBtn(pb, k >= pm ? t('+{k} krígel', { k: big(k) }) : t('{k} / {m} krígel', { k: big(k), m: big(pm) }), k >= pm, 'red');
    this.shopObjs.push(pb.bg, pb.label, pb.zone);
    if (!offer.length) this.shopObjs.push(this.add.text(W / 2, y0 + 150, t('Teď tu nic není.\nOtevři další stanice.'), txt(22, PAL.fog)).setOrigin(0.5).setAlign('center').setDepth(D + 1));
    offer.forEach((o, i) => {
      const y = y0 + (i + 1) * RH;
      this.row(y, RH, D, o.title, o.sub);
      const b = this.btn(W - 212, y + 12, 190, 62, () => o.buy(), D + 2);
      b.denied = () => this.coinVidChip(b, o.cost);
      this.shopRows.push({ o, b });
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
  }

  // ---------- úkoly a úspěchy ----------
  private daily() {
    if (this.d.daily.day < today()) {
      // pestřejší denní úkoly (návrh J2): druhy z částí hry, které už hráč má
      const ex: TaskKind[] = [];
      if (!this.tileLock('brew')) ex.push('beer');
      if (!this.tileLock('darts') && this.d.darts && autoOn(this.d.darts)) ex.push('darts');
      if (this.d.stats.prestiges >= 1) ex.push('vip');
      if (this.d.nightInfo) ex.push('night');
      if (!this.tileLock('temple') && isWeekend()) ex.push('temple');
      this.d.daily = newDaily(this.totalRate(), ex);
    }
    return this.d.daily;
  }

  private totalRate() {
    return this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
  }

  private task(kind: TaskKind, n: number) {
    const R = this.rk();
    if (R && kind !== 'levels' && kind !== 'earn' && kind !== 'temple') rekoCount(R, kind, n);
    for (const tk of this.daily().tasks) if (tk.kind === kind && !tk.claimed) tk.prog = Math.min(tk.goal, tk.prog + n);
  }

  /** je co vyzvednout (úkol nebo úspěch)? */
  private claimable() {
    const w = this.weekly();
    return (w.prog >= w.goal && !w.claimed) || (w.claimed && !w.gc && (w.gp ?? 0) >= w.goal * GOLD_WEEK_X) || this.daily().tasks.some((k) => !k.claimed && k.prog >= k.goal);
  }

  /** úspěch k vyzvednutí (úspěchy jsou ve Sbírce – úkoly sloučené do 3 řad, přání uživatele 25. 11.) */
  private achClaimable() {
    return ACHIEVEMENTS.some((a) => !this.d.ach.includes(a.id) && a.done(this.d));
  }

  private taskReward() {
    return Math.max(100, Math.round(Math.max(this.totalRate(), this.pay(this.d.pubs[0], STATIONS[0]) / STATIONS[0].cycle) * 300 * (1 + this.ts().daily)));
  }

  private weekly() {
    // jen novější týden (hodiny zpět nesmí výzvu obnovit znovu)
    if (!this.d.weekly || weekNum(this.d.weekly.week) < weekNum(weekId())) this.d.weekly = newWeekly();
    return this.d.weekly!;
  }

  private week(kind: WeekKind, n = 1) {
    const R = this.rk();
    if (R && (kind === 'brawls' || kind === 'visitors')) rekoCount(R, kind, n);
    const w = this.weekly();
    if (w.kind !== kind) return;
    if (!w.claimed) w.prog = Math.min(w.goal, w.prog + n);
    else if (!w.gc) w.gp = Math.min(w.goal * GOLD_WEEK_X, (w.gp ?? w.goal) + n);
  }

  private tasksTab(y0: number, D: number) {
    const RH = 80;
    const head = (y: number, s: string) => this.shopObjs.push(this.add.text(20, y, s, txt(24, PAL.gold)).setWordWrapWidth(500).setDepth(D + 1));
    // úkol od hostinského je jen v liště nad hospodou (přání uživatele: v záložce Úkoly ho nechce)
    // týdenní výzva
    {
      const w = this.weekly();
      const done = w.prog >= w.goal;
      this.row(y0 - 4, RH, D, t('Týdenní výzva: {s}', { s: weekText(w.kind, w.goal) }), w.claimed ? t('hotovo – další v pondělí') : `${w.prog} / ${w.goal} · ${t('odměna: talisman + 5 krígel')}`, 'plum', PAL.sand);
      const b = this.btn(W - 172, y0 + 6, 150, 54, () => {
        if (w.claimed || w.prog < w.goal) return sfx.error();
        w.claimed = true;
        this.spPts('weekly');
        this.d.krigle += 5;
        const R = this.rk();
        if (R) rekoCount(R, 'weekly');
        this.tryDrop(1);
        store(this.d);
        this.openShop('tasks', false);
      }, D + 2);
      this.drawBtn(b, w.claimed ? '✓' : done ? t('Vybrat') : `${Math.floor((w.prog / w.goal) * 100)} %`, done && !w.claimed, 'green');
      this.shopObjs.push(b.bg, b.label, b.zone);
      // zlatá výzva (návrh J3): po vyzvednutí stejný úkol do 3× cíle, odměna 💎 + kosti
      if (w.claimed) {
        y0 += RH + 4;
        const gg = w.goal * GOLD_WEEK_X, gp = w.gp ?? w.goal, gd = gp >= gg;
        this.row(y0 - 4, RH, D, t('Zlatá výzva: {s}', { s: weekText(w.kind, gg) }), w.gc ? t('hotovo – další v pondělí') : `${gp} / ${gg} · ${t('odměna: {g} 💎 + kosti', { g: GOLD_WEEK_GEMS })}`, 'plum', PAL.gold);
        const b2 = this.btn(W - 172, y0 + 6, 150, 54, () => {
          if (w.gc || (w.gp ?? w.goal) < gg) return sfx.error();
          w.gc = true;
          this.d.gems = (this.d.gems ?? 0) + GOLD_WEEK_GEMS;
          this.d.bones = (this.d.bones ?? 0) + Math.max(50, Math.round(this.bonesPerSec() * 3600 * 2));
          sfx.fanfare();
          store(this.d);
          this.openShop('tasks', false);
        }, D + 2);
        this.drawBtn(b2, w.gc ? '✓' : gd ? t('Vybrat') : `${Math.floor((gp / gg) * 100)} %`, gd && !w.gc, 'green');
        this.shopObjs.push(b2.bg, b2.label, b2.zone);
      }
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
        this.spPts('daily');
        const n = this.taskReward();
        this.gain(n);
        sfx.fanfare();
        store(this.d);
        this.openShop('tasks', false);
      }, D + 2);
      this.drawBtn(b, tk.claimed ? '✓' : done ? t('+{n}', { n: big(this.taskReward()) }) : t('{p} %', { p: Math.floor((tk.prog / tk.goal) * 100) }), done && !tk.claimed, 'green');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    // úspěchy jsou ve Sbírce (přání uživatele 25. 11.: úkoly jen ve 3 řadách – denní, týdenní, Kniha hostinského v liště)
    const y1 = y0 + 34 + 3 * RH + 12;
    // Kniha hostinského (3. řada úkolů): kapitola, postup a tlačítko do Knihy
    const R = this.rk();
    if (R) {
      const ks = chapter(R.star + 1), nd = ks.filter((k) => R.done.includes(k.id)).length, rd = ks.some((k) => !R.done.includes(k.id) && taskDone(k, this.d, R));
      const stars = rkStars(R.star);
      this.row(y1, RH, D, t('Kniha hostinského {s}', { s: stars }), R.star >= REKO_STARS ? t('legendární podnik') : rekoReady(R) ? t('kapitola hotová: Rekonstrukce ★{n}', { n: R.star + 1 }) : t('kapitola ★{n}: {a} / {b} úkolů', { n: R.star + 1, a: nd, b: ks.length }), 'maroon', PAL.gold);
      const b = this.btn(W - 172, y1 + 10, 150, 54, () => this.rekoBook(), D + 2);
      this.drawBtn(b, t('Otevřít'), true, rd || rekoReady(R) ? 'green' : 'amber');
      this.shopObjs.push(b.bg, b.label, b.zone);
    }
    // sezónní pass (běží od SPASS_START): řádek pod Knihou
    let y2 = y1 + (R ? RH : 0);
    const sp = spassSync(this.d.spass);
    if (sp) {
      this.d.spass = sp;
      const can = Array.from({ length: SPASS_TIERS }, (_, i) => i + 1).some((n) => spassCan(sp, n, false) || spassCan(sp, n, true));
      this.row(y2, RH, D, t('Sezónní pass: {s}', { s: spassName(sp.s) }), t('stupeň {a} / {b}', { a: spassTier(sp), b: SPASS_TIERS }), 'plum', PAL.gold);
      const b = this.btn(W - 172, y2 + 10, 150, 54, () => this.spassWin(), D + 2);
      this.drawBtn(b, t('Otevřít'), true, can ? 'green' : 'amber');
      this.shopObjs.push(b.bg, b.label, b.zone);
      y2 += RH;
    }
    // ★8: Relikviář (návrh C)
    if ((R?.star ?? 0) >= RELIC_STAR) {
      this.row(y2, RH, D, t('Relikviář'), t('{a} / {b} relikvií z Chrámu', { a: this.d.relics?.length ?? 0, b: RELICS.length }), 'ink', PAL.sky);
      const b = this.btn(W - 172, y2 + 10, 150, 54, () => this.relicWin(), D + 2);
      this.drawBtn(b, t('Otevřít'), true, 'slate');
      this.shopObjs.push(b.bg, b.label, b.zone);
      y2 += RH;
    }
    // pozdní hra (pass + Relikviář): řádek s úspěchem jen když se vejde nad spodní lištu
    if (this.achClaimable() && y2 + 30 < MB) head(y2, t('Splněný úspěch čeká ve Sbírce → Úspěchy'));
  }

  // ---------- nastavení ----------
  private optsTab(y0: number, D: number) {
    // řádky o kus výš (nad nimi je jen číslo verze): s řádkem „Jak to funguje“ jich je na webu až 10
    // a výška řádku musí zůstat ≥ 59 log. px = dotykové místo ≥ 44 CSS px
    y0 -= 16;
    // výška řádku tak, aby se vešly všechny (nápověda, zvuky, hudba, záloha, jazyk, složka, upozornění, začít znovu)
    // poslední řádek: tři tlačítka – v aplikaci Ohodnotit / Sdílet / Soukromí, na webu místo hodnocení „Hra do složky“
    // (v aplikaci pro Android zip ke stažení není; řádků tak zůstává nejvýš 10)
    const native = Capacitor.isNativePlatform(), web = location.protocol.startsWith('http') && !native;
    const n = 7 + (devMode ? 1 : 0) + (notify.available ? 1 : 0) + (meter.available ? 1 : 0);
    const RH = Math.min(96, Math.floor((MB - y0 - 6) / n));
    // číslo verze; 7 ťuknutí za sebou (do 3 s) přepne skrytý vývojářský režim (admin věci, např. varianty zvuku výdělku)
    const ver = this.add.text(W - 12, y0 - 4, t('verze {v}', { v: __APP_VERSION__ }) + (devMode ? ' · dev' : ''), txt(16, PAL.fog)).setOrigin(1, 1).setDepth(D + 2);
    ver.setInteractive({ useHandCursor: false }).on('pointerdown', () => {
      const now = Date.now();
      this.devTaps = now - this.devTapAt < 3000 ? this.devTaps + 1 : 1;
      this.devTapAt = now;
      if (this.devTaps < 7) return;
      this.devTaps = 0;
      devMode = !devMode;
      if (!devMode) sfx.coinStyle = 0;
      saveOpts();
      sfx.fanfare();
      this.openShop('opts', false);
    });
    this.shopObjs.push(ver);
    // nápověda „Jak to funguje“ nahoře (přání uživatele: informace o různých věcech ve hře)
    {
      this.row(y0, RH, D, t('Jak to funguje'), t('stručně o všem, co ve hře je'), 'ink', PAL.bone, Math.min(RH < 70 ? 240 : 300, W - 232 - 34));
      const bs = Math.min(60, RH - 14);
      const b = this.btn(W - 232, y0 + (RH - 8 - bs) / 2, 210, bs, () => this.openHelp(), D + 2);
      this.drawBtn(b, t('Ukázat'), true, 'blue');
      this.shopObjs.push(b.bg, b.label, b.zone);
      y0 += RH;
    }
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
      // tlačítka podle výšky řádku (v Nastavení je řádků víc – nesmí přesahovat do dalšího)
      const bs = Math.min(60, RH - 14), by = y + (RH - 8 - bs) / 2;
      const minus = this.btn(W - 232, by, 60, bs, () => step(-0.1), D + 2);
      this.drawBtn(minus, '−', v > 0, 'plum');
      const plus = this.btn(W - 82, by, 60, bs, () => step(0.1), D + 2);
      this.drawBtn(plus, '+', v < 1, 'plum');
      const val = this.add.text(W - 127, by + bs / 2, v > 0 ? `${Math.round(v * 100)} %` : t('vypnuto'), txt(22, v > 0 ? PAL.gold : PAL.slate)).setOrigin(0.5).setDepth(D + 2);
      val.setScale(Math.min(1, 84 / val.width));
      // proužek hlasitosti pod názvem
      const bar = this.add.graphics().setDepth(D + 2);
      bar.fillStyle(col('ink')).fillRoundedRect(26, y + RH - 30, 230, 12, 6);
      if (v > 0) bar.fillStyle(col('gold')).fillRoundedRect(26, y + RH - 30, 230 * v, 12, 6);
      this.shopObjs.push(minus.bg, minus.label, minus.zone, plus.bg, plus.label, plus.zone, val, bar);
    });
    const CS = [t('A melodie'), t('B náhodně'), t('C střídání'), t('vypnuto')];
    const rows: [string, string, () => void][] = [[t('Jazyk / Language'), LANGS[lang], () => this.pickLang(false)]];
    // zvuk výdělku (varianty A/B/C/vypnuto) je admin věc – jen ve vývojářském režimu (přání uživatele 25. 11. 2026)
    if (devMode)
      rows.push([t('Zvuk výdělku'), CS[sfx.coinStyle] ?? CS[0], () => {
        sfx.coinStyle = (sfx.coinStyle + 1) % 4;
        saveOpts();
        for (let k = 0; k < 6; k++) this.time.delayedCall(k * 300, () => sfx.coin(1));
      }]);
    // offline verze do složky (zip s index.html) – nabízí se jen na webu, ne ve hře spuštěné z disku
    // záloha hry: dvě tlačítka v jednom řádku; v aplikaci s Google Play Hrami místo ní žebříčky a cloud
    if (pg.available) {
      const y = y0 + vols.length * RH;
      const mins = pg.savedAt ? Math.floor((Date.now() - pg.savedAt) / 60000) : -1;
      this.row(y, RH, D, t('Google Play Hry'), !pg.signedIn ? t('nepřihlášeno – žebříčky a cloud') : mins < 0 ? t('cloud: ukládá se samo') : t('ukládá se samo · naposledy před {n} min', { n: mins }), 'ink', PAL.bone, Math.min(RH < 70 ? 240 : 300, W - 232 - 34));
      const bs = Math.min(60, RH - 14), by = y + (RH - 8 - bs) / 2;
      const lb = this.btn(W - 232, by, 102, bs, () => {
        sfx.click();
        meter.track('pg_boards', { from: 'opts' });
        void showBoards().then((ok) => ok || this.banner(this.views[0].cam, t('Google Play Hry teď nejdou – zkus to později')));
      }, D + 2);
      this.drawBtn(lb, t('Žebříčky'), true, 'blue');
      const sv = this.btn(W - 124, by, 102, bs, () => {
        sfx.click();
        void (pg.signedIn ? pgSaveNow() : pgSignIn()).then((ok) => {
          if (pg.signedIn && ok) this.banner(this.views[0].cam, t('Uloženo v cloudu Google Play'));
          else if (!ok) this.banner(this.views[0].cam, t('Google Play Hry teď nejdou – zkus to později'));
          if (this.tab === 'opts') this.openShop('opts', false);
        });
      }, D + 2);
      this.drawBtn(sv, pg.signedIn ? t('Uložit teď') : t('Přihlásit'), true, 'green');
      this.shopObjs.push(lb.bg, lb.label, lb.zone, sv.bg, sv.label, sv.zone);
    } else {
      const y = y0 + vols.length * RH;
      this.row(y, RH, D, t('Záloha hry'), t('přenos mezi webem a složkou'), 'ink', PAL.bone, Math.min(RH < 70 ? 240 : 300, W - 232 - 34));
      const bs = Math.min(60, RH - 14), by = y + (RH - 8 - bs) / 2;
      const sv = this.btn(W - 232, by, 102, bs, () => {
        downloadBackup(exportSave(this.d));
        this.banner(this.views[0].cam, t('Záloha uložena'));
      }, D + 2);
      this.drawBtn(sv, t('Uložit'), true, 'green');
      const ld = this.btn(W - 124, by, 102, bs, () =>
        pickBackup((text) => {
          if (!importSave(text)) return this.banner(this.views[0].cam, t('Tohle není záloha hry'));
          location.reload();
        }), D + 2);
      this.drawBtn(ld, t('Nahrát'), true, 'amber');
      this.shopObjs.push(sv.bg, sv.label, sv.zone, ld.bg, ld.label, ld.zone);
    }
    if (notify.available)
      rows.push([t('Upozornění'), notesOn ? t('zapnuto') : t('vypnuto'), () => {
        if (notesOn) {
          notesOn = false;
          return;
        }
        void notify.permit().then((ok) => {
          notesOn = ok;
          saveOpts();
          if (!ok) this.banner(this.views[0].cam, t('Upozornění nejsou povolená v telefonu'));
          else if (notify.webOnly) this.banner(this.views[0].cam, t('Na webu přijdou, jen dokud je prohlížeč otevřený'));
          if (this.tab === 'opts') this.openShop('opts', false);
        });
      }]);
    if (meter.available)
      rows.push([t('Statistiky'), statsOff ? t('vypnuto') : t('zapnuto'), () => {
        statsOff = !statsOff;
        meter.set(!statsOff);
      }]);
    // začít znovu: první ťuk se zeptá, druhý smaže uloženou hru
    const ask = Date.now() - this.wipeAsk < 6000;
    if (ask) this.time.delayedCall(6100, () => this.tab === 'opts' && this.shopObjs.length && this.openShop('opts', false));
    rows.push([t('Začít znovu'), ask ? t('Opravdu? Ťukni znovu') : t('Smazat hru'), () => {
      if (!ask) return void (this.wipeAsk = Date.now());
      if (Date.now() - this.wipeAsk < 1000) return; // dvojťuk nesmí smazat hru (QA hospoda 66)
      wipe();
      location.reload();
    }]);
    rows.forEach(([title, val, fn], i) => {
      i += vols.length + 1;
      const y = y0 + i * RH;
      this.row(y, RH, D, title, title === t('Upozornění') ? t('plná hospoda, VIP host, truhla, chrám') : title === t('Statistiky') ? t('anonymní – pomáhají hru vylepšovat') : title === t('Začít znovu') ? t('celá hra od začátku, i s návodem') : title === t('Zvuk výdělku') ? t('cinkání stanic – ťukni = přepni a poslechni') : '', 'ink', PAL.bone, Math.min(RH < 70 ? 240 : 300, W - 232 - 34)); // text nesmí pod tlačítko (od W − 232)
      const bs = Math.min(60, RH - 14);
      const b = this.btn(W - 232, y + (RH - 8 - bs) / 2, 210, bs, () => {
        fn();
        saveOpts();
        this.openShop('opts', false);
      }, D + 2);
      this.drawBtn(b, val, true, title === t('Začít znovu') ? (ask ? 'red' : 'amber') : 'plum');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    // ohodnotit / sdílet / zásady soukromí: tři tlačítka přes celou šířku řádku
    {
      const y = y0 + (vols.length + 1 + rows.length) * RH;
      const bs = Math.min(60, RH - 14), by = y + (RH - 8 - bs) / 2, gap = 10, bw = Math.floor((W - 44 - 2 * gap) / 3);
      const links: [string, keyof typeof PAL, () => void][] = [
        web ? [t('Hra do složky'), 'green', downloadOffline] : [t('Ohodnotit'), 'green', () => openExternal(PLAY_URL)],
        [t('Sdílet'), 'blue', () => void shareGame().then((r) => {
          // zrušené systémové okno Sdílet je taky „fail“ – hláška jen když nešlo ani zkopírovat odkaz
          if (r === 'copied') this.banner(this.views[0].cam, t('Odkaz zkopírován'));
          else if (r === 'fail' && !native && !navigator.share) this.banner(this.views[0].cam, t('Sdílení tu nejde'));
        })],
        [t('Soukromí'), 'plum', () => openExternal(PRIVACY_URL())],
      ];
      links.forEach(([label, c, fn], k) => {
        const b = this.btn(22 + k * (bw + gap), by, bw, bs, () => {
          sfx.click();
          meter.track('opts_link', { k });
          fn();
        }, D + 2);
        this.drawBtn(b, label, true, c);
        this.shopObjs.push(b.bg, b.label, b.zone);
      });
    }
    const fy = y0 + (vols.length + 2 + rows.length) * RH + 30;
    if (fy < MB - 10) this.shopObjs.push(this.add.text(W / 2, fy, lang === 'cs' ? 'P.U.B. Idle – Pajzl Tycoon' : 'P.U.B. Idle: Pub Tycoon', txt(18, PAL.slate)).setOrigin(0.5).setDepth(D + 1));
  }

  // ---------- nápověda „Jak to funguje“ (src/ui/help.ts) ----------
  /** otevře nápovědu z Nastavení (seznam témat od začátku) */
  private openHelp() {
    helpState.sel = -1;
    helpState.scroll = 0;
    helpState.last = -1;
    this.openShop('help', false);
  }

  /** Zpět v nápovědě (tlačítko i Android Zpět / Escape): z tématu do seznamu, ze seznamu do Nastavení */
  private helpBack() {
    if (helpState.sel >= 0) {
      helpState.sel = -1;
      this.openShop('help', false);
    } else this.openShop('opts', false);
  }

  private helpTab(y0: number, D: number) {
    helpPanel(
      {
        scene: this,
        add: (o) => (this.shopObjs.push(o), o),
        button: (x, y, w, h, label, c, on, fn) => {
          const b = this.btn(x, y, w, h, fn, D + 2);
          this.drawBtn(b, label, on, c);
          this.shopObjs.push(b.bg, b.label, b.zone);
        },
        locked: (k) => this.tileLock(k) !== null,
        show: (sel) => ((helpState.sel = sel), this.openShop('help', false)),
      },
      y0,
      MB - 8,
      W,
      D,
    );
  }

  // ---------- speciální nabídka: denní truhla, reklamní kampaň, VIP host ----------
  /** výdělek za h hodin (odměny truhly a VIP; aspoň něco i na začátku hry) */
  private hoursIncome(h: number) {
    const r = this.d.pubs.reduce((a, p) => a + Math.max(this.rate(p), this.pay(p, STATIONS[0]) / STATIONS[0].cycle), 0);
    return Math.max(50 * h, Math.round(r * h * 3600));
  }

  private krigleTxt(n: number) {
    return n === 1 ? t('{n} krígl', { n }) : n < 5 ? t('{n} krígly', { n }) : t('{n} krígel', { n });
  }

  /** množství odměny truhly podle postupu (kosti z nočního výdělku, šipky z toulce, krígly z vlastněných) */
  private chestN(r: ChestRew): number {
    if (r.k === 'bones') return Math.max(r.n, Math.round(this.bonesPerSec() * 3600 * (r.h ?? 0)));
    if (r.k === 'darts') return Math.max(r.n, Math.round(dartCap(this.dartsData().up) * (r.q ?? 0)));
    if (r.k === 'krigle') return Math.max(r.n, Math.ceil(this.d.krigle * (r.f ?? 0)));
    if (r.k === 'gold') return Math.max(GOLD_KRIGLE, Math.ceil(this.d.krigle * GOLD_KRIGLE_F));
    return 0;
  }

  /** popis odměny truhly (x = násobek za reklamu) */
  private chestRewText(r: ChestRew, x = 1): string {
    switch (r.k) {
      case 'coins': return t('{n} coins', { n: big(this.hoursIncome(r.h * x)) });
      case 'bones': return t('{n} kostí', { n: big(this.chestN(r) * x) });
      case 'darts': return t('{n} šipek', { n: big(this.chestN(r) * x) });
      case 'krigle': return this.krigleTxt(this.chestN(r) * x);
      case 'gold': return t('+{p} bod pro číšníka + {k} + {g} 💎', { p: x, k: this.krigleTxt(this.chestN(r) * x), g: GOLD_GEMS * x });
    }
  }

  /** dá odměnu truhly, vrátí text na oslavu */
  private chestGive(r: ChestRew, x: number): string {
    const txt0 = (r.k === 'gold' ? '' : '+') + this.chestRewText(r, x);
    if (r.k === 'coins') {
      const n = this.hoursIncome(r.h * x);
      this.gain(n);
      return t('+{n} coins', { n: big(n) });
    }
    const n = this.chestN(r) * x;
    if (r.k === 'bones') this.d.bones = (this.d.bones ?? 0) + n;
    else if (r.k === 'darts') this.dartsData().have += n;
    else if (r.k === 'krigle') this.d.krigle += n;
    else {
      // zlatá truhla: bod číšníkovi s nejméně body (bez číšníků 8 h výdělku) + krígly
      this.d.krigle += n;
      this.d.gems = (this.d.gems ?? 0) + GOLD_GEMS * x;
      for (let i = 0; i < x; i++) {
        const ws = this.d.pubs.flatMap((p) => p.w ?? []).filter((w) => wEarned(w) < MAX_POINTS);
        if (!ws.length) {
          this.gain(this.hoursIncome(8));
          continue;
        }
        const w = ws.reduce((a, b) => (wEarned(b) < wEarned(a) ? b : a));
        w.xp = Math.max(w.xp ?? 0, xpFor(wEarned(w) + 1));
      }
    }
    return txt0;
  }

  /** otevře denní truhlu (x2 = za reklamu) */
  private async chestOpen(x2: boolean) {
    if (!chestReady(this.d.chest)) return;
    if (x2 && !(await this.rewarded())) return this.banner(this.views[0].cam, t('Reklama se nepřehrála'));
    if (!chestReady(this.d.chest)) return;
    const { st, day } = openChest(this.d.chest);
    this.d.chest = st;
    this.spPts('chest');
    const txt1 = this.chestGive(CHEST_REW[day - 1], x2 ? 2 : 1);
    store(this.d);
    this.tsCache = undefined;
    const x = W / 2, y = 420, D = 470;
    rays(this, x, y, D - 5, 300);
    bigText(this, x, y - 130, day === 7 ? t('ZLATÁ TRUHLA!') : t('TRUHLA DNE!'), txt1, D + 2);
    confetti(this, x, y, day === 7 ? 70 : 40, D + 1, 0.9);
    const c = this.add.image(x, y + 30, 'obj', 'chest').setScale(1).setDepth(D);
    if (day === 7) c.setTint(col('gold'));
    this.tweens.add({ targets: c, scale: 7, duration: 380, ease: 'Back.out' });
    this.tweens.add({ targets: c, alpha: 0, delay: 1600, duration: 400, onComplete: () => c.destroy() });
    this.cameras.main.shake(200, 0.01);
    sfx.levelUp();
    sfx.cheer();
    if (this.tab === 'chest' && this.shopObjs.length) this.openShop('chest', false);
    this.chestHudDraw();
  }

  /** ikona truhly v hospodě (jen když je připravená) */
  chestBg?: Phaser.GameObjects.Graphics;
  chestHud?: { img: Phaser.GameObjects.Image; dot: Phaser.GameObjects.Graphics; zone: Phaser.GameObjects.Zone };
  private chestHudDraw() {
    // cedule stylu je v rohu nahoře, truhla vlevo vedle ní (když se tam vejde vedle schopnosti manažera), jinak pod ní
    // (návrh B: celá místnost je vidět – truhla pod cedulí by zakrývala horní řadu stolů)
    const top = this.pubTop() + 8 + this.qOff();
    const beside = !!this.signBot && this.signLeft - 76 > 176;
    const x = beside ? this.signLeft - 40 : W - 40;
    const y = beside ? top + 32 : this.signBot ? this.signBot + 40 : top + 32;
    if (!this.chestHud) {
      const bg = this.add.graphics().setDepth(59);
      const img = this.add.image(x, y, 'obj', 'chest').setScale(3).setDepth(60);
      const dot = this.add.graphics().setDepth(61);
      this.chestBg = bg;
      const zone = this.add.zone(x - 32, y - 32, 64, 64).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(62);
      zone.on('pointerdown', () => {
        if (!zone.visible) return;
        sfx.init();
        void this.chestOpen(false); // M3: ťuk na truhlu ji rovnou otevře (odměna na hlavní obrazovce)
      });
      this.tweens.add({ targets: img, angle: { from: -6, to: 6 }, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.inOut' });
      this.chestHud = { img, dot, zone };
    }
    const h = this.chestHud;
    const on = chestReady(this.d.chest) && (this.d.tut ?? -1) < 0;
    h.img.setPosition(x, y).setVisible(on);
    h.zone.setPosition(x - 32, y - 32).setVisible(on);
    this.chestBg?.clear();
    if (on) this.chestBg?.fillStyle(col('ink'), 0.75).fillCircle(x, y, 31).lineStyle(3, col('gold')).strokeCircle(x, y, 31);
    h.dot.clear();
    if (on && !(this.calmDots() && this.navDotOn[1])) h.dot.fillStyle(col('ink')).fillCircle(x + 22, y - 22, 11).fillStyle(col('scarlet')).fillCircle(x + 22, y - 22, 8);
  }

  /** záložka Denní truhla (návrh A: kalendář 7 dní) */
  private chestTab(y0: number, D: number) {
    const ready = chestReady(this.d.chest);
    const day = chestDay(this.d.chest);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    add(this.add.text(W / 2, y0 + 82, ready ? t('Série: {d}. den – otevři dnešní truhlu', { d: day }) : t('Série: {d}. den – přijď zítra pro další', { d: day }), txt(20, PAL.fog)).setOrigin(0.5).setDepth(D + 2));
    const tw = (W - 40) / 3, th = 128;
    const doneN = ready ? day - 1 : day;
    for (let i = 0; i < 6; i++) {
      const x = 10 + (i % 3) * (tw + 10), y = y0 + 108 + Math.floor(i / 3) * (th + 8);
      const done = i < doneN, today = ready && i === day - 1;
      const g = add(this.add.graphics().setDepth(D + 1));
      g.fillStyle(col(today ? 'amber' : done ? 'green' : 'ink')).fillRoundedRect(x, y, tw, th, 10);
      add(this.add.text(x + tw / 2, y + 16, t('{n}. den', { n: i + 1 }), txt(20, PAL.white)).setOrigin(0.5).setDepth(D + 2));
      add(this.add.image(x + tw / 2, y + 60, 'obj', 'chest').setScale(2.5).setDepth(D + 2).setAlpha(done ? 0.5 : 1));
      const lb = add(this.add.text(x + tw / 2, y + 104, done ? '✓' : this.chestRewText(CHEST_REW[i]), txt(done ? 26 : 18, done ? PAL.white : PAL.bone)).setOrigin(0.5).setAlign('center').setDepth(D + 2));
      lb.setWordWrapWidth(tw - 12);
      lb.setScale(Math.min(1, (tw - 10) / lb.width, 44 / lb.height));
    }
    // 7. den: zlatá truhla
    const gy = y0 + 108 + 2 * (th + 8);
    const gold = ready && day === 7, gDone = doneN >= 7;
    const g = add(this.add.graphics().setDepth(D + 1));
    g.fillStyle(col(gold ? 'amber' : gDone ? 'green' : 'ink')).fillRoundedRect(10, gy, W - 20, 92, 10);
    add(this.add.image(66, gy + 50, 'obj', 'chest').setScale(3.6).setTint(col('gold')).setDepth(D + 2));
    add(this.add.text(122, gy + 16, t('7. den: ZLATÁ TRUHLA'), txt(24, PAL.gold)).setDepth(D + 2));
    const gl = add(this.add.text(122, gy + 52, this.chestRewText(CHEST_REW[6]), txt(19, PAL.bone)).setDepth(D + 2));
    gl.setScale(Math.min(1, (W - 140) / gl.width));
    const by = gy + 112;
    if (ready) {
      const wide = !this.canReward();
      const o = this.btn(10, by, wide ? W - 20 : 250, 66, () => void this.chestOpen(false), D + 2);
      this.drawBtn(o, t('Otevřít'), true, 'green');
      this.shopObjs.push(o.bg, o.label, o.zone);
      if (!wide) {
        const a = this.btn(270, by, W - 280, 66, () => void this.chestOpen(true), D + 2);
        this.drawBtn(a, t('×2 za reklamu'), true, 'plum');
        this.shopObjs.push(a.bg, a.label, a.zone);
      }
    } else {
      const left = add(this.add.text(W / 2, by + 30, '', txt(24, PAL.mint)).setOrigin(0.5).setDepth(D + 2));
      const upd = () => {
        const m = new Date();
        m.setHours(24, 0, 0, 0);
        left.setText(t('Další truhla za {t}', { t: hms(m.getTime() - Date.now()) }));
        if (chestReady(this.d.chest)) this.openShop('chest', false);
      };
      upd();
      this.leagueLive = upd;
    }
  }

  /** ×2 za reklamu na jedné stanici na 15 min (karta, odznak vedle názvu) */
  async stationAd(pi: number, id: string) {
    sfx.init();
    const p = this.d.pubs[pi];
    if (!p || (p.adx?.[id] ?? 0) > Date.now()) return;
    if (!(await this.rewarded())) return this.banner(this.views[0].cam, t('Reklama se nepřehrála'));
    (p.adx ??= {})[id] = Date.now() + STATION_AD_MIN * 60_000;
    sfx.buy();
    this.banner(this.views[pi]?.cam ?? this.views[0].cam, t('{s} vydělává ×2 – {m} min', { s: STATION_NAMES[p.act][id], m: STATION_AD_MIN }));
    store(this.d);
  }

  /** pustí reklamu a spustí / prodlouží kampaň */
  async adWatchNow() {
    if (!(await this.rewarded())) return this.banner(this.views[0].cam, t('Reklama se nepřehrála'));
    const a = (this.d.adv ??= newAdv());
    adWatch(a);
    store(this.d);
    sfx.levelUp();
    this.banner(this.views[0].cam, t('Kampaň běží! Výdělek ×{m}', { m: xf(adPower(a)) }));
    if (this.tab === 'special' && this.shopObjs.length) this.openShop('special', false);
  }

  /** odměna „za reklamu“ jde vzít (reklamní síť, Štamgast nebo koupené bez reklam) */
  private canReward() {
    return ads.available || passOn(this.d.pass) || !!this.d.noAds;
  }

  /** „reklama“: se Štamgastem nebo bez reklam hned true */
  /** běží reklama (QA hospoda 66: dvojťuk dal dvojí odměnu) */
  private adBusy = false;
  private async rewarded(): Promise<boolean> {
    // druhé ťuknutí během reklamy (nebo hned po ní) se tiše ignoruje – slib se nikdy nesplní
    if (this.adBusy) return new Promise<boolean>(() => undefined);
    if (passOn(this.d.pass) || this.d.noAds) return this.vcCount(), true;
    this.adBusy = true;
    try {
      const ok = await ads.rewarded();
      if (ok) meter.track('ad_reward'), this.vcCount();
      return ok;
    } finally {
      this.adBusy = false;
    }
  }

  /** koupený vzhled hospody → PubView (jen vzhled) */
  private lookSync() {
    REKO.R = this.d.reko;
    REKO.relics = this.d.relics;
    LOOK.tap = this.owns('lookTap');
    LOOK.tables = this.owns('lookTables');
    LOOK.livery = this.owns('lookLivery');
  }

  /** trvalý automat koupený za diamanty */
  private owns(id: string) {
    return !!this.d.own?.includes(id);
  }

  /** utratí diamanty za položku */
  /** jde položku za diamanty teď koupit? (trvalé jen jednou a po pořadě; rychlé jen když mají smysl) */
  gemCan(id: GemItem): boolean {
    if (GEM_PERM.includes(id)) return !this.owns(id) && (id !== 'off2' || this.owns('off1')) && (id !== 'off3' || this.owns('off2'));
    const now = Date.now();
    if (id === 'hhnow') return this.d.pubs.some((p) => p.mgr && !this.boosted(p) && (p.boostReady ?? 0) > now);
    if (id === 'quiver') return !!this.d.darts && this.d.darts.have < dartCap(this.d.darts.up);
    if (id === 'brewnow') return !!this.d.brew && this.d.brew.stock < tank(this.d.brew);
    if (id === 'vipnow') return !!this.d.vip && !(this.d.vip.until > now);
    return true;
  }

  gemBuy(id: GemItem) {
    const cost = GEM_COST[id];
    if ((this.d.gems ?? 0) < cost || !this.gemCan(id)) return false;
    this.d.gems = (this.d.gems ?? 0) - cost;
    const now = Date.now();
    if (id === 'skip4' || id === 'skip24') {
      // časoskok: výdělek hned (do ligy se nepočítá)
      const n = this.hoursIncome(id === 'skip4' ? 4 : 24);
      this.d.coins += n;
      this.d.earned += n;
      this.d.run += n;
      this.banner(this.views[0].cam, t('Časoskok! +{n} coins', { n: big(n) }));
      coinFountain(this, W / 2, 400, 14);
    } else if (id === 'hhnow') {
      for (const p of this.d.pubs) if (p.mgr && !this.boosted(p)) p.boostReady = 0;
      this.skillBtns.forEach((_, i) => this.drawSkill(i));
      this.banner(this.views[0].cam, t('Šťastná hodina je připravená!'));
    } else if (id === 'quiver') {
      this.d.darts!.have = dartCap(this.d.darts!.up);
      this.banner(this.views[0].cam, t('Toulec je plný!'));
    } else if (id === 'brewnow') {
      addBeer(this.d.brew!, tank(this.d.brew!) - this.d.brew!.stock);
      this.d.brew!.at = now;
      this.banner(this.views[0].cam, t('Tank je plný piva!'));
    } else if (id === 'vipnow') {
      this.d.vip!.next = now;
      this.banner(this.views[0].cam, t('VIP host je na cestě!'));
    } else {
      (this.d.own ??= []).push(id);
      if (id === 'chronicle') (this.tsCache = undefined), this.applyKup();
      if (GEM_LOOK.includes(id)) this.lookSync(), this.views.forEach((v) => v.applyLook());
      this.banner(this.views[0].cam, t('Koupeno: {s}', { s: this.gemName(id) }));
    }
    store(this.d);
    sfx.levelUp();
    if (this.tab === 'special' && this.shopObjs.length) this.openShop('special', false);
    return true;
  }

  private gemName(id: GemItem): string {
    const names: Record<GemItem, string> = {
      hhnow: t('Šťastná hodina hned'), quiver: t('Plný toulec'), brewnow: t('Várka hned'), vipnow: t('Přivolat VIP'),
      skip4: t('Časoskok 4 h'), skip24: t('Časoskok 24 h'), chestbot: t('Sběrač truhel'),
      off1: t('Delší offline I'), off2: t('Delší offline II'), off3: t('Delší offline III'),
      vipdoor: t('VIP vrátný'), autohh: t('Automatická šťastná hodina'), chronicle: t('Pivní kronika'),
      lookTap: t('Selská pípa'), lookTables: t('Dubové stoly'), lookLivery: t('Livreje číšníků'),
    };
    return names[id];
  }

  /** nákup za peníze (jen v aplikaci; ?fakeshop=1 na zkoušku) */
  async iapBuy(id: ProductId) {
    meter.track('iap_start', { id });
    const r = await iap.buy(id);
    if (r === 'pending') return this.banner(this.views[0].cam, t('Platba čeká – připíše se, až bude zaplacená'));
    if (!r) return this.banner(this.views[0].cam, iap.available ? t('Nákup se nepovedl') : t('Jen v mobilní aplikaci'));
    meter.track('iap_done', { id });
    this.iapGrant(id);
  }

  /** připsat koupený produkt */
  private iapGrant(id: ProductId) {
    if (id === 'pass') {
      this.d.pass = passBuy(this.d.pass);
      this.banner(this.views[0].cam, t('Štamgast na {d} dní!', { d: PASS_DAYS }));
    } else if (id === 'noads') {
      this.d.noAds = true;
      this.banner(this.views[0].cam, t('Odměny teď bez reklam'));
    } else if (id === 'starter' || id === 'xmas' || id === 'milestone') {
      this.bundleGrant(id);
    } else if (id === 'season') {
      this.d.spass = spassSync(this.d.spass);
      if (this.d.spass) this.d.spass.gold = true;
      this.banner(this.views[0].cam, t('Zlatá řada odemčena!'));
      if (this.awayObjs.length) (this.awayClose?.(), this.spassWin());
    } else if (id === 'passsub') {
      this.subSync(true);
      this.banner(this.views[0].cam, t('Jsi štamgast! Předplatné běží'));
    } else {
      // první nákup každého balíčku ×2
      const o = (this.d.offers ??= {});
      const n = packGems(o, id, PRODUCTS[id].gems ?? 0);
      if (!o.first?.includes(id)) (o.first ??= []).push(id);
      this.d.gems = (this.d.gems ?? 0) + n;
      this.banner(this.views[0].cam, t('+{n} 💎', { n }));
    }
    store(this.d);
    sfx.levelUp();
    sfx.cheer();
    if (this.tab === 'special' && this.shopObjs.length) this.openShop('special', false);
  }

  /** obchod připojen: obnovit trvalý nákup „bez reklam“ (po přeinstalaci) a překreslit ceny */
  async iapRestore() {
    // zaplacené dřív čekající platby (diamanty, Štamgast) – připsat
    for (const id of await iap.unclaimed()) this.iapGrant(id);
    await this.subSync();
    const own = await iap.owned();
    if (!this.sys.isActive()) return;
    if (own.includes('noads') && !this.d.noAds) {
      this.d.noAds = true;
      store(this.d);
      this.banner(this.views[0].cam, t('Odměny teď bez reklam'));
    }
    if (this.tab === 'special' && this.shopObjs.length) this.openShop('special', false);
  }

  /** denní diamanty Štamgasta */
  passClaim() {
    const p = this.d.pass;
    // hodiny vrácené dozadu: den už vyzvednutý (claim v „budoucnosti“) se znovu nedá
    if (!passOn(p) || (p!.claim ?? '') >= dayKey()) return;
    p!.claim = dayKey();
    this.d.gems = (this.d.gems ?? 0) + PASS_GEMS;
    store(this.d);
    sfx.coin(1);
    this.banner(this.views[0].cam, t('+{n} 💎', { n: PASS_GEMS }));
    if (this.tab === 'special' && this.shopObjs.length) this.openShop('special', false);
  }

  // ---------- lákadla (core/offers.ts): startovní a vánoční balík, nabídka po milníku, video za coins, video výzva ----------
  /** milník (nová hospoda, první poražený Cthulhu): na 24 h nabídka; vyskočí podle pravidla jedné nabídky */
  msStart(id: string) {
    if (msStart((this.d.offers ??= {}), id)) store(this.d);
  }

  /** denní video výzva: započítat odměnu za video */
  private vcCount() {
    const o = (this.d.offers ??= {});
    const was = vcReady(o);
    vcAdd(o);
    if (!was && vcReady(o)) this.time.delayedCall(800, () => this.banner(this.views[0].cam, t('Výzva dne splněna! Vyzvedni odměnu v Speciální nabídce')));
  }
  /** vyzvednout odměnu video výzvy */
  vcClaim() {
    const o = (this.d.offers ??= {});
    if (!vcReady(o)) return;
    o.vc = { ...vcNow(o), got: true };
    this.d.gems = (this.d.gems ?? 0) + VC_GEMS;
    // jako časoskok: do ligy se nepočítá
    const n = this.hoursIncome(VC_H);
    this.d.coins += n;
    this.d.earned += n;
    this.d.run += n;
    store(this.d);
    sfx.fanfare();
    coinFountain(this, W / 2, 400, 12);
    this.banner(this.views[0].cam, t('+{g} 💎 a {n} coins', { g: VC_GEMS, n: big(n) }));
    if (this.tab === 'special' && this.shopObjs.length) this.openShop('special', false);
  }

  /** předplatné Štamgasta: platí, dokud ho Google Play vrací jako aktivní (bought = právě koupeno) */
  async subSync(bought = false) {
    const on = bought || (await iap.subs()).includes('passsub');
    if (!this.sys.isActive()) return;
    const now = Date.now();
    if (on) this.d.pass = { ...this.d.pass, until: Math.max(this.d.pass?.until ?? 0, now + 2 * 86400_000), sub: true };
    else if (this.d.pass?.sub) this.d.pass = { ...this.d.pass, sub: false };
    else return;
    this.tsCache = undefined;
    this.applyKup();
    store(this.d);
    if (this.tab === 'special' && this.shopObjs.length) this.openShop('special', false);
  }
  /** od kolikáté hygieny se nabízí startovní balíček (první hygiena, ve které se nic neodemyká; strom = 2.) */
  starterFrom() {
    return starterHyg([...Object.values(MENU_HYG), 2]);
  }

  /** obsah balíčku pro okno a kartu: [ikona, text] */
  private bundleItems(id: Bundle): { icon: [string, string | number, number] | string; s: string }[] {
    if (id === 'milestone') {
      return [
        { icon: '💎', s: t('{n} diamantů', { n: MS_GEMS }) },
        { icon: '⏩', s: t('{h} h výdělku hned', { h: MS_SKIP_H }) },
        { icon: ['obj', 'apronIcon', 3], s: t('Štamgast na {d} dny (výdělek ×2)', { d: MS_PASS_DAYS }) },
      ];
    }
    if (id === 'xmas') {
      return [
        { icon: '💎', s: t('{n} diamantů', { n: XMAS_GEMS }) },
        { icon: ['obj', 'apronIcon', 3], s: t('Štamgast na {d} dní (výdělek ×2)', { d: XMAS_PASS_DAYS }) },
      ];
    }
    const look = this.owns('lookLivery')
      ? { icon: '💎', s: t('+{n} 💎 místo livrejí (už je máš)', { n: STARTER_LOOK_GEMS }) }
      : { icon: ['waiter_lux', 0, 3] as [string, number, number], s: t('Livreje číšníků (vzhled)') };
    return [
      { icon: '💎', s: t('{n} diamantů', { n: STARTER_GEMS }) },
      { icon: ['obj', 'apronIcon', 3], s: t('Štamgast na {d} dny (výdělek ×2)', { d: STARTER_PASS_DAYS }) },
      look,
    ];
  }
  private bundleTitle(id: Bundle) {
    if (id === 'milestone') {
      const m = this.d.offers?.ms?.id ?? '';
      return m.startsWith('pub') ? t('Oslava: {s}', { s: PUB_NAMES[Number(m.slice(3)) as Act] ?? '' }) : t('Oslava vítězství nad Cthulhu');
    }
    return id === 'xmas' ? t('Vánoční balík') : t('Startovní balíček');
  }
  /** do kdy balíček platí (skutečný odpočet) */
  private bundleUntil(id: Bundle) {
    return id === 'milestone' ? msUntil(this.d.offers) : id === 'xmas' ? xmasUntil() : starterUntil(this.d.offers);
  }
  /** odpočet balíčku: přes 2 dny ve dnech, jinak h:mm:ss */
  private bundleLeft(until: number) {
    const ms = Math.max(0, until - Date.now());
    return ms > 2 * 86400_000 ? t('jen jednou · platí ještě {d} dní', { d: Math.floor(ms / 86400_000) }) : t('jen jednou · platí ještě {t}', { t: hms(ms) });
  }
  /** krátký souhrn obsahu (karta v Nabídce) */
  private bundleSum(id: Bundle) {
    if (id === 'milestone') return t('{n} 💎 · {h} h výdělku · Štamgast {d} dny', { n: MS_GEMS, h: MS_SKIP_H, d: MS_PASS_DAYS });
    return id === 'xmas'
      ? t('{n} 💎 · Štamgast {d} dní', { n: XMAS_GEMS, d: XMAS_PASS_DAYS })
      : this.owns('lookLivery')
        ? t('{n} 💎 · Štamgast {d} dny', { n: STARTER_GEMS + STARTER_LOOK_GEMS, d: STARTER_PASS_DAYS })
        : t('{n} 💎 · Štamgast {d} dny · livreje', { n: STARTER_GEMS, d: STARTER_PASS_DAYS });
  }
  private bundleIcon(x: number, y: number, ic: [string, string | number, number] | string, D: number, k = 1) {
    if (typeof ic === 'string') return this.add.text(x, y, ic, txt(Math.round(30 * k), PAL.white)).setOrigin(0.5).setDepth(D);
    return this.add.image(x, y, ic[0], ic[1]).setScale(ic[2] * k).setDepth(D);
  }

  /** vyskakovací nabídka: nejvýš jedna za spuštění hry, ne v prvních minutách (pravidlo uživatele) */
  private offerTick() {
    if (!iap.available) return;
    if (this.awayObjs.length || this.shopObjs.length || this.guideCur || this.ev.active || this.sheet >= 0 || (this.d.tut ?? -1) >= 0 || this.dartsOpen) return;
    const id = popDue(this.d.offers, this.d.stats.prestiges, this.starterFrom());
    if (!id || !iap.has(id)) return;
    popShown((this.d.offers ??= {}), id);
    store(this.d);
    meter.track('offer_pop', { id });
    this.offerPop(id);
  }

  /** okno s nabídkou balíčku */
  offerPop(id: Bundle) {
    const D = 520;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (objs.push(o), o);
    add(this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(D).setInteractive());
    const close = () => {
      this.awayObjs.forEach((o) => o.destroy());
      this.awayObjs = [];
      this.awayClose = undefined;
    };
    const items = this.bundleItems(id);
    const until = this.bundleUntil(id);
    const left = add(this.add.text(W / 2, 0, '', txt(20, PAL.sand)).setOrigin(0.5).setDepth(D + 3));
    const tick = () => left.active && left.setText(this.bundleLeft(until));
    tick();
    const tm = this.time.addEvent({ delay: 1000, loop: true, callback: tick });
    objs.push({ destroy: () => tm.remove() } as unknown as Phaser.GameObjects.GameObject);
    const buy = () => {
      close();
      void this.iapBuy(id);
    };
    const panel = (bx: number, by: number, bw: number, bh: number, fill: keyof typeof PAL, edge: keyof typeof PAL) => {
      const g = add(this.add.graphics().setDepth(D + 1));
      g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
      g.fillStyle(col(fill)).fillRoundedRect(bx, by, bw, bh, 16);
      g.lineStyle(4, col(edge)).strokeRoundedRect(bx, by, bw, bh, 16);
      return g;
    };
    const fit = (o: Phaser.GameObjects.Text, w: number) => o.setScale(Math.min(1, w / o.width));
    {
      // vzhled A „plakát“ (výběr uživatele, /mnt/project-files/vydelek/nabidka-ABC.png) – nadpis, seznam obsahu s ikonami, cena
      const bh = 290 + items.length * 92, bx = 34, by = Math.round((TOP + MB - bh) / 2), bw = W - 68;
      panel(bx, by, bw, bh, 'dusk', 'gold');
      const rib = add(this.add.graphics().setDepth(D + 2));
      rib.fillStyle(col(id === 'xmas' ? 'red' : 'green')).fillRoundedRect(bx + 30, by - 22, bw - 60, 64, 12);
      fit(add(this.add.text(W / 2, by + 10, this.bundleTitle(id), txt(34, PAL.white)).setOrigin(0.5).setDepth(D + 3)), bw - 80);
      left.setY(by + 70);
      items.forEach((it, i) => {
        const y = by + 130 + i * 92;
        const g = add(this.add.graphics().setDepth(D + 2));
        g.fillStyle(col('ink'), 0.6).fillRoundedRect(bx + 20, y - 38, bw - 40, 78, 12);
        add(this.bundleIcon(bx + 66, y, it.icon, D + 3));
        fit(add(this.add.text(bx + 112, y, it.s, txt(23, PAL.bone)).setOrigin(0, 0.5).setDepth(D + 3)), bw - 150);
      });
      const b = this.btn(bx + 30, by + bh - 150, bw - 60, 76, buy, D + 3);
      this.drawBtn(b, t('Koupit · {p}', { p: iap.price(id) }), true, 'green');
      const no = this.btn(W / 2 - 100, by + bh - 62, 200, 48, close, D + 3);
      this.drawBtn(no, t('Ne, díky'), true, 'slate');
      objs.push(b.bg, b.label, b.zone, no.bg, no.label, no.zone);
    }
    this.awayObjs = objs;
    this.awayClose = close;
    sfx.fanfare();
  }

  /** karta balíčku v záložce Nabídka (vrací výšku, 0 = nic) */
  private bundleCard(y: number, D: number): number {
    const o = this.d.offers;
    const id: Bundle | null = msLive(o) ? 'milestone' : xmasLive(o) ? 'xmas' : starterLive(o) ? 'starter' : null;
    if (!id || (iap.available && !iap.has(id))) return 0;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const h = 104;
    this.card(y, h, id === 'xmas' ? 'red' : id === 'milestone' ? 'blue' : 'green', D);
    add(this.add.text(24, y + 10, this.bundleTitle(id), txt(26, PAL.gold)).setDepth(D + 2));
    const sum = add(this.add.text(24, y + 44, this.bundleSum(id), txt(20, PAL.white)).setDepth(D + 2));
    sum.setScale(Math.min(1, (W - 200) / sum.width));
    const until = this.bundleUntil(id);
    const left = add(this.add.text(24, y + 74, '', txt(17, PAL.sand)).setDepth(D + 2));
    const upd = () => left.setText(this.bundleLeft(until));
    upd();
    const prev = this.leagueLive;
    this.leagueLive = () => (prev?.(), upd());
    const b = this.btn(W - 160, y + 24, 138, 56, () => void this.iapBuy(id), D + 3);
    this.drawBtn(b, iap.available ? iap.price(id) : t('jen v aplikaci'), iap.available, 'amber');
    this.shopObjs.push(b.bg, b.label, b.zone);
    return h + 8;
  }

  /** připsat balíček (startovní / vánoční) */
  private bundleGrant(id: Bundle) {
    const o = (this.d.offers ??= {});
    const now = Date.now();
    const pass = (days: number) => (this.d.pass = { ...this.d.pass, until: Math.max(now, this.d.pass?.until ?? 0) + days * 86400_000 });
    if (id === 'starter') {
      let gems = STARTER_GEMS;
      if (this.owns('lookLivery')) gems += STARTER_LOOK_GEMS;
      else {
        (this.d.own ??= []).push('lookLivery');
        this.lookSync();
        this.views.forEach((v) => v.applyLook());
      }
      this.d.gems = (this.d.gems ?? 0) + gems;
      pass(STARTER_PASS_DAYS);
      (o.bought ??= []).push('starter');
    } else if (id === 'milestone') {
      this.d.gems = (this.d.gems ?? 0) + MS_GEMS;
      // jako časoskok: do ligy se nepočítá
      const n = this.hoursIncome(MS_SKIP_H);
      this.d.coins += n;
      this.d.earned += n;
      this.d.run += n;
      pass(MS_PASS_DAYS);
      (o.bought ??= []).push('ms:' + (o.ms?.id ?? ''));
    } else {
      this.d.gems = (this.d.gems ?? 0) + XMAS_GEMS;
      pass(XMAS_PASS_DAYS);
      (o.bought ??= []).push(xmasKey(now));
    }
    this.tsCache = undefined;
    this.applyKup();
    this.banner(this.views[0].cam, t('{s} je tvůj!', { s: this.bundleTitle(id) }));
    confetti(this, W / 2, 400, 60, 470, 0.9);
  }

  /** ťuk na nákup, na který nejsou coins: malá bublina „📺 +N“ nad pravým rohem tlačítka na 4 s (vzhled B, výběr
   *  uživatele, /mnt/project-files/vydelek/video-ABC.png). Jen když chybí víc než minuta výdělku, nejvýš 1× za 5 min. */
  private coinVidChip(b: Btn, cost: number) {
    if ((this.d.tut ?? -1) >= 0 || !this.canReward() || coinVidLeft(this.d.offers) <= 0) return;
    if (cost - this.d.coins <= this.totalRate() * 60 || Date.now() - PubScene.coinChipAt < 5 * 60_000) return;
    PubScene.coinChipAt = Date.now();
    this.coinChip?.forEach((o) => o.active && o.destroy());
    const n = this.hoursIncome(COIN_VID_MIN / 60);
    const D = Math.max(470, (b.zone.depth ?? 0) + 5);
    const w = 170, h = 44;
    const x = Math.min(W - 6 - w, b.x + b.w - w), y = Math.max(TOP + 4, b.y - h - 6);
    const c = this.btn(x, y, w, h, () => void this.coinVid(), D);
    this.drawBtn(c, `📺 +${big(n)}`, true, 'amber');
    const tip = this.add.graphics().setDepth(D);
    const tx = Math.min(x + w - 24, b.x + b.w - 24);
    tip.fillStyle(col('amber')).fillTriangle(tx - 8, y + h - 1, tx + 8, y + h - 1, tx, y + h + 8);
    const objs = [c.bg, c.label, c.zone, tip];
    this.coinChip = objs;
    this.tweens.add({ targets: objs, alpha: { from: 0, to: 1 }, duration: 150 });
    this.time.delayedCall(4000, () => {
      if (this.coinChip !== objs) return;
      objs.forEach((o) => o.active && o.destroy());
      this.coinChip = undefined;
    });
  }
  /** kdy naposled vyskočila bublina videa (přes hygienu – scéna se restartuje) */
  static coinChipAt = 0;
  coinChip?: Phaser.GameObjects.GameObject[];

  private async coinVid() {
    const objs = this.coinChip;
    objs?.forEach((o) => o.active && o.destroy());
    this.coinChip = undefined;
    if (coinVidLeft(this.d.offers) <= 0) return;
    if (!(await this.rewarded())) return this.banner(this.views[0].cam, t('Reklama se nepřehrála'));
    coinVidUse((this.d.offers ??= {}));
    // jako časoskok: do ligy se nepočítá
    const n = this.hoursIncome(COIN_VID_MIN / 60);
    this.d.coins += n;
    this.d.earned += n;
    this.d.run += n;
    store(this.d);
    sfx.coin(1);
    coinFountain(this, W / 2, 400, 12);
    this.banner(this.views[0].cam, t('+{n} coins', { n: big(n) }));
    this.refresh();
  }

  /** podzáložka speciální nabídky */
  spSub: 'offer' | 'gems' | 'pass' = 'offer';
  gemPage = 0;

  /** záložka Speciální nabídka: Nabídka (kampaň, truhla, bez reklam) · Diamanty · Štamgast */
  private specialTab(y0: number, D: number) {
    const subs: [PubScene['spSub'], string][] = [['offer', t('Nabídka')], ['gems', t('💎 Diamanty')], ['pass', t('Štamgast')]];
    const sw = (W - 40) / 3;
    subs.forEach(([id, label], i) => {
      const b = this.btn(10 + i * (sw + 10), y0 + 62, sw, 46, () => ((this.spSub = id), this.openShop('special', false)), D + 3);
      this.drawBtn(b, label, true, this.spSub === id ? 'amber' : 'ink');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    const yc = y0 + 124;
    if (this.spSub === 'gems') return this.gemsSub(yc, D);
    if (this.spSub === 'pass') return this.passSub(yc, D);
    this.offerSub(yc, D);
  }

  private card(y: number, h: number, c: keyof typeof PAL, D: number) {
    const g = this.add.graphics().setDepth(D + 1).fillStyle(col(c)).fillRoundedRect(10, y, W - 20, h, 12);
    this.shopObjs.push(g);
    return g;
  }

  private offerSub(y: number, D: number) {
    const a = (this.d.adv ??= newAdv());
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const can = this.canReward();
    // časově omezený balíček (startovní / vánoční) nahoře
    y += this.bundleCard(y, D);
    // reklamní kampaň (dole řádek denní video výzvy)
    this.card(y, 278, 'plum', D);
    add(this.add.image(62, y + 70, 'icons', 'tv').setScale(5).setDepth(D + 2));
    add(this.add.text(118, y + 12, t('Reklamní kampaň'), txt(28, PAL.gold)).setDepth(D + 2));
    const st = add(this.add.text(118, y + 50, '', txt(19, PAL.white)).setDepth(D + 2));
    const sub = add(this.add.text(118, y + 76, t('každé zhlédnutí +{v}, roste až na ×{m}', { v: xf(0.02), m: xf(AD_TOP) }), txt(16, PAL.bone)).setDepth(D + 2));
    sub.setScale(Math.min(1, (W - 136) / sub.width));
    const bar = add(this.add.graphics().setDepth(D + 2));
    const p = (adPower(a) - AD_BASE) / (AD_TOP - AD_BASE);
    bar.fillStyle(col('ink')).fillRoundedRect(118, y + 104, W - 146, 18, 7);
    bar.fillStyle(col('mint')).fillRoundedRect(118, y + 104, Math.max(18, (W - 146) * p), 18, 7);
    add(this.add.text(118 + (W - 146) / 2, y + 113, `×${xf(adPower(a))}  →  ×${xf(AD_TOP)}`, txt(16, PAL.white)).setOrigin(0.5).setDepth(D + 3));
    const upd = () => {
      const left = a.until - Date.now();
      st.setText(left > 0 ? t('běží: výdělek ×{m} – ještě {t}', { m: xf(adPower(a)), t: hms(left) }) : t('výdělek ×{m} na {h} h', { m: xf(adPower(a)), h: AD_H }));
      st.setColor(left > 0 ? PAL.mint : PAL.white).setScale(Math.min(1, (W - 136) / st.width));
    };
    upd();
    this.leagueLive = upd;
    const watch = this.btn(118, y + 134, W - 146, 50, () => void this.adWatchNow(), D + 3);
    this.drawBtn(watch, can ? (ads.available && !passOn(this.d.pass) && !this.d.noAds ? t('📺 Pustit reklamu') : t('Spustit kampaň')) : t('jen v mobilní aplikaci'), can, 'green');
    const cost = adLvlCost(a.lvl);
    const up = this.btn(118, y + 190, W - 146, 40, () => {
      if (this.d.krigle < cost) return;
      this.d.krigle -= cost;
      this.d.kSpent = (this.d.kSpent ?? 0) + cost;
      a.lvl++;
      store(this.d);
      sfx.levelUp();
      this.openShop('special', false);
    }, D + 3);
    this.drawBtn(up, a.lvl >= AD_LVL_MAX ? t('Lepší reklama: max') : t('Lepší reklama +{v} · {k}', { v: xf(0.1), k: this.krigleTxt(cost) }), a.lvl < AD_LVL_MAX && this.d.krigle >= cost, 'amber');
    this.shopObjs.push(watch.bg, watch.label, watch.zone, up.bg, up.label, up.zone);
    // denní video výzva: 5 odměn za video denně = bonus
    {
      const v = vcNow(this.d.offers), ready = vcReady(this.d.offers);
      const vt = add(this.add.text(26, y + 254, v.got ? t('Výzva dne splněna ✓ · zítra znovu') : t('Výzva dne: 📺 {n}/{g} → +{d} 💎 a {h} h výdělku', { n: v.n, g: VC_GOAL, d: VC_GEMS, h: VC_H }), txt(17, v.got ? PAL.mint : PAL.sand)).setOrigin(0, 0.5).setDepth(D + 2));
      vt.setScale(Math.min(1, (ready ? W - 190 : W - 52) / vt.width));
      if (ready) {
        const cb = this.btn(W - 156, y + 236, 134, 36, () => this.vcClaim(), D + 3);
        this.drawBtn(cb, t('Vyzvednout'), true, 'green');
        this.shopObjs.push(cb.bg, cb.label, cb.zone);
      }
    }
    // denní truhla
    y += 286;
    this.card(y, 96, 'ink', D);
    add(this.add.image(58, y + 50, 'obj', 'chest').setScale(3).setDepth(D + 2));
    add(this.add.text(108, y + 14, t('Denní truhla'), txt(24, PAL.bone)).setDepth(D + 2));
    const cs = add(this.add.text(108, y + 52, t('zdarma každý den · série {d}/7', { d: chestDay(this.d.chest) }) + (jokerFree(this.d.chest) ? ' · ' + t('žolík ✓') : ''), txt(16, PAL.fog)).setDepth(D + 2));
    cs.setScale(Math.min(1, 250 / cs.width));
    const ch = this.btn(W - 150, y + 23, 128, 50, () => this.openShop('chest', false), D + 3);
    this.drawBtn(ch, chestReady(this.d.chest) ? t('Otevřít') : t('Ukázat'), true, chestReady(this.d.chest) ? 'green' : 'slate');
    this.shopObjs.push(ch.bg, ch.label, ch.zone);
    // bez reklam (za peníze)
    y += 102;
    this.card(y, 74, 'ink', D);
    add(this.add.text(26, y + 8, t('Bez reklam'), txt(22, PAL.bone)).setDepth(D + 2));
    add(this.add.text(26, y + 42, this.d.noAds ? t('koupeno – odměny bez reklam') : t('odměny bez reklam · jednou, navždy'), txt(16, PAL.fog)).setDepth(D + 2));
    const na = this.btn(W - 150, y + 13, 128, 48, () => void this.iapBuy('noads'), D + 3);
    this.drawBtn(na, this.d.noAds ? '✓' : iap.price('noads'), !this.d.noAds && iap.available, 'amber');
    this.shopObjs.push(na.bg, na.label, na.zone);
  }

  /** Diamanty: časoskoky (z A), trvalé automaty (z C), balíčky za peníze */
  private gemsSub(y: number, D: number) {
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const gems = this.d.gems ?? 0;
    add(this.add.text(W / 2, y + 14, t('Máš {n} 💎', { n: gems }), txt(26, PAL.ice)).setOrigin(0.5).setDepth(D + 2));
    // tři stránky (vše se nevejde): Rychlé · Napořád · Vzhled
    const pw = (W - 70) / 4;
    ([[0, t('⚡ Rychlé')], [1, t('★ Napořád')], [2, t('🎨 Vzhled')], [3, t('🛒 Koupit')]] as [number, string][]).forEach(([pg, label], i) => {
      const b = this.btn(20 + i * (pw + 10), y + 34, pw, 40, () => ((this.gemPage = pg), this.openShop('special', false)), D + 3);
      this.drawBtn(b, label, true, this.gemPage === pg ? 'amber' : 'plum');
      b.label.setFontSize(21).setScale(Math.min(1, (b.w - 10) / b.label.width));
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    const desc: Record<GemItem, [string, string]> = {
      hhnow: ['⚡', t('manažeři bez čekání')], quiver: ['🎯', t('šipky do plna')], brewnow: ['🍺', t('pivovar hned plný tank')],
      vipnow: ['⭐', t('VIP host přijde hned')], skip4: ['⏩', t('hned 4 h výdělku')], skip24: ['⏩', t('hned celý den výdělku')],
      chestbot: ['📦', t('denní truhlu otevře sám')], off1: ['🌙', t('hospoda vydělává o 2 h déle bez tebe')],
      off2: ['🌙', t('další +2 h offline')], off3: ['🌙', t('další +2 h offline')], vipdoor: ['🚪', t('obslouží VIP, když to nestihneš')],
      autohh: ['🔁', t('manažeři pouští šťastnou hodinu sami')], chronicle: ['📖', t('výdělek +10 % napořád')],
      lookTap: ['', t('měděná pípa s chmelem · jen vzhled')], lookTables: ['', t('dubové stoly s běhounem · jen vzhled')],
      lookLivery: ['', t('bílá košile a zelená vesta · jen vzhled')],
    };
    // vzhled: místo emoji náhled skutečného obrázku
    const lookIcon: Partial<Record<GemItem, [string, string, number]>> = { lookTap: ['obj', 'luxTap', 2.5], lookTables: ['obj', 'luxTable', 1.6], lookLivery: ['waiter_lux', '0', 2.2] };
    if (this.gemPage === 3) return this.gemPacks(y + 84, D);
    const ids: GemItem[] = this.gemPage === 2 ? GEM_LOOK : this.gemPage === 0
      ? ['hhnow', 'quiver', 'brewnow', 'vipnow', 'skip4', 'skip24']
      : ['chestbot', (['off1', 'off2', 'off3'] as GemItem[]).find((o) => !this.owns(o)) ?? 'off3', 'vipdoor', 'autohh', 'chronicle'];
    let yy = y + 84;
    for (const id of ids) {
      const own = GEM_PERM.includes(id) && this.owns(id), can = this.gemCan(id);
      this.card(yy, 66, own ? 'green' : 'ink', D);
      const li = lookIcon[id];
      if (li) add(this.add.image(44, yy + 33, li[0], li[1] === '0' ? 0 : li[1]).setScale(li[2]).setDepth(D + 2));
      else add(this.add.text(44, yy + 33, desc[id][0], txt(30, PAL.white)).setOrigin(0.5).setDepth(D + 2));
      add(this.add.text(80, yy + 8, this.gemName(id), txt(21, PAL.bone)).setDepth(D + 2));
      const ds = add(this.add.text(80, yy + 36, desc[id][1], txt(19, PAL.bone)).setDepth(D + 2));
      ds.setScale(Math.min(1, 290 / ds.width));
      if (own) add(this.add.text(W - 86, yy + 33, t('koupeno ✓'), txt(20, PAL.white)).setOrigin(0.5).setDepth(D + 2));
      else {
        const b = this.btn(W - 150, yy + 10, 128, 46, () => this.gemBuy(id), D + 3);
        this.drawBtn(b, `${GEM_COST[id]} 💎`, gems >= GEM_COST[id] && can, 'plum');
        this.shopObjs.push(b.bg, b.label, b.zone);
      }
      yy += 72;
    }
  }

  /** Diamanty → Koupit: balíčky za peníze, první nákup každého ×2 */
  private gemPacks(yy: number, D: number) {
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    // zablikání jen jednou (další překreslení záložky už ne)
    this.time.delayedCall(0, () => (this.gemBuyHint = false));
    yy += this.bundleCard(yy, D);
    const packs = GEM_PACKS.filter((id) => !iap.available || iap.has(id));
    for (const id of packs) {
      const base = PRODUCTS[id].gems ?? 0, n = packGems(this.d.offers, id, base), dbl = n > base;
      this.card(yy, 66, dbl ? 'plum' : 'ink', D);
      add(this.add.text(44, yy + 33, '💎', txt(30, PAL.white)).setOrigin(0.5).setDepth(D + 2));
      add(this.add.text(80, yy + (dbl ? 6 : 18), t('{n} diamantů', { n }), txt(24, PAL.ice)).setDepth(D + 2));
      if (dbl) {
        const ds = add(this.add.text(80, yy + 38, t('první nákup ×2 (jinak {n})', { n: base }), txt(17, PAL.gold)).setDepth(D + 2));
        ds.setScale(Math.min(1, 290 / ds.width));
      }
      const b = this.btn(W - 160, yy + 9, 138, 48, () => void this.iapBuy(id), D + 3);
      this.drawBtn(b, iap.price(id), iap.available, 'amber');
      this.shopObjs.push(b.bg, b.label, b.zone);
      // přišel z počítadla diamantů nahoře → balíčky zablikají
      if (this.gemBuyHint) {
        const hl = add(this.add.graphics().setDepth(D + 4));
        hl.lineStyle(4, col('gold')).strokeRoundedRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 10);
        this.tweens.add({ targets: hl, alpha: 0.2, yoyo: true, repeat: 3, duration: 350 });
      }
      yy += 72;
    }
    if (!iap.available) {
      // dlouhé překlady: zalomit a zmenšit, ať nepřetečou přes okraj ani pod lištu
      const ft = add(this.add.text(W / 2, yy + 20, t('nákup jen v mobilní aplikaci'), txt(19, PAL.bone)).setOrigin(0.5).setAlign('center').setWordWrapWidth(W - 40).setDepth(D + 2));
      ft.setScale(Math.min(1, (W - 30) / ft.width));
    }
  }

  /** Štamgast pass (z B): 30 dní výhod */
  private passSub(y: number, D: number) {
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const on = passOn(this.d.pass);
    this.card(y, 416, 'plum', D);
    add(this.add.image(62, y + 64, 'obj', 'apronIcon').setScale(4.5).setDepth(D + 2));
    add(this.add.text(118, y + 16, t('Štamgastská karta'), txt(30, PAL.gold)).setDepth(D + 2));
    const st = add(this.add.text(118, y + 56, '', txt(20, on ? PAL.mint : PAL.white)).setDepth(D + 2));
    const upd = () => st.setText(passOn(this.d.pass) ? (this.d.pass!.until - Date.now() > 2 * 86400_000 ? t('platí ještě {d} dní', { d: Math.floor((this.d.pass!.until - Date.now()) / 86400_000) }) : t('platí ještě {t}', { t: hms(this.d.pass!.until - Date.now()) })) : t('{d} dní · {p}', { d: PASS_DAYS, p: iap.price('pass') }));
    upd();
    this.leagueLive = upd;
    [t('✓ výdělek ×{m} – i offline', { m: PASS_MULT }), t('✓ VIP vrátný: žádný VIP neodejde'), t('✓ truhla, kampaň a ×2 bez reklam'), t('✓ každý den {n} 💎', { n: PASS_GEMS })].forEach((s, i) =>
      add(this.add.text(36, y + 118 + i * 36, s, txt(22, PAL.bone)).setDepth(D + 2)),
    );
    // předplatné (měsíční, Google Play ho obnovuje) – jen když je v obchodě založené; jinak jen jednorázová karta na 30 dní
    const sub = !!this.d.pass?.sub, subOk = iap.available && iap.has('passsub');
    const once = on ? t('Prodloužit o {d} dní · {p}', { d: PASS_DAYS, p: iap.price('pass') }) : t('Stát se štamgastem · {p}', { p: iap.price('pass') });
    if (sub) {
      st.setText(t('předplatné běží – obnovuje se každý měsíc'));
      this.leagueLive = undefined;
      const m = this.btn(30, y + 280, W - 60, 60, () => void iap.manage(), D + 3);
      this.drawBtn(m, t('Spravovat předplatné'), true, 'slate');
      this.shopObjs.push(m.bg, m.label, m.zone);
    } else if (subOk) {
      const p = iap.price('passsub');
      const sb = this.btn(30, y + 264, W - 60, 64, () => void this.iapBuy('passsub'), D + 3);
      this.drawBtn(sb, iap.trial('passsub') ? t('3 dny zdarma, pak {p} měsíčně', { p }) : t('Předplatit · {p} měsíčně', { p }), true, 'green');
      const nt = add(this.add.text(W / 2, y + 342, t('Obnovuje se každý měsíc. Zrušíš kdykoli v Google Play.'), txt(16, PAL.bone)).setOrigin(0.5).setDepth(D + 2));
      nt.setScale(Math.min(1, (W - 50) / nt.width));
      const ob = this.btn(60, y + 360, W - 120, 44, () => void this.iapBuy('pass'), D + 3);
      this.drawBtn(ob, t('nebo jednorázově: {s}', { s: once }), true, 'amber');
      this.shopObjs.push(sb.bg, sb.label, sb.zone, ob.bg, ob.label, ob.zone);
    } else {
      const b = this.btn(30, y + 302, W - 60, 70, () => void this.iapBuy('pass'), D + 3);
      this.drawBtn(b, once, iap.available, 'green');
      this.shopObjs.push(b.bg, b.label, b.zone);
      // Zkušebna M1: jasně říct, že jednorázová karta se sama neobnovuje
      const on1 = add(this.add.text(W / 2, y + 388, t('jednorázově na {d} dní – sama se neobnovuje', { d: PASS_DAYS }), txt(16, PAL.bone)).setOrigin(0.5).setDepth(D + 2));
      on1.setScale(Math.min(1, (W - 50) / on1.width));
    }
    if (on) {
      const got = (this.d.pass!.claim ?? '') >= dayKey();
      const c = this.btn(30, y + 428, W - 60, 60, () => this.passClaim(), D + 3);
      this.drawBtn(c, got ? t('Dnešní diamanty vyzvednuty ✓') : t('Vyzvednout {n} 💎', { n: PASS_GEMS }), !got, 'amber');
      this.shopObjs.push(c.bg, c.label, c.zone);
    } else if (!iap.available) add(this.add.text(W / 2, y + 448, t('nákup jen v mobilní aplikaci'), txt(18, PAL.fog)).setOrigin(0.5).setDepth(D + 2));
  }

  // VIP host (návrh C): reflektor, hvězda, pruh nahoře s odpočtem; ťuknutím obsloužit
  vipObjs: Phaser.GameObjects.GameObject[] = [];
  vipSpr?: Phaser.GameObjects.Sprite;
  vipBar?: { g: Phaser.GameObjects.Graphics; tx: Phaser.GameObjects.Text; zone: Phaser.GameObjects.Zone };
  vipT = 0;
  private vipTick(dt: number) {
    if ((this.vipT -= dt) > 0) return;
    this.vipT = 1;
    this.chestHudDraw(); // truhla se ukáže po návodu a o půlnoci
    if ((this.d.tut ?? -1) >= 0 || !this.views[0]) return;
    const v = (this.d.vip ??= newVip());
    const missed = { n: 0 };
    const r = vipTick(v, Date.now(), missed);
    // VIP vrátný (automat za diamanty nebo Štamgast) obslouží, koho hráč nestihl – i když byla hra zavřená
    const door = this.owns('vipdoor') || passOn(this.d.pass);
    if (r === 'left') {
      if (door) this.vipPay(1, t('Vrátný obsloužil VIP hosta! +{n} coins'));
      else this.banner(this.views[0].cam, t('VIP host odešel – nikdo ho neobsloužil'));
      this.vipHide(door);
    }
    if (door && missed.n) this.vipPay(Math.min(4, missed.n), t('Vrátný obsloužil VIP hosty, když jsi byl pryč: +{n} coins'));
    // sběrač truhel otevře denní truhlu sám
    if (this.owns('chestbot') && chestReady(this.d.chest) && !this.awayObjs.length) void this.chestOpen(passOn(this.d.pass) || this.d.noAds === true);
    if (v.until && !this.vipSpr) {
      this.vipShow();
      if (r === 'came') this.banner(this.views[0].cam, t('Přišel VIP host! Ťukni na něj'), true);
    }
    if (this.vipBar) {
      const m = Math.max(1, Math.ceil((v.until - Date.now()) / 60_000));
      this.vipBar.tx.setText(t('★ VIP {m} min · +{h} h výdělku', { m, h: VIP_H })); // Zkušebna U2: dřív 10 slov
      this.vipBar.tx.setScale(Math.min(1, (W - 44) / this.vipBar.tx.width));
    }
  }

  private vipShow() {
    const v = this.views[0];
    // volné místo u pravé stěny (viditelná část hospody). Dřív 0,86 šířky = od vzhledu B (celá šířka místnosti) židle pravého stolu:
    // VIP stál na sedícím hostovi a nad hlavou měl hvězdu i jeho bublinu s pivem (hlášení uživatele) – smí být jen jedna ikona
    const wv = v.cam.worldView;
    const p = { x: Math.round(wv.x + wv.width * 0.955), y: Math.round(wv.y + wv.height * 0.6) };
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.vipObjs.push(o), this.events.emit('pubObj', o), o);
    const top = v.cam.worldView.y;
    const cone = add(this.add.graphics().setDepth(p.y - 1));
    cone.fillStyle(col('sand'), 0.22).fillTriangle(p.x, top, p.x - 22, p.y + 2, p.x + 22, p.y + 2);
    cone.fillStyle(col('sand'), 0.35).fillEllipse(p.x, p.y, 34, 8);
    this.tweens.add({ targets: cone, alpha: { from: 0.7, to: 1 }, yoyo: true, repeat: -1, duration: 700 });
    const spr = add(this.add.sprite(p.x, p.y, 'vampire', 1).setOrigin(0.5, 1).setScale(1.25).setDepth(p.y + 3));
    this.tweens.add({ targets: spr, y: p.y - 2, yoyo: true, repeat: -1, duration: 400, ease: 'Sine.inOut' });
    this.vipSpr = spr;
    // hvězda těsně nad hlavou VIP (hlášení: visela vedle) a pohupuje se s ním
    const sy = p.y - spr.displayHeight - 8;
    const bub = add(this.add.graphics().setDepth(p.y + 4));
    bub.fillStyle(col('white')).fillCircle(0, 0, 10).setPosition(p.x, sy);
    const star = add(this.add.image(p.x, sy, 'icons', 'star').setScale(0.75).setDepth(p.y + 5));
    this.tweens.add({ targets: [bub, star], y: sy - 2, yoyo: true, repeat: -1, duration: 400, ease: 'Sine.inOut' });
    this.tweens.add({ targets: star, scale: { from: 0.65, to: 0.85 }, yoyo: true, repeat: -1, duration: 450 });
    // pruh nahoře v hospodě pod pilulkami (UI) – ťuknutím taky obsloužit
    const g = this.add.graphics().setDepth(65);
    const tx = this.add.text(0, 0, '', txt(19, PAL.gold)).setOrigin(0.5).setDepth(66);
    const zone = this.add.zone(0, 0, 10, 10).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(67);
    zone.on('pointerdown', () => this.vipServeNow());
    this.vipBar = { g, tx, zone };
    this.vipBarDraw();
    this.vipT = 0;
  }

  /** pruh VIP hosta pod řádkem pilulek (posune se, když pilulky zmizí / přibudou) */
  private vipBarDraw() {
    const b = this.vipBar;
    if (!b) return;
    const y = this.pubTop() + 8 + this.pillsOff(), bw = W - 24;
    b.g.clear().fillStyle(col('ink')).fillRoundedRect(12, y + 3, bw, 40, 10).fillStyle(col('plum')).fillRoundedRect(12, y, bw, 40, 10);
    b.tx.setPosition(12 + bw / 2, y + 20);
    b.zone.setPosition(12, y).setSize(bw, 40);
  }

  private vipHide(happy: boolean) {
    const spr = this.vipSpr;
    this.vipObjs.forEach((o) => o !== spr && o.destroy());
    this.vipObjs = [];
    this.vipSpr = undefined;
    if (spr) this.tweens.add({ targets: spr, y: spr.y - (happy ? 14 : 0), alpha: 0, duration: 700, onComplete: () => spr.destroy() });
    if (this.vipBar) {
      this.vipBar.g.destroy();
      this.vipBar.tx.destroy();
      this.vipBar.zone.destroy();
      this.vipBar = undefined;
    }
  }

  /** obsloužit VIP: odměna VIP_H hodin výdělku */
  /** odměna za VIP (k = kolik hostů): výdělek a diamanty */
  private vipPay(k: number, msg: string) {
    const n = this.hoursIncome(VIP_H) * k;
    this.gain(n);
    this.d.gems = (this.d.gems ?? 0) + VIP_GEMS * k;
    store(this.d);
    this.banner(this.views[0].cam, msg.replace('{n}', big(n)));
    return n;
  }

  vipServeNow() {
    const v = this.d.vip;
    if (!v?.until || v.until <= Date.now()) return;
    vipServe(v);
    this.task('vip', 1);
    const n = this.hoursIncome(VIP_H);
    this.gain(n);
    this.d.gems = (this.d.gems ?? 0) + VIP_GEMS;
    store(this.d);
    const spr = this.vipSpr;
    if (spr) {
      const c = this.views[0].cam;
      const wv = c.worldView;
      const sx = c.x + (spr.x - wv.x) * c.zoom, sy = c.y + (spr.y - 20 - wv.y) * c.zoom;
      confetti(this, sx, sy, 40, 460, 0.7);
      popText(this, sx, sy - 30, '+' + big(n), PAL.gold, 32);
    }
    this.vipHide(true);
    this.banner(this.views[0].cam, t('VIP host spokojen! +{n} coins +{g} 💎', { n: big(n), g: VIP_GEMS }));
    sfx.cheer();
  }

  /** ťuknutí do hospody na VIP */
  private vipTap(view: number, wx: number, wy: number) {
    if (view !== 0 || !this.vipSpr) return false;
    const b = Phaser.Geom.Rectangle.Inflate(this.vipSpr.getBounds(), 8, 8);
    if (!b.contains(wx, wy)) return false;
    this.vipServeNow();
    return true;
  }

  // ---------- bestiář ----------
  /** všechny druhy hostů ve Sbírce (pořadí = bonus štamgasta) */
  private allGuests() {
    // hosté jen z hospod, které ve hře jsou (4. „Chrám Cthulhu“ neexistuje – hosté by nešli nikdy získat)
    return [...new Set([...[1, 2, 3].flatMap((a) => GUESTS[a]), ...Object.values(SEASONS).map((x) => x.guest)])];
  }

  newGuestAt = -1e9;
  private guestName(key: string) {
    return GUEST_NAMES[key] ?? Object.values(SEASONS).find((x) => x.guest === key)?.guestName ?? key;
  }

  bookSel = '';
  bookGrp = 0;
  /** 5 teček věrnosti (zlaté = dosažené úrovně) */
  private loyDots(g: Phaser.GameObjects.Graphics, x: number, y: number, lvl: number, gap = 12, r = 4) {
    for (let k = 0; k < LOY_MAX; k++) g.fillStyle(col('ink')).fillCircle(x + k * gap, y, r + 1).fillStyle(k < lvl ? col('gold') : 0x4a3f55).fillCircle(x + k * gap, y, r);
  }
  /** popis věrnosti druhu: úroveň, postup, bonus */
  private loyText(key: string) {
    const n = this.d.loy?.[key] ?? 0, l = loyLvl(n);
    return {
      n, l,
      prog: l >= LOY_MAX ? t('věrný host!') : t('obslouženo {a} / {b}', { a: n, b: loyNext(n) }),
      bonus: t('{n} b. do stromu', { n: l }) + ' · ' + t('každá úroveň = 1 bod'),
    };
  }

  private bookTab(y0: number, D: number) {
    // Sbírka s věrností hostů (výběr uživatele A2): záložky po hospodách, velké karty s tečkami a pruhem; ťuknutí = detail dole
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const nameOf = (key: string, seen: boolean) => (seen ? this.guestName(key) : '???');
    const groups = [...[1, 2, 3].map((a) => [...new Set(GUESTS[a])]), Object.values(SEASONS).map((x) => x.guest)];
    const gn = [...[1, 2, 3].map((a) => PUB_NAMES[a]), t('Sezóna'), t('Návštěvníci'), t('Úspěchy')];
    const tw = (W - 20 - (gn.length - 1) * 4) / gn.length;
    gn.forEach((n, i) => {
      const b = this.btn(10 + i * (tw + 4), y0 - 50, tw, 40, () => ((this.bookGrp = i), (this.bookSel = ''), this.openShop('book', false)), D + 2);
      // název hospody na dva řádky, větší písmo
      this.drawBtn(b, n.replace(' ', '\n'), true, this.bookGrp === i ? 'gold' : 'plum');
      b.label.setFontSize(20).setLineSpacing(-6).setScale(Math.min(1, (tw - 8) / b.label.width, (b.h - 2) / b.label.height));
      if (this.bookGrp === i) b.label.setColor(PAL.ink).setStroke(PAL.ink, 0);
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
    if (this.bookGrp === 4) return this.bookVisitors(y0, D);
    if (this.bookGrp === 5) return this.bookAch(y0, D);
    (groups[this.bookGrp] ?? []).forEach((key, i) => {
      const cw = (W - 20 - 3 * 8) / 4, x = 10 + (i % 4) * (cw + 8), y = y0 + Math.floor(i / 4) * 178, seen = this.d.seen.includes(key);
      const L = this.loyText(key);
      const g = add(this.add.graphics().setDepth(D + 1));
      g.fillStyle(col('ink'), 0.6).fillRoundedRect(x, y, cw, 170, 10);
      if (L.l >= LOY_MAX) g.lineStyle(4, col('gold')).strokeRoundedRect(x, y, cw, 170, 10);
      if (this.bookSel === key) g.lineStyle(3, col('white')).strokeRoundedRect(x - 2, y - 2, cw + 4, 174, 11);
      const z = add(this.add.zone(x, y, cw, 170).setOrigin(0).setInteractive().setDepth(D + 3));
      z.on('pointerdown', () => seen && ((this.bookSel = this.bookSel === key ? '' : key), sfx.click(), this.openShop('book', false)));
      const spr = add(this.add.sprite(x + cw / 2, y + 96, key, 1).setOrigin(0.5, 1).setScale(4.6).setDepth(D + 2));
      if (!seen) spr.setTintFill(col('dusk'));
      const sez = Object.values(SEASONS).find((x) => x.guest === key);
      const nm = add(this.add.text(x + cw / 2, y + 110, seen ? nameOf(key, seen) : sez ? sez.name : '???', txt(18, seen ? PAL.bone : sez ? PAL.sand : PAL.slate)).setOrigin(0.5).setDepth(D + 2));
      if (!seen && sez) add(this.add.text(x + cw / 2, y + 140, SEASON_WHEN[key] ?? '', txt(15, PAL.fog)).setOrigin(0.5).setDepth(D + 2));
      nm.setScale(Math.min(1, (cw - 8) / nm.width));
      if (!seen) return;
      // ★9: zlatá hvězda = tenhle host už přišel jako zlatý
      if (this.d.goldG?.includes(key)) add(this.add.text(x + cw - 8, y + 6, '★', txt(24, PAL.gold)).setOrigin(1, 0).setDepth(D + 3));
      this.loyDots(g, x + cw / 2 - 28, y + 132, L.l, 14, 5);
      g.fillStyle(col('dusk')).fillRoundedRect(x + 10, y + 148, cw - 20, 10, 4).fillStyle(col('gold')).fillRoundedRect(x + 10, y + 148, Math.max(6, (cw - 20) * loyProg(L.n)), 10, 4);
    });
    if (this.bookSel) {
      const L = this.loyText(this.bookSel), py = MB - 128;
      const g = add(this.add.graphics().setDepth(D + 7));
      g.fillStyle(col('ink'), 0.97).fillRoundedRect(10, py, W - 20, 118, 12).lineStyle(3, col('gold')).strokeRoundedRect(10, py, W - 20, 118, 12);
      add(this.add.sprite(56, py + 100, this.bookSel, 1).setOrigin(0.5, 1).setScale(4).setDepth(D + 8));
      add(this.add.text(100, py + 10, this.guestName(this.bookSel), txt(26, PAL.gold)).setDepth(D + 8));
      this.loyDots(g, W - 110, py + 26, L.l, 18, 6);
      add(this.add.text(100, py + 46, L.prog, txt(18, PAL.bone)).setDepth(D + 8));
      g.fillStyle(col('dusk')).fillRoundedRect(100, py + 72, W - 130, 10, 4).fillStyle(col('gold')).fillRoundedRect(100, py + 72, Math.max(8, (W - 130) * loyProg(L.n)), 10, 4);
      const bt = add(this.add.text(100, py + 90, L.bonus, txt(16, PAL.fog)).setDepth(D + 8));
      bt.setScale(Math.min(1, (W - 120) / bt.width));
    }
  }

  /** Sbírka → Úspěchy (dřív v Úkolech): k vyzvednutí nahoře, pak nesplněné; každý = 1 krígl */
  private bookAch(y0: number, D: number) {
    const RH = 62, got = this.d.ach.length;
    this.shopObjs.push(this.add.text(20, y0 - 2, t('Úspěchy {a} / {b}  (odměna 1 krígl)', { a: got, b: ACHIEVEMENTS.length }), txt(22, PAL.gold)).setDepth(D + 1));
    const list = ACHIEVEMENTS.filter((a) => !this.d.ach.includes(a.id)).sort((a, b) => Number(b.done(this.d)) - Number(a.done(this.d)));
    const max = Math.max(1, Math.floor((MB - 12 - (y0 + 34)) / RH));
    if (!list.length) this.shopObjs.push(this.add.text(20, y0 + 40, t('Všechny úspěchy splněny!'), txt(22, PAL.mint)).setDepth(D + 1));
    list.slice(0, max).forEach((a, i) => {
      const y = y0 + 34 + i * RH;
      const done = a.done(this.d);
      this.row(y, RH - 4, D, a.text, done ? t('splněno!') : t('zatím ne'));
      const b = this.btn(W - 172, y + 6, 150, RH - 18, () => {
        if (!a.done(this.d) || this.d.ach.includes(a.id)) return sfx.error();
        this.d.ach.push(a.id);
        this.d.krigle += 1;
        sfx.fanfare();
        store(this.d);
        this.openShop('book', false);
      }, D + 2);
      this.drawBtn(b, done ? t('+1 krígl') : '—', done, 'green');
      this.shopObjs.push(b.bg, b.label, b.zone);
    });
  }

  /** Sbírka → Návštěvníci: kolikrát hráč přijal / zaplatil; po VIS_GOLD zlatý rámeček = 2 💎 místo 1 */
  private bookVisitors(y0: number, D: number) {
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const cw = (W - 20 - 3 * 8) / 4;
    VISITORS.forEach((v, i) => {
      const x = 10 + (i % 4) * (cw + 8), y = y0 + Math.floor(i / 4) * 178;
      const n = this.d.vis?.[v.key], seen = n !== undefined, gold = (n ?? 0) >= VIS_GOLD;
      const g = add(this.add.graphics().setDepth(D + 1));
      g.fillStyle(col('ink'), 0.6).fillRoundedRect(x, y, cw, 170, 10);
      if (gold) g.lineStyle(4, col('gold')).strokeRoundedRect(x, y, cw, 170, 10);
      if (this.bookSel === v.key) g.lineStyle(3, col('white')).strokeRoundedRect(x - 2, y - 2, cw + 4, 174, 11);
      const z = add(this.add.zone(x, y, cw, 170).setOrigin(0).setInteractive().setDepth(D + 3));
      z.on('pointerdown', () => seen && ((this.bookSel = this.bookSel === v.key ? '' : v.key), sfx.click(), this.openShop('book', false)));
      const spr = add(this.add.sprite(x + cw / 2, y + 96, v.key, 1).setOrigin(0.5, 1).setScale(4.6).setDepth(D + 2));
      if (!seen) spr.setTintFill(col('dusk'));
      const nm = add(this.add.text(x + cw / 2, y + 110, seen ? v.name : '???', txt(18, seen ? PAL.bone : PAL.slate)).setOrigin(0.5).setDepth(D + 2));
      nm.setScale(Math.min(1, (cw - 8) / nm.width));
      if (!seen) return;
      add(this.add.text(x + cw / 2, y + 134, gold ? '2 💎' : `${n}/${VIS_GOLD}`, txt(16, gold ? PAL.gold : PAL.fog)).setOrigin(0.5).setDepth(D + 2));
      g.fillStyle(col('dusk')).fillRoundedRect(x + 10, y + 150, cw - 20, 10, 4).fillStyle(col('gold')).fillRoundedRect(x + 10, y + 150, Math.max(6, (cw - 20) * Math.min(1, (n ?? 0) / VIS_GOLD)), 10, 4);
    });
    const v = VISITORS.find((x) => x.key === this.bookSel);
    if (!v) return;
    const n = this.d.vis?.[v.key] ?? 0, py = MB - 128;
    const g = add(this.add.graphics().setDepth(D + 7));
    g.fillStyle(col('ink'), 0.97).fillRoundedRect(10, py, W - 20, 118, 12).lineStyle(3, col('gold')).strokeRoundedRect(10, py, W - 20, 118, 12);
    add(this.add.sprite(56, py + 100, v.key, 1).setOrigin(0.5, 1).setScale(4).setDepth(D + 8));
    add(this.add.text(100, py + 10, v.name, txt(26, PAL.gold)).setDepth(D + 8));
    add(this.add.text(100, py + 46, n >= VIS_GOLD ? t('štědrý návštěvník!') : t('přijato {a} / {b}', { a: n, b: VIS_GOLD }), txt(18, PAL.bone)).setDepth(D + 8));
    g.fillStyle(col('dusk')).fillRoundedRect(100, py + 72, W - 130, 10, 4).fillStyle(col('gold')).fillRoundedRect(100, py + 72, Math.max(8, (W - 130) * Math.min(1, n / VIS_GOLD)), 10, 4);
    const bt = add(this.add.text(100, py + 90, t('nic z návštěvy = +{a} 💎 · max {m} 💎 denně', { a: visGems(n), m: VIS_GEMS_DAY }), txt(16, PAL.fog)).setDepth(D + 8));
    bt.setScale(Math.min(1, (W - 120) / bt.width));
  }

  private closeShop() {
    this.leagueLive = undefined;
    this.shopObjs.forEach((o) => o.destroy());
    this.shopObjs = [];
    this.shopRows = [];
    this.decorRows = [];
    this.tutObjs.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Visible).setVisible(true));
    const ti = this.d.tut ?? -1;
    if (ti > 0 && PubScene.TUT[ti]?.done === 'up') {
      this.d.tut = ti - 1;
      this.tutShow();
    }
  }

  // ---------- tlačítko Zpět (Android) / Escape (web) ----------
  /** zavře nejvrchnější věc (stejně jako její ✕ / Zavřít): okno → rada → panel číšníka → hospoda (karty) → menu.
   *  Na hlavní obrazovce se zeptá „Ukončit hru?“, jen když je `exit` (nativní aplikace). Vrací true, když něco udělal. */
  back(exit?: () => void): boolean {
    const tut = (this.d.tut ?? -1) >= 0;
    if (this.awayObjs.length) {
      const f = this.awayClose;
      this.awayClose = undefined;
      if (f) f();
      else {
        this.awayObjs.forEach((o) => o.destroy());
        this.awayObjs = [];
      }
      sfx.click();
      return true;
    }
    if (this.hintObjs.length) return this.hideHint(), true;
    if (this.wPanel.length) return this.closeWaiter(), sfx.click(), true;
    if (this.sheet >= 0 && this.views.length > 1) return this.closeSheet(), sfx.click(), true;
    if (this.shopObjs.length) {
      // podsekce otevřená z mřížky Menu → zpět do mřížky (jako „← Menu“); Obchod, Úkoly a mřížka se zavřou (jako ✕)
      const inGrid = PubScene.TILES.some(([tb, sub]) => tb === this.tab && (tb !== 'shop' || sub === this.shopSub));
      if (!tut && this.tab === 'help') this.helpBack();
      else if (!tut && (this.tab === 'daynight' || this.tab === 'talis')) (this.shopSub = 'bones'), this.openShop('shop', false);
      else if (!tut && inGrid) this.openShop('home', false);
      else {
        this.closeShop();
        this.tut('close');
        sfx.click();
      }
      return true;
    }
    if (!exit) return false;
    this.askExit(exit);
    return true;
  }

  /** potvrzení ukončení hry (Zpět na hlavní obrazovce) */
  private askExit(exit: () => void) {
    this.askYesNo(t('Ukončit hru?'), () => {
      store(this.d);
      exit();
    });
  }

  /** okno Ano / Ne (Ne vlevo, Ano vpravo); dotaz může mít 2. řádek menším písmem */
  static statStart = false;

  /** jednou se zeptá, jestli smí posílat upozornění (mobilní aplikace) – bez nich se hráč nedozví, že je kasa plná */
  private askNotify() {
    if (this.d.ntfAsk || notesOn || !notify.available || notify.webOnly) return;
    if ((this.d.q?.length ?? 0) < 3 || (this.d.tut ?? -1) >= 0 || this.awayObjs.length || this.guideCur || this.shopObjs.length || this.ev.active) return;
    this.d.ntfAsk = true;
    store(this.d);
    this.askYesNo(t('Dát vědět, až bude kasa plná?'), () => {
      void notify.permit().then((ok) => {
        notesOn = ok;
        saveOpts();
        meter.track('notify_ask', { ok: ok ? 1 : 0 });
        if (!ok) this.banner(this.views[0].cam, t('Upozornění nejsou povolená v telefonu'));
      });
    }, t('Pošleme upozornění, když hospoda vydělá maximum, a na denní truhlu.'), 'green');
  }

  /** výzva k hodnocení v Google Play (jen mobilní aplikace): po 3. a po 10. hygieně, až když není otevřené žádné okno.
   *  Jestli se okno opravdu ukáže, rozhoduje Google (má vlastní limit). */
  private askReview() {
    const hyg = this.d.stats.prestiges, done = this.d.rev ?? 0;
    const due = (hyg >= 3 && done < 1) || (hyg >= 10 && done < 2);
    if (!due || !Capacitor.isNativePlatform()) return;
    if (this.awayObjs.length || this.guideCur || this.shopObjs.length || this.ev.active || (this.d.tut ?? -1) >= 0) return;
    this.d.rev = hyg >= 10 ? 2 : 1;
    store(this.d);
    meter.track('review_ask', { hyg });
    void InAppReview.requestReview().catch(() => undefined);
  }

  /** okno výběru jazyka (návrh A): mřížka 2×6, vybraný zlatě, dole Hrát / OK; first = první spuštění (nejde zavřít bez volby) */
  pickLang(first: boolean) {
    const D = 900, list = AVAILABLE, bw = W - 60, bx = 30, cw = (bw - 48 - 12) / 2, ch = 62, gap = 12;
    const rows = Math.ceil(list.length / 2), gridH = rows * ch + (rows - 1) * gap;
    const bh = 96 + (first ? 28 : 0) + gridH + 24 + 76 + 24, by = Math.round((H - bh) / 2);
    let sel: Lang = lang;
    const objs: Phaser.GameObjects.GameObject[] = [];
    objs.push(this.add.rectangle(0, 0, W, H, 0x1e1420, 0.85).setOrigin(0).setDepth(D).setInteractive());
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    objs.push(g);
    // okno je vždy anglicky (přání Petra), názvy jazyků v originále
    const tx = this.add.text(W / 2, by + 28, 'LANGUAGE', txt(34, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2);
    tx.setScale(Math.min(1, (bw - 40) / tx.width));
    objs.push(tx);
    let y = by + 84;
    if (first) {
      objs.push(this.add.text(W / 2, y, `Phone language: ${LANGS[lang]}`, txt(20, PAL.bone)).setOrigin(0.5, 0).setDepth(D + 2));
      y += 32;
    }
    const btns: { b: Btn; l: Lang }[] = [];
    const draw = () =>
      btns.forEach(({ b, l }) => {
        this.drawBtn(b, LANGS[l], true, l === sel ? 'gold' : 'slate');
        b.label.setFontSize(26).setScale(1);
        b.label.setScale(Math.min(1, (cw - 16) / Math.max(1, b.label.width)));
      });
    list.forEach((l, k) => {
      const b = this.btn(bx + 24 + (k % 2) * (cw + 12), y + Math.floor(k / 2) * (ch + gap), cw, ch, () => {
        sel = l;
        sfx.click();
        draw();
      }, D + 3);
      btns.push({ b, l });
      objs.push(b.bg, b.label, b.zone);
    });
    draw();
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    const ok = this.btn(bx + 24, y + gridH + 24, bw - 48, 76, () => {
      if (sel !== lang) return setLang(sel);
      keepLang();
      close();
      if (!first) this.openShop('opts', false);
    }, D + 3);
    this.drawBtn(ok, first ? 'Play' : 'OK', true, 'green');
    ok.label.setFontSize(34);
    objs.push(ok.bg, ok.label, ok.zone);
    this.awayObjs = objs;
    this.awayClose = first ? () => {} : close;
  }

  private askYesNo(q: string, yesFn: () => void, sub?: string, yesStyle: 'red' | 'green' = 'red') {
    const D = 540, bx = 50, by = 360, bw = W - 100, bh = sub ? 280 : 220;
    const objs: Phaser.GameObjects.GameObject[] = [];
    objs.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(D).setInteractive());
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    objs.push(g);
    const tx = this.add.text(W / 2, by + 36, q, txt(34, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2);
    tx.setScale(Math.min(1, (bw - 40) / tx.width));
    objs.push(tx);
    if (sub) objs.push(this.add.text(W / 2, by + 86, sub, txt(20, PAL.bone)).setOrigin(0.5, 0).setAlign('center').setWordWrapWidth(bw - 40).setDepth(D + 2));
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    const no = this.btn(bx + 24, by + bh - 88, 160, 64, close, D + 3);
    this.drawBtn(no, t('Ne'), true, 'slate');
    const yes = this.btn(bx + bw - 184, by + bh - 88, 160, 64, () => {
      close();
      yesFn();
    }, D + 3);
    this.drawBtn(yes, t('Ano'), true, yesStyle);
    objs.push(no.bg, no.label, no.zone, yes.bg, yes.label, yes.zone);
    this.awayObjs = objs;
    this.awayClose = close;
    sfx.click();
  }

  private buyUp(u: UpgradeDef) {
    if (this.d.coins < u.cost || this.d.up.includes(u.id)) return sfx.error();
    this.d.coins -= u.cost;
    this.d.up.push(u.id);
    const i = this.d.pubs.findIndex((p) => p.act === u.act);
    this.tut('up');
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
    // QA hospoda 66: hygiena má přednost před splněným úkolem (kdo úkoly nevybírá, radu hygieny jinak nikdy neviděl)
    const k = this.kriglyNow(), pm = prestigeMin(d.stats.prestiges);
    if (k >= pm && k >= d.krigle * 0.3) return { text: t('Zavolej hygienu (Obchod): dostaneš +{k} krígel = výdělek navždy +{v} %.', { k: big(k), v: big(Math.round(k * KRIGL_BONUS * 100)) }), go: open('shop', 'up') };
    if (this.claimable()) return { text: t('Máš splněný úkol – vyzvedni odměnu v Úkolech.'), go: open('tasks') };
    const now = Date.now();
    if (p.mgr && !this.boosted(p) && (p.boostReady ?? 0) <= now) return { text: t('Pusť schopnost manažera „{s}“ – výdělek ×{m}.', { s: MANAGERS[p.act].skill, m: BOOST_MULT }), go: () => this.useSkill(i) };
    for (const def of this.stations()) {
      const st = p.st[def.id];
      const cost = def.staff * actMult(p.act) * (1 - this.ts().staff);
      if (st && st.lvl > 0 && !st.auto && d.coins >= cost) return { text: def.id === 'tap' ? t('Najmi číšníky na Pípu – pípa pak točí sama a oni roznášejí pivo, i když tu nejsi.') : t('Najmi obsluhu na „{s}“ – pak pracuje sama, i když tu nejsi.', { s: STATION_NAMES[p.act][def.id] }) };
    }
    const off = this.shopOffer().find((o) => o.cost <= d.coins);
    if (off) return { text: t('V Obchodě si můžeš koupit: {s}.', { s: off.title }), go: open('shop', 'up') };
    if (!this.tileLock('krigl')) {
      // hospoda 72: utracené krígly bonus výdělku neztrácejí → rada už není past (dřív jen od 50 krígel a do 5 % vlastněných)
      const it = KRIGL_SHOP.find((x) => !kMaxed(x, this.kl(x.id)) && x.cost(this.kl(x.id)) <= d.krigle);
      if (it) return { text: t('Za krígly si můžeš koupit: {s}.', { s: it.name }), go: open('krigl') };
    }
    if (!this.tileLock('keeper') && this.skillPoints() > 0) return { text: t('Hostinský má volný bod – vyber dovednost.'), go: open('keeper') };
    if (!this.tileLock('brew') && this.brewFull()) return { text: t('Pivovar je plný – prodej pivo nebo ho dej do vylepšení.'), go: open('brew') };
    if (this.tabAlert('temple')) return { text: t('Je víkend – v Chrámu čeká Cthulhu.'), go: () => this.openTemple() };
    // na co šetřit: nejlevnější další úroveň stanice ve vybrané hospodě
    let best: { name: string; cost: number } | null = null;
    for (const def of this.stations()) {
      const lvl = p.st[def.id]?.lvl ?? 0;
      const cost = Math.ceil(costN(def, lvl, 1) * actMult(p.act) * starCost(this.d.stars, p.act, def.id));
      if (!best || cost < best.cost) best = { name: STATION_NAMES[p.act][def.id], cost };
    }
    if (best && d.coins >= best.cost) return { text: t('Kup další úroveň: {s}. Každých 25 úrovní výdělek ×2.', { s: best.name }) };
    const rate = this.totalRate();
    const wait = best && rate > 0 ? dur((best.cost - d.coins) / rate) : '';
    return { text: best ? t('Šetři na „{s}“ ({c} coins, asi {d}). Mezitím ťukej na bubliny hostů – dávají spropitné.', { s: best.name, c: big(best.cost), d: wait }) : t('Ťukej na bubliny hostů – dávají spropitné.') };
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
        this.showHint(PUB_BOT - 100, false);
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

  /** délka schopnosti manažera a čekání do další (ms) */
  private boostLen(p: PubState) {
    return BOOST_S * 1000 * (this.has('sabre') ? 2 : 1) * (1 + this.ts().skill) * (isStyle(p, 'kitchen') ? 1.5 : 1) * (this.star('happy2') ? 2 : 1);
  }
  private boostCd() {
    return (BOOST_S + BOOST_CD * (1 - Math.min(0.5, this.ts().mgrcd))) * 1000;
  }

  /** Přetáčení hodin (QA hospoda 66): časy „do kdy“ jsou absolutní – hodiny vrácené dozadu by schopnost / happy hour
   *  prodloužily (i o dny). Nic nesmí končit později než za svou plnou délku od teď. */
  private clampClock() {
    const now = Date.now();
    for (const p of this.d.pubs) {
      if (p.boostUntil !== undefined && p.boostUntil - now > this.boostLen(p)) p.boostUntil = now + this.boostLen(p);
      const cd = Math.max(this.boostCd(), this.boostLen(p));
      if (p.boostReady !== undefined && p.boostReady - now > cd) p.boostReady = now + cd;
    }
    const fx = this.d.fx;
    if (fx?.happy !== undefined && fx.happy - now > this.happyMin() * 60_000) fx.happy = now + this.happyMin() * 60_000;
  }

  private useSkill(i: number, quiet = false) {
    const p = this.d.pubs[i];
    const now = Date.now();
    if (!p.mgr || this.boosted(p) || (p.boostReady ?? 0) > now) return sfx.error();
    p.boostUntil = now + this.boostLen(p);
    // vrchol „Druhý manažer“: každé druhé puštění je hned po skončení nabité znovu
    const dbl = this.star('mgr2') && !p.dbl;
    p.boostReady = dbl ? p.boostUntil : now + this.boostCd();
    p.dbl = dbl;
    if (!quiet) this.banner(this.views[i].cam, t('{s}! Výdělek ×{m}', { s: MANAGERS[p.act].skill, m: BOOST_MULT }));
    store(this.d);
  }

  private drawSkill(i: number) {
    const p = this.d.pubs[i];
    const b = this.skillBtns[i];
    if (!b) return;
    // tlačítka všech hospod leží na stejném místě – ťuknutí smí chytit jen to vybrané hospody (dřív chytalo poslední)
    const mine = this.views.length < 2 || i === this.sel;
    b.zone.input && (b.zone.input.enabled = mine);
    const ic = (this.skillIcons[i] ??= this.add.image(0, 0, 'icons', 'bolt').setDepth(61));
    const sub = (this.skillSubs[i] ??= this.add.text(0, 0, '', txt(15, PAL.gold)).setOrigin(0.5, 0).setDepth(61));
    if (!p.mgr || !mine) {
      ic.setVisible(false);
      sub.setVisible(false);
      this.skillKeys[i] = '';
      return this.drawBtn(b, '', false, 'amber', false);
    }
    const now = Date.now();
    const mmss = (ms: number) => {
      const s = Math.ceil(ms / 1000);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };
    // kulatá ikona (návrh 4): připravená = zlatý blesk, běží = ×2 a čas, nabíjí se = šedá s časem
    const boost = this.boosted(p), wait = !boost && (p.boostReady ?? 0) > now;
    const txt2 = boost ? mmss(p.boostUntil! - now) : wait ? mmss(p.boostReady! - now) : '';
    const key = `${boost}|${wait}|${txt2}|${b.x}|${b.y}`;
    b.visible = true;
    b.zone.setVisible(true); // drawBtn(..., false) zónu skryl – po najmutí manažera musí jít zase ťuknout
    b.enabled = !wait;
    if (this.skillKeys[i] === key) return;
    this.skillKeys[i] = key;
    // vzhled: dřevěná cedule (výběr uživatele – návrh 2, docs/navrhy-ui/blesk-3-navrhy.png)
    this.drawSkillSign(i, boost, wait, txt2, ic, sub);
    void MANAGERS;
  }
  /** schopnost manažera jako dřevěná cedule: připraveno = „ŠŤASTNÁ HODINA ×3“, nabíjí = pruh a čas, běží = červená a ubývá */
  private drawSkillSign(i: number, boost: boolean, wait: boolean, tt: string, ic: Phaser.GameObjects.Image, sub: Phaser.GameObjects.Text) {
    const p = this.d.pubs[i], b = this.skillBtns[i], g = b.bg, now = Date.now();
    const fill = wait ? 1 - Math.max(0, (p.boostReady! - now) / ((BOOST_S + BOOST_CD) * 1000)) : 1;
    const run = boost ? Math.max(0, (p.boostUntil! - now) / (BOOST_S * 1000)) : 0;
    g.clear().setVisible(true);
    sub.setVisible(false);
    ic.setVisible(false);
    b.w = 156;
    b.h = 44;
    g.fillStyle(col('ink')).fillRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6).fillStyle(col(boost ? 'red' : wait ? 'olive' : 'rust')).fillRect(b.x, b.y, b.w, b.h);
    g.fillStyle(col('ink'), 0.25).fillRect(b.x, b.y + b.h - 8, b.w, 8);
    if (wait) g.fillStyle(col('sand'), 0.5).fillRect(b.x, b.y + b.h - 6, b.w * fill, 6);
    if (boost) g.fillStyle(col('gold')).fillRect(b.x, b.y + b.h - 6, b.w * run, 6);
    if (!wait && !boost) g.lineStyle(3, col('gold')).strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
    const name = MANAGERS[p.act].skill.toUpperCase();
    b.label.setVisible(true).setText(boost ? t('×{m} ještě {t}', { m: BOOST_MULT, t: tt }) : wait ? t('hodina za {t}', { t: tt }) : `${name} ×${BOOST_MULT}`).setPosition(b.x + b.w / 2, b.y + 19).setColor(wait ? PAL.fog : PAL.gold).setFontSize(18).setScale(1);
    b.label.setScale(Math.min(1, (b.w - 10) / Math.max(1, b.label.width)));
    b.zone.setPosition(b.x, b.y).setSize(b.w, b.h);
  }
  skillIcons: Phaser.GameObjects.Image[] = [];
  skillKeys: string[] = [];
  skillSubs: Phaser.GameObjects.Text[] = [];

  // ---------- návštěvníci s rozhodnutím ----------
  visitT = 120;
  /** otevřený návštěvník: průběžně přebarvuje tlačítka podle coins */
  visitLive?: () => void;

  /** (pro testy) */
  visitList() {
    return VISITORS;
  }

  /** 💎 od návštěvníka, ze kterého hráč nic neměl (strop za den; štědrý návštěvník 2) */
  private visitGem(key: string) {
    const day = dayKey();
    if (!this.d.visG || this.d.visG.day < day) this.d.visG = { day, n: 0 };
    const n = Math.min(visGems(this.d.vis?.[key] ?? 0), VIS_GEMS_DAY - this.d.visG.n);
    if (n <= 0) return;
    this.d.visG.n += n;
    this.d.gems = (this.d.gems ?? 0) + n;
    this.time.delayedCall(1300, () => this.banner(this.views[0].cam, t('+{n} 💎 za návštěvu', { n }), true));
    store(this.d);
  }

  private visitCtx(key = ''): VisitCtx {
    const cam = this.views[0].cam;
    const income = (secs: number) => Math.max(50, Math.round(Math.max(this.totalRate(), this.pay(this.d.pubs[0], STATIONS[0]) / STATIONS[0].cycle) * secs));
    return {
      gem: () => key && this.visitGem(key),
      income,
      // kontrola hospoda 70: návštěvník nesmí nového hráče obrat o všechno – do 1. hygieny bez ztrát, pokuta nejvýš 30 % coins
      safe: this.d.stats.prestiges === 0,
      fine: (secs) => Math.floor(Math.min(income(secs), this.d.coins * 0.3)),
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
    const c = this.visitCtx(v.key);
    // Sbírka: návštěvník je „viděný“, jakmile přijde
    this.d.vis = { ...this.d.vis, [v.key]: this.d.vis?.[v.key] ?? 0 };
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
      // cena nejvýš polovina toho, co hráč právě má – dřív skoro vždy „chybí 5K“ a volba nebyla volba
      const cost = Math.min(ch.cost(c), Math.floor(this.d.coins / 2));
      const b = this.btn(bx + 20 + i * (bw / 2), by + bh - 104, bw / 2 - 40, 84, () => {
        if (this.d.coins < cost) return sfx.error();
        this.d.coins -= cost;
        close();
        // přijetí / zaplacení (volba a) se počítá do Sbírky
        if (i === 0) this.d.vis = { ...this.d.vis, [v.key]: (this.d.vis?.[v.key] ?? 0) + 1 };
        meter.track('visitor', { key: v.key, pick: i });
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
      // Zkušebna (H2): nad tlačítkem krátce, co volba udělá
      const hint = this.add.text(b.x + b.w / 2, b.y - 10, ch.hint(c), txt(18, PAL.sand)).setOrigin(0.5, 1).setAlign('center').setWordWrapWidth(b.w + 10).setDepth(D + 2);
      objs.push(b.bg, b.label, b.zone, hint);
    });
    this.visitLive = () => draws.forEach((f) => f());
    this.awayObjs = objs;
    this.awayClose = close; // Zpět = návštěvníka odmítnout bez volby
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
    const bx = 30, by = 190, bw = W - 60, bh = 560;
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
    // návrh 2B (vybráno): před / po – krígly teď → po hygieně a kolikrát víc se bude vydělávat navždy
    tx(by + 20, t('Hygiena!'), 40, PAL.scarlet);
    tx(by + 70, t('zavře hospodu: coins, úrovně a vylepšení začnou od nuly'), 18, PAL.fog);
    const cur = this.kAll() * KRIGL_BONUS, nw = (this.kAll() + k) * KRIGL_BONUS;
    const cy = by + 128;
    const side = (x: number, head: string, val: string, c: string) => {
      const h = this.add.text(x, cy, head, txt(22, PAL.fog)).setOrigin(0.5, 0).setDepth(D + 2);
      const v = this.add.text(x, cy + 26, val, txt(40, c)).setOrigin(0.5, 0).setDepth(D + 2);
      const m = this.add.image(x, cy + 96, 'obj', 'krigl0').setScale(3).setDepth(D + 2);
      objs.push(h, v, m);
    };
    side(bx + 90, t('teď'), big(this.d.krigle), PAL.bone);
    side(bx + bw - 90, t('po'), big(this.d.krigle + k), PAL.mint);
    objs.push(this.add.text(W / 2, cy + 30, '➜', txt(48, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2));
    tx(cy + 132, '×' + ((1 + nw) / (1 + cur)).toFixed(2).replace('.', ','), 64, PAL.gold);
    tx(cy + 206, t('výdělek navždy'), 22, PAL.bone);
    // Zkušebna O1/L1 (Petr 26. 11.): bez další hospody okno jmenuje nejbližší odemčení v Menu
    const nu = next ? null : this.nextUnlock();
    if (next) tx(cy + 240, t('+ nová hospoda: {n}', { n: next }), 24, PAL.mint);
    else if (nu) {
      const soon = nu.n <= this.d.stats.prestiges + 1 && nu.earnOk;
      tx(cy + 240, soon ? t('po této hygieně: {s}', { s: nu.label }) : t('další novinka: {s} po {n}. hygieně', { s: nu.label, n: nu.n }), soon ? 24 : 20, soon ? PAL.mint : PAL.sand);
    }
    // Zkušebna P3 (Petr vybral C): co zůstane a jestli se vyplatí počkat 5 min
    const k5 = this.kriglyNow(this.d.run + this.totalRate() * 300) - k;
    const keep = t('zůstane: 💎 · číšníci · sbírka · krígly');
    const wait = k5 >= 1 ? t('za 5 min: krígly +{n}', { n: k5 }) : t('teď je dobrá chvíle');
    const ly = cy + (next || nu ? 276 : 246);
    tx(ly, keep, 18, PAL.mint);
    tx(ly + 26, wait, 18, k5 >= 1 ? PAL.sand : PAL.mint);
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = []; // jinak zůstane hospoda zablokovaná
    };
    const no = this.btn(bx + 24, by + bh - 88, 180, 64, () => close(), D + 3);
    this.drawBtn(no, t('Ještě ne'), true, 'slate');
    const yes = this.btn(bx + bw - 204, by + bh - 88, 180, 64, () => this.prestige(), D + 3);
    this.drawBtn(yes, t('Zavřít hospodu'), true, 'red');
    objs.push(no.bg, no.label, no.zone, yes.bg, yes.label, yes.zone);
    yes.label.setScale(Math.min(1, 160 / yes.label.width));
    this.awayObjs = objs; // blokuje ťukání do hospody
    this.awayClose = close;
    sfx.error();
  }

  /** coins na rozjezd po hygieně: otevřít pípu nové hospody a najmout tam číšníky + číšníci v Pajzlu
   *  (jinak průvodce „OTEVŘI PÍPU“ nejde dokončit – po hygieně nic nevydělává) */
  private restartNeed() {
    const tap = STATIONS[0], last = this.d.pubs[this.d.pubs.length - 1];
    return Math.ceil(((tap.base + tap.staff) * actMult(last.act) + tap.staff * 2) * 1.2);
  }

  /** kolik dnešních hygien ještě dá 💎 */
  private hygGemsLeft() {
    const day = dayKey();
    if (!this.d.hygG || this.d.hygG.day < day) this.d.hygG = { day, n: 0 };
    return PRESTIGE_GEMS_DAY - this.d.hygG.n;
  }

  /** kolik hvězd stanic přibylo při poslední hygieně (nápis po restartu scény) */
  starMsg = 0;
  private prestige() {
    // schopnost „Sudová loterie“: 1–3 krígly navíc
    const k = this.kriglyNow() + (this.star('lottery') ? Phaser.Math.Between(1, 3) : 0);
    const lastRun = this.d.run;
    // hvězdy stanic: úroveň STAR_LVL v tomhle běhu = +1 hvězda (nejvýš STAR_MAX)
    for (const p of this.d.pubs)
      for (const def of STATIONS) {
        const n = starsOf(this.d.stars, p.act, def.id);
        if (n < STAR_MAX && (p.st[def.id]?.lvl ?? 0) >= STAR_LVL[def.id]) ((this.d.stars ??= {})[starKey(p.act, def.id)] = n + 1), this.starMsg++;
      }
    const n = Math.min(MAX_PUBS, this.d.pubs.length + 1);
    if (n > this.d.pubs.length) (this.d.pubIntro = n), ((this.d.guideQ ??= []).push('pub' + n));
    this.d.krigle += k;
    if (this.hygGemsLeft() > 0) {
      this.d.hygG!.n++;
      this.d.gems = (this.d.gems ?? 0) + GEMS_FREE.prestige;
    }
    // první hygiena: den a noc se teprve zapnou – začne celý nový den (první noc až za 8 min)
    if (!this.nightsOn()) {
      const dn = (this.d.dn ??= { lvl: 0, v2: true });
      nightCfg.shift = dn.shift ?? 0;
      dn.shift = switchPhase(false);
    }
    this.d.stats.prestiges++;
    this.spPts('hyg');
    const R = this.rk();
    if (R) (rekoCount(R, 'hyg'), rekoMax(R, 'kmax', k));
    meter.track('hygiene', { n: this.d.stats.prestiges, pubs: n });
    this.d.run = 0;
    this.d.coins = 0;
    this.d.up = [];
    const keep = this.kl('keepMgr') > 0;
    const had = this.d.pubs.map((p) => !!p.mgr);
    const crews = this.d.pubs.map((p) => p.w);
    const oldPubs = this.d.pubs;
    this.d.pubs = Array.from({ length: n }, (_, i) => newPub((i + 1) as Act));
    // hvězda „Dobrá pověst“: 5 % úrovní stanic zůstane
    if (this.star('keep5'))
      this.d.pubs.forEach((p, i) => {
        for (const def of STATIONS) {
          const keepL = Math.floor((oldPubs[i]?.st[def.id]?.lvl ?? 0) * 0.05);
          if (keepL > (p.st[def.id]?.lvl ?? 0)) p.st[def.id] = { lvl: keepL, auto: false, prog: 0 };
        }
      });
    // číšníci (zkušenosti a body) zůstávají i po hygieně
    this.d.pubs.forEach((p, i) => crews[i] && (p.w = crews[i]));
    if (keep) this.d.pubs.forEach((p, i) => (p.mgr = had[i] ?? false));
    // QA (hospoda 67): kdo po hygieně hned odešel, vydělal offline 0 (bez obsluhy) → pípa 1. hospody rovnou otevřená a s číšníky
    const tap0 = this.st(this.d.pubs[0], 'tap');
    tap0.lvl = Math.max(1, tap0.lvl);
    tap0.auto = true;
    // vrchol „Pivní dynastie“: stanice hned na 25. úrovni (první milník), s obsluhou, a manažer najatý
    if (this.star('dynasty'))
      for (const p of this.d.pubs) {
        for (const def of STATIONS) {
          const s0 = this.st(p, def.id);
          s0.lvl = Math.max(25, s0.lvl);
          s0.auto = true;
        }
        p.mgr = true;
      }
    // „Zásobárna“: start s 2 % výdělku minulého kola; „Rozjezd“: 90 s výdělek ×5
    this.d.coins = Math.max(startCoins(this.kl('start')), this.restartNeed(), this.star('pantry') ? Math.floor(lastRun * 0.02) : 0);
    // Rozjezd po každé hygieně (Zkušebna 26. 11.: 1. hygiena dala jen +3,6 %, 2. kolo bylo 1,06× rychlejší):
    // 2 min ×3, s hvězdou „Rozjezd“ 90 s ×5 jako dřív
    const rush = this.star('rush');
    this.d.rushU = Date.now() + (rush ? 90_000 : RUSH_S * 1000);
    this.d.rushM = rush ? 5 : RUSH_MULT;
    this.d.rushNew = true;
    store(this.d);
    sfx.fanfare();
    this.awayObjs = [];
    this.scene.restart();
  }

  // ---------- návod pro nového hráče ----------
  tutObjs: Phaser.GameObjects.GameObject[] = [];
  private static TUT: { head: string; text: string; done: string }[] = [
    { head: t('ŤUKNI NA PÍPU'), text: t('hostinský natočí pivo a vyděláš coins'), done: 'tap' },
    { head: t('KUP ÚROVEŇ PÍPY'), text: t('vyšší úroveň = víc coins za každé pivo'), done: 'buy:tap' },
    { head: t('ŤUKNI NA BUBLINU'), text: t('host si objednal – dá ti spropitné'), done: 'tip' },
    { head: t('NAJMI ČÍŠNÍKY'), text: t('pak hospoda vydělává sama'), done: 'hire' },
    { head: t('OTEVŘI KUCHYNI'), text: t('další zdroj coins'), done: 'buy:kitchen' },
    // posudek nováčka: dřív „Ťukni na Menu“ (samé zámky) a prázdný Obchod → teď návod skončí nákupem ×3 (vidět skok výdělku)
    { head: t('ŤUKNI NA OBCHOD'), text: t('tady kupuješ vylepšení výdělku'), done: 'tile:shop' },
    { head: t('KUP VYLEPŠENÍ ×3'), text: t('celá stanice vydělává 3× víc'), done: 'up' },
    { head: t('HOTOVO!'), text: t('další věci se odemknou časem'), done: 'close' },
  ];

  /** událost hráče posune návod */
  private tut(ev: string) {
    this.guideEv(ev);
    const i = this.d.tut ?? -1;
    if (i < 0 || PubScene.TUT[i].done !== ev) return;
    // na vylepšení ještě nemá → Obchod otevřít může, ale návod čeká (ukazuje, jak coins získat)
    if (ev === 'tile:shop' && this.tutNeed(ev) > 0) return;
    this.d.tut = i + 1 >= PubScene.TUT.length ? -1 : i + 1;
    meter.track(this.d.tut < 0 ? 'tutorial_done' : 'tutorial_step', { step: i + 1 });
    // konec návodu: začne celý nový den (noc s kostmi přijde až za 8 min)
    if (this.d.tut < 0) {
      // Zkušebna 26. 11.: po návodu chvíle klidu – dřív hned vyskočil návštěvník přes HOTOVO! a za ním událost
      this.visitT = Math.max(this.visitT, 90);
      this.ev.next = Math.max(this.ev.next, 45);
      const dn = (this.d.dn ??= { lvl: 0, v2: true });
      nightCfg.shift = dn.shift ?? 0;
      dn.shift = switchPhase(false);
      this.tutFinale();
    }
    this.tutShow();
  }

  /** konec návodu: cedule HOTOVO! na hlavní obrazovce, sama zmizí */
  /** do kdy svítí cedule HOTOVO! (průvodce novinkami počká) */
  tutFinaleUntil = 0;
  private tutFinale() {
    this.tutFinaleUntil = Date.now() + 4000;
    const step = PubScene.TUT[PubScene.TUT.length - 1], D = 430, by = TOP + 16;
    const hd = this.add.text(W / 2, by + 6, step.head, txt(46, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 1);
    const tx = this.add.text(W / 2, by + 58, step.text, { fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fontSize: '22px', color: PAL.white, align: 'center', wordWrap: { width: W - 90 } }).setOrigin(0.5, 0).setDepth(D + 1);
    const bh = 58 + Math.max(tx.height, 30) + 22;
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('ink'), 0.96).fillRoundedRect(40, by - 12, W - 80, bh, 12);
    g.lineStyle(4, col('gold')).strokeRoundedRect(40, by - 12, W - 80, bh, 12);
    const objs = [g, hd, tx];
    confetti(this, W / 2, by + bh, 50, D + 2, 0.8);
    sfx.levelUp();
    this.tweens.add({ targets: objs, alpha: 0, delay: 3500, duration: 500, onComplete: () => objs.forEach((o) => o.destroy()) });
  }

  private tutShow(textOnly = false) {
    if (textOnly && this.tutBub) {
      const i0 = this.d.tut ?? -1;
      const need = i0 >= 0 ? this.tutNeed(PubScene.TUT[i0].done) : 0;
      const manual = !this.st(this.d.pubs[0], 'tap').auto;
      if (need > 0) {
        const [h, x] = this.tutPoorText(manual, need, PubScene.TUT[i0].done);
        this.tutHead?.setText(h).setScale(1);
        this.tutHead?.setScale(Math.min(1, (W - 110) / this.tutHead.width));
        this.tutBub.setText(x);
      }
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
    let [head, text] = [step.head, step.text];
    if (need > 0) [head, text] = this.tutPoorText(tapManual, need, step.done);
    // Obchod je ve spodní liště (vidět i nad otevřeným menu – výběr B)
    const menuY0 = MENU_Y0;
    const nb = this.navBtns[1];
    const shopTile = [nb.x + 6, nb.y + 4, nb.w - 12, nb.h - 8];
    // krok „kup vylepšení“: tlačítko vylepšení v otevřeném obchodě, na které hráč má
    const upB = step.done === 'up' ? (this.shopRows.find((r) => r.o.cost <= this.d.coins) ?? this.shopRows[0])?.b : undefined;
    let tx = 0, ty = 0;
    // ťukání na pípu: šipka nad dlaždicí, zvýrazněná horní část dlaždice nad tlačítkem (kde se ťuká)
    const tapHere = (need > 0 && tapManual) || step.done === 'tap';
    const kitchenSave = (step.done === 'buy:kitchen' || step.done === 'tile:shop') && need > 0 && !tapManual;
    const tc = card('tap'), tapX = tc.x + tc.w / 2, tapTop = tc.y + 2;
    // dlaždice: horní část (název, pruh) = ruční ťuknutí; tlačítka pod ní
    const tapArea = (c: Card) => [c.x - 4, c.y - 4, c.w + 8, PubScene.TL.btn - 2];
    const tileR = (c: Card) => [c.x - 4, c.y - 4, c.w + 8, c.h + 8];
    if (tapHere) [tx, ty] = [tapX, tapTop];
    else if (step.done === 'buy:tap') [tx, ty] = [tc.buy.x + tc.buy.w / 2, tc.buy.y];
    else if (step.done === 'hire') [tx, ty] = [tc.staff.x + tc.staff.w / 2, tc.staff.y];
    // na kuchyň ještě nemá: šipka na Pípu (ta coins vydělává), na „Otevřít“ až když na něj má (přání uživatele)
    else if (step.done === 'buy:kitchen' && need > 0) [tx, ty] = [tapX, tapTop];
    else if (step.done === 'buy:kitchen') [tx, ty] = [card('kitchen').buy.x + card('kitchen').buy.w / 2, card('kitchen').buy.y];
    else if (step.done === 'tile:shop' && need > 0) [tx, ty] = [tapX, tapTop];
    else if (step.done === 'tile:shop') [tx, ty] = [shopTile[0] + shopTile[2] / 2, shopTile[1]];
    else if (step.done === 'up' && upB) [tx, ty] = [upB.x + upB.w / 2, upB.y];
    // H1: konec návodu míří na „Hospoda“ ve spodní liště (velký cíl pro palec), ne na malý křížek nahoře
    else if (step.done === 'close') [tx, ty] = [this.navBtns[0].x + this.navBtns[0].w / 2, this.navBtns[0].y + 4];
    else [tx, ty] = [this.shopBtn.x + this.shopBtn.w / 2, this.shopBtn.y + 4];
    const D = 420;
    // ztmavení okolí: světlý zůstane jen cíl (u hosta ne – ten se hýbe)
    if (step.done !== 'tip') {
      const [hw, hh] = step.done === 'tile:shop' ? [180, 126] : step.done === 'close' ? [66, 54] : [260, 96];
      let [hx, hy] = step.done === 'menu' ? [this.shopBtn.x + 4, this.shopBtn.y + 4] : [tx - hw / 2, ty - 6];
      let [w2, h2] = step.done === 'menu' ? [this.shopBtn.w - 8, this.shopBtn.h - 8] : [hw, hh];
      if (step.done === 'tile:shop') [hx, hy, w2, h2] = [shopTile[0] - 4, shopTile[1] - 4, shopTile[2] + 8, shopTile[3] + 8];
      if (step.done === 'close') { const nb0 = this.navBtns[0]; [hx, hy, w2, h2] = [nb0.x + 4, nb0.y + 4, nb0.w - 8, nb0.h - 8]; }
      // nákup / kostlivec: rámeček přesně kolem tlačítka
      if (step.done === 'buy:tap' || step.done === 'buy:kitchen') {
        const b = card(step.done.slice(4)).buy;
        [hx, hy, w2, h2] = [b.x - 6, b.y - 6, b.w + 12, b.h + 12];
      } else if (step.done === 'up' && upB) {
        [hx, hy, w2, h2] = [upB.x - 6, upB.y - 6, upB.w + 12, upB.h + 12];
      } else if (step.done === 'hire') {
        const b = card('tap').staff;
        [hx, hy, w2, h2] = [b.x - 6, b.y - 6, b.w + 12, b.h + 12];
      }
      // ťukání na pípu: světlá horní část dlaždice (název a pruh – tam se ťuká)
      if (tapHere && need <= 0) [hx, hy, w2, h2] = tapArea(tc);
      if (need > 0) {
        // bez peněz: světlá celá dlaždice (nahoře ťukání, dole nákup), ať je vidět obojí
        [hx, hy, w2, h2] = tileR(card(tapManual ? 'tap' : step.done === 'buy:kitchen' ? 'kitchen' : 'tap'));
        // šetření na kuchyň (přání uživatele): světlá i dlaždice Pípy vedle ní – mezitím jde vylepšovat pípu
        if ((step.done === 'buy:kitchen' || step.done === 'tile:shop') && !tapManual) {
          const kc = card('kitchen');
          [hx, hy, w2, h2] = [tc.x - 4, tc.y - 4, kc.x + kc.w - tc.x + 8, Math.max(tc.h, kc.h) + 8];
        }
      }
      this.tutRect = [hx, hy, w2, h2];
      const dim = this.add.graphics().setDepth(D - 1);
      dim.fillStyle(0x000000, 0.6);
      // šetření na kuchyň: hospoda (bubliny hostů) zůstane světlá
      const y0 = kitchenSave ? PUB_BOT : 0;
      dim.fillRect(0, y0, W, hy - y0).fillRect(0, hy + h2, W, H - hy - h2).fillRect(0, hy, hx, h2).fillRect(hx + w2, hy, W - hx - w2, h2);
      dim.lineStyle(3, col('gold')).strokeRoundedRect(hx, hy, w2, h2, 10);
      this.tutObjs.push(dim);
    }
    // u Menu níž, ať ji nepřekryje šipka; u bubliny dole přes karty (šipka nad bublinou by jinak přeškrtla text)
    const by = step.done === 'tip' ? PUB_BOT + 30 : TOP + (step.done === 'menu' ? 90 : 16);
    // návrh C: krok x/8, velký zlatý pokyn, pod ním vysvětlení běžným tučným písmem
    const hd = this.add.text(W / 2, by + 6, head, txt(46, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 1);
    hd.setScale(Math.min(1, (W - 110) / hd.width));
    const bub = this.add.text(W / 2, by + 58, text, { fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fontSize: '22px', color: PAL.white, align: 'center', wordWrap: { width: W - 90 } }).setOrigin(0.5, 0).setDepth(D + 1);
    const nr = this.add.text(52, by - 4, t('krok {a}/{b}', { a: i + 1, b: PubScene.TUT.length }), txt(20, PAL.fog)).setDepth(D + 1);
    this.tutBub = bub;
    this.tutHead = hd;
    const g = this.add.graphics().setDepth(D);
    const bh = 58 + Math.max(bub.height, 52) + 22;
    g.fillStyle(col('ink'), 0.96).fillRoundedRect(40, by - 12, W - 80, bh, 12);
    g.lineStyle(4, col('gold')).strokeRoundedRect(40, by - 12, W - 80, bh, 12);
    this.tutObjs.push(hd, nr);
    const up = false; // Menu je teď dole ve spodní liště → šipka shora
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
    // v menu jen šipka na křížek (přání uživatele) – cedule HOTOVO! až po zavření menu na hlavní obrazovce
    if (step.done === 'close') [g, hd, bub, nr].forEach((o) => o.setVisible(false));
    // kde ťukat: pulzující kruhy a „ŤUKNI“ přímo na pruhu karty Pípa
    if (tapHere) {
      const cx = tapX, cy = tc.y + PubScene.TL.bar + PubScene.TL.barH / 2;
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
    } else if (kitchenSave) {
      // šipka na bublinu hosta (když žádná není, na Pípu)
      this.tutFollow = () => {
        const p = this.views[0]?.tipTarget();
        if (p) holder.setPosition(p.x, p.y - 4);
        else holder.setPosition(tapX, tapTop);
      };
      this.tutFollow();
    }
  }

  /** noc (příšery platí kostmi) – během návodu nikdy, ať nový hráč vydělává coins */
  private nightNow() {
    return (this.d.tut ?? -1) < 0 && this.nightsOn() && isNight();
  }

  /** den a noc běží až od 1. hygieny (posudek nováčka: noc v 8. minutě zastavila coins, když se hráč rozjel);
   *  kdo už noc zažil, tomu zůstane */
  nightsOn() {
    return nightForced || !!this.d.nightInfo || this.d.stats.prestiges > 0;
  }

  /** u kroku „ťukni na hosta“ šipka sleduje hosta (volá se z update) */
  private tutFollow: (() => void) | null = null;
  private tutPoor = false;
  /** zvýrazněné místo návodu (x, y, š, v) – i pro automatický test */
  tutRect: number[] | null = null;
  private tutBub: Phaser.GameObjects.Text | null = null;
  private tutHead: Phaser.GameObjects.Text | null = null;

  /** návod, když hráč nemá na nákup: pokyn a vysvětlení */
  private tutPoorText(manual: boolean, need: number, done = ''): [string, string] {
    const c = Math.floor(this.d.coins);
    // QA: dřív ~60 s jen čekání → rychleji přes bubliny hostů (šipka na ně)
    // Zkušebna H1: „ťukej na bubliny“ jen když nějaká bublina opravdu je (dřív text bez bubliny na obrazovce)
    const bub = !!this.views[0]?.tipTarget();
    if (!manual && done === 'tile:shop' && !bub) return [t('NAŠETŘI {n} COINS: {c} / {n}', { c, n: need }), t('Pípa točí sama. Pak v Obchodě kup vylepšení ×3.')];
    if (!manual && done === 'buy:kitchen' && !bub) return [t('NAŠETŘI {n} COINS: {c} / {n}', { c, n: need }), t('Pípa točí sama. Pak otevři kuchyni.')];
    if (!manual && done === 'tile:shop') return [t('NAŠETŘI {n} COINS: {c} / {n}', { c, n: need }), t('Ťukej na bubliny hostů. Pak v Obchodě kup vylepšení ×3.')];
    if (!manual && done === 'buy:kitchen') return [t('NAŠETŘI {n} COINS: {c} / {n}', { c, n: need }), t('Ťukej na bubliny hostů – coins přibudou rychleji. Pak otevři kuchyni.')];
    return manual
      ? [t('SBÍREJ COINS: {c} / {n}', { c, n: need }), t('ťukej na kartu Pípa, kde svítí ŤUKNI SEM, pak kup tlačítkem +1')]
      : [t('POČKEJ NA COINS: {c} / {n}', { c, n: need }), t('pípa točí sama (nebo ťukej na bubliny hostů)')];
  }
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
    } else if (done === 'tile:shop' || done === 'up') {
      // nejlevnější vylepšení ×3 v obchodě
      price = Math.min(...this.shopOffer().map((o) => o.cost), Infinity);
      if (!isFinite(price)) price = 0;
    }
    return this.d.coins < price ? price : 0;
  }

  /** návod: přepnout text/zvýraznění, když hráč nasbírá dost (nebo průběžně ukazovat coins) */
  private tutTick() {
    const i = this.d.tut ?? -1;
    if (i < 0 || this.views.length > 1) return;
    const done = PubScene.TUT[i].done;
    // co hráč udělal už dřív (třeba najal číšníky o krok napřed), se počítá – návod jde dál
    const p0 = this.d.pubs[0];
    if ((done === 'hire' && this.st(p0, 'tap').auto) || (done === 'buy:kitchen' && this.st(p0, 'kitchen').lvl > 0) || (done === 'buy:tap' && this.st(p0, 'tap').lvl > 1)) return this.tut(done);
    if (done !== 'buy:tap' && done !== 'hire' && done !== 'buy:kitchen' && done !== 'tile:shop') return;
    const poor = this.tutNeed(done) > 0;
    const c = Math.floor(this.d.coins);
    if (poor !== this.tutPoor) this.tutShow();
    else if (poor && c !== this.tutCoins) this.tutShow(true);
    this.tutCoins = c;
  }

  private drawMode() {
    const b = this.modeBtn;
    this.drawBtn(b, this.mode > 0 ? `×${this.mode}` : this.mode < 0 ? t('Další') : 'MAX', true, 'amber');
    // návrh B: tmavá pilulka se zlatým okrajem jako ostatní věci přes hospodu
    b.bg.clear().fillStyle(col('ink'), 0.92).fillRoundedRect(b.x, b.y, b.w, b.h, 16).lineStyle(3, col('gold')).strokeRoundedRect(b.x, b.y, b.w, b.h, 16);
    b.label.setColor(PAL.gold).setFontSize(36).setScale(1);
    b.label.setScale(Math.min(1, (b.w - 14) / b.label.width));
  }

  /** kolik úrovní a za kolik se koupí podle přepínače ×1/×10/×100/MAX */
  private offer(p: PubState, def: StationDef) {
    const lvl = this.st(p, def.id).lvl;
    const m = actMult(p.act) * starCost(this.d.stars, p.act, def.id);
    // režim „Další“ (-1): přesně tolik úrovní, kolik chybí do dalšího milníku
    const n = lvl === 0 ? 1 : this.mode < 0 ? Math.max(1, (nextMilestone(lvl) ?? lvl + 1) - lvl) : this.mode || Math.max(1, affordable(def, lvl, this.d.coins / m));
    return { n, price: Math.ceil(costN(def, lvl, n) * m) };
  }

  private sheetY() {
    return H - NAV_H - 4 * CARD_H - 70;
  }

  /** horní okraj výhledu hospody (pod záložkami hospod, když jich je víc) */
  private pubTop() {
    return TOP + (this.views.length > 1 ? TABH : 0);
  }

  /** pozadí pod dlaždicemi stanic */
  private tilesBg() {
    const g = this.add.graphics();
    g.fillStyle(col('ink')).fillRect(0, PUB_BOT, W, H - PUB_BOT);
    g.fillStyle(col('gold')).fillRect(0, PUB_BOT, W, 3);
  }

  /** rozložení obrazovky podle počtu hospod (návrh B: velká hospoda, pod ní stanice jako dlaždice 2×2) */
  private layout() {
    const n = this.views.length;
    if (n === 1) {
      this.views[0].frame(0, TOP, W, VIEW_H, 118);
      // schopnost manažera vlevo nahoře pod pilulkou úkolu (tam nesedí hosté) – dole by zakrývala bubliny s objednávkami
      this.skillBtns[0] = this.btn(12, TOP + 8 + this.qOff(), 60, 60, () => this.useSkill(0), 60);
      this.tilesBg();
      this.addCards(0);
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
      this.skillBtns[i] = this.btn(12, TOP + TABH + 8 + this.qOff(), 60, 60, () => this.useSkill(i), 60);
    });
    const g = this.add.graphics();
    g.fillStyle(col('ink')).fillRect(0, TOP, W, TABH);
    this.tilesBg();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => (this.swipe = p.y > TOP + TABH && p.y < PUB_BOT ? p.x : null));
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
  /** Nastavení: ťuknutí na číslo verze (7× = vývojářský režim) */
  private devTaps = 0;
  private devTapAt = 0;
  /** Nastavení: čas prvního ťuku na „Smazat hru“ (druhý do 6 s smaže) */
  wipeAsk = 0;

  /** přepne na hospodu i: její výhled, schopnost manažera a karty stanic */
  private selectPub(i: number) {
    if (this.views.length < 2) return;
    this.closeWaiter();
    this.sel = i;
    this.views.forEach((v, j) => {
      v.cam.setVisible(j === i);
      if (j === i) v.frame(0, TOP + TABH, W, VIEW_H - TABH, 124);
    });
    this.pubTabs.forEach((b, j) => {
      // ★5 Rekonstrukce: zlatý štít podniku (zlatý rám záložky a hvězda u jména)
      const gold = (this.d.reko?.star ?? 0) >= REKO_GOLD;
      this.drawBtn(b, PUB_NAMES[this.d.pubs[j].act] + (gold ? ' ★' : ''), true, j === i ? 'amber' : 'slate');
      if (gold) b.bg.lineStyle(3, col('gold')).strokeRoundedRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, 10);
      b.label.setY(b.y + 16).setFontSize(18).setScale(Math.min(1, (b.w - 10) / b.label.width));
    });
    this.skillBtns.forEach((_, j) => this.drawSkill(j));
    this.time.delayedCall(0, () => this.guideEv('pub:' + i));
    this.dropCards();
    this.addCards(i);
    this.refresh();
  }

  /** zničí dlaždice stanic (přepnutí hospody, zavřený panel) */
  private dropCards() {
    for (const c of this.cards)
      [c.box, c.name, c.lvl, c.bar, c.info, c.tapZone, c.buy.bg, c.buy.label, c.buy.zone, c.staff.bg, c.staff.label, c.staff.zone, c.tag, c.bnum, c.adG, c.adT, c.adZ, c.icon].forEach((o) => o.destroy());
    this.cards = [];
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
    this.addCards(i, 201);
    this.refresh();
  }

  private closeSheet() {
    if (this.views.length === 1 || this.sheet < 0) return;
    this.sheetObjs.forEach((o) => o.destroy());
    this.sheetObjs = [];
    this.dropCards();
    this.sheet = -1;
  }

  /** obrázek stanice na dlaždici */
  private static TILE_ICON: Record<string, string> = { tap: 'tap', kitchen: 'stove0', cellar: 'barrel', dice: 'slots', pool: 'pool' };
  /** svislé rozložení dlaždice: název, úroveň, tečky mistrovství, pruh, tlačítko */
  private static TL = { name: 7, lvl: 40, dots: 67, bar: 79, barH: 14, btn: 103, btnH: 56 };
  /** úzká karta páté stanice: název a úroveň vlevo, pruh pod nimi, tlačítka vpravo */
  private static TLN = { name: 4, lvl: 30, dots: 0, bar: 54, barH: 10, btn: 8, btnH: 56 };
  private static NBTN = 250;

  /** stanice jako dlaždice 2×2 pod hospodou (návrh B): obrázek, název, úroveň, pruh postupu, velké tlačítko +1 */
  private addCards(pubIdx: number, depth = 10) {
    this.stations().forEach((def, i) => {
      const narrow = i >= 4, L = narrow ? PubScene.TLN : PubScene.TL;
      const x = TILE_PAD + (narrow ? 0 : (i % 2) * (TILE_W + TILE_GAP)), y = PUB_BOT + 9 + Math.floor(i / 2) * (TILE_H + TILE_GAP);
      const w = narrow ? W - 2 * TILE_PAD : TILE_W, h = narrow ? NARROW_H : TILE_H;
      const box = this.add.graphics().setDepth(depth);
      box.fillStyle(col('dusk')).fillRoundedRect(x, y, w, h, 12);
      const icon = this.add.image(x + 34, y + (narrow ? h / 2 : 40), 'obj', PubScene.TILE_ICON[def.id]).setDepth(depth);
      icon.setScale(Math.min(3, 50 / icon.width, (narrow ? 50 : 62) / icon.height));
      const name = this.add.text(x + 64, y + L.name, '', txt(narrow ? 24 : 30, PAL.bone)).setDepth(depth);
      const lvl = this.add.text(x + 64, y + L.lvl, '', txt(21, PAL.fog)).setDepth(depth);
      const bar = this.add.graphics().setDepth(depth);
      const info = this.add.text(narrow ? x + 64 + (w - 64 - PubScene.NBTN - 20) / 2 : x + w / 2, y + L.bar + L.barH / 2, '', txt(18, PAL.white)).setOrigin(0.5).setDepth(depth + 1);
      const tag = this.add.text(x, y, '', txt(15, PAL.sand)).setOrigin(0, 0.5).setDepth(depth + 1).setVisible(false);
      // ťuknutím na dlaždici (nad tlačítkem) se ručně spustí cyklus (dokud stanice nemá obsluhu)
      const tapZone = this.add.zone(x, y, narrow ? w - PubScene.NBTN - 20 : w, narrow ? h : L.btn - 6).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(depth);
      tapZone.on('pointerdown', () => this.manual(pubIdx, def));
      // karta A (výběr uživatele, docs/navrhy-ui/karta-obsluha-ABC.png): bez obsluhy obsluha a +1 vedle sebe,
      // po najmutí obsluhy se +1 roztáhne přes celou šíři (pozice tlačítka +1 se nastavuje v refresh)
      const bw = narrow ? PubScene.NBTN : w - 20, bx0 = narrow ? x + w - 10 - bw : x + 10;
      const buy = this.btn(bx0, y + L.btn, bw, L.btnH, () => this.buy(pubIdx, def), depth);
      buy.denied = () => this.coinVidChip(buy, this.offer(this.d.pubs[pubIdx], def).price);
      const staff = this.btn(bx0, y + L.btn, (bw - 8) / 2, L.btnH, () => this.staffTap(pubIdx, def), depth);
      // dva řádky (obsluha + cena) hustěji, ať se vejdou do tlačítka bez zmenšení
      buy.label.setLineSpacing(-5);
      staff.label.setLineSpacing(-5);
      const bnum = this.add.text(x + 64, y + L.lvl, '', txt(21, PAL.fog)).setDepth(depth + 1);
      const adG = this.add.graphics().setDepth(depth + 2);
      const adT = this.add.text(0, y + 22, '', txt(20, PAL.white)).setOrigin(0.5).setDepth(depth + 3).setStroke(PAL.ink, 4);
      // dotykové místo ×2 ≥ 44 CSS px (odznak je menší)
      const adZ = this.add.zone(0, 0, 60, 60).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(depth + 4);
      adZ.on('pointerdown', () => void this.stationAd(pubIdx, def.id));
      this.cards.push({ tag, pub: pubIdx, def, box, name, lvl, bar, info, buy, staff, tapZone, x, y, w, h, icon, bnum, adG, adT, adZ, narrow });
    });
  }

  /** pojistka proti propadnutí dvojťuku do jiného tlačítka (viz btn) */
  private tapBlock = 0;
  private tapLast?: Btn;
  private btn(x: number, y: number, w: number, h: number, fn: () => void, depth = 10): Btn {
    const bg = this.add.graphics().setDepth(depth);
    const label = this.add.text(x + w / 2, y + h / 2, '', txt(h > 40 ? 22 : 16, PAL.white)).setOrigin(0.5).setAlign('center').setDepth(depth + 1);
    const zone = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(depth + 2);
    const b: Btn = { bg, label, zone, x, y, w, h, enabled: true, visible: true };
    const fire = (real = true) => {
      if (!b.visible) return;
      // ťuknutí těsně po jiném tlačítku (zavřené okno → tlačítko pod ním) se nepočítá; stejné tlačítko jde ťukat rychle
      const now = Date.now();
      if (real && now < this.tapBlock && this.tapLast !== b) return;
      this.tapBlock = now + 300;
      this.tapLast = b;
      sfx.init();
      if (!b.enabled) {
        b.denied?.();
        return sfx.error();
      }
      fn();
      if (label.active) this.tweens.add({ targets: label, scale: { from: 0.88, to: 1 }, duration: 120 });
    };
    // QA hospoda 66: tlačítko se spustí až po zvednutí prstu a jen když se prst nepohnul (tažení nic nekoupí)
    let start: { x: number; y: number } | null = null;
    zone.on('pointerdown', (ptr?: Phaser.Input.Pointer) => {
      if (!ptr) return fire(false); // umělé ťuknutí (testy, návod)
      start = { x: ptr.x, y: ptr.y };
    });
    zone.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      const s0 = start;
      start = null;
      if (s0 && Math.hypot(ptr.x - s0.x, ptr.y - s0.y) < 14) fire();
    });
    zone.on('pointerout', () => (start = null));
    this.touchZones.push(zone);
    return b;
  }

  // ---------- neviditelně větší dotyková místa (src/ui/touch.ts) ----------
  /** zóny, které smí mít větší neviditelné dotykové místo (tlačítka btn(), krígl a diamanty v horní liště) */
  touchZones: Phaser.GameObjects.Zone[] = [];
  /** ladění: ?touch=0 = původní (malá) dotyková místa */
  static TOUCH_OFF = new URLSearchParams(location.search).get('touch') === '0';
  /** každý snímek: zóně (viditelný obdélník = x, y, šířka, výška) nastaví větší hitArea; sousedy nepřekryje */
  private fitTouch() {
    if (PubScene.TOUCH_OFF) return;
    this.touchZones = this.touchZones.filter((z) => z.active && z.scene);
    const cam = this.cameras.main, im = this.input.manager as unknown as { inputCandidate: (o: Phaser.GameObjects.GameObject, c: Phaser.Cameras.Scene2D.Camera) => boolean };
    const list = ((this.input as unknown as { _list: Phaser.GameObjects.GameObject[] })._list ?? []).filter((o) => im.inputCandidate(o, cam));
    const rect = (o: Phaser.GameObjects.GameObject): R | null => {
      if (o instanceof Phaser.GameObjects.Zone) return { x: o.x - o.displayOriginX, y: o.y - o.displayOriginY, w: o.width, h: o.height };
      const g = o as unknown as { getBounds?: () => Phaser.Geom.Rectangle };
      if (!g.getBounds) return null;
      const r = g.getBounds();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    };
    const live = this.touchZones.filter((z) => z.input?.enabled && list.includes(z) && z.width > 0 && z.height > 0);
    const others = list.filter((o) => !live.includes(o as Phaser.GameObjects.Zone)).map((o) => ({ o, r: rect(o), d: (o as unknown as { depth: number }).depth ?? 0 })).filter((x) => x.r) as { o: Phaser.GameObjects.GameObject; r: R; d: number }[];
    const BIG = W * H * 0.2;
    const items = live.map((z) => {
      const r = rect(z)!, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      // pozadí okna pod tlačítkem (velká ťukací plocha): co leží pod ním, je zakryté a nepočítá se
      const floor = Math.max(-Infinity, ...others.filter((x) => x.r.w * x.r.h >= BIG && x.d <= z.depth && cx >= x.r.x && cx <= x.r.x + x.r.w && cy >= x.r.y && cy <= x.r.y + x.r.h).map((x) => x.d));
      const obst = others.filter((x) => x.d >= floor && x.r.w * x.r.h < BIG).map((x) => x.r);
      // nad spodní lištou zůstat nad ní
      const bottom = r.y + r.h <= MB ? MB : H;
      return { r, obst, bound: { x: 0, y: 0, w: W, h: bottom }, depth: z.depth, floor };
    });
    const pads = fitPads(items);
    live.forEach((z, i) => {
      const [l, t, r, b] = pads[i];
      const ha = z.input!.hitArea as Phaser.Geom.Rectangle;
      const w = z.width + l + r, h = z.height + t + b;
      if (Math.abs(ha.x + l) + Math.abs(ha.y + t) + Math.abs(ha.width - w) + Math.abs(ha.height - h) > 0.01) ha.setTo(-l, -t, w, h);
    });
  }

  private drawBtn(b: Btn, text: string, enabled: boolean, c: keyof typeof PAL, visible = true) {
    b.c = c;
    b.enabled = enabled;
    b.visible = visible;
    b.bg.clear();
    b.label.setVisible(visible);
    // skryté tlačítko nesmí chytat dotyky (dřív neviditelné „UKAŽ“ skryté lišty úkolu blokovalo truhlu)
    b.zone.setVisible(visible);
    if (!visible) return;
    b.bg.fillStyle(col('ink')).fillRoundedRect(b.x, b.y + 4, b.w, b.h, 9);
    b.bg.fillStyle(col(enabled ? c : 'slate')).fillRoundedRect(b.x, b.y, b.w, b.h, 9);
    b.bg.fillStyle(0xffffff, enabled ? 0.15 : 0.06).fillRoundedRect(b.x + 3, b.y + 3, b.w - 6, b.h / 3, 6);
    b.label.setText(text).setColor(enabled ? PAL.white : PAL.fog);
    // popisek se vždy vejde do tlačítka (dlouhé překlady přetékaly do vedlejšího tlačítka)
    const lw = b.label.width, lh = b.label.height;
    if (lw && lh) b.label.setScale(Math.min(1, (b.w - 10) / lw, (b.h - 4) / lh));
  }

  /** stanice (s pátou po ★2 Rekonstrukci) */
  private stations() {
    return (this.d.reko?.star ?? 0) >= 2 ? STATIONS5 : STATIONS;
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
    // kombo: rychlé ťukání za sebou – jen stoupající zvuk (nápisy „KOMBO ×n“ zrušeny: nic nedávaly a zaplňovaly kartu)
    if (s.lvl > 0 && !s.auto) {
      this.comboN = this.comboT > 0 ? this.comboN + 1 : 1;
      this.comboT = 0.9;
      if (this.comboN >= 3) sfx.combo(this.comboN);
    }
  }

  /** návod šetří na kuchyni nebo ×3: ostatní nákupy úrovní jsou zatím šedé (Zkušebna H1: zelené +1 lákalo ke špatnému kroku) */
  private tutHold(def: StationDef) {
    const i = this.d.tut ?? -1;
    if (i < 0) return false;
    const done = PubScene.TUT[i].done;
    // bez číšníků návod radí ťukat a kupovat +1 u Pípy – pak nic nezamykat
    if (!this.d.pubs[0]?.st.tap?.auto) return false;
    return (done === 'buy:kitchen' && def.id !== 'kitchen') || done === 'tile:shop' || done === 'up';
  }

  private buy(i: number, def: StationDef) {
    const p = this.d.pubs[i];
    const { n, price } = this.offer(p, def);
    if (this.d.coins < price || this.tutHold(def)) return sfx.error();
    this.d.coins -= price;
    const s = this.st(p, def.id);
    const before = nextMilestone(s.lvl), styleWas = [...pubStyles(p)];
    const opened = s.lvl === 0;
    const r0 = this.rate(p);
    s.lvl += n;
    this.d.stats.levels += n;
    this.xp(Math.min(n, 20));
    // Zkušebna (S5/T2): kuchyně otevřená v návodu má kuchaře hned (dřív nákup za 60 výdělek nezvedl a hráč šetřil znovu)
    if (opened && i === 0 && def.id === 'kitchen' && (this.d.tut ?? -1) >= 0) {
      s.auto = true;
      if (s.prog === 0) s.prog = 0.0001;
      this.time.delayedCall(500, () => this.views[i] && this.banner(this.views[i].cam, STAFF_LABEL.kitchen[2]));
    }
    this.task('levels', n);
    this.tut('buy:' + def.id);
    sfx.buy();
    const card = this.cards.find((k) => k.pub === i && k.def.id === def.id);
    if (card) {
      flashRect(this, card.x, card.y, card.w, card.h);
      popText(this, card.buy.x + card.buy.w / 2, card.buy.y - 6, t('+{n} úr.', { n }), PAL.mint);
      confetti(this, card.buy.x + card.buy.w / 2, card.buy.y + 10, 10, 459, 0.45);
      // Zkušebna T2: nákup je cítit – skutečný přírůstek výdělku vyletí z pruhu a pruh na 1 s zezelená
      const gain = this.rate(p) - r0;
      if (gain > 0) {
        const gt = t('+{v}/s', { v: big(gain) }), cx = card.x + card.w / 2, cy = card.y + 10;
        this.time.delayedCall(220, () => popText(this, cx, cy, gt, PAL.mint, 30));
        card.hiUntil = this.time.now + 1500;
        card.hiText = t('výdělek {a} → {b}/s', { a: big(r0), b: big(this.rate(p)) });
        this.time.delayedCall(1550, () => this.refresh());
      }
    }
    if (before && s.lvl >= before) this.milestone(i, def);
    const styleNow = pubStyles(p).find((id) => !styleWas.includes(id));
    if (styleNow) {
      this.time.delayedCall(1200, () => this.views[i] && this.banner(this.views[i].cam, t('{p} je teď {s}: {k}', { p: PUB_NAMES[p.act], s: STYLES[styleNow].name, k: STYLES[styleNow].perk })));
      this.applyKup();
    }
    this.views[i].refresh();
    this.refresh();
  }

  /** čím jde číšníkům pomoct, když nestíhají: najmout dalšího, nebo utratit volný bod (jinak null) */
  private waiterFix(pi: number): { label: string; ok: boolean } | null {
    if (pi !== this.wPub()) return null;
    const p = this.d.pubs[pi], ws = p.w ?? [];
    if (!ws.length) return null;
    if (ws.length < WAITER_MAX) {
      const price = this.wHirePrice(p);
      // Zkušebna H2: tlačítko říká, co přidá (+1 číšník)
      return { label: `${t('Číšník')} +1\n${big(price)}`, ok: this.d.coins >= price };
    }
    return ws.some((w) => freePoints(w) > 0) ? { label: `${t('Číšníci')}\n${t('vylepšit')}`, ok: true } : null;
  }

  /** tlačítko obsluhy na kartě: najmout obsluhu stanice; když už je a číšníci nestíhají, pomoct číšníkům */
  private staffTap(i: number, def: StationDef) {
    const p = this.d.pubs[i];
    if (!this.st(p, def.id).auto) return this.hire(i, def);
    if (i !== this.wPub()) return;
    const ws = p.w ?? [];
    if (ws.length < WAITER_MAX) return this.waiterChip(ws.length);
    const k = ws.findIndex((w) => freePoints(w) > 0);
    if (k >= 0) this.openWaiter(i, k);
    else sfx.error();
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
      popText(this, card.staff.x + card.staff.w / 2, card.staff.y - 20, STAFF_LABEL[def.id][2], PAL.bone, 26);
    }
    s.auto = true;
    if (s.prog === 0) s.prog = 0.0001;
    // na pípu se najímají číšníci (Franta a Jarka) – pípa točí sama a oni roznášejí pivo ke stolům
    if (def.id === 'tap' && !p.w?.length) {
      p.w = START_CREW();
      this.time.delayedCall(900, () => this.views[i] && this.banner(this.views[i].cam, t('{a} a {b} nastoupili – roznášejí pivo ke stolům', { a: WAITERS[0].name, b: WAITERS[1].name })));
    }
    this.tut('hire');
    this.views[i].refresh();
    this.refresh();
  }

  // ---------- mistrovství stanic: roste samo (čas s obsluhou, všechny hospody, i offline) ----------
  private mastAdd(secs: number) {
    if (secs <= 0) return;
    const m = (this.d.mast ??= {});
    for (const def of STATIONS) {
      const n = this.d.pubs.filter((p) => p.st[def.id]?.auto && (p.st[def.id]?.lvl ?? 0) > 0).length;
      if (!n) continue;
      const before = mastStage(m[def.id]);
      m[def.id] = (m[def.id] ?? 0) + secs * n;
      const after = mastStage(m[def.id]);
      // nová hodnost (každých 10 stupňů) – jen jeden nápis; stupně přibývají potichu
      if (after > before && Math.floor((after - 1) / 10) > Math.floor((before - 1) / 10) && before > 0 && this.views[0])
        this.banner(this.views[0].cam, t('{s}: {r}!', { s: STATION_NAMES[1][def.id], r: RANKS[mastRank(after).rank] }), true);
    }
  }

  // ---------- hvězdné uzly stromu, které běží samy ----------
  starT = { tip: 60, roll: 600 };
  /** Půlnoční hodina (Pán noci) do kdy */
  midU = 0;
  private starTick(dt: number) {
    if ((this.d.tut ?? -1) >= 0) return;
    if (this.star('autotip') && (this.starT.tip -= dt) <= 0) {
      this.starT.tip = 60;
      const v = this.views[this.views.length > 1 ? this.sel : 0];
      if (v?.autoTip()) this.tipReward(v);
    }
    if (this.star('autoroll') && (this.starT.roll -= dt) <= 0) {
      this.starT.roll = 600;
      const rolls = this.d.ossRolls ?? 0, cost = rollCost(rolls);
      const free = OSSUARY.filter((o) => o.cap === undefined || ((this.d.oss?.[o.stat] ?? 0) + 1) * o.per <= o.cap + 1e-9);
      if ((this.d.bones ?? 0) >= cost && free.length) {
        this.d.bones! -= cost;
        const o = Phaser.Utils.Array.GetRandom(free);
        (this.d.oss ??= {})[o.stat] = (this.d.oss[o.stat] ?? 0) + 1;
        this.d.ossRolls = rolls + 1;
        this.tsCache = undefined;
        this.applyKup();
      }
    }
  }

  /** výdělek stanice za cyklus (úroveň, milníky, hospoda, vylepšení) */
  private pay(p: PubState, def: StationDef) {
    const lvl = p.st[def.id]?.lvl ?? 0;
    return payout(def, Math.max(1, lvl)) * actMult(p.act) * upMult(this.d.up, p.act, def.id) * (this.boosted(p) ? BOOST_MULT : 1) * (1 + KRIGL_BONUS * this.kAll()) * (this.evBoostUntil > Date.now() ? 2 : 1) * kCthulhu(this.kl('cthulhu'), this.d.cthOld ?? 0) * (season ? 1 + SEASON_BONUS : 1) * (1 + (this.has('portrait') ? 0.1 : 0) + (this.has('fireplace') ? 0.25 : 0)) * (this.ev ? this.ev.brawlMult(this.d.pubs.indexOf(p)) : 1) * (1 + (this.d.brew ? brewBonus(this.d.brew) : 0)) * (1 + this.ts().income) * (1 + sealBonus(this.d.temple?.boss ?? 0, this.d.temple?.old)) * paidMult(this.d.adv, this.d.pass) * cupMult(this.d.league) * styleSupplyMult(this.d.pubs, p, def.id) * starMult(this.d.stars, p.act) * ((p.adx?.[def.id] ?? 0) > Date.now() ? 2 : 1) * ((this.d.rushU ?? 0) > Date.now() ? this.d.rushM ?? 5 : 1);
  }

  // ---------- obchod s krígly ----------
  /** úroveň položky z obchodu s krígly */
  private kl(id: KriglItem['id']) {
    return this.d.kup?.[id] ?? 0;
  }

  private cyc(def: StationDef) {
    return def.cycle * kSpeed(this.kl('speed')) * (this.has('aquarium') ? 0.9 : 1) / (1 + this.ts().cycle);
  }

  /** stupeň mistrovství stanice (0–50) */
  private mast(id: string) {
    return mastStage(this.d.mast?.[id]);
  }

  /** hvězdný uzel stromu */
  /** jde uzel koupit (test) */
  treeOk(id: string, own: string[]) {
    return treeCan(TREE_BY_ID[id], own);
  }

  private star(s: StarId) {
    return hasStar(this.d.skills, s);
  }

  private offCap() {
    // delší offline za diamanty: +2 h za každý stupeň (nad běžný strop)
    const gemH = 2 * ['off1', 'off2', 'off3'].filter((id) => this.owns(id)).length;
    return gemH * 3600 + Math.min(OFFLINE_MAX_H * 3600, OFFLINE_CAP + (kOffline(this.kl('offline')) + (this.has('cuckoo') ? 4 : 0)) * 3600 + this.ts().offline * 3600) + (hasStyle(this.d.pubs, 'cellar') ? 3600 : 0) + ((this.d.reko?.star ?? 0) >= 4 ? REKO_OFFLINE_H * 3600 : 0) + (hasRelic(this.d.relics, 'icePipe') ? 3600 : 0);
  }

  /** úroveň vylepšení za kosti */
  private bl(id: string) {
    return this.d.bup?.[id] ?? 0;
  }

  /** násobek kostí ze statů (talismany, Kostnice…) */
  private boneMult(p?: PubState) {
    // schopnost manažera (šťastná hodina ×3) platí i na kosti
    return (1 + this.ts().bones) * (this.d.fx?.nightx2 && this.night ? 2 : 1) * (p && this.boosted(p) ? BOOST_MULT : 1) * (this.night && this.midU > Date.now() ? 3 : 1);
  }

  /** odměna za spropitné (ťuknutí nebo sběrač): přes den coins, v noci kost */
  private tipReward(v: PubView, tap = false) {
    // věrnost hostů (varianta A): obsloužení druhu; nová úroveň = 1 bod do stromu hostinského
    const lk = v.lastKey, loy = (this.d.loy ??= {});
    const lb = loyLvl(loy[lk]);
    if (lk) loy[lk] = (loy[lk] ?? 0) + 1;
    const lup = !!lk && loyLvl(loy[lk]) > lb;
    // zlatý host: občas dá spropitné ×10
    // + schopnost „Zlatá ruka“: ťuknutí prstem má 5 % šanci na ×10
    const gold = !this.night && (Math.random() < Math.min(0.1, this.ts().golden) || (tap && this.star('goldhand') && Math.random() < 0.05));
    const tip = (gold ? 10 : 1) * Math.max(1, Math.round((this.rate(v.pub) * 2 + this.pay(v.pub, STATIONS[0])) * (this.has('boar') ? 3 : 1) * (isStyle(v.pub, 'tap') ? 2 : 1) * (1 + this.ts().tips + guestTips(this.d.gxp ?? 0)) * this.happyMult()));
    const bone = this.boneMult(v.pub) * (1 + this.ts().nighttips) * (tap && this.night && this.star('nighthunt') ? 2 : 1);
    if (this.night) (this.d.bones = (this.d.bones ?? 0) + bone), this.task('night', 1);
    else this.gain(tip);
    // hvězda „Kostěné spropitné“: i ve dne kousek kosti (1 kost za 5 bublin)
    if (!this.night && this.star('daybones')) this.d.bones = (this.d.bones ?? 0) + bone * 0.2;
    this.d.stats.tips++;
    this.week('tips');
    this.xp(1);
    this.task('tips', 1);
    v.tipPop(lup ? t('{n}: věrnost {l}! +1 bod', { n: this.guestName(lk), l: loyLvl(loy[lk]) }) : (gold ? t('ZLATÝ HOST! ') : '') + '+' + big(this.night ? bone : tip));
  }

  // ---------- sběrač bublin (číšník): každá hospoda vlastní, kupuje se a vylepšuje za kosti ----------
  /** sběrač v hospodě i: úroveň rychlosti a množství (null = nekoupený) */
  private coll(i: number) {
    return this.d.coll?.[this.d.pubs[i].act];
  }

  /** cena najmutí sběrače (src/core/collector.ts) */
  private collBase(i: number) {
    return collHire(this.d.pubs[i].act - 1);
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
      const cs = collSpdCost(p.act - 1, c.spd), ca = collAmtCost(p.act - 1, c.amt), maxA = c.amt >= COLL_AMT_MAX;
      const maxS = this.collSecs(c.spd) <= 1.5;
      const b1 = this.btn(W - 232, y + 24, 102, 62, refresh(cs, () => c.spd++), D + 2);
      this.drawBtn(b1, maxS ? t('rychlost\nmax') : t('rychleji\n{n}', { n: big(cs) }), !maxS && bones >= cs, 'blue');
      const b2 = this.btn(W - 122, y + 24, 102, 62, refresh(ca, () => !maxA && c.amt++), D + 2);
      this.drawBtn(b2, maxA ? t('bubliny\nmax') : t('+1 bublina\n{n}', { n: big(ca) }), !maxA && bones >= ca, 'plum');
      [b1, b2].forEach((b) => b.label.setFontSize(16).setScale(Math.min(1, 94 / b.label.width)));
      this.shopObjs.push(b1.bg, b1.label, b1.zone, b2.bg, b2.label, b2.zone);
    });
  }

  // ---------- den a noc ----------
  /** délka happy hour roste s pivovarem stejně jako cena piva (aby zůstala vyrovnaná s prodejem) */
  private happyMin() {
    return Math.round(10 * (1 + 0.2 * (this.brew().lvl - 1)));
  }

  /** dřív Happy hour ×2 – teď Pivní horečka (víc hostů v PubView.rushUntil), výdělek se nenásobí */
  private happyMult() {
    return 1;
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
        this.applyKup();
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
    add(this.add.text(W / 2, y + RH + 14, t('Kosti sbíráš v noci: stanice a ťuknutí na bubliny hostů.\nUtratíš je i v Kostnici a za talismany.'), txt(16, PAL.fog)).setOrigin(0.5, 0).setAlign('center').setDepth(D + 2));
  }

  /** kolik kostí za sekundu dají v noci stanice (jen s kostlivcem = offline) */
  private bonesPerSec(autoOnly = false) {
    let r = 0;
    for (const p of this.d.pubs)
      for (const def of this.stations()) {
        const s = p.st[def.id];
        if (!s || s.lvl === 0 || (autoOnly && !s.auto)) continue;
        r += (bonesFor(s.lvl) / this.cyc(def)) * (!autoOnly && this.boosted(p) ? BOOST_MULT : 1);
      }
    return r * this.boneMult();
  }

  ossLast?: string;
  /** Kostnice: ukázat všechny vlastnosti (jinak jen zesílené) */
  ossAll = false;
  ossBusy = false;

  /** Kostnice: zaplatíš kostňákovi, ten hodí kostkou a náhodný stat se trochu zvedne */
  talisBtn?: Btn;
  private bonesTab(y0: number, D: number) {
    const bones = this.d.bones ?? 0;
    const rolls = this.d.ossRolls ?? 0;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => (this.shopObjs.push(o), o);
    const g = add(this.add.graphics().setDepth(D + 1));
    g.fillStyle(col('navy'), 0.8).fillRoundedRect(10, y0, W - 20, 150, 12);
    add(this.add.sprite(70, y0 + 132, 'skeleton', 12).setOrigin(0.5, 1).setScale(5).setDepth(D + 2));
    add(this.add.text(130, y0 + 10, t('Kostňák'), txt(26, PAL.ice)).setDepth(D + 2));
    // méně textu (přání uživatele, hospoda 72): citát i počet kostí pryč (kosti jsou v horní liště), tlačítka větší
    // Den a noc (dřív samostatná dlaždice v Menu, teď tu)
    const dnb = this.btn(130, y0 + 82, 136, 60, () => this.openShop('daynight', false), D + 3);
    this.drawBtn(dnb, t('Den a noc'), !this.tileLock('daynight'), 'blue');
    dnb.label.setScale(Math.min(1, 126 / dnb.label.width));
    // Talismany (dřív samostatná dlaždice v Menu – méně dlaždic, přání uživatele)
    const tlk = this.tileLock('talis');
    const tb = this.btn(272, y0 + 82, 136, 60, () => {
      if (tlk) return this.banner(this.views[0].cam, t('{s}: otevře se {c}', { s: t('Talismany'), c: tlk }));
      this.qVisit('talis');
      this.guideEv('tile:talis');
      this.openShop('talis', false);
    }, D + 3);
    this.talisBtn = tb;
    this.drawBtn(tb, t('Talismany'), !tlk, 'plum');
    tb.label.setScale(Math.min(1, 126 / tb.label.width));
    this.shopObjs.push(dnb.bg, dnb.label, dnb.zone, tb.bg, tb.label, tb.zone);
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
    // schopnost „Kostka zdarma“: jeden hod denně zdarma
    const free1 = this.star('freeroll') && this.d.frDay !== dayKey();
    const roll = (n: number) => {
      const fr = n === 1 && free1;
      const cost = fr ? 0 : Array.from({ length: n }, (_, i) => rollCost(rolls + i)).reduce((a, b) => a + b, 0);
      if (this.ossBusy || (this.d.bones ?? 0) < cost) return sfx.error();
      if (fr) this.d.frDay = dayKey();
      this.d.bones = (this.d.bones ?? 0) - cost;
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
    this.drawBtn(b1, free1 ? t('Hodit kostkou\nzdarma') : t('Hodit kostkou\n{n} kostí', { n: big(c1) }), free1 || bones >= c1, 'blue');
    const b10 = this.btn(275, y0 + 162, 255, 64, () => roll(10), D + 2);
    this.drawBtn(b10, t('10 hodů\n{n} kostí', { n: big(c10) }), bones >= c10, 'plum');
    this.shopObjs.push(b1.bg, b1.label, b1.zone, b10.bg, b10.label, b10.zone);
    // přehled statů z Kostnice
    const head = add(this.add.text(20, y0 + 250, t('Zesíleno kostňákem ({n} hodů):', { n: rolls }), txt(20, PAL.gold)).setDepth(D + 2));
    head.setScale(Math.min(1, 330 / head.width));
    // jen to, co už kostka zlepšila (dřív všech 29 řádků, většina „+0 %“ – přání uživatele); zbytek pod tlačítkem Vše
    const allB = this.btn(W - 170, y0 + 236, 160, 56, () => {
      this.ossAll = !this.ossAll;
      this.openShop('shop', false);
    }, D + 2);
    this.drawBtn(allB, this.ossAll ? t('Jen zesílené') : t('Vše ({n})', { n: OSSUARY.length }), true, 'plum');
    allB.label.setScale(Math.min(1, 148 / allB.label.width));
    this.shopObjs.push(allB.bg, allB.label, allB.zone);
    const list = OSSUARY.filter((o) => this.ossAll || (this.d.oss?.[o.stat] ?? 0) > 0);
    const top = y0 + 304;
    if (!list.length) add(this.add.text(W / 2, top + 30, t('Zatím nic – hoď kostkou.'), txt(24, PAL.fog)).setOrigin(0.5, 0).setDepth(D + 2));
    // výška řádku tak, aby se celý přehled vešel nad spodní lištu (hlášení: poslední řádek nebyl vidět)
    const rh = Math.min(36, (MB - 8 - top) / Math.max(1, Math.ceil(list.length / 2)));
    list.forEach((o, i) => {
      const lvl = this.d.oss?.[o.stat] ?? 0;
      const capped = o.cap !== undefined && (lvl + 1) * o.per > o.cap + 1e-9;
      const tx = add(this.add.text(20 + (i % 2) * 262, top + Math.floor(i / 2) * rh, STAT_NAMES[o.stat](lvl * o.per) + (capped ? ' (max)' : ''), txt(24, o.stat === this.ossLast ? PAL.gold : lvl ? PAL.mint : PAL.fog)).setDepth(D + 2));
      tx.setScale(Math.min(1, 250 / tx.width, rh / tx.height));
    });
  }

  /** koupená výzdoba */
  private has(id: string) {
    return !!this.d.decor?.includes(id);
  }

  /** krígly za hygienu teď (se Zlatou modlou +25 %) */
  private kriglyNow(run = this.d.run) {
    return Math.floor(kriglyFor(run, this.d.pubs.length) * (this.has('idol') ? 1.25 : 1) * (1 + this.ts().krigly + kKrigly(this.kl('krigly'))));
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
      this.add.text(20, y0 - 2, t('Máš {k} krígel (+{b} % výdělek)', { k: big(this.d.krigle), b: big(Math.round(this.kAll() * KRIGL_BONUS * 100)) }), txt(22, PAL.gold)).setDepth(D + 1),
      this.add.text(20, y0 + 24, t('Bonus dávají i utracené krígly.'), txt(16, PAL.fog)).setDepth(D + 1),
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
        this.d.kSpent = (this.d.kSpent ?? 0) + price;
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
  private nightTuned = false;
  private applyKup() {
    this.ev.freq = kEvents(this.kl('events')) / (1 + this.ts().evfreq) / (hasStyle(this.d.pubs, 'dice') ? 1.25 : 1) / (hasRelic(this.d.relics, 'doorBell') ? 1.1 : 1);
    brewCfg.speed = 1 + this.ts().brew;
    brewCfg.tank = Math.floor(this.ts().tank);
    brewCfg.tankMul = this.star('bigtank') ? 2 : 1;
    nightCfg.shift = this.d.dn?.shift ?? 0;
    // první nastavení (start scény) jen převezme hodnoty; každá další změna délky zachová fázi dne/noci
    if (!this.nightTuned) (nightCfg.mult = 1 + this.ts().night), (nightCfg.lvl = this.d.dn?.lvl ?? 0), (this.nightTuned = true);
    else {
      const sh = retune(1 + this.ts().night, this.d.dn?.lvl ?? 0);
      if (this.d.dn) this.d.dn.shift = sh;
    }
    PubView.extraGuests = Math.floor(this.ts().guests);
    PubView.rushUntil = this.d.fx?.happy ?? 0;
    vipCfg.every = VIP_EVERY / (this.star('vip2') ? 2 : 1);
  }

  /** boost = podíl výdělku v Posile na směnu (offline jen překryv s ní); jinak podle toho, jestli běží teď */
  private gain(n: number, boost?: number) {
    this.d.coins += n;
    this.d.earned += n;
    this.d.run += n;
    const L = this.d.league;
    if (L) L.me += n * (1 + (boost ?? (fxOn(L.boostFrom, LG_BOOST.ms) ? 1 : 0)));
    this.task('earn', n);
  }

  private rate(p: PubState) {
    let r = 0;
    for (const def of this.stations()) {
      const s = p.st[def.id];
      if (!s?.auto) continue;
      // pípa: vydělá jen to, co číšníci stihnou roznést (+ jejich spropitné)
      // pípa a kuchyně: vydělá jen to, co číšníci stihnou roznést (+ jejich spropitné)
      if ((def.id === 'tap' && p.w?.length) || (def.id === 'kitchen' && this.served(p))) {
        const c = crew(p.w!);
        r += (this.pay(p, def) / this.cyc(def)) * Math.min(1, (c.rate * (this.star('tray') ? 1.25 : 1)) / this.demand(p)) * (1 + c.tip);
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

  /** kulatá tlačítka číšníků vlevo dole v hospodě (návrh B): obličej, jméno pod kruhem, odznak úrovně */
  private addWaiterChips() {
    for (let k = 0; k < WAITER_MAX; k++) {
      const { x, y } = chipXY(k);
      const bg = this.add.graphics().setDepth(50);
      const face = this.add.image(x, y + 4, WAITERS[k].key + (livery() ? '_lux' : ''), 0).setScale(2.3).setDepth(51);
      const name = this.add.text(x, y + CHIP_R + 12, '', txt(17, PAL.bone)).setOrigin(0.5).setDepth(52);
      const lvl = this.add.text(x + 24, y - 24, '', txt(17, PAL.ink)).setOrigin(0.5).setDepth(53);
      const zone = this.add.zone(x - CHIP_R - 4, y - CHIP_R - 4, CHIP_R * 2 + 8, CHIP_R * 2 + 26).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(54);
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
    this.wChips.forEach((c, k) => {
      const { x, y } = chipXY(k), R = CHIP_R;
      const has = k < ws.length, next = k === ws.length;
      // Zkušebna U2: v prvním kole kolečko „najmi“ až když na číšníka je (jinak ho nabízí tlačítko na kartě)
      const show = !hidden && (has || (next && (this.d.stats.prestiges > 0 || this.d.coins >= price)));
      c.bg.clear().setVisible(show);
      c.zone.setVisible(show);
      if (show) c.zone.setInteractive();
      else c.zone.disableInteractive();
      c.face.setVisible(show && has);
      c.lvl.setVisible(show && has);
      c.name.setVisible(show && (!has || UI_LEAN < 1));
      if (!show) return;
      // kulaté ikony (návrh B: větší, jméno pod kruhem)
      c.bg.fillStyle(col('ink'), 0.8).fillCircle(x, y, R);
      c.bg.lineStyle(3, col(this.wSel === k ? 'gold' : has ? 'mauve' : 'slate')).strokeCircle(x, y, R);
      if (has) {
        c.bg.fillStyle(col('ink')).fillCircle(x + 24, y - 24, 13).fillStyle(col('gold')).fillCircle(x + 24, y - 24, 11);
        // volný bod na vylepšení = zelená tečka
        if (freePoints(ws[k])) c.bg.fillStyle(col('ink')).fillCircle(x + 31, y + 4, 9).fillStyle(col('mint')).fillCircle(x + 31, y + 4, 7);
        c.lvl.setText(String(waiterLvl(ws[k]))).setPosition(x + 24, y - 24);
        c.name.setText(WAITERS[k].name).setColor(PAL.bone).setFontSize(17).setPosition(x, y + R + 11).setScale(1);
      } else {
        // posudek nováčka: „+ 400“ bez popisu → „najmi“ nad cenou
        c.name.setText(`${t('najmi')}\n${big(price)}`).setAlign('center').setColor(this.d.coins >= price ? PAL.gold : PAL.fog).setFontSize(16).setPosition(x, y).setScale(1);
        c.name.setScale(Math.min(1, (R * 2 - 6) / c.name.width));
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
    const { x, y: cy } = chipXY(k), y = cy - 30;
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
    const y0 = PUB_BOT + 4;
    const objs = this.wPanel;
    // panel končí nad spodní lištou – 3 řádky se vejdou bez rolování
    const yb = H - NAV_H;
    objs.push(this.add.zone(0, y0, W, yb - y0).setOrigin(0).setInteractive().setDepth(D));
    const g = this.add.graphics().setDepth(D);
    g.fillStyle(col('dusk')).fillRoundedRect(4, y0, W - 8, yb - y0 - 4, 14);
    g.lineStyle(3, col('gold')).strokeRoundedRect(4, y0, W - 8, yb - y0 - 4, 14);
    objs.push(g);
    objs.push(this.add.image(42, y0 + 44, WAITERS[k].key + (livery() ? '_lux' : ''), 0).setScale(2.5).setDepth(D + 1));
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
      const rh = Math.min(110, Math.floor((yb - y0 - 100) / 3));
      const y = y0 + 94 + j * rh;
      const lvl = w[row.k], max = lvl >= W_UP_MAX[row.k];
      const box = this.add.graphics().setDepth(D + 1);
      box.fillStyle(col('ink'), 0.6).fillRoundedRect(16, y, W - 32, rh - 8, 10);
      objs.push(box);
      objs.push(this.add.text(32, y + 8, `${wUpName(row.k)} ${lvl}/${W_UP_MAX[row.k]}`, txt(24, PAL.bone)).setDepth(D + 1));
      objs.push(this.add.text(32, y + rh - 38, max ? row.now : `${row.now} → ${row.next}`, txt(18, PAL.fog)).setDepth(D + 1));
      const b = this.btn(W - 190, y + (rh - 8 - 56) / 2, 160, 56, () => {
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
      if (this.night) return;
      // jídlo z kuchyně: vezme to, čeho čeká (poměrně) víc – pivo na baru, nebo talíře u kuchyně
      const dish = (p.dish ??= { n: 0, v: 0 });
      if (dish.n >= 1 && (bar.n < 1 || dish.n / FOOD_CAP > bar.n / BAR_CAP)) {
        const n = Math.min(tray(w), Math.floor(dish.n));
        const v = (dish.v * n) / dish.n;
        dish.n -= n;
        dish.v -= v;
        if (dish.n < 1e-9) dish.v = 0;
        const dur = tripTime(w);
        run[k] = { t: dur, dur, v, paid: false };
        this.views[i].waiterTrip(k, n, dur, true);
        return;
      }
      if (bar.n < 1) return;
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
    this.views[i].setDishes(Math.floor(p.dish?.n ?? 0));
  }

  /** nosí v hospodě číšníci? (najatí na pípě) */
  private served(p: PubState) {
    return !!p.w?.length && !!p.st.tap?.auto;
  }

  /** kolik věcí za sekundu se má roznést (piva + talíře) */
  private demand(p: PubState) {
    let d = 0;
    if (p.st.tap?.auto) d += this.beers(p) / this.cyc(STATIONS[0]);
    if (p.st.kitchen?.auto) d += 1 / this.cyc(STATIONS[1]);
    return d;
  }

  update(_t: number, dms: number) {
    if (this.brewTutAt && Date.now() > this.brewTutAt) this.brewTutNext();
    if (this.ntfQ.length) this.ntfNext();
    const dt = Math.min(dms / 1000, 0.25);
    this.rekoTick();
    this.comboT -= dt;
    this.punchT -= dt;
    this.tutFollow?.();
    this.guideFollow?.();
    this.guideSkipDone();
    const tipStep = PubScene.TUT[this.d.tut ?? -1]?.done === 'tip' || (this.guideCur && this.guideSteps(this.guideCur.id)[this.guideCur.i]?.done === 'tip');
    this.views.forEach((v) => (v.hold = !!tipStep));
    this.qTick();
    this.goalTick();
    this.gemTick();
    this.fitTouch();
    this.tutTick();
    this.vipTick(dt);
    // Automatická šťastná hodina (za diamanty): manažeři pouští schopnost sami
    if (this.owns('autohh')) {
      const now = Date.now();
      this.d.pubs.forEach((p, i) => {
        if (p.mgr && !this.boosted(p) && (p.boostReady ?? 0) <= now) this.useSkill(i, true);
      });
    }
    this.mastAdd(dt);
    this.starTick(dt);
    this.coinT -= dt;
    this.d.pubs.forEach((p, i) => {
      let open = 0;
      for (const def of this.stations()) {
        const s = p.st[def.id];
        if (!s || s.lvl === 0) continue;
        open++;
        if (s.prog === 0) continue;
        s.prog += dt / this.cyc(def);
        // pípa s číšníky: pivo jde na bar; když je bar plný, pípa počká
        const toBar = def.id === 'tap' && s.auto && !this.night && !!p.w?.length;
        // kuchyně s kuchařem: talíř čeká u kuchyně na číšníka, coins až po donesení
        const toPass = def.id === 'kitchen' && s.auto && !this.night && this.served(p);
        const bar = (p.bar ??= { n: 0, v: 0 });
        const dish = (p.dish ??= { n: 0, v: 0 });
        if (toBar && s.prog >= 1 && bar.n + this.beers(p) > BAR_CAP) s.prog = 1;
        else if (toPass && s.prog >= 1 && dish.n + 1 > FOOD_CAP) s.prog = 1;
        else if (s.prog >= 1) {
          let g = this.pay(p, def) * this.happyMult();
          if (Math.random() < this.ts().crit) g *= 2;
          if (toPass) {
            dish.n++;
            dish.v += g;
            this.views[i].payout(def.id, 0, false, true);
          } else if (toBar) {
            bar.n += this.beers(p);
            bar.v += g;
            this.views[i].payout(def.id, 0, false, true);
          } else if (this.night) {
            const b = bonesFor(p.st[def.id]!.lvl) * this.boneMult(p);
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
    if (this.night && !this.d.nightInfo && !this.awayObjs.length) {
      this.d.nightInfo = true;
      this.guideAdd('night');
    }
    if ((this.guideT -= dt) <= 0) {
      this.guideT = 0.5;
      this.guideStart();
    }
    if (this.d.pubIntro && !this.awayObjs.length) this.pubIntro(this.d.pubIntro);
    if (this.d.rushNew && (this.d.rushU ?? 0) > Date.now()) {
      this.d.rushNew = false;
      this.banner(this.cameras.main, t('Rozjezd! Výdělek ×{m} na {s} s', { m: this.d.rushM ?? 5, s: Math.round(((this.d.rushU ?? 0) - Date.now()) / 1000) }));
    }
    if ((this.menuT -= dt) <= 0) {
      this.menuT = 2;
      this.menuUnlocks();
    }
    const nn = this.nightNow();
    // i před přidáním průvodce (nightInfo se nastaví až o snímek později → dřív nápis přes ceduli „PADLA NOC!“)
    const firstNight = !!this.d.guideQ?.includes('night') || !this.d.nightInfo;
    if (nn !== this.night) {
      this.night = nn;
      // vrchol „Pán noci“: Půlnoční hodina – kosti ×3 na 60 s
      if (nn && this.star('nightlord')) (this.midU = Date.now() + 60_000), this.time.delayedCall(2200, () => this.banner(this.views[0].cam, t('Půlnoční hodina! Kosti ×3 na 60 s'), true));
      this.views.forEach((v) => v.setNight(nn));
      // noční várka platí jen do rána
      if (!nn && this.d.fx?.nightx2) delete this.d.fx.nightx2;
      // první noc ohlásí průvodce (cedule s Dál) – nápis by se s ní překrýval
      if (!(nn && firstNight)) this.banner(this.views[0].cam, nn ? t('Padla noc – příšery platí kostmi!') : t('Svítá – lidé zase platí coins.'), true);
    }
    // první noc stojí na začátku, dokud hráč v průvodci neťukne na Dál (přání: hrál v menu a noc mu utekla)
    if (nn && firstNight && !(this.guideCur?.id === 'night' && this.guideCur.i > 0)) {
      const dn = (this.d.dn ??= { lvl: 0, v2: true });
      dn.shift = switchPhase(true);
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

  // ---------- cíl na obzoru: krígl v horní liště se plní k další hospodě / hygieně (3C, procenta, místo C) ----------
  goalUi?: { g: Phaser.GameObjects.Graphics; num: Phaser.GameObjects.Text; zone: Phaser.GameObjects.Zone };
  goalKey = '';
  goalPh = 0;

  private goalOn() {
    return (this.d.tut ?? -1) < 0 && !!this.views[0];
  }

  /** krígly teď bez zaokrouhlení (pro plynulý ukazatel) */
  private kriglyCont() {
    const base = 1e5 * ACT_STEP ** (this.d.pubs.length - 1);
    return 2 * (this.d.run / base) ** 0.25 * (this.has('idol') ? 1.25 : 1) * (1 + this.ts().krigly + kKrigly(this.kl('krigly')));
  }

  /** šířka pilulky hygieny vpravo nahoře v hospodě (0 = není vidět) – pilulka úkolu se vejde vedle ní */
  hygW = 0;

  /** návrh B: pilulka „hygiena 62 %“ s kríglem vpravo nahoře v hospodě; ťuknutí otevře Obchod (tam je hygiena) */
  private goalTick() {
    const on = this.goalOn() && !this.awayObjs.length;
    const D = 95;
    if (!this.goalUi) {
      const g = this.add.graphics().setDepth(D).setVisible(false);
      const num = this.add.text(0, 0, '', txt(24, PAL.gold)).setDepth(D + 1).setVisible(false);
      const zone = this.add.zone(0, 0, 10, 10).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(D + 2).setVisible(false);
      zone.on('pointerdown', () => {
        if (!zone.visible || this.awayObjs.length) return;
        sfx.init();
        sfx.click();
        // přání uživatele 26. 11.: plný krígl (100 %) = rovnou okno hygieny (má vlastní potvrzení); pod 100 % Obchod s hygienou
        if (this.kriglyNow() >= prestigeMin(this.d.stats.prestiges)) return this.askPrestige();
        this.shopSub = 'up';
        this.openShop('shop', false);
      });
      this.touchZones.push(zone);
      this.goalUi = { g, num, zone };
    }
    const u = this.goalUi;
    const parts = [u.g, u.num, u.zone];
    if (!on) {
      if (this.goalKey) parts.forEach((o) => o.setVisible(false)), (this.goalKey = '');
      this.hygW = 0;
      return;
    }
    const k = this.kriglyNow(), pm = prestigeMin(this.d.stats.prestiges);
    const full = k >= pm;
    const fr = full ? 1 : Math.min(0.99, this.kriglyCont() / pm);
    // plný krígl pulzuje (překresluje se jen tehdy)
    if (full) this.goalPh += 0.1;
    const pulse = full ? Math.round((Math.sin(this.goalPh) + 1) * 1.5) : 0;
    const pct = full ? 100 : Math.floor(fr * 100);
    const y = this.pubTop() + 8, h = PILL_H;
    const key = `${pct}|${pulse}|${y}`;
    if (key === this.goalKey) return;
    this.goalKey = key;
    parts.forEach((o) => o.setVisible(true));
    u.num.setText(UI_LEAN >= 2 ? `${pct} %` : t('do hygieny {n} %', { n: pct })).setColor(full ? PAL.mint : PAL.gold).setScale(1);
    u.num.setScale(Math.min(1, 150 / u.num.width));
    // krígl, který se plní (dřív v horní liště, návrh C), vedle něj nápis
    const mw = 20, mh = 28, pw = Math.round(12 + mw + 7 + 10 + u.num.displayWidth + 14), x = W - 10 - pw;
    const mx = x + 12, my = y + (h - mh) / 2;
    const g = u.g.clear();
    if (full) g.fillStyle(col('mint'), 0.25 + pulse * 0.05).fillRoundedRect(x - 4, y - 4, pw + 8, h + 8, 16);
    g.fillStyle(col('ink'), 0.92).fillRoundedRect(x, y, pw, h, 14);
    if (full) g.lineStyle(3, col('mint')).strokeRoundedRect(x, y, pw, h, 14);
    g.lineStyle(5, col('ink')).strokeRoundedRect(mx + mw, my + 6, 7, 14, 3);
    g.lineStyle(3, col('fog')).strokeRoundedRect(mx + mw, my + 6, 7, 14, 3);
    g.fillStyle(col('dusk')).fillRect(mx, my, mw, mh);
    const foam = fr > 0 ? 3 + Math.min(2, pulse) : 0, fh = Math.round((mh - 5) * fr);
    g.fillStyle(col('amber')).fillRect(mx, my + mh - fh, mw, fh).fillStyle(col('gold')).fillRect(mx + 3, my + mh - fh, 4, fh);
    if (foam) g.fillStyle(col('white')).fillRect(mx, my + mh - fh - foam, mw, foam);
    u.num.setOrigin(0, 0.5).setPosition(mx + mw + 17, y + h / 2);
    // zóna = celá pilulka; větší dotykové místo dopočítá fitTouch
    u.zone.setPosition(x, y).setSize(pw, h);
    this.hygW = pw;
  }

  // ---------- počítadlo diamantů v horní liště vlevo od ×1 (výběr uživatele návrh B; ťuk = Diamanty → koupit) ----------
  /** po ťuknutí na počítadlo zablikají balíčky diamantů */
  gemBuyHint = false;
  gemUi?: { g: Phaser.GameObjects.Graphics; num: Phaser.GameObjects.Text; zone: Phaser.GameObjects.Zone };
  gemKey = '';
  /** levý okraj cedulky diamantů v horním řádku (návrh B) – krígl cíle jde vlevo od ní */
  gemLeft = 0;

  /** pixelový diamant (střed x, y, šířka w) */
  private gemShape(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number) {
    const h = w * 0.85, t = h * 0.35;
    const out = [{ x: x - w / 2, y: y - h / 2 + t }, { x: x - w / 4, y: y - h / 2 }, { x: x + w / 4, y: y - h / 2 }, { x: x + w / 2, y: y - h / 2 + t }, { x, y: y + h / 2 }];
    g.fillStyle(col('ink')).fillPoints(out.map((q) => ({ x: q.x + 2, y: q.y + 2 })), true);
    g.fillStyle(col('sky')).fillPoints(out, true);
    g.fillStyle(col('ice')).fillPoints([out[0], out[1], out[2], out[3]], true);
    g.fillStyle(col('white')).fillPoints([out[1], { x: x - w / 12, y: y - h / 2 }, { x: x - w / 5, y: y - h / 2 + t }, out[0]], true);
    g.fillStyle(col('blue')).fillPoints([{ x: x + w / 6, y: y - h / 2 + t }, out[3], out[4]], true);
  }

  private gemTick() {
    const on = (this.d.tut ?? -1) < 0 && !this.awayObjs.length;
    const D = 103;
    if (!this.gemUi) {
      const g = this.add.graphics().setDepth(D).setVisible(false);
      const num = this.add.text(0, 0, '', txt(22, PAL.ice)).setDepth(D + 1).setVisible(false);
      const zone = this.add.zone(0, 0, 10, 10).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(D + 2).setVisible(false);
      zone.on('pointerdown', () => {
        if (!zone.visible || this.awayObjs.length) return;
        sfx.init();
        sfx.click();
        this.spSub = 'gems';
        this.gemPage = 3;
        this.gemBuyHint = true;
        this.openShop('special', false);
      });
      this.touchZones.push(zone);
      this.gemUi = { g, num, zone };
    }
    const u = this.gemUi;
    const parts = [u.g, u.num, u.zone];
    if (!on) {
      if (this.gemKey) parts.forEach((o) => o.setVisible(false)), (this.gemKey = '');
      this.gemLeft = 0;
      return;
    }
    const n = this.d.gems ?? 0;
    const key = `${n}`;
    if (key === this.gemKey) return;
    this.gemKey = key;
    parts.forEach((o) => o.setVisible(true));
    const g = u.g.clear();
    u.num.setText(big(n)).setScale(1).setColor(PAL.ice).setFontSize(28);
    {
      // návrh B „Velká hospoda“: zaoblené pole vpravo v horní liště
      const nw = u.num.width, w = nw + 58, h = 46, x = W - 12 - w, y = 12;
      g.fillStyle(col('navy')).fillRoundedRect(x, y, w, h, 12);
      this.gemShape(g, x + 23, y + h / 2, 26);
      u.num.setOrigin(0, 0.5).setPosition(x + 42, y + h / 2);
      u.zone.setPosition(x, y).setSize(w, h);
      this.gemLeft = x;
    }
  }

  // ---------- úkol od hostinského: lišta nahoře (úkolníček, úkol, postup, UKAŽ / VYBER) ----------
  hygBtn?: Btn;
  qUi?: { g: Phaser.GameObjects.Graphics; icon: Phaser.GameObjects.Image; title: Phaser.GameObjects.Text; cnt: Phaser.GameObjects.Text; rew: Phaser.GameObjects.Text; coin: Phaser.GameObjects.Image; btn: Btn; hl: Phaser.GameObjects.Graphics; arrow: Phaser.GameObjects.Graphics };
  qKey = '';
  /** šipka UKAŽ míří na cíl úkolu (id úkolu) */
  qPoint: string | null = null;
  hygPointed = false;
  qPh = 0;
  qOffNow = -1;
  /** lišta úkolu je teď vidět */
  qVis = false;
  static QH = 60;

  private qctx(): QCtx {
    return { lock: (k) => this.tileLock(k), krigly: () => [this.kriglyNow(), prestigeMin(this.d.stats.prestiges)] };
  }

  private qCur(): QuestDef | null {
    if ((this.d.tut ?? -1) >= 0) return null;
    return currentQuest(this.d, this.qctx()) ?? this.rkQuest();
  }

  // ---------- Rekonstrukce ★ a Kniha hostinského (posudek pozdní hry C + D) ----------
  /** stav Knihy; undefined = ještě zamčená (otevře se s Ligou: 40. hygiena a výdělek) */
  rk(): RekoState | undefined {
    if (this.d.reko) return this.d.reko;
    if (this.d.stats.prestiges < REKO_HYG || this.tileLock('league')) return undefined;
    this.d.reko = newReko(this.d);
    REKO.R = this.d.reko;
    REKO.relics = this.d.relics;
    return this.d.reko;
  }

  /** úkol Knihy v liště úkolu (po úkolech hostinského pokračuje Kniha); po všech úkolech kapitoly výzva k Rekonstrukci */
  private rkQuest(): QuestDef | null {
    const R = this.rk();
    if (!R) return null;
    const at = { k: 'tile', key: 'tasks' } as const;
    if (rekoReady(R)) return { id: 'rk:reko', text: () => t('Zavolej Rekonstrukci ★{n}', { n: R.star + 1 }), prog: () => [1, 1], at };
    const k = nextTask(this.d, R);
    if (!k) return null;
    return { id: 'rk:' + k.id, text: k.text, prog: () => [taskProg(k, this.d, R), k.goal], at };
  }

  /** vyzvednutí úkolu Knihy: odměna jako úkol hostinského a v hospodě přibude kousek */
  private rekoClaim(k: RekoTask) {
    const R = this.rk();
    if (!R || R.done.includes(k.id) || !taskDone(k, this.d, R)) return sfx.error();
    R.done.push(k.id);
    const n = this.qReward();
    this.d.coins += n;
    this.d.gems = (this.d.gems ?? 0) + GEMS_FREE.quest + (k.gift?.gems ?? 0);
    if (k.gift?.bones) this.d.bones = (this.d.bones ?? 0) + k.gift.bones;
    meter.track('reko_task', { id: k.id, star: R.star });
    this.views.forEach((v) => v.rekoRefresh(true));
    sfx.fanfare();
    this.banner(this.views[0].cam, t('Kniha hostinského: {w}!', { w: k.what() }) + '\n' + t('+{n} coins a +{g} 💎', { n: big(n), g: GEMS_FREE.quest }));
    // kousek je v Pajzlu / Sklepní krčmě → ukázat tu hospodu
    const pi = k.item ? this.d.pubs.findIndex((p) => p.act === k.item!.act) : -1;
    if (pi >= 0 && this.views.length > 1 && pi !== this.sel && !this.shopObjs.length) this.selectPub?.(pi);
    if (rekoReady(R)) this.time.delayedCall(1800, () => this.banner(this.views[0].cam, t('Kapitola hotová: můžeš zavolat Rekonstrukci ★{n}!', { n: R.star + 1 })));
    store(this.d);
  }

  /** ★8 Relikviář: 4 relikvie z Chrámu a jejich efekty */
  relicWin() {
    this.closeShop();
    const D = 520, RH = 96;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    objs.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setDepth(D).setInteractive().on('pointerdown', () => 0));
    const bx = 20, bw = W - 40, bh = 200 + RELICS.length * RH, by = (H - bh) / 2;
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    objs.push(g);
    objs.push(this.add.text(W / 2, by + 16, t('Relikviář'), txt(34, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2));
    objs.push(this.add.text(W / 2, by + 60, t('Každý poražený Cthulhu zanechá další relikvii.'), txt(17, PAL.fog)).setOrigin(0.5, 0).setDepth(D + 2).setWordWrapWidth(bw - 40).setAlign('center'));
    RELICS.forEach((r, i) => {
      const y = by + 100 + i * RH, own = hasRelic(this.d.relics, r.id);
      g.fillStyle(col(own ? 'pine' : 'ink'), 0.7).fillRoundedRect(bx + 12, y, bw - 24, RH - 10, 10);
      const ic = this.add.image(bx + 56, y + (RH - 10) / 2, 'obj', 'relic_' + r.id).setScale(4).setDepth(D + 2);
      if (!own) ic.setTint(0x222222);
      objs.push(ic);
      objs.push(this.add.text(bx + 100, y + 14, own ? r.name() : '???', txt(22, own ? PAL.bone : PAL.fog)).setDepth(D + 2));
      objs.push(this.add.text(bx + 100, y + 48, own ? r.desc() : t('poraz Cthulhu v Chrámu'), txt(17, own ? PAL.mint : PAL.fog)).setDepth(D + 2));
    });
    const cb = this.btn(W / 2 - 90, by + bh - 78, 180, 60, () => close(), D + 3);
    this.drawBtn(cb, t('Zavřít'), true, 'slate');
    objs.push(cb.bg, cb.label, cb.zone);
    this.awayObjs = objs;
    this.awayClose = close;
    sfx.click();
  }

  private spPage = -1;
  /** sezónní pass (návrh B): stupně pod sebou, vlevo zdarma, uprostřed číslo, vpravo Zlatá řada; 5 stupňů na stránku */
  spassWin() {
    const sp = spassSync(this.d.spass);
    if (!sp) return;
    this.d.spass = sp;
    this.closeShop();
    const D = 520, PER = 5;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    const tier = spassTier(sp), pages = Math.ceil(SPASS_TIERS / PER);
    if (this.spPage < 0) this.spPage = Math.min(pages - 1, Math.floor(Math.max(0, tier - 1) / PER));
    const pg = this.spPage;
    objs.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setDepth(D).setInteractive().on('pointerdown', () => 0));
    const bx = 10, bw = W - 20, by = 60, bh = H - 130;
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    // hlavička: sezóna, zbývá, stupeň a body
    g.fillStyle(col('maroon')).fillRoundedRect(bx + 10, by + 10, bw - 20, 118, 12);
    const days = Math.max(0, Math.ceil((spassEnd() - Date.now()) / 86400_000));
    const T = (x: number, y: number, s: string, size: number, c: string, ox = 0, oy = 0) => {
      const o = this.add.text(x, y, s, txt(size, c)).setOrigin(ox, oy).setDepth(D + 2);
      objs.push(o);
      return o;
    };
    const head = T(bx + 24, by + 18, t('Sezóna: {s}', { s: spassName(sp.s) }), 26, PAL.gold);
    head.setScale(Math.min(1, (bw - 190) / head.width));
    T(bx + bw - 24, by + 22, t('ještě {d} dní', { d: days }), 18, PAL.fog, 1);
    T(bx + 24, by + 56, t('Stupeň {a} / {b}', { a: tier, b: SPASS_TIERS }), 20, PAL.bone);
    const inT = tier >= SPASS_TIERS ? SPASS_TIER_PTS : sp.pts - tier * SPASS_TIER_PTS;
    g.fillStyle(col('ink')).fillRoundedRect(bx + 190, by + 58, bw - 214, 22, 8);
    if (inT > 0) g.fillStyle(col('amber')).fillRoundedRect(bx + 190, by + 58, Math.max(16, ((bw - 214) * inT) / SPASS_TIER_PTS), 22, 8);
    T(bx + 190 + (bw - 214) / 2, by + 69, tier >= SPASS_TIERS ? t('hotovo') : t('{a} / {b} bodů', { a: inT, b: SPASS_TIER_PTS }), 15, PAL.white, 0.5, 0.5);
    const how = T(bx + 24, by + 92, t('Body: denní úkol +{a} · truhla +{b} · týdenní výzva +{c} · hygiena +{d}', { a: SPASS_PTS.daily, b: SPASS_PTS.chest, c: SPASS_PTS.weekly, d: SPASS_PTS.hyg }), 15, PAL.fog);
    how.setScale(Math.min(1, (bw - 48) / how.width));
    objs.push(g);
    // sloupce
    const y0 = by + 140, cw = 196, mid = W / 2;
    T(bx + 14 + cw / 2, y0, t('ZDARMA'), 16, PAL.fog, 0.5);
    T(bx + bw - 14 - cw / 2, y0, t('ZLATÁ ŘADA'), 16, PAL.gold, 0.5);
    const RH = 92, top = y0 + 26;
    const ln = this.add.graphics().setDepth(D + 1);
    ln.fillStyle(col('ink')).fillRect(mid - 3, top, 6, PER * RH - 10);
    objs.push(ln);
    const rewTxt = (r: SPassRew) => (r.gems ? `💎 ${r.gems}` : r.bones ? `🦴 ${big(r.bones)}` : `🍺 ${t('+{k} krígel', { k: r.krigle ?? 0 })}`) + (r.gems && r.krigle ? `\n🍺 ${t('+{k} krígel', { k: r.krigle })}` : '');
    for (let i = 0; i < PER; i++) {
      const n = pg * PER + i + 1;
      if (n > SPASS_TIERS) break;
      const y = top + i * RH, reached = n <= tier;
      if (reached) ln.fillStyle(col('mint')).fillRect(mid - 3, y, 6, RH);
      for (const gold of [false, true]) {
        const x = gold ? bx + bw - 14 - cw : bx + 14, got = (gold ? sp.gotG : sp.got).includes(n), can = spassCan(sp, n, gold);
        const lock = gold && !sp.gold;
        const box = this.add.graphics().setDepth(D + 1);
        box.fillStyle(col(gold ? 'rust' : 'slate'), got ? 0.45 : 1).fillRoundedRect(x, y, cw, RH - 10, 10);
        box.lineStyle(can ? 4 : 2, col(can ? 'mint' : gold ? 'gold' : 'fog'), can ? 1 : 0.6).strokeRoundedRect(x, y, cw, RH - 10, 10);
        objs.push(box);
        const rt = T(x + cw / 2, y + (RH - 10) / 2, rewTxt(spassRew(n, gold)), 20, PAL.bone, 0.5, 0.5).setAlign('center');
        rt.setScale(Math.min(1, (cw - 20) / rt.width));
        if (got) T(x + cw - 10, y + 6, '✓', 20, PAL.mint, 1, 0);
        else if (lock) T(x + cw - 8, y + 4, '🔒', 16, PAL.white, 1, 0);
        else if (can) T(x + cw - 10, y + 6, t('Vybrat'), 14, PAL.mint, 1, 0);
        const z = this.add.zone(x, y, cw, RH - 10).setOrigin(0).setDepth(D + 3).setInteractive();
        z.on('pointerdown', () => {
          if (lock) return void this.iapBuy('season');
          const r = spassClaim(sp, n, gold);
          if (!r) return sfx.error();
          this.d.gems = (this.d.gems ?? 0) + (r.gems ?? 0);
          this.d.bones = (this.d.bones ?? 0) + (r.bones ?? 0);
          this.d.krigle += r.krigle ?? 0;
          meter.track('spass_claim', { n, gold });
          store(this.d);
          sfx.coin(1);
          close();
          this.spassWin();
          this.banner(this.views[0].cam, t('Sezónní pass: {r}', { r: rewTxt(r).replace('\n', ' · ') }));
        });
        objs.push(z);
      }
      const cc = this.add.graphics().setDepth(D + 2);
      cc.fillStyle(col(reached ? 'green' : 'slate')).fillCircle(mid, y + (RH - 10) / 2, 24);
      cc.lineStyle(3, col(n === tier + 1 ? 'mint' : 'ink')).strokeCircle(mid, y + (RH - 10) / 2, 24);
      objs.push(cc);
      T(mid, y + (RH - 10) / 2, String(n), 20, PAL.white, 0.5, 0.5).setDepth(D + 3);
    }
    // stránky ▲ ▼, Zlatá řada, Zavřít
    const yb = top + PER * RH;
    const nav = (x: number, s: string, d: number) => {
      const b = this.btn(x, yb, 110, 52, () => {
        const np = pg + d;
        if (np < 0 || np >= pages) return sfx.error();
        this.spPage = np;
        close();
        this.spassWin();
      }, D + 3);
      this.drawBtn(b, s, pg + d >= 0 && pg + d < pages, 'slate');
      objs.push(b.bg, b.label, b.zone);
    };
    nav(bx + 14, '▲', -1);
    nav(bx + bw - 124, '▼', 1);
    T(mid, yb + 26, t('{a}–{b} z {n}', { a: pg * PER + 1, b: Math.min(SPASS_TIERS, pg * PER + PER), n: SPASS_TIERS }), 18, PAL.fog, 0.5, 0.5);
    if (!sp.gold) {
      const gb = this.btn(bx + 20, yb + 62, bw - 40, 60, () => void this.iapBuy('season'), D + 3);
      this.drawBtn(gb, t('Zlatá řada · {p}', { p: iap.price('season') }), true, 'amber');
      objs.push(gb.bg, gb.label, gb.zone);
    }
    const cb = this.btn(W / 2 - 90, by + bh - 72, 180, 58, () => ((this.spPage = -1), close()), D + 3);
    this.drawBtn(cb, t('Zavřít'), true, 'slate');
    objs.push(cb.bg, cb.label, cb.zone);
    this.awayObjs = objs;
    this.awayClose = () => ((this.spPage = -1), close());
    sfx.click();
  }

  /** sezónní pass: body (jen v běžící sezóně) */
  private spPts(kind: SPassKind) {
    this.d.spass = spassAdd(this.d.spass, kind);
  }

  /** co přinese hvězdička */
  private rekoGift(star: number) {
    return [t('nový vzhled Pajzlu'), t('pátá stanice v každé hospodě'), t('další kapitola Knihy'), t('kasa offline o {h} h déle', { h: REKO_OFFLINE_H }), t('zlatý štít podniku'), t('svatba v hospodě (nová událost)'), t('zlaté stanice od hodnosti Mistr'), t('relikvie z Chrámu'), t('vzácní hosté do Sbírky'), t('trůn hostinského')][star - 1] ?? '';
  }

  /** Kniha hostinského: úkoly kapitoly (okno přes obrazovku) */
  rekoBook() {
    const R = this.rk();
    if (!R) return;
    this.closeShop();
    const D = 520;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    objs.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setDepth(D).setInteractive().on('pointerdown', () => 0));
    const star = R.star + 1, ks = chapter(star), RH = 74;
    const bx = 14, bw = W - 28, bh = Math.min(H - 120, 190 + ks.length * RH + (R.star >= REKO_STARS ? 0 : 80)), by = Math.max(60, (H - bh) / 2);
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    objs.push(g);
    const stars = rkStars(R.star);
    objs.push(this.add.text(W / 2, by + 16, t('Kniha hostinského'), txt(34, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 2));
    objs.push(this.add.text(W / 2, by + 58, t('Podnik: {s}', { s: stars }), txt(22, PAL.sand)).setOrigin(0.5, 0).setDepth(D + 2));
    if (R.star >= REKO_STARS) {
      objs.push(this.add.text(W / 2, by + 110, t('Všech {n} hvězdiček! Legendární podnik.', { n: REKO_STARS }), txt(24, PAL.mint)).setOrigin(0.5, 0).setDepth(D + 2).setWordWrapWidth(bw - 40).setAlign('center'));
    } else {
      objs.push(this.add.text(W / 2, by + 88, t('Kapitola ★{n} · za Rekonstrukci: {g}', { n: star, g: this.rekoGift(star) }), txt(18, PAL.fog)).setOrigin(0.5, 0).setDepth(D + 2).setWordWrapWidth(bw - 40).setAlign('center'));
      ks.forEach((k, i) => {
        const y = by + 124 + i * RH, claimed = R.done.includes(k.id), done = claimed || taskDone(k, this.d, R);
        const box = this.add.graphics().setDepth(D + 1);
        box.fillStyle(col(claimed ? 'pine' : 'ink'), 0.7).fillRoundedRect(bx + 10, y, bw - 20, RH - 8, 10);
        const name = this.add.text(bx + 24, y + 6, k.text(), txt(20, claimed ? PAL.mint : PAL.bone)).setDepth(D + 2);
        name.setScale(Math.min(1, (bw - 210) / name.width));
        const p = taskProg(k, this.d, R);
        const sub = this.add.text(bx + 24, y + 36, (claimed ? '✓ ' : k.goal > 1 ? `${big(p)} / ${big(k.goal)} · ` : '') + k.what(), txt(16, PAL.fog)).setDepth(D + 2);
        sub.setScale(Math.min(1, (bw - 210) / sub.width));
        objs.push(box, name, sub);
        const b = this.btn(W - 172, y + 7, 140, 52, () => {
          if (claimed || !done) return sfx.error();
          close();
          this.rekoClaim(k);
          this.rekoBook();
        }, D + 3);
        this.drawBtn(b, claimed ? '✓' : done ? t('Vybrat') : `${Math.floor((p / k.goal) * 100)} %`, done && !claimed, 'green');
        objs.push(b.bg, b.label, b.zone);
      });
      const ready = rekoReady(R);
      const rb = this.btn(bx + 24, by + bh - 150, bw - 48, 64, () => (ready ? (close(), this.askReko()) : sfx.error()), D + 3);
      this.drawBtn(rb, ready ? t('Rekonstrukce ★{n}', { n: star }) : t('Rekonstrukce: splň všechny úkoly'), ready, 'red');
      objs.push(rb.bg, rb.label, rb.zone);
    }
    const cb = this.btn(W / 2 - 90, by + bh - 78, 180, 60, () => close(), D + 3);
    this.drawBtn(cb, t('Zavřít'), true, 'slate');
    objs.push(cb.bg, cb.label, cb.zone);
    this.awayObjs = objs;
    this.awayClose = close;
    sfx.click();
  }

  /** potvrzení Rekonstrukce (= hygiena navíc s hvězdičkou) */
  private askReko() {
    const R = this.rk();
    if (!R || !rekoReady(R)) return sfx.error();
    const D = 520, star = R.star + 1;
    const objs: Phaser.GameObjects.GameObject[] = [];
    const close = () => {
      objs.forEach((o) => o.destroy());
      this.awayObjs = [];
    };
    objs.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setDepth(D).setInteractive());
    const bx = 30, by = 230, bw = W - 60, bh = 460;
    const g = this.add.graphics().setDepth(D + 1);
    g.fillStyle(col('ink')).fillRoundedRect(bx, by + 6, bw, bh, 16);
    g.fillStyle(col('dusk')).fillRoundedRect(bx, by, bw, bh, 16);
    g.lineStyle(4, col('gold')).strokeRoundedRect(bx, by, bw, bh, 16);
    objs.push(g);
    const tx = (y: number, s: string, size: number, c: string) => objs.push(this.add.text(W / 2, y, s, txt(size, c)).setOrigin(0.5, 0).setAlign('center').setDepth(D + 2).setWordWrapWidth(bw - 40));
    tx(by + 20, t('Rekonstrukce ★{n}', { n: star }), 40, PAL.gold);
    tx(by + 80, t('Hospody se zavřou jako při hygieně (coins, úrovně a vylepšení od nuly). Krígly, obchod s krígly, číšníci, strom, šipky, talismany, kosti a výzdoba zůstanou.'), 19, PAL.fog);
    tx(by + 210, '★'.repeat(star), 52, PAL.gold);
    tx(by + 280, t('Dostaneš: {g}', { g: this.rekoGift(star) }), 24, PAL.mint);
    const no = this.btn(bx + 24, by + bh - 88, 180, 64, () => close(), D + 3);
    this.drawBtn(no, t('Ještě ne'), true, 'slate');
    const yes = this.btn(bx + bw - 204, by + bh - 88, 180, 64, () => {
      rekoStar(R, this.d);
      this.d.rekoMsg = star;
      meter.track('reko', { star });
      this.prestige();
    }, D + 3);
    this.drawBtn(yes, t('Rekonstruovat'), true, 'red');
    yes.label.setScale(Math.min(1, 160 / yes.label.width));
    objs.push(no.bg, no.label, no.zone, yes.bg, yes.label, yes.zone);
    this.awayObjs = objs;
    this.awayClose = close;
    sfx.click();
  }

  /** kosti přibyly (jakkoli: noc, šipky, truhla…) → čítač úkolu „Nasbírej kosti“ */
  private rkBones = -1;
  private goldT = 0;
  private rekoTick() {
    const R = this.d.reko;
    if (!R) return;
    // ★7: zlaté stanice od hodnosti Mistr (kontrola jednou za ~2 s, objekty obsluhy přibývají)
    if (R.star >= 7 && ++this.goldT % 120 === 1) {
      const ids = STATIONS.map((d) => d.id).filter((id) => mastRank(mastStage(this.d.mast?.[id] ?? 0)).rank >= 2);
      this.views.forEach((v) => v.setGold(ids));
    }
    const b = this.d.bones ?? 0;
    if (this.rkBones >= 0 && b > this.rkBones) rekoCount(R, 'bones', b - this.rkBones);
    this.rkBones = b;
  }

  /** o kolik se posunou věci nahoře v hospodě (schopnost manažera, truhla, cedule stylu) kvůli pilulkám úkolu
   *  a hygieny (návrh B) a pruhu VIP hosta pod nimi */
  private qOff() {
    return this.pillsOff() + (this.vipBar ? 48 : 0);
  }

  /** výška řádku pilulek nahoře v hospodě (0 = žádná není vidět) */
  private pillsOff() {
    return this.qVis || this.hygW > 0 ? PILL_H + 8 : 0;
  }

  private qReward() {
    return Math.max(30, Math.round(this.totalRate() * 60));
  }

  /** obdélník, na který teď ukázat (podle stavu menu) */
  private qTarget(q: QuestDef): number[] | null {
    const r = (b?: Btn) => (b && b.bg.active && b.visible ? [b.x, b.y, b.w, b.h] : null);
    const menu = () => (this.shopObjs.length ? null : r(this.shopBtn));
    const tileR = (key: string) => {
      if (key === 'tasks' || key === 'up') return r(this.navBtns[key === 'up' ? 1 : 2]);
      if (!this.shopObjs.length) return r(this.shopBtn);
      // Talismany jsou v Kostnici: Menu → Kostnice → tlačítko Talismany
      if (key === 'talis') {
        if (this.tab === 'shop' && this.shopSub === 'bones') return r(this.talisBtn);
        key = 'bones';
      }
      if (this.tab !== 'home') return null;
      const k = PubScene.TILES.findIndex(([tb, sub]) => (sub && tb === 'shop' ? sub : tb) === key);
      const y0 = MENU_Y0, tw = (W - 40) / 3;
      return [10 + (k % 3) * (tw + 10), y0 + 64 + Math.floor(k / 3) * 126, tw, 118];
    };
    const card = (sid: string, what: 'buy' | 'staff') => {
      if (this.shopObjs.length) return null;
      const c = this.cards.find((k) => k.def.id === sid)?.[what];
      return c ? [c.x, c.y, c.w, c.h] : null;
    };
    const a = q.at;
    switch (a.k) {
      case 'buy':
      case 'staff':
        return card(a.s, a.k);
      case 'tile':
        return this.d.qTiles?.includes(a.key) ? null : tileR(a.key);
      case 'up':
      case 'hyg':
        if (this.shopObjs.length && this.tab === 'shop' && this.shopSub === 'up') return a.k === 'hyg' ? r(this.hygBtn) : r(this.shopRows[0]?.b);
        return this.shopObjs.length && this.tab !== 'home' ? null : tileR('up') ?? menu();
      case 'waiter': {
        if (this.shopObjs.length || this.night || this.wSel >= 0) return null;
        const ws = this.d.pubs[this.wPub()]?.w ?? [];
        const k = a.hire ? ws.length : ws.findIndex((w) => freePoints(w) > 0);
        if (!ws.length || k < 0 || k >= WAITER_MAX) return null;
        const { x, y } = chipXY(k);
        return [x - CHIP_R, y - CHIP_R, CHIP_R * 2, CHIP_R * 2];
      }
      case 'tip': {
        if (this.shopObjs.length) return null;
        const p = this.views[this.views.length > 1 ? this.sel : 0]?.tipTarget();
        return p ? [p.x - 30, p.y - 10, 60, 60] : null;
      }
      case 'style': {
        const p = this.d.pubs[this.views.length > 1 ? this.sel : 0];
        const best = STATIONS.filter((d) => (p.st[d.id]?.lvl ?? 0) > 0).sort((x, y) => (p.st[y.id]?.lvl ?? 0) - (p.st[x.id]?.lvl ?? 0))[0];
        return best ? card(best.id, 'buy') : null;
      }
    }
  }

  private qClaim() {
    const q = this.qCur();
    if (!q || !questDone(q, this.d, this.qctx())) return;
    // Kniha hostinského: vyzvednout úkol / otevřít Rekonstrukci
    if (q.id === 'rk:reko') return this.rekoBook();
    if (q.id.startsWith('rk:')) {
      const k = chapter(this.rk()!.star + 1).find((x) => 'rk:' + x.id === q.id);
      if (k) this.rekoClaim(k);
      this.qPoint = null;
      return;
    }
    const n = this.qReward();
    this.d.coins += n;
    this.d.gems = (this.d.gems ?? 0) + GEMS_FREE.quest;
    (this.d.q ??= []).push(q.id);
    meter.track('quest_done', { id: q.id, n: this.d.q.length });
    this.time.delayedCall(2500, () => this.askNotify());
    this.qPoint = null;
    sfx.fanfare();
    this.banner(this.views[0].cam, t('Úkol splněn! +{n} coins a +{g} 💎', { n: big(n), g: GEMS_FREE.quest }));
    if (!this.qCur()) this.time.delayedCall(1500, () => this.banner(this.views[0].cam, t('Všechny úkoly od hostinského splněny!')));
    store(this.d);
  }

  private qShow() {
    const q = this.qCur();
    if (!q) return;
    if (q.id.startsWith('rk:')) return this.rekoBook();
    this.qPoint = this.qPoint === q.id ? null : q.id;
    // cíl je na kartě, ale menu je otevřené → zavřít menu
    if (this.qPoint && (q.at.k === 'buy' || q.at.k === 'staff' || q.at.k === 'tip' || q.at.k === 'style') && this.shopObjs.length) this.closeShop();
    sfx.click();
  }

  /** každý snímek: lišta úkolu, posun věcí nahoře, šipka UKAŽ */
  private qTick() {
    // posun věcí nahoře jen tehdy, když je lišta úkolu opravdu vidět (dřív i skrytá odsunula Šťastnou hodinu doprostřed)
    const q0 = this.qCur();
    // Zkušebna S5/H1 (5. běh): první hygiena je připravená → jednou sama ukázat cestu (rámeček/šipka) a cedule
    if (q0?.id === 'hyg1' && !this.d.stats.prestiges && !this.hygPointed && !this.guideCur && (this.d.tut ?? -1) < 0) {
      this.hygPointed = true;
      this.qPoint = 'hyg1';
      this.banner(this.views[0].cam, t('Hygiena je připravená! Krígly = výdělek navždy'), true);
    }
    // lišta úkolu nad hospodou zpět (přání uživatele: „v čem pokračovat“ bylo dobré); je i v záložce Úkoly
    this.qVis = !!q0 && !this.guideCur && Date.now() >= this.tutFinaleUntil && !this.awayObjs.length;
    const off = this.qOff();
    if (off !== this.qOffNow) {
      this.qOffNow = off;
      const y = this.pubTop() + 8 + off;
      this.skillBtns.forEach((b, i) => {
        if (!b) return;
        b.y = y;
        b.zone.setY(y);
        b.label.setY(y + b.h / 2);
        this.skillKeys[i] = '';
        this.drawSkill(i);
      });
      this.vipBarDraw();
      this.chestHudDraw();
      this.drawStyleSign();
    }
    const q = this.qCur();
    const D = 95;
    if (!this.qUi) {
      // návrh B: pilulka vlevo nahoře v hospodě (úkolníček, úkol, postup); ťuknutí = UKAŽ, splněný úkol = VYBER
      const g = this.add.graphics().setDepth(D);
      const icon = this.add.image(0, 0, 'icons', 'clipboard').setScale(2.2).setDepth(D + 1);
      const title = this.add.text(0, 0, '', txt(24, PAL.gold)).setOrigin(0, 0.5).setDepth(D + 1);
      const cnt = this.add.text(0, 0, '', txt(24, PAL.white)).setOrigin(0, 0.5).setDepth(D + 1);
      const rew = this.add.text(0, 0, '', txt(16, PAL.gold)).setVisible(false).setDepth(D + 1);
      const coin = this.add.image(0, 0, 'obj', 'coin').setScale(1.5).setVisible(false).setDepth(D + 1);
      const btn = this.btn(10, 0, 100, PILL_H, () => (this.qCur() && questDone(this.qCur()!, this.d, this.qctx()) ? this.qClaim() : this.qShow()), D + 2);
      const hl = this.add.graphics().setDepth(430);
      const arrow = this.add.graphics().setDepth(431);
      const tri = (c: number, gr: number) => arrow.fillStyle(c).fillTriangle(-22 - gr, -14 - gr, 22 + gr, -14 - gr, 0, 22 + gr).fillRect(-9 - gr, -40 - gr, 18 + gr * 2, 28);
      tri(col('ink'), 4);
      tri(col('gold'), 0);
      this.qUi = { g, icon, title, cnt, rew, coin, btn, hl, arrow };
    }
    const u = this.qUi;
    const show = !!q && !this.guideCur && Date.now() >= this.tutFinaleUntil && !this.awayObjs.length;
    const parts = [u.g, u.icon, u.title, u.cnt];
    if (!show) {
      if (this.qKey !== '') {
        parts.forEach((o) => o.setVisible(false));
        this.drawBtn(u.btn, '', false, 'amber', false);
        u.hl.clear();
        u.arrow.setVisible(false);
        this.qKey = '';
      }
      if (!q) this.qPoint = null;
      return;
    }
    const done = questDone(q, this.d, this.qctx());
    const [a, b] = q.prog(this.d, this.qctx());
    const y = this.pubTop() + 8;
    const rw = this.qReward();
    // pilulka se vejde vlevo od pilulky hygieny
    const maxW = W - 20 - (this.hygW ? this.hygW + 8 : 0);
    const key = `${q.id}|${done}|${a}|${y}|${big(rw)}|${maxW}|${this.qPoint === q.id}`;
    if (key !== this.qKey) {
      this.qKey = key;
      parts.forEach((o) => o.setVisible(true));
      const h = PILL_H, x0 = 10, c = done ? col('mint') : col('gold');
      // splněno: „VYBER +68K“ zeleně (ťuknutí vybere); jinak úkol a postup „· 42/60“
      u.title.setText(done ? t('VYBER +{n}', { n: big(rw) }) : q.text()).setColor(done ? PAL.mint : PAL.gold).setScale(1);
      u.cnt.setText(done ? '' : `· ${big(Math.min(a, b))}/${big(b)}`).setScale(1);
      const gap = done ? 0 : 7, tw = u.title.width + gap + u.cnt.width;
      const sc = Math.min(1, (maxW - 44 - 14) / Math.max(1, tw));
      u.title.setScale(sc).setPosition(x0 + 42, y + h / 2);
      u.cnt.setScale(sc).setPosition(x0 + 42 + (u.title.width + gap) * sc, y + h / 2);
      const pw = Math.round(42 + tw * sc + 14);
      u.g.clear();
      if (done) u.g.fillStyle(col('mint'), 0.3).fillRoundedRect(x0 - 4, y - 4, pw + 8, h + 8, 16);
      u.g.fillStyle(col('ink'), 0.92).fillRoundedRect(x0, y, pw, h, 14).lineStyle(this.qPoint === q.id || done ? 3 : 2, c).strokeRoundedRect(x0, y, pw, h, 14);
      u.icon.setPosition(x0 + 22, y + h / 2 + 1);
      // červený vykřičník na úkolníčku
      const ex = x0 + 33, ey = y + 11;
      // Zkušebna U1: vykřičník jen když je co vybrat (dřív svítil červeně pořád)
      if (done) u.g.fillStyle(col('ink')).fillCircle(ex, ey, 9).fillStyle(col('mint')).fillCircle(ex, ey, 7).fillStyle(col('white')).fillRect(ex - 1, ey - 5, 3, 6).fillRect(ex - 1, ey + 2, 3, 2);
      // tlačítko = celá pilulka (bez vlastního vzhledu)
      Object.assign(u.btn, { x: x0, y, w: pw, h, visible: true, enabled: true });
      u.btn.bg.clear();
      // popisek jen pro nástroje (tools/novy-hrac.mjs) – pilulka má vlastní nápis
      u.btn.label.setText(done ? t('VYBER +{n}', { n: big(rw) }) : t('UKAŽ')).setVisible(false);
      u.btn.zone.setVisible(true).setPosition(x0, y).setSize(pw, h);
    }
    // šipka UKAŽ
    u.hl.clear();
    const r = this.qPoint === q.id && !done ? this.qTarget(q) : null;
    u.arrow.setVisible(!!r);
    if (!r) return;
    this.qPh += 0.12;
    const [x, ty, w, h] = r, up = ty < TOP + TABH;
    u.hl.lineStyle(4, col('gold'), 0.6 + 0.4 * Math.sin(this.qPh * 2)).strokeRoundedRect(x - 6, ty - 6, w + 12, h + 12, 10);
    // Zkušebna H3: na spodní lištu jen svítící rámeček (šipka nad lištou zakrývala tlačítka karet, např. „Kostlivec 500K“);
    // na široké tlačítko šipka u pravého okraje, ne přes název stanice a pruh uprostřed
    if (ty >= H - NAV_H - 4) { u.arrow.setVisible(false); return; }
    const ax = !up && w > 120 ? x + w - 30 : x + w / 2;
    u.arrow.setAngle(up ? 180 : 0).setPosition(ax, up ? ty + h + 44 + Math.sin(this.qPh) * 8 : ty - 30 - Math.sin(this.qPh) * 8);
  }

  // ---------- průvodce: novinky ukázat šipkou (velký pokyn + krátké vysvětlení, jako návod) ----------
  guideT = 0;
  guideObjs: Phaser.GameObjects.GameObject[] = [];
  guideFollow: (() => void) | null = null;
  guideCur: { id: string; i: number } | null = null;
  /** další novinka v menu nejdřív v (ms) – pauza mezi nimi */
  guideGapUntil = 0;

  private guideAdd(id: string) {
    const q = (this.d.guideQ ??= []), seen = (this.d.guides ??= []);
    if (!q.includes(id) && !seen.includes(id)) q.push(id);
  }

  /** kroky průvodce: pokyn, vysvětlení, čím se splní (událost nebo „ok“ = tlačítko), kam ukázat */
  private guideSteps(id: string): { head: string; text: string; done: string; at?: () => number[] | null }[] {
    const card = (sid: string, what: 'buy' | 'staff', pub?: number) => () => {
      const c = this.cards.find((k) => k.def.id === sid && (pub === undefined || k.pub === pub))?.[what];
      return c && c.visible ? [c.x, c.y, c.w, c.h] : null;
    };
    const menuBtn = () => [this.shopBtn.x, this.shopBtn.y, this.shopBtn.w, this.shopBtn.h];
    const tile = (key: string) => () => {
      if (!this.shopObjs.length || this.tab !== 'home') return null;
      // pořadí jako v menuGrid (odemčené napřed) – dřív index v celém TILES = šipka mířila na jinou dlaždici a průvodce se zasekl
      const { tiles, keyOf } = this.menuTiles();
      const k = tiles.findIndex((r) => keyOf(r) === key);
      if (k < 0) return null;
      const y0 = MENU_Y0, tw = (W - 40) / 3;
      return [10 + (k % 3) * (tw + 10), y0 + 64 + Math.floor(k / 3) * 126, tw, 118];
    };
    if (id.startsWith('pub')) {
      const n = Number(id.slice(3)), name = PUB_NAMES[this.d.pubs[n - 1]?.act ?? n];
      const tab = () => (this.pubTabs[n - 1] ? [this.pubTabs[n - 1].x, this.pubTabs[n - 1].y, this.pubTabs[n - 1].w, this.pubTabs[n - 1].h] : null);
      // hráč přepnul na jinou hospodu (hlášení: šipka ukazovala na prázdné místo cizí karty) → šipka na záložku té nové hospody
      const here = (f: () => number[] | null) => () => (this.views.length > 1 && this.sel !== n - 1 ? tab() : f());
      return [
        { head: t('NOVÁ HOSPODA!'), text: t('ťukni nahoře na „{n}“', { n: name }), done: 'pub:' + (n - 1), at: tab },
        { head: t('OTEVŘI PÍPU'), text: t('i tady začínáš pípou – kup ji', { n: name }), done: 'buy:tap', at: here(card('tap', 'buy', n - 1)) },
        { head: t('NAJMI ČÍŠNÍKY'), text: t('pak tahle hospoda vydělává sama'), done: 'hire', at: here(card('tap', 'staff', n - 1)) },
        { head: t('HOSPODY BĚŽÍ NARÁZ'), text: t('přepínej nahoře nebo tažením do strany'), done: 'ok' },
      ];
    }
    if (id === 'night')
      return [
        { head: t('PADLA NOC!'), text: t('příšery platí kostmi, ráno zase coins'), done: 'ok' },
        { head: t('ŤUKNI NA BUBLINU'), text: t('příšera si objednala – dá ti kost'), done: 'tip', at: () => { const p = this.views[this.views.length > 1 ? this.sel : 0]?.tipTarget(); return p ? [p.x - 30, p.y - 10, 60, 60] : null; } },
        { head: t('KOSTI SBÍREJ'), text: t('utratíš je v Menu → Kostnice'), done: 'ok' },
      ];
    const key = id.slice(5);
    const row = PubScene.TILES.find(([tb, sub]) => (sub && tb === 'shop' ? sub : tb) === key);
    // Zkušebna U2: novinky v menu jedním krátkým řádkem (do 6 slov)
    const about: Record<string, string> = {
      brew: t('vař pivo pro bonus a coins'),
      decor: t('ozdoby s trvalým bonusem'),
      darts: t('házej šipky, vyhraj odměny'),
      daynight: t('nastavení dne a noci'),
      keeper: t('za body kupuj dovednosti'),
      talis: t('talismany z chrámu, vylepšuj kostmi'),
      krigl: t('za krígly trvalá vylepšení'),
      temple: t('bojuj o talismany a truhly'),
      league: t('vydělej za týden víc než soupeř'),
      bones: t('kostka zlepší vlastnost natrvalo'),
      coll: t('ťuká na bubliny za tebe'),
      special: t('každý den truhla zdarma'),
    };
    if (!row) return [];
    return [
      // v menu už jen šipka na dlaždici (žádná cedule ani „Rozumím“ – přání uživatele)
      { head: t('NOVÉ V MENU: {s}', { s: row[2].toUpperCase() }), text: (about[key] ? about[key] + '\n' : '') + t('ťukni na Menu'), done: 'menu', at: menuBtn },
      // menu zavřené dřív, než hráč ťukl na dlaždici → šipka zase na Menu (dřív průvodce visel neviditelný a schovával lištu úkolu)
      { head: '', text: '', done: 'tile:' + key, at: () => (this.shopObjs.length ? tile(key)() : menuBtn()) },
    ];
  }

  /** spustí další průvodce z fronty, když nic jiného neběží */
  private guideStart() {
    if (this.guideCur || this.awayObjs.length || (this.d.tut ?? -1) >= 0 || this.d.pubIntro || Date.now() < this.tutFinaleUntil) return;
    const id = this.d.guideQ?.[0];
    if (!id) return;
    // vždy s vysvětlením na hlavní obrazovce: počká, až bude menu zavřené (dřív v otevřeném menu jen šipky po sobě)
    if (this.shopObjs.length) return;
    // novinky v menu po jedné a s pauzou (přání uživatele: pomalu a postupně)
    if (id.startsWith('tile:') && Date.now() < this.guideGapUntil) return;
    this.guideCur = { id, i: 0 };
    this.guideShow();
  }

  /** průvodce novou hospodou: krok, který už je splněný (hráč přepnul tažením, najal dřív…), se sám přeskočí –
   *  dřív průvodce visel na „NAJMI ČÍŠNÍKY“, i když číšníci už byli najatí a tlačítko zmizelo (hlášení uživatele) */
  private guideSkipDone() {
    const g = this.guideCur;
    if (!g || !g.id.startsWith('pub')) return;
    const n = Number(g.id.slice(3)) - 1, p = this.d.pubs[n];
    const st = this.guideSteps(g.id)[g.i];
    if (!p || !st) return;
    const tap = p.st.tap;
    const done =
      (st.done === 'pub:' + n && this.views.length > 1 && this.sel === n) ||
      (st.done === 'buy:tap' && (tap?.lvl ?? 0) > 0) ||
      (st.done === 'hire' && !!tap?.auto);
    if (done) this.guideEv(st.done);
  }

  private guideEv(ev: string) {
    const g = this.guideCur;
    if (!g) return;
    const steps = this.guideSteps(g.id);
    if (steps[g.i]?.done !== ev) {
      // jiná akce (třeba otevřené menu) – jen překreslit šipku
      this.time.delayedCall(30, () => this.guideCur === g && this.guideShow());
      return;
    }
    g.i++;
    if (g.i >= steps.length) return this.guideEnd();
    this.time.delayedCall(250, () => this.guideCur === g && this.guideShow());
  }

  private guideEnd() {
    const g = this.guideCur;
    this.guideObjs.forEach((o) => o.destroy());
    this.guideObjs = [];
    this.guideFollow = null;
    this.guideCur = null;
    if (!g) return;
    if (g.id.startsWith('tile:')) this.guideGapUntil = Date.now() + 90_000;
    // Zkušebna O2: po průvodci novou hospodou (hned po hygieně) další novinka až za 2,5 min – dřív 6 cedulí za 30 s
    if (g.id.startsWith('pub')) this.guideGapUntil = Date.now() + 150_000;
    this.d.guideQ = (this.d.guideQ ?? []).filter((x) => x !== g.id);
    (this.d.guides ??= []).push(g.id);
    store(this.d);
  }

  private guideShow() {
    this.guideObjs.forEach((o) => o.destroy());
    this.guideObjs = [];
    this.guideFollow = null;
    const g = this.guideCur;
    if (!g) return;
    const steps = this.guideSteps(g.id), st = steps[g.i];
    if (!st) return this.guideEnd();
    const D = 440;
    // velká cedule jen na hlavní obrazovce – v otevřeném menu jen šipka
    const bare = !st.head || (this.shopObjs.length > 0 && st.done !== 'ok');
    // cíl nahoře (Menu, záložky hospod) → šipka míří nahoru, cedule o kus níž, ať ji šipka nepřekryje
    const r0 = st.at?.();
    const by = st.done === 'tip' ? PUB_BOT + 30 : this.pubTop() + 16 + (r0 && r0[1] < TOP + TABH ? 80 : 0);
    const hd = this.add.text(W / 2, by + 6, st.head, txt(42, PAL.gold)).setOrigin(0.5, 0).setDepth(D + 1);
    hd.setScale(Math.min(1, (W - 110) / hd.width));
    const tx = this.add.text(W / 2, by + 56, st.text, { fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'bold', fontSize: '22px', color: PAL.white, align: 'center', wordWrap: { width: W - 90 } }).setOrigin(0.5, 0).setDepth(D + 1);
    let bh = 56 + Math.max(tx.height, 30) + 22;
    const objs: Phaser.GameObjects.GameObject[] = [hd, tx];
    if (st.done === 'ok') {
      const ok = this.btn(W / 2 - 100, by + bh - 4, 200, 56, () => this.guideEv('ok'), D + 2);
      this.drawBtn(ok, g.i + 1 >= steps.length ? t('Rozumím') : t('Dál'), true, 'green');
      objs.push(ok.bg, ok.label, ok.zone);
      bh += 66;
    }
    const box = this.add.graphics().setDepth(D);
    if (bare) objs.forEach((o) => (o as Phaser.GameObjects.Text).setVisible(false));
    else {
      box.fillStyle(col('ink'), 0.96).fillRoundedRect(40, by - 12, W - 80, bh, 12);
      box.lineStyle(4, col('gold')).strokeRoundedRect(40, by - 12, W - 80, bh, 12);
    }
    objs.unshift(box);
    // šipka a zlatý rámeček kolem cíle (cíl se může hýbat → každý snímek)
    if (st.at) {
      const hl = this.add.graphics().setDepth(D + 2);
      const arrow = this.add.graphics().setDepth(D + 3);
      const tri = (c: number, gr: number) => arrow.fillStyle(c).fillTriangle(-22 - gr, -14 - gr, 22 + gr, -14 - gr, 0, 22 + gr).fillRect(-9 - gr, -40 - gr, 18 + gr * 2, 28);
      tri(col('ink'), 4);
      tri(col('gold'), 0);
      let ph = 0;
      this.guideFollow = () => {
        const r = st.at!();
        hl.clear();
        arrow.setVisible(!!r);
        if (!r) return;
        ph += 0.12;
        const [x, y, w, h] = r, up = y < TOP + TABH;
        // Zkušebna H3: cíl ve spodní liště (Menu, Obchod…) – jen silný rámeček, šipka by zakryla ceny na kartách nad lištou
        const nav = y >= H - NAV_H - 4;
        hl.lineStyle(nav ? 6 : 4, col('gold'), 0.6 + 0.4 * Math.sin(ph * 2)).strokeRoundedRect(x - 6, y - 6, w + 12, h + 12, 10);
        arrow.setVisible(!nav);
        arrow.setAngle(up ? 180 : 0).setPosition(x + w / 2, up ? y + h + 44 + Math.sin(ph) * 8 : y - 30 - Math.sin(ph) * 8);
      };
      this.guideFollow();
      objs.push(hl, arrow);
    }
    this.guideObjs = objs;
  }

  /** text vedle pruhu karty: vede styl / zásobuje vyšší hospody / dostává zásoby / kolik chybí ke stylu */
  private cardTag(p: PubState, id: string, open: boolean): { text: string; col: string } | null {
    // během návodu nic navíc – nový hráč se má soustředit na ťukání a nákup
    if (!open || this.night || ((this.d.tut ?? -1) >= 0 && this.views.length === 1)) return null;
    const pubs = this.d.pubs;
    const sn = starsOf(this.d.stars, p.act, id);
    if (sn < STAR_MAX && (p.st[id]?.lvl ?? 0) >= STAR_LVL[id]) return { text: t('★ {n}. hvězda po hygieně', { n: sn + 1 }), col: PAL.gold };
    const out = supplyOut(pubs, p, id);
    if (isStyle(p, id)) return { text: t('♛ {s}', { s: STYLES[id].name }) + (out > 0 ? ' · ▶ +' + Math.round(out * 100) + ' %' : ''), col: PAL.gold };
    if (out > 0) return { text: t('▶ zásobuje +{v} %', { v: Math.round(out * 100) }), col: PAL.sand };
    const inn = supplyIn(pubs, p, id);
    if (inn > 1) return { text: t('zásoby ×{m}', { m: String(Math.round(inn * 100) / 100).replace('.', ',') }), col: PAL.mint };
    // „chybí N milníků“ až když se styl blíží (aspoň jedna stanice má milník)
    if (Math.max(...STATIONS.map((d) => milestoneCount(p.st[d.id]?.lvl ?? 0))) < 1) return null;
    const k = styleGap(p, id);
    return { text: k === 1 ? t('{s}: chybí 1 milník', { s: STYLES[id].name }) : k < 5 ? t('{s}: chybí {k} milníky', { s: STYLES[id].name, k }) : t('{s}: chybí {k} milníků', { s: STYLES[id].name, k }), col: PAL.fog };
  }

  /** hvězdička (5 cípů) s tmavým stínem */
  private starShape(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, c: number) {
    const pts = Array.from({ length: 10 }, (_, k) => {
      const rr = k % 2 ? r * 0.45 : r, a = -Math.PI / 2 + (k * Math.PI) / 5;
      return { x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr };
    });
    g.fillStyle(col('ink')).fillPoints(pts.map((q) => ({ x: q.x + 1.5, y: q.y + 1.5 })), true);
    g.fillStyle(c).fillPoints(pts, true);
  }

  /** spodní okraj cedule stylu (0 = není vidět) – truhla jde pod ni */
  signBot = 0;
  /** levý okraj cedule stylu (truhla jde vlevo vedle ní) */
  signLeft = 0;
  styleSign?: { g: Phaser.GameObjects.Graphics; a: Phaser.GameObjects.Text; b: Phaser.GameObjects.Text };
  /** cedule stylu nahoře v hospodě (název stylu, výhoda, bonus za různé styly) */
  /** do první hygieny klidnější obrazovka: nejvýš jedna červená tečka */
  private calmDots() {
    return this.d.stats.prestiges === 0;
  }

  private drawStyleSign() {
    const p = this.d.pubs[this.views.length > 1 ? this.sel : 0];
    if (!this.styleSign) this.styleSign = { g: this.add.graphics().setDepth(58), a: this.add.text(W / 2, 0, '', txt(24, PAL.gold)).setOrigin(0.5, 0).setDepth(59), b: this.add.text(W / 2, 0, '', txt(15, PAL.bone)).setOrigin(0.5, 0).setDepth(59) };
    const { g, a, b } = this.styleSign;
    const all = p && !this.night ? pubStyles(p) : [];
    const sty = all[0] ?? null;
    g.clear();
    a.setVisible(!!sty);
    b.setVisible(!!sty);
    const bot = (v: number, l = 0) => {
      if (v === this.signBot && l === this.signLeft) return;
      this.signBot = v;
      this.signLeft = l;
      this.chestHudDraw();
    };
    if (!sty) return bot(0);
    const n = styleCount(this.d.pubs);
    // vpravo v rohu (přání uživatele – uprostřed zavazela), truhla až pod ní
    const y = TOP + (this.views.length > 1 ? TABH : 0) + 8 + this.qOff();
    // víc stylů v jedné hospodě (styl se při předběhnutí neztrácí): názvy za sebou, výhody pod sebou
    a.setText(all.map((id) => STYLES[id].name.toUpperCase()).join(' + ')).setY(y + 2);
    a.setScale(Math.min(1, (W - 40) / a.width));
    b.setText((UI_LEAN >= 2 ? '' : all.map((id) => STYLES[id].perk).join('\n') + (n > 1 ? '\n' : '')) + (n > 1 ? t('{n} styly: +{v} % všude', { n, v: Math.round(STYLE_MIX * (n - 1) * 100) }) : '')).setY(y + 30).setColor(PAL.bone).setAlign('center');
    const w = Math.max(a.displayWidth, b.width) + 24, h = b.text ? 30 + b.height + 6 : 34;
    const cx = W - 8 - w / 2;
    a.setX(cx);
    b.setX(cx);
    g.fillStyle(col('olive')).fillRect(cx - w / 2 + 14, y - 8, 4, 10).fillRect(cx + w / 2 - 18, y - 8, 4, 10);
    g.fillStyle(col('ink')).fillRoundedRect(cx - w / 2, y, w, h, 8);
    g.fillStyle(col('rust')).fillRoundedRect(cx - w / 2 + 3, y + 2, w - 6, h - 4, 6);
    bot(y + h, cx - w / 2);
  }

  private refresh() {
    const total = this.d.pubs.reduce((a, p) => a + this.rate(p), 0);
    this.coinsText.setText(`${big(this.d.coins)} coins`);
    // horní lišta (návrh B): coins až k poli s diamanty
    const right = (this.gemLeft || W) - 12;
    this.coinsText.setScale(Math.min(1, (right - this.coinsText.x) / this.coinsText.width));
    this.rateText.setText(this.night ? t('+{n} kostí / s', { n: this.bonesPerSec() < 1 ? this.bonesPerSec().toFixed(2) : big(this.bonesPerSec()) }) : t('+{n} / s', { n: big(total) }));
    this.rateText.setColor(this.night ? PAL.ice : PAL.mint).setScale(Math.min(1, 200 / this.rateText.width));
    // den / noc a kosti malým písmem za příjmem – až od první noci (předtím nic neznamenají); sezónní bonus vždy
    const dayOn = !!this.d.nightInfo || this.night;
    const left = Math.ceil(((this.d.tut ?? -1) >= 0 ? DAY_MS : phaseLeft()) / 1000);
    const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    const info = [dayOn ? `${this.night ? t('Noc') : t('Den')} ${clock}  ·  ${t('kosti: {n}', { n: big(this.d.bones ?? 0) })}` : '', season ? `${SEASONS[season].name} +${SEASON_BONUS * 100} %` : ''].filter(Boolean).join('  ·  ');
    this.infoText.setText(info).setX(this.rateText.x + this.rateText.displayWidth + 14);
    this.infoText.setColor(this.night ? PAL.ice : PAL.fog).setScale(1);
    this.infoText.setScale(Math.min(1, (right - this.infoText.x) / Math.max(1, this.infoText.width))).setVisible(!!info && this.infoText.scale > 0.45);
    this.skillBtns.forEach((_, i) => this.drawSkill(i));
    this.stripRates.forEach((r, i) => r.setText(t('+{n} / s', { n: big(this.rate(this.d.pubs[i])) })));

    // tečka u Menu jen za části v mřížce (Obchod a Úkoly mají vlastní tečku v liště)
    const cheap = ['brew', 'keeper', 'special', 'darts', 'temple'].some((id) => this.tabAlert(id) && !this.tileLock(id));
    this.shopDot.clear();
    // spodní lišta: aktivní položka zlatě, tečka u Úkolů, když je co vybrat
    if (this.navDots) {
      const act = !this.shopObjs.length ? 0 : this.tab === 'tasks' ? 2 : this.tab === 'shop' && this.shopSub === 'up' ? 1 : 3;
      this.navBtns.forEach((b, i) => b.label.setColor(i === act ? PAL.gold : PAL.bone));
      // tečky v liště (hlášení: chybělo upozornění na vylepšení a úkol): Obchod = jde koupit vylepšení, Úkoly = je co vybrat
      this.navDots.clear();
      const dot = (nb: Btn) => this.navDots!.fillStyle(col('ink')).fillCircle(nb.x + nb.w / 2 + 26, nb.y + 14, 11).fillStyle(col('scarlet')).fillCircle(nb.x + nb.w / 2 + 26, nb.y + 14, 8);
      // výpočet nejvýš 2× za sekundu (refresh běží často – telefon se nemá hřát)
      const now = Date.now();
      if (now - this.navDotAt > 500) {
        this.navDotAt = now;
        this.navDotOn = [(this.d.tut ?? -1) < 0 && this.tabAlert('shop'), this.tabAlert('tasks')];
        // Zkušebna U1: do první hygieny svítí nejvýš jedna tečka naráz (pořadí Úkoly → truhla → Obchod)
        if (this.calmDots()) {
          if (this.navDotOn[1]) this.navDotOn[0] = false;
          else if (chestReady(this.d.chest)) this.navDotOn[0] = false;
        }
      }
      if (this.navDotOn[0]) dot(this.navBtns[1]);
      if (this.navDotOn[1]) dot(this.navBtns[2]);
    }
    if (cheap) this.shopDot.fillStyle(col('ink')).fillCircle(this.shopBtn.x + this.shopBtn.w / 2 + 26, this.shopBtn.y + 14, 11).fillStyle(col('scarlet')).fillCircle(this.shopBtn.x + this.shopBtn.w / 2 + 26, this.shopBtn.y + 14, 8);
    for (const r of this.shopRows) this.drawBtn(r.b, big(r.o.cost), this.d.coins >= r.o.cost, 'green');
    for (const r of this.decorRows) this.drawBtn(r.b, big(r.cost), this.d.coins >= r.cost, 'amber');

    // velikost písma měnit jen při změně (setFontSize text pokaždé znovu vykreslí)
    const fs = (o: Phaser.GameObjects.Text, n: number) => o.style.fontSize !== `${n}px` && o.setFontSize(n);
    for (const c of this.cards) {
      const L = c.narrow ? PubScene.TLN : PubScene.TL;
      const p = this.d.pubs[c.pub];
      const s = this.st(p, c.def.id);
      const open = s.lvl > 0;
      const { n, price } = this.offer(p, c.def);
      const staff = c.def.staff * actMult(p.act) * (1 - this.ts().staff);
      const { x, y, w } = c;
      c.icon.setAlpha(open ? 1 : 0.45);
      c.name.setText(STATION_NAMES[p.act][c.def.id]).setAlpha(open ? 1 : 0.55);
      c.lvl.setText(open ? (UI_LEAN >= 3 ? t('úr. {n}', { n: s.lvl }) : t('úroveň {n}', { n: s.lvl })) : t('zavřeno'));
      c.lvl.setScale(Math.min(1, (w - 74 - (c.narrow ? PubScene.NBTN + 20 : 0)) / Math.max(1, c.lvl.width)));
      c.info.setText('');
      const sl = STAFF_LABEL[c.def.id];
      // plný bar / čekající talíře: místo prázdného místa tlačítko, které číšníkům pomůže (najme dalšího / otevře body)
      const jam = !this.night && s.auto && ((c.def.id === 'kitchen' && this.served(p) && (p.dish?.n ?? 0) + 1 > FOOD_CAP) || (c.def.id === 'tap' && !!p.w?.length && (p.bar?.n ?? 0) + this.beers(p) > BAR_CAP));
      if (jam) c.jamAt = Date.now();
      // Zkušebna U2: když nestíhají u Pípy i v Kuchyni, varování a tlačítko jen na Pípě (dřív dvě stejná tlačítka „Číšník +1“)
      const tapJam = c.def.id !== 'tap' && this.cards.some((k) => k.pub === c.pub && k.def.id === 'tap' && Date.now() - (k.jamAt ?? 0) < 5000);
      let fix = Date.now() - (c.jamAt ?? 0) < 5000 && !tapJam ? this.waiterFix(c.pub) : null;
      // Zkušebna H1 (5. běh): v prvním kole varování a tlačítko „Číšník +1“ až když má hráč aspoň polovinu ceny (dřív hned po návodu se 4 coins)
      if (fix && this.d.stats.prestiges === 0 && !fix.ok && this.d.coins < this.wHirePrice(p) / 2) fix = null;
      const half = (open && !s.auto) || !!fix;
      // tlačítko +1: přes celou šíři dlaždice, bez obsluhy vpravo vedle tlačítka obsluhy (to je vlevo)
      const full = c.narrow ? PubScene.NBTN : w - 20, hw = (full - 8) / 2, bx0 = c.narrow ? x + w - 10 - full : x + 10;
      if (c.buy.w !== (half ? hw : full)) {
        c.buy.x = half ? bx0 + hw + 8 : bx0;
        c.buy.w = half ? hw : full;
        c.buy.zone.setPosition(c.buy.x, c.buy.y).setSize(c.buy.w, c.buy.h);
        c.buy.label.setX(c.buy.x + c.buy.w / 2);
      }
      fs(c.buy.label, half ? 22 : c.narrow ? 24 : 30);
      // přes celou šíři na jeden řádek („+1 · 1.8K“, „Otevřít · 60“), v půlce na dva
      const one = (s2: string) => (half ? s2 : s2.replace('\n', ' · '));
      this.drawBtn(c.buy, open ? one(`+${n}\n${big(price)}`) : one(t('Otevřít\n{n}', { n: big(price) })), this.d.coins >= price && !this.tutHold(c.def), 'green');
      if (fix) this.drawBtn(c.staff, fix.label, fix.ok, 'amber', half);
      else this.drawBtn(c.staff, `${sl[0]}\n${big(staff)}`, this.d.coins >= staff, 'plum', half);
      // pípa s číšníky: plný bar = číšníci nestíhají
      // Zkušebna H2 (3. běh): varování jen když s tím jde něco udělat (tlačítko vedle) – bez akce svítilo do konce hry
      if (fix && c.def.id === 'kitchen' && s.auto && !this.night && this.served(p) && (p.dish?.n ?? 0) + 1 > FOOD_CAP) c.info.setText(t('talíře čekají – číšníci nestíhají!')).setColor(PAL.sand);
      else if (fix && c.def.id === 'tap' && s.auto && !this.night && p.w?.length && (p.bar?.n ?? 0) + this.beers(p) > BAR_CAP) c.info.setText(t('bar plný – číšníci nestíhají!')).setColor(PAL.sand);
      else if (open) {
        // Zkušebna 26. 11.: karta říká, co nákup přidá (+X/s) a kolik úrovní chybí do dalšího ×2
        const key = `${s.lvl}|${n}|${s.auto ? 1 : 0}|${Math.round(this.rate(p))}`;
        if (c.infoKey !== key) {
          c.infoKey = key;
          let gain = 0;
          const r0 = this.rate(p);
          if (s.auto && n > 0) {
            s.lvl += n;
            gain = this.rate(p) - r0;
            s.lvl -= n;
          }
          const nm = nextMilestone(s.lvl), left = nm == null ? 0 : nm - s.lvl;
          const ms = left > 0 && left <= 25 ? t('×2 za {n} úr.', { n: left }) : '';
          // Zkušebna (H2): bez obsluhy karta říká, co obsluha přinese (stanice pak jede sama)
          let hire = 0;
          if (!s.auto) {
            s.auto = true;
            hire = this.rate(p) - r0;
            s.auto = false;
          }
          c.infoTxt = hire > 0 ? t('s obsluhou +{v}/s', { v: big(hire) })
            : gain > 0 ? [t('+{v}/s', { v: big(gain) }), ms].filter(Boolean).join(' · ') : ms;
        }
        const hi = (c.hiUntil ?? 0) > this.time.now;
        c.info.setText((hi && c.hiText) || (c.infoTxt ?? '')).setColor(hi ? PAL.mint : PAL.white);
      } else c.info.setColor(PAL.white);
      c.bar.clear();
      // mistrovství (návrh 2): za úrovní název hodnosti, pod tím 10 teček stupňů v barvě hodnosti
      const ms2 = open ? this.mast(c.def.id) : 0;
      if (ms2 > 0) {
        const { rank, step } = mastRank(ms2), rc = col(RANK_COLORS[rank]);
        c.lvl.setScale(1);
        const lw = Math.min(c.lvl.width, 96);
        c.lvl.setScale(lw / Math.max(1, c.lvl.width));
        c.bnum.setText(RANKS[rank]).setColor(PAL[RANK_COLORS[rank]]).setPosition(x + 64 + lw + 8, y + L.lvl).setScale(1);
        c.bnum.setScale(Math.min(1, (w - 64 - lw - 8 - 8) / Math.max(1, c.bnum.width)));
        const dx = x + 64, dy = y + L.dots;
        for (let k = 0; k < 10; k++) c.bar.fillStyle(col('ink')).fillCircle(dx + 5 + k * 11, dy, 5).fillStyle(k < step ? rc : 0x4a3f55).fillCircle(dx + 5 + k * 11, dy, 4);
        if (ms2 >= MAST_MAX) this.starShape(c.bar, dx + 122, dy, 6, col('gold'));
      } else c.bnum.setText('');
      const stars = starsOf(this.d.stars, p.act, c.def.id);
      // ×2 za reklamu (návrh B): kulatý odznak v pravém horním rohu dlaždice; běží → červený s odpočtem
      const adLeft = (p.adx?.[c.def.id] ?? 0) - Date.now();
      const adShow = open && !c.narrow && !this.night && (adLeft > 0 || this.canReward());
      // název se vejde vedle odznaku ×2
      c.name.setScale(1);
      c.name.setScale(Math.min(1, (w - 64 - 8 - (adShow ? 44 : 0) - (c.narrow ? PubScene.NBTN + 20 : 0)) / Math.max(1, c.name.width)));
      c.tag.setVisible(stars > 0);
      if (stars > 0) {
        // rámeček podle počtu hvězd: bronz, stříbro, zlato, diamant, purpur
        const pk = (['copper', 'bone', 'gold', 'sky', 'pink'] as const)[stars - 1], fc = col(pk);
        c.bar.lineStyle(4, fc).strokeRoundedRect(x + 2, y + 2, w - 4, c.h - 4, 11);
        // hvězdy jako odznak vlevo dole na obrázku stanice: hvězda a počet (na dlaždici je málo místa)
        const sx = x + 17, sy = y + L.dots + 1;
        this.starShape(c.bar, sx, sy, 10, fc);
        c.tag.setText(String(stars)).setColor(PAL[pk]).setPosition(sx + 12, sy + 1);
        fs(c.tag, 24);
      } else if (isStyle(p, c.def.id)) c.bar.lineStyle(3, col('gold')).strokeRoundedRect(x + 2, y + 2, w - 4, c.h - 4, 11);
      c.adG.clear().setVisible(adShow);
      c.adT.setVisible(adShow);
      if (adShow) c.adZ.setInteractive();
      else c.adZ.disableInteractive();
      if (adShow) {
        const ax = x + w - 25, ay = y + 25;
        c.adG.fillStyle(col('ink')).fillCircle(ax, ay, 19).fillStyle(adLeft > 0 ? col('red') : col('amber')).fillCircle(ax, ay, 16);
        c.adT.setPosition(ax, ay).setText(adLeft > 0 ? hms(adLeft).replace(/^0:/, '') : '×2');
        fs(c.adT, adLeft > 0 ? 15 : 20);
        c.adZ.setPosition(ax, ay);
      }
      const bx = c.narrow ? x + 64 : x + 10, bw = c.narrow ? w - 64 - PubScene.NBTN - 30 : w - 20, by = y + L.bar;
      c.bar.fillStyle(col('ink')).fillRoundedRect(bx, by, bw, L.barH, 6);
      if (open && s.prog > 0) c.bar.fillStyle(col(s.auto ? 'mint' : 'amber')).fillRoundedRect(bx, by, Math.max(12, bw * Math.min(1, s.prog)), L.barH, 6);
      if (open && !s.auto && s.prog === 0 && UI_LEAN >= 1 && (this.d.tut ?? -1) < 0) {
        // místo nápisu „ťukni sem!“ pulzuje zlatý obrys pruhu; když je na obsluhu, pruh říká, co přinese (Zkušebna H2)
        if (this.d.coins < staff) c.info.setText('');
        c.bar.lineStyle(3, col('gold'), 0.45 + 0.4 * Math.sin(this.time.now / 260)).strokeRoundedRect(bx - 2, by - 2, bw + 4, L.barH + 4, 7);
      } else if (open && !s.auto && s.prog === 0) {
        c.info.setText(t('ťukni sem!')).setColor(PAL.gold);
        fs(c.info, c.narrow ? 18 : 26);
      } else fs(c.info, 18);
      c.info.setScale(1);
      c.info.setScale(Math.min(1, (bw - 4) / Math.max(1, c.info.width)));
    }
    this.drawStyleSign();
    this.drawWaiterChips();
    // panel číšníka: nový bod za zkušenosti → překreslit
    // otevřené menu / obchod / noc → panel číšníka pryč (jinak prosvítal pod menu)
    if (this.wPanel.length && (this.shopObjs.length > 0 || this.night)) this.closeWaiter();
    if (this.wSel >= 0 && this.wPanel.length) {
      const w = this.d.pubs[this.wPub()]?.w?.[this.wSel];
      if (w && wEarned(w) !== this.wPanelPts) this.openWaiter(this.wPub(), this.wSel);
    }
  }
}
