# Zkušebna – P.U.B. Idle

Druhá „záložka“ Zkušebny z The Hole (repo `BARONisko/The-hole`, `Tools/Zkusebna` + `docs/zkusebna`). Stejná stavba,
jen pro idle hru v prohlížeči místo Unity: bot hraje skutečnou hru bez okna → časová osa a snímky → čísla podle
kritérií → hodnotitel (Fable) projde snímky očima člověka → kontrola hodnotitele → výsledek.
Vzor z The Hole (k porovnání): `docs/zkusebna/the-hole-vzor/`.

Pevná pravidla: hra se neotevírá v okně (headless Chromium), hráčův save se nečte (každý bot začíná s prázdným
localStorage), čísla a prahy jsou data v `kriteria.json`, ne v kódu.

## Části

| Část | Kde | Co dělá |
| --- | --- | --- |
| Boti | `tools/zkusebna/bot.mjs` | Hrají přes dotyky jako hráč (návod, průvodci, okna, události, karty, úkoly). Herní čas běží zrychleně: smyčka Phaseru se uspí a bot ji posouvá sám po 250 ms (3 h hry ≈ 5 min). Povahy: **nováček** (15 min, snímek po 30 s), **běžný** (3 h, první hygiena minutu po tom, co jde), **slabý** (4 h: 8 min hraje, 80 min pryč, ťuká na cokoli, úkoly skoro nečte, události chytí napůl), **dlouhý** (10 h, kdy dojdou novinky). Zapisuje nákupy s cenou, obsluhu, stanice, hygieny, události, hosty, noc/den, úrovně, dlaždice menu, průvodce, návraty + čísla po 5 s. |
| Lidská půlka | `tools/zkusebna/human_half.py` | `score`: 24 počítaných kritérií, křivka zájmu, odhad konce netrpělivého / běžného / trpělivého hráče, zadání pro hodnotitele (`review/prompt.md`). `merge`: kontrola hodnotitele (známka bez důkazu se zahodí, samé dvojky podezřelé) → `lidska_cast.md`. `calibrate`: porovnání s živými testery. |
| Kritéria | `docs/zkusebna/kriteria.json`, `rubrika-lidska-cast.md` | Idle žánr na mobilu (napsal Fable podle vzoru The Hole): start S, tempo T, návrat L, objevování O, nuda N, hygiena P, slabší hráč W, dlouhý cíl D, otázky H, tlak na placení M1, zahlcení U1. |
| Hodnotitel | `docs/zkusebna/hodnotitel.md` | Závazný postup: průchod ≥ 8 snímky (vidím / udělám / cítím) před časovou osou, čtyři hráči (netrpělivý, sběratel, optimalizátor, příležitostný na mobilu), známky podle kotev s důkazem, top 10. |
| Test na lidech | `docs/zkusebna/test-na-lidech.md`, `lide.json` | To jediné, co boti neumí. |
| Výsledky | `docs/zkusebna/vysledky/` | Shrnutí běhů (běhy samotné v `ZkusebnaRuns/`, mimo git). |

## Spuštění

```
bash tools/zkusebna/run.sh                         # vite + 4 boti + čísla (asi 6 min)
# hodnotitel (Fable) udělá, co je v ZkusebnaRuns/<běh>/review/prompt.md → review/hodnoceni.json
python3 tools/zkusebna/human_half.py merge ZkusebnaRuns/<běh>
```

Jednotlivě: `node tools/zkusebna/bot.mjs <novacek|bezny|slaby|dlouhy> <složka> [minuty] [jazyk]`, ladění `ZK_DEBUG=1`.

## Čemu nevěřit

- Bot ví, kam ťuknout; časy startu se přepočítávají na člověka (`human` v kriteria.json), je to odhad.
- Bot kupuje jen ve vybrané hospodě a po jedné úrovni; ceny jsou odhad z úbytku coins.
- Boti nepoužívají Menu (strom, pivovar, Chrám, šipky, liga, obchod za diamanty) – tempo po první hodině je spíš horní odhad nudy.
- Snímky jsou bez zvuku a pohybu.
