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
    document.fonts
      .load(`24px ${FONT}`, 'Příliš žluťoučký kůň úpěl ďábelské ódy') // i18n-ok
      .catch(() => undefined)
      .finally(() => {
        generateAll(this);
        loading.destroy();
        const mock = new URLSearchParams(location.search).get('mock');
        if (mock) this.scene.start('Mock', { v: mock });
        else this.scene.start('Pub');
      });
  }
}
