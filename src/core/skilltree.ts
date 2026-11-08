// Velký strom hostinského (skilly na rok): 3 cesty (Výčep / Sklep / Noc) po 40 uzlech = 120 uzlů.
// Každá cesta = hlavní stezka (28 uzlů zdola nahoru) + 6 odboček po 2 uzlech. Uzel jde koupit jen za už koupeným
// (rodičem). Malé uzly +0,3–0,9 % (přání: pod 1 %), každý 5. uzel stezky střední (+2–3 %), 4 hvězdné uzly na cestu mění hru.
// Body = úrovně hostinského (nová křivka XP – rok ≈ 200 bodů, celý strom ≈ 260 bodů → volba cesty).
import { t } from '../i18n';
import type { StatId } from './talisman';

export type StarId = 'tray' | 'autotip' | 'vip2' | 'happy2' | 'off4' | 'brew50' | 'keep5' | 'krigl25' | 'daybones' | 'autoroll' | 'ev2' | 'talis2';

export interface TreeNode {
  id: string;
  branch: number;
  /** pořadí na stezce (u odbočky pořadí jejího rodiče na stezce) */
  idx: number;
  /** odbočka: 0 = stezka, 1–2 = hloubka odbočky */
  side: number;
  /** strana odbočky (−1 vlevo, +1 vpravo) */
  dir: number;
  parent: string | null;
  cost: number;
  stat?: StatId;
  val?: number;
  star?: StarId;
}

export const TREE_BRANCHES = [t('Výčep'), t('Sklep'), t('Noc')];
export const TREE_COLORS = ['amber', 'copper', 'sky'] as const;

export const STAR_TEXT: Record<StarId, [string, string]> = {
  tray: [t('Plný podnos'), t('číšníci roznesou o 25 % víc')],
  autotip: [t('Spropitné samo'), t('každou minutu se sebere bublina sama')],
  vip2: [t('Slavná hospoda'), t('VIP host chodí 2× častěji')],
  happy2: [t('Dlouhá hodina'), t('schopnost manažera trvá 2× déle')],
  off4: [t('Noční hlídač'), t('offline výdělek +4 h')],
  brew50: [t('Druhý kotel'), t('pivovar vaří o 50 % rychleji')],
  keep5: [t('Dobrá pověst'), t('po hygieně zůstane 5 % úrovní stanic')],
  krigl25: [t('Hluboký sklep'), t('krígly z hygieny +25 %')],
  daybones: [t('Kostěné spropitné'), t('bubliny dávají kosti i ve dne')],
  autoroll: [t('Kostňák hraje sám'), t('Kostnice hodí kostkou sama (1× za 10 min)')],
  ev2: [t('Pověstné večery'), t('odměny z událostí ×2')],
  talis2: [t('Šťastná ruka'), t('talismany padají 2× častěji')],
};

/** hvězdy, které jsou jen stat (zbytek řeší hra zvlášť) */
const STAR_STAT: Partial<Record<StarId, [StatId, number]>> = {
  off4: ['offline', 4],
  brew50: ['brew', 0.5],
  krigl25: ['krigly', 0.25],
  ev2: ['events', 1],
  talis2: ['luck', 1],
};

const STARS: StarId[][] = [
  ['tray', 'autotip', 'vip2', 'happy2'],
  ['off4', 'brew50', 'keep5', 'krigl25'],
  ['daybones', 'autoroll', 'ev2', 'talis2'],
];
/** malé uzly (střídají se) a střední (každý 5. uzel stezky) */
const SMALL: [StatId, number][][] = [
  [['income', 0.006], ['tips', 0.009], ['gxp', 0.009], ['beer', 0.008], ['crit', 0.003], ['mgrcd', 0.005]],
  [['cycle', 0.004], ['offline', 0.1], ['brew', 0.008], ['krigly', 0.006], ['staff', 0.008], ['decor', 0.008]],
  [['bones', 0.009], ['events', 0.009], ['evfreq', 0.005], ['luck', 0.009], ['nighttips', 0.009], ['xp', 0.009]],
];
const MID: [StatId, number][][] = [
  [['income', 0.025], ['tips', 0.03]],
  [['cycle', 0.02], ['krigly', 0.025]],
  [['bones', 0.03], ['events', 0.03]],
];
const PATH = 28;
const STAR_AT = [6, 13, 20, 27];
const FORKS = [2, 8, 11, 16, 22, 25];

/** strana odbočky podle polohy stezky (pryč od okraje) */
export const pathX = (i: number) => Math.sin(i * 1.1);

function build(): TreeNode[] {
  const out: TreeNode[] = [];
  for (let b = 0; b < 3; b++) {
    const key = ['v', 's', 'n'][b];
    let si = 0, mi = 0;
    const small = () => SMALL[b][si++ % SMALL[b].length];
    for (let i = 0; i < PATH; i++) {
      // ceny ×2,5 (hospoda 63: body chodí i z hvězd stanic, mistrovství a věrnosti hostů)
      const cost = [2, 5, 8][Math.floor(i / 10)];
      const st = STAR_AT.indexOf(i);
      const n: TreeNode = { id: `${key}${i}`, branch: b, idx: i, side: 0, dir: 0, parent: i ? `${key}${i - 1}` : null, cost };
      if (st >= 0) (n.star = STARS[b][st]), (n.cost = cost + 6);
      else if (i % 5 === 4) [n.stat, n.val] = MID[b][mi++ % MID[b].length];
      else [n.stat, n.val] = small();
      out.push(n);
      if (FORKS.includes(i)) {
        const dir = pathX(i) > 0 ? 1 : -1; // ven od středu
        for (let k = 1; k <= 2; k++) {
          const f: TreeNode = { id: `${key}${i}f${k}`, branch: b, idx: i, side: k, dir, parent: k === 1 ? n.id : `${key}${i}f1`, cost };
          [f.stat, f.val] = k === 2 ? MID[b][mi++ % MID[b].length] : small();
          out.push(f);
        }
      }
    }
  }
  return out;
}

export const TREE: TreeNode[] = build();
export const TREE_BY_ID: Record<string, TreeNode> = Object.fromEntries(TREE.map((n) => [n.id, n]));

/** body utracené za koupené uzly */
export const treeSpent = (own: string[] = []) => own.reduce((a, id) => a + (TREE_BY_ID[id]?.cost ?? 0), 0);
/** jde koupit (rodič koupený a uzel ještě ne) */
export const treeCan = (n: TreeNode, own: string[]) => !own.includes(n.id) && (!n.parent || own.includes(n.parent));
/** má hvězdný uzel */
export const hasStar = (own: string[] | undefined, s: StarId) => !!own?.some((id) => TREE_BY_ID[id]?.star === s);

/** staty ze stromu */
export function treeStats(own: string[] = [], into: Record<StatId, number>) {
  for (const id of own) {
    const n = TREE_BY_ID[id];
    if (!n) continue;
    if (n.stat) into[n.stat] += n.val ?? 0;
    const ss = n.star && STAR_STAT[n.star];
    if (ss) into[ss[0]] += ss[1];
  }
  return into;
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
