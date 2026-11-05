import Phaser from 'phaser';
import { buildCellarDecorArt } from './cellarDecor';
import { addAtlas, addImage, addSheet } from './pixel';
import { buildKombatArt } from './kombatArt';
import { buildCharacterSheet, buildMonster, guestLook, GUEST_VARIANTS, LOOKS } from './characters';
import { buildObjects } from './objects';
import { buildObjects2 } from './objects2';
import { buildCreatures } from './creatures';
import { buildCellarArt, buildCellarCreatures } from './cellarArt';
import { buildIcons } from './icons';
import { buildWeaponIcons } from './weaponArt';
import { buildLootArt } from './lootArt';
import { buildDecorArt } from './decorArt';
import { buildActDecorArt } from './actDecorArt';
import { buildWellArt } from './wellArt';
import { buildYellowArt } from './yellowArt';
import { buildUI, buildLights } from './uiArt';
import { drawPubBackground, drawCellarBackground } from './tiles';
import { buildKitchenArt, drawKitchenBackground } from './kitchenArt';
import { buildWitchArt, buildWitchProps } from './witchArt';
import { buildPantryArt, buildGoblinSheets } from './goblinArt';
import { buildGraveArt } from './graveArt';
import { buildCoinArt } from './coinArt';
import { buildSudokongArt } from './sudokongArt';
import { buildDwarfArt } from './dwarfArt';
import { buildAdmirerArt } from './admirerArt';
import { buildWallEyes } from './wallEyes';
import { buildNecroArt } from './necroArt';
import { buildTourneyArt, buildTourneyObjects } from './tourneyArt';
import { buildGateProps, cthulhu } from './gateArt';
import { buildEndProps, buildSewerC, gatorFrames, boatRider } from './endArt';
import { buildFairArt, buildFairObjects } from './fairArt';
import { buildWeatherArt, buildWeatherObjects } from './weatherArt';
import { buildKrcmaObjects } from './krcmaArt';
import { buildPulciArt } from './pulciArt';
import { buildYardArt } from './yardArt';
import { REGULARS } from '../data/regulars';
import type { PalKey } from '../data/palette';

export function generateAll(scene: Phaser.Scene) {
  for (const [k, look] of Object.entries(LOOKS)) buildCharacterSheet(scene, k, look);
  for (let i = 0; i < GUEST_VARIANTS; i++) buildCharacterSheet(scene, `guest${i}`, guestLook(i));
  // Den mrtvých: hosté s lebkovým líčením
  // (sudí: catrina v dlouhých šatech s lebkovým líčením; lichí: chlapi v sombreru a pruhovaném ponču)
  const SERAPE: [PalKey, PalKey][] = [['scarlet', 'gold'], ['mint', 'scarlet'], ['sky', 'amber'], ['plum', 'mint']];
  const DRESS: PalKey[] = ['scarlet', 'plum', 'ink', 'amber'];
  for (let i = 0; i < 8; i++)
    buildCharacterSheet(scene, `muertos${i}`, i % 2 === 0
      ? { ...guestLook(i * 2 + 1), skin: 'white', skinShade: 'fog', beard: 'none', catrina: true, longHair: true, hair: 'ink', hairShade: 'ink', hat: null, dress: DRESS[(i / 2) % 4], shirt: 'ink', shirtShade: 'dusk' }
      : { ...guestLook(i * 2 + 1), hat: 'sombrero', hatColor: 'sand', hatShade: 'ochre', beard: i % 4 === 1 ? 'mustache' : 'full', serape: SERAPE[(i >> 1) % 4], catrina: i === 5 ? true : undefined, skin: i === 5 ? 'white' : 'skin', skinShade: i === 5 ? 'fog' : 'tan' });
  for (const r of REGULARS) {
    buildCharacterSheet(scene, `reg_${r.id}`, r.look);
    // po prohrané sázce o knír (RushMore) chodí oholený
    if (r.look.beard && r.look.beard !== 'none') buildCharacterSheet(scene, `reg_${r.id}_shaved`, { ...r.look, beard: 'none' });
  }
  // gurmán: chodí jen na speciality ze sklepa
  buildCharacterSheet(scene, 'gourmet', {
    skin: 'skin', skinShade: 'tan', hair: 'ink', hairShade: 'ink', shirt: 'plum', shirtShade: 'dusk',
    pants: 'ink', pantsShade: 'coal', shoes: 'ink', hat: 'hat', hatColor: 'plum', hatShade: 'dusk', beard: 'mustache',
  });
  buildMonster(scene);
  buildCreatures(scene);
  buildCellarCreatures(scene);
  buildGoblinSheets(scene);
  buildWitchArt(scene);
  buildSudokongArt(scene);
  buildDwarfArt(scene);
  const objs = { ...buildObjects(), ...buildObjects2(), ...buildCellarArt(), ...buildCellarDecorArt(), ...buildDecorArt(), ...buildActDecorArt(), ...buildWellArt(), ...buildYellowArt(), ...buildKitchenArt(), ...buildPantryArt(), ...buildWitchProps(), ...buildGraveArt(), ...buildCoinArt(), ...buildAdmirerArt(), ...buildWallEyes(), ...buildNecroArt(), ...buildTourneyObjects(), ...buildGateProps(), ...buildEndProps(), ...buildSewerC(), ...buildFairObjects(), ...buildWeatherObjects(), ...buildKrcmaObjects(), ...buildYardArt() };
  buildTourneyArt(scene);
  buildFairArt(scene);
  buildWeatherArt(scene);
  addImage(scene, 'kitchenBg', drawKitchenBackground());
  addAtlas(scene, 'obj', objs);
  addAtlas(scene, 'icons', buildIcons());
  addAtlas(scene, 'weapons', { ...buildWeaponIcons(), ...buildLootArt() });
  addAtlas(scene, 'ui', buildUI());
  buildLights(scene);
  addSheet(scene, 'cthulhu', Array.from({ length: 16 }, (_, i) => cthulhu(i)));
  addSheet(scene, 'gator', gatorFrames());
  addSheet(scene, 'boatRider', [boatRider(0), boatRider(1)]);
  for (const [k, a, r] of [['gator_sleep', 0, 1.2], ['gator_walk', 2, 6], ['gator_eat', 4, 5], ['gator_psleep', 6, 1.2], ['gator_pwalk', 8, 6], ['gator_peat', 10, 5]] as const)
    if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: [a, a + 1].map((frame) => ({ key: 'gator', frame })), frameRate: r, repeat: -1 });
  buildKombatArt(scene);
  buildPulciArt(scene);
  for (const [k, a, n, r] of [['cthulhu_walk', 0, 4, 5], ['cthulhu_idle', 4, 4, 3], ['cthulhu_thirst', 8, 2, 4], ['cthulhu_happy', 10, 4, 3], ['cthulhu_regular', 14, 2, 2]] as const)
    if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: Array.from({ length: n }, (_, i) => ({ key: 'cthulhu', frame: a + i })), frameRate: r, repeat: -1 });
}

export function renderPubBackground(scene: Phaser.Scene, tablesLevel: number, act = 1) {
  const key = `pubBg${tablesLevel}${act > 1 ? `_a${act}` : ''}`;
  if (!scene.textures.exists(key)) addImage(scene, key, drawPubBackground(tablesLevel, act));
  return key;
}

/** Sklep je pokaždé jiný – textura se kreslí při každém sestupu znovu. */
export function renderCellarBackground(scene: Phaser.Scene, dg: Parameters<typeof drawCellarBackground>[0]) {
  const key = 'cellarBg';
  if (scene.textures.exists(key)) scene.textures.remove(key);
  addImage(scene, key, drawCellarBackground(dg));
  return key;
}
