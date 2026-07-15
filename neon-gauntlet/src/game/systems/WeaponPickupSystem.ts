import Phaser from 'phaser'
import type { Player } from '../entities/Player'
import type { WeaponDefinition, WeaponId } from '../data/types'
import { laneToY } from '../utils/lane'

interface WeaponDrop {
  id: string
  weapon: WeaponDefinition
  x: number
  lane: number
  expiresAt: number
  view: Phaser.GameObjects.Container
}

const weaponColors: Record<WeaponId, { main: number; edge: number }> = {
  knife: { main: 0xdff6ff, edge: 0x3a6f88 },
  staff: { main: 0xb57a3a, edge: 0x5b3217 },
  sword: { main: 0xe8f5ff, edge: 0x46637a },
  nunchaku: { main: 0xd9a441, edge: 0x5c3610 },
}

export class WeaponPickupSystem {
  private static readonly lifetimeMs = 5000
  private static readonly pickupX = 24
  private static readonly pickupLane = 0.055
  private drops: WeaponDrop[] = []
  private nextId = 1

  constructor(private readonly scene: Phaser.Scene) {}

  spawn(weapon: WeaponDefinition, x: number, lane: number) {
    const id = `weapon-${this.nextId++}`
    const view = this.createWeaponView(weapon.id, x, lane)
    this.drops.push({
      id,
      weapon: { ...weapon },
      x,
      lane,
      expiresAt: this.scene.time.now + WeaponPickupSystem.lifetimeMs,
      view,
    })
  }

  update(player: Player) {
    const now = this.scene.time.now
    const remaining: WeaponDrop[] = []
    for (const drop of this.drops) {
      if (now >= drop.expiresAt) {
        drop.view.destroy()
        continue
      }

      const bob = Math.sin(now / 120) * 1.5
      drop.view.setPosition(drop.x, laneToY(drop.lane) - 10 + bob)
      drop.view.setDepth(Math.round(laneToY(drop.lane)) + 1)
      drop.view.setAlpha(0.65 + Math.sin(now / 90) * 0.2)

      if (Math.abs(player.x - drop.x) <= WeaponPickupSystem.pickupX && Math.abs(player.lane - drop.lane) <= WeaponPickupSystem.pickupLane) {
        player.equipWeapon(drop.weapon)
        drop.view.destroy()
        continue
      }
      remaining.push(drop)
    }
    this.drops = remaining
  }

  destroy() {
    this.drops.forEach((drop) => drop.view.destroy())
    this.drops = []
  }

  debugSnapshot() {
    return {
      count: this.drops.length,
      items: this.drops.map((drop) => ({
        id: drop.id,
        weaponId: drop.weapon.id,
        x: drop.x,
        lane: drop.lane,
      })),
    }
  }

  private createWeaponView(weaponId: WeaponId, x: number, lane: number) {
    const view = this.scene.add.container(x, laneToY(lane) - 10).setName(`weapon-drop-${weaponId}`)
    const glow = this.scene.add.ellipse(0, 5, 28, 9, 0xffd166, 0.16).setBlendMode(Phaser.BlendModes.ADD)
    const graphics = this.scene.add.graphics()
    const colors = weaponColors[weaponId]
    graphics.lineStyle(3, colors.edge, 1)

    if (weaponId === 'knife') {
      graphics.strokeLineShape(new Phaser.Geom.Line(-8, 2, 9, -6))
      graphics.lineStyle(2, colors.main, 1).strokeLineShape(new Phaser.Geom.Line(-5, 1, 11, -7))
      graphics.fillStyle(0x2a1a12, 1).fillRect(-12, 1, 6, 4)
    } else if (weaponId === 'staff') {
      graphics.strokeLineShape(new Phaser.Geom.Line(-16, 4, 16, -7))
      graphics.lineStyle(1, colors.main, 1).strokeLineShape(new Phaser.Geom.Line(-15, 3, 15, -8))
    } else if (weaponId === 'sword') {
      graphics.strokeLineShape(new Phaser.Geom.Line(-15, 5, 14, -9))
      graphics.lineStyle(2, colors.main, 1).strokeLineShape(new Phaser.Geom.Line(-12, 3, 16, -11))
      graphics.lineStyle(3, 0x5a3018, 1).strokeLineShape(new Phaser.Geom.Line(-18, 8, -12, 4))
    } else {
      graphics.lineStyle(3, colors.edge, 1).strokeLineShape(new Phaser.Geom.Line(-13, 0, -3, -5))
      graphics.strokeLineShape(new Phaser.Geom.Line(4, -2, 14, -7))
      graphics.lineStyle(1, colors.main, 1).strokeLineShape(new Phaser.Geom.Line(-3, -5, 4, -2))
    }

    view.add([glow, graphics])
    return view
  }
}
