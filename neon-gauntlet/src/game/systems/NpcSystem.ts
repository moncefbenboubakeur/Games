import Phaser from 'phaser'
import type { NpcActorDefinition } from '../data/types'
import { laneToY } from '../utils/lane'

interface NpcRuntime {
  def: NpcActorDefinition
  body: Phaser.GameObjects.Rectangle
  targetIndex: number
}

export class NpcSystem {
  private actors: NpcRuntime[] = []

  constructor(scene: Phaser.Scene, definitions: NpcActorDefinition[]) {
    this.actors = definitions.map((def) => {
      const color = Number.parseInt(def.color.replace('#', ''), 16)
      const body = scene.add.rectangle(def.x, laneToY(def.lane) - def.height / 2, def.width, def.height, color, 0.42)
        .setDepth(Math.round(laneToY(def.lane)) - 80)
      return { def, body, targetIndex: 1 }
    })
  }

  update(dt: number) {
    this.actors.forEach((actor) => {
      if (actor.def.path.length < 2) return
      const target = actor.def.path[actor.targetIndex]
      const dx = target.x - actor.body.x
      const targetY = laneToY(target.lane) - actor.def.height / 2
      const dy = targetY - actor.body.y
      const distance = Math.hypot(dx, dy)
      if (distance < 2) {
        actor.targetIndex = (actor.targetIndex + 1) % actor.def.path.length
        return
      }
      const step = actor.def.speed * dt / 1000
      actor.body.x += dx / distance * step
      actor.body.y += dy / distance * step
      actor.body.setAlpha(0.34 + Math.sin(actor.body.scene.time.now / 260) * 0.08)
    })
  }

  destroy() {
    this.actors.forEach((actor) => actor.body.destroy())
    this.actors = []
  }

  debugSnapshot() {
    return this.actors.map((actor) => ({ id: actor.def.id, purpose: actor.def.purpose, x: actor.body.x }))
  }
}
