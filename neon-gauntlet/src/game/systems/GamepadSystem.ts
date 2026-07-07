import type { NormalizedInput } from '../data/types'

const DEAD_ZONE = 0.24

export class GamepadSystem {
  apply(input: NormalizedInput) {
    const pad = navigator.getGamepads?.().find(Boolean)
    if (!pad) return

    const horizontal = pad.axes[0] || 0
    const vertical = pad.axes[1] || 0
    input.left ||= horizontal < -DEAD_ZONE || !!pad.buttons[14]?.pressed
    input.right ||= horizontal > DEAD_ZONE || !!pad.buttons[15]?.pressed
    input.up ||= vertical < -DEAD_ZONE || !!pad.buttons[12]?.pressed
    input.down ||= vertical > DEAD_ZONE || !!pad.buttons[13]?.pressed
    input.jump ||= !!pad.buttons[0]?.pressed
    input.punch ||= !!pad.buttons[2]?.pressed
    input.kick ||= !!pad.buttons[1]?.pressed
    input.guard ||= !!pad.buttons[5]?.pressed || !!pad.buttons[7]?.pressed
    input.pause ||= !!pad.buttons[9]?.pressed
  }

  snapshot() {
    const pad = navigator.getGamepads?.().find(Boolean)
    if (!pad) return { connected: false, axes: [], buttons: [] }
    return {
      connected: true,
      axes: [pad.axes[0] || 0, pad.axes[1] || 0],
      buttons: pad.buttons.map((button, index) => ({ index, pressed: button.pressed, value: button.value })).filter((button) => button.pressed || button.value > 0),
    }
  }
}
