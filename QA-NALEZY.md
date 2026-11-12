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
- [HOTOVO h69] Návod krok 4 „NAŠETŘI 60 COINS“: ~60 s čekání, šipka na Pípu (ťuk nic nedělá) → nabídnout bubliny hostů.
- [O] Kuchyně bez kuchaře: „ťukni sem!“ jen ~10 px písmo.
- [HOTOVO h69: okno Ano/Ne] Hostinský „vrátit body“ vynuluje strom bez potvrzení, tlačítko skoro na místě KOUPIT.
- [HOTOVO h69] CSS: -webkit-touch-callout:none; user-select:none na canvas; safe-area (viewport-fit=cover bez env()).
- Podržení prstu pro opakovaný nákup chybí (nápad).

## Vzhled / jazyky
- [HOTOVO h69] První noc: nápis „Padla noc – příšery platí kostmi!“ přes ceduli průvodce „PADLA NOC!“ (PubScene ~4560 firstNight
  nezabere, když hra startuje v noci). Tělo cedule průvodce (~4955) je v jiném (nepixelovém) písmu.
- [HOTOVO h69] Nápisy událostí (Rvačka, Zlatý sud, Padla noc) leží přes lištu úkolu nad hospodou (bannerRaw top).
- [HOTOVO h67 Handjet, ověřeno h69] Ruština: písmo Jersey 10 se načítá jen latin/latin-ext (main.ts) → azbuka v záložním širším písmu, přetéká
  (Nastavení podtitulky, záložka „Забегаловка Берана“, Šipky nápověda dole useknutá, offline okno řádek ligy, Pivovar,
  Hostinský záložka). Zkusit @fontsource/jersey-10 cyrillic (pokud existuje), jinak zmenšovat.
- [HOTOVO h69: liga, zalamování dlouhých podtitulků] ja/ko Liga: 2. řádek popisu soupeře přetéká rámeček. Zmáčknuté podtitulky (Chrám pod „0 chapadel“, Obchod hygiena,
  Nastavení – i de/fr) → zalamovat místo zmenšování.
- [HOTOVO h69: Collecteur, コレクター, ko 님이] fr: Sběrač = „Serveur“ i Číšníci = „Serveurs“ → „Collecteur“. ja: Sběrač 給仕 ≈ číšník → jiné slovo.
  ko: „Jirka Jelínek이(가)“ zůstal zástupný tvar.
- [HOTOVO h68: písmo B] Malé písmo 6–8 px: Kostnice seznam (šedé na tmavém), záložky Sbírky, podzáložky Diamantů, zamčené dlaždice Menu,
  štítky dlaždic, „ťukni sem“, patička Diamantů, lišta Den/kosti.
- Ceny „49 Kč…“ ve všech jazycích (shop.ts výchozí; v obchodě Google je přepíše, na webu ne).
- „Happy hour“ v Pivovaru vs. „Šťastná hodina ×3“ manažera – dvě věci, skoro stejné jméno. ru: Паб / трактир / кабак.

## Ukládání / hodiny
- [HOTOVO h69] Dvě karty prohlížeče se přepisují (web) – posluchač 'storage' → znovu načíst / zamknout.
- [HOTOVO h69] Novější verze uložení (v:3) se tiše zahodí a přepíše; plné úložiště store() mlčí.
- [HOTOVO h69: + Chrám, pass, denní/týdenní úkoly, 💎 limity, liga Posila/Zavřít pípu; sezóna = hodiny dopředu nejdou bez internetu poznat] Přetáčení hodin ještě funguje u: Šťastné hodiny (boostUntil/boostReady absolutní), ligy (týden vyhodnocen předčasně
  při hodinách zpět → krígly a 💎 znovu), Chrámu (denní pokusy), sezón, passu/kampaně. Návrh: uložit nejpozdější viděný čas.
- Offline výdělek z minulého týdne se po přelomu přičte do ligy nového týdne (gain až po league()).
- Šipky: odchod Zpět během letu vítězné šipky → +3 kosti a XP se nepřipíšou. Chrám: zavření během 0,9 s animace truhly
  → truhla zmizí. Sezóna se zjišťuje jen při načtení modulu (season.ts:23).
- Rvačka v jiné hospodě už nevznikne (opraveno), ale dur = Infinity zůstává.

## Balanc (tools/sim, simulace agenta)
- [HOTOVO h67: pípa s číšníky] Hygiena na konci sezení = 0 coins offline (po prestiži žádná obsluha) → pípa 1. hospody rovnou s obsluhou, nebo varovat.
- [R] Rada „Za krígly si můžeš koupit“ vede do pasti (utracený krígl = −0,9 % výdělku; nabízí „Delší spánek“ za 2 krígly
  = +30 s). Běžný hráč, který rady poslouchá, má po 9 dnech 10× menší výdělek než slabý, který krígly neutrácí.
  Návrh: radit krígly jen když se vyplatí / od 50 krígel; Delší spánek v radě nenabízet.
- [R] „Delší spánek“ +30 s/úr. → strop +4 h potřebuje ~8e8 krígel. Návrh +5 min/úr. (max 48 úr.).
- [R] Liga: 4. a 5. liga prakticky nedosažitelná (všichni kmitají 2↔3). Návrh TIER_F = [0.7, 0.8, 0.88, 0.95, 1.05]
  nebo menší push soupeře ve 3.+ lize (league.ts:61).
- [R] Zeď dlouhých kol: kolo 20 ≈ 54 min, 30 ≈ 3 h, 37 ≈ 11 h (PRESTIGE_GROW 0,1). Návrh 0,05 nebo strop prahu; ověřit chain.mjs.
- [R] 💎 za hygienu (+2) bez limitu (zapálený ~12 💎/h). Zlatá truhla 10 % krígel = složený úrok ~×1800/rok.
- [HOTOVO h69] big(): big(999999999999999) → „0.99aa“, big(9.99) → „10.0“, big(NaN) → „∞“ (num.ts:11).
- Po 1. dni žádná nová hospoda (MAX_PUBS = 3) – dlouhodobé cíle jen strom, liga, mistrovství.

# Kontrola „bude to oblíbené?“ (hospoda 70, 2026-11-12) – robot-hráč 14 min anglicky, všechny obrazovky, simulace
Seřazeno podle dopadu na udržení hráčů. [R] = čeká na rozhodnutí uživatele.
- [R] **Upozornění na Androidu nefungují**: v balíčku chybí @capacitor/local-notifications (android/app/capacitor.build.gradle má jen
  admob, app, native-purchases) → notify.available = false, řádek v Nastavení se v aplikaci vůbec neukáže. Přidat plugin + povolení.
- [R] **Návštěvník trestá nového hráče**: první návštěvník přijde vždy 120 s po startu (visitT = 120), náhodně z 5. Hygienik: úplatek
  = výdělek za 120 s (aktivní hráč ho nikdy nemá, „chybí 5,46K“), Riskovat = 50 % ztráta min(coins, výdělek za 300 s) = všech coins.
  Muž v kabátě: „chybí 128K“. Návrh: do 1. hygieny jen návštěvníci bez ztráty; cena nejvýš polovina coins; pokuta nejvýš 30 % coins.
- [R] **Past „bar plný – číšníci nestíhají“**: od 3. do 10. minuty robot kupoval úrovně pípy/kuchyně a výdělek stál (706 → 772 /s),
  protože 3. číšník (400 coins) a body číšníků jsou schované v malých kolečkách bez popisu a žádný úkol na ně nevede.
  Návrh: úkol „Najmi 3. číšníka“ + šipka, při plném baru tlačítko na kartě pípy „Číšníci“ místo zbytečného +1.
- [R] Chybí výzva k hodnocení v obchodě (Play In-App Review) – po 3. hygieně / 2. den.
- [R] Název v obchodě „Pajzl Tycoon“ anglicky nikdo nehledá → „P.U.B. Idle: Pub Tycoon“; popis obchodu přeložit do všech 11 jazyků hry.
- [R] Snímky v obchodě bez titulků (tmavé, hodně textu) – přidat velký nápis nad každý snímek.
- [R] Žádné měření (analytika) – po vydání nepůjde poznat, kde hráči odcházejí. Žádná záloha do cloudu (jen ruční Uložit/Nahrát).
- [HOTOVO h70] Okno po návratu psalo o soupeři v lize, i když je liga zamčená (do 20. hygieny). npm run sim po jménech podle jazyka.
- V pořádku: návod 45–70 s bez zaseknutí, 14 min hry bez chyby v konzoli, 26 obrazovek anglicky bez přetečení, okno po návratu (×2 za
  reklamu), potvrzení hygieny, první noc, nová hospoda; skript 6–7 % jádra, 20 MB paměti; první hygiena ~9 min (sim).
- Neověřeno (jen na telefonu): reklamy, nákupy, tlačítko Zpět, zvuk, výkon na slabém telefonu.
