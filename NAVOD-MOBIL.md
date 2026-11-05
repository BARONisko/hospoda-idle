# Jak zapnout hraní na mobilu (GitHub Pages) – z telefonu přes prohlížeč

Stačí to udělat jednou. Pak se hra po každé změně nahraje sama.

## 1. Zapni GitHub Pages
1. V telefonu otevři v prohlížeči (Chrome / Safari) tuto adresu:
   **https://github.com/BARONisko/hospoda-idle/settings/pages**
2. Když to chce, přihlas se do GitHubu (účet BARONisko).
3. Na stránce „GitHub Pages“ najdi část **Build and deployment**.
4. U **Source** ťukni na rozbalovací nabídku (je tam „Deploy from a branch“ nebo „None“)
   a vyber **GitHub Actions**. Nic dalšího se neukládá – uloží se to samo.

## 2. Spusť nahrání hry znovu
1. Otevři adresu: **https://github.com/BARONisko/hospoda-idle/actions/workflows/pages.yml**
2. Ťukni na nejhornější běh (červený křížek ✗).
3. Vpravo nahoře ťukni na **Re-run jobs** (nebo „…“ → Re-run all jobs) a potvrď **Re-run jobs**.
4. Počkej 1–2 minuty, až se objeví zelená fajfka ✓.
   (Jinak stačí počkat na moji další změnu – nahraje se sama.)

## 3. Hraj
1. Otevři **https://baronisko.github.io/hospoda-idle/**
2. Přidej si hru na plochu:
   - **Android (Chrome):** menu ⋮ → **Přidat na plochu** / **Nainstalovat aplikaci**.
   - **iPhone (Safari):** tlačítko Sdílet □↑ → **Přidat na plochu**.
3. Spouštěj ikonou z plochy – hra jede přes celou obrazovku na výšku a po prvním načtení i bez internetu.

## Když něco nejde
- Na stránce Pages nevidíš „GitHub Actions“: přepni prohlížeč na **Verze pro počítač**
  (Chrome: ⋮ → Verze pro počítač, Safari: aA → Požádat o web pro počítač).
- Stránka hry hlásí 404: nahrání ještě neproběhlo (krok 2) nebo počkej pár minut.
- Hra se neaktualizovala: zavři ji a otevři znovu (nová verze se načte při dalším spuštění).
