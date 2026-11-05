import Phaser from 'phaser';
import '@fontsource/jersey-10/latin-ext-400.css';
import '@fontsource/jersey-10/latin-400.css';
import './style.css';
import { installCjkWrap } from './i18n/cjkWrap';
import { BootScene } from './scenes/BootScene';
import { PubScene } from './scenes/PubScene';
import { PAL } from './data/palette';

installCjkWrap();
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
  scene: [BootScene, PubScene],
});
(window as unknown as { game: Phaser.Game }).game = game;
