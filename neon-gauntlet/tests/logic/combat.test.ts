import { describe, expect, it } from 'vitest'
import { applyDamage, canHit, sameLane, type FighterState } from '../../src/game/systems/CombatSystem'
import type { AttackDefinition } from '../../src/game/data/types'

const punch: AttackDefinition = {
  damage: 16,
  range: 42,
  laneRange: 0.095,
  durationMs: 230,
  activeAfterMs: 40,
  knockback: 18,
}

function fighter(overrides: Partial<FighterState> = {}): FighterState {
  return { x: 100, lane: 0.72, face: 1, hp: 100, ...overrides }
}

describe('CombatSystem helpers', () => {
  it('matches lanes inside configured range', () => {
    expect(sameLane(fighter(), fighter({ lane: 0.8 }), punch.laneRange)).toBe(true)
    expect(sameLane(fighter(), fighter({ lane: 0.9 }), punch.laneRange)).toBe(false)
  })

  it('hits only targets in front and in range', () => {
    expect(canHit(fighter(), fighter({ x: 132 }), punch)).toBe(true)
    expect(canHit(fighter(), fighter({ x: 152 }), punch)).toBe(false)
    expect(canHit(fighter(), fighter({ x: 80 }), punch)).toBe(false)
  })

  it('applies damage once when not invincible', () => {
    const target = fighter({ hp: 30 })
    expect(applyDamage(target, 12)).toBe(true)
    expect(target.hp).toBe(18)
  })

  it('does not damage invincible fighters', () => {
    const target = fighter({ hp: 30, invincibleMs: 100 })
    expect(applyDamage(target, 12)).toBe(false)
    expect(target.hp).toBe(30)
  })
})
