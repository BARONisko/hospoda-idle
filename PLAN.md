# P.U.B. Idle – Pajzl Tycoon · plán prací

Idle (inkrementální) hra pro mobil na výšku se stejným námětem a grafikou jako P.U.B. – Pajzl u Berana
(repo `BARONisko/hospoda` – tu hru NEMĚNIT, odtud se jen kopíruje grafika kreslená kódem `src/gfx`).

Koncept A (schválen uživatelem): manažer hospody. Stanice (pípa, kuchyně, sklep se sudy, kostky…) s úrovněmi,
kostlivci jako obsluha = automatizace, peníze tečou i offline, prestiž = hygiena hospodu zavře a otevřeš o patro
níž (Pajzl → sklepní krčma s příšerami → Žabákův podnik → Cthulhu) s trvalým bonusem (krígly).

## Rozložení obrazovky (schváleno uživatelem)
1 hospoda: výhled nahoře + karty stanic dole. Po 1. prestiži se obrazovka rozdělí na 2 pruhy (Pajzl + sklepní krčma),
po 2. prestiži na 3 (+ Žabákův podnik) – víc ne. Všechny hospody pořád žijí; „▲ Stanice“ vysune panel s kartami.
Ladění: ?pubs=2|3 (přidá hospody), ?mock=a|b|c (staré návrhy rozložení).

## Pracovní části
1. **Kostra** ✅ – Vite + TypeScript + Phaser 3, 540×960 na výšku (FIT), grafika z P.U.B., ukládání,
   velká čísla (K, M, B, T, aa…), 4 stanice s cyklem, nákup úrovní, obsluha (automatizace).
2. **Hospoda ožije** ✅ – pípy, stoly, hosté chodí a sedí, hostinský točí, kostlivci u stanic, animace výdělku,
   ťuknutí do hospody = spropitné. Lepší tlačítka (×1 / ×10 / max), zvuky.
3. **Offline výdělek** ✅ – okno „Zatímco jsi byl pryč…“ (běží jen stanice s kostlivcem, strop 8 h, hlásí se od 1 min,
   i po návratu do karty; ladění `?away=<s>`). ×2 za reklamu až v části 9.
4. **Milníky a vylepšení** ✅ – milníky úrovní (×2 na 25/50/100…, oslava), obchod (×3 vylepšení stanic, 3 stupně),
   manažer každé hospody (Beran / Sudomor / Žabák) se schopností „hodina“ ×3 na 30 s, nabíjení 5 min. Ladění `?coins=N`.
5. **Prestiž** ✅ – „Zavolat hygienu“ v Obchodě (od 10 krígel): reset coins/úrovní/vylepšení/manažerů, krígly =
   √(výdělek v běhu / 100 000), každý +2 % výdělek navždy; přibude další hospoda (max 3). Později: utrácení krígel, Cthulhu?
6. **Události s ťukáním** ✅ – každé 1,5–3 min v náhodné hospodě: zlatý sud (60 s výdělku), nájezd žab (6× 6 s),
   netopýr = upíří hodina (×2 na 60 s), banshee karaoke (12 ťuků za 9 s = 120 s výdělku). Ladění `?ev=gold|frogs|bat|banshee`.
7. **Sbírka a úkoly** ✅ – tlačítko „Menu“ = panel se záložkami Obchod / Úkoly / Sbírka: 3 denní úkoly (odměna 5 min výdělku),
   18 úspěchů (každý +1 krígl), bestiář 20 druhů hostů (siluety neviděných). Červená tečka = je co vyzvednout.
8. **Zvuk, hudba, jazyky** ✅ – hospodská polka (Web Audio), nastavení ⚙ v Menu (zvuky, hudba, jazyk), cs + en + 10 jazyků
   (src/i18n/locales).
9. **Mobil** ✅ – GitHub Pages (https://baronisko.github.io/hospoda-idle/), PWA + service worker (hraní bez internetu),
   ikona na plochu, příprava Capacitor (capacitor.config.json, návod v README), rozhraní reklam src/core/ads.ts (×2 offline).
10. **Balanc a testy** ✅ – `npm run sim` (chamtivý hráč: 1. prestiž ~34 min ideálně, další běhy 7–9 min),
   `npm test` (headless test celé hry: nákupy, Menu, obchod, manažer, události, úkoly, prestiž, offline).

## Po plánu (rozšíření)
- Návod pro nového hráče (6 kroků, bublina + šipka) – `d.tut`.
- Obchod s krígly (záložka Krígly v Menu): rychlejší kostlivci, startovní kapitál, delší spánek (offline +4 h),
  rušnější hospoda (častější události), věrní manažeři, Probudit Cthulhu (×10 navždy, Cthulhu kouká do hospod).
- Manažeři jsou vidět za barem (tapster / count / deep0).
- 4. hospoda Chrám Cthulhu (po 3. hygieně): rozložení C schváleno – pruhy 380 px posuvné prstem, ukazatel posunu vpravo.
- Víc života: objednávky hostů (bublina → pivo/jídlo), vybavení podle úrovní stanic, sezóny (Vánoce, Dušičky, Pivní festival).
- Rozhodování: 5 návštěvníků s volbou, denní specialita (1 ze 3), výzdoba (8 drahých předmětů 100M–1aa, trvalé).
- Rvačka (přání uživatele, žádný vyhazovač): trvá, dokud hráč neťuká na rváče; mezitím hosté odcházejí, výdělek klesá až na 20 %.
- Pivovar: pomalé vaření i offline, pivo prodat / vložit do vylepšení (rychlost, tank, cena, trvalý bonus). Menu má 2 řádky záložek.
- Den/noc (8 + 4 min reálného času): ve dne coins, v noci příšery platí kostmi; vylepšení za kosti. Ladění ?night=0|1.
- Talismany (10, vzácné nálezy 3–6 %, vylepšení za kosti donekonečna) a staty (src/core/talisman.ts: income, tips, events,
  bones, brew, offline, krigly, skill, evfreq, cycle) – sem se budou přidávat další zdroje statů.
- Hostinský na úrovni (XP, body, strom 3×5 uzlů) a týdenní výzva (jistý talisman + 5 krígel).
- Soupeřova hospoda: zatím jen návrhy (čeká na výběr uživatele).
- Hra do složky (offline): složka `HRA/` v repu (HRA/index.html dvojklikem; po pushi ji aktualizuje workflow Pages), `npm run build:offline` → `dist/PUB-Idle.zip` (složka PUB-Idle, celá hra v jednom index.html,
  spustí se dvojklikem z disku). Na Pages ke stažení v ⚙ „Hra do složky“. Postup se ukládá zvlášť od webové verze.
- Krígly v2 (hospoda 55): Delší spánek +30 s/úroveň, spánek celkem max 12 h; Rušnější hospoda po 2 úrovních jen −1 %/úr.;
  „Probudit Cthulhu“ → Zlatý výčep (×1,5, ×1,75, ×2 …, cena 300·3^n; Cthulhu v hospodách zrušen);
  Štědří hosté → Věrnost hostů (1 XP za příchod hosta, max úr. 10, 1. úr. 20 000 příchodů, ×1,3; +5 % spropitného/úr.;
  d.gxp). Staré krígly za spánek a Štědré hosty vráceny (d.kup2). Kostlivci obsluhy občas donesou jídlo hostovi / sud k pípě.
  Rvačka jen na podlaze (ne u horní zdi). Stará 4. hospoda Chrám Cthulhu se ze starých uložení odebere (chrám = víkendová událost).
- Chrám: kolo 45 s, inkoust jen stíráním; 5 obtížností (I–V: HP ×1/3/8/20/50, víc chapadel/inkoustu/hlubinných, odměny
  ×1/1,6/2,5/4/6, krígly za poražení), každá má vlastní uložené HP (d.temple.lv, diff, maxD), další se odemkne poražením předchozí.
- Rádce „Co dál?“ (varianta C schválena): po 20 s bez ťuknutí hostinský poradí další krok (advice() v PubScene – úkoly, schopnost,
  kostlivec, obchod, hygiena, krígly, hostinský, pivovar, chrám, jinak na co šetřit), pak nejvýš 1× za minutu; „Ukaž“ otevře místo.
- Přání uživatele: přírůstky za úroveň POD 1 % u všeho kromě obchodu za coins – talismany 0,9 %/úr. (Pírko offline +0,05 h),
  pivovar (bonus, rychlost vaření, cena piva) 0,9 %/úr., krígly: Rychlejší kostlivci −0,9 %/úr., Hlubší sklep +0,9 %, chrám: Obětní dýka +0,9 %.
  Výjimky dané uživatelem: Zlatý výčep (+0,25×), Věrnost hostů (+5 %).
- Bonus za krígl snížen z 2 % na 0,9 % (přání uživatele); Zlatý výčep a Věrnost hostů ponechány.
- Kultisté v chrámu dražší: 5 000 a 20 000 chapadel (důležitý upgrade pro postup).
- Chrám odměny: truhly vždy chapadla + často navíc kosti / krígly / trvalý stat (templeReward 'stat' → d.oss) / talisman.
  Obchod chrámu má záložky Hned / Oltář (týden) / Napořád; Oltář: 3 náhodné procentní staty každý víkend, +0,9 %/koupi,
  platí do dalšího víkendu (d.temple.altar), cena 300·1,5^n. Kultisté 5 000 / 20 000 (potvrzeno).
- 10 nových statů (talisman.ts): coll, mgrcd, brawl, visit, golden, gxp, beer (Kostnice + chrám), cultgain, candlesave, weak
  (jen chrám – TEMPLE_STATS). Efekty v PubScene/TempleScene/events.
- Truhly v chrámu se otevírají až na konci kola (T.pend) s efektem otevření (bez kola – hazard ne; chapadla vždy; kosti/krígly/stat/talisman/plná truhla ×2).
- Šipky (src/core/darts.ts, src/scenes/DartsScene.ts; dlaždice v Menu místo Den a noc, Den a noc je tlačítko v Kostnici):
  hra na nulu: 301 a každá dohraná hra +20 (target), přestřelený hod se nepočítá; 10 šipek/h, start 100, zásoba bez házení 60.
  Ručně se NEmíří – jen automatické házení po 2 s (ZAP/VYP), zapnuté hází i offline (max 12 h šipek). Terč z P.U.B. (makeDartboard).
  12 vylepšení terče (políčka po úrovních) + 8 do celé hry (+0,9 %/úr.: výdělek,
  spropitné, kosti, chapadla, síla v chrámu, krígly, sběrač, pivo). Do šipek: Kostnice (přesnost, rychlejší šipky), chrám (bod navíc).
  Šipky přeložené do všech jazyků.
- Šipky balanc: cíl 301 +10 za hru (strop 1001), krit/kombo nikdy nepřestřelí (dřív kombo zablokovalo konec hry), levnější
  vylepšení terče (celkem 874 bodů ≈ 56 dní), do celé hry 8 × 100 úrovní, cena 1,055^l (≈ 366 dní vše – přání: na rok).
- Propojení částí: pivovar → šipky rychleji (+0,5 %/úr.), sběrač → chapadla (+0,3 %/úr.), hostinský → síla v chrámu (+0,5 %/úr.),
  liga výhra → +3 body šipek, poražený Cthulhu → +2×obtížnost bodů šipek, dohraná hra šipek → +3 kosti a +5 XP hostinského;
  šipky → 8 statů celé hry; Kostnice → šipky (přesnost, rychlost); chrám → šipky (bod navíc).
- Hospoda 56: tutoriál – když na nákup (úroveň pípy, kostlivec, kuchyně) nejsou coins, bublina ukáže „Ťukej na Pípu (vlevo)
  a sbírej coins: 4 / 6. Pak kup vpravo.“ (po najmutí: počkej na coins), světlá je celá karta a šipka míří na ťukání;
  jakmile coins stačí, přepne se na nákup. Šipky: od zbytku 60 hod, který by přestřelil, dopadne do mířeného pole
  (zbývá 1 → opravdu hodí jedničku; vedle terče jde hodit dál). Automat se zase kupuje (1 bod, „Koupit automat“ na
  terči i v obchodě); bez něj se hází ťuknutím na terč (míří se samo), offline nic. Dosavadní hráči automat dostali (darts v3).
- Návod: nový hráč začíná s 6 coins (hned koupí 2. úroveň pípy); u ťukání na pípu je zvýrazněná přesně levá část karty,
  šipka nad ní a pulzující kruhy s nápisem „ŤUKNI SEM“ přímo na pruhu karty.
- Návod opraven podle průchodu „slabšího hráče“ (tools/tutwalk.mjs – ťuká doprostřed zvýrazněného místa, snímek každého kroku):
  během návodu nepřijde noc (dřív mohl nový hráč začít v noci a sbírat kosti místo coins) a nezačnou události; po konci
  návodu začne celý nový den; rámeček u nákupu/kostlivce je přesně kolem tlačítka; v Menu ukazuje na skutečnou dlaždici
  Obchod (dřív na zamčenou 1. dlaždici – návod se zasekl). Bez peněz na kostlivce: „Ťukej na Pípu … 2 / 100“.
- Hospoda vyplní celou šířku (přiblížení na šířku, střed na sloupcích 1–17): zmizel černý pruh vlevo (vnější zeď) i useknutý
  pravý okraj; nahoře/dole se ořízne jen kousek zdi.
- Hospoda 56 (pokr.): první kostlivec na pípě stojí 50 coins (dřív 100). Šipky: zrušen přesný dohoz – přestřelený hod
  se zase jen nepočítá (tak to uživatel myslel). Efekty B (src/ui/juice.ts: confetti, rays, bigText, coinFountain, popText,
  punch, flashRect) + zvuky (sfx.levelUp, pop, coinRain, combo, cheer): milník = paprsky, „ÚROVEŇ 25!“, konfety, mince
  do počítadla, otřes; nákup = záblesk karty, „+1 úr.“, jiskry; kostlivec = konfety; rychlé ťukání = KOMBO ×N (stoupající
  tón, každých 10 konfety); počítadlo coins poskočí při výdělku. Šipky – oslava dohrané hry (A + diváci z B): konfety
  z vítězné šipky, zlatý kruh, „PŘESNĚ NA NULU!“ s odměnami, diváci v bublinách, fanfára + jásot.
- Šipky v hospodě: když automat dohraje hru a hráč je v hospodě, shora vyjede karta „Šipky: hra 7 dohraná! +1 b. na
  vylepšení · ťukni a utrať“ s konfetami a jásotem (5,5 s); ťuknutí otevře šipky (PubScene.dartsNotice).
- Číšníci roznášejí pivo (hospoda 57, uživatel vybral Q1 = B, Q2 = každý zvlášť, Q3 = lidé, UI = návrh B):
  pípa s kostlivcem točí piva na bar (src/core/waiters.ts), coins až po doručení ke stolu; bar max 12 piv, plný bar = pípa
  stojí („bar plný – číšníci nestíhají!“ na kartě Pípy). Piv za cyklus = 1 + počet milníků pípy (25, 50, 100 …).
  S kostlivcem na pípě nastoupí zadarmo Franta a Jarka, 3. Bořek 400, 4. Vilma 4 000 (× násobek hospody). Každý má vlastní
  vylepšení: Rychlost chůze (20 úr.), Podnos (1→4 piva), Úsměv (+1 % spropitné/úr., 10 úr.). Lišta 4 číšníků dole
  v hospodě (PubScene.addWaiterChips/openWaiter), postavy chodí bar → ulička → host (PubView.waiterTrip), hrnky na baru
  + „n/12“. Noc beze změny (kosti rovnou, číšníci stojí). Offline = min(výroba, kapacita roznosu). Ruční ťukání na pípu
  (před kostlivcem) vydělá hned. Sim: začátek ~stejně, prestiž ~5 % rychleji (uživatel chtěl 5 %; Úsměv +1 %/úr.); návod: čekání na 60 coins 45→55 s.
- Číšníci: vylepšení už NE za coins, ale za body ze zkušeností (přání uživatele): 1 XP = 1 s roznášení (i offline,
  jen přes den, podle vytížení); úroveň L→L+1 stojí 55·1,4^L XP, všech 33 bodů ≈ 9 mil. s práce ≈ rok (~10 h výroby
  denně). Body se utrácí v panelu číšníka („+1 bod“), zelená tečka na liště = volný bod. Číšníci (XP, body, najmutí)
  zůstávají i po hygieně; před kostlivcem na pípě nepracují (hosté dostanou pivo samo). Najímání 3./4. dál za coins.
  Dřív koupená vylepšení zůstala (XP doplněno). Sim: 1. prestiž stejně, 40 krígel ~7 % rychleji.
- Na Pípě už není kostlivec: tlačítko „Číšníci 50“ najme Frantu a Jarku (pípa pak točí sama, oni roznášejí); 3. a 4.
  číšník na liště za coins, vylepšení dál za body ze zkušeností. Návod/rádce mluví o číšnících. Migrace wv2: dosavadní
  číšníci prodáni – vráceny coins za najmutí, vylepšení (staré ceny), kostlivce na pípě a piva na baru; hráč je koupí znovu.
- Kostlivci u stanic zrušeni (přání uživatele): práci kuchyně, sklepa a kostek dělají lidé – číšníci (looky staffK/C/D),
  všude „Číšník {n}“ / „číšník ✓“, úspěch „Číšníci u všech 4 stanic“, Kostnice „Rychlejší obsluha“, offline „číšníci
  pracovali“, stanice 2. hospody „Kostky v kobce“. Kostlivci zůstali jen jako noční hosté a Kostňák v Kostnici.
- Žádní pracovníci u stanic (přání uživatele): v hospodě nic nenosí nikdo kromě 4 číšníků z lišty (piva). Kuchyně, sklep
  a kostky po najmutí („Číšník …“ na kartě) jen běží samy, bez postavy; jídlo hostům se objeví samo jako dřív. Místo
  u kostek je volné pro hosty.
- Místo u kostek zase zabrané. Jídlo nosí číšníci z lišty: kuchyně s obsluhou přidá talíř do fronty (max 6, p.food),
  číšník ho vezme, když na baru nečeká pivo (pivo má přednost; coins za jídlo dál dává kuchyně hned). Hosté s objednávkou
  jídla dostanou talíř až od číšníka (když kuchyně běží sama a číšníci jsou najatí).
- Obsluha stanic (finální přání uživatele): Pípa = Číšníci (Franta, Jarka + lišta), Kuchyně = Kuchař (vaří, nic nenosí),
  Sklep = Sklepník (stojí u sklepa), Kostky = Kostlivec (sedí a hraje). Nosí jen číšníci. Jídlo vydělá až po donesení:
  kuchyně s kuchařem dá talíř k výdeji (max 6, p.dish {n,v}, talíře u kuchyně), plný výdej = kuchyně stojí („talíře čekají
  – číšníci nestíhají!“). Číšník vezme to, čeho čeká poměrně víc (bar / výdej). rate/offline: pípa + kuchyně × min(1,
  kapacita / (piva/s + talíře/s)). Texty: „Obsluha u všech 4 stanic“, „obsluha pracovala“, „Kostky s kostlivcem“ zpět.
- Šipky v reálném čase (přání uživatele): automat na pozadí hází nejvýš 1 šipku za 2 s (DartsState.tat), po zavření
  terče naváže od teď – zásoba se nikdy neodhází najednou (dřív 71 šipek při návratu do hospody). Automatické házení je
  první vylepšení: ostatní (i „Do celé hry“) mají „nejdřív automat“, dokud ho hráč nekoupí.
- Chrám: zisk truhly v boji má velký efekt (TempleScene.chestFx: „TRUHLA!“, paprsky, konfety, truhla vyskočí a odletí
  nahoru, otřes, záblesk, levelUp + jásot); otevření truhly navíc paprsky, 2× konfety, otřes, déšť mincí a jásot.
- Šipky offline: automat offline nehází, šipky se jen ukládají (max 12 h přírůstku); po návratu hází 1 za 2 s
  (darts.OFFLINE_GAP 10 s: delší mezera mezi tiky = hra byla zavřená → tat = teď). Texty v šipkách upraveny.
- Číšníci pomaleji (přání uživatele „~20× pomaleji“, wv3 = všem vynulovány úrovně a body): xpFor(p) = 40 000·p^1,7
  (1. bod ~1. den, 5 bodů ~2 týdny, 10 ~1,5 měsíce, všech 33 ~rok při ~12 h roznášení denně). Pípa točí 1 pivo za cyklus
  (ne +1 za milník – s pomalými číšníky prestiž trvala 1,2 h). Sim: prestiž ~stejně jako bez číšníků (35 min, 5,3 h na 40 krígel).
- Číšníci max 3 (přání uživatele, ať je aspoň trochu čekání): poptávka pípa 0,67 + kuchyně 0,25 = 0,92 věcí/s vs 3 číšníci
  bez vylepšení 0,86/s → ~7 % čekání, Rychlost/Podnos ho odstraní. Kdo měl Vilmu (4.), dostal zpět 4 000 × násobek hospody.
- Upozornění na mobilu (src/core/notify.ts, rozhraní jako ads.ts): Menu → Nastavení → Upozornění (zapnout = žádost
  o povolení). Při odchodu ze hry se naplánuje „Hospoda je plná!“ (za strop offline offCap), „Toulec je plný“ (šipky bez
  automatu) a „Víkend v chrámu začíná“ (sobota 9:00, když je chrám odemčený); při návratu se zruší. Aplikace (Capacitor):
  plugin LocalNotifications přes window.Capacitor (přijdou i při zavřené hře – plugin @capacitor/local-notifications
  bude potřeba přidat při stavbě aplikace). Web/PWA: Notification API + časovač, jen dokud prohlížeč stránku nechá žít.
- (HOTOVO níže) VIP host – přijde zhruba každé 4 h, čeká 30–60 min s odpočtem v bublině,
  obslouží se ťuknutím na něj (velká odměna, např. 2 h výdělku), při příchodu upozornění na mobilu (notify.ts, id 5).
  Není to o náhodě – jde o vrátit se včas. Návrhy vzhledu A/B/C (korunka + kroužek / koberec + cedule / reflektor +
  pruh nahoře) poslány uživateli, čeká se na výběr. Čekají i výběry denní truhly A/B/C a nabídky za reklamu A/B/C.
- HOTOVO (výběr uživatele: truhla A, reklama C, VIP C po 6 h) – src/core/special.ts + PubScene (speciální nabídka):
  - Menu → „Speciální nabídka“ (dlaždice před Nastavením): Reklamní kampaň (zhlédnutí = výdělek ×1,2 na 4 h, každé
    zhlédnutí +0,02 do násobku (max +0,4), „Lepší reklama“ za krígly 10/30/90/270 po +0,1 (4×) → max ×2; další zhlédnutí
    prodlouží o 4 h, nejvýš 12 h dopředu; platí i offline jen po dobu běhu), Denní truhla, „Bez reklam“ a „Balík krígel“
    (zatím „brzy“). Na webu bez reklamní sítě: „jen v mobilní aplikaci“ (?fakeads=1 pro ladění).
  - Denní truhla (kalendář 7 dní): 1. 2 h výdělku, 2. 5 kostí, 3. 20 šipek, 4. 4 h výdělku, 5. 10 kostí, 6. 1 krígl,
    7. zlatá: +1 bod číšníkovi s nejméně body + 3 krígly. Vynechaný den = série od 1. ×2 za reklamu. Ikona truhly
    v hospodě vpravo nahoře (jen když je připravená, po návodu), tečka na Menu.
  - VIP host (návrh C): poprvé 20 min po návodu, pak každých 6 h; čeká 30–60 min v uličce vpravo s reflektorem
    a hvězdou, pruh nahoře s odpočtem. Ťuknutí na něj (nebo na pruh) = 2 h výdělku. Nestihne-li se, odejde.
  - Upozornění: + „Přišel VIP host!“ (id 5) a „Denní truhla je připravená“ (zítra 10:00, id 3).
- NÁVRH (čeká na výběr uživatele): prémiová měna za peníze – A „Zlaťáky“ (obchod: Urychlení/Automatika/Speciální/Koupit,
  časoskoky, turbo, dovařit pivovar), B „Štamgast“ (předplatné 99 Kč/30 dní + Pivní sezóna s pasem, známky jen bonus),
  C „Diamanty“ (trvalé automaty: úrovně, hygiena, truhla, VIP vrátný, noční směna 24 h). Doporučeno A+C (jedna měna,
  záložka Automatika = trvalé věci). Zdarma po troškách (7. den truhly, VIP, úspěchy). Liga bez vlivu časoskoků.
- HOTOVO (výběr uživatele: modré diamanty + Štamgast pass, od každého návrhu něco, „zlatá střední cesta“):
  Speciální nabídka má 3 podzáložky (PubScene.spSub): Nabídka (kampaň, denní truhla, Bez reklam 99 Kč) ·
  💎 Diamanty (z A: Časoskok 4 h 20 💎 / 24 h 90 💎 – do ligy se nepočítá; z C trvale: Sběrač truhel 200 💎 = denní
  truhlu otevře sám, VIP vrátný 300 💎 = obslouží VIP, kterého hráč nestihl, i offline max 4; balíčky 100 💎 49 Kč,
  550 💎 199 Kč) · Štamgast (z B: karta 30 dní 99 Kč: výdělek ×2 i offline, VIP vrátný, truhla/kampaň/×2 bez reklam,
  denně 20 💎 tlačítkem). Diamanty zdarma: VIP +2 💎, zlatá truhla +10 💎. Nákupy: src/core/shop.ts (rozhraní jako
  ads.ts, na webu „jen v mobilní aplikaci“, ?fakeshop=1 na zkoušku). Uložení: gems, pass, own[], noAds.
- SCHVÁLENO uživatelem: ceny a obsah diamantů 💎 i Štamgast passu (9e01a44) sedí.
- NÁVRH (čeká na výběr uživatele): přepracovat hlavní vylepšování stanic, aby hráč volil směr a přemýšlel,
  i mezi hospodami (teď 3. hospoda zastíní 1.: actMult 50^(act−1) násobí cenu i výdělek stejně → do Pajzlu jde
  v simulaci 0,04 % útraty). Bez vyskakovacích oken, přímo na kartách a ve hře. Snímky tools/_tmp/navrhA–C.png
  (tools/_tmp/mock.mjs), simulace `PROP=A|B|C node tools/sim/run.mjs`:
  - A Zásobování: každý milník stanice v nižší hospodě = +50 % stejné stanici ve všech vyšších (vozík se sudy).
  - B Hvězdy hospody: ⭐ když všechny 4 stanice dosáhnou dalšího milníku; ⭐ = hospoda ×1,5 a +10 % všem
    hospodám; karta nejslabší stanice „brzdí ⭐ – chybí N úrovní“.
  - C Styl hospody: stanice s nejvíc milníky určí styl (Pivnice/Jídelna/Sklípek/Herna) = ×2 + perk, cedule
    a hosté ve hře; různé styly v hospodách +25 % každý navíc.
- Simulace opravena: dřív nikdy neotevřela kuchyň/sklep/kostky ani další hospody (otevření bez obsluhy nic
  nevydělá) – teď otevření + obsluha jako jeden krok a „skutečný hráč“ otevře stanici, když má 3× cenu.
  Nové základní časy: 1 hospoda prestiž 32 min, 40 krígel 2,1 h (dřív hlášeno 35 min / 5,3 h).
- HOTOVO (výběr uživatele C + A): styl hospody a zásobování (economy.ts: STYLES, pubStyle, styleGap, styleMix,
  supplyIn/Out, styleSupplyMult; PubScene.pay × styleSupplyMult).
  - Styl: stanice s nejvíc milníky (aspoň 2 = úroveň 50, bez remízy) určí styl – sama ×1,25, karta se zlatým
    rámem „♛ Pivnice“, cedule nahoře v hospodě. Výhody: Pivnice spropitné ×2 (ta hospoda), Jídelna schopnost
    manažera o 50 % delší (ta hospoda), Sklípek spánek +1 h, Herna události o 25 % častěji. Různé styly napříč
    hospodami +25 % všude za každý další. Ostatní karty: „Jídelna: chybí 2 milníky“. Při změně stylu banner.
  - Zásobování: každý milník stanice v nižší hospodě = +15 % stejné stanici ve všech vyšších; karta „▶ zásobuje
    +X %“ (nižší hospoda), „zásoby ×N“ (vyšší). Pruh karty zkrácen na 150 px, text vedle (při varování plná šířka).
  - Sim (opravená): 1 hospoda prestiž 32 → 27 min, 40 krígel 2,11 → 1,93 h (čísla stažena z ×1,5/+25 %).
- NÁVRH uživatele (čeká na upřesnění): hvězdy stanice – úroveň 500 = ⭐ (+10 %), platí po vynulování (hygieně),
  další ⭐ několikrát dražší, max 5.
- HOTOVO (přání uživatele): hvězdy stanic jako rámečky – úroveň 500/400/300/300 (Pípa/Kuchyně/Sklep/Kostky) v běhu
  = po hygieně +1 hvězda (max 5, uložení stars `${act}_${id}`); každá +10 % výdělek celé hospody, úrovně té stanice
  10× dražší za hvězdu. Karta: rámeček bronz/stříbro/zlato/modrá/fialová + 1–5 hvězdiček za názvem, v řádku úrovně
  „★ 500“ (cíl), vedle pruhu „★ 2. hvězda po hygieně“.
- HOTOVO (přání uživatele „menší čísla“): hospody 10× místo 50× (ACT_STEP), krígly = ⌊2·(tržba/1e5)^¼⌋ (dřív √),
  PRESTIGE_MIN 10 → 6, Věrní manažeři 100 000 → 200 krígel. Přepočet uložení (eco2): krígly → ⌊2·√K⌋, coins
  a tržba běhu ÷ 5^(nejvyšší hospoda−1), banner „Nová ekonomika: krígly A → B“.
  Sim: 1 hospoda 1. hygiena 15 min, prestiž (6 krígel) 25 min.
- HOTOVO (výběr uživatele C): návod čitelněji – tmavá cedule se zlatým rámem, „krok x/8“, velký zlatý pokyn
  (TUT.head, 46 px) a pod ním vysvětlení běžným tučným písmem (Arial 22 px, bílé). Bez peněz „SBÍREJ COINS: c / n“.
  Během návodu karty bez řádků stylu/zásob; „chybí N milníků“ až od prvního milníku, „★ 500“ až od půlky cesty.
- ČEKÁ: kamarád uživatele neví, co dělat po návodu → návrh lepšího vedení (viz odpověď v chatu, hospoda 59).
- HOTOVO (přání uživatele „kamarád neví, co dělat“): průvodce novinkami (PubScene guide*: fronta d.guideQ, ukázané
  d.guides). Stejný vzhled jako návod C + šipka a pulzující zlatý rámeček kolem cíle, kroky čekají na akci hráče
  (nebo tlačítko Dál/Rozumím). Spouští se: po hygieně nová hospoda (záložka → kup pípu → najmi číšníky → hospody
  běží naráz), první noc (místo okna: noc = kosti → ťukni na příšeru → kde kosti utratit), každá nově odemčená
  dlaždice menu (místo banneru: ťukni na Menu → ťukni na dlaždici + co to dělá → Rozumím).
- Číšníci na pípě 50 → 15 coins (přání: ~10 ťuknutí a pak automat). Okno nové hospody: „{m}×“ = ACT_STEP.
- HOTOVO (přání uživatele): Nastavení → „Začít znovu“ (Smazat hru → do 6 s „Opravdu? Ťukni znovu“ → smaže uložení
  a načte hru od návodu; wipe() zamkne ukládání). Řádky Nastavení se zmenší, aby se vše vešlo na obrazovku.
- HOTOVO ÚKOL OD HOSTINSKÉHO (výběr uživatele: lišta A nahoře + obrázek 3 = pixel úkolníček s červeným „!“):
  src/core/quests.ts (QUESTS ~31 úkolů: úrovně, otevřít/obsluha stanic, obchod, spropitné, části menu, styl, kosti,
  hygiena, …; nedostupné se přeskočí – avail), PubScene q*: lišta přes horní okraj hospody (pod záložkami),
  postup + odměna (1 min výdělku, min 30), UKAŽ = pulzující rámeček + šipka (Menu → dlaždice → řádek v Obchodě /
  karta / host), po splnění zelená „VYBER +N“. Uložení d.q (hotové), d.qTiles (navštívené dlaždice). Staré hry:
  při prvním načtení se splněné úkoly označí bez odměny. Schopnost manažera, truhla a cedule stylu se posunou o lištu.
  Lišta skrytá během návodu a průvodce novinkami.
- HOTOVO (stížnost uživatele „v menu otravná cedule SPECIÁLNÍ NABÍDKA + Rozumím“): velká cedule průvodce jen na hlavní
  obrazovce; v otevřeném menu jen šipka a rámeček na dlaždici, po ťuknutí konec (krok „Rozumím“ zrušen, vysvětlení
  je už v ceduli s „ťukni na Menu“). Průvodce s cedulí (nová hospoda, noc) počká na zavřené menu.
- HOTOVO (přání): cedule stylu hospody (PIVNICE…) vpravo v rohu, pod truhlou, když je vidět.
- HOTOVO (hlášení: nápis vlevo nahoře jen z půlky): banner a oslava milníku vždy uprostřed výhledu hospody (dřív podle kamery 1. hospody, která při jiné vybrané hospodě mohla mít špatný rámeček), dlouhý text se zalomí a zmenší.
- HOTOVO (stížnost uživatele: návod „ťukni na hosta“ ukázal hosta bez bubliny): spropitné dá JEN host s bublinou
  (objednávkou) – ťuk na bublinu nebo na hosta, který ji má; host bez bubliny nic. tipTarget míří na bublinu.
  Během kroku „ťukni na bublinu“ (návod i noční průvodce) bubliny samy nezmizí (PubView.hold). Cedule u tohoto kroku
  dole přes karty, ať šipka nepřeškrtne text. Texty „ťukej na hosty“ → „ťukej na bubliny hostů“.
- Zadání uživatele (naštvaný): „přeplněno upozorněními – zredukuj, dej návrhy“. Návrhy docs/navrhy-upozorneni
  (A fronta, B toasty, C ticho). HOTOVO výběr A: fronta upozornění (PubScene ntfPush/ntfNext) – banner(), oslava
  milníku i karta Šipek se ukazují vždy jen jedna naráz (milník 2 s, šipky 2,6 s, nápis 1,9 s), stejný text se
  nezařadí dvakrát, čekají nejvýš 3 (zahodí se nejstarší obyčejný nápis, výzvy k akci a milníky zůstanou),
  co čeká přes 10 s, zahodí se.
- HOTOVO (přání): cedule stylu (PIVNICE) vpravo nahoře, truhla pod ní (signBot), když je k vyzvednutí.
- HOTOVO (přání): konec návodu – v menu jen šipka na křížek, cedule HOTOVO! (s konfetami) až po zavření menu na hlavní obrazovce na 4 s (tutFinale); průvodce novinkami a lišta úkolu počkají.
- HOTOVO (hlášení: počet piv na pultu schovaný pod lištou úkolu): „11/12“ teď pod korbely na přední hraně pultu, větší a s tmavým podkladem.
- OPRAVA (hlášení: hra před první hygienou přestala reagovat): po hygieně (scene.restart) zůstávaly odkazy na zničené objekty (lišta úkolu qUi, cedule stylu, truhla, VIP…) → chyba v každém snímku → zamrznutí. create() je teď vynuluje. „Ještě ne“ v okně hygieny nechávalo awayObjs → hospoda zablokovaná.
- HOTOVO (přání: představit pivovar): mini průvodce při prvním otevření Pivovaru (d.brewTut 0–2, -1 hotovo): šipka + rámeček + 1 řádek textu – tank „vaří se samo“ (3,5 s), „první pivo zdarma – prodej ho“ (čeká na Prodat/Vylepšit, dostane 1 pivo), „piva jdou i na pivní akce“ (3,5 s). Kdo pivovar už viděl (guides tile:brew), nedostane ho. Oprava „1 piva“ → „1 pivo“.
- POJISTKA (hlášení „pořád nereaguje“ u hygieny): main.ts obalí Phaser Systems.step a Game.step try/catch – chyba už nezastaví smyčku hry; ukáže se červený pruh nahoře „Chyba (pošli snímek): …“ (ťuknutím zmizí), i pro window error a unhandledrejection.
- OPRAVA (hlášení: návod „NAJMI ČÍŠNÍKY“ visel, i když už číšníci byli najatí): tutTick posune návod, když je krok už splněný (číšníci, kuchyně, 2. úroveň pípy).
- OPRAVA (hlášení: po hygieně průvodce „OTEVŘI PÍPU“ nejde dokončit – 0 coins a nic nevydělává): po hygieně coins aspoň restartNeed() = (pípa + číšníci) nové hospody + číšníci v Pajzlu, ×1,2 (Sklepní krčma 276). Kdo uvízl (nová hospoda bez pípy a málo coins), dostane je při načtení.
- Zrušeny nápisy „KOMBO ×n“ (+ konfety a otřes) při rychlém ťukání na pípu – nic nedávaly a přes sebe zaplňovaly kartu; zůstal jen stoupající zvuk.
- HOTOVO (přání: po hygieně průvodce ukázal celé menu bez vysvětlení): menu se odemyká postupně – Chrám od 3. hospody, Liga po 3. hygieně, Kostnice po první noci, Pivovar/Výzdoba až po otevření kuchyně/sklepa (už ne všechno hned po hygieně); co jednou bylo odemčené (menuOpen), zůstane. Průvodce novinkou vždy s vysvětlením na hlavní obrazovce (čeká na zavřené menu) a mezi novinkami 90 s pauza (guideGapUntil).
- HOTOVO: Chrám – červená tečka jen do prvního otevření za den (d.templeSeen), na dlaždici „končí za 14 h 7 min“ / „otevře za 3 d 5 h“ (weekendLeft v temple.ts).
- HOTOVO (přání: hrál v menu a první noc mu utekla): první noc stojí na začátku (switchPhase(true) každý snímek), dokud hráč v průvodci noci neťukne na Dál; nápis „Padla noc“ se u první noci nezobrazí (je tam cedule).
- Test (npm test) 6b: hygiena jako skutečný hráč (lišta úkolu, VIP) – Ještě ne, hra po restartu běží, coins na rozjezd, průvodce novou hospodou; 6c: první noc stojí do Dál. (window.__night jen ve vývoji.)
- VÝKON (hlášení: telefon se přehřívá): strop 30 snímků/s (fps.limit, dřív až 120 na iPhonu), powerPreference low-power; fillRoundedRect v Graphics nahrazen 5 obdélníky se schodkovým rohem (dřív earcut v každém snímku – největší žrout). Měření headless: skript na snímek 15,8 → 3,4 ms.
- ČEKÁ: zúžit lištu úkolu? Poslední krok návodu (HOTOVO) má v menu velkou ceduli.
- Hospoda 62: vyvážení hygieny A+10 % (krígly = tržba ÷ 10^(hospody−1), každá další hygiena aspoň +10 % krígel; kola
  9 → 14 → 11 → … → 22 min, tools/sim/chain.mjs). Okno hygieny 2B (krígly teď → po, ×výdělek navždy, nová hospoda). 8bc52c4
- Cíl na obzoru: krígl s procenty v horní liště mezi coins a Menu (místo C; ve scéně zakrýval bubliny). Coins max 170 px.
  (výchozí krígl); ťuknutí otevře hygienu. ed9580b. Čeká na volbu uživatele.
- Postupné odemykání: 1. hygiena krígly · první noc Kostnice/Sběrač · 2. pivovar · 3. Chrám · 4. výzdoba · 5. šipky ·
  6. Liga (tileLock). Při prvním otevření nové části menu šipka na hlavní tlačítko + 1 řádek (tabTut, d.tabTut).
  Chrám a Šipky mají návod při prvním otevření (pointAt v ui/juice.ts, S.tut / T.tut; Chrám až o víkendu).
- Hrací plocha – návrh 4 (vybral uživatel, docs/navrhy-ui): spodní lišta Hospoda / Obchod / Úkoly / Menu (makeNav,
  NAV_H 84; shopBtn = položka Menu, takže návod/průvodce míří na ni), Menu z hlavičky pryč (×1 zůstává nahoře),
  krígl cíle mezi coins a ×1. Karty zjednodušené (CARD_H 88: název, úroveň, pruh, tlačítko; obsluha jen dokud není
  najatá; varování „číšníci nestíhají“ a „ťukni sem!“ zůstaly). Úkol od hostinského je nahoře v záložce Úkoly
  (UKAŽ zavře menu a ukáže šipkou, VYBER), lišta nad hospodou se nekreslí; tečka u Úkolů = je co vybrat.
  Přepínání hospod (záložky nahoře) beze změny. Otevřené menu zatím překrývá spodní lištu.
  Další kroky návrhu 4: Šťastná hodina / truhla / číšníci jako kulaté ikony vpravo ve scéně.
- Kulaté ikony (návrh 4): Šťastná hodina = kulaté tlačítko s bleskem (čas uvnitř), číšníci kulaté ikony, truhla v kruhu.
  Menu přes spodní lištu: návrh A (schovaná, teď) / B (vidět) v docs/navrhy-ui/menu-lista-A-B.png – vybráno A (lišta pryč, jak je teď).
- Skilly na rok: vybráno 2 (velký strom) + 3 (mistrovství stanic), návrh v docs/navrh-skilly.md – čeká na návrhy vzhledu.
- HOTOVO hospoda 63 – SKILLY NA ROK (výběr uživatele: strom B „tři cesty“ + odznak 1 „štít“; návrhy docs/navrhy-skilly/):
  - Velký strom hostinského (src/core/skilltree.ts): 3 cesty Výčep/Sklep/Noc × 40 uzlů = 120 (stezka 28 uzlů + 6 odboček
    po 2), kupuje se jen za koupeným. Malé uzly +0,3–0,9 %, každý 5. střední +2–3 %, cena 1–3 body, 12 hvězd (3–5 b.):
    Plný podnos, Spropitné samo (1×/min), Slavná hospoda (VIP 2×), Dlouhá hodina · Noční hlídač (+4 h offline), Druhý kotel,
    Dobrá pověst (5 % úrovní po hygieně), Hluboký sklep · Kostěné spropitné, Kostňák hraje sám (1×/10 min), Pověstné večery, Šťastná ruka.
    Celý strom ≈ 260 bodů. Body = úrovně; nová křivka XP: celkem 2,6·(L−1)^2,5 → běžný hráč ~200 bodů za rok (tools/sim/skills.mjs).
    Přerozdělení bodů u koupeného uzlu za krígly (5, 10, 15…). Převod: starý strom 3×5 → úroveň z celkového XP na nové křivce, body zpět (d.sk2).
  - UI: Menu → Hostinský: záložky Výčep/Sklep/Noc/Mistrovství, stezka zdola nahoru (posun prstem), šipka na další uzel,
    dole panel uzlu + KOUPIT (návod tabTut ukáže na KOUPIT). Hostinský se odemyká od 5. úrovně; nápis o úrovni jen když body byly 0.
  - Mistrovství stanic (src/core/mastery.ts): čas obsluhy stanice (součet hospod, i offline, přežije hygienu), stupeň s
    = 2100·s^2,56 s, 50 stupňů (Učeň→Legenda po 10), stupeň +0,8 % výdělku stanice, každá hodnost +4 % rychlost. Štít v barvě
    hodnosti s číslem na kartě vlevo u názvu; nápis jen při nové hodnosti. Test: npm test (strom, hvězda, mistrovství, převod, offline).
- Hospoda 63, přání uživatele: odznak mistrovství = varianta 2 (název hodnosti + 10 teček stupňů v řádku úrovně, místo štítu);
  mistrovství už NEzrychluje stanice („rychlost jak doposud“) – místo toho hodnost +2 % výdělku navíc (stupeň +0,8 %).
- Sběrač zdražen (src/core/collector.ts, výpočet tools/sim/coll.mjs): najmout 500 / 20 K / 300 K kostí, rychlost f·(100+(n+1)^1,5)
  (f = 1/3/9 podle hospody, max 1,5 s ≈ 298 úrovní), +1 bublina 1000·f·4^n, nejvýš 5. Celkem 13 M kostí → běžný hráč
  (~100 K kostí/den, třetina na sběrače) max ~13 měsíců, zapálený ~4 měs., 3. sběrač najmout ~3–9 dní (dřív za den).
- HOTOVO hospoda 63 – VĚRNOST HOSTŮ (výběr uživatele A + vzhled A2, docs/navrhy-skilly/vernost-A123.png; src/core/loyalty.ts):
  každé obsloužení hosta (bublina: ťuk, sběrač, hvězda stromu) = 1 bod jeho druhu (PubView.lastKey → tipReward, d.loy).
  Úrovně 1–5 (tečky) za 10/50/200/1000/5000; úroveň = +1 % spropitné od toho druhu; úroveň 5 = „věrný host“, zlatý rámeček
  a malý trvalý bonus (stat podle pořadí ve Sbírce, +0,9 %). Nová úroveň = jen plovoucí nápis u hosta (žádný banner).
  Sbírka: záložky po hospodách + Sezóna, velké karty (tečky + pruh), ťuknutí = detail dole. Test v npm test.
- Hospoda 63b (přání uživatele): hvězda stanice, stupeň mistrovství i úroveň věrnosti hosta dávají JEN 1 bod do stromu
  hostinského – žádné bonusy výdělku/spropitného, hvězdy už nezdražují úrovně (STAR_BONUS 0, STAR_COST 1).
  skillPoints = (úroveň − 1) + hvězdy + Σ stupňů mistrovství + Σ úrovní věrnosti − utraceno. Ceny uzlů ×2,5 (2/5/8, hvězdy +6),
  celý strom 654 bodů; koupené uzly jednou zdarma vráceny (d.sk3). Věrnost: prahy 300/1750/7500/18750/43000 → běžný hráč
  (~125 obsloužení druhu/den) má hosta na max za ~344 dní. Body za rok: slabší ~370, běžný ~610, zapálený ~750 (tools/sim/skills.mjs).
- Hospoda 63c: hvězdy stanic zase zdražují úrovně té stanice 10× za hvězdu (přání: body nejdou získat hned všechny), bonus
  výdělku dál 0. 5. hvězda světle fialová (PAL.pink, dřív plum – nebyla vidět). Dlaždice Hostinský ukazuje „úroveň N“ /
  „úr. N · body P“. V Hostinském tlačítko „body: N ?“ → panel Odkud body (úrovně, mistrovství, hvězdy, věrní hosté, utraceno).
  Návody (šipka + 1 řádek): Mistrovství (1. stanice), Sbírka (1. karta), Hostinský (KOUPIT). Po hygieně jeden nápis
  „★ Nové hvězdy stanic: n – +n b. do stromu“. Celkový test: npm test, build, tutwalk, delší hraní tools/_tmp/play.mjs.
- OPRAVA (hlášení: nejde ťuknout na truhlu): skrytá lišta úkolu (od návrhu 4 se nekreslí) měla aktivní neviditelné tlačítko
  „UKAŽ“ přesně přes truhlu. drawBtn(..., visible=false) teď skryje i zónu → skrytá tlačítka nechytají dotyky (opraví i skryté
  tlačítko obsluhy na kartě). Nový test 6e: žádné dotykové místo hlavní obrazovky není zakryté (1 hospoda, 3 hospody, noc)
  a truhla jde otevřít skutečným ťuknutím prstem (ověřeno, že bez opravy test selže).
- Návod krok 5 (přání): „NAŠETŘI 60 COINS“ – šipka na Pípu (vydělává sama), světlé obě karty; na „Otevřít“ až když má coins.
- Lišta úkolu nad hospodou ZPĚT (přání: „v čem pokračovat“ bylo dobré); úkol je i v záložce Úkoly.
- OPRAVA blesk (Šťastná hodina) nešel ťuknout: po opravě truhly zůstala zóna skrytá i po najmutí manažera → drawSkill ji
  zase ukáže. Pod bleskem popisek „výdělek ×3“ / „běží!“ / „nabíjí se“. Test: ťuknutí prstem po najmutí spustí ×3.
  Kontrola neviditelných stěn: hlavní obrazovka (test 6e) i všechny části menu (tools/_tmp/occl2.mjs) – nic zakrytého.
- Počítač (přání: rolovat jako Idle Obelisk Miner): hra pevně na výšku (šířka max 560 px), stránka se roluje kolečkem; telefon beze změny.
- Šťastná hodina = dřevěná cedule (výběr uživatele návrh 2, docs/navrhy-ui/blesk-3-navrhy.png): „ŠŤASTNÁ HODINA ×3“ (název schopnosti manažera), nabíjí = „hodina za m:ss“ + pruh, běží = červená „×3 ještě m:ss“ + ubývající pruh.
- OPRAVA (hlášení: po hygieně „NAJMI ČÍŠNÍKY“ nejde – tlačítko prázdné): průvodce novou hospodou čekal na událost; když hráč
  přepnul hospodu tažením a najal číšníky dřív, krok už nepřišel. guideSkipDone() v update: splněný krok (vybraná hospoda,
  koupená pípa, najatí číšníci) se sám přeskočí. Test 6b teď prochází průvodce ŤUKÁNÍM PRSTEM na cíl šipky (dřív volal
  hire() z kódu, proto chybu neviděl); nový test 6b2 = přesně hlášený případ (bez opravy selže).
- Záložka Úkoly bez úkolu od hostinského (přání; je v liště nad hospodou).
- Počítač (přání: „bez rolování“): celá hra se vejde do viditelné části okna (desktopFit v main.ts – když okno sahá pod lištu
  Windows, hra se zmenší na viditelnou výšku); rolování zrušeno. Telefon beze změny.
- Menu B (výběr uživatele, docs/navrhy-ui/menu-obchod-ukoly-ABC.png, menu-B-ve-hre.png): spodní lišta Hospoda/Obchod/Úkoly/Menu je vidět i nad otevřeným menu (depth 350), menu začíná o lištu výš (MENU_Y0, obsah končí na MB = H − NAV_H), dlaždice Obchod a Úkoly z mřížky pryč; návod „ŤUKNI NA OBCHOD“ a úkoly ukazují na lištu. Ikona Menu = mřížka 3×3 dlaždic (dřív ozubené kolo jako Nastavení). Kontrola všech 16 částí menu: nic pod lištou, nic zakrytého.
- Průvodce novou hospodou: po přepnutí na jinou hospodu šipka na záložku té hospody, po návratu na tlačítko (hlášení).
- Červené tečky (přání): zmizí po prvním otevření záložky, znovu svítí, až přibude něco nového (víc bodů, další úkol, nový den…;
  d.alertSeen, tabAlert/alertSig). Spodní lišta: tečka u Obchodu (jde koupit vylepšení) a Úkolů (je co vybrat), Menu jen za mřížku.
  Plný Pivovar má tečku (fungovalo, ověřeno snímkem).
- Zvuk výdělku (přání: „pořád stejné cinkání – ať se střídá“): Nastavení → Zvuk výdělku A melodie (výchozí, tóny pentatoniky
  postupně) / B náhodně / C střídání (mince, sklenice, pokladna, šplouchnutí) / vypnuto; ťuknutí přepne a přehraje ukázku (opts cs).
- Sbírka: skupina „Chrám Cthulhu“ pryč (4. hospoda ve hře není – hosté nešli získat); u sezónních hostů místo ??? název a data.
- Nastavení: tlačítka podle výšky řádku (nepřesahují).
- Hospoda 65: OPRAVA Kostnice – přehled zesílení se vejde nad spodní lištu (řádek výšky podle místa).
  Počítadlo 💎 v horní liště vlevo od ×1 (výběr B, docs/navrhy-ui/diamanty-pocitadlo-ABC.png); ťuk = Speciální nabídka →
  Diamanty → stránka Napořád, balíčky „Koupit diamanty“ zablikají; krígl cíle se posune vlevo, coins se zmenší.
  Návrhy vzhledu hospody za 💎 (docs/navrhy-ui/hospoda-za-diamanty-ABC.png, src/gfx/luxArt.ts, ?lux=a|b|c, livreje
  LIVERY v characters.ts) – čeká na výběr uživatele.
- Hospoda 65: VZHLED ZA 💎 (výběr uživatele B bez lustrů): Diamanty → 3. stránka „🎨 Vzhled“: Selská pípa 150, Dubové stoly 200,
  Livreje číšníků 300 (GEM_LOOK v special.ts, jen vzhled). PubView.LOOK + applyLook() (přepne hned po koupi), portréty
  číšníků v panelu také v livreji. Art src/gfx/luxArt.ts (luxTap, luxTable), livrej LOOKS `<waiter>_lux`. Snímek docs/navrhy-ui/vzhled-B-ve-hre.png.
  Nové texty diamantů zatím bez překladů (zobrazí se česky, jako texty z hospody 64).
- Hospoda 65 – LIGA (přání): soupeř = člověk (jméno, hospoda, postavička z hostů; rivalInfo v league.ts, stejný celý týden).
  Vyrovnaný: síla podle hráčova minulého týdne (rivalRate: minulá tržba × zrychlení × TIER_F [0,7…1,3], 1. týden ×0,45),
  soupeř přidá max +30 % když vedeš a poleví (až 60 %), když vede o víc než 20 %. Simulace tools/sim/league.mjs:
  slabší/běžný/zapálený ~50 % výher, výsledky 0,94–1,14. Souboj s živými lidmi až později (server, ochrana proti podvodům).
- Hospoda 65 – CELKOVÁ KONTROLA: tools/audit.mjs (všechny části menu + Chrám + Šipky, 12 jazyků: texty pod lištou,
  mimo okraj, překryvy), tools/playbot.mjs (robot ťuká prstem, hlídá chyby), tools/i18n-missing.mjs (chybějící překlady).
  Nalezeno a opraveno: 299 chybějících překladů ve všech 11 jazycích + ~20 anglických textů v cizích jazycích;
  neviditelné dotykové zóny krígle a 💎 v levém horním rohu během návodu; popisky tlačítek přetékaly (drawBtn je teď
  zmenší); úvod Talismanů, citát Kostnice, patička Diamantů, texty Chrámu v dlouhých jazycích. Zbylé hlášky auditu =
  jednorázové nápovědy (šipka + řádek přes obsah, záměr).
- ÚKOL (přání hospody 66, udělat PO testech): Návštěvníci s rozhodnutím (src/game/visitors.ts: Hygienik, Štamgast Pepík
  na sekeru, Sládek, Muž v kabátě, Influencerka). U voleb, kde hráč zaplatí / přijme a NIC z toho nemá (Hygienik „Podplatit“,
  Pepík „Nalít mu“, když nesplatí…), dostane +1 💎. Návštěvníky přidat do Sbírky (skupina „Návštěvníci“, počítá se,
  kolikrát jim hráč zaplatil/přijal); po nasbírání přiměřeného množství dává ten návštěvník místo 1 💎 → 2 💎.
  Přesná pravidla a prahy navrhnout uživateli před dokončením.
