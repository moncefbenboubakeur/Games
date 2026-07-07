import type { AttackDefinition, CombatData } from '../data/types'

export interface FighterState {
  x: number
  lane: number
  face: -1 | 1
  hp: number
  guard?: boolean
  invincibleMs?: number
}

export function sameLane(a: FighterState, b: FighterState, range: number) {
  return Math.abs(a.lane - b.lane) <= range
}

export function isInFront(attacker: FighterState, defender: FighterState) {
  return Math.sign(defender.x - attacker.x) === attacker.face
}

export function canHit(attacker: FighterState, defender: FighterState, attack: AttackDefinition) {
  if (attack.hitbox) return hitboxesOverlap(attacker, defender, attack)
  return Math.abs(attacker.x - defender.x) <= attack.range && sameLane(attacker, defender, attack.laneRange) && isInFront(attacker, defender)
}

export function attackBounds(attacker: FighterState, attack: AttackDefinition) {
  const hitbox = attack.hitbox
  if (!hitbox) {
    return attacker.face === 1
      ? { left: attacker.x, right: attacker.x + attack.range }
      : { left: attacker.x - attack.range, right: attacker.x }
  }

  if (attacker.face === 1) {
    return {
      left: attacker.x + hitbox.forwardOffset,
      right: attacker.x + hitbox.forwardOffset + hitbox.width,
    }
  }

  return {
    left: attacker.x - hitbox.forwardOffset - hitbox.width,
    right: attacker.x - hitbox.forwardOffset,
  }
}

export function hurtBounds(defender: FighterState, attack: AttackDefinition) {
  const halfWidth = attack.hitbox?.targetHalfWidth ?? 0
  return {
    left: defender.x - halfWidth,
    right: defender.x + halfWidth,
  }
}

export function hitboxesOverlap(attacker: FighterState, defender: FighterState, attack: AttackDefinition) {
  const attackBox = attackBounds(attacker, attack)
  const hurtBox = hurtBounds(defender, attack)
  const laneRange = attack.hitbox?.laneRange ?? attack.laneRange
  return attackBox.left <= hurtBox.right && attackBox.right >= hurtBox.left && sameLane(attacker, defender, laneRange) && isInFront(attacker, defender)
}

export function applyDamage(target: FighterState, damage: number) {
  if ((target.invincibleMs || 0) > 0) return false
  target.hp = Math.max(0, target.hp - damage)
  return true
}

export class CombatSystem {
  constructor(readonly data: CombatData) {}

  getAttack(kind: 'punch' | 'kick') {
    return this.data.attacks[kind]
  }

  hit(attacker: FighterState, defender: FighterState, kind: 'punch' | 'kick', combo = 0) {
    const attack = this.getAttack(kind)
    if (!canHit(attacker, defender, attack)) return { hit: false, damage: 0, knockback: 0 }
    const damage = kind === 'punch' && combo >= 3 && attack.comboFinisherDamage ? attack.comboFinisherDamage : attack.damage
    return { hit: true, damage, knockback: attack.knockback * attacker.face }
  }
}
