import { describe, expect, it } from 'vitest'
import { ActorStateMachine } from '../../src/game/systems/ActorStateMachine'

describe('ActorStateMachine', () => {
  it('prioritizes player hurt and jump states over ordinary movement', () => {
    expect(
      ActorStateMachine.playerVisualState({
        invincibleMs: 120,
        z: 30,
        guard: true,
        attackKind: 'kick',
        attacking: true,
        moving: true,
      }),
    ).toBe('hurt')

    expect(
      ActorStateMachine.playerVisualState({
        invincibleMs: 0,
        z: 30,
        guard: true,
        attackKind: null,
        attacking: false,
        moving: true,
      }),
    ).toBe('jump')
  })

  it('does not let the player guard while an attack is active', () => {
    expect(
      ActorStateMachine.playerVisualState({
        invincibleMs: 0,
        z: 0,
        guard: true,
        attackKind: 'punch',
        attacking: true,
        moving: false,
      }),
    ).toBe('punch')
  })

  it('keeps enemies out of guard unless a telegraph is active', () => {
    expect(
      ActorStateMachine.enemyVisualState({
        hp: 40,
        invincibleMs: 0,
        telegraphMs: 0,
        attackMs: 0,
        moving: true,
        preferredAttack: 'punch',
      }),
    ).toBe('walk')

    expect(
      ActorStateMachine.enemyVisualState({
        hp: 40,
        invincibleMs: 0,
        telegraphMs: 200,
        attackMs: 0,
        moving: true,
        preferredAttack: 'punch',
      }),
    ).toBe('guard')
  })

  it('prioritizes enemy death and hurt over attacks', () => {
    expect(
      ActorStateMachine.enemyVisualState({
        hp: 0,
        invincibleMs: 0,
        telegraphMs: 0,
        attackMs: 250,
        moving: false,
        preferredAttack: 'kick',
      }),
    ).toBe('down')

    expect(
      ActorStateMachine.enemyVisualState({
        hp: 20,
        invincibleMs: 90,
        telegraphMs: 0,
        attackMs: 250,
        moving: false,
        preferredAttack: 'kick',
      }),
    ).toBe('hurt')
  })
})
