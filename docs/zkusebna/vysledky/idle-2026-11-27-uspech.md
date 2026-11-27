# P.U.B. Idle – bude mít úspěch?

Podklad: záznam Zkušebny `2026-11-26_oprava7` (čtyři boti, až 10 hodin hry), snímky, PLAN.md a kód zpeněžení (`src/core/offers.ts`, `src/core/special.ts`). Živí lidé hru zatím netestovali (`docs/zkusebna/lide.json` je prázdný), takže všechno o chování hráčů je odhad.

## 1. Verdikt

Hra je řemeslně nadprůměrná a má vlastní tvář. Jako malé vydání bez reklamy má dobrou šanci na spokojenou menší komunitu a slušné hodnocení. Velký komerční úspěch je bez placené propagace nepravděpodobný – ne kvůli kvalitě, ale proto, že žánr je přeplněný a hry v něm rostou hlavně nakoupenými instalacemi.

## 2. Silné stránky

- **Osobnost.** Pajzl s příšerami, kostlivci jako obsluha, rvačky, zlatý sud, Cthulhu o víkendu. Většina hospodských a restauračních idle her vypadá zaměnitelně; tahle ne. Vtip je vidět bez čtení.
- **Rychlý start.** První odměna za 2 vteřiny, hospoda vydělává sama do minuty, návod končí zhruba po dvou minutách.
- **Návrat do hry.** Jedno okno, velká částka a rada, co za ni koupit. Slabší hráč si po každém návratu hned něco koupil.
- **Poctivé zpeněžení.** Žádná vnucená reklama, žádné náhodné odměny, odpočty se neobnovují, nejvýš jedna vyskakovací nabídka za spuštění, zdarma se dojde všude. Hráči tohle v recenzích oceňují.
- **Hloubka.** Tři hospody, noc s kostmi, pivovar, hostinský se stromem dovedností, chrám, šipky, liga, sezóny. Obsahu je víc, než malé hry obvykle mají.
- **Dvanáct jazyků a hraní bez internetu.**

## 3. Slabé stránky a rizika

- **První den (D1).** Hned po návodu hra hlásí „číšníci nestíhají“ a řešení stojí 400 coins, když hráč má 4. Na konci prvního sezení dojdou peníze na nákupy a největší krok hry (hygiena, tedy nová hospoda) čeká jako malá pilulka v rohu. Při odchodu na obrazovce není nic, co by řeklo „zítra tu budeš mít tohle“.
- **První týden (D7).** Po první hygieně přijde sedm nových věcí v pěti minutách, potom dlouho nic: mezi 78. a 177. minutou hraní nepřibude jediná nová věc k vidění. Hygieny v té době dávají pořád stejných 6 krígel a nejlepší výdělek mezi hodinami neroste. Tady odejdou hráči, kteří chtějí objevovat i ti, kteří chtějí optimalizovat.
- **První měsíc (D30).** Obsah na něj je (pivovar, chrám, liga), ale odemyká se pozdě a k novinkám po zhruba osmi hodinách hraní už záznam nic neukázal. Jestli hráče udrží víkendový chrám a liga, se z botů poznat nedá.
- **Zpeněžení je nevyzkoušené.** Za 10 hodin záznamu nevyskočila ani jedna placená nabídka a obchod s diamanty za peníze, startovní balíček ani reklamu nikdo neviděl v provozu. Poctivý obchod navíc znamená nižší příjem na hráče. Karta Štamgast neříká, jestli se platí jednou, nebo se obnovuje – to bývá důvod k vrácení peněz a špatné recenzi.
- **Viditelnost v obchodě.** Slovo „Pajzl“ cizinec nezná a nehledá, „idle tycoon“ hledají všichni a soupeří o něj stovky her s rozpočtem.

## 4. Realistické očekávání

**Co vím (ze záznamu a kódu):** start a návrat fungují, tempo prvních 15 minut je v pořádku, střední hra je plochá, zpeněžení je férové a v praxi neověřené, test na lidech neproběhl.

**Co jen odhaduji (obecná zkušenost se žánrem, ne měření této hry):**
- Bez placené propagace přicházejí instalace jen z vyhledávání, od známých a z komunit. U malých nezávislých her to bývají stovky až nízké tisíce instalací za první měsíce, ne desetitisíce.
- Český námět a humor můžou v Česku a na Slovensku zabrat nadprůměrně – je to malý trh, ale tam má hra skutečnou výhodu.
- Příjem při takovém počtu hráčů bude spíš kapesné než výplata. Reálný cíl prvního vydání je hodnocení nad 4,3, pár set věrných hráčů a čísla, podle kterých se dá hra zlepšovat.
- Jak dlouho lidé vydrží, neumím říct číslem. Boti říkají „start dobrý, střed slabý“; skutečná čísla dá až měření (Google Analytics je připravené).

## 5. Tři věci, které šance zvednou nejvíc

1. **Test na 5–10 živých lidech a tiché vydání v jedné zemi před plným vydáním.** Je to nejlevnější způsob, jak zjistit, kde lidé opravdu odcházejí. Bez toho se ladí naslepo.
2. **Zaplnit první den až první týden.** Hygienu na 100 % hráči ukázat, při odchodu dát viditelný důvod se vrátit (něco, co doběhne) a mezi první a třetí hodinou hraní dávkovat novinky rovnoměrně – část toho, co teď přijde naráz po první hygieně, posunout do prázdné druhé hodiny.
3. **Vyzkoušet celou platební cestu na skutečném telefonu.** Vyskakovací nabídka, nákup, reklama za odměnu, obnovení nákupu, jasný text u Štamgasta. Jediná chyba tady stojí víc recenzí i peněz než cokoli v balancu.
