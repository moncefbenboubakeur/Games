import type { NormalizedInput } from '../data/types'

const DEAD_ZONE = 0.24
const ACTION_BUTTONS = {
  jump: 0,
  kick: 1,
  punch: 2,
  pause: 9,
} as const

interface PadSnapshot {
  connected: boolean
  axes: number[]
  buttons: Array<{ index: number; pressed: boolean; value: number }>
}

export class GamepadSystem {
  private previousButtons = new Set<number>()
  private lastSnapshot: PadSnapshot = { connected: false, axes: [], buttons: [] }

  apply(input: NormalizedInput) {
    const pad = this.readPad()
    if (!pad) {
      this.previousButtons.clear()
      this.lastSnapshot = { connected: false, axes: [], buttons: [] }
      return
    }

    const horizontal = pad.axes[0] || 0
    const vertical = pad.axes[1] || 0
    const pressed = new Set(pad.buttons.map((button, index) => (button.pressed || button.value > 0.55 ? index : -1)).filter((index) => index >= 0))
    input.left ||= horizontal < -DEAD_ZONE || !!pad.buttons[14]?.pressed
    input.right ||= horizontal > DEAD_ZONE || !!pad.buttons[15]?.pressed
    input.up ||= vertical < -DEAD_ZONE || !!pad.buttons[12]?.pressed
    input.down ||= vertical > DEAD_ZONE || !!pad.buttons[13]?.pressed
    input.jump ||= this.justPressed(pressed, ACTION_BUTTONS.jump)
    input.punch ||= this.justPressed(pressed, ACTION_BUTTONS.punch)
    input.kick ||= this.justPressed(pressed, ACTION_BUTTONS.kick)
    input.guard ||= !!pad.buttons[5]?.pressed || !!pad.buttons[7]?.pressed
    input.pause ||= this.justPressed(pressed, ACTION_BUTTONS.pause)
    this.previousButtons = pressed
    this.lastSnapshot = {
      connected: true,
      axes: [horizontal, vertical],
      buttons: pad.buttons.map((button, index) => ({ index, pressed: button.pressed, value: button.value })).filter((button) => button.pressed || button.value > 0),
    }
  }

  snapshot() {
    return this.lastSnapshot
  }

  private justPressed(pressed: Set<number>, index: number) {
    return pressed.has(index) && !this.previousButtons.has(index)
  }

  private readPad() {
    const testPad = (globalThis as typeof globalThis & {
      window?: {
        __NEON_TEST_GAMEPAD__?: {
          axes?: number[]
          buttons?: Array<boolean | number>
        }
      }
    }).window?.__NEON_TEST_GAMEPAD__
    if (testPad) {
      return {
        axes: testPad.axes || [0, 0],
        buttons: Array.from({ length: 16 }, (_, index) => {
          const value = testPad.buttons?.[index] || 0
          const numeric = typeof value === 'number' ? value : (value ? 1 : 0)
          return { pressed: numeric > 0.55, value: numeric }
        }),
      }
    }
    return navigator.getGamepads?.().find(Boolean)
  }
}
