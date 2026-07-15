import { execFileSync } from 'node:child_process'
import { beforeAll, describe, expect, it } from 'vitest'

interface ReleaseReport {
  releaseReady: boolean
  blockerCount: number
  blockers: Array<{ kind: string; key: string; reason: string }>
}

describe('release readiness gate', () => {
  let report: ReleaseReport

  beforeAll(() => {
    const output = execFileSync('node', ['tools/check-release-readiness.mjs'], { encoding: 'utf8' })
    report = JSON.parse(output) as ReleaseReport
  })

  it('reports unfinished level production as explicit blockers', () => {
    const levelBlockers = report.blockers.filter((blocker) => blocker.kind === 'level-production')

    expect(report.releaseReady).toBe(false)
    expect(levelBlockers).toHaveLength(10)
    expect(levelBlockers.map((blocker) => blocker.key)).toContain('stage-10-neon-core')
    expect(levelBlockers.every((blocker) => blocker.reason.includes('vertical-slice'))).toBe(true)
    expect(report.blockerCount).toBe(report.blockers.length)
  })

  it('does not report character art blockers after final sheet replacement', () => {
    const bossArtBlockers = report.blockers.filter((blocker) => blocker.kind === 'boss-art')
    const characterTextureKeys = new Set([
      'player-sheet',
      'enemy-sheet',
      'striker-sheet',
      'runner-sheet',
      'bruiser-sheet',
      'staffer-sheet',
      'swordsman-sheet',
      'nunchaku-sheet',
      'knife-punk-sheet',
      'switchblade-sora-sheet',
      'turnstile-ren-sheet',
      'iron-wei-sheet',
      'lantern-mai-sheet',
      'forge-aya-sheet',
      'drone-queen-nova-sheet',
      'cipher-iris-sheet',
      'harbor-hale-sheet',
      'signal-vex-sheet',
      'zero-volt-ren-sheet',
    ])
    const characterTextureBlockers = report.blockers.filter((blocker) => blocker.kind === 'texture' && characterTextureKeys.has(blocker.key))

    expect(bossArtBlockers).toHaveLength(0)
    expect(characterTextureBlockers).toHaveLength(0)
  })

  it('does not report audio blockers after project-owned cue replacement', () => {
    const audioBlockers = report.blockers.filter((blocker) => blocker.kind === 'audio-ledger' || blocker.kind === 'audio-source')

    expect(audioBlockers).toHaveLength(0)
    expect(report.blockers.some((blocker) => blocker.kind === 'texture')).toBe(true)
    expect(report.blockers.some((blocker) => blocker.kind === 'level-production')).toBe(true)
  })
})
