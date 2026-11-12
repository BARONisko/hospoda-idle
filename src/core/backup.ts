// Mobilní aplikace: záloha uložené hry do úložiště, které Android sám zálohuje do Google účtu hráče (Android Auto Backup:
// SharedPreferences přes @capacitor/preferences). Po přeinstalaci nebo na novém telefonu se hra obnoví bez přihlašování.
// Uložení ve WebView (localStorage) Android zálohovat nemusí – proto zrcadlo. Na webu se nic neděje.
// Přání uživatele (hospoda 70): „záloha do cloudu, ta jednoduchá“.
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { setMirror, SAVE_KEY, WIPED_KEY } from './save';

const BK = 'pubidle_save';
let last = 0;

/** Zavolat před startem hry: obnoví hru ze zálohy (když v telefonu žádná není) a zapne zrcadlení. */
export async function initBackup(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    if (localStorage.getItem(WIPED_KEY)) {
      // hráč dal „Začít znovu“ → zálohu zahodit, ať se smazaná hra nevrátí
      await Preferences.remove({ key: BK });
      localStorage.removeItem(WIPED_KEY);
    } else if (!localStorage.getItem(SAVE_KEY)) {
      const { value } = await Preferences.get({ key: BK });
      const d = value ? JSON.parse(value) : null;
      if (d && Array.isArray(d.pubs) && typeof d.coins === 'number') localStorage.setItem(SAVE_KEY, value!);
    }
  } catch {
    /* bez zálohy nebo poškozená – hra začne jako dřív */
  }
  setMirror((raw, now) => {
    const t = Date.now();
    // stačí jednou za minutu a vždy při odchodu ze hry
    if (!now && t - last < 60_000) return;
    last = t;
    void Preferences.set({ key: BK, value: raw }).catch(() => undefined);
  });
}
