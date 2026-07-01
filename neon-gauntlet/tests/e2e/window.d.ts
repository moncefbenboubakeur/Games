export {}

declare global {
  interface Window {
    __NEON_START__?: () => void
    __NEON_FREEZE__?: () => void
    __NEON_DEBUG__?: {
      title: string
      player: { x: number; hp: number }
      level: { name: string }
      enemies: Array<{ x: number; hp: number }>
      assets: Record<string, boolean>
    }
  }
}
