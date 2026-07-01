import Phaser from 'phaser'
import type { BossDefinition, EnemyDefinition, LevelData } from '../data/types'
import { Boss } from '../entities/Boss'
import { Enemy } from '../entities/Enemy'
import type { AnimationSystem } from './AnimationSystem'
import type { CombatSystem } from './CombatSystem'

export class SpawnSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly animations: AnimationSystem,
    private readonly combat: CombatSystem,
    private readonly enemyDefs: EnemyDefinition[],
    private readonly bossDefs: BossDefinition[],
  ) {}

  spawnEnemies(level: LevelData) {
    return level.enemyWaves.map((spawn) => {
      const def = this.enemyDefs.find((enemy) => enemy.id === spawn.role)
      if (!def) throw new Error(`Unknown enemy role: ${spawn.role}`)
      return new Enemy(this.scene, spawn.x, spawn.lane, def, this.animations, this.combat)
    })
  }

  spawnBoss(level: LevelData) {
    const def = this.bossDefs.find((boss) => boss.id === level.boss.id)
    if (!def) throw new Error(`Unknown boss: ${level.boss.id}`)
    return new Boss(this.scene, level.boss.x, level.boss.lane, def, this.animations, this.combat)
  }
}
