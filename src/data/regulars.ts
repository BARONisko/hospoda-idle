import type { Look } from '../gfx/characters';
import type { GoodId } from './goods';
import { t } from '../i18n';

// Štamgasti – opakující se postavy s vlastními hláškami a úkoly.

export type QuestKind = 'deliver' | 'kill' | 'find' | 'perfect' | 'boss' | 'cozy';

export interface Quest {
  kind: QuestKind;
  text: string; // co štamgast říká, když úkol zadává
  short: string; // krátký popis do deníku úkolů
  good?: GoodId;
  enemy?: string; // klíč z BAL.enemies
  item?: string; // snímek předmětu ve sklepě (find)
  itemName?: string;
  count: number;
  reward: number;
  rep: number;
  thanks: string;
}

export interface Regular {
  id: string;
  name: string;
  look: Look;
  greet: string[];
  idle: string[];
  quests: Quest[];
  /** Zmizelý štamgast: bloudí na patře tohoto typu, dokud ho hráč nevyvede nahoru. */
  /** jméno ve 4. pádě (koho, co) */
  acc: string;
  lost?: { theme: 2 | 3 | 4; down: string[]; found: string; staff: string };
}

export const REGULARS: Regular[] = [
  {
    id: 'lojza',
    name: t('Ruda'),
    acc: t('Rudu'), // 4. pád: „Neviděl někdo …?“
    look: {
      skin: 'skin', skinShade: 'ochre', hair: 'olive', hairShade: 'ink', shirt: 'green', shirtShade: 'pine',
      pants: 'olive', pantsShade: 'ink', shoes: 'ink', hat: 'cap', hatColor: 'olive', hatShade: 'ink', beard: 'mustache',
    },
    greet: [t('Nazdar šéfe! To samý co včera.'), t('Dneska jen jedno. Jako vždycky.'), t('Zase já. Nemám doma pivo.'), t('Šéfe, mám žízeň jak trakař.'), t('Doma mi řekli, ať jdu. Tak jsem tady.'), t('To moje místo je volný? Výborně.')],
    idle: [t('Ta tvoje desítka… lepší než manželka.'), t('Ve sklepě prý někdo chodí. To jsem asi byl já.'), t('Hmmm, utopenec by bodnul.'), t('Kdyby pivo léčilo, byl bych nesmrtelnej.'), t('Moje žena si myslí, že jsem v práci. Taky že jo.'), t('Tohle pivo má duši. Moji už ne.')],
    quests: [
      { kind: 'deliver', good: 'pickle', count: 2, reward: 180, rep: 3, short: t('Ruda: 2× utopenec'), text: t('Šéfe, já mám chuť na utopence. Dva. Ve sklepě jich prý máš plný truhly.'), thanks: t('To je ono! Utopenej jak má bejt.') },
      { kind: 'deliver', good: 'cheese', count: 2, reward: 320, rep: 4, short: t('Ruda: 2× hermelín'), text: t('Hermelín, šéfe. Nakládaný. Dva. A ať smrdí až na ulici.'), thanks: t('Mňam. Tohle si zapíšu do kroniky.') },
      { kind: 'deliver', good: 'sausage', count: 3, reward: 600, rep: 6, short: t('Ruda: 3× klobása'), text: t('Prej máš dole i klobásy. Tři! Z hloubky! Já počkám.'), thanks: t('Ach jo. Teď můžu v klidu umřít. Za týden.') },
    ],
  },
  {
    id: 'ferda',
    name: t('Ferda'),
    acc: t('Ferdu'), // 4. pád: „Neviděl někdo …?“
    look: {
      skin: 'skin', skinShade: 'tan', hair: 'rust', hairShade: 'blood', shirt: 'red', shirtShade: 'blood',
      pants: 'indigo', pantsShade: 'navy', shoes: 'ink', hat: 'beanie', hatColor: 'sky', hatShade: 'blue', beard: 'full',
    },
    greet: [t('Já jsem pivní znalec, ať víš.'), t('Čepice na pivu musí být jako sníh na Sněžce.'), t('Ferda. Ten pravej.'), t('Ferda dorazil. Pěna se může třást.'), t('Dnes ochutnám s plnou vážností.'), t('Nalej, já to ohodnotím.')],
    idle: [t('Ta pěna… dobrý, ale ne skvělý.'), t('Podmíru poznám i se zavřenýma očima.'), t('Kdysi jsem zmizel ve sklepě. Pak jsem se vrátil. Podruhé.'), t('Hořkost osm, říz devět. Pěna… uvidíme.'), t('Po sklepě mi všechno chutná líp.'), t('Pivo se nepije. Pivo se poslouchá.')],
    quests: [
      { kind: 'perfect', count: 3, reward: 150, rep: 3, short: t('Ferda: 3× pivo „Akorát“'), text: t('Natoč tři piva přesně akorát. Já se budu dívat. Pozorně.'), thanks: t('Uznávám. Máš ruku.') },
      { kind: 'perfect', count: 8, reward: 400, rep: 5, short: t('Ferda: 8× pivo „Akorát“'), text: t('Teď osm. Mistr se pozná podle vytrvalosti, ne podle jednoho piva.'), thanks: t('Mistr. Normálně mistr. Utírám slzu.') },
      { kind: 'cozy', count: 25, reward: 500, rep: 6, short: t('Ferda: útulnost 25'), text: t('Je tu jak na nádraží. Udělej to tu útulný – krb, lampy, kytky. Aspoň 25 útulnosti.'), thanks: t('Teď je to hospoda. Tady chci umřít. Až za dlouho.') },
    ],
  },
  {
    id: 'marena',
    name: t('Babka Mařena'),
    acc: t('babku Mařenu'), // 4. pád: „Neviděl někdo …?“
    look: {
      skin: 'skin', skinShade: 'tan', hair: 'bone', hairShade: 'fog', shirt: 'plum', shirtShade: 'dusk',
      pants: 'plum', pantsShade: 'dusk', shoes: 'ink', hat: null, beard: 'none', coat: true,
    },
    greet: [t('Jeden rum, mladej. A nekoukej tak.'), t('Já sem chodila, když tu ještě točil Vacek.'), t('Dobrý den, hošánku.'), t('Tak co, hošánku, ještě žiješ?'), t('Sedím tu dřív, než ty jsi uměl chodit.'), t('Rum. A nekoukej na hodinky.')],
    idle: [t('Za mých časů bylo pivo za korunu. A sklep byl menší.'), t('Ten Vacek… taky šel do sklepa.'), t('Chrup mi tu někde vypad.'), t('Vacek taky tak pobíhal. A pak šup do sklepa.'), t('Moje kolena předpovídají déšť. A rvačku.'), t('Za komunistů tu aspoň netáhlo. Teda táhlo.')],
    quests: [
      { kind: 'find', item: 'qRing', itemName: t('prstýnek'), count: 1, reward: 250, rep: 4, short: t('Mařena: najít prstýnek'), text: t('Ztratila jsem ve sklepě prstýnek po nebožtíkovi. Najdeš ho, hošánku? Svítí to.'), thanks: t('Ach, ty můj zlatej. Prstýnek, ne ty.') },
      { kind: 'find', item: 'qTeeth', itemName: t('umělý chrup'), count: 1, reward: 380, rep: 5, short: t('Mařena: najít chrup'), text: t('Nesměj se. Ten chrup mi ve sklepě sebrala krysa. Velká krysa. Najdi ho.'), thanks: t('Teď už zase můžu kousat. Hlavně tebe, když ošidíš pivo.') },
      { kind: 'find', item: 'qPhoto', itemName: t('stará fotka'), count: 1, reward: 700, rep: 8, short: t('Mařena: najít fotku z roku 1962'), text: t('Hluboko dole je fotka. Já a Vacek, 1962. Nikdo ji odtamtud nevynesl. Ty to zvládneš.'), thanks: t('…díky. Vacek se na ní usmívá. Tehdy ještě nevěděl, co je dole.') },
    ],
  },
  {
    id: 'doctor',
    name: t('Doktor Novák'),
    acc: t('doktora Nováka'), // 4. pád: „Neviděl někdo …?“
    look: {
      skin: 'skin', skinShade: 'tan', hair: 'slate', hairShade: 'dusk', shirt: 'white', shirtShade: 'fog',
      pants: 'slate', pantsShade: 'dusk', shoes: 'ink', hat: 'bald', beard: 'none', coat: true,
    },
    greet: [t('Jedno pivo. Čistě ze zdravotních důvodů.'), t('Dobrý den. Měl jsem dneska těžkou ordinaci.'), t('Jako lékař vám doporučuji dvanáctku.'), t('Pacient hospoda, jak se dnes máme?'), t('Přišel jsem na kontrolu. Půllitru.'), t('Dobrý večer. Ordinace dnes zavřela dřív.')],
    idle: [t('Tady by hygiena měla žně. Já to nehlásím.'), t('Ty krysy dole jsou velké jak jezevci.'), t('Pivo je lék. Hlavně na střízlivost.'), t('Diagnóza: žízeň. Léčba: další kolo.'), t('Kdo pije, nežije nudně. To je lékařský fakt.'), t('Ten kašel od stolu vedle se mi nelíbí.')],
    quests: [
      { kind: 'kill', enemy: 'rat', count: 6, reward: 200, rep: 3, short: t('Doktor: 6× krysa'), text: t('Jako lékař trvám na deratizaci. Zabijte ve sklepě šest krys. Koštětem, ne mými nástroji.'), thanks: t('Výborně. Hygienicky nezávadné. Skoro.') },
      { kind: 'kill', enemy: 'spider', count: 5, reward: 380, rep: 4, short: t('Doktor: 5× pavouk'), text: t('Pavouci jsou užiteční. Ale ne takhle velcí. Pět jich prosím odstraňte.'), thanks: t('Arachnofobie vyléčena. Moje, ne vaše.') },
      { kind: 'kill', enemy: 'drowner', count: 4, reward: 650, rep: 6, short: t('Doktor: 4× utopenec (nepřítel)'), text: t('Ve studni dole se něco topí a pořád ne a ne se utopit. Čtyři kusy, prosím.'), thanks: t('Diagnóza: utopen. Definitivně.') },
    ],
  },
  {
    id: 'pepik',
    name: t('Kuba'),
    acc: t('Kubu'), // 4. pád: „Neviděl někdo …?“
    look: {
      skin: 'fog', skinShade: 'slate', hair: 'dusk', hairShade: 'ink', shirt: 'olive', shirtShade: 'ink',
      pants: 'dusk', pantsShade: 'ink', shoes: 'ink', hat: 'hat', hatColor: 'dusk', hatShade: 'ink', beard: 'none',
    },
    greet: [t('Kuba tu byl. Kuba tu je.'), t('Dobrej. Zase jsem vylezl.'), t('…'), t('Kuba je tu zase. Kuba nemá kam jít.'), t('Dobrej. Zabloudil jsem nahoru.'), t('Pivo pro Kubu. Kuba platí.')],
    idle: [t('Já jsem tu od osmdesátýho sedmýho.'), t('Dole je to lepší. Ale pivo nahoře.'), t('Neviděls tam dole moje boty?'), t('Tam dole je stůl. Taky je od osmdesátýho sedmýho.'), t('Kuba neví, co je za den. Kubovi je to jedno.'), t('Ve sklepě je ticho. Tady je ticho s pivem.')],
    quests: [
      { kind: 'kill', enemy: 'zombie', count: 3, reward: 300, rep: 4, short: t('Kuba: 3× zombie štamgast'), text: t('Dole chodí moji bývalí kámoši. Už nejsou moc kámoši. Pošli tři z nich spát.'), thanks: t('Díky. Teď mají klid. Já ne, ale to nevadí.') },
      { kind: 'find', item: 'qBoots', itemName: t('Kubovy boty'), count: 1, reward: 450, rep: 5, short: t('Kuba: najít boty'), text: t('Nechal jsem dole boty. V roce 1988. Asi tam pořád jsou.'), thanks: t('Moje boty! Ještě teplý. To je divný.') },
      { kind: 'boss', count: 1, reward: 1500, rep: 10, short: t('Kuba: porazit Sudomora'), text: t('V nejhlubší sudovně žije Sudomor. Sežral mi život. A taky sud. Udělej s ním pořádek.'), thanks: t('Je konec? Ne… on se vrátí zítra. Ale dneska vyhráls.') },
    ],
  },
  // ---------------------------------------------------------------- zmizelí štamgasti (najdeš je ve sklepě)
  {
    id: 'bohous',
    name: t('Strejda Bohouš'),
    acc: t('strejdu Bohouše'), // 4. pád: „Neviděl někdo …?“
    look: {
      skin: 'skin', skinShade: 'tan', hair: 'fog', hairShade: 'slate', shirt: 'blue', shirtShade: 'navy',
      pants: 'dusk', pantsShade: 'ink', shoes: 'ink', hat: 'cap', hatColor: 'blue', hatShade: 'navy', beard: 'full',
    },
    greet: [t('Šel jsem jen na malou. Na tři týdny.'), t('Pivo! Konečně tekutina, co se nehýbe.'), t('Bohouš je zpátky. Bohouš má žízeň.'), t('Strejda Bohouš! Kdo by to byl řek.'), t('Zase mám žízeň za celej měsíc.'), t('Jedno velký, a pak se uvidí.')],
    idle: [t('Dole jsem jedl houby. Pak houby jedly mě.'), t('Ten led tam dole… klouže i myšlenka.'), t('Kdybys viděl golema ráno. Hrůza.'), t('Dole jsem potkal kostlivce. Měl lepší vtipy než já.'), t('Ještě teď mi cvakají zuby z toho ledu.'), t('Houby už nejím. Už nikdy.')],
    quests: [],
    lost: {
      theme: 2,
      down: [t('Kde je tu záchod?'), t('Já tu jen čekám na Ferdu.'), t('Nevíte, kolik je hodin? Nebo dní?')],
      found: t('Ty jsi nahoře? Tak to beru. Vyveď mě, já půjdu za tebou. Hlavně ne přes ten led.'),
      staff: t('Bohouš umí točit. Hlavně do sebe, ale i do půllitru.'),
    },
  },
  {
    id: 'kaja',
    name: t('Kája z dráhy'),
    acc: t('Káju z dráhy'), // 4. pád: „Neviděl někdo …?“
    look: {
      skin: 'skin', skinShade: 'ochre', hair: 'rust', hairShade: 'blood', shirt: 'ochre', shirtShade: 'rust',
      pants: 'navy', pantsShade: 'ink', shoes: 'ink', hat: 'beanie', hatColor: 'red', hatShade: 'blood', beard: 'mustache',
    },
    greet: [t('Výpravčí Kája hlásí příjezd. Se zpožděním.'), t('Jedno točený, a ať to nekape.'), t('Tady je sucho. To je dobře. Dole bylo mokro.'), t('Odjezd v pět, pivo v čtyři padesát.'), t('Kája hlásí: na nástupišti je žízeň.'), t('Dobrej. Vlak mi ujel, tak jsem tady.')],
    idle: [t('Ve třetím patře plave něco, co má jízdenku.'), t('Ta studna mi řekla moje rodné číslo.'), t('Brodil jsem se tam rok. Nebo hodinu. Voda nemá kalendář.'), t('Výhybka ve sklepě pořád vrže. Slyšíš?'), t('Ten utopenec dole mi chtěl prodat jízdenku.'), t('Zpoždění dvacet minut. U piva to nevadí.')],
    quests: [],
    lost: {
      theme: 3,
      down: [t('Vlak do hospody P.U.B. má zpoždění.'), t('Nesahejte na vodu. Ona sahá na vás.'), t('Mám mokré ponožky už od jara.')],
      found: t('Konečně někdo s baterkou! Jdu za tebou. Jestli to tu znáš, já tu znám jen vodu.'),
      staff: t('Kája unese sud i se zpožděním.'),
    },
  },
  {
    id: 'vodicka',
    name: t('Pan Vodička'),
    acc: t('pana Vodičku'), // 4. pád: „Neviděl někdo …?“
    look: {
      skin: 'fog', skinShade: 'slate', hair: 'ink', hairShade: 'ink', shirt: 'white', shirtShade: 'fog',
      pants: 'ink', pantsShade: 'coal', shoes: 'ink', hat: 'hat', hatColor: 'ink', hatShade: 'coal', beard: 'none', coat: true,
    },
    greet: [t('Dobrý večer. Ještě je večer?'), t('Byl jsem v hospodě pod hospodou. Tahle je lepší. Platí se tu.'), t('Pan Vodička, k službám. Dole jsem obsluhoval já.'), t('Pan Vodička, dobrý večer. Ještě točíte?'), t('Dovolte, abych si přisedl.'), t('Zase o patro výš. To je pokrok.')],
    idle: [t('Dole jsem točil Sudomorovi. Dýško nedával.'), t('Pod hospodou je pořád zavírací doba.'), t('Bohouš? Ten šel za mnou. Já šel za Vackem.'), t('Dole jsem nosil sedm půllitrů najednou. Tady stačí jeden.'), t('Váš výčep je čistší než ten pod zemí.'), t('Nosit pivo duchům je nevděčná práce.')],
    quests: [],
    lost: {
      theme: 4,
      down: [t('Prosím, posaďte se. Hned vás obsloužím. Už čtyřicet let.'), t('Tady se neplatí. Tady se zůstává.'), t('Vidíte ten pult? Je stejný jako nahoře. Až na ty zuby.')],
      found: t('Vy jste ze světa nahoře? Tak to mě musíte vyvést. Tady dole se nedá dát výpověď.'),
      staff: t('Pan Vodička obsluhoval i Sudomora. Hosté nahoře jsou pro něj dovolená.'),
    },
  },
];

export const LOST = REGULARS.filter((r) => r.lost);

export function regular(id: string) {
  return REGULARS.find((r) => r.id === id)!;
}
