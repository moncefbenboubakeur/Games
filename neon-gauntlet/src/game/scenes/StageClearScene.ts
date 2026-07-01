import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants'

export class StageClearScene extends Phaser.Scene {
  private replayStarted = false
  private readonly replayFromKeyboard = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    this.replay()
  }
  private readonly replayFromPointer = () => this.replay()

  constructor() {
    super(SceneKeys.StageClear)
  }

  create(data: { score?: number }) {
    this.replayStarted = false
    this.cameras.main.setBackgroundColor('#050711')
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 22, 'STAGE CLEAR', { fontFamily: 'monospace', fontSize: '24px', color: '#61ff6a' }).setOrigin(0.5)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, `Score ${data.score || 0}`, { fontFamily: 'monospace', fontSize: '13px', color: '#ffd166' }).setOrigin(0.5)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 34, 'Press Enter to replay', { fontFamily: 'monospace', fontSize: '10px', color: '#dff6ff' }).setOrigin(0.5)
    this.input.keyboard?.once('keydown-ENTER', () => this.replay())
    this.input.keyboard?.once('keydown-SPACE', () => this.replay())
    this.input.once('pointerdown', () => this.replay())
    window.addEventListener('keydown', this.replayFromKeyboard, { passive: false })
    window.addEventListener('pointerdown', this.replayFromPointer)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.replayFromKeyboard)
      window.removeEventListener('pointerdown', this.replayFromPointer)
    })
  }

  private replay() {
    if (this.replayStarted) return
    this.replayStarted = true
    window.removeEventListener('keydown', this.replayFromKeyboard)
    window.removeEventListener('pointerdown', this.replayFromPointer)
    this.scene.start(SceneKeys.World)
  }
}
