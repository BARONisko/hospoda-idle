// Písmo a barvy UI (stejné jako v P.U.B.)
import { PAL } from '../data/palette';

export const FONT = '"Jersey 10", monospace';
// tmavý text (na světlé bublině) bez obrysu – tmavý obrys by písmena slil dohromady
export const txt = (size: number, color: string = PAL.bone) =>
  ({ fontFamily: FONT, fontSize: `${size}px`, color, stroke: PAL.ink, strokeThickness: color === PAL.ink ? 0 : Math.max(2, Math.round(size / 8)) });
