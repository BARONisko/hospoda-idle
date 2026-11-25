// Simulace ligy: vyrovnanost soupeře pro slabšího, běžného a zapáleného hráče (26 týdnů, týden ±15 % náhodně; = těsný výsledek, zůstává).
// Spuštění: node tools/sim/league.mjs
import { LeagueState, rivalTick, rivalRate, weekEnd, LEAGUES, leagueMove } from '../../src/core/league';
// náhoda týdne: hráč hraje ±15 % jinak než obvykle (deterministicky)
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const DAY = 86400_000, WEEK = 7 * DAY;
type P = { name: string; grow: number; share: number; sessions: number[] };
const players: P[] = [
  { name: 'slabší (2× denně, roste 8 %/den)', grow: 1.08, share: 0.25, sessions: [8, 20] },
  { name: 'běžný (4× denně, roste 15 %/den)', grow: 1.15, share: 0.4, sessions: [7, 12, 17, 21] },
  { name: 'zapálený (8× denně, roste 25 %/den)', grow: 1.25, share: 0.7, sessions: [7, 9, 11, 13, 15, 17, 19, 22] },
];
for (const pl of players) {
  let tier = 1, R = 100, last: { me: number; base?: number }[] = [];
  const tiers = [0, 0, 0, 0, 0];
  const res: string[] = [];
  let wins = 0;
  for (let w = 0; w < 26; w++) {
    const luck = 0.85 + 0.3 * rnd();
    const start = w * WEEK;
    const L: LeagueState = { week: String(start), start, tier, rate: rivalRate(tier, R, last), me: 0, rival: 0, rAt: start, base: R };
    let pending = 0;
    for (let tm = start; tm < start + WEEK; tm += 600_000) {
      const day = (tm - start) / DAY;
      pending += R * pl.grow ** day * pl.share * luck * 600;
      const hour = Math.floor((tm % DAY) / 3600_000), min = (tm % 3600_000) / 60000;
      if (min === 0 && pl.sessions.includes(hour)) (L.me += pending), (pending = 0), rivalTick(L, tm);
    }
    L.me += pending;
    const rival = rivalTick(L, weekEnd(L));
    const win = L.me > rival, move = leagueMove(L.me, rival);
    tiers[tier - 1]++;
    wins += +win;
    res.push(`${win ? '✓' : '✗'}${tier}${move ? '' : '='}`);
    last = [...last, { me: L.me, base: L.base }].slice(-3);
    R *= pl.grow ** 7;
    tier = Math.min(LEAGUES.length, Math.max(1, tier + move));
  }
  console.log(`${pl.name}: výher ${wins}/26, týdnů v lize 1–5: ${tiers.join(' / ')}\n  ${res.join(' ')}`);
}
