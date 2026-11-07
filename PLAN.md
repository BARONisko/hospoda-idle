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
