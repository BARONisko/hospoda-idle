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
