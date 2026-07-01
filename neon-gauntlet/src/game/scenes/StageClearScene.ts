import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants'

export class StageClearScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.StageClear)
  }

  create(data: { score?: number }) {
    this.cameras.main.setBackgroundColor('#050711')
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 22, 'STAGE CLEAR', { fontFamily: 'monospace', fontSize: '24px', color: '#61ff6a' }).setOrigin(0.5)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, `Score ${data.score || 0}`, { fontFamily: 'monospace', fontSize: '13px', color: '#ffd166' }).setOrigin(0.5)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 34, 'Press Enter to replay', { fontFamily: 'monospace', fontSize: '10px', color: '#dff6ff' }).setOrigin(0.5)
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start(SceneKeys.World))
    this.input.once('pointerdown', () => this.scene.start(SceneKeys.World))
  }
}
