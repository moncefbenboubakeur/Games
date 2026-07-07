import type { AnimationData, AudioData, BossesData, CombatData, EnemiesData, EnemyRole, LevelData, TiledMapData } from '../data/types'

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
    })
  }

  static validateBossDefinitions(data: BossesData) {
    const ids = new Set<string>()
    data.bosses.forEach((boss) => {
      this.require(!ids.has(boss.id), `Duplicate boss id: ${boss.id}`)
      ids.add(boss.id)
      this.require(Boolean(boss.name), `${boss.id} name is required`)
      this.require(boss.hp > 0, `${boss.id} hp must be positive`)
      this.require(boss.speed > 0, `${boss.id} speed must be positive`)
      this.require(boss.range > 0, `${boss.id} range must be positive`)
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

  private static require(condition: boolean, message: string) {
    if (!condition) throw new Error(`Invalid Neon Gauntlet data: ${message}`)
  }
}
