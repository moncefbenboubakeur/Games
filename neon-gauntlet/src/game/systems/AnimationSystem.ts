import Phaser from 'phaser'
import type { ActionName, ActorAnimationData, AnimationData, SpriteFrameData } from '../data/types'
import { choose } from '../utils/math'

export class AnimationSystem {
  constructor(private readonly scene: Phaser.Scene, private readonly data: AnimationData) {}

  registerFrames() {
    this.registerActorFrames(this.data.player)
    this.registerActorFrames(this.data.enemy)
  }

  frame(actor: 'player' | 'enemy', action: ActionName, index = 0) {
    const actorData = this.data[actor]
    const frames = actorData.animations[action] || actorData.animations.idle
    return choose(frames, index)
  }

  apply(sprite: Phaser.GameObjects.Sprite, texture: string, frame: SpriteFrameData) {
    sprite.setTexture(texture, frame.name)
    sprite.setOrigin(frame.ax / frame.w, frame.ay / frame.h)
  }

  private registerActorFrames(actorData: ActorAnimationData) {
    const texture = this.scene.textures.get(actorData.texture)
    if (!texture) throw new Error(`Missing texture: ${actorData.texture}`)
    for (const frames of Object.values(actorData.animations)) {
      for (const frame of frames) {
        if (!texture.has(frame.name)) texture.add(frame.name, 0, frame.x, frame.y, frame.w, frame.h)
      }
    }
  }
}
