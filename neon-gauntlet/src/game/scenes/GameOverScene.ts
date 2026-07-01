import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.GameOver)
  }

  create() {
    this.scene.stop(SceneKeys.UI)
    this.cameras.main.setBackgroundColor('#050711')
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'GAME OVER', { fontFamily: 'monospace', fontSize: '24px', color: '#ff5c8a' }).setOrigin(0.5)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 'Press Enter to retry', { fontFamily: 'monospace', fontSize: '11px', color: '#dff6ff' }).setOrigin(0.5)
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start(SceneKeys.World))
    this.input.once('pointerdown', () => this.scene.start(SceneKeys.World))
  }
}
