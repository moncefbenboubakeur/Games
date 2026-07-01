import Phaser from 'phaser'

export class Pickup extends Phaser.GameObjects.Star {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 5, 4, 9, 0xffd166)
    scene.add.existing(this)
  }
}
