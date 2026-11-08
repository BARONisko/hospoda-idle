// Sběrač bublin (za kosti): ceny a maxima (hospoda 63 – zdraženo, ať 3. sběrač není za den; výpočet tools/sim/coll.mjs).
// Rychlost: 30 s × 0,99^úroveň, nejrychleji 1,5 s (~298 úrovní). +1 bublina naráz: nejvýš 5.
// Běžný hráč (~100 K kostí/den, třetina na sběrače) má všechny 3 sběrače na max asi za rok.
export const COLL_HIRE = [500, 20000, 300000];
const F = [1, 3, 9];
const f = (pub: number) => F[Math.min(F.length - 1, Math.max(0, pub))];
export const COLL_AMT_MAX = 5;
/** cena najmutí sběrače v hospodě (index 0–2) */
export const collHire = (pub: number) => COLL_HIRE[Math.min(COLL_HIRE.length - 1, pub)];
/** cena další úrovně rychlosti */
export const collSpdCost = (pub: number, n: number) => Math.ceil(f(pub) * (100 + (n + 1) ** 1.5));
/** cena další bubliny naráz */
export const collAmtCost = (pub: number, n: number) => Math.ceil(1000 * f(pub) * 4 ** n);
