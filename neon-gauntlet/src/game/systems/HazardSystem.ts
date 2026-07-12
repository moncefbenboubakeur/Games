import Phaser from 'phaser'
import type { HazardDefinition } from '../data/types'
import type { Player } from '../entities/Player'
import { laneToY } from '../utils/lane'

interface HazardRuntime {
  def: HazardDefinition
  body: Phaser.GameObjects.Container
  warning: Phaser.GameObjects.Container
  nextHitAt: number
  forcedActiveUntil: number
}

function addPixel(container: Phaser.GameObjects.Container, scene: Phaser.Scene, x: number, y: number, w: number, h: number, color: number, alpha = 1) {
  container.add(scene.add.rectangle(x, y, w, h, color, alpha).setOrigin(0.5))
}

function makeWarning(scene: Phaser.Scene, def: HazardDefinition, color: number, y: number) {
  const warning = scene.add.container(def.x, y)
  const halfW = def.width / 2
  addPixel(warning, scene, -halfW, 0, 5, 3, color, 0.85)
  addPixel(warning, scene, -halfW * 0.45, 0, 6, 3, color, 0.75)
  addPixel(warning, scene, halfW * 0.45, 0, 6, 3, color, 0.75)
  addPixel(warning, scene, halfW, 0, 5, 3, color, 0.85)
  warning.add(scene.add.rectangle(0, 0, def.width + 8, def.height + 5).setStrokeStyle(1, color, 0.55).setOrigin(0.5))
  warning.setAlpha(0)
  warning.setName(`hazard-warning-${def.type}`)
  return warning
}

function makeHazardBody(scene: Phaser.Scene, def: HazardDefinition, color: number, y: number) {
  const body = scene.add.container(def.x, y)
  if (def.type === 'steam') {
    body.add(scene.add.ellipse(-def.width * 0.25, 1, def.width * 0.34, def.height * 0.7, color, 0.2))
    body.add(scene.add.ellipse(0, -2, def.width * 0.42, def.height, color, 0.26))
    body.add(scene.add.ellipse(def.width * 0.25, 2, def.width * 0.32, def.height * 0.72, color, 0.2))
    addPixel(body, scene, 0, def.height * 0.38, def.width * 0.58, 3, 0xdff6ff, 0.32)
  } else if (def.type === 'cart') {
    addPixel(body, scene, 0, 0, def.width, def.height, 0x2a1208, 0.78)
    addPixel(body, scene, 0, -def.height * 0.22, def.width * 0.85, 4, color, 0.82)
    body.add(scene.add.ellipse(-def.width * 0.32, def.height * 0.5, 7, 7, 0x050711, 0.9))
    body.add(scene.add.ellipse(def.width * 0.32, def.height * 0.5, 7, 7, 0x050711, 0.9))
  } else {
    addPixel(body, scene, -def.width * 0.26, 0, def.width * 0.2, 3, color, 0.7)
    addPixel(body, scene, 0, -2, def.width * 0.26, 3, 0xdff6ff, 0.72)
    addPixel(body, scene, def.width * 0.26, 1, def.width * 0.2, 3, color, 0.7)
    body.add(scene.add.star(0, 0, 5, 2, 8, color, 0.55).setBlendMode(Phaser.BlendModes.ADD))
  }
  body.setAlpha(0.08)
  body.setName(`hazard-body-${def.type}`)
  return body
}

export class HazardSystem {
  private hazards: HazardRuntime[] = []

  constructor(scene: Phaser.Scene, definitions: HazardDefinition[]) {
    this.hazards = definitions.map((def) => {
      const color = Number.parseInt(def.color.replace('#', ''), 16)
      const y = laneToY(def.lane) - def.height / 2
      const body = makeHazardBody(scene, def, color, y)
        .setDepth(Math.round(laneToY(def.lane)) - 2)
      const warning = makeWarning(scene, def, color, y)
        .setDepth(Math.round(laneToY(def.lane)) - 1)
      return { def, body, warning, nextHitAt: 0, forcedActiveUntil: 0 }
    })
  }

  update(time: number, player: Player) {
    this.hazards.forEach((hazard) => {
      const phase = time % hazard.def.cycleMs
      const activeStart = hazard.def.cycleMs - hazard.def.activeMs
      const telegraphStart = activeStart - hazard.def.telegraphMs
      const telegraphing = phase >= telegraphStart && phase < activeStart
      const forcedActive = time <= hazard.forcedActiveUntil
      const active = forcedActive || phase >= activeStart
      const typeOffset = this.typeOffset(hazard.def.type, time, active)
      hazard.body.setPosition(hazard.def.x + typeOffset.x, hazard.body.y)
      hazard.warning.setPosition(hazard.def.x + typeOffset.x, hazard.warning.y)
      hazard.body.setScale(typeOffset.scaleX, typeOffset.scaleY)
      hazard.warning.setAlpha(telegraphing ? 0.35 + Math.sin(time / 65) * 0.18 : 0)
      hazard.body.setAlpha(active ? (forcedActive ? 0.82 : 0.64) : 0.08)
      if (!active || time < hazard.nextHitAt || player.invincibleMs > 0) return
      const inLane = Math.abs(player.lane - hazard.def.lane) <= 0.065
      const inX = Math.abs(player.x - hazard.body.x) <= hazard.def.width / 2 + 12
      if (!inLane || !inX) return
      const hitDirection = player.x < hazard.def.x ? -1 : 1
      const damaged = player.hurt(hazard.def.damage, hitDirection * 14)
      if (damaged) this.applyImpulse(player, hazard.def, hitDirection)
      hazard.nextHitAt = time + 650
    })
  }

  private applyImpulse(player: Player, def: HazardDefinition, hitDirection: -1 | 1) {
    if (def.forceX) player.x += def.forceX * hitDirection
    if (def.forceLane) {
      const laneDirection = player.lane < def.lane ? -1 : 1
      player.lane = Phaser.Math.Clamp(player.lane + def.forceLane * laneDirection, 0.58, 0.88)
      player.y = laneToY(player.lane)
    }
  }

  private typeOffset(type: HazardDefinition['type'], time: number, active: boolean) {
    if (!active) return { x: 0, scaleX: 1, scaleY: 1 }
    if (type === 'cart') return { x: Math.sin(time / 120) * 10, scaleX: 1.05, scaleY: 1 }
    if (type === 'steam') return { x: 0, scaleX: 0.9 + Math.sin(time / 70) * 0.1, scaleY: 1.2 + Math.sin(time / 90) * 0.18 }
    return { x: Math.sin(time / 45) * 2, scaleX: 1 + Math.sin(time / 55) * 0.12, scaleY: 1 }
  }

  trigger(id: string, time: number, durationMs = 1000) {
    const hazard = this.hazards.find((item) => item.def.id === id)
    if (!hazard) return false
    hazard.forcedActiveUntil = Math.max(hazard.forcedActiveUntil, time + durationMs)
    hazard.warning.setAlpha(0.62)
    return true
  }

  destroy() {
    this.hazards.forEach((hazard) => {
      hazard.body.destroy()
      hazard.warning.destroy()
    })
    this.hazards = []
  }

  debugSnapshot() {
    return this.hazards.map((hazard) => ({
      id: hazard.def.id,
      type: hazard.def.type,
      x: hazard.def.x,
      lane: hazard.def.lane,
      forceX: hazard.def.forceX || 0,
      forceLane: hazard.def.forceLane || 0,
      forcedActive: hazard.body.scene.time.now <= hazard.forcedActiveUntil,
    }))
  }
}
