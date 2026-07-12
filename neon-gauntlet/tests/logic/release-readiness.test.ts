import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

interface ReleaseReport {
  releaseReady: boolean
  blockerCount: number
  blockers: Array<{ kind: string; key: string; reason: string }>
}

describe('release readiness gate', () => {
  it('reports unfinished level production as explicit blockers', () => {
    const output = execFileSync('node', ['tools/check-release-readiness.mjs'], { encoding: 'utf8' })
    const report = JSON.parse(output) as ReleaseReport
    const levelBlockers = report.blockers.filter((blocker) => blocker.kind === 'level-production')

    expect(report.releaseReady).toBe(false)
    expect(levelBlockers).toHaveLength(10)
    expect(levelBlockers.map((blocker) => blocker.key)).toContain('stage-10-neon-core')
    expect(levelBlockers.every((blocker) => blocker.reason.includes('vertical-slice'))).toBe(true)
    expect(report.blockerCount).toBe(report.blockers.length)
  })

  it('reports reused boss sprite sheets as boss-art blockers', () => {
    const output = execFileSync('node', ['tools/check-release-readiness.mjs'], { encoding: 'utf8' })
    const report = JSON.parse(output) as ReleaseReport
    const bossArtBlockers = report.blockers.filter((blocker) => blocker.kind === 'boss-art')

    expect(bossArtBlockers.length).toBeGreaterThanOrEqual(1)
    expect(bossArtBlockers.some((blocker) => blocker.reason.includes('zero-volt-ren'))).toBe(true)
    expect(bossArtBlockers.every((blocker) => blocker.reason.includes('unique approved sprite sheet'))).toBe(true)
  })

  it('does not report audio blockers after project-owned cue replacement', () => {
    const output = execFileSync('node', ['tools/check-release-readiness.mjs'], { encoding: 'utf8' })
    const report = JSON.parse(output) as ReleaseReport
    const audioBlockers = report.blockers.filter((blocker) => blocker.kind === 'audio-ledger' || blocker.kind === 'audio-source')

    expect(audioBlockers).toHaveLength(0)
    expect(report.blockers.some((blocker) => blocker.kind === 'texture')).toBe(true)
    expect(report.blockers.some((blocker) => blocker.kind === 'level-production')).toBe(true)
  })
})
