# Zbylé nálezy z celé kontroly (hospoda 66, 2026-11-09)
Skripty a snímky agentů byly v kontejneru (scratchpad, už nejsou). Opravené věci viz konec PLAN.md.
Seřazeno podle důležitosti; [R] = rozhodnutí uživatele / návrh na snímcích, [O] = rovnou opravit.

## Ovládání (mobil)
- [O] Android tlačítko Zpět nemá obsluhu (chybí @capacitor/app) → zavře celou aplikaci. Přidat App.addListener('backButton'):
  okno → panel → menu → na hlavní obrazovce „Ukončit?“; na webu Escape.
- [R] Tlačítko obsluhy na kartě stanice („Číšníci 15“) je 143×17 CSS px, 2 px pod „+1“ (PubScene addCards, btn h 22).
  Návrh: sloučit do jednoho tlačítka („Najmout“, dokud stanice nemá obsluhu) nebo výška ≥ 60.
- [R] Malá dotyková místa (cíl 44×44 CSS, skoro všude 32–38): ×1/×10/MAX vpravo nahoře, krígl+💎 4 px od sebe, záložky
  hospod, UKAŽ, ✕ menu 39×32, Talismany „+1“ 135×26, „body: N ?“, záložky Sbírky/Hostinského/Diamantů, „Lepší reklama“.
- [O] Návod krok 4 „NAŠETŘI 60 COINS“: ~60 s čekání, šipka na Pípu (ťuk nic nedělá) → nabídnout bubliny hostů.
- [O] Kuchyně bez kuchaře: „ťukni sem!“ jen ~10 px písmo.
- [O] Hostinský „vrátit body“ vynuluje strom bez potvrzení, tlačítko skoro na místě KOUPIT.
- [O] CSS: -webkit-touch-callout:none; user-select:none na canvas; safe-area (viewport-fit=cover bez env()).
- Podržení prstu pro opakovaný nákup chybí (nápad).

## Vzhled / jazyky
- [O] První noc: nápis „Padla noc – příšery platí kostmi!“ přes ceduli průvodce „PADLA NOC!“ (PubScene ~4560 firstNight
  nezabere, když hra startuje v noci). Tělo cedule průvodce (~4955) je v jiném (nepixelovém) písmu.
- [O] Nápisy událostí (Rvačka, Zlatý sud, Padla noc) leží přes lištu úkolu nad hospodou (bannerRaw top).
- [O] Ruština: písmo Jersey 10 se načítá jen latin/latin-ext (main.ts) → azbuka v záložním širším písmu, přetéká
  (Nastavení podtitulky, záložka „Забегаловка Берана“, Šipky nápověda dole useknutá, offline okno řádek ligy, Pivovar,
  Hostinský záložka). Zkusit @fontsource/jersey-10 cyrillic (pokud existuje), jinak zmenšovat.
- [O] ja/ko Liga: 2. řádek popisu soupeře přetéká rámeček. Zmáčknuté podtitulky (Chrám pod „0 chapadel“, Obchod hygiena,
  Nastavení – i de/fr) → zalamovat místo zmenšování.
- [O] fr: Sběrač = „Serveur“ i Číšníci = „Serveurs“ → „Collecteur“. ja: Sběrač 給仕 ≈ číšník → jiné slovo.
  ko: „Jirka Jelínek이(가)“ zůstal zástupný tvar.
- [HOTOVO h68: písmo B] Malé písmo 6–8 px: Kostnice seznam (šedé na tmavém), záložky Sbírky, podzáložky Diamantů, zamčené dlaždice Menu,
  štítky dlaždic, „ťukni sem“, patička Diamantů, lišta Den/kosti.
- Ceny „49 Kč…“ ve všech jazycích (shop.ts výchozí; v obchodě Google je přepíše, na webu ne).
- „Happy hour“ v Pivovaru vs. „Šťastná hodina ×3“ manažera – dvě věci, skoro stejné jméno. ru: Паб / трактир / кабак.

## Ukládání / hodiny
- [O] Dvě karty prohlížeče se přepisují (web) – posluchač 'storage' → znovu načíst / zamknout.
- [O] Novější verze uložení (v:3) se tiše zahodí a přepíše; plné úložiště store() mlčí.
- [O] Přetáčení hodin ještě funguje u: Šťastné hodiny (boostUntil/boostReady absolutní), ligy (týden vyhodnocen předčasně
  při hodinách zpět → krígly a 💎 znovu), Chrámu (denní pokusy), sezón, passu/kampaně. Návrh: uložit nejpozdější viděný čas.
- Offline výdělek z minulého týdne se po přelomu přičte do ligy nového týdne (gain až po league()).
- Šipky: odchod Zpět během letu vítězné šipky → +3 kosti a XP se nepřipíšou. Chrám: zavření během 0,9 s animace truhly
  → truhla zmizí. Sezóna se zjišťuje jen při načtení modulu (season.ts:23).
- Rvačka v jiné hospodě už nevznikne (opraveno), ale dur = Infinity zůstává.

## Balanc (tools/sim, simulace agenta)
- [O] Hygiena na konci sezení = 0 coins offline (po prestiži žádná obsluha) → pípa 1. hospody rovnou s obsluhou, nebo varovat.
- [R] Rada „Za krígly si můžeš koupit“ vede do pasti (utracený krígl = −0,9 % výdělku; nabízí „Delší spánek“ za 2 krígly
  = +30 s). Běžný hráč, který rady poslouchá, má po 9 dnech 10× menší výdělek než slabý, který krígly neutrácí.
  Návrh: radit krígly jen když se vyplatí / od 50 krígel; Delší spánek v radě nenabízet.
- [R] „Delší spánek“ +30 s/úr. → strop +4 h potřebuje ~8e8 krígel. Návrh +5 min/úr. (max 48 úr.).
- [R] Liga: 4. a 5. liga prakticky nedosažitelná (všichni kmitají 2↔3). Návrh TIER_F = [0.7, 0.8, 0.88, 0.95, 1.05]
  nebo menší push soupeře ve 3.+ lize (league.ts:61).
- [R] Zeď dlouhých kol: kolo 20 ≈ 54 min, 30 ≈ 3 h, 37 ≈ 11 h (PRESTIGE_GROW 0,1). Návrh 0,05 nebo strop prahu; ověřit chain.mjs.
- [R] 💎 za hygienu (+2) bez limitu (zapálený ~12 💎/h). Zlatá truhla 10 % krígel = složený úrok ~×1800/rok.
- [O] big(): big(999999999999999) → „0.99aa“, big(9.99) → „10.0“, big(NaN) → „∞“ (num.ts:11).
- Po 1. dni žádná nová hospoda (MAX_PUBS = 3) – dlouhodobé cíle jen strom, liga, mistrovství.
