// Velká čísla pro idle hru: 1 234 → „1,23K“, pak M, B, T, a od 1e15 dvoupísmenné aa, ab, … (běžné v idle hrách).
const SHORT = ['', 'K', 'M', 'B', 'T'];

export function big(n: number): string {
  if (!isFinite(n)) return '∞';
  const neg = n < 0;
  n = Math.abs(n);
  let s: string;
  if (n < 1000) s = n < 10 && n % 1 !== 0 ? n.toFixed(1) : Math.floor(n).toString();
  else {
    const e = Math.floor(Math.log10(n) / 3); // skupina po tisících
    const v = n / 10 ** (e * 3);
    const d = v >= 100 ? 0 : v >= 10 ? 1 : 2;
    s = String(Math.floor(v * 10 ** d) / 10 ** d) + suffix(e); // bez koncových nul: 5K, 1.5K, 12.34M
  }
  return (neg ? '-' : '') + s;
}

function suffix(e: number): string {
  if (e < SHORT.length) return SHORT[e];
  const k = e - SHORT.length; // 0 → aa, 1 → ab, … 25 → az, 26 → ba
  return String.fromCharCode(97 + Math.floor(k / 26) % 26) + String.fromCharCode(97 + (k % 26));
}

/** Doba „1 h 05 min“ / „3 min 20 s“ */
export function dur(sec: number): string {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h} h ${String(m).padStart(2, '0')} min`;
  if (m) return `${m} min ${String(s).padStart(2, '0')} s`;
  return `${s} s`;
}
