import Phaser from 'phaser'

export class Projectile extends Phaser.GameObjects.Rectangle {
  vx: number
  ttl: number

  constructor(scene: Phaser.Scene, x: number, y: number, vx: number, color = 0x50e7ff) {
    super(scene, x, y, 10, 10, color, 1)
    this.vx = vx
    this.ttl = 1800
    scene.add.existing(this)
  }

  updateProjectile(dt: number) {
    this.x += this.vx * dt / 1000
    this.ttl -= dt
    if (this.ttl <= 0) this.destroy()
  }
}
