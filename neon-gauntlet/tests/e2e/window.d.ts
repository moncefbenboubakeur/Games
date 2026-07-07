export {}

declare global {
  interface Window {
    __NEON_START__?: () => void
    __NEON_FREEZE__?: () => void
    __NEON_TOGGLE_HITBOXES__?: () => boolean
    __NEON_GAME__?: import('phaser').Game
    __NEON_DEBUG__?: {
      title: string
      player: { x: number; hp: number }
      level: { name: string }
      enemies: Array<{ x: number; hp: number; active?: boolean }>
      combat?: {
        playerAttack: null | {
          kind: 'punch' | 'kick'
          bounds: { left: number; right: number }
          lane: number
        }
      }
      assets: Record<string, boolean>
    }
  }
}
