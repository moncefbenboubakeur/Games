export type ActorKind = 'player' | 'enemy'
export type ActionName = 'idle' | 'walk' | 'punch' | 'kick' | 'guard' | 'hurt' | 'jump' | 'down'
export type EnemyRole = 'striker' | 'runner' | 'bruiser' | 'staffer' | 'swordsman' | 'nunchaku'
export type WeaponId = 'knife' | 'staff' | 'sword' | 'nunchaku'

export interface SpriteFrameData {
  name: string
  x: number
  y: number
  w: number
  h: number
  ax: number
  ay: number
  hurtbox?: {
    x: number
    y: number
    w: number
    h: number
  }
}

export interface AttackHitFrameData {
  frame: number
  forwardOffset: number
  width: number
  targetHalfWidth: number
  laneRange: number
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
    frames?: AttackHitFrameData[]
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
  texture?: string
  textureFile?: string
  sourceFacing?: 'left' | 'right'
  hp: number
  speed: number
  damage: number
  range: number
  cooldownMinMs: number
  cooldownMaxMs: number
  scale: number
  preferredAttack?: 'punch' | 'kick'
  laneSpeed?: number
  telegraphMs?: number
  attackDurationMs?: number
  projectile?: string
  walkFrameMs?: number
  walkFrameOrder?: number[]
  weaponDrop?: WeaponId
  weaponName?: string
  weaponDamageBonus?: number
  weaponRangeBonus?: number
  weaponUses?: number
}

export interface EnemiesData {
  roles: EnemyDefinition[]
}

export interface BossDefinition {
  id: string
  name: string
  texture: string
  textureFile: string
  sourceFacing?: 'left' | 'right'
  hp: number
  speed: number
  damage: number
  range: number
  cooldownMinMs: number
  cooldownMaxMs: number
  stageIntro: string
  preferredAttack?: 'punch' | 'kick'
  laneSpeed?: number
  telegraphMs?: number
  attackDurationMs?: number
  scale?: number
  walkFrameMs?: number
  walkFrameOrder?: number[]
  phases?: BossPhaseDefinition[]
}

export interface BossPhaseDefinition {
  id: string
  hpBelow: number
  message: string
  speedMultiplier: number
  cooldownMultiplier: number
  preferredAttack?: 'punch' | 'kick'
  alternateAttack?: 'punch' | 'kick'
  patternCycleMs?: number
  projectile?: string
  projectileBurst?: number
  summonRole?: EnemyRole
  summonCount?: number
  stageHazard?: string
  auraColor?: string
}

export interface BossesData {
  bosses: BossDefinition[]
}

export interface EnemySpawnData {
  x: number
  lane: number
  role: EnemyRole
}

export interface EncounterWaveData {
  id: string
  triggerX: number
  gateX: number
  spawns: EnemySpawnData[]
}

export interface LevelData {
  id: string
  name: string
  worldWidth: number
  background: string
  music: string
  playerSpawn: { x: number; lane: number }
  enemyWaves: EnemySpawnData[]
  encounterWaves?: EncounterWaveData[]
  boss: { id: string; x: number; lane: number; spawnAfterX: number }
  stageClearX: number
  map: string
}

export interface AudioData {
  music: Record<string, { file: string; volume: number; loop: boolean }>
  sfx: Record<string, { file: string; volume: number }>
}

export interface WorldBehaviorData {
  ai: {
    cancelTelegraphWhenTargetLeavesRange: boolean
    guardOnlyWhenThreatened: boolean
    maxOffLaneAttackDelta: number
    pursuitStopRangeMultiplier: number
  }
  npc: {
    requirePurpose: boolean
    allowRandomGuarding: boolean
    requirePathForMovingActors: boolean
    requireAnimationContactSheet: boolean
  }
}

export interface ProjectileDefinition {
  id: string
  speed: number
  damage: number
  ttlMs: number
  width: number
  height: number
  laneRange: number
  color: string
}

export interface WeaponDefinition {
  id: WeaponId
  name: string
  damageBonus: number
  rangeBonus: number
  uses: number
}

export interface HazardDefinition {
  id: string
  type: 'spark' | 'steam' | 'cart'
  x: number
  lane: number
  width: number
  height: number
  cycleMs: number
  telegraphMs: number
  activeMs: number
  damage: number
  color: string
  forceX?: number
  forceLane?: number
}

export interface PropDefinition {
  id: string
  type: 'cabinet' | 'crate' | 'barrel' | 'stall'
  x: number
  lane: number
  width: number
  height: number
  hp: number
  score: number
  color: string
}

export interface NpcActorDefinition {
  id: string
  purpose: string
  x: number
  lane: number
  width: number
  height: number
  color: string
  speed: number
  path: Array<{ x: number; lane: number }>
}

export interface StageWorldSystemsDefinition {
  hazards: HazardDefinition[]
  props: PropDefinition[]
  npcs: NpcActorDefinition[]
}

export interface WorldSystemsData {
  version: number
  projectiles: Record<string, ProjectileDefinition>
  stages: Record<string, StageWorldSystemsDefinition>
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

export interface TiledTileLayer {
  id: number
  name: string
  type: 'tilelayer'
  visible?: boolean
  opacity?: number
  x?: number
  y?: number
  width: number
  height: number
  data: number[]
  properties?: TiledProperty[]
}

export interface TiledTileset {
  firstgid: number
  name: string
  tilewidth: number
  tileheight: number
  spacing?: number
  margin?: number
  tilecount: number
  columns: number
  image: string
  imagewidth: number
  imageheight: number
}

export type TiledLayer = TiledObjectLayer | TiledImageLayer | TiledTileLayer

export interface TiledMapData {
  properties?: TiledProperty[]
  tilesets?: TiledTileset[]
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
