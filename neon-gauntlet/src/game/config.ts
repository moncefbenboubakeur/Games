import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from './constants'
import { BootScene } from './scenes/BootScene'
import { GameOverScene } from './scenes/GameOverScene'
import { MenuScene } from './scenes/MenuScene'
import { PauseScene } from './scenes/PauseScene'
import { PreloadScene } from './scenes/PreloadScene'
import { StageClearScene } from './scenes/StageClearScene'
import { UIScene } from './scenes/UIScene'
import { WorldScene } from './scenes/WorldScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#050711',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
  input: {
    gamepad: true,
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    WorldScene,
    UIScene,
    PauseScene,
    GameOverScene,
    StageClearScene,
  ],
  callbacks: {
    postBoot(game) {
      game.scene.start(SceneKeys.Boot)
    },
  },
}
