# Checklist Zkušebny (co se kontroluje před každým buildem)

Přidáno 27. 11. 2026 na přání Petra (kosti z truhly před Kostnicí, číšníci větší než hosté).
Pravidlo: **build do testu nebo produkce jen tehdy, když všechny automatické kontroly (K) prošly** a hodnotitel (Fable)
nedal v nové části 0. Spouští se samo v `run.sh`. Ručně: `node tools/zkusebna/kontroly.mjs <běh>` (`ZK_ONLY=K1,K6` vybere jen některé).

Legenda: **auto** = Zkušebna kontroluje sama (ano/ne), **boti** = čísla z botů (kriteria.json), **Fable** = hodnotitel,
**člověk** = jen živý tester nebo Petr.

## 1. Logika a pravidla hry
| | Kontrola | Kdo |
|---|---|---|
| K1 | Odměny (truhla všech 7 dní ×1 i ×2, pass obě řady, Chrám, offline) dávají jen kosti/šipky/krígly, které jsou odemčené; texty odměn je nezmiňují | auto |
| K1b | Každé místo v kódu, které přidává kosti/krígly/šipky, hlídá odemčení (kontrola zdrojáku – nový zdroj odměn bez hlídání ji shodí) | auto |
| K2 | Začátečník na 9 hlavních obrazovkách nevidí zmínky o zamčených věcech (kosti, šipky, Chrám, Liga, pivovar, krígly) | auto |
| K3 | Cena na kartě = cena, kterou nákup strhne; nákup ×1 přidá právě 1 úroveň | auto |
| K4 | Uložení a načtení (i po zavření do pozadí uprostřed hry) nic neztratí; poškozené uložení hru neshodí | auto |
| K5 | Offline výdělek odpovídá času a stropu kasy (½ h, 2 h, 30 h) | auto |
| – | Tempo odemykání, přírůstek za úroveň < 1 %, hráč zdarma vs. platící (strop ×3) | boti + `npm run sim` |

## 2. Vzhled
| | Kontrola | Kdo |
|---|---|---|
| K6 | Texty se nepřekrývají a nejsou mimo obrazovku: 12 jazyků × 9 obrazovek | auto |
| K6b | V cizím jazyce není na obrazovce český text | auto |
| K7 | Každý text v t() má překlad ve všech jazycích | auto |
| K8 | Obsluha, hostinský a hosté mají stejnou velikost (i číšník poslaný s pivem hned po najmutí) | auto |
| K11 | Hra vyplní šířku na 3 displejích (360×640, 390×844, 412×915); snímky pro hodnotitele | auto + Fable |
| – | Čitelnost, ostrý pixel art, šipky a cedule nepřekrývají lištu, krígl ani truhlu | Fable (snímky) |

## 3. Peníze a obchod
| | Kontrola | Kdo |
|---|---|---|
| K9 | Každý z 12 produktů po nákupu něco dodá, bez chyb | auto |
| – | Texty říkají cenu, dobu a obnovování (M1–M6) | Fable |
| – | Skutečná platba přes Google Play, obnovení nákupu na novém telefonu | člověk (Petr, interní test) |

## 4. Technika
| | Kontrola | Kdo |
|---|---|---|
| K10 | Slabý telefon (procesor 6× pomalejší): aspoň 24 snímků/s, záškub pod 0,5 s | auto |
| – | Žádné chyby v konzoli během 4 botů (novacek, bezny, slaby, dlouhy) | boti |
| – | `npx tsc --noEmit`, `npm test` | auto (před buildem) |
| – | Zvuk, vibrace, notifikace, cloud, žebříček na skutečném telefonu | člověk |

## 5. Dojem nového hráče
| | Kontrola | Kdo |
|---|---|---|
| – | Je jasné, co dělat; je to zábava; chce se vrátit; je chuť zaplatit (S, T, L, O, N, H, U…) | Fable + test na lidech |

## Co Zkušebna nepozná (zůstává na lidech)
Skutečné platby, skutečný slabý telefon (jen napodobený), jestli hra baví dlouhodobě, výřezy displeje (notch) na konkrétních telefonech.
