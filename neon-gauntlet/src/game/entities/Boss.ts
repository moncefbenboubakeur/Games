import Phaser from 'phaser'
import type { BossDefinition, EnemyDefinition } from '../data/types'
import type { AnimationSystem } from '../systems/AnimationSystem'
import type { CombatSystem } from '../systems/CombatSystem'
import { Enemy } from './Enemy'

export class Boss extends Enemy {
  override readonly isBoss = true
  readonly bossName: string

  constructor(scene: Phaser.Scene, x: number, lane: number, boss: BossDefinition, animations: AnimationSystem, combat: CombatSystem) {
    const asEnemy: EnemyDefinition = {
      id: 'bruiser',
      hp: boss.hp,
      speed: boss.speed,
      damage: boss.damage,
      range: boss.range,
      cooldownMinMs: boss.cooldownMinMs,
      cooldownMaxMs: boss.cooldownMaxMs,
      scale: 1.28,
    }
    super(scene, x, lane, asEnemy, animations, combat)
    this.bossName = boss.name
    this.setTint(0xffd166)
  }
}
