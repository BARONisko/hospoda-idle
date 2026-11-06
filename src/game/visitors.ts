// Návštěvníci s rozhodnutím: do hospody přijde postava a hráč volí ze dvou možností (riziko / jistota).
import { t } from '../i18n';
import { big } from '../core/num';

/** co volba může udělat se hrou */
export interface VisitCtx {
  /** výdělek za tolik sekund (základ pro ceny a odměny) */
  income(secs: number): number;
  coins(): number;
  spend(n: number): void;
  gain(n: number): void;
  /** ×2 výdělek na ms */
  boost(ms: number): void;
  later(ms: number, fn: () => void): void;
  say(text: string): void;
}

export interface Choice {
  label: string;
  /** cena v coins (zobrazí se na tlačítku), 0 = zdarma */
  cost: (c: VisitCtx) => number;
  run: (c: VisitCtx) => void;
}

export interface Visitor {
  key: string;
  name: string;
  text: string;
  a: Choice;
  b: Choice;
}

const chance = (p: number) => Math.random() < p;

export const VISITORS: Visitor[] = [
  {
    key: 'inspector',
    name: t('Hygienik'),
    text: t('Našel v guláši vlas. „To bude pokuta, pane hostinský…“'),
    a: { label: t('Podplatit'), cost: (c) => c.income(120), run: (c) => c.say(t('Hygienik spokojeně odešel.')) },
    b: {
      label: t('Riskovat'),
      cost: () => 0,
      run: (c) => {
        if (chance(0.5)) return c.say(t('Vlas byl tvůj. Hygienik se omluvil!'));
        const n = Math.min(c.coins(), c.income(300));
        c.spend(n);
        c.say(t('Pokuta! −{n}', { n: big(n) }));
      },
    },
  },
  {
    key: 'brewer',
    name: t('Sládek'),
    text: t('Nabízí tajný recept na pivo. Hosté po něm šílí!'),
    a: {
      label: t('Koupit recept'),
      cost: (c) => c.income(180),
      run: (c) => {
        c.boost(600_000);
        c.say(t('Nový recept! ×2 výdělek na 10 min'));
      },
    },
    b: { label: t('Odmítnout'), cost: () => 0, run: (c) => c.say(t('Sládek odešel ke konkurenci.')) },
  },
  {
    key: 'reg_pepik',
    name: t('Štamgast Pepík'),
    text: t('Chce pít na sekeru. Prý zítra zaplatí i s úrokem.'),
    a: {
      label: t('Nalít mu'),
      cost: (c) => c.income(60),
      run: (c) => {
        c.say(t('Pepík pije na sekeru…'));
        const back = c.income(240);
        c.later(90_000, () => {
          if (chance(0.7)) {
            c.gain(back);
            c.say(t('Pepík splatil sekeru! +{n}', { n: big(back) }));
          } else c.say(t('Pepík zmizel i se sekerou!'));
        });
      },
    },
    b: { label: t('Vyhodit ho'), cost: () => 0, run: (c) => c.say(t('Pepík uraženě odešel.')) },
  },
  {
    key: 'stranger',
    name: t('Muž v kabátě'),
    text: t('Prodává tajemný sud. Co v něm asi je?'),
    a: {
      label: t('Koupit sud'),
      cost: (c) => c.income(300),
      run: (c) => {
        if (chance(0.5)) {
          const n = c.income(900);
          c.gain(n);
          c.say(t('Byla v něm zlatá jedenáctka! +{n}', { n: big(n) }));
        } else c.say(t('Byl v něm jen ocet…'));
      },
    },
    b: { label: t('Ne, díky'), cost: () => 0, run: (c) => c.say(t('Muž v kabátě zmizel ve tmě.')) },
  },
  {
    key: 'influencer',
    name: t('Influencerka'),
    text: t('Chce u vás natáčet. Přijde dav, ale bude hluk a nepořádek.'),
    a: {
      label: t('Pustit ji'),
      cost: () => 0,
      run: (c) => {
        if (chance(0.6)) {
          c.boost(180_000);
          c.say(t('Video je virální! ×2 výdělek na 3 min'));
        } else {
          const n = Math.min(c.coins(), c.income(120));
          c.spend(n);
          c.say(t('Dav rozbil půllitry! −{n}', { n: big(n) }));
        }
      },
    },
    b: { label: t('Zakázat'), cost: () => 0, run: (c) => c.say(t('Influencerka natočila stížnost.')) },
  },
];
