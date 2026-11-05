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
