// Řada hygien za sebou (hráč zavírá hned, jak smí): délky kol pro varianty vzorce krígel. CHAIN=1 node tools/sim/run.mjs && node tools/sim/chain.mjs [V=jméno]
const { run } = await import('../_tmp/sim.mjs');
const base = (r) => Math.floor(2 * (r / 1e5) ** 0.25);
const V = {
  TEĎ: { kf: (r) => base(r), min: (n, k) => (n ? 6 : 4) },
  HRA: { kf: (r, p) => Math.floor(2 * (r / (1e5 * 10 ** (p - 1))) ** 0.25), min: (n, k) => (n ? Math.max(6, Math.ceil(0.05 * k)) : 4) },
  'A krígly/hospodu': { kf: (r, p) => Math.floor(2 * (r / (1e5 * 10 ** (p - 1))) ** 0.25), min: (n) => (n ? 6 : 4) },
  'B min +25 %': { kf: (r) => base(r), min: (n, k) => (n ? Math.max(6, Math.ceil(0.25 * k)) : 4) },
  'A+B': { kf: (r, p) => Math.floor(2 * (r / (1e5 * 10 ** (p - 1))) ** 0.25), min: (n, k) => (n ? Math.max(6, Math.ceil(0.25 * k)) : 4) },
  'A+10 %': { kf: (r, p) => Math.floor(2 * (r / (1e5 * 10 ** (p - 1))) ** 0.25), min: (n, k) => (n ? Math.max(6, Math.ceil(0.10 * k)) : 4) },
  'A+7 %': { kf: (r, p) => Math.floor(2 * (r / (1e5 * 10 ** (p - 1))) ** 0.25), min: (n, k) => (n ? Math.max(6, Math.ceil(0.07 * k)) : 4) },
  'A+15 %': { kf: (r, p) => Math.floor(2 * (r / (1e5 * 10 ** (p - 1))) ** 0.25), min: (n, k) => (n ? Math.max(6, Math.ceil(0.15 * k)) : 4) },
};
const only = process.env.V;
for (const [name, v] of Object.entries(V)) {
  if (only && !name.startsWith(only)) continue;
  let k = 0, pubs = 1, tot = 0; const out = [];
  for (let n = 0; n < Number(process.env.N ?? 16); n++) {
    const goal = v.min(n, k);
    const t = run(pubs, k, 4 * 3600, goal, v.kf);
    if (typeof t !== 'number') { out.push('>4h'); break; }
    tot += t; k += goal; out.push(`${(t / 60).toFixed(1)}`); pubs = Math.min(3, pubs + 1);
  }
  console.log(name.padEnd(18), 'kola [min]:', out.join(' '), '| celkem', (tot / 3600).toFixed(1), 'h, krígel', k);
}
