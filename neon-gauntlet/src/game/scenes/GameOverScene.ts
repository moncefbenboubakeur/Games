import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants'

export class GameOverScene extends Phaser.Scene {
  private retryStarted = false
  private readonly retryFromKeyboard = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    this.retry()
  }
  private readonly retryFromPointer = () => this.retry()

  constructor() {
    super(SceneKeys.GameOver)
  }

  create() {
    this.retryStarted = false
    this.scene.stop(SceneKeys.UI)
    this.cameras.main.setBackgroundColor('#050711')
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'GAME OVER', { fontFamily: 'monospace', fontSize: '24px', color: '#ff5c8a' }).setOrigin(0.5)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 'Press Enter to retry', { fontFamily: 'monospace', fontSize: '11px', color: '#dff6ff' }).setOrigin(0.5)
    this.input.keyboard?.once('keydown-ENTER', () => this.retry())
    this.input.keyboard?.once('keydown-SPACE', () => this.retry())
    this.input.once('pointerdown', () => this.retry())
    window.addEventListener('keydown', this.retryFromKeyboard, { passive: false })
    window.addEventListener('pointerdown', this.retryFromPointer)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.retryFromKeyboard)
      window.removeEventListener('pointerdown', this.retryFromPointer)
    })
  }

  private retry() {
    if (this.retryStarted) return
    this.retryStarted = true
    window.removeEventListener('keydown', this.retryFromKeyboard)
    window.removeEventListener('pointerdown', this.retryFromPointer)
    this.scene.start(SceneKeys.World)
  }
}
