import type { ActionName } from '../data/types'

export type ActorVisualState =
  | 'idle'
  | 'walk'
  | 'jump'
  | 'guard'
  | 'punch'
  | 'kick'
  | 'hurt'
  | 'down'

interface PlayerVisualInput {
  invincibleMs: number
  z: number
  guard: boolean
  attackKind: 'punch' | 'kick' | null
  attacking: boolean
  moving: boolean
}

interface EnemyVisualInput {
  hp: number
  invincibleMs: number
  telegraphMs: number
  attackMs: number
  moving: boolean
  preferredAttack: 'punch' | 'kick'
}

export class ActorStateMachine {
  static playerVisualState(input: PlayerVisualInput): ActorVisualState {
    if (input.invincibleMs > 0) return 'hurt'
    if (input.z > 0) return 'jump'
    if (input.guard && !input.attacking) return 'guard'
    if (input.attackKind) return input.attackKind
    if (input.moving) return 'walk'
    return 'idle'
  }

  static enemyVisualState(input: EnemyVisualInput): ActorVisualState {
    if (input.hp <= 0) return 'down'
    if (input.invincibleMs > 0) return 'hurt'
    if (input.telegraphMs > 0) return 'guard'
    if (input.attackMs > 0) return input.preferredAttack
    if (input.moving) return 'walk'
    return 'idle'
  }

  static canPlayAction(action: ActorVisualState): action is ActionName {
    return action === 'idle' || action === 'walk' || action === 'punch' || action === 'kick' || action === 'guard' || action === 'hurt' || action === 'jump' || action === 'down'
  }
}
