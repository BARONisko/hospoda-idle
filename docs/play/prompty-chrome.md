# Hotové prompty pro Claude v Chromu (hospoda 70)

## 1) Název a popisy obchodu ve 12 jazycích
```
V Google Play Console otevři aplikaci P.U.B. Idle (cz.baronisko.pubidle) → Růst → Přítomnost v obchodě → Hlavní záznam v obchodě.
1. U výchozího jazyka (angličtina, en-US) nastav název aplikace, krátký popis a úplný popis podle souboru
   https://raw.githubusercontent.com/BARONisko/hospoda-idle/main/docs/play/listing/en-US.md
   (řádek TITLE: = název, řádek SHORT: = krátký popis, vše pod řádkem FULL: = úplný popis; samotná slova TITLE:, SHORT:, FULL: nevkládej).
2. Přes „Spravovat překlady“ přidej jazyky cs-CZ, de-DE, es-ES, fr-FR, pl-PL, pt-BR, ru-RU, tr-TR, ja-JP, ko-KR, zh-CN.
   Ke každému vlož název, krátký popis a úplný popis ze souboru se stejným jménem ve stejné složce
   (např. https://raw.githubusercontent.com/BARONisko/hospoda-idle/main/docs/play/listing/de-DE.md).
3. Vše jen ulož. Nic neodesílej ke kontrole a nezahajuj zavádění. Nakonec mi napiš, které jazyky jsou uložené a jestli Play Console
   u některého textu hlásí chybu (délka, zakázané slovo).
```

## 2) Statistiky (Google Analytics) – potřebuju jen „ID měření“
```
Otevři https://analytics.google.com . Vytvoř účet „P.U.B. Idle“ (pokud už nějaký účet mám, použij ho) a v něm službu „P.U.B. Idle“
(časové pásmo Česko, měna CZK, odvětví Hry, malá firma, cíl „Získat přehled o chování uživatelů“).
Jako platformu zvol Web, adresa webu https://baronisko.github.io , název streamu „hra“, rozšířené měření nech zapnuté.
Až bude stream vytvořený, zkopíruj a napiš mi „ID měření“ (začíná G-). Nic dalšího nenastavuj, žádný kód nikam nevkládej.
```

## Ručně (soubory z počítače Claude v Chromu nahrát neumí)
- AAB: Actions → nejnovější zelený běh Android → artefakt pub-idle-<číslo> → rozbalit → `app-release.aab` → Uzavřené testování → Vytvořit nové vydání.
- Snímky telefonu: `docs/play/snimek-1.png` … `snimek-8.png`, ikona `docs/play/ikona-512.png`, obrázek funkce `docs/play/obrazek-1024x500.png`.
