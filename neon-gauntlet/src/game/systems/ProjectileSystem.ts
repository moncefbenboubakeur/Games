import Phaser from 'phaser'
import type { ProjectileDefinition } from '../data/types'
import { Projectile } from '../entities/Projectile'
import type { Player } from '../entities/Player'

export class ProjectileSystem {
  private projectiles: Projectile[] = []

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly definitions: Record<string, ProjectileDefinition>,
  ) {}

  spawn(projectileId: string, x: number, lane: number, face: -1 | 1) {
    const def = this.definitions[projectileId]
    if (!def) return
    this.projectiles.push(new Projectile(this.scene, x + face * 22, lane, face, def))
  }

  update(dt: number, player: Player, worldWidth: number) {
    this.projectiles = this.projectiles.filter((projectile) => projectile.active)
    this.projectiles.forEach((projectile) => {
      projectile.updateProjectile(dt)
      if (projectile.x < -24 || projectile.x > worldWidth + 24) projectile.destroy()
      if (!projectile.active || player.invincibleMs > 0 || player.hp <= 0) return
      const inLane = Math.abs(projectile.lane - player.lane) <= projectile.laneRange
      const inBody = Math.abs(projectile.x - player.x) <= 18
      if (!inLane || !inBody) return
      player.hurt(projectile.damage, projectile.x < player.x ? 18 : -18)
      projectile.destroy()
    })
  }

  destroy() {
    this.projectiles.forEach((projectile) => projectile.destroy())
    this.projectiles = []
  }

  debugSnapshot() {
    return {
      count: this.projectiles.filter((projectile) => projectile.active).length,
    }
  }
}
