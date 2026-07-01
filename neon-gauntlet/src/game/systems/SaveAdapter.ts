export interface GameResult {
  score: number
  stage: string
  completed: boolean
}

export class SaveAdapter {
  publishResult(result: GameResult) {
    window.dispatchEvent(new CustomEvent('neon-gauntlet:result', { detail: result }))
  }
}
