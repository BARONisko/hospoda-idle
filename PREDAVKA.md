# Předávka (nejnovější nahoře)

## hospoda 51 → 52
- Cíl: idle hra „P.U.B. Idle – Pajzl Tycoon“ pro mobil na výšku (repo BARONisko/hospoda-idle, větev main).
  Původní hra je v BARONisko/hospoda (větev claude/exciting-goodall-581wj6 = main) – tu NEMĚNIT, jen z ní kopírovat grafiku.
- Hotovo: část 1 (kostra, afd5f54) a část 2 (živé hospody, 1–3 hospody na obrazovce, panel stanic, spropitné,
  nákup ×1/×10/×100/MAX, pivo na stolech, zvuky – eb854cc). Uživatel: „libi se mi vzhled, pokracuj“.
- Rozložení schválené uživatelem: 1 hospoda = výhled nahoře + karty dole; po 1. prestiži 2 pruhy (Pajzl + sklepní krčma),
  po 2. prestiži 3 pruhy (+ Žabákův podnik), víc ne; všechny hospody žijí; „▲ Stanice“ vysune panel karet.
- Kód: src/core (economy, save v2 s pubs[], num, sfx), src/game/PubView.ts (živá hospoda, vlastní kamera, svět x ≥ 2000),
  src/scenes/PubScene.ts (UI, rozložení), src/scenes/MockScene.ts (staré návrhy ?mock=a|b|c – lze smazat).
- Další: část 3 Offline výdělek (okno „Zatímco jsi byl pryč…“, strop 8 h), pak 4 (milníky, obchod, manažeři), 5 (prestiž
  – zavření hygienou, přidá další hospodu do pruhů, krígly = trvalé bonusy). Viz PLAN.md.
- Videa „MIMO DEMO“ (P.U.B.) uživatel schválil („jo, je to ok“) – hotovo.
- Nástroje: vite `npx vite --port 5177` (run_in_background), snímek `node tools/shot.mjs <url> <out.png> [ms] [js]`.
  Po restartu kontejneru v hospoda-idle `npm install`. Push: `git fetch origin main:refs/remotes/origin/main && git rebase origin/main && git push origin main`.

## hospoda 52 → 53
- Hotovo v hospodě 52: část 3 offline výdělek (fea9938), část 4 milníky + obchod + manažeři (0160551, 7914d5c),
  část 5 prestiž/hygiena + krígly (540f6bc; aa55b8d jen vrací omyl), hraní na mobilu = GitHub Pages workflow
  `.github/workflows/pages.yml` + manifest/ikona (d725ed4). Adresa: https://baronisko.github.io/hospoda-idle/
  (uživatel musí jednou zapnout Settings → Pages → Source: GitHub Actions; pak znovu spustit workflow).
- POKYN UŽIVATELE: „udělej další části bez mého svolení až do konce“ → části 6–10 z PLAN.md dělej postupně bez ptaní
  (6 události s ťukáním, 7 sbírka/úkoly/úspěchy, 8 zvuk/hudba/jazyky cs+en, 9 mobil PWA/Capacitor/reklamy –
  reklamy jen jako příprava bez skutečné sítě, 10 balanc a testy). Každou hotovou část pushni a napiš číslo commitu.
- Ladění v URL: ?coins=N, ?away=<s>, ?pubs=2|3. Testovací skripty v tools/_tmp (Playwright, ťukání přes touchscreen).
- Nezkoušet znovu: nahrávat soubory přes GitHub API (push_files) – nahrál se placeholder; když git push padá
  („fatal error in commit_refs“), jen opakovat push v cyklu na pozadí (do pár minut projde).

## hospoda 52 → 53 (druhá, platná předávka – první „hospoda 53“ byla zrušena, uživatel chtěl pokračovat v 52)
- Hra běží na https://baronisko.github.io/hospoda-idle/ (repo je veřejné, LICENSE = všechna práva vyhrazena,
  Pages přes Actions, deploy po každém pushi do main). Návod pro uživatele: NAVOD-MOBIL.md.
- Hotovo v 52 navíc k plánu: návod pro nové hráče, obchod s krígly, Cthulhu (×10), 4. hospoda Chrám Cthulhu s posuvnými
  pruhy (rozložení C schváleno), objednávky hostů, vybavení podle úrovní, sezóny, 5 návštěvníků s volbou, výzdoba
  (8 drahých předmětů), rvačka (bez vyhazovače – hosté odcházejí, dokud hráč neťuká na rváče), pivovar (pomalý, prodat
  / vložit do vylepšení), den a noc (kosti), talismany (10, vzácné, vylepšení za kosti), hostinský na úrovni + strom
  dovedností, týdenní výzva, 20 statů + Kostnice (staty za kosti, src/core/talisman.ts OSSUARY), týdenní liga
  (src/core/league.ts, 5 lig, postup/sestup). Denní specialitu uživatel ZRUŠIL („k ničemu“) – nevracet.
- Kosti mají být vzácné a vylepšení drahá (přání uživatele) – BONE_RATE 0.0002, ossCost 400·1.8^lvl, talisCost 150·2.6^lvl.
- ROZPRACOVÁNO: 35 nových textů (staty, Kostnice, liga) chybí v překladech – seznam vygeneruj skriptem jako dřív
  (grep t('…') v src/scenes/PubScene.ts src/game src/core vs. en.json) a nech přeložit do 11 jazyků (subagent).
- Čeká na uživatele: soupeřova hospoda – navrženo 5 variant (souboj o hosty, sabotáž/poctivost, liga = HOTOVO,
  převzetí soupeře, souboj stanic); dojmy z hraní (tempo pivovaru, den/noc, talismany).
- Kontroly: `npx tsc --noEmit`, `npm run build`, `npm test` (headless test celé hry, běží ve dne ?night=0),
  `npm run sim`. Ladění v URL: ?coins=N ?away=s ?pubs=1-4 ?ev=gold|frogs|bat|banshee|brawl ?visit=0-4 ?season=…
  ?night=0|1 ?talis=1 ?fakeads=1. Snímky: tools/shot.mjs; pomocný JS pro vypnutí návodu: tools/_tmp/prep.js (lokální).
- Vite dev server po přidání nového locale souboru restartovat (import.meta.glob se načte při startu).
- Nezkoušet: nahrávat soubory přes GitHub API (push_files) – nahrál se placeholder. Při „fatal error in commit_refs“
  jen opakovat git push na pozadí.
