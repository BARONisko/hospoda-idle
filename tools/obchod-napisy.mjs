// Snímky do obchodu s velkým nápisem: node compose.mjs <raw-dir> <out-dir> <styl A|B|C> [jen první n]
import { chromium } from 'playwright-core';
import fs from 'fs';
const [raw, out, style = 'B', only = '99'] = process.argv.slice(2);
const SET = [
  ['pub1', 'BUILD THE PUB\nOF YOUR DREAMS'],
  ['pub2', 'OPEN NEW PUBS –\nVAMPIRES WELCOME'],
  ['temple', 'FIGHT CTHULHU\nON WEEKENDS'],
  ['darts', 'PLAY DARTS\nFOR PRIZES'],
  ['away', 'EARN WHILE\nYOU SLEEP'],
  ['league', 'BEAT YOUR RIVAL\nEVERY WEEK'],
  ['brew', 'BREW YOUR\nOWN BEER'],
  ['menu', 'SO MUCH\nTO UNLOCK'],
].slice(0, Number(only));
const font = fs.readFileSync('node_modules/@fontsource/jersey-10/files/jersey-10-latin-400-normal.woff2').toString('base64');
const css = {
  A: { bg: 'linear-gradient(#3b2a3d,#1c1420)', head: '#f9c22b', sh: '#120c14', border: '#f9c22b' },
  B: { bg: 'radial-gradient(circle at 50% 34%, #ffc440 0 22%, #f0a23a 22% 40%, #d97a30 40% 58%, #b4532a 58% 76%, #8a3524 76% 100%)', head: '#fff0c8', sh: '#2e222f', border: '#2e222f' },
  C: { bg: '#1c1420', head: '#f9c22b', sh: '#120c14', border: 'transparent' },
}[style];
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
let i = 0;
for (const [name, text] of SET) {
  i++;
  const img = fs.readFileSync(`${raw}/${name}.png`).toString('base64');
  const shotCss = style === 'C'
    ? 'position:absolute;left:0;top:0;width:1080px;height:1920px;'
    : `position:absolute;left:110px;top:372px;width:860px;height:1529px;border-radius:40px;box-shadow:0 0 0 12px ${css.border},0 26px 0 12px rgba(0,0,0,.28);`;
  const headCss = style === 'C'
    ? 'position:absolute;left:0;top:0;width:1080px;height:520px;background:linear-gradient(rgba(20,12,22,.97) 62%,rgba(20,12,22,0));padding-top:38px;'
    : 'position:absolute;left:0;top:26px;width:1080px;height:330px;';
  await p.setContent(`<html><head><style>
    @font-face{font-family:J;src:url(data:font/woff2;base64,${font}) format('woff2');}
    body{margin:0;width:1080px;height:1920px;overflow:hidden;background:${css.bg};position:relative;}
    .h{${headCss}display:flex;align-items:center;justify-content:center;text-align:center;font:150px/0.86 J;color:${css.head};white-space:pre-line;letter-spacing:2px;text-shadow:8px 8px 0 ${css.sh};box-sizing:border-box;}
    img{${shotCss}}
  </style></head><body><img src="data:image/png;base64,${img}"><div class="h">${text}</div></body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${style === 'B' ? '' : style + '-'}snimek-${i}.png` });
}
await b.close();
