import Phaser from 'phaser'
import type { NpcActorDefinition } from '../data/types'
import { laneToY } from '../utils/lane'

interface NpcRuntime {
  def: NpcActorDefinition
  body: Phaser.GameObjects.Container
  targetIndex: number
}

function addPixel(container: Phaser.GameObjects.Container, scene: Phaser.Scene, x: number, y: number, w: number, h: number, color: number, alpha = 1) {
  container.add(scene.add.rectangle(x, y, w, h, color, alpha).setOrigin(0.5))
}

function makeBackgroundActor(scene: Phaser.Scene, def: NpcActorDefinition, color: number) {
  const body = scene.add.container(def.x, laneToY(def.lane) - def.height / 2)
  const dark = 0x050711
  const purpose = `${def.id} ${def.purpose}`.toLowerCase()

  if (purpose.includes('drone')) {
    body.add(scene.add.ellipse(0, 0, def.width, def.height * 0.58, color, 0.42))
    addPixel(body, scene, -def.width * 0.62, 0, def.width * 0.55, 2, color, 0.55)
    addPixel(body, scene, def.width * 0.62, 0, def.width * 0.55, 2, color, 0.55)
    addPixel(body, scene, 0, 0, 3, 3, 0xdff6ff, 0.65)
  } else if (purpose.includes('light') || purpose.includes('indicator')) {
    body.add(scene.add.ellipse(0, 0, def.width, def.height * 0.72, color, 0.42))
    body.add(scene.add.ellipse(0, 0, def.width * 1.7, def.height * 1.2, color, 0.12).setBlendMode(Phaser.BlendModes.ADD))
    addPixel(body, scene, 0, def.height * 0.48, def.width * 0.44, 2, dark, 0.38)
  } else {
    body.add(scene.add.ellipse(0, -def.height * 0.38, def.width * 0.72, def.width * 0.72, dark, 0.72))
    addPixel(body, scene, 0, 0, def.width * 0.72, def.height * 0.58, dark, 0.68)
    addPixel(body, scene, -def.width * 0.44, def.height * 0.02, 2, def.height * 0.45, color, 0.28)
    addPixel(body, scene, def.width * 0.44, def.height * 0.02, 2, def.height * 0.45, color, 0.28)
    addPixel(body, scene, -def.width * 0.2, def.height * 0.42, 2, def.height * 0.34, dark, 0.52)
    addPixel(body, scene, def.width * 0.2, def.height * 0.42, 2, def.height * 0.34, dark, 0.52)
  }

  body.add(scene.add.rectangle(0, def.height * 0.58, def.width * 1.15, 2, 0x000000, 0.16).setOrigin(0.5))
  body.setAlpha(0.42)
  body.setName('background-actor')
  return body
}

export class NpcSystem {
  private actors: NpcRuntime[] = []

  constructor(scene: Phaser.Scene, definitions: NpcActorDefinition[]) {
    this.actors = definitions.map((def) => {
      const color = Number.parseInt(def.color.replace('#', ''), 16)
      const body = makeBackgroundActor(scene, def, color)
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
