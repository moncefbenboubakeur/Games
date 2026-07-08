import { describe, expect, it } from 'vitest'
import { DataValidationSystem } from '../../src/game/systems/DataValidationSystem'
import type { AnimationData, AudioData, BossesData, CombatData, EnemiesData, LevelData, TiledMapData, WorldBehaviorData, WorldSystemsData } from '../../src/game/data/types'

const combat = (): CombatData => ({
  player: {
    maxHp: 150,
    speed: 96,
    laneSpeed: 0.34,
    jumpVelocity: 185,
    gravity: 520,
    invincibleMs: 470,
    comboWindowMs: 760,
  },
  attacks: {
    punch: {
      damage: 16,
      range: 42,
      laneRange: 0.095,
      hitbox: {
        forwardOffset: 10,
        width: 38,
        targetHalfWidth: 14,
        laneRange: 0.095,
        activeFrame: 1,
        frames: [
          { frame: 0, forwardOffset: 8, width: 22, targetHalfWidth: 14, laneRange: 0.08 },
          { frame: 1, forwardOffset: 10, width: 38, targetHalfWidth: 14, laneRange: 0.095 },
        ],
      },
      durationMs: 230,
      activeAfterMs: 40,
      knockback: 18,
    },
    kick: {
      damage: 25,
      range: 58,
      laneRange: 0.095,
      hitbox: {
        forwardOffset: 16,
        width: 54,
        targetHalfWidth: 14,
        laneRange: 0.095,
        activeFrame: 2,
        frames: [
          { frame: 0, forwardOffset: 12, width: 30, targetHalfWidth: 14, laneRange: 0.08 },
          { frame: 2, forwardOffset: 22, width: 66, targetHalfWidth: 14, laneRange: 0.1 },
        ],
      },
      durationMs: 330,
      activeAfterMs: 55,
      knockback: 30,
    },
  },
  guard: { blockRequiresFacingAttack: true },
  score: { enemyHit: 10, bossHit: 35, comboBonusMax: 30 },
})

const enemies = (): EnemiesData => ({
  roles: [{ id: 'striker', hp: 48, speed: 54, damage: 9, range: 34, cooldownMinMs: 820, cooldownMaxMs: 1380, scale: 1 }],
})

const bosses = (): BossesData => ({
  bosses: [
    {
      id: 'switchblade-sora',
      name: 'Switchblade Sora',
      texture: 'switchblade-sora-sheet',
      textureFile: '/assets/sprites/bosses/switchblade-sora-sheet.png',
      hp: 170,
      speed: 42,
      damage: 18,
      range: 62,
      cooldownMinMs: 720,
      cooldownMaxMs: 1180,
      stageIntro: 'BOSS',
      preferredAttack: 'punch',
      laneSpeed: 0.2,
      telegraphMs: 250,
      attackDurationMs: 280,
      scale: 1.2,
    },
  ],
})

const audio = (): AudioData => ({
  music: { 'stage-01': { file: '/assets/audio/music/stage-01-loop.wav', volume: 0.26, loop: true } },
  sfx: {
    punch: { file: '/assets/audio/sfx/punch.wav', volume: 0.55 },
    kick: { file: '/assets/audio/sfx/kick.wav', volume: 0.58 },
    hit: { file: '/assets/audio/sfx/hit.wav', volume: 0.5 },
    jump: { file: '/assets/audio/sfx/jump.wav', volume: 0.42 },
    hurt: { file: '/assets/audio/sfx/hurt.wav', volume: 0.48 },
    guard: { file: '/assets/audio/sfx/guard.wav', volume: 0.4 },
    stageClear: { file: '/assets/audio/sfx/stage-clear.wav', volume: 0.62 },
  },
})

const level = (): LevelData => ({
  id: 'stage-01',
  name: 'Metro Arcade',
  worldWidth: 1400,
  background: 'stage-01-bg',
  music: 'stage-01',
  playerSpawn: { x: 76, lane: 0.72 },
  enemyWaves: [{ x: 330, lane: 0.7, role: 'striker' }],
  boss: { id: 'switchblade-sora', x: 1120, lane: 0.72, spawnAfterX: 850 },
  stageClearX: 1320,
  map: 'stage-01-map',
})

const animations = (): AnimationData => {
  const frame = { name: 'frame-0', x: 0, y: 0, w: 10, h: 10, ax: 5, ay: 10, hurtbox: { x: 2, y: 1, w: 6, h: 8 } }
  const actions = { idle: [frame], walk: [frame], punch: [frame], kick: [frame], guard: [frame], hurt: [frame], jump: [frame], down: [frame] }
  return {
    player: { texture: 'player-sheet', scale: 0.38, animations: actions },
    enemy: { texture: 'enemy-sheet', scale: 0.38, animations: actions },
  }
}

const map = (): TiledMapData => ({
  tilesets: [
    {
      firstgid: 1,
      name: 'metro-tiles',
      tilewidth: 16,
      tileheight: 16,
      tilecount: 32,
      columns: 8,
      image: '../tilesets/metro-tiles.svg',
      imagewidth: 128,
      imageheight: 64,
    },
  ],
  width: 88,
  height: 15,
  tilewidth: 16,
  tileheight: 16,
  layers: [
    { id: 1, name: 'BackgroundFar', type: 'imagelayer', visible: true, properties: [{ name: 'mode', type: 'string', value: 'scenePlate' }] },
    { id: 2, name: 'BackgroundMid', type: 'tilelayer', visible: false, width: 88, height: 15, data: Array(88 * 15).fill(1), properties: [{ name: 'prototype', type: 'bool', value: true }] },
    { id: 3, name: 'Decor', type: 'tilelayer', visible: false, width: 88, height: 15, data: Array(88 * 15).fill(2), properties: [{ name: 'prototype', type: 'bool', value: true }] },
    { id: 4, name: 'Ground', type: 'tilelayer', visible: false, width: 88, height: 15, data: Array(88 * 15).fill(9), properties: [{ name: 'prototype', type: 'bool', value: true }] },
    { id: 5, name: 'Foreground', type: 'tilelayer', visible: false, width: 88, height: 15, data: Array(88 * 15).fill(21), properties: [{ name: 'prototype', type: 'bool', value: true }] },
    { id: 6, name: 'Collision', type: 'objectgroup', objects: [] },
    { id: 7, name: 'PlayerSpawn', type: 'objectgroup', objects: [{ id: 1, name: 'player', type: 'player_spawn', x: 76, y: 173 }] },
    { id: 8, name: 'EnemySpawns', type: 'objectgroup', objects: [{ id: 2, name: 'striker', type: 'enemy_spawn', x: 330, y: 168 }] },
    { id: 9, name: 'BossSpawn', type: 'objectgroup', objects: [{ id: 3, name: 'switchblade-sora', type: 'boss_spawn', x: 1120, y: 173 }] },
    {
      id: 10,
      name: 'Triggers',
      type: 'objectgroup',
      objects: [
        { id: 4, name: 'boss-trigger', type: 'boss_trigger', x: 850, y: 0 },
        { id: 5, name: 'stage-clear', type: 'stage_clear', x: 1320, y: 0 },
      ],
    },
    { id: 11, name: 'CameraZones', type: 'objectgroup', objects: [] },
    { id: 12, name: 'Props', type: 'objectgroup', objects: [] },
    { id: 13, name: 'NPCs', type: 'objectgroup', objects: [] },
  ],
})

const worldBehavior = (): WorldBehaviorData => ({
  ai: {
    cancelTelegraphWhenTargetLeavesRange: true,
    guardOnlyWhenThreatened: true,
    maxOffLaneAttackDelta: 0.095,
    pursuitStopRangeMultiplier: 0.82,
  },
  npc: {
    requirePurpose: true,
    allowRandomGuarding: false,
    requirePathForMovingActors: true,
    requireAnimationContactSheet: true,
  },
})

const worldSystems = (): WorldSystemsData => ({
  version: 1,
  projectiles: {
    'spark-bolt': {
      id: 'spark-bolt',
      speed: 120,
      damage: 8,
      ttlMs: 1200,
      width: 10,
      height: 6,
      laneRange: 0.07,
      color: '#50e7ff',
    },
  },
  stages: {
    'stage-01': {
      hazards: [
        {
          id: 'test-spark',
          type: 'spark',
          x: 300,
          lane: 0.72,
          width: 34,
          height: 8,
          cycleMs: 2600,
          telegraphMs: 700,
          activeMs: 400,
          damage: 7,
          color: '#50e7ff',
        },
      ],
      props: [
        { id: 'test-crate', type: 'crate', x: 220, lane: 0.8, width: 20, height: 20, hp: 20, score: 20, color: '#ffd166' },
      ],
      npcs: [
        {
          id: 'test-npc',
          purpose: 'background test actor',
          x: 100,
          lane: 0.45,
          width: 8,
          height: 20,
          color: '#dff6ff',
          speed: 8,
          path: [
            { x: 100, lane: 0.45 },
            { x: 160, lane: 0.45 },
          ],
        },
      ],
    },
  },
})

describe('DataValidationSystem', () => {
  it('accepts a complete game data bundle', () => {
    expect(() =>
      DataValidationSystem.validateAll({
        animations: animations(),
        combat: combat(),
        enemies: enemies(),
        bosses: bosses(),
        audio: audio(),
        level: level(),
        map: map(),
      }),
    ).not.toThrow()
  })

  it('rejects attacks without hitbox metadata', () => {
    const badCombat = combat()
    badCombat.attacks.punch.hitbox = undefined
    expect(() => DataValidationSystem.validateCombat(badCombat)).toThrow(/punch hitbox metadata/)
  })

  it('rejects attacks without per-frame hitbox metadata', () => {
    const badCombat = combat()
    badCombat.attacks.punch.hitbox!.frames = []
    expect(() => DataValidationSystem.validateCombat(badCombat)).toThrow(/per-frame/)
  })

  it('rejects animation frames without valid hurtboxes', () => {
    const badAnimations = animations()
    badAnimations.player.animations.idle[0].hurtbox = undefined
    expect(() => DataValidationSystem.validateAnimations(badAnimations)).toThrow(/hurtbox/)
  })

  it('rejects maps without required gameplay layers', () => {
    const badMap = map()
    badMap.layers = badMap.layers.filter((layer) => layer.name !== 'EnemySpawns')
    expect(() => DataValidationSystem.validateMap(badMap)).toThrow(/EnemySpawns/)
  })

  it('rejects maps without real tile layers and tilesets', () => {
    const noTileset = map()
    noTileset.tilesets = []
    expect(() => DataValidationSystem.validateMap(noTileset)).toThrow(/tileset/)

    const badGround = map()
    badGround.layers = badGround.layers.map((layer) => (layer.name === 'Ground' ? { id: layer.id, name: 'Ground', type: 'objectgroup', objects: [] } : layer))
    expect(() => DataValidationSystem.validateMap(badGround)).toThrow(/tilelayer: Ground/)
  })

  it('rejects production maps without a visible scene plate', () => {
    const badMap = map()
    badMap.layers = badMap.layers.map((layer) => (layer.name === 'BackgroundFar' ? { ...layer, visible: false } : layer))
    expect(() => DataValidationSystem.validateMap(badMap)).toThrow(/scenePlate/)
  })

  it('rejects visible image layers without explicit valid modes', () => {
    const missingMode = map()
    missingMode.layers = missingMode.layers.map((layer) => (layer.name === 'BackgroundFar' ? { id: 1, name: 'BackgroundFar', type: 'imagelayer', visible: true } : layer))
    expect(() => DataValidationSystem.validateMap(missingMode)).toThrow(/explicit mode/)

    const badMode = map()
    badMode.layers = badMode.layers.map((layer) => (
      layer.name === 'BackgroundFar'
        ? { id: 1, name: 'BackgroundFar', type: 'imagelayer', visible: true, properties: [{ name: 'mode', type: 'string', value: 'stretchyMess' }] }
        : layer
    ))
    expect(() => DataValidationSystem.validateMap(badMode)).toThrow(/invalid/)
  })

  it('rejects unknown enemy roles in level spawns', () => {
    const badLevel = level()
    badLevel.enemyWaves = [{ x: 300, lane: 0.72, role: 'runner' }]
    expect(() => DataValidationSystem.validateLevel(badLevel, enemies(), bosses())).toThrow(/unknown role/)
  })

  it('rejects invalid boss behavior tuning', () => {
    const badAttack = bosses()
    badAttack.bosses[0].preferredAttack = 'guard' as 'punch'
    expect(() => DataValidationSystem.validateBossDefinitions(badAttack)).toThrow(/preferredAttack/)

    const badTextureFile = bosses()
    badTextureFile.bosses[0].textureFile = '/assets/sprites/enemy-rival-sheet.png'
    expect(() => DataValidationSystem.validateBossDefinitions(badTextureFile)).toThrow(/textureFile/)

    const badLaneSpeed = bosses()
    badLaneSpeed.bosses[0].laneSpeed = 0
    expect(() => DataValidationSystem.validateBossDefinitions(badLaneSpeed)).toThrow(/laneSpeed/)
  })

  it('rejects invalid world behavior rules', () => {
    expect(() => DataValidationSystem.validateWorldBehavior(worldBehavior())).not.toThrow()

    const badBehavior = worldBehavior()
    badBehavior.npc.allowRandomGuarding = true
    expect(() => DataValidationSystem.validateWorldBehavior(badBehavior)).toThrow(/randomly guard/)
  })

  it('validates world systems and rejects untelegraphed hazards', () => {
    expect(() => DataValidationSystem.validateWorldSystems(worldSystems(), [level()], bosses(), enemies())).not.toThrow()

    const badSystems = worldSystems()
    badSystems.stages['stage-01'].hazards[0].cycleMs = 900
    expect(() => DataValidationSystem.validateWorldSystems(badSystems, [level()], bosses(), enemies())).toThrow(/cycle/)
  })

  it('rejects unknown projectile references from enemies and boss phases', () => {
    const enemyProjectile = enemies()
    enemyProjectile.roles[0].projectile = 'missing'
    expect(() => DataValidationSystem.validateWorldSystems(worldSystems(), [level()], bosses(), enemyProjectile)).toThrow(/projectile/)

    const bossProjectile = bosses()
    bossProjectile.bosses[0].phases = [{ id: 'phase', hpBelow: 0.5, message: 'phase', speedMultiplier: 1, cooldownMultiplier: 1, projectile: 'missing' }]
    expect(() => DataValidationSystem.validateWorldSystems(worldSystems(), [level()], bossProjectile, enemies())).toThrow(/projectile/)
  })

  it('rejects missing level music cues and invalid audio paths', () => {
    const badAudio = audio()
    badAudio.music = {}
    expect(() => DataValidationSystem.validateAudio(badAudio, level())).toThrow(/music cue/)

    const badPath = audio()
    badPath.sfx.punch.file = '/tmp/punch.wav'
    expect(() => DataValidationSystem.validateAudio(badPath)).toThrow(/assets\/audio/)
  })
})
