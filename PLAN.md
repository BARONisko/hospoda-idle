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
5. **Prestiž** – zavření hygienou → nové dějství (krčma, Žabák, Cthulhu), krígly = trvalé bonusy, nové stanice.
6. **Události s ťukáním** – nájezd žab, banshee karaoke, upíří hodina, zlatý sud (krátké bonusy).
7. **Sbírka a úkoly** – bestiář hostů-příšer, denní úkoly, úspěchy.
8. **Zvuk, hudba, jazyky** – cs + en a dalších 10 jazyků (t() jako v P.U.B.).
9. **Mobil** – PWA, Capacitor (Android), notifikace, reklamy za odměnu, odstranění reklam.
10. **Balanc a testy** – simulace průběhu (tools/sim), headless testy (Playwright).
