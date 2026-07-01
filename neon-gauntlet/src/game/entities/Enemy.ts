import Phaser from 'phaser'
import type { EnemyDefinition } from '../data/types'
import type { AnimationSystem } from '../systems/AnimationSystem'
import type { CombatSystem, FighterState } from '../systems/CombatSystem'
import { clamp } from '../utils/math'
import { laneToY } from '../utils/lane'
import type { Player } from './Player'

export class Enemy extends Phaser.GameObjects.Sprite implements FighterState {
  private static readonly corpseLifetimeMs = 1600
  private static readonly corpseFadeStartMs = 1200

  lane: number
  face: -1 | 1 = -1
  hp: number
  guard = false
  invincibleMs = 0
  attackMs = 0
  telegraphMs = 0
  cooldownMs = 500
  readonly isBoss: boolean = false
  private corpseStartedAt = 0
  private downFrameApplied = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    lane: number,
    readonly def: EnemyDefinition,
    protected readonly animations: AnimationSystem,
    protected readonly combat: CombatSystem,
  ) {
    const frame = animations.frame('enemy', 'idle')
    super(scene, x, laneToY(lane), 'enemy-sheet', frame.name)
    this.lane = lane
    this.hp = def.hp
    this.setScale(0.38 * def.scale)
    animations.apply(this, 'enemy-sheet', frame)
    scene.add.existing(this)
  }

  updateEnemy(dt: number, player: Player, worldWidth: number) {
    if (this.hp <= 0) {
      this.updateCorpse(dt)
      return
    }

    this.invincibleMs = Math.max(0, this.invincibleMs - dt)
    this.attackMs = Math.max(0, this.attackMs - dt)
    this.telegraphMs = Math.max(0, this.telegraphMs - dt)
    this.cooldownMs -= dt

    const dx = player.x - this.x
    const dy = player.lane - this.lane
    this.face = dx < 0 ? -1 : 1

    if (this.telegraphMs <= 0 && this.attackMs <= 0) {
      if (Math.abs(dx) > this.def.range * 0.82) this.x += Math.sign(dx) * this.def.speed * dt / 1000
      if (Math.abs(dy) > 0.025) this.lane += Math.sign(dy) * 0.18 * dt / 1000
    }

    if (this.cooldownMs <= 0 && this.telegraphMs <= 0 && this.attackMs <= 0) {
      this.telegraphMs = this.def.id === 'thrower' ? 430 : 260
      this.cooldownMs = Phaser.Math.Between(this.def.cooldownMinMs, this.def.cooldownMaxMs)
    }

    if (this.telegraphMs > 0 && this.telegraphMs <= 40) {
      this.telegraphMs = 0
      this.attackMs = 280
      if (Math.abs(this.x - player.x) <= this.def.range && Math.abs(this.lane - player.lane) <= 0.095) {
        player.hurt(this.def.damage, this.face * 22)
      }
    }

    this.x = clamp(this.x, 32, worldWidth - 32)
    this.lane = clamp(this.lane, 0.58, 0.88)
    this.y = laneToY(this.lane)
    this.scaleX = Math.abs(this.scaleX) * (this.face === -1 ? 1 : -1)
    this.depth = Math.round(this.y)
    this.updateFrame()
  }

  hurt(amount: number, knockback: number) {
    if (this.invincibleMs > 0 || this.hp <= 0) return false
    this.hp = Math.max(0, this.hp - amount)
    this.x += knockback
    this.invincibleMs = 180
    this.scene.events.emit('sfx', 'hit')
    if (this.hp <= 0) {
      this.corpseStartedAt = performance.now()
      this.downFrameApplied = false
      this.attackMs = 0
      this.telegraphMs = 0
      this.invincibleMs = 0
    }
    return true
  }

  private updateCorpse(_dt: number) {
    if (!this.corpseStartedAt) this.corpseStartedAt = performance.now()
    if (!this.downFrameApplied) {
      this.updateFrame('down')
      this.downFrameApplied = true
      this.alpha = 1
    }
    const corpseMs = performance.now() - this.corpseStartedAt
    if (corpseMs >= Enemy.corpseFadeStartMs) {
      const fade = (corpseMs - Enemy.corpseFadeStartMs) / (Enemy.corpseLifetimeMs - Enemy.corpseFadeStartMs)
      this.alpha = Phaser.Math.Clamp(1 - fade, 0, 1)
    }
    if (corpseMs >= Enemy.corpseLifetimeMs) this.destroy()
  }

  protected updateFrame(force?: 'down') {
    const tick = Math.floor(this.scene.time.now / 150)
    let action: 'idle' | 'walk' | 'punch' | 'kick' | 'guard' | 'hurt' | 'down' = 'idle'
    let index = 0

    if (force === 'down') action = 'down'
    else if (this.invincibleMs > 0) {
      action = 'hurt'
      index = this.invincibleMs > 90 ? 0 : 1
    } else if (this.telegraphMs > 0) {
      action = 'guard'
      index = tick % 3
    } else if (this.attackMs > 0) {
      action = this.def.id === 'bruiser' ? 'kick' : 'punch'
      index = this.attackMs > 170 ? 0 : 1
    } else if (this.cooldownMs < this.def.cooldownMaxMs - 120) {
      action = 'walk'
      index = tick % 3
    }

    const frame = this.animations.frame('enemy', action, index)
    this.animations.apply(this, 'enemy-sheet', frame)
    this.alpha = this.invincibleMs > 0 && Math.floor(this.invincibleMs / 55) % 2 ? 0.62 : 1
  }
}
