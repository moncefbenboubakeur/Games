export type ActorKind = 'player' | 'enemy'
export type ActionName = 'idle' | 'walk' | 'punch' | 'kick' | 'guard' | 'hurt' | 'jump' | 'down'
export type EnemyRole = 'striker' | 'runner' | 'bruiser' | 'thrower'

export interface SpriteFrameData {
  name: string
  x: number
  y: number
  w: number
  h: number
  ax: number
  ay: number
}

export interface ActorAnimationData {
  texture: string
  scale: number
  animations: Record<string, SpriteFrameData[]>
}

export interface AnimationData {
  player: ActorAnimationData
  enemy: ActorAnimationData
}

export interface AttackDefinition {
  damage: number
  comboFinisherDamage?: number
  range: number
  laneRange: number
  hitbox?: {
    forwardOffset: number
    width: number
    targetHalfWidth: number
    laneRange: number
    activeFrame: number
  }
  durationMs: number
  activeAfterMs: number
  knockback: number
}

export interface CombatData {
  player: {
    maxHp: number
    speed: number
    laneSpeed: number
    jumpVelocity: number
    gravity: number
    invincibleMs: number
    comboWindowMs: number
  }
  attacks: Record<'punch' | 'kick', AttackDefinition>
  guard: {
    blockRequiresFacingAttack: boolean
  }
  score: {
    enemyHit: number
    bossHit: number
    comboBonusMax: number
  }
}

export interface EnemyDefinition {
  id: EnemyRole
  hp: number
  speed: number
  damage: number
  range: number
  cooldownMinMs: number
  cooldownMaxMs: number
  scale: number
}

export interface EnemiesData {
  roles: EnemyDefinition[]
}

export interface BossDefinition {
  id: string
  name: string
  hp: number
  speed: number
  damage: number
  range: number
  cooldownMinMs: number
  cooldownMaxMs: number
  stageIntro: string
}

export interface BossesData {
  bosses: BossDefinition[]
}

export interface EnemySpawnData {
  x: number
  lane: number
  role: EnemyRole
}

export interface LevelData {
  id: string
  name: string
  worldWidth: number
  background: string
  music: string
  playerSpawn: { x: number; lane: number }
  enemyWaves: EnemySpawnData[]
  boss: { id: string; x: number; lane: number; spawnAfterX: number }
  stageClearX: number
  map: string
}

export interface AudioData {
  music: Record<string, { file: string; volume: number; loop: boolean }>
  sfx: Record<string, { file: string; volume: number }>
}

export interface TiledProperty {
  name: string
  type: string
  value: string | number | boolean
}

export interface TiledObject {
  id: number
  name: string
  type: string
  x: number
  y: number
  width?: number
  height?: number
  visible?: boolean
  properties?: TiledProperty[]
}

export interface TiledObjectLayer {
  id: number
  name: string
  type: 'objectgroup'
  visible?: boolean
  opacity?: number
  properties?: TiledProperty[]
  objects: TiledObject[]
}

export interface TiledImageLayer {
  id: number
  name: string
  type: 'imagelayer'
  image?: string
  offsetx?: number
  offsety?: number
  opacity?: number
  visible?: boolean
  properties?: TiledProperty[]
}

export type TiledLayer = TiledObjectLayer | TiledImageLayer

export interface TiledMapData {
  properties?: TiledProperty[]
  width: number
  height: number
  tilewidth: number
  tileheight: number
  layers: TiledLayer[]
}

export interface NormalizedInput {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  punch: boolean
  kick: boolean
  jump: boolean
  guard: boolean
  pause: boolean
}
