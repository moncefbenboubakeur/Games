import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../constants'
import type { EnemyRole, EnemySpawnData, LevelData, TiledImageLayer, TiledMapData, TiledObject, TiledObjectLayer, TiledProperty, TiledTileLayer } from '../data/types'

type PropertyValue = TiledProperty['value']

export class StageMapSystem {
  readonly worldWidth: number
  readonly worldHeight: number
  private phaserMap?: Phaser.Tilemaps.Tilemap
  private tileLayerCount = 0
  private scenePlateCount = 0
  private visiblePrototypeTileLayerCount = 0

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly map: TiledMapData,
    private readonly fallbackLevel: LevelData,
    private readonly tilemapKey = 'stage-01-tilemap',
  ) {
    this.worldWidth = map.width * map.tilewidth
    this.worldHeight = map.height * map.tileheight
  }

  resolveLevel(): LevelData {
    const playerSpawn = this.playerSpawn()
    const enemyWaves = this.enemySpawns()
    const bossSpawn = this.bossSpawn()
    const bossTrigger = this.triggerX('boss-trigger', this.fallbackLevel.boss.spawnAfterX)
    const stageClearX = this.triggerX('stage-clear', this.fallbackLevel.stageClearX)

    return {
      ...this.fallbackLevel,
      worldWidth: this.worldWidth,
      background: this.mapString('backgroundTexture', this.fallbackLevel.background),
      music: this.mapString('music', this.fallbackLevel.music),
      playerSpawn,
      enemyWaves,
      boss: {
        id: bossSpawn.id,
        x: bossSpawn.x,
        lane: bossSpawn.lane,
        spawnAfterX: bossTrigger,
      },
      stageClearX,
    }
  }

  render() {
    this.tileLayerCount = 0
    this.scenePlateCount = 0
    this.visiblePrototypeTileLayerCount = 0
    this.phaserMap = this.scene.make.tilemap({ key: this.tilemapKey })
    this.map.layers.forEach((layer) => {
      if (layer.visible === false) return
      if (layer.type === 'imagelayer') this.renderImageLayer(layer)
      if (layer.type === 'tilelayer') this.renderTileLayer(layer)
      if (layer.type === 'objectgroup') this.renderObjectLayer(layer)
    })
  }

  renderedTileLayers() {
    return this.tileLayerCount
  }

  renderedScenePlates() {
    return this.scenePlateCount
  }

  visiblePrototypeTileLayers() {
    return this.visiblePrototypeTileLayerCount
  }

  totalTileLayers() {
    return this.map.layers.filter((layer) => layer.type === 'tilelayer').length
  }

  objectLayer(name: string) {
    return this.map.layers.find((layer): layer is TiledObjectLayer => layer.type === 'objectgroup' && layer.name === name)
  }

  private renderImageLayer(layer: TiledImageLayer) {
    const texture = this.layerString(layer, 'texture', this.fallbackLevel.background)
    const mode = this.layerString(layer, 'mode', 'scenePlate')
    const repeatX = this.layerBoolean(layer, 'repeatX', false)
    const depth = this.layerNumber(layer, 'depth', -100)
    const scrollX = this.layerNumber(layer, 'scrollFactorX', 1)
    const scrollY = this.layerNumber(layer, 'scrollFactorY', 1)
    const opacity = this.layerNumber(layer, 'opacity', layer.opacity ?? 1)
    const x = layer.offsetx ?? 0
    const y = layer.offsety ?? 0

    if (mode === 'scenePlate') {
      const image = this.scene.add.image(0, 0, texture).setOrigin(0)
      image.setDisplaySize(this.worldWidth, GAME_HEIGHT)
      image.setScrollFactor(1, 1).setDepth(depth).setAlpha(opacity)
      this.scenePlateCount += 1
      return
    }

    const image = repeatX
      ? this.scene.add.tileSprite(x, y, this.worldWidth, GAME_HEIGHT, texture).setOrigin(0)
      : this.scene.add.image(x, y, texture).setOrigin(0)

    image.setScrollFactor(scrollX, scrollY).setDepth(depth).setAlpha(opacity)
  }

  private renderTileLayer(layer: TiledTileLayer) {
    if (!this.phaserMap) return
    const tilesets = this.map.tilesets
      ?.map((tileset) => this.phaserMap?.addTilesetImage(tileset.name, tileset.name))
      .filter((tileset): tileset is Phaser.Tilemaps.Tileset => Boolean(tileset)) || []
    if (!tilesets.length) return

    const tileLayer = this.phaserMap.createLayer(layer.name, tilesets, layer.x ?? 0, layer.y ?? 0)
    if (!tileLayer) return
    const depth = this.layerNumber(layer, 'depth', -10)
    tileLayer.setDepth(depth)
    tileLayer.setAlpha(this.layerNumber(layer, 'opacity', layer.opacity ?? 1))
    tileLayer.setScrollFactor(1, 1)
    this.tileLayerCount += 1
    if (this.layerBoolean(layer, 'prototype', false)) this.visiblePrototypeTileLayerCount += 1
  }

  private renderObjectLayer(layer: TiledObjectLayer) {
    layer.objects.forEach((object) => {
      if (object.visible === false || object.type !== 'visual_rect') return
      const width = object.width || 0
      const height = object.height || 0
      if (width <= 0 || height <= 0) return
      const color = this.color(this.objectString(object, 'fill', '#ffffff'))
      const alpha = this.objectNumber(object, 'alpha', layer.opacity ?? 1)
      const depth = this.objectNumber(object, 'depth', this.layerNumber(layer, 'depth', -5))
      this.scene.add.rectangle(object.x + width / 2, object.y + height / 2, width, height, color, alpha).setDepth(depth)
    })
  }

  private playerSpawn() {
    const object = this.findObject(['PlayerSpawn', 'spawns'], (item) => item.type === 'player_spawn' || item.name === 'player')
    return {
      x: object?.x ?? this.fallbackLevel.playerSpawn.x,
      lane: object ? this.objectNumber(object, 'lane', this.fallbackLevel.playerSpawn.lane) : this.fallbackLevel.playerSpawn.lane,
    }
  }

  private enemySpawns(): EnemySpawnData[] {
    const objects = this.findObjects(['EnemySpawns', 'spawns'], (item) => item.type === 'enemy_spawn')
    if (!objects.length) return this.fallbackLevel.enemyWaves
    return objects.map((object) => ({
      x: object.x,
      lane: this.objectNumber(object, 'lane', 0.72),
      role: this.objectString(object, 'role', object.name) as EnemyRole,
    }))
  }

  private bossSpawn() {
    const object = this.findObject(['BossSpawn', 'spawns'], (item) => item.type === 'boss_spawn')
    return {
      id: object ? this.objectString(object, 'boss', object.name) : this.fallbackLevel.boss.id,
      x: object?.x ?? this.fallbackLevel.boss.x,
      lane: object ? this.objectNumber(object, 'lane', this.fallbackLevel.boss.lane) : this.fallbackLevel.boss.lane,
    }
  }

  private triggerX(name: string, fallback: number) {
    const object = this.findObject(['Triggers', 'triggers'], (item) => item.name === name)
    return object?.x ?? fallback
  }

  private findObject(layerNames: string[], predicate: (object: TiledObject) => boolean) {
    return this.findObjects(layerNames, predicate)[0]
  }

  private findObjects(layerNames: string[], predicate: (object: TiledObject) => boolean) {
    return layerNames
      .flatMap((name) => this.objectLayer(name)?.objects || [])
      .filter(predicate)
  }

  private mapString(name: string, fallback: string) {
    return String(this.property(this.map.properties, name, fallback))
  }

  private layerString(layer: TiledImageLayer | TiledObjectLayer | TiledTileLayer, name: string, fallback: string) {
    return String(this.property(layer.properties, name, fallback))
  }

  private layerNumber(layer: TiledImageLayer | TiledObjectLayer | TiledTileLayer, name: string, fallback: number) {
    return Number(this.property(layer.properties, name, fallback))
  }

  private layerBoolean(layer: TiledImageLayer | TiledObjectLayer | TiledTileLayer, name: string, fallback: boolean) {
    return Boolean(this.property(layer.properties, name, fallback))
  }

  private objectString(object: TiledObject, name: string, fallback: string) {
    return String(this.property(object.properties, name, fallback))
  }

  private objectNumber(object: TiledObject, name: string, fallback: number) {
    return Number(this.property(object.properties, name, fallback))
  }

  private property(properties: TiledProperty[] | undefined, name: string, fallback: PropertyValue) {
    return properties?.find((property) => property.name === name)?.value ?? fallback
  }

  private color(value: string) {
    return Number.parseInt(value.replace('#', ''), 16)
  }
}
