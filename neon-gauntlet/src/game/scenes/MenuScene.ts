import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants'
import { firstChinaLevel } from '../data/chinaChapter'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu)
  }

  create() {
    this.cameras.main.setBackgroundColor('#050711')
    this.add.text(GAME_WIDTH / 2, 48, 'NEON GAUNTLET', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#61ff6a',
      stroke: '#0b1028',
      strokeThickness: 5,
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 92, 'Teen arcade brawler prototype', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#dff6ff',
    }).setOrigin(0.5)

    const start = this.add.text(GAME_WIDTH / 2, 136, 'PRESS ENTER / TAP TO START', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffd166',
      backgroundColor: '#14192d',
      padding: { left: 10, right: 10, top: 7, bottom: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'MOVE WASD/ARROWS  PUNCH J  KICK K  JUMP SPACE  GUARD L', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#9ee7ff',
      align: 'center',
    }).setOrigin(0.5)

    const begin = () => {
      window.removeEventListener('keydown', keyBegin)
      window.removeEventListener('pointerdown', begin)
      const firstLevel = firstChinaLevel()
      this.registry.set('currentLevelId', firstLevel.id)
      this.registry.set('chapterScore', 0)
      this.scene.start(SceneKeys.World, { levelId: firstLevel.id, score: 0 })
    }
    const keyBegin = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') begin()
    }
    start.on('pointerdown', begin)
    this.input.once('pointerdown', begin)
    this.input.keyboard?.once('keydown-ENTER', begin)
    this.input.keyboard?.once('keydown-SPACE', begin)
    window.addEventListener('keydown', keyBegin)
    window.addEventListener('pointerdown', begin, { once: true })
    ;(window as typeof window & { __NEON_START__?: () => void }).__NEON_START__ = begin
  }
}
