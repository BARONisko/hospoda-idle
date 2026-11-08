// Jediná paleta hry: 32 barev vybraných z palety „Resurrect 64“ (Kerrie Lake).
// Všechny sprity, dlaždice i UI se kreslí výhradně z těchto barev.

export const PAL = {
  // neutrální
  ink: '#2e222f', // obrysy, nejtmavší
  dusk: '#3e3546',
  slate: '#625565',
  mauve: '#966c6c',
  tan: '#ab947a',
  fog: '#9babb2',
  bone: '#c7dcd0',
  white: '#ffffff',
  // červené
  blood: '#6e2727',
  red: '#b33831',
  scarlet: '#e83b3b',
  maroon: '#7a3045',
  // dřevo / měď / jantar
  rust: '#9e4539',
  copper: '#cd683d',
  ochre: '#e6904e',
  sand: '#fbb954',
  amber: '#f79617',
  gold: '#f9c22b',
  olive: '#4c3e24',
  // zelené
  pine: '#165a4c',
  green: '#239063',
  mint: '#1ebc73',
  sage: '#547e64',
  // sklep – studené
  coal: '#313638',
  grave: '#374e4a',
  navy: '#323353',
  indigo: '#484a77',
  blue: '#4d65b4',
  sky: '#4d9be6',
  ice: '#8fd3ff',
  plum: '#6b3e75',
  /** světle fialová (5. hvězda stanice – dřív tmavá plum, na kartě nebyla vidět) */
  pink: '#e29bf0',
  // pleť
  skin: '#fdcbb0',
} as const;

export type PalKey = keyof typeof PAL;

/** Barva jako číslo pro Phaser (0xRRGGBB). */
export function hex(k: PalKey): number {
  return parseInt(PAL[k].slice(1), 16);
}
