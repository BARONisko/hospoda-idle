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
  „Probudit Cthulhu“ → Zlatý výčep (×1,5, ×1,75, ×2 …, cena 300·3^n; Cthulhu kouká do hospod až po 1. bossovi v chrámu);
  Štědří hosté → Věrnost hostů (1 XP za příchod hosta, max úr. 10, 1. úr. 20 000 příchodů, ×1,3; +5 % spropitného/úr.;
  d.gxp). Staré krígly za spánek a Štědré hosty vráceny (d.kup2). Kostlivci obsluhy občas donesou jídlo hostovi / sud k pípě.
  Rvačka jen na podlaze (ne u horní zdi). Stará 4. hospoda Chrám Cthulhu se ze starých uložení odebere (chrám = víkendová událost).
