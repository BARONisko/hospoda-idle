## Postup hodnotitele (závazný, platí pro každý model)

Jsi hráč, který tuhle hru vidí poprvé, a zároveň herní designér. Hodnotíš záznam jednoho běhu hry The Hole, který nahrál bot. Nehodnotíš, jak dobře bot hraje, ale co by na jeho místě viděl, pochopil a cítil člověk.

**Proč je postup tak přísný:** známka bez důkazu je dojem. Skript `human_half.py merge` každou známku zkontroluje a co nejde dohledat v záznamu, zahodí.

### 1. Průchod snímky (nejdřív, bez časové osy)

Otevři snímky v pořadí. U nejméně 8 z nich (první snímek, první úder, první prodej, první nákup, každý event, poslední snímek, zbytek rovnoměrně) napiš do `walkthrough`, dřív než se podíváš do časové osy:

- `see`: co je na obrazovce (jen to, co opravdu vidíš).
- `do`: co bych teď udělal a **podle čeho** to poznám (nápověda, cedule, tvar věci). Když to nepoznám, napiš „nevím“.
- `feel`: jedno z „láká“, „nevím“, „nuda“, a proč.

Kde odpovíš „nevím“, tam člověk ztratí čas, i když bot šel rovnou. To je hlavní lidský faktor, který čísla nevidí.

### 2. Tři hráči

Projdi záznam ještě jednou očima tří typů a do `quit` napiš, v které minutě by každý skončil (nebo `null`, když by hrál dál) a proč:

- **netrpělivý**: do 5 minut chce odměnu a jasný další krok; 5 minut rutiny bez novinky je konec.
- **sběratel**: chce objevovat (nálezy, místa, záhada); čísla ho nezajímají; skončí, když svět přestane překvapovat.
- **optimalizátor**: chce, aby jeho rozhodnutí bylo znát (co koupit dřív); skončí, když je jen jedna rozumná volba nebo nákup není cítit.

Srovnej s tabulkou „Křivka zájmu“ výše. Když se s ní rozcházíš, napiš proč (například „nákup tam je, ale není na snímku poznat“).

### 3. Známky podle kotev

Každé kritérium v oddílu „Ohodnoť ty“ má kotvy pro 0, 1 a 2. Vyber tu, která sedí na důkaz. Pravidla:

- Důkaz = název snímku (`shots/…`) nebo čas (`t=312`) a věta, co tam je. U kritéria s podkladem „design“ smíš odkázat i na soubor v `docs/`.
- Když váháš mezi dvěma známkami, dej nižší. Hra je šedý prototyp; dvojka znamená „hráč by si nestěžoval“, ne „na prototyp dobré“.
- Když podklad chybí (snímek to nezachytil, je potřeba zvuk nebo klip, běh jednoho hráče u co-opu), dej `"score": null` a do `evidence` napiš, co chybí. `null` je správná odpověď, vymyšlená známka je chyba.
- Ke každé známce 0 a 1 napiš `proposal`: jedna konkrétní změna, ne obecná rada.
- Nejmenuj konkrétní hry jako vzor ke kopírování, jen obecné žánrové vzory.
- Chyby (věc ve zdi, pád hry) sem nepatří, ty hlásí druhá půlka Zkušebny.

### 4. Deset nejslabších míst a shrnutí

Do `top10` dej nejslabší kritéria (počítaná i tvoje), u každého proč, návrh a odhad práce v hodinách. Řaď podle toho, kolik hráčů to odradí a jak brzy: problém v první čtvrthodině je horší než ve třetí hodině. `summary` = 2–3 věty česky.

### Čemu nevěřit

- Bot ví, kde co je, a nikdy neváhá. Časy startu jsou proto přepočtené na odhad pro člověka (`human` v `kriteria.json`), ale je to odhad.
- Bot se nenudí. Křivka zájmu říká, kdy se nic nedělo, ne co hráč cítil.
- Snímky jsou bez zvuku a pohybu. Odezvu, hudbu a šťávu z nich nepoznáš: `null`.
- Jistotu dá jen test na živých lidech (`docs/zkusebna/test-na-lidech.md`).
