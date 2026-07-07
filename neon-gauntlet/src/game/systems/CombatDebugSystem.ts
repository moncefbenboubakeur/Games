import Phaser from 'phaser'
import { laneToY } from '../utils/lane'
import { attackBounds, type CombatSystem } from './CombatSystem'
import type { Player } from '../entities/Player'
import type { Enemy } from '../entities/Enemy'
import type { Boss } from '../entities/Boss'

export class CombatDebugSystem {
  private readonly graphics: Phaser.GameObjects.Graphics
  private enabled = false

  constructor(private readonly scene: Phaser.Scene, private readonly combat: CombatSystem) {
    this.graphics = scene.add.graphics().setDepth(10_000).setScrollFactor(1)
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (!enabled) this.graphics.clear()
  }

  toggle() {
    this.setEnabled(!this.enabled)
    return this.enabled
  }

  update(player: Player, targets: Array<Enemy | Boss>) {
    this.graphics.clear()
    if (!this.enabled) return

    this.drawActorBody(player.x, player.lane, 18, 0x42e6b5)
    targets.forEach((target) => this.drawActorBody(target.x, target.lane, 18, target.hp > 0 ? 0xffd166 : 0x8892a6))

    const activeAttack = player.activeAttack
    if (!activeAttack) return
    const attack = this.combat.getAttack(activeAttack)
    const bounds = attackBounds(player, attack)
    const y = laneToY(player.lane) - 54
    this.graphics.lineStyle(2, 0xff5c8a, 0.95)
    this.graphics.strokeRect(bounds.left, y, bounds.right - bounds.left, 42)
    this.graphics.fillStyle(0xff5c8a, 0.12)
    this.graphics.fillRect(bounds.left, y, bounds.right - bounds.left, 42)
  }

  destroy() {
    this.graphics.destroy()
  }

  private drawActorBody(x: number, lane: number, halfWidth: number, color: number) {
    const y = laneToY(lane) - 54
    this.graphics.lineStyle(1, color, 0.72)
    this.graphics.strokeRect(x - halfWidth, y, halfWidth * 2, 64)
    this.graphics.lineStyle(1, color, 0.36)
    this.graphics.lineBetween(x - halfWidth, laneToY(lane), x + halfWidth, laneToY(lane))
  }
}
