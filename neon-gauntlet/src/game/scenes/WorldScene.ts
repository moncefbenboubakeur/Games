import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKeys } from '../constants'
import { CHINA_CHAPTER_LEVELS, chinaLevelById, chinaLevelIndex, nextChinaLevel } from '../data/chinaChapter'
import type { AnimationData, AudioData, BossesData, BossPhaseDefinition, CombatData, EnemiesData, EnemyRole, LevelData, TiledMapData, WorldBehaviorData, WorldSystemsData } from '../data/types'
import { Boss } from '../entities/Boss'
import { Enemy } from '../entities/Enemy'
import { Player } from '../entities/Player'
import { AnimationSystem } from '../systems/AnimationSystem'
import { AudioSystem } from '../systems/AudioSystem'
import { CameraSystem } from '../systems/CameraSystem'
import { CombatDebugSystem } from '../systems/CombatDebugSystem'
import { attackBounds, CombatSystem } from '../systems/CombatSystem'
import { DataValidationSystem } from '../systems/DataValidationSystem'
import { HazardSystem } from '../systems/HazardSystem'
import { InputSystem } from '../systems/InputSystem'
import { NpcSystem } from '../systems/NpcSystem'
import { ProjectileSystem } from '../systems/ProjectileSystem'
import { PropSystem } from '../systems/PropSystem'
import { SaveAdapter } from '../systems/SaveAdapter'
import { SpawnSystem } from '../systems/SpawnSystem'
import { StageMapSystem } from '../systems/StageMapSystem'

export class WorldScene extends Phaser.Scene {
  private inputSystem!: InputSystem
  private animationSystem!: AnimationSystem
  private audioSystem!: AudioSystem
  private combat!: CombatSystem
  private combatDebug!: CombatDebugSystem
  private spawner!: SpawnSystem
  private player!: Player
  private enemies: Enemy[] = []
  private boss?: Boss
  private level!: LevelData
  private levelIndex = 0
  private mapSystem!: StageMapSystem
  private score = 0
  private bossSpawned = false
  private stageCleared = false
  private frozen = false
  private exitReady = false
  private encounterWaveIndex = 0
  private activeEncounterId?: string
  private activeEncounterGateX?: number
  private exitArrow?: Phaser.GameObjects.Text
  private hazards?: HazardSystem
  private props?: PropSystem
  private npcs?: NpcSystem
  private projectiles?: ProjectileSystem
  private bossAura?: Phaser.GameObjects.Ellipse
  private save = new SaveAdapter()
  private readonly playSfx = (key: string) => this.audioSystem.playSfx(key)
  private readonly spawnProjectile = (payload: { projectileId: string; x: number; lane: number; face: -1 | 1 }) => {
    this.projectiles?.spawn(payload.projectileId, payload.x, payload.lane, payload.face)
  }
  private readonly onBossPhase = (payload: { boss: Boss; phase: BossPhaseDefinition }) => this.handleBossPhase(payload.boss, payload.phase)

  constructor() {
    super(SceneKeys.World)
  }

  create(data: { levelId?: string; score?: number } = {}) {
    this.resetRunState(data.score ?? Number(this.registry.get('chapterScore') || 0))
    const levelRef = chinaLevelById(data.levelId || String(this.registry.get('currentLevelId') || ''))
    this.levelIndex = chinaLevelIndex(levelRef.id)
    this.registry.set('currentLevelId', levelRef.id)
    const animations = this.cache.json.get('animations') as AnimationData
    const combat = this.cache.json.get('combat') as CombatData
    const enemies = this.cache.json.get('enemies') as EnemiesData
    const bosses = this.cache.json.get('bosses') as BossesData
    const audio = this.cache.json.get('audio') as AudioData
    const worldBehavior = this.cache.json.get('world-behavior') as WorldBehaviorData
    const worldSystems = this.cache.json.get('world-systems') as WorldSystemsData
    const fallbackLevel = this.cache.json.get(levelRef.levelKey) as LevelData
    const map = this.cache.json.get(levelRef.mapKey) as TiledMapData
    DataValidationSystem.validateAll({ animations, combat, enemies, bosses, audio, level: fallbackLevel, map })
    DataValidationSystem.validateWorldBehavior(worldBehavior)
    DataValidationSystem.validateWorldSystems(
      worldSystems,
      CHINA_CHAPTER_LEVELS.map((level) => this.cache.json.get(level.levelKey) as LevelData),
      bosses,
      enemies,
    )
    this.mapSystem = new StageMapSystem(this, map, fallbackLevel, levelRef.tilemapKey)
    this.level = this.mapSystem.resolveLevel()

    this.animationSystem = new AnimationSystem(this, animations)
    this.animationSystem.registerFrames()
    enemies.roles.forEach((enemy) => {
      if (enemy.texture) this.animationSystem.registerFramesForTexture('enemy', enemy.texture)
    })
    bosses.bosses.forEach((boss) => this.animationSystem.registerFramesForTexture('enemy', boss.texture))
    this.combat = new CombatSystem(combat)
    this.combatDebug = new CombatDebugSystem(this, this.combat)
    this.audioSystem = new AudioSystem(this, audio)
    this.inputSystem = new InputSystem(this)
    this.registry.set('inputSystem', this.inputSystem)
    this.registry.set('worldScene', this)

    this.mapSystem.render()
    this.createExitArrow()
    this.showAreaTitle()
    this.createWorldSystems(worldSystems)

    this.player = new Player(this, this.level.playerSpawn.x, this.level.playerSpawn.lane, this.animationSystem, this.combat, combat)
    this.spawner = new SpawnSystem(this, this.animationSystem, this.combat, enemies.roles, bosses.bosses)
    this.enemies = this.level.encounterWaves?.length ? [] : this.spawner.spawnEnemies(this.level)
    this.handleEncounterFlow()

    new CameraSystem(this, this.level.worldWidth).follow(this.player)
    this.scene.launch(SceneKeys.UI)
    this.audioSystem.unlock()
    this.audioSystem.playMusic(this.level.music)
    this.events.on('sfx', this.playSfx)
    this.events.on('enemy:projectile', this.spawnProjectile)
    this.events.on('boss:phase', this.onBossPhase)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off('sfx', this.playSfx)
      this.events.off('enemy:projectile', this.spawnProjectile)
      this.events.off('boss:phase', this.onBossPhase)
      this.destroyWorldSystems()
    })

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
    this.handleEncounterFlow()
    this.enemies = this.enemies.filter((enemy) => enemy.active)
    this.enemies.forEach((enemy) => enemy.updateEnemy(delta, this.player, this.level.worldWidth))
    this.enemies = this.enemies.filter((enemy) => enemy.active)
    if (this.boss?.active) this.boss.updateEnemy(delta, this.player, this.level.worldWidth)
    if (this.boss && !this.boss.active) this.boss = undefined
    this.hazards?.update(_time, this.player)
    this.npcs?.update(delta)
    this.projectiles?.update(delta, this.player, this.level.worldWidth)
    this.updateBossAura(_time)
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

  private resetRunState(score = 0) {
    this.enemies = []
    this.boss = undefined
    this.score = score
    this.bossSpawned = false
    this.stageCleared = false
    this.frozen = false
    this.exitReady = false
    this.encounterWaveIndex = 0
    this.activeEncounterId = undefined
    this.activeEncounterGateX = undefined
    this.exitArrow?.destroy()
    this.exitArrow = undefined
    this.destroyWorldSystems()
    this.events.off('sfx', this.playSfx)
    this.events.off('enemy:projectile', this.spawnProjectile)
    this.events.off('boss:phase', this.onBossPhase)
    this.combatDebug?.destroy()
  }

  private handlePlayerAttack() {
    if (!this.player.canApplyAttackHit()) return
    const attack = this.player.activeAttack
    if (!attack) return
    const targets = [...this.enemies, ...(this.boss ? [this.boss] : [])].filter((enemy) => enemy.hp > 0)
    let hitActor = false
    for (const target of targets) {
      const result = this.combat.hit(this.player, target, attack, this.player.combo)
      if (!result.hit) continue
      target.hurt(result.damage, result.knockback)
      this.score += target.isBoss ? this.combat.data.score.bossHit : this.combat.data.score.enemyHit
      this.player.markHitApplied()
      this.addHitSpark(target.x, target.y - 30)
      hitActor = true
      break
    }
    if (hitActor) return
    const propScore = this.props?.tryHitByPlayer(this.player, attack) ?? 0
    if (propScore > 0) {
      this.score += propScore
      this.player.markHitApplied()
    }
  }

  private createWorldSystems(worldSystems: WorldSystemsData) {
    const stage = worldSystems.stages[this.level.id]
    this.hazards = new HazardSystem(this, stage?.hazards || [])
    this.props = new PropSystem(this, stage?.props || [], this.combat)
    this.npcs = new NpcSystem(this, stage?.npcs || [])
    this.projectiles = new ProjectileSystem(this, worldSystems.projectiles)
  }

  private destroyWorldSystems() {
    this.hazards?.destroy()
    this.props?.destroy()
    this.npcs?.destroy()
    this.projectiles?.destroy()
    this.hazards = undefined
    this.props = undefined
    this.npcs = undefined
    this.projectiles = undefined
    this.bossAura?.destroy()
    this.bossAura = undefined
  }

  private handleBossPhase(boss: Boss, phase: BossPhaseDefinition) {
    this.showBossAura(boss, phase.auraColor || '#ffd166')
    if (phase.stageHazard) this.hazards?.trigger(phase.stageHazard, this.time.now, 10000)
    if (phase.projectile && phase.projectileBurst) this.spawnBossProjectileBurst(boss, phase.projectile, phase.projectileBurst)
    if (phase.summonRole) this.spawnBossSupport(boss, phase.summonRole, phase.summonCount || 1)
  }

  private showBossAura(boss: Boss, color: string) {
    const tint = Number.parseInt(color.replace('#', ''), 16)
    this.bossAura?.destroy()
    this.bossAura = this.add.ellipse(boss.x, boss.y - 25, 62, 22, tint, 0.22)
      .setStrokeStyle(2, tint, 0.72)
      .setDepth(boss.depth - 1)
      .setBlendMode(Phaser.BlendModes.ADD)
  }

  private updateBossAura(time: number) {
    if (!this.bossAura || !this.boss?.active) {
      this.bossAura?.destroy()
      this.bossAura = undefined
      return
    }
    this.bossAura.setPosition(this.boss.x, this.boss.y - 25)
    this.bossAura.setDepth(this.boss.depth - 1)
    this.bossAura.setAlpha(0.18 + Math.sin(time / 110) * 0.08)
  }

  private spawnBossProjectileBurst(boss: Boss, projectileId: string, count: number) {
    const spread = [-0.055, 0, 0.055, -0.095, 0.095]
    let originX = Phaser.Math.Clamp(boss.x, 40, this.level.worldWidth - 40)
    if (Math.abs(originX - this.player.x) < 96) {
      const side = boss.x >= this.player.x ? 1 : -1
      originX = Phaser.Math.Clamp(this.player.x + side * 96, 40, this.level.worldWidth - 40)
    }
    for (let index = 0; index < count; index += 1) {
      const face = index % 2 === 0 ? boss.face : ((boss.face * -1) as -1 | 1)
      const lane = Phaser.Math.Clamp(boss.lane + (spread[index] || 0), 0.58, 0.88)
      this.projectiles?.spawn(projectileId, originX, lane, face)
    }
  }

  private spawnBossSupport(boss: Boss, role: EnemyRole, count: number) {
    for (let index = 0; index < count; index += 1) {
      const side = index % 2 === 0 ? -1 : 1
      const cameraLeft = this.cameras.main.scrollX
      const cameraRight = cameraLeft + GAME_WIDTH
      const x = side < 0 ? cameraLeft - 64 - index * 18 : cameraRight + 64 + index * 18
      const lane = Phaser.Math.Clamp(boss.lane + (index % 2 === 0 ? 0.055 : -0.055), 0.58, 0.88)
      this.spawnEnemySupport(x, role, lane)
    }
  }

  private spawnEnemySupport(x: number, role: EnemyRole, lane: number) {
    if (this.enemies.filter((enemy) => enemy.hp > 0).length >= 7) return
    const def = (this.cache.json.get('enemies') as EnemiesData).roles.find((enemy) => enemy.id === role)
    if (!def) return
    this.enemies.push(new Enemy(this, x, lane, def, this.animationSystem, this.combat))
  }

  private handleEncounterFlow() {
    const waves = this.level.encounterWaves
    if (!waves?.length || this.bossSpawned) return

    const encounterHasLivingThreats = this.enemies.some((enemy) => enemy.hp > 0)
    if (this.activeEncounterId && encounterHasLivingThreats) {
      if (this.activeEncounterGateX !== undefined && this.player.x > this.activeEncounterGateX) {
        this.player.x = this.activeEncounterGateX
      }
      return
    }

    if (this.activeEncounterId) {
      this.activeEncounterId = undefined
      this.activeEncounterGateX = undefined
      this.events.emit('message', 'MOVE')
    }

    const next = waves[this.encounterWaveIndex]
    if (!next || this.player.x < next.triggerX) return
    this.enemies.push(...this.spawner.spawnWave(this.level, next.spawns, this.player.x))
    this.encounterWaveIndex += 1
    this.activeEncounterId = next.id
    this.activeEncounterGateX = next.gateX
    this.events.emit('message', 'FIGHT')
  }

  private handleBossSpawn() {
    if (this.bossSpawned || this.player.x < this.level.boss.spawnAfterX) return
    if (this.hasPendingEncounterWaves()) return
    const spawner = new SpawnSystem(
      this,
      this.animationSystem,
      this.combat,
      (this.cache.json.get('enemies') as EnemiesData).roles,
      (this.cache.json.get('bosses') as BossesData).bosses,
    )
    this.boss = spawner.spawnBoss(this.level, this.player.x)
    this.bossSpawned = true
    this.events.emit('message', `BOSS  ${this.boss.bossName}`)
  }

  private handleStageClear() {
    if (this.stageCleared) return
    this.exitReady = !this.hasLivingThreats()
    this.updateExitArrow()
    if (!this.exitReady || this.player.x < this.level.stageClearX) return
    this.stageCleared = true
    this.save.publishResult({ score: this.score, stage: this.level.id, completed: true })
    this.registry.set('chapterScore', this.score)
    const nextLevel = nextChinaLevel(this.level.id)
    if (!nextLevel) {
      this.scene.stop(SceneKeys.UI)
      this.scene.start(SceneKeys.StageClear, { score: this.score })
      return
    }
    this.startLevelTransfer(nextLevel.id)
  }

  private hasLivingThreats() {
    return this.enemies.some((enemy) => enemy.hp > 0) || Boolean(this.boss && this.boss.hp > 0) || this.hasPendingEncounterWaves()
  }

  private hasPendingEncounterWaves() {
    const waves = this.level.encounterWaves
    if (!waves?.length || this.bossSpawned) return false
    return Boolean(this.activeEncounterId) || this.encounterWaveIndex < waves.length
  }

  private createExitArrow() {
    this.exitArrow = this.add.text(GAME_WIDTH - 118, 112, 'GO >>>', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffd400',
      stroke: '#4a2500',
      strokeThickness: 6,
      padding: { left: 5, right: 5, top: 2, bottom: 2 },
    }).setDepth(930).setScrollFactor(0).setVisible(false).setAlpha(1)
    this.exitArrow.setShadow(2, 2, '#000000', 0, true, true)
    this.tweens.add({ targets: this.exitArrow, alpha: 0.42, duration: 330, yoyo: true, repeat: -1 })
  }

  private updateExitArrow() {
    if (!this.exitArrow || this.exitArrow.visible === this.exitReady) return
    this.exitArrow.setVisible(this.exitReady)
  }

  private startLevelTransfer(nextLevelId: string) {
    this.frozen = true
    this.scene.stop(SceneKeys.UI)
    this.events.emit('sfx', 'stageClear')
    const wipe = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x050711, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(2000)
    const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'NEXT AREA', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd166',
      stroke: '#0b1028',
      strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setAlpha(0)
    this.tweens.add({
      targets: [wipe, label],
      alpha: 1,
      duration: 420,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.scene.start(SceneKeys.World, { levelId: nextLevelId, score: this.score })
      },
    })
  }

  private showAreaTitle() {
    const title = this.add.text(GAME_WIDTH - 14, 43, `AREA ${this.levelIndex + 1}  ${this.level.name}`, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffd166',
      stroke: '#050711',
      strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1600).setAlpha(0)
    const subtitle = this.add.text(GAME_WIDTH - 14, 54, 'CLEAR CREW  THEN MOVE RIGHT', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#dff6ff',
      stroke: '#050711',
      strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1600).setAlpha(0)
    this.tweens.add({
      targets: [title, subtitle],
      alpha: 0.82,
      duration: 180,
      yoyo: true,
      hold: 560,
      onComplete: () => {
        title.destroy()
        subtitle.destroy()
      },
    })
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
      player: { x: this.player.x, hp: this.player.hp, combo: this.player.combo },
      level: { ...this.level, index: this.levelIndex, exitReady: this.exitReady },
      boss: this.boss ? { id: this.level.boss.id, name: this.boss.bossName, hp: this.boss.hp, x: this.boss.x, phase: this.boss.activePhase } : null,
      enemies: [...this.enemies, ...(this.boss ? [this.boss] : [])].map((enemy) => ({
        x: enemy.x,
        hp: enemy.hp,
        active: enemy.active,
        aiState: enemy.aiState,
        aiReason: enemy.aiReason,
        texture: enemy.texture.key,
      })),
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
        stage2: this.textures.exists('stage-02-china-station-bg'),
        stage3: this.textures.exists('stage-03-china-back-alley-bg'),
        stage4: this.textures.exists('stage-04-china-night-market-bg'),
        tileset: this.textures.exists('metro-tiles'),
        player: this.textures.exists('player-sheet'),
        enemy: this.textures.exists('enemy-sheet'),
        mapDrivenStage: Boolean(this.mapSystem),
        tileLayers: this.mapSystem.totalTileLayers(),
        renderedTileLayers: this.mapSystem.renderedTileLayers(),
        scenePlates: this.mapSystem.renderedScenePlates(),
        prototypeTileLayersVisible: this.mapSystem.visiblePrototypeTileLayers(),
      },
      world: {
        hazards: this.hazards?.debugSnapshot() || [],
        props: this.props?.debugSnapshot() || [],
        npcs: this.npcs?.debugSnapshot() || [],
        projectiles: this.projectiles?.debugSnapshot() || { count: 0 },
      },
      encounter: {
        activeId: this.activeEncounterId ?? null,
        waveIndex: this.encounterWaveIndex,
        totalWaves: this.level.encounterWaves?.length ?? 0,
        gateX: this.activeEncounterGateX ?? null,
      },
    }
    ;(window as typeof window & { __NEON_FREEZE__?: () => void }).__NEON_FREEZE__ = () => {
      this.frozen = true
    }
    ;(window as typeof window & { __NEON_TOGGLE_HITBOXES__?: () => boolean }).__NEON_TOGGLE_HITBOXES__ = () => this.combatDebug.toggle()
  }
}
