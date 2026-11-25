// Strom hostinského „Tři cechy“ (25. 11. 2026, výběr uživatele: návrh A, docs/navrh-strom-2.md).
// 3 cesty (Výčep / Sklep / Noc), každá věž o 8 patrech zdola nahoru:
//   řemeslo (5 úrovní, každá pod 1 %) → volba 1 ze 2 → řemeslo → volba → řemeslo → volba → řemeslo → vrchol (schopnost).
// Patro se otevře, když je v cestě utraceno aspoň GATE[patro] bodů a je koupené patro pod ním (u řemesla stačí 1. úroveň).
// Nad třemi vrcholy koruna „Legenda okresu“: v jednom patře každé cesty smíš mít obě volby.
// Body = úrovně hostinského + hvězdy stanic + mistrovství + věrnost hostů (PubScene.skillPoints).
import { t } from '../i18n';
import type { StatId } from './talisman';

export type StarId =
  | 'goldhand' | 'autotip' | 'happy2' | 'welcome' | 'tray' | 'vip2' | 'mgr2'
  | 'rush' | 'keep5' | 'brew50' | 'bigtank' | 'lottery' | 'pantry' | 'dynasty'
  | 'nighthunt' | 'daybones' | 'freeroll' | 'autoroll' | 'ev2' | 'talis2' | 'nightlord'
  | 'crown';

export type NodeKind = 'craft' | 'pick' | 'cap' | 'crown';

export interface TreeNode {
  id: string;
  /** cesta 0–2, koruna 3 */
  branch: number;
  /** patro 0–7 (koruna 8) */
  floor: number;
  kind: NodeKind;
  /** řemeslo: úroveň 1–5 */
  rank?: number;
  /** volba: 0 = vlevo („ťukám“), 1 = vpravo („samo“) */
  side?: number;
  cost: number;
  stat?: StatId;
  val?: number;
  star?: StarId;
}

export const TREE_BRANCHES = [t('Výčep'), t('Sklep'), t('Noc')];
export const TREE_COLORS = ['amber', 'copper', 'sky'] as const;
/** kolik bodů musí být v cestě utraceno, aby se patro otevřelo */
export const GATE = [0, 5, 15, 30, 50, 75, 100, 140];
export const CRAFT_RANKS = 5;
const RC = [2, 4, 7, 11]; // cena úrovně řemesla v patře 1 / 3 / 5 / 7
const CC = [8, 14, 22]; // cena volby v patře 2 / 4 / 6
const CAP = 60;
const CROWN = 40;

/** řemesla: [stat, hodnota za úroveň] (pod 1 %) */
const CRAFT: [StatId, number][][] = [
  [['income', 0.005], ['tips', 0.009], ['crit', 0.003], ['income', 0.005]],
  [['krigly', 0.008], ['cycle', 0.004], ['brew', 0.009], ['staff', 0.009]],
  [['bones', 0.009], ['nighttips', 0.009], ['events', 0.009], ['xp', 0.009]],
];
/** volby [vlevo „ťukám“, vpravo „samo“] po patrech 2, 4, 6 a vrchol */
const PICKS: [StarId, StarId][][] = [
  [['goldhand', 'autotip'], ['happy2', 'welcome'], ['tray', 'vip2']],
  [['rush', 'keep5'], ['brew50', 'bigtank'], ['lottery', 'pantry']],
  [['nighthunt', 'daybones'], ['freeroll', 'autoroll'], ['ev2', 'talis2']],
];
const CAPS: StarId[] = ['mgr2', 'dynasty', 'nightlord'];

export const STAR_TEXT: Record<StarId, [string, string]> = {
  goldhand: [t('Zlatá ruka'), t('ťuknutí na bublinu: 5 % šance na spropitné ×10')],
  autotip: [t('Spropitné samo'), t('každou minutu se sebere bublina sama')],
  happy2: [t('Dlouhá hodina'), t('schopnost manažera trvá 2× déle')],
  welcome: [t('Uvítací hodina'), t('po návratu do hry je schopnost manažera hned nabitá')],
  tray: [t('Plný podnos'), t('číšníci roznesou o 25 % víc')],
  vip2: [t('Slavná hospoda'), t('VIP host chodí 2× častěji')],
  mgr2: [t('Druhý manažer'), t('schopnost manažera jde pustit 2× za sebou')],
  rush: [t('Rozjezd'), t('prvních 90 s po hygieně výdělek ×5')],
  keep5: [t('Dobrá pověst'), t('po hygieně zůstane 5 % úrovní stanic')],
  brew50: [t('Druhý kotel'), t('pivovar vaří o 50 % rychleji')],
  bigtank: [t('Velký tank'), t('tank pivovaru pojme 2× víc piv')],
  lottery: [t('Sudová loterie'), t('každá hygiena dá 1–3 krígly navíc')],
  pantry: [t('Zásobárna'), t('kolo po hygieně začne s 2 % výdělku minulého kola')],
  dynasty: [t('Pivní dynastie'), t('po hygieně jsou stanice hned na 25. úrovni a manažer najatý')],
  nighthunt: [t('Noční lov'), t('ťuknutí na bublinu v noci dá 2× víc kostí')],
  daybones: [t('Kostěné spropitné'), t('bubliny dávají kosti i ve dne')],
  freeroll: [t('Kostka zdarma'), t('v Kostnici jeden hod denně zdarma')],
  autoroll: [t('Kostňák hraje sám'), t('Kostnice hodí kostkou sama (1× za 10 min)')],
  ev2: [t('Pověstné večery'), t('odměny z událostí ×2')],
  talis2: [t('Šťastná ruka'), t('talismany padají 2× častěji')],
  nightlord: [t('Pán noci'), t('když padne noc: Půlnoční hodina, kosti ×3 na 60 s')],
  crown: [t('Legenda okresu'), t('v jednom patře každé cesty smíš mít obě volby')],
};

/** schopnosti, které jsou jen stat (zbytek řeší hra zvlášť) */
const STAR_STAT: Partial<Record<StarId, [StatId, number]>> = {
  brew50: ['brew', 0.5],
  ev2: ['events', 1],
  talis2: ['luck', 1],
};

function build(): TreeNode[] {
  const out: TreeNode[] = [];
  for (let b = 0; b < 3; b++) {
    const k = 'vsn'[b];
    for (let c = 0; c < 4; c++) {
      const [stat, val] = CRAFT[b][c];
      for (let r = 1; r <= CRAFT_RANKS; r++) out.push({ id: `${k}r${c}_${r}`, branch: b, floor: 2 * c, kind: 'craft', rank: r, cost: RC[c], stat, val });
      if (c < 3)
        for (let s = 0; s < 2; s++) out.push({ id: `${k}c${c}${'ab'[s]}`, branch: b, floor: 2 * c + 1, kind: 'pick', side: s, cost: CC[c], star: PICKS[b][c][s] });
    }
    out.push({ id: `${k}cap`, branch: b, floor: 7, kind: 'cap', cost: CAP, star: CAPS[b] });
  }
  out.push({ id: 'crown', branch: 3, floor: 8, kind: 'crown', cost: CROWN, star: 'crown' });
  return out;
}

export const TREE: TreeNode[] = build();
export const TREE_BY_ID: Record<string, TreeNode> = Object.fromEntries(TREE.map((n) => [n.id, n]));

/** body utracené za koupené uzly (neznámá id = starý strom → 0) */
export const treeSpent = (own: string[] = []) => own.reduce((a, id) => a + (TREE_BY_ID[id]?.cost ?? 0), 0);
/** body utracené v jedné cestě */
export const branchSpent = (own: string[], b: number) => own.reduce((a, id) => a + (TREE_BY_ID[id]?.branch === b ? TREE_BY_ID[id].cost : 0), 0);
/** uzly jednoho patra */
export const floorNodes = (b: number, f: number) => TREE.filter((n) => n.branch === b && n.floor === f);
/** patro je koupené (řemeslo: aspoň 1. úroveň, volba: aspoň jedna) */
const floorDone = (own: string[], b: number, f: number) => floorNodes(b, f).some((n) => own.includes(n.id) && (n.kind !== 'craft' || n.rank === 1));
/** v cestě už jsou obě volby v jednom patře (koruna to dovolí jen jednou) */
const doubled = (own: string[], b: number) => [1, 3, 5].some((f) => floorNodes(b, f).every((n) => own.includes(n.id)));

/** proč uzel nejde koupit ('' = jde) */
export function treeWhy(n: TreeNode, own: string[]): '' | 'own' | 'below' | 'gate' | 'other' {
  if (own.includes(n.id)) return 'own';
  if (n.kind === 'crown') return TREE.every((x) => x.kind !== 'cap' || own.includes(x.id)) ? '' : 'below';
  if (n.kind === 'craft' && (n.rank ?? 1) > 1) return own.includes(`${'vsn'[n.branch]}r${n.floor / 2}_${(n.rank ?? 1) - 1}`) ? '' : 'below';
  if (n.floor > 0 && !floorDone(own, n.branch, n.floor - 1)) return 'below';
  if (branchSpent(own, n.branch) < GATE[n.floor]) return 'gate';
  if (n.kind === 'pick') {
    const other = floorNodes(n.branch, n.floor).find((x) => x.id !== n.id)!;
    if (own.includes(other.id) && !(own.includes('crown') && !doubled(own, n.branch))) return 'other';
  }
  return '';
}
/** jde koupit (bez ohledu na body) */
export const treeCan = (n: TreeNode, own: string[]) => treeWhy(n, own) === '';
/** má schopnost */
export const hasStar = (own: string[] | undefined, s: StarId) => !!own?.some((id) => TREE_BY_ID[id]?.star === s);

/** staty ze stromu; old = „Stará pověst“ (staty starého stromu) – platí vždy to větší z obou */
export function treeStats(own: string[] = [], into: Record<StatId, number>, old?: Partial<Record<StatId, number>>) {
  const s: Partial<Record<StatId, number>> = {};
  for (const id of own) {
    const n = TREE_BY_ID[id];
    if (!n) continue;
    if (n.stat) s[n.stat] = (s[n.stat] ?? 0) + (n.val ?? 0);
    const ss = n.star && STAR_STAT[n.star];
    if (ss) s[ss[0]] = (s[ss[0]] ?? 0) + ss[1];
  }
  for (const k of new Set([...Object.keys(s), ...Object.keys(old ?? {})]) as Set<StatId>) into[k] += Math.max(s[k] ?? 0, old?.[k] ?? 0);
  return into;
}

// ---------- starý strom (hospoda 63, 3 × 40 uzlů) – jen kvůli převodu uložení na „Starou pověst“ ----------
export function oldTreeStats(own: string[] = []): Partial<Record<StatId, number>> {
  const SMALL: [StatId, number][][] = [
    [['income', 0.006], ['tips', 0.009], ['gxp', 0.009], ['beer', 0.008], ['crit', 0.003], ['mgrcd', 0.005]],
    [['cycle', 0.004], ['offline', 0.1], ['brew', 0.008], ['krigly', 0.006], ['staff', 0.008], ['decor', 0.008]],
    [['bones', 0.009], ['events', 0.009], ['evfreq', 0.005], ['luck', 0.009], ['nighttips', 0.009], ['xp', 0.009]],
  ];
  const MID: [StatId, number][][] = [[['income', 0.025], ['tips', 0.03]], [['cycle', 0.02], ['krigly', 0.025]], [['bones', 0.03], ['events', 0.03]]];
  const STARS: Record<string, [StatId, number]> = { s6: ['offline', 4], s13: ['brew', 0.5], s27: ['krigly', 0.25], n20: ['events', 1], n27: ['luck', 1] };
  const map: Record<string, [StatId, number]> = { ...STARS };
  for (let b = 0; b < 3; b++) {
    const k = 'vsn'[b];
    let si = 0, mi = 0;
    for (let i = 0; i < 28; i++) {
      if (![6, 13, 20, 27].includes(i)) map[`${k}${i}`] = i % 5 === 4 ? MID[b][mi++ % 2] : SMALL[b][si++ % 6];
      if ([2, 8, 11, 16, 22, 25].includes(i)) for (let f = 1; f <= 2; f++) map[`${k}${i}f${f}`] = f === 2 ? MID[b][mi++ % 2] : SMALL[b][si++ % 6];
    }
  }
  const out: Partial<Record<StatId, number>> = {};
  for (const id of own) if (map[id]) out[map[id][0]] = (out[map[id][0]] ?? 0) + map[id][1];
  return out;
}

// ---------- body = úroveň hostinského: celkem XP na úroveň L = XP_A·(L−1)^XP_K ----------
export const XP_A = 2.6;
export const XP_K = 2.5;
/** celkové XP potřebné na úroveň lvl */
export const xpTotal = (lvl: number) => Math.ceil(XP_A * Math.max(0, lvl - 1) ** XP_K);
/** XP z této úrovně na další */
export const xpNeed = (lvl: number) => xpTotal(lvl + 1) - xpTotal(lvl);
/** stará křivka (do hospody 63) – kvůli převodu uložení */
export const oldXpNeed = (lvl: number) => Math.round(100 * 1.4 ** (lvl - 1));
/** úroveň a zbytek XP z celkového XP */
export function lvlFromTotal(total: number) {
  let l = Math.max(1, Math.floor((total / XP_A) ** (1 / XP_K)) + 1);
  while (l > 1 && xpTotal(l) > total) l--;
  while (xpTotal(l + 1) <= total) l++;
  return { lvl: l, xp: total - xpTotal(l) };
}
/** cena přerozdělení bodů (krígly) */
export const respecCost = (n: number) => 5 * (n + 1);
