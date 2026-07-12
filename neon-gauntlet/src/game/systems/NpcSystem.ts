import Phaser from 'phaser'
import type { NpcActorDefinition } from '../data/types'
import { laneToY } from '../utils/lane'

interface NpcRuntime {
  def: NpcActorDefinition
  body: Phaser.GameObjects.Container
  targetIndex: number
}

function makeBackgroundActor(scene: Phaser.Scene, def: NpcActorDefinition) {
  return scene.add.container(def.x, laneToY(def.lane) - def.height / 2)
    .setName('background-actor-placeholder-hidden')
    .setVisible(false)
    .setAlpha(0)
}

export class NpcSystem {
  private actors: NpcRuntime[] = []

  constructor(scene: Phaser.Scene, definitions: NpcActorDefinition[]) {
    this.actors = definitions.map((def) => {
      const body = makeBackgroundActor(scene, def)
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
