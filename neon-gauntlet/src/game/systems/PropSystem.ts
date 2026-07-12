import Phaser from 'phaser'
import type { PropDefinition } from '../data/types'
import type { Player } from '../entities/Player'
import { attackBounds, type CombatSystem } from './CombatSystem'
import { laneToY } from '../utils/lane'

interface PropRuntime {
  def: PropDefinition
  hp: number
  body: Phaser.GameObjects.Container
  shine: Phaser.GameObjects.Container
}

function addPixel(container: Phaser.GameObjects.Container, scene: Phaser.Scene, x: number, y: number, w: number, h: number, color: number, alpha = 1) {
  container.add(scene.add.rectangle(x, y, w, h, color, alpha).setOrigin(0.5))
}

function addPropSprite(scene: Phaser.Scene, def: PropDefinition, color: number, y: number) {
  const body = scene.add.container(def.x, y)
  const accent = 0xdff6ff
  const dark = 0x050711
  const glow = 0xffd166

  if (def.type === 'cabinet') {
    addPixel(body, scene, 0, def.height * 0.18, def.width * 0.86, def.height * 0.5, dark, 0.88)
    addPixel(body, scene, 0, def.height * 0.02, def.width * 0.54, def.height * 0.16, color, 0.58)
    addPixel(body, scene, 0, def.height * 0.02, def.width * 0.38, 2, accent, 0.58)
    addPixel(body, scene, -def.width * 0.22, def.height * 0.36, 3, 3, glow, 0.58)
    addPixel(body, scene, def.width * 0.22, def.height * 0.36, 3, 3, 0x50e7ff, 0.58)
  } else if (def.type === 'crate') {
    addPixel(body, scene, 0, 0, def.width, def.height, color, 0.84)
    addPixel(body, scene, 0, -def.height * 0.28, def.width, 3, 0x2a1508, 0.75)
    addPixel(body, scene, 0, def.height * 0.05, def.width, 3, 0x2a1508, 0.75)
    addPixel(body, scene, -def.width * 0.22, 0, 3, def.height, 0x2a1508, 0.75)
    addPixel(body, scene, def.width * 0.22, 0, 3, def.height, 0x2a1508, 0.75)
  } else if (def.type === 'barrel') {
    body.add(scene.add.ellipse(0, 0, def.width, def.height, color, 0.82))
    addPixel(body, scene, 0, -def.height * 0.24, def.width * 0.82, 3, accent, 0.68)
    addPixel(body, scene, 0, def.height * 0.22, def.width * 0.82, 3, dark, 0.78)
    addPixel(body, scene, -def.width * 0.18, 0, 3, def.height * 0.72, dark, 0.5)
  } else {
    addPixel(body, scene, 0, 0, def.width, def.height, color, 0.78)
    addPixel(body, scene, 0, -def.height * 0.36, def.width * 1.05, 6, 0xffd166, 0.88)
    addPixel(body, scene, -def.width * 0.25, -def.height * 0.06, 4, def.height * 0.74, dark, 0.72)
    addPixel(body, scene, def.width * 0.25, -def.height * 0.06, 4, def.height * 0.74, dark, 0.72)
  }

  body.add(scene.add.rectangle(0, def.height / 2 + 1, def.width * 0.95, 3, 0x000000, 0.3).setOrigin(0.5))
  body.setAlpha(0.62)
  return body
}

function addPropShine(scene: Phaser.Scene, def: PropDefinition, y: number) {
  const shine = scene.add.container(def.x, y)
  addPixel(shine, scene, 0, -def.height * 0.38, def.width * 0.58, 2, 0xdff6ff, 0.45)
  return shine
}

export class PropSystem {
  private props: PropRuntime[] = []

  constructor(
    scene: Phaser.Scene,
    definitions: PropDefinition[],
    private readonly combat: CombatSystem,
  ) {
    this.props = definitions.map((def) => {
      const color = Number.parseInt(def.color.replace('#', ''), 16)
      const y = laneToY(def.lane) - def.height / 2
      const body = addPropSprite(scene, def, color, y)
        .setDepth(Math.round(laneToY(def.lane)) - 3)
        .setName(`prop-${def.type}`)
      const shine = addPropShine(scene, def, y)
        .setDepth(Math.round(laneToY(def.lane)) - 2)
        .setName('prop-shine')
      return { def, hp: def.hp, body, shine }
    })
  }

  tryHitByPlayer(player: Player, attackKind: 'punch' | 'kick') {
    const attack = this.combat.getAttack(attackKind)
    const bounds = attackBounds(player, attack)
    let score = 0
    this.props.forEach((prop) => {
      if (prop.hp <= 0) return
      const inLane = Math.abs(player.lane - prop.def.lane) <= 0.09
      const propLeft = prop.def.x - prop.def.width / 2
      const propRight = prop.def.x + prop.def.width / 2
      const overlaps = bounds.right >= propLeft && bounds.left <= propRight
      if (!inLane || !overlaps) return
      prop.hp = Math.max(0, prop.hp - attack.damage)
      prop.body.setAlpha(prop.hp > 0 ? 0.45 : 0)
      prop.shine.setAlpha(prop.hp > 0 ? 0.2 : 0)
      if (prop.hp <= 0) {
        score += prop.def.score
        this.spawnBreakFlash(prop)
      }
    })
    return score
  }

  private spawnBreakFlash(prop: PropRuntime) {
    const flash = prop.body.scene.add.star(prop.def.x, prop.body.y, 6, 3, 12, 0xffd166)
      .setDepth(prop.body.depth + 5)
    prop.body.scene.tweens.add({ targets: flash, alpha: 0, scale: 1.8, duration: 260, onComplete: () => flash.destroy() })
  }

  destroy() {
    this.props.forEach((prop) => {
      prop.body.destroy()
      prop.shine.destroy()
    })
    this.props = []
  }

  debugSnapshot() {
    return this.props.map((prop) => ({ id: prop.def.id, type: prop.def.type, hp: prop.hp }))
  }
}
