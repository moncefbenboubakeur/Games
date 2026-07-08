import Phaser from 'phaser'
import type { CombatData, NormalizedInput } from '../data/types'
import type { AnimationSystem } from '../systems/AnimationSystem'
import { ActorStateMachine } from '../systems/ActorStateMachine'
import type { CombatSystem, FighterState } from '../systems/CombatSystem'
import { clamp, choose } from '../utils/math'
import { laneToY } from '../utils/lane'

export class Player extends Phaser.GameObjects.Sprite implements FighterState {
  lane: number
  face: -1 | 1 = 1
  hp: number
  guard = false
  invincibleMs = 0
  attackFrame = 0
  combo = 0
  comboMs = 0
  z = 0
  private vz = 0
  private attackMs = 0
  private attackKind: 'punch' | 'kick' | null = null
  private hitApplied = false
  private moving = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    lane: number,
    private readonly animations: AnimationSystem,
    private readonly combat: CombatSystem,
    private readonly combatData: CombatData,
  ) {
    const frame = animations.frame('player', 'idle')
    super(scene, x, laneToY(lane), 'player-sheet', frame.name)
    this.lane = lane
    this.hp = combatData.player.maxHp
    this.setScale(0.38)
    animations.apply(this, 'player-sheet', frame)
    scene.add.existing(this)
  }

  get attacking() {
    return this.attackMs > 0 && this.attackKind !== null
  }

  get activeAttack() {
    if (!this.attackKind) return null
    const def = this.combat.getAttack(this.attackKind)
    return this.attackMs <= def.durationMs - def.activeAfterMs ? this.attackKind : null
  }

  updatePlayer(dt: number, input: NormalizedInput, worldWidth: number) {
    const seconds = dt / 1000
    const speed = this.guard ? this.combatData.player.speed * 0.55 : this.combatData.player.speed

    this.moving = false
    if (input.left) {
      this.x -= speed * seconds
      this.face = -1
      this.moving = true
    }
    if (input.right) {
      this.x += speed * seconds
      this.face = 1
      this.moving = true
    }
    if (input.up) {
      this.lane -= this.combatData.player.laneSpeed * seconds
      this.moving = true
    }
    if (input.down) {
      this.lane += this.combatData.player.laneSpeed * seconds
      this.moving = true
    }

    if (input.jump && this.z <= 0) {
      this.vz = this.combatData.player.jumpVelocity
      this.scene.events.emit('sfx', 'jump')
    }
    if (input.punch) this.startAttack('punch')
    if (input.kick) this.startAttack('kick')
    this.guard = input.guard && !this.attacking

    this.z = Math.max(0, this.z + this.vz * seconds)
    if (this.z > 0) this.vz -= this.combatData.player.gravity * seconds
    else this.vz = 0

    this.x = clamp(this.x, 28, worldWidth - 28)
    this.lane = clamp(this.lane, 0.58, 0.88)
    this.y = laneToY(this.lane, this.z)
    this.scaleX = Math.abs(this.scaleX) * this.face
    this.depth = Math.round(this.y)

    this.attackMs = Math.max(0, this.attackMs - dt)
    if (this.attackMs <= 0) {
      this.attackKind = null
      this.hitApplied = false
      this.attackFrame = 0
    }
    this.invincibleMs = Math.max(0, this.invincibleMs - dt)
    this.comboMs = Math.max(0, this.comboMs - dt)
    if (this.comboMs <= 0) this.combo = 0
    this.updateFrame()
  }

  markHitApplied() {
    this.hitApplied = true
  }

  canApplyAttackHit() {
    return this.attacking && !this.hitApplied && this.activeAttack !== null
  }

  hurt(amount: number, knockback: number) {
    if (this.invincibleMs > 0) return false
    if (this.guard && Math.sign(knockback) !== this.face) {
      this.scene.events.emit('sfx', 'guard')
      return false
    }
    this.hp = Math.max(0, this.hp - amount)
    this.x += knockback
    this.invincibleMs = this.combatData.player.invincibleMs
    this.scene.events.emit('sfx', 'hurt')
    return true
  }

  private startAttack(kind: 'punch' | 'kick') {
    if (this.attackMs > 95) return
    this.attackKind = kind
    this.attackMs = this.combat.getAttack(kind).durationMs
    this.hitApplied = false
    this.combo = Math.min(5, this.combo + 1)
    this.comboMs = this.combatData.player.comboWindowMs
    this.scene.events.emit('sfx', kind)
  }

  private updateFrame() {
    const action = ActorStateMachine.playerVisualState({
      invincibleMs: this.invincibleMs,
      z: this.z,
      guard: this.guard,
      attackKind: this.attackKind,
      attacking: this.attacking,
      moving: this.moving,
    })
    let index = 0
    const tick = Math.floor(this.scene.time.now / 130)

    if (action === 'hurt') {
      index = this.invincibleMs > 240 ? 0 : 1
      this.alpha = Math.floor(this.invincibleMs / 60) % 2 ? 0.62 : 1
    } else {
      this.alpha = 1
      if (action === 'jump') {
        index = this.z > 45 ? 1 : 0
      } else if (action === 'guard') {
        index = tick % 3
      } else if (action === 'punch' || action === 'kick') {
        const frames = action === 'kick' ? [0, 1, 2] : [0, 1, 2]
        index = choose(frames, Math.floor((1 - this.attackMs / this.combat.getAttack(action).durationMs) * frames.length))
        this.attackFrame = index
      } else if (action === 'walk') {
        index = tick % 4
      }
    }

    const frame = this.animations.frame('player', action, index)
    this.animations.apply(this, 'player-sheet', frame)
  }
}
