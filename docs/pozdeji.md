# Návrhy na později

Nápady, které zatím nejsou ve hře. Petr je chce mít uložené na později (25. 11. 2026).
Zdroj: posudek pozdní hry a pomůcka „Výběr návrhů hospody“. Ceny a čísla jsou orientační, doladit simulací.

## Z posudku pozdní hry
- **B Automatická hygiena**: hygiena sama, když krígly dosáhnou cíle. Nevybráno.
- **D samostatně**: nevybráno jako samostatný bod.
- **Žebříček Chrámu**: pořadí hráčů podle nejvyššího kola nekonečného Chrámu VI+.
- **Sezónní pass**: řada odměn za sezónu (Vánoce, Dušičky, Pivní festival).
- **Profilovka hráče**: obrázek nebo rámeček hráče (v lize a ve Sbírce).

## Rekonstrukce: hvězdičky
- **★3 Nová událost „Svatba v hospodě“**: svatebčané tančí, ťukáš na ně a sbíráš dary.
- **★6 a dál**: každá další hvězdička přinese jeden sezónní kousek nábytku.
- Nevybrané vzhledy Pajzlu: **B prvorepubliková pivnice**, **C roubenka** (kresby už jsou v `src/gfx/rekoTiles.ts`).
- Nevybrané varianty umístění páté stanice (vybrána A, úzká karta pod mřížkou).

## Týdenní pravidla
- w03 **Týden rvaček**: rvačky častější, každá rozehnaná dá kosti a XP hostinskému.
- w06 **Karaoke týden**: Banshee karaoke častěji, odměna ×2.
- w07 **Zlatý týden**: zlaté sudy 2× častěji.
- w09 **Návštěvní týden**: zvláštní návštěvníci 2× častěji, občas vzácný návštěvník.
- w11 **Hygienický týden**: hygiena dá o 10 % víc krígel.
- w12 **Týden hlubin**: Chrám otevřený i ve středu.
- w13 **Talismanový týden**: talismany se nacházejí 2× častěji.

## Efekty systémů
- g01 **Šipkaři do Sbírky**: dohraná hra má šanci přivést vzácného šipkaře.
- g05 **Spokojený host**: na Úsměvu 10 občas host nechá 💎 (nejvýš 1 denně).
- g07 **Zlatá stanice**: hodnost Legenda změní vzhled stanice na zlatý.
- g09 **Požehnání dne**: hod kostkou dá náhodný efekt na 24 h.
- g11 **Schopnost na konci větve stromu**: automatická Šťastná hodina, sběrač zdarma nebo druhý manažer.
- g13 **Relikvie z Chrámu**: poražený boss zanechá ozdobu s jedním efektem.

## Druhá řada výzdoby
- i03 **Vycpaný medvěd** (1e20): rvačky trvají polovinu času.
- i05 **Hodiny s kostlivcem** (1e22): schopnost manažera se nabíjí o 20 % rychleji.
- i06 **Trůn hostinského** (1e24): XP hostinského za bubliny ×2.
- i08 **Pivní archiv** (1e28): tank pivovaru o 50 % větší.
- i09 **Socha Berana** (1e30): VIP host chodí o 1 h dřív.

## Drobnosti
- j05 **Rada u kostí**: na kartě Kosti řádek „Teď se nejvíc vyplatí: …“.
- j07 **Vzácní hosté do Sbírky**: 1 z 200 hostů zlatý nebo v kostýmu, 20 vzácných variant.

## Marketing – nápady na později (26. 11. 2026)
Plán vydání: https://claude.ai/artifact/4XroEodE739GNtNZSRrJaY. Tyhle body mají menší přínos, nechané na později.
- **Předregistrace v Google Play** s odměnou (např. 100 💎) – jen pro další hru nebo velkou novou verzi, teď by zdržela vydání.
- **Discord hráčů** – založit až při ~500 aktivních hráčích, do té doby stačí recenze a Reddit.
- **Tlačítko „Komunita“ v Nastavení** (Discord/Reddit) – až bude komunita.
- **Odměna za pozvání kamaráda** (kód ve hře, oba dostanou 💎).
- **Google Play Indie Games Festival / Accelerator** – hlídat termíny přihlášek.
- **Game Access (Brno)** a další herní akce – stánek nebo přednáška o sólo vývoji.
- **iOS verze** – rozšíření publika, ale Apple účet stojí 99 USD/rok a vyžaduje Mac.
- **Steam / itch.io verze pro PC** – idle hry se tam prodávají, ale chce úpravu na šířku.
- **Placené zmínky u větších youtuberů** – až když reklama ukáže, že se hráč zaplatí.
- **Lokalizované snímky obchodu** pro DE, PL, ES, PT-BR (texty na snímcích v jazyce země).
- **Křížová propagace** s jinými indie vývojáři idle her (výměna banneru ve hře).

## Zkušebna: automatická kontrola překryvů (27. 11. 2026, Petr – odloženo kvůli vydání)
- Každá cedule, okno, šipka a popisek porovnat s lištou úkolu, kríglem, truhlou, tlačítky a okraji obrazovky.
- Projet 3 velikosti displeje (úzký 360×640, běžný 405×720, dlouhý 412×915) a všech 11 jazyků (nejdelší de/ru/fr).
- Spustit i během běhu botů (každých N ťuků) a výsledek dát jako kritérium U6 „překryvy“.
- Podnět: cedule „Hygiena je připravená!“ nahoře překrývala lištu úkolu, krígl a truhlu a Zkušebna to nezachytila.
- **Hotovo 27. 11. v noci:** kontroly K6 (texty × 12 jazyků × 9 obrazovek) a K12 (72 cedulí nahoře i uprostřed proti liště úkolu, truhle a tlačítkům), 3 displeje K11. Zbývá: kontrola i během běhu botů (každých N ťuků) a okna/šipky, nejen cedule.

## Ekonomika: kosti v sezónním passu (27. 11. 2026, nález při kontrole odměn – čeká na Petra)
- Pass dává 300 + 40 × stupeň kostí (zlatá řada ×3), truhla 5–10 kostí, první sběrač stojí 500. Kosti se 25. 11. dělily stem, pass asi ne.
- Přepočet 27. 11. ráno: běžný hráč má 500–1 000 kostí za hodinu hraní (boti), truhla roste s nočním výdělkem → stupeň passu ≈ 1–2 h noci, přiměřené. Doporučení: nechat. Bez souhlasu neměnit.

## Nová ikona obchodu (28. 11. 2026, posudek Fable – čeká na Petrův výběr)
- Současná ikona (krígl + „P.U.B.“) je čitelná, ale bez obličeje a zaměnitelná s ostatními pivními hrami; text v kruhu se ořízne.
- Návrhy (pixel art, bez textu) v docs/navrhy-ui/ikona-2/, skript tools/ikona/kresli.py:
  - **A – Hospodský** (mrkající hospodský s půllitrem, tyrkysová) – Fable doporučuje jako první A/B test.
  - **B – Cthulhu štamgast** (velké oči, tváře, půllitr v chapadlech, oranžová) – druhý test proti vítězi.
  - **C – Přípitek upíra a trpaslíka** (fialová) – při 48 px nejméně čitelný.
- Testovat přes Play Console → Store listing experiments 50/50, aspoň 7 dní. Nevybrané nechat tady.

## Diamanty: nabídka a tlak na nákup (28. 11. 2026, posudek – čeká na Petra, nic nezměněno)
- Za 💎 je 16 položek v obchodě (6 rychlých, 7 trvalých, 3 vzhledy) + 3 v lize + přerozdělení bodů. Trvalé + vzhled ≈ 5 250 💎.
- Neplatící aktivní hráč dostane zhruba 20–30 💎/den (hygiena 3×2, VIP, úkoly, návštěvníci do 10, zlatý host, video výzva)
  + ~60–100 týdně (liga 30 × liga, zlatá truhla 10, týdenní zlatá 20) + odměny Rekonstrukce 20–50. Kronika (+10 %) za ~6–8 týdnů.
- Tlak nízký: 1 vyskakovací okno za spuštění, „Málo 💎“ jen cedule bez přesměrování do obchodu, liga je proti botům, placené násobky strop ×3.
- **Riziko pay-to-win:** časoskok 24 h (90 💎) nemá denní limit a jeho výdělek jde do kola → víc krígel → globální žebříček „krígly“ v Google Play.
  Hráč s 999 Kč (3 500 💎 ≈ 38 časoskoků) přeskočí měsíce. Návrhy: (a) časoskoky max 2×/den, nebo (b) krígly z časoskoku nepočítat do žebříčku.
- **Málo pro platící po nákupu všeho trvalého:** jen 3 vzhledy. Návrh: víc kosmetiky (vzhled každé stanice, cedule, oblečení hostinského, sezónní výzdoba) – peníze bez tlaku na slabšího hráče.
- Drobnost: na stránce Rychlé chybí u časoskoku zmínka, že se nepočítá do ligy (aby hráč věděl, že ligu nekupuje).
