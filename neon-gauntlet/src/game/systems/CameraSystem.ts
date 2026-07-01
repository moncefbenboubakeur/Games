import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../constants'

export class CameraSystem {
  constructor(private readonly scene: Phaser.Scene, worldWidth: number) {
    scene.cameras.main.setBounds(0, 0, worldWidth, GAME_HEIGHT)
    scene.cameras.main.setViewport(0, 0, GAME_WIDTH, GAME_HEIGHT)
  }

  follow(target: Phaser.GameObjects.GameObject & { x: number; y: number }) {
    this.scene.cameras.main.startFollow(target, true, 0.12, 0.12, -72, 36)
  }
}
