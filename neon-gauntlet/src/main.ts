import Phaser from 'phaser'
import { gameConfig } from './game/config'
import './styles/global.css'

const game = new Phaser.Game(gameConfig)

;(window as typeof window & { __NEON_GAME__?: Phaser.Game }).__NEON_GAME__ = game
