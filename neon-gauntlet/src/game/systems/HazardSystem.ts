import Phaser from 'phaser'
import type { HazardDefinition } from '../data/types'
import type { Player } from '../entities/Player'
import { laneToY } from '../utils/lane'

interface HazardRuntime {
  def: HazardDefinition
  body: Phaser.GameObjects.Rectangle
  warning: Phaser.GameObjects.Rectangle
  nextHitAt: number
}

export class HazardSystem {
  private hazards: HazardRuntime[] = []

  constructor(scene: Phaser.Scene, definitions: HazardDefinition[]) {
    this.hazards = definitions.map((def) => {
      const color = Number.parseInt(def.color.replace('#', ''), 16)
      const y = laneToY(def.lane) - def.height / 2
      const body = scene.add.rectangle(def.x, y, def.width, def.height, color, 0.08)
        .setDepth(Math.round(laneToY(def.lane)) - 2)
      const warning = scene.add.rectangle(def.x, y, def.width + 8, def.height + 5, color, 0)
        .setStrokeStyle(2, color, 0.9)
        .setDepth(Math.round(laneToY(def.lane)) - 1)
      return { def, body, warning, nextHitAt: 0 }
    })
  }

  update(time: number, player: Player) {
    this.hazards.forEach((hazard) => {
      const phase = time % hazard.def.cycleMs
      const activeStart = hazard.def.cycleMs - hazard.def.activeMs
      const telegraphStart = activeStart - hazard.def.telegraphMs
      const telegraphing = phase >= telegraphStart && phase < activeStart
      const active = phase >= activeStart
      hazard.warning.setAlpha(telegraphing ? 0.35 + Math.sin(time / 65) * 0.18 : 0)
      hazard.body.setAlpha(active ? 0.72 : 0.08)
      if (!active || time < hazard.nextHitAt || player.invincibleMs > 0) return
      const inLane = Math.abs(player.lane - hazard.def.lane) <= 0.065
      const inX = Math.abs(player.x - hazard.def.x) <= hazard.def.width / 2 + 12
      if (!inLane || !inX) return
      player.hurt(hazard.def.damage, player.x < hazard.def.x ? -14 : 14)
      hazard.nextHitAt = time + 650
    })
  }

  destroy() {
    this.hazards.forEach((hazard) => {
      hazard.body.destroy()
      hazard.warning.destroy()
    })
    this.hazards = []
  }

  debugSnapshot() {
    return this.hazards.map((hazard) => ({ id: hazard.def.id, type: hazard.def.type, x: hazard.def.x, lane: hazard.def.lane }))
  }
}
