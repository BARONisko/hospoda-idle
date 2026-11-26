# Zkušebna – kritéria zábavnosti (verze 3: průzkum žánru + lidský faktor)

Průzkum a zdůvodnění: https://claude.ai/artifact/8V4X2LYRpJHNs4tH519DMt
Hru tento list nehodnotí. Říká, co měřit a kde jsou prahy. Prahy s oporou „odhad“ jsou hypotézy k doladění na živých hráčích.

Hodnocení každého kritéria: 2 = splněno (sloupec Dobře), 0 = selhání (sloupec Špatně), 1 = mezi. Bez záznamu = „neměřeno“, nikdy odhad.

Závazná čísla a kotvy známek jsou v `kriteria.json` (tenhle list je vysvětlení). Postup hodnotitele: `hodnotitel.md`. Test na lidech: `test-na-lidech.md`.

## Co se změnilo ve verzi 3 (kontrola kostry, 26. 11.)

- **Bot není člověk, a počítá se s tím.** Časy startu (S1–S3) a délka smyčky (L2) se přepočítávají na odhad pro člověka, který hru vidí poprvé (bot ×1,6 + čas na nalezení váhy a obchodu). S4 (bezradnost) bot změřit neumí: když bot projde, je to „neměřeno“, když neprojde, je to jistá chyba. C2 (nehody) naopak: bot hraje opatrně, takže nula u bota nic neznamená.
- **Co se nestalo, je selhání.** Dřív: žádný nákup za půl hodiny = „neměřeno“. Teď: známka 0.
- **Nová skupina N – nuda.** N1 nejdelší úsek čisté rutiny (kopat, nosit, prodat a nic jiného): do 5 min dobře, nad 10 min špatně. N2 růst dřiny: kolikrát víc úderů stojí nákup na konci než na začátku (do 1,5× dobře, nad 3× špatně). K tomu křivka zájmu po 5 minutách a odhad, v které minutě by skončil netrpělivý, běžný a trpělivý hráč, se zařazením do tří vln nudy z průzkumu. Vše odhad, dokud to nepotvrdí lidé.
- **Tempo z dlouhých botů.** T1, T3–T5, L4, O1, O3, N1, N2, D3 se počítají ze všech záznamů (nováček i zrychlení boti) a platí nejhorší: tempo musí vydržet každý styl hraní.
- **L3 (mrtvý čas) se počítá samo** z chůze bota, O3 je nejdelší pauza mezi překvapeními (průměr schovával sucha), O2 nepočítá základní smyčku (kopnutí, prodej a nákup v prvních 5 minutách jsou správně), T4 je skutečná doba bez dostupného nákupu, T5 nepočítá každý prodej jako skok.
- **Hodnotitel má kotvy a kontrolu.** Každé hodnocené kritérium má popsáno, co je 0, 1 a 2. Známka bez důkazu, který v záznamu existuje, se zahodí; samé dvojky jsou podezřelé. Proto může lidskou půlku dlouhodobě dělat levnější model.
- **Snímky obsahují obrazovku hráče** (nápovědy, HUD, menu). Dřív na nich rozhraní chybělo, takže H1, H2 a D1 nešly poctivě hodnotit.

## Start (prvních 15 minut, nový hráč bez znalosti hry)

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| S1 | Čas do prvního kopnutí | od spuštění nové hry do prvního úderu do hlíny | do 30 s | nad 90 s | odhad |
| S2 | Čas do prvních peněz | do prvního prodeje na váze | do 3 min | nad 6 min | odhad (klikací hry uvádějí 60 s) |
| S3 | Čas do prvního nákupu | do první koupené věci | do 5 min | nad 10 min | zdroj: rozhodnutí do 5 min |
| S4 | Nejdelší bezradnost | nejdelší úsek bez pokroku (žádný úder, zisk, nákup, nový objekt) | do 20 s | nad 45 s | odhad |
| S5 | Stav ve 14. minutě | hráč prošel celou smyčku, má aspoň 1 nákup a vidí další cíl | vše tři | chybí smyčka nebo nákup | zdroj: medián dema 14 min |

## Tempo (první 3 hodiny)

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| T1 | Mezera mezi nákupy v 1. hodině | medián a maximum času mezi nákupy | medián 3–5 min, max do 8 min | max nad 12 min | zdroj: 3–5 min na fázi |
| T2 | Síla nákupu | o kolik nákup zvedne svou veličinu (rychlost, kapacita, výdělek) | nejméně +20 % nebo nová schopnost | pod +10 % | zdroj: rozdíl ×1,2 je znát |
| T3 | Růst cen | poměr ceny další úrovně k předchozí | 1,07–1,15× | pod 1,05× nebo nad 1,3× bez skoku výkonu | zdroj |
| T4 | Cena nejbližšího cíle | minuty aktivní hry na nejlevnější dostupný nákup | vždy do 10 min | někdy nad 20 min | odhad |
| T5 | Hrbolatost | počet skoků (výdělek za minutu ×2 a víc během 5 min) | aspoň 1 za 30 min | žádný za 60 min | zdroj: tempo má být hrbolaté |
| T6 | Počet nabídek naráz | kolik nákupů hráč vidí jako dostupné v prvních 30 min | 2–5 | nad 8 | zdroj: ukazovat 2–3 |

## Smyčka a odezva

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| L1 | Odezva na úder | zpoždění mezi úderem a obrazem, zvukem a změnou terénu | do 0,1 s, všechny tři | chybí zvuk nebo změna | odhad |
| L2 | Délka smyčky | kopat, nabrat, vynést, prodat; čas jedné otočky na začátku | 1–3 min | nad 5 min | odhad |
| L3 | Mrtvý čas | podíl chůze v prvních 15 minutách (vzdálenosti bota, cesta ×1,5 za schody a rohy) | do 35 % | nad 50 % | odhad |
| L4 | Růst výdělku | výdělek za minutu po 1., 2. a 3. hodině | každou hodinu aspoň 2× | roste méně než 1,3× | zdroj: růst násobením |

## Objevování

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| O1 | Nová věc | čas mezi prvními výskyty (mechanika, místo, předmět, event, vrstva) | do 10 min v 1. hodině, pak do 20 min | mezera nad 30 min | odhad |
| O2 | Dávkování | kolik nových mechanik přijde v jednom 5min okně v první půlhodině | nejvýš 1 | 3 a víc | zdroj: postupné odhalování |
| O3 | Překvapení | nejdelší pauza mezi událostmi, které hráč nespustil nákupem (event, nález, skrytá místnost) | do 15 min | nad 30 min | odhad |

## Nuda (z dlouhých záznamů)

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| N1 | Čistá rutina | nejdelší úsek bez nákupu, novinky, překvapení, úkolu nebo nové vrstvy | do 5 min | nad 10 min | odhad (zdroj: fáze 3–5 min) |
| N2 | Růst dřiny | údery na jeden nákup v poslední třetině záznamu proti první třetině | do 1,5× | nad 3× | odhad |

## Co-op (dva boti nebo záznam dvou hráčů)

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| C1 | Délka kola | čas jedné směny od začátku po uzavření | 15–30 min | nad 45 min | zdroj neověřený |
| C2 | Vtipné nehody | pády, odhození, zásahy mezi hráči bez trvalé ztráty | aspoň 1 za 10 min | žádná, nebo s trvalou ztrátou | zdroj: selhání má být vtipné |
| C3 | Hraní spolu | podíl času, kdy jsou hráči do 10 m od sebe nebo na sebe navazují | nad 40 % | pod 15 % | odhad |
| C4 | Okamžik na klip | 15s úsek, který je srozumitelný a vtipný bez vysvětlení | aspoň 1 za 10 min | žádný za 30 min | zdroj: 15s momenty |
| C5 | Připojení kamaráda | čas, než je nový hráč v rozehrané hře užitečný | do 2 min | potřebuje dohánět postup | zdroj: přijít a odejít |

## Dlouhý cíl

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| D1 | Tři cíle | na obrazovce je vidět krátký, střední a dlouhý cíl | všechny tři | žádný | zdroj |
| D2 | Háček na konci sezení | na konci směny je rozpracovaný cíl do 5 min od splnění | ano | ne | odhad |
| D3 | Zásoba obsahu | simulace: po kolika hodinách přestanou přicházet nové věci (O1 nad 30 min) | 6 h a víc | pod 3 h | odhad |
| D4 | Završení | existuje konec nebo velký cíl, ke kterému se dá dojít | ano | ne | zdroj: hra bez cíle selhává |

## Šest otázek pro hodnotitele (čte snímky a klipy, známka 0–2 s důkazem)

- H1 Poznám z každé obrazovky do 5 sekund, co mám udělat?
- H2 Říká každý stroj a předmět, co chce?
- H3 Je vidět humor a osobnost světa, aniž bych hledal?
- H4 Je kde si odpočinout a něco si zařídit po svém?
- H5 Mám otázku, na kterou chci znát odpověď (záhada)?
- H6 Chtěl bych po tomto záznamu hrát dál? Proč?

## Co má Zkušebna dodat

1. Časová osa událostí v JSON: čas, typ (úder, prodej, nákup, první výskyt věci, event, pád, konec směny), hloubka, peníze, výdělek za minutu.
2. Z ní spočítané S1–S5, T1, T3–T6, L2–L4, O1–O3, N1–N2, C1–C2, D3 automaticky (22 čísel); T2, L1, C3–C5, D1, D2, D4 a H1–H6 hodnotí model podle kotev.
3. Snímek každých 30 s v prvních 15 minutách a snímek každé obrazovky rozhraní.
4. Klipy 5–15 s: první úder, první prodej, první nákup, každý event a nález, každá nehoda v co-opu. (Zatím chybí: jsou jen snímky, proto L1 jen obraz a C4 neměřeno.)
5. Simulace 30 min, 1 h, 3 h a „do vyčerpání novinek“.
6. Výstup: tabulka známek, rozdíl proti minulému běhu, nejhorších 10 kritérií s návrhem a odhadem práce.

## Pravidla

- Bot není člověk. Měří čas a tempo, ne zábavu. Prahy ověřit na 3–5 živých hráčích a podle nich posunout.
- Nekopírovat konkrétní hry, jen obecné žánrové vzory.
- Chyby patří botům na chyby, sem patří „není to zábavné nebo jasné“.
