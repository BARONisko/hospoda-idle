// Skilly na rok: kolik XP hostinského (≈ koupené úrovně + ťuknutí na bubliny) za den a kolik bodů/hodností za rok.
// Spuštění: CHAIN=1 node tools/sim/run.mjs && node tools/sim/skills.mjs
const { run, simCount } = await import('../_tmp/sim.mjs');
const kf = (r, p) => Math.floor(2 * (r / (1e5 * 10 ** (p - 1))) ** 0.25);
// 1) hygieny za sebou jako aktivní hráč: úrovně za hodinu hraní
let k = 0, pubs = 1, tot = 0;
simCount.levels = 0;
for (let n = 0; n < 12; n++) {
  const goal = n ? Math.max(6, Math.ceil(0.1 * k)) : 4;
  const t = run(pubs, k, 4 * 3600, goal, kf);
  if (typeof t !== 'number') break;
  tot += t; k += goal; pubs = Math.min(3, pubs + 1);
}
const lvH = simCount.levels / (tot / 3600);
console.log(`aktivní hra: ${(tot / 3600).toFixed(1)} h, koupeno ${simCount.levels} úrovní → ${lvH.toFixed(0)} úrovní/h`);

// 2) body hostinského: celkem XP potřebné na úroveň L = A·L^K (navrženo A=2,6, K=2,5)
const A = 2.6, K = 2.5;
const lvlOf = (xp) => Math.floor((xp / A) ** (1 / K));
const players = { 'slabší (15 min/den)': 1000, 'běžný (1 h/den)': 4000, 'zapálený (4 h/den)': 15000 };
const days = [1, 7, 30, 100, 365];
console.log('\nBODY hostinského (úroveň) po dnech', days.join(' / '));
for (const [n, perDay] of Object.entries(players)) console.log(' ', n.padEnd(22), days.map((d) => lvlOf(perDay * d)).join(' / '));

// 3) mistrovství: stupeň s (1–50) potřebuje celkem M0·s^P sekund obsluhy stanice (součet přes hospody, i offline)
const M0 = 2100, P = 2.56;
const stage = (sec) => Math.min(50, Math.floor((sec / M0) ** (1 / P)));
const RANKS = ['Učeň', 'Tovaryš', 'Mistr', 'Velmistr', 'Legenda'];
const nm = (s) => (s ? `${RANKS[Math.min(4, Math.floor((s - 1) / 10))]} ${((s - 1) % 10) + 1}` : '–');
const runH = { 'slabší (4 h běží/den, 2 hospody)': 4 * 2, 'běžný (12 h/den, 3 hospody)': 12 * 3, 'zapálený (20 h/den, 3 hospody)': 20 * 3 };
console.log('\nMISTROVSTVÍ stanice po dnech', days.join(' / '));
for (const [n, h] of Object.entries(runH)) console.log(' ', n.padEnd(32), days.map((d) => nm(stage(h * 3600 * d))).join(' / '));

// 4) hospoda 63b: body do stromu = úrovně hostinského + stupně mistrovství + hvězdy stanic + úrovně věrnosti hostů
const STEPS = [300, 1750, 7500, 18750, 43000];
const loy = (n) => STEPS.filter((s) => n >= s).length;
// obsloužení jednoho druhu hosta za den (bubliny: ťuk + sběrač, ~1500/h na hospodu ÷ ~12 druhů) podle času ve hře
const serve = { 'slabší (15 min/den)': 30, 'běžný (1 h/den)': 125, 'zapálený (4 h/den)': 400 };
const mastH = { 'slabší (15 min/den)': 8, 'běžný (1 h/den)': 36, 'zapálený (4 h/den)': 60 };
const starsAt = (d) => Math.min(60, Math.round(d / 7)); // ~1 hvězda týdně (hvězda = úroveň 300–500 v kole)
const TYPES = 32;
const pathCost = [2, 5, 8];
let tree = 0;
for (let i = 0; i < 28; i++) tree += pathCost[Math.floor(i / 10)] + ([6, 13, 20, 27].includes(i) ? 6 : 0) + ([2, 8, 11, 16, 22, 25].includes(i) ? 2 * pathCost[Math.floor(i / 10)] : 0);
console.log(`\nCELÝ STROM stojí ${tree * 3} bodů`);
console.log('BODY CELKEM po dnech', days.join(' / '), '(úrovně + mistrovství + hvězdy + hosté)');
for (const n of Object.keys(players)) {
  const row = days.map((d) => {
    const k = lvlOf(players[n] * d) - 1, m = 4 * stage(mastH[n] * 3600 * d), s = starsAt(d), l = TYPES * loy(serve[n] * d);
    return `${k + m + s + l}`;
  });
  console.log(' ', n.padEnd(22), row.join(' / '));
}
for (const n of Object.keys(serve)) {
  const d = Math.ceil(STEPS[4] / serve[n]);
  console.log(`  host na max (${n}): ${d} dní; úrovně 1–4 po ${STEPS.slice(0, 4).map((x) => Math.ceil(x / serve[n])).join(' / ')} dnech`);
}
