// Lokalizace: zdrojové texty jsou česky přímo v kódu, překlady jsou slovníky „český text → překlad“
// v src/i18n/locales/<jazyk>.json (klíč = přesně český text z volání t()). Chybí-li překlad, zůstane čeština.
// Jazyk se volí v nastavení a hra se pak znovu načte – texty v datech se překládají už při načtení modulů.
// Návod pro převod textů: src/i18n/README.md

export const LANGS = {
  cs: 'Čeština',
  en: 'English',
  zh: '简体中文',
  ru: 'Русский',
  es: 'Español',
  pt: 'Português (Brasil)',
  de: 'Deutsch',
  ja: '日本語',
  fr: 'Français',
  ko: '한국어',
  pl: 'Polski',
  tr: 'Türkçe',
} as const;
export type Lang = keyof typeof LANGS;

const LANG_KEY = 'pubidle_lang';

/** Plurálový tvar: buď jeden řetězec, nebo tvary podle Intl.PluralRules (one, few, many, other…). */
type Entry = string | Partial<Record<Intl.LDMLPluralRule, string>>;
type Dict = Record<string, Entry>;

// slovníky se načítají líně – stáhne se jen ten zvolený (top-level await: data se překládají až s ním)
const files = import.meta.glob<Dict>('./locales/*.json', { import: 'default' });

function detect(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && saved in LANGS) return saved;
  } catch {
    /* prohlížeč bez úložiště */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'cs').slice(0, 2).toLowerCase();
  return nav in LANGS ? (nav as Lang) : 'en';
}

export const lang: Lang = detect();
const dict: Dict = lang === 'cs' ? {} : ((await files[`./locales/${lang}.json`]?.().catch(() => undefined)) ?? {});
/** jazykový kód pro Intl (plurály, čísla) */
export const locale = lang === 'pt' ? 'pt-BR' : lang === 'zh' ? 'zh-CN' : lang;
const rules = new Intl.PluralRules(locale);

/** Uloží jazyk a znovu načte hru (texty v datech se překládají při načtení). */
export function setLang(l: Lang) {
  try {
    localStorage.setItem(LANG_KEY, l);
  } catch {
    /* nic */
  }
  location.reload();
}

const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s);

/** Přeloží český text. Proměnné se píšou jako {jméno}: t('Máš {n} coins', { n: 40 }). */
export function t(cs: string, vars?: Record<string, string | number>): string {
  if (lang === 'cs') return fill(cs, vars);
  const e = dict[cs];
  return fill(typeof e === 'string' && e ? e : cs, vars);
}

/** Tvar slova podle čísla: český klíč „one|few|many“, překlad jako objekt tvarů podle jazyka. */
export function plural(n: number, one: string, few: string, many: string): string {
  if (lang === 'cs') {
    const a = Math.abs(n);
    return a === 1 ? one : a >= 2 && a <= 4 ? few : many;
  }
  const e = dict[`${one}|${few}|${many}`];
  if (e && typeof e === 'object') return e[rules.select(n)] ?? e.other ?? e.one ?? many;
  if (typeof e === 'string' && e) return e;
  return Math.abs(n) === 1 ? one : many;
}

/** Čísla podle jazyka (oddělovač tisíců, desetinná čárka/tečka). */
export const fmt = (n: number, digits = 0) => n.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
