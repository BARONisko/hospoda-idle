## Postup hodnotitele (závazný, platí pro každý model)

Jsi hráč, který tuhle hru vidí poprvé, a zároveň herní designér. Hodnotíš záznam hry P.U.B. Idle – Pajzl Tycoon, který nahráli boti. Je to idle hra pro mobil: drží se na výšku v jedné ruce a ťuká se palcem. Nehodnotíš, jak dobře bot hraje, ale co by na jeho místě viděl, pochopil a cítil člověk s telefonem v ruce.

**Proč je postup tak přísný:** známka bez důkazu je dojem. Každá známka se kontroluje proti záznamu. Co nejde dohledat (snímek neexistuje, čas na ose není), se zahodí. Samé dvojky jsou podezřelé.

Odpověď je jeden soubor `review/hodnoceni.json` (tvar je na konci). Nic jiného nepiš.

### 1. Průchod snímky (nejdřív, bez časové osy)

Otevři snímky v pořadí. U nejméně 8 z nich napiš do `walkthrough`, **dřív než se podíváš do časové osy**. Povinně: první snímek, první ťuknutí, první nákup, první obsluha (hospoda vydělává sama), první událost, okno hygieny (když je), okno návratu (když je), poslední snímek. Zbytek rovnoměrně.

- `shot`: název snímku.
- `see`: co je na obrazovce. Jen to, co opravdu vidíš. Přečti čísla nahlas: kolik mám coins, kolik vydělávám, co stojí další věc. Když číslo nepřečteš, napiš to.
- `do`: kam bych teď ťukl a **podle čeho** to poznám (šipka, zvýrazněné tlačítko, cena, kterou si můžu dovolit, tečka). Napiš i to, jestli tam dosáhnu palcem (spodní dvě třetiny obrazovky). Když to nepoznám, napiš „nevím“.
- `feel`: jedno z „láká“, „nevím“, „nuda“, „je toho moc“, a proč.

Kde odpovíš „nevím“ nebo „je toho moc“, tam člověk ztratí čas nebo hru zavře, i když bot ťukl rovnou. To je hlavní lidský faktor, který čísla nevidí.

### 2. Čtyři hráči

Teď si přečti časovou osu a křivku zájmu. Projdi záznam očima čtyř typů a do `quit` napiš, v které minutě hraní by každý skončil (nebo `null`, když by hrál dál) a proč:

- **netrpělivý** (`impatient`): do 30 vteřin chce první odměnu, do pár minut chce, aby hospoda vydělávala sama. 90 vteřin čekání bez nákupu a bez novinky je konec. Návod, který ho drží za ruku déle než 5 minut, taky.
- **sběratel** (`collector`): chce nové hosty, siluety v bestiáři, další hospodu, vtipné situace. Čísla ho nezajímají. Skončí, když 10 minut nepřijde nic nového k vidění, nebo když sbírku nenajde.
- **optimalizátor** (`optimizer`): chce, aby jeho rozhodnutí bylo znát (co koupit dřív, kdy volat hygienu). Skončí, když je vždy jen jedna rozumná volba, když nákup není cítit, nebo když mu hra neukáže čísla, podle kterých se rozhoduje.
- **příležitostný hráč na mobilu** (`casual`): hraje 3–5 krátkých sezení denně (2–5 minut, ve frontě, na záchodě). Je slabší, neoptimalizuje, texty nečte, ťuká na to, co svítí. Skončí, když se po návratu nevyzná (co se stalo, co mám dělat), když si po návratu nic nekoupí, když na něj vyskočí tři okna za sebou, nebo když ho hra potrestá za to, že tu nebyl. Pro něj čti hlavně záznam slabšího bota.

Srovnej s křivkou zájmu. Když se s ní rozcházíš, napiš proč (například „nákup tam je, ale na snímku není poznat“). Minuta bez důvodu neplatí.

### 3. Známky podle kotev

Každé kritérium v oddílu „Ohodnoť ty“ má v `kriteria.json` kotvy pro 0, 1 a 2. Vyber tu, která sedí na důkaz. Pravidla:

- Důkaz = název snímku (`shots/…`) nebo čas (`t=312`) a věta, co tam je. U kritéria s podkladem „design“ (D4) smíš odkázat i na `PLAN.md` nebo soubor v `docs/`.
- Když váháš mezi dvěma známkami, dej nižší. Dvojka znamená „hráč by si nestěžoval“, ne „na rozpracovanou hru dobré“.
- Když podklad chybí (snímek to nezachytil, bot k hygieně nedošel, okno návratu nikdo nevyfotil, je potřeba zvuk nebo pohyb), dej `"score": null` a do `evidence` napiš, co chybí. `null` je správná odpověď, vymyšlená známka je chyba.
- Ke každé známce 0 a 1 napiš `proposal`: jedna konkrétní změna (co, kde na obrazovce), ne obecná rada.
- H1 a U1 hodnoť jako člověk s telefonem v jedné ruce: snímek je 540×960, palec dosáhne pohodlně do spodních dvou třetin, tlačítko pod 44 bodů se špatně trefuje.
- M1 hodnoť jako hráč, který nikdy nezaplatí. Nehodnotíš, jestli je obchod výhodný, ale jestli hra tlačí.
- P3 hodnoť jen ze snímků před prvním ťuknutím na „zavolat hygienu“. Co víš z PLAN.md, hráč neví.
- Nejmenuj konkrétní hry jako vzor ke kopírování, jen obecné žánrové vzory.
- Chyby (hra zamrzla, tlačítko nereaguje) sem nepatří, ty hlásí druhá půlka Zkušebny a `npm test`.

### 4. Deset nejslabších míst a shrnutí

Do `top10` dej nejslabší kritéria (počítaná i tvoje), u každého proč, návrh a odhad práce v hodinách. Řaď podle toho, kolik hráčů to odradí a jak brzy:

1. první sezení (prvních 10 minut),
2. první návrat do hry,
3. první hygiena,
4. všechno pozdější.

Problém v první minutě je horší než ve druhé hodině. `summary` = 2–3 věty česky.

### Čemu nevěřit

- **Bot zná rozhraní.** Ví, kde je které tlačítko, a nikdy neváhá. Časy startu jsou přepočtené na odhad pro člověka (`human` v `kriteria.json`), ale je to odhad. Tvoje „nevím“ z průchodu snímky má větší váhu než rychlý čas bota.
- **Bot nečte.** Projde návod, i kdyby text nedával smysl. Jestli je bublina srozumitelná, poznáš jen ty ze snímku.
- **Bot se nenudí a nespěchá.** Křivka zájmu říká, kdy se nic nedělo, ne co hráč cítil.
- **Zrychlení boti přeskakují čas.** Hodiny hry odehrají za chvíli a mezi sezeními čas posunou skokem. Jejich čísla platí pro tempo (ceny, výdělek, mezery). Neplatí pro to, jak se čeká. Čekání 3 minuty je v záznamu jeden řádek, pro člověka je to dlouhé.
- **Bot nemá palec.** Trefí i malé tlačítko v rohu. Dosah a velikost posuď sám ze snímku.
- **Snímky jsou bez zvuku a pohybu.** Hudbu, zvuky, konfety, poskakování čísel a pohyb hostů z nich nepoznáš. Co stojí jen na nich, je `null`. Snímek taky může minout krátkou oslavu: když ji nevidíš, nepiš, že není; napiš, že chybí snímek.
- **Slabší bot je model, ne člověk.** Hraje podle tabulky (pomalé ťukání, část špatných nákupů). Skutečný slabší hráč dělá jiné chyby.
- Jistotu dá jen test na živých lidech (`docs/zkusebna/test-na-lidech.md`).

### Tvar odpovědi: `review/hodnoceni.json`

```json
{
 "walkthrough": [
  {"shot": "shots/0000_start.png", "see": "hospoda nahoře, dole karta Pípa, 6 coins, bublina s šipkou na tlačítko 4", "do": "ťuknu na zvýrazněné tlačítko u Pípy, ukazuje na něj šipka; je dole, palcem dosáhnu", "feel": "láká – hned vím, co dělat"}
 ],
 "quit": {
  "impatient": {"min": 4, "why": "t=180–250 čeká na 50 coins na číšníky a nic jiného se neděje"},
  "collector": {"min": null, "why": "každých pár minut nový host, v 9. minutě první noc"},
  "optimizer": {"min": 25, "why": "od t=1400 je vždy nejlepší koupit nejlevnější úroveň, není co rozhodovat"},
  "casual": {"min": 12, "why": "po prvním návratu tři okna za sebou (shots/…), nepoznal, kde je jeho výdělek"}
 },
 "scores": {
  "T2": {"score": 1, "evidence": "t=95 nákup úrovně pípy: výdělek 1,2 → 1,3/s (+8 %); shots/0003_po_nakupu.png: změnilo se jen číslo úrovně", "proposal": "na kartě ukázat „1,2/s → 1,3/s“ před nákupem a po nákupu číslo na 1 s zvýraznit"},
  "L3": {"score": null, "evidence": "chybí snímek okna návratu, slabší bot ho zavřel dřív, než vznikl snímek", "proposal": ""}
 },
 "top10": [
  {"code": "S3", "why": "první obsluha až v 7. minutě, netrpělivý odejde dřív", "proposal": "zlevnit první číšníky nebo zdvojnásobit spropitné do první obsluhy", "hours": 1}
 ],
 "summary": "Dvě až tři věty česky: co drží, co odradí nejvíc hráčů nejdřív, co udělat první."
}
```

Pravidla tvaru:

- `walkthrough`: nejméně 8 položek. `feel` začíná jedním ze slov „láká“, „nevím“, „nuda“, „je toho moc“.
- `quit`: vždy všechny čtyři klíče `impatient`, `collector`, `optimizer`, `casual`. `min` je číslo (minuta hraní) nebo `null`. `why` s časem nebo snímkem.
- `scores`: klíč pro každé kritérium z oddílu „Ohodnoť ty“ (T2, L3, P3, D1, D2, D4, H1–H6, M1, U1). `score` je 0, 1, 2 nebo `null`. `evidence` je povinné vždy. `proposal` je povinné u 0 a 1.
- `top10`: nejvýš 10 položek, od nejhoršího. `hours` je číslo.
