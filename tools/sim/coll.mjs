// Sběrač bublin: kolik kostí stojí do maxima a za jak dlouho (node tools/sim/coll.mjs).
// Stejné vzorce jako src/core/collector.ts (při změně upravit obojí).
// Rychlost: 30 s × 0,99^úroveň, max 1,5 s (298 úrovní); +1 bublina: max 5. Ceny podle hospody ×1 / ×3 / ×9.
export const HIRE = [500, 20000, 300000], F = [1, 3, 9], SPD_LV = 298, AMT_MAX = 5;
export const spdCost = (f, n) => Math.ceil(f * (100 + (n + 1) ** 1.5));
export const amtCost = (f, n) => Math.ceil(1000 * f * 4 ** n);
const fmt = (x) => (x >= 1e6 ? (x / 1e6).toFixed(1) + ' M' : Math.round(x / 1e3) + ' K');
let tot = 0;
F.forEach((f, i) => {
  let s = 0, a = 0;
  for (let n = 0; n < SPD_LV; n++) s += spdCost(f, n);
  for (let n = 0; n < AMT_MAX; n++) a += amtCost(f, n);
  tot += HIRE[i] + s + a;
  console.log(`hospoda ${i + 1}: najmout ${fmt(HIRE[i])}, rychlost max ${fmt(s)}, bubliny max ${fmt(a)} kostí`);
});
console.log('celkem všechny 3 sběrače na max:', fmt(tot), 'kostí');
// kosti za den (odhad): noc ~11–30 % času, 3 hospody, stanice ~4–8 kostí/s v noci, hra běží (s offline) 6/12/20 h denně;
// na sběrače jde asi třetina kostí (zbytek Kostnice, talismany, delší noc)
for (const [n, perDay] of [['slabší', 25e3], ['běžný', 100e3], ['zapálený', 300e3]]) {
  const d = tot / (perDay / 3);
  console.log(`${n.padEnd(9)} ~${fmt(perDay)} kostí/den → všechny sběrače max za ${Math.round(d)} dní (${(d / 30).toFixed(1)} měs.); 3. sběrač najmout za ~${(HIRE[2] / (perDay / 3)).toFixed(1)} dne`);
}
