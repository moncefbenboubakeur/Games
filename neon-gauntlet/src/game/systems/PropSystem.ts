import Phaser from 'phaser'
import type { PropDefinition } from '../data/types'
import type { Player } from '../entities/Player'
import type { CombatSystem } from './CombatSystem'
import { laneToY } from '../utils/lane'

interface PropRuntime {
  def: PropDefinition
  hp: number
  body: Phaser.GameObjects.Container
  shine: Phaser.GameObjects.Container
}

export class PropSystem {
  private props: PropRuntime[] = []

  constructor(
    scene: Phaser.Scene,
    definitions: PropDefinition[],
    private readonly combat: CombatSystem,
  ) {
    this.props = definitions.map((def) => {
      const y = laneToY(def.lane) - def.height / 2
      const body = scene.add.container(def.x, y)
        .setDepth(Math.round(laneToY(def.lane)) - 3)
        .setName(`prop-placeholder-hidden-${def.type}`)
        .setVisible(false)
        .setAlpha(0)
      const shine = scene.add.container(def.x, y)
        .setDepth(Math.round(laneToY(def.lane)) - 2)
        .setName('prop-placeholder-hidden-shine')
        .setVisible(false)
        .setAlpha(0)
      return { def, hp: def.hp, body, shine }
    })
  }

  tryHitByPlayer(_player: Player, _attackKind: 'punch' | 'kick') {
    void this.combat
    return 0
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
