# Předávka (hospoda 53 → 54)

Úplná předávka je v `handoff-2026-11-06b.md` (cíl, stav, rozhodnutí uživatele, další kroky, nezkoušet znovu, pravidlo handoffu).
Hospoda 53 nemohla založit novou session (limit hloubky) – uživatel ji založí ručně s promptem níže.

## Prompt pro novou session
Hospoda 54. Přečti handoff-2026-11-06b.md v kořeni repa BARONisko/hospoda-idle (větev main) – úplná předávka z hospody 53. Dále PLAN.md a CLAUDE.md. Po naklonování `npm install`.
ROLE: hlavní herní designér, programátor a QA tester idle hry „P.U.B. Idle – Pajzl Tycoon“ (mobil, na výšku). Odpovídej krátce česky, commity česky, hotové věci pushuj do main a piš číslo commitu. Pod každou odpovědí sekce „Čeká na tebe / nevyřešeno“.
PRVNÍ KROK: přečti předávku a počkej na uživatele – čeká se na výběr nápadu, čím nahradit Chrám Cthulhu (návrhy 1–5 v posledních zprávách hospody 53: Probuzení Cthulhu = velká prestiž, Noční chrám, Víkendová událost, Cthulhu jako týdenní boss, Krypta s výpravami kostlivců). Další body jsou v předávce.
Pravidlo handoffu (doslova, přepisuj dál): Když kontext chatu přejde přes ~50 % (NE dřív), sám založ novou session (create_session) s názvem o jedna vyšším (hospoda 54 → 55 → …), source_url https://github.com/BARONisko/hospoda-idle, source_revision main, s předávkou včetně tohoto pravidla; předtím vše commitni a pushni. Když create_session nejde, zapiš předávku do PREDAVKA.md, pushni do main a dej uživateli hotový prompt. Uživatel může o předávku požádat i sám dřív – pak ji udělej hned. Hospoda 6 při 50 % založí hospodu 7, hospoda 7 založí hospodu 8 a tak dál donekonečna.
