import Phaser from 'phaser';
import { generateAll } from '../gfx';
import { FONT } from '../ui/font';
import { PAL } from '../data/palette';
import { t } from '../i18n';

/** Počká na pixelové písmo, vygeneruje grafiku (kreslená kódem, sdílená s P.U.B.) a spustí hospodu. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const loading = this.add.text(270, 480, t('Načítám…'), { fontFamily: 'monospace', fontSize: '28px', color: PAL.bone }).setOrigin(0.5);
    // obě písma (latinka i azbuka) načíst dopředu – Phaser kreslí do canvasu a pozdě dotažené písmo by nepřekreslil
    Promise.all([
      document.fonts.load(`24px ${FONT}`, 'Příliš žluťoučký kůň úpěl ďábelské ódy'), // i18n-ok
      document.fonts.load(`24px ${FONT}`, 'Съешь ещё этих мягких булок'), // i18n-ok
    ])
      .catch(() => undefined)
      .finally(() => {
        generateAll(this);
        loading.destroy();
        this.scene.start('Pub');
      });
  }
}
