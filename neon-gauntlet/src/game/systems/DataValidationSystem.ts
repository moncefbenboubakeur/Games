import type { AnimationData, AudioData, BossesData, CombatData, EnemiesData, EnemyRole, LevelData, TiledMapData, WorldBehaviorData, WorldSystemsData } from '../data/types'

interface GameDataBundle {
  animations: AnimationData
  combat: CombatData
  enemies: EnemiesData
  bosses: BossesData
  audio: AudioData
  level: LevelData
  map: TiledMapData
}

const requiredMapLayers = ['BackgroundFar', 'BackgroundMid', 'Decor', 'Ground', 'Foreground', 'Collision', 'PlayerSpawn', 'EnemySpawns', 'BossSpawn', 'Triggers', 'CameraZones', 'Props', 'NPCs']
const requiredTileLayers = ['BackgroundMid', 'Decor', 'Ground', 'Foreground']
const allowedImageLayerModes = ['scenePlate', 'parallaxPlate', 'tile']
const requiredActorAnimations = ['idle', 'walk', 'punch', 'kick', 'guard', 'hurt', 'jump']
const requiredSfx = ['punch', 'kick', 'hit', 'jump', 'hurt', 'guard', 'stageClear']
const allowedPreferredAttacks = ['punch', 'kick']

export class DataValidationSystem {
  static validateAll(data: GameDataBundle) {
    this.validateAnimations(data.animations)
    this.validateCombat(data.combat)
    this.validateEnemyDefinitions(data.enemies)
    this.validateBossDefinitions(data.bosses)
    this.validateLevel(data.level, data.enemies, data.bosses)
    this.validateAudio(data.audio, data.level)
    this.validateMap(data.map)
  }

  static validateAnimations(data: AnimationData) {
    ;(['player', 'enemy'] as const).forEach((actor) => {
      const actorData = data[actor]
      this.require(Boolean(actorData.texture), `${actor} animation texture is required`)
      this.require(actorData.scale > 0, `${actor} animation scale must be positive`)
      requiredActorAnimations.forEach((action) => {
        const frames = actorData.animations[action]
        this.require(Array.isArray(frames) && frames.length > 0, `${actor}.${action} animation needs at least one frame`)
        frames.forEach((frame, index) => {
          this.require(Boolean(frame.name), `${actor}.${action}[${index}] frame name is required`)
          this.require(frame.w > 0 && frame.h > 0, `${actor}.${action}[${index}] frame dimensions must be positive`)
          this.require(frame.ax >= 0 && frame.ay >= 0, `${actor}.${action}[${index}] anchor must be non-negative`)
          this.require(Boolean(frame.hurtbox), `${actor}.${action}[${index}] hurtbox metadata is required`)
          if (frame.hurtbox) {
            this.require(frame.hurtbox.w > 0 && frame.hurtbox.h > 0, `${actor}.${action}[${index}] hurtbox dimensions must be positive`)
            this.require(frame.hurtbox.x >= 0 && frame.hurtbox.y >= 0, `${actor}.${action}[${index}] hurtbox origin must be non-negative`)
            this.require(frame.hurtbox.x + frame.hurtbox.w <= frame.w, `${actor}.${action}[${index}] hurtbox must fit inside frame width`)
            this.require(frame.hurtbox.y + frame.hurtbox.h <= frame.h, `${actor}.${action}[${index}] hurtbox must fit inside frame height`)
          }
        })
      })
    })
  }

  static validateCombat(data: CombatData) {
    ;(['punch', 'kick'] as const).forEach((kind) => {
      const attack = data.attacks[kind]
      this.require(attack.damage > 0, `${kind} damage must be positive`)
      this.require(attack.range > 0, `${kind} range must be positive`)
      this.require(attack.durationMs > attack.activeAfterMs, `${kind} duration must be longer than activeAfterMs`)
      this.require(attack.knockback > 0, `${kind} knockback must be positive`)
      this.require(Boolean(attack.hitbox), `${kind} hitbox metadata is required`)
      if (!attack.hitbox) return
      this.require(attack.hitbox.forwardOffset >= 0, `${kind} hitbox forwardOffset must be non-negative`)
      this.require(attack.hitbox.width > 0, `${kind} hitbox width must be positive`)
      this.require(attack.hitbox.targetHalfWidth > 0, `${kind} targetHalfWidth must be positive`)
      this.require(attack.hitbox.laneRange > 0, `${kind} hitbox laneRange must be positive`)
      this.require(attack.hitbox.activeFrame >= 0, `${kind} activeFrame must be non-negative`)
      this.require(Array.isArray(attack.hitbox.frames) && attack.hitbox.frames.length > 0, `${kind} per-frame hitbox metadata is required`)
      attack.hitbox.frames?.forEach((frame, index) => {
        this.require(frame.frame >= 0, `${kind} hitbox frame ${index} frame must be non-negative`)
        this.require(frame.forwardOffset >= 0, `${kind} hitbox frame ${index} forwardOffset must be non-negative`)
        this.require(frame.width > 0, `${kind} hitbox frame ${index} width must be positive`)
        this.require(frame.targetHalfWidth > 0, `${kind} hitbox frame ${index} targetHalfWidth must be positive`)
        this.require(frame.laneRange > 0, `${kind} hitbox frame ${index} laneRange must be positive`)
      })
    })
  }

  static validateEnemyDefinitions(data: EnemiesData) {
    const ids = new Set<string>()
    data.roles.forEach((enemy) => {
      this.require(!ids.has(enemy.id), `Duplicate enemy role: ${enemy.id}`)
      ids.add(enemy.id)
      this.require(enemy.hp > 0, `${enemy.id} hp must be positive`)
      this.require(enemy.speed > 0, `${enemy.id} speed must be positive`)
      this.require(enemy.range > 0, `${enemy.id} range must be positive`)
      this.require(enemy.scale > 0, `${enemy.id} scale must be positive`)
      if (enemy.textureFile !== undefined) {
        this.require(Boolean(enemy.texture), `${enemy.id} texture is required when textureFile is set`)
        this.require(enemy.textureFile.startsWith('/assets/sprites/enemies/'), `${enemy.id} textureFile must live under /assets/sprites/enemies/`)
      }
      this.validateBehaviorTuning(enemy.id, enemy)
    })
  }

  static validateBossDefinitions(data: BossesData) {
    const ids = new Set<string>()
    data.bosses.forEach((boss) => {
      this.require(!ids.has(boss.id), `Duplicate boss id: ${boss.id}`)
      ids.add(boss.id)
      this.require(Boolean(boss.name), `${boss.id} name is required`)
      this.require(Boolean(boss.texture), `${boss.id} texture is required`)
      this.require(Boolean(boss.textureFile), `${boss.id} textureFile is required`)
      this.require(boss.textureFile.startsWith('/assets/sprites/bosses/'), `${boss.id} textureFile must live under /assets/sprites/bosses/`)
      this.require(boss.hp > 0, `${boss.id} hp must be positive`)
      this.require(boss.speed > 0, `${boss.id} speed must be positive`)
      this.require(boss.range > 0, `${boss.id} range must be positive`)
      this.validateBehaviorTuning(boss.id, boss)
      if (boss.scale !== undefined) this.require(boss.scale > 0, `${boss.id} scale must be positive`)
      boss.phases?.forEach((phase, index) => {
        this.require(Boolean(phase.id), `${boss.id} phase ${index} id is required`)
        this.require(phase.hpBelow > 0 && phase.hpBelow < 1, `${boss.id} phase ${phase.id} hpBelow must be between 0 and 1`)
        this.require(Boolean(phase.message), `${boss.id} phase ${phase.id} message is required`)
        this.require(phase.speedMultiplier > 0, `${boss.id} phase ${phase.id} speedMultiplier must be positive`)
        this.require(phase.cooldownMultiplier > 0, `${boss.id} phase ${phase.id} cooldownMultiplier must be positive`)
        if (phase.preferredAttack !== undefined) this.require(allowedPreferredAttacks.includes(phase.preferredAttack), `${boss.id} phase ${phase.id} preferredAttack must be punch or kick`)
        if (phase.alternateAttack !== undefined) this.require(allowedPreferredAttacks.includes(phase.alternateAttack), `${boss.id} phase ${phase.id} alternateAttack must be punch or kick`)
        if (phase.patternCycleMs !== undefined) this.require(phase.patternCycleMs > 0, `${boss.id} phase ${phase.id} patternCycleMs must be positive`)
        if (phase.projectileBurst !== undefined) this.require(phase.projectileBurst > 0 && phase.projectileBurst <= 5, `${boss.id} phase ${phase.id} projectileBurst must be 1-5`)
        if (phase.summonCount !== undefined) this.require(phase.summonCount > 0 && phase.summonCount <= 3, `${boss.id} phase ${phase.id} summonCount must be 1-3`)
        if (phase.auraColor !== undefined) this.require(/^#[0-9a-fA-F]{6}$/.test(phase.auraColor), `${boss.id} phase ${phase.id} auraColor must be #RRGGBB`)
      })
    })
  }

  static validateLevel(level: LevelData, enemies: EnemiesData, bosses: BossesData) {
    const enemyRoles = new Set(enemies.roles.map((enemy) => enemy.id))
    const bossIds = new Set(bosses.bosses.map((boss) => boss.id))
    this.require(Boolean(level.id), 'Level id is required')
    this.require(level.worldWidth > 0, `${level.id} worldWidth must be positive`)
    this.require(level.playerSpawn.x >= 0, `${level.id} player spawn x must be non-negative`)
    level.enemyWaves.forEach((spawn, index) => {
      this.require(enemyRoles.has(spawn.role), `${level.id} enemy spawn ${index} has unknown role: ${spawn.role}`)
    })
    this.require(bossIds.has(level.boss.id), `${level.id} has unknown boss: ${level.boss.id}`)
    this.require(level.boss.spawnAfterX < level.stageClearX, `${level.id} boss trigger must come before stage clear`)
  }

  static validateAudio(data: AudioData, level?: LevelData) {
    requiredSfx.forEach((key) => this.require(Boolean(data.sfx[key]), `Required sfx cue is missing: ${key}`))
    if (level) this.require(Boolean(data.music[level.music]), `${level.id} music cue is missing: ${level.music}`)

    Object.entries(data.music).forEach(([key, cue]) => {
      this.validateAudioCue(`music.${key}`, cue.file, cue.volume)
      this.require(typeof cue.loop === 'boolean', `music.${key} loop must be boolean`)
    })
    Object.entries(data.sfx).forEach(([key, cue]) => this.validateAudioCue(`sfx.${key}`, cue.file, cue.volume))
  }

  static validateWorldBehavior(data: WorldBehaviorData) {
    this.require(data.ai.cancelTelegraphWhenTargetLeavesRange === true, 'AI must cancel telegraph when target leaves range')
    this.require(data.ai.guardOnlyWhenThreatened === true, 'AI guard must be threat-driven')
    this.require(data.ai.maxOffLaneAttackDelta > 0, 'AI maxOffLaneAttackDelta must be positive')
    this.require(data.ai.pursuitStopRangeMultiplier > 0 && data.ai.pursuitStopRangeMultiplier <= 1, 'AI pursuitStopRangeMultiplier must be between 0 and 1')
    this.require(data.npc.requirePurpose === true, 'NPCs/background actors need an explicit purpose')
    this.require(data.npc.allowRandomGuarding === false, 'NPCs/background actors must not randomly guard')
    this.require(data.npc.requirePathForMovingActors === true, 'Moving NPCs/background actors need paths')
    this.require(data.npc.requireAnimationContactSheet === true, 'NPC/background actor animations need contact-sheet review')
  }

  static validateWorldSystems(data: WorldSystemsData, levels: LevelData[], bosses: BossesData, enemies: EnemiesData) {
    this.require(data.version > 0, 'World systems version must be positive')
    Object.entries(data.projectiles).forEach(([key, projectile]) => {
      this.require(key === projectile.id, `Projectile key must match id: ${key}`)
      this.require(projectile.speed > 0, `${key} projectile speed must be positive`)
      this.require(projectile.damage > 0, `${key} projectile damage must be positive`)
      this.require(projectile.ttlMs > 0, `${key} projectile ttlMs must be positive`)
      this.require(projectile.width > 0 && projectile.height > 0, `${key} projectile dimensions must be positive`)
      this.require(projectile.laneRange > 0, `${key} projectile laneRange must be positive`)
      this.require(/^#[0-9a-fA-F]{6}$/.test(projectile.color), `${key} projectile color must be #RRGGBB`)
    })

    const projectileIds = new Set(Object.keys(data.projectiles))
    bosses.bosses.flatMap((boss) => boss.phases || []).forEach((phase) => {
      if (phase.projectile) this.require(projectileIds.has(phase.projectile), `Boss phase projectile is unknown: ${phase.projectile}`)
    })
    enemies.roles.forEach((enemy) => {
      if (enemy.projectile) this.require(projectileIds.has(enemy.projectile), `${enemy.id} projectile is unknown: ${enemy.projectile}`)
    })
    const roleIds = new Set(enemies.roles.map((enemy) => enemy.id))
    bosses.bosses.flatMap((boss) => boss.phases || []).forEach((phase) => {
      if (phase.summonRole) this.require(roleIds.has(phase.summonRole), `Boss phase summon role is unknown: ${phase.summonRole}`)
    })

    levels.forEach((level) => {
      const stage = data.stages[level.id]
      this.require(Boolean(stage), `${level.id} world-system stage definition is required`)
      stage.hazards.forEach((hazard) => {
        this.require(Boolean(hazard.id), `${level.id} hazard id is required`)
        this.require(hazard.x >= 0 && hazard.x <= level.worldWidth, `${hazard.id} hazard x must fit level`)
        this.require(hazard.lane >= 0.45 && hazard.lane <= 0.95, `${hazard.id} hazard lane must be playable/reasonable`)
        this.require(hazard.width > 0 && hazard.height > 0, `${hazard.id} hazard dimensions must be positive`)
        this.require(hazard.cycleMs > hazard.telegraphMs + hazard.activeMs, `${hazard.id} hazard cycle must leave idle time`)
        this.require(hazard.telegraphMs > 0 && hazard.activeMs > 0, `${hazard.id} hazard timing must be positive`)
        this.require(hazard.damage > 0, `${hazard.id} hazard damage must be positive`)
        this.require(/^#[0-9a-fA-F]{6}$/.test(hazard.color), `${hazard.id} hazard color must be #RRGGBB`)
      })
      const hazardIds = new Set(stage.hazards.map((hazard) => hazard.id))
      const levelBoss = bosses.bosses.find((boss) => boss.id === level.boss.id)
      ;(levelBoss?.phases || []).forEach((phase) => {
        if (phase.stageHazard) this.require(hazardIds.has(phase.stageHazard), `${level.id} boss phase hazard is unknown: ${phase.stageHazard}`)
      })
      stage.props.forEach((prop) => {
        this.require(Boolean(prop.id), `${level.id} prop id is required`)
        this.require(prop.x >= 0 && prop.x <= level.worldWidth, `${prop.id} prop x must fit level`)
        this.require(prop.width > 0 && prop.height > 0, `${prop.id} prop dimensions must be positive`)
        this.require(prop.hp > 0, `${prop.id} prop hp must be positive`)
        this.require(prop.score >= 0, `${prop.id} prop score must be non-negative`)
      })
      stage.npcs.forEach((npc) => {
        this.require(Boolean(npc.id), `${level.id} npc id is required`)
        this.require(Boolean(npc.purpose), `${npc.id} npc purpose is required`)
        this.require(npc.path.length >= 2, `${npc.id} moving npc needs at least two path points`)
        this.require(npc.speed > 0, `${npc.id} npc speed must be positive`)
        npc.path.forEach((point, index) => {
          this.require(point.x >= 0 && point.x <= level.worldWidth, `${npc.id} npc path ${index} x must fit level`)
          this.require(point.lane >= 0.35 && point.lane <= 0.95, `${npc.id} npc path ${index} lane must be reasonable`)
        })
      })
    })
  }

  static validateMap(map: TiledMapData) {
    this.require(map.width > 0 && map.height > 0, 'Map width/height must be positive')
    this.require(map.tilewidth > 0 && map.tileheight > 0, 'Map tile dimensions must be positive')
    this.require(Array.isArray(map.tilesets) && map.tilesets.length > 0, 'Map needs at least one tileset')
    map.tilesets?.forEach((tileset) => {
      this.require(Boolean(tileset.name), 'Tileset name is required')
      this.require(tileset.tilewidth === map.tilewidth && tileset.tileheight === map.tileheight, `${tileset.name} tile size must match the map`)
      this.require(Boolean(tileset.image), `${tileset.name} image is required`)
      this.require(tileset.tilecount > 0 && tileset.columns > 0, `${tileset.name} tilecount/columns must be positive`)
    })
    const layerNames = new Set(map.layers.map((layer) => layer.name))
    requiredMapLayers.forEach((name) => this.require(layerNames.has(name), `Map layer is required: ${name}`))
    map.layers.forEach((layer) => {
      if (layer.type !== 'imagelayer' || layer.visible === false) return
      const mode = this.layerString(layer, 'mode')
      this.require(Boolean(mode), `${layer.name} image layer needs explicit mode`)
      this.require(allowedImageLayerModes.includes(mode), `${layer.name} image layer mode is invalid: ${mode}`)
    })
    this.require(this.hasScenePlate(map), 'Map needs at least one visible scenePlate image layer for production-quality art')
    requiredTileLayers.forEach((name) => {
      const layer = map.layers.find((item) => item.name === name)
      this.require(layer?.type === 'tilelayer', `Map layer must be a tilelayer: ${name}`)
      if (layer?.type !== 'tilelayer') return
      this.require(layer.width === map.width && layer.height === map.height, `${name} dimensions must match the map`)
      this.require(layer.data.length === map.width * map.height, `${name} data length must match map dimensions`)
      this.require(layer.data.some((tile) => tile > 0), `${name} needs at least one visible tile`)
    })
    this.require(this.hasObject(map, 'PlayerSpawn', 'player_spawn'), 'Map needs a player_spawn object')
    this.require(this.hasObject(map, 'EnemySpawns', 'enemy_spawn'), 'Map needs at least one enemy_spawn object')
    this.require(this.hasObject(map, 'BossSpawn', 'boss_spawn'), 'Map needs a boss_spawn object')
    this.require(this.hasNamedObject(map, 'Triggers', 'boss-trigger'), 'Map needs boss-trigger')
    this.require(this.hasNamedObject(map, 'Triggers', 'stage-clear'), 'Map needs stage-clear')
  }

  private static hasObject(map: TiledMapData, layerName: string, type: string) {
    const layer = map.layers.find((item) => item.name === layerName && item.type === 'objectgroup')
    return layer?.type === 'objectgroup' && layer.objects.some((object) => object.type === type)
  }

  private static hasNamedObject(map: TiledMapData, layerName: string, name: string) {
    const layer = map.layers.find((item) => item.name === layerName && item.type === 'objectgroup')
    return layer?.type === 'objectgroup' && layer.objects.some((object) => object.name === name)
  }

  private static hasScenePlate(map: TiledMapData) {
    return map.layers.some((layer) => (
      layer.type === 'imagelayer'
      && layer.visible !== false
      && layer.properties?.some((property) => property.name === 'mode' && property.value === 'scenePlate')
    ))
  }

  private static layerString(layer: { properties?: Array<{ name: string; value: string | number | boolean }> }, name: string) {
    const value = layer.properties?.find((property) => property.name === name)?.value
    return value === undefined ? '' : String(value)
  }

  private static validateAudioCue(label: string, file: string, volume: number) {
    this.require(Boolean(file), `${label} file is required`)
    this.require(file.startsWith('/assets/audio/'), `${label} file must live under /assets/audio/`)
    this.require(volume >= 0 && volume <= 1, `${label} volume must be between 0 and 1`)
  }

  private static validateBehaviorTuning(
    label: string,
    data: {
      preferredAttack?: string
      laneSpeed?: number
      telegraphMs?: number
      attackDurationMs?: number
    },
  ) {
    if (data.preferredAttack !== undefined) {
      this.require(allowedPreferredAttacks.includes(data.preferredAttack), `${label} preferredAttack must be punch or kick`)
    }
    if (data.laneSpeed !== undefined) this.require(data.laneSpeed > 0, `${label} laneSpeed must be positive`)
    if (data.telegraphMs !== undefined) this.require(data.telegraphMs > 0, `${label} telegraphMs must be positive`)
    if (data.attackDurationMs !== undefined) this.require(data.attackDurationMs > 0, `${label} attackDurationMs must be positive`)
  }

  private static require(condition: boolean, message: string) {
    if (!condition) throw new Error(`Invalid Neon Gauntlet data: ${message}`)
  }
}
