import { describe, expect, it } from 'vitest'
import { DataValidationSystem } from '../../src/game/systems/DataValidationSystem'
import type { AnimationData, AudioData, BossesData, CombatData, EnemiesData, LevelData, TiledMapData } from '../../src/game/data/types'

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
      hitbox: { forwardOffset: 10, width: 38, targetHalfWidth: 14, laneRange: 0.095, activeFrame: 1 },
      durationMs: 230,
      activeAfterMs: 40,
      knockback: 18,
    },
    kick: {
      damage: 25,
      range: 58,
      laneRange: 0.095,
      hitbox: { forwardOffset: 16, width: 54, targetHalfWidth: 14, laneRange: 0.095, activeFrame: 2 },
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
  bosses: [{ id: 'switchblade-sora', name: 'Switchblade Sora', hp: 170, speed: 42, damage: 18, range: 62, cooldownMinMs: 720, cooldownMaxMs: 1180, stageIntro: 'BOSS' }],
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
  const frame = { name: 'frame-0', x: 0, y: 0, w: 10, h: 10, ax: 5, ay: 10 }
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
    { id: 1, name: 'BackgroundFar', type: 'imagelayer' },
    { id: 2, name: 'BackgroundMid', type: 'tilelayer', width: 88, height: 15, data: Array(88 * 15).fill(1) },
    { id: 3, name: 'Decor', type: 'tilelayer', width: 88, height: 15, data: Array(88 * 15).fill(2) },
    { id: 4, name: 'Ground', type: 'tilelayer', width: 88, height: 15, data: Array(88 * 15).fill(9) },
    { id: 5, name: 'Foreground', type: 'tilelayer', width: 88, height: 15, data: Array(88 * 15).fill(21) },
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

  it('rejects unknown enemy roles in level spawns', () => {
    const badLevel = level()
    badLevel.enemyWaves = [{ x: 300, lane: 0.72, role: 'runner' }]
    expect(() => DataValidationSystem.validateLevel(badLevel, enemies(), bosses())).toThrow(/unknown role/)
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
