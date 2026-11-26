# Zkušebna – kritéria zábavnosti pro P.U.B. Idle (lidská část, verze 1)

Hru tento list nehodnotí. Říká, co měřit a kde jsou prahy. Vzor je Zkušebna hry The Hole (`the-hole-vzor/`), přepsaná pro idle hru na mobilu v jedné ruce.

**Všechny prahy jsou zatím „odhad“.** Vycházejí z obecných vzorů žánru (první odměna do pár vteřin, hra hraje sama do pár minut, ceny rostou o 7–15 % za úroveň, prestiž první den, krátká sezení několikrát denně). Jsou to hypotézy. Posunou se po testu na 3–5 živých lidech.

Hodnocení každého kritéria: 2 = splněno (sloupec Dobře), 0 = selhání (sloupec Špatně), 1 = mezi. Bez záznamu = „neměřeno“, nikdy odhad.

Závazná čísla a kotvy známek jsou v `kriteria.json` (tenhle list je vysvětlení). Postup hodnotitele: `hodnotitel.md`. Test na lidech: `test-na-lidech.md`.

## Čím se idle hra na mobilu liší (a proč jsou prahy jinde než u The Hole)

- **Všechno je rychlejší.** První ťuknutí vydělá do 10 s, první nákup do minuty. V kopací hře to byly minuty.
- **Hlavní zlom je první automatizace.** Dokud hospoda nevydělává sama, je to klikačka. Proto má vlastní kritérium (S3).
- **Hráč hraje po kouskách.** Sezení trvá 2–5 minut, několikrát denně. Nuda se proto měří v desítkách vteřin až minutách, ne ve čtvrthodinách.
- **Návrat je odměna.** Co na hráče čeká po pauze (L2, L3) a co ho táhne zpátky (D2, H6), je důležitější než délka jednoho sezení.
- **Hygiena (prestiž) je největší rozhodnutí hry.** Musí přijít včas (P1), být cítit (P2) a hráč jí musí rozumět (P3).
- **Slabší hráč.** Neoptimalizuje, ťuká pomalu, půlku událostí nestihne. Nesmí se zaseknout (W1, W2).
- **Bot není člověk, a počítá se s tím.** Časy startu S1–S4 se přepočítají na člověka, který hru vidí poprvé (bot × 1,5 + čas na nalezení tlačítka). S5 (bezradnost) bot změřit neumí: když projde, je to „neměřeno“; když neprojde, je to jistá chyba.
- **Co se nestalo, je selhání.** Žádný nákup, žádná automatizace nebo žádná hygiena v záznamu, který na ně měl stačit = známka 0, ne „neměřeno“.
- **Tempo ze všech botů.** T1, T3–T5, L1, O1, O3, N1, N2, D3 se počítají ze všech záznamů a platí nejhorší. Tempo musí vydržet každý styl hraní.
- Co-op (skupina C ze vzoru) tu není. Hra je pro jednoho.

## Start (prvních 10–15 minut, nový hráč bez znalosti hry)

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| S1 | Čas do prvního ťuknutí, které vydělá | `first_tap_s`: od spuštění nové hry do prvního ťuknutí s coins | do 10 s | nad 30 s | odhad |
| S2 | Čas do prvního nákupu | `first_buy_s`: do první koupené úrovně nebo věci | do 40 s | nad 2 min | odhad |
| S3 | Čas do první automatizace | `first_staff_s`: do první obsluhy u stanice (hospoda vydělává sama) | do 4 min | nad 10 min | odhad |
| S4 | Konec návodu | `tutorial_done_s`: do cedule HOTOVO | 1,5–6 min | pod 30 s nebo nad 12 min | odhad |
| S5 | Nejdelší bezradnost | `longest_no_progress_s`: nejdelší úsek bez ťuknutí s výdělkem, nákupu a novinky v prvních 15 min; u bota jen selhání | do 15 s | nad 40 s | odhad |
| S6 | Stav v 10. minutě | `loop_ok_by_10min`: 1 bod za nákup, 1 bod za automatizaci | 2 | 0 | odhad (první sezení 5–10 min) |

## Tempo (první hodina a dál)

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| T1 | Nejdelší mezera mezi nákupy | `buy_gap_max_h1_s` v 1. hodině | do 3 min | nad 8 min | odhad |
| T1m | Běžná mezera mezi nákupy | `buy_gap_median_h1_s` v 1. hodině | 8–40 s | pod 3 s nebo nad 2 min | odhad |
| T2 | Nákup je cítit | hodnotitel: změna výdělku na časové ose + snímek před a po | +15 % u své stanice a je to vidět | pod +5 % a nic vidět | odhad |
| T3 | Růst cen | `price_growth`: medián poměru ceny další úrovně k předchozí | 1,07–1,15× | pod 1,04× nebo nad 1,25× | žánrový vzor |
| T4 | Nic na koupi | `longest_unaffordable_s`: nejdelší doba při otevřené hře, kdy hráč nemá na nic; nejhorší bot | do 4 min | nad 10 min | odhad |
| T5 | Hrbolatost | `jumps_per_30min`: kolikrát výdělek za sekundu vyskočí ×2 během 5 min | aspoň 2 za 30 min | žádný | žánrový vzor (milníky, nové stanice) |
| T6 | Počet nabídek naráz | `offers_max_30min`: nejvíc dostupných nákupů naráz v 1. půlhodině | 2–6 | 1 nebo nad 12 | odhad |

T1m má i dolní mez. Když hráč kupuje každé 2 vteřiny, nerozhoduje se, jen mačká. To je taky špatně.

## Smyčka a návrat

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| L1 | Růst výdělku | `income_growth_per_hour`: medián poměru výdělku za sekundu hodinu po hodině | aspoň 3× | pod 1,5× | žánrový vzor (růst násobením) |
| L2 | Hodnota návratu | `offline_return_value`: slabší hráč po pauze; coins, které čekají, děleno cenou nejlevnějšího užitečného nákupu | 5 a víc | pod 1 | odhad |
| L3 | Okno návratu | hodnotitel: snímek okna „Zatímco jsi byl pryč“ a první snímek po něm | částka, čas, strop, jedno tlačítko, hned je co koupit | okno chybí nebo neříká kolik | odhad |

L2 pod 1 znamená: hráč se vrátí a nekoupí si nic. To je nejhorší chvíle idle hry.

## Objevování

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| O1 | Nová věc | `new_thing_gap_max_s`: nejdelší mezera mezi událostmi `first:` v prvních 2 h | do 10 min | nad 25 min | odhad |
| O2 | Dávkování | `new_mechanics_per_5min_max`: nejvíc nových mechanik v jednom 5min okně v 1. půlhodině | nejvýš 2 | 4 a víc | žánrový vzor (postupné odhalování) |
| O3 | Překvapení | `surprise_gap_max_s`: nejdelší pauza mezi věcmi, které hráč nekoupil (událost, nový host, noc/den, splněný úkol) | do 4 min | nad 10 min | odhad |

## Nuda

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| N1 | Čistá rutina | `routine_max_s`: nejdelší úsek bez nákupu, novinky, události a úkolu | do 2,5 min | nad 6 min | odhad |
| N2 | Růst čekání | `grind_growth`: medián čekání na nákup v poslední třetině záznamu proti první | do 2× | nad 5× | odhad |

K tomu křivka zájmu po oknech 2 minut (`boredom.window_s`) a odhad, kdy by skončil netrpělivý (90 s rutiny), běžný (4 min) a trpělivý hráč (10 min). Váhy říkají, co rutinu rozbíjí: nová hospoda a hygiena nejvíc (4), první výskyt čehokoli, obsluha, odemčení a návrat (3), událost, noc, úkol, úspěch, úroveň hostinského, vylepšení (2), běžný nákup úrovně jen 1 – v idle hře je to sama rutina.

Zpomalení k idle hře patří. Je to signál „zavolej hygienu“. Proto je N2 mírnější než ve vzoru. Špatně je, když hra zpomalí a hygiena ještě není na dosah.

## Prestiž (hygiena)

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| P1 | Kdy přijde první hygiena | `first_prestige_min`: minuty hraní běžného bota | 15–45 min | pod 8 min nebo nad 90 min | odhad |
| P2 | Zrychlení po hygieně | `prestige_speedup`: kolikrát rychleji 2. běh dosáhne výdělku, který měl 1. běh při hygieně | aspoň 3× | pod 1,5× | odhad |
| P3 | Rozhodnutí je jasné | hodnotitel: snímek okna hygieny a snímky před ním | vidím, co ztratím, co zůstane, co získám a jestli je čas | nepoznám, co ztratím a co získám | odhad |

P1 má dolní mez. Hygiena v 5. minutě přijde dřív, než hráč ví, o co přichází. Bot žádnou hygienu nestihl = 0.

## Slabší hráč

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| W1 | Jak moc je pomalejší | `weak_vs_strong_prestige`: minuty slabšího hráče do první hygieny děleno běžným botem | do 2,5× | nad 5× | odhad |
| W2 | Nic na koupi | `weak_longest_unaffordable_s`: nejdelší doba při otevřené hře, kdy slabší hráč nemá na nic | do 3 min | nad 8 min | odhad |

Slabší hráč (nastavení v `kriteria.json` → `bot.weak`): 4 sezení denně po 3 minutách, ťuká pomalu, třetinu nákupů udělá špatně, polovinu událostí nestihne. W2 je přísnější než T4: jeho sezení trvá 3 minuty, a když v něm nic nekoupí, bylo k ničemu.

## Dlouhý cíl

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| D1 | Tři cíle | hodnotitel: na hlavní obrazovce je bez menu vidět krátký (co koupit), střední (úkol, milník, stanice) a dlouhý cíl (hygiena, další hospoda) | všechny tři na většině snímků | žádný | žánrový vzor |
| D2 | Háček na konci sezení | hodnotitel: poslední snímky sezení | je vidět, co doběhne nebo kolik přibude, když budu pryč | nic rozdělaného | odhad |
| D3 | Zásoba obsahu | `content_hours`: po kolika hodinách hraní přestanou chodit `first:` (mezera nad 30 min) | 10 h a víc | pod 4 h | odhad |
| D4 | Velký cíl | hodnotitel: záznam + PLAN.md | hráč v první hodině vidí, že je kam dojít, a cíl existuje | cíl není | žánrový vzor |

## Otázky pro hodnotitele (čte snímky, známka 0–2 s důkazem)

- H1 Poznám na první pohled, co se děje a kam ťuknout, a dosáhnu tam palcem?
- H2 Říká každá karta a tlačítko, co stojí a co dá?
- H3 Jdou čísla přečíst (coins, výdělek za sekundu, ceny)?
- H4 Je vidět humor a osobnost hospody, aniž bych hledal?
- H5 Je co sbírat a jsem zvědavý, co přijde?
- H6 Otevřel bych hru po zavření znovu? Kvůli čemu?

A dvě otázky navíc, které u idle hry rozhodují:

- U1 Není toho naráz moc (záložky, červené tečky, okna za sebou)?
- U2 Kolik textu musím číst? Zahraje si i hráč, který nečte?

Hra má hodně systémů (pivovar, kostnice, chrám, šipky, liga, hostinský, číšníci). U1 hlídá, aby přicházely po jednom a obrazovka zůstala čistá.

## Text na obrazovce

Petr nechce na hráče moc textu (25. 11. vybral variantu B: méně textu na hlavní obrazovce). Bot v každém vzorku po 5 s zapíše `words` (počet slov o 2 a více písmenech ve všech viditelných textech) a `menu` (je otevřené okno menu nebo obchodu). Čísla se nepočítají, názvy karet ano. Obrazovka je 405×720.

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| U2 | Kolik textu musím číst | hodnotitel: snímky hlavní obrazovky, oken a bublin | hraju podle ikon, čísel a šipky; věty do 8 slov; nic se neopakuje | věta nad 8 slov na hlavní obrazovce, odstavec v okně, text dvakrát | odhad |
| U3 | Slova na hlavní obrazovce | `words_main_median`: medián `words` ve vzorcích s `menu=false` | do 30 | nad 55 | odhad |
| U4 | Nejvíc slov na hlavní obrazovce | `words_main_max`: maximum ve vzorcích s `menu=false` | do 50 | nad 90 | odhad |
| U5 | Nejvíc slov v okně | `words_menu_max`: maximum ve vzorcích s `menu=true` | do 70 | nad 130 | odhad |

Méně textu není chyba. Hodnotitel nesmí navrhovat přidání popisků tam, kde je Petr schválně ubral (seznam je v `hodnotitel.md`).

## Obchod a placení

Zdravý stav: placená nabídka je lákavá a na jeden pohled výhodná, přijde ve správnou chvíli, ale hráč zdarma není nikdy zastaven ani otravován. Platí i pravidla Google Play. Každé kritérium má jinou práci:

- M1 = je obchod poctivý (cena, obsah, žádný omyl)?
- M2 = chci si to koupit (hodnota, správná chvíle)?
- M3 = tlačí na mě hra (odpočty, opakování, vina)?
- M4 = dojde hráč zdarma všude?
- M5, M6 = kdy a jak často vyskakují nabídky (značka `offer`).

| Kód | Kritérium | Jak měřit | Dobře | Špatně | Opora |
| --- | --- | --- | --- | --- | --- |
| M1 | Poctivý obchod | hodnotitel: snímky obchodu a `shots/*menu_special*` | u všeho cena v penězích, přesný obsah, jednou / opakovaně; koupě se neplete s nákupem za coins | chybí cena nebo obsah, náhodná odměna, koupě omylem | odhad + Google Play |
| M2 | Chci si to koupit | hodnotitel: `shots/*menu_special*` + `src/core/offers.ts`, `special.ts`, `billing.ts`, `docs/play-console.md` | nejvýš 4 položky a cena na jeden pohled, aspoň 2× hodnota proti diamantům, přišlo po zážitku | do 5 s nevím, co dostanu, nebo horší než běžný obchod | odhad |
| M3 | Nátlak | hodnotitel: snímky nabídek + značky `offer` na ose | nejvýš 1 okno za spuštění, každá nabídka 1× denně, skutečný odpočet jen v nabídce, neutrální odmítnutí | obnovovaný nebo krátký odpočet, opakování, zeď s nabídkou, vina, falešná sleva, schovaný křížek | odhad + Google Play |
| M4 | Hráč zdarma | hodnotitel: čísla botů (P1, T4, D3) + kód obchodu | bez placení a videí P1, T4, D3 aspoň 1; placené jen zrychluje nebo zdobí; video je volba | obsah jen za peníze, vnucená reklama, bot zdarma má 0 | odhad |
| M5 | První nabídka | `first_offer_min`: minuty hraní do první značky `offer` | 20–120 min | pod 10 min nebo nad 6 h | odhad |
| M6 | Nabídky za hodinu | `offer_popups_per_hour`: značky `offer` děleno hodinami hraní | nejvýš 1 | 3 a víc | odhad |

M5 má obě meze. Nabídka v 5. minutě je vlezlá. Žádná nabídka za 6 hodin je promarněná šance. Když nabídka v záznamu nepřišla vůbec, počítá se délka záznamu. Krátký záznam bez nabídky proto vyjde dobře, i když o ničem nevypovídá: čti poznámku u čísla.

Skutečný odpočet není nátlak: startovní balíček platí 48 hodin jednou a neobnoví se. Nátlak je odpočet, který se vrací, je krátký nebo běží na hlavní obrazovce.

## Co má Zkušebna dodat

1. Časová osa každého bota v JSON: čas, coins, výdělek za sekundu, značky (`buy`, `staff`, `unlock`, `upgrade`, `pub`, `prestige`, `quest`, `ach`, `level`, `tab`, `guest`, `event`, `night`, `day`, `offline`, `offer`, `first:*`), u nákupu cena a kolik nákupů je dostupných. V každém vzorku po 5 s navíc `words` a `menu`.
2. Boti: nováček (jde podle návodu), běžný (první hygiena, 2. běh), slabší hráč (sezení a pauzy), zrychlení boti na hodiny.
3. Z toho automaticky 29 čísel: S1–S6, T1, T1m, T3–T6, L1, L2, O1–O3, N1, N2, P1, P2, W1, W2, D3, M5, M6, U3–U5. Hodnotitel podle kotev: T2, L3, P3, D1, D2, D4, H1–H6, M1–M4, U1, U2 (18 známek).
4. Snímky na výšku: každých 30 s v prvních 10 minutách, každý krok návodu, první nákup (před a po), první obsluha, každá událost, první noc, okno hygieny, první snímek po hygieně, okno návratu a snímek hned po něm, konec každého sezení slabšího hráče, každá záložka menu, obchod za drahokamy, obrazovka Speciální nabídka (`shots/*menu_special*`) a každé vyskakovací okno s nabídkou.
5. Simulace 30 min, 1 h, 2 h, „do první hygieny + 2. běh“ a „do vyčerpání novinek“.
6. Výstup: tabulka známek, rozdíl proti minulému běhu, nejhorších 10 kritérií s návrhem a odhadem práce.

## Pravidla

- Bot není člověk. Měří čas a tempo, ne zábavu. Prahy ověřit na 3–5 živých hráčích a podle nich posunout.
- Nekopírovat konkrétní hry, jen obecné žánrové vzory.
- Chyby (zamrznutí, tlačítko nereaguje) patří botům na chyby a `npm test`. Sem patří „není to zábavné nebo jasné“.
- Když váháš, nižší známka. Když chybí podklad, `null`.
