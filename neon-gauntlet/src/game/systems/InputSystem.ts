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
  private readonly held = emptyInput()
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>
  private readonly windowKeys = new Set<string>()
  private readonly windowShots = new Set<keyof NormalizedInput>()
  private readonly oneShot = new Set<keyof NormalizedInput>()
  private readonly gamepad = new GamepadSystem()
  private keyboardGuardToggled = false
  private lastHorizontal: 'left' | 'right' | null = null
  private lastVertical: 'up' | 'down' | null = null

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
      punchP: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
      punchEnter: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      kick: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      guard: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    }
    window.addEventListener('keydown', this.handleWindowKeyDown, { passive: false })
    window.addEventListener('keyup', this.handleWindowKeyUp, { passive: false })
    window.addEventListener('blur', this.releaseWindowKeys)
    document.addEventListener('visibilitychange', this.releaseHiddenWindowKeys)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy())
  }

  press(action: keyof NormalizedInput, down: boolean) {
    this.held[action] = down
    if (down && (action === 'left' || action === 'right')) this.lastHorizontal = action
    if (down && (action === 'up' || action === 'down')) this.lastVertical = action
    if (down) this.oneShot.add(action)
  }

  consume(action: keyof NormalizedInput) {
    const active = this.oneShot.has(action) || this.held[action]
    this.oneShot.delete(action)
    return active
  }

  debugSnapshot() {
    return {
      normalized: { ...this.state },
      touchHeld: { ...this.held },
      keyboard: {
        phaser: Object.fromEntries(Object.entries(this.keys).map(([name, key]) => [name, key.isDown])),
        windowKeys: [...this.windowKeys].sort(),
        oneShot: [...this.oneShot].sort(),
        windowShots: [...this.windowShots].sort(),
        lastHorizontal: this.lastHorizontal,
        lastVertical: this.lastVertical,
      },
      gamepad: this.gamepad.snapshot(),
    }
  }

  update() {
    const next = emptyInput()
    const left = this.keys.left.isDown || this.keys.a.isDown || this.down('ArrowLeft', 'a', 'A') || this.held.left
    const right = this.keys.right.isDown || this.keys.d.isDown || this.down('ArrowRight', 'd', 'D') || this.held.right
    const up = this.keys.up.isDown || this.keys.w.isDown || this.down('ArrowUp', 'w', 'W') || this.held.up
    const down = this.keys.down.isDown || this.keys.s.isDown || this.down('ArrowDown', 's', 'S') || this.held.down
    const horizontal = this.resolveAxis(left, right, this.lastHorizontal)
    const vertical = this.resolveAxis(up, down, this.lastVertical)
    next.left = horizontal.negative
    next.right = horizontal.positive
    next.up = vertical.negative
    next.down = vertical.positive
    next.punch = Phaser.Input.Keyboard.JustDown(this.keys.punch) || Phaser.Input.Keyboard.JustDown(this.keys.punchP) || Phaser.Input.Keyboard.JustDown(this.keys.punchEnter) || this.shot('punch') || this.oneShot.has('punch')
    next.kick = Phaser.Input.Keyboard.JustDown(this.keys.kick) || this.shot('kick') || this.oneShot.has('kick')
    next.jump = Phaser.Input.Keyboard.JustDown(this.keys.jump) || this.shot('jump') || this.oneShot.has('jump')
    if (Phaser.Input.Keyboard.JustDown(this.keys.guard) || this.shot('guard')) this.keyboardGuardToggled = !this.keyboardGuardToggled
    next.guard = this.keyboardGuardToggled || this.held.guard
    next.pause = Phaser.Input.Keyboard.JustDown(this.keys.pause) || this.shot('pause') || this.oneShot.has('pause')
    this.gamepad.apply(next)
    Object.assign(this.state, next)
    this.oneShot.clear()
    this.windowShots.clear()
    return this.state
  }

  destroy() {
    window.removeEventListener('keydown', this.handleWindowKeyDown)
    window.removeEventListener('keyup', this.handleWindowKeyUp)
    window.removeEventListener('blur', this.releaseWindowKeys)
    document.removeEventListener('visibilitychange', this.releaseHiddenWindowKeys)
  }

  private down(...keys: string[]) {
    return keys.some((key) => this.windowKeys.has(key))
  }

  private shot(action: keyof NormalizedInput) {
    return this.windowShots.has(action)
  }

  private readonly handleWindowKeyDown = (event: KeyboardEvent) => {
    const action = this.actionForKey(event.key)
    if (!action) return
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(event.key)) event.preventDefault()
    if (!this.windowKeys.has(event.key)) this.windowShots.add(action)
    this.windowKeys.add(event.key)
    if (action === 'left' || action === 'right') this.lastHorizontal = action
    if (action === 'up' || action === 'down') this.lastVertical = action
  }

  private readonly handleWindowKeyUp = (event: KeyboardEvent) => {
    this.windowKeys.delete(event.key)
    if ((event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') && this.lastHorizontal === 'left') {
      this.lastHorizontal = this.down('ArrowRight', 'd', 'D') ? 'right' : null
    }
    if ((event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') && this.lastHorizontal === 'right') {
      this.lastHorizontal = this.down('ArrowLeft', 'a', 'A') ? 'left' : null
    }
    if ((event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') && this.lastVertical === 'up') {
      this.lastVertical = this.down('ArrowDown', 's', 'S') ? 'down' : null
    }
    if ((event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') && this.lastVertical === 'down') {
      this.lastVertical = this.down('ArrowUp', 'w', 'W') ? 'up' : null
    }
  }

  private readonly releaseWindowKeys = () => {
    this.windowKeys.clear()
    this.windowShots.clear()
    Object.values(this.keys).forEach((key) => key.reset())
    this.keyboardGuardToggled = false
    this.lastHorizontal = null
    this.lastVertical = null
  }

  private readonly releaseHiddenWindowKeys = () => {
    if (document.visibilityState === 'hidden') this.releaseWindowKeys()
  }

  private resolveAxis(negative: boolean, positive: boolean, last: 'left' | 'right' | 'up' | 'down' | null) {
    if (negative && positive) {
      return {
        negative: last === 'left' || last === 'up',
        positive: last === 'right' || last === 'down',
      }
    }
    return { negative, positive }
  }

  private actionForKey(key: string): keyof NormalizedInput | null {
    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        return 'left'
      case 'ArrowRight':
      case 'd':
      case 'D':
        return 'right'
      case 'ArrowUp':
      case 'w':
      case 'W':
        return 'up'
      case 'ArrowDown':
      case 's':
      case 'S':
        return 'down'
      case 'j':
      case 'J':
      case 'p':
      case 'P':
      case 'Enter':
        return 'punch'
      case 'k':
      case 'K':
        return 'kick'
      case ' ':
        return 'jump'
      case 'l':
      case 'L':
        return 'guard'
      case 'Escape':
        return 'pause'
      default:
        return null
    }
  }
}
