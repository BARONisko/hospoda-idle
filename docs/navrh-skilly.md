# Skilly na rok – vybráno 2 + 3, vzhled B + štít 1 – HOTOVO (hospoda 63, viz PLAN.md)

## 2) Velký strom hostinského (náhrada dnešních 3×5 uzlů)
- Síť ~120 uzlů, 3 začátky (Výčep / Sklep / Noc), uzel jde koupit jen vedle už koupeného.
- Malé uzly: +0,5–0,9 % (přání uživatele: pod 1 %), střední +2–3 %, ~12 hvězdných uzlů mění hru:
  číšník nese 2 piva · bubliny dávají kosti i ve dne · kostky hází samy · hygiena vrátí 5 % úrovní ·
  VIP 2× častěji · noc o 20 % kratší · pivovar vaří 2 várky · spropitné se sbírá samo 1×/min · +1 číšník ·
  talisman navíc · události ×2 · offline +4 h.
- Body = úrovně hostinského. Nová křivka XP: rok ≈ 200 bodů (zpočátku ~5/den, pak ~1 za 2–3 dny);
  celý strom za rok NEjde → volba cesty. Přerozdělení bodů za krígly. Dosavadní skilly se převedou na body.
## 3) Mistrovství stanic (roste samo, i offline)
- Počítadla: načepovaná piva, talíře, sudy, hody kostkou (za všechny hospody, přežijí hygienu).
- Hodnosti Učeň → Tovaryš → Mistr → Velmistr → Legenda, každá 10 stupňů (50 stupňů na stanici).
- Stupeň: +0,8 % výdělku stanice; každá hodnost navíc odměna (rychlejší cyklus, nový vzhled stanice/pípy).
- Prahy rostou geometricky tak, aby Legenda u všech 4 stanic vyšla ~na rok (ověřit v tools/sim).
- Na kartě stanice malý odznak hodnosti; detail v Menu → Hostinský (záložka Mistrovství).
## Další kroky
1. ≥ 3 návrhy vzhledu stromu a odznaků na snímcích → uživatel vybere. 2. Simulace délky (rok). 3. Implementace + převod uložení + test.

## Hospoda 63: návrhy vzhledu a simulace (tools/sim/skills.mjs)
- Strom: docs/navrhy-skilly/strom-ABC.png – A mapa (síť kolem hostinského, posun prstem) · B tři cesty (záložky, stezka nahoru)
  · C deska (dlaždice 7 sloupců, kup vedle koupené). Dole vždy panel vybraného uzlu + KOUPIT.
- Odznaky: docs/navrhy-skilly/odznaky-123.png – 1 štít s číslem stupně · 2 deset teček + hodnost · 3 barevný okraj + „Mistr 4/10“.
- XP z aktivní hry ≈ 4 000 koupených úrovní/h (sim). Body: celkem XP na úroveň L = 2,6·L^2,5 →
  den 1/7/30/100/365: slabší 10/23/42/68/114 · běžný 18/41/73/118/199 · zapálený 31/69/124/201/338.
- Mistrovství: stupeň s potřebuje 2100·s^2,56 s obsluhy (součet hospod, i offline) → běžný Legenda 10 za rok,
  slabší Mistr 7, zapálený Legenda 10 dřív (~10 měsíců).
