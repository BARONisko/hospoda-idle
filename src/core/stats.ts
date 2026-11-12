// Anonymní statistiky pro vývojáře (přání uživatele, hospoda 70): kde hráči končí (návod, první hygiena…) a kolik se jich vrací.
// Google Analytics 4 přes gtag.js – funguje na webu i v mobilní aplikaci (hra je webová stránka i tam).
// Zapne se až vyplněním měřicího ID (G-…): proměnná VITE_GA_ID při sestavení, nebo konstanta GA_ID níž.
// Bez ID se nic nenačítá ani neposílá. Hráč může statistiky vypnout v Nastavení (stats.set(false)).
// Neposílá se nic osobního: jen názvy událostí a čísla (krok návodu, počet hygien…); reklamní signály jsou vypnuté.
const GA_ID: string = (import.meta.env.VITE_GA_ID as string | undefined) ?? '';

type Params = Record<string, string | number | boolean>;
type W = Window & { dataLayer?: unknown[]; [k: `ga-disable-${string}`]: boolean | undefined };

let on = false;
let loaded = false;

function gtag(..._a: unknown[]) {
  // gtag vyžaduje objekt arguments (ne pole)
  // eslint-disable-next-line prefer-rest-params
  ((window as unknown as W).dataLayer ??= []).push(arguments);
}

function load(props: Params) {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
  gtag('js', new Date());
  gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false, user_properties: props });
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(s);
}

export const stats = {
  /** je měření nastavené? (jinak se přepínač v Nastavení neukáže) */
  get available() {
    return !!GA_ID;
  },
  get on() {
    return on;
  },
  /** zapne / vypne měření (vypnuté = nic se nenačte ani nepošle) */
  set(enabled: boolean, props: Params = {}) {
    on = enabled && !!GA_ID;
    if (typeof window === 'undefined' || !GA_ID) return;
    (window as unknown as W)[`ga-disable-${GA_ID}`] = !on;
    if (on) load(props);
  },
  /** událost (název jen malá písmena, číslice a podtržítko – pravidlo GA4) */
  track(name: string, params: Params = {}) {
    if (!on) return;
    try {
      gtag('event', name, params);
    } catch {
      /* statistiky nesmí hru nikdy shodit */
    }
  },
};
