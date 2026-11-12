// Vykreslí makety z tools/navrhy-ui.py: node tools/navrhy-ui.mjs <in.html> <out-dir>
// → jednotlivé obrazovky podle id (A.png … M3.png, sada 2: F.png … M9.png) ve 2× (810×1440)
//   a přehled podle <body data-prehled> (prehled.png / prehled-2.png) v 1×.
// Windows: export CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
import { chromium } from 'playwright-core';
import path from 'path';
import { pathToFileURL } from 'url';
const [html, out] = process.argv.slice(2);
const url = pathToFileURL(path.resolve(html)).href;
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const open = async (scale) => {
  const p = await b.newPage({ viewport: { width: 2300, height: 1700 }, deviceScaleFactor: scale });
  await p.goto(url);
  await p.evaluate(() => document.fonts.ready);
  const size = await p.evaluate(() => ({ width: document.body.scrollWidth, height: document.body.scrollHeight }));
  await p.setViewportSize({ width: Math.max(2300, size.width), height: Math.max(1700, size.height) });
  await p.waitForTimeout(400);
  return p;
};
const p = await open(2);
const ids = await p.$$eval('.scr[id]', (els) => els.map((e) => e.id));
for (const id of ids) await p.locator('#' + id).screenshot({ path: `${out}/${id}.png` });
const name = await p.evaluate(() => document.body.dataset.prehled || 'prehled');
const p1 = await open(1);
// <body data-crop>: přehled oříznutý na obsah (sada 3), jinak celá stránka
const crop = await p1.evaluate(() => (document.body.dataset.crop ? { x: 0, y: 0, width: Math.ceil(document.body.getBoundingClientRect().width), height: Math.ceil([...document.querySelectorAll('.row')].pop().getBoundingClientRect().bottom) + 24 } : null));
await p1.screenshot({ path: `${out}/${name}.png`, ...(crop ? { clip: crop } : { fullPage: true }) });
console.log('ok', ids.join(' '), name);
await b.close();
