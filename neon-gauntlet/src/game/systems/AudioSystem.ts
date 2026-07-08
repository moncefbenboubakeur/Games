import Phaser from 'phaser'
import type { AudioData } from '../data/types'

export class AudioSystem {
  private music?: Phaser.Sound.BaseSound
  private unlocked = false
  private muted = false

  constructor(private readonly scene: Phaser.Scene, private readonly data: AudioData) {}

  unlock() {
    this.unlocked = true
  }

  toggleMute() {
    this.muted = !this.muted
    this.scene.sound.setMute(this.muted)
    return this.muted
  }

  playMusic(key: string) {
    if (!this.unlocked || this.muted) return
    const cue = this.data.music[key]
    if (!cue || this.music?.isPlaying) return
    this.scene.sound.stopByKey(`music:${key}`)
    this.music = this.scene.sound.add(`music:${key}`, { loop: cue.loop, volume: cue.volume })
    this.music.play()
  }

  playSfx(key: string) {
    if (!this.unlocked || this.muted) return
    const cue = this.data.sfx[key]
    if (!cue) return
    this.scene.sound.play(`sfx:${key}`, { volume: cue.volume })
  }
}
