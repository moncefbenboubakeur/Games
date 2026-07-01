import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants'
import type { InputSystem } from '../systems/InputSystem'
import type { WorldScene } from './WorldScene'

interface HudState {
  hp: number
  maxHp: number
  score: number
  level: string
  enemies: number
  boss: { name: string; hp: number } | null
}

export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Rectangle
  private scoreText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private bossText!: Phaser.GameObjects.Text
  private messageText!: Phaser.GameObjects.Text

  constructor() {
    super(SceneKeys.UI)
  }

  create() {
    this.add.rectangle(70, 18, 104, 14, 0x06091a, 0.92).setStrokeStyle(2, 0x23d5ff)
    this.hpBar = this.add.rectangle(20, 18, 96, 7, 0x42e6b5).setOrigin(0, 0.5)
    this.scoreText = this.add.text(18, 34, 'SCORE 000000', { fontFamily: 'monospace', fontSize: '12px', color: '#61ff6a', stroke: '#081020', strokeThickness: 3 })
    this.levelText = this.add.text(18, 52, '', { fontFamily: 'monospace', fontSize: '9px', color: '#ffd166', stroke: '#081020', strokeThickness: 3 })
    this.bossText = this.add.text(GAME_WIDTH - 16, 14, '', { fontFamily: 'monospace', fontSize: '9px', color: '#fff', stroke: '#081020', strokeThickness: 3 }).setOrigin(1, 0)
    this.messageText = this.add.text(GAME_WIDTH / 2, 72, '', { fontFamily: 'monospace', fontSize: '16px', color: '#fff', stroke: '#081020', strokeThickness: 4 }).setOrigin(0.5)

    this.createTouchControls()
    const world = this.scene.get(SceneKeys.World) as WorldScene
    world.events.on('hud:update', (state: HudState) => this.renderHud(state))
    world.events.on('message', (message: string) => this.flashMessage(message))
  }

  private renderHud(state: HudState) {
    this.hpBar.width = 96 * Math.max(0, state.hp / state.maxHp)
    this.scoreText.setText(`SCORE ${String(state.score).padStart(6, '0')}`)
    this.levelText.setText(`${state.level}  ENEMIES ${state.enemies}`)
    this.bossText.setText(state.boss ? `${state.boss.name}  ${Math.max(0, Math.round(state.boss.hp))}` : '')
  }

  private flashMessage(message: string) {
    this.messageText.setText(message).setAlpha(1)
    this.tweens.add({ targets: this.messageText, alpha: 0, delay: 900, duration: 700 })
  }

  private createTouchControls() {
    const input = this.registry.get('inputSystem') as InputSystem
    const button = (x: number, y: number, label: string, action: Parameters<InputSystem['press']>[0]) => {
      const rect = this.add.rectangle(x, y, 34, 24, 0x14192d, 0.82).setStrokeStyle(1, 0x65769f).setInteractive()
      const text = this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '9px', color: '#dff6ff' }).setOrigin(0.5)
      const down = () => input.press(action, true)
      const up = () => input.press(action, false)
      rect.on('pointerdown', down).on('pointerup', up).on('pointerout', up)
      text.setInteractive().on('pointerdown', down).on('pointerup', up).on('pointerout', up)
    }
    button(26, GAME_HEIGHT - 22, '<', 'left')
    button(64, GAME_HEIGHT - 22, '>', 'right')
    button(45, GAME_HEIGHT - 50, '^', 'up')
    button(45, GAME_HEIGHT - 4, 'v', 'down')
    button(GAME_WIDTH - 126, GAME_HEIGHT - 22, 'P', 'punch')
    button(GAME_WIDTH - 86, GAME_HEIGHT - 22, 'K', 'kick')
    button(GAME_WIDTH - 46, GAME_HEIGHT - 22, 'J', 'jump')
    button(GAME_WIDTH - 46, GAME_HEIGHT - 50, 'G', 'guard')
  }
}
