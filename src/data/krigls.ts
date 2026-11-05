// Třináct vzácných kříglů pro utopenou bránu ve sklepě (endgame). Každý se získá jinde;
// postavený na oltář rozsvítí jednu runu. Po třináctém se brána otevře.

import { t } from '../i18n';
import { DEMO } from '../systems/build';

export interface KriglDef {
  name: string; // jméno krígle
  from: string; // odkud je (deníček)
  hint: string; // nápověda, dokud chybí
}

export const KRIGL_DEFS: KriglDef[] = [
  { name: t('Sudomorův krígl'), from: t('Z hrudi Sudomora na 4. patře.'), hint: t('Sudomor se ve 4. patře sklepa ukáže, až budeš mít všechny ostatní krígly z hospody nahoře (kvíz, mnich, turnaje, Žabák, obdivovatelka). Pak ho poraz.') },
  { name: t('Kamenný krígl'), from: t('Golem ho hlídal místo sudu.'), hint: t('Golem ve sklepě něco hlídá. Poraz ho.') },
  { name: t('Krígl se srdíčkem'), from: t('Ze sbírky obdivovatelky v jejím doupěti.'), hint: t('Obdivovatelka má ve sklepě doupě. Najdi ho.') },
  { name: t('Přebornický krígl'), from: t('Za šipky, kulečník i kladivo na zvon.'), hint: t('Od úrovně Restaurace pořádá Žabák turnaje. Vyhraj turnaj v šipkách, v kulečníku i v kladivu na zvon.') },
  { name: t('Hřbitovní krígl'), from: t('Od upíra, kterému jsi dal víno z krypty.'), hint: t('Rozsviť lucerny na hřbitově, vezmi z krypty víno a dej ho upírovi v krčmě.') },
  { name: t('Žabí krígl'), from: t('Žabák ho vsadil a prohrál.'), hint: t('Poraz Žabáka v kuchařské soutěži i v pivním souboji.') },
  { name: t('Kvízový krígl'), from: t('Hlavní cena pivního kvízu.'), hint: t('Od úrovně Hostinec chodí kvízmistr. Vyhraj pětkrát večerní pivní kvíz.') },
  { name: t('Aligátoří krígl'), from: t('Přinesl ho ochočený aligátor Pepík z hnízda ve stoce.'), hint: t('Mříž ve zdi 3. patra vede do stoky. Kolečky přestav stavidla a dopluj lodičkou tunelem (na odbočkách jeď za řevem) k hnízdu. Kostlivci z krčmy ti každý den nachystají kýbl zbytků – házej je aligátorovi obloukem do tlamy, když stojí s otevřenou. Nažraný se ochočí.') },
  { name: t('Vodníkův krígl'), from: t('Vyměněný za dušičky z hrnečků.'), hint: t('Sedm dušiček odnes vodníkovi do zatopených katakomb (3. patro). Dušičky máš z puntíkatých hrnečků ve sklepě – a duchové v krčmě jimi platí.') },
  { name: t('Pouťový krígl'), from: t('Hlavní cena pouťové střelnice.'), hint: t('U Žabákova podniku je každý víkend karneval (pouť) – kultisté se tam baví. Na střelnici nastřílej aspoň 200 bodů.') },
  { name: t('Mnišský krígl'), from: t('Od mnicha za deset várek tajného piva.'), hint: t('Od úrovně Hostinec chodí mnich každý večer (nejdřív 6. den). Uvař mu v pivovaru (Podnik → Pivovar) deset várek Mnišského speciálu.') },
  { name: t('Sudokongův krígl'), from: t('Poražený Sudokong ti ho dal, abys ho nechal být.'), hint: t('Za zvláštními vraty na některém patře sklepa je aréna Sudokong (klíč prodává divný chlapík, chodí do Žabákova podniku). Poraz opičáka.') },
  { name: t('Pulčí krígl'), from: t('Hlavní cena Žabákových pulčích závodů.'), hint: t('V Žabákově podniku se každý večer závodí pulci v sudu (E u sudu s pulci). Vsaď na pulce a třikrát vyhraj.') },
];

/** V které hospodě (dějství) se krígl získává: 1 nahoře U Zlatého sudu, 2 sklepní krčma, 3 Žabákův podnik. */
export const KRIGL_ACT: (1 | 2 | 3)[] = [1, 2, 1, 1, 2, 1, 1, 2, 2, 3, 1, 3, 3];
/** Demo (1. dějství) má jen krígly turnaje, Žabáka, obdivovatelky a Sudomora – kvíz a mnich krígl nedávají (přesunuté „pryč“). */
export const DEMO_KRIGLS = [0, 2, 3, 5];
if (DEMO) KRIGL_ACT.forEach((a, i) => { if (a === 1 && !DEMO_KRIGLS.includes(i)) KRIGL_ACT[i] = 3; });
if (DEMO) KRIGL_DEFS[0].hint = t('Sudomor se ve 4. patře sklepa ukáže, až budeš mít krígly z turnajů, od Žabáka a od obdivovatelky. Pak ho poraz.');
/** Indexy kříglů, ke kterým vedou věci ve sklepě (ty se ve sklepě objeví jen v dějství svého krígle). */
export const KRIGL = { sudomor: 0, golem: 1, admirer: 2, grave: 4, gator: 7, vodnik: 8, sudokong: 11 } as const;
/** Patří věc vedoucí ke kríglu i do dějství `a`? */
export const kriglInAct = (i: number, a: number) => KRIGL_ACT[i] === a;
/** Sudomor (krígl 0) končí 1. dějství: ve 4. patře se objeví, až máš všechny ostatní krígly z hospody nahoře. */
export const sudomorReady = (has: (i: number) => boolean) => KRIGL_ACT.every((a, i) => a !== 1 || i === 0 || has(i));

/** index Sudokongova kříglu */
export const KRIGL_SUDOKONG = 11;
/** index Pulčího kříglu (pulčí závody u Žabáka) */
export const KRIGL_PULCI = 12;

/** Kolik kříglů je potřeba na probuzení jednotlivých „ér“ sklepa (nové místnosti, nepřátelé, vzkazy). */
export const eraFor = (placed: number) => (placed >= 9 ? 3 : placed >= 6 ? 2 : placed >= 3 ? 1 : 0); // zhruba po čtvrtinách
