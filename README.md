# P.U.B. Idle – Pajzl Tycoon

Idle hra pro mobil ze světa hry P.U.B. – Pajzl u Berana (Pub of Unholy Brews).

**Hrát ze složky:** otevři `HRA/index.html` (dvojklik, bez internetu). **Na webu:** https://baronisko.github.io/hospoda-idle/ · **do složky (offline):**
[PUB-Idle.zip](https://baronisko.github.io/hospoda-idle/PUB-Idle.zip) – rozbalit a otevřít `PUB-Idle/index.html`.
(index.html v kořeni je zdrojový kód – z disku nepoběží; složku HRA aktualizuje GitHub po každé změně.)

```
npm install
npm run dev      # vývoj (http://localhost:5173)
npm run build    # sestavení do dist/
npm run build:offline  # hra do složky: dist/PUB-Idle.zip
```

Grafika je kreslená kódem (src/gfx, převzato z P.U.B.). Plán prací: PLAN.md.

## Hraní na mobilu
- **Web:** https://baronisko.github.io/hospoda-idle/ (nasazuje se samo při pushi do `main`,
  workflow `.github/workflows/pages.yml`; v repu musí být zapnuto Settings → Pages → Source: GitHub Actions).
  Na telefonu „Přidat na plochu“ → hra se spouští přes celou obrazovku a po prvním načtení jde i bez internetu (service worker).
- **Android aplikace (Capacitor):** na počítači s Android Studiem:
  ```
  npm install && npm run build
  npm i -D @capacitor/cli && npm i @capacitor/core @capacitor/android
  npx cap add android && npx cap sync android && npx cap open android
  ```
  Nastavení je v `capacitor.config.json`. Reklamy za odměnu: v `src/core/ads.ts` se přes `setAdProvider()`
  připojí reklamní síť (např. AdMob); bez ní se tlačítka „×2 za reklamu“ neukazují (ladění `?fakeads=1`).

## Licence
Všechna práva vyhrazena – viz [LICENSE](LICENSE).
