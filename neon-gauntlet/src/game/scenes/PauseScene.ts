import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants'

export class PauseScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Pause)
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050711, 0.62)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8, 'PAUSED', { fontFamily: 'monospace', fontSize: '22px', color: '#ffd166' }).setOrigin(0.5)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'Press Escape / Start', { fontFamily: 'monospace', fontSize: '10px', color: '#dff6ff' }).setOrigin(0.5)
    const resume = () => {
      this.scene.stop()
      this.scene.resume(SceneKeys.World)
    }
    this.input.keyboard?.once('keydown-ESC', resume)
    this.input.once('pointerdown', resume)
  }
}
