// Zalamování textu pro čínštinu a japonštinu: Phaser láme řádky jen na mezerách, CJK text mezery nemá.
// Lámeme po znacích (latinková slova a čísla drží pohromadě), interpunkce nezačíná řádek.
import Phaser from 'phaser';
import { lang } from './index';

const NO_START = new Set([...'，。、！？：；）」』】》〉…・ー,.!?:;)]}%~〜’”']);
const TOKEN = /[A-Za-z0-9À-ž{}%+\-–×'’.,:!?/]+|\s+|./gsu;

function cjkWrap(this: Phaser.GameObjects.Text, text: string, ctx: CanvasRenderingContext2D, width: number): string {
  const out: string[] = [];
  for (const para of text.split(/\r\n|\r|\n/)) {
    let line = '';
    for (const tok of para.match(TOKEN) ?? []) {
      const next = line + tok;
      if (line && ctx.measureText(next).width > width && !/^\s+$/.test(tok) && !NO_START.has(tok[0])) {
        out.push(line.replace(/\s+$/, ''));
        line = tok.replace(/^\s+/, '');
      } else line = next;
    }
    out.push(line);
  }
  return out.join('\n');
}

/** Výška řádku se měří na „testString“ v hlavním písmu (Jersey) – záložní CJK/azbuka jsou vyšší a řádky by se překrývaly. */
function installTestString() {
  const test = '|MÉqgy国あ한Йу';
  const proto = Phaser.GameObjects.TextStyle.prototype as unknown as { setStyle: (style: object | undefined, u?: boolean, d?: boolean) => unknown };
  const orig = proto.setStyle;
  proto.setStyle = function (this: unknown, style, u, d) {
    if (d && !(style && 'testString' in style)) style = { ...(style ?? {}), testString: test };
    return orig.call(this, style, u, d);
  };
}

export function installCjkWrap() {
  if (lang === 'zh' || lang === 'ja' || lang === 'ko' || lang === 'ru') installTestString();
  if (lang !== 'zh' && lang !== 'ja') return;
  const proto = Phaser.GameObjects.Text.prototype as unknown as Record<string, unknown>;
  proto.basicWordWrap = cjkWrap;
  proto.advancedWordWrap = cjkWrap;
}
