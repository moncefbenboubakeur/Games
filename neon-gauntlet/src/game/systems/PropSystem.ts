import Phaser from 'phaser'
import type { PropDefinition } from '../data/types'
import type { Player } from '../entities/Player'
import { attackBounds, type CombatSystem } from './CombatSystem'
import { laneToY } from '../utils/lane'

interface PropRuntime {
  def: PropDefinition
  hp: number
  body: Phaser.GameObjects.Rectangle
  shine: Phaser.GameObjects.Rectangle
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
      const body = scene.add.rectangle(def.x, y, def.width, def.height, color, 0.72)
        .setStrokeStyle(2, 0x050711, 0.9)
        .setDepth(Math.round(laneToY(def.lane)) - 3)
      const shine = scene.add.rectangle(def.x, y - def.height * 0.24, def.width * 0.68, 3, 0xdff6ff, 0.75)
        .setDepth(Math.round(laneToY(def.lane)) - 2)
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
      prop.body.setAlpha(prop.hp > 0 ? 0.38 : 0)
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
