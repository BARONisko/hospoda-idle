import { PixelCanvas } from './pixel';

// Král ve žlutém (Chambers 1895): Žlutý znak vypálený do zdi, Žlutý krígl na pultu.
const SIGNS: Record<'A' | 'B' | 'C', string[]> = {
  // A: trojramenná spirála
  A: [
    '....aaa.....',
    '...a...a....',
    '...a.a......',
    '....aa......',
    '.....a......',
    '.a..aaa..a..',
    'a..aa.aa..a.',
    'a.a.....a.a.',
    '.aa.....aa..',
    '............',
  ],
  // B: oko se třemi háčky
  B: [
    '.....a......',
    '..a..a..a...',
    '...a.a.a....',
    '....aaa.....',
    '.aaaa.aaaa..',
    '....aaa.....',
    '...a.a.a....',
    '..a..a..a...',
    '.....a......',
    '............',
  ],
  // C: zkroucený kříž
  C: [
    '...aaa......',
    '..a..aa.....',
    '.....a......',
    '..aaaaaaa...',
    '.a...a...a..',
    '.....a......',
    '....a.a.....',
    '...a...a....',
    '..aa...aa...',
    '............',
  ],
};

export function yellowSign(v: 'A' | 'B' | 'C'): PixelCanvas {
  return new PixelCanvas(14, 12).template(SIGNS[v], 1, 1).outline('olive');
}

function yellowKrigl(): PixelCanvas {
  return new PixelCanvas(12, 14).template([
    '..yyyyy...',
    '.ywwwwwy..',
    '.gggggga..',
    '.gyggagaaa',
    '.gyggaga.a',
    '.gygaaga.a',
    '.gyggaga.a',
    '.gyggagaaa',
    '.gggggga..',
    '..aaaaa...',
  ], 1, 2).outline('ink');
}

export function buildYellowArt(v: 'A' | 'B' | 'C' = 'A'): Record<string, PixelCanvas> {
  return { ySign: yellowSign(v), yKrigl: yellowKrigl() };
}
