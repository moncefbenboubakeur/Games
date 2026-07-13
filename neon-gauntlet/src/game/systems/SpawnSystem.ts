import Phaser from 'phaser'
import type { BossDefinition, EnemyDefinition, LevelData } from '../data/types'
import { GAME_WIDTH } from '../constants'
import { Boss } from '../entities/Boss'
import { Enemy } from '../entities/Enemy'
import type { AnimationSystem } from './AnimationSystem'
import type { CombatSystem } from './CombatSystem'

export class SpawnSystem {
  private static readonly entryMargin = 42
  private static readonly entrySpacing = 36

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly animations: AnimationSystem,
    private readonly combat: CombatSystem,
    private readonly enemyDefs: EnemyDefinition[],
    private readonly bossDefs: BossDefinition[],
  ) {}

  spawnEnemies(level: LevelData) {
    return this.spawnWave(level, level.enemyWaves, level.playerSpawn.x)
  }

  spawnWave(level: LevelData, spawns: LevelData['enemyWaves'], referenceX: number) {
    return spawns.map((spawn, index) => {
      const def = this.enemyDefs.find((enemy) => enemy.id === spawn.role)
      if (!def) throw new Error(`Unknown enemy role: ${spawn.role}`)
      return new Enemy(this.scene, this.entryX(spawn.x, referenceX, level.worldWidth, index), spawn.lane, def, this.animations, this.combat)
    })
  }

  spawnBoss(level: LevelData, playerX = level.playerSpawn.x) {
    const def = this.bossDefs.find((boss) => boss.id === level.boss.id)
    if (!def) throw new Error(`Unknown boss: ${level.boss.id}`)
    return new Boss(this.scene, this.entryX(level.boss.x, playerX, level.worldWidth), level.boss.lane, def, this.animations, this.combat)
  }

  private entryX(targetX: number, referenceX: number, worldWidth: number, index = 0) {
    const spacing = index * SpawnSystem.entrySpacing
    const cameraLeft = this.scene.cameras.main.scrollX
    const cameraRight = cameraLeft + GAME_WIDTH
    if (targetX >= referenceX) return Math.min(worldWidth + SpawnSystem.entryMargin, cameraRight + SpawnSystem.entryMargin + spacing)
    return Math.max(-SpawnSystem.entryMargin, cameraLeft - SpawnSystem.entryMargin - spacing)
  }
}
