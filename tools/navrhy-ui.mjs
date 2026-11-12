// Vykreslí makety z tools/navrhy-ui.py: node tools/navrhy-ui.mjs <in.html> <out-dir>  → prehled.png + jednotlivé A.png … M3.png
import { chromium } from 'playwright-core';
import path from 'path';
const [html, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 2300, height: 1700 }, deviceScaleFactor: 2 });
await p.goto('file://' + path.resolve(html));
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(400);
for (const id of ['A', 'B', 'C', 'D', 'E', 'M1', 'M2', 'M3']) await p.locator('#' + id).screenshot({ path: `${out}/${id}.png` });
await p.screenshot({ path: `${out}/prehled.png`, fullPage: true });
await b.close();
