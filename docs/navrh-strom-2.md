# Nový strom dovedností – 3 návrhy (25. 11. 2026, čeká na výběr)

Snímky: `docs/navrhy-skilly/strom-2/` (prehled.png, A1–C2, P). Tempo: `node tools/sim/strom-navrhy.mjs`,
délka hry: `TREE=A|B|C|D DAYS=100 node tools/sim/days.mjs` (D = dnešní strom spočítaný po uzlech).

## Co je dnes špatně
- 120 uzlů, z toho ~100 jen „+0,3–0,9 %“ – nákup není vidět ani cítit.
- 22 středních uzlů dává +2–3 % – porušují pravidlo „pod 1 % za úroveň“.
- Volba je jen „kterou cestou dřív“ – odbočky si koupí každý, nic se nevylučuje.
- 12 schopností (hvězd) je zahrabaných na stezce o 28 uzlech, posouvání.

## Společné pro všechny tři návrhy
- Body chodí jako dnes: úrovně + mistrovství + hvězdy stanic + věrnost hostů.
- Každé procento pod 1 % za úroveň. Síla se přesouvá z procent do schopností.
- Volby mají štítek **ťukám** (pro aktivního) nebo **samo** (pro slabšího / nečastého hráče).
- Schopnosti nekopírují věci za 💎 (automatická Šťastná hodina, Sběrač truhel, Delší offline, VIP vrátný) – ty zůstávají placené.
  Proto ve stromu není „automatická Šťastná hodina“; místo ní „Uvítací hodina“ (po návratu nabitá) a vrchol „Druhý manažer“.
- 12 dnešních hvězd zůstává jako schopnosti (kód už je), přibude ~8 nových: Zlatá ruka, Uvítací hodina, Rozjezd, Velký tank,
  Sudová loterie, Zásobárna, Noční lov, Šťastná kostka + 3 vrcholy (Druhý manažer, Pivní dynastie, Pán noci).
- Přerozdělení bodů zůstává (krígly / 💎).
- **Přechod:** body zpět celé; aby nikomu neklesl výdělek, rozdíl starý − nový strom zůstane jako „Stará pověst“ (zmenšuje se,
  jak hráč kupuje nový strom, nikdy pod 0) – stejně jako u Chrámu a Výčepu (co hráč měl, zůstává).

## A) Tři cechy (doporučuji)
Záložky Výčep / Sklep / Noc jako dnes, ale každá cesta je věž o 8 patrech na jednu obrazovku:
řemeslo (5 úrovní) → volba 1 ze 2 → řemeslo → volba → řemeslo → volba → řemeslo → **vrchol**. Patro se otevře
po 0/5/15/30/50/75/100/140 bodech utracených v cestě. Nad třemi vrcholy **Koruna – Legenda okresu** (v jednom patře každé cesty obě volby, titul v lize).
34 uzlů, 21 schopností (9 voleb + 3 vrcholy + koruna), celý strom 727 bodů.

| patro | Výčep | Sklep | Noc |
|---|---|---|---|
| 1 | výdělek +0,5 % ×5 | krígly +0,8 % ×5 | kosti +0,9 % ×5 |
| 2 | Zlatá ruka (ťuk: 5 % šance ×10 spropitné) / Spropitné samo | Rozjezd (90 s po hygieně ×5) / Dobrá pověst | Noční lov (ťuk v noci 2 kosti) / Kostěné spropitné |
| 3 | spropitné +0,9 % ×5 | stanice +0,4 % ×5 | noční spropitné +0,9 % ×5 |
| 4 | Dlouhá hodina / Uvítací hodina | Druhý kotel / Velký tank | Šťastná kostka (1 přehoz denně) / Kostňák hraje sám |
| 5 | dvojitý výdělek +0,3 % ×5 | vaření +0,9 % ×5 | události +0,9 % ×5 |
| 6 | Plný podnos / Slavná hospoda | Sudová loterie / Zásobárna (start kola 10 % coins) | Pověstné večery / Šťastná ruka |
| 7 | výdělek +0,5 % ×5 | obsluha levnější +0,9 % ×5 | XP hostinského +0,9 % ×5 |
| 8 | **Druhý manažer**: Pivní smršť, stanice 2× rychleji 30 s, nabíjení 10 min | **Pivní dynastie**: po hygieně stanice hned na 25. úrovni | **Pán noci**: Půlnoční hodina, kosti ×3 na 60 s + vzácný noční host |

## B) Deska podniku
Jedna deska 7 sloupců × 14 řad (posun nahoru/dolů), kupuje se dlaždice vedle koupené, cena roste s výškou.
Výčep vlevo, Sklep uprostřed, Noc vpravo, 3 vodorovné spojky. 55 dlaždic: obyčejné +0,3–0,9 %, **9 cechů** (schopnosti),
**5 klíčových kamenů** (výhoda za cenu: Rychlá kola – laťka hygieny −20 %, krígly −10 % · Pomalý večer – offline +30 %, stanice −10 %
· Rváči – rvačky 2× častěji, každá 3 kosti · Noční podnik – noc 2× delší, ve dne méně hostů · Hazard – kostka ×2 nebo nic),
**3 koruny** nahoře (stejné schopnosti jako vrcholy v A). 734 bodů. Nejvíc plánování, ale nejsložitější na telefonu a k naprogramování.

## C) Kumpáni u stolu
18 karet kumpánů (6 Výčep / 6 Sklep / 6 Noc), každá ★1–★5: ★1 = schopnost, ★2–★5 = +0,8–0,9 % a na ★3 a ★5 silnější schopnost.
U stolu sedí jen 3 → 8 kumpánů (místo při 60/150/260/400/600 získaných bodech), přesadit jde kdykoli → hráč skládá partu
(večer noční, ráno výčepní). Parta 3 stejné barvy = malý bonus. Další kumpáni přisednou z věrnosti hostů. 810 bodů.
Nejoriginálnější, nejméně prvků na obrazovce, ale nový pojem vedle Sbírky a věrnosti hostů a nejvíc nové práce.

## Tempo (tools/sim/strom-navrhy.mjs)
Body za rok: slabší 369, běžný 610, zapálený 749.

| | 1. schopnost | vrcholy / koruny (spěch) | strom po 30 / 100 / 365 dnech | výdělek ze stromu po roce* |
|---|---|---|---|---|
| dnes – slabší / běžný / zapálený | den 12 / 2 / 1 | 115 · 34, 190 · 13, 80, 270 | 18/32/56 % · 32/53/93 % · 48/74/100 % | +60 / +96 / +104 % |
| A – slabší / běžný / zapálený | den 1 / 1 / 1 | 99 · 29, 168 · 11, 71, 237 (+ koruna 277) | 16/28/49 % · 28/47/78 % · 43/67/100 % | +37 / +53 / +77 % |
| B | den 1 / 1 / 1 | 94, 316 · 28, 96, 246 · 10, 40, 106 | 16/28/50 % · 28/47/80 % · 43/64/100 % | +45 / +60 / +84 % |
| C | den 1 / 1 / 1 | – (karty: 9 / 14 / 17 z 18) | 14/25/46 % · 26/43/75 % · 38/60/92 % | +33 / +45 / +45 % |

*odhad: staty vážené podle toho, kolik dají výdělku, schopnost 3 %, vrchol 8 %. Nové stromy jsou slabší v procentech
než dnešní (dnes jsou v něm uzly +2–3 %) → hra se trochu prodlouží; kolik, ukazuje days.mjs níže.

## Délka hry (days.mjs, 100 dní)
Hygieny po 30 dnech (slabší / běžný / zapálený) a po 100 dnech u slabšího:
- dnes (strom po uzlech): 55 / 67 / 73, slabší den 100: 73 hygien
- A: 54 / 66 / 72, slabší 72 · B: 54 / 66 / 72, slabší 72 · C: 54 / 66 / 72, slabší 72

Rozdíl je jen ~1 hygiena: délku hry určuje zeď u ~45.–70. hygieny, ne strom. Běžný a zapálený narazí na kolo přes 60 h
ještě před 100. dnem u všech variant stejně (to řeší vlákno o pozdní hře). Pozn.: days.mjs dřív počítal strom jen jako +10 %,
po uzlech vychází dnešní strom silněji (bonusy běžného ×3,43 místo ×2,52 po 30 dnech).
