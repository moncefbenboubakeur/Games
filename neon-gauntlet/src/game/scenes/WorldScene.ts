import Phaser from 'phaser'
import { SceneKeys } from '../constants'
import type { AnimationData, AudioData, BossesData, CombatData, EnemiesData, LevelData, TiledMapData } from '../data/types'
import { Boss } from '../entities/Boss'
import { Enemy } from '../entities/Enemy'
import { Player } from '../entities/Player'
import { AnimationSystem } from '../systems/AnimationSystem'
import { AudioSystem } from '../systems/AudioSystem'
import { CameraSystem } from '../systems/CameraSystem'
import { CombatDebugSystem } from '../systems/CombatDebugSystem'
import { attackBounds, CombatSystem } from '../systems/CombatSystem'
import { DataValidationSystem } from '../systems/DataValidationSystem'
import { InputSystem } from '../systems/InputSystem'
import { SaveAdapter } from '../systems/SaveAdapter'
import { SpawnSystem } from '../systems/SpawnSystem'
import { StageMapSystem } from '../systems/StageMapSystem'

export class WorldScene extends Phaser.Scene {
  private inputSystem!: InputSystem
  private animationSystem!: AnimationSystem
  private audioSystem!: AudioSystem
  private combat!: CombatSystem
  private combatDebug!: CombatDebugSystem
  private player!: Player
  private enemies: Enemy[] = []
  private boss?: Boss
  private level!: LevelData
  private mapSystem!: StageMapSystem
  private score = 0
  private bossSpawned = false
  private stageCleared = false
  private frozen = false
  private save = new SaveAdapter()
  private readonly playSfx = (key: string) => this.audioSystem.playSfx(key)

  constructor() {
    super(SceneKeys.World)
  }

  create() {
    this.resetRunState()
    const animations = this.cache.json.get('animations') as AnimationData
    const combat = this.cache.json.get('combat') as CombatData
    const enemies = this.cache.json.get('enemies') as EnemiesData
    const bosses = this.cache.json.get('bosses') as BossesData
    const audio = this.cache.json.get('audio') as AudioData
    const fallbackLevel = this.cache.json.get('stage-01') as LevelData
    const map = this.cache.json.get('stage-01-map') as TiledMapData
    DataValidationSystem.validateAll({ animations, combat, enemies, bosses, audio, level: fallbackLevel, map })
    this.mapSystem = new StageMapSystem(this, map, fallbackLevel)
    this.level = this.mapSystem.resolveLevel()

    this.animationSystem = new AnimationSystem(this, animations)
    this.animationSystem.registerFrames()
    this.combat = new CombatSystem(combat)
    this.combatDebug = new CombatDebugSystem(this, this.combat)
    this.audioSystem = new AudioSystem(this, audio)
    this.inputSystem = new InputSystem(this)
    this.registry.set('inputSystem', this.inputSystem)
    this.registry.set('worldScene', this)

    this.mapSystem.render()

    this.player = new Player(this, this.level.playerSpawn.x, this.level.playerSpawn.lane, this.animationSystem, this.combat, combat)
    const spawner = new SpawnSystem(this, this.animationSystem, this.combat, enemies.roles, bosses.bosses)
    this.enemies = spawner.spawnEnemies(this.level)

    new CameraSystem(this, this.level.worldWidth).follow(this.player)
    this.scene.launch(SceneKeys.UI)
    this.audioSystem.unlock()
    this.audioSystem.playMusic(this.level.music)
    this.events.on('sfx', this.playSfx)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off('sfx', this.playSfx))

    this.events.emit('hud:update', this.snapshot())
    this.exposeDebug()
  }

  override update(_time: number, delta: number) {
    if (this.frozen) return
    const input = this.inputSystem.update()
    if (input.pause) {
      this.scene.pause()
      this.scene.launch(SceneKeys.Pause)
      return
    }

    this.player.updatePlayer(delta, input, this.level.worldWidth)
    this.enemies = this.enemies.filter((enemy) => enemy.active)
    this.enemies.forEach((enemy) => enemy.updateEnemy(delta, this.player, this.level.worldWidth))
    this.enemies = this.enemies.filter((enemy) => enemy.active)
    if (this.boss?.active) this.boss.updateEnemy(delta, this.player, this.level.worldWidth)
    if (this.boss && !this.boss.active) this.boss = undefined
    this.handlePlayerAttack()
    this.handleBossSpawn()
    this.handleStageClear()
    this.combatDebug.update(this.player, [...this.enemies, ...(this.boss ? [this.boss] : [])])

    if (this.player.hp <= 0) this.scene.start(SceneKeys.GameOver)
    this.events.emit('hud:update', this.snapshot())
    this.exposeDebug()
  }

  press(action: Parameters<InputSystem['press']>[0], down: boolean) {
    this.inputSystem.press(action, down)
  }

  toggleMute() {
    return this.audioSystem.toggleMute()
  }

  private resetRunState() {
    this.enemies = []
    this.boss = undefined
    this.score = 0
    this.bossSpawned = false
    this.stageCleared = false
    this.frozen = false
    this.events.off('sfx', this.playSfx)
    this.combatDebug?.destroy()
  }

  private handlePlayerAttack() {
    if (!this.player.canApplyAttackHit()) return
    const attack = this.player.activeAttack
    if (!attack) return
    const targets = [...this.enemies, ...(this.boss ? [this.boss] : [])].filter((enemy) => enemy.hp > 0)
    for (const target of targets) {
      const result = this.combat.hit(this.player, target, attack, this.player.combo)
      if (!result.hit) continue
      target.hurt(result.damage, result.knockback)
      this.score += target.isBoss ? this.combat.data.score.bossHit : this.combat.data.score.enemyHit
      this.player.markHitApplied()
      this.addHitSpark(target.x, target.y - 30)
      break
    }
  }

  private handleBossSpawn() {
    if (this.bossSpawned || this.player.x < this.level.boss.spawnAfterX) return
    const spawner = new SpawnSystem(
      this,
      this.animationSystem,
      this.combat,
      (this.cache.json.get('enemies') as EnemiesData).roles,
      (this.cache.json.get('bosses') as BossesData).bosses,
    )
    this.boss = spawner.spawnBoss(this.level)
    this.bossSpawned = true
    this.events.emit('message', `BOSS  ${this.boss.bossName}`)
  }

  private handleStageClear() {
    if (this.stageCleared) return
    const livingEnemies = this.enemies.some((enemy) => enemy.hp > 0)
    const livingBoss = this.boss && this.boss.hp > 0
    if (this.player.x < this.level.stageClearX || livingEnemies || livingBoss) return
    this.stageCleared = true
    this.save.publishResult({ score: this.score, stage: this.level.id, completed: true })
    this.scene.stop(SceneKeys.UI)
    this.scene.start(SceneKeys.StageClear, { score: this.score })
  }

  private addHitSpark(x: number, y: number) {
    const spark = this.add.star(x, y, 7, 3, 13, 0xffd166).setDepth(999)
    this.tweens.add({ targets: spark, scale: 1.8, alpha: 0, duration: 220, onComplete: () => spark.destroy() })
  }

  private snapshot() {
    return {
      hp: this.player.hp,
      maxHp: this.combat.data.player.maxHp,
      score: this.score,
      level: this.level.name,
      enemies: this.enemies.filter((enemy) => enemy.hp > 0).length + (this.boss && this.boss.hp > 0 ? 1 : 0),
      boss: this.boss ? { name: this.boss.bossName, hp: this.boss.hp } : null,
    }
  }

  private exposeDebug() {
    const activeAttack = this.player.activeAttack
    ;(window as typeof window & { __NEON_DEBUG__?: unknown; player?: unknown; enemies?: unknown; level?: unknown; assets?: unknown }).__NEON_DEBUG__ = {
      title: 'Neon Gauntlet',
      player: { x: this.player.x, hp: this.player.hp },
      level: this.level,
      enemies: [...this.enemies, ...(this.boss ? [this.boss] : [])].map((enemy) => ({ x: enemy.x, hp: enemy.hp, active: enemy.active })),
      combat: {
        playerAttack: activeAttack
          ? {
            kind: activeAttack,
            bounds: attackBounds(this.player, this.combat.getAttack(activeAttack)),
            lane: this.player.lane,
          }
          : null,
      },
      input: this.inputSystem.debugSnapshot(),
      assets: {
        stage1: this.textures.exists('stage-01-metro-arcade-bg'),
        tileset: this.textures.exists('metro-tiles'),
        player: this.textures.exists('player-sheet'),
        enemy: this.textures.exists('enemy-sheet'),
        mapDrivenStage: Boolean(this.mapSystem),
        tileLayers: this.mapSystem.totalTileLayers(),
        renderedTileLayers: this.mapSystem.renderedTileLayers(),
        scenePlates: this.mapSystem.renderedScenePlates(),
        prototypeTileLayersVisible: this.mapSystem.visiblePrototypeTileLayers(),
      },
    }
    ;(window as typeof window & { __NEON_FREEZE__?: () => void }).__NEON_FREEZE__ = () => {
      this.frozen = true
    }
    ;(window as typeof window & { __NEON_TOGGLE_HITBOXES__?: () => boolean }).__NEON_TOGGLE_HITBOXES__ = () => this.combatDebug.toggle()
  }
}
