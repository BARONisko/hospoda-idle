# Test na lidech (to jediné, co boti neumí)

Boti měří čas a tempo. Jestli je hra zábavná a jestli ji člověk zítra otevře znovu, řekne jen člověk. Tenhle list je pro 3–5 lidí. Každý hraje na svém telefonu, na výšku. Výsledek zpřesní čísla Zkušebny.

Idle hra se netestuje jedním sezením. Test má dvě části: **první sezení** (díváš se) a **druhý den** (jen se zeptáš).

## Koho vybrat

- Aspoň jeden, kdo idle hry hraje, a aspoň jeden, kdo na mobilu hraje jen občas (to je náš slabší hráč).
- Nikdo, kdo hru viděl nebo o ní slyšel víc než název.

## První sezení (15–20 minut, sedíš vedle)

1. Pošli odkaz na hru. Nová hra, zvuk zapnutý. Nic nevysvětluj, jen „zkus si to, mluv nahlas, co si myslíš“.
2. Seď vedle, mlč a nepomáhej. Když se zasekne, počítej vteřiny. Pomoz až po minutě a zapiš to.
3. Dívej se, jak telefon drží (jedna ruka, nebo si pomáhá druhou?) a kam nedosáhne.
4. Měř stopkami od spuštění nové hry a zapisuj do `docs/zkusebna/lide.json` (vzorový řádek tam je):
   - `first_tap_s`: kdy poprvé ťukl tak, že vydělal coins.
   - `first_buy_s`: kdy poprvé něco koupil.
   - `first_staff_s`: kdy najal první obsluhu (hospoda začala vydělávat sama).
   - `tutorial_done_s`: kdy skončil návod (cedule HOTOVO). Prázdné, když ho nedokončil.
   - `stuck`: každé zaseknutí delší než 15 s (kdy, jak dlouho, na čem).
   - `bored_min`: minuta, kdy poprvé zívl, začal bezmyšlenkovitě ťukat, řekl „to je pořád stejné“ nebo „a co teď?“.
   - `quit_min`: kdy sám hru zavřel nebo řekl, že končí. Prázdné (`null`), když jsi ho po 20 minutách musel zastavit.
   - `prestige_min`: kdy poprvé zavolal hygienu (`null`, když ne). Zapiš do `said`, co u okna hygieny řekl.
   - `one_hand`: hrál celou dobu jednou rukou? (`true` / `false`)
   - `said`: 2–3 věty, které řekl nahlas (nejcennější věc z celého testu).
5. Po sezení se zeptej na otázky z rubriky a zapiš 0, 1 nebo 2 do `h`:
   - H1 Věděl jsi vždycky hned, kam ťuknout? Dosáhl jsi tam palcem?
   - H2 Bylo u každého tlačítka jasné, co stojí a co dá?
   - H3 Přečetl jsi čísla? (Nech ho přečíst nahlas coins a výdělek.)
   - H4 Bylo to vtipné? Co?
   - H5 Chceš něco vidět nebo doplnit? Co?
   - H6 Otevřeš to zítra? Kvůli čemu?
   - M1 Tlačila na tebe hra, ať platíš nebo koukáš na reklamy?
   - U1 Bylo toho někdy na obrazovce moc?
6. Neříkej „zahraj si to zítra“. Řekni jen „hra ti zůstane v telefonu“.

## Druhý den (2 minuty, zprávou nebo telefonem)

Zeptej se až večer. Zapiš:

- `came_back_next_day`: otevřel hru sám od sebe? (`true` / `false`)
- `sessions_next_day`: kolikrát.
- `wants_more`: chce hrát dál?
- L3: „Když jsi hru otevřel, poznal jsi, kolik ti mezitím vydělala a co s tím?“ (0/1/2 do `h`)
- P3: jen když volal hygienu: „Věděl jsi, co ztratíš a co získáš?“ (0/1/2 do `h`)
- Do `said` přidej jednu větu, proč se vrátil nebo nevrátil.

`came_back_next_day` je nejdůležitější číslo celého testu. Když se nevrátí 2 z 5, je problém v háčku (D2, L2, L3), ne v tempu.

## Co s tím

Spusť kalibraci Zkušebny nad posledním během (příkaz `calibrate`). Ta má vypsat:

- o kolik jsou lidé pomalejší než bot (nové `human.time_factor` a `human.discover_s`),
- jak sedí předpověď nudy (`bored_min` a `quit_min` proti `boredom.patience_s`),
- kde se známky hodnotitele liší od lidí (upravit kotvy).

Čísla se mění v `docs/zkusebna/kriteria.json`, kód ne. U prahů, které lidé potvrdili, přepiš `source` z „odhad“ na „test na lidech“ a datum.

Pravidlo: když test nevyjde (lidé se nevrátí, nebo se zaseknou v první minutě), upravit hru dřív, než se přidávají další části.
