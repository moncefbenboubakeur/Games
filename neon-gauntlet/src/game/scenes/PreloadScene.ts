import Phaser from 'phaser'
import { SceneKeys } from '../constants'
import type { AudioData } from '../data/types'
import { DataValidationSystem } from '../systems/DataValidationSystem'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload)
  }

  preload() {
    this.load.image('stage-01-metro-arcade-bg', '/assets/backgrounds/china/stage-01-metro-arcade.png')
    this.load.svg('metro-tiles', '/assets/tilesets/metro-tiles.svg', { width: 128, height: 64 })
    this.load.image('player-sheet', '/assets/sprites/player-sheet.png')
    this.load.image('enemy-sheet', '/assets/sprites/enemy-rival-sheet.png')
    this.load.json('animations', '/data/animations.json')
    this.load.json('combat', '/data/combat.json')
    this.load.json('enemies', '/data/enemies.json')
    this.load.json('bosses', '/data/bosses.json')
    this.load.json('audio', '/data/audio.json')
    this.load.json('stage-01', '/data/levels/stage-01-metro-arcade.json')
    this.load.json('stage-01-map', '/assets/maps/stage-01-metro-arcade.json')
    this.load.tilemapTiledJSON('stage-01-tilemap', '/assets/maps/stage-01-metro-arcade.json')
  }

  create() {
    const audio = this.cache.json.get('audio') as AudioData
    DataValidationSystem.validateAudio(audio)
    Object.entries(audio.music).forEach(([key, cue]) => this.load.audio(`music:${key}`, cue.file))
    Object.entries(audio.sfx).forEach(([key, cue]) => this.load.audio(`sfx:${key}`, cue.file))
    this.load.once(Phaser.Loader.Events.COMPLETE, () => this.scene.start(SceneKeys.Menu))
    this.load.start()
  }
}
