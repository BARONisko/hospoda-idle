# Test na lidech (to jediné, co boti neumí)

Boti měří čas a tempo. Jestli je hra zábavná, řekne jen člověk. Tenhle list je pro kontrolní bod 1 (3–5 lidí, každý 20–30 minut) a jeho výsledek zpřesní čísla Zkušebny.

## Jak na to

1. Tester hru nezná. Nic mu nevysvětluj, jen „zkus si to, mluv nahlas, co si myslíš“.
2. Seď vedle, mlč a nepomáhej. Když se zasekne, počítej vteřiny; pomoz až po minutě a zapiš si to.
3. Měř stopkami od spuštění nové hry a zapisuj do `docs/zkusebna/lide.json` (vzorový řádek tam je):
   - `first_dig_s`, `first_sale_s`, `first_buy_s`: kdy poprvé kopl, prodal, koupil.
   - `stuck`: každé zaseknutí delší než 20 s (kdy, jak dlouho, na čem).
   - `bored_min`: minuta, kdy poprvé zívl, koukl na mobil, řekl „to je pořád stejné“ nebo začal dělat blbosti místo hraní.
   - `quit_min`: kdy sám řekl, že končí (nebo prázdné, když jsi ho musel zastavit); `wants_more`: chtěl by hrát dál?
   - `said`: 2–3 věty, které řekl nahlas (nejcennější věc z celého testu).
4. Po hře se zeptej na šest otázek H1–H6 z rubriky a zapiš 0, 1 nebo 2 do `h`.

## Co s tím

```
python3 Tools/Zkusebna/human_half.py calibrate ZkusebnaRuns/<poslední běh>
```

Vypíše, o kolik jsou lidé pomalejší než bot (nové `human.time_factor`), jak sedí předpověď nudy (`boredom.patience_s`) a kde se známky hodnotitele liší od lidí (upravit kotvy). Čísla se mění v `docs/zkusebna/kriteria.json`, kód ne.

Pravidlo z plánu hry platí: když test nevyjde, upravit mechaniku dřív, než se pokračuje.
