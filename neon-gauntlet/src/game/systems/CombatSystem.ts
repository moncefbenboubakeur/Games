import type { AttackDefinition, CombatData } from '../data/types'

export interface FighterState {
  x: number
  lane: number
  face: -1 | 1
  hp: number
  guard?: boolean
  invincibleMs?: number
  attackFrame?: number
}

export interface AttackBonus {
  damageBonus?: number
  rangeBonus?: number
  knockbackBonus?: number
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
  const hitbox = activeHitbox(attacker, attack)
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
  const halfWidth = activeHitbox(defender, attack)?.targetHalfWidth ?? attack.hitbox?.targetHalfWidth ?? 0
  return {
    left: defender.x - halfWidth,
    right: defender.x + halfWidth,
  }
}

export function hitboxesOverlap(attacker: FighterState, defender: FighterState, attack: AttackDefinition) {
  const attackBox = attackBounds(attacker, attack)
  const hurtBox = hurtBounds(defender, attack)
  const laneRange = activeHitbox(attacker, attack)?.laneRange ?? attack.hitbox?.laneRange ?? attack.laneRange
  return attackBox.left <= hurtBox.right && attackBox.right >= hurtBox.left && sameLane(attacker, defender, laneRange) && isInFront(attacker, defender)
}

export function activeHitbox(attacker: FighterState, attack: AttackDefinition) {
  if (!attack.hitbox) return undefined
  const frame = attacker.attackFrame
  return attack.hitbox.frames?.find((item) => item.frame === frame) ?? attack.hitbox
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

  hit(attacker: FighterState, defender: FighterState, kind: 'punch' | 'kick', combo = 0, bonus: AttackBonus = {}) {
    const attack = this.attackWithBonus(this.getAttack(kind), bonus)
    if (!canHit(attacker, defender, attack)) return { hit: false, damage: 0, knockback: 0 }
    const damage = kind === 'punch' && combo >= 3 && attack.comboFinisherDamage ? attack.comboFinisherDamage : attack.damage
    return { hit: true, damage, knockback: attack.knockback * attacker.face }
  }

  private attackWithBonus(attack: AttackDefinition, bonus: AttackBonus) {
    const rangeBonus = bonus.rangeBonus ?? 0
    const damageBonus = bonus.damageBonus ?? 0
    const knockbackBonus = bonus.knockbackBonus ?? 0
    if (!rangeBonus && !damageBonus && !knockbackBonus) return attack
    return {
      ...attack,
      damage: attack.damage + damageBonus,
      comboFinisherDamage: attack.comboFinisherDamage ? attack.comboFinisherDamage + damageBonus : undefined,
      range: attack.range + rangeBonus,
      knockback: attack.knockback + knockbackBonus,
      hitbox: attack.hitbox
        ? {
          ...attack.hitbox,
          width: attack.hitbox.width + rangeBonus,
          frames: attack.hitbox.frames?.map((frame) => ({ ...frame, width: frame.width + rangeBonus })),
        }
        : undefined,
    }
  }
}
