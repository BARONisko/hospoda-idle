# Pravidla pro Claude (hospoda-idle)

- Uživatel píše česky; odpovídej krátce česky. Commity česky.
- Hra: P.U.B. Idle – Pajzl Tycoon (idle hra pro mobil, na výšku). Plán a stav prací: PLAN.md.
- Původní hra P.U.B. je v repu `BARONisko/hospoda` – tu NEMĚNIT; odtud se jen kopíruje grafika (`src/gfx`, `src/data`).
- Kontroly: `npx tsc --noEmit`, `npm run build`, `npm test` (headless test), `npm run sim` (balanc); snímek na výšku `node tools/shot.mjs <url> <out.png>`
  (vite `npx vite --port 5177`, Chromium: /opt/pw-browsers/chromium-1243/chrome-linux64/chrome).
- Texty v t() (zdroj česky, překlady v src/i18n/locales/<jazyk>.json), měna „coins“.
- Před velkou vizuální změnou ≥ 3 návrhy na screenshotech. Hra je hlavně mobilní (dotyk, jedna ruka, na výšku).
- Hotové věci pushuj do `main` a piš uživateli číslo commitu.
- Když uživatel pošle něco důležitého a ty na to (zatím) neodpovíš nebo to nevyřešíš, zvýrazni to pod každou
  další odpovědí znovu (sekce „Čeká na tebe / nevyřešeno“), dokud to není vyřízené.

## Automatický handoff (přání uživatele)
Když kontext chatu přejde přes ~50 % (NE dřív), sám založ novou session (create_session) s názvem o jedna vyšším
(„hospoda 51“ → „hospoda 52“ …) a jako prompt jí předej předávku (cíl, stav větví v obou repech, rozhodnutí,
další kroky, „nezkoušet znovu“) včetně tohoto pravidla doslova. Předtím vše commitni a pushni.
Hospoda 6 při 50 % založí hospodu 7, hospoda 7 založí hospodu 8 a tak dál donekonečna.
