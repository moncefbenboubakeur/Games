import Phaser from 'phaser'
import type { ProjectileDefinition } from '../data/types'
import { laneToY } from '../utils/lane'

export class Projectile extends Phaser.GameObjects.Rectangle {
  readonly damage: number
  readonly lane: number
  readonly laneRange: number
  private readonly vx: number
  private ttl: number

  constructor(scene: Phaser.Scene, x: number, lane: number, face: -1 | 1, def: ProjectileDefinition) {
    super(scene, x, laneToY(lane) - 34, def.width, def.height, Number.parseInt(def.color.replace('#', ''), 16), 1)
    this.damage = def.damage
    this.lane = lane
    this.laneRange = def.laneRange
    this.vx = def.speed * face
    this.ttl = def.ttlMs
    this.setDepth(Math.round(laneToY(lane)) + 4)
    this.setStrokeStyle(2, 0xdff6ff, 0.75)
    scene.add.existing(this)
  }

  updateProjectile(dt: number) {
    this.x += this.vx * dt / 1000
    this.ttl -= dt
    if (this.ttl <= 0) this.destroy()
  }
}
