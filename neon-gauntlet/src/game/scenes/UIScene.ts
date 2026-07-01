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

type TouchAction = Parameters<InputSystem['press']>[0]

export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Rectangle
  private scoreText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private bossText!: Phaser.GameObjects.Text
  private messageText!: Phaser.GameObjects.Text
  private world?: WorldScene
  private readonly onHudUpdate = (state: HudState) => this.renderHud(state)
  private readonly onMessage = (message: string) => this.flashMessage(message)

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
    this.world = this.scene.get(SceneKeys.World) as WorldScene
    this.world.events.on('hud:update', this.onHudUpdate)
    this.world.events.on('message', this.onMessage)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup)
  }

  private renderHud(state: HudState) {
    if (!this.scene.isActive() || !this.hpBar?.active || !this.scoreText?.active) return
    this.hpBar.width = 96 * Math.max(0, state.hp / state.maxHp)
    this.scoreText.setText(`SCORE ${String(state.score).padStart(6, '0')}`)
    this.levelText.setText(`${state.level}  ENEMIES ${state.enemies}`)
    this.bossText.setText(state.boss ? `${state.boss.name}  ${Math.max(0, Math.round(state.boss.hp))}` : '')
  }

  private flashMessage(message: string) {
    if (!this.scene.isActive() || !this.messageText?.active) return
    this.messageText.setText(message).setAlpha(1)
    this.tweens.add({ targets: this.messageText, alpha: 0, delay: 900, duration: 700 })
  }

  private readonly cleanup = () => {
    this.world?.events.off('hud:update', this.onHudUpdate)
    this.world?.events.off('message', this.onMessage)
    this.world = undefined
  }

  private createTouchControls() {
    const input = this.registry.get('inputSystem') as InputSystem
    const leftPanel = this.add.graphics().setDepth(930)
    leftPanel.fillStyle(0x050711, 0.38).fillRoundedRect(8, GAME_HEIGHT - 82, 118, 74, 18)
    leftPanel.lineStyle(1, 0x23d5ff, 0.38).strokeRoundedRect(8, GAME_HEIGHT - 82, 118, 74, 18)
    leftPanel.lineStyle(1, 0xff5c8a, 0.18).strokeRoundedRect(12, GAME_HEIGHT - 78, 110, 66, 15)

    const rightPanel = this.add.graphics().setDepth(930)
    rightPanel.fillStyle(0x050711, 0.38).fillRoundedRect(GAME_WIDTH - 154, GAME_HEIGHT - 82, 146, 74, 18)
    rightPanel.lineStyle(1, 0xffd166, 0.36).strokeRoundedRect(GAME_WIDTH - 154, GAME_HEIGHT - 82, 146, 74, 18)
    rightPanel.lineStyle(1, 0x23d5ff, 0.16).strokeRoundedRect(GAME_WIDTH - 150, GAME_HEIGHT - 78, 138, 66, 15)

    this.add.text(18, GAME_HEIGHT - 77, 'MOVE', { fontFamily: 'monospace', fontSize: '7px', color: '#9ee7ff' }).setDepth(940)
    this.add.text(GAME_WIDTH - 144, GAME_HEIGHT - 77, 'COMBO', { fontFamily: 'monospace', fontSize: '7px', color: '#ffd166' }).setDepth(940)

    const pad = this.add.graphics().setDepth(942)
    pad.fillStyle(0x23d5ff, 0.16).fillRoundedRect(50, GAME_HEIGHT - 68, 26, 58, 7)
    pad.fillStyle(0x23d5ff, 0.16).fillRoundedRect(34, GAME_HEIGHT - 52, 58, 26, 7)
    pad.lineStyle(1, 0x9ee7ff, 0.34).strokeCircle(63, GAME_HEIGHT - 39, 18)
    pad.fillStyle(0x050711, 0.64).fillCircle(63, GAME_HEIGHT - 39, 10)

    this.createTouchButton(input, 63, GAME_HEIGHT - 61, '^', 'up', 0x23d5ff, 13)
    this.createTouchButton(input, 63, GAME_HEIGHT - 17, 'v', 'down', 0x23d5ff, 13)
    this.createTouchButton(input, 39, GAME_HEIGHT - 39, '<', 'left', 0x23d5ff, 13)
    this.createTouchButton(input, 87, GAME_HEIGHT - 39, '>', 'right', 0x23d5ff, 13)

    this.createTouchButton(input, GAME_WIDTH - 112, GAME_HEIGHT - 45, 'P', 'punch', 0xff5c8a, 14, 'PUNCH')
    this.createTouchButton(input, GAME_WIDTH - 76, GAME_HEIGHT - 45, 'K', 'kick', 0xffd166, 14, 'KICK')
    this.createTouchButton(input, GAME_WIDTH - 94, GAME_HEIGHT - 20, 'J', 'jump', 0x23d5ff, 14, 'JUMP')
    this.createTouchButton(input, GAME_WIDTH - 40, GAME_HEIGHT - 28, 'G', 'guard', 0x9b5cff, 13, 'GUARD')
  }

  private createTouchButton(
    input: InputSystem,
    x: number,
    y: number,
    label: string,
    action: TouchAction,
    color: number,
    radius: number,
    caption?: string,
  ) {
    const glow = this.add.circle(x, y, radius + 7, color, 0.16).setDepth(950).setBlendMode(Phaser.BlendModes.ADD)
    const rim = this.add.circle(x, y, radius + 1, 0x050711, 0.82).setDepth(951).setStrokeStyle(2, color, 0.9)
    const core = this.add.circle(x, y, radius - 3, color, 0.44).setDepth(952).setStrokeStyle(1, 0xdff6ff, 0.44)
    const shine = this.add.ellipse(x - radius * 0.22, y - radius * 0.34, radius * 0.86, radius * 0.38, 0xffffff, 0.22).setDepth(953)
    const text = this.add.text(x, y - 1, label, {
      fontFamily: 'monospace',
      fontSize: caption ? '10px' : '11px',
      color: '#ffffff',
      stroke: '#050711',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(954)
    const captionText = caption
      ? this.add.text(x, y + radius + 4, caption, {
        fontFamily: 'monospace',
        fontSize: '5px',
        color: '#dff6ff',
        stroke: '#050711',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(954)
      : undefined
    const hit = this.add.circle(x, y, radius + 10, 0xffffff, 0.001).setDepth(955).setInteractive({ useHandCursor: true })
    const visuals = [glow, rim, core, shine, text, ...(captionText ? [captionText] : [])]
    const press = () => {
      input.press(action, true)
      glow.setAlpha(0.36)
      core.setAlpha(0.74)
      visuals.forEach((part) => part.setScale(0.94))
    }
    const release = () => {
      input.press(action, false)
      glow.setAlpha(0.16)
      core.setAlpha(0.44)
      visuals.forEach((part) => part.setScale(1))
    }
    hit.on('pointerdown', press)
    hit.on('pointerup', release)
    hit.on('pointerout', release)
    hit.on('pointerupoutside', release)
  }
}
