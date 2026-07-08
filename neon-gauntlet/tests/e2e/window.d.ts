export {}

declare global {
  interface Window {
    __NEON_START__?: () => void
    __NEON_START_LEVEL__?: (levelId: string, score?: number) => void
    __NEON_FREEZE__?: () => void
    __NEON_TOGGLE_HITBOXES__?: () => boolean
    __NEON_GAME__?: import('phaser').Game
    __NEON_DEBUG__?: {
      title: string
      player: { x: number; hp: number }
      level: { id: string; name: string; index?: number; stageClearX?: number; exitReady?: boolean; boss?: { id: string } }
      boss?: null | { id: string; name: string; hp: number; x: number }
      enemies: Array<{ x: number; hp: number; active?: boolean; aiState?: string; aiReason?: string; texture?: string }>
      combat?: {
        playerAttack: null | {
          kind: 'punch' | 'kick'
          bounds: { left: number; right: number }
          lane: number
        }
      }
      input?: {
        normalized: Record<string, boolean>
        touchHeld: Record<string, boolean>
        keyboard: {
          phaser: Record<string, boolean>
          windowKeys: string[]
          oneShot: string[]
          windowShots: string[]
          lastHorizontal: string | null
          lastVertical: string | null
        }
        gamepad: {
          connected: boolean
          axes: number[]
          buttons: Array<{ index: number; pressed: boolean; value: number }>
        }
      }
      assets: Record<string, boolean | number>
    }
  }
}
