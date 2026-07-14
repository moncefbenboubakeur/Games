import Phaser from 'phaser'
import type { EnemyDefinition } from '../data/types'
import type { AnimationSystem } from '../systems/AnimationSystem'
import { ActorStateMachine, type ActorVisualState } from '../systems/ActorStateMachine'
import type { CombatSystem, FighterState } from '../systems/CombatSystem'
import { clamp } from '../utils/math'
import { laneToY } from '../utils/lane'
import type { Player } from './Player'

export interface EnemyTactics {
  slotOffsetX?: number
  slotLane?: number
  speedMultiplier?: number
}

export class Enemy extends Phaser.GameObjects.Sprite implements FighterState {
  private static readonly corpseLifetimeMs = 1600
  private static readonly corpseFadeStartMs = 1200

  lane: number
  face: -1 | 1 = -1
  hp: number
  guard = false
  aiState: 'idle' | 'pursue' | 'align' | 'telegraph' | 'attack' | 'recover' | 'down' = 'idle'
  aiReason = 'spawn'
  invincibleMs = 0
  attackMs = 0
  telegraphMs = 0
  cooldownMs = 500
  readonly isBoss: boolean = false
  private corpseStartedAt = 0
  private downFrameApplied = false
  private moving = false
  protected readonly textureKey: string
  protected readonly sourceFacing: 'left' | 'right'

  constructor(
    scene: Phaser.Scene,
    x: number,
    lane: number,
    readonly def: EnemyDefinition,
    protected readonly animations: AnimationSystem,
    protected readonly combat: CombatSystem,
  ) {
    const frame = animations.frame('enemy', 'idle')
    const textureKey = def.texture ?? 'enemy-sheet'
    super(scene, x, laneToY(lane), textureKey, frame.name)
    this.textureKey = textureKey
    this.sourceFacing = def.sourceFacing ?? 'left'
    this.lane = lane
    this.hp = def.hp
    this.setScale(0.38 * def.scale)
    animations.apply(this, this.textureKey, frame)
    scene.add.existing(this)
  }

  updateEnemy(dt: number, player: Player, worldWidth: number, tactics: EnemyTactics = {}) {
    if (this.hp <= 0) {
      this.aiState = 'down'
      this.aiReason = 'defeated'
      this.updateCorpse(dt)
      return
    }

    this.invincibleMs = Math.max(0, this.invincibleMs - dt)
    this.attackMs = Math.max(0, this.attackMs - dt)
    this.telegraphMs = Math.max(0, this.telegraphMs - dt)
    this.cooldownMs -= dt

    const dx = player.x - this.x
    const moveTargetX = tactics.slotOffsetX === undefined || this.canStartAttack(player)
      ? player.x
      : player.x + tactics.slotOffsetX
    const moveTargetLane = tactics.slotLane ?? player.lane
    const moveDx = moveTargetX - this.x
    const moveDy = moveTargetLane - this.lane
    const movementSpeed = this.def.speed * (tactics.speedMultiplier ?? 1)
    this.face = dx < 0 ? -1 : 1
    this.moving = false
    this.aiState = 'idle'
    this.aiReason = 'watching'

    if (this.telegraphMs > 0 && !this.canStartAttack(player)) {
      this.telegraphMs = 0
      this.cooldownMs = Math.min(this.cooldownMs, 180)
      this.aiState = 'pursue'
      this.aiReason = 'target-left-range'
    }

    if (this.telegraphMs <= 0 && this.attackMs <= 0) {
      if (Math.abs(moveDx) > this.def.range * 0.82) {
        this.x += Math.sign(moveDx) * movementSpeed * dt / 1000
        this.moving = true
        this.aiState = 'pursue'
        this.aiReason = 'closing-distance'
      }
      if (Math.abs(moveDy) > 0.025) {
        this.lane += Math.sign(moveDy) * (this.def.laneSpeed ?? 0.18) * dt / 1000
        this.moving = true
        this.aiState = 'align'
        this.aiReason = 'matching-lane'
      }
    }
    if (this.cooldownMs <= 0 && this.telegraphMs <= 0 && this.attackMs <= 0 && this.canStartAttack(player)) {
      this.telegraphMs = this.def.telegraphMs ?? (this.def.id === 'thrower' ? 430 : 260)
      this.cooldownMs = Phaser.Math.Between(this.def.cooldownMinMs, this.def.cooldownMaxMs)
      this.aiState = 'telegraph'
      this.aiReason = 'target-in-range'
    }

    if (this.telegraphMs > 0 && this.telegraphMs <= 40) {
      this.telegraphMs = 0
      if (!this.canStartAttack(player)) {
        this.cooldownMs = Math.min(this.cooldownMs, 180)
        this.aiState = 'recover'
        this.aiReason = 'cancelled-empty-air'
      } else {
        this.attackMs = this.def.attackDurationMs ?? 280
        if (this.def.projectile) {
          this.scene.events.emit('enemy:projectile', {
            projectileId: this.def.projectile,
            x: this.x,
            lane: this.lane,
            face: this.face,
          })
        } else {
          player.hurt(this.def.damage, this.face * 22)
        }
        this.aiState = 'attack'
        this.aiReason = 'confirmed-contact-range'
      }
    }
    if (this.attackMs > 0) {
      this.aiState = 'attack'
      this.aiReason = 'attack-recovery'
    } else if (this.telegraphMs > 0) {
      this.aiState = 'telegraph'
      this.aiReason = 'target-in-range'
    }

    this.x = clamp(this.x, -96, worldWidth + 96)
    this.lane = clamp(this.lane, 0.58, 0.88)
    this.y = laneToY(this.lane)
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
    const tick = Math.floor(this.scene.time.now / (this.def.walkFrameMs ?? 130))
    const action: ActorVisualState = force ?? ActorStateMachine.enemyVisualState({
      hp: this.hp,
      invincibleMs: this.invincibleMs,
      telegraphMs: this.telegraphMs,
      attackMs: this.attackMs,
      moving: this.moving,
      preferredAttack: this.def.preferredAttack ?? (this.def.id === 'bruiser' ? 'kick' : 'punch'),
    })
    let index = 0

    if (action === 'hurt') {
      index = this.invincibleMs > 90 ? 0 : 1
    } else if (action === 'guard') {
      index = tick % 3
    } else if (action === 'punch' || action === 'kick') {
      index = this.attackMs > 170 ? 0 : 1
    } else if (action === 'walk') {
      const order = this.def.walkFrameOrder
      index = order && order.length > 0 ? order[tick % order.length] : tick % 4
    }

    const frame = this.animations.frame('enemy', action, index)
    this.animations.apply(this, this.textureKey, frame)
    this.applyFacing(action)
    this.alpha = this.invincibleMs > 0 && Math.floor(this.invincibleMs / 55) % 2 ? 0.62 : 1
  }

  private applyFacing(action: ActorVisualState) {
    const sourceFacing = this.sourceFacingForAction(action)
    const direction = sourceFacing === 'right' ? this.face : (this.face === -1 ? 1 : -1)
    this.scaleX = Math.abs(this.scaleX) * direction
  }

  private sourceFacingForAction(action: ActorVisualState) {
    if (this.sourceFacing === 'right') return 'right'
    return action === 'punch' || action === 'kick' ? 'right' : 'left'
  }

  private canStartAttack(player: Player) {
    return Math.abs(this.x - player.x) <= this.def.range && Math.abs(this.lane - player.lane) <= 0.095
  }
}
