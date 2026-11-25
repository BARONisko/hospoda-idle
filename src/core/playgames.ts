// Google Play Hry (Play Games Services v2) v mobilní aplikaci: online žebříčky a uložení hry v cloudu.
// Nativní část: android/app/src/main/java/cz/baronisko/pubidle/PlayGamesPlugin.java (vlastní plugin „PlayGames“).
// Přání uživatele (25. 11. 2026): „online žebříček udělej hned, tak samo cloud“.
//
// Žebříčky (ID z Play Console → GitHub Variables PG_LB_*):
//   krigle = krígly celkem (získané za celou hru, i utracené) – hlavní žebříček postupu
//   level  = úroveň hostinského
//   temple = Chrám: nejvíc chapadel za jedno kolo (Google Play sám ukazuje den / týden / vše)
//
// Cloud (Saved Games, jedno uložení „pubidle“):
//   – při startu se porovná uložení v telefonu a v cloudu podle „celkem vyděláno“ (za celou hru nikdy neklesá);
//   – v telefonu žádná hra není → cloud se načte sám; cloud je dál → hráč vybere (okno při startu);
//   – telefon je stejně nebo dál → nahrává se do cloudu (nejdřív po kontrole, pak každé 3 min a při odchodu ze hry);
//   – „Začít znovu“ v Nastavení přepíše i cloud (bez ptaní);
//   – dvě zařízení najednou: Google Play konflikt vyřeší podle většího postupu (progress = řád výdělku).
// Na webu nic (ladění: ?pg=1 = předstíraný Google Play, cloud v localStorage).
import { Capacitor, registerPlugin } from '@capacitor/core';
import { SAVE_KEY, replaceSave, addMirror } from './save';
import { t } from '../i18n';

export type Board = 'krigle' | 'level' | 'temple';
type R = { ok?: boolean; signedIn?: boolean; data?: string; at?: number; device?: string; err?: string };
interface PlayGamesApi {
  available(): Promise<{ available: boolean; lb?: string }>;
  status(): Promise<R>;
  signIn(): Promise<R>;
  submitScore(o: { board: Board; score: number }): Promise<R>;
  showBoards(o: { board?: Board }): Promise<R>;
  loadCloud(): Promise<R>;
  saveCloud(o: { data: string; desc: string; progress: number }): Promise<R>;
}

const fake = typeof location !== 'undefined' && new URLSearchParams(location.search).get('pg') === '1';

/** předstíraný Google Play pro ladění na webu (?pg=1) */
const FAKE: PlayGamesApi = {
  available: async () => ({ available: true, lb: 'krigle,level,temple' }),
  status: async () => ({ ok: true, signedIn: localStorage.getItem('pubidle_pg_fake_out') !== '1' }),
  signIn: async () => (localStorage.removeItem('pubidle_pg_fake_out'), { ok: true, signedIn: true }),
  submitScore: async (o) => (localStorage.setItem('pubidle_pg_fake_lb_' + o.board, String(o.score)), { ok: true }),
  showBoards: async (o) => (console.log('[pg] žebříček', o.board ?? 'vše'), (window as unknown as { pgShown?: string }).pgShown = o.board ?? 'all', { ok: true }),
  loadCloud: async () => {
    const v = localStorage.getItem('pubidle_pg_fake_cloud');
    const c = v ? JSON.parse(v) : null;
    return { ok: true, data: c?.data ?? '', at: c?.at ?? 0, device: 'Pixel' };
  },
  saveCloud: async (o) => (localStorage.setItem('pubidle_pg_fake_cloud', JSON.stringify({ data: o.data, at: Date.now(), desc: o.desc })), { ok: true }),
};

const api: PlayGamesApi | null = fake ? FAKE : Capacitor.isNativePlatform() ? registerPlugin<PlayGamesApi>('PlayGames') : null;

/** stav pro UI (Nastavení, Liga, Chrám) */
export const pg = {
  /** Play Hry jsou v této verzi aplikace nastavené (jinak se tlačítka nezobrazují) */
  available: false,
  signedIn: false,
  /** žebříčky, které mají ID */
  boards: [] as Board[],
  /** poslední úspěšné nahrání do cloudu (ms), 0 = zatím ne */
  savedAt: 0,
  /** cloud zkontrolovaný (teprve pak se do něj nahrává – nepřepsat lepší hru z jiného telefonu) */
  checked: false,
  /** hra se při startu načetla z cloudu (PubScene ukáže nápis) */
  restored: false,
};

/** progress pro Google Play: řád výdělku (×1e6), roste i u čísel nad 1e18 */
const progressOf = (earned: number) => Math.max(0, Math.floor(Math.log10(Math.max(1, earned) + 1) * 1e6));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = (raw: string | null | undefined): any => {
  try {
    const d = raw ? JSON.parse(raw) : null;
    return d && Array.isArray(d.pubs) && typeof d.coins === 'number' ? d : null;
  } catch {
    return null;
  }
};
const earnedOf = (d: { earned?: number } | null) => (d && Number.isFinite(d.earned) ? (d.earned as number) : 0);
const withTimeout = <T>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

let lastUp = 0, upBusy = false, lastRaw = '';
const sent: Partial<Record<Board, number>> = {};
const MAXS: Record<Board, number> = { krigle: 10_000_000, level: 100_000, temple: 999_999_999_999 };

/** Zavolat před startem hry (po initBackup). wiped = hráč dal „Začít znovu“ → cloud se přepíše bez ptaní. */
export async function initPlayGames(wiped = false): Promise<void> {
  if (!api) return;
  try {
    const a = await withTimeout(api.available(), 3000);
    if (!a?.available) return;
    pg.available = true;
    pg.boards = (a.lb ?? '').split(',').filter(Boolean) as Board[];
  } catch {
    return;
  }
  // nahrávání do cloudu: při každém uložení hry (throttle), hned při odchodu ze hry
  addMirror((raw, now) => {
    lastRaw = raw;
    const tm = Date.now();
    if (tm - lastUp < (now ? 30_000 : 180_000)) return;
    void upload(raw);
  });
  // přihlášení proběhne samo při startu aplikace; počkat na výsledek nejvýš pár sekund, pak hra běží dál
  const st = await withTimeout(api.status().catch(() => null), 6000);
  pg.signedIn = !!st?.signedIn;
  if (pg.signedIn) await check(wiped, 6000);
  else setTimeout(() => void later(wiped), 20_000);
}

/** kontrola cloudu později (přihlášení nebo síť při startu nestihly) */
async function later(wiped: boolean, tries = 0) {
  if (pg.checked || !api || tries > 6) return;
  const st = await api.status().catch(() => null);
  pg.signedIn = !!st?.signedIn;
  if (pg.signedIn) await check(wiped, 15_000);
  if (!pg.checked) setTimeout(() => void later(wiped, tries + 1), 120_000);
}

/** porovná telefon a cloud; vrátí po rozhodnutí (při startu nejvýš `ms` čekání na cloud) */
async function check(wiped: boolean, ms: number) {
  if (!api) return;
  const c = await withTimeout(api.loadCloud().catch(() => null), ms);
  if (!c?.ok) return void setTimeout(() => void later(wiped, 1), 120_000);
  let local: string | null = null;
  try {
    local = localStorage.getItem(SAVE_KEY);
  } catch {
    /* nic */
  }
  const cd = parse(c.data), ld = parse(local);
  pg.checked = true;
  if (cd && !wiped) {
    if (!ld) {
      // nový telefon / přeinstalace bez zálohy Androidu: hru vrátit bez ptaní
      replaceSave(c.data!);
      pg.restored = true;
      return;
    }
    if (earnedOf(cd) > earnedOf(ld) * 1.0001 + 1) {
      const take = await askCloud(cd, ld, c.at ?? 0, c.device ?? '');
      if (take) {
        // hra už běží (kontrola později) → zamknout ukládání a znovu načíst; při startu stačí pokračovat
        const running = !!(window as unknown as { game?: unknown }).game;
        replaceSave(c.data!, running);
        if (running) location.reload();
        pg.restored = true;
        return;
      }
    }
  }
  if (local) void upload(local);
}

/** nahraje uložení do cloudu (a spolu s ním čísla do žebříčků) */
async function upload(raw: string) {
  if (!api || !pg.checked || !pg.signedIn || upBusy) return;
  const d = parse(raw);
  if (!d) return;
  upBusy = true;
  lastUp = Date.now();
  try {
    const desc = t('Krígly {k} · hostinský úr. {l}', { k: Math.floor((d.krigle ?? 0) + (d.kSpent ?? 0)), l: d.klvl ?? 1 });
    const r = await api.saveCloud({ data: raw, desc, progress: progressOf(earnedOf(d)) });
    if (r?.ok) pg.savedAt = Date.now();
    scores(d);
  } catch {
    /* příště */
  } finally {
    upBusy = false;
  }
}

/** čísla do žebříčků (jen když se změnila) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scores(d: any) {
  submit('krigle', Math.floor((d.krigle ?? 0) + (d.kSpent ?? 0)));
  submit('level', d.klvl ?? 1);
}

/** jedno číslo do žebříčku (Chrám po každém kole: Google Play si nechá nejlepší za den / týden / vše) */
export function submit(board: Board, score: number) {
  if (!api || !pg.signedIn || !pg.boards.includes(board) || !(score > 0)) return;
  // strop skóre v Play Console (ochrana proti podvodům): krígly 10M, úroveň 100k, Chrám 999 999 999 999
  const s = Math.min(Math.floor(score), MAXS[board]);
  if (board !== 'temple' && sent[board] === s) return;
  sent[board] = s;
  void api.submitScore({ board, score: s }).catch(() => undefined);
}

/** okno žebříčků Google Play; nepřihlášený hráč se nejdřív přihlásí */
export async function showBoards(board?: Board): Promise<boolean> {
  if (!api || !pg.available) return false;
  if (!pg.signedIn && !(await signIn())) return false;
  if (lastRaw) scores(parse(lastRaw));
  const r = await api.showBoards(board && pg.boards.includes(board) ? { board } : {}).catch(() => null);
  return !!r?.ok;
}

/** ruční přihlášení (Nastavení); po přihlášení zkontroluje cloud */
export async function signIn(): Promise<boolean> {
  if (!api || !pg.available) return false;
  const r = await api.signIn().catch(() => null);
  pg.signedIn = !!r?.signedIn;
  if (pg.signedIn && !pg.checked) await check(false, 15_000);
  return pg.signedIn;
}

/** „Uložit teď“ v Nastavení */
export async function saveNow(): Promise<boolean> {
  if (!pg.signedIn && !(await signIn())) return false;
  if (!pg.checked) return false;
  let raw = lastRaw;
  try {
    raw = localStorage.getItem(SAVE_KEY) ?? raw;
  } catch {
    /* nic */
  }
  if (!raw) return false;
  lastUp = 0;
  await upload(raw);
  return Date.now() - pg.savedAt < 5000;
}

/** Okno „V cloudu je hra s větším postupem“ (DOM – funguje před startem hry i za běhu). true = načíst z cloudu. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function askCloud(cd: any, ld: any, at: number, device: string): Promise<boolean> {
  return new Promise((res) => {
    const k = (d: { krigle?: number; kSpent?: number }) => Math.floor((d.krigle ?? 0) + (d.kSpent ?? 0));
    const when = at ? new Date(at).toLocaleString(document.documentElement.lang || undefined, { dateStyle: 'short', timeStyle: 'short' }) : '';
    const wrap = document.createElement('div');
    wrap.id = 'pg-ask';
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Jersey 10",Handjet,Arial,sans-serif';
    const box = document.createElement('div');
    box.style.cssText = 'background:#3e3546;border:4px solid #f9c22b;border-radius:14px;max-width:420px;width:100%;padding:18px 16px;color:#f2e6c9;text-align:center';
    const h = document.createElement('div');
    h.style.cssText = 'font-size:30px;color:#f9c22b;margin-bottom:10px';
    h.textContent = t('Uložená hra v cloudu');
    const p = document.createElement('div');
    p.style.cssText = 'font-size:21px;line-height:1.25;margin-bottom:14px;white-space:pre-line';
    p.textContent = t('V Google Play je hra s větším postupem.\nCloud: {k1} krígel, hostinský úr. {l1}{w}\nTento telefon: {k2} krígel, hostinský úr. {l2}', {
      k1: k(cd),
      l1: cd.klvl ?? 1,
      k2: k(ld),
      l2: ld.klvl ?? 1,
      w: when ? '\n' + t('uloženo {t}', { t: when + (device ? ' · ' + device : '') }) : '',
    });
    const btn = (label: string, bg: string, v: boolean) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = `display:block;width:100%;min-height:52px;margin-top:10px;border:0;border-radius:10px;background:${bg};color:#2e222f;font:inherit;font-size:24px;cursor:pointer`;
      b.onclick = () => (wrap.remove(), res(v));
      return b;
    };
    const note = document.createElement('div');
    note.style.cssText = 'font-size:17px;color:#c7b08b;margin-top:10px';
    note.textContent = t('Hra, kterou nevybereš, se přepíše.');
    box.append(h, p, btn(t('Načíst z cloudu'), '#7ac25a', true), btn(t('Hrát tuto'), '#f2a03d', false), note);
    wrap.appendChild(box);
    document.body.appendChild(wrap);
  });
}
