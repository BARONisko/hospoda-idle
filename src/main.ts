import Phaser from 'phaser';
import '@fontsource/jersey-10/latin-ext-400.css';
import '@fontsource/jersey-10/latin-400.css';
import './style.css';
import { installCjkWrap } from './i18n/cjkWrap';
import { BootScene } from './scenes/BootScene';
import { PubScene } from './scenes/PubScene';
import { TempleScene } from './scenes/TempleScene';
import { DartsScene } from './scenes/DartsScene';
import { PAL } from './data/palette';

installCjkWrap();

// Pojistka: chyba v jednom snímku nesmí zastavit celou hru (dřív se smyčka hry zastavila = „hra nereaguje“).
// Chyba se ukáže jako malý červený pruh nahoře (ťuknutím zmizí) – hráč pošle snímek a víme, co opravit.
let errShown = '';
function showErr(e: unknown) {
  const err = e as Error;
  const msg = `${err?.message ?? e} @ ${(err?.stack ?? '').split('\n').find((l) => /\.(ts|js)/.test(l) && !/phaser/i.test(l))?.trim() ?? ''}`;
  console.error(e);
  if (msg === errShown) return;
  errShown = msg;
  let el = document.getElementById('err');
  if (!el) {
    el = document.createElement('div');
    el.id = 'err';
    el.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99;background:#a31f2c;color:#fff;font:12px/1.3 Arial,sans-serif;padding:6px 8px;word-break:break-all';
    el.onclick = () => (el!.style.display = 'none');
    document.body.appendChild(el);
  }
  el.style.display = 'block';
  el.textContent = 'Chyba (pošli snímek): ' + msg.slice(0, 300);
}
window.addEventListener('error', (ev) => showErr(ev.error ?? ev.message));
window.addEventListener('unhandledrejection', (ev) => showErr(ev.reason));
const guard = <T extends object>(proto: T, name: keyof T) => {
  const f = proto[name] as unknown as (...a: unknown[]) => unknown;
  (proto as Record<string, unknown>)[name as string] = function (this: unknown, ...a: unknown[]) {
    try {
      return f.apply(this, a);
    } catch (e) {
      showErr(e);
    }
  };
};
// každá scéna zvlášť (ostatní dál běží a kreslí se) a celý snímek jako záloha
guard(Phaser.Scenes.Systems.prototype, 'step');
guard(Phaser.Game.prototype, 'step');
// Mobil na výšku: logické rozlišení 540×960 (9:16), roztažení na displej se zachováním poměru.
const game = new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'game',
  width: 540,
  height: 960,
  backgroundColor: PAL.ink,
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 2 },
  scene: [BootScene, PubScene, TempleScene, DartsScene],
});
(window as unknown as { game: Phaser.Game }).game = game;

// PWA: hraní bez internetu (jen v sestavené verzi, ne ve vývoji)
if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => undefined));
}
