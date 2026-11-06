// Snímek hry na výšku jako na telefonu: node tools/shot.mjs <url> <out.png> [čekání ms] [js po startu]
import { chromium } from 'playwright-core';
const [url = 'http://localhost:5177/', out = 'tools/_tmp/shot.png', wait = '3000', js = ''] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const p = await b.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: process.env.LOCALE ?? 'cs-CZ' });
p.on('pageerror', (e) => console.log('ERR', e.message));
p.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
await p.goto(url);
await p.waitForTimeout(1500);
if (js) await p.evaluate(js);
await p.waitForTimeout(Number(wait));
await p.screenshot({ path: out });
await b.close();
