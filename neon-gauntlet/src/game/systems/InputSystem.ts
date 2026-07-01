import Phaser from 'phaser'
import type { NormalizedInput } from '../data/types'
import { GamepadSystem } from './GamepadSystem'

const emptyInput = (): NormalizedInput => ({
  left: false,
  right: false,
  up: false,
  down: false,
  punch: false,
  kick: false,
  jump: false,
  guard: false,
  pause: false,
})

export class InputSystem {
  readonly state = emptyInput()
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>
  private readonly oneShot = new Set<keyof NormalizedInput>()
  private readonly gamepad = new GamepadSystem()

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard
    if (!keyboard) throw new Error('Keyboard input is not available')
    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      punch: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      punchEnter: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      kick: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      guard: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    }
  }

  press(action: keyof NormalizedInput, down: boolean) {
    this.state[action] = down
    if (down) this.oneShot.add(action)
  }

  consume(action: keyof NormalizedInput) {
    const active = this.oneShot.has(action) || this.state[action]
    this.oneShot.delete(action)
    return active
  }

  update() {
    const next = emptyInput()
    next.left = this.keys.left.isDown || this.keys.a.isDown || this.state.left
    next.right = this.keys.right.isDown || this.keys.d.isDown || this.state.right
    next.up = this.keys.up.isDown || this.keys.w.isDown || this.state.up
    next.down = this.keys.down.isDown || this.keys.s.isDown || this.state.down
    next.punch = Phaser.Input.Keyboard.JustDown(this.keys.punch) || Phaser.Input.Keyboard.JustDown(this.keys.punchEnter) || this.oneShot.has('punch')
    next.kick = Phaser.Input.Keyboard.JustDown(this.keys.kick) || this.oneShot.has('kick')
    next.jump = Phaser.Input.Keyboard.JustDown(this.keys.jump) || this.oneShot.has('jump')
    next.guard = this.keys.guard.isDown || this.state.guard
    next.pause = Phaser.Input.Keyboard.JustDown(this.keys.pause) || this.oneShot.has('pause')
    this.gamepad.apply(next)
    Object.assign(this.state, next)
    this.oneShot.clear()
    return this.state
  }
}
