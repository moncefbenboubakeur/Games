import Phaser from 'phaser'
import type { BossDefinition, EnemyDefinition } from '../data/types'
import type { AnimationSystem } from '../systems/AnimationSystem'
import type { CombatSystem } from '../systems/CombatSystem'
import { Enemy } from './Enemy'

export class Boss extends Enemy {
  override readonly isBoss = true
  readonly bossName: string
  readonly bossId: string
  activePhase = 'base'
  private readonly base: Pick<EnemyDefinition, 'speed' | 'cooldownMinMs' | 'cooldownMaxMs' | 'preferredAttack' | 'projectile'>
  private readonly maxHp: number
  private readonly bossDef: BossDefinition

  constructor(scene: Phaser.Scene, x: number, lane: number, boss: BossDefinition, animations: AnimationSystem, combat: CombatSystem) {
    const asEnemy: EnemyDefinition = {
      id: boss.preferredAttack === 'kick' ? 'bruiser' : 'striker',
      texture: boss.texture,
      hp: boss.hp,
      speed: boss.speed,
      damage: boss.damage,
      range: boss.range,
      cooldownMinMs: boss.cooldownMinMs,
      cooldownMaxMs: boss.cooldownMaxMs,
      scale: boss.scale ?? 1.28,
      preferredAttack: boss.preferredAttack,
      laneSpeed: boss.laneSpeed,
      telegraphMs: boss.telegraphMs,
      attackDurationMs: boss.attackDurationMs,
    }
    super(scene, x, lane, asEnemy, animations, combat)
    this.bossName = boss.name
    this.bossId = boss.id
    this.bossDef = boss
    this.maxHp = boss.hp
    this.base = {
      speed: asEnemy.speed,
      cooldownMinMs: asEnemy.cooldownMinMs,
      cooldownMaxMs: asEnemy.cooldownMaxMs,
      preferredAttack: asEnemy.preferredAttack,
      projectile: asEnemy.projectile,
    }
  }

  override updateEnemy(dt: number, player: Parameters<Enemy['updateEnemy']>[1], worldWidth: number) {
    this.updatePhase()
    super.updateEnemy(dt, player, worldWidth)
  }

  private updatePhase() {
    const phases = [...(this.bossDef.phases || [])].sort((a, b) => a.hpBelow - b.hpBelow)
    const ratio = this.hp / this.maxHp
    const phase = phases.find((candidate) => ratio <= candidate.hpBelow)
    const nextPhase = phase?.id ?? 'base'
    if (nextPhase === this.activePhase) return
    this.activePhase = nextPhase
    this.def.speed = this.base.speed * (phase?.speedMultiplier ?? 1)
    this.def.cooldownMinMs = Math.round(this.base.cooldownMinMs * (phase?.cooldownMultiplier ?? 1))
    this.def.cooldownMaxMs = Math.round(this.base.cooldownMaxMs * (phase?.cooldownMultiplier ?? 1))
    this.def.preferredAttack = phase?.preferredAttack ?? this.base.preferredAttack
    this.def.projectile = phase?.projectile ?? this.base.projectile
    if (phase) this.scene.events.emit('message', phase.message)
  }
}
