# Podklady pro Google Play Console – P.U.B. Idle – Pajzl Tycoon

Vše, co se vyplňuje v Play Console. Odpovědi jsou pravdivé pro současnou hru (reklamy za odměnu AdMob, nákupy v aplikaci
přes Google Play, žádné účty, uložení jen v telefonu). Když se hra změní (platby, přihlášení…), odpovědi se musí upravit.

## Základ (Vytvořit aplikaci)
- Název aplikace (en-US a ostatní jazyky): **P.U.B. Idle: Pub Tycoon** (hospoda 70; „Pajzl“ anglicky nikdo nehledá); česky **P.U.B. Idle – Pajzl Tycoon**
- Texty záznamu ve 12 jazycích (název ≤ 30, krátký popis ≤ 80, úplný popis): `docs/play/listing/<jazyk>.md` (en-US, cs-CZ, de-DE, es-ES, fr-FR, pl-PL, pt-BR, ru-RU, tr-TR, ja-JP, ko-KR, zh-CN)
- Snímky telefonu s nápisy (1080×1920, anglicky): `docs/play/snimek-1.png` … `snimek-8.png`
- Výchozí jazyk: **angličtina – en-US** (rozhodnutí uživatele h69; čeština jako překlad)
- Aplikace nebo hra: **Hra** · Zdarma nebo placená: **Zdarma**
- Balíček (package name, nastaví se nahráním AAB): `cz.baronisko.pubidle`

## Stránka v obchodě (Hlavní záznam v obchodě)
**Krátký popis (max 80 znaků):**
Postav z pajzlu hospodu snů! Točí se pivo, chodí upíři, žabáci i Cthulhu.

**Úplný popis:**
Vítej v Pajzlu u Berana! Začínáš s rozvrzanou pípou a pár stoly – a z té díry uděláš hospodu, o které se bude
vyprávět i v podsvětí.

🍺 Ťukej na pípu, vař v kuchyni, kutálej sudy ze sklepa a hraj kostky v rohu.
👨‍🍳 Najmi číšníky a manažery – hospoda vydělává, i když zrovna nehraješ.
🏚️ Otevři další podniky: Sklepní krčmu plnou upírů a kostlivců, Žabákův podnik v bažině a nakonec Chrám Cthulhu.
⭐ Hygiena = nový začátek s lepšími bonusy. Sbírej hvězdy stanic, mistrovství a body do velkého stromu schopností hostinského.
🧛 Sbírka hostů: každý host má své úrovně věrnosti – z návštěvníka udělej štamgasta.
🎯 Šipky, liga hospod, denní truhla, úkoly a šťastná hodina.
🌙 Noc v hospodě a souboj s Cthulhu v chrámu.

Hraje se jednou rukou, na výšku, a i offline. Reklamy jsou jen dobrovolné – za odměnu, když chceš.

- Ikona 512×512: `docs/play/ikona-512.png`
- Obrázek funkce 1024×500: `docs/play/obrazek-1024x500.png`
- Snímky telefonu: `docs/play/snimek-1.png` … (na výšku)
- Kategorie: **Hry → Simulace** (nebo Neformální) · Značky: Idle, Manažerské
- Kontaktní e-mail: tvůj e-mail vývojáře · Web: https://baronisko.github.io/hospoda-idle/
- Zásady ochrany soukromí (URL): **https://baronisko.github.io/hospoda-idle/soukromi.html** (jen anglicky; česky soukromi-cs.html)

## Obsah aplikace (App content)
1. **Zásady ochrany soukromí:** URL výše.
2. **Reklamy:** Obsahuje reklamy = **Ano**.
3. **Přístup k aplikaci:** **Všechny funkce jsou dostupné bez zvláštního přístupu** (žádné přihlášení).
4. **Hodnocení obsahu (dotazník IARC):** kategorie **Hra**. Odpovědi:
   - Násilí: **Ano – kreslené / fantasy, nerealistické** (boj s Cthulhu, příšery), bez krve realistických lidí.
   - Strach / horor: **mírné** prvky (upíři, kostlivci, Cthulhu) – kreslené.
   - Sex, nahota: Ne · Vulgární výrazy: Ne (případně mírné hospodské) · Drogy: Ne · Tabák: Ne
   - **Alkohol: Ano – odkazy na alkohol / pití** (hra se odehrává v hospodě, točí se pivo).
   - Hazard: **Ne** skutečné peníze; simulovaný hazard: kostky v rohu jsou jen stanice vydělávající coins → odpověz **Ne**
     (pokud se dotazník ptá na „simulované hazardní hry“ a nejsi si jistý, zvol Ano – výsledné hodnocení bude jen přísnější).
   - Interakce uživatelů / chat: **Ne** · Sdílení polohy: **Ne** · Nákupy digitálního zboží: **Ano** (diamanty, Štamgast, bez reklam – přes Google Play)
5. **Cílová skupina a obsah:** věk **18 a více** (hospoda, alkohol). Aplikace neláká děti: **Ne**.
6. **Bezpečnost údajů (Data safety)** – kvůli AdMob:
   - Shromažďuje nebo sdílí aplikace údaje? **Ano**
   - Šifrovány při přenosu? **Ano** · Uživatel může požádat o smazání? **Ne** (žádné účty; data hry jsou jen v telefonu)
   - Typy údajů (sbírá SDK Google Mobile Ads):
     - **Poloha → Přibližná poloha** (z IP adresy) – Shromažďováno, účel: Reklama nebo marketing, Analýza, Prevence podvodů
     - **Aktivita v aplikaci → Interakce s aplikací** – Shromažďováno, účel: Reklama, Analýza
     - **Informace o aplikaci a výkonu → Protokoly selhání, Diagnostika** – Shromažďováno, účel: Analýza
     - **Identifikátory zařízení nebo jiné ID** (reklamní ID) – Shromažďováno, účel: Reklama, Analýza, Prevence podvodů
   - U každého: zpracování **není dočasné**, sběr **je povinný** (reklamy za odměnu bez něj nejdou), **sdíleno: Ne**
     (předání poskytovateli služeb Googlu se podle Googlu nepočítá jako sdílení).
   - Ověř podle návodu Googlu „AdMob – příprava na Data safety“ (developers.google.com/admob/android/privacy/play-data-disclosure).
7. **Vládní aplikace:** Ne · **Finanční funkce:** žádné · **Zdraví:** žádné · **Zpravodajská aplikace:** Ne
8. **ID reklamy (Advertising ID):** aplikace ho **používá** – účel **Reklama nebo marketing** (a Analýza).

## Nákupy v aplikaci (Google Play Billing)
Hra je napojená (src/core/billing.ts, plugin @capgo/native-purchases). Produkty se dají založit až po nahrání
první verze s Billingem (AAB z Actions) do kteréhokoli tracku.
1. Play Console → **Nastavení → Platební profil**: založ obchodní platební profil (bez něj nejde nic prodávat).
2. Play Console → aplikace → **Zpeněžení → Produkty → Produkty v aplikaci** → Vytvořit produkt. ID musí být PŘESNĚ:
   - `gems100` – „100 diamantů“, 49 Kč
   - `gems550` – „550 diamantů“, 199 Kč
   - `pass` – „Štamgast na 30 dní“ (denní diamanty, výdělek navíc, odměny bez reklam), 99 Kč
   - `noads` – „Bez reklam“ (všechny odměny bez reklamy, navždy), 99 Kč
   U každého: Aktivovat. Ceny v ostatních zemích nech přepočítat Googlem.
3. **Testování nákupů zdarma:** Play Console (hlavní stránka účtu) → Nastavení → **Testování licencí** → přidej Gmaily
   testerů (stejné jako v Google skupině). Jejich nákupy jsou testovací („Testovací karta, vždy schválí“), nic neplatí.
4. Hra ukáže ceny z obchodu (v měně hráče). „Bez reklam“ se po přeinstalaci obnoví samo; diamanty a Štamgast jsou
   spotřební (dají se koupit znovu).
5. Data safety: přidej **Finanční informace → Historie nákupů** – shromažďováno, účel Funkčnost aplikace, nesdíleno.

## AdMob (reklamy)
1. Na https://admob.google.com přidej aplikaci (Android, „není zatím v obchodě“), název P.U.B. Idle.
2. Zkopíruj **ID aplikace** (`ca-app-pub-…~…`).
3. Vytvoř reklamní jednotku **S odměnou (Rewarded)** a zkopíruj její **ID** (`ca-app-pub-…/…`).
4. V GitHubu: repo → Settings → Secrets and variables → Actions → záložka **Variables** → New repository variable:
   `ADMOB_APP_ID` = ID aplikace, `ADMOB_REWARDED` = ID reklamní jednotky. (Bez nich jdou jen testovací reklamy.)
5. V AdMob → Soukromí a zasílání zpráv → **GDPR**: vytvoř a zveřejni zprávu o souhlasu (pro EU je povinná).

## Podpis aplikace (jednou)
Repo → Settings → Secrets and variables → Actions → **Secrets** → New repository secret:
- `KEYSTORE_PASSWORD` a `KEYSTORE_BASE64` (hodnoty dal Claude zvlášť – nikdy je nedávej do repa ani do chatu).
Klíč (upload.jks) si zálohuj. Při prvním nahrání zapni **Podepisování aplikací Googlem** (Play App Signing – výchozí).

## Sestavení
GitHub → Actions → **Android** → Run workflow. Po doběhnutí dole v „Artifacts“ stáhni `pub-idle-N`:
`app-release.aab` (nahrát do Play Console) a `app-debug.apk` (rychlá instalace do telefonu na zkoušku).

## Uzavřený test (12 testerů / 14 dní)
1. Play Console → Testování → **Uzavřené testování** → Vytvořit track (nebo použít „Alpha“).
2. Testeři: **Google skupina** (groups.google.com, např. pub-idle-testeri@googlegroups.com) – přidej ji do tracku.
3. Nová verze → nahraj `app-release.aab` → poznámky k verzi → Zkontrolovat → Zahájit zavádění.
4. Země: aspoň Česko (+ Slovensko).
5. Zkopíruj **odkaz pro přihlášení k testu** a pošli testerům (musí být ve skupině, ťuknout na odkaz, nainstalovat).
6. Po 14 dnech s ≥ 12 testery: Nástěnka → **Požádat o přístup k produkci**.
